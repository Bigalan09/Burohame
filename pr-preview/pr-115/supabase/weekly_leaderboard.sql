-- Weekly leaderboard table for Burohame.
--
-- Threat model:
--   Reads  - allowed for any client holding the publishable API key.
--   Writes - must go through the upsert-leaderboard-entry Edge Function, which
--            validates the payload server-side and uses the service role key.
--            No direct write access is granted to browser clients so that a
--            malicious caller cannot impersonate another player_id or inject
--            arbitrary scores.

create table if not exists public.leaderboard_player_handles (
  player_id text primary key,
  handle_base text not null,
  normalized_base text not null,
  discriminator integer not null,
  display_name text generated always as (
    handle_base || '#' || lpad(discriminator::text, 4, '0')
  ) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint leaderboard_player_handles_base_len check (char_length(handle_base) between 1 and 18),
  constraint leaderboard_player_handles_normalized_len check (char_length(normalized_base) between 1 and 18),
  constraint leaderboard_player_handles_discriminator_range check (discriminator between 0 and 9999)
);

create unique index if not exists leaderboard_player_handles_normalized_uidx
  on public.leaderboard_player_handles (normalized_base, discriminator);

create unique index if not exists leaderboard_player_handles_display_uidx
  on public.leaderboard_player_handles (display_name);

alter table public.leaderboard_player_handles enable row level security;

revoke all on public.leaderboard_player_handles from anon, authenticated;

create or replace function public.claim_leaderboard_handle(p_player_id text, p_requested_name text)
returns table(handle_base text, display_name text, discriminator integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_handle_base text;
  v_normalized_base text;
  v_reserved_check text;
  v_existing public.leaderboard_player_handles%rowtype;
  v_claimed_display_name text;
  v_claimed_discriminator integer;
begin
  if coalesce(btrim(p_player_id), '') = '' then
    raise exception 'Authenticated player id is required';
  end if;

  v_handle_base := regexp_replace(btrim(coalesce(p_requested_name, '')), '\s+', ' ', 'g');
  if char_length(v_handle_base) < 1 or char_length(v_handle_base) > 18 then
    raise exception 'Leaderboard names must be 1-18 characters';
  end if;

  if v_handle_base !~ '^[A-Za-z0-9][A-Za-z0-9 ._''-]{0,17}$' then
    raise exception 'Leaderboard names must use letters, numbers, spaces, ., _, -, or apostrophes';
  end if;

  v_normalized_base := lower(v_handle_base);
  v_reserved_check := regexp_replace(v_normalized_base, '[^a-z0-9]+', '', 'g');
  if v_reserved_check = '' then
    raise exception 'Leaderboard names must include letters or numbers';
  end if;

  if v_reserved_check = any (array[
    'admin', 'administrator', 'mod', 'moderator', 'staff', 'support',
    'official', 'system', 'burohame', 'developer', 'owner', 'guest',
    'null', 'undefined', 'test', 'anonymous'
  ]) then
    raise exception 'That leaderboard name is reserved';
  end if;

  if v_reserved_check ~ '(fuck|shit|bitch|cunt|nigg|fag|rape|whore|slut|porn|nazi|hitler|kkk|penis|vagina|dick|cock|pussy|asshole|motherfucker|retard)' then
    raise exception 'That leaderboard name is not allowed';
  end if;

  select *
  into v_existing
  from public.leaderboard_player_handles
  where player_id = p_player_id
  for update;

  if found and v_existing.normalized_base = v_normalized_base then
    update public.leaderboard_player_handles
    set handle_base = v_handle_base,
        updated_at = now()
    where player_id = p_player_id
    returning leaderboard_player_handles.display_name, leaderboard_player_handles.discriminator
    into v_claimed_display_name, v_claimed_discriminator;

    update public.weekly_leaderboard_entries
    set player_name = v_claimed_display_name,
        updated_at = now()
    where player_id = p_player_id;

    return query
    select v_handle_base, v_claimed_display_name, v_claimed_discriminator;
    return;
  end if;

  perform pg_advisory_xact_lock(hashtext(v_normalized_base));

  select candidate.discriminator
  into v_claimed_discriminator
  from generate_series(0, 9999) as candidate(discriminator)
  where not exists (
    select 1
    from public.leaderboard_player_handles as handles
    where handles.normalized_base = v_normalized_base
      and handles.discriminator = candidate.discriminator
  )
  order by candidate.discriminator
  limit 1;

  if v_claimed_discriminator is null then
    raise exception 'That leaderboard name is full';
  end if;

  insert into public.leaderboard_player_handles (
    player_id,
    handle_base,
    normalized_base,
    discriminator
  ) values (
    p_player_id,
    v_handle_base,
    v_normalized_base,
    v_claimed_discriminator
  )
  on conflict (player_id) do update
  set handle_base = excluded.handle_base,
      normalized_base = excluded.normalized_base,
      discriminator = excluded.discriminator,
      updated_at = now()
  returning leaderboard_player_handles.display_name
  into v_claimed_display_name;

  update public.weekly_leaderboard_entries
  set player_name = v_claimed_display_name,
      updated_at = now()
  where player_id = p_player_id;

  return query
  select v_handle_base, v_claimed_display_name, v_claimed_discriminator;
end;
$$;

revoke all on function public.claim_leaderboard_handle(text, text) from public, anon, authenticated;
grant execute on function public.claim_leaderboard_handle(text, text) to service_role;

create table if not exists public.weekly_leaderboard_entries (
  week_id text not null,
  player_id text not null,
  player_name text not null default 'Guest',
  league_id text not null default 'bronze',
  total_score integer not null default 0,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint weekly_leaderboard_entries_score_non_negative check (total_score >= 0),
  constraint weekly_leaderboard_entries_name_len check (char_length(player_name) between 1 and 24),
  constraint weekly_leaderboard_entries_pk primary key (week_id, player_id)
);

alter table public.weekly_leaderboard_entries
  drop column if exists counted_runs;

alter table public.weekly_leaderboard_entries
  drop constraint if exists weekly_leaderboard_entries_runs_len;

do $$
begin
  if exists (
    select 1
    from pg_constraint
    where conrelid = 'public.weekly_leaderboard_entries'::regclass
      and conname = 'weekly_leaderboard_entries_pkey'
  ) and not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.weekly_leaderboard_entries'::regclass
      and conname = 'weekly_leaderboard_entries_pk'
  ) then
    alter table public.weekly_leaderboard_entries
      rename constraint weekly_leaderboard_entries_pkey to weekly_leaderboard_entries_pk;
  end if;
