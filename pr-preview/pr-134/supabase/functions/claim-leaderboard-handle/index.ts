// Edge Function: claim-leaderboard-handle
// Validates an authenticated caller, claims or updates a public leaderboard
// handle server-side, and returns the final display handle.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const REQUESTED_NAME_PATTERN = /^[A-Za-z0-9][A-Za-z0-9 ._'-]{0,17}$/;
const SAFE_VALIDATION_MESSAGES = new Set([
  'Leaderboard names must be 1-18 characters',
  'Leaderboard names must use letters, numbers, spaces, ., _, -, or apostrophes',
  'Leaderboard names must include letters or numbers',
  'That leaderboard name is reserved',
  'That leaderboard name is not allowed',
  'That leaderboard name is full',
]);
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
    console.error('claim-leaderboard-handle auth error:', claimsError.message);
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

  const payload = body as Record<string, unknown>;
  const requestedName = typeof payload.requested_name === 'string'
    ? payload.requested_name.trim().replace(/\s+/g, ' ')
    : '';

  if (!REQUESTED_NAME_PATTERN.test(requestedName)) {
    return jsonResponse(400, {
      error: 'Leaderboard names must be 1-18 safe characters using letters, numbers, spaces, ., _, -, or apostrophes',
    });
  }

  const { data, error } = await serviceClient.rpc('claim_leaderboard_handle', {
    p_player_id: tokenPlayerId,
    p_requested_name: requestedName,
  });

  if (error) {
    console.error('claim-leaderboard-handle DB error:', error.message);
    const message = typeof error.message === 'string' ? error.message.trim() : '';
    if (SAFE_VALIDATION_MESSAGES.has(message)) {
      return jsonResponse(400, { error: message });
    }
    return jsonResponse(500, { error: 'Could not claim leaderboard name right now' });
  }

  const claimed = Array.isArray(data) ? data[0] : data;
  const displayName = typeof claimed?.display_name === 'string' ? claimed.display_name.trim() : '';
  const handleBase = typeof claimed?.handle_base === 'string' ? claimed.handle_base.trim() : requestedName;
  const discriminator = Number.isInteger(claimed?.discriminator) ? claimed.discriminator : null;

  if (!displayName || discriminator === null) {
    return jsonResponse(500, { error: 'Claim response did not include a leaderboard handle' });
  }

  return jsonResponse(200, {
    ok: true,
    handle_base: handleBase,
    display_name: displayName,
    discriminator,
  });
});
