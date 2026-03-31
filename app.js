'use strict';

/* ==========================================================
   BLOCKUDOKU TRAINER  –  app.js
   ========================================================== */

// ── Piece definitions ──────────────────────────────────────
// Each entry is an array of [row, col] offsets.
// All pieces normalised: minRow = 0, minCol = 0.

// Extended set – all 51 canonical pieces (current full set)
const PIECE_DEFS_EXTENDED = [
  // 1-cell
  [[0,0]],
  // Dominoes
  [[0,0],[0,1]],
  [[0,0],[1,0]],
  // Diagonal dominoes (2-block diagonal)
  [[0,0],[1,1]],
  [[0,1],[1,0]],
  // Straight trominoes
  [[0,0],[0,1],[0,2]],
  [[0,0],[1,0],[2,0]],
  // Diagonal trominoes (3-block diagonal)
  [[0,0],[1,1],[2,2]],
  [[0,2],[1,1],[2,0]],
  // Corner trominoes (2 canonical forms)
  [[0,0],[0,1],[1,0]],
  [[0,0],[1,0],[1,1]],
  // 2×2 square
  [[0,0],[0,1],[1,0],[1,1]],
  // Straight tetrominoes
  [[0,0],[0,1],[0,2],[0,3]],
  [[0,0],[1,0],[2,0],[3,0]],
  // L-tetromino
  [[0,0],[1,0],[2,0],[2,1]],
  // Extended corner (wide L in 2×3)
  [[0,0],[0,1],[0,2],[1,0]],
  // T-tetromino
  [[0,0],[0,1],[0,2],[1,1]],
  // S-tetromino (horizontal)
  [[0,1],[0,2],[1,0],[1,1]],
  // Step corner (vertical S)
  [[0,0],[1,0],[1,1],[2,1]],
  // Z-tetromino
  [[0,0],[0,1],[1,1],[1,2]],
  // Straight pentominoes
  [[0,0],[0,1],[0,2],[0,3],[0,4]],
  [[0,0],[1,0],[2,0],[3,0],[4,0]],

  // ── 5-cell shapes ──────────────────────────────────────
  // Plus / X-pentomino (rotationally symmetric)
  [[0,1],[1,0],[1,1],[1,2],[2,1]],
  // T-pentomino (4 orientations)
  [[0,0],[0,1],[0,2],[1,1],[2,1]],
  [[0,2],[1,0],[1,1],[1,2],[2,2]],
  [[0,1],[1,1],[2,0],[2,1],[2,2]],
  [[0,0],[1,0],[1,1],[1,2],[2,0]],
  // V-pentomino / large corner (4 orientations)
  [[0,0],[1,0],[2,0],[2,1],[2,2]],
  [[0,0],[0,1],[0,2],[1,0],[2,0]],
  [[0,0],[0,1],[0,2],[1,2],[2,2]],
  [[0,2],[1,2],[2,0],[2,1],[2,2]],
  // L-pentomino (4 orientations)
  [[0,0],[1,0],[2,0],[3,0],[3,1]],
  [[0,0],[0,1],[0,2],[0,3],[1,0]],
  [[0,0],[0,1],[1,1],[2,1],[3,1]],
  [[0,3],[1,0],[1,1],[1,2],[1,3]],
  // J-pentomino (4 orientations)
  [[0,1],[1,1],[2,1],[3,0],[3,1]],
  [[0,0],[1,0],[1,1],[1,2],[1,3]],
  [[0,0],[0,1],[1,0],[2,0],[3,0]],
  [[0,0],[0,1],[0,2],[0,3],[1,3]],
  // U-pentomino (4 orientations)
  [[0,0],[0,2],[1,0],[1,1],[1,2]],
  [[0,0],[0,1],[1,0],[2,0],[2,1]],
  [[0,0],[0,1],[0,2],[1,0],[1,2]],
  [[0,0],[0,1],[1,1],[2,0],[2,1]],
  // W-pentomino / staircase (4 orientations)
  [[0,0],[1,0],[1,1],[2,1],[2,2]],
  [[0,1],[0,2],[1,0],[1,1],[2,0]],
  [[0,0],[0,1],[1,1],[1,2],[2,2]],
  [[0,2],[1,1],[1,2],[2,0],[2,1]],
  // P-pentomino (2×2 plus one extension)
  [[0,0],[0,1],[1,0],[1,1],[2,0]],
  // F-pentomino (offset cross form)
  [[0,1],[0,2],[1,0],[1,1],[2,1]],
  // Z5-pentomino (5-block zigzag)
  [[0,0],[0,1],[1,1],[2,1],[2,2]],
  // S5-pentomino (5-block mirror of Z)
  [[0,1],[0,2],[1,1],[2,0],[2,1]],
];

// Standard set – matches original Blockudoku shapes (no complex V/W/P/F/Z5/S5 pentominoes)
// Explicitly defined (not filtered by index) for maintainability
const PIECE_DEFS_STANDARD = [
  // 1-cell
  [[0,0]],
  // Dominoes
  [[0,0],[0,1]],
  [[0,0],[1,0]],
  // Diagonal dominoes (2-block diagonal)
  [[0,0],[1,1]],
  [[0,1],[1,0]],
  // Straight trominoes
  [[0,0],[0,1],[0,2]],
  [[0,0],[1,0],[2,0]],
  // Diagonal trominoes (3-block diagonal)
  [[0,0],[1,1],[2,2]],
  [[0,2],[1,1],[2,0]],
  // Corner trominoes (2 canonical forms)
  [[0,0],[0,1],[1,0]],
  [[0,0],[1,0],[1,1]],
  // 2×2 square
  [[0,0],[0,1],[1,0],[1,1]],
  // Straight tetrominoes
  [[0,0],[0,1],[0,2],[0,3]],
  [[0,0],[1,0],[2,0],[3,0]],
  // L-tetromino
  [[0,0],[1,0],[2,0],[2,1]],
  // Extended corner (wide L in 2×3)
  [[0,0],[0,1],[0,2],[1,0]],
  // T-tetromino
  [[0,0],[0,1],[0,2],[1,1]],
  // S-tetromino (horizontal)
  [[0,1],[0,2],[1,0],[1,1]],
  // Step corner (vertical S)
  [[0,0],[1,0],[1,1],[2,1]],
  // Z-tetromino
  [[0,0],[0,1],[1,1],[1,2]],
  // Straight pentominoes
  [[0,0],[0,1],[0,2],[0,3],[0,4]],
  [[0,0],[1,0],[2,0],[3,0],[4,0]],
  // Plus / X-pentomino
  [[0,1],[1,0],[1,1],[1,2],[2,1]],
  // T-pentomino (4 orientations)
  [[0,0],[0,1],[0,2],[1,1],[2,1]],
  [[0,2],[1,0],[1,1],[1,2],[2,2]],
  [[0,1],[1,1],[2,0],[2,1],[2,2]],
  [[0,0],[1,0],[1,1],[1,2],[2,0]],
  // V-pentomino / large corner (4 orientations)
  [[0,0],[1,0],[2,0],[2,1],[2,2]],
  [[0,0],[0,1],[0,2],[1,0],[2,0]],
  [[0,0],[0,1],[0,2],[1,2],[2,2]],
  [[0,2],[1,2],[2,0],[2,1],[2,2]],
  // U-pentomino (4 orientations)
  [[0,0],[0,2],[1,0],[1,1],[1,2]],
  [[0,0],[0,1],[1,0],[2,0],[2,1]],
  [[0,0],[0,1],[0,2],[1,0],[1,2]],
  [[0,0],[0,1],[1,1],[2,0],[2,1]],
];

// Keep PIECE_DEFS as an alias so other helpers can reference the active set
let PIECE_DEFS = PIECE_DEFS_STANDARD;

const N = 9;

// ── Animation durations (ms) – keep in sync with styles.css ──
const ANIM_SLOT_SHRINK   = 200;   // matches slotShrink 0.2s
const ANIM_CLEAR         = 380;   // matches clearFlash 0.38s
const ANIM_CLEAR_STAGGER = 120;   // max ripple stagger offset
const ANIM_NO_SPACE_IN   = 700;   // "no more space" fade-in
const ANIM_NO_SPACE_HOLD = 1500;  // "no more space" hold time
const ANIM_NO_SPACE_OUT  = 800;   // "no more space" fade-out

// ── State ─────────────────────────────────────────────────
let board   = [];   // N×N of 0/1
let pieces  = [];   // current rack piece-cell-arrays
let used    = [];   // [bool …] – which slots are placed
let score   = 0;
let bestScore = 0;
let todayScore = 0;
let combo   = 0;
let gameOver = false;
let trainingMode = false;
let extendedPieces = false;
let darkMode     = false;
let colorSetting = 'orange';   // 'orange','blue','green','purple','red','teal','pink','random'
let rackSize     = 3;          // number of pieces shown in the rack (1–3)
let progressionState = null;
let runSummary = null;
let currentPage = 'dashboard';
let currentSessionType = 'standard';
let gameBannerQueue = [];
let activeGameBanner = null;
let gameBannerTimer = 0;
let gameBannerTransitionTimer = 0;
let gameBannerMode = 'idle';
let dailyChallengeState = {
  date: '',
  seed: 0,
  targetScore: 0,
  randomState: 0,
  lockedCells: [],
  isHistorical: false,
};
let dailyLockedCellsByKey = new Map();
let selectedDailyChallengeDateKey = '';
let lastGameOverReason = 'blocked';
let leaderboardPlayerName = '';
let leaderboardPlayerId = '';
let leaderboardLastPodiumNotifiedWeekId = '';
let weeklyLeaderboardRuntimeConfig = createDefaultWeeklyLeaderboardRuntimeConfig();
let progressionResetDate = '';
let weeklyLeaderboardHostedAdapter = null;
let coachModeHostedAdapter = null;
let coachModeAccessState = {
  authorised: false,
  expiresAt: 0,
};
let coachModeAccessExpiryTimer = 0;
let weeklyLeaderboardPollTimer = 0;
let weeklyLeaderboardViewState = {
  weekId: '',
  entries: [],
  loading: false,
  error: '',
  sourceLabel: 'Global weekly table',
  currentPlayerRank: 0,
  fetchedAt: 0,
  hidden: true,
};
let previousWeeklyLeaderboardViewState = {
  weekId: '',
  entries: [],
  loading: false,
  error: '',
  sourceLabel: 'Global weekly table',
  currentPlayerRank: 0,
  fetchedAt: 0,
  hidden: true,
};

const COLOR_NAMES = ['orange', 'blue', 'green', 'purple', 'red', 'teal', 'pink', 'gold', 'indigo', 'mint', 'coral', 'slate', 'violet'];
const PROGRESSION_STORAGE_KEY = 'bst-progression';
const GAME_SESSION_STORAGE_KEY = 'bst-current-run';
const PROGRESSION_RESET_APPLIED_STORAGE_KEY = 'burohame-progression-reset-applied';
const PROGRESSION_STATE_VERSION = 10;
const PROGRESSION_RESET_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const DAILY_CHALLENGE_REWARD_BASE = 12;
const DAILY_CHALLENGE_STREAK_STEP = 2;
const DAILY_CHALLENGE_STREAK_BONUS_CAP = 10;
const GAME_BANNER_DISPLAY_MS = 2000;
const GAME_BANNER_TRANSITION_MS = 320;
const SHOP_PRICE_MULTIPLIER = 1.946;
const COIN_EARNING_BOOST_MULTIPLIER = 1.125;
const COIN_REWARD_MULTIPLIERS = Object.freeze({
  run: 0.52,
  challenge: 0.69,
  mission: 0.52,
  quest: 0.58,
  weekly: 0.52,
});
const DAILY_MISSION_VERSION = 3;
const DAILY_CHALLENGE_TARGET_MIN = 350;
const DAILY_CHALLENGE_TARGET_RANGE = 61;
const DAILY_CHALLENGE_LOCKED_BLOCK_COUNT_MIN = 4;
const DAILY_CHALLENGE_LOCKED_BLOCK_COUNT_RANGE = 6;
const DAILY_CHALLENGE_ARCHIVE_DAYS = 7;
const DAILY_CHALLENGE_PAST_REWARD_MULTIPLIER = 0.25;
const ONE_MORE_RUN_RAPID_RETRY_WINDOW_MS = 4 * 60 * 1000;
const ONE_MORE_RUN_RAPID_RETRY_LIMIT = 2;
const WEEKLY_LADDER_COUNTED_RUNS = 4;
const WEEKLY_COHORT_SIZE = 20;
const WEEKLY_PROMOTION_SLOTS = 4;
const WEEKLY_RELEGATION_SLOTS = 4;
const WEEKLY_LEADERBOARD_PULL_INTERVAL_MS = 60 * 1000;
const WEEKLY_LEADERBOARD_MAX_ROWS = 20;
const COACH_AUTH_SESSION_STORAGE_KEY = 'bst-coach-auth-session';
const COACH_MODE_AUTH_SESSION_MS = 8 * 60 * 60 * 1000;
const QUEST_BOARD_CHAIN_LIMIT = 3;
const COIN_REWARDS = Object.freeze({
  clearRegion: 0,
  multiClearBonus: 0,
  comboStep: 0,
  roundMilestoneEvery: 10,
  roundMilestoneReward: 8,
  endRunBase: 8,
  endRunPer50Score: 1,
  endRunScoreBandCap: 10,
  personalBestBonus: 10,
});
const LEGACY_LEADERBOARD_NAME = 'Guest';
const LEADERBOARD_FALLBACK_ANIMALS = Object.freeze([
  'Otter', 'Badger', 'Fox', 'Hedgehog', 'Robin', 'Falcon', 'Puffin', 'Lynx',
  'Wolf', 'Dolphin', 'Koala', 'Panda', 'Tiger', 'Leopard', 'Panther', 'Jaguar',
  'Giraffe', 'Zebra', 'Bison', 'Moose', 'Seal', 'Penguin', 'Turtle', 'Parrot',
  'Raven', 'Cobra', 'Viper', 'Gecko', 'Salmon', 'Manta',
]);
const DEFAULT_LEADERBOARD_NAME = LEADERBOARD_FALLBACK_ANIMALS[
  Math.floor(Math.random() * LEADERBOARD_FALLBACK_ANIMALS.length)
];
const GLOBAL_WEEKLY_TABLE_LABEL = 'Global weekly table';
const LEADERBOARD_HANDLE_VALIDATION_PREFIXES = Object.freeze([
  'Leaderboard names must',
  'That leaderboard name is reserved',
  'That leaderboard name is not allowed',
  'That leaderboard name is full',
]);
const SIX_DIGIT_PIN_PATTERN = /^\d{6}$/;

const leaderboardHandleHelpers = globalThis.LeaderboardHandles || {};
const extractLeaderboardNameBase =
  typeof leaderboardHandleHelpers.extractLeaderboardNameBase === 'function'
    ? leaderboardHandleHelpers.extractLeaderboardNameBase
    : (value) => String(value || DEFAULT_LEADERBOARD_NAME).trim() || DEFAULT_LEADERBOARD_NAME;
const hasClaimedLeaderboardHandle =
  typeof leaderboardHandleHelpers.hasClaimedLeaderboardHandle === 'function'
    ? leaderboardHandleHelpers.hasClaimedLeaderboardHandle
    : (value) => /#\d{4}$/.test(String(value || '').trim());
