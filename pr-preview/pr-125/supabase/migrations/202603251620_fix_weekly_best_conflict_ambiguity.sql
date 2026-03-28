-- Fix the weekly best-score upsert function for deployments that already
-- applied the original migration. RETURNS TABLE output columns named week_id
-- and player_id make `on conflict (week_id, player_id)` ambiguous in plpgsql,
-- so the function must target the primary-key constraint instead.

create or replace function public.upsert_weekly_best_leaderboard_entry(
  p_week_id text,
  p_player_id text,
  p_player_name text,
  p_league_id text,
  p_submitted_score integer
)
returns table(
  week_id text,
  player_id text,
  player_name text,
  league_id text,
  total_score integer,
  updated_at timestamptz,
  created_at timestamptz
)
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
  on conflict on constraint weekly_leaderboard_entries_pk do update
  set player_name = excluded.player_name,
      league_id = excluded.league_id,
      total_score = greatest(entries.total_score, excluded.total_score),
      updated_at = case
        when excluded.total_score > entries.total_score then now()
        else entries.updated_at
      end;

  return query
  select
    entries.week_id,
    entries.player_id,
    entries.player_name,
    entries.league_id,
    entries.total_score,
    entries.updated_at,
    entries.created_at
  from public.weekly_leaderboard_entries as entries
  where entries.week_id = p_week_id
    and entries.player_id = p_player_id;
end;
$$;

revoke all on function public.upsert_weekly_best_leaderboard_entry(text, text, text, text, integer)
  from public, anon, authenticated;
grant execute on function public.upsert_weekly_best_leaderboard_entry(text, text, text, text, integer)
  to service_role;
