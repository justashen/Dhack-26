import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseServer } from '@/lib/supabaseServer';
import { rateLimit } from '@/lib/rateLimit';
import { sanitizeForDbString } from '@/lib/sanitize';
import { verifyRecaptchaToken } from '@/lib/recaptcha';
import {
  getSubmissionWindows,
  getWindowStatus,
} from '@/lib/platformConfig';

const ROUND = 2;

const schema = z
  .object({
    team_id: z.string().trim().max(20).optional().or(z.literal('')),
    team_name: z.string().trim().max(200).optional().or(z.literal('')),
    submission_link: z
      .string()
      .url('Please provide a valid Google Drive link.')
      .refine(
        value => /^https:\/\/drive\.google\.com\//.test(value),
        'Please provide a valid Google Drive link.'
      ),
    recaptchaToken: z.string().optional().or(z.literal('')),
  })
  .superRefine((data, ctx) => {
    if (!data.team_id?.trim() && !data.team_name?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['team_id'],
        message: 'Please enter either your Team ID or Team Name.',
      });
    }
  });

type TeamRow = {
  team_id: string;
  team_name: string;
  category: string | null;
  round2_eligible: boolean;
};

async function findTeamById(teamId: string): Promise<TeamRow | null> {
  const { data, error } = await supabaseServer
    .from('teams')
    .select('team_id, team_name, category, round2_eligible')
    .eq('team_id', teamId.trim().toUpperCase())
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as TeamRow) || null;
}

async function findTeamByName(teamName: string): Promise<TeamRow | null> {
  const { data, error } = await supabaseServer
    .from('teams')
    .select('team_id, team_name, category, round2_eligible')
    .ilike('team_name', teamName.trim())
    .limit(1);
  if (error) throw new Error(error.message);
  return ((data as TeamRow[]) || [])[0] || null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      (req as any).ip ||
      null;
    const rl = rateLimit('round_02_submit_POST', ip, {
      windowMs: 15 * 60 * 1000,
      max: 5,
    });
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    if (process.env.RECAPTCHA_SECRET_KEY) {
      const recaptcha = await verifyRecaptchaToken(
        data.recaptchaToken || '',
        req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      );
      if (!recaptcha.ok) {
        return NextResponse.json(
          { error: 'reCAPTCHA verification failed' },
          { status: 403 }
        );
      }
    }

    const teamId = data.team_id?.trim();
    const teamName = data.team_name?.trim();

    let team: TeamRow | null = null;
    try {
      const [byId, byName] = await Promise.all([
        teamId ? findTeamById(teamId) : Promise.resolve(null),
        teamName ? findTeamByName(teamName) : Promise.resolve(null),
      ]);

      if (teamId && teamName) {
        if (!byId || !byName || byId.team_id !== byName.team_id) {
          return NextResponse.json(
            {
              error:
                'The Team ID and Team Name you entered do not match the same team.',
            },
            { status: 400 }
          );
        }
        team = byId;
      } else {
        team = byId || byName;
      }
    } catch (lookupError) {
      return NextResponse.json(
        {
          error:
            lookupError instanceof Error
              ? lookupError.message
              : 'Failed to look up team.',
        },
        { status: 500 }
      );
    }

    if (!team) {
      return NextResponse.json(
        {
          error:
            'We could not find a team matching the details provided. Please check your Team ID or Team Name.',
        },
        { status: 404 }
      );
    }

    if (!team.round2_eligible) {
      return NextResponse.json(
        {
          error:
            'Your team has not been selected for Round 2 and is not eligible to submit.',
        },
        { status: 403 }
      );
    }

    const windows = await getSubmissionWindows();
    const window = windows.find(
      item =>
        item.round === ROUND &&
        (!item.competition_category ||
          item.competition_category === team!.category)
    );
    if (!window) {
      return NextResponse.json(
        { error: 'Round 2 submission window is not configured.' },
        { status: 400 }
      );
    }

    const status = getWindowStatus(new Date(), window.opens_at, window.closes_at);
    if (status !== 'open') {
      return NextResponse.json(
        {
          error:
            status === 'upcoming'
              ? `Round 2 submissions open on ${new Date(window.opens_at).toLocaleString()}`
              : 'Round 2 submission window has closed.',
        },
        { status: 400 }
      );
    }

    const { data: existing, error: existingError } = await supabaseServer
      .from('submissions')
      .select('id')
      .eq('team_id', team.team_id)
      .eq('round', ROUND)
      .limit(1);
    if (existingError) {
      return NextResponse.json(
        { error: existingError.message },
        { status: 500 }
      );
    }
    if (existing && existing.length > 0) {
      return NextResponse.json(
        { error: 'Your team has already submitted a Round 2 submission.' },
        { status: 409 }
      );
    }

    const { data: submission, error: insertError } = await supabaseServer
      .from('submissions')
      .insert({
        team_id: team.team_id,
        competition_category: team.category,
        round: ROUND,
        submission_link: sanitizeForDbString(data.submission_link, 512),
        status: 'pending',
      })
      .select('id, status, submitted_at, submission_link')
      .single();
    if (insertError) {
      return NextResponse.json(
        {
          error: /not eligible/i.test(insertError.message)
            ? 'Your team has not been selected for Round 2 and is not eligible to submit.'
            : insertError.message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      ok: true,
      team_id: team.team_id,
      team_name: team.team_name,
      status: (submission as any).status,
      submitted_at: (submission as any).submitted_at,
      submission_link: (submission as any).submission_link,
      message: 'Round 2 submission received successfully.',
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to submit Round 2 work',
      },
      { status: 500 }
    );
  }
}
