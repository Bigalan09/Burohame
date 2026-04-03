#!/usr/bin/env node

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const source = fs.readFileSync(path.resolve('leaderboard-handles.js'), 'utf8');
const context = {
  globalThis: {},
};
vm.createContext(context);
vm.runInContext(source, context);

const {
  extractLeaderboardNameBase,
  hasClaimedLeaderboardHandle,
  normaliseRequestedLeaderboardName,
  sanitiseLocalLeaderboardName,
} = context.globalThis.LeaderboardHandles;

assert.equal(hasClaimedLeaderboardHandle('alan#4821'), true);
assert.equal(hasClaimedLeaderboardHandle('alan'), false);

assert.equal(extractLeaderboardNameBase('alan#4821'), 'alan');
assert.equal(extractLeaderboardNameBase('Guest'), 'Guest');

assert.equal(normaliseRequestedLeaderboardName('  Alan   Smith  '), 'Alan Smith');
assert.equal(normaliseRequestedLeaderboardName(''), '');
assert.equal(normaliseRequestedLeaderboardName('@@@@@@@@@@@@'), '');

assert.equal(sanitiseLocalLeaderboardName('  Alan   Smith  '), 'Alan Smith');
assert.equal(sanitiseLocalLeaderboardName(''), 'Guest');
assert.equal(sanitiseLocalLeaderboardName('@@@@@@@@@@@@'), 'Guest');
assert.equal(sanitiseLocalLeaderboardName("  O'Neil  "), "O'Neil");

console.log('Leaderboard handle helper tests passed.');
