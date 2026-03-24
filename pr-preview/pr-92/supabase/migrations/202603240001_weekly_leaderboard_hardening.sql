-- Weekly leaderboard schema and security hardening.
-- Reads are allowed with the publishable API key.
-- Writes are only allowed through the upsert-leaderboard-entry Edge Function
-- with authenticated user JWT validation.

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

create unique index if not exists weekly_leaderboard_entries_week_player_uidx
  on public.weekly_leaderboard_entries (week_id, player_id);

create index if not exists weekly_leaderboard_entries_week_score_idx
  on public.weekly_leaderboard_entries (week_id, total_score desc, updated_at desc);

alter table public.weekly_leaderboard_entries enable row level security;

create policy if not exists "weekly leaderboard read"
  on public.weekly_leaderboard_entries
  for select
  to anon, authenticated
  using (true);

-- Keep browser clients read-only.
drop policy if exists "weekly leaderboard insert" on public.weekly_leaderboard_entries;
drop policy if exists "weekly leaderboard update" on public.weekly_leaderboard_entries;
drop policy if exists "weekly leaderboard delete" on public.weekly_leaderboard_entries;
