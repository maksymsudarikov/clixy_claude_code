import { NotificationPayload } from './notificationService';

/**
 * Email Service - Supabase Edge Function Integration
 *
 * Sends transactional emails via Supabase Edge Function → Resend API
 * This avoids CORS issues and keeps API keys secure on the server
 *
 * Phase 3: Email integration complete
 * Phase 4: Added retry logic for guaranteed delivery
 *
 * Free tier: 3000 emails/month, 100 emails/day (Resend)
 */

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000; // 2 seconds between retries

/**
 * Send email via Supabase Edge Function with retry logic
 * Returns: { success: boolean, emailId?: string, error?: string }
 */
export async function sendEmail(payload: NotificationPayload): Promise<{ success: boolean; emailId?: string; error?: string }> {
  // Check if client email is provided
  if (!payload.clientEmail) {
    const error = 'Client email not provided';
    console.warn('[EmailService]', error);
    return { success: false, error };
  }

  // Get Supabase configuration
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    const error = 'Supabase configuration missing';
    console.error('[EmailService]', error);
    return { success: false, error };
  }

  // Edge Function URL
  const edgeFunctionUrl = `${supabaseUrl}/functions/v1/send-notification`;

  // Retry logic
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`[EmailService] Attempt ${attempt}/${MAX_RETRIES} - Calling Edge Function...`, {
        to: payload.clientEmail,
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

      // SUCCESS!
      console.log('[EmailService] ✅ Email sent successfully!', {
        emailId: data.emailId,
        to: payload.clientEmail,
        attempt
      });

      return {
        success: true,
        emailId: data.emailId
      };

    } catch (error) {
      console.error(`[EmailService] ❌ Attempt ${attempt}/${MAX_RETRIES} failed:`, error);

      // If this was the last attempt, return failure
      if (attempt === MAX_RETRIES) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }

      // Wait before retrying
      console.log(`[EmailService] Waiting ${RETRY_DELAY_MS}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
    }
  }

  // Should never reach here, but TypeScript needs it
  return { success: false, error: 'Maximum retries exceeded' };
}
