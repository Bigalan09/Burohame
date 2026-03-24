# Burohame

> A mobile-first block-puzzle game. Place three pieces per round onto a 9×9 grid — clear full rows, columns and 3×3 boxes to score points. Chain clears for combo bonuses, and use **Coach Mode** to get move hints and board-health feedback while you learn the strategy.

**Pronunciation:** boo-roh-hah-meh · ブロハメ

🎮 **[Play the latest version](https://bigalan09.github.io/Burohame/)**
📦 **[Repository](https://github.com/Bigalan09/Burohame)**

---

## Features

- Authentic 9×9 Burohame gameplay — 3 pieces per round, no rotation
- Rows, columns and 3×3 boxes clear when full
- Multi-clear and combo bonuses
- Best score saved locally
- Weekly leaderboard with global Supabase multiplayer config and automatic local fallback
- **Coach Mode** (toggle via ⚙️): colour-coded move hints, board health metrics, move quality feedback

## Multiplayer weekly leaderboard deployment (Supabase)

1. Apply the SQL in `supabase/weekly_leaderboard.sql` or `supabase/migrations/202603240001_weekly_leaderboard_hardening.sql`.
2. Deploy the Edge Function at `supabase/functions/upsert-leaderboard-entry`.
3. In GitHub repository settings, add these Actions variables for Pages deploys:
   - `SUPABASE_URL`
   - `SUPABASE_PUBLISHABLE_KEY`
4. Deploy `main` to GitHub Pages through `.github/workflows/deploy.yml`.

If either Actions variable is missing, the deployed site stays in local practice mode and still works offline.

### Security model

- Browser clients only use the Supabase URL plus a publishable API key.
- Browser reads use `GET /rest/v1/weekly_leaderboard_entries`.
- Browser writes use `POST /functions/v1/upsert-leaderboard-entry` with a Supabase Auth user JWT.
- The Edge Function requires an authenticated user token, derives `player_id` from the token subject, validates payload fields, and recomputes `total_score` from `counted_runs`.
- The Edge Function writes with the service role key server-side.
- RLS allows public read-only access and blocks direct client inserts, updates, and deletes.
- Hosted leaderboard config is injected at deploy time through GitHub Actions, not entered by players in the browser.

### Manual Supabase deploy steps

```sh
# from the repository root
supabase link --project-ref <your-project-ref>
SUPABASE_DB_PASSWORD=<your-db-password> supabase db push --include-all
supabase functions deploy upsert-leaderboard-entry --no-verify-jwt
```

Hosted Supabase Edge Functions already receive the default `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` secrets, so you do not need to set them manually for deploys.

Enable Supabase Auth anonymous sign-ins for the project so the browser can obtain an authenticated JWT for Edge Function writes.
The function validates that JWT inside the function itself because Supabase's built-in `verify_jwt` path is incompatible with projects using the newer JWT signing keys.

If hosted multiplayer is unavailable or the browser is offline, Burohame falls back to local leaderboard storage on that device. Those local fallback runs are not synced later.

## Local dev

```sh
chmod +x run_server.sh
./run_server.sh
# open http://localhost:8080
```

## Deploy

Pushes to `main` auto-deploy to GitHub Pages via `.github/workflows/deploy.yml`.
Manual production deploys are available via `workflow_dispatch` in the same workflow.

## Tech

Plain HTML · CSS · Vanilla JS — no frameworks, no build tools.