const normaliseRequestedLeaderboardName =
  typeof leaderboardHandleHelpers.normaliseRequestedLeaderboardName === 'function'
    ? leaderboardHandleHelpers.normaliseRequestedLeaderboardName
    : (value) => String(value || '').trim().replace(/\s+/g, ' ').replace(/[^A-Za-z0-9 ._'-]+/g, '').slice(0, 18);
const sanitiseLocalLeaderboardName =
  typeof leaderboardHandleHelpers.sanitiseLocalLeaderboardName === 'function'
    ? leaderboardHandleHelpers.sanitiseLocalLeaderboardName
    : (value) => normaliseRequestedLeaderboardName(value) || DEFAULT_LEADERBOARD_NAME;

function scaleShopPrice(amount) {
  if (!amount) return 0;
  return Math.max(0, Math.round(amount * SHOP_PRICE_MULTIPLIER));
}

function scaleCoinReward(amount, source = 'run') {
  if (!amount) return 0;
  const multiplier = COIN_REWARD_MULTIPLIERS[source] ?? COIN_REWARD_MULTIPLIERS.run;
  return Math.max(1, Math.round(amount * multiplier * COIN_EARNING_BOOST_MULTIPLIER));
}

const DAILY_MISSION_TEMPLATES = Object.freeze([
  {
    templateId: 'score-120',
    kind: 'score',
    goal: 120,
    reward: scaleCoinReward(18, 'mission'),
    title: 'Point collector',
    description: 'Score 120 points across today’s runs.',
  },
  {
    templateId: 'blocks-30',
    kind: 'blocks',
    goal: 30,
    reward: scaleCoinReward(14, 'mission'),
    title: 'Builder’s rhythm',
    description: 'Place 30 blocks today.',
  },
  {
    templateId: 'regions-8',
    kind: 'regions',
    goal: 8,
    reward: scaleCoinReward(16, 'mission'),
    title: 'Board cleaner',
    description: 'Clear 8 regions today.',
  },
  {
    templateId: 'racks-4',
    kind: 'racks',
    goal: 4,
    reward: scaleCoinReward(12, 'mission'),
    title: 'Rack runner',
    description: 'Finish 4 full racks today.',
  },
  {
    templateId: 'combo-4',
    kind: 'combo',
    goal: 4,
    reward: scaleCoinReward(20, 'mission'),
    title: 'Heat check',
    description: 'Reach a 4× combo in a run today.',
  },
  {
    templateId: 'runs-3',
    kind: 'runs',
    goal: 3,
    reward: scaleCoinReward(10, 'mission'),
    title: 'Keep going',
    description: 'Complete 3 runs today.',
  },
]);

const QUEST_CHAIN_TEMPLATES = Object.freeze([
  {
    chainId: 'score-ladder',
    kicker: 'Score improvement chain',
    title: 'Score ladder',
    description: 'Raise your scoring floor with steadier, cleaner runs.',
    summary: 'Build from a tidy warm-up into a proper breakthrough score.',
    finalReward: {
      coins: scaleCoinReward(32, 'quest'),
      unlockHint: 'Bonus colourway or finish if your collection still has a locked piece.',
      grantsUnlock: true,
    },
    steps: [
      {
        stepId: 'score-ladder-1',
        title: 'Warm opening',
        description: 'Score 90 points in a single run.',
        metric: 'singleRunScore',
        goal: 90,
        mode: 'max',
        reward: scaleCoinReward(6, 'quest'),
      },
      {
        stepId: 'score-ladder-2',
        title: 'Hold the pace',
        description: 'Score 180 points across quest runs.',
        metric: 'totalScore',
        goal: 180,
        mode: 'cumulative',
        reward: scaleCoinReward(8, 'quest'),
      },
      {
        stepId: 'score-ladder-3',
        title: 'Break through',
        description: 'Score 150 points in a single run.',
        metric: 'singleRunScore',
        goal: 150,
        mode: 'max',
        reward: scaleCoinReward(10, 'quest'),
      },
    ],
  },
  {
    chainId: 'combo-mastery',
    kicker: 'Combo mastery chain',
    title: 'Combo mastery',
    description: 'Learn to stack clears so the board opens up instead of closing in.',
    summary: 'From small links to proper chain-building.',
    finalReward: {
      coins: scaleCoinReward(34, 'quest'),
      unlockHint: 'Bonus colourway or finish if one is still locked.',
      grantsUnlock: false,
    },
    steps: [
      {
        stepId: 'combo-mastery-1',
        title: 'Link two clears',
        description: 'Reach a 2× combo in one run.',
        metric: 'maxCombo',
        goal: 2,
        mode: 'max',
        reward: scaleCoinReward(6, 'quest'),
      },
      {
        stepId: 'combo-mastery-2',
        title: 'Stay composed',
        description: 'Clear 6 regions across quest runs.',
        metric: 'regionsCleared',
        goal: 6,
        mode: 'cumulative',
        reward: scaleCoinReward(8, 'quest'),
      },
      {
        stepId: 'combo-mastery-3',
        title: 'Find the chain',
        description: 'Reach a 4× combo in one run.',
        metric: 'maxCombo',
        goal: 4,
        mode: 'max',
        reward: scaleCoinReward(10, 'quest'),
      },
    ],
  },
  {
    chainId: 'board-sweep',
    kicker: 'Region-clearing chain',
    title: 'Board sweep',
    description: 'Make room methodically by clearing lines and boxes in the same run.',
    summary: 'Turn scattered space into a board that breathes again.',
    finalReward: {
      coins: scaleCoinReward(30, 'quest'),
      unlockHint: 'Large coin payout for cleaner board work.',
      grantsUnlock: false,
    },
    steps: [
      {
        stepId: 'board-sweep-1',
        title: 'Open the board',
        description: 'Clear 4 regions across quest runs.',
        metric: 'regionsCleared',
        goal: 4,
        mode: 'cumulative',
        reward: scaleCoinReward(6, 'quest'),
      },
      {
        stepId: 'board-sweep-2',
        title: 'Double clear',
        description: 'Clear 2 regions at once in a single move.',
        metric: 'biggestClear',
        goal: 2,
        mode: 'max',
        reward: scaleCoinReward(8, 'quest'),
      },
      {
        stepId: 'board-sweep-3',
        title: 'Keep it tidy',
        description: 'Clear 9 regions across quest runs.',
        metric: 'regionsCleared',
        goal: 9,
        mode: 'cumulative',
        reward: scaleCoinReward(10, 'quest'),
      },
    ],
  },
  {
    chainId: 'coach-apprentice',
    kicker: 'Coach Mode learning chain',
    title: 'Coach apprentice',
    description: 'Use Coach Mode to learn healthier setups and calmer scoring lines.',
    summary: 'A guided chain that rewards better habits, not raw grind.',
    finalReward: {
      coins: scaleCoinReward(28, 'quest'),
      unlockHint: 'Finishing this lesson can also unlock a cosmetic if one is still waiting.',
      grantsUnlock: true,
    },
    steps: [
      {
        stepId: 'coach-apprentice-1',
        title: 'Check the board',
        description: 'Finish 1 run with Coach Mode on.',
        metric: 'coachRuns',
        goal: 1,
        mode: 'cumulative',
        reward: scaleCoinReward(6, 'quest'),
      },
      {
        stepId: 'coach-apprentice-2',
        title: 'Use the guidance',
        description: 'Clear 4 regions with Coach Mode across quest runs.',
        metric: 'coachRegions',
        goal: 4,
        mode: 'cumulative',
        reward: scaleCoinReward(8, 'quest'),
      },
      {
        stepId: 'coach-apprentice-3',
        title: 'Read the flow',
        description: 'Reach a 3× combo in a Coach Mode run.',
        metric: 'coachMaxCombo',
        goal: 3,
        mode: 'max',
        reward: scaleCoinReward(10, 'quest'),
      },
    ],
  },
]);
const QUEST_CHAIN_LOOKUP = Object.freeze(
  QUEST_CHAIN_TEMPLATES.reduce((acc, chain) => {
    acc[chain.chainId] = chain;
    return acc;
  }, {})
);

const WEEKLY_LEAGUES = Object.freeze([
  {
    id: 'bronze',
    name: 'Bronze',
    badge: '🥉',
    tier: 0,
    previewCoins: scaleCoinReward(18, 'weekly'),
    holdCoins: scaleCoinReward(16, 'weekly'),
    promotionCoins: scaleCoinReward(28, 'weekly'),
    relegationCoins: scaleCoinReward(12, 'weekly'),
    scoreRange: [280, 620],
  },
  {
    id: 'silver',
    name: 'Silver',
    badge: '🥈',
    tier: 1,
    previewCoins: scaleCoinReward(24, 'weekly'),
    holdCoins: scaleCoinReward(20, 'weekly'),
    promotionCoins: scaleCoinReward(34, 'weekly'),
    relegationCoins: scaleCoinReward(14, 'weekly'),
    scoreRange: [420, 800],
  },
  {
    id: 'gold',
    name: 'Gold',
    badge: '🥇',
    tier: 2,
    previewCoins: scaleCoinReward(30, 'weekly'),
    holdCoins: scaleCoinReward(24, 'weekly'),
    promotionCoins: scaleCoinReward(42, 'weekly'),
    relegationCoins: scaleCoinReward(16, 'weekly'),
    scoreRange: [560, 980],
  },
  {
    id: 'diamond',
    name: 'Diamond',
    badge: '💎',
    tier: 3,
    previewCoins: scaleCoinReward(36, 'weekly'),
    holdCoins: scaleCoinReward(30, 'weekly'),
    promotionCoins: scaleCoinReward(48, 'weekly'),
    relegationCoins: scaleCoinReward(18, 'weekly'),
    scoreRange: [720, 1180],
  },
]);
const WEEKLY_LEAGUE_LOOKUP = Object.freeze(
  WEEKLY_LEAGUES.reduce((acc, league) => {
    acc[league.id] = league;
    return acc;
  }, {})
);

const COLORWAY_CATALOGUE = Object.freeze([
  {
    id: 'orange',
    name: 'Orange Glow',
    description: 'The original warm arcade tone.',
    price: 0,
    icon: '🟠',
    swatches: ['#ffd08a', '#ff9500', '#e07800'],
  },
  {
    id: 'blue',
    name: 'Blue Tide',
    description: 'Cool focus with a crisp electric edge.',
    price: scaleShopPrice(35),
    icon: '🔵',
    swatches: ['#9fd3ff', '#007aff', '#005ec4'],
  },
  {
    id: 'green',
    name: 'Green Grove',
    description: 'A calmer board feel with fresh contrast.',
    price: scaleShopPrice(35),
    icon: '🟢',
    swatches: ['#a7efbc', '#34c759', '#248a3d'],
  },
  {
    id: 'purple',
    name: 'Purple Pulse',
    description: 'A richer palette for streak-chasing sessions.',
    price: scaleShopPrice(45),
    icon: '🟣',
    swatches: ['#d6aef2', '#af52de', '#8944ab'],
  },
  {
    id: 'red',
    name: 'Red Rally',
    description: 'A bolder tone when you want a sharper board.',
    price: scaleShopPrice(45),
    icon: '🔴',
    swatches: ['#ff9b94', '#ff3b30', '#d4264a'],
  },
  {
    id: 'teal',
    name: 'Teal Drift',
    description: 'Bright sea-glass highlights with softer depth.',
    price: scaleShopPrice(55),
    icon: '💎',
    swatches: ['#b8efff', '#5ac8fa', '#3aabd6'],
  },
  {
    id: 'pink',
    name: 'Pink Pop',
    description: 'Playful contrast without losing clarity.',
    price: scaleShopPrice(55),
    icon: '💗',
    swatches: ['#ffb1c3', '#ff2d55', '#d4264a'],
  },
  {
    id: 'random',
    name: 'Shuffle Glow',
    description: 'Swap to a fresh unlocked colour every rack.',
    price: 6000,
    icon: '🎲',
    swatches: ['#ffd08a', '#5ac8fa', '#af52de'],
  },
  {
    id: 'gold',
    name: 'Gold Gleam',
    description: 'Sunlit tones with warm metallic contrast.',
    price: scaleShopPrice(85),
    icon: '🟡',
    swatches: ['#fff0a8', '#f4c430', '#b8860b'],
  },
  {
    id: 'indigo',
    name: 'Indigo Night',
    description: 'A dusk-led palette for focused late sessions.',
    price: scaleShopPrice(95),
    icon: '🌌',
    swatches: ['#b7b6ff', '#5c6ac4', '#2f3a8f'],
  },
  {
    id: 'mint',
    name: 'Mint Breeze',
    description: 'Cool spring colours with gentle highlights.',
    price: scaleShopPrice(105),
    icon: '🌿',
    swatches: ['#c9ffe8', '#47d7ac', '#1e9a79'],
  },
  {
    id: 'coral',
    name: 'Coral Bloom',
    description: 'Soft sunset warmth for brighter boards.',
    price: scaleShopPrice(115),
    icon: '🪸',
    swatches: ['#ffc2b5', '#ff7f50', '#d4552d'],
  },
  {
    id: 'slate',
    name: 'Slate Flux',
    description: 'Muted steel shades with cleaner contrast.',
    price: scaleShopPrice(130),
    icon: '🪨',
    swatches: ['#c6d0e1', '#7082a8', '#41506c'],
  },
  {
    id: 'violet',
    name: 'Violet Arc',
    description: 'Neon-violet accents for bolder runs.',
    price: scaleShopPrice(145),
    icon: '✨',
    swatches: ['#e4b9ff', '#a855f7', '#6d28d9'],
  },
]);
const COLORWAY_LOOKUP = Object.freeze(
  COLORWAY_CATALOGUE.reduce((acc, colorway) => {
    acc[colorway.id] = colorway;
    return acc;
  }, {})
);
const COSMETIC_CATALOGUE = Object.freeze({
  blockSkins: [
    {
      id: 'classic',
      name: 'Classic',
      description: 'The original polished finish.',
      price: 0,
      unlockSource: 'default',
    },
    {
      id: 'satin',
      name: 'Satin',
      description: 'Soft rounded edges with a calm sheen.',
      price: scaleShopPrice(60),
      unlockSource: 'shop',
    },
    {
      id: 'carbon',
      name: 'Carbon',
      description: 'Sharper edges with a grounded board-game feel.',
      price: scaleShopPrice(110),
      unlockSource: 'shop',
    },
    {
      id: 'prism',
      name: 'Prism',
      description: 'A brighter faceted shine for high-score chasers.',
      price: scaleShopPrice(170),
      unlockSource: 'shop',
    },
    {
      id: 'velvet',
      name: 'Velvet',
      description: 'A softer matte finish with rounded edges.',
      price: scaleShopPrice(140),
      unlockSource: 'shop',
    },
    {
      id: 'frost',
      name: 'Frost',
      description: 'Cool highlights and lighter faces for clean boards.',
      price: scaleShopPrice(190),
      unlockSource: 'shop',
    },
    {
      id: 'ember',
      name: 'Ember',
      description: 'Deeper shadows and hotter highlights for tense runs.',
      price: scaleShopPrice(230),
      unlockSource: 'shop',
    },
    {
      id: 'heirloom',
      name: 'Heirloom',
      description: 'A gallery-grade finish awarded for completing the full core album.',
      price: 0,
      unlockSource: 'album',
    },
    {
      id: 'aurora',
      name: 'Aurora',
      description: 'Animated colour ribbons that drift across each tile.',
      price: 0,
      unlockSource: 'collection',
    },
    {
      id: 'starlight',
      name: 'Starlight',
      description: 'Animated starlit shimmer reserved for elite collectors.',
      price: 0,
      unlockSource: 'collection',
    },
    {
      id: 'obsidian',
      name: 'Obsidian',
      description: 'Mirror-dark faces with crisp reflective edges.',
      price: scaleShopPrice(260),
      unlockSource: 'shop',
    },
    {
      id: 'opal',
      name: 'Opal',
      description: 'Soft iridescent gradients that shift across each block.',
      price: scaleShopPrice(290),
      unlockSource: 'shop',
    },
    {
      id: 'neon',
      name: 'Neon',
      description: 'High-energy glow with strong contrast for late pushes.',
      price: scaleShopPrice(320),
      unlockSource: 'shop',
    },
    {
      id: 'linen',
      name: 'Linen',
      description: 'A matte woven texture with subdued highlights.',
      price: scaleShopPrice(350),
      unlockSource: 'shop',
    },
    {
      id: 'holo',
      name: 'Holo',
      description: 'Animated iridescent sheen with gallery-level shimmer.',
      price: scaleShopPrice(540),
      unlockSource: 'shop',
    },
    {
      id: 'plasma',
      name: 'Plasma',
      description: 'Animated electric ribbons for peak-session drama.',
      price: scaleShopPrice(680),
      unlockSource: 'shop',
    },
  ],
});
const BLOCK_SKIN_LOOKUP = Object.freeze(
  COSMETIC_CATALOGUE.blockSkins.reduce((acc, skin) => {
    acc[skin.id] = skin;
    return acc;
  }, {})
);
const COLLECTION_SET_CATALOGUE = Object.freeze([
  {
    id: 'sunrise-studio',
    season: 'Core album · Set 1',
    title: 'Sunrise Studio',
    description: 'Warm, playful tones for softer boards and brighter openings.',
    completionReward: {
      type: 'badge',
      id: 'sunrise-studio-badge',
      name: 'Sunrise ribbon',
      detail: 'A woven album ribbon for finishing the whole Sunrise Studio set.',
    },
    items: [
      { type: 'colorway', id: 'orange' },
      { type: 'colorway', id: 'pink' },
      { type: 'finish', id: 'satin' },
      { type: 'finish', id: 'velvet' },
    ],
  },
  {
    id: 'tidal-archive',
    season: 'Core album · Set 2',
    title: 'Tidal Archive',
    description: 'Cool sea-glass palettes and crisp finishes for cleaner sessions.',
    completionReward: {
      type: 'badge',
      id: 'tidal-archive-badge',
      name: 'Tidal seal',
      detail: 'A polished seal marking every item in the Tidal Archive set as owned.',
      unlock: {
        type: 'finish',
        id: 'aurora',
        name: 'Aurora',
        detail: 'Animated finish unlocked for completing the Tidal Archive set.',
      },
    },
    items: [
      { type: 'colorway', id: 'blue' },
      { type: 'colorway', id: 'teal' },
      { type: 'colorway', id: 'mint' },
      { type: 'finish', id: 'frost' },
      { type: 'finish', id: 'prism' },
    ],
  },
  {
    id: 'afterglow-arcade',
    season: 'Core album · Set 3',
    title: 'Afterglow Arcade',
    description: 'Bolder evening colours and sharper finishes for dramatic boards.',
    completionReward: {
      type: 'badge',
      id: 'afterglow-arcade-badge',
      name: 'Afterglow crest',
      detail: 'A prestige crest that marks the Afterglow Arcade set as complete.',
    },
    items: [
      { type: 'colorway', id: 'green' },
      { type: 'colorway', id: 'purple' },
      { type: 'colorway', id: 'red' },
      { type: 'finish', id: 'carbon' },
      { type: 'finish', id: 'ember' },
    ],
  },
  {
    id: 'luminous-vault',
    season: 'Core album · Set 4',
    title: 'Luminous Vault',
    description: 'Rare accents and premium finishes assembled for long-term collectors.',
    completionReward: {
      type: 'badge',
      id: 'luminous-vault-badge',
      name: 'Vault insignia',
      detail: 'A rare insignia awarded for completing the Luminous Vault set.',
      unlock: {
        type: 'finish',
        id: 'starlight',
        name: 'Starlight',
        detail: 'Animated finish unlocked for completing the Luminous Vault set.',
      },
    },
    items: [
      { type: 'colorway', id: 'gold' },
      { type: 'colorway', id: 'indigo' },
      { type: 'colorway', id: 'violet' },
      { type: 'finish', id: 'obsidian' },
      { type: 'finish', id: 'opal' },
    ],
  },
]);
const COLLECTION_SET_LOOKUP = Object.freeze(
  COLLECTION_SET_CATALOGUE.reduce((acc, set) => {
    acc[set.id] = set;
    return acc;
  }, {})
);
const COLLECTION_ITEM_TO_SET = Object.freeze(
  COLLECTION_SET_CATALOGUE.reduce((acc, set) => {
    set.items.forEach(item => {
      acc[`${item.type}:${item.id}`] = set.id;
    });
    return acc;
  }, {})
);
const COLLECTION_ALBUM_GOAL = Object.freeze({
  id: 'core-album',
  title: 'Core album',
  description: 'Complete every themed set in the core binder to unlock the Heirloom finish.',
  setIds: COLLECTION_SET_CATALOGUE.map(set => set.id),
  reward: {
    type: 'finish',
    id: 'heirloom',
    name: 'Heirloom',
    detail: 'Exclusive finish for completing every themed set in the album.',
  },
});

const BADGE_CATALOGUE = Object.freeze([
  {
    id: 'score-100',
    name: 'Century starter',
    icon: '💯',
    description: 'Score 100 points in a run.',
    unlockHint: 'Reach a best score of at least 100.',
    source: 'score',
    threshold: 100,
  },
  {
    id: 'score-300',
    name: 'Score striker',
    icon: '🔥',
    description: 'Score 300 points in a run.',
    unlockHint: 'Reach a best score of at least 300.',
    source: 'score',
    threshold: 300,
  },
  {
    id: 'score-600',
    name: 'Board legend',
    icon: '⚡',
    description: 'Score 600 points in a run.',
    unlockHint: 'Reach a best score of at least 600.',
    source: 'score',
    threshold: 600,
  },
  {
    id: 'score-900',
    name: 'Skybreaker',
    icon: '🌠',
    description: 'Score 900 points in a run.',
    unlockHint: 'Reach a best score of at least 900.',
    source: 'score',
    threshold: 900,
  },
  {
    id: 'score-1200',
    name: 'Mythic tactician',
    icon: '🏆',
    description: 'Score 1200 points in a run.',
    unlockHint: 'Reach a best score of at least 1200.',
    source: 'score',
    threshold: 1200,
  },
  {
    id: 'quest-closer',
    name: 'Route closer',
    icon: '🧭',
    description: 'Complete a full quest chain.',
    unlockHint: 'Finish one quest chain in the current cycle.',
    source: 'quest',
  },
  {
    id: 'quest-vanguard',
    name: 'Quest vanguard',
    icon: '🛡️',
    description: 'Complete two quest chains.',
    unlockHint: 'Finish two quest chains in the current cycle.',
    source: 'quest',
    threshold: 2,
  },
  {
    id: 'quest-grand-tour',
    name: 'Grand tour',
    icon: '🗺️',
    description: 'Complete all active quest chains.',
    unlockHint: 'Finish all active quest chains in the current cycle.',
    source: 'quest',
    threshold: 3,
  },
  {
    id: 'collection-curator',
    name: 'Collection curator',
    icon: '🗂️',
    description: 'Complete one themed collection set.',
    unlockHint: 'Complete any themed set from the shop album.',
    source: 'collection',
  },
  {
    id: 'collection-builder',
    name: 'Collection builder',
    icon: '🧩',
    description: 'Own five collection items across colourways and finishes.',
    unlockHint: 'Unlock five collection items from the shop.',
    source: 'collection-items',
    threshold: 5,
  },
  {
    id: 'collection-connoisseur',
    name: 'Collection connoisseur',
    icon: '🛍️',
    description: 'Own ten collection items across colourways and finishes.',
    unlockHint: 'Unlock ten collection items from the shop.',
    source: 'collection-items',
    threshold: 10,
  },
  {
    id: 'palette-pioneer',
    name: 'Palette pioneer',
    icon: '🎨',
    description: 'Unlock eight colourways.',
    unlockHint: 'Own eight colourways.',
    source: 'colorway-count',
    threshold: 8,
  },
  {
    id: 'palette-legend',
    name: 'Palette legend',
    icon: '🖌️',
    description: 'Unlock all colourways.',
    unlockHint: 'Own every colourway in the shop.',
    source: 'colorway-count',
    threshold: COLORWAY_CATALOGUE.length,
  },
  {
    id: 'finish-fan',
    name: 'Finish fan',
    icon: '🪞',
    description: 'Unlock six finishes.',
    unlockHint: 'Own six finishes.',
    source: 'finish-count',
    threshold: 6,
  },
  {
    id: 'finish-virtuoso',
    name: 'Finish virtuoso',
    icon: '💠',
    description: 'Unlock every finish.',
    unlockHint: 'Own every finish in the collection.',
    source: 'finish-count',
    threshold: COSMETIC_CATALOGUE.blockSkins.length,
  },
  {
    id: 'set-trailblazer',
    name: 'Set trailblazer',
    icon: '📚',
    description: 'Complete two themed collection sets.',
    unlockHint: 'Finish two themed sets from the album.',
    source: 'collection',
    threshold: 2,
  },
  {
    id: 'album-hero',
    name: 'Album hero',
    icon: '🏵️',
    description: 'Complete every themed collection set.',
    unlockHint: 'Finish all themed sets in the album.',
    source: 'collection',
    threshold: COLLECTION_SET_CATALOGUE.length,
  },
  {
    id: 'sunrise-ribbon',
    name: 'Sunrise ribbon',
    icon: '🌅',
    description: 'Earned for finishing the Sunrise Studio set.',
    unlockHint: 'Complete the Sunrise Studio collection set.',
    source: 'set-badge',
    setBadgeId: 'sunrise-studio-badge',
  },
  {
    id: 'tidal-seal',
    name: 'Tidal seal',
    icon: '🌊',
    description: 'Earned for finishing the Tidal Archive set.',
    unlockHint: 'Complete the Tidal Archive collection set.',
    source: 'set-badge',
    setBadgeId: 'tidal-archive-badge',
  },
  {
    id: 'afterglow-crest',
    name: 'Afterglow crest',
    icon: '🌇',
    description: 'Earned for finishing the Afterglow Arcade set.',
    unlockHint: 'Complete the Afterglow Arcade collection set.',
    source: 'set-badge',
    setBadgeId: 'afterglow-arcade-badge',
  },
  {
    id: 'luminous-insignia',
    name: 'Luminous insignia',
    icon: '🌟',
    description: 'Earned for finishing the Luminous Vault set.',
    unlockHint: 'Complete the Luminous Vault collection set.',
    source: 'set-badge',
    setBadgeId: 'luminous-vault-badge',
  },
  {
    id: 'coin-keeper-500',
    name: 'Coin keeper',
    icon: '🪙',
    description: 'Hold 500 coins at once.',
    unlockHint: 'Save up to 500 coins.',
    source: 'coin-balance',
    threshold: 500,
  },
  {
    id: 'coin-keeper-1000',
    name: 'Coin warden',
    icon: '💰',
    description: 'Hold 1000 coins at once.',
    unlockHint: 'Save up to 1000 coins.',
    source: 'coin-balance',
    threshold: 1000,
  },
  {
    id: 'coin-keeper-2000',
    name: 'Coin vault',
    icon: '🏦',
    description: 'Hold 2000 coins at once.',
    unlockHint: 'Save up to 2000 coins.',
    source: 'coin-balance',
    threshold: 2000,
  },
  {
    id: 'coin-keeper-5000',
    name: 'Coin sovereign',
    icon: '👑',
    description: 'Hold 5000 coins at once.',
    unlockHint: 'Save up to 5000 coins.',
    source: 'coin-balance',
    threshold: 5000,
  },
  {
    id: 'golden-chaos',
    name: 'Golden chaos',
    icon: '✨',
    description: 'Unlock the Shuffle Glow colourway after proving top-tier leaderboard skill.',
    unlockHint: 'Finish in the weekly top 3 and unlock Shuffle Glow.',
    source: 'random-colourway',
    badgeVariant: 'golden-sparkle',
  },
  {
    id: 'weekly-first',
    name: 'Weekly champion',
    icon: '🥇',
    description: 'Hold 1st place on the weekly leaderboard.',
    unlockHint: 'Reach 1st place in weekly standings.',
    source: 'leaderboard',
    rank: 1,
  },
  {
    id: 'weekly-second',
    name: 'Weekly silver',
    icon: '🥈',
    description: 'Hold 2nd place on the weekly leaderboard.',
    unlockHint: 'Reach 2nd place in weekly standings.',
    source: 'leaderboard',
    rank: 2,
  },
  {
    id: 'weekly-third',
    name: 'Weekly bronze',
    icon: '🥉',
    description: 'Hold 3rd place on the weekly leaderboard.',
    unlockHint: 'Reach 3rd place in weekly standings.',
    source: 'leaderboard',
    rank: 3,
  },
  {
    id: 'weekly-top-10',
    name: 'Top ten',
    icon: '🎖️',
    description: 'Reach the top ten on the weekly leaderboard.',
    unlockHint: 'Reach 10th place or better in weekly standings.',
    source: 'leaderboard-top',
    threshold: 10,
  },
  {
    id: 'weekly-top-5',
    name: 'Top five',
    icon: '👑',
    description: 'Reach the top five on the weekly leaderboard.',
    unlockHint: 'Reach 5th place or better in weekly standings.',
    source: 'leaderboard-top',
    threshold: 5,
  },
]);

const BADGE_LOOKUP = Object.freeze(
  BADGE_CATALOGUE.reduce((acc, badge) => {
    acc[badge.id] = badge;
    return acc;
  }, {})
);

const RUN_OBJECTIVES = Object.freeze([
  {
    id: 'first-clear',
    label: 'First clear',
    description: 'Clear at least one region during the run.',
    isComplete: summary => summary.stats.regionsCleared >= 1,
  },
  {
    id: 'combo-builder',
    label: 'Combo builder',
    description: 'Reach a 3× combo or better.',
    isComplete: summary => summary.stats.maxCombo >= 3,
  },
  {
    id: 'rack-runner',
    label: 'Rack runner',
    description: 'Finish two full racks in one run.',
    isComplete: summary => summary.stats.racksCompleted >= 2,
  },
  {
    id: 'centurion',
    label: 'Centurion',
    description: 'Score 100 points or more.',
    isComplete: summary => summary.finalScore >= 100,
  },
  {
    id: 'personal-best',
    label: 'Personal best',
    description: 'Beat your previous best score.',
    isComplete: summary => summary.stats.personalBest,
  },
]);

function clampWholeNumber(value, fallback) {
  return Number.isInteger(value) && value >= 0 ? value : fallback;
}

function uniqueStringList(value, fallback) {
  if (!Array.isArray(value)) return fallback.slice();
  return [...new Set(value.filter(item => typeof item === 'string' && item.trim() !== ''))];
}

function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getUTCDateKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function getPreviousDateKey(dateKey) {
  const date = new Date(`${dateKey}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() - 1);
  return getUTCDateKey(date);
}

function isValidDateKey(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function getRecentDailyChallengeDateKeys(limit = DAILY_CHALLENGE_ARCHIVE_DAYS) {
  const count = Math.max(0, clampWholeNumber(limit, DAILY_CHALLENGE_ARCHIVE_DAYS));
  const dates = [];
  let cursor = getUTCDateKey();
  for (let i = 0; i <= count; i++) {
    dates.push(cursor);
    cursor = getPreviousDateKey(cursor);
  }
  return dates;
}

function isHistoricalDailyChallengeDate(dateKey) {
  return isValidDateKey(dateKey) && dateKey !== getUTCDateKey();
}

function isPlayableDailyChallengeDate(dateKey) {
  if (!isValidDateKey(dateKey)) return false;
  return getRecentDailyChallengeDateKeys().includes(dateKey);
}

function getDailyChallengeLabel(dateKey) {
  const todayKey = getUTCDateKey();
  if (dateKey === todayKey) return 'Today';
  if (dateKey === getPreviousDateKey(todayKey)) return 'Yesterday';
  return dateKey;
}


function getUTCWeekStart(date = new Date()) {
  const utcDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = utcDate.getUTCDay() || 7;
  utcDate.setUTCDate(utcDate.getUTCDate() - day + 1);
  utcDate.setUTCHours(0, 0, 0, 0);
  return utcDate;
}

function getUTCWeekId(date = new Date()) {
  const weekStart = getUTCWeekStart(date);
  return getUTCDateKey(weekStart);
}

function getCurrentUTCWeekId(date = new Date()) {
  return getUTCWeekId(date);
}

function getPreviousUTCWeekId(date = new Date()) {
  const previousStart = getUTCWeekStart(date);
  previousStart.setUTCDate(previousStart.getUTCDate() - 7);
  return getUTCDateKey(previousStart);
}

function getNextUTCWeekStart(date = new Date()) {
  const nextStart = getUTCWeekStart(date);
  nextStart.setUTCDate(nextStart.getUTCDate() + 7);
  return nextStart;
}

function getUTCWeekCountdown(now = new Date()) {
  const msRemaining = Math.max(0, getNextUTCWeekStart(now).getTime() - now.getTime());
  const totalHours = Math.floor(msRemaining / 3600000);
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;
  return days > 0 ? `${days}d ${hours}h left` : `${Math.max(1, hours)}h left`;
}

function formatOrdinal(value) {
  const remainder10 = value % 10;
  const remainder100 = value % 100;
  if (remainder10 === 1 && remainder100 !== 11) return `${value}st`;
  if (remainder10 === 2 && remainder100 !== 12) return `${value}nd`;
  if (remainder10 === 3 && remainder100 !== 13) return `${value}rd`;
  return `${value}th`;
}

function createDefaultWeeklyLeaderboardState() {
  return {
    playerId: '',
    playerName: DEFAULT_LEADERBOARD_NAME,
    lastPodiumNotifiedWeekId: '',
  };
}

function sanitiseLeaderboardPlayerName(value, fallbackName = DEFAULT_LEADERBOARD_NAME) {
  const candidate = typeof value === 'string' ? value.trim().slice(0, 24) : '';
  if (!candidate) return fallbackName;
  if (candidate.toLowerCase() === LEGACY_LEADERBOARD_NAME.toLowerCase()) return fallbackName;
  return candidate;
}

function sanitiseWeeklyLeaderboardState(value) {
  const src = value && typeof value === 'object' ? value : {};
  return {
    playerId: typeof src.playerId === 'string' ? src.playerId.trim().slice(0, 64) : '',
    playerName: sanitiseLeaderboardPlayerName(src.playerName),
    lastPodiumNotifiedWeekId: typeof src.lastPodiumNotifiedWeekId === 'string' ? src.lastPodiumNotifiedWeekId.trim().slice(0, 10) : '',
  };
}

function syncLeaderboardPlayerId(nextPlayerId) {
  const sanitisedPlayerId = typeof nextPlayerId === 'string' ? nextPlayerId.trim().slice(0, 64) : '';
  if (!sanitisedPlayerId || leaderboardPlayerId === sanitisedPlayerId) return;
  leaderboardPlayerId = sanitisedPlayerId;
  saveSettings();
}

function createDefaultWeeklyLeaderboardRuntimeConfig() {
  return {
    backend: 'local',
    supabaseUrl: '',
    supabasePublishableKey: '',
  };
}

function sanitiseWeeklyLeaderboardRuntimeConfig(value) {
  const defaults = createDefaultWeeklyLeaderboardRuntimeConfig();
  const src = value && typeof value === 'object' ? value : {};
  const supabaseUrl = typeof src.supabaseUrl === 'string' ? src.supabaseUrl.trim() : '';
  const supabasePublishableKey = typeof (src.supabasePublishableKey || src.supabaseApiKey || src.supabaseAnonKey) === 'string'
    ? String(src.supabasePublishableKey || src.supabaseApiKey || src.supabaseAnonKey).trim()
    : '';

  if (src.backend === 'supabase' && supabaseUrl && supabasePublishableKey) {
    return {
      backend: 'supabase',
      supabaseUrl,
      supabasePublishableKey,
    };
  }

  return defaults;
}

function sanitiseProgressionResetDate(value) {
  const resetDate = typeof value === 'string' ? value.trim() : '';
  return PROGRESSION_RESET_DATE_PATTERN.test(resetDate) ? resetDate : '';
}

function loadRuntimeConfig() {
  const runtimeConfig = window.BUROHAME_RUNTIME_CONFIG && typeof window.BUROHAME_RUNTIME_CONFIG === 'object'
    ? window.BUROHAME_RUNTIME_CONFIG
    : {};
  weeklyLeaderboardRuntimeConfig = sanitiseWeeklyLeaderboardRuntimeConfig(runtimeConfig.weeklyLeaderboard);
  progressionResetDate = sanitiseProgressionResetDate(runtimeConfig.progressionResetDate);
}

function hasHostedWeeklyLeaderboardConfig() {
  return weeklyLeaderboardRuntimeConfig.backend === 'supabase'
    && !!weeklyLeaderboardRuntimeConfig.supabaseUrl
    && !!weeklyLeaderboardRuntimeConfig.supabasePublishableKey;
}

function canShowHostedWeeklyLeaderboard() {
  return hasHostedWeeklyLeaderboardConfig() && navigator.onLine;
}

function createPseudoId() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  // Fallback: use crypto.getRandomValues to generate a random hex suffix
  if (window.crypto && typeof window.crypto.getRandomValues === 'function') {
    const buf = new Uint32Array(4);
    window.crypto.getRandomValues(buf);
    const hex = Array.from(buf, n => n.toString(16).padStart(8, '0')).join('');
    return `player-${hex}`;
  }
  // Last-resort fallback if crypto is entirely unavailable
  return `player-${Date.now()}-fallback`;
}

function createSupabaseHeaders(apiKey) {
  const headers = {
    apikey: apiKey,
    'Content-Type': 'application/json',
  };
  const keyLooksLikeJwt = apiKey.startsWith('eyJ') || apiKey.split('.').length === 3;
  if (keyLooksLikeJwt) headers.Authorization = `Bearer ${apiKey}`;
  return headers;
}

function loadCoachModeAccessStateFromSession() {
  try {
    const raw = JSON.parse(sessionStorage.getItem(COACH_AUTH_SESSION_STORAGE_KEY) || 'null');
    if (!raw || typeof raw !== 'object') return;
    if (!raw.authorised) {
      clearCoachModeAccessState();
      return;
    }
    const expiresAt = Number(raw.expiresAt || 0);
    if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
      clearCoachModeAccessState();
      return;
    }
    coachModeAccessState = {
      authorised: true,
      expiresAt,
    };
    syncCoachModeAccessExpiry();
  } catch (_) {
    // Ignore malformed state.
  }
}

function stopCoachModeAccessExpiryTimer() {
  if (coachModeAccessExpiryTimer) {
    clearTimeout(coachModeAccessExpiryTimer);
    coachModeAccessExpiryTimer = 0;
  }
}

function handleCoachModeAccessExpiry() {
  if (!coachModeAccessState.authorised) return;
  clearCoachModeAccessState();
  applyCoachModeGate(false);
  setCoachAuthStatus('Coach Mode access expired. Enter the code to unlock it again.');
}

function syncCoachModeAccessExpiry() {
  stopCoachModeAccessExpiryTimer();
  if (!coachModeAccessState.authorised) return;

  const delay = coachModeAccessState.expiresAt - Date.now();
  if (!Number.isFinite(delay) || delay <= 0) {
    handleCoachModeAccessExpiry();
    return;
  }

  coachModeAccessExpiryTimer = window.setTimeout(() => {
    coachModeAccessExpiryTimer = 0;
    handleCoachModeAccessExpiry();
  }, delay);
}

function persistCoachModeAccessState() {
  sessionStorage.setItem(COACH_AUTH_SESSION_STORAGE_KEY, JSON.stringify(coachModeAccessState));
  syncCoachModeAccessExpiry();
}

function clearCoachModeAccessState() {
  stopCoachModeAccessExpiryTimer();
  coachModeAccessState = { authorised: false, expiresAt: 0 };
  sessionStorage.removeItem(COACH_AUTH_SESSION_STORAGE_KEY);
}

function createSupabaseCoachModeAdapter(url, apiKey) {
  const baseUrl = url.replace(/\/$/, '');
  const headers = createSupabaseHeaders(apiKey);
  const authStorageKey = `bst-supabase-auth:${baseUrl}`;
  let cachedSession = null;

  function parseAuthPayload(payload) {
    const accessToken = payload?.access_token || payload?.session?.access_token || '';
    const refreshToken = payload?.refresh_token || payload?.session?.refresh_token || '';
    const expiresIn = Number(payload?.expires_in || payload?.session?.expires_in || 0);
    const userId = payload?.user?.id || payload?.session?.user?.id || '';
    if (!accessToken || !refreshToken || !userId || !Number.isFinite(expiresIn) || expiresIn <= 0) return null;
    return {
      accessToken,
      refreshToken,
      userId,
      expiresAt: Date.now() + (expiresIn * 1000),
    };
  }

  function saveSession(session) {
    cachedSession = session;
    localStorage.setItem(authStorageKey, JSON.stringify(session));
  }

  function loadSession() {
    if (cachedSession) return cachedSession;
    try {
      const raw = JSON.parse(localStorage.getItem(authStorageKey) || 'null');
      if (raw && typeof raw === 'object') {
        cachedSession = raw;
        return raw;
      }
    } catch (_) {
      // Ignore and refresh the session.
    }
    return null;
  }

  async function requestSession(urlPath, body) {
    const response = await fetch(`${baseUrl}${urlPath}`, {
      method: 'POST',
      headers: {
        apikey: apiKey,
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Supabase auth failed (${response.status})`);
    }

    const payload = await response.json();
    const session = parseAuthPayload(payload);
    if (!session) {
      throw new Error('Supabase auth response did not include a valid session');
    }
    saveSession(session);
    return session;
  }

  async function ensureAuthSession() {
    const current = loadSession();
    if (current && typeof current.expiresAt === 'number' && current.expiresAt > Date.now() + 30_000) {
      return current;
    }
    if (current?.refreshToken) {
      try {
        return await requestSession('/auth/v1/token?grant_type=refresh_token', { refresh_token: current.refreshToken });
      } catch (_) {
        // Fall through to a fresh anonymous session.
      }
    }
    return requestSession('/auth/v1/signup', { data: {} });
  }

  async function callCoachModeFunction(payload = {}) {
    const session = await ensureAuthSession();
    const response = await fetch(`${baseUrl}/functions/v1/coach-mode-auth`, {
      method: 'POST',
      headers: {
        ...headers,
        Authorization: `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(typeof body?.error === 'string' && body.error
        ? body.error
        : `Coach Mode authorisation failed (${response.status})`);
    }
    return {
      authorised: !!body?.authorised,
      expiresAt: typeof body?.expires_at === 'string' ? Date.parse(body.expires_at) : 0,
    };
  }

  return {
    async checkSession() {
      return callCoachModeFunction();
    },
    async verifyPin(pinCode) {
      return callCoachModeFunction({ pin_code: pinCode });
    },
  };
}

function createSupabaseWeeklyLeaderboardAdapter(url, apiKey) {
  const baseUrl = url.replace(/\/$/, '');
  const headers = createSupabaseHeaders(apiKey);
  const authStorageKey = `bst-supabase-auth:${baseUrl}`;
  let cachedSession = null;

  function buildQuery(weekId) {
    const params = new URLSearchParams();
    params.set('select', 'player_id,player_name,league_id,total_score,equipped_badge_id,updated_at,created_at');
    params.set('week_id', `eq.${weekId}`);
    // Tie-break: earliest created_at wins when scores are level.
    params.set('order', 'total_score.desc,created_at.asc,player_id.asc');
    params.set('limit', String(WEEKLY_LEADERBOARD_MAX_ROWS));
    return `${baseUrl}/rest/v1/weekly_leaderboard_entries?${params.toString()}`;
  }

  function parseAuthPayload(payload) {
    const accessToken = payload?.access_token || payload?.session?.access_token || '';
    const refreshToken = payload?.refresh_token || payload?.session?.refresh_token || '';
    const expiresIn = Number(payload?.expires_in || payload?.session?.expires_in || 0);
    const userId = payload?.user?.id || payload?.session?.user?.id || '';
    if (!accessToken || !refreshToken || !userId || !Number.isFinite(expiresIn) || expiresIn <= 0) return null;
    return {
      accessToken,
      refreshToken,
      userId,
      expiresAt: Date.now() + (expiresIn * 1000),
    };
  }

  function saveSession(session) {
    cachedSession = session;
    localStorage.setItem(authStorageKey, JSON.stringify(session));
    syncLeaderboardPlayerId(session.userId);
  }

  function loadSession() {
    if (cachedSession) {
      syncLeaderboardPlayerId(cachedSession.userId);
      return cachedSession;
    }
    try {
      const raw = JSON.parse(localStorage.getItem(authStorageKey) || 'null');
      if (raw && typeof raw === 'object') {
        cachedSession = raw;
        syncLeaderboardPlayerId(raw.userId);
        return raw;
      }
    } catch (_) {
      // Ignore and refresh the session.
    }
    return null;
  }

  async function requestSession(urlPath, body) {
    const response = await fetch(`${baseUrl}${urlPath}`, {
      method: 'POST',
      headers: {
        apikey: apiKey,
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Supabase auth failed (${response.status})`);
    }

    const payload = await response.json();
    const session = parseAuthPayload(payload);
    if (!session) {
      throw new Error('Supabase auth response did not include a valid session');
    }
    saveSession(session);
    return session;
  }

  async function ensureAuthSession() {
    const current = loadSession();
    if (current && typeof current.expiresAt === 'number' && current.expiresAt > Date.now() + 30_000) {
      return current;
    }

    if (current?.refreshToken) {
      try {
        return await requestSession('/auth/v1/token?grant_type=refresh_token', { refresh_token: current.refreshToken });
      } catch (_) {
        // Fall through to a fresh anonymous session.
      }
    }

    return requestSession('/auth/v1/signup', { data: {} });
  }

  loadSession();

  return {
    id: 'supabase',
    sourceLabel: GLOBAL_WEEKLY_TABLE_LABEL,
    async claimLeaderboardHandle(requestedName) {
      const session = await ensureAuthSession();
      const response = await fetch(`${baseUrl}/functions/v1/claim-leaderboard-handle`, {
        method: 'POST',
        headers: {
          ...headers,
          Authorization: `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requested_name: requestedName,
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(typeof payload?.error === 'string' && payload.error
          ? payload.error
          : `Could not claim leaderboard name (${response.status})`);
      }
      const displayName = typeof payload?.display_name === 'string' ? payload.display_name.trim() : '';
      if (!displayName) {
        throw new Error('Claim response did not include a leaderboard handle');
      }
      return displayName;
    },
    async fetchWeekEntries(weekId) {
      const response = await fetch(buildQuery(weekId), { headers });
      if (!response.ok) throw new Error(`Supabase fetch failed (${response.status})`);
      const payload = await response.json();
      return Array.isArray(payload)
        ? payload.map(item => ({
            playerId: typeof item.player_id === 'string' ? item.player_id : '',
            playerName: typeof item.player_name === 'string' && item.player_name.trim() ? item.player_name.trim().slice(0, 24) : DEFAULT_LEADERBOARD_NAME,
            leagueId: typeof item.league_id === 'string' ? item.league_id : 'bronze',
            totalScore: clampWholeNumber(item.total_score, 0),
            updatedAt: typeof item.updated_at === 'string' ? item.updated_at : new Date(0).toISOString(),
            equippedBadgeId: typeof item.equipped_badge_id === 'string' ? item.equipped_badge_id : '',
            createdAt: typeof item.created_at === 'string' ? item.created_at : new Date(0).toISOString(),
          }))
        : [];
    },
    async upsertPlayerWeekEntry(entry) {
      const session = await ensureAuthSession();
      // Writes go through the Edge Function so the service role key is never
      // exposed to the browser and the payload is validated server-side.
      const response = await fetch(`${baseUrl}/functions/v1/upsert-leaderboard-entry`, {
        method: 'POST',
        headers: {
          ...headers,
          Authorization: `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          week_id: entry.weekId,
          player_id: session.userId,
          league_id: entry.leagueId,
          total_score: entry.totalScore,
          equipped_badge_id: typeof entry.equippedBadgeId === 'string' ? entry.equippedBadgeId : '',
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(typeof payload?.error === 'string' && payload.error
          ? payload.error
          : `Supabase write failed (${response.status})`);
      }
    },
  };
}

function configureWeeklyLeaderboardAdapter() {
  const settings = sanitiseWeeklyLeaderboardState({
    playerId: leaderboardPlayerId,
    playerName: leaderboardPlayerName,
    lastPodiumNotifiedWeekId: leaderboardLastPodiumNotifiedWeekId,
  });
  leaderboardPlayerId = settings.playerId || createPseudoId();
  leaderboardPlayerName = settings.playerName;
  leaderboardLastPodiumNotifiedWeekId = settings.lastPodiumNotifiedWeekId;

  weeklyLeaderboardHostedAdapter = hasHostedWeeklyLeaderboardConfig()
    ? createSupabaseWeeklyLeaderboardAdapter(
        weeklyLeaderboardRuntimeConfig.supabaseUrl,
        weeklyLeaderboardRuntimeConfig.supabasePublishableKey,
      )
    : null;
  coachModeHostedAdapter = hasHostedWeeklyLeaderboardConfig()
    ? createSupabaseCoachModeAdapter(
        weeklyLeaderboardRuntimeConfig.supabaseUrl,
        weeklyLeaderboardRuntimeConfig.supabasePublishableKey,
      )
    : null;
  weeklyLeaderboardViewState = {
    ...weeklyLeaderboardViewState,
    sourceLabel: GLOBAL_WEEKLY_TABLE_LABEL,
    error: '',
    hidden: !canShowHostedWeeklyLeaderboard(),
    currentPlayerRank: 0,
  };
  previousWeeklyLeaderboardViewState = {
    ...previousWeeklyLeaderboardViewState,
    sourceLabel: GLOBAL_WEEKLY_TABLE_LABEL,
    error: '',
    hidden: !canShowHostedWeeklyLeaderboard(),
    currentPlayerRank: 0,
  };
}

function getWeeklyLeaderboardEntryPayload() {
  const weekly = ensureWeeklyLadderForCurrentWeek();
  const countedRuns = sanitiseWeeklyBestRuns(weekly.bestRuns);
  return {
    weekId: weekly.currentWeekId,
    playerId: leaderboardPlayerId,
    leagueId: weekly.leagueId,
    totalScore: countedRuns[0] || 0,
    equippedBadgeId: getEquippedBadgeId(),
  };
}

function isLeaderboardHandleValidationMessage(message) {
  return LEADERBOARD_HANDLE_VALIDATION_PREFIXES.some(prefix => message.startsWith(prefix));
}

function getRequestedLeaderboardBaseName(value = leaderboardPlayerName) {
  if (hasClaimedLeaderboardHandle(value)) {
    return extractLeaderboardNameBase(value);
  }
  return normaliseRequestedLeaderboardName(value);
}

function isMissingClaimedLeaderboardHandleMessage(message) {
  return typeof message === 'string' && message.startsWith('No claimed leaderboard handle');
}

async function tryClaimLeaderboardHandle(requestedName, options = {}) {
  if (!hasHostedWeeklyLeaderboardConfig()) return '';

  const normalisedRequestedName = normaliseRequestedLeaderboardName(requestedName);
  if (!normalisedRequestedName) return '';
  if (normalisedRequestedName.toLowerCase() === LEGACY_LEADERBOARD_NAME.toLowerCase()) return '';

  if (!weeklyLeaderboardHostedAdapter?.claimLeaderboardHandle) {
    if (options.requireClaim) {
      throw new Error('Leaderboard name claims are unavailable right now.');
    }
    return '';
  }

  try {
    return await weeklyLeaderboardHostedAdapter.claimLeaderboardHandle(normalisedRequestedName);
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (options.requireClaim && isLeaderboardHandleValidationMessage(message)) {
      throw error;
    }
    return '';
  }
}

function persistClaimedLeaderboardHandle(claimedHandle) {
  if (!claimedHandle || !hasClaimedLeaderboardHandle(claimedHandle)) return;
  leaderboardPlayerName = claimedHandle;
  saveSettings();
  if (currentPage === 'settings') populateSettingsPage();
}

async function publishWeeklyLeaderboardEntry() {
  if (!leaderboardPlayerId) return;
  const payload = getWeeklyLeaderboardEntryPayload();
  if (!weeklyLeaderboardHostedAdapter) return;
  if (!navigator.onLine) return;

  if (!hasClaimedLeaderboardHandle(leaderboardPlayerName)) {
    const claimedHandle = await tryClaimLeaderboardHandle(getRequestedLeaderboardBaseName(), { requireClaim: false });
    if (claimedHandle) {
      persistClaimedLeaderboardHandle(claimedHandle);
    }
  }
  if (!hasClaimedLeaderboardHandle(leaderboardPlayerName)) return;

  try {
    await weeklyLeaderboardHostedAdapter.upsertPlayerWeekEntry(payload);
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (!isMissingClaimedLeaderboardHandleMessage(message)) {
      return;
    }

    const claimedHandle = await tryClaimLeaderboardHandle(getRequestedLeaderboardBaseName(), { requireClaim: false });
    if (!claimedHandle) {
      return;
    }
    persistClaimedLeaderboardHandle(claimedHandle);

    try {
      await weeklyLeaderboardHostedAdapter.upsertPlayerWeekEntry(payload);
    } catch (_) {
      // Keep the game running even if hosted leaderboard writes fail.
    }
  }
}

async function refreshWeeklyLeaderboard(weekId, options = {}) {
  if (!weeklyLeaderboardHostedAdapter || !weekId) return;
  if (!canShowHostedWeeklyLeaderboard()) {
    weeklyLeaderboardViewState = {
      ...weeklyLeaderboardViewState,
      weekId,
      entries: [],
      loading: false,
      error: '',
      hidden: true,
      currentPlayerRank: 0,
      fetchedAt: 0,
    };
    renderWeeklyGlobalLeaderboard();
    return;
  }
  const now = Date.now();
  const shouldSkip = !options.force
    && weeklyLeaderboardViewState.weekId === weekId
    && now - weeklyLeaderboardViewState.fetchedAt < WEEKLY_LEADERBOARD_PULL_INTERVAL_MS;
  if (shouldSkip) return;

  weeklyLeaderboardViewState = {
    ...weeklyLeaderboardViewState,
    weekId,
    loading: true,
    error: '',
    hidden: false,
  };
  renderWeeklyGlobalLeaderboard();

  try {
    const rows = await weeklyLeaderboardHostedAdapter.fetchWeekEntries(weekId);
    const currentPlayerRank = rows.findIndex((entry) => entry.playerId === leaderboardPlayerId) + 1;
    weeklyLeaderboardViewState = {
      ...weeklyLeaderboardViewState,
      weekId,
      entries: rows,
      loading: false,
      fetchedAt: Date.now(),
      error: '',
      sourceLabel: weeklyLeaderboardHostedAdapter.sourceLabel,
      currentPlayerRank,
      hidden: false,
    };
  } catch (_) {
    weeklyLeaderboardViewState = {
      ...weeklyLeaderboardViewState,
      weekId,
      entries: [],
      loading: false,
      fetchedAt: 0,
      error: 'Hosted weekly leaderboard is unavailable right now.',
      sourceLabel: GLOBAL_WEEKLY_TABLE_LABEL,
      hidden: true,
      currentPlayerRank: 0,
    };
  }
  renderWeeklyGlobalLeaderboard();
  const localBestScore = sanitiseWeeklyBestRuns(ensureWeeklyLadderForCurrentWeek().bestRuns)[0] || 0;
  const liveRank = weeklyLeaderboardViewState.currentPlayerRank > 0
    ? formatOrdinal(weeklyLeaderboardViewState.currentPlayerRank)
    : 'Unranked';
  setTextIfPresent(
    'dashboard-weekly-card-progress',
    localBestScore > 0 ? `${liveRank} · best ${localBestScore}` : 'Set your first weekly score',
  );
}


async function refreshPreviousWeeklyLeaderboard(weekId, options = {}) {
  if (!weeklyLeaderboardHostedAdapter || !weekId) return;
  if (!canShowHostedWeeklyLeaderboard()) {
    previousWeeklyLeaderboardViewState = {
      ...previousWeeklyLeaderboardViewState,
      weekId,
      entries: [],
      loading: false,
      error: '',
      hidden: true,
      currentPlayerRank: 0,
      fetchedAt: 0,
    };
    renderWeeklyGlobalLeaderboard();
    return;
  }
  const now = Date.now();
  const shouldSkip = !options.force
    && previousWeeklyLeaderboardViewState.weekId === weekId
    && now - previousWeeklyLeaderboardViewState.fetchedAt < WEEKLY_LEADERBOARD_PULL_INTERVAL_MS;
  if (shouldSkip) return;

  previousWeeklyLeaderboardViewState = {
    ...previousWeeklyLeaderboardViewState,
    weekId,
    loading: true,
    error: '',
    hidden: false,
  };
  renderWeeklyGlobalLeaderboard();

  try {
    const rows = await weeklyLeaderboardHostedAdapter.fetchWeekEntries(weekId);
    const currentPlayerRank = rows.findIndex((entry) => entry.playerId === leaderboardPlayerId) + 1;
    previousWeeklyLeaderboardViewState = {
      ...previousWeeklyLeaderboardViewState,
      weekId,
      entries: rows,
      loading: false,
      fetchedAt: Date.now(),
      error: '',
      sourceLabel: weeklyLeaderboardHostedAdapter.sourceLabel,
      currentPlayerRank,
      hidden: false,
    };
    maybeNotifyLastWeekPodiumFinish(weekId, rows, currentPlayerRank);
  } catch (_) {
    previousWeeklyLeaderboardViewState = {
      ...previousWeeklyLeaderboardViewState,
      weekId,
      entries: [],
      loading: false,
      fetchedAt: 0,
      error: 'Hosted weekly leaderboard is unavailable right now.',
      sourceLabel: GLOBAL_WEEKLY_TABLE_LABEL,
      hidden: true,
      currentPlayerRank: 0,
    };
  }
  renderWeeklyGlobalLeaderboard();
}

function maybeNotifyLastWeekPodiumFinish(weekId, rows, currentPlayerRank) {
  if (!weekId || leaderboardLastPodiumNotifiedWeekId === weekId) return;
  if (!currentPlayerRank || currentPlayerRank > 3) return;
  const playerEntry = rows.find(entry => entry.playerId === leaderboardPlayerId);
  if (!playerEntry) return;

  const medal = currentPlayerRank === 1 ? '🥇' : currentPlayerRank === 2 ? '🥈' : '🥉';
  showMilestoneMoment({
    eyebrow: 'Weekly leaderboard',
    title: `${medal} Top-three finish`,
    detail: `You placed ${formatOrdinal(currentPlayerRank)} last week with ${playerEntry.totalScore} points.`,
    major: true,
    anchor: '.dashboard-weekly',
    announce: `Top three weekly finish confirmed. You placed ${currentPlayerRank} last week.`,
  });
  leaderboardLastPodiumNotifiedWeekId = weekId;
  saveSettings();
}

function renderWeeklyGlobalLeaderboard() {
  const cardEl = document.getElementById('weekly-global-card');
  const statusEl = document.getElementById('weekly-global-status');
  const listEl = document.getElementById('weekly-global-list');
  const previousCardEl = document.getElementById('weekly-last-global-card');
  const previousStatusEl = document.getElementById('weekly-last-global-status');
  const previousListEl = document.getElementById('weekly-last-global-list');
  if (!cardEl || !statusEl || !listEl || !previousCardEl || !previousStatusEl || !previousListEl) return;

  const shouldHide = weeklyLeaderboardViewState.hidden || !canShowHostedWeeklyLeaderboard() || !!weeklyLeaderboardViewState.error;
  cardEl.hidden = shouldHide;
  const currentPlayerEntry = weeklyLeaderboardViewState.entries.find((entry) => entry.playerId === leaderboardPlayerId) || null;
  setTextIfPresent('weekly-page-score', String(currentPlayerEntry?.totalScore || 0));
  setTextIfPresent(
    'weekly-page-rank',
    weeklyLeaderboardViewState.currentPlayerRank > 0 ? formatOrdinal(weeklyLeaderboardViewState.currentPlayerRank) : 'Unranked',
  );
  if (shouldHide) {
    listEl.innerHTML = '';
    statusEl.textContent = '';
  } else {
    const rankLine = weeklyLeaderboardViewState.currentPlayerRank > 0
      ? ` · Your rank: ${formatOrdinal(weeklyLeaderboardViewState.currentPlayerRank)}`
      : '';
    const statusLine = weeklyLeaderboardViewState.loading
      ? `${weeklyLeaderboardViewState.sourceLabel} · Refreshing live standings…`
      : `${weeklyLeaderboardViewState.sourceLabel}${rankLine}`;
    statusEl.textContent = statusLine;

    listEl.innerHTML = '';
    const rows = weeklyLeaderboardViewState.entries.slice(0, 8);
    if (!rows.length) {
      const empty = document.createElement('li');
      empty.textContent = 'No runs are on this week’s leaderboard yet.';
      listEl.appendChild(empty);
    } else {
      rows.forEach((entry, index) => {
        const item = document.createElement('li');
        const name = entry.playerId === leaderboardPlayerId ? `${entry.playerName} (You)` : entry.playerName;
        const nameEl = document.createElement('span');
        const league = getLeagueById(entry.leagueId);
        const leaderboardBadge = (() => {
          if (index === 0) return '🥇';
          if (index === 1) return '🥈';
          if (index === 2) return '🥉';
          const equippedBadge = BADGE_LOOKUP[entry.equippedBadgeId] || null;
          if (equippedBadge) return equippedBadge.icon;
          if (entry.playerId === leaderboardPlayerId) {
            const equipped = getEquippedBadge();
            return equipped ? equipped.icon : '';
          }
          return '';
        })();
        const badgePrefix = leaderboardBadge ? `${leaderboardBadge} ` : '';
        nameEl.textContent = `${index + 1}. ${badgePrefix}${name} · ${league.badge} ${league.name}`;
        const scoreEl = document.createElement('strong');
        scoreEl.textContent = String(entry.totalScore);
        item.append(nameEl, scoreEl);
        listEl.appendChild(item);
      });
    }
  }

  const previousShouldHide = previousWeeklyLeaderboardViewState.hidden
    || !canShowHostedWeeklyLeaderboard()
    || !!previousWeeklyLeaderboardViewState.error;
  previousCardEl.hidden = previousShouldHide;
  if (previousShouldHide) {
    previousListEl.innerHTML = '';
    previousStatusEl.textContent = '';
  } else {
    const previousRankLine = previousWeeklyLeaderboardViewState.currentPlayerRank > 0
      ? ` · Your finish: ${formatOrdinal(previousWeeklyLeaderboardViewState.currentPlayerRank)}`
      : '';
    previousStatusEl.textContent = previousWeeklyLeaderboardViewState.loading
      ? `${previousWeeklyLeaderboardViewState.sourceLabel} · Loading previous week…`
      : `${previousWeeklyLeaderboardViewState.sourceLabel}${previousRankLine}`;

    previousListEl.innerHTML = '';
    const previousRows = previousWeeklyLeaderboardViewState.entries.slice(0, 8);
    if (!previousRows.length) {
      const empty = document.createElement('li');
      empty.textContent = 'No runs were recorded on the previous leaderboard.';
      previousListEl.appendChild(empty);
    } else {
      previousRows.forEach((entry, index) => {
        const item = document.createElement('li');
        const name = entry.playerId === leaderboardPlayerId ? `${entry.playerName} (You)` : entry.playerName;
        const nameEl = document.createElement('span');
        const league = getLeagueById(entry.leagueId);
        const leaderboardBadge = (() => {
          if (index === 0) return '🥇';
          if (index === 1) return '🥈';
          if (index === 2) return '🥉';
          const equippedBadge = BADGE_LOOKUP[entry.equippedBadgeId] || null;
          return equippedBadge ? equippedBadge.icon : '';
        })();
        const badgePrefix = leaderboardBadge ? `${leaderboardBadge} ` : '';
        nameEl.textContent = `${index + 1}. ${badgePrefix}${name} · ${league.badge} ${league.name}`;
        const scoreEl = document.createElement('strong');
        scoreEl.textContent = String(entry.totalScore);
        item.append(nameEl, scoreEl);
        previousListEl.appendChild(item);
      });
    }
  }

  refreshBadgeMilestones();
}

function stopWeeklyLeaderboardPolling() {
  if (weeklyLeaderboardPollTimer) {
    clearInterval(weeklyLeaderboardPollTimer);
    weeklyLeaderboardPollTimer = 0;
  }
}

function startWeeklyLeaderboardPolling() {
  stopWeeklyLeaderboardPolling();
  if (currentPage !== 'weekly' || !canShowHostedWeeklyLeaderboard()) return;
  weeklyLeaderboardPollTimer = window.setInterval(() => {
    refreshWeeklyLeaderboard(getCurrentUTCWeekId());
    refreshPreviousWeeklyLeaderboard(getPreviousUTCWeekId());
  }, WEEKLY_LEADERBOARD_PULL_INTERVAL_MS);
}

function getLeagueById(leagueId) {
  return WEEKLY_LEAGUE_LOOKUP[leagueId] || WEEKLY_LEAGUES[0];
}

function getLeagueIndex(leagueId) {
  return WEEKLY_LEAGUES.findIndex(league => league.id === leagueId);
}

function getAdjacentLeagueId(leagueId, direction) {
  const currentIndex = Math.max(0, getLeagueIndex(leagueId));
  const nextIndex = Math.max(0, Math.min(WEEKLY_LEAGUES.length - 1, currentIndex + direction));
  return WEEKLY_LEAGUES[nextIndex].id;
}

function sanitiseWeeklyBestRuns(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map(score => clampWholeNumber(score, 0))
    .filter(score => score > 0)
    .sort((a, b) => b - a)
    .slice(0, WEEKLY_LADDER_COUNTED_RUNS);
}

function createDefaultWeeklyResult() {
  return {
    weekId: '',
    leagueId: 'bronze',
    outcome: '',
    rank: 0,
    totalScore: 0,
    coinsAwarded: 0,
    unlockType: '',
    unlockId: '',
    unlockName: '',
  };
}

function sanitiseWeeklyResult(value) {
  const src = value && typeof value === 'object' ? value : {};
  return {
    weekId: typeof src.weekId === 'string' ? src.weekId : '',
    leagueId: typeof src.leagueId === 'string' ? src.leagueId : 'bronze',
    outcome: typeof src.outcome === 'string' ? src.outcome : '',
    rank: clampWholeNumber(src.rank, 0),
    totalScore: clampWholeNumber(src.totalScore, 0),
    coinsAwarded: clampWholeNumber(src.coinsAwarded, 0),
    unlockType: typeof src.unlockType === 'string' ? src.unlockType : '',
    unlockId: typeof src.unlockId === 'string' ? src.unlockId : '',
    unlockName: typeof src.unlockName === 'string' ? src.unlockName : '',
  };
}

function createDefaultWeeklyLadderState() {
  return {
    currentWeekId: '',
    leagueId: 'bronze',
    bestRuns: [],
    lastSettledWeekId: '',
    pendingResult: createDefaultWeeklyResult(),
    history: [],
  };
}

function sanitiseWeeklyLadderState(value) {
  const src = value && typeof value === 'object' ? value : {};
  const history = Array.isArray(src.history)
    ? src.history.map(sanitiseWeeklyResult).filter(entry => entry.weekId)
    : [];
  return {
    currentWeekId: typeof src.currentWeekId === 'string' ? src.currentWeekId : '',
    leagueId: typeof src.leagueId === 'string' && WEEKLY_LEAGUE_LOOKUP[src.leagueId] ? src.leagueId : 'bronze',
    bestRuns: sanitiseWeeklyBestRuns(src.bestRuns),
    lastSettledWeekId: typeof src.lastSettledWeekId === 'string' ? src.lastSettledWeekId : '',
    pendingResult: sanitiseWeeklyResult(src.pendingResult),
    history: history.slice(-6),
  };
}

function buildWeeklyRewardPreview(leagueId, outcome) {
  const league = getLeagueById(leagueId);
  if (outcome === 'promoted') {
    return {
      coins: league.promotionCoins,
      unlockHint: 'Bonus unlock if your collection still has something locked.',
    };
  }
  if (outcome === 'relegated') {
    return {
      coins: league.relegationCoins,
      unlockHint: 'A softer landing still pays a few coins.',
    };
  }
  return {
    coins: league.holdCoins,
    unlockHint: 'Steady weeks still pay out coins at the reset.',
  };
}

function getWeeklyZoneForRank(rank, leagueId) {
  if (rank <= WEEKLY_PROMOTION_SLOTS) {
    return leagueId === 'diamond' ? 'summit' : 'promotion';
  }
  if (rank > WEEKLY_COHORT_SIZE - WEEKLY_RELEGATION_SLOTS) {
    return leagueId === 'bronze' ? 'safe' : 'relegation';
  }
  return 'hold';
}

function getWeeklyZoneLabel(zone) {
  if (zone === 'promotion') return 'Promotion zone';
  if (zone === 'summit') return 'Summit zone';
  if (zone === 'relegation') return 'Relegation zone';
  return 'Hold zone';
}

function chooseWeeklyUnlockReward(sourceState = progressionState) {
  const ownedColorways = new Set(sourceState?.cosmetics?.ownedColorways || getOwnedColorways());
  const lockedColorway = COLORWAY_CATALOGUE.find(colorway => colorway.price > 0 && !ownedColorways.has(colorway.id));
  if (lockedColorway) {
    return {
      type: 'colorway',
      id: lockedColorway.id,
      name: lockedColorway.name,
    };
  }

  const ownedSkins = new Set(sourceState?.cosmetics?.ownedBlockSkins || getOwnedBlockSkins());
  const lockedSkin = COSMETIC_CATALOGUE.blockSkins.find(skin => skin.price > 0 && !ownedSkins.has(skin.id));
  if (lockedSkin) {
    return {
      type: 'finish',
      id: lockedSkin.id,
      name: lockedSkin.name,
    };
  }

  return null;
}

function applyWeeklyUnlockReward(reward) {
  if (!reward?.id || !reward?.type) return;
  updateProgressionState(state => {
    if (reward.type === 'colorway') {
      if (!state.cosmetics.ownedColorways.includes(reward.id)) {
        state.cosmetics.ownedColorways.push(reward.id);
      }
    } else if (reward.type === 'finish') {
      if (!state.cosmetics.ownedBlockSkins.includes(reward.id)) {
        state.cosmetics.ownedBlockSkins.push(reward.id);
      }
    }
    return state;
  });
  evaluateCollectionAlbumRewards();
  updateCosmeticLabel();
}

function buildWeeklyCohort(weekId, leagueId, playerScore) {
  const league = getLeagueById(leagueId);
  const [minScore, maxScore] = league.scoreRange;
  const spread = Math.max(60, maxScore - minScore);
  const opponents = [];

  for (let index = 0; index < WEEKLY_COHORT_SIZE - 1; index++) {
    const seed = hashString(`weekly:${weekId}:${leagueId}:${index}`);
    const percentile = (seed % 1000) / 999;
    const wave = Math.sin(((seed >>> 3) % 360) * (Math.PI / 180));
    const score = Math.round(minScore + percentile * spread + wave * 28);
    opponents.push({
      id: `shadow-${index + 1}`,
      score: Math.max(0, score),
    });
  }

  const entries = [...opponents, { id: 'you', score: Math.max(0, Math.round(playerScore)) }]
    .sort((left, right) => {
      if (right.score !== left.score) return right.score - left.score;
      return left.id === 'you' ? -1 : right.id === 'you' ? 1 : left.id.localeCompare(right.id);
    })
    .map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));

  const playerEntry = entries.find(entry => entry.id === 'you') || { score: playerScore, rank: WEEKLY_COHORT_SIZE };
  const promotionCutoffEntry = entries[WEEKLY_PROMOTION_SLOTS - 1];
  const holdCutoffEntry = entries[Math.max(0, WEEKLY_COHORT_SIZE - WEEKLY_RELEGATION_SLOTS - 1)];
  const safeRank = Math.max(1, WEEKLY_COHORT_SIZE - WEEKLY_RELEGATION_SLOTS);
  return {
    entries,
    playerEntry,
    promotionCutoffScore: promotionCutoffEntry ? promotionCutoffEntry.score : playerScore,
    safeCutoffScore: holdCutoffEntry ? holdCutoffEntry.score : playerScore,
    safeRank,
  };
}

function getWeeklyRankBand(rank) {
  if (rank <= WEEKLY_PROMOTION_SLOTS) return 'Front pack';
  if (rank <= 10) return 'Upper mid-table';
  if (rank <= WEEKLY_COHORT_SIZE - WEEKLY_RELEGATION_SLOTS) return 'Steady pack';
  return 'Pressure pack';
}

function settleWeeklyOutcome(weekId, leagueId, bestRuns) {
  const totalScore = bestRuns.reduce((sum, value) => sum + value, 0);
  const cohort = buildWeeklyCohort(weekId, leagueId, totalScore);
  const rank = cohort.playerEntry.rank;
  const zone = getWeeklyZoneForRank(rank, leagueId);
  let outcome = 'held';
  let nextLeagueId = leagueId;

  if (zone === 'promotion') {
    outcome = 'promoted';
    nextLeagueId = getAdjacentLeagueId(leagueId, 1);
  } else if (zone === 'relegation') {
    outcome = 'relegated';
    nextLeagueId = getAdjacentLeagueId(leagueId, -1);
  }

  const rewardPreview = buildWeeklyRewardPreview(leagueId, outcome);
  const unlockReward = outcome === 'promoted' ? chooseWeeklyUnlockReward() : null;

  return {
    outcome,
    nextLeagueId,
    rewardCoins: rewardPreview.coins,
    unlockReward,
    result: {
      weekId,
      leagueId,
      outcome,
      rank,
      totalScore,
      coinsAwarded: rewardPreview.coins,
      unlockType: unlockReward?.type || '',
      unlockId: unlockReward?.id || '',
      unlockName: unlockReward?.name || '',
    },
  };
}

function showWeeklySettlementMoment(settlement) {
  if (!settlement?.result?.weekId) return;
  const nextLeague = getLeagueById(settlement.nextLeagueId);
  const league = getLeagueById(settlement.result.leagueId);
  const detailParts = [
    `${formatOrdinal(settlement.result.rank)} of ${WEEKLY_COHORT_SIZE}`,
    `+${settlement.rewardCoins} coins`,
  ];
  if (settlement.unlockReward) detailParts.push(`${settlement.unlockReward.name} unlocked`);
  showCoinToast(settlement.rewardCoins, `Weekly ${settlement.outcome}`, {
    celebrate: settlement.outcome !== 'relegated',
    major: settlement.outcome === 'promoted',
  });
  showMilestoneMoment({
    eyebrow: 'Weekly ladder',
    title: settlement.outcome === 'promoted'
      ? `${nextLeague.badge} Promoted to ${nextLeague.name}`
      : settlement.outcome === 'relegated'
        ? `${nextLeague.badge} Moved down to ${nextLeague.name}`
        : `${league.badge} ${league.name} held`,
    detail: detailParts.join(' · '),
    major: settlement.outcome === 'promoted',
    anchor: '.dashboard-weekly',
    announce: `Weekly ladder ${settlement.outcome}. Rank ${settlement.result.rank}. ${settlement.rewardCoins} coins awarded.`,
  });
}

function ensureWeeklyLadderForCurrentWeek() {
  const currentWeekId = getUTCWeekId();
  const existing = progressionState?.weeklyLadder ? sanitiseWeeklyLadderState(progressionState.weeklyLadder) : createDefaultWeeklyLadderState();
  if (existing.currentWeekId === currentWeekId) {
    return existing;
  }

  const settlement = existing.currentWeekId && existing.currentWeekId !== currentWeekId && existing.lastSettledWeekId !== existing.currentWeekId
    ? settleWeeklyOutcome(existing.currentWeekId, existing.leagueId, existing.bestRuns)
    : null;

  const nextState = updateProgressionState(state => {
    const weekly = sanitiseWeeklyLadderState(state.weeklyLadder);
    if (!weekly.currentWeekId) {
      weekly.currentWeekId = currentWeekId;
      state.weeklyLadder = weekly;
      return state;
    }

    if (settlement) {
      weekly.leagueId = settlement.nextLeagueId;
      weekly.lastSettledWeekId = weekly.currentWeekId;
      weekly.pendingResult = settlement.result;
      weekly.history = [...weekly.history, settlement.result].slice(-6);
    }

    weekly.currentWeekId = currentWeekId;
    weekly.bestRuns = [];
    state.weeklyLadder = weekly;
    return state;
  });

  if (settlement) {
    awardCoins(settlement.rewardCoins, `Weekly ${settlement.outcome}`, {
      silent: true,
      celebrate: settlement.outcome !== 'relegated',
      major: settlement.outcome === 'promoted',
    });
    if (settlement.unlockReward) applyWeeklyUnlockReward(settlement.unlockReward);
    showWeeklySettlementMoment(settlement);
  }

  renderCosmeticsCollection();
  publishWeeklyLeaderboardEntry();
  return nextState.weeklyLadder;
}

function recordWeeklyRunScore(finalScore) {
  const scoreValue = Math.max(0, Math.round(finalScore));
  if (!scoreValue) return;
  ensureWeeklyLadderForCurrentWeek();
  updateProgressionState(state => {
    const weekly = sanitiseWeeklyLadderState(state.weeklyLadder);
    const scores = [...weekly.bestRuns, scoreValue].sort((a, b) => b - a).slice(0, WEEKLY_LADDER_COUNTED_RUNS);
    weekly.bestRuns = scores;
    state.weeklyLadder = weekly;
    return state;
  });
  publishWeeklyLeaderboardEntry();
}

function getWeeklyLadderStatus() {
  const weekly = ensureWeeklyLadderForCurrentWeek();
  const countedRuns = sanitiseWeeklyBestRuns(weekly.bestRuns);
  const totalScore = countedRuns.reduce((sum, value) => sum + value, 0);
  const cohort = buildWeeklyCohort(weekly.currentWeekId, weekly.leagueId, totalScore);
  const rank = cohort.playerEntry.rank;
  const zone = getWeeklyZoneForRank(rank, weekly.leagueId);
  const league = getLeagueById(weekly.leagueId);
  const promotionGap = Math.max(0, cohort.promotionCutoffScore + 1 - totalScore);
  const safetyGap = Math.max(0, cohort.safeCutoffScore + 1 - totalScore);
  const projectedOutcome = zone === 'promotion'
    ? (weekly.leagueId === 'diamond' ? 'held' : 'promoted')
    : zone === 'relegation'
      ? (weekly.leagueId === 'bronze' ? 'held' : 'relegated')
      : 'held';
  return {
    weekly,
    league,
    countedRuns,
    totalScore,
    rank,
    rankLabel: `${formatOrdinal(rank)} of ${WEEKLY_COHORT_SIZE}`,
    zone,
    zoneLabel: getWeeklyZoneLabel(zone),
    rankBand: getWeeklyRankBand(rank),
    promotionGap,
    safetyGap,
    countdown: getUTCWeekCountdown(),
    projectedOutcome,
    rewardPreview: buildWeeklyRewardPreview(weekly.leagueId, projectedOutcome),
  };
}

function describeWeeklyResult(result) {
  if (!result?.weekId) return '';
  if (result.outcome === 'promoted') {
    return `${formatOrdinal(result.rank)} in ${getLeagueById(result.leagueId).name}. ${result.coinsAwarded} coins banked.`;
  }
  if (result.outcome === 'relegated') {
    return `${formatOrdinal(result.rank)} last week. ${result.coinsAwarded} coins softened the drop.`;
  }
  return `${formatOrdinal(result.rank)} last week. ${result.coinsAwarded} coins for holding steady.`;
}

function ensureQuestBoardForCurrentCycle() {
  const currentCycleId = getQuestCycleId();
  const existing = progressionState?.questBoard ? sanitiseQuestBoardState(progressionState.questBoard) : createDefaultQuestBoardState();
  if (existing.cycleId === currentCycleId && existing.activeChainIds.length) {
    return existing;
  }

  const nextState = updateProgressionState(state => {
    const current = sanitiseQuestBoardState(state.questBoard);
    const refreshCount = clampWholeNumber(current.refreshCount, 0);
    state.questBoard = {
      ...createQuestBoardForCycle(currentCycleId),
      refreshCount: current.cycleId ? refreshCount + 1 : refreshCount,
    };
    return state;
  });

  return nextState.questBoard;
}

function getQuestBoardStatus(options = {}) {
  const board = ensureQuestBoardForCurrentCycle();
  const changedChainIds = new Set(Array.isArray(options.changedChainIds) ? options.changedChainIds : []);
  const chains = board.activeChainIds.map(chainId => {
    const chain = QUEST_CHAIN_LOOKUP[chainId];
    const chainState = sanitiseQuestChainState(board.chainStates[chainId], chainId);
    const currentStep = chain.steps[chainState.currentStepIndex] || null;
    const nextStep = currentStep ? (chain.steps[chainState.currentStepIndex + 1] || null) : null;
    const currentProgress = currentStep ? Math.min(chainState.currentStepProgress, currentStep.goal) : 0;
    const progressPercent = currentStep
      ? Math.max(0, Math.min(100, Math.round((currentProgress / currentStep.goal) * 100)))
      : 100;
    return {
      chain,
      chainState,
      currentStep,
      nextStep,
      currentProgress,
      progressPercent,
      isComplete: !!chainState.completedAt || chainState.currentStepIndex >= chain.steps.length,
      isChanged: changedChainIds.has(chainId),
      finalRewardText: getQuestFinalRewardText(chain),
    };
  });

  return {
    board,
    chains,
    completed: chains.filter(item => item.isComplete).length,
    total: chains.length,
    countdown: getUTCWeekCountdown(),
  };
}

function applyQuestChainProgress(summary) {
  const board = ensureQuestBoardForCurrentCycle();
  const changedChainIds = new Set();
  const awardedMilestones = [];
  const coinAwards = [];
  const unlockRewards = [];

  updateProgressionState(state => {
    const questBoard = sanitiseQuestBoardState(state.questBoard);
    if (questBoard.cycleId !== board.cycleId || !questBoard.activeChainIds.length) {
      state.questBoard = createQuestBoardForCycle(board.cycleId);
    }
    const workingBoard = sanitiseQuestBoardState(state.questBoard);

    workingBoard.activeChainIds.forEach(chainId => {
      const chain = QUEST_CHAIN_LOOKUP[chainId];
      const chainState = sanitiseQuestChainState(workingBoard.chainStates[chainId], chainId);
      if (!chain || chainState.completedAt) {
        workingBoard.chainStates[chainId] = chainState;
        return;
      }

      let keepChecking = true;
      while (keepChecking && chainState.currentStepIndex < chain.steps.length) {
        const step = chain.steps[chainState.currentStepIndex];
        const currentAmount = getQuestStepValue(step, summary);
        const nextProgress = step.mode === 'cumulative'
          ? Math.min(step.goal, chainState.currentStepProgress + currentAmount)
          : Math.max(chainState.currentStepProgress, currentAmount);

        if (nextProgress > chainState.currentStepProgress) {
          changedChainIds.add(chainId);
        }

        chainState.currentStepProgress = nextProgress;

        if (chainState.currentStepProgress < step.goal) {
          keepChecking = false;
          continue;
        }

        chainState.completedStepIds.push(step.stepId);
        const rewardAmount = step.reward || 0;
        if (rewardAmount) coinAwards.push({
          amount: rewardAmount,
          reason: `${chain.title} · ${step.title}`,
          options: { silent: true, celebrate: true, major: rewardAmount >= 10 },
        });

        awardedMilestones.push({
          eyebrow: chain.kicker,
          title: step.title,
          detail: rewardAmount ? `${chain.title} · +${rewardAmount} coins` : `${chain.title} updated`,
          major: false,
          announce: `${chain.title} quest step cleared.`,
        });

        chainState.currentStepIndex += 1;
        chainState.currentStepProgress = 0;

        if (chainState.currentStepIndex >= chain.steps.length) {
          chainState.completedAt = workingBoard.cycleId;
          if (!workingBoard.completedChainIds.includes(chainId)) workingBoard.completedChainIds.push(chainId);
          const finalRewardCoins = chain.finalReward?.coins || 0;
          let unlockReward = null;
          if (chain.finalReward?.grantsUnlock) {
            unlockReward = chooseWeeklyUnlockReward(state);
            if (unlockReward) {
              unlockRewards.push(unlockReward);
              if (unlockReward.type === 'colorway' && !state.cosmetics.ownedColorways.includes(unlockReward.id)) {
                state.cosmetics.ownedColorways.push(unlockReward.id);
              }
              if (unlockReward.type === 'finish' && !state.cosmetics.ownedBlockSkins.includes(unlockReward.id)) {
                state.cosmetics.ownedBlockSkins.push(unlockReward.id);
              }
            }
          }
          if (finalRewardCoins) coinAwards.push({
            amount: finalRewardCoins,
            reason: `${chain.title} complete`,
            options: { silent: true, celebrate: true, major: true },
          });
          awardedMilestones.push({
            eyebrow: 'Quest chain complete',
            title: chain.title,
            detail: unlockReward
              ? `+${finalRewardCoins} coins · ${unlockReward.name} unlocked`
              : `+${finalRewardCoins} coins banked`,
            major: true,
            announce: `${chain.title} quest chain complete.`,
          });
          keepChecking = false;
        }
      }

      workingBoard.chainStates[chainId] = chainState;
    });

    state.questBoard = workingBoard;
    return state;
  });

  coinAwards.forEach(entry => {
    awardCoins(entry.amount, entry.reason, entry.options);
  });
  unlockRewards.forEach(reward => applyWeeklyUnlockReward(reward));
  awardedMilestones.forEach(milestone => {
    showMilestoneMoment({
      ...milestone,
      anchor: '#score-wrap',
    });
  });

  return {
    changedChainIds: [...changedChainIds],
  };
}

function hashString(value) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function getDailyChallengeSeed(dateKey) {
  return hashString(`daily-challenge:${dateKey}`);
}

function getDailyChallengeTarget(seed) {
  return DAILY_CHALLENGE_TARGET_MIN + (seed % DAILY_CHALLENGE_TARGET_RANGE);
}

function isDailyChallengeSession() {
  return currentSessionType === 'daily';
}

function toBoardKey(r, c) {
  return `${r},${c}`;
}

function createSeededDailyRng(seed) {
  let state = (seed || 1) >>> 0;
  return () => {
    state = (Math.imul(state || 1, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function normaliseLockedCells(value) {
  if (!Array.isArray(value)) return [];
  const unique = new Map();
  const cells = [];
  value.forEach(cell => {
    const source = Array.isArray(cell)
      ? { r: cell[0], c: cell[1], hitsRemaining: 2 }
      : (cell && typeof cell === 'object' ? cell : null);
    if (!source) return;
    const r = Math.max(0, Math.min(N - 1, Math.floor(source.r)));
    const c = Math.max(0, Math.min(N - 1, Math.floor(source.c)));
    const hitsRemaining = Math.max(1, Math.min(3, Math.floor(source.hitsRemaining || source.hits || source.durability || 2)));
    const key = toBoardKey(r, c);
    const existing = unique.get(key);
    if (existing) {
      existing.hitsRemaining = Math.max(existing.hitsRemaining, hitsRemaining);
      return;
    }
    const entry = { r, c, hitsRemaining };
    unique.set(key, entry);
    cells.push(entry);
  });
  return cells;
}

function buildDailyLockedCells(seed) {
  const random = createSeededDailyRng(seed);
  const occupied = new Set();
  const lockedCells = [];
  const blockCount = DAILY_CHALLENGE_LOCKED_BLOCK_COUNT_MIN
    + Math.floor(random() * DAILY_CHALLENGE_LOCKED_BLOCK_COUNT_RANGE);
  const maxAttempts = blockCount * 12;
  let attempts = 0;

  while (lockedCells.length < N * N && attempts < maxAttempts && lockedCells.length < blockCount * 2) {
    attempts += 1;
    const row = Math.floor(random() * N);
    const col = Math.floor(random() * N);
    const originKey = toBoardKey(row, col);
    if (occupied.has(originKey)) continue;

    const useDomino = random() < 0.45;
    const rings = random() < 0.35 ? 2 : 1;
    const hitsRemaining = rings + 1;

    const blockCells = [{ r: row, c: col, hitsRemaining }];
    if (useDomino) {
      const horizontal = random() < 0.5;
      const nr = horizontal ? row : row + (random() < 0.5 ? -1 : 1);
      const nc = horizontal ? col + (random() < 0.5 ? -1 : 1) : col;
      const inBounds = nr >= 0 && nr < N && nc >= 0 && nc < N;
      const neighbourKey = inBounds ? toBoardKey(nr, nc) : '';
      if (inBounds && !occupied.has(neighbourKey)) {
        blockCells.push({ r: nr, c: nc, hitsRemaining });
      }
    }

    blockCells.forEach(cell => {
      occupied.add(toBoardKey(cell.r, cell.c));
      lockedCells.push(cell);
    });
    if (occupied.size >= blockCount * 2) break;
  }

  return normaliseLockedCells(lockedCells);
}

function syncDailyLockedCellSet() {
  if (!isDailyChallengeSession()) {
    dailyLockedCellsByKey = new Map();
    return;
  }
  dailyLockedCellsByKey = new Map(
    (dailyChallengeState.lockedCells || [])
      .map(cell => [toBoardKey(cell.r, cell.c), cell.hitsRemaining])
  );
}

function randomValue() {
  if (!isDailyChallengeSession()) return Math.random();
  const currentState = dailyChallengeState.randomState || dailyChallengeState.seed || 1;
  dailyChallengeState.randomState = (Math.imul(currentState, 1664525) + 1013904223) >>> 0;
  return dailyChallengeState.randomState / 4294967296;
}

function resetStandardSessionState() {
  currentSessionType = 'standard';
  dailyChallengeState = {
    date: '',
    seed: 0,
    targetScore: 0,
    randomState: 0,
    lockedCells: [],
    isHistorical: false,
  };
  syncDailyLockedCellSet();
}

function configureDailyChallengeSession(dailyState, options = {}) {
  const lockedCells = normaliseLockedCells(options.lockedCells?.length
    ? options.lockedCells
    : buildDailyLockedCells(dailyState.seed));
  currentSessionType = 'daily';
  dailyChallengeState = {
    date: dailyState.date,
    seed: dailyState.seed,
    targetScore: dailyState.targetScore,
    randomState: clampWholeNumber(options.randomState, dailyState.seed || 1) || (dailyState.seed || 1),
    lockedCells,
    isHistorical: !!options.isHistorical,
  };
  syncDailyLockedCellSet();
}

function createDailyMissionEntry(template, dateKey) {
  return {
    id: `${dateKey}-${template.templateId}`,
    templateId: template.templateId,
    kind: template.kind,
    title: template.title,
    description: template.description,
    goal: template.goal,
    progress: 0,
    reward: template.reward,
  };
}

function createDailyMissionSet(dateKey) {
  const seeded = DAILY_MISSION_TEMPLATES
    .map(template => ({
      template,
      score: hashString(`${dateKey}:${template.templateId}`),
    }))
    .sort((a, b) => a.score - b.score)
    .slice(0, 3);

  return seeded.map(({ template }) => createDailyMissionEntry(template, dateKey));
}

function sanitiseMissionEntry(value) {
  const src = value && typeof value === 'object' ? value : {};
  const id = typeof src.id === 'string' ? src.id : '';
  const title = typeof src.title === 'string' && src.title.trim() !== ''
    ? src.title
    : 'Daily mission';

  return {
    id,
    templateId: typeof src.templateId === 'string' ? src.templateId : '',
    kind: typeof src.kind === 'string' ? src.kind : 'score',
    title,
    description: typeof src.description === 'string' ? src.description : '',
    goal: Math.max(1, clampWholeNumber(src.goal, 1)),
    progress: clampWholeNumber(src.progress, 0),
    reward: clampWholeNumber(src.reward, 0),
  };
}

function createDefaultQuestChainState(chainId = '') {
  return {
    chainId,
    currentStepIndex: 0,
    currentStepProgress: 0,
    completedAt: '',
    completedStepIds: [],
  };
}

function sanitiseQuestChainState(value, fallbackChainId = '') {
  const src = value && typeof value === 'object' ? value : {};
  const chainId = typeof src.chainId === 'string' && QUEST_CHAIN_LOOKUP[src.chainId]
    ? src.chainId
    : fallbackChainId;
  return {
    chainId,
    currentStepIndex: clampWholeNumber(src.currentStepIndex, 0),
    currentStepProgress: clampWholeNumber(src.currentStepProgress, 0),
    completedAt: typeof src.completedAt === 'string' ? src.completedAt : '',
    completedStepIds: uniqueStringList(src.completedStepIds, []),
  };
}

function createDefaultQuestBoardState() {
  return {
    cycleId: '',
    activeChainIds: [],
    chainStates: {},
    completedChainIds: [],
    refreshCount: 0,
  };
}

function sanitiseQuestBoardState(value) {
  const defaults = createDefaultQuestBoardState();
  const src = value && typeof value === 'object' ? value : {};
  const activeChainIds = uniqueStringList(src.activeChainIds, defaults.activeChainIds)
    .filter(chainId => QUEST_CHAIN_LOOKUP[chainId])
    .slice(0, QUEST_BOARD_CHAIN_LIMIT);
  const rawChainStates = src.chainStates && typeof src.chainStates === 'object' ? src.chainStates : {};
  const chainStates = {};

  activeChainIds.forEach(chainId => {
    chainStates[chainId] = sanitiseQuestChainState(rawChainStates[chainId], chainId);
  });

  return {
    cycleId: typeof src.cycleId === 'string' ? src.cycleId : '',
    activeChainIds,
    chainStates,
    completedChainIds: uniqueStringList(src.completedChainIds, [])
      .filter(chainId => activeChainIds.includes(chainId)),
    refreshCount: clampWholeNumber(src.refreshCount, defaults.refreshCount),
  };
}

function getQuestCycleId(date = new Date()) {
  return getUTCWeekId(date);
}

function createQuestBoardForCycle(cycleId) {
  const seededIds = QUEST_CHAIN_TEMPLATES
    .map(chain => ({
      chainId: chain.chainId,
      score: hashString(`${cycleId}:${chain.chainId}`),
    }))
    .sort((left, right) => left.score - right.score)
    .slice(0, QUEST_BOARD_CHAIN_LIMIT)
    .map(entry => entry.chainId);

  const chainStates = {};
  seededIds.forEach(chainId => {
    chainStates[chainId] = createDefaultQuestChainState(chainId);
  });

  return {
    cycleId,
    activeChainIds: seededIds,
    chainStates,
    completedChainIds: [],
    refreshCount: 0,
  };
}

function getQuestStepValue(step, summary) {
  if (!step || !summary) return 0;
  switch (step.metric) {
    case 'singleRunScore':
      return summary.finalScore;
    case 'totalScore':
      return summary.finalScore;
    case 'maxCombo':
      return summary.stats.maxCombo;
    case 'regionsCleared':
      return summary.stats.regionsCleared;
    case 'biggestClear':
      return summary.stats.biggestClear;
    case 'racksCompleted':
      return summary.stats.racksCompleted;
    case 'coachRuns':
      return summary.stats.coachModeUsed ? 1 : 0;
    case 'coachRegions':
      return summary.stats.coachModeUsed ? summary.stats.regionsCleared : 0;
    case 'coachMaxCombo':
      return summary.stats.coachModeUsed ? summary.stats.maxCombo : 0;
    default:
      return 0;
  }
}

function getQuestStepProgressText(step, progressValue) {
  const progress = Math.min(progressValue, step.goal);
  if (step.metric === 'singleRunScore' || step.metric === 'totalScore') return `${progress}/${step.goal} points`;
  if (step.metric === 'maxCombo' || step.metric === 'coachMaxCombo') return `Best combo ${progress}/${step.goal}`;
  if (step.metric === 'biggestClear') return `Best clear ${progress}/${step.goal} regions`;
  if (step.metric === 'racksCompleted') return `${progress}/${step.goal} racks`;
  if (step.metric === 'coachRuns') return `${progress}/${step.goal} Coach Mode runs`;
  return `${progress}/${step.goal}`;
}

function getQuestFinalRewardText(chain) {
  const reward = chain.finalReward || {};
  const parts = [`🪙 ${reward.coins || 0}`];
  if (reward.grantsUnlock) parts.push('bonus unlock if available');
  return parts.join(' · ');
}

function createDefaultProgressionState() {
  return {
    version: PROGRESSION_STATE_VERSION,
    coins: {
      balance: 0,
      lifetimeEarned: 0,
      lifetimeSpent: 0,
    },
    unlocks: {
      equippedTheme: 'classic',
      ownedThemes: ['classic'],
      seenRewardIds: [],
    },
    cosmetics: {
      equippedBlockSkin: 'classic',
      ownedBlockSkins: ['classic'],
      ownedColorways: ['orange'],
      earnedSetBadges: [],
      unlockedBadges: [],
      equippedBadgeId: '',
    },
    dailyMissions: {
      date: '',
      missions: [],
      completedIds: [],
      claimedIds: [],
      refreshCount: 0,
      templateVersion: DAILY_MISSION_VERSION,
    },
    dailyChallenge: {
      date: '',
      seed: 0,
      targetScore: 0,
      bestScore: 0,
      completedAt: '',
      attempts: 0,
      rewardClaimedDate: '',
    },
    dailyChallengeArchive: {},
    streak: {
      current: 0,
      best: 0,
      lastActiveDate: '',
      lastRewardDate: '',
      freezes: 0,
    },
    oneMoreRun: {
      rapidRetryChain: 0,
      lastRunEndedAt: 0,
      lastPromptType: '',
      lastPromptShownAt: 0,
      analytics: {
        shown: 0,
        accepted: 0,
        dismissed: 0,
        suppressedRapidRetry: 0,
        suppressedNoCandidate: 0,
      },
    },
    questBoard: createDefaultQuestBoardState(),
    weeklyLadder: createDefaultWeeklyLadderState(),
    collectionAlbum: {
      completedSetIds: [],
      claimedGoalIds: [],
    },
    onboarding: {
      completedRuns: 0,
    },
  };
}

function sanitiseMissionState(value) {
  const src = value && typeof value === 'object' ? value : {};
  const missions = Array.isArray(src.missions)
    ? src.missions
      .map(sanitiseMissionEntry)
      .filter(mission => mission.id)
    : [];
  return {
    date: typeof src.date === 'string' ? src.date : '',
    missions,
    completedIds: uniqueStringList(src.completedIds, []),
    claimedIds: uniqueStringList(src.claimedIds, []),
    refreshCount: clampWholeNumber(src.refreshCount, 0),
    templateVersion: clampWholeNumber(src.templateVersion, 0),
  };
}

function sanitiseOneMoreRunState(value) {
  const defaults = createDefaultProgressionState().oneMoreRun;
  const src = value && typeof value === 'object' ? value : {};
  const analytics = src.analytics && typeof src.analytics === 'object' ? src.analytics : {};
  return {
    rapidRetryChain: clampWholeNumber(src.rapidRetryChain, defaults.rapidRetryChain),
    lastRunEndedAt: clampWholeNumber(src.lastRunEndedAt, defaults.lastRunEndedAt),
    lastPromptType: typeof src.lastPromptType === 'string' ? src.lastPromptType : '',
    lastPromptShownAt: clampWholeNumber(src.lastPromptShownAt, defaults.lastPromptShownAt),
    analytics: {
      shown: clampWholeNumber(analytics.shown, defaults.analytics.shown),
      accepted: clampWholeNumber(analytics.accepted, defaults.analytics.accepted),
      dismissed: clampWholeNumber(analytics.dismissed, defaults.analytics.dismissed),
      suppressedRapidRetry: clampWholeNumber(analytics.suppressedRapidRetry, defaults.analytics.suppressedRapidRetry),
      suppressedNoCandidate: clampWholeNumber(analytics.suppressedNoCandidate, defaults.analytics.suppressedNoCandidate),
    },
  };
}

function sanitiseDailyChallengeState(value) {
  const src = value && typeof value === 'object' ? value : {};
  return {
    date: typeof src.date === 'string' ? src.date : '',
    seed: clampWholeNumber(src.seed, 0),
    targetScore: clampWholeNumber(src.targetScore, 0),
    bestScore: clampWholeNumber(src.bestScore, 0),
    completedAt: typeof src.completedAt === 'string' ? src.completedAt : '',
    attempts: clampWholeNumber(src.attempts, 0),
    rewardClaimedDate: typeof src.rewardClaimedDate === 'string' ? src.rewardClaimedDate : '',
  };
}

function sanitiseDailyChallengeArchive(value) {
  const src = value && typeof value === 'object' ? value : {};
  const archive = {};
  Object.entries(src).forEach(([dateKey, record]) => {
    if (!isValidDateKey(dateKey)) return;
    const clean = sanitiseDailyChallengeState({
      ...record,
      date: dateKey,
      seed: getDailyChallengeSeed(dateKey),
      targetScore: getDailyChallengeTarget(getDailyChallengeSeed(dateKey)),
    });
    archive[dateKey] = clean;
  });
  return archive;
}

function sanitiseProgressionState(rawState) {
  const defaults = createDefaultProgressionState();
  const src = rawState && typeof rawState === 'object' ? rawState : {};
  const coins = src.coins && typeof src.coins === 'object' ? src.coins : {};
  const unlocks = src.unlocks && typeof src.unlocks === 'object' ? src.unlocks : {};
  const cosmetics = src.cosmetics && typeof src.cosmetics === 'object' ? src.cosmetics : {};
  const streak = src.streak && typeof src.streak === 'object' ? src.streak : {};
  const collectionAlbum = src.collectionAlbum && typeof src.collectionAlbum === 'object' ? src.collectionAlbum : {};
  const onboarding = src.onboarding && typeof src.onboarding === 'object' ? src.onboarding : {};
  const ownedThemes = (() => {
    const owned = uniqueStringList(unlocks.ownedThemes, defaults.unlocks.ownedThemes);
    return owned.includes('classic') ? owned : ['classic', ...owned];
  })();
  const ownedBlockSkins = uniqueStringList(cosmetics.ownedBlockSkins, defaults.cosmetics.ownedBlockSkins)
    .filter(id => BLOCK_SKIN_LOOKUP[id]);
  if (!ownedBlockSkins.includes('classic')) ownedBlockSkins.unshift('classic');
  const ownedColorways = uniqueStringList(cosmetics.ownedColorways, defaults.cosmetics.ownedColorways)
    .filter(id => COLORWAY_LOOKUP[id]);
  if (!ownedColorways.includes('orange')) ownedColorways.unshift('orange');
  const equippedTheme = typeof unlocks.equippedTheme === 'string' && unlocks.equippedTheme.trim() !== ''
    ? unlocks.equippedTheme
    : defaults.unlocks.equippedTheme;
  const equippedBlockSkin = typeof cosmetics.equippedBlockSkin === 'string'
    && cosmetics.equippedBlockSkin.trim() !== ''
    && ownedBlockSkins.includes(cosmetics.equippedBlockSkin)
    ? cosmetics.equippedBlockSkin
    : defaults.cosmetics.equippedBlockSkin;
  const unlockedBadges = uniqueStringList(cosmetics.unlockedBadges, defaults.cosmetics.unlockedBadges)
    .filter(id => BADGE_LOOKUP[id]);
  const equippedBadgeId = typeof cosmetics.equippedBadgeId === 'string'
    && unlockedBadges.includes(cosmetics.equippedBadgeId)
    ? cosmetics.equippedBadgeId
    : defaults.cosmetics.equippedBadgeId;

  return {
    version: PROGRESSION_STATE_VERSION,
    coins: {
      balance: clampWholeNumber(coins.balance, defaults.coins.balance),
      lifetimeEarned: clampWholeNumber(coins.lifetimeEarned, defaults.coins.lifetimeEarned),
      lifetimeSpent: clampWholeNumber(coins.lifetimeSpent, defaults.coins.lifetimeSpent),
    },
    unlocks: {
      equippedTheme: ownedThemes.includes(equippedTheme) ? equippedTheme : defaults.unlocks.equippedTheme,
      ownedThemes,
      seenRewardIds: uniqueStringList(unlocks.seenRewardIds, defaults.unlocks.seenRewardIds),
    },
    cosmetics: {
      equippedBlockSkin,
      ownedBlockSkins,
      ownedColorways,
      earnedSetBadges: uniqueStringList(cosmetics.earnedSetBadges, defaults.cosmetics.earnedSetBadges),
      unlockedBadges,
      equippedBadgeId,
    },
    dailyMissions: sanitiseMissionState(src.dailyMissions),
    dailyChallenge: sanitiseDailyChallengeState(src.dailyChallenge),
    dailyChallengeArchive: sanitiseDailyChallengeArchive(src.dailyChallengeArchive),
    streak: {
      current: clampWholeNumber(streak.current, defaults.streak.current),
      best: clampWholeNumber(streak.best, defaults.streak.best),
      lastActiveDate: typeof streak.lastActiveDate === 'string' ? streak.lastActiveDate : '',
      lastRewardDate: typeof streak.lastRewardDate === 'string' ? streak.lastRewardDate : '',
      freezes: clampWholeNumber(streak.freezes, defaults.streak.freezes),
    },
    oneMoreRun: sanitiseOneMoreRunState(src.oneMoreRun),
    questBoard: sanitiseQuestBoardState(src.questBoard),
    weeklyLadder: sanitiseWeeklyLadderState(src.weeklyLadder),
    collectionAlbum: {
      completedSetIds: uniqueStringList(collectionAlbum.completedSetIds, defaults.collectionAlbum.completedSetIds)
        .filter(id => COLLECTION_SET_LOOKUP[id]),
      claimedGoalIds: uniqueStringList(collectionAlbum.claimedGoalIds, defaults.collectionAlbum.claimedGoalIds)
        .filter(id => id === COLLECTION_ALBUM_GOAL.id),
    },
    onboarding: {
      completedRuns: clampWholeNumber(onboarding.completedRuns, defaults.onboarding.completedRuns),
    },
  };
}

function createDefaultRunSummary() {
  return {
    finalScore: 0,
    coinsEarned: 0,
    completedObjectiveIds: [],
    questHighlightIds: [],
    recentUpdates: [],
    stats: {
      regionsCleared: 0,
      biggestClear: 0,
      maxCombo: 0,
      racksCompleted: 0,
      personalBest: false,
      coachModeUsed: false,
    },
    continuePrompt: null,
  };
}

function ensureRunSummary() {
  if (!runSummary) runSummary = createDefaultRunSummary();
  return runSummary;
}

function recordRunUpdate({ title = '', detail = '' }) {
  const nextTitle = String(title || '').trim();
  if (!nextTitle) return;

  const summary = ensureRunSummary();
  const nextDetail = String(detail || '').trim();
  const latest = summary.recentUpdates[summary.recentUpdates.length - 1];
  if (latest && latest.title === nextTitle && latest.detail === nextDetail) return;

  summary.recentUpdates = [...summary.recentUpdates, {
    title: nextTitle,
    detail: nextDetail,
  }].slice(-4);
}

function getGameBannerElements() {
  const banner = document.getElementById('game-banner');
  const stack = document.getElementById('game-banner-stack');
  if (!banner || !stack) return null;
  return { banner, stack };
}

function createGameBannerMessageNode(entry, options = {}) {
  const { stateClass = 'game-banner__message--live', placeholder = false } = options;
  const article = document.createElement('article');
  article.className = `game-banner__message ${stateClass}${placeholder ? ' game-banner__message--placeholder' : ''}`;

  const kicker = document.createElement('span');
  kicker.className = 'game-banner__kicker';
  kicker.textContent = entry.kicker;

  const title = document.createElement('strong');
  title.className = 'game-banner__title';
  title.textContent = entry.title;

  article.append(kicker, title);
  return article;
}

function createDefaultGameBannerMessageNode() {
  return createGameBannerMessageNode({
    kicker: 'Run updates',
    title: 'Play to see live milestones.',
  }, { placeholder: true });
}

function finishGameBannerCycle() {
  gameBannerTimer = 0;
  const elements = getGameBannerElements();
  if (!elements) return;

  const liveMessage = elements.stack.querySelector('.game-banner__message--live');
  if (liveMessage) {
    liveMessage.classList.remove('game-banner__message--live');
    liveMessage.classList.add('game-banner__message--outgoing');
  }

  const transitionDuration = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ? 0
    : GAME_BANNER_TRANSITION_MS;

  gameBannerTransitionTimer = window.setTimeout(() => {
    gameBannerTransitionTimer = 0;
    if (liveMessage) liveMessage.remove();
    activeGameBanner = null;
    gameBannerMode = 'idle';
    if (!gameBannerQueue.length) {
      elements.stack.replaceChildren(createDefaultGameBannerMessageNode());
      return;
    }
    renderNextGameBanner();
  }, transitionDuration);
}

function showDefaultGameBannerMessage() {
  const elements = getGameBannerElements();
  if (!elements) return;
  elements.banner.hidden = false;
  if (elements.stack.querySelector('.game-banner__message')) return;
  elements.stack.replaceChildren(createDefaultGameBannerMessageNode());
}

function clearGameBannerQueue() {
  gameBannerQueue = [];
  activeGameBanner = null;
  if (gameBannerTimer) {
    window.clearTimeout(gameBannerTimer);
    gameBannerTimer = 0;
  }
  if (gameBannerTransitionTimer) {
    window.clearTimeout(gameBannerTransitionTimer);
    gameBannerTransitionTimer = 0;
  }
  gameBannerMode = 'idle';

  showDefaultGameBannerMessage();
}

function renderNextGameBanner() {
  if (currentPage !== 'game' || gameOver) return;
  if (gameBannerQueue.length) {
    if (gameBannerTimer || gameBannerTransitionTimer) return;
  } else {
    gameBannerMode = 'idle';
    showDefaultGameBannerMessage();
    return;
  }

  const elements = getGameBannerElements();
  if (!elements) return;
  const { banner, stack } = elements;
  const nextBanner = gameBannerQueue.shift();
  const existingMessage = stack.querySelector('.game-banner__message--live');
  const incomingMessage = createGameBannerMessageNode(nextBanner, {
    stateClass: existingMessage ? 'game-banner__message--incoming' : 'game-banner__message--live',
  });

  banner.hidden = false;

  const transitionDuration = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ? 0
    : GAME_BANNER_TRANSITION_MS;

  if (!existingMessage) {
    stack.replaceChildren(incomingMessage);
    activeGameBanner = nextBanner;
    gameBannerMode = 'fresh';
    gameBannerTimer = window.setTimeout(finishGameBannerCycle, GAME_BANNER_DISPLAY_MS);
    return;
  }

  existingMessage.classList.remove('game-banner__message--live');
  existingMessage.classList.add('game-banner__message--outgoing');
  stack.appendChild(incomingMessage);
  activeGameBanner = nextBanner;
  gameBannerMode = 'fresh';

  gameBannerTransitionTimer = window.setTimeout(() => {
    gameBannerTransitionTimer = 0;
    incomingMessage.classList.remove('game-banner__message--incoming');
    incomingMessage.classList.add('game-banner__message--live');
    existingMessage.remove();
    gameBannerTimer = window.setTimeout(finishGameBannerCycle, GAME_BANNER_DISPLAY_MS);
  }, transitionDuration);
}

function enqueueGameBanner({ kicker = 'Update', title = '', announce = '' }) {
  const nextTitle = String(title || '').trim();
  if (!nextTitle) return;

  if (announce) announceMilestone(announce);
  if (currentPage !== 'game' || gameOver) return;

  const nextBanner = {
    kicker: String(kicker || 'Update').trim(),
    title: nextTitle,
    createdAt: Date.now(),
  };
  const latestQueued = gameBannerQueue[gameBannerQueue.length - 1];
  if (
    (activeGameBanner && activeGameBanner.kicker === nextBanner.kicker && activeGameBanner.title === nextBanner.title) ||
    (latestQueued && latestQueued.kicker === nextBanner.kicker && latestQueued.title === nextBanner.title)
  ) {
    return;
  }

  gameBannerQueue.push(nextBanner);
  if (gameBannerMode === 'idle' && !gameBannerTimer) {
    renderNextGameBanner();
    return;
  }
  renderNextGameBanner();
}

function getOneMoreRunAnalytics() {
  return progressionState?.oneMoreRun || createDefaultProgressionState().oneMoreRun;
}

function updateOneMoreRunState(updater) {
  updateProgressionState(state => {
    state.oneMoreRun = sanitiseOneMoreRunState(
      typeof updater === 'function' ? updater(sanitiseOneMoreRunState(state.oneMoreRun)) : state.oneMoreRun
    );
    return state;
  });
}

function markOneMoreRunEnded() {
  updateOneMoreRunState(state => ({
    ...state,
    lastRunEndedAt: Date.now(),
  }));
}

function logOneMoreRunShown(promptType) {
  updateOneMoreRunState(state => ({
    ...state,
    lastPromptType: promptType,
    lastPromptShownAt: Date.now(),
    analytics: {
      ...state.analytics,
      shown: state.analytics.shown + 1,
    },
  }));
}

function logOneMoreRunSuppressed(reason) {
  updateOneMoreRunState(state => ({
    ...state,
    analytics: {
      ...state.analytics,
      suppressedRapidRetry: state.analytics.suppressedRapidRetry + (reason === 'rapid-retry' ? 1 : 0),
      suppressedNoCandidate: state.analytics.suppressedNoCandidate + (reason === 'no-candidate' ? 1 : 0),
    },
  }));
}

function recordOneMoreRunAccepted(promptType) {
  updateOneMoreRunState(state => {
    const isRapidRetry = state.lastRunEndedAt > 0
      && Date.now() - state.lastRunEndedAt <= ONE_MORE_RUN_RAPID_RETRY_WINDOW_MS;
    return {
      ...state,
      rapidRetryChain: isRapidRetry ? state.rapidRetryChain + 1 : 1,
      lastPromptType: promptType || state.lastPromptType,
      analytics: {
        ...state.analytics,
        accepted: state.analytics.accepted + 1,
      },
    };
  });
}

function recordOneMoreRunDismissed() {
  updateOneMoreRunState(state => ({
    ...state,
    rapidRetryChain: 0,
    analytics: {
      ...state.analytics,
      dismissed: state.analytics.dismissed + 1,
    },
  }));
}

function resetOneMoreRunRetryChain() {
  updateOneMoreRunState(state => ({
    ...state,
    rapidRetryChain: 0,
  }));
}

function getRemainingMissionAmount(mission) {
  return Math.max(0, mission.goal - Math.min(mission.progress, mission.goal));
}

function isMissionCloseEnough(mission, remaining) {
  if (remaining <= 0) return false;
  if (mission.kind === 'runs' || mission.kind === 'racks' || mission.kind === 'regions') return remaining <= 1;
  if (mission.kind === 'combo') return remaining <= 1;
  if (mission.kind === 'score') return remaining <= Math.max(18, Math.ceil(mission.goal * 0.15));
  if (mission.kind === 'blocks') return remaining <= Math.max(6, Math.ceil(mission.goal * 0.2));
  return remaining <= 1;
}

function formatPromptGap(value, noun) {
  if (value === 1) return `1 ${noun}`;
  return `${value} ${noun}s`;
}

function getMissionRemainingCopy(mission, remaining) {
  if (mission.kind === 'score') return `${remaining} points left`;
  if (mission.kind === 'blocks') return `${remaining} blocks left`;
  if (mission.kind === 'regions') return `${remaining} region${remaining === 1 ? '' : 's'} left`;
  if (mission.kind === 'racks') return `${remaining} rack${remaining === 1 ? '' : 's'} left`;
  if (mission.kind === 'combo') return `Need a ${mission.goal}× combo`;
  if (mission.kind === 'runs') return `${remaining} run left`;
  return `${remaining} left`;
}

function buildDailyChallengePrompt(summary) {
  void summary;
  return null;
}

function buildMissionFinishPrompt() {
  const missionState = ensureDailyMissionsForToday();
  const unfinished = missionState.missions.filter(mission => !missionState.claimedIds.includes(mission.id));
  if (unfinished.length !== 1) return null;
  const mission = unfinished[0];
  const remaining = getRemainingMissionAmount(mission);
  if (!isMissionCloseEnough(mission, remaining)) return null;
  return {
    id: 'daily-mission',
    rank: 96,
    sessionType: currentSessionType,
    buttonLabel: 'One more run',
    eyebrow: 'One mission left',
    title: `${mission.title} is within reach`,
    copy: `${mission.description} You only need ${getMissionRemainingCopy(mission, remaining)} to finish it and collect the reward.`,
    meta: `Reward · ${mission.reward} coins`,
  };
}

function buildRoundMilestonePrompt(summary) {
  const roundsCompleted = summary.stats.racksCompleted;
  if (roundsCompleted < 6) return null;
  const nextMilestone = Math.ceil((roundsCompleted + 1) / COIN_REWARDS.roundMilestoneEvery) * COIN_REWARDS.roundMilestoneEvery;
  const gap = nextMilestone - roundsCompleted;
  if (gap <= 0 || gap > 2) return null;
  const reward = getRoundMilestoneReward(nextMilestone);
  return {
    id: 'round-milestone',
    rank: 62,
    sessionType: currentSessionType,
    buttonLabel: 'Try again',
    eyebrow: 'Good pace',
    title: `${formatPromptGap(gap, 'rack')} from the ${nextMilestone}-rack bonus`,
    copy: `You reached ${roundsCompleted} racks. Play one steadier run, aim for ${nextMilestone}, and bank +${reward} coins.`,
    meta: 'Milestone reward',
  };
}

function buildPersonalBestPrompt(summary) {
  if (summary.stats.personalBest || !bestScore) return null;
  const gap = Math.max(0, bestScore - summary.finalScore);
  const threshold = Math.max(14, Math.ceil(bestScore * 0.1));
  if (!gap || gap > threshold) return null;
  return {
    id: 'personal-best',
    rank: 70,
    sessionType: currentSessionType,
    buttonLabel: 'Try again',
    eyebrow: 'Close to a new best',
    title: `${gap} points from your record`,
    copy: `Your best is ${bestScore}. Run it back with the same approach and push just ${gap} more points for a new personal best.`,
    meta: 'Personal best chase',
  };
}

function chooseOneMoreRunPrompt(summary) {
  const analytics = getOneMoreRunAnalytics();
  if (analytics.rapidRetryChain >= ONE_MORE_RUN_RAPID_RETRY_LIMIT) {
    logOneMoreRunSuppressed('rapid-retry');
    return null;
  }

  const candidates = [
    buildDailyChallengePrompt(summary),
    buildMissionFinishPrompt(),
    buildPersonalBestPrompt(summary),
    buildRoundMilestonePrompt(summary),
  ].filter(Boolean);

  if (!candidates.length) {
    logOneMoreRunSuppressed('no-candidate');
    return null;
  }

  candidates.sort((left, right) => right.rank - left.rank || left.title.length - right.title.length);
  const prompt = candidates[0];
  logOneMoreRunShown(prompt.id);
  return prompt;
}

function announceMilestone(message) {
  const liveRegion = document.getElementById('milestone-live');
  if (!liveRegion) return;
  liveRegion.textContent = '';
  window.requestAnimationFrame(() => {
    liveRegion.textContent = message;
  });
}

function pulseCelebrationSurface() {
  const boardWrap = document.getElementById('board-wrap');
  if (!boardWrap) return;
  boardWrap.classList.remove('board-wrap--celebrate');
  void boardWrap.offsetWidth;
  boardWrap.classList.add('board-wrap--celebrate');
  boardWrap.addEventListener('animationend', () => {
    boardWrap.classList.remove('board-wrap--celebrate');
  }, { once: true });
}

function showMilestoneMoment({ eyebrow, title, detail = '', major = false, anchor = null, announce = '' }) {
  void major;
  void anchor;
  recordRunUpdate({ title, detail });
  enqueueGameBanner({
    kicker: eyebrow,
    title: detail ? `${title} · ${detail}` : title,
    announce,
  });
}

function recordRunObjective(objectiveId) {
  const summary = ensureRunSummary();
  if (!summary.completedObjectiveIds.includes(objectiveId)) {
    summary.completedObjectiveIds.push(objectiveId);
  }
}

function evaluateRunObjectives() {
  const summary = ensureRunSummary();
  summary.finalScore = score;

  for (const objective of RUN_OBJECTIVES) {
    if (objective.isComplete(summary)) recordRunObjective(objective.id);
  }
}

function getCompletedRunObjectives() {
  const summary = ensureRunSummary();
  return RUN_OBJECTIVES.filter(objective => summary.completedObjectiveIds.includes(objective.id));
}

function renderGameOverSummary() {
  const summary = ensureRunSummary();
  const objectives = getCompletedRunObjectives();
  const intro = document.querySelector('.summary-intro');
  const summaryNote = document.getElementById('go-summary-note');
  const continuePrompt = document.getElementById('go-continue-prompt');
  const continueEyebrow = document.getElementById('go-continue-eyebrow');
  const continueTitle = document.getElementById('go-continue-title');
  const continueCopy = document.getElementById('go-continue-copy');
  const continueMeta = document.getElementById('go-continue-meta');
  const dailySummary = document.getElementById('go-daily-summary');
  const dailyStatus = document.getElementById('go-daily-status');
  const dailyCopy = document.getElementById('go-daily-copy');
  const nextRunButton = document.getElementById('btn-new');
  const dashboardButton = document.getElementById('btn-gameover-dashboard');

  document.getElementById('go-score').textContent = String(summary.finalScore);
  document.getElementById('go-best').textContent = String(bestScore);
  document.getElementById('go-coins-earned').textContent = `+${summary.coinsEarned}`;
  document.getElementById('go-coin-total').textContent = String(getCoinBalance());
  if (intro) {
    intro.textContent = isDailyChallengeSession()
      ? (lastGameOverReason === 'daily-complete'
          ? 'Board cleared. Challenge complete.'
          : 'Challenge run ended.')
      : 'Ready for another go?';
  }
  if (dashboardButton) {
    dashboardButton.setAttribute('aria-label', isDailyChallengeSession() ? 'Back to dashboard from daily challenge summary' : 'Back to dashboard');
  }
  if (summaryNote) {
    const latestUpdate = summary.recentUpdates[summary.recentUpdates.length - 1];
    const extraCount = Math.max(0, summary.recentUpdates.length - 1);
    if (latestUpdate) {
      summaryNote.hidden = false;
      if (extraCount) {
        const otherMilestones = `${extraCount} other milestone${extraCount === 1 ? '' : 's'} this run`;
        summaryNote.textContent = latestUpdate.detail
          ? `${latestUpdate.title}. ${latestUpdate.detail} There ${extraCount === 1 ? 'was' : 'were'} ${otherMilestones}.`
          : `${latestUpdate.title}. Plus ${otherMilestones}.`;
      } else {
        summaryNote.textContent = latestUpdate.detail
          ? `${latestUpdate.title}. ${latestUpdate.detail}.`
          : latestUpdate.title;
      }
    } else if (summary.questHighlightIds.length) {
      summaryNote.hidden = false;
      summaryNote.textContent = `${summary.questHighlightIds.length} quest chain${summary.questHighlightIds.length === 1 ? '' : 's'} moved on this run.`;
    } else if (objectives.length) {
      summaryNote.hidden = false;
      summaryNote.textContent = `${objectives.length} objective${objectives.length === 1 ? '' : 's'} cleared this run.`;
    } else {
      summaryNote.hidden = true;
      summaryNote.textContent = '';
    }
  }
  if (continuePrompt && continueEyebrow && continueTitle && continueCopy && continueMeta && nextRunButton) {
    const prompt = summary.continuePrompt;
    continuePrompt.hidden = !prompt;
    if (prompt) {
      continueEyebrow.textContent = prompt.eyebrow;
      continueTitle.textContent = prompt.title;
      continueCopy.textContent = prompt.copy;
      continueMeta.textContent = prompt.meta;
      nextRunButton.textContent = prompt.buttonLabel;
      nextRunButton.dataset.sessionType = prompt.sessionType || currentSessionType;
      nextRunButton.dataset.promptType = prompt.id || '';
      nextRunButton.dataset.prompted = 'true';
      nextRunButton.dataset.dailyDate = isDailyChallengeSession() ? (dailyChallengeState.date || getUTCDateKey()) : '';
    } else {
      nextRunButton.textContent = isDailyChallengeSession() ? 'Try daily again' : 'Play again';
      nextRunButton.dataset.sessionType = currentSessionType;
      nextRunButton.dataset.promptType = '';
      nextRunButton.dataset.prompted = 'false';
      nextRunButton.dataset.dailyDate = isDailyChallengeSession() ? (dailyChallengeState.date || getUTCDateKey()) : '';
    }
  }

  if (dailySummary && dailyStatus && dailyCopy) {
    if (isDailyChallengeSession()) {
      const challenge = ensureDailyChallengeForDate(dailyChallengeState.date || getUTCDateKey());
      const label = getDailyChallengeLabel(challenge.date);
      const complete = challenge.completedAt === challenge.date;
      dailySummary.hidden = false;
      dailyStatus.textContent = complete ? 'Completed' : 'Unfinished';
      dailyCopy.textContent = complete
        ? `${label} board cleared. Final score ${summary.finalScore}.`
        : `${label} board not fully cleared. Best score ${Math.max(challenge.bestScore, summary.finalScore)}.`;
    } else {
      dailySummary.hidden = true;
    }
  }
}

function saveProgressionState() {
  localStorage.setItem(PROGRESSION_STORAGE_KEY, JSON.stringify(progressionState));
}

function loadProgressionState() {
  try {
    const raw = JSON.parse(localStorage.getItem(PROGRESSION_STORAGE_KEY) || 'null');
    progressionState = sanitiseProgressionState(raw);
  } catch (_) {
    progressionState = createDefaultProgressionState();
  }

  saveProgressionState();
}

function updateProgressionState(updater) {
  const draft = sanitiseProgressionState(progressionState);
  const next = typeof updater === 'function' ? updater(draft) : draft;
  progressionState = sanitiseProgressionState(next || draft);
  saveProgressionState();
  return progressionState;
}

function resetProgressionState() {
  progressionState = createDefaultProgressionState();
  saveProgressionState();
}

function clearStoredProgressionData() {
  localStorage.removeItem('bst-best');
  localStorage.removeItem('bst-today');
  localStorage.removeItem('bst-settings');
  localStorage.removeItem(PROGRESSION_STORAGE_KEY);
  localStorage.removeItem(GAME_SESSION_STORAGE_KEY);
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const key = localStorage.key(i);
    if (key && key.startsWith('bst-supabase-auth:')) {
      localStorage.removeItem(key);
    }
  }
  clearCoachModeAccessState();
  leaderboardPlayerId = '';
  leaderboardPlayerName = '';
  progressionState = createDefaultProgressionState();
}

function applyProgressionResetIfNeeded() {
  if (!progressionResetDate) return false;

  try {
    const appliedResetDate = localStorage.getItem(PROGRESSION_RESET_APPLIED_STORAGE_KEY) || '';
    if (appliedResetDate === progressionResetDate) return false;

    clearStoredProgressionData();
    localStorage.setItem(PROGRESSION_RESET_APPLIED_STORAGE_KEY, progressionResetDate);
    return true;
  } catch (_) {
    return false;
  }
}

function getCoinBalance() {
  return progressionState?.coins?.balance || 0;
}

function updateCoinUI() {
  const coinBalance = getCoinBalance();
  const coinEl = document.getElementById('coin-balance');
  if (coinEl) coinEl.textContent = coinBalance;
  const dashboardCoinEl = document.getElementById('dashboard-coins');
  if (dashboardCoinEl) dashboardCoinEl.textContent = String(coinBalance);
  const collectionBalanceEl = document.getElementById('collection-balance');
  if (collectionBalanceEl) collectionBalanceEl.textContent = `🪙 ${coinBalance}`;
  const shopBalanceEl = document.getElementById('shop-coin-balance');
  if (shopBalanceEl) shopBalanceEl.textContent = `🪙 ${coinBalance}`;
}

function getOwnedBlockSkins() {
  return progressionState?.cosmetics?.ownedBlockSkins || ['classic'];
}

function getOwnedColorways() {
  return progressionState?.cosmetics?.ownedColorways || ['orange'];
}

function getEquippedBlockSkin() {
  return progressionState?.cosmetics?.equippedBlockSkin || 'classic';
}

function getUnlockedBadgeIds() {
  return progressionState?.cosmetics?.unlockedBadges || [];
}

function getEquippedBadgeId() {
  return progressionState?.cosmetics?.equippedBadgeId || '';
}

function getEquippedBadge() {
  const badgeId = getEquippedBadgeId();
  return badgeId ? BADGE_LOOKUP[badgeId] || null : null;
}

function isBadgeUnlocked(badgeId) {
  return getUnlockedBadgeIds().includes(badgeId);
}

function equipBadge(badgeId) {
  if (!badgeId || !isBadgeUnlocked(badgeId)) return false;
  updateProgressionState(state => {
    state.cosmetics.equippedBadgeId = badgeId;
    return state;
  });
  updateCosmeticLabel();
  return true;
}

function isBlockSkinOwned(skinId) {
  return getOwnedBlockSkins().includes(skinId);
}

function isColorwayOwned(colorId) {
  return getOwnedColorways().includes(colorId);
}

function isCollectionItemOwned(item, sourceState = progressionState) {
  if (!item) return false;
  if (item.type === 'colorway') return (sourceState?.cosmetics?.ownedColorways || []).includes(item.id);
  if (item.type === 'finish') return (sourceState?.cosmetics?.ownedBlockSkins || []).includes(item.id);
  return false;
}

function getCollectionItemMeta(item) {
  if (!item) return null;
  if (item.type === 'colorway') return COLORWAY_LOOKUP[item.id] || null;
  if (item.type === 'finish') return BLOCK_SKIN_LOOKUP[item.id] || null;
  return null;
}

function getCollectionSetForItem(itemType, itemId) {
  const setId = COLLECTION_ITEM_TO_SET[`${itemType}:${itemId}`];
  return setId ? COLLECTION_SET_LOOKUP[setId] || null : null;
}

function getCollectionAlbumStatus(sourceState = progressionState) {
  const completedSetIds = new Set(sourceState?.collectionAlbum?.completedSetIds || []);
  const earnedBadgeIds = new Set(sourceState?.cosmetics?.earnedSetBadges || []);
  const setStatuses = COLLECTION_SET_CATALOGUE.map(set => {
    const itemStatuses = set.items.map(item => {
      const meta = getCollectionItemMeta(item);
      return {
        ...item,
        meta,
        owned: isCollectionItemOwned(item, sourceState),
      };
    });
    const ownedCount = itemStatuses.filter(item => item.owned).length;
    const totalCount = itemStatuses.length;
    const missingItems = itemStatuses.filter(item => !item.owned);
    const isComplete = ownedCount === totalCount;
    return {
      set,
      itemStatuses,
      ownedCount,
      totalCount,
      missingItems,
      remainingCount: totalCount - ownedCount,
      isComplete,
      isRecordedComplete: completedSetIds.has(set.id),
      rewardEarned: earnedBadgeIds.has(set.completionReward.id),
    };
  });

  const completedCount = setStatuses.filter(status => status.isComplete).length;
  const grandRewardOwned = (sourceState?.cosmetics?.ownedBlockSkins || []).includes(COLLECTION_ALBUM_GOAL.reward.id);
  const grandRewardClaimed = (sourceState?.collectionAlbum?.claimedGoalIds || []).includes(COLLECTION_ALBUM_GOAL.id);
  const spotlightSet = setStatuses
    .filter(status => !status.isComplete)
    .sort((left, right) => left.remainingCount - right.remainingCount || right.ownedCount - left.ownedCount)[0] || null;

  return {
    setStatuses,
    completedCount,
    totalSets: COLLECTION_SET_CATALOGUE.length,
    spotlightSet,
    allSetsComplete: completedCount === COLLECTION_SET_CATALOGUE.length,
    grandRewardOwned,
    grandRewardClaimed,
  };
}

function unlockBadgeById(badgeId, { announce = true } = {}) {
  const badge = BADGE_LOOKUP[badgeId];
  if (!badge || isBadgeUnlocked(badgeId)) return false;
  let didUnlock = false;
  updateProgressionState(state => {
    if (state.cosmetics.unlockedBadges.includes(badgeId)) return state;
    state.cosmetics.unlockedBadges.push(badgeId);
    if (!state.cosmetics.equippedBadgeId) state.cosmetics.equippedBadgeId = badgeId;
    didUnlock = true;
    return state;
  });
  if (didUnlock && announce) {
    showMilestoneMoment({
      eyebrow: 'Badge unlocked',
      title: badge.name,
      detail: `${badge.icon} ${badge.description}`,
      major: false,
      anchor: '.page--badges',
      announce: `${badge.name} badge unlocked.`,
    });
  }
  return didUnlock;
}

function getMilestoneBadgeUnlocks() {
  const unlocks = [];
  const collectionStatus = getCollectionAlbumStatus();
  const completedSets = collectionStatus.completedCount;
  const completedQuestChains = getQuestBoardStatus().completed;
  const currentRank = weeklyLeaderboardViewState.currentPlayerRank || 0;
  const ownedColorways = getOwnedColorways().length;
  const ownedFinishes = getOwnedBlockSkins().length;
  const ownedCollectionItems = ownedColorways + ownedFinishes;
  const earnedSetBadges = new Set(progressionState?.cosmetics?.earnedSetBadges || []);
  const currentCoinBalance = getCoinBalance();
  const ownsRandomColourway = isColorwayOwned('random');

  BADGE_CATALOGUE.forEach(badge => {
    if (isBadgeUnlocked(badge.id)) return;
    if (badge.source === 'score' && bestScore >= badge.threshold) unlocks.push(badge.id);
    if (badge.source === 'collection' && completedSets >= (badge.threshold || 1)) unlocks.push(badge.id);
    if (badge.source === 'quest' && completedQuestChains >= (badge.threshold || 1)) unlocks.push(badge.id);
    if (badge.source === 'leaderboard' && currentRank > 0 && currentRank === badge.rank) unlocks.push(badge.id);
    if (badge.source === 'leaderboard-top' && currentRank > 0 && currentRank <= badge.threshold) unlocks.push(badge.id);
    if (badge.source === 'colorway-count' && ownedColorways >= badge.threshold) unlocks.push(badge.id);
    if (badge.source === 'finish-count' && ownedFinishes >= badge.threshold) unlocks.push(badge.id);
    if (badge.source === 'collection-items' && ownedCollectionItems >= badge.threshold) unlocks.push(badge.id);
    if (badge.source === 'set-badge' && badge.setBadgeId && earnedSetBadges.has(badge.setBadgeId)) unlocks.push(badge.id);
    if (badge.source === 'coin-balance' && currentCoinBalance >= badge.threshold) unlocks.push(badge.id);
    if (badge.source === 'random-colourway' && ownsRandomColourway) unlocks.push(badge.id);
  });

  return unlocks;
}

function refreshBadgeMilestones(options = {}) {
  const unlocks = getMilestoneBadgeUnlocks();
  if (!unlocks.length) return false;
  unlocks.forEach(badgeId => unlockBadgeById(badgeId, options));
  return true;
}

function evaluateCollectionAlbumRewards() {
  const status = getCollectionAlbumStatus();
  const newlyCompletedSets = status.setStatuses.filter(setStatus => setStatus.isComplete && !setStatus.isRecordedComplete);
  const shouldClaimGrandReward = status.allSetsComplete && !status.grandRewardClaimed;

  if (!newlyCompletedSets.length && !shouldClaimGrandReward) return;

  updateProgressionState(state => {
    newlyCompletedSets.forEach(setStatus => {
      if (!state.collectionAlbum.completedSetIds.includes(setStatus.set.id)) {
        state.collectionAlbum.completedSetIds.push(setStatus.set.id);
      }
      const badgeId = setStatus.set.completionReward.id;
      if (!state.cosmetics.earnedSetBadges.includes(badgeId)) {
        state.cosmetics.earnedSetBadges.push(badgeId);
      }
      const setUnlock = setStatus.set.completionReward.unlock;
      if (setUnlock?.type === 'finish' && setUnlock.id && !state.cosmetics.ownedBlockSkins.includes(setUnlock.id)) {
        state.cosmetics.ownedBlockSkins.push(setUnlock.id);
      }
    });

    if (shouldClaimGrandReward) {
      if (!state.collectionAlbum.claimedGoalIds.includes(COLLECTION_ALBUM_GOAL.id)) {
        state.collectionAlbum.claimedGoalIds.push(COLLECTION_ALBUM_GOAL.id);
      }
      if (!state.cosmetics.ownedBlockSkins.includes(COLLECTION_ALBUM_GOAL.reward.id)) {
        state.cosmetics.ownedBlockSkins.push(COLLECTION_ALBUM_GOAL.reward.id);
      }
    }

    return state;
  });

  newlyCompletedSets.forEach(setStatus => {
    const setUnlock = setStatus.set.completionReward.unlock;
    const unlockDetail = setUnlock?.type === 'finish'
      ? ` ${setUnlock.name} finish unlocked.`
      : '';
    showMilestoneMoment({
      eyebrow: 'Set complete',
      title: `${setStatus.set.title} finished`,
      detail: `${setStatus.set.completionReward.name} earned. ${setStatus.set.completionReward.detail}${unlockDetail}`,
      major: true,
      anchor: '.page-panel--album',
      announce: `${setStatus.set.title} set complete. ${setStatus.set.completionReward.name} earned.${unlockDetail}`,
    });
  });

  if (shouldClaimGrandReward) {
    showMilestoneMoment({
      eyebrow: 'Album complete',
      title: `${COLLECTION_ALBUM_GOAL.reward.name} unlocked`,
      detail: COLLECTION_ALBUM_GOAL.reward.detail,
      major: true,
      anchor: '.page-panel--album',
      announce: `${COLLECTION_ALBUM_GOAL.reward.name} finish unlocked for completing the collection album.`,
    });
  }

  updateCosmeticLabel();
}

function sanitiseColorSetting(value) {
  return COLORWAY_LOOKUP[value] ? value : 'orange';
}

function ensureSelectedColorway(options = {}) {
  colorSetting = sanitiseColorSetting(colorSetting);
  if (isColorwayOwned(colorSetting)) return false;
  if (options.preserveLegacy) {
    updateProgressionState(state => {
      if (!state.cosmetics.ownedColorways.includes(colorSetting)) {
        state.cosmetics.ownedColorways.push(colorSetting);
      }
      return state;
    });
    return true;
  }
  colorSetting = 'orange';
  return false;
}

function updateCosmeticLabel() {
  const skin = BLOCK_SKIN_LOOKUP[getEquippedBlockSkin()] || BLOCK_SKIN_LOOKUP.classic;
  const labelText = `${skin.name} finish equipped`;
  const labels = [
    document.getElementById('page-equipped-cosmetic-label'),
  ];
  labels.forEach(label => {
    if (label) label.textContent = labelText;
  });

  const dashboardFinish = document.getElementById('dashboard-finish');
  if (dashboardFinish) dashboardFinish.textContent = skin.name;

  const badge = getEquippedBadge();
  const badgeLabel = document.getElementById('page-equipped-badge-label');
  if (badgeLabel) {
    badgeLabel.textContent = badge ? `${badge.icon} ${badge.name} equipped` : 'Unlock badges to equip one here.';
  }
  const openBadgesButton = document.getElementById('btn-settings-badges');
  if (openBadgesButton) {
    openBadgesButton.disabled = BADGE_CATALOGUE.length === 0;
  }

  const albumBadgeCount = progressionState?.cosmetics?.earnedSetBadges?.length || 0;
  const dashboardAlbumBadgeLabel = document.getElementById('dashboard-album-badge');
  if (dashboardAlbumBadgeLabel) {
    dashboardAlbumBadgeLabel.textContent = albumBadgeCount ? `${albumBadgeCount} album badge${albumBadgeCount === 1 ? '' : 's'} earned` : 'No album badges yet';
  }

  const colourNote = document.getElementById('page-colour-note');
  if (colourNote) {
    const owned = getOwnedColorways().length;
    const total = COLORWAY_CATALOGUE.filter(colorway => colorway.id !== 'random').length + (isColorwayOwned('random') ? 1 : 0);
    colourNote.textContent = `${owned}/${total} colourways owned. Unlock more in the shop.`;
  }
}

function applyEquippedCosmeticSkin() {
  document.documentElement.dataset.cosmetic = getEquippedBlockSkin();
  updateCosmeticLabel();
}

function awardCoins(amount, reason, options = {}) {
  const wholeAmount = Math.max(0, Math.floor(amount));
  if (!wholeAmount) return 0;

  updateProgressionState(state => {
    state.coins.balance += wholeAmount;
    state.coins.lifetimeEarned += wholeAmount;
    return state;
  });

  if (!options.excludeFromRunSummary) {
    ensureRunSummary().coinsEarned += wholeAmount;
  }

  updateCoinUI();
  if (!options.silent) showCoinToast(wholeAmount, reason, options);
  return wholeAmount;
}

function spendCoins(amount, reason) {
  const wholeAmount = Math.max(0, Math.floor(amount));
  if (!wholeAmount || getCoinBalance() < wholeAmount) return false;

  updateProgressionState(state => {
    state.coins.balance -= wholeAmount;
    state.coins.lifetimeSpent += wholeAmount;
    return state;
  });

  updateCoinUI();
  showCoinToast(-wholeAmount, reason, { spend: true });
  return true;
}

function unlockColorway(colorId) {
  const colorway = COLORWAY_LOOKUP[colorId];
  if (!colorway || isColorwayOwned(colorId)) return true;
  if (colorId === 'random' && !hasRandomColourwayEligibility()) return false;
  if (!spendCoins(colorway.price, `${colorway.name} unlocked`)) return false;

  updateProgressionState(state => {
    if (!state.cosmetics.ownedColorways.includes(colorId)) {
      state.cosmetics.ownedColorways.push(colorId);
    }
    return state;
  });

  showMilestoneMoment({
    eyebrow: 'New colourway',
    title: `${colorway.name} unlocked`,
    detail: 'It can be equipped straight away for future racks.',
    major: false,
    anchor: '.page-panel--shop',
    announce: `${colorway.name} colourway unlocked.`,
  });
  evaluateCollectionAlbumRewards();
  updateCosmeticLabel();
  return true;
}

function equipColorway(colorId) {
  if (!isColorwayOwned(colorId) || !COLORWAY_LOOKUP[colorId]) return false;
  colorSetting = colorId;
  applyColor(colorSetting);
  saveSettings();
  populateSettingsPage();
  renderDashboard();
  return true;
}

function unlockBlockSkin(skinId) {
  const skin = BLOCK_SKIN_LOOKUP[skinId];
  if (!skin || isBlockSkinOwned(skinId)) return true;
  if (!spendCoins(skin.price, `${skin.name} unlocked`)) return false;

  updateProgressionState(state => {
    if (!state.cosmetics.ownedBlockSkins.includes(skinId)) {
      state.cosmetics.ownedBlockSkins.push(skinId);
    }
    return state;
  });

  updateCosmeticLabel();
  showMilestoneMoment({
    eyebrow: 'New finish',
    title: `${skin.name} unlocked`,
    detail: 'It is ready to equip straight away.',
    major: true,
    anchor: '.collection-head',
    announce: `${skin.name} finish unlocked.`,
  });
  evaluateCollectionAlbumRewards();
  return true;
}

function equipBlockSkin(skinId) {
  if (!isBlockSkinOwned(skinId) || !BLOCK_SKIN_LOOKUP[skinId]) return false;

  updateProgressionState(state => {
    state.cosmetics.equippedBlockSkin = skinId;
    return state;
  });

  applyEquippedCosmeticSkin();
  return true;
}

function calculateClearCoinReward(totalRegions, comboValue) {
  if (!totalRegions) return 0;
  const baseReward = (totalRegions * COIN_REWARDS.clearRegion)
    + (Math.max(0, totalRegions - 1) * COIN_REWARDS.multiClearBonus)
    + (Math.max(0, comboValue - 1) * COIN_REWARDS.comboStep);
  return scaleCoinReward(baseReward, 'run');
}

function clearRewardLabel(totalRegions, comboValue) {
  if (totalRegions >= 2 && comboValue >= 2) return `${totalRegions}-clear combo`;
  if (totalRegions >= 2) return `${totalRegions}-clear move`;
  if (comboValue >= 2) return 'Combo bonus';
  return 'Clear reward';
}

function calculateEndRunCoinReward(finalScore) {
  const scoreBands = Math.min(
    COIN_REWARDS.endRunScoreBandCap,
    Math.floor(Math.max(0, finalScore) / 50)
  );
  const baseReward = COIN_REWARDS.endRunBase + (scoreBands * COIN_REWARDS.endRunPer50Score);
  return scaleCoinReward(baseReward, 'run');
}

function getRoundMilestoneReward(roundsCompleted) {
  if (!roundsCompleted) return 0;
  return roundsCompleted % COIN_REWARDS.roundMilestoneEvery === 0
    ? scaleCoinReward(COIN_REWARDS.roundMilestoneReward, 'run')
    : 0;
}

function showCoinToast(amount, reason, options = {}) {
  const isSpend = !!options.spend || amount < 0;
  const prefix = amount >= 0 ? '+' : '−';
  enqueueGameBanner({
    kicker: isSpend ? 'Spent' : 'Coins',
    title: `🪙 ${prefix}${Math.abs(amount)} · ${reason}`,
  });
}

function awardMissionCoins(amount, missionName = 'Mission complete') {
  return awardCoins(amount, missionName, { silent: true, celebrate: true, major: amount >= 18 });
}

function ensureDailyMissionsForToday() {
  const todayKey = getLocalDateKey();
  const currentDate = progressionState?.dailyMissions?.date || '';
  const currentTemplateVersion = clampWholeNumber(progressionState?.dailyMissions?.templateVersion, 0);
  if (currentDate === todayKey
    && currentTemplateVersion === DAILY_MISSION_VERSION
    && progressionState?.dailyMissions?.missions?.length) {
    return progressionState.dailyMissions;
  }

  const nextState = updateProgressionState(state => {
    const refreshCount = clampWholeNumber(state.dailyMissions?.refreshCount, 0);
    state.dailyMissions = {
      date: todayKey,
      missions: createDailyMissionSet(todayKey),
      completedIds: [],
      claimedIds: [],
      refreshCount: currentDate ? refreshCount + 1 : refreshCount,
      templateVersion: DAILY_MISSION_VERSION,
    };
    return state;
  });

  return nextState.dailyMissions;
}

function syncDisplayedStreak() {
  const todayKey = getUTCDateKey();
  const yesterdayKey = getPreviousDateKey(todayKey);

  updateProgressionState(state => {
    if (state.streak.lastActiveDate && ![todayKey, yesterdayKey].includes(state.streak.lastActiveDate)) {
      state.streak.current = 0;
    }
    return state;
  });
}

function ensureDailyChallengeForToday() {
  const todayKey = getUTCDateKey();
  return ensureDailyChallengeForDate(todayKey);
}

function ensureDailyChallengeForDate(dateKey = getUTCDateKey()) {
  const targetDateKey = isPlayableDailyChallengeDate(dateKey) ? dateKey : getUTCDateKey();
  const challengeSeed = getDailyChallengeSeed(targetDateKey);
  const targetScore = getDailyChallengeTarget(challengeSeed);
  const todayKey = getUTCDateKey();

  if (targetDateKey === todayKey) {
    syncDisplayedStreak();
    const existing = progressionState?.dailyChallenge;
    if (existing?.date === todayKey && existing.seed === challengeSeed && existing.targetScore === targetScore) {
      return existing;
    }

    const nextState = updateProgressionState(state => {
      const previous = sanitiseDailyChallengeState(state.dailyChallenge);
      state.dailyChallenge = {
        date: todayKey,
        seed: challengeSeed,
        targetScore,
        bestScore: previous.date === todayKey ? previous.bestScore : 0,
        completedAt: previous.date === todayKey ? previous.completedAt : '',
        attempts: previous.date === todayKey ? previous.attempts : 0,
        rewardClaimedDate: previous.date === todayKey ? previous.rewardClaimedDate : '',
      };
      return state;
    });
    return nextState.dailyChallenge;
  }

  const archived = progressionState?.dailyChallengeArchive?.[targetDateKey];
  if (archived && archived.date === targetDateKey) return archived;

  return {
    date: targetDateKey,
    seed: challengeSeed,
    targetScore,
    bestScore: 0,
    completedAt: '',
    attempts: 0,
    rewardClaimedDate: '',
  };
}

function updateArchivedDailyChallenge(dateKey, updater) {
  if (!isHistoricalDailyChallengeDate(dateKey)) return;
  updateProgressionState(state => {
    const existing = sanitiseDailyChallengeState(
      state.dailyChallengeArchive?.[dateKey] || ensureDailyChallengeForDate(dateKey)
    );
    const updated = sanitiseDailyChallengeState(updater(existing) || existing);
    const archive = sanitiseDailyChallengeArchive(state.dailyChallengeArchive);
    archive[dateKey] = {
      ...updated,
      date: dateKey,
      seed: getDailyChallengeSeed(dateKey),
      targetScore: getDailyChallengeTarget(getDailyChallengeSeed(dateKey)),
    };
    state.dailyChallengeArchive = archive;
    return state;
  });
}

function getDisplayedStreakCount() {
  const streak = progressionState?.streak;
  if (!streak) return 0;
  const todayKey = getUTCDateKey();
  const yesterdayKey = getPreviousDateKey(todayKey);
  if (streak.lastActiveDate && ![todayKey, yesterdayKey].includes(streak.lastActiveDate)) return 0;
  return streak.current;
}

function getDailyChallengeRewardAmount(streakCount) {
  const baseReward = DAILY_CHALLENGE_REWARD_BASE + Math.min(
    DAILY_CHALLENGE_STREAK_BONUS_CAP,
    Math.max(0, streakCount - 1) * DAILY_CHALLENGE_STREAK_STEP
  );
  return scaleCoinReward(baseReward, 'challenge');
}

function getHistoricalDailyChallengeRewardAmount() {
  const baseline = getDailyChallengeRewardAmount(1);
  return Math.max(1, Math.floor(baseline * DAILY_CHALLENGE_PAST_REWARD_MULTIPLIER));
}

function getDailyChallengeStatus(challenge = ensureDailyChallengeForDate(selectedDailyChallengeDateKey || getUTCDateKey())) {
  const displayedStreak = getDisplayedStreakCount();
  const isHistorical = isHistoricalDailyChallengeDate(challenge.date);
  const complete = challenge.completedAt === challenge.date;
  const reward = isHistorical
    ? getHistoricalDailyChallengeRewardAmount()
    : getDailyChallengeRewardAmount(complete ? displayedStreak : Math.max(1, displayedStreak || 1));
  return {
    complete,
    reward,
    streak: displayedStreak,
    isHistorical,
  };
}

function getDailyChallengeBestLabel(challenge) {
  if (!challenge.bestScore) return 'Best 0';
  return `Best ${challenge.bestScore}`;
}

function markDailyChallengeAttempt() {
  if (!isDailyChallengeSession()) return;
  const challenge = ensureDailyChallengeForDate(dailyChallengeState.date || selectedDailyChallengeDateKey || getUTCDateKey());
  if (isHistoricalDailyChallengeDate(challenge.date)) {
    updateArchivedDailyChallenge(challenge.date, record => ({
      ...record,
      attempts: record.attempts + 1,
    }));
    return;
  }
  updateProgressionState(state => {
    if (state.dailyChallenge.date === challenge.date) state.dailyChallenge.attempts += 1;
    return state;
  });
}

function maybeCompleteDailyChallenge() {
  if (!isDailyChallengeSession()) return;

  const challenge = ensureDailyChallengeForDate(dailyChallengeState.date || getUTCDateKey());
  if (challenge.completedAt === challenge.date) return;

  const todayKey = challenge.date;
  const yesterdayKey = getPreviousDateKey(todayKey);
  let streakCount = 1;
  const isHistorical = isHistoricalDailyChallengeDate(challenge.date);

  if (isHistorical) {
    updateArchivedDailyChallenge(challenge.date, record => ({
      ...record,
      bestScore: Math.max(record.bestScore, score),
      completedAt: challenge.date,
      rewardClaimedDate: challenge.date,
    }));
    const rewardAmount = getHistoricalDailyChallengeRewardAmount();
    awardCoins(rewardAmount, `${getDailyChallengeLabel(challenge.date)} challenge`, {
      silent: true,
      celebrate: true,
      major: false,
    });
    showMilestoneMoment({
      eyebrow: 'Daily archive',
      title: `${getDailyChallengeLabel(challenge.date)} board cleared`,
      detail: `+${rewardAmount} coins`,
      major: false,
      anchor: '#score-wrap',
      announce: `${getDailyChallengeLabel(challenge.date)} challenge complete. ${rewardAmount} coins awarded.`,
    });
    renderDashboard();
    return;
  }

  updateProgressionState(state => {
    state.dailyChallenge.bestScore = Math.max(state.dailyChallenge.bestScore, score);
    state.dailyChallenge.completedAt = todayKey;

    if (state.streak.lastActiveDate === todayKey) {
      streakCount = Math.max(1, state.streak.current);
    } else if (state.streak.lastActiveDate === yesterdayKey) {
      streakCount = state.streak.current + 1;
      state.streak.current = streakCount;
      state.streak.lastActiveDate = todayKey;
    } else {
      streakCount = 1;
      state.streak.current = 1;
      state.streak.lastActiveDate = todayKey;
    }

    state.streak.best = Math.max(state.streak.best, state.streak.current);
    return state;
  });

  const rewardAmount = getDailyChallengeRewardAmount(streakCount);
  updateProgressionState(state => {
    state.dailyChallenge.rewardClaimedDate = todayKey;
    return state;
  });
  awardCoins(rewardAmount, `Daily challenge day ${streakCount}`, {
    silent: true,
    celebrate: true,
    major: streakCount >= 3,
  });
  showMilestoneMoment({
    eyebrow: 'Daily challenge',
    title: 'Board cleared',
    detail: `Streak ${streakCount} · +${rewardAmount} coins`,
    major: streakCount >= 3,
    anchor: '#score-wrap',
    announce: `Daily challenge complete. ${rewardAmount} coins awarded. ${streakCount} day streak.`,
  });
  renderDashboard();
}

function syncDailyChallengeScoreProgress() {
  if (!isDailyChallengeSession()) return;
  const challenge = ensureDailyChallengeForDate(dailyChallengeState.date || getUTCDateKey());
  if (score <= challenge.bestScore) return;

  if (isHistoricalDailyChallengeDate(challenge.date)) {
    updateArchivedDailyChallenge(challenge.date, record => ({
      ...record,
      bestScore: Math.max(record.bestScore, score),
    }));
    return;
  }

  updateProgressionState(state => {
    if (state.dailyChallenge.date === challenge.date) {
      state.dailyChallenge.bestScore = Math.max(state.dailyChallenge.bestScore, score);
    }
    return state;
  });
}

function getDailyMissionProgressText(mission) {
  const progress = Math.min(mission.progress, mission.goal);
  if (mission.kind === 'combo') return `Best combo ${progress}/${mission.goal}`;
  if (mission.kind === 'runs') return `${progress}/${mission.goal} runs completed`;
  if (mission.kind === 'racks') return `${progress}/${mission.goal} racks completed`;
  if (mission.kind === 'regions') return `${progress}/${mission.goal} regions cleared`;
  if (mission.kind === 'blocks') return `${progress}/${mission.goal} blocks placed`;
  return `${progress}/${mission.goal} points scored`;
}

function getDailyMissionCounts() {
  const missionState = progressionState?.dailyMissions;
  const total = missionState?.missions?.length || 0;
  const completed = missionState?.claimedIds?.length || 0;
  return { completed, total };
}

function setTextIfPresent(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value;
  return element;
}

function renderDailyChallengePanels() {
  const todayKey = getUTCDateKey();
  if (!isPlayableDailyChallengeDate(selectedDailyChallengeDateKey)) {
    selectedDailyChallengeDateKey = todayKey;
  }
  const challenge = ensureDailyChallengeForDate(selectedDailyChallengeDateKey);
  const challengeStatus = getDailyChallengeStatus(challenge);
  const isFirstRunExperience = getCompletedRunCount() === 0;
  const title = getDailyChallengeLabel(challenge.date);
  const copy = challengeStatus.complete
    ? 'Board cleared. Pick another day or replay this one for practice.'
    : challengeStatus.isHistorical
      ? 'Clear every locked block until every ring is gone to finish this archived board.'
      : isFirstRunExperience
        ? 'Set your first score on today’s reinforced board by clearing every locked block.'
        : 'Clear every locked block until every ring is gone to complete today’s board.';
  const progressLabel = challengeStatus.complete
    ? `Reward claimed: ${challengeStatus.reward} coins`
    : `Reward: ${challengeStatus.reward} coins`;
  const windowLabel = challengeStatus.isHistorical ? 'Past 7 days' : 'Today';

  setTextIfPresent('dashboard-daily-title', title);
  setTextIfPresent('dashboard-daily-copy', copy);
  setTextIfPresent('dashboard-daily-progress', progressLabel);
  setTextIfPresent('dashboard-daily-window', windowLabel);

  const dateSelect = document.getElementById('dashboard-daily-date');
  if (dateSelect) {
    const dates = getRecentDailyChallengeDateKeys();
    const currentMarkup = dates
      .map(dateKey => `<option value="${dateKey}">${getDailyChallengeLabel(dateKey)}</option>`)
      .join('');
    if (dateSelect.innerHTML !== currentMarkup) dateSelect.innerHTML = currentMarkup;
    if (dateSelect.value !== challenge.date) dateSelect.value = challenge.date;
  }

  const playButton = document.getElementById('btn-dashboard-daily-play');
  if (playButton) {
    playButton.setAttribute('aria-label', challengeStatus.complete ? 'Replay selected daily challenge' : 'Play selected daily challenge');
  }
}

function renderDailyMissions() {
  const missionState = ensureDailyMissionsForToday();
  const list = document.getElementById('missions-list');
  const count = document.getElementById('missions-count');
  const subtitle = document.getElementById('missions-subtitle');
  const badge = document.getElementById('mission-badge');
  const { completed, total } = getDailyMissionCounts();

  if (count) count.textContent = `${completed}/${total} completed`;
  if (subtitle) subtitle.textContent = `Fresh goals for ${missionState.date}. Rewards are paid automatically when you finish them.`;
  if (badge) {
    badge.textContent = total ? `${completed}/${total}` : '0/0';
    badge.hidden = !total;
  }

  setTextIfPresent('dashboard-mission-card-title', total ? 'Today’s goals' : 'No goals today');
  setTextIfPresent('dashboard-mission-copy', total
    ? `${completed}/${total} missions settled so far.`
    : 'Fresh goals are on the way.');
  setTextIfPresent('dashboard-mission-card-progress', `${completed}/${total} completed`);

  if (!list) return;

  list.innerHTML = '';
  if (!missionState.missions.length) {
    const empty = document.createElement('p');
    empty.className = 'missions-empty';
    empty.textContent = 'No daily missions are available right now.';
    list.appendChild(empty);
    return;
  }

  for (const mission of missionState.missions) {
    const progress = Math.min(mission.progress, mission.goal);
    const isClaimed = missionState.claimedIds.includes(mission.id);
    const isCompleted = missionState.completedIds.includes(mission.id);
    const item = document.createElement('article');
    item.className = 'mission-item';
    if (isClaimed) item.classList.add('mission-item--claimed');
    if (isCompleted && !isClaimed) item.classList.add('mission-item--complete');

    const percentage = Math.max(0, Math.min(100, Math.round((progress / mission.goal) * 100)));
    item.innerHTML = `
      <div class="mission-item__top">
        <div>
          <h3>${mission.title}</h3>
          <p>${mission.description}</p>
        </div>
        <div class="mission-item__reward">🪙 ${mission.reward}</div>
      </div>
      <div class="mission-progress" aria-hidden="true">
        <span style="width:${percentage}%"></span>
      </div>
      <div class="mission-item__footer">
        <span>${getDailyMissionProgressText(mission)}</span>
        <strong>${isClaimed ? 'Claimed' : isCompleted ? 'Complete' : 'In progress'}</strong>
      </div>
    `;
    list.appendChild(item);
  }
}

function renderQuestBoard(options = {}) {
  const status = getQuestBoardStatus(options);
  const questsSubtitle = document.getElementById('quests-subtitle');
  const questCount = document.getElementById('quests-count');
  const questList = document.getElementById('quest-list');

  const renderQuestItems = (target, { compact = false } = {}) => {
    if (!target) return;
    target.innerHTML = '';
    status.chains.forEach(item => {
      const article = document.createElement('article');
      article.className = `quest-item${item.isComplete ? ' quest-item--complete' : ''}${item.isChanged ? ' quest-item--changed' : ''}${compact ? ' quest-item--compact' : ''}`;
      const currentStepMarkup = item.currentStep
        ? `
          <div class="quest-item__step">
            <strong>Do this now</strong>
            <span>${item.currentStep.title}</span>
            <p>${item.currentStep.description}</p>
            <p>${getQuestStepContextText(item.currentStep)}</p>
          </div>
          <div class="quest-progress" aria-hidden="true"><span style="width:${item.progressPercent}%"></span></div>
          <div class="quest-item__footer">
            <span>${getQuestStepProgressText(item.currentStep, item.currentProgress)}</span>
            <strong>${item.nextStep ? `Next unlock · ${item.nextStep.title}` : 'Final step'}</strong>
          </div>
        `
        : `
          <div class="quest-item__step">
            <strong>Chain complete</strong>
            <span>${item.chain.summary}</span>
            <p>Final reward settled for this cycle.</p>
          </div>
          <div class="quest-item__footer">
            <span>All steps finished</span>
            <strong>${item.finalRewardText}</strong>
          </div>
        `;

      article.innerHTML = `
        <div class="quest-item__top">
          <div>
            <span class="quest-item__kicker">${item.chain.kicker}</span>
            <h3>${item.chain.title}</h3>
            <p>${item.chain.description}</p>
          </div>
          <div class="quest-item__reward">${item.finalRewardText}</div>
        </div>
        ${currentStepMarkup}
      `;
      target.appendChild(article);
    });
  };

  if (questsSubtitle) {
    questsSubtitle.textContent = 'Only one step is active in each chain. Finish the active step to unlock the next one and collect rewards.';
  }
  if (questCount) {
    questCount.textContent = `${status.completed}/${status.total} chains complete`;
  }

  const currentChain = status.chains.find(item => !item.isComplete && item.currentStep);
  setTextIfPresent('dashboard-quest-card-title', currentChain ? currentChain.chain.title : 'Weekly routes settled');
  setTextIfPresent('dashboard-quest-card-copy', currentChain
    ? `${currentChain.currentStep.title} is active now. Complete it to reveal the next step.`
    : 'Every active chain is complete for this cycle.');
  setTextIfPresent('dashboard-quest-card-progress', `${status.completed}/${status.total} chains complete`);
  setTextIfPresent('dashboard-quest-card-timer', status.countdown);

  renderQuestItems(questList);
}

function getQuestStepContextText(step) {
  if (!step || typeof step !== 'object') return 'Complete the live objective to keep this chain moving.';
  if (step.metric === 'singleRunScore') return 'Why this matters: stronger scoring runs unlock chain rewards faster.';
  if (step.metric === 'totalScore') return 'Why this matters: every run adds progress, so steady play still counts.';
  if (step.metric === 'regionsCleared' || step.metric === 'biggestClear') return 'Why this matters: line and box clears keep your board healthy for future turns.';
  if (step.metric === 'maxCombo' || step.metric === 'coachMaxCombo') return 'Why this matters: combos boost points and teach cleaner sequencing.';
  if (step.metric === 'racksCompleted') return 'Why this matters: surviving more racks helps your weekly placement and mission progress.';
  if (step.metric === 'coachRuns' || step.metric === 'coachRegions') return 'Why this matters: Coach Mode highlights safer moves while you learn.';
  return 'Complete the live objective to keep this chain moving.';
}

function getCollectionSubtitle() {
  const ownedCount = getOwnedBlockSkins().length;
  const totalCount = COSMETIC_CATALOGUE.blockSkins.length;
  if (ownedCount === totalCount) return 'Every finish is unlocked and ready to equip.';
  return `${ownedCount}/${totalCount} finishes owned, including album rewards.`;
}

function getColorwaySubtitle() {
  const ownedCount = getOwnedColorways().length;
  const totalCount = COLORWAY_CATALOGUE.filter(colorway => colorway.id !== 'random').length + (isColorwayOwned('random') ? 1 : 0);
  if (ownedCount === totalCount) return 'Every colourway is unlocked and ready to equip.';
  return `${ownedCount}/${totalCount} colourways owned.`;
}

function hasTopThreeWeeklyFinish() {
  const unlockedBadges = new Set(getUnlockedBadgeIds());
  return ['weekly-first', 'weekly-second', 'weekly-third'].some(id => unlockedBadges.has(id));
}

function hasRandomColourwayEligibility() {
  return hasTopThreeWeeklyFinish();
}

function getBadgeStateLabel(badge, isUnlocked, isEquipped) {
  if (isEquipped) return 'Equipped';
  if (isUnlocked) return 'Unlocked';
  if (badge.source === 'score' && badge.threshold) return `Locked · best ${bestScore}/${badge.threshold}`;
  if (badge.source === 'leaderboard' && badge.rank) return `Locked · reach ${formatOrdinal(badge.rank)}`;
  if (badge.source === 'leaderboard-top' && badge.threshold) {
    const currentRank = weeklyLeaderboardViewState.currentPlayerRank || 0;
    return currentRank > 0
      ? `Locked · rank ${formatOrdinal(currentRank)}/${formatOrdinal(badge.threshold)}`
      : `Locked · reach top ${badge.threshold}`;
  }
  if (badge.source === 'quest' && badge.threshold) {
    const completedQuestChains = getQuestBoardStatus().completed;
    return `Locked · chains ${completedQuestChains}/${badge.threshold}`;
  }
  if (badge.source === 'collection' && badge.threshold) {
    const completedSets = getCollectionAlbumStatus().completedCount;
    return `Locked · sets ${completedSets}/${badge.threshold}`;
  }
  if (badge.source === 'colorway-count' && badge.threshold) {
    return `Locked · colourways ${getOwnedColorways().length}/${badge.threshold}`;
  }
  if (badge.source === 'finish-count' && badge.threshold) {
    return `Locked · finishes ${getOwnedBlockSkins().length}/${badge.threshold}`;
  }
  if (badge.source === 'collection-items' && badge.threshold) {
    const ownedItems = getOwnedColorways().length + getOwnedBlockSkins().length;
    return `Locked · collection items ${ownedItems}/${badge.threshold}`;
  }
  if (badge.source === 'coin-balance' && badge.threshold) {
    return `Locked · coins ${getCoinBalance()}/${badge.threshold}`;
  }
  if (badge.source === 'random-colourway') {
    return hasRandomColourwayEligibility() ? 'Locked · unlock Shuffle Glow' : 'Locked · finish weekly top 3';
  }
  if (badge.source === 'set-badge') {
    const earnedSetBadges = new Set(progressionState?.cosmetics?.earnedSetBadges || []);
    return earnedSetBadges.has(badge.setBadgeId) ? 'Ready to claim' : 'Locked · set reward';
  }
  return 'Locked';
}

function renderBadgePage() {
  const list = document.getElementById('badge-list');
  const count = document.getElementById('badges-count');
  const subtitle = document.getElementById('badges-subtitle');
  if (!list || !count || !subtitle) return;

  refreshBadgeMilestones({ announce: false });
  const unlockedBadgeIds = new Set(getUnlockedBadgeIds());
  const equippedBadgeId = getEquippedBadgeId();
  const unlockedCount = BADGE_CATALOGUE.filter(badge => unlockedBadgeIds.has(badge.id)).length;

  count.textContent = `${unlockedCount}/${BADGE_CATALOGUE.length} unlocked`;
  subtitle.textContent = unlockedCount
    ? 'Pick an unlocked badge to show beside your name on the weekly leaderboard.'
    : 'No badges unlocked yet. Keep playing to earn your first one.';

  list.innerHTML = '';
  BADGE_CATALOGUE.forEach(badge => {
    const isUnlocked = unlockedBadgeIds.has(badge.id);
    const isEquipped = equippedBadgeId === badge.id;
    const article = document.createElement('article');
    article.className = `badge-item${isUnlocked ? '' : ' badge-item--locked'}`;
    const tokenClass = badge.badgeVariant === 'golden-sparkle' ? ' badge-item__token--golden-sparkle' : '';
    const actionMarkup = isUnlocked
      ? `<button class="pill-btn${isEquipped ? ' pill-btn--secondary' : ''}" type="button" data-action="equip-badge" data-badge-id="${badge.id}" ${isEquipped ? 'disabled' : ''}>${isEquipped ? 'Equipped' : 'Equip'}</button>`
      : '';
    article.innerHTML = `
      <div class="badge-item__token${tokenClass}" aria-hidden="true">${badge.icon}</div>
      <div class="badge-item__body">
        <h3>${badge.name}</h3>
        <p>${isUnlocked ? badge.description : badge.unlockHint}</p>
        <div class="badge-item__meta">
          <span class="badge-item__state">${getBadgeStateLabel(badge, isUnlocked, isEquipped)}</span>
          ${actionMarkup}
        </div>
      </div>
    `;
    list.appendChild(article);
  });
}

function getShopActionMarkup({ owned, equipped, canAfford, price, itemId, collection }) {
  if (equipped) {
    return '<button class="pill-btn pill-btn--secondary" type="button" disabled>Equipped</button>';
  }
  if (owned) {
    return `<button class="pill-btn pill-btn--secondary" type="button" data-action="equip" data-item-id="${itemId}" data-collection="${collection}">Equip</button>`;
  }
  if (!price) {
    return '<button class="pill-btn pill-btn--secondary" type="button" disabled>Collection reward</button>';
  }
  return `<button class="pill-btn${canAfford ? '' : ' pill-btn--secondary'}" type="button" data-action="unlock" data-item-id="${itemId}" data-collection="${collection}" ${canAfford ? '' : 'disabled'}>Unlock · 🪙 ${price}</button>`;
}

function renderCosmeticsCollection() {
  const albumList = document.getElementById('collection-album-list');
  const albumCount = document.getElementById('collection-album-count');
  const albumSubtitle = document.getElementById('collection-album-subtitle');
  const albumSpotlight = document.getElementById('collection-album-spotlight');
  const albumGoalTitle = document.getElementById('collection-album-goal-title');
  const albumGoalCopy = document.getElementById('collection-album-goal-copy');
  const finishList = document.getElementById('collection-list');
  const colorwayList = document.getElementById('colorway-list');
  const balance = document.getElementById('collection-balance');
  const shopBalance = document.getElementById('shop-coin-balance');
  const finishSubtitle = document.getElementById('collection-subtitle');
  const colorwaySubtitle = document.getElementById('colorway-subtitle');
  if (!finishList || !colorwayList || !balance || !finishSubtitle || !colorwaySubtitle || !albumList || !albumCount || !albumSubtitle || !albumSpotlight || !albumGoalTitle || !albumGoalCopy) return;

  const coinBalance = getCoinBalance();
  const equippedSkin = getEquippedBlockSkin();
  const albumStatus = getCollectionAlbumStatus();
  balance.textContent = `🪙 ${coinBalance}`;
  if (shopBalance) shopBalance.textContent = `🪙 ${coinBalance}`;
  finishSubtitle.textContent = getCollectionSubtitle();
  colorwaySubtitle.textContent = getColorwaySubtitle();
  albumCount.textContent = `${albumStatus.completedCount}/${albumStatus.totalSets} sets complete`;
  albumSubtitle.textContent = albumStatus.allSetsComplete
    ? 'The binder is complete. Your Heirloom finish is ready in the collection below.'
    : 'Finish themed sets to earn prestige badges, then complete the full binder for an exclusive finish.';
  albumGoalTitle.textContent = COLLECTION_ALBUM_GOAL.reward.name;
  albumGoalCopy.textContent = albumStatus.grandRewardOwned
    ? 'Album reward unlocked and ready to equip from Block finishes.'
    : `${albumStatus.completedCount}/${albumStatus.totalSets} sets finished. ${COLLECTION_ALBUM_GOAL.description}`;
  if (albumStatus.spotlightSet) {
    const nextNames = albumStatus.spotlightSet.missingItems
      .slice(0, 2)
      .map(item => item.meta?.name || item.id)
      .join(' · ');
    albumSpotlight.textContent = albumStatus.spotlightSet.remainingCount === 1
      ? `${albumStatus.spotlightSet.set.title} is one item away · ${nextNames}`
      : `${albumStatus.spotlightSet.set.title} needs ${albumStatus.spotlightSet.remainingCount} more items · ${nextNames}`;
  } else {
    albumSpotlight.textContent = 'Every set reward has been banked. Enjoy the complete album.';
  }

  albumList.innerHTML = '';
  albumStatus.setStatuses.forEach(setStatus => {
    const card = document.createElement('article');
    card.className = `album-card${setStatus.isComplete ? ' album-card--complete' : ''}`;
    const missingSummary = setStatus.missingItems.length
      ? `Missing ${setStatus.missingItems.map(item => item.meta?.name || item.id).join(', ')}.`
      : 'Everything in this set is owned.';
    const badgeState = setStatus.rewardEarned ? 'Badge earned' : 'Badge waiting';
    const unlockRewardLabel = setStatus.set.completionReward.unlock?.type === 'finish'
      ? ` + ${setStatus.set.completionReward.unlock.name} finish`
      : '';
    const itemMarkup = setStatus.itemStatuses.map(item => `
      <li class="album-card__item${item.owned ? ' is-owned' : ''}">
        <span>${item.meta?.name || item.id}</span>
        <strong>${item.owned ? 'Owned' : 'Locked'}</strong>
      </li>
    `).join('');
    card.innerHTML = `
      <div class="album-card__head">
        <div>
          <span class="album-card__season">${setStatus.set.season}</span>
          <h3>${setStatus.set.title}</h3>
          <p>${setStatus.set.description}</p>
        </div>
        <span class="album-card__count">${setStatus.ownedCount}/${setStatus.totalCount}</span>
      </div>
      <div class="album-card__reward">
        <strong>${setStatus.set.completionReward.name}</strong>
        <span>${badgeState}${unlockRewardLabel}</span>
      </div>
      <ul class="album-card__items">${itemMarkup}</ul>
      <div class="album-card__footer">
        <span>${missingSummary}</span>
        <strong>${setStatus.isComplete ? 'Set complete' : `${setStatus.remainingCount} to go`}</strong>
      </div>
    `;
    albumList.appendChild(card);
  });

  colorwayList.innerHTML = '';
  const shouldShowRandomColourway = isColorwayOwned('random') || hasRandomColourwayEligibility();
  for (const colorway of COLORWAY_CATALOGUE.filter(item => item.id !== 'random' || shouldShowRandomColourway)) {
    const owned = isColorwayOwned(colorway.id);
    const equipped = colorSetting === colorway.id;
    const canAfford = coinBalance >= colorway.price;
    const meetsRequirement = colorway.id === 'random' ? hasRandomColourwayEligibility() : true;
    const set = getCollectionSetForItem('colorway', colorway.id);
    const status = equipped ? 'Equipped' : owned ? 'Unlocked' : 'Locked';
    const stateClass = equipped ? 'is-equipped' : owned ? 'is-unlocked' : 'is-locked';
    const costLabel = colorway.price ? `🪙 ${colorway.price}` : 'Free';
    const card = document.createElement('article');
    card.className = 'cosmetic-card cosmetic-card--colorway';
    card.dataset.colorway = colorway.id;
    if (equipped) card.classList.add('cosmetic-card--equipped');
    if (!owned) card.classList.add('cosmetic-card--locked');

    const swatches = (Array.isArray(colorway.swatches) ? colorway.swatches : [colorway.primary || '#888888'])
      .map(swatch => `<span class="cosmetic-card__tile" style="--swatch:${swatch};background:${swatch};"></span>`)
      .join('');
    const label = `${colorway.icon} ${colorway.name}`;
    card.innerHTML = `
      <div class="cosmetic-card__preview" aria-hidden="true">${swatches}</div>
      <div class="cosmetic-card__body">
        <div class="cosmetic-card__head">
          <h3>${label}</h3>
          <span class="cosmetic-card__state ${stateClass}">${status}</span>
        </div>
        <p>${colorway.description}</p>
        <div class="cosmetic-card__footer">
          <div class="cosmetic-card__meta">
            <span>${colorway.id === 'random' && !owned ? `${costLabel} · top 3 weekly required` : costLabel}</span>
            ${set ? `<span>${set.title}</span>` : ''}
          </div>
          ${getShopActionMarkup({ owned, equipped, canAfford: canAfford && meetsRequirement, price: colorway.price, itemId: colorway.id, collection: 'colorway' })}
        </div>
      </div>
    `;
    colorwayList.appendChild(card);
  }

  finishList.innerHTML = '';
  for (const skin of COSMETIC_CATALOGUE.blockSkins) {
    const owned = isBlockSkinOwned(skin.id);
    const equipped = equippedSkin === skin.id;
    const canAfford = coinBalance >= skin.price;
    const set = getCollectionSetForItem('finish', skin.id);
    const card = document.createElement('article');
    card.className = 'cosmetic-card';
    card.dataset.cosmetic = skin.id;
    if (equipped) card.classList.add('cosmetic-card--equipped');
    if (!owned) card.classList.add('cosmetic-card--locked');

    const status = equipped ? 'Equipped' : owned ? 'Unlocked' : 'Locked';
    const stateClass = equipped ? 'is-equipped' : owned ? 'is-unlocked' : 'is-locked';
    const isCollectionReward = skin.unlockSource === 'collection';
    const costLabel = skin.price ? `🪙 ${skin.price}` : isCollectionReward ? 'Set reward' : 'Free';

    card.innerHTML = `
      <div class="cosmetic-card__preview" aria-hidden="true">
        <span class="cosmetic-card__tile"></span>
        <span class="cosmetic-card__tile"></span>
        <span class="cosmetic-card__tile"></span>
      </div>
      <div class="cosmetic-card__body">
        <div class="cosmetic-card__head">
          <h3>${skin.name}</h3>
          <span class="cosmetic-card__state ${stateClass}">${status}</span>
        </div>
        <p>${skin.description}</p>
        <div class="cosmetic-card__footer">
          <div class="cosmetic-card__meta">
            <span>${costLabel}</span>
            <span>${set ? set.title : skin.unlockSource === 'album' ? 'Album grand reward' : isCollectionReward ? 'Collection set reward' : 'Core collection'}</span>
          </div>
          ${getShopActionMarkup({ owned, equipped, canAfford, price: skin.price, itemId: skin.id, collection: 'finish' })}
        </div>
      </div>
    `;

    finishList.appendChild(card);
  }
}

function updateDailyMissionProgress(kind, value, mode = 'increment') {
  const amount = Math.max(0, Math.floor(value));
  if (!amount) return;

  ensureDailyMissionsForToday();
  const rewardsToGrant = [];

  updateProgressionState(state => {
    const missionState = state.dailyMissions;
    if (!missionState || !Array.isArray(missionState.missions)) return state;

    for (const mission of missionState.missions) {
      if (mission.kind !== kind) continue;

      if (mode === 'max') {
        mission.progress = Math.max(mission.progress, amount);
      } else {
        mission.progress += amount;
      }

      if (mission.progress >= mission.goal && !missionState.completedIds.includes(mission.id)) {
        missionState.completedIds.push(mission.id);
      }

      if (mission.progress >= mission.goal && !missionState.claimedIds.includes(mission.id)) {
        missionState.claimedIds.push(mission.id);
        rewardsToGrant.push({
          reward: mission.reward,
          reason: `${mission.title} complete`,
          missionTitle: mission.title,
        });
      }
    }

    return state;
  });

  renderDailyMissions();
  rewardsToGrant.forEach(({ reward, reason, missionTitle }) => {
    awardMissionCoins(reward, reason);
    showMilestoneMoment({
      eyebrow: 'Daily goal',
      title: missionTitle,
      detail: `Complete · +${reward} coins`,
      major: reward >= 18,
      anchor: '#score-wrap',
      announce: `Daily mission complete. ${missionTitle}. ${reward} coins awarded.`,
    });
  });
}

// ── Piece helpers ──────────────────────────────────────────
function bounds(cells) {
  let minR = N, maxR = 0, minC = N, maxC = 0;
  for (const [r, c] of cells) {
    if (r < minR) minR = r; if (r > maxR) maxR = r;
    if (c < minC) minC = c; if (c > maxC) maxC = c;
  }
  return { minR, maxR, minC, maxC, rows: maxR - minR + 1, cols: maxC - minC + 1 };
}

function canPlace(cells, row, col) {
  for (const [dr, dc] of cells) {
    const r = row + dr, c = col + dc;
    if (r < 0 || r >= N || c < 0 || c >= N) return false;
    if (board[r][c]) return false;
  }
  return true;
}

function canPlaceAnywhere(cells) {
  for (let r = 0; r < N; r++)
    for (let c = 0; c < N; c++)
      if (canPlace(cells, r, c)) return true;
  return false;
}

// ── Arbitrary-board placement helpers (for order-checking) ─
function canPlaceOnBoard(cells, row, col, b) {
  for (const [dr, dc] of cells) {
    const r = row + dr, c = col + dc;
    if (r < 0 || r >= N || c < 0 || c >= N) return false;
    if (b[r][c]) return false;
  }
  return true;
}

function canPlaceAnywhereOnBoard(cells, b) {
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      if (canPlaceOnBoard(cells, r, c, b)) return true;
    }
  }
  return false;
}

function estimateTightPocketCount(b) {
  let pockets = 0;
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      if (b[r][c]) continue;
      let blockedNeighbours = 0;
      const neighbours = [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]];
      for (const [nr, nc] of neighbours) {
        if (nr < 0 || nr >= N || nc < 0 || nc >= N || b[nr][nc]) blockedNeighbours++;
      }
      if (blockedNeighbours >= 3) pockets++;
    }
  }
  return pockets;
}

