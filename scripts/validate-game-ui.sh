#!/bin/sh

set -eu

fail=0

check_contains() {
  file=$1
  pattern=$2
  message=$3

  if ! grep -Fq -- "$pattern" "$file"; then
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

check_file index.html
check_file styles.css
check_file app.js

check_contains index.html 'data-ui="status-strip"' \
  'index.html must expose a dedicated status strip hook.'
check_contains index.html 'data-ui="rack-stage"' \
  'index.html must expose a dedicated rack stage hook.'
check_contains index.html 'Coach' \
  'index.html must label the coaching panel clearly.'
check_contains index.html 'Tune the run' \
  'index.html must give the settings overlay stronger production copy.'

check_contains styles.css '--surface-0:' \
  'styles.css must define the upgraded surface token set.'
check_contains styles.css '--ease-out-quart:' \
  'styles.css must define the upgraded motion easing tokens.'
check_contains styles.css '@media (prefers-reduced-motion: reduce)' \
  'styles.css must provide reduced-motion handling.'
check_contains styles.css '.slot.unplayable' \
  'styles.css must define a stronger unplayable piece state.'

check_contains app.js 'function updateCoachState()' \
  'app.js must provide a coach-state update hook.'
check_contains app.js 'function updateRackNote()' \
  'app.js must provide a rack-note update hook.'
check_contains app.js 'function setDragState(' \
  'app.js must provide a drag-state hook for the upgraded UI.'

if [ "$fail" -ne 0 ]; then
  exit 1
fi

printf 'Game UI validation passed.\n'
