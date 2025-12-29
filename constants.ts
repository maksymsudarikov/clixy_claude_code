import { Shoot, GiftCardPackage } from './types';
import { generateSecureToken } from './utils/tokenUtils';

// Contact Information
export const CONTACT_INFO = {
  whatsapp: '+13475839777',
  email: 'art@olgaprudka.com',
  zelle: {
    name: 'Olha Prudka',
    phone: '347-933-5770'
  }
};

// Gift Card Packages
export const GIFT_CARD_PACKAGES: GiftCardPackage[] = [
  {
    id: 'couple-photoshoot',
    name: 'COUPLE PHOTOSHOOT',
    price: 1000,
    currency: 'USD',
    duration: '1.5–2 hours',
    photosCount: '40 edited photos',
    locations: '1 main location',
    features: [
      'Close-up portraits of connection and intimacy',
      'Detail shots (hands, expressions, small moments)',
      'Full-body frames',
      'Dynamic movement and candid interactions',
      'Multiple backgrounds and moods',
      'Color + B&W versions',
      'All original files from the session',
      'Personalized moodboard',
      'Posing guidance and support'
    ],
    description: 'A cinematic couple session focused on capturing your connection and emotions in a natural and authentic way.',
    popular: true,
    notionUrl: 'https://www.notion.so/COUPLE-PHOTOSHOOT-2af387bff96a803b9a85d88b01b15066'
  },
  {
    id: 'street-style-single',
    name: 'STREET STYLE (1 Outfit)',
    price: 1000,
    currency: 'USD',
    duration: '1.5–2 hours',
    photosCount: '35 edited photos',
    locations: '1 NYC neighborhood',
    features: [
      '1 outfit',
      'Close-up portraits',
      'Detail captures (accessories, textures, expressions)',
      'Full-body frames',
      'Dynamic movement shots',
      'Color + B&W versions',
      'All original files',
      'Custom moodboard',
      'Posing guidance and angles'
    ],
    description: 'A dynamic New York street style session focused on you and your personality.',
    notionUrl: 'https://www.notion.so/STREET-STYLE-PHOTOSHOOT-2af387bff96a80fd943cd55499d4b657'
  },
  {
    id: 'street-style-double',
    name: 'STREET STYLE (2 Outfits)',
    price: 1300,
    currency: 'USD',
    duration: '2–3 hours',
    photosCount: '50 edited photos',
    locations: '1 NYC neighborhood',
    features: [
      '2 outfits',
      'Close-up portraits',
      'Detail captures (accessories, textures, expressions)',
      'Full-body frames',
      'Dynamic movement shots',
      'Color + B&W versions',
      'All original files',
      'Custom moodboard',
      'Posing guidance and angles'
    ],
    description: 'Extended street style session with two outfit changes for more variety.',
    notionUrl: 'https://www.notion.so/STREET-STYLE-PHOTOSHOOT-2af387bff96a80fd943cd55499d4b657'
  },
  {
    id: 'family-photoshoot',
    name: 'FAMILY PHOTOSHOOT',
    price: 1300,
    currency: 'USD',
    duration: '2–2.5 hours',
    photosCount: '40 edited photos',
    locations: 'Home or outdoor location',
    features: [
      'Natural portraits',
      'Emotional group shots',
      'Close-ups and macro portraits',
      'Candid reportage-style frames',
      'Color + B&W versions',
      'All original files',
      'Outfit coordination help',
      'Relaxed, natural atmosphere',
      'Optional personalized moodboard'
    ],
    description: 'An intimate, documentary-style family session that captures who you really are — the warmth, connection, laughter, and quiet moments.',
    notionUrl: 'https://www.notion.so/FAMILY-PHOTOSHOOT-2a5387bff96a80289610d556cc0b2bc9'
  }
];

export const MOCK_SHOOTS: Shoot[] = [
  {
    id: 'editorial-q3',
    accessToken: generateSecureToken(), // Динамически генерируем безопасный токен
    title: 'Urban Solstice Editorial',
    client: 'Vogue Scandinavia',
    date: '2023-10-24',
    startTime: '08:00 AM',
    endTime: '06:00 PM',
    locationName: 'The Industrial Loft',
    locationAddress: '543 Artists Way, Brooklyn, NY 11211',
    locationMapUrl: 'https://maps.google.com',
    description: 'High contrast black and white editorial focusing on architectural shapes and winter coats.',
    moodboardUrl: 'https://pinterest.com',
    moodboardImages: [
        'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&q=80&w=800'
    ],
    callSheetUrl: '#',
    stylingUrl: 'https://slides.google.com',
    hairMakeupNotes: 'Clean skin, brushed up brows. Bold red lip for second half of the day. No mascara.',
    coverImage: 'https://images.unsplash.com/photo-1492633423870-43d1cd2775eb?auto=format&fit=crop&q=80&w=1200',
    team: [
      { role: 'Photographer', name: 'Elena Fisher', phone: '555-0101' },
      { role: 'Stylist', name: 'Marc Jacobs (Assistant)', phone: '555-0102' },
      { role: 'Model', name: 'Sasha K.', email: 'sasha@agency.com' },
      { role: 'MUA', name: 'David Chen' }
    ],
    timeline: [
        { time: '08:00', activity: 'Crew Call / Coffee & Setup' },
        { time: '08:30', activity: 'Hair & Makeup Start' },
        { time: '10:00', activity: 'First Look On Set' },
        { time: '13:00', activity: 'Lunch Break' },
        { time: '17:30', activity: 'Wrap' }
    ]
  },
  {
    id: 'campaign-nike',
    accessToken: generateSecureToken(), // Динамически генерируем безопасный токен
    title: 'Speed Tech Campaign',
    client: 'Nike',
    date: '2023-11-05',
    startTime: '06:00 AM',
    endTime: '02:00 PM',
    locationName: 'City Track & Field',
    locationAddress: '100 Olympic Blvd, Los Angeles, CA 90015',
    description: 'Dynamic movement shots showcasing the new Runner Pro 5000. Golden hour lighting essential.',
    moodboardUrl: 'https://canva.com',
    moodboardImages: [],
    finalPhotosUrl: '#',
    stylingUrl: 'https://notion.so',
    hairMakeupNotes: 'Sweat sheen effect. Athletic pony tails.',
    coverImage: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=1200',
    team: [
      { role: 'Director', name: 'James Cameron (Not that one)' },
      { role: 'DOP', name: 'Sarah Conner' },
      { role: 'Producer', name: 'Skynet Productions' }
    ],
    timeline: [
        { time: '06:00', activity: 'Call Time (Golden Hour)' },
        { time: '14:00', activity: 'Wrap' }
    ]
  }
];