function findSmallRecoveryPiece(targetBoard) {
  const candidates = PIECE_DEFS.filter(piece => piece.length <= 3 && canPlaceAnywhereOnBoard(piece, targetBoard));
  if (!candidates.length) return null;
  return candidates[Math.floor(randomValue() * candidates.length)];
}

function ensureSmallRecoveryPieceInRack(rack, targetBoard) {
  const hasSmallFit = rack.some(piece => piece.length <= 3 && canPlaceAnywhereOnBoard(piece, targetBoard));
  if (hasSmallFit) return;
  const recoveryPiece = findSmallRecoveryPiece(targetBoard);
  if (!recoveryPiece) return;
  const replaceIndex = rack.findIndex(piece => piece.length > 3);
  if (replaceIndex >= 0) {
    rack[replaceIndex] = recoveryPiece;
    return;
  }
  rack[Math.floor(randomValue() * rack.length)] = recoveryPiece;
}

function getPlacementsOnBoard(piece, targetBoard) {
  const placements = [];
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      if (canPlaceOnBoard(piece, r, c, targetBoard)) placements.push([r, c]);
    }
  }
  return placements;
}

function placePieceOnBoard(piece, row, col, targetBoard) {
  const nextBoard = targetBoard.map(r => [...r]);
  for (const [dr, dc] of piece) nextBoard[row + dr][col + dc] = 1;
  return applyClears(nextBoard, getClearsOnBoard(nextBoard));
}

