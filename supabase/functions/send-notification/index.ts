// Supabase Edge Function: send-notification
// Handles email sending via Resend API (server-side to avoid CORS)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";

const RESEND_API_URL = 'https://api.resend.com/emails';
const FROM_EMAIL = 'Studio Olga <onboarding@resend.dev>'; // Using Resend's test domain for now

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') || '';
const ADMIN_ALLOWLIST = (Deno.env.get('ADMIN_EMAIL_ALLOWLIST') || '')
  .split(',')
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

interface NotificationPayload {
  type: 'photo_selection_ready' | 'photos_delivered' | 'video_review_ready' | 'shoot_reminder_24h';
  shootId: string;
  shootTitle: string;
  client: string;
  clientEmail?: string;
  date?: string;
  startTime?: string;
  locationName?: string;
  photoSelectionUrl?: string;
  selectedPhotosUrl?: string;
  finalPhotosUrl?: string;
  videoUrl?: string;
}

const escapeHtml = (value: string | undefined): string => {
  if (!value) return '';
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
};

const isAllowedAdminEmail = (email: string | undefined): boolean => {
  if (!email) return false;
  if (ADMIN_ALLOWLIST.length === 0) return false;
  return ADMIN_ALLOWLIST.includes(email.toLowerCase());
};

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

async function authenticateAdmin(req: Request): Promise<{ ok: true } | { ok: false; status: number; error: string }> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return { ok: false, status: 500, error: 'Supabase auth config is missing in function environment' };
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return { ok: false, status: 401, error: 'Authorization header required' };
  }

  const authClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data, error } = await authClient.auth.getUser();
  if (error || !data.user) {
    return { ok: false, status: 401, error: 'Invalid auth session' };
  }

  if (!isAllowedAdminEmail(data.user.email)) {
    return { ok: false, status: 403, error: 'User is not allowed to send notifications' };
  }

  return { ok: true };
}

