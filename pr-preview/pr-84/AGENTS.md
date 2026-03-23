# Codex Agent Instructions

## Project snapshot

Burohame is a mobile-first 9×9 block puzzle game built as a plain static web app with HTML, CSS, and vanilla JavaScript. The current live product is a single-page experience with dashboard, game, weekly leaderboard, quest chains, daily missions, shop, settings, and about pages, plus PWA support and GitHub Pages deployment.

### Core game

- Place three pieces per round on a 9×9 board with no rotation.
- Clear full rows, columns, and 3×3 boxes for points.
- Chain clears to build combo bonuses.
- Support both the standard piece set and the extended piece set.
- Offer Coach Mode guidance with move hints, board-health feedback, and quality callouts.

### Progression and retention systems currently in the game

- Persistent local progression state saved in browser storage.
- Coins as the soft currency, with tuned rewards and scaled shop prices.
- Daily challenge runs with streak tracking and daily coin rewards.
- Daily missions that auto-pay rewards when completed.
- Weekly ladder leagues based on a player’s best four runs in the current week.
- Quest chains with sequential steps and final rewards.
- Post-run rewards summary and contextual one-more-run prompts.
- Mastery progression and permanent unlocks.
- Cosmetic collection systems including colourways, finishes, themed sets, set badges, and a full collection album reward.

### Current technical shape

- No framework and no build step.
- Main app files live at the repository root: `index.html`, `styles.css`, `app.js`, `sw.js`, and static assets.
- GitHub Actions handle CI, PR previews, CodeQL, and production deployment to GitHub Pages.
- Weekly leaderboard data is still local and simulated client-side. It is not yet multiplayer or backed by shared persistent storage.

## Branch and PR workflow

When you are asked to make repository changes, follow this sequence unless the user explicitly tells you otherwise:

1. Create a new branch from the latest `main` branch before editing files.
2. Complete the requested work on that branch.
3. Run the relevant checks for the changes you made.
4. Commit your changes with a clear message.
5. Push the branch to `origin`.
6. Reuse the existing GitHub pull request for that branch if one already exists. Only open a new pull request when there is no suitable existing pull request to update.

### Codex Web and cloud PR handling

To avoid duplicate pull requests and UI confusion, use these rules whenever Codex Web or Codex cloud is involved:

- Treat the branch as the source of truth. A branch should map to a single active pull request unless the user explicitly asks for a replacement pull request.
- Before opening a pull request, check whether `origin` already has an open pull request for the current branch. If it does, update and reuse that pull request instead of creating another one.
- If Codex Web shows a manual "Create PR" option in the UI, do not create an additional pull request when the branch already has one. Mention that the existing pull request should be reused.
- If an earlier agent already created a pull request, continue pushing commits to the same branch and keep that pull request as the review thread.
- Only hand PR creation back to the user when automation cannot complete it. In that case, explicitly say whether an existing pull request already exists and instruct the user to reuse it rather than opening a duplicate.
- Do not end a task by both creating a pull request yourself and asking the user to create another one from the UI. Choose one path only.

## Working expectations

- Keep changes focused on the user request.
- Do not rewrite unrelated files.
- Prefer small, reviewable commits.
- Summarise the checks you ran in the final response.
- When project state changes materially, update this file so it remains a reliable snapshot of the game and release plan.

## Ordered issue queue for retention and delight work

When a user says "implement the next issue", inspect the lists below, pick the first item in `TODO`, implement it, and then move it to `Completed` once the work has landed.

After implementing an issue, also tidy the GitHub issue queue so the repository and this file stay aligned:
- close the implemented GitHub issue once the branch, commit, push, and PR are in place;
- remove it from `TODO` here and add it to `Completed`;
- if `TODO` becomes empty, add the next suitable open GitHub issue to `TODO` before the next implementation request.

### TODO

- [#83 Make the weekly leaderboard multiplayer with a pluggable hosted backend](https://github.com/Bigalan09/Burohame/issues/83)
  - Use Supabase first for the release milestone.
  - Keep reads and writes behind an adapter so the storage layer can later be swapped for self-hosted services or other APIs if scaling needs change.

### Completed

- [#56 Add themed collection sets and album completion goals](https://github.com/Bigalan09/Burohame/issues/56)
- [#55 Add multi-step quest chains on top of daily missions](https://github.com/Bigalan09/Burohame/issues/55)
- [#54 Add contextual one-more-run prompts after game over](https://github.com/Bigalan09/Burohame/issues/54)
- [#53 Add a mastery track with permanent unlocks](https://github.com/Bigalan09/Burohame/issues/53)
- [#52 Add weekly ladders and leagues for multi-day retention](https://github.com/Bigalan09/Burohame/issues/52)
- [#38 Add a daily challenge and streak system](https://github.com/Bigalan09/Burohame/issues/38)
- [#37 Add delight feedback for milestone moments](https://github.com/Bigalan09/Burohame/issues/37)
- [#36 Add a cosmetics collection and unlock flow](https://github.com/Bigalan09/Burohame/issues/36)
- [#34 Add a post-run rewards summary](https://github.com/Bigalan09/Burohame/issues/34)
- [#35 Add daily missions with coin rewards](https://github.com/Bigalan09/Burohame/issues/35)
- [#33 Add coins as a persistent soft currency](https://github.com/Bigalan09/Burohame/issues/33)
- [#32 Add persistent progression state for retention features](https://github.com/Bigalan09/Burohame/issues/32)