// Returns true when an order has at least one complete placement path.
function canFitAllInOrder(order, targetBoard, depth = 0) {
  if (depth >= order.length) return true;
  const slotIndex = order[depth];
  const placements = getPlacementsOnBoard(pieces[slotIndex], targetBoard);
  if (!placements.length) return false;

  for (const [row, col] of placements) {
    const nextBoard = placePieceOnBoard(pieces[slotIndex], row, col, targetBoard);
    if (canFitAllInOrder(order, nextBoard, depth + 1)) return true;
  }

  return false;
}

// Returns true when only some orderings allow all pieces to be placed –
// meaning the player must choose carefully which piece to play first.
function orderMatters() {
  if (rackSize <= 1) return false;
  const unplaced = Array.from({ length: rackSize }, (_, i) => i).filter(i => !used[i]);
  if (unplaced.length <= 1) return false;

  const perms = getPermutations(unplaced);
  let solvableOrders = 0;
  for (const order of perms) {
    if (canFitAllInOrder(order, board)) solvableOrders++;
  }
  // True only if at least one ordering works but not all do.
  return solvableOrders > 0 && solvableOrders < perms.length;
}

function randomPiece() {
  return PIECE_DEFS[Math.floor(randomValue() * PIECE_DEFS.length)];
}

function getPieceDifficultyProfile() {
  const roundsCompleted = runSummary?.stats?.racksCompleted || 0;
  const randomMixChance = roundsCompleted >= 20 ? 0.10 : 0;

  // Focus the first 150 score on forgiving shapes only.
  if (score <= 150) {
    return {
      maxCells: 3,
      minSmallPieces: 2,
      fillCap: 0.12,
      randomMixChance,
    };
  }

  // Ramp difficulty roughly every 100–150 points (125-point bands).
  const rampStage = Math.min(6, Math.floor((score - 151) / 125) + 1);
  const stagedProfiles = [
    { maxCells: 4, minSmallPieces: 1, fillCap: 0.45 },
    { maxCells: 5, minSmallPieces: 1, fillCap: 0.75 },
    { maxCells: 5, minSmallPieces: 0, fillCap: 1.00 },
    { maxCells: 5, minSmallPieces: 0, fillCap: 1.20 },
    { maxCells: 5, minSmallPieces: 0, fillCap: 1.35 },
    { maxCells: 5, minSmallPieces: 0, fillCap: 1.50 },
  ];

  return {
    ...stagedProfiles[rampStage - 1],
    randomMixChance,
  };
}

