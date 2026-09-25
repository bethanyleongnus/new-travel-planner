export interface DestinationVisual {
  name: string;
  country: string;
  tagline: string;
  description: string;
  heroImage: string;
  thumbnail: string;
  badge: string;
  accentColor: string;
  bestMonths: string;
  avgDailyCost: string;
  vibe: string;
}

// Curated high quality graphics and generated artwork
export const DESTINATION_GRAPHICS: Record<string, DestinationVisual> = {
  'Kyoto, Japan': {
    name: 'Kyoto, Japan',
    country: 'Japan',
    tagline: 'Temples, Moss Gardens & Bamboo Whispers',
    description: 'Ancient imperial capital enveloped in peaceful cedar hills, morning tea rituals, and vermilion shrine gates.',
    heroImage: '/src/assets/images/travel_hero_banner_1790322037526.jpg',
    thumbnail: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=600&q=80',
    badge: 'Zen & Culture',
    accentColor: 'emerald',
    bestMonths: 'March–May & Oct–Nov',
    avgDailyCost: '$160 / day',
    vibe: 'Peaceful, introspective, reverent'
  },
  'Tokyo, Japan': {
    name: 'Tokyo, Japan',
    country: 'Japan',
    tagline: 'Neon Horizons & Hidden Shinto Shrines',
    description: 'Dynamic metropolis of culinary innovation, tranquil garden sanctuaries, and boundary-pushing technology.',
    heroImage: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1600&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=600&q=80',
    badge: 'Dynamic & Culinary',
    accentColor: 'indigo',
    bestMonths: 'Oct–Dec & March–May',
    avgDailyCost: '$190 / day',
    vibe: 'Vibrant, orderly, sensory'
  },
  'Paris, France': {
    name: 'Paris, France',
    country: 'France',
    tagline: 'Gilded Boulevards, Cafés & Seine Twilight',
    description: 'City of light where timeless neoclassical facades shelter cozy literary bookstalls and world-class patisseries.',
    heroImage: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1600&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=600&q=80',
    badge: 'Romance & Fine Arts',
    accentColor: 'amber',
    bestMonths: 'April–June & Sept–Nov',
    avgDailyCost: '$220 / day',
    vibe: 'Poetic, leisure, indulgent'
  },
  'Bali, Indonesia': {
    name: 'Bali, Indonesia',
    country: 'Indonesia',
    tagline: 'Emerald Rice Terraces & Turquoise Swell',
    description: 'Tropical sanctuary of soothing soundscapes, temple frangipani blossoms, and cliffside ocean breezes.',
    heroImage: '/src/assets/images/travel_coastal_vista_1790322051348.jpg',
    thumbnail: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=600&q=80',
    badge: 'Wellness & Island',
    accentColor: 'teal',
    bestMonths: 'May–October',
    avgDailyCost: '$95 / day',
    vibe: 'Rejuvenating, warm, spiritual'
  },
  'Rome, Italy': {
    name: 'Rome, Italy',
    country: 'Italy',
    tagline: 'Ancient Stones, Sunlit Piazzas & Gelato',
    description: 'Living museum of Renaissance courtyards, fountain cascades, and warm terracotta-hued evening sunsets.',
    heroImage: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1600&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1529260830199-42c24126f198?auto=format&fit=crop&w=600&q=80',
    badge: 'Classical Antiquity',
    accentColor: 'amber',
    bestMonths: 'April–May & Sept–Oct',
    avgDailyCost: '$175 / day',
    vibe: 'Grand, lively, historic'
  },
  'Swiss Alps, Switzerland': {
    name: 'Swiss Alps, Switzerland',
    country: 'Switzerland',
    tagline: 'Crystal Glaciers & Alpine Pine Meadows',
    description: 'Majestic jagged mountain summits, glassy alpine lakes, and serene scenic mountain rail journeys.',
    heroImage: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1600&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80',
    badge: 'Nature & Peaks',
    accentColor: 'sky',
    bestMonths: 'June–Sept & Dec–March',
    avgDailyCost: '$260 / day',
    vibe: 'Crisp, majestic, invigorating'
  },
  'Amalfi Coast, Italy': {
    name: 'Amalfi Coast, Italy',
    country: 'Italy',
    tagline: 'Pastel Cliffside Villages & Mediterranean Citrus',
    description: 'Breathtaking coastal cliffs tumbling into azure waters, lemon orchards, and scenic coastal hiking paths.',
    heroImage: '/src/assets/images/travel_coastal_vista_1790322051348.jpg',
    thumbnail: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=600&q=80',
    badge: 'Coastal Charm',
    accentColor: 'cyan',
    bestMonths: 'May–June & Sept–Oct',
    avgDailyCost: '$240 / day',
    vibe: 'Sun-drenched, scenic, luxurious'
  },
  'Barcelona, Spain': {
    name: 'Barcelona, Spain',
    country: 'Spain',
    tagline: 'Modernist Masterpieces & Mediterranean Sun',
    description: 'Sensory coastal gem rich with Gaudí architectural whimsy, Gothic Quarter taverns, and seaside promenades.',
    heroImage: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=1600&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=600&q=80',
    badge: 'Architecture & Tapas',
    accentColor: 'rose',
    bestMonths: 'May–June & Sept–Oct',
    avgDailyCost: '$165 / day',
    vibe: 'Creative, relaxed, coastal'
  }
};

export const RELAXING_TRAVEL_QUOTES = [
  { text: 'Travel isn’t always about going far, but about seeing with fresh eyes and a calmer breath.', author: 'Anonymous Wanderer' },
  { text: 'Live with no excuses and travel with no regrets.', author: 'Oscar Wilde' },
  { text: 'The journey of a thousand miles begins with a peaceful single step.', author: 'Lao Tzu' },
  { text: 'To travel is to discover that everyone is wrong about other countries.', author: 'Aldous Huxley' }
];

export function getDestinationVisual(dest: string): DestinationVisual {
  const match = Object.keys(DESTINATION_GRAPHICS).find(
    (k) => dest.toLowerCase().includes(k.split(',')[0].toLowerCase())
  );
  return (
    DESTINATION_GRAPHICS[match || 'Kyoto, Japan'] || DESTINATION_GRAPHICS['Kyoto, Japan']
  );
}
