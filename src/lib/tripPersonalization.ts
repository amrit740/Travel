import {
  Trip,
  Place,
  PersonalizedPlace,
  DestinationInfo,
  DailyBriefing,
  TravelBadge,
  TripStorySlide,
  Activity,
  LiveTripState,
  JourneyPulse,
  JourneyDiagnosis,
  WhatIfScenario,
  PackingItem,
  TravelDNA,
} from '../types';
import { getStateByName, getStateById, ALL_INDIA_STATES } from '../data/indiaStates';
import { searchIndianLocations, isIndianLocation, CORE_INDIAN_DESTINATIONS } from './indiaLocationService';

// Rich Destination Knowledge Base
export const DESTINATIONS_KNOWLEDGE: Record<string, DestinationInfo> = {
  Goa: {
    name: 'Goa',
    country: 'India',
    region: 'South Asia / Coastal West India',
    tagline: 'Sun-drenched beaches, Portuguese heritage & coastal feasts',
    description:
      'Famous for its golden sand coastline, 16th-century colonial churches, bustling beach shacks, spice plantations, and vibrant sunset nightlife.',
    image:
      'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80',
    popular_for: ['Beaches & Watersports', 'Portuguese Architecture', 'Seafood Curries', 'Sunset Cruises', 'Night Markets'],
    best_season: 'November to March (Pleasant coastal breezes, clear skies)',
    avg_budget_per_day: 3500,
    latitude: 15.2993,
    longitude: 74.124,
    highlighted_tags: ['Beach', 'Heritage', 'Nightlife', 'Relaxation', 'Culinary'],
    currency: 'INR (₹)',
    climate: 'Tropical coastal, 28°C - 32°C with balmy sea winds',
    emergency_contacts: { police: '100 / 112', ambulance: '108', tourist_helpline: '1363' },
    local_etiquette: [
      'Dress respectfully when visiting churches and temples (cover shoulders and knees)',
      'Respect beach safety flags and avoid swimming after dark',
      'Bargain politely at Saturday night and flea markets',
    ],
    must_try_foods: ['Goan Fish Curry & Rice', 'Pork Vindaloo', 'Bebinca Layer Cake', 'Prawn Balchão', 'Feni & Kokum Soda'],
  },
  Kolkata: {
    name: 'Kolkata',
    country: 'India',
    region: 'Eastern India',
    tagline: 'The Cultural Heart of India & City of Joy',
    description:
      'A city rich in intellectual heritage, colonial grandeur, literary cafes, vintage yellow taxis, and unmatched street food delicacies.',
    image:
      'https://images.unsplash.com/photo-1558431382-27e303142255?auto=format&fit=crop&w=1200&q=80',
    popular_for: ['Victoria Memorial', 'Howrah Bridge', 'Kolkata Kathi Rolls', 'Durga Puja Art', 'College Street Bookshops'],
    best_season: 'October to February (Cool evenings and festival seasons)',
    avg_budget_per_day: 2800,
    latitude: 22.5726,
    longitude: 88.3639,
    highlighted_tags: ['Culture', 'History', 'Street Food', 'Art', 'Literature'],
    currency: 'INR (₹)',
    climate: 'Subtropical, 22°C - 28°C in winter, pleasant walks',
    emergency_contacts: { police: '100 / 112', ambulance: '102', tourist_helpline: '1363' },
    local_etiquette: [
      'Trams and yellow cabs prefer cash or UPI QR scans',
      'Remove footwear at sacred ghats and heritage temples',
      'Savor sweets like Rosogolla fresh from authentic mishti shops',
    ],
    must_try_foods: ['Kolkata Mutton Biryani', 'Kathi Rolls at Nizam', 'Mishti Doi & Sandesh', 'Puchka at Vivekananda Park', 'Ilish Paturi'],
  },
  Darjeeling: {
    name: 'Darjeeling',
    country: 'India',
    region: 'Eastern Himalayas',
    tagline: 'Queen of the Hills, Himalayan Sunrises & World-Class Tea',
    description:
      'Nestled amidst rolling tea estates with panoramic vistas of Mt. Kanchenjunga, charming toy trains, and peaceful monasteries.',
    image:
      'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80',
    popular_for: ['Tiger Hill Sunrise', 'Darjeeling Himalayan Railway', 'Happy Valley Tea Estate', 'Tibetan Monasteries', 'Mall Road Strolls'],
    best_season: 'March to May & October to December (Clear mountain views)',
    avg_budget_per_day: 3200,
    latitude: 27.041,
    longitude: 88.2663,
    highlighted_tags: ['Mountains', 'Tea Gardens', 'Nature', 'Photography', 'Peaceful'],
    currency: 'INR (₹)',
    climate: 'Alpine temperate, 10°C - 18°C (Layered jackets recommended)',
    emergency_contacts: { police: '100', ambulance: '102', tourist_helpline: '1363' },
    local_etiquette: [
      'Start early (04:00 AM) for Tiger Hill sunrise clear views',
      'Walk clockwise around Buddhist stupas and prayer wheels',
      'Support local tea plucking cooperatives and artisan shops',
    ],
    must_try_foods: ['Steamed Pork & Veg Momos', 'Thukpa Noodle Soup', 'First Flush Darjeeling Tea', 'Churpee Yak Cheese', 'Alu Dum with Tingmo'],
  },
  Jaipur: {
    name: 'Jaipur',
    country: 'India',
    region: 'Rajasthan / Golden Triangle',
    tagline: 'The Pink City of Royal Fortresses & Vibrant Bazaars',
    description:
      'Marvel at terracotta-pink palaces, hill fortresses like Amber and Nahargarh, astronomical observatories, and artisan gemstone craftsmanship.',
    image:
      'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1200&q=80',
    popular_for: ['Amber Palace & Fort', 'Hawa Mahal', 'City Palace', 'Block Print Textiles', 'Chokhi Dhani Royal Dining'],
    best_season: 'October to March (Crisp sunny days & cool desert nights)',
    avg_budget_per_day: 4000,
    latitude: 26.9124,
    longitude: 75.7873,
    highlighted_tags: ['Royal Heritage', 'Forts', 'Shopping', 'Architecture', 'Culture'],
    currency: 'INR (₹)',
    climate: 'Semi-arid, 20°C - 26°C daytime with cooler evenings',
    emergency_contacts: { police: '100', ambulance: '108', tourist_helpline: '1363' },
    local_etiquette: [
      'Early morning or late afternoon is best to avoid midday sun at forts',
      'Always ask before photographing local artisans in Johari Bazaar',
      'Opt for certified Rajasthan Tourism guides at monuments',
    ],
    must_try_foods: ['Dal Baati Churma with Ghee', 'Laal Maas', 'Ghewar Sweet Cake', 'Pyaaz Kachori at Rawat', 'Masala Chai in Clay Cups'],
  },
  Kerala: {
    name: 'Kerala',
    country: 'India',
    region: 'South India / Malabar Coast',
    tagline: 'God’s Own Country – Serene Backwaters & Misty Hills',
    description:
      'Glide on traditional houseboats in Alleppey backwaters, explore spice hills of Munnar, and rejuvenate with holistic Ayurvedic therapies.',
    image:
      'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80',
    popular_for: ['Alleppey Houseboat Stays', 'Munnar Tea Plantations', 'Kathakali Dance', 'Ayurvedic Spas', 'Fort Kochi Art & Chinese Nets'],
    best_season: 'September to March (Lush green landscapes post-monsoon)',
    avg_budget_per_day: 3800,
    latitude: 9.9312,
    longitude: 76.2673,
    highlighted_tags: ['Backwaters', 'Ayurveda', 'Nature', 'Spices', 'Relaxation'],
    currency: 'INR (₹)',
    climate: 'Tropical humid, 24°C - 30°C with soothing palm breezes',
    emergency_contacts: { police: '100', ambulance: '108', tourist_helpline: '1363' },
    local_etiquette: [
      'Houseboats anchor by 5:30 PM to preserve local fishermen channels',
      'Remove footwear before entering traditional wooden nalukettu homes',
      'Carry eco-friendly water bottles to preserve backwater ecology',
    ],
    must_try_foods: ['Kerala Sadya on Banana Leaf', 'Karimeen Pollichathu', 'Appam with Stew', 'Malabar Biryani', 'Tender Coconut Water'],
  },
  Agra: {
    name: 'Agra',
    country: 'India',
    region: 'Uttar Pradesh / Golden Triangle',
    tagline: 'Timeless Mughal Grandeur, Marble Poetry & UNESCO Wonders',
    description:
      'Home to the iconic Taj Mahal, red sandstone Agra Fort, and royal Fatehpur Sikri. Renowned for marble inlay craftsmanship, Petha confections, and rich Mughal heritage.',
    image:
      'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80',
    popular_for: ['Taj Mahal Sunrise', 'Agra Fort', 'Fatehpur Sikri', 'Pietra Dura Marble Art', 'Petha & Mughlai Cuisine'],
    best_season: 'October to March (Pleasant sunny days & cool evenings)',
    avg_budget_per_day: 3200,
    latitude: 27.1751,
    longitude: 78.0421,
    highlighted_tags: ['Mughal Heritage', 'Architecture', 'UNESCO Wonders', 'History', 'Photography'],
    currency: 'INR (₹)',
    climate: 'Semi-arid, 18°C - 26°C in winter months',
    emergency_contacts: { police: '112 / 100', ambulance: '108', tourist_helpline: '1363' },
    local_etiquette: [
      'Taj Mahal is closed on Fridays; visit at sunrise for serene lighting',
      'Shoe covers or barefoot walking is required on the main marble mausoleum plinth',
      'Choose licensed government approved tour guides inside monuments',
    ],
    must_try_foods: ['Agra Petha (Angoori & Kesar)', 'Bedmi Puri with Aloo Sabzi', 'Mughlai Chicken & Paneer Korma', 'Dalmoth Savory Namkeen', 'Jalebi at Sadar Bazaar'],
  },
  Manali: {
    name: 'Manali',
    country: 'India',
    region: 'Himachal Pradesh / Western Himalayas',
    tagline: 'Snow-Capped Himalayan Summits, Pine Valleys & High Passes',
    description:
      'High-altitude retreat nestled in the Beas River valley, famed for Solang Valley adventure sports, Rohtang Pass glaciers, ancient cedar temples, and Old Manali cafes.',
    image:
      'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80',
    popular_for: ['Solang Valley Adventures', 'Rohtang Pass & Atal Tunnel', 'Hadimba Cedar Temple', 'Old Manali Cafes', 'Paragliding & Rafting'],
    best_season: 'October to June (Snow sports in winter, pleasant summer weather)',
    avg_budget_per_day: 3500,
    latitude: 32.2432,
    longitude: 77.1892,
    highlighted_tags: ['Snow Mountains', 'Adventure', 'Pine Forests', 'Cafes', 'Trekking'],
    currency: 'INR (₹)',
    climate: 'Alpine, -2°C to 15°C in winter, 15°C - 25°C in summer',
    emergency_contacts: { police: '112 / 100', ambulance: '108', tourist_helpline: '1363' },
    local_etiquette: [
      'Check weather advisories and Rohtang permits before high altitude drives',
      'Wear warm thermal layers and waterproof footwear for snow excursions',
      'Respect the tranquility of ancient cedar forests around Hadimba Temple',
    ],
    must_try_foods: ['Himachali Siddu with Ghee', 'Trout Fish Fry', 'Babru Bread', 'Kullu Dham Thali', 'Hot Apple Cider & Tibetan Momos'],
  },
  Varanasi: {
    name: 'Varanasi',
    country: 'India',
    region: 'Northern India / Uttar Pradesh',
    tagline: 'The Spiritual Capital of India on the Sacred River Ganges',
    description:
      'One of the oldest continuously inhabited cities on Earth, renowned for sacred river ghats, mesmerizing Ganga Aarti, and ancient silk weaving.',
    image:
      'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1200&q=80',
    popular_for: ['Dashashwamedh Ghat Evening Aarti', 'Dawn Ganges Boat Ride', 'Kashi Vishwanath Temple', 'Banarasi Silk Sarees', 'Sarnath Buddhist Stupa'],
    best_season: 'October to March (Crisp morning boat rides & cool breezes)',
    avg_budget_per_day: 2500,
    latitude: 25.3176,
    longitude: 82.9739,
    highlighted_tags: ['Spiritual', 'Ancient History', 'Ghats & River', 'Culture', 'Photography'],
    currency: 'INR (₹)',
    climate: 'Subtropical, 18°C - 26°C with cool dawn fog',
    emergency_contacts: { police: '100 / 112', ambulance: '108', tourist_helpline: '1363' },
    local_etiquette: [
      'Experience Ganga Aarti from a licensed rowing boat on the river',
      'Be respectful with cameras around Manikarnika and Harishchandra Ghats',
      'Explore the ancient narrow alleyways (galis) on foot with comfortable shoes',
    ],
    must_try_foods: ['Banarasi Paan', 'Kachori Sabzi at Ram Bhandar', 'Thandai with Malai', 'Tamatar Chaat', 'Malaiyo Froth Sweet'],
  },
};

