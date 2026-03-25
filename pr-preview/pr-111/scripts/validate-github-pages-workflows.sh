#!/bin/sh

set -eu

fail=0

check_contains() {
  file=$1
  pattern=$2
  message=$3

  if ! grep -Fq "$pattern" "$file"; then
    printf 'FAIL: %s\n' "$message"
    fail=1
  fi
}

check_not_contains() {
  file=$1
  pattern=$2
  message=$3

  if grep -Fq "$pattern" "$file"; then
    printf 'FAIL: %s\n' "$message"
    fail=1
  fi
}

preview_workflow=.github/workflows/pr-preview.yml
prepare_workflow=.github/workflows/pr-preview-prepare.yml
deploy_workflow=.github/workflows/deploy.yml
ci_workflow=.github/workflows/ci.yml
codeql_workflow=.github/workflows/codeql.yml

check_contains "$preview_workflow" 'actions: read' \
  'pr-preview.yml must grant actions: read to fetch artifacts from the prepare run.'
check_contains "$preview_workflow" 'uses: actions/download-artifact@v4' \
  'pr-preview.yml must download the prepared site artifact in the deploy workflow.'
check_contains "$preview_workflow" 'uses: actions/upload-pages-artifact@v3' \
  'pr-preview.yml must upload a Pages artifact in the deploy workflow before deploy-pages runs.'
check_contains "$preview_workflow" 'if: false' \
  'pr-preview.yml deploy job must stay disabled to avoid overwriting production Pages.'
check_not_contains "$preview_workflow" 'uses: actions/deploy-pages@v4' \
  'pr-preview.yml must not deploy via deploy-pages because GitHub Pages supports one live deployment.'
check_not_contains "$preview_workflow" 'artifact_url:' \
  'pr-preview.yml must not pass unsupported artifact_url input to actions/deploy-pages.'

check_contains "$prepare_workflow" 'uses: actions/upload-artifact@v4' \
  'pr-preview-prepare.yml must upload a regular cross-workflow artifact.'
check_contains "$prepare_workflow" 'name: pr-preview-site' \
  'pr-preview-prepare.yml must name the preview artifact consistently.'
check_not_contains "$prepare_workflow" 'uses: actions/upload-pages-artifact@v3' \
  'pr-preview-prepare.yml must not upload a Pages artifact directly because deploy-pages runs in a later workflow.'

check_contains "$deploy_workflow" 'workflow_dispatch:' \
  'deploy.yml must support manual production deployments via workflow_dispatch.'
check_contains "$deploy_workflow" "__CACHE_VERSION__" \
  'deploy.yml must stamp the explicit service worker cache version placeholder.'
check_contains "$deploy_workflow" 'SUPABASE_URL' \
  'deploy.yml must read SUPABASE_URL from repository variables.'
check_contains "$deploy_workflow" 'SUPABASE_PUBLISHABLE_KEY' \
  'deploy.yml must read SUPABASE_PUBLISHABLE_KEY from repository variables.'
check_contains "$deploy_workflow" 'SUPABASE_ANON_KEY' \
  'deploy.yml must support SUPABASE_ANON_KEY as a publishable key fallback.'
check_contains "$deploy_workflow" 'secrets.SUPABASE_URL' \
  'deploy.yml must support SUPABASE_URL from secrets as a fallback.'
check_contains "$deploy_workflow" 'secrets.SUPABASE_PUBLISHABLE_KEY' \
  'deploy.yml must support SUPABASE_PUBLISHABLE_KEY from secrets as a fallback.'
check_contains "$deploy_workflow" "writeFileSync('config.js'" \
  'deploy.yml must generate config.js in the deploy artifact.'
check_contains "sw.js" "__CACHE_VERSION__" \
  'sw.js must define an explicit cache version placeholder for deploy stamping.'
check_contains "$ci_workflow" 'sh scripts/validate-static-site.sh' \
  'ci.yml must validate the renamed site metadata.'
check_contains "$codeql_workflow" 'github/codeql-action/init@v4' \
  'codeql.yml must initialise the CodeQL action.'

if [ "$fail" -ne 0 ]; then
  exit 1
fi

printf 'Workflow validation passed.\n'
