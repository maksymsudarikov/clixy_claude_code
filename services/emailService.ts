import { NotificationPayload } from './notificationService';

/**
 * Email Service - Supabase Edge Function Integration
 *
 * Sends transactional emails via Supabase Edge Function → Resend API
 * This avoids CORS issues and keeps API keys secure on the server
 *
 * Phase 3: Email integration complete
 * - Frontend calls Edge Function
 * - Edge Function calls Resend API
 * - Email templates defined in Edge Function
 *
 * Free tier: 3000 emails/month, 100 emails/day (Resend)
 */

/**
 * Send email via Supabase Edge Function
 */
export async function sendEmail(payload: NotificationPayload): Promise<void> {
  // Check if client email is provided
  if (!payload.clientEmail) {
    console.warn('[EmailService] Client email not provided. Skipping email send.');
    console.log('[EmailService] Shoot:', payload.shootTitle, 'Client:', payload.client);
    return;
  }

  // Get Supabase configuration
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('[EmailService] Supabase configuration missing');
    return;
  }

  // Edge Function URL
  const edgeFunctionUrl = `${supabaseUrl}/functions/v1/send-notification`;

  try {
    console.log('[EmailService] Calling Edge Function...', {
      url: edgeFunctionUrl,
      to: payload.clientEmail,
      client: payload.client,
      type: payload.type
    });

    const response = await fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`Edge Function error: ${JSON.stringify(data)}`);
    }

    console.log('[EmailService] ✅ Email sent successfully!', {
      emailId: data.emailId,
      to: payload.clientEmail
    });
  } catch (error) {
    console.error('[EmailService] ❌ Failed to send email:', error);
    throw error;
  }
}