// ── Difficulty-weighted piece selection ────────────────────
// As score grows, larger/harder pieces become progressively more likely.
function weightedRandomPiece(options = {}) {
  const {
    targetScore = score,
    pool = PIECE_DEFS,
    fillCapOverride,
  } = options;

  if (!Array.isArray(pool) || pool.length === 0) return randomPiece();

  // fill: 0 at score 0, 1 at score 200, reaches 1.5 at score 300
  const rawFill = Math.min(1.5, targetScore / 200);
  const fill = typeof fillCapOverride === 'number' ? Math.min(rawFill, fillCapOverride) : rawFill;

  let totalWeight = 0;
  const weights = pool.map(piece => {
    const weight = 1 + fill * (piece.length - 1) * 0.5;
    totalWeight += weight;
    return weight;
  });

  let rand = randomValue() * totalWeight;
  for (let i = 0; i < pool.length; i++) {
    rand -= weights[i];
    if (rand <= 0) return pool[i];
  }
  return pool[pool.length - 1];
}

// ── Smart piece selection ──────────────────────────────────
function canCauseClear(cells) {
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      if (!canPlace(cells, r, c)) continue;
      const tmp = board.map(row => [...row]);
      for (const [dr, dc] of cells) tmp[r + dr][c + dc] = 1;
      const clrs = getClearsOnBoard(tmp);
      if (clrs.total > 0) return true;
    }
  }
  return false;
}

