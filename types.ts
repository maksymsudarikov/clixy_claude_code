export interface TeamMember {
  role: string;
  name: string;
  email?: string;
  phone?: string;
}

export interface Talent {
  name: string;
  role?: string; // model, actor, influencer, real_people, etc.
  phone?: string;
  email?: string;
  agencyUrl?: string; // Link to agency profile (modelagency.com/name)
  photo?: string; // Headshot URL
  arrivalTime?: string; // e.g. "09:00"

  // Quick reference sizes (optional if agencyUrl provided)
  sizes?: {
    height?: string; // e.g. "175cm" or "5'9\""
    clothing?: string; // e.g. "S/36" or "Medium"
    shoes?: string; // e.g. "39" or "US 8"
  };

  notes?: string; // Dietary restrictions, special needs, etc.
}

export interface TimelineEvent {
  time: string;
  activity: string;
}

export interface Document {
  name: string; // e.g. "Client Contract", "Model Release - Anna"
  type: 'client_contract' | 'model_release' | 'location_permit' | 'nda' | 'other';
  url: string; // Google Drive, Dropbox, PandaDoc link
}

export type ProjectType = 'photo_shoot' | 'video_project' | 'hybrid';

export type ShootStatus = 'pending' | 'in_progress' | 'completed' | 'delivered';

export interface Shoot {
  id: string;
  accessToken: string; // Security token for client access to shoot details
  projectType?: ProjectType; // Type of project (optional for backward compatibility)
  status?: ShootStatus; // Overall project status
  title: string;
  client: string;
  clientEmail?: string; // Client's email for notifications
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
  selectedPhotosUrl?: string; // URL for photos client already selected (for re-review)
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
  talent: Talent[]; // Models, actors, influencers being photographed
  timeline: TimelineEvent[]; // Array of schedule events
  documents: Document[]; // Admin-only: contracts, releases, permits

  // Terms & Conditions tracking (client agreement)
  clientAcceptedTerms?: boolean; // Has client agreed to T&C?
  termsAcceptedAt?: string; // ISO timestamp when agreed
  termsAcceptedIP?: string; // IP address when agreed (optional)

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
