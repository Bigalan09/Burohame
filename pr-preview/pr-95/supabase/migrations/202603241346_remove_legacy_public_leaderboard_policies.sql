-- Remove legacy public leaderboard policies left behind by older deployments.
-- These policies allowed direct anon reads and writes and must be removed so
-- browser clients stay read-only.

drop policy if exists "public read weekly leaderboard" on public.weekly_leaderboard_entries;
drop policy if exists "public insert weekly leaderboard" on public.weekly_leaderboard_entries;
drop policy if exists "public update weekly leaderboard" on public.weekly_leaderboard_entries;
