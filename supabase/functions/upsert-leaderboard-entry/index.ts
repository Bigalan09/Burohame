// Edge Function: upsert-leaderboard-entry
// Accepts leaderboard writes from authenticated callers, validates payloads,
// derives trusted values server-side, and writes using the service role key.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const WEEK_ID_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const PLAYER_NAME_PATTERN = /^[\p{L}\p{N} .,'_\-]{1,24}$/u;
const VALID_LEAGUES = new Set(['bronze', 'silver', 'gold', 'diamond']);
const MAX_COUNTED_RUNS = 4;
const MAX_RUN_SCORE = 1_000_000;

function jsonResponse(status: number, payload: Record<string, unknown>) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function parseJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const [, payload] = token.split('.');
    if (!payload) return null;
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    const parsed = JSON.parse(decoded);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

function isMondayUtcDate(dateKey: string): boolean {
  const parsed = new Date(`${dateKey}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === dateKey && parsed.getUTCDay() === 1;
}

function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0;
}

function isDescending(values: number[]): boolean {
  for (let i = 1; i < values.length; i += 1) {
    if (values[i - 1] < values[i]) return false;
  }
  return true;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse(405, { error: 'Method not allowed' });
  }

  const authHeader = req.headers.get('Authorization') || '';
  const tokenMatch = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!tokenMatch) {
    return jsonResponse(401, { error: 'Missing bearer token' });
  }

  const jwtPayload = parseJwtPayload(tokenMatch[1]);
  const tokenRole = typeof jwtPayload?.role === 'string' ? jwtPayload.role : '';
  const tokenPlayerId = typeof jwtPayload?.sub === 'string' ? jwtPayload.sub.trim() : '';
  if (!tokenPlayerId || tokenRole !== 'authenticated') {
    return jsonResponse(401, { error: 'Authenticated user token required' });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonResponse(400, { error: 'Invalid JSON' });
  }

  const entry = body as Record<string, unknown>;

  const weekId = typeof entry.week_id === 'string' ? entry.week_id.trim() : '';
  if (!WEEK_ID_PATTERN.test(weekId) || !isMondayUtcDate(weekId)) {
    return jsonResponse(400, { error: 'week_id must be a UTC Monday date in YYYY-MM-DD format' });
  }

  const claimedPlayerId = typeof entry.player_id === 'string' ? entry.player_id.trim() : '';
  if (claimedPlayerId && claimedPlayerId !== tokenPlayerId) {
    return jsonResponse(403, { error: 'player_id does not match authenticated user' });
  }
  const playerId = tokenPlayerId;

  const rawName = typeof entry.player_name === 'string' ? entry.player_name.trim() : '';
  const playerName = rawName.slice(0, 24);
  if (!PLAYER_NAME_PATTERN.test(playerName)) {
    return jsonResponse(400, { error: 'player_name must be 1-24 safe characters' });
  }

  const leagueId = typeof entry.league_id === 'string' ? entry.league_id.trim() : '';
  if (!VALID_LEAGUES.has(leagueId)) {
    return jsonResponse(400, { error: 'league_id must be one of bronze, silver, gold, diamond' });
  }

  if (!Array.isArray(entry.counted_runs)) {
    return jsonResponse(400, { error: 'counted_runs must be an array' });
  }

  if (entry.counted_runs.length > MAX_COUNTED_RUNS) {
    return jsonResponse(400, { error: 'counted_runs cannot contain more than 4 items' });
  }

  const countedRuns = entry.counted_runs as unknown[];
  if (!countedRuns.every((value) => isNonNegativeInteger(value) && value <= MAX_RUN_SCORE)) {
    return jsonResponse(400, { error: 'counted_runs must contain non-negative integers within bounds' });
  }

  const numericRuns = countedRuns as number[];
  if (!isDescending(numericRuns)) {
    return jsonResponse(400, { error: 'counted_runs must be sorted descending' });
  }

  const derivedTotalScore = numericRuns.reduce((sum, value) => sum + value, 0);
  if (isNonNegativeInteger(entry.total_score) && entry.total_score !== derivedTotalScore) {
    return jsonResponse(400, { error: 'total_score must match counted_runs sum' });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  if (!supabaseUrl || !serviceRoleKey) {
    return jsonResponse(500, { error: 'Missing Supabase server configuration' });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const { error } = await supabase
    .from('weekly_leaderboard_entries')
    .upsert(
      {
        week_id: weekId,
        player_id: playerId,
        player_name: playerName,
        league_id: leagueId,
        total_score: derivedTotalScore,
        counted_runs: numericRuns,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'week_id,player_id' },
    );

  if (error) {
    console.error('upsert-leaderboard-entry DB error:', error.message);
    return jsonResponse(500, { error: 'Internal server error' });
  }

  return jsonResponse(200, { ok: true, total_score: derivedTotalScore });
});
