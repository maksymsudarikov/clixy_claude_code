import { Shoot } from './types';

export const MOCK_SHOOTS: Shoot[] = [
  {
    id: 'editorial-q3',
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