end;
$$;

create index if not exists weekly_leaderboard_entries_week_score_idx
  on public.weekly_leaderboard_entries (week_id, total_score desc, created_at asc, player_id asc);

drop function if exists public.upsert_weekly_best_leaderboard_entry(text, text, text, text, integer);

create or replace function public.upsert_weekly_best_leaderboard_entry(
  p_week_id text,
  p_player_id text,
  p_player_name text,
  p_league_id text,
  p_submitted_score integer
)
returns setof public.weekly_leaderboard_entries
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.weekly_leaderboard_entries as entries (
    week_id,
    player_id,
    player_name,
    league_id,
    total_score,
    updated_at
  )
  values (
    p_week_id,
    p_player_id,
    p_player_name,
    p_league_id,
    p_submitted_score,
    now()
  )
  on conflict (week_id, player_id) do update
  set player_name = excluded.player_name,
      league_id = excluded.league_id,
      total_score = greatest(entries.total_score, excluded.total_score),
      updated_at = case
        when excluded.total_score > entries.total_score then now()
        else entries.updated_at
      end;

  return query
  select entries.*
  from public.weekly_leaderboard_entries as entries
  where entries.week_id = p_week_id
    and entries.player_id = p_player_id;
end;
$$;

revoke all on function public.upsert_weekly_best_leaderboard_entry(text, text, text, text, integer)
  from public, anon, authenticated;
grant execute on function public.upsert_weekly_best_leaderboard_entry(text, text, text, text, integer)
  to service_role;

alter table public.weekly_leaderboard_entries enable row level security;

-- Anyone using the publishable API key can read current and historic rows.
drop policy if exists "weekly leaderboard read" on public.weekly_leaderboard_entries;

create policy "weekly leaderboard read"
  on public.weekly_leaderboard_entries
  for select
  to anon, authenticated
  using (true);

-- Writes are intentionally restricted to the service role (used by the
-- upsert-leaderboard-entry Edge Function). No direct insert/update policies
-- are created for publishable key roles.

-- Drop the old open write policies if they exist on an existing deployment.
drop policy if exists "weekly leaderboard insert" on public.weekly_leaderboard_entries;
drop policy if exists "weekly leaderboard update" on public.weekly_leaderboard_entries;
drop policy if exists "public read weekly leaderboard" on public.weekly_leaderboard_entries;
drop policy if exists "public insert weekly leaderboard" on public.weekly_leaderboard_entries;
drop policy if exists "public update weekly leaderboard" on public.weekly_leaderboard_entries;
drop policy if exists "weekly leaderboard delete" on public.weekly_leaderboard_entries;
