export type TravelStyle =
  | 'Adventure'
  | 'Relaxation'
  | 'Cultural'
  | 'Historical'
  | 'Nature'
  | 'Food & Cuisine'
  | 'Shopping'
  | 'Nightlife'
  | 'Photography'
  | 'Spiritual'
  | 'Family'
  | 'Luxury'
  | 'Backpacking';

export type FoodPreference =
  | 'Vegetarian'
  | 'Vegan'
  | 'Non-Vegetarian'
  | 'Halal'
  | 'Jain'
  | 'Local Cuisine'
  | 'Street Food'
  | 'Fine Dining'
  | 'No Preference';

export type AccommodationType =
  | 'Hostel'
  | 'Budget Hotel'
  | 'Hotel'
  | 'Boutique Hotel'
  | 'Resort'
  | 'Luxury Hotel'
  | 'Apartment';

export type TransportationType =
  | 'Walking'
  | 'Public Transport'
  | 'Taxi'
  | 'Rental Car'
  | 'Bike'
  | 'Train'
  | 'Mixed';

export type Interest =
  | 'Museums'
  | 'Temples'
  | 'Beaches'
  | 'Mountains'
  | 'Historical Sites'
  | 'Markets'
  | 'Cafes'
  | 'Restaurants'
  | 'Adventure Sports'
  | 'Wildlife'
  | 'Architecture'
  | 'Art'
  | 'Local Culture'
  | 'Hidden Gems'
  | 'Photography';

export type BudgetTier = 'Budget' | 'Moderate' | 'Premium' | 'Luxury';

export type ActivityCategory =
  | 'Sightseeing'
  | 'Food & Dining'
  | 'Adventure'
  | 'Culture & History'
  | 'Relaxation'
  | 'Shopping'
  | 'Nightlife'
  | 'Transportation'
  | 'Hotel / Stay';

export interface User {
  id: string;
  name: string;
  email: string;
  profile_image?: string;
  role?: 'user' | 'admin';
  status?: 'active' | 'suspended';
  created_at: string;
  updated_at?: string;
}

export interface AuthorAttribution {
  displayName: string;
  uri?: string;
  photoUri?: string;
}

export interface PlacePhoto {
  url: string;
  authorAttributions?: AuthorAttribution[];
  width?: number;
  height?: number;
  caption?: string;
  source?: 'google_places' | 'verified_catalog' | 'destination_registry' | 'fallback';
}

export interface ResolvedPlaceImage {
  placeId: string;
  name: string;
  region?: string;
  destination: string;
  country: string;
  heroImage: string;
  photos: PlacePhoto[];
  gallery: string[];
  authorAttributions?: AuthorAttribution[];
  latitude?: number;
  longitude?: number;
  formattedAddress?: string;
  category?: string;
  isExactMatch: boolean;
  source?: 'google_places' | 'verified_catalog' | 'fallback';
}

export interface UserPreferences {
  id: string;
  user_id: string;
  travel_style: TravelStyle[];
  preferred_activities: Interest[];
  food_preferences: FoodPreference[];
  accommodation_preference: AccommodationType;
  transportation_preference: TransportationType;
  preferred_budget: number;
  preferred_destinations: string[];
}

export interface Activity {
  id: string;
  itinerary_day_id: string;
  name: string;
  description: string;
  category: ActivityCategory;
  start_time: string;
  end_time?: string;
  duration?: string;
  estimated_cost: number;
  location: string;
  latitude: number;
  longitude: number;
  image?: string;
  place_id?: string;
  photos?: PlacePhoto[];
  gallery?: string[];
  authorAttributions?: AuthorAttribution[];
  booking_url?: string;
  notes?: string;
  rating?: number;
}

export interface ItineraryDay {
  id: string;
  trip_id: string;
  day_number: number;
  date: string;
  title: string;
  description: string;
  activities: Activity[];
}

