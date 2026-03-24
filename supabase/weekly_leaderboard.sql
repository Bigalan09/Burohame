-- Weekly leaderboard table for Burohame multiplayer mode.
-- Safe for browser clients when RLS is enabled with publishable keys.

create table if not exists public.weekly_leaderboard_entries (
  week_id text not null,
  player_id text not null,
  player_name text not null default 'Guest',
  league_id text not null default 'bronze',
  total_score integer not null default 0,
  counted_runs integer[] not null default '{}',
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint weekly_leaderboard_entries_score_non_negative check (total_score >= 0),
  constraint weekly_leaderboard_entries_name_len check (char_length(player_name) between 1 and 24),
  constraint weekly_leaderboard_entries_runs_len check (coalesce(array_length(counted_runs, 1), 0) <= 4),
  constraint weekly_leaderboard_entries_pk primary key (week_id, player_id)
);

create index if not exists weekly_leaderboard_entries_week_score_idx
  on public.weekly_leaderboard_entries (week_id, total_score desc, updated_at desc);

alter table public.weekly_leaderboard_entries enable row level security;

-- Anyone using the publishable key can read current and historic rows.
create policy if not exists "weekly leaderboard read"
  on public.weekly_leaderboard_entries
  for select
  to anon, authenticated
  using (true);

-- Allow upserts from browser clients.
create policy if not exists "weekly leaderboard insert"
  on public.weekly_leaderboard_entries
  for insert
  to anon, authenticated
  with check (true);

create policy if not exists "weekly leaderboard update"
  on public.weekly_leaderboard_entries
  for update
  to anon, authenticated
  using (true)
  with check (true);
