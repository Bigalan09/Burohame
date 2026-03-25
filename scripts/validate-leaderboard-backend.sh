#!/bin/sh

set -eu

fail=0

check_file() {
  file=$1
  message=$2

  if [ ! -f "$file" ]; then
    printf 'FAIL: %s\n' "$message"
    fail=1
  fi
}

check_contains() {
  file=$1
  pattern=$2
  message=$3

  if ! grep -Fq "$pattern" "$file"; then
    printf 'FAIL: %s\n' "$message"
    fail=1
  fi
}

check_not_contains() {
  file=$1
  pattern=$2
  message=$3

  if grep -Fq "$pattern" "$file"; then
    printf 'FAIL: %s\n' "$message"
    fail=1
  fi
}

check_file "supabase/functions/claim-leaderboard-handle/index.ts" \
  "claim-leaderboard-handle Edge Function must exist."
check_file "supabase/migrations/202603241700_leaderboard_handles.sql" \
  "leaderboard handle migration must exist."
check_file "supabase/migrations/202603250930_backfill_leaderboard_handles.sql" \
  "leaderboard handle backfill migration must exist."
check_file "supabase/migrations/202603251100_weekly_best_live_competition.sql" \
  "weekly best live competition migration must exist."
check_file "supabase/migrations/202603251620_fix_weekly_best_conflict_ambiguity.sql" \
  "weekly best conflict fix migration must exist."
check_file "supabase/migrations/202603251700_fix_weekly_best_constraint_name.sql" \
  "weekly best constraint-name fix migration must exist."
check_file "supabase/migrations/202603251745_fix_weekly_best_function_signature.sql" \
  "weekly best function-signature fix migration must exist."

check_contains "supabase/config.toml" "[functions.claim-leaderboard-handle]" \
  "supabase/config.toml must configure claim-leaderboard-handle."
check_contains "supabase/functions/upsert-leaderboard-entry/index.ts" "leaderboard_player_handles" \
  "upsert-leaderboard-entry must load the claimed handle from server-side storage."
check_contains "supabase/functions/upsert-leaderboard-entry/index.ts" "No claimed leaderboard handle" \
  "upsert-leaderboard-entry must reject writes when no claimed handle exists."
check_contains "supabase/weekly_leaderboard.sql" "leaderboard_player_handles" \
  "weekly_leaderboard.sql must include the leaderboard handle schema."
check_contains "supabase/weekly_leaderboard.sql" "claim_leaderboard_handle" \
  "weekly_leaderboard.sql must define the claim_leaderboard_handle function."
check_contains "supabase/migrations/202603250930_backfill_leaderboard_handles.sql" "leaderboard_player_handles" \
  "leaderboard handle backfill migration must populate claimed handles."
check_contains "supabase/migrations/202603250930_backfill_leaderboard_handles.sql" "weekly_leaderboard_entries" \
  "leaderboard handle backfill migration must refresh stored leaderboard names."
check_not_contains "supabase/migrations/202603250930_backfill_leaderboard_handles.sql" "entries.created_at" \
  "leaderboard handle backfill migration must not depend on a created_at column in weekly_leaderboard_entries."
check_contains "supabase/migrations/202603251100_weekly_best_live_competition.sql" "add column if not exists created_at" \
  "weekly best live competition migration must add created_at for older leaderboard deployments."
check_contains "supabase/migrations/202603251100_weekly_best_live_competition.sql" "where created_at is null" \
  "weekly best live competition migration must backfill created_at before using it as a tie-break."
check_contains "supabase/weekly_leaderboard.sql" "rename constraint weekly_leaderboard_entries_pkey to weekly_leaderboard_entries_pk" \
  "weekly leaderboard SQL must normalise the weekly leaderboard primary-key constraint name for older hosted deployments."
check_contains "supabase/migrations/202603251100_weekly_best_live_competition.sql" "rename constraint weekly_leaderboard_entries_pkey to weekly_leaderboard_entries_pk" \
  "weekly best live competition migration must normalise the weekly leaderboard primary-key constraint name for older hosted deployments."
check_contains "supabase/migrations/202603251700_fix_weekly_best_constraint_name.sql" "rename constraint weekly_leaderboard_entries_pkey to weekly_leaderboard_entries_pk" \
  "weekly best constraint-name fix migration must normalise the weekly leaderboard primary-key constraint name."
check_contains "supabase/weekly_leaderboard.sql" "returns setof public.weekly_leaderboard_entries" \
  "weekly leaderboard SQL must return the table row type so ON CONFLICT can safely infer the unique key."
check_contains "supabase/weekly_leaderboard.sql" "on conflict (week_id, player_id) do update" \
  "weekly leaderboard SQL must upsert against the weekly leaderboard unique key by columns."
check_contains "supabase/migrations/202603251745_fix_weekly_best_function_signature.sql" "returns setof public.weekly_leaderboard_entries" \
  "weekly best function-signature fix migration must return the table row type."
check_contains "supabase/migrations/202603251745_fix_weekly_best_function_signature.sql" "on conflict (week_id, player_id) do update" \
  "weekly best function-signature fix migration must use the column-based ON CONFLICT target."

if [ "$fail" -ne 0 ]; then
  exit 1
fi

printf 'Leaderboard backend validation passed.\n'