// Dynamic generator for destinations across India
export const getDestinationMetadata = (destName: string): DestinationInfo => {
  const normalized = destName.trim();
  const foundKey = Object.keys(DESTINATIONS_KNOWLEDGE).find(
    (k) => k.toLowerCase() === normalized.toLowerCase()
  );
  if (foundKey && DESTINATIONS_KNOWLEDGE[foundKey]) {
    return DESTINATIONS_KNOWLEDGE[foundKey];
  }

  // Check comprehensive India 28 states dataset
  const matchedState = getStateByName(normalized) || getStateById(normalized);
  if (matchedState) {
    return {
      name: matchedState.name,
      country: 'India',
      region: `${matchedState.capital} (Capital) / ${matchedState.name}, India`,
      tagline: matchedState.best_known_for[0] || `Explore the incredible wonders of ${matchedState.name}`,
      description: matchedState.description,
      image: matchedState.cover_image,
      popular_for: matchedState.best_known_for.slice(0, 5),
      best_season: matchedState.best_seasons,
      avg_budget_per_day: (matchedState.budget_info.budget_tier.min + matchedState.budget_info.mid_tier.max) / 2 || 3500,
      latitude: matchedState.map_center.latitude,
      longitude: matchedState.map_center.longitude,
      highlighted_tags: matchedState.popular_themes,
      currency: matchedState.currency || 'INR (₹)',
      climate: `Pleasant during ${matchedState.best_seasons}`,
      emergency_contacts: { police: '112 / 100', ambulance: '108', tourist_helpline: '1363' },
      local_etiquette: matchedState.accessibility_eco.responsible_tourism_tips || [
        'Respect local cultural customs and shrines',
        'Dress modestly when entering religious sites',
        'Support local artisans and eco-friendly practices',
      ],
      must_try_foods: matchedState.food.map((f) => f.name).slice(0, 5),
    };
  }

  // Check Indian location search engine
  const searchedIndian = searchIndianLocations(normalized);
  if (searchedIndian.length > 0) {
    const loc = searchedIndian[0];
    return {
      name: loc.name,
      country: 'India',
      region: `${loc.district_or_city}, ${loc.state}, India`,
      tagline: `Discover the breathtaking culture, landscapes & cuisine of ${loc.name}`,
      description: loc.description,
      image: loc.image,
      popular_for: loc.activities.slice(0, 5),
      best_season: loc.best_time_to_visit,
      avg_budget_per_day: loc.budget_category === 'Budget' ? 2400 : loc.budget_category === 'Premium' ? 6500 : 3800,
      latitude: loc.latitude,
      longitude: loc.longitude,
      highlighted_tags: loc.travel_themes,
      currency: 'INR (₹)',
      climate: 'Pleasant Indian climate for sightseeing',
      emergency_contacts: { police: '112 / 100', ambulance: '108', tourist_helpline: '1363' },
      local_etiquette: [
        'Respect local heritage customs, sacred dress codes & temple traditions',
        'Digital payments (UPI) are widely accepted across India',
        'Keep small cash bills for local autos, rickshaws & street food',
      ],
      must_try_foods: ['Authentic Regional Thali', 'Local Street Food Specialties', 'Fresh Chai & Regional Sweets'],
    };
  }

  // Dynamic Indian destination synthesis fallback
  return {
    name: normalized || 'Explore India',
    country: 'India',
    region: `${normalized}, India`,
    tagline: `Experience authentic landmarks, regional culture & cuisine of ${normalized}`,
    description: `Discover handpicked attractions, culinary hotspots, and unforgettable experiences curated specifically for your journey across ${normalized}, India.`,
    image:
      'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80',
    popular_for: ['Historic Heritage', 'Local Food Trails', 'Scenic Viewpoints', 'Bazaar Shopping', 'Cultural Tours'],
    best_season: 'October to March (Pleasant weather across India)',
    avg_budget_per_day: 3500,
    latitude: 22.5937,
    longitude: 78.9629,
    highlighted_tags: ['Heritage', 'Culture', 'Culinary', 'Sightseeing'],
    currency: 'INR (₹)',
    climate: 'Pleasant and sunny for exploration',
    emergency_contacts: { police: '112 / 100', ambulance: '108', tourist_helpline: '1363' },
    local_etiquette: [
      'Carry local INR currency or UPI apps for street vendors and local transit',
      'Dress comfortably with walking footwear for forts, temples and trails',
      'Respect sacred sanctums, local customs and heritage monument guidelines',
    ],
    must_try_foods: ['Regional Signature Thali', 'Fresh Street Food Delicacies', 'Traditional Sweets & Masala Chai'],
  };
};