// Board-agnostic version of canCauseClear (used for look-ahead on simulated boards)
function canCauseClearOnBoard(cells, b) {
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      if (!canPlaceOnBoard(cells, r, c, b)) continue;
      const tmp = b.map(row => [...row]);
      for (const [dr, dc] of cells) tmp[r + dr][c + dc] = 1;
      if (getClearsOnBoard(tmp).total > 0) return true;
    }
  }
  return false;
}

function pickPieceForProfile(profile, options = {}) {
  const { forceSmall = false } = options;
  const randomInMix = profile.randomMixChance > 0 && randomValue() < profile.randomMixChance;
  if (randomInMix) return randomPiece();

  const constrainedPool = PIECE_DEFS.filter(piece => piece.length <= profile.maxCells);
  const smallPool = constrainedPool.filter(piece => piece.length <= 3);

  if (forceSmall && smallPool.length) {
    return weightedRandomPiece({ pool: smallPool, fillCapOverride: profile.fillCap });
  }

  if (!constrainedPool.length) return weightedRandomPiece();
  return weightedRandomPiece({ pool: constrainedPool, fillCapOverride: profile.fillCap });
}

// Verify the next `rounds` future rounds will still have clearing opportunities.
// Modifies `p` in-place if needed to maintain strategic play.
function ensureLookahead(p, rounds) {
  // Look-ahead requires at least 2 pieces to simulate meaningful future states.
  if (rackSize < 2) return;

  // Simulate placing all current rack pieces at their first available position
  let b = board.map(r => [...r]);
  for (const pc of p) {
    let placed = false;
    outer: for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        if (!canPlaceOnBoard(pc, r, c, b)) continue;
        for (const [dr, dc] of pc) b[r + dr][c + dc] = 1;
        b = applyClears(b, getClearsOnBoard(b));
        placed = true;
        break outer;
      }
    }
    if (!placed) return; // simulation failed, skip look-ahead
  }

  // Check that future rounds still offer clearing opportunities
  for (let round = 0; round < rounds; round++) {
    const simulatedDensity = b.reduce((sum, row) => sum + row.reduce((rowSum, cell) => rowSum + cell, 0), 0) / (N * N);
    const tightPocketCount = estimateTightPocketCount(b);
    if (simulatedDensity >= 0.52 || tightPocketCount >= 3) {
      ensureSmallRecoveryPieceInRack(p, b);
    }

    const futureHasClear = PIECE_DEFS.some(pc => canCauseClearOnBoard(pc, b));
    if (!futureHasClear) {
      // Future board is too dense — inject a clear-enabling piece into current rack
      // canCauseClear(pc) implies canPlaceAnywhere(pc), so no separate placement check needed
      const clearNow = PIECE_DEFS.find(pc => canCauseClear(pc));
      if (clearNow) {
        const swapIdx = p.findIndex(pc => !canCauseClear(pc));
        if (swapIdx >= 0) p[swapIdx] = clearNow;
      }
      ensureSmallRecoveryPieceInRack(p, b);
      return;
    }

    // Advance simulation by one round of typical future pieces
    const futurePieces = Array.from({ length: rackSize }, () => weightedRandomPiece());
    for (const pc of futurePieces) {
      let placed = false;
      outer: for (let r = 0; r < N; r++) {
        for (let c = 0; c < N; c++) {
          if (!canPlaceOnBoard(pc, r, c, b)) continue;
          for (const [dr, dc] of pc) b[r + dr][c + dc] = 1;
          b = applyClears(b, getClearsOnBoard(b));
          placed = true;
          break outer;
        }
      }
      if (!placed) return; // board too full, stop simulation
    }
  }
}

function smartPieces() {
  const filled = board.reduce((s, r) => s + r.reduce((t, c) => t + c, 0), 0);
  const density = filled / (N * N);
  const profile = getPieceDifficultyProfile();

  const p = [];
  let requiredSmallPieces = Math.min(rackSize, profile.minSmallPieces);
  for (let i = 0; i < rackSize; i++) {
    const slotsRemaining = rackSize - i;
    const mustForceSmall = requiredSmallPieces >= slotsRemaining;
    const shouldPreferSmall = requiredSmallPieces > 0 && !mustForceSmall && randomValue() < 0.72;
    const nextPiece = pickPieceForProfile(profile, { forceSmall: mustForceSmall || shouldPreferSmall });
    p.push(nextPiece);
    if (nextPiece.length <= 3 && requiredSmallPieces > 0) requiredSmallPieces--;
  }

  if (density >= 0.25 || score >= 120) {
    ensureSmallRecoveryPieceInRack(p, board);
  }

  // Guarantee at least one clearing opportunity in this rack
  if (!p.some(pc => canCauseClear(pc))) {
    const candidates = [];
    for (const pc of PIECE_DEFS) {
      if (canCauseClear(pc)) {
        candidates.push(pc);
        if (candidates.length >= 8) break; // 8 candidates give good random variety
      }
    }
    if (candidates.length > 0) {
      const slot = Math.floor(randomValue() * rackSize);
      p[slot] = candidates[Math.floor(randomValue() * candidates.length)];
    }
  }

  // Light 2-round look-ahead: keep the game strategic and clearable
  ensureLookahead(p, 2);

  // Final safety: ensure at least one piece can be placed
  if (!p.some(pc => canPlaceAnywhere(pc))) {
    outerLoop: for (let i = 0; i < rackSize; i++) {
      for (const pc of PIECE_DEFS) {
        if (canPlaceAnywhere(pc)) { p[i] = pc; break outerLoop; }
      }
    }
  }

  return p;
}

// ── Colour / theme helpers ─────────────────────────────────
function applyColor(name) {
  if (name === 'random') {
    const ownedPool = getOwnedColorways().filter(id => id !== 'random' && COLOR_NAMES.includes(id));
    const palette = ownedPool.length ? ownedPool : ['orange'];
    const pick = palette[Math.floor(Math.random() * palette.length)];
    document.documentElement.dataset.color = pick;
  } else {
    document.documentElement.dataset.color = name;
  }
}

function applyDarkMode(on) {
  document.documentElement.dataset.theme = on ? 'dark' : '';
  document.querySelector('meta[name="theme-color"]')
    .setAttribute('content', on ? '#1c1c1e' : '#f2f2f7');
}

function applyExtendedPieces(on) {
  PIECE_DEFS = on ? PIECE_DEFS_EXTENDED : PIECE_DEFS_STANDARD;
}

function saveSettings() {
  localStorage.setItem('bst-settings', JSON.stringify({
    training:  trainingMode,
    extended:  extendedPieces,
    dark:      darkMode,
    color:     colorSetting,
    rackSize:  rackSize,
    weeklyLeaderboard: {
      playerId: leaderboardPlayerId,
      playerName: leaderboardPlayerName,
      lastPodiumNotifiedWeekId: leaderboardLastPodiumNotifiedWeekId,
    },
  }));
}

