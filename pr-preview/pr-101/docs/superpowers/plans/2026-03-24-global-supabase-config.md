# Global Supabase Config Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move Supabase leaderboard configuration from per-device player setup into GitHub Pages CI, remove the back-office flow, and fall back to local leaderboard mode whenever hosted multiplayer is unavailable.

**Architecture:** Add a generated runtime config file that is loaded before `app.js`, normalise that config into safe client defaults, and build the weekly leaderboard adapter from runtime config plus local player state. Remove the player-facing back-office UI and stale persisted setup state, then harden validation and docs around the new deploy model.

**Tech Stack:** Plain HTML, CSS, vanilla JavaScript, shell validation scripts, GitHub Actions, GitHub Pages, Supabase Edge Functions

---

## Chunk 1: Validation First

### Task 1: Extend static validation to catch config and UI regressions

**Files:**
- Modify: `scripts/validate-static-site.sh`
- Modify: `scripts/validate-github-pages-workflows.sh`

- [ ] **Step 1: Write the failing validation checks**

Add checks for:
- `index.html` loading `config.js` before `app.js`
- `config.js` existing in the repo
- `index.html` not containing the back-office settings button
- `index.html` not containing the back-office page
- `.github/workflows/deploy.yml` generating `config.js`

- [ ] **Step 2: Run validation to verify it fails**

Run: `sh scripts/validate-static-site.sh && sh scripts/validate-github-pages-workflows.sh`
Expected: FAIL because the current app still depends on the back-office flow and does not inject runtime config in CI.

- [ ] **Step 3: Commit the validation-only change**

```bash
git add scripts/validate-static-site.sh scripts/validate-github-pages-workflows.sh
git commit -m "test: cover runtime config deployment"
```

## Chunk 2: Runtime Config and Client Refactor

### Task 2: Add a default runtime config file and load it before the app

**Files:**
- Create: `config.js`
- Modify: `index.html`

- [ ] **Step 1: Write the failing expectation**

Use the validation added in Task 1 as the failing check for this task.

- [ ] **Step 2: Add the default local-only runtime config**

Create `config.js` exporting:

```js
window.BUROHAME_RUNTIME_CONFIG = {
  weeklyLeaderboard: {
    backend: 'local',
    supabaseUrl: '',
    supabasePublishableKey: '',
  },
};
```

- [ ] **Step 3: Load `config.js` before `app.js`**

Add the script tag in `index.html` so runtime config is available during app bootstrap.

- [ ] **Step 4: Re-run validation**

Run: `sh scripts/validate-static-site.sh`
Expected: still FAIL because the back-office UI and workflow injection are not removed yet.

### Task 3: Refactor `app.js` to use runtime config plus local player settings

**Files:**
- Modify: `app.js`

- [ ] **Step 1: Write the failing behaviour check**

Use the validation failure from Task 1 plus a local manual smoke check showing the back-office flow still exists.

- [ ] **Step 2: Add runtime config normalisation**

Introduce helpers that:
- read `window.BUROHAME_RUNTIME_CONFIG`
- default safely to local mode
- accept only valid hosted config when both Supabase URL and publishable key are present

- [ ] **Step 3: Remove persisted back-office state**

Update the saved weekly leaderboard state so it keeps only:
- `playerId`
- `playerName`

Ignore legacy per-device Supabase values during load.

- [ ] **Step 4: Replace back-office-specific adapter wiring**

Refactor `configureWeeklyLeaderboardAdapter()` so:
- hosted mode comes only from runtime config
- local fallback remains the storage of record when hosted config is missing
- hosted read failure falls back to local rows with a clear status line
- hosted write failure stores locally and does not break gameplay

- [ ] **Step 5: Remove dead back-office flow**

Delete:
- `populateBackofficePage()`
- `applyBackofficeSetup()`
- `shouldOpenBackofficeSetup()`
- back-office event handlers
- back-office route initialisation

- [ ] **Step 6: Re-run validation**

Run: `sh scripts/validate-static-site.sh`
Expected: PASS once the back-office UI is gone and `config.js` is loaded.

### Task 4: Remove the back-office markup from the app shell

**Files:**
- Modify: `index.html`
- Modify: `styles.css`

- [ ] **Step 1: Delete the settings button and page section**

Remove the Settings button that opens back-office setup and the full back-office page markup.

- [ ] **Step 2: Remove styling that exists only for the deleted route**

Drop the `backoffice` active-page selector from `styles.css`.

- [ ] **Step 3: Smoke-test navigation locally**

Confirm:
- Settings renders
- no back-office button exists
- the app boots to dashboard instead of a setup screen

## Chunk 3: Deployment, Docs, and Verification

### Task 5: Generate runtime config in GitHub Pages CI

**Files:**
- Modify: `.github/workflows/deploy.yml`
- Modify: `scripts/validate-github-pages-workflows.sh`

- [ ] **Step 1: Write the failing workflow validation**

Use the new workflow check from Task 1.

- [ ] **Step 2: Inject repository variables into `config.js`**

Update `deploy.yml` to generate `config.js` during deploy:
- use `vars.SUPABASE_URL`
- use `vars.SUPABASE_PUBLISHABLE_KEY`
- emit local-only config when either value is missing

- [ ] **Step 3: Re-run workflow validation**

Run: `sh scripts/validate-github-pages-workflows.sh`
Expected: PASS

### Task 6: Update maintainer docs and repo snapshot

**Files:**
- Modify: `README.md`
- Modify: `AGENTS.md`

- [ ] **Step 1: Remove player setup instructions**

Rewrite the leaderboard setup section so it documents:
- Supabase database/function deployment
- GitHub repository variables for Pages
- automatic local fallback when hosted mode is unavailable

- [ ] **Step 2: Update the project snapshot**

Adjust `AGENTS.md` so it reflects:
- global runtime config for hosted leaderboard access
- no player-facing back-office setup flow

### Task 7: Verify end to end and finish the branch

**Files:**
- Modify: none

- [ ] **Step 1: Run all repository checks**

Run:

```bash
git diff --check
sh scripts/validate-static-site.sh
sh scripts/validate-github-pages-workflows.sh
sh scripts/test-validation-portability.sh
```

Expected: all PASS

- [ ] **Step 2: Run a local browser smoke test**

Serve the site locally and verify:
- local default config boots cleanly
- Settings has no back-office link
- Weekly leaderboard shows local fallback status

- [ ] **Step 3: Commit implementation**

```bash
git add config.js index.html app.js styles.css README.md AGENTS.md .github/workflows/deploy.yml scripts/validate-static-site.sh scripts/validate-github-pages-workflows.sh docs/superpowers/specs/2026-03-24-global-supabase-config-design.md docs/superpowers/plans/2026-03-24-global-supabase-config.md
git commit -m "feat: move leaderboard config into Pages deploy"
```

- [ ] **Step 4: Push and open the PR**

```bash
git push -u origin codex/global-supabase-config
gh pr create --base main --head codex/global-supabase-config --title "feat: move leaderboard config into Pages deploy"
```
