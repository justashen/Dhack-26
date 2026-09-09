-- Move the public DHACK 2026 site from the Round 02 phase into the active
-- Final Round (Round 3) phase: update the shared countdown target, the
-- Round 03 submission window, and the Final Round timeline entry.
--
-- This is an operational configuration migration only (mirrors the pattern
-- used by 2026082201_round_02_active_submission_phase.sql). It reuses the
-- existing public.submissions / public.submission_windows tables, which
-- already support round = 3, a Google Drive link, one submission per team
-- per round, and service-role-only writes. It does not touch any team,
-- member, or historical Round 01 / Round 02 submission records.
--
-- Final Round deadline: 10 September 2026, 23:59 Asia/Colombo (+05:30).

update public.settings
set value = '"2026-09-10T23:59:00+05:30"'::jsonb,
    description = 'Final Round (Round 3) submission deadline countdown target',
    updated_at = now()
where key = 'countdown_target_at';

update public.settings
set value = '"final_round_submission"'::jsonb,
    description = 'Current public round label',
    updated_at = now()
where key = 'current_round';

-- Final Round (Round 03) window: opens immediately, closes 10 September
-- 2026 23:59 SLT. Update the existing row inserted by
-- 2026070503_platform_config_maintenance_submissions.sql rather than
-- inserting a duplicate.
update public.submission_windows
set label = 'Final Round Submission',
    opens_at = '2026-09-09T00:00:00+05:30',
    closes_at = '2026-09-10T23:59:00+05:30',
    is_active = true,
    updated_at = now()
where round = 3
  and competition_category is null;

-- Fallback in case no Round 03 window exists yet in this environment.
insert into public.submission_windows (
  competition_category,
  round,
  label,
  opens_at,
  closes_at,
  is_active
)
select null, 3, 'Final Round Submission',
  '2026-09-09T00:00:00+05:30', '2026-09-10T23:59:00+05:30', true
where not exists (
  select 1 from public.submission_windows
  where round = 3 and competition_category is null
);

-- Promote the "Final Round" timeline placeholder into the active Final
-- Round Submission entry, matching the new deadline. Round 01 and Round 02
-- timeline entries are left untouched as historical records.
update public.timeline_events
set name = 'Final Round Submission',
    description = 'Finalist teams submit their final project deliverables through the official Final Round submission portal.',
    event_type = 'final',
    display_date = '09 - 10 September 2026',
    start_at = '2026-09-09T00:00:00+05:30',
    end_at = '2026-09-10T23:59:00+05:30',
    is_active = true,
    updated_at = now()
where name in ('Final Round', 'Final Round Submission')
  and category = 'innovation';