serve(async (req) => {
  const corsHeaders = corsHeadersFor(req);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ success: false, error: 'Method not allowed' }),
      {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }

  try {
    const authResult = await authenticateAdmin(req);
    if (!authResult.ok) {
      return new Response(
        JSON.stringify({
          success: false,
          error: authResult.error
        }),
        {
          status: authResult.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Get Resend API key from environment
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY not configured in Edge Function secrets');
    }

    // Parse request body
    const rawPayload: NotificationPayload = await req.json();
    const payload: NotificationPayload = {
      ...rawPayload,
      shootTitle: escapeHtml(rawPayload.shootTitle),
      client: escapeHtml(rawPayload.client),
      clientEmail: rawPayload.clientEmail?.trim(),
      date: escapeHtml(rawPayload.date),
      startTime: escapeHtml(rawPayload.startTime),
      locationName: escapeHtml(rawPayload.locationName),
      photoSelectionUrl: escapeHtml(rawPayload.photoSelectionUrl),
      selectedPhotosUrl: escapeHtml(rawPayload.selectedPhotosUrl),
      finalPhotosUrl: escapeHtml(rawPayload.finalPhotosUrl),
      videoUrl: escapeHtml(rawPayload.videoUrl),
    };

    // Validate client email
    if (!payload.clientEmail) {
      return new Response(
        JSON.stringify({
          error: 'Client email not provided',
          success: false
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Generate email content based on notification type
    const emailContent = generateEmailContent(payload);

    // Call Resend API
    console.log('[EdgeFunction] Sending email via Resend...', { type: payload.type });

    const resendResponse = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [payload.clientEmail],
        subject: emailContent.subject,
        html: emailContent.html
      })
    });

    const resendData = await resendResponse.json();

    if (!resendResponse.ok) {
      throw new Error(`Resend API error: ${JSON.stringify(resendData)}`);
    }

    console.log('[EdgeFunction] ✅ Email sent successfully!', { id: resendData.id });

    // Return success
    return new Response(
      JSON.stringify({
        success: true,
        emailId: resendData.id,
        message: 'Email sent successfully'
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error: any) {
    console.error('[EdgeFunction] ❌ Error sending email:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

/**
 * Generate email content based on notification type
 */
function generateEmailContent(payload: NotificationPayload): { subject: string; html: string } {
  switch (payload.type) {
    case 'photo_selection_ready':
      return {
        subject: `Your photos are ready to select! 📸`,
        html: getPhotoSelectionReadyHTML(payload)
      };

    case 'photos_delivered':
      return {
        subject: `Your final photos are ready! 🎉`,
        html: getPhotosDeliveredHTML(payload)
      };

    case 'video_review_ready':
      return {
        subject: `Your video is ready to review! 🎬`,
        html: getVideoReviewReadyHTML(payload)
      };

    case 'shoot_reminder_24h':
      return {
        subject: `Reminder: Shoot tomorrow at ${payload.startTime}! 📅`,
        html: getShootReminderHTML(payload)
      };

    default:
      throw new Error(`Unknown notification type: ${payload.type}`);
  }
}

/**
 * Email Template: Photo Selection Ready
 */
function getPhotoSelectionReadyHTML(payload: NotificationPayload): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Photos Ready to Select</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <tr>
            <td style="background-color: #141413; padding: 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                📸 Your Photos Are Ready!
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #333333;">
                Hi! 👋
              </p>
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #333333;">
                Your photos from the <strong>"${payload.shootTitle}"</strong> shoot are ready for selection.
              </p>
              <p style="margin: 0 0 30px; font-size: 16px; line-height: 1.6; color: #333333;">
                Please review and select your favorite photos:
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${payload.photoSelectionUrl}" style="display: inline-block; padding: 16px 40px; background-color: #141413; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 4px;">
                      Select Photos →
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin: 30px 0 0; font-size: 14px; line-height: 1.6; color: #666666;">
                After you make your selection, we'll proceed with final editing.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px; background-color: #f9f9f9; text-align: center; border-top: 1px solid #eeeeee;">
              <p style="margin: 0; font-size: 14px; color: #999999;">
                Best regards,<br>
                <strong>Studio Olga Prudka</strong>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

/**
 * Email Template: Final Photos Delivered
 */
function getPhotosDeliveredHTML(payload: NotificationPayload): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Final Photos Ready</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <tr>
            <td style="background-color: #141413; padding: 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                🎉 Your Final Photos Are Ready!
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #333333;">
                Great news! 🎊
              </p>
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #333333;">
                Your photos from the <strong>"${payload.shootTitle}"</strong> shoot are fully edited and ready to download.
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${payload.finalPhotosUrl}" style="display: inline-block; padding: 16px 40px; background-color: #141413; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 4px;">
                      Download Photos →
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin: 30px 0 0; font-size: 14px; line-height: 1.6; color: #666666;">
                Thank you for choosing us! We hope to work with you again. 💫
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px; background-color: #f9f9f9; text-align: center; border-top: 1px solid #eeeeee;">
              <p style="margin: 0; font-size: 14px; color: #999999;">
                Best regards,<br>
                <strong>Studio Olga Prudka</strong>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

/**
 * Email Template: Video Review Ready
 */
function getVideoReviewReadyHTML(payload: NotificationPayload): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Video Ready to Review</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <tr>
            <td style="background-color: #141413; padding: 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                🎬 Your Video Is Ready!
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #333333;">
                Hi! 👋
              </p>
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #333333;">
                Your video from the <strong>"${payload.shootTitle}"</strong> shoot is ready for review.
              </p>
              <p style="margin: 0 0 30px; font-size: 16px; line-height: 1.6; color: #333333;">
                Please watch and let us know if you'd like any revisions.
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${payload.videoUrl}" style="display: inline-block; padding: 16px 40px; background-color: #141413; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 4px;">
                      Watch Video →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px; background-color: #f9f9f9; text-align: center; border-top: 1px solid #eeeeee;">
              <p style="margin: 0; font-size: 14px; color: #999999;">
                Best regards,<br>
                <strong>Studio Olga Prudka</strong>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

/**
 * Email Template: 24-Hour Shoot Reminder
 */
function getShootReminderHTML(payload: NotificationPayload): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0;">
  <title>Shoot Reminder</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <tr>
            <td style="background-color: #141413; padding: 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                ⏰ Shoot Reminder
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #333333;">
                Hi! 👋
              </p>
              <p style="margin: 0 0 30px; font-size: 16px; line-height: 1.6; color: #333333;">
                This is a friendly reminder about your upcoming shoot:
              </p>
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9f9f9; border-left: 4px solid #141413; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 10px; font-size: 14px; color: #999999; text-transform: uppercase; letter-spacing: 0.5px;">
                      Shoot
                    </p>
                    <p style="margin: 0 0 20px; font-size: 18px; font-weight: 600; color: #141413;">
                      ${payload.shootTitle}
                    </p>
                    <p style="margin: 0 0 5px; font-size: 16px; color: #333333;">
                      📅 <strong>Date:</strong> ${payload.date}
                    </p>
                    <p style="margin: 0 0 5px; font-size: 16px; color: #333333;">
                      ⏰ <strong>Time:</strong> ${payload.startTime}
                    </p>
                    <p style="margin: 0; font-size: 16px; color: #333333;">
                      📍 <strong>Location:</strong> ${payload.locationName}
                    </p>
                  </td>
                </tr>
              </table>
              <p style="margin: 0; font-size: 16px; line-height: 1.6; color: #333333;">
                See you tomorrow! 🎉
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px; background-color: #f9f9f9; text-align: center; border-top: 1px solid #eeeeee;">
              <p style="margin: 0; font-size: 14px; color: #999999;">
                Best regards,<br>
                <strong>Studio Olga Prudka</strong>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}
