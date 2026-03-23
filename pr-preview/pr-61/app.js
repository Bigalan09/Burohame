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
let coinToastOffset = 0;
let runSummary = null;
let currentPage = 'dashboard';
let currentSessionType = 'standard';
let dailyChallengeState = {
  date: '',
  seed: 0,
  targetScore: 0,
  randomState: 0,
};

const COLOR_NAMES = ['orange','blue','green','purple','red','teal','pink'];
const PROGRESSION_STORAGE_KEY = 'bst-progression';
const GAME_SESSION_STORAGE_KEY = 'bst-current-run';
const PROGRESSION_STATE_VERSION = 4;
const REDUCED_MOTION_QUERY = window.matchMedia('(prefers-reduced-motion: reduce)');
const DAILY_CHALLENGE_REWARD_BASE = 12;
const DAILY_CHALLENGE_STREAK_STEP = 2;
const DAILY_CHALLENGE_STREAK_BONUS_CAP = 10;
const SHOP_PRICE_MULTIPLIER = 2;
const COIN_REWARD_MULTIPLIER = 0.8;
const DAILY_CHALLENGE_TARGET_MIN = 140;
const DAILY_CHALLENGE_TARGET_RANGE = 51;
const COIN_REWARDS = Object.freeze({
  clearRegion: 0,
  multiClearBonus: 0,
  comboStep: 0,
  roundMilestoneEvery: 10,
  roundMilestoneReward: 12,
  endRunBase: 16,
  endRunPer50Score: 2,
  personalBestBonus: 18,
});
function scaleShopPrice(amount) {
  if (!amount) return 0;
  return Math.max(0, Math.round(amount * SHOP_PRICE_MULTIPLIER));
}

function scaleCoinReward(amount) {
  if (!amount) return 0;
  return Math.max(1, Math.round(amount * COIN_REWARD_MULTIPLIER));
}

