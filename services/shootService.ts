import { supabase } from './supabase';
import { Shoot } from '../types';
import { generateSecureToken, isValidTokenFormat } from '../utils/tokenUtils';
import { detectStatusChange } from './notificationService';
import { FEATURES } from '../config/features';
import { normalizePhotoStatus, normalizeVideoStatus } from '../utils/statusNormalization';

type ShootRow = Record<string, any>;

const mapShootRow = (row: ShootRow): Shoot => ({
  id: row.id,
  accessToken: row.access_token || '',
  projectType: row.project_type || 'photo_shoot',
  status: row.status || 'pending',
  title: row.title || '',
  client: row.client || '',
  clientEmail: row.client_email || '',
  date: row.date || '',
  startTime: row.start_time || '09:00',
  endTime: row.end_time || '18:00',
  locationName: row.location_name || row.location || '',
  locationAddress: row.location_address || '',
  locationMapUrl: row.location_map_url || '',
  description: row.description || '',
  moodboardUrl: row.moodboard_url || '',
  moodboardImages: row.moodboard_images || [],
  callSheetUrl: row.call_sheet_url || '',
  photoSelectionUrl: row.photo_selection_url || '',
  selectedPhotosUrl: row.selected_photos_url || '',
  finalPhotosUrl: row.final_photos_url || '',
  photoStatus: normalizePhotoStatus(row.photo_status),
  videoUrl: row.video_url || '',
  videoStatus: normalizeVideoStatus(row.video_status),
  revisionNotes: row.revision_notes || '',
  stylingUrl: row.styling_url || '',
  stylingNotes: row.styling_notes || '',
  hairMakeupNotes: row.hair_makeup_notes || '',
  coverImage: row.cover_image || '',
  timeline: row.timeline || [],
  team: row.team || [],
  talent: row.talent || [],
  documents: row.documents || [],
  clientAcceptedTerms: row.client_accepted_terms || false,
  termsAcceptedAt: row.terms_accepted_at || undefined,
  termsAcceptedIP: row.terms_accepted_ip || undefined,
});

const toShootDbPayload = (shoot: Shoot): Record<string, any> => ({
  access_token: shoot.accessToken || generateSecureToken(),
  project_type: shoot.projectType || 'photo_shoot',
  title: shoot.title,
  client: shoot.client,
  client_email: shoot.clientEmail || null,
  date: shoot.date,
  start_time: shoot.startTime,
  end_time: shoot.endTime,
  location_name: shoot.locationName,
  location_address: shoot.locationAddress,
  location_map_url: shoot.locationMapUrl || null,
  description: shoot.description,
  moodboard_url: shoot.moodboardUrl || null,
  moodboard_images: shoot.moodboardImages || [],
  call_sheet_url: shoot.callSheetUrl || null,
  photo_selection_url: shoot.photoSelectionUrl || null,
  selected_photos_url: shoot.selectedPhotosUrl || null,
  final_photos_url: shoot.finalPhotosUrl || null,
  photo_status: normalizePhotoStatus(shoot.photoStatus),
  video_url: shoot.videoUrl || null,
  video_status: normalizeVideoStatus(shoot.videoStatus),
  revision_notes: shoot.revisionNotes || null,
  styling_url: shoot.stylingUrl || null,
  styling_notes: shoot.stylingNotes || null,
  hair_makeup_notes: shoot.hairMakeupNotes,
  cover_image: shoot.coverImage,
  timeline: shoot.timeline || [],
  team: shoot.team || [],
  talent: shoot.talent || [],
  documents: shoot.documents || [],
  client_accepted_terms: shoot.clientAcceptedTerms ?? false,
  terms_accepted_at: shoot.termsAcceptedAt || null,
  terms_accepted_ip: shoot.termsAcceptedIP || null,
});

// Admin fetch: uses id only (for studio dashboard/forms)
export const fetchShootById = async (id: string): Promise<Shoot | undefined> => {
  try {
    const { data, error } = await supabase
      .from('shoots')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return undefined;
    return mapShootRow(data);
  } catch {
    return undefined;
  }
};

// Public fetch: requires matching token at query level
export const fetchShootByIdWithToken = async (id: string, token: string): Promise<Shoot | undefined> => {
  if (!isValidTokenFormat(token)) return undefined;

  try {
    const { data, error } = await supabase
      .from('shoots')
      .select('*')
      .eq('id', id)
      .eq('access_token', token)
      .single();

    if (error || !data) return undefined;
    return mapShootRow(data);
  } catch {
    return undefined;
  }
};

export const fetchAllShoots = async (): Promise<Shoot[]> => {
  try {
    const { data, error } = await supabase
      .from('shoots')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data.map(mapShootRow);
  } catch {
    return [];
  }
};

export const createShoot = async (shoot: Shoot): Promise<void> => {
  const payload: Record<string, any> = {
    id: shoot.id,
    ...toShootDbPayload({
      ...shoot,
      accessToken: shoot.accessToken || generateSecureToken(),
    }),
  };

  if (shoot.status) payload.status = shoot.status;

  const { error } = await supabase
    .from('shoots')
    .insert([payload]);

  if (error) {
    throw new Error(`Failed to create shoot: ${error.message}`);
  }
};

export const updateShoot = async (id: string, shoot: Shoot): Promise<void> => {
  const oldShoot = await fetchShootById(id);

  const payload: Record<string, any> = {
    ...toShootDbPayload(shoot),
    updated_at: new Date().toISOString(),
  };

  if (shoot.status) payload.status = shoot.status;

  const { error } = await supabase
    .from('shoots')
    .update(payload)
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to update shoot: ${error.message}`);
  }

  if (oldShoot && FEATURES.notifications) {
    try {
      const notificationResults = await detectStatusChange(oldShoot, {
        ...shoot,
        photoStatus: normalizePhotoStatus(shoot.photoStatus),
        videoStatus: normalizeVideoStatus(shoot.videoStatus),
      });
      const failed = notificationResults.filter((r) => !r.success);
      if (failed.length > 0) {
        console.error('[ShootService] Notification delivery failures:', failed);
      }
    } catch (err) {
      console.error('[ShootService] Notification flow failed:', err);
    }
  }
};

export const acceptShootTerms = async (id: string, token: string): Promise<void> => {
  if (!isValidTokenFormat(token)) {
    throw new Error('Invalid token format');
  }

  const { error } = await supabase
    .from('shoots')
    .update({
      client_accepted_terms: true,
      terms_accepted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('access_token', token);

  if (error) {
    throw new Error(`Failed to accept terms: ${error.message}`);
  }
};

export const deleteShoot = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('shoots')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete shoot: ${error.message}`);
  }
};