/**
 * Intelligent Recommendation Scorer:
 * Computes a compatibility percentage (0 - 100%) and reasons based on the user's trip preferences.
 */
export const scorePlaceForTrip = (place: Place, trip: Trip | null): PersonalizedPlace => {
  if (!trip) {
    return { ...place, matchScore: 85, matchReasons: ['Popular top-rated spot in destination'], isRecommended: true };
  }

  let score = 70; // Baseline
  const reasons: string[] = [];

  // Match Travel Styles
  const styleKeywords: Record<string, string[]> = {
    Adventure: ['adventure', 'trek', 'hike', 'sports', 'safari', 'outdoor', 'water', 'cliff'],
    Relaxation: ['beach', 'spa', 'resort', 'relax', 'quiet', 'sunset', 'gardens', 'peaceful'],
    Cultural: ['culture', 'temple', 'museum', 'heritage', 'art', 'historic', 'monument', 'palace'],
    Historical: ['historic', 'palace', 'monument', 'fort', 'ancient', 'heritage', 'ruins'],
    'Food & Cuisine': ['food', 'restaurant', 'dining', 'bistro', 'cafe', 'culinary', 'street food', 'seafood'],
    'Food & Culinary': ['food', 'restaurant', 'dining', 'bistro', 'cafe', 'culinary', 'street food', 'seafood'],
    Shopping: ['market', 'shopping', 'bazaar', 'textile', 'handicraft', 'mall', 'boutique'],
    Nightlife: ['nightlife', 'bar', 'club', 'lounge', 'pub', 'music', 'dj'],
    Photography: ['viewpoint', 'scenic', 'sunset', 'sunrise', 'architecture', 'monument', 'panoramic'],
    Spiritual: ['temple', 'ghat', 'meditation', 'ashram', 'church', 'prayer', 'sacred'],
    Family: ['family', 'park', 'zoo', 'aquarium', 'museum', 'garden', 'cruise'],
    'Family-friendly': ['family', 'park', 'zoo', 'aquarium', 'museum', 'garden', 'cruise'],
    Luxury: ['fine dining', 'resort', 'luxury', 'boutique', 'palace', 'exclusive', 'vip'],
    Backpacking: ['hostel', 'street food', 'budget', 'walk', 'free', 'trail'],
  };

  const textToScan = `${place.name} ${place.description} ${place.category} ${place.sub_category || ''} ${(place.tags || []).join(' ')}`.toLowerCase();

  // Check travel style alignment
  (trip.travel_style || []).forEach((style) => {
    const keywords = styleKeywords[style] || [style.toLowerCase()];
    const matches = keywords.some((kw) => textToScan.includes(kw.toLowerCase()));
    if (matches) {
      score += 6;
      reasons.push(`Matches your ${style} travel style`);
    }
  });

  // Check category and interests alignment
  (trip.interests || []).forEach((interest) => {
    if (textToScan.includes(interest.toLowerCase())) {
      score += 5;
      reasons.push(`Tailored for your interest in ${interest}`);
    }
  });

  // Check Food Preferences if it's a restaurant
  if (place.category === 'Restaurant' || textToScan.includes('food')) {
    (trip.food_preferences || []).forEach((pref) => {
      if (
        pref === 'Vegetarian' &&
        (textToScan.includes('veg') || textToScan.includes('pure veg') || textToScan.includes('thali') || textToScan.includes('salad'))
      ) {
        score += 8;
        reasons.push('Excellent vegetarian selections available');
      } else if (
        pref === 'Street Food' &&
        (textToScan.includes('street food') || textToScan.includes('snack') || textToScan.includes('chaat') || textToScan.includes('market'))
      ) {
        score += 8;
        reasons.push('Authentic local street food experience');
      } else if (
        pref === 'Fine Dining' &&
        (place.price_level === '$$$' || place.price_level === '$$$$')
      ) {
        score += 8;
        reasons.push('Premium fine dining ambiance');
      } else if (
        pref === 'Street Food'
      ) {
        score += 7;
        reasons.push('Serves acclaimed regional authentic street food');
      }
    });
  }

  // Budget Alignment
  const perDayBudget = trip.total_budget / Math.max(1, trip.duration);
  if (perDayBudget < 3000 && (place.price_level === '$' || (place.estimated_cost && place.estimated_cost < 500))) {
    score += 5;
    reasons.push('High value, budget-friendly spot');
  } else if (perDayBudget >= 8000 && (place.price_level === '$$$' || place.price_level === '$$$$')) {
    score += 5;
    reasons.push('Premium experience matched to your comfort budget');
  }

  // High rating boost
  if (place.rating >= 4.7) {
    score += 4;
    reasons.push(`Top-rated traveler favorite (${place.rating}★)`);
  }

  // Cap score between 75 and 99
  const finalScore = Math.min(99, Math.max(75, score));
  const dedupedReasons = Array.from(new Set(reasons)).slice(0, 3);
  if (dedupedReasons.length === 0) {
    dedupedReasons.push(`Highly recommended for your ${trip.destination} itinerary`);
  }

  return {
    ...place,
    matchScore: finalScore,
    matchReasons: dedupedReasons,
    isRecommended: finalScore >= 85,
  };
};