const DAILY_MISSION_TEMPLATES = Object.freeze([
  {
    templateId: 'score-120',
    kind: 'score',
    goal: 120,
    reward: scaleCoinReward(18),
    title: 'Point collector',
    description: 'Score 120 points across today’s runs.',
  },
  {
    templateId: 'blocks-30',
    kind: 'blocks',
    goal: 30,
    reward: scaleCoinReward(14),
    title: 'Builder’s rhythm',
    description: 'Place 30 blocks today.',
  },
  {
    templateId: 'regions-8',
    kind: 'regions',
    goal: 8,
    reward: scaleCoinReward(16),
    title: 'Board cleaner',
    description: 'Clear 8 regions today.',
  },
  {
    templateId: 'racks-4',
    kind: 'racks',
    goal: 4,
    reward: scaleCoinReward(12),
    title: 'Rack runner',
    description: 'Finish 4 full racks today.',
  },
  {
    templateId: 'combo-4',
    kind: 'combo',
    goal: 4,
    reward: scaleCoinReward(20),
    title: 'Heat check',
    description: 'Reach a 4× combo in a run today.',
  },
  {
    templateId: 'runs-3',
    kind: 'runs',
    goal: 3,
    reward: scaleCoinReward(10),
    title: 'Keep going',
    description: 'Complete 3 runs today.',
  },
]);
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
    price: scaleShopPrice(90),
    icon: '🎲',
    swatches: ['#ffd08a', '#5ac8fa', '#af52de'],
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
    },
    {
      id: 'satin',
      name: 'Satin',
      description: 'Soft rounded edges with a calm sheen.',
      price: scaleShopPrice(60),
    },
    {
      id: 'carbon',
      name: 'Carbon',
      description: 'Sharper edges with a grounded board-game feel.',
      price: scaleShopPrice(110),
    },
    {
      id: 'prism',
      name: 'Prism',
      description: 'A brighter faceted shine for high-score chasers.',
      price: scaleShopPrice(170),
    },
    {
      id: 'velvet',
      name: 'Velvet',
      description: 'A softer matte finish with rounded edges.',
      price: scaleShopPrice(140),
    },
    {
      id: 'frost',
      name: 'Frost',
      description: 'Cool highlights and lighter faces for clean boards.',
      price: scaleShopPrice(190),
    },
    {
      id: 'ember',
      name: 'Ember',
      description: 'Deeper shadows and hotter highlights for tense runs.',
      price: scaleShopPrice(230),
    },
  ],
});
const BLOCK_SKIN_LOOKUP = Object.freeze(
  COSMETIC_CATALOGUE.blockSkins.reduce((acc, skin) => {
    acc[skin.id] = skin;
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
  };
}

function configureDailyChallengeSession(dailyState, options = {}) {
  currentSessionType = 'daily';
  dailyChallengeState = {
    date: dailyState.date,
    seed: dailyState.seed,
    targetScore: dailyState.targetScore,
    randomState: clampWholeNumber(options.randomState, dailyState.seed || 1) || (dailyState.seed || 1),
  };
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
    },
    dailyMissions: {
      date: '',
      missions: [],
      completedIds: [],
      claimedIds: [],
      refreshCount: 0,
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
    streak: {
      current: 0,
      best: 0,
      lastActiveDate: '',
      lastRewardDate: '',
      freezes: 0,
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

function sanitiseProgressionState(rawState) {
  const defaults = createDefaultProgressionState();
  const src = rawState && typeof rawState === 'object' ? rawState : {};
  const coins = src.coins && typeof src.coins === 'object' ? src.coins : {};
  const unlocks = src.unlocks && typeof src.unlocks === 'object' ? src.unlocks : {};
  const cosmetics = src.cosmetics && typeof src.cosmetics === 'object' ? src.cosmetics : {};
  const streak = src.streak && typeof src.streak === 'object' ? src.streak : {};
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
    },
    dailyMissions: sanitiseMissionState(src.dailyMissions),
    dailyChallenge: sanitiseDailyChallengeState(src.dailyChallenge),
    streak: {
      current: clampWholeNumber(streak.current, defaults.streak.current),
      best: clampWholeNumber(streak.best, defaults.streak.best),
      lastActiveDate: typeof streak.lastActiveDate === 'string' ? streak.lastActiveDate : '',
      lastRewardDate: typeof streak.lastRewardDate === 'string' ? streak.lastRewardDate : '',
      freezes: clampWholeNumber(streak.freezes, defaults.streak.freezes),
    },
  };
}

function createDefaultRunSummary() {
  return {
    finalScore: 0,
    coinsEarned: 0,
    completedObjectiveIds: [],
    stats: {
      regionsCleared: 0,
      maxCombo: 0,
      racksCompleted: 0,
      personalBest: false,
    },
  };
}

function ensureRunSummary() {
  if (!runSummary) runSummary = createDefaultRunSummary();
  return runSummary;
}

function prefersReducedMotion() {
  return REDUCED_MOTION_QUERY.matches;
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
  const layer = document.getElementById('milestone-layer');
  if (!layer) return;

  const chip = document.createElement('section');
  chip.className = `milestone-chip${major ? ' milestone-chip--major' : ''}`;

  const resolvedAnchor = typeof anchor === 'string' ? document.querySelector(anchor) : anchor;
  const top = resolvedAnchor
    ? Math.max(88, resolvedAnchor.getBoundingClientRect().top - 18)
    : 104;
  chip.style.top = `${top}px`;

  chip.innerHTML = `
    <span class="milestone-chip__eyebrow">${eyebrow}</span>
    <strong class="milestone-chip__title">${title}</strong>
    ${detail ? `<span class="milestone-chip__detail">${detail}</span>` : ''}
    <span class="milestone-chip__glow"></span>
  `;

  if (!prefersReducedMotion()) {
    for (let i = 0; i < 6; i++) {
      const spark = document.createElement('span');
      spark.className = 'milestone-chip__spark';
      chip.appendChild(spark);
    }
  }

  layer.appendChild(chip);
  if (announce) announceMilestone(announce);
  chip.addEventListener('animationend', () => chip.remove(), { once: true });
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
  const objectivesList = document.getElementById('go-objectives-list');
  const objectiveCount = document.getElementById('go-objective-count');
  const intro = document.querySelector('.summary-intro');
  const dailySummary = document.getElementById('go-daily-summary');
  const dailyStatus = document.getElementById('go-daily-status');
  const dailyCopy = document.getElementById('go-daily-copy');
  const nextRunButton = document.getElementById('btn-new');
  const dashboardButton = document.getElementById('btn-gameover-dashboard');

  document.getElementById('go-score').textContent = String(summary.finalScore);
  document.getElementById('go-best').textContent = String(bestScore);
  document.getElementById('go-coins-earned').textContent = `+${summary.coinsEarned}`;
  document.getElementById('go-coin-total').textContent = String(getCoinBalance());
  objectiveCount.textContent = objectives.length === 1 ? '1 cleared' : `${objectives.length} cleared`;
  if (intro) {
    intro.textContent = isDailyChallengeSession()
      ? 'Your daily challenge result is locked in.'
      : 'Your run rewards are ready.';
  }
  if (nextRunButton) {
    nextRunButton.textContent = isDailyChallengeSession() ? 'Play another run' : 'Start next run';
  }
  if (dashboardButton) {
    dashboardButton.setAttribute('aria-label', isDailyChallengeSession() ? 'Back to dashboard from daily challenge summary' : 'Back to dashboard');
  }

  if (dailySummary && dailyStatus && dailyCopy) {
    if (isDailyChallengeSession()) {
      const challenge = ensureDailyChallengeForToday();
      const complete = challenge.completedAt === challenge.date;
      dailySummary.hidden = false;
      dailyStatus.textContent = complete ? 'Completed' : 'Missed';
      dailyCopy.textContent = complete
        ? `Target ${challenge.targetScore} reached. Best score ${Math.max(challenge.bestScore, summary.finalScore)}.`
        : `Target ${challenge.targetScore}. Best score ${Math.max(challenge.bestScore, summary.finalScore)}.`;
    } else {
      dailySummary.hidden = true;
    }
  }

  objectivesList.innerHTML = '';
  if (!objectives.length) {
    const emptyItem = document.createElement('li');
    emptyItem.className = 'run-objective run-objective--empty';
    emptyItem.textContent = 'No objectives completed this run. Your next run can still earn coins and milestones.';
    objectivesList.appendChild(emptyItem);
    return;
  }

  for (const objective of objectives) {
    const item = document.createElement('li');
    item.className = 'run-objective';
    item.innerHTML = `<strong>${objective.label}</strong><span>${objective.description}</span>`;
    objectivesList.appendChild(item);
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

function getCoinBalance() {
  return progressionState?.coins?.balance || 0;
}

function updateCoinUI() {
  const coinEl = document.getElementById('coin-balance');
  if (coinEl) coinEl.textContent = getCoinBalance();
  const dashboardCoinEl = document.getElementById('dashboard-coins');
  if (dashboardCoinEl) dashboardCoinEl.textContent = String(getCoinBalance());
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

function isBlockSkinOwned(skinId) {
  return getOwnedBlockSkins().includes(skinId);
}

function isColorwayOwned(colorId) {
  return getOwnedColorways().includes(colorId);
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

  const colourNote = document.getElementById('page-colour-note');
  if (colourNote) {
    const owned = getOwnedColorways().length;
    colourNote.textContent = `${owned}/${COLORWAY_CATALOGUE.length} colourways owned. Unlock more in the shop.`;
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
  return scaleCoinReward(baseReward);
}

function clearRewardLabel(totalRegions, comboValue) {
  if (totalRegions >= 2 && comboValue >= 2) return `${totalRegions}-clear combo`;
  if (totalRegions >= 2) return `${totalRegions}-clear move`;
  if (comboValue >= 2) return 'Combo bonus';
  return 'Clear reward';
}

function calculateEndRunCoinReward(finalScore) {
  const baseReward = COIN_REWARDS.endRunBase + Math.floor(finalScore / 50) * COIN_REWARDS.endRunPer50Score;
  return scaleCoinReward(baseReward);
}

function getRoundMilestoneReward(roundsCompleted) {
  if (!roundsCompleted) return 0;
  return roundsCompleted % COIN_REWARDS.roundMilestoneEvery === 0
    ? scaleCoinReward(COIN_REWARDS.roundMilestoneReward)
    : 0;
}

function showCoinToast(amount, reason, options = {}) {
  const anchor = document.querySelector('.coins-stat') || document.getElementById('score-wrap');
  if (!anchor) return;

  const toast = document.createElement('div');
  const isSpend = !!options.spend || amount < 0;
  const isReward = !isSpend && (options.celebrate || amount >= 8);
  const isMajor = !isSpend && (options.major || amount >= 16);
  toast.className = `coin-toast${isSpend ? ' coin-toast--spend' : ''}${isReward ? ' coin-toast--reward' : ''}${isMajor ? ' coin-toast--major' : ''}`;
  const prefix = amount >= 0 ? '+' : '−';
  toast.innerHTML = `
    <strong>🪙 ${prefix}${Math.abs(amount)}</strong>
    <span>${reason}</span>
    ${!isSpend && isReward ? '<span class="coin-toast__sparkles" aria-hidden="true"><i></i><i></i><i></i></span>' : ''}
  `;

  const rect = anchor.getBoundingClientRect();
  const maxLeft = Math.max(12, window.innerWidth - 232);
  coinToastOffset = (coinToastOffset + 1) % 3;
  toast.style.left = `${Math.min(maxLeft, Math.max(12, rect.left - 20 + coinToastOffset * 10))}px`;
  toast.style.top = `${Math.max(12, rect.bottom + 8 + coinToastOffset * 6)}px`;

  document.body.appendChild(toast);
  toast.addEventListener('animationend', () => toast.remove(), { once: true });
}

function awardMissionCoins(amount, missionName = 'Mission complete') {
  return awardCoins(amount, missionName, { silent: true, celebrate: true, major: amount >= 18 });
}

function ensureDailyMissionsForToday() {
  const todayKey = getLocalDateKey();
  const currentDate = progressionState?.dailyMissions?.date || '';
  if (currentDate === todayKey && progressionState?.dailyMissions?.missions?.length) {
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
  const challengeSeed = getDailyChallengeSeed(todayKey);
  const targetScore = getDailyChallengeTarget(challengeSeed);

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
  return scaleCoinReward(baseReward);
}

function getDailyChallengeStatus(challenge = ensureDailyChallengeForToday()) {
  const displayedStreak = getDisplayedStreakCount();
  const complete = challenge.completedAt === challenge.date;
  const remaining = Math.max(0, challenge.targetScore - challenge.bestScore);
  const reward = getDailyChallengeRewardAmount(complete ? displayedStreak : Math.max(1, displayedStreak || 1));
  return {
    complete,
    remaining,
    reward,
    streak: displayedStreak,
  };
}

function getDailyChallengeBestLabel(challenge) {
  if (!challenge.bestScore) return 'Best 0';
  return `Best ${challenge.bestScore}`;
}

function markDailyChallengeAttempt() {
  if (!isDailyChallengeSession()) return;
  const todayChallenge = ensureDailyChallengeForToday();
  updateProgressionState(state => {
    if (state.dailyChallenge.date === todayChallenge.date) {
      state.dailyChallenge.attempts += 1;
    }
    return state;
  });
}

function maybeCompleteDailyChallenge() {
  if (!isDailyChallengeSession()) return;

  const challenge = ensureDailyChallengeForToday();
  if (challenge.completedAt === challenge.date || score < challenge.targetScore) return;

  const todayKey = challenge.date;
  const yesterdayKey = getPreviousDateKey(todayKey);
  let streakCount = 1;

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
    celebrate: true,
    major: streakCount >= 3,
  });
  showMilestoneMoment({
    eyebrow: `Daily challenge cleared`,
    title: `Target ${challenge.targetScore} reached`,
    detail: `Streak ${streakCount}. +${rewardAmount} coins added.`,
    major: streakCount >= 3,
    anchor: '#score-wrap',
    announce: `Daily challenge complete. ${rewardAmount} coins awarded. ${streakCount} day streak.`,
  });
  renderDashboard();
}

function syncDailyChallengeScoreProgress() {
  if (!isDailyChallengeSession()) return;
  const challenge = ensureDailyChallengeForToday();
  if (score <= challenge.bestScore) return;

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

function renderDailyMissions() {
  const missionState = ensureDailyMissionsForToday();
  const list = document.getElementById('missions-list');
  const count = document.getElementById('missions-count');
  const subtitle = document.getElementById('missions-subtitle');
  const badge = document.getElementById('mission-badge');
  if (!list || !count || !subtitle || !badge) return;

  const { completed, total } = getDailyMissionCounts();
  count.textContent = `${completed}/${total} completed`;
  subtitle.textContent = `Fresh goals for ${missionState.date}. Rewards are paid automatically when you finish them.`;
  badge.textContent = total ? `${completed}/${total}` : '0/0';
  badge.hidden = !total;

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

  const missionCopy = document.getElementById('dashboard-mission-copy');
  if (missionCopy) missionCopy.textContent = `${completed}/${total} missions completed today.`;
}

function getCollectionSubtitle() {
  const ownedCount = getOwnedBlockSkins().length;
  const totalCount = COSMETIC_CATALOGUE.blockSkins.length;
  if (ownedCount === totalCount) return 'Every finish is unlocked and ready to equip.';
  return `${ownedCount}/${totalCount} finishes owned.`;
}

function getColorwaySubtitle() {
  const ownedCount = getOwnedColorways().length;
  const totalCount = COLORWAY_CATALOGUE.length;
  if (ownedCount === totalCount) return 'Every colourway is unlocked and ready to equip.';
  return `${ownedCount}/${totalCount} colourways owned.`;
}

function getShopActionMarkup({ owned, equipped, canAfford, price, itemId, collection }) {
  if (equipped) {
    return '<button class="pill-btn pill-btn--secondary" type="button" disabled>Equipped</button>';
  }
  if (owned) {
    return `<button class="pill-btn pill-btn--secondary" type="button" data-action="equip" data-item-id="${itemId}" data-collection="${collection}">Equip</button>`;
  }
  return `<button class="pill-btn${canAfford ? '' : ' pill-btn--secondary'}" type="button" data-action="unlock" data-item-id="${itemId}" data-collection="${collection}" ${canAfford ? '' : 'disabled'}>Unlock · 🪙 ${price}</button>`;
}

function renderCosmeticsCollection() {
  const finishList = document.getElementById('collection-list');
  const colorwayList = document.getElementById('colorway-list');
  const balance = document.getElementById('collection-balance');
  const finishSubtitle = document.getElementById('collection-subtitle');
  const colorwaySubtitle = document.getElementById('colorway-subtitle');
  if (!finishList || !colorwayList || !balance || !finishSubtitle || !colorwaySubtitle) return;

  const coinBalance = getCoinBalance();
  const equippedSkin = getEquippedBlockSkin();
  balance.textContent = `🪙 ${coinBalance}`;
  finishSubtitle.textContent = getCollectionSubtitle();
  colorwaySubtitle.textContent = getColorwaySubtitle();

  colorwayList.innerHTML = '';
  for (const colorway of COLORWAY_CATALOGUE) {
    const owned = isColorwayOwned(colorway.id);
    const equipped = colorSetting === colorway.id;
    const canAfford = coinBalance >= colorway.price;
    const status = equipped ? 'Equipped' : owned ? 'Unlocked' : 'Locked';
    const stateClass = equipped ? 'is-equipped' : owned ? 'is-unlocked' : 'is-locked';
    const costLabel = colorway.price ? `🪙 ${colorway.price}` : 'Free';
    const card = document.createElement('article');
    card.className = 'cosmetic-card cosmetic-card--colorway';
    card.dataset.colorway = colorway.id;
    if (equipped) card.classList.add('cosmetic-card--equipped');
    if (!owned) card.classList.add('cosmetic-card--locked');

    const swatches = colorway.swatches.map(swatch => `<span class="cosmetic-card__tile" style="--swatch:${swatch}"></span>`).join('');
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
            <span>${costLabel}</span>
          </div>
          ${getShopActionMarkup({ owned, equipped, canAfford, price: colorway.price, itemId: colorway.id, collection: 'colorway' })}
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
    const card = document.createElement('article');
    card.className = 'cosmetic-card';
    card.dataset.cosmetic = skin.id;
    if (equipped) card.classList.add('cosmetic-card--equipped');
    if (!owned) card.classList.add('cosmetic-card--locked');

    const status = equipped ? 'Equipped' : owned ? 'Unlocked' : 'Locked';
    const stateClass = equipped ? 'is-equipped' : owned ? 'is-unlocked' : 'is-locked';
    const costLabel = skin.price ? `🪙 ${skin.price}` : 'Free';

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
    showCoinToast(reward, reason, { celebrate: true, major: reward >= 18 });
    showMilestoneMoment({
      eyebrow: 'Daily mission',
      title: `${missionTitle} complete`,
      detail: `+${reward} coins added to your balance.`,
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

// Try placing each piece (in the given slot order) at its first available
// position and return whether all can be placed.
function canFitAllInOrder(order) {
  let b = board.map(r => [...r]);
  for (const i of order) {
    let placed = false;
    outer: for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        if (!canPlaceOnBoard(pieces[i], r, c, b)) continue;
        for (const [dr, dc] of pieces[i]) b[r + dr][c + dc] = 1;
        b = applyClears(b, getClearsOnBoard(b));
        placed = true;
        break outer;
      }
    }
    if (!placed) return false;
  }
  return true;
}

// Returns true when only some orderings allow all pieces to be placed –
// meaning the player must choose carefully which piece to play first.
function orderMatters() {
  if (rackSize <= 1) return false;
  const unplaced = Array.from({ length: rackSize }, (_, i) => i).filter(i => !used[i]);
  if (unplaced.length <= 1) return false;

  // Skip the check on nearly-empty boards – not tight enough to matter.
  const fillCount = board.reduce((sum, row) => sum + row.reduce((total, cell) => total + cell, 0), 0);
  if (fillCount < 28) return false;

  const perms = getPermutations(unplaced);
  let worksCount = 0;
  for (const order of perms) {
    if (canFitAllInOrder(order)) worksCount++;
  }
  // True only if at least one ordering works but not all do.
  return worksCount > 0 && worksCount < perms.length;
}

function randomPiece() {
  return PIECE_DEFS[Math.floor(randomValue() * PIECE_DEFS.length)];
}

// ── Difficulty-weighted piece selection ────────────────────
// As score grows, larger/harder pieces become progressively more likely.
function weightedRandomPiece() {
  // fill: 0 at score 0, 1 at score 200, reaches 1.5 at score 300
  const fill = Math.min(1.5, score / 200);
  // Each piece gets a weight = 1 + fill × (cellCount - 1) × 0.5
  // At fill=0 all weights are equal; at fill=1.5 a 5-cell piece is 4× as likely as a 1-cell piece.
  let totalWeight = 0;
  const weights = PIECE_DEFS.map(p => {
    const w = 1 + fill * (p.length - 1) * 0.5;
    totalWeight += w;
    return w;
  });
  let rand = randomValue() * totalWeight;
  for (let i = 0; i < PIECE_DEFS.length; i++) {
    rand -= weights[i];
    if (rand <= 0) return PIECE_DEFS[i];
  }
  return PIECE_DEFS[PIECE_DEFS.length - 1];
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

// Piece well-suited to an early game (sparse board, score < 200).
// Prefers 3–4 cell pieces for meaningful scoring on an open board.
function earlyPiece() {
  const pool = PIECE_DEFS.filter(p => p.length >= 3 && p.length <= 4);
  if (pool.length === 0) return weightedRandomPiece();
  return pool[Math.floor(randomValue() * pool.length)];
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
    const futureHasClear = PIECE_DEFS.some(pc => canCauseClearOnBoard(pc, b));
    if (!futureHasClear) {
      // Future board is too dense — inject a clear-enabling piece into current rack
      // canCauseClear(pc) implies canPlaceAnywhere(pc), so no separate placement check needed
      const clearNow = PIECE_DEFS.find(pc => canCauseClear(pc));
      if (clearNow) {
        const swapIdx = p.findIndex(pc => !canCauseClear(pc));
        if (swapIdx >= 0) p[swapIdx] = clearNow;
      }
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
  const earlyGame = density < 0.10 && score < 200;

  // Generate candidate rack based on difficulty
  const p = Array.from({ length: rackSize }, () =>
    earlyGame ? earlyPiece() : weightedRandomPiece()
  );

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
          }
        : null,
      runSummary: raw.runSummary && typeof raw.runSummary === 'object'
        ? {
            finalScore: clampWholeNumber(raw.runSummary.finalScore, 0),
            coinsEarned: clampWholeNumber(raw.runSummary.coinsEarned, 0),
            completedObjectiveIds: uniqueStringList(raw.runSummary.completedObjectiveIds, []),
            stats: {
              regionsCleared: clampWholeNumber(raw.runSummary.stats?.regionsCleared, 0),
              maxCombo: clampWholeNumber(raw.runSummary.stats?.maxCombo, 0),
              racksCompleted: clampWholeNumber(raw.runSummary.stats?.racksCompleted, 0),
              personalBest: !!raw.runSummary.stats?.personalBest,
            },
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
    const todayChallenge = ensureDailyChallengeForToday();
    if (!saved.dailyChallenge || saved.dailyChallenge.date !== todayChallenge.date) {
      clearSavedGame();
      return false;
    }
    configureDailyChallengeSession(todayChallenge, { randomState: saved.dailyChallenge.randomState });
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
  coinToastOffset = 0;
  runSummary = saved.runSummary;

  initRackDOM();
  renderBoard();
  renderRack();
  updateRackPlayability();
  updateTrainingPanel();
  updateScoreUI();
  renderDashboard();
  return true;
}

function renderSessionModeBadge() {
  const badge = document.getElementById('session-mode-badge');
  if (!badge) return;

  if (isDailyChallengeSession()) {
    badge.hidden = false;
    badge.textContent = `Daily · target ${dailyChallengeState.targetScore}`;
  } else {
    badge.hidden = true;
  }
}

function renderDashboard() {
  const continueBtn = document.getElementById('btn-dashboard-continue');
  const newGameBtn = document.getElementById('btn-dashboard-new');
  const intro = document.getElementById('dashboard-intro');
  const missionCopy = document.getElementById('dashboard-mission-copy');
  const dailyTitle = document.getElementById('daily-challenge-title');
  const dailyCopy = document.getElementById('daily-challenge-copy');
  const dailyTarget = document.getElementById('daily-challenge-target');
  const dailyBest = document.getElementById('daily-challenge-best');
  const dailyButton = document.getElementById('btn-dashboard-daily');
  const dailyInfoButton = document.getElementById('btn-dashboard-daily-info');
  const dailyStreakPill = document.getElementById('daily-streak-pill');
  const runState = document.getElementById('dashboard-run-state');
  const hasSavedGame = !!getSavedGameSession();
  const savedGame = getSavedGameSession();
  const missionCounts = getDailyMissionCounts();
  const skin = BLOCK_SKIN_LOOKUP[getEquippedBlockSkin()] || BLOCK_SKIN_LOOKUP.classic;
  const challenge = ensureDailyChallengeForToday();
  const challengeStatus = getDailyChallengeStatus(challenge);

  if (continueBtn) {
    continueBtn.hidden = !hasSavedGame;
    continueBtn.disabled = !hasSavedGame;
    continueBtn.textContent = savedGame?.sessionType === 'daily' ? 'Continue daily challenge' : 'Continue run';
  }
  if (newGameBtn) {
    newGameBtn.textContent = hasSavedGame ? 'Start fresh run' : 'Start new run';
    newGameBtn.classList.toggle('pill-btn--secondary', hasSavedGame);
  }
  if (runState) {
    runState.textContent = savedGame?.sessionType === 'daily'
      ? 'Daily challenge ready to resume'
      : hasSavedGame
        ? 'Saved run ready to continue'
        : 'Ready for a fresh run';
  }
  if (intro) {
    if (savedGame?.sessionType === 'daily') {
      intro.textContent = 'Your daily challenge is still waiting.';
    } else {
      intro.textContent = hasSavedGame ? 'Pick up where you left off.' : 'boo-roh-hah-meh';
    }
  }
  if (missionCopy) {
    missionCopy.textContent = missionCounts.total
      ? `${missionCounts.completed} of ${missionCounts.total} done today`
      : 'Fresh goals are on the way.';
  }
  if (dailyTitle) {
    dailyTitle.textContent = challengeStatus.complete
      ? 'Today cleared'
      : `Target ${challenge.targetScore}`;
  }
  if (dailyCopy) {
    dailyCopy.textContent = challengeStatus.complete
      ? `Completed on ${challenge.date}. Come back tomorrow to keep the streak alive.`
      : challengeStatus.remaining
        ? `${challengeStatus.remaining} points left to finish today’s shared seed.`
        : 'A fresh seeded board is ready.';
  }
  if (dailyTarget) dailyTarget.textContent = `Target ${challenge.targetScore}`;
  if (dailyBest) dailyBest.textContent = getDailyChallengeBestLabel(challenge);
  if (dailyButton) {
    dailyButton.textContent = challengeStatus.complete ? 'Replay daily challenge' : 'Play daily challenge';
  }
  if (dailyInfoButton) {
    dailyInfoButton.textContent = `${challengeStatus.reward} coin reward`;
  }
  if (dailyStreakPill) {
    const dayLabel = challengeStatus.streak === 1 ? 'day' : 'days';
    dailyStreakPill.textContent = `🔥 ${challengeStatus.streak} ${dayLabel} streak`;
  }

  document.getElementById('dashboard-coins').textContent = String(getCoinBalance());
  document.getElementById('dashboard-best').textContent = String(bestScore);
  document.getElementById('dashboard-today').textContent = String(todayScore);
  document.getElementById('dashboard-finish').textContent = skin.name;
  renderSessionModeBadge();
}

function populateQuickSettings() {
  document.getElementById('quick-chk-coach').checked = trainingMode;
  document.getElementById('quick-chk-dark').checked = darkMode;
}

function populateSettingsPage() {
  document.getElementById('page-chk-coach').checked = trainingMode;
  document.getElementById('page-chk-extended').checked = extendedPieces;
  document.getElementById('page-chk-dark').checked = darkMode;

  const colorSelect = document.getElementById('page-sel-color');
  colorSelect.innerHTML = '';
  for (const colorway of COLORWAY_CATALOGUE) {
    const option = document.createElement('option');
    option.value = colorway.id;
    option.textContent = `${colorway.icon} ${colorway.name}${isColorwayOwned(colorway.id) ? '' : ' · shop unlock'}`;
    option.disabled = !isColorwayOwned(colorway.id);
    colorSelect.appendChild(option);
  }
  colorSelect.value = isColorwayOwned(colorSetting) ? colorSetting : 'orange';
  document.getElementById('page-sel-rack').value = String(rackSize);
  updateCosmeticLabel();
}

function updatePrimaryPlayButton() {
  const playButton = document.getElementById('btn-bottom-nav-play');
  const playLabel = document.getElementById('bottom-nav-play-label');
  if (!playButton || !playLabel) return;

  const savedGame = getSavedGameSession();
  const isDaily = savedGame?.sessionType === 'daily';
  const label = isDaily ? 'Resume daily' : savedGame ? 'Resume' : 'Play';
  const ariaLabel = isDaily
    ? 'Resume daily challenge'
    : savedGame
      ? 'Resume saved run'
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
  currentPage = page;
  document.getElementById('app').dataset.page = page;
  document.querySelectorAll('.page').forEach(section => {
    section.hidden = section.dataset.page !== page;
  });

  if (page === 'dashboard') renderDashboard();
  if (page === 'shop') renderCosmeticsCollection();
  if (page === 'settings') populateSettingsPage();
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
        el.classList.toggle('filled', !!board[r][c]);
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
  }
}

function cancelDrag() {
  if (!drag) return;
  clearPreview();
  drag.ghost.remove();
  document.getElementById(`slot-${drag.slotIdx}`).classList.remove('dragging');
  drag = null;
}

// ── Game actions ───────────────────────────────────────────
function doPlace(slotIdx, row, col) {
  const cells = pieces[slotIdx];

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
      detail: 'You opened the board and made room to build on.',
      anchor: '#board-wrap',
      announce: 'First clear of the run.',
    });
  }

  if (total >= 3) {
    pulseCelebrationSurface();
    showMilestoneMoment({
      eyebrow: `${total}-region clear`,
      title: 'That landed brilliantly',
      detail: 'Big clears buy you space and keep the run settled.',
      major: true,
      anchor: '#board-wrap',
      announce: `${total} regions cleared at once.`,
    });
  }

  for (const key of cleared) {
    const [r, c] = key.split(',').map(Number);
    board[r][c] = 0;
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
  for (let i = 0; i < rackSize; i++) {
    if (used[i]) continue;
    if (canPlaceAnywhere(pieces[i])) return false;
  }
  return true;
}

function triggerGameOver() {
  if (gameOver) return;
  gameOver = true;
  clearSavedGame();

  syncDailyChallengeScoreProgress();

  const isNewBest = score > bestScore;
  if (isNewBest) {
    bestScore = score;
    localStorage.setItem('bst-best', bestScore);
  }

  awardCoins(calculateEndRunCoinReward(score), 'Run complete');
  if (isNewBest) awardCoins(scaleCoinReward(COIN_REWARDS.personalBestBonus), 'New best');
  ensureRunSummary().stats.personalBest = isNewBest;

  const todayKey = new Date().toISOString().slice(0, 10);
  const td = JSON.parse(localStorage.getItem('bst-today') || '{"d":"","s":0}');
  todayScore = (td.d === todayKey) ? Math.max(td.s, score) : score;
  localStorage.setItem('bst-today', JSON.stringify({ d: todayKey, s: todayScore }));
  updateScoreUI();
  maybeCompleteDailyChallenge();
  evaluateRunObjectives();
  updateDailyMissionProgress('runs', 1);

  // Fade in "No more space!", hold, then fade out before showing the game-over card.
  showNoMoreSpaceMsg(() => {
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
      celebrate: true,
      major: true,
    });
    showMilestoneMoment({
      eyebrow: 'Coin reward',
      title: `+${roundMilestoneReward} coins`,
      detail: `${roundsCompleted} rounds completed. Nicely paced.`,
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
  saveCurrentGame();
  if (isGameOver()) {
    setTimeout(triggerGameOver, 150);
  } else if (rackSize > 1 && orderMatters()) {
    showChooseCarefullyMsg();
  }
}

function startNewGame(options = {}) {
  if (options.sessionType === 'daily') {
    const challenge = ensureDailyChallengeForToday();
    configureDailyChallengeSession(challenge, { randomState: challenge.seed });
    markDailyChallengeAttempt();
  } else {
    resetStandardSessionState();
  }

  board    = emptyBoard();
  score    = 0;
  combo    = 0;
  gameOver = false;
  coinToastOffset = 0;
  runSummary = createDefaultRunSummary();
  used     = Array(rackSize).fill(false);
  pieces   = smartPieces();

  applyColor(colorSetting);
  updateScoreUI();
  renderBoard();
  renderRack();
  updateRackPlayability();
  clearHint();
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

// ── Settings / overlays ────────────────────────────────────
function applySettingsState(nextSettings) {
  const prevTraining = trainingMode;
  const prevRackSize = rackSize;

  trainingMode = nextSettings.trainingMode;
  extendedPieces = nextSettings.extendedPieces;
  darkMode = nextSettings.darkMode;
  const requestedColor = sanitiseColorSetting(nextSettings.colorSetting);
  colorSetting = isColorwayOwned(requestedColor) ? requestedColor : colorSetting;
  rackSize = nextSettings.rackSize;

  applyDarkMode(darkMode);
  applyColor(colorSetting);
  applyExtendedPieces(extendedPieces);
  saveSettings();

  document.getElementById('coach-panel').hidden = !trainingMode;
  renderRack();
  updateRackPlayability();
  if (trainingMode && !prevTraining) updateTrainingPanel();
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
    trainingMode: document.getElementById('quick-chk-coach').checked,
    extendedPieces,
    darkMode: document.getElementById('quick-chk-dark').checked,
    colorSetting,
    rackSize,
  });
  hideOverlay('ov-quick-settings');
});

document.getElementById('btn-dashboard-continue').addEventListener('click', () => {
  if (!restoreSavedGame()) return;
  navigateTo('game');
});
document.getElementById('btn-dashboard-new').addEventListener('click', () => {
  startNewGame();
  navigateTo('game');
});
document.getElementById('btn-dashboard-daily').addEventListener('click', () => {
  startNewGame({ sessionType: 'daily' });
  navigateTo('game');
});
document.getElementById('btn-dashboard-daily-info').addEventListener('click', () => {
  const challenge = ensureDailyChallengeForToday();
  alert(`Today’s daily challenge is shared worldwide for ${challenge.date}. Reach ${challenge.targetScore} points to keep your streak and earn a coin bonus.`);
});

document.getElementById('btn-dashboard-missions').addEventListener('click', () => {
  renderDailyMissions();
  showOverlay('ov-missions');
});
document.getElementById('btn-game-back').addEventListener('click', () => {
  saveCurrentGame();
  navigateTo('dashboard');
});
document.getElementById('btn-settings-shop').addEventListener('click', () => {
  navigateTo('shop');
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
    startNewGame();
  }
  navigateTo('game');
});

document.getElementById('btn-missions-close').addEventListener('click', () => {
  hideOverlay('ov-missions');
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

document.getElementById('btn-settings-save').addEventListener('click', () => {
  applySettingsState({
    trainingMode: document.getElementById('page-chk-coach').checked,
    extendedPieces: document.getElementById('page-chk-extended').checked,
    darkMode: document.getElementById('page-chk-dark').checked,
    colorSetting: sanitiseColorSetting(document.getElementById('page-sel-color').value),
    rackSize: parseInt(document.getElementById('page-sel-rack').value, 10),
  });
  navigateTo('dashboard');
});

document.getElementById('btn-clear-data').addEventListener('click', async () => {
  if (!confirm('Clear all game progress and cached data?\nThis cannot be undone.')) return;

  // Remove game progress from localStorage
  localStorage.removeItem('bst-best');
  localStorage.removeItem('bst-today');
  localStorage.removeItem('bst-settings');
  localStorage.removeItem(PROGRESSION_STORAGE_KEY);
  localStorage.removeItem(GAME_SESSION_STORAGE_KEY);
  progressionState = createDefaultProgressionState();

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



document.getElementById('btn-hint').addEventListener('click', showHint);

document.getElementById('btn-restart').addEventListener('click', startNewGame);

document.getElementById('btn-new').addEventListener('click', () => {
  startNewGame();
  navigateTo('game');
});

document.getElementById('btn-gameover-dashboard').addEventListener('click', () => {
  hideOverlay('ov-gameover');
  navigateTo('dashboard');
  renderDashboard();
});

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState !== 'visible') return;
  renderDailyMissions();
  ensureDailyChallengeForToday();
  renderCosmeticsCollection();
  renderDashboard();
});

// Prevent body scroll while dragging on iOS
document.addEventListener('touchstart', e => {
  if (e.target.closest('.slot')) e.preventDefault();
}, { passive: false });

// ── Init ───────────────────────────────────────────────────
function init() {
  bestScore  = parseInt(localStorage.getItem('bst-best') || '0', 10);
  const todayKey = new Date().toISOString().slice(0, 10);
  const td   = JSON.parse(localStorage.getItem('bst-today') || '{"d":"","s":0}');
  todayScore = (td.d === todayKey) ? td.s : 0;

  loadProgressionState();
  ensureDailyMissionsForToday();
  ensureDailyChallengeForToday();
  resetStandardSessionState();
  updateCoinUI();
  applyEquippedCosmeticSkin();
  loadSettings();
  ensureSelectedColorway({ preserveLegacy: true });
  applyDarkMode(darkMode);
  applyColor(colorSetting);
  applyExtendedPieces(extendedPieces);
  document.getElementById('coach-panel').hidden = !trainingMode;

  // Follow OS dark-mode changes dynamically when the user hasn't set
  // an explicit preference (i.e. no saved 'dark' key in settings yet).
  const darkMQ = window.matchMedia('(prefers-color-scheme: dark)');
  darkMQ.addEventListener('change', e => {
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
}

init();
