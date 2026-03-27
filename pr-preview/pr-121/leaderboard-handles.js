(function (global) {
  'use strict';

  const HANDLE_SUFFIX_PATTERN = /#\d{4}$/;
  const LOCAL_NAME_PATTERN = /[^A-Za-z0-9 ._'-]+/g;

  function collapseWhitespace(value) {
    return String(value || '').trim().replace(/\s+/g, ' ');
  }

  function hasClaimedLeaderboardHandle(value) {
    return HANDLE_SUFFIX_PATTERN.test(collapseWhitespace(value));
  }

  function extractLeaderboardNameBase(value) {
    return collapseWhitespace(value).replace(HANDLE_SUFFIX_PATTERN, '').trim() || 'Guest';
  }

  function normaliseRequestedLeaderboardName(value) {
    const collapsed = collapseWhitespace(value);
    return collapsed.replace(LOCAL_NAME_PATTERN, '').trim().slice(0, 18);
  }

  function sanitiseLocalLeaderboardName(value) {
    const safe = normaliseRequestedLeaderboardName(value);
    return safe.slice(0, 18) || 'Guest';
  }

  global.LeaderboardHandles = {
    extractLeaderboardNameBase,
    hasClaimedLeaderboardHandle,
    normaliseRequestedLeaderboardName,
    sanitiseLocalLeaderboardName,
  };
}(globalThis));
