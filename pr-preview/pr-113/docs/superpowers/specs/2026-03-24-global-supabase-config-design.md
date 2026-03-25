# Global Supabase Leaderboard Config Design

## Summary

Burohame should stop asking each player to configure Supabase on their own device. The weekly leaderboard is a product-level capability, not a player setting. Production GitHub Pages deploys should inject the public Supabase client config once in CI, and the app should automatically use hosted multiplayer when that config is available.

If hosted multiplayer is unavailable because the browser is offline or Supabase requests fail, the app should fall back to local practice mode without blocking play. Missed local runs do not need to sync later.

## Goals

- Remove the per-device back-office setup flow from the player experience.
- Inject the Supabase URL and publishable key globally during GitHub Pages deployment.
- Default production builds to hosted multiplayer when config is present.
- Fall back to local leaderboard behaviour when hosted config is missing or unavailable.
- Keep the game fully playable offline.

## Non-goals

- Do not add offline-to-online leaderboard sync.
- Do not add a new admin UI inside the game.
- Do not expose any secret keys in the client bundle.
- Do not change the Supabase schema or Edge Function contract beyond what the client needs.

## Current Problems

- The app stores `supabaseUrl` and `supabaseApiKey` in each player’s local settings.
- First-run behaviour can redirect players into a one-time back-office setup page.
- Settings contains a permanent back-office entry point even after setup.
- Hosted leaderboard availability is treated like a user-managed device config instead of a deployment concern.

## Design

### 1. Runtime Config Source

Add a small generated runtime config file, loaded before `app.js`, for example:

```js
window.BUROHAME_RUNTIME_CONFIG = {
  weeklyLeaderboard: {
    backend: 'supabase',
    supabaseUrl: 'https://<project>.supabase.co',
    supabasePublishableKey: 'sb_publishable_...',
  },
};
```

GitHub Actions will generate this file during the Pages deploy job from repository-level configuration. The values are public client config, so repository variables are sufficient. If the values are absent, CI should generate a config that selects local mode instead.

Local development should use a checked-in default config file that points to local mode. CI will overwrite that file in production builds.

### 2. Client Configuration Model

Split leaderboard state into:

- Global runtime config: backend selection, Supabase URL, publishable key
- Local player settings: player id and player display name

Remove stored per-device Supabase settings and the `backofficeCompleteAt` flag from the persisted settings model. Keep a compatibility shim so old saved settings do not break startup, but ignore those old Supabase values once runtime config exists.

### 3. Navigation and UI Changes

Remove:

- the back-office page from `index.html`
- the Settings button that links to back-office setup
- the first-run redirect into back-office setup
- the back-office save/cancel handlers
- setup-specific copy in the README intended for end users

Settings should only expose player-facing controls such as name, cosmetics, and gameplay preferences.

### 4. Adapter Behaviour

At startup:

- build the weekly leaderboard adapter from runtime config
- use the Supabase adapter when runtime config contains a valid hosted setup
- otherwise use the local adapter

At runtime:

- reads should try Supabase when the hosted adapter is active
- if a hosted fetch fails, show a blunt status line and render the local fallback data for that week
- writes should try Supabase when the hosted adapter is active
- if a hosted write fails, write only to local storage and continue silently enough to avoid interrupting the run

This creates a practical “hosted when available, local when not” model without any replay queue.

### 5. Fallback Rules

- Missing runtime config: local mode
- Offline browser: local mode
- Hosted fetch failure: local mode for display until the next successful refresh
- Hosted write failure: store locally only, do not retry later
- Returning online: the next refresh or publish attempt may use hosted mode again

The local fallback should remain clearly labelled so players are not misled into thinking offline scores were published globally.

### 6. CI and Deployment

The GitHub Pages workflow should:

1. check out the repo
2. stamp the service worker cache version
3. generate the runtime config file from GitHub repository variables
4. upload the Pages artifact

Expected repository variables:

- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`

If both variables are present, generate Supabase runtime config. If either is missing, generate a local-only runtime config and keep the site functional.

### 7. Documentation

Update `README.md` so deployment steps are aimed at maintainers rather than players:

- Supabase schema and function deployment remain documented
- GitHub repository variables for Pages deployment are documented
- the old browser back-office setup instructions are removed
- local fallback behaviour is documented plainly

## Implementation Notes

- Load `config.js` before `app.js` in `index.html`.
- Add a small helper that normalises `window.BUROHAME_RUNTIME_CONFIG` into safe defaults.
- Refactor `configureWeeklyLeaderboardAdapter()` to read runtime config plus local player state.
- Keep the current local adapter as the fallback implementation rather than introducing a new storage path.
- Reuse the existing weekly leaderboard status text to signal fallback mode.

## Testing Strategy

- Static validation should confirm `config.js` is referenced by `index.html`.
- Workflow validation should confirm the deploy workflow generates the runtime config file.
- Client smoke tests should cover:
  - boot with local-only config
  - boot with Supabase config
  - Settings no longer shows back-office setup
  - offline or failed hosted fetch falls back to local status
- Regression checks should verify the app never redirects to a removed back-office page.

## Risks

- If the runtime config file is missing from a deploy artifact, production silently falls back to local mode. This is safe but easy to miss without validation.
- If fallback labelling is vague, players may think their offline scores were shared globally when they were not.
- Old saved settings may still contain stale Supabase values, so startup normalisation needs to ignore them cleanly.

## Rollout

1. Land the client/runtime-config refactor.
2. Add GitHub repository variables.
3. Merge and deploy to Pages.
4. Verify production serves the generated config and boots into hosted mode.
5. Verify offline or forced network failure falls back to local mode without breaking play.
