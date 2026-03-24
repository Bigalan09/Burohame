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
- Weekly leaderboard with a pluggable multiplayer adapter (Supabase or local fallback)
- **Coach Mode** (toggle via ⚙️): colour-coded move hints, board health metrics, move quality feedback

## Multiplayer weekly leaderboard setup (Supabase)

1. Create a `weekly_leaderboard_entries` table in Supabase with:
   - `week_id` (text)
   - `player_id` (text)
   - `player_name` (text)
   - `league_id` (text)
   - `total_score` (int4)
   - `counted_runs` (int4[])
   - `updated_at` (timestamptz)
2. Add a unique index on `(week_id, player_id)` so upserts work.
3. Open the **Leaderboard setup** back-office page on first run (or from Settings → Back-office setup).
4. Choose **Supabase multiplayer** and enter your Supabase URL and publishable key.
6. After saving setup once, credential fields are removed from standard settings.

If Supabase is not configured, Burohame automatically falls back to local leaderboard storage.

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
