import { NextResponse } from 'next/server';
import { z } from 'zod';
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

    const { data, error } = await supabaseServer
      .from('submissions')
      .select(
        `
        *,
        teams!inner(
          team_id,
          team_name,
          university,
          category,
          round2_eligible,
          institutions(name, institution_type)
        )
      `
      )
      .order('submitted_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const submissions = (data || []).map((sub: any) => ({
      id: sub.id,
      submission_id: sub.id,
      team_id: sub.team_id,
      registration_id: sub.team_id,
      competition_category: sub.competition_category || sub.teams?.category,
      round: sub.round,
      round_id: sub.round,
      status: sub.status,
      submission_link: sub.submission_link,
      google_drive_link: sub.submission_link,
      submitted_at: sub.submitted_at,
      team_name: sub.teams?.team_name,
      school_name:
        sub.competition_category === 'inter_school'
          ? sub.teams?.institutions?.name || sub.teams?.university
          : null,
      university: sub.teams?.university,
      round2_eligible: !!sub.teams?.round2_eligible,
      type: sub.competition_category,
    }));

    return NextResponse.json({ data: submissions });
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch submissions' },
      { status: 500 }
    );
  }
}

const patchSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(['pending', 'reviewed', 'qualified', 'rejected']),
});

export async function PATCH(request: Request) {
  try {
    if (!(await assertAdmin(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { error } = await supabaseServer
      .from('submissions')
      .update({ status: parsed.data.status })
      .eq('id', parsed.data.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: 'Failed to update submission' },
      { status: 500 }
    );
  }
}