export interface Trip {
  id: string;
  user_id: string;
  title: string;
  destination: string;
  destination_country?: string;
  start_date: string;
  end_date: string;
  duration: number; // in days
  travelers: number;
  traveler_type: 'Solo' | 'Couple' | 'Family' | 'Friends' | 'Business';
  total_budget: number;
  currency: string;
  travel_style: TravelStyle[];
  food_preferences: FoodPreference[];
  accommodation_preference: AccommodationType;
  transportation_preference: TransportationType;
  interests: Interest[];
  status: 'planned' | 'completed' | 'in-progress';
  cover_image: string;
  summary?: string;
  estimated_cost?: number;
  budget_breakdown?: BudgetBreakdown;
  travel_tips?: string[];
  itinerary_days?: ItineraryDay[];
  created_at: string;
  updated_at: string;
}

export interface BudgetBreakdown {
  accommodation: number;
  food: number;
  transportation: number;
  activities: number;
  shopping: number;
  miscellaneous: number;
  total: number;
}

export interface Place {
  id: string;
  name: string;
  destination: string;
  category: 'Attraction' | 'Restaurant' | 'Hotel' | 'Hidden Gem';
  sub_category?: string;
  description: string;
  latitude: number;
  longitude: number;
  rating: number;
  reviews_count?: number;
  price_level: '$' | '$$' | '$$$' | '$$$$';
  estimated_cost: number;
  image: string;
  place_id?: string;
  photos?: PlacePhoto[];
  gallery?: string[];
  authorAttributions?: AuthorAttribution[];
  address: string;
  opening_hours?: string;
  best_time_to_visit?: string;
  tags?: string[];
}

export interface SavedPlace {
  id: string;
  user_id: string;
  place_id: string;
  place?: Place;
  notes?: string;
  created_at: string;
}

export interface TripShare {
  id: string;
  trip_id: string;
  share_token: string;
  is_active: boolean;
  views_count: number;
  created_at: string;
  expires_at?: string;
}

export interface WeatherInfo {
  destination: string;
  temperature: number;
  temp_unit: string;
  condition: string;
  description: string;
  humidity: number;
  wind_speed: string;
  icon: string;
  forecast: Array<{
    day: string;
    temp: number;
    condition: string;
    icon: string;
  }>;
}

export interface MarkedPlace {
  id: string;
  name: string;
  category: string;
  destination?: string;
  latitude: number;
  longitude: number;
  image?: string;
  place_id?: string;
  photos?: PlacePhoto[];
  gallery?: string[];
  authorAttributions?: AuthorAttribution[];
  address?: string;
  rating?: number;
  estimated_cost?: number;
  notes?: string;
  is_custom?: boolean;
}

export interface CreateTripInput {
  destination: string;
  start_date: string;
  end_date: string;
  travelers: number;
  traveler_type: 'Solo' | 'Couple' | 'Family' | 'Friends' | 'Business';
  budget: number;
  currency?: string;
  budget_tier?: BudgetTier;
  travel_style: TravelStyle[];
  food_preferences: FoodPreference[];
  accommodation: AccommodationType;
  transportation: TransportationType;
  interests: Interest[];
  special_notes?: string;
  marked_places?: MarkedPlace[];
}

export interface GroundingSource {
  title?: string;
  uri: string;
  sourceType?: 'maps' | 'web' | 'review';
  snippet?: string;
}

export interface StructuredAIAction {
  type:
    | 'ADD_ACTIVITY'
    | 'REMOVE_ACTIVITY'
    | 'REPLACE_ACTIVITY'
    | 'MOVE_ACTIVITY'
    | 'REGENERATE_DAY'
    | 'OPTIMIZE_ROUTE'
    | 'OPTIMIZE_BUDGET'
    | 'ADD_RESTAURANT'
    | 'ADD_HOTEL'
    | 'FIND_NEARBY'
    | 'CREATE_PACKING_LIST'
    | 'UPDATE_TRIP';
  label?: string;
  dayNumber?: number;
  activityId?: string;
  replacement?: Partial<Activity>;
  payload?: any;
  previewSummary?: string;
  whyRecommended?: string;
  savingsAmount?: number;
  timeSavedMinutes?: number;
}

export interface AIChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  groundingSources?: GroundingSource[];
  structuredAction?: StructuredAIAction;
  suggestedActions?: Array<{
    type:
      | 'ADD_ACTIVITY'
      | 'REMOVE_ACTIVITY'
      | 'UPDATE_ACTIVITY'
      | 'REGENERATE_DAY'
      | 'OPTIMIZE_BUDGET'
      | 'CHANGE_RESTAURANT'
      | 'CHANGE_HOTEL';
    label: string;
    payload?: any;
  }>;
}

