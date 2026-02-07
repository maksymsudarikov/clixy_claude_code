import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const ADMIN_ALLOWLIST = (Deno.env.get('ADMIN_EMAIL_ALLOWLIST') || '')
  .split(',')
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

const DEFAULT_TTL_HOURS = 24 * 14;
const MAX_TTL_HOURS = 24 * 30;
const ALLOWED_ORIGINS = (Deno.env.get('ALLOWED_ORIGINS') || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const resolveOrigin = (req: Request): string => {
  const requestOrigin = req.headers.get('origin') || '';

  if (!requestOrigin) return ALLOWED_ORIGINS[0] || 'null';
  if (ALLOWED_ORIGINS.length === 0) return requestOrigin;
  return ALLOWED_ORIGINS.includes(requestOrigin) ? requestOrigin : 'null';
};

const corsHeadersFor = (req: Request) => ({
  'Access-Control-Allow-Origin': resolveOrigin(req),
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Vary': 'Origin',
});

const isAllowedAdminEmail = (email: string | undefined): boolean => {
  if (!email) return false;
  if (ADMIN_ALLOWLIST.length === 0) return false;
  return ADMIN_ALLOWLIST.includes(email.toLowerCase());
};

const toBase64Url = (bytes: Uint8Array): string => {
  const base64 = btoa(String.fromCharCode(...bytes));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

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
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Supabase environment is not configured');
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Authorization header required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const authClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: authData, error: authError } = await authClient.auth.getUser();
    if (authError || !authData.user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid auth session' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!isAllowedAdminEmail(authData.user.email)) {
      return new Response(
        JSON.stringify({ success: false, error: 'User is not authorized to create share links' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    const shootId = String(body.shootId || '').trim();
    const ttlHoursInput = Number(body.ttlHours || DEFAULT_TTL_HOURS);
    const ttlHours = Math.max(1, Math.min(MAX_TTL_HOURS, Math.floor(ttlHoursInput || DEFAULT_TTL_HOURS)));

    if (!shootId) {
      return new Response(
        JSON.stringify({ success: false, error: 'shootId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const serviceClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: shoot, error: shootError } = await serviceClient
      .from('shoots')
      .select('id')
      .eq('id', shootId)
      .maybeSingle();

    if (shootError || !shoot) {
      return new Response(
        JSON.stringify({ success: false, error: 'Shoot not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const tokenBytes = crypto.getRandomValues(new Uint8Array(32));
    const token = toBase64Url(tokenBytes);
    const tokenHash = await sha256Hex(token);
    const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000).toISOString();

    const { error: insertError } = await serviceClient
      .from('shoot_share_links')
      .insert({
        shoot_id: shootId,
        token_hash: tokenHash,
        expires_at: expiresAt,
        created_by_email: authData.user.email?.toLowerCase() || null,
      });

    if (insertError) {
      throw new Error(insertError.message);
    }

    const requestOrigin = req.headers.get('origin') || '';
    const baseUrl = ALLOWED_ORIGINS.length > 0
      ? (ALLOWED_ORIGINS.includes(requestOrigin) ? requestOrigin : ALLOWED_ORIGINS[0])
      : requestOrigin;

    if (!baseUrl || baseUrl === 'null') {
      throw new Error('Unable to determine app origin for share URL');
    }

    const shareUrl = `${baseUrl}/#/shoot/${shootId}?token=${encodeURIComponent(token)}`;

    return new Response(
      JSON.stringify({ success: true, shareUrl, expiresAt }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
