import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PIN_PATTERN = /^\d{6}$/;
const COACH_MODE_AUTH_SESSION_MS = 8 * 60 * 60 * 1000;
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
    console.error('coach-mode-auth auth error:', claimsError.message);
    return jsonResponse(401, { error: 'Authenticated user token required' });
  }

  const jwtClaims = claimsData?.claims;
  const tokenRole = typeof jwtClaims?.role === 'string' ? jwtClaims.role : '';
  const tokenPlayerId = typeof jwtClaims?.sub === 'string' ? jwtClaims.sub.trim() : '';
  if (!tokenPlayerId || tokenRole !== 'authenticated') {
    return jsonResponse(401, { error: 'Authenticated user token required' });
  }

  let body: unknown = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const payload = body as Record<string, unknown>;
  const pinCode = typeof payload.pin_code === 'string' ? payload.pin_code.trim() : '';

  const { data: authRow, error: authError } = await serviceClient
    .from('coach_mode_authorisations')
    .select('expires_at')
    .eq('player_id', tokenPlayerId)
    .maybeSingle();

  if (authError) {
    console.error('coach-mode-auth session lookup error:', authError.message);
    return jsonResponse(500, { error: 'Could not check coach mode session' });
  }

  const expiresAtRaw = typeof authRow?.expires_at === 'string' ? authRow.expires_at : '';
  const expiresAtMs = expiresAtRaw ? Date.parse(expiresAtRaw) : 0;
  const now = Date.now();
  const alreadyAuthorised = Number.isFinite(expiresAtMs) && expiresAtMs > now;

  if (!pinCode) {
    return jsonResponse(200, {
      ok: true,
      authorised: alreadyAuthorised,
      expires_at: alreadyAuthorised ? new Date(expiresAtMs).toISOString() : null,
    });
  }

  if (!PIN_PATTERN.test(pinCode)) {
    return jsonResponse(400, { error: 'PIN must be exactly six digits' });
  }

  const { data: codeRow, error: codeError } = await serviceClient
    .from('coach_mode_codes')
    .select('pin_code')
    .eq('id', 1)
    .eq('is_active', true)
    .maybeSingle();

  if (codeError) {
    console.error('coach-mode-auth code lookup error:', codeError.message);
    return jsonResponse(500, { error: 'Could not verify coach mode code' });
  }

  const storedPinCode = typeof codeRow?.pin_code === 'string' ? codeRow.pin_code.trim() : '';
  if (!storedPinCode || storedPinCode !== pinCode) {
    return jsonResponse(401, { error: 'Invalid coach mode code' });
  }

  const nextExpiryIso = new Date(now + COACH_MODE_AUTH_SESSION_MS).toISOString();
  const { error: upsertError } = await serviceClient
    .from('coach_mode_authorisations')
    .upsert({
      player_id: tokenPlayerId,
      verified_at: new Date(now).toISOString(),
      expires_at: nextExpiryIso,
      updated_at: new Date(now).toISOString(),
    });

  if (upsertError) {
    console.error('coach-mode-auth upsert error:', upsertError.message);
    return jsonResponse(500, { error: 'Could not save coach mode access' });
  }

  return jsonResponse(200, {
    ok: true,
    authorised: true,
    expires_at: nextExpiryIso,
  });
});
