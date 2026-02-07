import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const PUBLIC_SHOOT_FIELDS = [
  'id',
  'project_type',
  'status',
  'title',
  'client',
  'date',
  'start_time',
  'end_time',
  'location_name',
  'location_address',
  'location_map_url',
  'description',
  'moodboard_url',
  'moodboard_images',
  'call_sheet_url',
  'photo_selection_url',
  'selected_photos_url',
  'final_photos_url',
  'photo_status',
  'video_url',
  'video_status',
  'revision_notes',
  'styling_url',
  'styling_notes',
  'hair_makeup_notes',
  'cover_image',
  'timeline',
  'team',
  'talent',
  'client_accepted_terms',
  'terms_accepted_at',
].join(',');

const resolveOrigin = (req: Request): string => {
  const requestOrigin = req.headers.get('origin') || '';
  const allowedOrigins = (Deno.env.get('ALLOWED_ORIGINS') || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (!requestOrigin) return allowedOrigins[0] || 'null';
  if (allowedOrigins.length === 0) return requestOrigin;
  return allowedOrigins.includes(requestOrigin) ? requestOrigin : 'null';
};

const corsHeadersFor = (req: Request) => ({
  'Access-Control-Allow-Origin': resolveOrigin(req),
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Vary': 'Origin',
});

const sha256Hex = async (value: string): Promise<string> => {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
};

serve(async (req) => {
  const corsHeaders = corsHeadersFor(req);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ success: false, error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Supabase environment is not configured');
    }

    const { shootId, token } = await req.json();
    const normalizedShootId = String(shootId || '').trim();
    const normalizedToken = String(token || '').trim();

    if (!normalizedShootId || !normalizedToken) {
      return new Response(
        JSON.stringify({ success: false, error: 'shootId and token are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const tokenHash = await sha256Hex(normalizedToken);
    const serviceClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: shareLink, error: shareError } = await serviceClient
      .from('shoot_share_links')
      .select('id, shoot_id, expires_at, revoked')
      .eq('shoot_id', normalizedShootId)
      .eq('token_hash', tokenHash)
      .maybeSingle();

    if (shareError || !shareLink) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid share token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (shareLink.revoked || new Date(shareLink.expires_at).getTime() < Date.now()) {
      return new Response(
        JSON.stringify({ success: false, error: 'Share token has expired' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: shoot, error: shootError } = await serviceClient
      .from('shoots')
      .select(PUBLIC_SHOOT_FIELDS)
      .eq('id', normalizedShootId)
      .maybeSingle();

    if (shootError || !shoot) {
      return new Response(
        JSON.stringify({ success: false, error: 'Shoot not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        shoot,
        expiresAt: shareLink.expires_at,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
