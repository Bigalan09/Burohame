-- Avoid PL/pgSQL output-column name collisions and constraint-name
-- dependencies by returning the leaderboard row type and inferring the unique
-- key from the conflict columns.

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
