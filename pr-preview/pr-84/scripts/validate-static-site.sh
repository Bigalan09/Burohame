#!/bin/sh

set -eu

fail=0

repo=$(git remote get-url origin | sed -E 's#(git@github.com:|https://github.com/)##; s#\.git$##')
owner=${repo%/*}
name=${repo#*/}
pages_owner=$(printf '%s' "$owner" | tr '[:upper:]' '[:lower:]')
pages_url="https://${pages_owner}.github.io/${name}/"
repo_url="https://github.com/${repo}"

check_contains() {
  file=$1
  pattern=$2
  message=$3

  if ! grep -Fq "$pattern" "$file"; then
    printf 'FAIL: %s\n' "$message"
    fail=1
  fi
}

check_file() {
  file=$1

  if [ ! -f "$file" ]; then
    printf 'FAIL: expected file %s to exist.\n' "$file"
    fail=1
  fi
}

check_contains README.md "$pages_url" \
  "README.md must point at the current GitHub Pages URL."
check_contains README.md "$repo_url" \
  "README.md must point at the current GitHub repository."
check_contains index.html "$repo_url" \
  "index.html must link to the current GitHub repository."
check_contains manifest.json "\"start_url\": \"/${name}/\"" \
  "manifest.json must use the current repository Pages path as start_url."

for file in index.html app.js styles.css manifest.json sw.js icon-192.png icon-512.png; do
  check_file "$file"
done

if [ "$fail" -ne 0 ]; then
  exit 1
fi

printf 'Static site validation passed.\n'
