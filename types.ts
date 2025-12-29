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

export type ProjectType = 'photo_shoot' | 'video_project' | 'hybrid';

export interface Shoot {
  id: string;
  accessToken: string; // Security token for client access to shoot details
  projectType?: ProjectType; // Type of project (optional for backward compatibility)
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

  // Photo-specific fields
  photoSelectionUrl?: string; // URL for client to select photos (Adobe/GDrive/WeTransfer)
  finalPhotosUrl?: string; // URL for final edited photos (same folder, updated)
  photoStatus?: 'selection_ready' | 'editing_in_progress' | 'completed'; // Photo workflow status

  // Video-specific fields
  videoUrl?: string; // URL for video deliverables (Google Drive, WeTransfer, etc.)
  videoStatus?: 'draft' | 'editing' | 'review' | 'final'; // Video workflow status
  revisionNotes?: string; // Client revision notes for video

  stylingUrl?: string; // Changed from notes to URL
  stylingNotes?: string; // Kept optional for backward compatibility
  hairMakeupNotes: string;
  team: TeamMember[];
  timeline: TimelineEvent[]; // Array of schedule events
  coverImage: string;
}

// Gift Card Types
export interface GiftCardPackage {
  id: string;
  name: string;
  price: number;
  currency: string;
  duration: string;
  photosCount: string;
  locations?: string;
  features: string[];
  description: string;
  popular?: boolean;
  notionUrl?: string; // Link to full details on Notion
}

export interface GiftCardPurchaseForm {
  packageId: string;
  purchaserName: string;
  purchaserEmail: string;
  purchaserPhone: string;
  recipientName: string;
  recipientEmail: string;
  personalMessage?: string;
  deliveryType: 'immediate' | 'scheduled';
  deliveryDate?: string;
}

export interface GiftCard {
  id: string;
  code: string;
  packageId: string;
  packageName: string;
  amount: number;
  currency: string;
  purchaserName: string;
  purchaserEmail: string;
  purchaserPhone: string;
  recipientName: string;
  recipientEmail: string;
  personalMessage?: string;
  purchaseDate: string;
  deliveryDate: string;
  expiryDate: string;
  sentDate?: string;
  redeemedDate?: string;
  status: 'pending' | 'active' | 'sent' | 'redeemed' | 'expired' | 'cancelled';
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  redeemedBy?: string;
  adminNotes?: string;
}
