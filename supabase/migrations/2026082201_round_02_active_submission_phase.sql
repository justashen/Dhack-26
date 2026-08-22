-- Move the public DHACK 2026 site from the Round 01 phase into the active
-- Round 02 phase: update the shared countdown target, the Round 02
-- submission window, and the Round 02 timeline entry. This is an
-- operational configuration migration only (mirrors the pattern used by
-- 2026072600_round_01_submission_mode.sql); it does not touch any team,
-- member, or submission records.
--
-- Also restores the Round 01 submission window/timeline end date to the
-- 2026-08-03 deadline that was set live via the admin Settings panel
-- (commit "Extend Round 01 submissions until August 03, 2026"); that manual
-- change was inadvertently reverted to the original 2026-08-01 migration
-- value the last time pending migrations were replayed with `supabase db
-- push`. Both dates are in the past, so this has no behavioural effect
-- today, but it keeps the historical record accurate. Rows are updated by
-- their existing natural keys (not delete+insert) so ids/created_at are
-- preserved and no duplicates can result from re-running this migration.

update public.settings
set value = '"2026-08-27T23:59:00+05:30"'::jsonb,
    description = 'Round 02 submission deadline countdown target',
    updated_at = now()
where key = 'countdown_target_at';

update public.settings
set value = '"round_02_submission"'::jsonb,
    description = 'Current public round label',
    updated_at = now()
where key = 'current_round';

-- Restore the Round 01 window's actual (extended) closing date.
update public.submission_windows
set closes_at = '2026-08-03T23:59:59+05:30',
    updated_at = now()
where round = 1
  and competition_category is null;

-- Round 02 window: opens 16 August 2026, closes 27 August 2026 23:59 SLT.
update public.submission_windows
set label = 'Round 02 Submission',
    opens_at = '2026-08-16T00:00:00+05:30',
    closes_at = '2026-08-27T23:59:00+05:30',
    is_active = true,
    updated_at = now()
where round = 2
  and competition_category is null;

-- Keep the Round 01 timeline entry historical but dated consistently with
-- the restored window above.
update public.timeline_events
set display_date = '26 July - 03 August 2026',
    end_at = '2026-08-03T23:59:59+05:30',
    updated_at = now()
where name = 'Round 01 Submission';

-- Promote the "Second Round" placeholder timeline entry into the active
-- Round 02 Submission entry.
update public.timeline_events
set name = 'Round 02 Submission',
    description = 'Teams selected for Round 2 submit their Google Drive deliverables through the official Round 2 submission portal.',
    event_type = 'wireframe',
    display_date = '16 August - 27 August 2026',
    start_at = '2026-08-16T00:00:00+05:30',
    end_at = '2026-08-27T23:59:00+05:30',
    is_active = true,
    updated_at = now()
where name = 'Second Round';
