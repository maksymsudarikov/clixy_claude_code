export interface TeamMember {
  role: string;
  name: string;
  email?: string;
  phone?: string;
}

export interface TimelineEvent {
  time: string;
  activity: string;
}

export interface Shoot {
  id: string;
  title: string;
  client: string;
  date: string;
  startTime: string;
  endTime: string;
  locationName: string;
  locationAddress: string;
  locationMapUrl?: string;
  description: string;
  moodboardUrl?: string;
  moodboardImages: string[]; // Array of image URLs for preview
  callSheetUrl?: string;
  finalPhotosUrl?: string;
  stylingUrl?: string; // Changed from notes to URL
  stylingNotes?: string; // Kept optional for backward compatibility
  hairMakeupNotes: string;
  team: TeamMember[];
  timeline: TimelineEvent[]; // Array of schedule events
  coverImage: string;
}
