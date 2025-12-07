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
