#!/bin/sh

set -eu

if ! gh auth status >/dev/null 2>&1; then
  printf 'gh auth is invalid. Run `gh auth login -h github.com` first.\n' >&2
  exit 1
fi

repo=${1:-$(git remote get-url origin | sed -E 's#(git@github.com:|https://github.com/)##; s#\.git$##')}
owner=${repo%/*}
name=${repo#*/}
pages_owner=$(printf '%s' "$owner" | tr '[:upper:]' '[:lower:]')
pages_url="https://${pages_owner}.github.io/${name}/"

try_step() {
  label=$1
  shift

  if "$@"; then
    printf 'OK: %s\n' "$label"
  else
    printf 'WARN: %s\n' "$label" >&2
  fi
}

printf 'Applying repository metadata to %s\n' "$repo"

gh repo edit "$repo" \
  --description "Mobile-first Burohame training app with GitHub Pages preview deployments." \
  --homepage "$pages_url" \
  --enable-issues \
  --enable-wiki=false \
  --default-branch main \
  --delete-branch-on-merge \
  --enable-rebase-merge \
  --enable-squash-merge \
  --enable-merge-commit=false \
  --add-topic burohame \
  --add-topic github-pages \
  --add-topic javascript \
  --add-topic vanilla-js \
  --add-topic pwa \
  --add-topic puzzle-game \
  --add-topic browser-game

for spec in \
  "bug|d73a4a|Something is broken" \
  "enhancement|a2eeef|New feature or improvement" \
  "documentation|0075ca|Docs or copy updates" \
  "ci|5319e7|GitHub Actions or release pipeline work" \
  "security|b60205|Security hardening or vulnerabilities" \
  "ux|fbca04|Design, usability, or interaction work" \
  "priority: high|d93f0b|Needs attention first" \
  "priority: medium|fbca04|Worth doing soon" \
  "priority: low|0e8a16|Can wait" \
  "good first issue|7057ff|Suitable for a first contribution"; do
  label_name=${spec%%|*}
  rest=${spec#*|}
  colour=${rest%%|*}
  description=${rest#*|}
  gh label create "$label_name" --repo "$repo" --color "$colour" --description "$description" --force
done

try_step "Enable vulnerability alerts" \
  sh -c 'gh api --method PUT -H "Accept: application/vnd.github+json" "repos/$1/vulnerability-alerts" >/dev/null' _ "$repo"
try_step "Enable automated security fixes" \
  sh -c 'gh api --method PUT -H "Accept: application/vnd.github+json" "repos/$1/automated-security-fixes" >/dev/null' _ "$repo"
try_step "Enable secret scanning" \
  sh -c 'gh api --method PATCH -H "Accept: application/vnd.github+json" "repos/$1" --input - >/dev/null' _ "$repo" <<EOF
{
  "security_and_analysis": {
    "secret_scanning": {
      "status": "enabled"
    },
    "secret_scanning_push_protection": {
      "status": "enabled"
    }
  }
}
EOF

main_sha=$(gh api "repos/$repo/commits/main" --jq '.sha')
check_names=$(gh api "repos/$repo/commits/$main_sha/check-runs" --jq '.check_runs[].name')

find_check() {
  pattern=$1
  printf '%s\n' "$check_names" | rg "$pattern" | head -n 1
}

validate_check=$(find_check 'validate$' || true)
js_check=$(find_check 'analyse \(javascript-typescript\)$' || true)
actions_check=$(find_check 'analyse \(actions\)$' || true)

if [ -z "$validate_check" ] || [ -z "$js_check" ] || [ -z "$actions_check" ]; then
  printf 'WARN: branch protection not applied. Push the workflow changes and let CI + CodeQL run once first.\n' >&2
  exit 0
fi

gh api --method PUT -H "Accept: application/vnd.github+json" "repos/$repo/branches/main/protection" --input - <<EOF
{
  "required_status_checks": {
    "strict": true,
    "contexts": [
      "$validate_check",
      "$js_check",
      "$actions_check"
    ]
  },
  "enforce_admins": true,
  "required_pull_request_reviews": {
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": false,
    "required_approving_review_count": 0,
    "require_last_push_approval": false
  },
  "restrictions": null,
  "required_linear_history": true,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "required_conversation_resolution": true
}
EOF

printf 'Repository settings applied.\n'