export interface Reservation {
  id: string;
  trip_id: string;
  category: 'Flight' | 'Hotel' | 'Transport' | 'Experience' | 'Restaurant';
  title: string;
  provider: string;
  date: string;
  time?: string;
  location: string;
  confirmation_number: string;
  cost?: number;
  currency?: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  notes?: string;
  attachments?: Array<{ name: string; url: string; size?: string }>;
}

export interface TripDocument {
  id: string;
  trip_id: string;
  title: string;
  type: 'ticket' | 'booking' | 'hotel' | 'id' | 'note';
  reference_number?: string;
  notes?: string;
  is_private: boolean;
  file_name?: string;
  date_added: string;
}

export interface Collaborator {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'owner' | 'editor' | 'viewer';
}

export interface GroupExpense {
  id: string;
  trip_id: string;
  title: string;
  amount: number;
  paid_by_person: string;
  split_between: string[];
  category: string;
  date: string;
}

export interface TripPoll {
  id: string;
  trip_id: string;
  question: string;
  category: 'restaurant' | 'activity' | 'general';
  options: Array<{
    id: string;
    text: string;
    description?: string;
    votes: string[]; // user names
  }>;
  created_at: string;
}

export interface PackingItem {
  id: string;
  category: 'Essentials' | 'Clothing' | 'Toiletries' | 'Gear' | 'Documents' | 'Destination';
  name: string;
  packed: boolean;
  reason?: string;
}

export interface JourneyPulse {
  budgetStatus: 'on_track' | 'warning' | 'exceeded';
  scheduleStatus: 'balanced' | 'tight' | 'relaxed';
  routeStatus: 'optimized' | 'needs_optimization';
  weatherStatus: 'good' | 'caution' | 'conflict';
  activitiesStatus: 'personalized' | 'generic';
  overallScore: number;
  activeAlert?: {
    title: string;
    message: string;
    actionLabel: string;
    actionType: string;
    dayNumber?: number;
  };
}

export interface JourneyDiagnosis {
  score: number;
  summary: string;
  routeNotice: string;
  budgetSavingNotice: string;
  budgetSavingAmount: number;
  weatherAlert: string;
  balanceFeedback: string;
  personalizationMatchPct: number;
  radarScores: {
    adventure: number;
    culture: number;
    food: number;
    relaxation: number;
    travelPace: number;
  };
  suggestions: Array<{
    id: string;
    title: string;
    reason: string;
    changeDescription: string;
    category: 'route' | 'budget' | 'weather' | 'balance' | 'personalization';
    dayNumber?: number;
    savingsAmount?: number;
    timeSavedMinutes?: number;
    beforeText?: string;
    afterText?: string;
  }>;
}

export interface WhatIfScenario {
  budget: number;
  duration: number;
  travelStyle: TravelStyle[];
  travelers: number;
  diningTier: 'Budget' | 'Moderate' | 'Fine Dining';
  compareResult: {
    currentPlan: {
      cost: number;
      days: number;
      activitiesCount: number;
      travelTimeHours: string;
      pace: string;
      highlights: string[];
    };
    newPlan: {
      cost: number;
      days: number;
      activitiesCount: number;
      travelTimeHours: string;
      pace: string;
      highlights: string[];
      tradeOffReason: string;
    };
  };
}

export interface TravelDNA {
  natureLover: number;
  foodExplorer: number;
  adventure: number;
  culture: number;
  luxury: number;
  nightlife: number;
  topArchetype: string;
}

export interface DestinationInfo {
  name: string;
  country: string;
  region: string;
  tagline: string;
  description: string;
  image: string;
  place_id?: string;
  photos?: PlacePhoto[];
  gallery?: string[];
  authorAttributions?: AuthorAttribution[];
  popular_for: string[];
  best_season: string;
  avg_budget_per_day: number;
  latitude: number;
  longitude: number;
  highlighted_tags: string[];
  currency?: string;
  climate?: string;
  emergency_contacts?: { police: string; ambulance: string; tourist_helpline: string };
  local_etiquette?: string[];
  must_try_foods?: string[];
}

