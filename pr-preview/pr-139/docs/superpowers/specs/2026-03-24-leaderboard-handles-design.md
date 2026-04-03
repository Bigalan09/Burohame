# Leaderboard Handles Design

## Summary

Burohame should stop showing backend details to players and replace the current free-form weekly display name with a server-issued leaderboard handle such as `alan#4821`. Players choose the base name, the backend validates it, assigns a discriminator, and returns the final public handle.

This keeps leaderboard identity readable without exposing infrastructure terms such as Supabase or multiplayer inside the game UI.

## Goals

- Replace the free-form weekly display name with a claimed leaderboard handle.
- Keep the handle readable and collision-resistant through a `name#1234` format.
- Enforce profanity filtering, reserved-name blocking, and discriminator assignment server-side.
- Remove user-facing technical copy about Supabase, multiplayer, backend mode, or hosted configuration.
- Preserve local fallback behaviour when the hosted weekly table is unavailable.

## Non-goals

- Do not add full account management or passwords.
- Do not add post-offline sync for missed weekly writes.
- Do not expose moderation tools in the client.
- Do not make the weekly table unavailable when the player has not claimed a handle yet.

## Current Problems

- Settings still uses a plain local `Weekly display name` field.
- The leaderboard can show duplicate or weak names such as `Guest`.
- Technical status copy in the app still references hosted setup concepts.
- The write function trusts a client-supplied `player_name` instead of a server-issued public handle.

## Design

### 1. Public Handle Model

Each player keeps a stable anonymous-auth identity internally through `player_id`, but the weekly table shows a separate public handle:

- requested base name: `alan`
- claimed public handle: `alan#4821`

The browser only submits the requested base name. The backend chooses or preserves the discriminator and returns the final claimed handle.

### 2. Server-Side Source of Truth

Add a `leaderboard_player_handles` table keyed by `player_id`.

Suggested columns:

- `player_id`
- `handle_base`
- `normalized_base`
- `discriminator`
- `display_name`
- `created_at`
- `updated_at`

Uniqueness is enforced on `(normalized_base, discriminator)`.

The current weekly leaderboard row keeps using its existing `player_name` column, but that value becomes a cached copy of the claimed public handle. Browser clients no longer decide that value.

### 3. Claim Flow

Add a new Edge Function, `claim-leaderboard-handle`.

Flow:

1. browser requests a claimed handle for a base name
2. function validates the authenticated user token
3. function normalises the requested base name
4. function enforces reserved-name and profanity rules
5. function claims or updates the user’s handle server-side
6. function returns the final `display_name`

If the same user requests the same normalised base name again, the function should return the existing discriminator rather than minting a new one.

If the user changes base name, the function may assign a new discriminator for the new base and update existing leaderboard rows for that `player_id` to the new public handle.

### 4. Validation Rules

For MVP, prefer stricter validation over broad character support:

- ASCII letters and numbers, plus spaces, `.`, `_`, `-`, `'`
- trimmed and collapsed internal whitespace
- 1 to 18 characters for the base name so the final `#1234` handle stays short
- reject reserved names such as `admin`, `mod`, `staff`, `official`, `support`, `guest`, `burohame`
- reject a profanity list server-side

This is intentionally conservative. It reduces filter bypasses and keeps moderation simpler.

### 5. Client Behaviour

Settings changes:

- rename the field to `Leaderboard name`
- use the input for the requested base name, not the final full handle
- show a status line such as:
  - `Current handle: alan#4821`
  - `Choose a leaderboard name to join the weekly table.`
  - `Could not update your handle while offline.`

When hosted weekly access is available:

- saving Settings with a changed leaderboard name should call `claim-leaderboard-handle`
- if claim succeeds, store the returned public handle locally and continue saving settings
- if claim fails, keep the user on Settings and show the backend error

When hosted weekly access is unavailable:

- still allow a local-only display name for on-device fallback rows
- do not pretend that a real public handle was claimed

### 6. Weekly Table Copy Cleanup

Remove infrastructure wording from player-facing UI:

- no `Supabase`
- no `multiplayer`
- no `backend mode`

Use product-facing labels instead:

- `Global weekly table`
- `Weekly table unavailable right now. Showing this device’s table.`
- `Leaderboard name`

Maintainer docs may still mention the actual backend.

### 7. Write Path Changes

`upsert-leaderboard-entry` should stop trusting `player_name` from the client.

Instead:

- derive `player_id` from the authenticated token
- look up the claimed public handle for that `player_id`
- reject hosted writes if no claimed handle exists
- write the claimed handle into `weekly_leaderboard_entries.player_name`

This closes the remaining impersonation gap around public display names.

### 8. Fallback Behaviour

- hosted reads succeed: show the global weekly table
- hosted reads fail: show the local device table
- hosted writes fail: keep local fallback rows only
- no claimed handle yet: player can still play; hosted writes simply do not publish until a handle is claimed

## Testing Strategy

- unit-test the client-side handle helper functions with Node
- add validation checks for:
  - no player-facing `Supabase` or `multiplayer` copy in app UI
  - new claim function exists and is configured
  - leaderboard write function no longer accepts client display names as the source of truth
- smoke-test locally:
  - Settings exposes `Leaderboard name`
  - no backend jargon remains in the UI
  - weekly page uses generic product copy

## Risks

- profanity filtering will still be imperfect for a global audience; the MVP filter should be treated as a floor, not a complete moderation system
- allowing renames can change visible identity over time
- stricter ASCII-only validation may reject some legitimate names, but it is the safer MVP trade-off

## Rollout

1. land schema, claim function, and client handle flow
2. deploy Supabase migration and both Edge Functions
3. merge to `main` and deploy Pages
4. verify live handle claim and weekly publish with a real anonymous-auth session
