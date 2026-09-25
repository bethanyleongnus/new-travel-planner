export interface ActivityItem {
  id: string;
  timeSlot: 'morning' | 'afternoon' | 'evening';
  title: string;
  description: string;
  location: string;
  duration: string;
  estimatedCost: string;
  category: 'sightseeing' | 'food' | 'culture' | 'adventure' | 'relaxation' | 'shopping' | 'transit';
  tips?: string;
  bookingRequired?: boolean;
}

export interface DayItinerary {
  dayNumber: number;
  date?: string;
  theme: string;
  activities: ActivityItem[];
  daySummary?: string;
  estimatedDayCost?: string;
}

export interface Itinerary {
  id: string;
  title: string;
  destination: string;
  country?: string;
  durationDays: number;
  startDate?: string;
  endDate?: string;
  budgetTier: 'budget' | 'moderate' | 'luxury';
  travelStyle: 'cultural' | 'foodie' | 'adventure' | 'relaxed' | 'family' | 'romantic' | 'solo';
  travelersCount: number;
  interests: string[];
  days: DayItinerary[];
  totalEstimatedCost: string;
  currency: string;
  highlights: string[];
  localTips: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PackingItem {
  id: string;
  name: string;
  category: 'clothing' | 'toiletries' | 'electronics' | 'documents' | 'health' | 'essentials';
  quantity?: number;
  packed: boolean;
  essential: boolean;
  reason?: string;
}

export interface PackingListResponse {
  destination: string;
  durationDays: number;
  seasonOrWeather: string;
  categories: {
    clothing: PackingItem[];
    toiletries: PackingItem[];
    electronics: PackingItem[];
    documents: PackingItem[];
    health: PackingItem[];
    essentials: PackingItem[];
  };
  specialRecommendations: string[];
}

export interface WeatherInsights {
  destination: string;
  month: string;
  averageHighC: number;
  averageLowC: number;
  averageHighF: number;
  averageLowF: number;
  rainfallChance: string;
  rainfallMm: number;
  sunshineHoursPerDay: number;
  humidity: string;
  seasonType: 'Spring' | 'Summer' | 'Autumn' | 'Winter' | 'Dry Season' | 'Monsoon' | 'Shoulder Season';
  clothingRecommendation: string;
  travelerSuitabilityRating: number;
  keyAdvice: string[];
}

export interface CostBreakdownItem {
  category: string;
  amount: number;
  percentage: number;
  description: string;
  tipsToSave: string;
}

export interface CostEstimate {
  destination: string;
  durationDays: number;
  travelStyle: 'budget' | 'moderate' | 'luxury';
  travelersCount: number;
  currency: string;
  currencySymbol: string;
  totalCost: number;
  costPerPerson: number;
  costPerDayPerPerson: number;
  breakdown: CostBreakdownItem[];
  savingTips: string[];
}

export interface TravelGuide {
  id: string;
  title: string;
  destination: string;
  category: 'culture' | 'food' | 'neighborhoods' | 'transport' | 'budget' | 'practical';
  readTimeMinutes: number;
  summary: string;
  content: string;
  tags: string[];
  highlights: string[];
}

export interface TourItem {
  id: string;
  title: string;
  destination: string;
  duration: string;
  pricePerPerson: number;
  currency: string;
  rating: number;
  reviewCount: number;
  description: string;
  included: string[];
  availability: {
    date: string;
    availableSlots: number;
    status: 'available' | 'few_left' | 'sold_out';
  }[];
}

export interface TourInquiryResponse {
  confirmationCode: string;
  tourId: string;
  tourTitle: string;
  destination: string;
  travelerName: string;
  email: string;
  preferredDate: string;
  travelersCount: number;
  status: 'confirmed' | 'inquiry_received';
  estimatedTotal: string;
  message: string;
  submittedAt: string;
}

export interface ExpertAnswer {
  question: string;
  destination: string;
  answer: string;
  keyTakeaways: string[];
  localInsiderTips: string[];
  warningsOrScamsToAvoid: string[];
  suggestedFollowUpQuestions: string[];
}

export interface SavedTripSummary {
  id: string;
  title: string;
  destination: string;
  durationDays: number;
  startDate?: string;
  budgetTier: string;
  travelStyle: string;
  travelersCount: number;
  totalCost: string;
  heroImage?: string;
  createdAt: string;
}

export interface McpToolMeta {
  name: string;
  description: string;
}

export interface ServerStatus {
  status: string;
  server: string;
  version: string;
  toolsCount: number;
  hasPlantripKey: boolean;
  protocol: string;
  uptime: number;
}
