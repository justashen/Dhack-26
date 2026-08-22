import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { createClient } from '@supabase/supabase-js';

async function assertAdmin(request: Request) {
  const rawSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const supabaseUrl =
    rawSupabaseUrl && /^https?:\/\//.test(rawSupabaseUrl)
      ? rawSupabaseUrl
      : rawSupabaseUrl
        ? `https://${rawSupabaseUrl}`
        : '';
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
  if (!supabaseUrl || !anonKey) return false;

  const authHeader = request.headers.get('authorization') || '';
  const token = authHeader.toLowerCase().startsWith('bearer ')
    ? authHeader.slice(7)
    : undefined;
  if (!token) return false;

  const client = createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false },
  });
  const {
    data: { user },
  } = await client.auth.getUser(token);
  if (!user?.email) return false;

  const adminClient = createClient(
    supabaseUrl,
    process.env.SUPABASE_SERVICE_ROLE_KEY as string,
    { auth: { persistSession: false } }
  );
  const { data: admins } = await adminClient
    .from('admins')
    .select('email')
    .eq('email', user.email)
    .limit(1);
  return !!(admins && admins.length > 0);
}

export async function GET(request: Request) {
  try {
    if (!(await assertAdmin(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [{ data: teams, error: teamsError }, { data: submissions, error: subsError }] =
      await Promise.all([
        supabaseServer
          .from('teams')
          .select('team_id, team_name, category, round2_eligible')
          .eq('round2_eligible', true)
          .order('team_id', { ascending: true }),
        supabaseServer
          .from('submissions')
          .select('id, team_id, status, submission_link, submitted_at')
          .eq('round', 2),
      ]);

    if (teamsError) {
      return NextResponse.json({ error: teamsError.message }, { status: 500 });
    }
    if (subsError) {
      return NextResponse.json({ error: subsError.message }, { status: 500 });
    }

    const submissionByTeam = new Map<string, any>(
      (submissions || []).map((sub: any) => [sub.team_id, sub])
    );

    const data = (teams || []).map((team: any) => {
      const submission = submissionByTeam.get(team.team_id) || null;
      return {
        team_id: team.team_id,
        team_name: team.team_name,
        competition_category: team.category,
        round2_eligible: team.round2_eligible,
        submitted: !!submission,
        submission_id: submission?.id || null,
        status: submission?.status || null,
        submission_link: submission?.submission_link || null,
        submitted_at: submission?.submitted_at || null,
      };
    });

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch Round 2 data' },
      { status: 500 }
    );
  }
}
