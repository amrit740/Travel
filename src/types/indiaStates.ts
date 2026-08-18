export interface StateAttraction {
  id: string;
  name: string;
  description: string;
  location: string;
  category: string;
  visit_duration: string;
  best_time: string;
  latitude: number;
  longitude: number;
  accessibility: 'Verified' | 'Available' | 'Unknown';
  official_info_hint?: string;
}

export interface StateDestination {
  id: string;
  name: string;
  city_district: string;
  description: string;
  type: string; // e.g. 'Historical', 'Nature', 'Beach', 'Mountain', 'Wildlife', 'Spiritual', 'Adventure', 'Cultural', 'Heritage', 'Food'
  why_visit: string;
  recommended_duration: string;
  best_time: string;
  budget_category: 'Budget' | 'Mid-range' | 'Premium';
  family_friendly: boolean;
  solo_friendly: boolean;
  couple_friendly: boolean;
  senior_friendly: boolean;
  accessibility: 'Verified' | 'Available' | 'Unknown';
  latitude: number;
  longitude: number;
  image: string;
  attractions: StateAttraction[];
}

export interface StateFoodItem {
  name: string;
  description: string;
  is_veg: boolean;
  region: string;
  category: 'Breakfast' | 'Main Course' | 'Snack' | 'Dessert' | 'Beverage';
  search_query?: string;
}

export interface StateFestival {
  name: string;
  description: string;
  month_season: string;
}

export interface StateCulturalTradition {
  name: string;
  description: string;
}

export interface StateArtForm {
  name: string;
  description: string;
  type: 'Dance' | 'Music' | 'Art' | 'Handicraft' | 'Theater';
}

export interface StateCulture {
  festivals: StateFestival[];
  traditions: StateCulturalTradition[];
  art_forms: StateArtForm[];
  local_experiences: Array<{ title: string; description: string }>;
}

export interface StateNatureAdventure {
  national_parks: Array<{ name: string; type: string; description: string; best_time: string; latitude?: number; longitude?: number }>;
  waterfalls_and_lakes: Array<{ name: string; type: string; description: string; latitude?: number; longitude?: number }>;
  scenic_spots_and_treks: Array<{ name: string; type: string; difficulty?: 'Easy' | 'Moderate' | 'Challenging'; description: string }>;
  adventure_activities: string[];
}

export interface StateBudgetTierDaily {
  min: number;
  max: number;
  label: string;
  accommodation_range: string;
  food_range: string;
  transport_range: string;
  activities_range: string;
}

export interface StateBudgetInfo {
  currency: string;
  budget_tier: StateBudgetTierDaily;
  mid_tier: StateBudgetTierDaily;
  premium_tier: StateBudgetTierDaily;
  budget_note: string;
}

export interface StateAirport {
  name: string;
  code: string;
  city: string;
  type: 'International' | 'Domestic';
}

export interface StateRailwayHub {
  name: string;
  code: string;
  city: string;
}

export interface StateTransportation {
  airports: StateAirport[];
  railway_hubs: StateRailwayHub[];
  highways: string[];
  local_transit: string;
}

export interface StateItineraryDayActivity {
  time: string;
  title: string;
  description: string;
  location: string;
  category: string;
  estimated_cost: number;
  latitude?: number;
  longitude?: number;
}

export interface StateItineraryDay {
  day_number: number;
  title: string;
  description: string;
  activities: StateItineraryDayActivity[];
}

export interface StateItineraryTemplate {
  id: string;
  title: string;
  duration_days: number;
  subtitle: string;
  travel_style: string[];
  ideal_for: string;
  estimated_budget_inr: number;
  highlights: string[];
  days: StateItineraryDay[];
}

export interface StateAccessibilityEco {
  wheelchair_access_overview: string;
  senior_friendly_rating: 'High' | 'Moderate' | 'Selective';
  walking_difficulty: 'Easy' | 'Moderate' | 'High';
  accessibility_tips: string[];
  public_transport_score: number; // 1-10
  walking_suitability: 'High' | 'Moderate' | 'Low';
  nature_conservation_info: string;
  responsible_tourism_tips: string[];
}

export interface IndiaState {
  id: string; // e.g. 'andhra-pradesh'
  name: string;
  capital: string;
  description: string;
  best_known_for: string[];
  popular_themes: string[];
  ideal_duration: string;
  best_seasons: string;
  recommended_months: string[];
  major_languages: string[];
  currency: string;
  timezone: string;
  cover_image: string;
  map_center: {
    latitude: number;
    longitude: number;
    zoom: number;
  };
  destinations: StateDestination[];
  food: StateFoodItem[];
  culture: StateCulture;
  nature_adventure: StateNatureAdventure;
  budget_info: StateBudgetInfo;
  transportation: StateTransportation;
  sample_itineraries: StateItineraryTemplate[];
  accessibility_eco: StateAccessibilityEco;
}