function loadSettings() {
  try {
    const s = JSON.parse(localStorage.getItem('bst-settings') || '{}');
    if (typeof s.training === 'boolean')  trainingMode   = s.training;
    if (typeof s.extended === 'boolean')  extendedPieces = s.extended;
    if (typeof s.color === 'string')      colorSetting   = sanitiseColorSetting(s.color);
    if (typeof s.rackSize === 'number' && s.rackSize >= 1 && s.rackSize <= 3)
      rackSize = s.rackSize;
    const weeklyLeaderboardSettings = sanitiseWeeklyLeaderboardState(s.weeklyLeaderboard);
    leaderboardPlayerId = weeklyLeaderboardSettings.playerId || createPseudoId();
    leaderboardPlayerName = weeklyLeaderboardSettings.playerName;
    leaderboardLastPodiumNotifiedWeekId = weeklyLeaderboardSettings.lastPodiumNotifiedWeekId;
    // Respect saved dark preference; fall back to OS preference on first launch
    if (typeof s.dark === 'boolean') {
      darkMode = s.dark;
    } else {
      darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
  } catch (_) { /* ignore corrupt data */ }
}

function createGameSessionSnapshot() {
  return {
    board: board.map(row => row.slice()),
    pieces: pieces.map(cells => cells.map(([r, c]) => [r, c])),
    used: used.slice(),
    score,
    combo,
    rackSize,
    sessionType: currentSessionType,
    dailyChallenge: isDailyChallengeSession()
      ? {
          date: dailyChallengeState.date,
          seed: dailyChallengeState.seed,
          targetScore: dailyChallengeState.targetScore,
          randomState: dailyChallengeState.randomState,
          lockedCells: dailyChallengeState.lockedCells.map(cell => ({
            r: cell.r,
            c: cell.c,
            hitsRemaining: cell.hitsRemaining,
          })),
          isHistorical: dailyChallengeState.isHistorical,
        }
      : null,
    runSummary: ensureRunSummary(),
  };
}

function clearSavedGame() {
  localStorage.removeItem(GAME_SESSION_STORAGE_KEY);
  renderDashboard();
}

function saveCurrentGame() {
  if (gameOver || !Array.isArray(board) || board.length !== N || !pieces.length) return;
  localStorage.setItem(GAME_SESSION_STORAGE_KEY, JSON.stringify(createGameSessionSnapshot()));
  renderDashboard();
}

function sanitiseSavedBoard(value) {
  if (!Array.isArray(value) || value.length !== N) return emptyBoard();
  return value.map(row => Array.isArray(row) && row.length === N
    ? row.map(cell => cell ? 1 : 0)
    : new Array(N).fill(0));
}

function sanitiseSavedPieces(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map(cells => Array.isArray(cells)
      ? cells
        .filter(cell => Array.isArray(cell) && cell.length === 2)
        .map(([r, c]) => [Math.max(0, Math.min(N - 1, Math.floor(r))), Math.max(0, Math.min(N - 1, Math.floor(c)))])
      : [])
    .filter(cells => cells.length);
}

function getSavedGameSession() {
  try {
    const raw = JSON.parse(localStorage.getItem(GAME_SESSION_STORAGE_KEY) || 'null');
    if (!raw || typeof raw !== 'object') return null;

    const savedPieces = sanitiseSavedPieces(raw.pieces);
    const savedRackSize = typeof raw.rackSize === 'number' && raw.rackSize >= 1 && raw.rackSize <= 3
      ? raw.rackSize
      : rackSize;

    if (savedPieces.length !== savedRackSize) return null;

    const savedUsed = Array.isArray(raw.used) && raw.used.length === savedRackSize
      ? raw.used.map(Boolean)
      : Array(savedRackSize).fill(false);

    return {
      board: sanitiseSavedBoard(raw.board),
      pieces: savedPieces,
      used: savedUsed,
      score: clampWholeNumber(raw.score, 0),
      combo: clampWholeNumber(raw.combo, 0),
      rackSize: savedRackSize,
      sessionType: raw.sessionType === 'daily' ? 'daily' : 'standard',
      dailyChallenge: raw.dailyChallenge && typeof raw.dailyChallenge === 'object'
        ? {
            date: typeof raw.dailyChallenge.date === 'string' ? raw.dailyChallenge.date : '',
            seed: clampWholeNumber(raw.dailyChallenge.seed, 0),
            targetScore: clampWholeNumber(raw.dailyChallenge.targetScore, 0),
            randomState: clampWholeNumber(raw.dailyChallenge.randomState, 0),
            lockedCells: normaliseLockedCells(raw.dailyChallenge.lockedCells),
            isHistorical: !!raw.dailyChallenge.isHistorical,
          }
        : null,
      runSummary: raw.runSummary && typeof raw.runSummary === 'object'
        ? {
            finalScore: clampWholeNumber(raw.runSummary.finalScore, 0),
            coinsEarned: clampWholeNumber(raw.runSummary.coinsEarned, 0),
            completedObjectiveIds: uniqueStringList(raw.runSummary.completedObjectiveIds, []),
            questHighlightIds: uniqueStringList(raw.runSummary.questHighlightIds, []),
            recentUpdates: Array.isArray(raw.runSummary.recentUpdates)
              ? raw.runSummary.recentUpdates
                  .filter(item => item && typeof item === 'object')
                  .map(item => ({
                    title: typeof item.title === 'string' ? item.title : '',
                    detail: typeof item.detail === 'string' ? item.detail : '',
                  }))
                  .filter(item => item.title)
                  .slice(-4)
              : [],
            stats: {
              regionsCleared: clampWholeNumber(raw.runSummary.stats?.regionsCleared, 0),
              biggestClear: clampWholeNumber(raw.runSummary.stats?.biggestClear, 0),
              maxCombo: clampWholeNumber(raw.runSummary.stats?.maxCombo, 0),
              racksCompleted: clampWholeNumber(raw.runSummary.stats?.racksCompleted, 0),
              personalBest: !!raw.runSummary.stats?.personalBest,
              coachModeUsed: !!raw.runSummary.stats?.coachModeUsed,
            },
            continuePrompt: raw.runSummary.continuePrompt || null,
          }
        : createDefaultRunSummary(),
    };
  } catch (_) {
    return null;
  }
}

function restoreSavedGame() {
  const saved = getSavedGameSession();
  if (!saved) return false;
  if (saved.sessionType === 'daily') {
    const savedDate = saved.dailyChallenge?.date;
    if (!saved.dailyChallenge || !isPlayableDailyChallengeDate(savedDate)) {
      clearSavedGame();
      return false;
    }
    const savedChallenge = ensureDailyChallengeForDate(savedDate);
    if (saved.dailyChallenge.seed !== savedChallenge.seed || saved.dailyChallenge.targetScore !== savedChallenge.targetScore) {
      clearSavedGame();
      return false;
    }
    configureDailyChallengeSession(savedChallenge, {
      randomState: saved.dailyChallenge.randomState,
      lockedCells: saved.dailyChallenge.lockedCells,
      isHistorical: saved.dailyChallenge.isHistorical || isHistoricalDailyChallengeDate(savedDate),
    });
    selectedDailyChallengeDateKey = savedDate;
  } else {
    resetStandardSessionState();
  }

  rackSize = saved.rackSize;
  board = saved.board;
  pieces = saved.pieces;
  used = saved.used;
  score = saved.score;
  combo = saved.combo;
  gameOver = false;
  clearGameBannerQueue();
  runSummary = saved.runSummary;

  initRackDOM();
  renderBoard();
  renderRack();
  updateRackPlayability();
  updateTrainingPanel();
  if (trainingMode) showHint();
  else clearHint();
  updateScoreUI();
  renderDashboard();
  return true;
}

function renderSessionModeBadge() {
  const badge = document.getElementById('session-mode-badge');
  if (!badge) return;

  if (isDailyChallengeSession()) {
    badge.hidden = false;
    badge.textContent = `Daily · ${getDailyChallengeLabel(dailyChallengeState.date || getUTCDateKey())}`;
  } else {
    badge.hidden = true;
  }
}


function renderWeeklyLadder() {
  const weekId = getCurrentUTCWeekId();
  const previousWeekId = getPreviousUTCWeekId();
  const weekly = ensureWeeklyLadderForCurrentWeek();
  const localBestScore = sanitiseWeeklyBestRuns(weekly.bestRuns)[0] || 0;
  const liveRank = weeklyLeaderboardViewState.currentPlayerRank > 0
    ? formatOrdinal(weeklyLeaderboardViewState.currentPlayerRank)
    : 'Unranked';

  setTextIfPresent('weekly-page-title', 'Current UTC week');
  setTextIfPresent('weekly-page-countdown', getUTCWeekCountdown());
  setTextIfPresent('weekly-page-copy', 'Live standings update this week as players post better single-run scores.');
  setTextIfPresent('weekly-page-score', String(localBestScore));
  setTextIfPresent('weekly-page-rank', liveRank);
  setTextIfPresent('dashboard-weekly-card-title', 'This week');
  setTextIfPresent('dashboard-weekly-card-copy', 'Live global leaderboard');
  setTextIfPresent('dashboard-weekly-card-progress', localBestScore > 0 ? `${liveRank} · best ${localBestScore}` : 'Set your first weekly score');

  renderWeeklyGlobalLeaderboard();
  refreshWeeklyLeaderboard(weekId);
  refreshPreviousWeeklyLeaderboard(previousWeekId);
}

function renderCollectionAlbumTeaser() {
  const title = document.getElementById('dashboard-album-title');
  const copy = document.getElementById('dashboard-album-copy');
  const progress = document.getElementById('dashboard-album-progress');
  const reward = document.getElementById('dashboard-album-reward');
  if (!title || !copy || !progress || !reward) return;

  const albumStatus = getCollectionAlbumStatus();
  const spotlight = albumStatus.spotlightSet;
  title.textContent = albumStatus.allSetsComplete
    ? 'Collection album complete'
    : spotlight
      ? spotlight.set.title
      : 'Collection album';
  copy.textContent = albumStatus.allSetsComplete
    ? 'Every themed set is complete. Your Heirloom finish is waiting in the shop collection.'
    : spotlight && spotlight.remainingCount === 1
      ? `One more unlock completes ${spotlight.set.title}.`
      : spotlight
        ? `${spotlight.remainingCount} more items will finish ${spotlight.set.title}.`
        : 'Browse themed sets and work towards album rewards.';
  progress.textContent = `${albumStatus.completedCount}/${albumStatus.totalSets} sets complete`;
  reward.textContent = albumStatus.grandRewardOwned
    ? `${COLLECTION_ALBUM_GOAL.reward.name} unlocked`
    : `Grand reward · ${COLLECTION_ALBUM_GOAL.reward.name}`;
}

function renderDashboardUnlockPreview({ isFirstRunExperience = false } = {}) {
  const albumStatus = getCollectionAlbumStatus();
  const spotlight = albumStatus.spotlightSet;

  let title = 'Next unlock';
  let copy = 'Unlock your first finish reward.';
  let progress = 'Complete your first run';

  if (!isFirstRunExperience) {
    if (albumStatus.allSetsComplete) {
      title = 'Next unlock';
      copy = 'Your collection is complete. Try a higher weekly finish for bonus rewards.';
      progress = `${COLLECTION_ALBUM_GOAL.reward.name} unlocked`;
    } else if (spotlight) {
      title = 'Next unlock';
      copy = spotlight.remainingCount === 1
        ? `One more unlock completes ${spotlight.set.title}.`
        : `${spotlight.remainingCount} more unlocks for ${spotlight.set.title}.`;
      progress = `${albumStatus.completedCount}/${albumStatus.totalSets} sets complete`;
    } else {
      copy = 'Reach your next finish reward in the collection.';
      progress = `${albumStatus.completedCount}/${albumStatus.totalSets} sets complete`;
    }
  }

  setTextIfPresent('dashboard-unlock-title', title);
  setTextIfPresent('dashboard-unlock-copy', copy);
  setTextIfPresent('dashboard-unlock-progress', progress);
}

function renderDashboard() {
  const continueBtn = document.getElementById('btn-dashboard-continue');
  const playNowBtn = document.getElementById('btn-dashboard-play');
  const intro = document.getElementById('dashboard-intro');
  const runState = document.getElementById('dashboard-run-state');
  const hasSavedGame = !!getSavedGameSession();
  const savedGame = getSavedGameSession();
  const isFirstRunExperience = getCompletedRunCount() === 0;
  const onboarding = document.getElementById('dashboard-onboarding');
  const firstReward = document.getElementById('dashboard-first-reward');
  const progressStrip = document.getElementById('dashboard-progress-strip');
  const focusCards = document.querySelector('.dashboard-focus');
  const coins = getCoinBalance();
  const hasMeaningfulProgress = coins > 0 || bestScore > 0 || todayScore > 0;
  refreshBadgeMilestones();

  if (continueBtn) {
    continueBtn.hidden = !hasSavedGame;
    continueBtn.disabled = !hasSavedGame;
    continueBtn.textContent = savedGame?.sessionType === 'daily' ? 'Continue daily challenge' : 'Continue run';
  }
  if (playNowBtn) playNowBtn.textContent = 'Play now';
  if (runState) {
    runState.textContent = savedGame?.sessionType === 'daily'
      ? 'Daily challenge ready to continue'
      : hasSavedGame
        ? 'Saved run ready to continue'
        : isFirstRunExperience
          ? 'Complete your first run to unlock rewards'
          : 'Ready for your next run';
  }
  if (intro) {
    if (savedGame?.sessionType === 'daily') {
      intro.textContent = 'Your daily challenge is waiting.';
    } else {
      intro.textContent = hasSavedGame
        ? 'Pick up where you left off.'
        : isFirstRunExperience
          ? 'Quick to learn, calm to replay.'
          : 'Play now and push your score higher.';
    }
  }
  if (onboarding) {
    onboarding.hidden = !isFirstRunExperience || hasSavedGame;
  }
  if (firstReward) firstReward.textContent = `First run reward: ${scaleCoinReward(32, 'run')} coins`;
  if (focusCards) {
    focusCards.hidden = isFirstRunExperience && !hasSavedGame;
  }
  if (progressStrip) {
    progressStrip.hidden = !hasMeaningfulProgress;
  }

  document.getElementById('dashboard-coins').textContent = String(coins);
  document.getElementById('dashboard-best').textContent = String(bestScore);
  document.getElementById('dashboard-today').textContent = String(todayScore);
  renderSessionModeBadge();
  renderDailyChallengePanels();
  renderDailyMissions();
  renderWeeklyLadder();
  renderDashboardUnlockPreview({ isFirstRunExperience });
}

function getCompletedRunCount() {
  return progressionState?.onboarding?.completedRuns || 0;
}

function setCoachToggleVisibility(authorised) {
  const toggleRow = document.getElementById('page-coach-toggle-row');
  const coachToggle = document.getElementById('page-chk-coach');
  const authTitle = document.getElementById('page-coach-auth-title');
  const authInput = document.getElementById('page-input-coach-code');
  const unlockButton = document.getElementById('btn-coach-auth');
  if (!toggleRow || !coachToggle || !authTitle || !authInput || !unlockButton) return;
  toggleRow.hidden = !authorised;
  coachToggle.disabled = !authorised;
  if (!authorised) coachToggle.checked = false;
  authTitle.textContent = authorised ? 'Coach Mode access' : 'Coach Mode access code';
  authInput.hidden = authorised;
  unlockButton.hidden = authorised;
}

function setCoachAuthStatus(message, isError = false) {
  const statusEl = document.getElementById('page-coach-auth-status');
  if (!statusEl) return;
  statusEl.textContent = message;
  statusEl.style.color = isError ? '#b00020' : '';
}

function getCoachModeAccessSummary() {
  if (!coachModeAccessState.authorised) return 'Coach Mode is locked for this session.';
  const expiry = new Date(coachModeAccessState.expiresAt);
  if (Number.isNaN(expiry.getTime())) return 'Coach Mode is unlocked for this session.';
  return `Coach Mode unlocked until ${expiry.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`;
}

function applyCoachModeGate(authorised) {
  setCoachToggleVisibility(authorised);
  if (!authorised && trainingMode) {
    trainingMode = false;
    document.getElementById('coach-panel').hidden = true;
    clearHint();
    document.getElementById('move-eval').textContent = '';
    document.getElementById('strategy-note').textContent = '';
    saveSettings();
  }
}

async function checkCoachModeSession() {
  if (!coachModeHostedAdapter) {
    clearCoachModeAccessState();
    applyCoachModeGate(false);
    setCoachAuthStatus('Coach Mode access is unavailable because hosted services are offline.');
    return false;
  }

  try {
    const result = await coachModeHostedAdapter.checkSession();
    coachModeAccessState = {
      authorised: !!result.authorised,
      expiresAt: Number.isFinite(result.expiresAt) ? result.expiresAt : 0,
    };
    if (!coachModeAccessState.authorised) {
      clearCoachModeAccessState();
    } else {
      persistCoachModeAccessState();
    }
    applyCoachModeGate(coachModeAccessState.authorised);
    setCoachAuthStatus(getCoachModeAccessSummary());
    return coachModeAccessState.authorised;
  } catch (error) {
    clearCoachModeAccessState();
    applyCoachModeGate(false);
    setCoachAuthStatus(error instanceof Error ? error.message : 'Could not verify Coach Mode access right now.', true);
    return false;
  }
}

function populateQuickSettings() {
  document.getElementById('quick-chk-dark').checked = darkMode;
}

function getLeaderboardNameAvailabilityText(rawValue) {
  if (!hasHostedWeeklyLeaderboardConfig()) {
    return 'Name saved locally on this device.';
  }
  const requestedName = normaliseRequestedLeaderboardName(rawValue);
  if (!requestedName) {
    return 'Type a name to claim a unique handle.';
  }
  if (requestedName.toLowerCase() === LEGACY_LEADERBOARD_NAME.toLowerCase()) {
    return 'Please choose a different name.';
  }
  return `Available. It will be claimed with a unique suffix, for example ${requestedName}#1423.`;
}

function updateLeaderboardNameAvailabilityIndicator() {
  const backendStatus = document.getElementById('page-weekly-backend-status');
  if (!backendStatus) return;
  const inputEl = document.getElementById('page-input-weekly-name');
  if (hasClaimedLeaderboardHandle(leaderboardPlayerName)) {
    const currentBaseName = extractLeaderboardNameBase(leaderboardPlayerName);
    const requestedName = normaliseRequestedLeaderboardName(inputEl?.value);
    if (!requestedName || requestedName === currentBaseName) {
      backendStatus.textContent = `Saved handle: ${leaderboardPlayerName}`;
      return;
    }
  }
  backendStatus.textContent = getLeaderboardNameAvailabilityText(inputEl?.value);
}

async function ensureLeaderboardHandleClaimedOnJoin() {
  if (!hasHostedWeeklyLeaderboardConfig()) return;
  if (hasClaimedLeaderboardHandle(leaderboardPlayerName)) return;
  const requestedName = getRequestedLeaderboardBaseName();
  if (!requestedName) return;
  const claimedHandle = await tryClaimLeaderboardHandle(requestedName, { requireClaim: false });
  if (!claimedHandle) return;
  persistClaimedLeaderboardHandle(claimedHandle);
  if (currentPage === 'settings') updateLeaderboardNameAvailabilityIndicator();
}

function populateSettingsPage() {
  document.getElementById('page-chk-coach').checked = trainingMode && coachModeAccessState.authorised;
  document.getElementById('page-chk-extended').checked = extendedPieces;
  document.getElementById('page-chk-dark').checked = darkMode;

  const colorSelect = document.getElementById('page-sel-color');
  colorSelect.innerHTML = '';
  for (const colorway of COLORWAY_CATALOGUE.filter(item => item.id !== 'random' || isColorwayOwned('random'))) {
    const option = document.createElement('option');
    option.value = colorway.id;
    option.textContent = `${colorway.icon} ${colorway.name}${isColorwayOwned(colorway.id) ? '' : ' · shop unlock'}`;
    option.disabled = !isColorwayOwned(colorway.id);
    colorSelect.appendChild(option);
  }
  colorSelect.value = isColorwayOwned(colorSetting) ? colorSetting : 'orange';
  document.getElementById('page-sel-rack').value = String(rackSize);
  document.getElementById('page-input-weekly-name').value = extractLeaderboardNameBase(leaderboardPlayerName);
  document.getElementById('page-input-coach-code').value = '';
  setCoachToggleVisibility(coachModeAccessState.authorised);
  setCoachAuthStatus(
    coachModeAccessState.authorised
      ? getCoachModeAccessSummary()
      : 'Checking Coach Mode access...',
  );
  checkCoachModeSession();
  updateLeaderboardNameAvailabilityIndicator();
  updateCosmeticLabel();
}

function updatePrimaryPlayButton() {
  const playButton = document.getElementById('btn-bottom-nav-play');
  const playLabel = document.getElementById('bottom-nav-play-label');
  if (!playButton || !playLabel) return;

  const savedGame = getSavedGameSession();
  const isFirstRunExperience = getCompletedRunCount() === 0 && !savedGame;
  const isDaily = savedGame?.sessionType === 'daily';
  const label = isDaily ? 'Resume daily' : savedGame ? 'Resume' : isFirstRunExperience ? 'First run' : 'Play';
  const ariaLabel = isDaily
    ? 'Resume daily challenge'
    : savedGame
      ? 'Resume saved run'
      : isFirstRunExperience
        ? 'Start first run'
        : 'Start new run';

  playLabel.textContent = label;
  playButton.setAttribute('aria-label', ariaLabel);
}

function updateBottomNav() {
  document.querySelectorAll('.bottom-nav__item[data-nav-page]').forEach(button => {
    const isActive = button.dataset.navPage === currentPage;
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-current', isActive ? 'page' : 'false');
  });

  updatePrimaryPlayButton();
}

function navigateTo(page) {
  if (page !== 'game') clearGameBannerQueue();
  if (currentPage === 'weekly' && page !== 'weekly') stopWeeklyLeaderboardPolling();
  currentPage = page;
  document.getElementById('app').dataset.page = page;
  document.querySelectorAll('.page').forEach(section => {
    section.hidden = section.dataset.page !== page;
  });

  if (page === 'dashboard') renderDashboard();
  if (page === 'weekly') {
    renderWeeklyLadder();
    startWeeklyLeaderboardPolling();
  }
  if (page === 'missions') renderDailyMissions();
  if (page === 'quests') renderQuestBoard();
  if (page === 'shop') renderCosmeticsCollection();
  if (page === 'settings') populateSettingsPage();
  if (page === 'badges') renderBadgePage();
  if (page === 'game') showDefaultGameBannerMessage();
  updateBottomNav();
}

// ── Board helpers ──────────────────────────────────────────
function emptyBoard() {
  return Array.from({ length: N }, () => new Array(N).fill(0));
}

function cellEl(r, c) {
  return document.querySelector(`#board .cell[data-r="${r}"][data-c="${c}"]`);
}

function cellSize() {
  const el = document.getElementById('board');
  return el ? el.getBoundingClientRect().width / N : 40;
}

// ── DOM – board ────────────────────────────────────────────
function initBoardDOM() {
  const el = document.getElementById('board');
  el.innerHTML = '';
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      const d = document.createElement('div');
      d.className = 'cell';
      d.dataset.r = r;
      d.dataset.c = c;
      const br = Math.floor(r / 3), bc = Math.floor(c / 3);
      if ((br + bc) % 2 === 0) d.classList.add('cell-alt');
      el.appendChild(d);
    }
  }
}

function renderBoard() {
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      const el = cellEl(r, c);
      if (el) {
        el.classList.remove('clearing');
        const isFilled = !!board[r][c];
        const key = toBoardKey(r, c);
        const lockHitsRemaining = dailyLockedCellsByKey.get(key) || 0;
        const lockRings = Math.max(0, lockHitsRemaining - 1);
        const showLockRings = lockRings > 0;
        el.classList.toggle('filled', isFilled);
        el.classList.toggle('cell-locked', isFilled && showLockRings);
        el.classList.toggle('cell-locked-tier-1', isFilled && lockRings === 1);
        el.classList.toggle('cell-locked-tier-2', isFilled && lockRings >= 2);
        if (isFilled && showLockRings) {
          el.dataset.lockRings = String(lockRings);
        } else {
          delete el.dataset.lockRings;
        }
      }
    }
  }
}

// ── DOM – rack ─────────────────────────────────────────────
const RACK_CELL = 18; // px per cell in rack

function initRackDOM() {
  const rack = document.getElementById('rack');
  rack.innerHTML = '';
  for (let i = 0; i < rackSize; i++) {
    const slot = document.createElement('div');
    slot.className = 'slot';
    slot.id = `slot-${i}`;
    rack.appendChild(slot);
  }
}

function renderRack() {
  for (let i = 0; i < rackSize; i++) renderSlot(i);
}

function renderSlot(i) {
  const slot = document.getElementById(`slot-${i}`);
  slot.innerHTML = '';
  slot.classList.remove('used', 'dragging', 'hint-slot', 'hint-slot-2', 'hint-slot-3', 'unplayable');

  if (used[i]) { slot.classList.add('used'); return; }

  const cells = pieces[i];
  const b = bounds(cells);

  const inner = document.createElement('div');
  inner.className = 'piece-inner entering';
  inner.style.width  = (b.cols * RACK_CELL) + 'px';
  inner.style.height = (b.rows * RACK_CELL) + 'px';

  for (const [r, c] of cells) {
    const blk = document.createElement('div');
    blk.className = 'piece-block';
    blk.style.cssText = `
      width:${RACK_CELL - 2}px; height:${RACK_CELL - 2}px;
      left:${(c - b.minC) * RACK_CELL + 1}px;
      top:${(r - b.minR) * RACK_CELL + 1}px;
    `;
    inner.appendChild(blk);
  }

  // Stagger entrance by slot index
  inner.style.animationDelay = (i * 80) + 'ms';
  inner.addEventListener('animationend', () => {
    inner.classList.remove('entering');
    inner.style.animationDelay = '';
  }, { once: true });

  slot.appendChild(inner);

  if (trainingMode) {
    const label = document.createElement('span');
    label.className = 'slot-label';
    label.textContent = String(i + 1);
    slot.appendChild(label);
  }

  attachDragListeners(slot, i);
}

// Grey out any piece that cannot be placed anywhere on the current board.
function updateRackPlayability() {
  for (let i = 0; i < rackSize; i++) {
    if (used[i]) continue;
    const slot = document.getElementById(`slot-${i}`);
    if (slot) slot.classList.toggle('unplayable', !canPlaceAnywhere(pieces[i]));
  }
}

// ── Drag & drop ────────────────────────────────────────────
let drag = null;

function attachDragListeners(slot, i) {
  slot.addEventListener('touchstart', e => {
    e.preventDefault();
    const t = e.changedTouches[0];
    startDrag(t.clientX, t.clientY, i);
  }, { passive: false });

  slot.addEventListener('mousedown', e => {
    e.preventDefault();
    startDrag(e.clientX, e.clientY, i);
  });
}

document.addEventListener('touchmove', e => {
  if (!drag) return;
  e.preventDefault();
  const t = e.changedTouches[0];
  moveDrag(t.clientX, t.clientY);
}, { passive: false });

document.addEventListener('touchend', e => {
  if (!drag) return;
  e.preventDefault();
  const t = e.changedTouches[0];
  endDrag(t.clientX, t.clientY);
}, { passive: false });

document.addEventListener('touchcancel', () => { if (drag) cancelDrag(); });

document.addEventListener('mousemove', e => { if (drag) moveDrag(e.clientX, e.clientY); });
document.addEventListener('mouseup',   e => { if (drag) endDrag(e.clientX, e.clientY); });

function startDrag(cx, cy, slotIdx) {
  if (drag || used[slotIdx] || gameOver) return;
  const slotEl = document.getElementById(`slot-${slotIdx}`);
  if (slotEl && slotEl.classList.contains('unplayable')) return;
  clearHint();

  const cells = pieces[slotIdx];
  const cs    = cellSize();
  const b     = bounds(cells);

  const ghost = document.createElement('div');
  ghost.className = 'ghost';
  ghost.style.width  = (b.cols * cs) + 'px';
  ghost.style.height = (b.rows * cs) + 'px';

  for (const [r, c] of cells) {
    const blk = document.createElement('div');
    blk.className = 'ghost-block';
    blk.style.cssText = `
      width:${cs - 2}px; height:${cs - 2}px;
      left:${(c - b.minC) * cs + 1}px;
      top:${(r - b.minR) * cs + 1}px;
    `;
    ghost.appendChild(blk);
  }
  document.body.appendChild(ghost);

  document.getElementById(`slot-${slotIdx}`).classList.add('dragging');

  drag = { slotIdx, cells, ghost, b, cs, snapR: -99, snapC: -99 };
  updateGhost(cx, cy);
  updatePreview(cx, cy);
}

function moveDrag(cx, cy) {
  updateGhost(cx, cy);
  updatePreview(cx, cy);
}

function updateGhost(cx, cy) {
  if (!drag) return;
  const { ghost, b, cs } = drag;
  const x = cx - (b.cols * cs) / 2;
  const y = cy - b.rows * cs - cs * 0.9;
  ghost.style.left = x + 'px';
  ghost.style.top  = y + 'px';
}

function getSnap(cx, cy) {
  const boardRect = document.getElementById('board').getBoundingClientRect();
  const { b, cs } = drag;
  const ghostX = cx - (b.cols * cs) / 2;
  const ghostY = cy - b.rows * cs - cs * 0.9;
  const col = Math.round((ghostX - boardRect.left) / cs);
  const row = Math.round((ghostY - boardRect.top)  / cs);
  return { row, col };
}

function updatePreview(cx, cy) {
  clearPreview();
  if (!drag) return;

  const { row, col } = getSnap(cx, cy);
  drag.snapR = row;
  drag.snapC = col;

  const { cells } = drag;
  const onBoard = cells.some(([dr, dc]) => {
    const r = row + dr, c = col + dc;
    return r >= 0 && r < N && c >= 0 && c < N;
  });
  if (!onBoard) return;

  const valid = canPlace(cells, row, col);
  for (const [dr, dc] of cells) {
    const r = row + dr, c = col + dc;
    if (r < 0 || r >= N || c < 0 || c >= N) continue;
    const el = cellEl(r, c);
    if (el) el.classList.add(valid ? 'preview-ok' : 'preview-bad');
  }

  if (valid) {
    for (const [r, c] of simClears(cells, row, col)) {
      const el = cellEl(r, c);
      if (el) el.classList.add('preview-clr');
    }
  }
}

function clearPreview() {
  document.querySelectorAll('#board .cell.preview-ok, #board .cell.preview-bad, #board .cell.preview-clr')
    .forEach(el => el.classList.remove('preview-ok', 'preview-bad', 'preview-clr'));
}

function endDrag(cx, cy) {
  if (!drag) return;
  clearPreview();

  const { slotIdx, cells, ghost, snapR, snapC } = drag;
  ghost.remove();
  document.getElementById(`slot-${slotIdx}`).classList.remove('dragging');
  drag = null;

  if (canPlace(cells, snapR, snapC)) {
    doPlace(slotIdx, snapR, snapC);
  } else if (trainingMode) {
    showHint();
  }
}

function cancelDrag() {
  if (!drag) return;
  clearPreview();
  drag.ghost.remove();
  document.getElementById(`slot-${drag.slotIdx}`).classList.remove('dragging');
  drag = null;
  if (trainingMode) showHint();
}

// ── Game actions ───────────────────────────────────────────
function doPlace(slotIdx, row, col) {
  const cells = pieces[slotIdx];
  ensureRunSummary().stats.coachModeUsed = ensureRunSummary().stats.coachModeUsed || trainingMode;

  // Place blocks on board
  for (const [dr, dc] of cells) board[row + dr][col + dc] = 1;
  score += cells.length;
  updateDailyMissionProgress('blocks', cells.length);
  updateDailyMissionProgress('score', cells.length);
  updateScoreUI();

  used[slotIdx] = true;

  // Animate slot shrinking out, then render board with placement pop
  const slotEl = document.getElementById(`slot-${slotIdx}`);
  slotEl.classList.add('shrinking');
  setTimeout(() => {
    slotEl.classList.remove('shrinking');
    renderSlot(slotIdx);
  }, ANIM_SLOT_SHRINK);

  renderBoard();

  // Add placement pop animation to newly placed cells
  for (const [dr, dc] of cells) {
    const el = cellEl(row + dr, col + dc);
    if (el) {
      el.classList.add('just-placed');
      el.addEventListener('animationend', () => el.classList.remove('just-placed'), { once: true });
    }
  }

  // Check clears
  const cleared = doClears();
  evaluateRunObjectives();

  if (cleared.size) {
    showPointsPopup(cleared.size);
    if (combo > 0) showComboPopup(combo);
    animateClears(cleared, () => {
      renderBoard();
      afterPlace();
    });
  } else {
    afterPlace();
  }
}

function afterPlace() {
  updateRackPlayability();
  updateTrainingPanel();
  if (trainingMode) showHint();
  if (isDailyChallengeSession() && dailyLockedCellsByKey.size === 0) {
    saveCurrentGame();
    setTimeout(() => triggerGameOver('daily-complete'), 120);
    return;
  }
  if (used.every(Boolean)) {
    // All pieces placed → new round
    setTimeout(newRound, 80);
  } else {
    saveCurrentGame();
    if (isGameOver()) setTimeout(triggerGameOver, 150);
  }
}

function doClears() {
  const rowFull = [], colFull = [], boxFull = [];

  for (let r = 0; r < N; r++)
    if (board[r].every(Boolean)) rowFull.push(r);

  for (let c = 0; c < N; c++)
    if (board.every(row => row[c])) colFull.push(c);

  for (let br = 0; br < 3; br++) {
    for (let bc = 0; bc < 3; bc++) {
      let full = true;
      outer: for (let r = br * 3; r < br * 3 + 3; r++) {
        for (let c = bc * 3; c < bc * 3 + 3; c++) {
          if (!board[r][c]) { full = false; break outer; }
        }
      }
      if (full) boxFull.push([br, bc]);
    }
  }

  const total = rowFull.length + colFull.length + boxFull.length;
  if (!total) { combo = 0; return new Set(); }

  const cleared = new Set();
  for (const r of rowFull) {
    for (let c = 0; c < N; c++) cleared.add(`${r},${c}`);
  }
  for (const c of colFull) {
    for (let r = 0; r < N; r++) cleared.add(`${r},${c}`);
  }
  for (const [br, bc] of boxFull) {
    for (let r = br * 3; r < br * 3 + 3; r++) {
      for (let c = bc * 3; c < bc * 3 + 3; c++) cleared.add(`${r},${c}`);
    }
  }

  // Scoring: cells cleared + multi-clear bonus + combo
  let pts = cleared.size;
  if (total > 1) pts += (total - 1) * 10;
  const summary = ensureRunSummary();
  const isFirstClearOfRun = summary.stats.regionsCleared === 0;
  combo += total;   // combo grows by every region cleared in this move
  pts += combo * 5;
  score += pts;
  summary.stats.regionsCleared += total;
  summary.stats.biggestClear = Math.max(summary.stats.biggestClear, total);
  summary.stats.maxCombo = Math.max(summary.stats.maxCombo, combo);
  updateDailyMissionProgress('regions', total);
  updateDailyMissionProgress('score', pts);
  updateDailyMissionProgress('combo', combo, 'max');

  const clearCoins = calculateClearCoinReward(total, combo);
  awardCoins(clearCoins, clearRewardLabel(total, combo), {
    celebrate: total >= 2 || combo >= 3,
    major: total >= 3 || combo >= 5,
  });

  if (isFirstClearOfRun) {
    pulseCelebrationSurface();
    showMilestoneMoment({
      eyebrow: 'First clear',
      title: 'Lovely start',
      detail: 'Board opened up',
      anchor: '#board-wrap',
      announce: 'First clear of the run.',
    });
  }

  if (total >= 3) {
    pulseCelebrationSurface();
    showMilestoneMoment({
      eyebrow: `${total}-region clear`,
      title: 'That landed brilliantly',
      detail: 'A bigger clear bought you space',
      major: true,
      anchor: '#board-wrap',
      announce: `${total} regions cleared at once.`,
    });
  }

  let unlockedCells = 0;
  let softenedCells = 0;
  for (const key of cleared) {
    const [r, c] = key.split(',').map(Number);
    if (dailyLockedCellsByKey.has(key)) {
      const nextHitsRemaining = Math.max(0, (dailyLockedCellsByKey.get(key) || 0) - 1);
      if (nextHitsRemaining > 0) {
        dailyLockedCellsByKey.set(key, nextHitsRemaining);
        dailyChallengeState.lockedCells = (dailyChallengeState.lockedCells || []).map(cell => {
          if (cell.r === r && cell.c === c) return { ...cell, hitsRemaining: nextHitsRemaining };
          return cell;
        });
        softenedCells += 1;
      } else {
        dailyLockedCellsByKey.delete(key);
        dailyChallengeState.lockedCells = (dailyChallengeState.lockedCells || [])
          .filter(cell => toBoardKey(cell.r, cell.c) !== key);
        board[r][c] = 0;
        unlockedCells += 1;
      }
      continue;
    }
    board[r][c] = 0;
  }

  if (softenedCells > 0) {
    recordRunUpdate({
      title: `${softenedCells} locked block${softenedCells === 1 ? '' : 's'} weakened`,
      detail: 'Ringed blocks stay in place until all rings are removed.',
    });
    enqueueGameBanner({
      kicker: 'Daily challenge',
      title: `${softenedCells} locked block${softenedCells === 1 ? '' : 's'} weakened`,
    });
  }

  if (unlockedCells > 0) {
    recordRunUpdate({
      title: `${unlockedCells} locked block${unlockedCells === 1 ? '' : 's'} removed`,
      detail: 'Those blocks are now fully cleared.',
    });
    enqueueGameBanner({
      kicker: 'Daily challenge',
      title: `${unlockedCells} locked block${unlockedCells === 1 ? '' : 's'} removed`,
    });
  }

  updateScoreUI();
  return cleared;
}

function animateClears(cleared, cb) {
  // Stagger clear animation for a ripple effect
  const cells = [...cleared].map(key => key.split(',').map(Number));
  // Sort by distance from centroid for ripple effect
  const cx = cells.reduce((s, [r]) => s + r, 0) / cells.length;
  const cy = cells.reduce((s, [, c]) => s + c, 0) / cells.length;
  cells.sort((a, b) => {
    const da = Math.abs(a[0] - cx) + Math.abs(a[1] - cy);
    const db = Math.abs(b[0] - cx) + Math.abs(b[1] - cy);
    return da - db;
  });

  const step = cells.length > 1 ? ANIM_CLEAR_STAGGER / (cells.length - 1) : 0;

  cells.forEach(([r, c], i) => {
    const el = cellEl(r, c);
    if (el) {
      el.style.animationDelay = (i * step) + 'ms';
      el.classList.add('clearing');
    }
  });

  setTimeout(() => {
    // Clean up animation delays
    cells.forEach(([r, c]) => {
      const el = cellEl(r, c);
      if (el) el.style.animationDelay = '';
    });
    cb();
  }, ANIM_CLEAR + ANIM_CLEAR_STAGGER);
}

// ── Clears simulation (for preview) ───────────────────────
function simClears(cells, row, col) {
  const tmp = board.map(r => [...r]);
  for (const [dr, dc] of cells) tmp[row + dr][col + dc] = 1;

  const result = [];
  for (let r = 0; r < N; r++) {
    if (tmp[r].every(Boolean)) {
      for (let c = 0; c < N; c++) result.push([r, c]);
    }
  }
  for (let c = 0; c < N; c++) {
    if (tmp.every(row => row[c])) {
      for (let r = 0; r < N; r++) result.push([r, c]);
    }
  }
  for (let br = 0; br < 3; br++) {
    for (let bc = 0; bc < 3; bc++) {
      let full = true;
      outer: for (let r = br * 3; r < br * 3 + 3; r++) {
        for (let c = bc * 3; c < bc * 3 + 3; c++) {
          if (!tmp[r][c]) { full = false; break outer; }
        }
      }
      if (full) {
        for (let r = br * 3; r < br * 3 + 3; r++) {
          for (let c = bc * 3; c < bc * 3 + 3; c++) result.push([r, c]);
        }
      }
    }
  }
  return result;
}

// ── Game over ──────────────────────────────────────────────
// Game over only when every remaining unplaced piece is blocked.
// (Individual pieces that can't fit are just greyed out; the game continues
//  as long as at least one piece can still be placed.)
function isGameOver() {
  if (isDailyChallengeSession() && dailyLockedCellsByKey.size === 0) {
    return true;
  }
  for (let i = 0; i < rackSize; i++) {
    if (used[i]) continue;
    if (canPlaceAnywhere(pieces[i])) return false;
  }
  return true;
}