/**
 * Generate Smart Daily Briefing
 */
export const generateDailyBriefing = (trip: Trip, dayNumber: number = 1): DailyBriefing => {
  const currentDay = trip.itinerary_days?.find((d) => d.day_number === dayNumber) || trip.itinerary_days?.[0];
  const destMeta = getDestinationMetadata(trip.destination);
  const acts = currentDay?.activities || [];

  const totalCost = acts.reduce((sum, a) => sum + (a.estimated_cost || 0), 0);
  const topHighlight = acts.length > 0 ? acts[0].name : `${destMeta.name} Exploration`;
  const walkingMinutes = Math.min(180, Math.max(30, acts.length * 28));

  // Dynamic alerts
  let alertNotice: string | undefined;
  if (acts.some((a) => a.category === 'Food & Dining')) {
    alertNotice = `Popular dining spots in ${trip.destination} fill quickly in the evening. Head over by 07:30 PM!`;
  } else if (acts.some((a) => a.category === 'Sightseeing' || a.category === 'Culture & History')) {
    alertNotice = `Carry plenty of water and sun protection for daytime outdoor visits in ${trip.destination}.`;
  }

  return {
    date: currentDay?.date || new Date().toISOString().split('T')[0],
    dayNumber,
    greeting: `Good morning! Welcome to Day ${dayNumber} in ${trip.destination}`,
    destination: trip.destination,
    weatherSummary: 'Sunny with pleasant morning breeze, ideal for exploration',
    temperature: '27°C / 81°F',
    topHighlight,
    packingTip:
      trip.travel_style?.includes('Adventure') || trip.travel_style?.includes('Cultural')
        ? 'Wear comfortable walking shoes, carry a light scarf for monuments, and keep hydration handy.'
        : 'Casual breathable cottons, sunglasses, and a power bank for photography.',
    walkingTimeMinutes: walkingMinutes,
    estimatedExpense: totalCost || Math.round(destMeta.avg_budget_per_day),
    alertNotice,
    goldenHourTime: '05:40 PM',
  };
};

/**
 * Gamification Badges Generator
 */
export const computeTravelBadges = (
  trip: Trip | null,
  liveState: LiveTripState | null
): TravelBadge[] => {
  const completedCount = liveState?.completedActivityIds?.length || 0;
  const totalActivities = trip?.itinerary_days?.reduce((sum, d) => sum + (d.activities?.length || 0), 0) || 1;
  const budgetRatio = trip?.total_budget ? (liveState?.expensesLog?.reduce((s, e) => s + e.amount, 0) || 0) / trip.total_budget : 0;
  const isFoodie = trip?.food_preferences && trip.food_preferences.length >= 2;
  const isExplorer = (trip?.itinerary_days?.length || 0) >= 3;

  return [
    {
      id: 'first-trip',
      name: 'Voyage Pathfinder',
      description: 'Planned your personalized travel itinerary with AI',
      iconName: 'Compass',
      category: 'exploration',
      unlocked: Boolean(trip),
      progress: trip ? 1 : 0,
      maxProgress: 1,
      unlockedAt: trip?.created_at,
    },
    {
      id: 'activity-master',
      name: 'Explorer on the Move',
      description: 'Completed 5 itinerary activities in live mode',
      iconName: 'CheckCircle2',
      category: 'exploration',
      unlocked: completedCount >= 5,
      progress: Math.min(5, completedCount),
      maxProgress: 5,
    },
    {
      id: 'culinary-trail',
      name: 'Gourmet Connoisseur',
      description: 'Set custom food preferences & added authentic local eateries',
      iconName: 'Utensils',
      category: 'food',
      unlocked: Boolean(isFoodie),
      progress: isFoodie ? 2 : 1,
      maxProgress: 2,
    },
    {
      id: 'budget-guardian',
      name: 'Budget Savvy Traveler',
      description: 'Tracked expenses and stayed strictly within your target budget',
      iconName: 'DollarSign',
      category: 'budget',
      unlocked: budgetRatio > 0 && budgetRatio <= 1.0,
      progress: budgetRatio > 0 ? (budgetRatio <= 1.0 ? 1 : 0) : 0,
      maxProgress: 1,
    },
    {
      id: 'grand-tour',
      name: 'Globe Trotter',
      description: 'Created a multi-day immersive expedition (3+ days)',
      iconName: 'Sparkles',
      category: 'culture',
      unlocked: Boolean(isExplorer),
      progress: Math.min(3, trip?.itinerary_days?.length || 0),
      maxProgress: 3,
    },
  ];
};

