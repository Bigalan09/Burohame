# Leaderboard Handles Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current weekly display name with a server-issued `name#1234` leaderboard handle, remove user-facing backend jargon, and keep the weekly table safe when hosted access is unavailable.

**Architecture:** Add a new handle-claim table plus SQL claim function, expose it through a new Edge Function, and make the client claim handles from Settings before hosted writes are allowed. Refactor user-facing copy so the app talks about the weekly table and leaderboard names rather than infrastructure.

**Tech Stack:** Plain HTML, CSS, vanilla JavaScript, Node-based helper tests, shell validation scripts, Supabase Edge Functions, Postgres migrations

---

## Chunk 1: Red Tests

### Task 1: Add failing client helper tests and backend validation

**Files:**
- Create: `scripts/test-leaderboard-handles.js`
- Create: `scripts/validate-leaderboard-backend.sh`
- Modify: `.github/workflows/ci.yml`

- [ ] **Step 1: Write the failing helper tests**

Add a Node test script that expects a new `leaderboard-handles.js` module to export:
- `extractLeaderboardNameBase`
- `hasClaimedLeaderboardHandle`
- `sanitiseLocalLeaderboardName`

- [ ] **Step 2: Write the failing backend validation**

Check that the repo contains:
- `supabase/functions/claim-leaderboard-handle/index.ts`
- a matching entry in `supabase/config.toml`
- a migration for `leaderboard_player_handles`
- `upsert-leaderboard-entry` reading the claimed handle from server-side storage

- [ ] **Step 3: Run tests to confirm red**

Run:

```bash
node scripts/test-leaderboard-handles.js
sh scripts/validate-leaderboard-backend.sh
```

Expected: FAIL because the helper module, claim function, and migration do not exist yet.

## Chunk 2: Client Handle Helpers and UI Copy

### Task 2: Add the shared leaderboard handle helper module

**Files:**
- Create: `leaderboard-handles.js`
- Modify: `index.html`
- Test: `scripts/test-leaderboard-handles.js`

- [ ] **Step 1: Implement the smallest helper API to satisfy the failing Node tests**

Helpers should cover:
- recognising `name#1234`
- extracting the editable base name
- sanitising a local-only fallback name

- [ ] **Step 2: Load the helper script before `app.js`**

Update `index.html` so the browser app can use the same helper logic as the Node tests.

- [ ] **Step 3: Re-run the helper tests**

Run: `node scripts/test-leaderboard-handles.js`
Expected: PASS

### Task 3: Refactor Settings and weekly copy away from backend jargon

**Files:**
- Modify: `index.html`
- Modify: `app.js`
- Modify: `scripts/validate-static-site.sh`

- [ ] **Step 1: Write the failing static validation**

Add checks that the user-facing app shell does not expose `Supabase` or `multiplayer` copy in `index.html`.

- [ ] **Step 2: Replace player-facing labels**

Change the app UI to use:
- `Leaderboard name`
- generic weekly table status copy
- claimed-handle status text instead of backend-mode text

- [ ] **Step 3: Re-run static validation**

Run: `sh scripts/validate-static-site.sh`
Expected: PASS

## Chunk 3: Schema and Edge Functions

### Task 4: Add the claimed-handle schema and SQL claim function

**Files:**
- Create: `supabase/migrations/202603241700_leaderboard_handles.sql`
- Modify: `supabase/weekly_leaderboard.sql`

- [ ] **Step 1: Implement the handle profile table**

Add:
- `leaderboard_player_handles`
- uniqueness on `(normalized_base, discriminator)`
- constraints for safe base length and discriminator range

- [ ] **Step 2: Implement the SQL claim function**

The function must:
- validate and normalise the requested base name
- reject reserved or profane names
- serialise same-name claims safely
- preserve the existing discriminator when the same user reclaims the same base
- update existing leaderboard rows for that player to the current display handle

- [ ] **Step 3: Re-run backend validation**

Run: `sh scripts/validate-leaderboard-backend.sh`
Expected: still FAIL until the Edge Functions are added

### Task 5: Add the handle claim Edge Function and harden the write function

**Files:**
- Create: `supabase/functions/claim-leaderboard-handle/index.ts`
- Modify: `supabase/functions/upsert-leaderboard-entry/index.ts`
- Modify: `supabase/config.toml`
- Test: `scripts/validate-leaderboard-backend.sh`

- [ ] **Step 1: Add the new claim function**

Implement:
- token validation
- requested-name payload parsing
- RPC call to the SQL claim function
- clear user-facing error responses

- [ ] **Step 2: Remove client control over leaderboard public names**

Update `upsert-leaderboard-entry` so it:
- rejects writes when no claimed handle exists
- looks up the current claimed handle server-side
- writes that value into `weekly_leaderboard_entries.player_name`

- [ ] **Step 3: Re-run backend validation**

Run: `sh scripts/validate-leaderboard-backend.sh`
Expected: PASS

## Chunk 4: Client Claim Flow

### Task 6: Claim leaderboard handles from Settings

**Files:**
- Modify: `app.js`
- Modify: `index.html`

- [ ] **Step 1: Add client claim helpers on the hosted adapter**

Expose a method that calls `claim-leaderboard-handle` with the requested base name.

- [ ] **Step 2: Update the Settings save path**

When the hosted weekly table is available and the requested name changes:
- call the claim function
- store the returned claimed handle locally
- keep the user on Settings if claim fails

When hosted access is unavailable:
- keep a local-only fallback name

- [ ] **Step 3: Prevent hosted writes without a claimed handle**

Hosted publishes should no-op safely until a claimed handle exists.

## Chunk 5: Verification and Finish

### Task 7: Verify the full change set

**Files:**
- Modify: `README.md`
- Modify: `AGENTS.md`

- [ ] **Step 1: Update maintainer docs**

Document:
- the new claim function deployment
- the handle model
- the cleaned-up user-facing copy expectations

- [ ] **Step 2: Run all automated checks**

Run:

```bash
git diff --check
node scripts/test-leaderboard-handles.js
sh scripts/validate-static-site.sh
sh scripts/validate-github-pages-workflows.sh
sh scripts/validate-leaderboard-backend.sh
sh scripts/test-validation-portability.sh
node --check app.js
```

- [ ] **Step 3: Run a local browser smoke test**

Verify:
- Settings shows `Leaderboard name`
- no user-facing `Supabase` or `multiplayer` copy remains
- weekly page uses generic status labels

- [ ] **Step 4: Commit, push, and open the PR**

```bash
git add .
git commit -m "feat: add claimed leaderboard handles"
git push -u origin codex/leaderboard-handles
gh pr create --base main --head codex/leaderboard-handles --title "feat: add claimed leaderboard handles"
```
