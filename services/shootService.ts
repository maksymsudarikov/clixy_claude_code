import { supabase } from './supabase';
import { Shoot } from '../types';

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
    return data ? {
      id: data.id,
      accessToken: data.access_token,
      projectType: data.project_type || 'photo_shoot',
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
      team: data.team || []
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
    return (data || []).map(shoot => ({
      id: shoot.id,
      accessToken: shoot.access_token,
      projectType: shoot.project_type || 'photo_shoot',
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
      team: shoot.team || []
    }));
  } catch (error) {
    console.error('Error fetching shoots:', error);
    return [];
  }
};

// Create new shoot
export const createShoot = async (shoot: Shoot): Promise<void> => {
  try {
    // Convert camelCase to snake_case for DB
    const shootData = {
      id: shoot.id,
      access_token: shoot.accessToken,
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
      team: shoot.team
    };

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
export const updateShoot = async (shoot: Shoot): Promise<void> => {
  try {
    // Convert camelCase to snake_case for DB
    const { error } = await supabase
      .from('shoots')
      .update({
        access_token: shoot.accessToken,
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
        updated_at: new Date().toISOString()
      })
      .eq('id', shoot.id);

    if (error) {
      console.error('Error updating shoot:', error);
      throw new Error(`Failed to update shoot: ${error.message}`);
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