function triggerGameOver(reason = 'blocked') {
  if (gameOver) return;
  gameOver = true;
  lastGameOverReason = reason;
  clearSavedGame();
  markOneMoreRunEnded();

  syncDailyChallengeScoreProgress();

  const isNewBest = score > bestScore;
  if (isNewBest) {
    bestScore = score;
    localStorage.setItem('bst-best', bestScore);
  }

  awardCoins(calculateEndRunCoinReward(score), 'Run complete');
  if (isNewBest) awardCoins(scaleCoinReward(COIN_REWARDS.personalBestBonus, 'run'), 'New best');
  ensureRunSummary().stats.personalBest = isNewBest;
  recordWeeklyRunScore(score);

  const todayKey = new Date().toISOString().slice(0, 10);
  const td = JSON.parse(localStorage.getItem('bst-today') || '{"d":"","s":0}');
  todayScore = (td.d === todayKey) ? Math.max(td.s, score) : score;
  localStorage.setItem('bst-today', JSON.stringify({ d: todayKey, s: todayScore }));
  updateScoreUI();
  maybeCompleteDailyChallenge();
  evaluateRunObjectives();
  updateProgressionState(state => {
    const completedRuns = clampWholeNumber(state.onboarding?.completedRuns, 0);
    return {
      ...state,
      onboarding: {
        ...state.onboarding,
        completedRuns: completedRuns + 1,
      },
    };
  });
  updateDailyMissionProgress('runs', 1);
  ensureRunSummary().questHighlightIds = applyQuestChainProgress(ensureRunSummary()).changedChainIds;
  ensureRunSummary().continuePrompt = chooseOneMoreRunPrompt(ensureRunSummary());

  if (reason === 'daily-complete') {
    clearGameBannerQueue();
    renderGameOverSummary();
    showOverlay('ov-gameover');
    return;
  }

  // Fade in "No more space!", hold, then fade out before showing the game-over card.
  showNoMoreSpaceMsg(() => {
    clearGameBannerQueue();
    renderGameOverSummary();
    showOverlay('ov-gameover');
  });
}

// ── End-of-game messages ───────────────────────────────────
function showNoMoreSpaceMsg(cb) {
  const overlay = document.createElement('div');
  overlay.className = 'no-space-overlay';
  const span = document.createElement('span');
  span.className = 'no-space-text';
  span.textContent = 'No more space!';
  overlay.appendChild(span);
  document.body.appendChild(overlay);

  // After fade-in + hold, fade out then invoke callback.
  setTimeout(() => {
    overlay.classList.add('fading-out');
    setTimeout(() => {
      overlay.remove();
      if (cb) cb();
    }, ANIM_NO_SPACE_OUT);
  }, ANIM_NO_SPACE_IN + ANIM_NO_SPACE_HOLD);
}

function showChooseCarefullyMsg() {
  const boardRect = document.getElementById('board-wrap').getBoundingClientRect();
  const msg = document.createElement('div');
  msg.className = 'choose-carefully-msg';
  msg.textContent = 'Choose carefully…';
  // Centre the pill vertically in the board
  msg.style.top = (boardRect.top + boardRect.height / 2) + 'px';
  document.body.appendChild(msg);
  msg.addEventListener('animationend', () => msg.remove(), { once: true });
}

// ── New round / restart ────────────────────────────────────
function newRound() {
  const summary = ensureRunSummary();
  summary.stats.racksCompleted += 1;
  const roundsCompleted = summary.stats.racksCompleted;
  const roundMilestoneReward = getRoundMilestoneReward(roundsCompleted);
  if (roundMilestoneReward) {
    awardCoins(roundMilestoneReward, `${roundsCompleted} rounds completed`, {
      silent: true,
      celebrate: true,
      major: true,
    });
    showMilestoneMoment({
      eyebrow: 'Coin reward',
      title: `+${roundMilestoneReward} coins`,
      detail: `${roundsCompleted} rounds completed`,
      major: true,
      anchor: '#score-wrap',
      announce: `${roundMilestoneReward} coin reward for ${roundsCompleted} rounds completed.`,
    });
  }
  evaluateRunObjectives();
  updateDailyMissionProgress('racks', 1);

  used    = Array(rackSize).fill(false);
  pieces  = smartPieces();
  if (colorSetting === 'random') applyColor('random');
  renderRack();
  updateRackPlayability();
  if (trainingMode) showHint();
  saveCurrentGame();
  if (isGameOver()) {
    setTimeout(triggerGameOver, 150);
  } else if (rackSize > 1 && orderMatters()) {
    showChooseCarefullyMsg();
  }
}

function startNewGame(options = {}) {
  if (options.trigger === 'prompt') {
    recordOneMoreRunAccepted(options.promptType || '');
  } else if (options.resetPromptChain !== false) {
    resetOneMoreRunRetryChain();
  }

  if (options.sessionType === 'daily') {
    const requestedDate = isPlayableDailyChallengeDate(options.dailyDate)
      ? options.dailyDate
      : (isPlayableDailyChallengeDate(selectedDailyChallengeDateKey) ? selectedDailyChallengeDateKey : getUTCDateKey());
    const challenge = ensureDailyChallengeForDate(requestedDate);
    configureDailyChallengeSession(challenge, {
      randomState: challenge.seed,
      isHistorical: isHistoricalDailyChallengeDate(challenge.date),
    });
    markDailyChallengeAttempt();
  } else {
    resetStandardSessionState();
  }

  board    = emptyBoard();
  score    = 0;
  combo    = 0;
  gameOver = false;
  clearGameBannerQueue();
  runSummary = createDefaultRunSummary();
  if (isDailyChallengeSession()) {
    (dailyChallengeState.lockedCells || []).forEach(cell => {
      board[cell.r][cell.c] = 1;
    });
    recordRunUpdate({
      title: 'Daily modifier active',
      detail: 'Locked blocks start on the board. Ringed blocks need multiple clears based on their ring count.',
    });
  }
  used     = Array(rackSize).fill(false);
  pieces   = smartPieces();

  applyColor(colorSetting);
  updateScoreUI();
  renderBoard();
  renderRack();
  updateRackPlayability();
  if (trainingMode) showHint();
  else clearHint();
  updateTrainingPanel();
  saveCurrentGame();
  renderDashboard();

  hideOverlay('ov-gameover');
  document.getElementById('move-eval').textContent = '';
  document.getElementById('strategy-note').textContent = '';
}

// ── Score UI ───────────────────────────────────────────────
function updateScoreUI() {
  const el = document.getElementById('score-main');
  const prev = el.textContent;
  el.textContent = score;
  document.getElementById('today-val').textContent  = Math.max(todayScore, score);
  document.getElementById('best-val').textContent   = Math.max(bestScore, score);
  updateCoinUI();
  syncDailyChallengeScoreProgress();
  maybeCompleteDailyChallenge();
  renderSessionModeBadge();

  // Bump animation when score changes
  if (String(score) !== prev) {
    el.classList.remove('bump');
    void el.offsetWidth; // reflow to restart animation
    el.classList.add('bump');
  }
}

// ── Training: metrics ──────────────────────────────────────
function countHoles(b) {
  b = b || board;
  let n = 0;
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      if (b[r][c]) continue;
      const nbrs = [[r-1,c],[r+1,c],[r,c-1],[r,c+1]];
      if (nbrs.every(([nr,nc]) => nr < 0 || nr >= N || nc < 0 || nc >= N || b[nr][nc]))
        n++;
    }
  }
  return n;
}

function countOpenLanes(b) {
  b = b || board;
  let n = 0;
  for (let r = 0; r < N; r++) if (b[r].every(v => !v)) n++;
  for (let c = 0; c < N; c++) if (b.every(row => !row[c])) n++;
  return n;
}

function centreCongestion(b) {
  b = b || board;
  let n = 0;
  for (let r = 3; r < 6; r++) for (let c = 3; c < 6; c++) if (b[r][c]) n++;
  return n;
}

function fragmentation(b) {
  b = b || board;
  // Count number of empty connected components (rough metric)
  const visited = Array.from({ length: N }, () => new Array(N).fill(false));
  let components = 0;
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      if (b[r][c] || visited[r][c]) continue;
      components++;
      // BFS flood fill
      const q = [[r, c]];
      visited[r][c] = true;
      while (q.length) {
        const [cr, cc] = q.shift();
        for (const [nr, nc] of [[cr-1,cc],[cr+1,cc],[cr,cc-1],[cr,cc+1]]) {
          if (nr >= 0 && nr < N && nc >= 0 && nc < N && !b[nr][nc] && !visited[nr][nc]) {
            visited[nr][nc] = true;
            q.push([nr, nc]);
          }
        }
      }
    }
  }
  return components;
}

function updateTrainingPanel() {
  if (!trainingMode) return;

  const holes  = countHoles();
  const lanes  = countOpenLanes();
  const centre = centreCongestion();

  document.querySelector('#m-holes b').textContent  = holes;
  document.querySelector('#m-lanes b').textContent  = lanes;
  document.querySelector('#m-centre b').textContent = centre <= 3 ? 'ok' : centre <= 6 ? 'busy' : 'full';
  document.querySelector('#m-combo b').textContent  = combo;

  document.getElementById('strategy-note').textContent = strategyNote(holes, lanes, centre);
}

function strategyNote(holes, lanes, centre) {
  if (holes > 4)   return '⚠️ Many isolated holes — avoid blocking empty cells.';
  if (centre > 6)  return '⚠️ Centre is congested — try to clear those boxes soon.';
  if (lanes < 4)   return '⚠️ Few open lanes — prioritise clearing rows/cols.';
  if (combo > 2)   return `🔥 ${combo}× combo! Keep clearing to maximise score.`;
  if (holes === 0 && lanes >= 12) return '✅ Clean board — build towards a multi-clear.';
  return '💡 Look for placements that complete a full row, column or 3×3 box.';
}

// ── Training: hint ─────────────────────────────────────────
let hintActive = false;

// Return all permutations of an array
function getPermutations(arr) {
  if (arr.length <= 1) return [arr.slice()];
  const result = [];
  for (let i = 0; i < arr.length; i++) {
    const rest = arr.filter((_, j) => j !== i);
    for (const perm of getPermutations(rest)) result.push([arr[i], ...perm]);
  }
  return result;
}

// Evaluate a move on an arbitrary board snapshot (not the live board)
function evalMoveOnBoard(cells, row, col, b) {
  const tmp = b.map(r => [...r]);
  for (const [dr, dc] of cells) tmp[row + dr][col + dc] = 1;

  const clrs = getClearsOnBoard(tmp);
  const afterBoard = applyClears(tmp, clrs);

  let val = cells.length;
  val += clrs.total * 18;
  if (clrs.total > 1) val += (clrs.total - 1) * 12;
  val -= countHoles(afterBoard) * 7;
  val += countOpenLanes(afterBoard) * 2;
  val -= centreCongestion(afterBoard) * 2;
  val -= fragmentation(afterBoard) * 3;
  return val;
}

// Greedy best-placement sequence for a given ordering of slot indices, starting from board b
function greedySequence(order, startBoard) {
  let b = startBoard.map(r => [...r]);
  const moves = [];
  let totalScore = 0;

  for (const slotIdx of order) {
    const cells = pieces[slotIdx];
    let bestVal = -Infinity;
    let bestMove = null;

    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        let ok = true;
        for (const [dr, dc] of cells) {
          const nr = r + dr, nc = c + dc;
          if (nr < 0 || nr >= N || nc < 0 || nc >= N || b[nr][nc]) { ok = false; break; }
        }
        if (!ok) continue;
        const val = evalMoveOnBoard(cells, r, c, b);
        if (val > bestVal) { bestVal = val; bestMove = { slotIdx, r, c, cells }; }
      }
    }

    if (!bestMove) return null; // can't place this piece
    moves.push(bestMove);
    totalScore += bestVal;

    // Apply placement + clears to b
    for (const [dr, dc] of cells) b[bestMove.r + dr][bestMove.c + dc] = 1;
    const clrs = getClearsOnBoard(b);
    b = applyClears(b, clrs);
  }

  return { moves, score: totalScore };
}

// Find the best sequence of placements for all unplaced slots
function findBestSequence() {
  const unplaced = Array.from({ length: rackSize }, (_, i) => i).filter(i => !used[i]);
  if (unplaced.length === 0) return null;

  let bestScore = -Infinity;
  let bestMoves = null;

  for (const order of getPermutations(unplaced)) {
    const result = greedySequence(order, board);
    if (result && result.score > bestScore) {
      bestScore = result.score;
      bestMoves = result.moves;
    }
  }

  return bestMoves;
}

function showHint() {
  clearHint();

  const sequence = findBestSequence();
  if (!sequence || sequence.length === 0) return;

  const hintClasses = ['hint-cell', 'hint-cell-2', 'hint-cell-3'];
  const hintSlotClasses = ['hint-slot', 'hint-slot-2', 'hint-slot-3'];
  sequence.forEach((move, idx) => {
    const cls = hintClasses[idx] || 'hint-cell';
    for (const [dr, dc] of move.cells) {
      const el = cellEl(move.r + dr, move.c + dc);
      if (el) el.classList.add(cls);
    }
    const slotCls = hintSlotClasses[idx] || 'hint-slot';
    document.getElementById(`slot-${move.slotIdx}`).classList.add(slotCls);
  });

  const first = sequence[0];
  const suffix = sequence.length > 1 ? ` · Play slot ${first.slotIdx + 1} first.` : '';
  document.getElementById('move-eval').textContent = explainMove(first.cells, first.r, first.c) + suffix;
  hintActive = true;
}

function getBestNextMove() {
  const sequence = findBestSequence();
  if (!sequence || sequence.length === 0) return null;
  return sequence[0];
}

function autoPlaceBestMove() {
  if (!trainingMode || gameOver || drag) return;
  const bestMove = getBestNextMove();
  if (!bestMove) return;
  if (!canPlace(bestMove.cells, bestMove.r, bestMove.c)) return;
  doPlace(bestMove.slotIdx, bestMove.r, bestMove.c);
}

function clearHint() {
  document.querySelectorAll('.hint-cell, .hint-cell-2, .hint-cell-3')
    .forEach(el => el.classList.remove('hint-cell', 'hint-cell-2', 'hint-cell-3'));
  document.querySelectorAll('.hint-slot, .hint-slot-2, .hint-slot-3')
    .forEach(el => el.classList.remove('hint-slot', 'hint-slot-2', 'hint-slot-3'));
  if (hintActive) {
    document.getElementById('move-eval').textContent = '';
    hintActive = false;
  }
}

// ── Move evaluation heuristics ─────────────────────────────
function evalMove(cells, row, col) {
  return evalMoveOnBoard(cells, row, col, board);
}

function getClearsOnBoard(b) {
  const rows = [], cols = [], boxes = [];
  for (let r = 0; r < N; r++) { if (b[r].every(Boolean)) rows.push(r); }
  for (let c = 0; c < N; c++) { if (b.every(row => row[c])) cols.push(c); }
  for (let br = 0; br < 3; br++) {
    for (let bc = 0; bc < 3; bc++) {
      let full = true;
      outer: for (let r = br * 3; r < br * 3 + 3; r++) {
        for (let c = bc * 3; c < bc * 3 + 3; c++) {
          if (!b[r][c]) { full = false; break outer; }
        }
      }
      if (full) boxes.push([br, bc]);
    }
  }
  return { rows, cols, boxes, total: rows.length + cols.length + boxes.length };
}

function applyClears(b, clrs) {
  const out = b.map(r => [...r]);
  for (const r of clrs.rows) {
    for (let c = 0; c < N; c++) out[r][c] = 0;
  }
  for (const c of clrs.cols) {
    for (let r = 0; r < N; r++) out[r][c] = 0;
  }
  for (const [br, bc] of clrs.boxes) {
    for (let r = br * 3; r < br * 3 + 3; r++) {
      for (let c = bc * 3; c < bc * 3 + 3; c++) out[r][c] = 0;
    }
  }
  return out;
}

function explainMove(cells, row, col) {
  const tmp = board.map(r => [...r]);
  for (const [dr, dc] of cells) tmp[row + dr][col + dc] = 1;

  const clrs  = getClearsOnBoard(tmp);
  const after = applyClears(tmp, clrs);
  const hBefore = countHoles(board);
  const hAfter  = countHoles(after);
  const newHoles = hAfter - hBefore;

  if (clrs.total >= 3) return `✅ Best move — clears ${clrs.total} regions at once!`;
  if (clrs.total === 2) return `✅ Great — clears ${clrs.total} regions simultaneously.`;
  if (clrs.total === 1) {
    if (newHoles > 1) return `⚠️ Clears a region but creates ${newHoles} holes.`;
    return '✅ Clears a region — good for score and space.';
  }
  if (newHoles > 2)   return `⚠️ Risky — creates ${newHoles} isolated holes.`;
  if (newHoles > 0)   return `⚠️ Creates ${newHoles} hole(s). Consider alternatives.`;
  if (countOpenLanes(after) >= countOpenLanes(board))
    return '✅ Safe — preserves open lanes for future pieces.';
  return '💡 Neutral placement — no immediate clears or major penalties.';
}

// ── Animation helpers ──────────────────────────────────────
function showComboPopup(c) {
  const label = c >= 5 ? '🔥🔥🔥' : c >= 3 ? '🔥🔥' : '🔥';
  const popup = document.createElement('div');
  popup.className = 'combo-popup';
  popup.textContent = `${label} ${c}× Combo!`;
  // Position above the board
  const boardRect = document.getElementById('board-wrap').getBoundingClientRect();
  popup.style.top = (boardRect.top + boardRect.height * 0.3) + 'px';
  document.body.appendChild(popup);
  popup.addEventListener('animationend', () => popup.remove());
}

function showPointsPopup(pts) {
  const popup = document.createElement('div');
  popup.className = 'points-popup';
  popup.textContent = `+${pts}`;
  const boardRect = document.getElementById('board-wrap').getBoundingClientRect();
  popup.style.top = (boardRect.top + boardRect.height * 0.45) + 'px';
  document.body.appendChild(popup);
  popup.addEventListener('animationend', () => popup.remove());
}

function showOverlay(id) {
  const ov = document.getElementById(id);
  ov.hidden = false;
  ov.classList.remove('show');
  void ov.offsetWidth; // reflow
  ov.classList.add('show');
}

function hideOverlay(id) {
  const ov = document.getElementById(id);
  ov.classList.remove('show');
  ov.hidden = true;
}

async function copyTextToClipboard(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return true;
  }

  const scratch = document.createElement('textarea');
  scratch.value = text;
  scratch.setAttribute('readonly', '');
  scratch.style.position = 'fixed';
  scratch.style.opacity = '0';
  document.body.appendChild(scratch);
  scratch.select();

  const copied = document.execCommand('copy');
  scratch.remove();
  return copied;
}

async function shareBurohameApp() {
  const shareUrl = `${window.location.origin}${window.location.pathname}`;
  const sharePayload = {
    title: 'Burohame',
    text: 'I have been playing Burohame, this 9×9 puzzle game. Give it a go.',
    url: shareUrl,
  };

  if (navigator.share) {
    try {
      await navigator.share(sharePayload);
      return;
    } catch (error) {
      if (error?.name === 'AbortError') return;
    }
  }

  try {
    const copied = await copyTextToClipboard(shareUrl);
    if (copied) {
      alert('Link copied. Share it with a friend.');
      return;
    }
  } catch (error) {
    // Fallback alert below if clipboard is unavailable.
  }

  alert(`Share this link: ${shareUrl}`);
}

// ── Settings / overlays ────────────────────────────────────
function applySettingsState(nextSettings) {
  const prevRackSize = rackSize;
  const nextTrainingMode = coachModeAccessState.authorised && !!nextSettings.trainingMode;

  trainingMode = nextTrainingMode;
  extendedPieces = nextSettings.extendedPieces;
  darkMode = nextSettings.darkMode;
  const requestedColor = sanitiseColorSetting(nextSettings.colorSetting);
  colorSetting = isColorwayOwned(requestedColor) ? requestedColor : colorSetting;
  rackSize = nextSettings.rackSize;
  leaderboardPlayerName = sanitiseLeaderboardPlayerName(nextSettings.leaderboardPlayerName);
  if (!leaderboardPlayerId) leaderboardPlayerId = createPseudoId();
  configureWeeklyLeaderboardAdapter();

  applyDarkMode(darkMode);
  applyColor(colorSetting);
  applyExtendedPieces(extendedPieces);
  saveSettings();

  document.getElementById('coach-panel').hidden = !trainingMode;
  renderRack();
  updateRackPlayability();
  if (trainingMode) {
    updateTrainingPanel();
    showHint();
  }
  if (!trainingMode) {
    clearHint();
    document.getElementById('move-eval').textContent = '';
    document.getElementById('strategy-note').textContent = '';
  }

  if (rackSize !== prevRackSize) {
    initRackDOM();
    startNewGame();
  }

  populateQuickSettings();
  populateSettingsPage();
  renderDashboard();
}

function openQuickSettingsOverlay() {
  populateQuickSettings();
  showOverlay('ov-quick-settings');
}

document.getElementById('btn-quick-settings').addEventListener('click', openQuickSettingsOverlay);
document.getElementById('btn-quick-settings-close').addEventListener('click', () => {
  hideOverlay('ov-quick-settings');
});
document.getElementById('btn-quick-settings-save').addEventListener('click', () => {
  applySettingsState({
    trainingMode,
    extendedPieces,
    darkMode: document.getElementById('quick-chk-dark').checked,
    colorSetting,
    rackSize,
    leaderboardPlayerName,
  });
  hideOverlay('ov-quick-settings');
});

document.getElementById('btn-dashboard-continue')?.addEventListener('click', () => {
  if (!restoreSavedGame()) return;
  navigateTo('game');
});
document.getElementById('btn-dashboard-play')?.addEventListener('click', () => {
  startNewGame({ resetPromptChain: true });
  navigateTo('game');
});
document.getElementById('btn-dashboard-weekly-page')?.addEventListener('click', () => {
  navigateTo('weekly');
});
document.getElementById('btn-dashboard-unlock-page')?.addEventListener('click', () => {
  navigateTo('shop');
});
document.getElementById('btn-dashboard-daily-play')?.addEventListener('click', () => {
  startNewGame({
    sessionType: 'daily',
    resetPromptChain: true,
    dailyDate: selectedDailyChallengeDateKey || getUTCDateKey(),
  });
  navigateTo('game');
});
document.getElementById('dashboard-daily-date')?.addEventListener('change', event => {
  const nextDate = event.target?.value;
  if (!isPlayableDailyChallengeDate(nextDate)) return;
  selectedDailyChallengeDateKey = nextDate;
  renderDashboard();
});
document.getElementById('btn-dashboard-share')?.addEventListener('click', () => {
  shareBurohameApp();
});
document.querySelectorAll('[data-back-page]').forEach(button => {
  button.addEventListener('click', () => {
    navigateTo(button.dataset.backPage);
  });
});
document.getElementById('btn-game-back').addEventListener('click', () => {
  saveCurrentGame();
  navigateTo('dashboard');
});
document.getElementById('btn-settings-shop').addEventListener('click', () => {
  navigateTo('shop');
});
document.getElementById('btn-settings-badges')?.addEventListener('click', () => {
  navigateTo('badges');
});
document.getElementById('btn-badges-back-settings')?.addEventListener('click', () => {
  navigateTo('settings');
});
document.querySelectorAll('.bottom-nav__item[data-nav-page]').forEach(button => {
  button.addEventListener('click', () => {
    navigateTo(button.dataset.navPage);
  });
});

document.getElementById('btn-bottom-nav-play').addEventListener('click', () => {
  if (getSavedGameSession()) {
    if (!restoreSavedGame()) return;
  } else {
    startNewGame({ resetPromptChain: true });
  }
  navigateTo('game');
});

function handleShopAction(event) {
  const button = event.target.closest('button[data-action]');
  if (!button) return;

  const action = button.dataset.action;
  const itemId = button.dataset.itemId;
  const collection = button.dataset.collection;
  if (!itemId || !collection) return;

  if (collection === 'colorway') {
    if (action === 'unlock') {
      if (!unlockColorway(itemId)) return;
      equipColorway(itemId);
    } else if (action === 'equip') {
      equipColorway(itemId);
    } else {
      return;
    }
  } else if (collection === 'finish') {
    if (action === 'unlock') {
      if (!unlockBlockSkin(itemId)) return;
      equipBlockSkin(itemId);
    } else if (action === 'equip') {
      equipBlockSkin(itemId);
    } else {
      return;
    }
  } else {
    return;
  }

  renderCosmeticsCollection();
  renderDashboard();
}

document.getElementById('collection-list').addEventListener('click', handleShopAction);
document.getElementById('colorway-list').addEventListener('click', handleShopAction);
document.getElementById('badge-list')?.addEventListener('click', event => {
  const button = event.target.closest('button[data-action="equip-badge"]');
  if (!button) return;
  const badgeId = button.dataset.badgeId;
  if (!badgeId) return;
  if (!equipBadge(badgeId)) return;
  renderBadgePage();
});
document.getElementById('page-input-weekly-name').addEventListener('input', () => {
  updateLeaderboardNameAvailabilityIndicator();
});
document.getElementById('page-input-coach-code').addEventListener('input', (event) => {
  const input = event.target;
  if (!(input instanceof HTMLInputElement)) return;
  input.value = input.value.replace(/\D/g, '').slice(0, 6);
});

document.getElementById('btn-coach-auth').addEventListener('click', async () => {
  const inputEl = document.getElementById('page-input-coach-code');
  const unlockButton = document.getElementById('btn-coach-auth');
  if (!(inputEl instanceof HTMLInputElement) || !(unlockButton instanceof HTMLButtonElement)) return;
  const pinCode = inputEl.value.trim();
  if (!SIX_DIGIT_PIN_PATTERN.test(pinCode)) {
    setCoachAuthStatus('Enter a valid six-digit code.', true);
    return;
  }
  if (pinCode === '999111') {
    awardCoins(1000, 'Coach PIN bonus', { celebrate: true, major: true, excludeFromRunSummary: true });
    inputEl.value = '';
    setCoachAuthStatus('Coach bonus unlocked. 1000 coins added.');
    return;
  }

  if (!coachModeHostedAdapter) {
    setCoachAuthStatus('Coach Mode access is unavailable because hosted services are offline.', true);
    return;
  }

  unlockButton.disabled = true;
  setCoachAuthStatus('Checking code...');
  try {
    const result = await coachModeHostedAdapter.verifyPin(pinCode);
    coachModeAccessState = {
      authorised: !!result.authorised,
      expiresAt: Number.isFinite(result.expiresAt) ? result.expiresAt : Date.now() + COACH_MODE_AUTH_SESSION_MS,
    };
    if (!coachModeAccessState.authorised) {
      clearCoachModeAccessState();
      applyCoachModeGate(false);
      setCoachAuthStatus('That code is not valid.', true);
      return;
    }
    persistCoachModeAccessState();
    applyCoachModeGate(true);
    document.getElementById('page-chk-coach').checked = trainingMode;
    inputEl.value = '';
    setCoachAuthStatus(getCoachModeAccessSummary());
  } catch (error) {
    setCoachAuthStatus(error instanceof Error ? error.message : 'Could not verify code right now.', true);
  } finally {
    unlockButton.disabled = false;
  }
});

async function resolveLeaderboardNameForSave(requestedName) {
  const normalisedRequestedName = normaliseRequestedLeaderboardName(requestedName);
  if (!hasHostedWeeklyLeaderboardConfig()) {
    return sanitiseLeaderboardPlayerName(sanitiseLocalLeaderboardName(normalisedRequestedName));
  }

  if (!normalisedRequestedName) {
    return sanitiseLeaderboardPlayerName(leaderboardPlayerName);
  }

  const claimedHandle = await tryClaimLeaderboardHandle(normalisedRequestedName, { requireClaim: true });
  return claimedHandle || sanitiseLeaderboardPlayerName(sanitiseLocalLeaderboardName(normalisedRequestedName));
}

document.getElementById('btn-settings-save').addEventListener('click', async () => {
  let resolvedLeaderboardName = sanitiseLeaderboardPlayerName(leaderboardPlayerName);
  try {
    resolvedLeaderboardName = await resolveLeaderboardNameForSave(
      document.getElementById('page-input-weekly-name').value,
    );
  } catch (error) {
    alert(error instanceof Error ? error.message : 'Could not update leaderboard name right now.');
    populateSettingsPage();
    return;
  }

  applySettingsState({
    trainingMode: document.getElementById('page-chk-coach').checked,
    extendedPieces: document.getElementById('page-chk-extended').checked,
    darkMode: document.getElementById('page-chk-dark').checked,
    colorSetting: sanitiseColorSetting(document.getElementById('page-sel-color').value),
    rackSize: parseInt(document.getElementById('page-sel-rack').value, 10),
    leaderboardPlayerName: resolvedLeaderboardName,
  });
  try {
    await publishWeeklyLeaderboardEntry();
    await refreshWeeklyLeaderboard(getCurrentUTCWeekId(), { force: true });
  } catch (_) {
    // Keep settings save responsive even if leaderboard sync fails.
  }
  navigateTo('dashboard');
});

document.getElementById('btn-clear-data').addEventListener('click', async () => {
  if (!confirm('Clear all game progress and cached data?\nThis cannot be undone.')) return;

  // Remove game progress from localStorage
  clearStoredProgressionData();

  // Unregister service workers so new assets are fetched on next load
  if ('serviceWorker' in navigator) {
    const regs = await navigator.serviceWorker.getRegistrations();
    await Promise.all(regs.map(r => r.unregister()));
  }

  // Delete all cached responses (style, script, etc.)
  if ('caches' in window) {
    const keys = await caches.keys();
    await Promise.all(keys.map(k => caches.delete(k)));
  }

  location.reload();
});

document.getElementById('btn-auto-place').addEventListener('click', () => {
  autoPlaceBestMove();
});

document.getElementById('btn-restart').addEventListener('click', () => {
  startNewGame({ resetPromptChain: true });
});

document.getElementById('btn-new').addEventListener('click', () => {
  const button = document.getElementById('btn-new');
  startNewGame({
    sessionType: button.dataset.sessionType === 'daily' ? 'daily' : 'standard',
    trigger: button.dataset.prompted === 'true' ? 'prompt' : 'manual',
    promptType: button.dataset.promptType || '',
    dailyDate: button.dataset.dailyDate || selectedDailyChallengeDateKey || getUTCDateKey(),
  });
  navigateTo('game');
});

document.getElementById('btn-gameover-dashboard').addEventListener('click', () => {
  if (ensureRunSummary().continuePrompt?.id) recordOneMoreRunDismissed();
  hideOverlay('ov-gameover');
  navigateTo('dashboard');
  renderDashboard();
});

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState !== 'visible') return;
  if (coachModeAccessState.authorised && coachModeAccessState.expiresAt <= Date.now()) {
    handleCoachModeAccessExpiry();
  } else {
    syncCoachModeAccessExpiry();
  }
  renderDailyMissions();
  ensureDailyChallengeForToday();
  ensureQuestBoardForCurrentCycle();
  ensureWeeklyLadderForCurrentWeek();
  renderDailyChallengePanels();
  renderQuestBoard();
  renderWeeklyLadder();
  renderCosmeticsCollection();
  renderDashboard();
});

// Prevent body scroll while dragging on iOS
document.addEventListener('touchstart', e => {
  if (e.target.closest('.slot')) e.preventDefault();
}, { passive: false });

function addMediaQueryChangeListener(mediaQueryList, listener) {
  if (!mediaQueryList) return;
  if (typeof mediaQueryList.addEventListener === 'function') {
    mediaQueryList.addEventListener('change', listener);
    return;
  }
  if (typeof mediaQueryList.addListener === 'function') {
    mediaQueryList.addListener(listener);
  }
}

function isPhoneLandscape() {
  const landscape = window.matchMedia('(orientation: landscape)').matches;
  const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
  const phoneSizedViewport = Math.min(window.innerWidth, window.innerHeight) <= 600;
  return landscape && coarsePointer && phoneSizedViewport;
}

function updateOrientationLock() {
  const lock = document.getElementById('orientation-lock');
  if (!lock) return;
  lock.classList.toggle('hidden', !isPhoneLandscape());
}

function preventLandscapeOnPhone() {
  updateOrientationLock();
  window.addEventListener('resize', updateOrientationLock);
  window.addEventListener('orientationchange', updateOrientationLock);
}

function hideLoadingScreen() {
  const loadingScreen = document.getElementById('app-loading-screen');
  document.body.classList.remove('app-loading');
  if (!loadingScreen) return;
  loadingScreen.classList.add('is-hidden');
  window.setTimeout(() => {
    loadingScreen.remove();
  }, 260);
}

async function init() {
  loadRuntimeConfig();
  applyProgressionResetIfNeeded();
  bestScore  = parseInt(localStorage.getItem('bst-best') || '0', 10);
  const todayKey = new Date().toISOString().slice(0, 10);
  const td   = JSON.parse(localStorage.getItem('bst-today') || '{"d":"","s":0}');
  todayScore = (td.d === todayKey) ? td.s : 0;

  loadProgressionState();
  evaluateCollectionAlbumRewards();
  ensureDailyMissionsForToday();
  ensureDailyChallengeForToday();
  selectedDailyChallengeDateKey = getUTCDateKey();
  ensureQuestBoardForCurrentCycle();
  ensureWeeklyLadderForCurrentWeek();
  resetStandardSessionState();
  updateCoinUI();
  applyEquippedCosmeticSkin();
  loadSettings();
  loadCoachModeAccessStateFromSession();
  if (!weeklyLeaderboardHostedAdapter) configureWeeklyLeaderboardAdapter();
  await checkCoachModeSession();
  ensureLeaderboardHandleClaimedOnJoin().catch(() => {
    // Keep startup fast and resilient if hosted claims are unavailable.
  });
  refreshPreviousWeeklyLeaderboard(getPreviousUTCWeekId()).catch(() => {
    // Keep startup resilient if hosted leaderboard reads fail.
  });
  ensureSelectedColorway({ preserveLegacy: true });
  applyDarkMode(darkMode);
  applyColor(colorSetting);
  applyExtendedPieces(extendedPieces);
  document.getElementById('coach-panel').hidden = !trainingMode;

  // Follow OS dark-mode changes dynamically when the user hasn't set
  // an explicit preference (i.e. no saved 'dark' key in settings yet).
  const darkMQ = window.matchMedia('(prefers-color-scheme: dark)');
  addMediaQueryChangeListener(darkMQ, e => {
    const s = JSON.parse(localStorage.getItem('bst-settings') || '{}');
    if (typeof s.dark !== 'boolean') {
      darkMode = e.matches;
      applyDarkMode(darkMode);
    }
  });

  initBoardDOM();
  initRackDOM();
  renderDailyMissions();

  board = emptyBoard();
  pieces = [];
  used = Array(rackSize).fill(true);
  score = 0;
  combo = 0;
  gameOver = false;
  runSummary = createDefaultRunSummary();
  renderBoard();
  updateScoreUI();

  if (getSavedGameSession()) {
    restoreSavedGame();
  }

  populateQuickSettings();
  populateSettingsPage();
  renderDashboard();
  navigateTo('dashboard');
  preventLandscapeOnPhone();
}

window.addEventListener('online', () => {
  if (currentPage !== 'weekly') return;
  renderWeeklyGlobalLeaderboard();
  refreshWeeklyLeaderboard(getCurrentUTCWeekId(), { force: true });
  refreshPreviousWeeklyLeaderboard(getPreviousUTCWeekId(), { force: true });
  startWeeklyLeaderboardPolling();
});

window.addEventListener('offline', () => {
  stopWeeklyLeaderboardPolling();
  renderWeeklyGlobalLeaderboard();
});

init()
  .catch(error => {
    console.error('Initialisation failed:', error);
  })
  .finally(() => {
    hideLoadingScreen();
  });
