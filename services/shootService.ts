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
    return data ? {
      id: data.id,
      title: data.title,
      client: data.client,
      date: data.date,
      location: data.location,
      description: data.description,
      coverImage: data.cover_image,
      styleGuide: data.style_guide,
      timeline: data.timeline,
      team: data.team
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

    // Convert snake_case from DB to camelCase
    return (data || []).map(shoot => ({
      id: shoot.id,
      title: shoot.title,
      client: shoot.client,
      date: shoot.date,
      location: shoot.location,
      description: shoot.description,
      coverImage: shoot.cover_image,
      styleGuide: shoot.style_guide,
      timeline: shoot.timeline,
      team: shoot.team
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
      title: shoot.title,
      client: shoot.client,
      date: shoot.date,
      location: shoot.location,
      description: shoot.description,
      cover_image: shoot.coverImage,
      style_guide: shoot.styleGuide,
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
        title: shoot.title,
        client: shoot.client,
        date: shoot.date,
        location: shoot.location,
        description: shoot.description,
        cover_image: shoot.coverImage,
        style_guide: shoot.styleGuide,
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
