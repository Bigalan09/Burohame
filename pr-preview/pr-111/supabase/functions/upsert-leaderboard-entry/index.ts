// Edge Function: upsert-leaderboard-entry
// Accepts leaderboard writes from authenticated callers, validates payloads,
// derives trusted values server-side, and writes using the service role key.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const WEEK_ID_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const VALID_LEAGUES = new Set(['bronze', 'silver', 'gold', 'diamond']);
const MAX_RUN_SCORE = 1_000_000;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_AUTH_KEY =
  Deno.env.get('SB_PUBLISHABLE_KEY') ??
  Deno.env.get('SUPABASE_ANON_KEY') ??
  '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const authClient =
  SUPABASE_URL && SUPABASE_AUTH_KEY
    ? createClient(SUPABASE_URL, SUPABASE_AUTH_KEY, {
        auth: { persistSession: false },
      })
    : null;
const serviceClient =
  SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
        auth: { persistSession: false },
      })
    : null;

function jsonResponse(status: number, payload: Record<string, unknown>) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function isMondayUtcDate(dateKey: string): boolean {
  const parsed = new Date(`${dateKey}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === dateKey && parsed.getUTCDay() === 1;
}

function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0;
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

  if (!authClient || !serviceClient) {
    return jsonResponse(500, { error: 'Missing Supabase server configuration' });
  }

  const { data: claimsData, error: claimsError } = await authClient.auth.getClaims(tokenMatch[1]);
  if (claimsError) {
    console.error('upsert-leaderboard-entry auth error:', claimsError.message);
    return jsonResponse(401, { error: 'Authenticated user token required' });
  }

  const jwtClaims = claimsData?.claims;
  const tokenRole = typeof jwtClaims?.role === 'string' ? jwtClaims.role : '';
  const tokenPlayerId = typeof jwtClaims?.sub === 'string' ? jwtClaims.sub.trim() : '';
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

  const { data: handleRow, error: handleError } = await serviceClient
    .from('leaderboard_player_handles')
    .select('display_name')
    .eq('player_id', playerId)
    .maybeSingle();

  if (handleError) {
    console.error('upsert-leaderboard-entry handle lookup error:', handleError.message);
    return jsonResponse(500, { error: 'Internal server error' });
  }

  const playerName = typeof handleRow?.display_name === 'string' ? handleRow.display_name.trim() : '';
  if (!playerName) {
    return jsonResponse(409, { error: 'No claimed leaderboard handle. Choose a leaderboard name in Settings first.' });
  }

  const leagueId = typeof entry.league_id === 'string' ? entry.league_id.trim() : '';
  if (!VALID_LEAGUES.has(leagueId)) {
    return jsonResponse(400, { error: 'league_id must be one of bronze, silver, gold, diamond' });
  }

  if (!isNonNegativeInteger(entry.total_score) || entry.total_score > MAX_RUN_SCORE) {
    return jsonResponse(400, { error: 'total_score must be a non-negative integer within bounds' });
  }

  const submittedScore = entry.total_score;

  const { data, error } = await serviceClient.rpc('upsert_weekly_best_leaderboard_entry', {
    p_week_id: weekId,
    p_player_id: playerId,
    p_player_name: playerName,
    p_league_id: leagueId,
    p_submitted_score: submittedScore,
  });

  if (error) {
    console.error('upsert-leaderboard-entry DB error:', error.message);
    return jsonResponse(500, { error: 'Internal server error' });
  }

  const storedEntry = Array.isArray(data) ? data[0] : data;
  const storedBestScore = isNonNegativeInteger(storedEntry?.total_score)
    ? storedEntry.total_score
    : submittedScore;

  return jsonResponse(200, { ok: true, total_score: storedBestScore });
});
