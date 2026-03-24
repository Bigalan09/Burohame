-- Claimed public handles for the weekly leaderboard.
-- Players request a base name and the backend assigns a stable discriminator,
-- producing a public handle like "alan#4821".

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
