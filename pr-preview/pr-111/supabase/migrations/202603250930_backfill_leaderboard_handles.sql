-- Backfill claimed leaderboard handles for players already present in the
-- weekly leaderboard before the handle-claim rollout.
--
-- This is best-effort: existing free-form names are sanitised into the same
-- safe character set the client now uses for requested names. Rows that still
-- collapse to empty, reserved, or blocked values are skipped and must claim a
-- fresh name in-app later.

with latest_player_names as (
  select distinct on (entries.player_id)
    entries.player_id,
    btrim(coalesce(entries.player_name, '')) as raw_player_name
  from public.weekly_leaderboard_entries as entries
  where coalesce(btrim(entries.player_id), '') <> ''
  order by
    entries.player_id,
    entries.updated_at desc,
    entries.created_at desc,
    entries.week_id desc
),
prepared_backfill_candidates as (
  select
    latest.player_id,
    left(
      btrim(
        regexp_replace(
          regexp_replace(
            regexp_replace(latest.raw_player_name, '\s*#\d{4}$', ''),
            '[^A-Za-z0-9 ._''-]+',
            '',
            'g'
          ),
          '\s+',
          ' ',
          'g'
        )
      ),
      18
    ) as handle_base,
    case
      when latest.raw_player_name ~ '#\d{4}$'
        then substring(latest.raw_player_name from '#([0-9]{4})$')::integer
      else null
    end as preferred_discriminator
  from latest_player_names as latest
  left join public.leaderboard_player_handles as existing
    on existing.player_id = latest.player_id
  where existing.player_id is null
),
valid_backfill_candidates as (
  select
    candidates.player_id,
    candidates.handle_base,
    lower(candidates.handle_base) as normalized_base,
    regexp_replace(lower(candidates.handle_base), '[^a-z0-9]+', '', 'g') as reserved_check,
    candidates.preferred_discriminator
  from prepared_backfill_candidates as candidates
  where candidates.handle_base <> ''
),
filtered_backfill_candidates as (
  select
    candidates.player_id,
    candidates.handle_base,
    candidates.normalized_base,
    candidates.preferred_discriminator
  from valid_backfill_candidates as candidates
  where candidates.handle_base ~ '^[A-Za-z0-9][A-Za-z0-9 ._''-]{0,17}$'
    and candidates.reserved_check <> ''
    and candidates.reserved_check <> all (array[
      'admin', 'administrator', 'mod', 'moderator', 'staff', 'support',
      'official', 'system', 'burohame', 'developer', 'owner', 'guest',
      'null', 'undefined', 'test', 'anonymous'
    ])
    and candidates.reserved_check !~ '(fuck|shit|bitch|cunt|nigg|fag|rape|whore|slut|porn|nazi|hitler|kkk|penis|vagina|dick|cock|pussy|asshole|motherfucker|retard)'
),
accepted_preferred_discriminators as (
  select
    candidates.player_id,
    candidates.handle_base,
    candidates.normalized_base,
    candidates.preferred_discriminator as discriminator
  from (
    select
      candidates.*,
      row_number() over (
        partition by candidates.normalized_base, candidates.preferred_discriminator
        order by candidates.player_id
      ) as preferred_rank
    from filtered_backfill_candidates as candidates
    where candidates.preferred_discriminator between 0 and 9999
  ) as candidates
  where candidates.preferred_rank = 1
    and not exists (
      select 1
      from public.leaderboard_player_handles as existing
      where existing.normalized_base = candidates.normalized_base
        and existing.discriminator = candidates.preferred_discriminator
    )
),
remaining_backfill_candidates as (
  select
    candidates.player_id,
    candidates.handle_base,
    candidates.normalized_base
  from filtered_backfill_candidates as candidates
  left join accepted_preferred_discriminators as preferred
    on preferred.player_id = candidates.player_id
  where preferred.player_id is null
),
backfill_base_offsets as (
  select
    bases.normalized_base,
    greatest(
      coalesce(max(existing.discriminator), -1),
      coalesce(max(preferred.discriminator), -1)
    ) as max_used_discriminator
  from (
    select distinct normalized_base
    from remaining_backfill_candidates
  ) as bases
  left join public.leaderboard_player_handles as existing
    on existing.normalized_base = bases.normalized_base
  left join accepted_preferred_discriminators as preferred
    on preferred.normalized_base = bases.normalized_base
  group by bases.normalized_base
),
generated_backfill_discriminators as (
  select
    candidates.player_id,
    candidates.handle_base,
    candidates.normalized_base,
    offsets.max_used_discriminator
      + row_number() over (
          partition by candidates.normalized_base
          order by candidates.player_id
        ) as discriminator
  from remaining_backfill_candidates as candidates
  join backfill_base_offsets as offsets
    on offsets.normalized_base = candidates.normalized_base
),
resolved_backfill_handles as (
  select
    preferred.player_id,
    preferred.handle_base,
    preferred.normalized_base,
    preferred.discriminator
  from accepted_preferred_discriminators as preferred
  union all
  select
    generated.player_id,
    generated.handle_base,
    generated.normalized_base,
    generated.discriminator
  from generated_backfill_discriminators as generated
  where generated.discriminator between 0 and 9999
)
insert into public.leaderboard_player_handles (
  player_id,
  handle_base,
  normalized_base,
  discriminator
)
select
  resolved.player_id,
  resolved.handle_base,
  resolved.normalized_base,
  resolved.discriminator
from resolved_backfill_handles as resolved
on conflict (player_id) do nothing;

-- Refresh the cached public handle shown on historic leaderboard rows without
-- rewriting their score timestamps or rank ordering tie-breakers.
update public.weekly_leaderboard_entries as entries
set player_name = handles.display_name
from public.leaderboard_player_handles as handles
where handles.player_id = entries.player_id
  and entries.player_name is distinct from handles.display_name;