export interface PersonalizedPlace extends Place {
  matchScore?: number;
  matchReasons?: string[];
  isRecommended?: boolean;
}

export interface ExpenseItem {
  id: string;
  category: string;
  amount: number;
  description: string;
  timestamp: string;
  activity_id?: string;
}

export interface LiveTripState {
  activeDayNumber: number;
  completedActivityIds: string[];
  skippedActivityIds: string[];
  liveNotes: Record<string, string>;
  expensesLog: ExpenseItem[];
  currentMode: 'planning' | 'live' | 'completed';
}

export interface TripStorySlide {
  id: string;
  dayNumber: number;
  title: string;
  location: string;
  image: string;
  highlights: string[];
  vibe: string;
  budgetSpent?: number;
}

export interface TravelBadge {
  id: string;
  name: string;
  description: string;
  iconName: string;
  category: 'exploration' | 'budget' | 'culture' | 'food' | 'social';
  unlocked: boolean;
  progress: number;
  maxProgress: number;
  unlockedAt?: string;
}

export interface DailyBriefing {
  date: string;
  dayNumber: number;
  greeting: string;
  destination: string;
  weatherSummary: string;
  temperature: string;
  topHighlight: string;
  packingTip: string;
  walkingTimeMinutes: number;
  estimatedExpense: number;
  alertNotice?: string;
  goldenHourTime?: string;
}

// Community System Types
export type CommunityPostType = 'story' | 'trip' | 'tip' | 'food' | 'review' | 'warning' | 'experience';
export type CommunityPostVisibility = 'public' | 'private';

export interface CommunityPost {
  id: string;
  author_id: string;
  author_name: string;
  author_image?: string;
  title: string;
  content: string;
  destination: string;
  trip_id?: string;
  trip_snapshot?: {
    id?: string;
    title: string;
    destination: string;
    duration: number;
    total_budget: number;
    currency: string;
    traveler_type?: string;
    cover_image?: string;
    highlights?: string[];
    itinerary_summary?: string;
    tags?: string[];
  };
  images: string[];
  tags: string[];
  post_type: CommunityPostType;
  visibility: CommunityPostVisibility;
  likes_count: number;
  comments_count: number;
  saves_count: number;
  views_count?: number;
  created_at: string;
  updated_at: string;
  // Dynamic client flags
  is_liked_by_user?: boolean;
  is_saved_by_user?: boolean;
}

export interface CommunityComment {
  id: string;
  post_id: string;
  user_id: string;
  user_name: string;
  user_image?: string;
  content: string;
  parent_comment_id?: string;
  created_at: string;
  updated_at?: string;
  replies?: CommunityComment[];
}

export interface CommunityLike {
  id: string;
  post_id: string;
  user_id: string;
  user_name?: string;
  created_at: string;
}

export interface SavedCommunityPost {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
}

export interface UserFollow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
}

export type CommunityNotificationType = 'like' | 'comment' | 'reply' | 'follow' | 'mention';

export interface CommunityNotification {
  id: string;
  recipient_id: string;
  actor_id: string;
  actor_name: string;
  actor_image?: string;
  type: CommunityNotificationType;
  post_id?: string;
  post_title?: string;
  comment_id?: string;
  comment_text?: string;
  is_read: boolean;
  created_at: string;
}

export interface CommunityReport {
  id: string;
  post_id: string;
  reporter_id: string;
  reporter_name?: string;
  reason: 'spam' | 'abuse' | 'inappropriate' | 'misleading' | 'harassment' | 'other';
  details?: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  created_at: string;
}

export interface PublicUserProfile {
  id: string;
  name: string;
  profile_image?: string;
  bio?: string;
  travel_style?: string[];
  preferred_destinations?: string[];
  created_at: string;
  posts_count: number;
  trips_count: number;
  followers_count: number;
  following_count: number;
  is_following?: boolean;
}

export type DocumentCategory = 'ticket' | 'voucher' | 'passport' | 'photo' | 'document' | 'other';

export interface UserStoredFile {
  id: string;
  user_id: string;
  name: string;
  size: string;
  size_bytes: number;
  type: string;
  category: DocumentCategory;
  data_url: string;
  storage_path?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export * from './indiaStates';
