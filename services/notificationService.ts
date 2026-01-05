import { Shoot } from '../types';
import { sendEmail } from './emailService';

/**
 * Notification Service - Detects status changes and triggers notifications
 *
 * Phase 2: Foundation - Console logging (COMPLETED)
 * Phase 3: Email integration via Resend API (ACTIVE)
 * Phase 4: Production deployment with feature flag
 */

export interface NotificationPayload {
  type: 'photo_selection_ready' | 'photos_delivered' | 'video_review_ready' | 'shoot_reminder_24h';
  shootId: string;
  shootTitle: string;
  client: string;
  clientEmail?: string; // Client's email address for notifications
  date?: string;
  startTime?: string;
  locationName?: string;
  photoSelectionUrl?: string;
  selectedPhotosUrl?: string;
  finalPhotosUrl?: string;
  videoUrl?: string;
}

/**
 * Detects status changes between old and new shoot data
 * Determines which notifications should be sent
 */
export async function detectStatusChange(
  oldShoot: Shoot,
  newShoot: Shoot
): Promise<void> {
  console.log('[NotificationService] Checking for status changes...', {
    shootId: newShoot.id,
    oldStatus: {
      photo: oldShoot.photoStatus,
      video: oldShoot.videoStatus,
      overall: oldShoot.status
    },
    newStatus: {
      photo: newShoot.photoStatus,
      video: newShoot.videoStatus,
      overall: newShoot.status
    }
  });

  // 1. Photo Selection Ready - Client can now select photos
  if (oldShoot.photoStatus !== 'selection_ready' &&
      newShoot.photoStatus === 'selection_ready' &&
      newShoot.photoSelectionUrl) {

    await queueNotification({
      type: 'photo_selection_ready',
      shootId: newShoot.id,
      shootTitle: newShoot.title,
      client: newShoot.client,
      clientEmail: newShoot.clientEmail,
      photoSelectionUrl: newShoot.photoSelectionUrl
    });
  }

  // 2. Final Photos Delivered - Edited photos ready for download
  if (oldShoot.photoStatus !== 'completed' &&
      newShoot.photoStatus === 'completed' &&
      newShoot.finalPhotosUrl) {

    await queueNotification({
      type: 'photos_delivered',
      shootId: newShoot.id,
      shootTitle: newShoot.title,
      client: newShoot.client,
      clientEmail: newShoot.clientEmail,
      finalPhotosUrl: newShoot.finalPhotosUrl,
      selectedPhotosUrl: newShoot.selectedPhotosUrl // Optional: show what they selected
    });
  }

  // 3. Video Ready for Review - Draft/review video available
  if (oldShoot.videoStatus !== 'review' &&
      newShoot.videoStatus === 'review' &&
      newShoot.videoUrl) {

    await queueNotification({
      type: 'video_review_ready',
      shootId: newShoot.id,
      shootTitle: newShoot.title,
      client: newShoot.client,
      clientEmail: newShoot.clientEmail,
      videoUrl: newShoot.videoUrl
    });
  }

  console.log('[NotificationService] Status change detection complete');
}

/**
 * Queues a notification for sending
 * Phase 3: Sends real emails via Resend API
 */
async function queueNotification(payload: NotificationPayload): Promise<void> {
  console.log('🔔 [NOTIFICATION TRIGGERED]', {
    type: payload.type,
    shoot: payload.shootTitle,
    client: payload.client,
    details: payload
  });

  // Phase 3: Send real email via Resend
  try {
    await sendEmail(payload);
    console.log('[NotificationService] ✅ Email sent successfully');
  } catch (error) {
    console.error('[NotificationService] ❌ Email sending failed:', error);
    // Log preview for debugging
    switch (payload.type) {
      case 'photo_selection_ready':
        console.log(`📸 Failed email to ${payload.client}: Photos ready to select`);
        break;
      case 'photos_delivered':
        console.log(`✅ Failed email to ${payload.client}: Final photos ready`);
        break;
      case 'video_review_ready':
        console.log(`🎬 Failed email to ${payload.client}: Video ready for review`);
        break;
      case 'shoot_reminder_24h':
        console.log(`⏰ Failed email to ${payload.client}: Shoot reminder`);
        break;
    }
  }
}

/**
 * Checks for upcoming shoots (within 24 hours)
 * Phase 4: Will be called by Supabase Edge Function (cron job)
 */
export async function check24HourReminders(shoots: Shoot[]): Promise<void> {
  const now = new Date();
  const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  console.log('[NotificationService] Checking for 24-hour reminders...');

  for (const shoot of shoots) {
    const shootDateTime = new Date(`${shoot.date}T${shoot.startTime}:00`);
    const hoursUntilShoot = (shootDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    // Send reminder if shoot is between 23-25 hours away (allows for cron timing variance)
    if (hoursUntilShoot >= 23 && hoursUntilShoot <= 25) {
      console.log(`⏰ 24-hour reminder needed for shoot: ${shoot.title}`);

      await queueNotification({
        type: 'shoot_reminder_24h',
        shootId: shoot.id,
        shootTitle: shoot.title,
        client: shoot.client,
        clientEmail: shoot.clientEmail,
        date: shoot.date,
        startTime: shoot.startTime,
        locationName: shoot.locationName
      });
    }
  }

  console.log('[NotificationService] 24-hour reminder check complete');
}
