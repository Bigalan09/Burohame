alter table public.weekly_leaderboard_entries
  add column if not exists equipped_badge_id text not null default '';

alter table public.weekly_leaderboard_entries
  drop constraint if exists weekly_leaderboard_entries_badge_len;

alter table public.weekly_leaderboard_entries
  add constraint weekly_leaderboard_entries_badge_len check (char_length(equipped_badge_id) <= 64);

drop function if exists public.upsert_weekly_best_leaderboard_entry(text, text, text, text, integer);

create or replace function public.upsert_weekly_best_leaderboard_entry(
  p_week_id text,
  p_player_id text,
  p_player_name text,
  p_league_id text,
  p_submitted_score integer,
  p_equipped_badge_id text default ''
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
    equipped_badge_id,
    updated_at
  )
  values (
    p_week_id,
    p_player_id,
    p_player_name,
    p_league_id,
    p_submitted_score,
    left(coalesce(p_equipped_badge_id, ''), 64),
    now()
  )
  on conflict (week_id, player_id) do update
  set player_name = excluded.player_name,
      league_id = excluded.league_id,
      equipped_badge_id = excluded.equipped_badge_id,
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

revoke all on function public.upsert_weekly_best_leaderboard_entry(text, text, text, text, integer, text)
  from public, anon, authenticated;
grant execute on function public.upsert_weekly_best_leaderboard_entry(text, text, text, text, integer, text)
  to service_role;