/**
 * Trip Story Highlights Generator for Story Mode
 */
export const generateTripStorySlides = (trip: Trip): TripStorySlide[] => {
  const days = trip.itinerary_days || [];
  if (days.length === 0) {
    return [
      {
        id: 'story-1',
        dayNumber: 1,
        title: `Journey to ${trip.destination}`,
        location: trip.destination,
        image: trip.cover_image || getDestinationMetadata(trip.destination).image,
        highlights: ['Embark on an unforgettable vacation', 'Explore world-renowned culture and scenery'],
        vibe: 'Excitement & Anticipation',
      },
    ];
  }

  return days.map((day) => {
    const mainAct = day.activities?.[0];
    const image = mainAct?.image || trip.cover_image || getDestinationMetadata(trip.destination).image;
    const highlights = (day.activities || []).slice(0, 3).map((a) => `${a.name} (${a.category})`);
    const dayCost = (day.activities || []).reduce((acc, a) => acc + (a.estimated_cost || 0), 0);

    return {
      id: `story-day-${day.day_number}`,
      dayNumber: day.day_number,
      title: day.title || `Day ${day.day_number} in ${trip.destination}`,
      location: mainAct?.location || trip.destination,
      image,
      highlights: highlights.length > 0 ? highlights : [`Discovering hidden treasures across ${trip.destination}`],
      vibe: day.day_number === 1 ? 'Arrival & First Impressions' : day.day_number === days.length ? 'Grand Finale & Memories' : 'Deep Cultural Immersion',
      budgetSpent: dayCost,
    };
  });
};

/**
 * Intelligent Journey Pulse Analyzer
 */
export const computeJourneyPulse = (trip: Trip | null): JourneyPulse => {
  if (!trip || !trip.itinerary_days || trip.itinerary_days.length === 0) {
    return {
      budgetStatus: 'on_track',
      scheduleStatus: 'balanced',
      routeStatus: 'optimized',
      weatherStatus: 'good',
      activitiesStatus: 'personalized',
      overallScore: 92,
      activeAlert: {
        title: 'Ready for Intelligent Optimization',
        message: 'Plan your itinerary to trigger live route & budget analysis.',
        actionLabel: 'Analyze Journey',
        actionType: 'ANALYZE',
      },
    };
  }

  const days = trip.itinerary_days;
  let hasHighTravelDay = false;
  let highTravelDayNumber = 3;
  let isBudgetWarning = false;

  const totalActs = days.reduce((sum, d) => sum + (d.activities?.length || 0), 0);
  const totalCost = (trip.estimated_cost || 0);
  if (totalCost > trip.total_budget * 0.95) {
    isBudgetWarning = true;
  }

  // Check for day 3 or middle day travel spread
  if (days.length >= 3) {
    const day3 = days.find((d) => d.day_number === 3) || days[2];
    if (day3 && day3.activities && day3.activities.length >= 3) {
      hasHighTravelDay = true;
      highTravelDayNumber = day3.day_number;
    }
  }

  let activeAlert: JourneyPulse['activeAlert'];
  if (hasHighTravelDay) {
    activeAlert = {
      title: 'Travel Wise noticed something',
      message: `Day ${highTravelDayNumber} has unusually high travel time between North & South areas.`,
      actionLabel: `Optimize Day ${highTravelDayNumber}`,
      actionType: 'OPTIMIZE_DAY',
      dayNumber: highTravelDayNumber,
    };
  } else if (isBudgetWarning) {
    activeAlert = {
      title: 'Budget Alert',
      message: `Your current planned activities approach ${Math.round((totalCost / trip.total_budget) * 100)}% of your target budget.`,
      actionLabel: 'Save Money',
      actionType: 'OPTIMIZE_BUDGET',
    };
  }

  return {
    budgetStatus: isBudgetWarning ? 'warning' : 'on_track',
    scheduleStatus: totalActs > days.length * 4 ? 'tight' : 'balanced',
    routeStatus: hasHighTravelDay ? 'needs_optimization' : 'optimized',
    weatherStatus: 'good',
    activitiesStatus: 'personalized',
    overallScore: hasHighTravelDay ? 91 : 96,
    activeAlert,
  };
};

/**
 * AI Trip Doctor ("✨ Analyze My Journey")
 */
export const computeJourneyDiagnosis = (trip: Trip): JourneyDiagnosis => {
  const days = trip.itinerary_days || [];
  const dest = trip.destination;
  const isGoa = dest.toLowerCase().includes('goa');
  const dayCount = days.length;

  const targetBudget = trip.total_budget || 40000;
  const savingsAmt = isGoa ? 2300 : Math.round(targetBudget * 0.06);

  const suggestions: JourneyDiagnosis['suggestions'] = [
    {
      id: 'sug-route-1',
      title: 'Eliminate Day 3 Cross-Area Transit',
      category: 'route',
      dayNumber: Math.min(3, dayCount),
      reason: 'Groups northern coastal viewpoints together instead of commuting 38km across state boundaries.',
      changeDescription: 'Replace distant South excursion with Chapora Fort sunset and Anjuna cliffside walk.',
      timeSavedMinutes: 55,
      savingsAmount: 1100,
      beforeText: 'Day 3: 4h 10m travel across 3 regions',
      afterText: 'Day 3: 1h 15m clustered transit (Saved 55m)',
    },
    {
      id: 'sug-budget-1',
      title: 'Swap High-Markup Restaurant with Acclaimed Local Bistro',
      category: 'budget',
      dayNumber: Math.min(3, dayCount),
      reason: 'Swaps luxury resort restaurant with authentic heritage bistro offering top culinary ratings at 40% lower cost.',
      changeDescription: 'Selected Gunpowder South Indian coastal bistro over 5-star hotel dining hall.',
      savingsAmount: 1200,
      beforeText: 'Dinner cost: ₹3,500',
      afterText: 'Dinner cost: ₹1,400 (Saved ₹2,100)',
    },
    {
      id: 'sug-weather-1',
      title: 'Midday Heat & Rain Schedule Adjustment',
      category: 'weather',
      dayNumber: 2,
      reason: 'Shifts open beach activities to the morning golden hour (09:00 AM) and indoor museum/tea tasting to the afternoon.',
      changeDescription: 'Swap afternoon beach sun with Fontainhas heritage art gallery walk.',
      timeSavedMinutes: 15,
      beforeText: 'Afternoon: Open beach walk at 2:00 PM',
      afterText: 'Afternoon: Shaded heritage cafe & gallery at 2:00 PM',
    },
    {
      id: 'sug-balance-1',
      title: 'Inject Tranquil Evening Relaxation Gap',
      category: 'balance',
      dayNumber: Math.min(4, dayCount),
      reason: 'Your itinerary is activity-dense. Adding a 90-minute sunset breather prevents traveler fatigue.',
      changeDescription: 'Add scenic twilight mocktails & seaside relaxation.',
      beforeText: 'Back-to-back sightseeing without rest',
      afterText: 'Dedicated 90m twilight sunset breather',
    },
  ];

  return {
    score: 91,
    summary: `Travel Wise analyzed your ${dayCount}-day journey across ${dest}. With 3 intelligent adjustments, you can save ₹${savingsAmt.toLocaleString()} and 55 minutes of daily transit while improving your itinerary balance.`,
    routeNotice: 'Day 3 contains unnecessary transit between non-adjacent neighborhoods.',
    budgetSavingNotice: `You could save ₹${savingsAmt.toLocaleString()} by selecting verified local culinary gems.`,
    budgetSavingAmount: savingsAmt,
    weatherAlert: 'Sunny with moderate afternoon UV. Outdoor beach spots are best visited before 11:30 AM or after 4:30 PM.',
    balanceFeedback: 'Your journey is rich in landmarks. Adding dedicated relaxation gaps will significantly enhance your experience.',
    personalizationMatchPct: 87,
    radarScores: {
      adventure: 82,
      culture: 68,
      food: 92,
      relaxation: 54,
      travelPace: 74,
    },
    suggestions,
  };
};

