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

check_not_contains() {
  file=$1
  pattern=$2
  message=$3

  if grep -Fq "$pattern" "$file"; then
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

check_script_order() {
  file=$1
  first=$2
  second=$3
  message=$4

  first_line=$(grep -nF "$first" "$file" | head -n 1 | cut -d: -f1 || true)
  second_line=$(grep -nF "$second" "$file" | head -n 1 | cut -d: -f1 || true)

  if [ -z "$first_line" ] || [ -z "$second_line" ] || [ "$first_line" -ge "$second_line" ]; then
    printf 'FAIL: %s\n' "$message"
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
check_contains index.html '<script src="config.js"></script>' \
  "index.html must load config.js."
check_script_order index.html '<script src="config.js"></script>' '<script src="app.js"></script>' \
  "index.html must load config.js before app.js."
check_contains index.html "updateViaCache: 'none'" \
  "index.html must register the service worker with updateViaCache disabled."
check_not_contains index.html 'id="btn-settings-backoffice"' \
  "index.html must not expose the back-office setup button."
check_not_contains index.html 'data-page="backoffice"' \
  "index.html must not ship the back-office page."
check_not_contains app.js 'backoffice' \
  "app.js must not retain the removed back-office flow."
check_not_contains styles.css 'data-page="backoffice"' \
  "styles.css must not retain selectors for the removed back-office page."
check_contains app.js "addListener(" \
  "app.js must keep a MediaQueryList listener fallback for Safari compatibility."
check_contains sw.js "request.mode === 'navigate'" \
  "sw.js must treat navigation requests as part of the app shell."
check_contains sw.js "fetch(request)" \
  "sw.js must attempt a network fetch before falling back to cache for shell requests."
check_contains sw.js "scopeUrl('config.js')" \
  "sw.js must cache config.js as part of the offline app shell."

for page in $(sed -n 's/.*data-page="\([^"]*\)".*/\1/p' index.html | sort -u); do
  selector="#app[data-page=\"${page}\"] .page[data-page=\"${page}\"]"
  if ! grep -Fq "$selector" styles.css; then
    printf 'FAIL: styles.css must expose the "%s" page when it becomes active.\n' "$page"
    fail=1
  fi
done

for file in config.js index.html app.js styles.css manifest.json sw.js icon-192.png icon-512.png; do
  check_file "$file"
done

if [ "$fail" -ne 0 ]; then
  exit 1
fi

printf 'Static site validation passed.\n'
