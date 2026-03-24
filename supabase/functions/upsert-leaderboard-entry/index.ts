// Edge Function: upsert-leaderboard-entry
// Receives a leaderboard entry from a browser client, validates it server-side,
// and writes it using the service role key so browser clients never touch the table directly.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const entry = body as Record<string, unknown>;

  // Validate and sanitise each field.
  const weekId = typeof entry.week_id === 'string' ? entry.week_id.trim() : '';
  const playerId = typeof entry.player_id === 'string' ? entry.player_id.trim() : '';
  const rawName = typeof entry.player_name === 'string' ? entry.player_name.trim() : '';
  const playerName = rawName.slice(0, 24);
  const leagueId = typeof entry.league_id === 'string' ? entry.league_id.trim() : '';

  if (!weekId) {
    return new Response(JSON.stringify({ error: 'week_id is required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (!playerId) {
    return new Response(JSON.stringify({ error: 'player_id is required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (!playerName) {
    return new Response(JSON.stringify({ error: 'player_name is required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (!leagueId) {
    return new Response(JSON.stringify({ error: 'league_id is required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (typeof entry.total_score !== 'number' || !Number.isInteger(entry.total_score) || entry.total_score < 0) {
    return new Response(JSON.stringify({ error: 'total_score must be a non-negative integer' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
  const totalScore = entry.total_score;

  if (!Array.isArray(entry.counted_runs)) {
    return new Response(JSON.stringify({ error: 'counted_runs must be an array' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
  const allRunsValid = (entry.counted_runs as unknown[]).every(
    (r) => typeof r === 'number' && Number.isInteger(r) && r >= 0,
  );
  if (!allRunsValid) {
    return new Response(JSON.stringify({ error: 'counted_runs must contain non-negative integers' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
  const countedRuns: number[] = (entry.counted_runs as number[])
    .slice()
    .sort((a, b) => b - a)
    .slice(0, 4);

  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  if (!supabaseUrl || !serviceRoleKey) {
    return new Response(JSON.stringify({ error: 'Missing Supabase server configuration' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
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
        total_score: totalScore,
        counted_runs: countedRuns,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'week_id,player_id' },
    );

  if (error) {
    console.error('upsert-leaderboard-entry DB error:', error.message);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