/**
 * What-If Simulator
 */
export const computeWhatIfScenario = (
  currentTrip: Trip,
  simulated: {
    budget: number;
    duration: number;
    travelStyle: Trip['travel_style'];
    travelers: number;
    diningTier: 'Budget' | 'Moderate' | 'Fine Dining';
  }
): WhatIfScenario => {
  const currentDays = currentTrip.duration || 5;
  const currentActs = currentTrip.itinerary_days?.reduce((sum, d) => sum + (d.activities?.length || 0), 0) || 12;
  const currentCost = currentTrip.estimated_cost || currentTrip.total_budget || 40000;

  const newDays = simulated.duration;
  const newBudget = simulated.budget;
  const newActs = Math.round(newDays * (simulated.travelStyle.includes('Adventure') ? 3.2 : 2.5));

  let tradeOff = '';
  if (newBudget > currentCost) {
    tradeOff = `Increasing budget to ₹${newBudget.toLocaleString()} unlocks boutique heritage suites, private sunset cruises, and fine culinary pairings.`;
  } else if (newBudget < currentCost) {
    tradeOff = `Optimizing for ₹${newBudget.toLocaleString()} prioritizes authentic street food trails, self-guided heritage walks, and high-value homestays.`;
  } else {
    tradeOff = `Simulated adjustments balance scenic highlights with relaxed pacing.`;
  }

  return {
    budget: simulated.budget,
    duration: simulated.duration,
    travelStyle: simulated.travelStyle,
    travelers: simulated.travelers,
    diningTier: simulated.diningTier,
    compareResult: {
      currentPlan: {
        cost: currentCost,
        days: currentDays,
        activitiesCount: currentActs,
        travelTimeHours: '4h 10m',
        pace: 'Moderate Pace',
        highlights: ['Standard sightseeing route', 'Fixed dining reservations', 'Split transit segments'],
      },
      newPlan: {
        cost: newBudget,
        days: newDays,
        activitiesCount: newActs,
        travelTimeHours: '2h 45m',
        pace: simulated.travelStyle.includes('Relaxation') ? 'Leisurely & Serene' : 'Dynamic & Optimized',
        highlights: [
          `${newActs} curated destination highlights`,
          'Optimized geographic cluster routing',
          simulated.diningTier === 'Fine Dining' ? 'Chef-table culinary experiences' : 'Handpicked high-value regional bistros',
          'Zero back-and-forth travel waste',
        ],
        tradeOffReason: tradeOff,
      },
    },
  };
};

/**
 * Smart Weather & Activity Aware Packing List
 */
export const generatePackingListForTrip = (trip: Trip): PackingItem[] => {
  const dest = trip.destination.toLowerCase();
  const styles = trip.travel_style || [];
  const items: PackingItem[] = [
    { id: 'p1', category: 'Documents', name: 'Government Photo ID / Passport', packed: true, reason: 'Hotel check-in & monument verification' },
    { id: 'p2', category: 'Essentials', name: 'Universal Travel Adapter & 20,000mAh Power Bank', packed: true, reason: 'Full-day navigation & photos' },
    { id: 'p3', category: 'Essentials', name: 'UPI Payment App & ₹2,000 Emergency Cash', packed: false, reason: 'Street food vendors & local autos' },
    { id: 'p4', category: 'Toiletries', name: 'SPF 50+ Broad Spectrum Sunscreen', packed: false, reason: 'High daytime UV index' },
    { id: 'p5', category: 'Toiletries', name: 'Personal Medical Kit & Hydration Electrolytes', packed: false, reason: 'Stay refreshed on walking tours' },
  ];

  if (dest.includes('goa') || dest.includes('kerala') || styles.includes('Relaxation')) {
    items.push(
      { id: 'pg1', category: 'Destination', name: 'Swimwear & Microfiber Beach Towel', packed: false, reason: 'Coastal swimming & beach shacks' },
      { id: 'pg2', category: 'Clothing', name: 'Light Breathable Linen Shirts & Shorts', packed: false, reason: 'Tropical coastal breezes' },
      { id: 'pg3', category: 'Gear', name: 'Polarized Sunglasses & Waterproof Phone Pouch', packed: false, reason: 'Water sports and boat trips' },
      { id: 'pg4', category: 'Clothing', name: 'Slip-on Sandals & Walking Flip-flops', packed: false, reason: 'Sandy beach strolling' }
    );
  }

  if (dest.includes('darjeeling') || dest.includes('sikkim') || styles.includes('Nature')) {
    items.push(
      { id: 'pd1', category: 'Clothing', name: 'Fleece Jacket & Thermal Inner Layers', packed: false, reason: 'Chilly Himalayan mornings (8°C - 14°C)' },
      { id: 'pd2', category: 'Gear', name: 'Ankle-Support Trekking / Walking Shoes', packed: false, reason: 'Hilly terrain & tea garden trails' },
      { id: 'pd3', category: 'Destination', name: 'Compact Windproof Umbrella / Rain Poncho', packed: false, reason: 'Passing mountain mist & drizzle' },
      { id: 'pd4', category: 'Essentials', name: 'Moisturizing Lip Balm & Cold Cream', packed: false, reason: 'Crisp mountain air' }
    );
  }

  if (dest.includes('jaipur') || dest.includes('delhi') || dest.includes('varanasi') || styles.includes('Cultural')) {
    items.push(
      { id: 'pj1', category: 'Clothing', name: 'Modest Scarf / Shawl for Temple Visits', packed: false, reason: 'Sacred ghats & royal monument etiquette' },
      { id: 'pj2', category: 'Clothing', name: 'Cushioned Walking Sneakers', packed: false, reason: 'Extensive palace courtyards & cobblestones' },
      { id: 'pj3', category: 'Gear', name: 'Wide-Brim Sun Hat & UV Sunglasses', packed: false, reason: 'Midday sunny rampart exploration' }
    );
  }

  return items;
};

