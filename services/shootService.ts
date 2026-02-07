import { supabase } from './supabase';
import { Shoot } from '../types';
import { generateSecureToken } from '../utils/tokenUtils';
import { detectStatusChange } from './notificationService';
import { FEATURES } from '../config/features';
import { mapShootRecord, resolveShareLink } from './shareLinkService';

// Fetch shoot by ID for authenticated admins
export const fetchShootByIdAdmin = async (id: string): Promise<Shoot | undefined> => {
  try {
    const { data, error } = await supabase
      .from('shoots')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching shoot:', error);
      return undefined;
    }

    return data ? mapShootRecord(data) : undefined;
  } catch (error) {
    console.error('Error fetching shoot:', error);
    return undefined;
  }
};

// Backward-compatible alias
export const fetchShootById = fetchShootByIdAdmin;

// Fetch shoot by share token (public route)
export const fetchShootByShareToken = async (
  id: string,
  token: string
): Promise<{ shoot?: Shoot; expiresAt?: string }> => {
  try {
    const result = await resolveShareLink(id, token);
    return {
      shoot: mapShootRecord(result.shoot),
      expiresAt: result.expiresAt,
    };
  } catch {
    return {};
  }
};

// Fetch all shoots
export const fetchAllShoots = async (): Promise<Shoot[]> => {
  try {
    const { data, error } = await supabase
      .from('shoots')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching shoots:', error);
      return [];
    }

    return (data || []).map(mapShootRecord);
  } catch (error) {
    console.error('Error fetching shoots:', error);
    return [];
  }
};

// Create new shoot
export const createShoot = async (shoot: Shoot): Promise<void> => {
  try {
    // Convert camelCase to snake_case for DB
    // Ensure access_token is always present
    const shootData: any = {
      id: shoot.id,
      access_token: shoot.accessToken || generateSecureToken(),
      project_type: shoot.projectType || 'photo_shoot',
      title: shoot.title,
      client: shoot.client,
      client_email: shoot.clientEmail,
      date: shoot.date,
      start_time: shoot.startTime,
      end_time: shoot.endTime,
      location_name: shoot.locationName,
      location_address: shoot.locationAddress,
      location_map_url: shoot.locationMapUrl,
      description: shoot.description,
      moodboard_url: shoot.moodboardUrl,
      moodboard_images: shoot.moodboardImages,
      call_sheet_url: shoot.callSheetUrl,
      photo_selection_url: shoot.photoSelectionUrl,
      selected_photos_url: shoot.selectedPhotosUrl,
      final_photos_url: shoot.finalPhotosUrl,
      photo_status: shoot.photoStatus,
      video_url: shoot.videoUrl,
      video_status: shoot.videoStatus,
      revision_notes: shoot.revisionNotes,
      styling_url: shoot.stylingUrl,
      styling_notes: shoot.stylingNotes,
      hair_makeup_notes: shoot.hairMakeupNotes,
      cover_image: shoot.coverImage,
      timeline: shoot.timeline,
      team: shoot.team,
      talent: shoot.talent || [], // Talent support
      documents: shoot.documents || [], // Documents support
      client_accepted_terms: shoot.clientAcceptedTerms || false, // Terms tracking
      terms_accepted_at: shoot.termsAcceptedAt || null, // Terms timestamp
      terms_accepted_ip: shoot.termsAcceptedIP || null // Terms IP (optional)
    };

    // Add status only if provided (column might not exist in DB yet)
    if (shoot.status) {
      shootData.status = shoot.status;
    }

    const { error } = await supabase
      .from('shoots')
      .insert([shootData])
      .select('id')
      .single();

    if (error) {
      throw new Error(`Failed to create shoot: ${error.message}`);
    }
  } catch (error) {
    console.error('Error creating shoot:', error);
    throw error;
  }
};

// Update existing shoot
export const updateShoot = async (id: string, shoot: Shoot): Promise<void> => {
  try {
    // Fetch old shoot data for notification comparison
    const oldShoot = await fetchShootByIdAdmin(id);

    // Convert camelCase to snake_case for DB
    const updateData: any = {
        access_token: shoot.accessToken || generateSecureToken(),
        project_type: shoot.projectType || 'photo_shoot',
        title: shoot.title,
        client: shoot.client,
        client_email: shoot.clientEmail,
        date: shoot.date,
        start_time: shoot.startTime,
        end_time: shoot.endTime,
        location_name: shoot.locationName,
        location_address: shoot.locationAddress,
        location_map_url: shoot.locationMapUrl,
        description: shoot.description,
        moodboard_url: shoot.moodboardUrl,
        moodboard_images: shoot.moodboardImages,
        call_sheet_url: shoot.callSheetUrl,
        photo_selection_url: shoot.photoSelectionUrl,
        selected_photos_url: shoot.selectedPhotosUrl,
        final_photos_url: shoot.finalPhotosUrl,
        photo_status: shoot.photoStatus,
        video_url: shoot.videoUrl,
        video_status: shoot.videoStatus,
        revision_notes: shoot.revisionNotes,
        styling_url: shoot.stylingUrl,
        styling_notes: shoot.stylingNotes,
        hair_makeup_notes: shoot.hairMakeupNotes,
        cover_image: shoot.coverImage,
        timeline: shoot.timeline,
        team: shoot.team,
        talent: shoot.talent || [], // Talent support
        documents: shoot.documents || [], // Documents support
        client_accepted_terms: shoot.clientAcceptedTerms || false, // Terms tracking
        terms_accepted_at: shoot.termsAcceptedAt || null, // Terms timestamp
        terms_accepted_ip: shoot.termsAcceptedIP || null, // Terms IP (optional)
        updated_at: new Date().toISOString()
    };

    // Add status only if provided (backward compatibility)
    if (shoot.status) {
      updateData.status = shoot.status;
    }

    const { error } = await supabase
      .from('shoots')
      .update(updateData)
      .eq('id', id);

    if (error) {
      console.error('Error updating shoot:', error);
      throw new Error(`Failed to update shoot: ${error.message}`);
    }

    // Check for status changes and trigger notifications
    // Phase 4: Await notification results to ENSURE delivery before returning
    if (oldShoot && FEATURES.notifications) {
      try {
        const notificationResults = await detectStatusChange(oldShoot, shoot);

        // Check for any failed notifications
        const failedNotifications = notificationResults.filter(r => !r.success);

        if (failedNotifications.length > 0) {
          console.error('[ShootService] ⚠️ EMAIL NOTIFICATION FAILED:', failedNotifications);
          console.error('⚠️⚠️⚠️ CLIENT DID NOT RECEIVE EMAIL - MANUAL FOLLOW-UP REQUIRED ⚠️⚠️⚠️');
          // Shoot was saved successfully, but email failed - admin needs to know!
        } else if (notificationResults.length > 0) {
          console.log('[ShootService] ✅ Email notification delivered successfully');
        }
      } catch (err) {
        console.error('[ShootService] ❌ CRITICAL: Failed to send email notification:', err);
        console.error('⚠️⚠️⚠️ CLIENT DID NOT RECEIVE EMAIL - MANUAL FOLLOW-UP REQUIRED ⚠️⚠️⚠️');
      }
    }
  } catch (error) {
    console.error('Error updating shoot:', error);
    throw error;
  }
};

// Delete shoot
export const deleteShoot = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('shoots')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting shoot:', error);
      throw new Error(`Failed to delete shoot: ${error.message}`);
    }
  } catch (error) {
    console.error('Error deleting shoot:', error);
    throw error;
  }
};
