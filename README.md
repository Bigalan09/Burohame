# Burohame

> A mobile-first Burohame training app that helps you score above 3000 consistently.

**Pronunciation:** boo-roh-hah-meh · ブロハメ

🎮 **[Play the latest version](https://bigalan09.github.io/burokeshoku/)**

---

## Features

- Authentic 9×9 Burohame gameplay — 3 pieces per round, no rotation
- Rows, columns and 3×3 boxes clear when full
- Multi-clear and combo bonuses
- Best score saved locally
- **Training mode** (toggle via ⚙️): hints, board health metrics, move quality feedback

## Local dev

```sh
chmod +x run_server.sh
./run_server.sh
# open http://localhost:8080
```

## Deploy

Pushes to `main` auto-deploy to GitHub Pages via `.github/workflows/deploy.yml`.

## Tech

Plain HTML · CSS · Vanilla JS — no frameworks, no build tools.