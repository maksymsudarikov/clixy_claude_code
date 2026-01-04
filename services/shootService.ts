import { supabase } from './supabase';
import { Shoot } from '../types';
import { generateSecureToken } from '../utils/tokenUtils';
import { detectStatusChange } from './notificationService';
import { FEATURES } from '../config/features';

// Fetch shoot by ID
export const fetchShootById = async (id: string): Promise<Shoot | undefined> => {
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

    // Convert snake_case from DB to camelCase
    // Handle missing fields with defaults

    // CRITICAL: Generate token if missing (backward compatibility)
    let accessToken = data.access_token;
    if (!accessToken) {
      console.warn(`Shoot ${data.id} missing access_token, generating new one...`);
      accessToken = generateSecureToken();

      // Save the generated token to DB immediately
      try {
        await supabase
          .from('shoots')
          .update({ access_token: accessToken })
          .eq('id', data.id);
        console.log(`✅ Generated and saved token for shoot ${data.id}`);
      } catch (updateError) {
        console.error('Failed to save generated token:', updateError);
      }
    }

    return data ? {
      id: data.id,
      accessToken: accessToken,
      projectType: data.project_type || 'photo_shoot',
      status: data.status || 'pending',
      title: data.title,
      client: data.client,
      date: data.date,
      startTime: data.start_time || '09:00',
      endTime: data.end_time || '18:00',
      locationName: data.location_name || data.location || '',
      locationAddress: data.location_address || '',
      locationMapUrl: data.location_map_url || '',
      description: data.description || '',
      moodboardUrl: data.moodboard_url || '',
      moodboardImages: data.moodboard_images || [],
      callSheetUrl: data.call_sheet_url || '',
      photoSelectionUrl: data.photo_selection_url || '',
      selectedPhotosUrl: data.selected_photos_url || '',
      finalPhotosUrl: data.final_photos_url || '',
      photoStatus: data.photo_status || 'selection_ready',
      videoUrl: data.video_url || '',
      videoStatus: data.video_status || 'draft',
      revisionNotes: data.revision_notes || '',
      stylingUrl: data.styling_url || '',
      stylingNotes: data.styling_notes || '',
      hairMakeupNotes: data.hair_makeup_notes || '',
      coverImage: data.cover_image || '',
      timeline: data.timeline || [],
      team: data.team || [],
      talent: data.talent || [], // Talent support (backward compatible)
      documents: data.documents || [], // Documents support (backward compatible)
      clientAcceptedTerms: data.client_accepted_terms || false, // Terms tracking
      termsAcceptedAt: data.terms_accepted_at || undefined, // Terms timestamp
      termsAcceptedIP: data.terms_accepted_ip || undefined // Terms IP (optional)
    } : undefined;
  } catch (error) {
    console.error('Error fetching shoot:', error);
    return undefined;
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

    // Convert snake_case from DB to camelCase with defaults
    // CRITICAL: Generate tokens for any shoots missing them
    const shootsWithTokens = await Promise.all((data || []).map(async (shoot) => {
      let accessToken = shoot.access_token;

      // Auto-generate and save token if missing
      if (!accessToken) {
        console.warn(`Shoot ${shoot.id} missing token, generating...`);
        accessToken = generateSecureToken();

        try {
          await supabase
            .from('shoots')
            .update({ access_token: accessToken })
            .eq('id', shoot.id);
          console.log(`✅ Generated token for ${shoot.id}`);
        } catch (err) {
          console.error(`Failed to save token for ${shoot.id}:`, err);
        }
      }

      return {
        id: shoot.id,
        accessToken: accessToken,
        projectType: shoot.project_type || 'photo_shoot',
        status: shoot.status || 'pending',
        title: shoot.title,
      client: shoot.client,
      date: shoot.date,
      startTime: shoot.start_time || '09:00',
      endTime: shoot.end_time || '18:00',
      locationName: shoot.location_name || shoot.location || '',
      locationAddress: shoot.location_address || '',
      locationMapUrl: shoot.location_map_url || '',
      description: shoot.description || '',
      moodboardUrl: shoot.moodboard_url || '',
      moodboardImages: shoot.moodboard_images || [],
      callSheetUrl: shoot.call_sheet_url || '',
      photoSelectionUrl: shoot.photo_selection_url || '',
      selectedPhotosUrl: shoot.selected_photos_url || '',
      finalPhotosUrl: shoot.final_photos_url || '',
      photoStatus: shoot.photo_status || 'selection_ready',
      videoUrl: shoot.video_url || '',
      videoStatus: shoot.video_status || 'draft',
      revisionNotes: shoot.revision_notes || '',
      stylingUrl: shoot.styling_url || '',
      stylingNotes: shoot.styling_notes || '',
      hairMakeupNotes: shoot.hair_makeup_notes || '',
      coverImage: shoot.cover_image || '',
      timeline: shoot.timeline || [],
      team: shoot.team || [],
      talent: shoot.talent || [], // Talent support
      documents: shoot.documents || [], // Documents support
      clientAcceptedTerms: shoot.client_accepted_terms || false, // Terms tracking
      termsAcceptedAt: shoot.terms_accepted_at || undefined, // Terms timestamp
      termsAcceptedIP: shoot.terms_accepted_ip || undefined // Terms IP (optional)
    };
    }));

    return shootsWithTokens;
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

    console.log('Creating shoot with data:', shootData);

    const { data, error } = await supabase
      .from('shoots')
      .insert([shootData])
      .select();

    if (error) {
      console.error('Supabase error details:', JSON.stringify(error, null, 2));
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Error hint:', error.hint);
      throw new Error(`Failed to create shoot: ${error.message}`);
    }

    console.log('Shoot created successfully:', data);
  } catch (error) {
    console.error('Error creating shoot:', error);
    throw error;
  }
};

// Update existing shoot
export const updateShoot = async (id: string, shoot: Shoot): Promise<void> => {
  try {
    // Fetch old shoot data for notification comparison
    const oldShoot = await fetchShootById(id);

    // Convert camelCase to snake_case for DB
    const updateData: any = {
        access_token: shoot.accessToken || generateSecureToken(),
        project_type: shoot.projectType || 'photo_shoot',
        title: shoot.title,
        client: shoot.client,
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

    // Check for status changes and trigger notifications (async, non-blocking)
    if (oldShoot && FEATURES.notifications) {
      detectStatusChange(oldShoot, shoot).catch(err => {
        console.error('[NotificationService] Failed to detect status changes (non-critical):', err);
        // Shoot update succeeded, notification failure is non-critical
      });
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
