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
check_contains "$ci_workflow" 'sh scripts/validate-static-site.sh' \
  'ci.yml must validate the renamed site metadata.'
check_contains "$codeql_workflow" 'github/codeql-action/init@v4' \
  'codeql.yml must initialise the CodeQL action.'

if [ "$fail" -ne 0 ]; then
  exit 1
fi

printf 'Workflow validation passed.\n'