/**
 * Travel DNA Profiler
 */
export const computeTravelDNA = (trip: Trip | null): TravelDNA => {
  if (!trip) {
    return {
      natureLover: 78,
      foodExplorer: 84,
      adventure: 72,
      culture: 65,
      luxury: 42,
      nightlife: 38,
      topArchetype: 'Gourmet Nature Explorer',
    };
  }

  const styles = trip.travel_style || [];
  const interests = trip.interests || [];
  const foods = trip.food_preferences || [];

  let nature = 50;
  let food = 55;
  let adventure = 45;
  let culture = 50;
  let luxury = 35;
  let nightlife = 30;

  if (styles.includes('Nature') || interests.includes('Mountains') || interests.includes('Beaches')) nature += 32;
  if (styles.includes('Food & Cuisine') || foods.length >= 2 || interests.includes('Restaurants')) food += 38;
  if (styles.includes('Adventure') || interests.includes('Adventure Sports')) adventure += 36;
  if (styles.includes('Cultural') || styles.includes('Historical') || interests.includes('Historical Sites') || interests.includes('Museums')) culture += 34;
  if (styles.includes('Luxury') || trip.accommodation_preference === 'Luxury Hotel' || trip.accommodation_preference === 'Resort') luxury += 42;
  if (styles.includes('Nightlife') || styles.includes('Shopping')) nightlife += 35;

  const scores = { nature, food, adventure, culture, luxury, nightlife };
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const top1 = sorted[0][0];
  const top2 = sorted[1][0];

  const archetypeMap: Record<string, string> = {
    nature: 'Nature Seeker',
    food: 'Epicurean Trailblazer',
    adventure: 'Bold Adventurer',
    culture: 'Heritage Connoisseur',
    luxury: 'Bespoke Wanderer',
    nightlife: 'Vibrant Night Explorer',
  };

  const topArchetype = `${archetypeMap[top1] || 'Global Explorer'} & ${archetypeMap[top2] || 'Culture Seeker'}`;

  return {
    natureLover: Math.min(98, nature),
    foodExplorer: Math.min(98, food),
    adventure: Math.min(98, adventure),
    culture: Math.min(98, culture),
    luxury: Math.min(98, luxury),
    nightlife: Math.min(98, nightlife),
    topArchetype,
  };
};

/**
 * Local Lens ("Beyond the Tourist Trail")
 */
export interface LocalSecret {
  id: string;
  name: string;
  category: 'Local Food' | 'Quiet Spot' | 'Cultural Hidden Gem' | 'Neighborhood';
  tagline: string;
  whyLocalsChooseThis: string;
  bestTimeToVisit: string;
  address: string;
  approxCost: string;
  image: string;
}

export const getLocalLensSecrets = (destination: string): LocalSecret[] => {
  const d = destination.toLowerCase();
  if (d.includes('goa')) {
    return [
      {
        id: 'll-1',
        name: 'Fontainhas Secret Bakery Walk',
        category: 'Local Food',
        tagline: 'Warm Bebinca & fresh poi bread directly from 100-year-old wood-fired ovens',
        whyLocalsChooseThis: 'Locals skip tourist cafes and line up at 7:00 AM for warm, crusty Goan poi bread and traditional custard tarts.',
        bestTimeToVisit: '07:30 AM – 09:00 AM',
        address: 'Latin Quarter, Fontainhas, Panaji',
        approxCost: '₹150 – ₹300',
        image: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=800&q=80',
      },
      {
        id: 'll-2',
        name: 'Divar Island Ferry & Heritage Byways',
        category: 'Quiet Spot',
        tagline: 'Step back in time to sleepy paddy fields, baroque churches, and zero crowds',
        whyLocalsChooseThis: 'Accessed only by a charming free government river ferry, Divar is untouched by commercial nightlife and feels like Goa from 50 years ago.',
        bestTimeToVisit: '04:00 PM – 06:30 PM (Golden Hour)',
        address: 'Divar Island, Mandovi River',
        approxCost: 'Free Ferry',
        image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
      },
      {
        id: 'll-3',
        name: 'Fisherman Wharfs at Betul & Secret Cove',
        category: 'Cultural Hidden Gem',
        tagline: 'Watch traditional wooden trawlers dock with the daily catch beside river mouth',
        whyLocalsChooseThis: 'The highest quality crab, butter-garlic prawns, and kingfish curries cooked by coastal families overlooking the Betul lighthouse.',
        bestTimeToVisit: '12:30 PM – 03:00 PM',
        address: 'Betul Estuary, South Goa',
        approxCost: '₹600 – ₹1,200',
        image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
      },
    ];
  }

  if (d.includes('darjeeling')) {
    return [
      {
        id: 'lld-1',
        name: 'Tinchuley Organic Village & Tea Plucking Homestead',
        category: 'Quiet Spot',
        tagline: 'Misty orange orchards and pristine views away from town traffic',
        whyLocalsChooseThis: 'Locals head to Tinchuley for peaceful pine forest walks and sipping first flush tea right in the grower’s wooden balcony.',
        bestTimeToVisit: 'Morning 08:00 AM – 11:00 AM',
        address: 'Tinchuley Ridge, 32km from Darjeeling',
        approxCost: '₹400 – ₹800',
        image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80',
      },
      {
        id: 'lld-2',
        name: 'Sonam’s Kitchen Breakfast Nook',
        category: 'Local Food',
        tagline: 'Legendary hash browns, ginger lemon tea, and cozy traveler conversations',
        whyLocalsChooseThis: 'Run with personal warmth by Sonam, offering homemade bread and whole-wheat pancakes made fresh to order.',
        bestTimeToVisit: '08:30 AM – 10:30 AM',
        address: 'Zakir Hussain Road, Darjeeling',
        approxCost: '₹200 – ₹450',
        image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
      },
    ];
  }

  return [
    {
      id: 'll-gen-1',
      name: `${destination} Artisan Heritage Quarters`,
      category: 'Neighborhood',
      tagline: 'Quiet vintage cobblestones and generations-old master workshops',
      whyLocalsChooseThis: 'Authentic local life away from souvenir stalls, where you can watch traditional artisans at work.',
      bestTimeToVisit: '09:00 AM – 11:30 AM',
      address: `Old Town Heritage Quarter, ${destination}`,
      approxCost: 'Free Exploration',
      image: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'll-gen-2',
      name: `Historic Morning Tea & Bakery Pavilion`,
      category: 'Local Food',
      tagline: 'Traditional recipes unchanged for over half a century',
      whyLocalsChooseThis: 'Beloved morning community gathering spot serving signature freshly brewed teas and regional breakfast.',
      bestTimeToVisit: '08:00 AM – 10:00 AM',
      address: `Heritage Center, ${destination}`,
      approxCost: '₹200 – ₹500',
      image: 'https://images.unsplash.com/photo-1558431382-27e303142255?auto=format&fit=crop&w=800&q=80',
    },
  ];
};

