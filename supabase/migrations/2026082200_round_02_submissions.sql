-- Round 02 submissions for DHACK 2026.
-- Reuses the existing public.submissions table (already supports round int,
-- submission_link, status, submitted_at, and a unique (team_id, round) index)
-- instead of creating a duplicate submissions table.
--
-- Adds a team-level eligibility flag so that only the teams selected for
-- Round 02 can submit, enforced both by the API layer and by a database
-- trigger (defense in depth against a client sending an arbitrary team_id).

alter table public.teams
  add column if not exists round2_eligible boolean not null default false;

create index if not exists idx_teams_round2_eligible
  on public.teams(round2_eligible)
  where round2_eligible = true;

-- Enforce Round 02 eligibility at the database level: any insert/update on
-- public.submissions with round = 2 must reference a team with
-- round2_eligible = true. This protects against a client bypassing the API
-- validation (e.g. by calling the table directly with a manipulated team_id).
create or replace function public.fn_enforce_round2_eligibility()
returns trigger language plpgsql as $$
declare
  is_eligible boolean;
begin
  if new.round = 2 then
    select round2_eligible into is_eligible
    from public.teams
    where team_id = new.team_id;

    if coalesce(is_eligible, false) is not true then
      raise exception 'Team % has not been selected for Round 2 and is not eligible to submit.', new.team_id
        using errcode = 'P0001';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists tr_submissions_round2_eligibility on public.submissions;
create trigger tr_submissions_round2_eligibility
before insert or update on public.submissions
for each row execute function public.fn_enforce_round2_eligibility();

-- Mark the 47 teams selected for Round 02 as eligible. All 47 team_ids below
-- were verified to exist in public.teams before writing this migration.
update public.teams
set round2_eligible = true
where team_id in (
  'DH048', 'DH130', 'DH087', 'DH112', 'DH033', 'DH095', 'DH069', 'DH115', 'DH052', 'DH126',
  'DH110', 'DH047', 'DH059', 'DH046', 'DH084', 'DH076', 'DH027', 'DH051', 'DH063', 'DH074',
  'DH121', 'DH111', 'DH058', 'DH105', 'DH022', 'DH045', 'DH107', 'DH100', 'DH037', 'DH008',
  'DH044', 'DH117', 'DH055', 'DH068', 'DH091', 'DH036', 'DH134', 'DH116', 'DH106', 'DH035',
  'DH097', 'DH094', 'DH006', 'DH128', 'DH080', 'DH136', 'DH093'
);
