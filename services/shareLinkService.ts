import { supabase } from './supabase';
import { Shoot } from '../types';

interface ShareLinkResponse {
  shareUrl: string;
  expiresAt: string;
}

interface ResolveShareResponse {
  shoot: any;
  expiresAt: string;
}

export const createShareLink = async (
  shootId: string,
  ttlHours: number = 24 * 14
): Promise<ShareLinkResponse> => {
  const { data, error } = await supabase.functions.invoke('create-share-link', {
    body: { shootId, ttlHours },
  });

  if (error) {
    throw new Error(error.message || 'Failed to create share link');
  }

  return data as ShareLinkResponse;
};

export const resolveShareLink = async (
  shootId: string,
  token: string
): Promise<ResolveShareResponse> => {
  const { data, error } = await supabase.functions.invoke('resolve-share-link', {
    body: { shootId, token },
  });

  if (error) {
    throw new Error(error.message || 'Failed to resolve share link');
  }

  return data as ResolveShareResponse;
};

export const acceptTermsViaShareLink = async (
  shootId: string,
  token: string
): Promise<void> => {
  const { error } = await supabase.functions.invoke('accept-terms', {
    body: { shootId, token },
  });

  if (error) {
    throw new Error(error.message || 'Failed to accept terms');
  }
};

export const mapShootRecord = (data: any): Shoot => ({
  id: data.id,
  accessToken: data.access_token || '',
  projectType: data.project_type || 'photo_shoot',
  status: data.status || 'pending',
  title: data.title,
  client: data.client,
  clientEmail: data.client_email || '',
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
  talent: data.talent || [],
  documents: data.documents || [],
  clientAcceptedTerms: data.client_accepted_terms || false,
  termsAcceptedAt: data.terms_accepted_at || undefined,
  termsAcceptedIP: data.terms_accepted_ip || undefined,
});