/**
 * Best Photo Moments
 */
export interface PhotoMoment {
  id: string;
  name: string;
  location: string;
  photoMatchScore: number;
  goldenHourWindow: string;
  cameraTip: string;
  vibe: string;
  image: string;
}

export const getPhotoSpotHighlights = (destination: string): PhotoMoment[] => {
  const d = destination.toLowerCase();
  if (d.includes('goa')) {
    return [
      {
        id: 'pm-1',
        name: 'Vagator Cliff & Red Bastion Sunset',
        location: 'Vagator Beach Cliffs, North Goa',
        photoMatchScore: 96,
        goldenHourWindow: '05:20 PM – 06:00 PM',
        cameraTip: 'Use a wide 24mm lens to capture the dramatic red laterite cliffs contrasting against the crimson Arabian Sea waves.',
        vibe: 'Dramatic Coastal Sunset',
        image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80',
      },
      {
        id: 'pm-2',
        name: 'Fontainhas Pastel Heritage Alleyways',
        location: 'Old Latin Quarter, Panaji',
        photoMatchScore: 94,
        goldenHourWindow: '08:00 AM – 09:30 AM',
        cameraTip: 'Shoot soft morning shadows on bright yellow and indigo blue Portuguese walls with lush overhanging bougainvillea.',
        vibe: 'Colonial Architecture & Color',
        image: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=800&q=80',
      },
      {
        id: 'pm-3',
        name: 'Chapora Fort Ramparts & Palm Horizon',
        location: 'Chapora Hilltop Fort',
        photoMatchScore: 91,
        goldenHourWindow: '05:30 PM – 06:15 PM',
        cameraTip: 'Frame your subject standing on the ancient stone rampart looking out over the winding Chapora river mouth.',
        vibe: 'Cinematic Panoramic Vistas',
        image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
      },
    ];
  }

  return [
    {
      id: 'pm-gen-1',
      name: `${destination} Landmark Golden Vista`,
      location: `Panoramic Viewpoint, ${destination}`,
      photoMatchScore: 95,
      goldenHourWindow: '05:30 PM – 06:15 PM',
      cameraTip: 'Capture the warm evening glow illuminating the architectural lines and horizon skyline.',
      vibe: 'Golden Hour Splendor',
      image: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=800&q=80',
    },
  ];
};

/**
 * Smart Comparisons (Hotels / Spots)
 */
export interface ItemComparison {
  id: string;
  category: 'Hotels' | 'Restaurants' | 'Activities';
  itemA: {
    name: string;
    price: string;
    matchScore: number;
    locationNote: string;
    highlights: string[];
    image: string;
  };
  itemB: {
    name: string;
    price: string;
    matchScore: number;
    locationNote: string;
    highlights: string[];
    image: string;
  };
  aiTradeOffExplanation: string;
}

export const getSmartComparisons = (destination: string): ItemComparison[] => {
  const d = destination.toLowerCase();
  if (d.includes('goa')) {
    return [
      {
        id: 'comp-hotel-1',
        category: 'Hotels',
        itemA: {
          name: 'The Heritage Portuguese Villa',
          price: '₹4,500 / night',
          matchScore: 8.8,
          locationNote: '12 min from Vagator Beach',
          highlights: ['Lush garden courtyard', 'Complimentary Goan breakfast', 'Quiet neighborhood'],
          image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80',
        },
        itemB: {
          name: 'Wanderer’s Seaside Boutique Resort',
          price: '₹5,200 / night',
          matchScore: 9.3,
          locationNote: 'Direct beach access (2 min)',
          highlights: ['Infinity pool over ocean', 'Sunset cocktails lounge', 'Walking distance to cafes'],
          image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=600&q=80',
        },
        aiTradeOffExplanation:
          'Wanderer’s Seaside costs ₹700 more per night but saves approximately 35 minutes of daily roundtrip travel and includes direct beach access.',
      },
      {
        id: 'comp-rest-1',
        category: 'Restaurants',
        itemA: {
          name: 'Gunpowder South Indian Coastal Bistro',
          price: '₹750 / person',
          matchScore: 9.4,
          locationNote: 'Assagao heritage garden',
          highlights: ['Award-winning coastal curries', 'Charming outdoor ambience', 'High culinary value'],
          image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80',
        },
        itemB: {
          name: 'Thalassa Greek Sunset Dining',
          price: '₹1,800 / person',
          matchScore: 9.1,
          locationNote: 'Siolim Waterfront cliff',
          highlights: ['Breathtaking sunset vistas', 'Cocktail bar & DJ vibe', 'Premium seaside setting'],
          image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
        },
        aiTradeOffExplanation:
          'Gunpowder delivers richer authentic flavors at less than half the price, while Thalassa is ideal if panoramic sunset views and nightlife are your priority.',
      },
    ];
  }

  return [
    {
      id: 'comp-gen-1',
      category: 'Hotels',
      itemA: {
        name: `Heritage Boutique Inn, ${destination}`,
        price: '₹3,800 / night',
        matchScore: 8.7,
        locationNote: '15 min from landmark center',
        highlights: ['Authentic regional styling', 'High value rate', 'Quiet neighborhood'],
        image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80',
      },
      itemB: {
        name: `Grand Central Promenade Hotel, ${destination}`,
        price: '₹4,900 / night',
        matchScore: 9.2,
        locationNote: 'In the heart of city square (3 min)',
        highlights: ['Central walking access', 'Rooftop lounge', 'Zero transit required'],
        image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=600&q=80',
      },
      aiTradeOffExplanation:
        `Grand Central costs ₹1,100 more per night but places you right in the center, saving roughly 45 minutes of taxi transit each day.`,
    },
  ];
};

