# Codex Agent Instructions

## Branch and PR workflow

When you are asked to make repository changes, follow this sequence unless the user explicitly tells you otherwise:

1. Create a new branch from the latest `main` branch before editing files.
2. Complete the requested work on that branch.
3. Run the relevant checks for the changes you made.
4. Commit your changes with a clear message.
5. Push the branch to `origin`.
6. Open a GitHub pull request from your branch to `main` on `origin`.

## Working expectations

- Keep changes focused on the user request.
- Do not rewrite unrelated files.
- Prefer small, reviewable commits.
- Summarise the checks you ran in the final response.

## Ordered issue queue for retention and delight work

When a user says "implement the next issue", inspect the lists below, pick the first item in `TODO`, implement it, and then move it to `Completed` once the work has landed.

After implementing an issue, also tidy the GitHub issue queue so the repository and this file stay aligned:
- close the implemented GitHub issue once the branch, commit, push, and PR are in place;
- remove it from `TODO` here and add it to `Completed`;
- if `TODO` becomes empty, add the next suitable open GitHub issue to `TODO` before the next implementation request.

### TODO

- [#55 Add multi-step quest chains on top of daily missions](https://github.com/Bigalan09/Burohame/issues/55)
- [#56 Add themed collection sets and album completion goals](https://github.com/Bigalan09/Burohame/issues/56)

### Completed

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
