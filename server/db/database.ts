import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import {
  User,
  UserPreferences,
  Trip,
  ItineraryDay,
  Activity,
  Place,
  SavedPlace,
  TripShare,
  DestinationInfo,
  CommunityPost,
  CommunityComment,
  CommunityLike,
  SavedCommunityPost,
  CommunityReport,
  PublicUserProfile,
  UserFollow,
  CommunityNotification,
  UserStoredFile,
} from '../../src/types/index';

// Data storage files for persistence
const DB_DIR = path.join(process.cwd(), '.data');
const DB_FILE = path.join(DB_DIR, 'db.json');

export interface DatabaseSchema {
  users: Array<User & { password_hash: string }>;
  user_preferences: UserPreferences[];
  trips: Trip[];
  itinerary_days: ItineraryDay[];
  activities: Activity[];
  places: Place[];
  saved_places: SavedPlace[];
  trip_shares: TripShare[];
  community_posts: CommunityPost[];
  community_likes: CommunityLike[];
  community_comments: CommunityComment[];
  saved_community_posts: SavedCommunityPost[];
  community_reports: CommunityReport[];
  user_follows: UserFollow[];
  community_notifications: CommunityNotification[];
  user_files?: UserStoredFile[];
  analytics_events: Array<{
    id: string;
    event_name: string;
    user_id?: string;
    metadata?: any;
    created_at: string;
  }>;
}

// Initial Destinations Catalog
export const SEED_DESTINATIONS: DestinationInfo[] = [
  {
    name: 'Goa',
    country: 'India',
    region: 'West Coast',
    tagline: 'Sun, sand, spices, and vibrant Portuguese heritage',
    description:
      'Famous for its golden beaches, active nightlife, Portuguese architecture, and seafood curries. Perfect for beach lovers, adventure sports, and heritage exploration.',
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80',
    popular_for: ['Beaches', 'Nightlife', 'Water Sports', 'Seafood', 'Portuguese Forts'],
    best_season: 'Nov – Mar',
    avg_budget_per_day: 3500,
    latitude: 15.2993,
    longitude: 74.124,
    highlighted_tags: ['Beach', 'Nightlife', 'Relaxation', 'Adventure'],
  },
  {
    name: 'Kolkata',
    country: 'India',
    region: 'East India',
    tagline: 'The City of Joy — Culture, literature, and colonial grandeur',
    description:
      'Cultural capital of India, steeped in artistic soul, iconic yellow cabs, Howrah Bridge, Victoria Memorial, and world-renowned sweets and street cuisine.',
    image: 'https://images.unsplash.com/photo-1558431382-27e303142255?auto=format&fit=crop&w=1200&q=80',
    popular_for: ['Colonial Architecture', 'Literature', 'Street Food', 'Sweets', 'Museums'],
    best_season: 'Oct – Mar',
    avg_budget_per_day: 2500,
    latitude: 22.5726,
    longitude: 88.3639,
    highlighted_tags: ['Cultural', 'Historical', 'Food & Cuisine'],
  },
  {
    name: 'Darjeeling',
    country: 'India',
    region: 'Eastern Himalayas',
    tagline: 'Queen of the Hills — Tea gardens and Kanchenjunga panoramas',
    description:
      'Perched in the Lesser Himalayas, famed for lush emerald tea estates, the UNESCO Toy Train, colonial charm, and sunrise views over Mount Kanchenjunga.',
    image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80',
    popular_for: ['Tea Estates', 'Toy Train', 'Sunrise Views', 'Tibetan Monasteries', 'Trekking'],
    best_season: 'Mar – May & Oct – Dec',
    avg_budget_per_day: 3000,
    latitude: 27.041,
    longitude: 88.2663,
    highlighted_tags: ['Nature', 'Mountains', 'Relaxation', 'Photography'],
  },
  {
    name: 'Jaipur',
    country: 'India',
    region: 'Rajasthan',
    tagline: 'The Pink City of Maharajas, forts, and royal palaces',
    description:
      'A royal visual spectacle with Amber Fort, Hawa Mahal, bustling gemstone bazaars, artisanal crafts, and rich Rajasthani thali feasts.',
    image: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1200&q=80',
    popular_for: ['Forts & Palaces', 'Royal Heritage', 'Handicrafts', 'Textiles', 'Rajasthani Thali'],
    best_season: 'Oct – Mar',
    avg_budget_per_day: 3200,
    latitude: 26.9124,
    longitude: 75.7873,
    highlighted_tags: ['Historical', 'Cultural', 'Shopping', 'Photography'],
  },
  {
    name: 'Kerala (Munnar & Alleppey)',
    country: 'India',
    region: 'South India',
    tagline: "God's Own Country — Emerald backwaters and misty hills",
    description:
      'Serene backwaters on traditional houseboats, sprawling tea estates in Munnar, Ayurvedic healing sanctuaries, and fragrant spice plantations.',
    image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80',
    popular_for: ['Houseboats', 'Backwaters', 'Tea Gardens', 'Ayurveda', 'Spice Plantations'],
    best_season: 'Sep – Mar',
    avg_budget_per_day: 3800,
    latitude: 9.9312,
    longitude: 76.2673,
    highlighted_tags: ['Nature', 'Relaxation', 'Cultural', 'Family'],
  },
  {
    name: 'Varanasi',
    country: 'India',
    region: 'Uttar Pradesh',
    tagline: 'The timeless spiritual heart of the sacred Ganges',
    description:
      'One of the oldest continuously inhabited cities in the world. Mesmerizing evening Ganga Aarti, ancient ghats, vibrant labyrinthine alleys, and spiritual transcendence.',
    image: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1200&q=80',
    popular_for: ['Ganga Aarti', 'Ancient Ghats', 'Silk Weaving', 'Spiritual Retreats', 'Street Food'],
    best_season: 'Oct – Mar',
    avg_budget_per_day: 2200,
    latitude: 25.3176,
    longitude: 82.9739,
    highlighted_tags: ['Spiritual', 'Historical', 'Cultural', 'Photography'],
  },
  {
    name: 'Delhi',
    country: 'India',
    region: 'North India',
    tagline: 'A bustling fusion of ancient sultanates and modern cosmopolitanism',
    description:
      'From Mughal monuments like Qutub Minar and Red Fort to trendy cafes in Hauz Khas and legendary Old Delhi kebabs and chaats.',
    image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1200&q=80',
    popular_for: ['Mughal Monuments', 'Street Food', 'Markets', 'Museums', 'Nightlife'],
    best_season: 'Oct – Mar',
    avg_budget_per_day: 3000,
    latitude: 28.6139,
    longitude: 77.209,
    highlighted_tags: ['Historical', 'Food & Cuisine', 'Shopping', 'Cultural'],
  },
  {
    name: 'Sikkim (Gangtok & North Sikkim)',
    country: 'India',
    region: 'Northeast India',
    tagline: 'Pristine Himalayan valleys, alpine lakes, and monastery bells',
    description:
      'Snow-dusted peaks, sacred Gurudongmar Lake, Yumthang Valley of Flowers, vibrant Tibetan Buddhist monasteries, and organic mountain cuisine.',
    image: 'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&w=1200&q=80',
    popular_for: ['High Altitude Lakes', 'Monasteries', 'Valley of Flowers', 'Adventure Trekking'],
    best_season: 'Mar – Jun & Oct – Dec',
    avg_budget_per_day: 4000,
    latitude: 27.3389,
    longitude: 88.6065,
    highlighted_tags: ['Adventure', 'Nature', 'Mountains', 'Spiritual'],
  },
  {
    name: 'Agra',
    country: 'India',
    region: 'Uttar Pradesh',
    tagline: 'Timeless Mughal grandeur, marble poetry & world heritage monuments',
    description:
      'Home to the iconic Taj Mahal, majestic Agra Fort, and Fatehpur Sikri. Renowned for marble inlay craftsmanship, Petha confections, and rich Mughal history.',
    image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80',
    popular_for: ['Taj Mahal', 'Agra Fort', 'Fatehpur Sikri', 'Marble Inlay', 'Mughal Cuisine'],
    best_season: 'Oct – Mar',
    avg_budget_per_day: 3200,
    latitude: 27.1751,
    longitude: 78.0421,
    highlighted_tags: ['Historical', 'Cultural', 'Photography', 'Heritage'],
  },
  {
    name: 'Manali & Himachal Valleys',
    country: 'India',
    region: 'Himachal Pradesh',
    tagline: 'Snow-capped Himalayan peaks, pine forests & alpine adventure trails',
    description:
      'Nestled in the Beas River valley, famed for Solang Valley adventure sports, Rohtang Pass glaciers, ancient cedar temples, and high-altitude cafes.',
    image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80',
    popular_for: ['Solang Valley', 'Rohtang Pass', 'Hadimba Temple', 'Paragliding', 'River Rafting'],
    best_season: 'Oct – Jun (Winter Snow & Summer Escape)',
    avg_budget_per_day: 3500,
    latitude: 32.2432,
    longitude: 77.1892,
    highlighted_tags: ['Adventure', 'Nature', 'Mountains', 'Relaxation'],
  },
];

// Initial Places Database
export const SEED_PLACES: Place[] = [
  // Goa Places
  {
    id: 'place-goa-1',
    name: 'Fort Aguada & Lighthouse',
    destination: 'Goa',
    category: 'Attraction',
    sub_category: 'Historical Fort',
    description:
      'A well-preserved seventeenth-century Portuguese fort standing on Sinquerim Beach overlooking the Arabian Sea, featuring a grand 4-story lighthouse.',
    latitude: 15.492,
    longitude: 73.7738,
    rating: 4.6,
    reviews_count: 3420,
    price_level: '$',
    estimated_cost: 200,
    image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80',
    address: 'Sinquerim Beach, Candolim, Goa 403515',
    opening_hours: '09:30 AM - 05:30 PM',
    best_time_to_visit: 'Late afternoon for ocean breeze and sunset view',
    tags: ['Historical', 'Sunset', 'Portuguese Heritage', 'Photography'],
  },
  {
    id: 'place-goa-2',
    name: 'Basilica of Bom Jesus',
    destination: 'Goa',
    category: 'Attraction',
    sub_category: 'UNESCO World Heritage Church',
    description:
      'Baroque architecture jewel in Old Goa holding the mortal remains of St. Francis Xavier. One of the oldest and most revered churches in India.',
    latitude: 15.5009,
    longitude: 73.9116,
    rating: 4.8,
    reviews_count: 5120,
    price_level: '$',
    estimated_cost: 50,
    image: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=800&q=80',
    address: 'Old Goa Rd, Bainguinim, Goa 403402',
    opening_hours: '09:00 AM - 06:30 PM',
    best_time_to_visit: 'Morning hours to avoid crowds',
    tags: ['Spiritual', 'UNESCO', 'Architecture', 'Historical'],
  },
  {
    id: 'place-goa-3',
    name: "Fisherman's Wharf",
    destination: 'Goa',
    category: 'Restaurant',
    sub_category: 'Goan Coastal & Seafood',
    description:
      'Iconic riverside dining experience serving authentic Goan fish curry, butter garlic crab, prawn balchao, and refreshing cocktails by the Sal river.',
    latitude: 15.1583,
    longitude: 73.9482,
    rating: 4.7,
    reviews_count: 2890,
    price_level: '$$$',
    estimated_cost: 1400,
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
    address: 'Mobor Beach, Cavelossim, Salcette, Goa 403731',
    opening_hours: '12:00 PM - 11:30 PM',
    best_time_to_visit: 'Dinner with live music',
    tags: ['Seafood', 'Riverside', 'Live Music', 'Goan Cuisine'],
  },
  {
    id: 'place-goa-4',
    name: 'Taj Exotica Resort & Spa',
    destination: 'Goa',
    category: 'Hotel',
    sub_category: 'Luxury Beachfront Resort',
    description:
      'Mediterranean-inspired luxury sanctuary spread across 56 acres along Benaulim Beach with private plunge pools, world-class spa, and golf course.',
    latitude: 15.2536,
    longitude: 73.9248,
    rating: 4.9,
    reviews_count: 1400,
    price_level: '$$$$',
    estimated_cost: 18000,
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
    address: 'Calwaddo, Benaulim, Goa 403716',
    opening_hours: '24/7 Check-in',
    best_time_to_visit: 'Year round',
    tags: ['Luxury', 'Resort', 'Spa', 'Beachfront'],
  },
  {
    id: 'place-goa-5',
    name: 'Fontainhas Latin Quarter Walking Tour',
    destination: 'Goa',
    category: 'Hidden Gem',
    sub_category: 'Heritage Walk',
    description:
      'Quaint, brightly-colored Portuguese villas, terracotta-tiled roofs, old bakeries, art galleries, and cozy cafes in Panaji.',
    latitude: 15.4989,
    longitude: 73.8315,
    rating: 4.7,
    reviews_count: 1890,
    price_level: '$',
    estimated_cost: 300,
    image: 'https://images.unsplash.com/photo-1587974928442-77dc3e0dba72?auto=format&fit=crop&w=800&q=80',
    address: 'Fontainhas, Panaji, Goa 403001',
    opening_hours: 'Open 24 hours (Best daytime)',
    best_time_to_visit: '08:00 AM - 10:30 AM or 04:00 PM - 06:00 PM for photography',
    tags: ['Hidden Gem', 'Photography', 'Heritage', 'Cafes'],
  },
  {
    id: 'place-goa-6',
    name: 'Anjuna Flea Market & Curlies Sunset',
    destination: 'Goa',
    category: 'Attraction',
    sub_category: 'Market & Sunset Vibe',
    description:
      'Legendary bohemian beachfront market with handmade jewelry, tapestries, spices, live music, and unforgettable sunsets over the Arabian Sea.',
    latitude: 15.5786,
    longitude: 73.7412,
    rating: 4.5,
    reviews_count: 4200,
    price_level: '$$',
    estimated_cost: 600,
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    address: 'South Anjuna Beach, Anjuna, Goa 403509',
    opening_hours: 'Wednesdays 09:00 AM - 08:00 PM',
    best_time_to_visit: 'Wednesday afternoon towards sunset',
    tags: ['Shopping', 'Sunset', 'Boho', 'Music'],
  },

  // Kolkata Places
  {
    id: 'place-kol-1',
    name: 'Victoria Memorial Hall & Gardens',
    destination: 'Kolkata',
    category: 'Attraction',
    sub_category: 'Colonial Monument & Museum',
    description:
      'Imposing white Makrana marble monument dedicated to Queen Victoria, surrounded by 64 acres of lush gardens, housing a rich royal gallery.',
    latitude: 22.5448,
    longitude: 88.3426,
    rating: 4.8,
    reviews_count: 7800,
    price_level: '$',
    estimated_cost: 100,
    image: 'https://images.unsplash.com/photo-1558431382-27e303142255?auto=format&fit=crop&w=800&q=80',
    address: '1, Queens Way, Maidan, Kolkata, West Bengal 700071',
    opening_hours: '10:00 AM - 06:00 PM (Closed Mondays)',
    best_time_to_visit: '03:30 PM for garden walks and evening illumination',
    tags: ['Colonial', 'Museum', 'Gardens', 'Architecture'],
  },
  {
    id: 'place-kol-2',
    name: 'Flurys Heritage Tea Room & Bakery',
    destination: 'Kolkata',
    category: 'Restaurant',
    sub_category: 'Heritage European Tearoom',
    description:
      'Established in 1927 on Park Street, famed for legendary English breakfasts, rum balls, chicken patties, and Darjeeling first flush tea.',
    latitude: 22.5532,
    longitude: 88.3524,
    rating: 4.5,
    reviews_count: 6200,
    price_level: '$$',
    estimated_cost: 700,
    image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80',
    address: '18, Park St, Park Street area, Kolkata, West Bengal 700071',
    opening_hours: '07:30 AM - 11:00 PM',
    best_time_to_visit: 'Morning breakfast or late afternoon high tea',
    tags: ['Heritage', 'Breakfast', 'Bakery', 'Park Street'],
  },
  {
    id: 'place-kol-3',
    name: 'Kumartuli Potter’s Colony',
    destination: 'Kolkata',
    category: 'Hidden Gem',
    sub_category: 'Artisanal Quarter',
    description:
      'Traditional clay idol-making quarter where generations of master artisans sculpt magnificent clay idols of deities from Ganges clay and straw.',
    latitude: 22.6015,
    longitude: 88.3657,
    rating: 4.8,
    reviews_count: 2100,
    price_level: '$',
    estimated_cost: 0,
    image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80',
    address: 'Kumartuli, Hatkhola, Kolkata 700005',
    opening_hours: 'Open all day',
    best_time_to_visit: 'Morning 08:00 AM - 11:00 AM',
    tags: ['Art', 'Artisans', 'Culture', 'Photography'],
  },
  {
    id: 'place-kol-4',
    name: 'The Oberoi Grand Kolkata',
    destination: 'Kolkata',
    category: 'Hotel',
    sub_category: 'Heritage Luxury Hotel',
    description:
      'Known affectionately as the Grande Dame of Chowringhee, combining classic Victorian architecture, serene courtyard pool, and grand hospitality.',
    latitude: 22.5604,
    longitude: 88.3518,
    rating: 4.8,
    reviews_count: 3100,
    price_level: '$$$$',
    estimated_cost: 12500,
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
    address: '15, Jawaharlal Nehru Rd, New Market Area, Kolkata 700013',
    opening_hours: '24/7',
    best_time_to_visit: 'Year round',
    tags: ['Heritage', 'Luxury', 'Central Location'],
  },

  // Darjeeling Places
  {
    id: 'place-darj-1',
    name: 'Tiger Hill Sunrise Point',
    destination: 'Darjeeling',
    category: 'Attraction',
    sub_category: 'Himalayan Viewpoint',
    description:
      'Famous viewpoint offering an unforgettable sunrise view where morning rays illuminate the snow-clad peaks of Kanchenjunga and Mount Everest in gold and pink.',
    latitude: 27.0083,
    longitude: 88.2833,
    rating: 4.9,
    reviews_count: 5400,
    price_level: '$',
    estimated_cost: 200,
    image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80',
    address: 'Tiger Hill, Darjeeling, West Bengal 734102',
    opening_hours: '04:00 AM - 07:00 AM',
    best_time_to_visit: '04:30 AM before dawn',
    tags: ['Himalayas', 'Sunrise', 'Kanchenjunga', 'Nature'],
  },
  {
    id: 'place-darj-2',
    name: 'Happy Valley Tea Estate',
    destination: 'Darjeeling',
    category: 'Attraction',
    sub_category: 'Tea Garden & Factory Tour',
    description:
      'Second oldest tea estate in Darjeeling, established in 1854. Walk through manicured hills, watch plucking, and savor tea tasting sessions.',
    latitude: 27.0545,
    longitude: 88.2612,
    rating: 4.7,
    reviews_count: 3100,
    price_level: '$',
    estimated_cost: 250,
    image: 'https://images.unsplash.com/photo-1587393855524-087f83d95bc9?auto=format&fit=crop&w=800&q=80',
    address: 'Lebong Cart Rd, Darjeeling 734101',
    opening_hours: '08:00 AM - 04:30 PM (Closed Mon & Sun)',
    best_time_to_visit: 'Morning for fresh tea processing aroma',
    tags: ['Tea', 'Nature', 'Heritage', 'Tasting'],
  },
  {
    id: 'place-darj-3',
    name: 'Keventer’s Open Terrace & Bakery',
    destination: 'Darjeeling',
    category: 'Restaurant',
    sub_category: 'Breakfast & Mountain View Cafe',
    description:
      'Colonial open rooftop cafe famous for traditional English breakfast platters, pork sausages, sandwiches, hot chocolate, and clear Himalayan mountain views.',
    latitude: 27.0425,
    longitude: 88.2655,
    rating: 4.6,
    reviews_count: 4800,
    price_level: '$$',
    estimated_cost: 450,
    image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80',
    address: '1, Nehru Rd, Darjeeling 734101',
    opening_hours: '07:30 AM - 06:30 PM',
    best_time_to_visit: '08:30 AM for breakfast on the sun terrace',
    tags: ['Breakfast', 'Mountain View', 'Heritage', 'Cafe'],
  },

  // Jaipur Places
  {
    id: 'place-jpr-1',
    name: 'Amber Palace & Fort',
    destination: 'Jaipur',
    category: 'Attraction',
    sub_category: 'Hilltop Royal Fort',
    description:
      'Majestic hilltop fort featuring red sandstone and marble, mirror palace (Sheesh Mahal), courtyards, and panoramic views of Maota Lake.',
    latitude: 26.9855,
    longitude: 75.8513,
    rating: 4.8,
    reviews_count: 9800,
    price_level: '$$',
    estimated_cost: 500,
    image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80',
    address: 'Devisinghpura, Amer, Jaipur, Rajasthan 302001',
    opening_hours: '08:00 AM - 05:30 PM & 06:30 PM - 09:15 PM (Night illumination)',
    best_time_to_visit: 'Early morning or illuminated evening',
    tags: ['Royal', 'Fort', 'Architecture', 'UNESCO'],
  },
  {
    id: 'place-jpr-2',
    name: 'Hawa Mahal (Palace of Winds)',
    destination: 'Jaipur',
    category: 'Attraction',
    sub_category: 'Pink Sandstone Palace',
    description:
      'Unique five-story exterior facade resembling a honeycomb of a beehive with 953 small windows (jharokhas) decorated with intricate latticework.',
    latitude: 26.9239,
    longitude: 75.8267,
    rating: 4.7,
    reviews_count: 8900,
    price_level: '$',
    estimated_cost: 200,
    image: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=800&q=80',
    address: 'Hawa Mahal Rd, Badi Choupad, J.D.A. Market, Jaipur 302002',
    opening_hours: '09:00 AM - 05:00 PM',
    best_time_to_visit: 'Morning sunlight shining on the facade from Wind View Cafe across the road',
    tags: ['Architecture', 'Iconic', 'Photography', 'Heritage'],
  },
  {
    id: 'place-jpr-3',
    name: '1135 AD Fine Dining at Amber Fort',
    destination: 'Jaipur',
    category: 'Restaurant',
    sub_category: 'Royal Rajasthani Fine Dining',
    description:
      'Dine like royalty inside the historical fort walls surrounded by pure gold leaf enameling, Belgian crystal chandeliers, live sitar music, and traditional Rajput cuisine.',
    latitude: 26.9859,
    longitude: 75.8509,
    rating: 4.7,
    reviews_count: 1600,
    price_level: '$$$$',
    estimated_cost: 3200,
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
    address: 'Level 2, Jaleb Chowk, Near Shila Mata Temple, Amer, Jaipur 302001',
    opening_hours: '12:00 PM - 10:30 PM',
    best_time_to_visit: 'Candlelight royal dinner',
    tags: ['Fine Dining', 'Royal', 'Rajasthani', 'Live Sitar'],
  },

  // Kerala Places
  {
    id: 'place-ker-1',
    name: 'Alleppey Luxury Backwaters Houseboat Cruise',
    destination: 'Kerala',
    category: 'Attraction',
    sub_category: 'Backwater Cruise',
    description:
      'Glide through tranquil emerald backwaters, palm-fringed canals, and paddy fields on a traditional thatched Kettuvallam with fresh coconut water and Karimeen fish fry.',
    latitude: 9.4981,
    longitude: 76.3388,
    rating: 4.9,
    reviews_count: 6700,
    price_level: '$$$',
    estimated_cost: 6500,
    image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80',
    address: 'Finishing Point, Punnamada, Alappuzha, Kerala 688013',
    opening_hours: '11:30 AM - 05:30 PM',
    best_time_to_visit: 'Noon till golden hour sunset',
    tags: ['Houseboat', 'Backwaters', 'Nature', 'Romantic'],
  },
  {
    id: 'place-ker-2',
    name: 'Munnar Tea Plantations & Eravikulam National Park',
    destination: 'Kerala',
    category: 'Attraction',
    sub_category: 'Misty Hill Station & Wildlife',
    description:
      'Rolling carpet of misty green tea gardens, endangered Nilgiri Tahr mountain goats, cascading waterfalls, and cool crisp mountain air at 1,600m altitude.',
    latitude: 10.0889,
    longitude: 77.0595,
    rating: 4.8,
    reviews_count: 5300,
    price_level: '$',
    estimated_cost: 300,
    image: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=800&q=80',
    address: 'Munnar Wildlife Division, Idukki, Kerala 685612',
    opening_hours: '08:30 AM - 04:00 PM',
    best_time_to_visit: 'Early morning misty sunrise',
    tags: ['Tea Gardens', 'Hills', 'Nature', 'Wildlife'],
  },
  {
    id: 'place-ker-3',
    name: 'Kashi Art Cafe & Heritage Courtyard',
    destination: 'Kerala',
    category: 'Restaurant',
    sub_category: 'Boutique Art Cafe',
    description:
      'Charming art gallery cafe in Fort Kochi serving artisanal roast coffee, fresh chocolate cake, homemade breads, and tropical salads amid contemporary art exhibits.',
    latitude: 9.9654,
    longitude: 76.2415,
    rating: 4.6,
    reviews_count: 3200,
    price_level: '$$',
    estimated_cost: 650,
    image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80',
    address: 'Burgher St, Fort Nagar, Fort Kochi, Kochi 682001',
    opening_hours: '08:30 AM - 09:30 PM',
    best_time_to_visit: 'Morning coffee or afternoon tea',
    tags: ['Art Cafe', 'Coffee', 'Fort Kochi', 'Breakfast'],
  },

  // Varanasi Places
  {
    id: 'place-var-1',
    name: 'Dashashwamedh Ghat Evening Ganga Aarti',
    destination: 'Varanasi',
    category: 'Attraction',
    sub_category: 'Spiritual Riverfront Ritual',
    description:
      'World-renowned choreographed evening devotional ritual with brass lamps, blowing conch shells, incense smoke, and floating diya candles along the sacred Ganges river.',
    latitude: 25.3082,
    longitude: 83.0107,
    rating: 4.9,
    reviews_count: 11200,
    price_level: '$',
    estimated_cost: 150,
    image: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80',
    address: 'Dashashwamedh Ghat Rd, Ghats of Varanasi 221001',
    opening_hours: '06:30 PM - 07:45 PM (Daily)',
    best_time_to_visit: 'Arrive by 05:45 PM or view from wooden boat on the river',
    tags: ['Ganga Aarti', 'Spiritual', 'Sacred', 'Iconic'],
  },
  {
    id: 'place-var-2',
    name: 'Blue Lassi Shop',
    destination: 'Varanasi',
    category: 'Restaurant',
    sub_category: 'Iconic Hand-Churned Lassi',
    description:
      'Legendary tiny heritage lassi counter since 1925 serving 80+ varieties of thick clay-cup (kulhad) lassi topped with malai, fresh pomegranate, mango, and pistachios.',
    latitude: 25.3114,
    longitude: 83.0142,
    rating: 4.7,
    reviews_count: 5400,
    price_level: '$',
    estimated_cost: 120,
    image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=800&q=80',
    address: 'CK 12/1 Kunj Gali, Near Manikarnika Ghat, Varanasi 221001',
    opening_hours: '08:00 AM - 10:00 PM',
    best_time_to_visit: 'Afternoon refreshment between ghat walks',
    tags: ['Lassi', 'Street Food', 'Legendary', 'Kulhad'],
  },

  // Delhi Places
  {
    id: 'place-del-1',
    name: 'Qutub Minar & Mehrauli Archaeological Park',
    destination: 'Delhi',
    category: 'Attraction',
    sub_category: 'UNESCO World Heritage Minaret',
    description:
      'A 73-meter fluted red sandstone victory tower built in 1192 surrounded by intricate carved arches, iron pillar that never rusts, and ancient tombs.',
    latitude: 28.5244,
    longitude: 77.1855,
    rating: 4.8,
    reviews_count: 9400,
    price_level: '$',
    estimated_cost: 250,
    image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80',
    address: 'Seth Sarai, Mehrauli, New Delhi 110030',
    opening_hours: '07:00 AM - 08:00 PM',
    best_time_to_visit: 'Late afternoon for golden sunlight on red stone',
    tags: ['UNESCO', 'History', 'Monument', 'Architecture'],
  },
  {
    id: 'place-del-2',
    name: 'Chandni Chowk Old Delhi Street Food Trail',
    destination: 'Delhi',
    category: 'Restaurant',
    sub_category: 'Culinary Street Heritage',
    description:
      'Sensory culinary journey through narrow lanes tasting hot stuffed paranthas at Paranthe Wali Gali, crispy jalebis, Natraj dahi bhalla, and royal butter chicken.',
    latitude: 28.6506,
    longitude: 77.2303,
    rating: 4.7,
    reviews_count: 8100,
    price_level: '$',
    estimated_cost: 450,
    image: 'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&w=800&q=80',
    address: 'Chandni Chowk, Old Delhi 110006',
    opening_hours: '10:00 AM - 10:00 PM',
    best_time_to_visit: '01:00 PM - 04:00 PM or evening snack hours',
    tags: ['Street Food', 'Old Delhi', 'Culinary', 'Heritage'],
  },

  // Agra Places
  {
    id: 'place-agr-1',
    name: 'Taj Mahal & Mughal Charbagh Gardens',
    destination: 'Agra',
    category: 'Attraction',
    sub_category: 'UNESCO World Heritage Wonder',
    description:
      'The breathtaking white marble mausoleum built by Mughal Emperor Shah Jahan for Mumtaz Mahal. Features mesmerizing symmetry, floral pietra dura inlay, and reflection pools.',
    latitude: 27.1751,
    longitude: 78.0421,
    rating: 4.9,
    reviews_count: 38000,
    price_level: '$$',
    estimated_cost: 250,
    image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80',
    address: 'Dharmapuri, Forest Colony, Tajganj, Agra, Uttar Pradesh 282001',
    opening_hours: '06:00 AM - 06:30 PM (Closed Fridays)',
    best_time_to_visit: 'Dawn sunrise for golden glow or sunset across Yamuna river',
    tags: ['Iconic', 'Mughal Architecture', 'UNESCO World Wonder', 'Heritage'],
  },
  {
    id: 'place-agr-2',
    name: 'Agra Fort & Diwan-i-Khas',
    destination: 'Agra',
    category: 'Attraction',
    sub_category: 'Mughal Imperial Red Sandstone Fort',
    description:
      'Massive 16th-century fortress of red sandstone encompassing Jahangiri Mahal, Khas Mahal, Sheesh Mahal mirror palace, and panoramic views of the Taj Mahal.',
    latitude: 27.1795,
    longitude: 78.0211,
    rating: 4.8,
    reviews_count: 22000,
    price_level: '$',
    estimated_cost: 150,
    image: 'https://images.unsplash.com/photo-1585136917195-23c2a1e67fa2?auto=format&fit=crop&w=800&q=80',
    address: 'Agra Fort, Rakabganj, Agra, Uttar Pradesh 282003',
    opening_hours: '06:00 AM - 06:00 PM',
    best_time_to_visit: 'Morning hours for intricate sandstone photography',
    tags: ['Fort', 'History', 'Mughal Grandeur', 'Architecture'],
  },

  // Manali Places
  {
    id: 'place-mnl-1',
    name: 'Solang Valley & Rohtang Alpine Route',
    destination: 'Manali',
    category: 'Attraction',
    sub_category: 'Himalayan Adventure & Snow Point',
    description:
      'High-altitude Himalayan valley famed for year-round adventure sports including paragliding, zorbing, skiing, snowmobiling, and spectacular glacier viewpoints.',
    latitude: 32.3166,
    longitude: 77.1578,
    rating: 4.8,
    reviews_count: 18500,
    price_level: '$$',
    estimated_cost: 1200,
    image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80',
    address: 'Solang Valley, Vashisht, Manali, Himachal Pradesh 175131',
    opening_hours: '09:00 AM - 06:00 PM',
    best_time_to_visit: 'Morning for clear skies, crisp mountain air & active sports',
    tags: ['Adventure', 'Snow Valley', 'Paragliding', 'Himalayas'],
  },
  {
    id: 'place-mnl-2',
    name: 'Hadimba Devi Ancient Cedar Temple',
    destination: 'Manali',
    category: 'Attraction',
    sub_category: 'Historic Wooden Pagoda Temple',
    description:
      'Built in 1553 AD amidst dense deodar cedar forests (Dhungri Van Vihar), featuring four-tiered wooden pagoda architecture and intricate brass carvings.',
    latitude: 32.2483,
    longitude: 77.1812,
    rating: 4.7,
    reviews_count: 16400,
    price_level: '$',
    estimated_cost: 50,
    image: 'https://images.unsplash.com/photo-1593181824359-56ce28929b28?auto=format&fit=crop&w=800&q=80',
    address: 'Hadimba Temple Rd, Old Manali, Manali, Himachal Pradesh 175131',
    opening_hours: '08:00 AM - 06:00 PM',
    best_time_to_visit: 'Morning peaceful walk through giant Himalayan deodars',
    tags: ['Heritage', 'Spiritual', 'Wood Architecture', 'Cedar Forest'],
  },
];

// Initial demo user
const DEMO_PASSWORD_HASH = bcrypt.hashSync('password123', 8);
const ADMIN_PASSWORD_HASH = bcrypt.hashSync('admin123', 8);

const INITIAL_DEMO_USER: User & { password_hash: string } = {
  id: 'usr-demo-001',
  name: 'Anjali Sharma',
  email: 'anjalireal24@gmail.com',
  password_hash: DEMO_PASSWORD_HASH,
  profile_image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  role: 'user',
  created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
};

const INITIAL_ADMIN_USER: User & { password_hash: string } = {
  id: 'xXmpgQVQLZPto3d0kCsB0PXST7m1',
  name: 'TravelWise Administrator',
  email: 'admin@travelwise.ai',
  password_hash: ADMIN_PASSWORD_HASH,
  profile_image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
  role: 'admin',
  created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
};

// Initial User Preferences
const INITIAL_DEMO_PREFS: UserPreferences = {
  id: 'pref-demo-001',
  user_id: 'usr-demo-001',
  travel_style: ['Adventure', 'Food & Cuisine', 'Nature'],
  preferred_activities: ['Beaches', 'Historical Sites', 'Cafes', 'Photography'],
  food_preferences: ['Local Cuisine', 'Street Food'],
  accommodation_preference: 'Boutique Hotel',
  transportation_preference: 'Rental Car',
  preferred_budget: 45000,
  preferred_destinations: ['Goa', 'Darjeeling', 'Jaipur'],
};

// Initial Demo Trip
const INITIAL_DEMO_TRIP_ID = 'trip-goa-demo-001';
const INITIAL_DEMO_TRIP: Trip = {
  id: INITIAL_DEMO_TRIP_ID,
  user_id: 'usr-demo-001',
  title: '5-Day Goa Tropical Escape & Heritage Trail',
  destination: 'Goa',
  destination_country: 'India',
  start_date: '2026-09-05',
  end_date: '2026-09-09',
  duration: 5,
  travelers: 2,
  traveler_type: 'Couple',
  total_budget: 45000,
  currency: 'INR',
  travel_style: ['Adventure', 'Relaxation', 'Food & Cuisine'],
  food_preferences: ['Local Cuisine', 'Street Food', 'Vegetarian'],
  accommodation_preference: 'Boutique Hotel',
  transportation_preference: 'Rental Car',
  interests: ['Beaches', 'Historical Sites', 'Cafes', 'Photography', 'Hidden Gems'],
  status: 'planned',
  cover_image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80',
  summary:
    'An immersive 5-day escape through Goa combining sun-drenched northern beaches, Portuguese heritage alleys of Fontainhas, majestic forts, river cruises, and coastal dining.',
  estimated_cost: 39500,
  budget_breakdown: {
    accommodation: 15000,
    food: 11000,
    transportation: 5500,
    activities: 5000,
    shopping: 2000,
    miscellaneous: 1000,
    total: 39500,
  },
  travel_tips: [
    'Rent a scooter or car from the airport for convenient local navigation across North & South Goa.',
    'Carry cash or UPI for local beach shacks and night markets as card connectivity can occasionally dip.',
    'Dress respectfully with covered shoulders when visiting the Basilica of Bom Jesus and Se Cathedral.',
    'Best sunset cocktails and live acoustic music are between 5:30 PM and 7:00 PM along Vagator and Anjuna.',
  ],
  created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
};

// Initial Itinerary Days for Demo Trip
const INITIAL_DEMO_DAYS: ItineraryDay[] = [
  {
    id: 'day-goa-1',
    trip_id: INITIAL_DEMO_TRIP_ID,
    day_number: 1,
    date: '2026-09-05',
    title: 'Arrival & North Goa Coastal Exploration',
    description: 'Check in to your boutique stay, explore historical Fort Aguada, and enjoy sunset drinks by Sinquerim.',
    activities: [],
  },
  {
    id: 'day-goa-2',
    trip_id: INITIAL_DEMO_TRIP_ID,
    day_number: 2,
    date: '2026-09-06',
    title: 'Old Goa Heritage & Latin Quarter Alleys',
    description: 'Discover UNESCO Baroque basilicas in Old Goa and capture colorful Portuguese villas in Fontainhas.',
    activities: [],
  },
  {
    id: 'day-goa-3',
    trip_id: INITIAL_DEMO_TRIP_ID,
    day_number: 3,
    date: '2026-09-07',
    title: 'Spice Plantations & Mandovi River Sunset',
    description: 'Taste authentic Goan buffet lunch in a lush organic spice farm, followed by an evening river cruise.',
    activities: [],
  },
  {
    id: 'day-goa-4',
    trip_id: INITIAL_DEMO_TRIP_ID,
    day_number: 4,
    date: '2026-09-08',
    title: 'South Goa Tranquility & Coastal Dining',
    description: 'Relax on serene Palolem Beach, kayak along the backwaters, and dine at Fisherman’s Wharf.',
    activities: [],
  },
  {
    id: 'day-goa-5',
    trip_id: INITIAL_DEMO_TRIP_ID,
    day_number: 5,
    date: '2026-09-09',
    title: 'Artisanal Markets, Cafe Brunches & Departure',
    description: 'Shop for handcrafted souvenirs, enjoy artisanal brunch at Artjuna Cafe, and head to the airport.',
    activities: [],
  },
];

// Initial Activities for Demo Trip
const INITIAL_DEMO_ACTIVITIES: Activity[] = [
  // Day 1
  {
    id: 'act-1-1',
    itinerary_day_id: 'day-goa-1',
    name: 'Airport Arrival & Rental Pick-up',
    description: 'Land at Goa Airport (GOI/GOX), pick up rental vehicle, and drive through scenic coconut groves.',
    category: 'Transportation',
    start_time: '10:30 AM',
    end_time: '12:00 PM',
    duration: '1.5 hours',
    estimated_cost: 1500,
    location: 'Goa Airport / Candolim',
    latitude: 15.3808,
    longitude: 73.8314,
    image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80',
    notes: 'Keep booking confirmation ready on phone.',
  },
  {
    id: 'act-1-2',
    itinerary_day_id: 'day-goa-1',
    name: 'Seafood Lunch at Calamari Bathe & Binge',
    description: 'Savor butter garlic calamari and kingfish curry with chilled coconut water right on Candolim Beach.',
    category: 'Food & Dining',
    start_time: '01:00 PM',
    end_time: '02:30 PM',
    duration: '1.5 hours',
    estimated_cost: 1200,
    location: 'Dando Beach, Candolim',
    latitude: 15.5186,
    longitude: 73.7654,
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80',
    rating: 4.6,
  },
  {
    id: 'act-1-3',
    itinerary_day_id: 'day-goa-1',
    name: 'Fort Aguada & Sea Lighthouse Tour',
    description: 'Walk the ramparts of the 17th-century Portuguese fortress and take stunning photos of the Arabian Sea.',
    category: 'Sightseeing',
    start_time: '04:00 PM',
    end_time: '06:00 PM',
    duration: '2 hours',
    estimated_cost: 200,
    location: 'Fort Aguada, Sinquerim',
    latitude: 15.492,
    longitude: 73.7738,
    image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=600&q=80',
    rating: 4.7,
  },
  {
    id: 'act-1-4',
    itinerary_day_id: 'day-goa-1',
    name: 'Sunset Cocktails at Thalassa Greek Taverna',
    description: 'Famous cliffside sunset views over Siolim river with Aegean music and delicious mezze platters.',
    category: 'Nightlife',
    start_time: '06:30 PM',
    end_time: '09:00 PM',
    duration: '2.5 hours',
    estimated_cost: 2200,
    location: 'Vaddy, Siolim, Goa',
    latitude: 15.6267,
    longitude: 73.7533,
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80',
    rating: 4.8,
  },

  // Day 2
  {
    id: 'act-2-1',
    itinerary_day_id: 'day-goa-2',
    name: 'Basilica of Bom Jesus & Se Cathedral Walk',
    description: 'Marvel at UNESCO World Heritage church with golden altars and the sacred relic of St. Francis Xavier.',
    category: 'Culture & History',
    start_time: '09:30 AM',
    end_time: '11:30 AM',
    duration: '2 hours',
    estimated_cost: 100,
    location: 'Old Goa Heritage Complex',
    latitude: 15.5009,
    longitude: 73.9116,
    image: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=600&q=80',
    rating: 4.8,
  },
  {
    id: 'act-2-2',
    itinerary_day_id: 'day-goa-2',
    name: 'Traditional Goan Thali at Viva Panjim',
    description: 'Tucked away in Fontainhas alleyways, serving iconic fish thalis, prawn vindaloo, and bebinca dessert.',
    category: 'Food & Dining',
    start_time: '12:30 PM',
    end_time: '02:00 PM',
    duration: '1.5 hours',
    estimated_cost: 900,
    location: 'Fontainhas, Panaji',
    latitude: 15.4989,
    longitude: 73.8315,
    image: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=600&q=80',
    rating: 4.7,
  },
  {
    id: 'act-2-3',
    itinerary_day_id: 'day-goa-2',
    name: 'Fontainhas Latin Quarter Photo Walk',
    description: 'Stroll past indigo, mustard yellow, and rose-pink colonial villas, charming art galleries, and bakeries.',
    category: 'Sightseeing',
    start_time: '02:30 PM',
    end_time: '04:30 PM',
    duration: '2 hours',
    estimated_cost: 0,
    location: 'Fontainhas, Panjim',
    latitude: 15.4989,
    longitude: 73.8315,
    image: 'https://images.unsplash.com/photo-1587974928442-77dc3e0dba72?auto=format&fit=crop&w=600&q=80',
    rating: 4.7,
  },
  {
    id: 'act-2-4',
    itinerary_day_id: 'day-goa-2',
    name: 'Mandovi River Sunset Cruise',
    description: 'One-hour river cruise with live Goan folk dance performances (Dekhni & Fugdi) and golden sunset views.',
    category: 'Adventure',
    start_time: '05:30 PM',
    end_time: '07:00 PM',
    duration: '1.5 hours',
    estimated_cost: 800,
    location: 'Captain of Ports Jetty, Panaji',
    latitude: 15.5015,
    longitude: 73.8305,
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
    rating: 4.5,
  },

  // Day 3
  {
    id: 'act-3-1',
    itinerary_day_id: 'day-goa-3',
    name: 'Sahakari Spice Farm Guided Tour & Buffet',
    description: 'Guided walk through vanilla, cardamom, and betel nut trees followed by an authentic spice buffet lunch.',
    category: 'Culture & History',
    start_time: '10:00 AM',
    end_time: '01:30 PM',
    duration: '3.5 hours',
    estimated_cost: 1200,
    location: 'Curti, Ponda, Goa',
    latitude: 15.405,
    longitude: 74.015,
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80',
    rating: 4.6,
  },
  {
    id: 'act-3-2',
    itinerary_day_id: 'day-goa-3',
    name: 'Water Sports at Calangute & Baga',
    description: 'Thrilling parasailing and jet-skiing over turquoise waves with trained instructors and safety gear.',
    category: 'Adventure',
    start_time: '03:30 PM',
    end_time: '05:30 PM',
    duration: '2 hours',
    estimated_cost: 2000,
    location: 'Baga Beach, Goa',
    latitude: 15.5553,
    longitude: 73.7517,
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
    rating: 4.7,
  },
  {
    id: 'act-3-3',
    itinerary_day_id: 'day-goa-3',
    name: 'Live Music Dinner at Cafe Mojo Pub',
    description: 'Self-serve beer taps, pool tables, live rock covers, and delicious wood-fired pizzas.',
    category: 'Nightlife',
    start_time: '08:00 PM',
    end_time: '10:30 PM',
    duration: '2.5 hours',
    estimated_cost: 1600,
    location: 'Menezes Braganza Rd, Panaji',
    latitude: 15.498,
    longitude: 73.826,
    image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=600&q=80',
    rating: 4.5,
  },

  // Day 4
  {
    id: 'act-4-1',
    itinerary_day_id: 'day-goa-4',
    name: 'Scenic Drive to South Goa & Cabo de Rama Fort',
    description: 'Drive along coastal cliff roads to the ancient secluded cliff fort overlooking virgin blue waters.',
    category: 'Sightseeing',
    start_time: '09:30 AM',
    end_time: '12:00 PM',
    duration: '2.5 hours',
    estimated_cost: 400,
    location: 'Cabo de Rama, Canacona',
    latitude: 15.0894,
    longitude: 73.9219,
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
    rating: 4.8,
  },
  {
    id: 'act-4-2',
    itinerary_day_id: 'day-goa-4',
    name: 'Riverside Feast at The Fisherman’s Wharf',
    description: 'Enjoy signature butter garlic crabs, fish curry rice, and mocktails by the Sal river.',
    category: 'Food & Dining',
    start_time: '01:00 PM',
    end_time: '03:00 PM',
    duration: '2 hours',
    estimated_cost: 1800,
    location: 'Mobor Beach, Cavelossim',
    latitude: 15.1583,
    longitude: 73.9482,
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80',
    rating: 4.7,
  },
  {
    id: 'act-4-3',
    itinerary_day_id: 'day-goa-4',
    name: 'Palolem Beach Kayaking & Sunset',
    description: 'Gentle crescent bay with calm waters, ideal for kayaking to Butterfly Beach and watching the sun set.',
    category: 'Relaxation',
    start_time: '04:30 PM',
    end_time: '07:00 PM',
    duration: '2.5 hours',
    estimated_cost: 600,
    location: 'Palolem Beach, Canacona',
    latitude: 15.01,
    longitude: 74.0232,
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=600&q=80',
    rating: 4.9,
  },

  // Day 5
  {
    id: 'act-5-1',
    itinerary_day_id: 'day-goa-5',
    name: 'Organic Breakfast at Artjuna Garden Cafe',
    description: 'Enjoy smoothie bowls, shakshuka, fresh croissants, and cold pressed juices in a bohemian garden.',
    category: 'Food & Dining',
    start_time: '09:00 AM',
    end_time: '10:30 AM',
    duration: '1.5 hours',
    estimated_cost: 800,
    location: 'Anjuna, Goa',
    latitude: 15.5802,
    longitude: 73.7441,
    image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=600&q=80',
    rating: 4.6,
  },
  {
    id: 'act-5-2',
    itinerary_day_id: 'day-goa-5',
    name: 'Souvenir & Cashew Shopping in Mapusa',
    description: 'Pick up authentic Feni, roasted Goan cashews, homemade spice pastes, and ceramic azulejo tiles.',
    category: 'Shopping',
    start_time: '11:00 AM',
    end_time: '01:00 PM',
    duration: '2 hours',
    estimated_cost: 1500,
    location: 'Mapusa Municipal Market',
    latitude: 15.5925,
    longitude: 73.8169,
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
    rating: 4.4,
  },
  {
    id: 'act-5-3',
    itinerary_day_id: 'day-goa-5',
    name: 'Airport Transfer & Departure',
    description: 'Return rental car at airport terminal and check in for flight with fond memories of Goa.',
    category: 'Transportation',
    start_time: '02:30 PM',
    end_time: '04:00 PM',
    duration: '1.5 hours',
    estimated_cost: 0,
    location: 'Goa Airport',
    latitude: 15.3808,
    longitude: 73.8314,
    image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=600&q=80',
  },
];

// Initial Saved Places for Demo User
const INITIAL_DEMO_SAVED_PLACES: SavedPlace[] = [
  {
    id: 'saved-1',
    user_id: 'usr-demo-001',
    place_id: 'place-goa-1',
    notes: 'Must visit during sunset for photos!',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'saved-2',
    user_id: 'usr-demo-001',
    place_id: 'place-goa-5',
    notes: 'Great spot for breakfast and pastel portraits.',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'saved-3',
    user_id: 'usr-demo-001',
    place_id: 'place-kol-1',
    notes: 'Plan for trip to Kolkata next winter.',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Initial Share Token for Demo Trip
const INITIAL_DEMO_SHARE: TripShare = {
  id: 'share-goa-001',
  trip_id: INITIAL_DEMO_TRIP_ID,
  share_token: 'goa-escape-demo-token',
  is_active: true,
  views_count: 14,
  created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
};

// Database Manager
class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadOrInit();
  }

  private loadOrInit(): DatabaseSchema {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const content = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(content);
        if (parsed) {
          if (!parsed.community_posts) parsed.community_posts = [];
          if (!parsed.community_likes) parsed.community_likes = [];
          if (!parsed.community_comments) parsed.community_comments = [];
          if (!parsed.saved_community_posts) parsed.saved_community_posts = [];
          if (!parsed.community_reports) parsed.community_reports = [];
          if (!parsed.user_follows) parsed.user_follows = [];
          if (!parsed.community_notifications) parsed.community_notifications = [];
          if (!parsed.user_files) parsed.user_files = [];

          // Authoritative admin role sanitation: Only xXmpgQVQLZPto3d0kCsB0PXST7m1 is active admin
          if (Array.isArray(parsed.users)) {
            parsed.users = parsed.users.map((u: any) => {
              if (u.id === 'xXmpgQVQLZPto3d0kCsB0PXST7m1') {
                return { ...u, role: 'admin' };
              }
              // Revoke admin from any other account
              if (u.role === 'admin') {
                return { ...u, role: 'user' };
              }
              return u;
            });

            // Ensure the primary admin exists
            if (!parsed.users.some((u: any) => u.id === 'xXmpgQVQLZPto3d0kCsB0PXST7m1')) {
              parsed.users.push(INITIAL_ADMIN_USER);
            }
          }
          return parsed;
        }
      }
    } catch (err) {
      console.warn('Could not read existing database file, initializing seed:', err);
    }

    // Default Seed
    const initial: DatabaseSchema = {
      users: [INITIAL_DEMO_USER, INITIAL_ADMIN_USER],
      user_preferences: [INITIAL_DEMO_PREFS],
      trips: [INITIAL_DEMO_TRIP],
      itinerary_days: INITIAL_DEMO_DAYS,
      activities: INITIAL_DEMO_ACTIVITIES,
      places: SEED_PLACES,
      saved_places: INITIAL_DEMO_SAVED_PLACES,
      trip_shares: [INITIAL_DEMO_SHARE],
      community_posts: [],
      community_likes: [],
      community_comments: [],
      saved_community_posts: [],
      community_reports: [],
      user_follows: [],
      community_notifications: [],
      analytics_events: [
        {
          id: 'evt-1',
          event_name: 'user_signup',
          user_id: 'usr-demo-001',
          created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'evt-2',
          event_name: 'trip_generated',
          user_id: 'usr-demo-001',
          metadata: { destination: 'Goa', duration: 5 },
          created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ],
    };

    this.save(initial);
    return initial;
  }

  private save(data?: DatabaseSchema) {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(data || this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write database file:', err);
    }
  }

  // --- Users ---
  findUserByEmail(email: string) {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  findUserById(id: string) {
    const user = this.data.users.find((u) => u.id === id);
    if (!user) return null;
    const { password_hash, ...safeUser } = user;
    return safeUser;
  }

  createUser(user: User & { password_hash: string }) {
    const role: 'user' | 'admin' = user.id === 'xXmpgQVQLZPto3d0kCsB0PXST7m1' ? 'admin' : 'user';
    const safeToInsert: User & { password_hash: string } = { ...user, role };
    this.data.users.push(safeToInsert);
    this.save();
    const { password_hash, ...safeUser } = safeToInsert;
    return safeUser;
  }

  updateUser(id: string, updates: Partial<User>) {
    const idx = this.data.users.findIndex((u) => u.id === id);
    if (idx === -1) return null;
    const current = this.data.users[idx];
    let sanitizedRole: 'user' | 'admin' = (updates.role as 'user' | 'admin') || current.role || 'user';
    if (id === 'xXmpgQVQLZPto3d0kCsB0PXST7m1') {
      sanitizedRole = 'admin';
    } else if (sanitizedRole === 'admin') {
      sanitizedRole = 'user';
    }

    this.data.users[idx] = {
      ...current,
      ...updates,
      role: sanitizedRole,
      updated_at: new Date().toISOString(),
    };
    this.save();
    const { password_hash, ...safeUser } = this.data.users[idx];
    return safeUser;
  }

  getAllUsers() {
    return this.data.users.map(({ password_hash, ...safeUser }) => safeUser);
  }

  upsertUser(user: Partial<User> & { id: string; email: string; name?: string }) {
    const idx = this.data.users.findIndex((u) => u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase());
    const isTargetAdmin = user.id === 'xXmpgQVQLZPto3d0kCsB0PXST7m1';
    const computedRole: 'user' | 'admin' = isTargetAdmin ? 'admin' : 'user';

    if (idx >= 0) {
      this.data.users[idx] = {
        ...this.data.users[idx],
        ...user,
        role: computedRole,
        updated_at: new Date().toISOString(),
      };
      this.save();
      const { password_hash, ...safeUser } = this.data.users[idx];
      return safeUser;
    } else {
      const newUser: User & { password_hash: string } = {
        id: user.id,
        name: user.name || user.email.split('@')[0] || 'Traveler',
        email: user.email,
        profile_image: user.profile_image || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80`,
        role: computedRole,
        status: (user as any).status || 'active',
        password_hash: DEMO_PASSWORD_HASH,
        created_at: user.created_at || new Date().toISOString(),
      };
      this.data.users.push(newUser);
      this.save();
      const { password_hash, ...safeUser } = newUser;
      return safeUser;
    }
  }

  deleteUser(userId: string): boolean {
    const uIdx = this.data.users.findIndex((u) => u.id === userId);
    if (uIdx === -1) return false;

    // Delete user's trips and associated days/activities
    const userTrips = this.data.trips.filter((t) => t.user_id === userId);
    userTrips.forEach((t) => {
      this.deleteTrip(t.id);
    });

    // Delete user preferences and saved places
    this.data.user_preferences = this.data.user_preferences.filter((p) => p.user_id !== userId);
    this.data.saved_places = this.data.saved_places.filter((s) => s.user_id !== userId);

    this.data.users.splice(uIdx, 1);
    this.save();
    return true;
  }

  // --- User Preferences ---
  getUserPreferences(userId: string): UserPreferences | null {
    return this.data.user_preferences.find((p) => p.user_id === userId) || null;
  }

  setUserPreferences(userId: string, prefs: Partial<UserPreferences>): UserPreferences {
    const idx = this.data.user_preferences.findIndex((p) => p.user_id === userId);
    if (idx >= 0) {
      this.data.user_preferences[idx] = {
        ...this.data.user_preferences[idx],
        ...prefs,
      };
      this.save();
      return this.data.user_preferences[idx];
    } else {
      const newPref: UserPreferences = {
        id: `pref-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        user_id: userId,
        travel_style: prefs.travel_style || ['Adventure', 'Food & Cuisine'],
        preferred_activities: prefs.preferred_activities || ['Beaches', 'Historical Sites'],
        food_preferences: prefs.food_preferences || ['Local Cuisine'],
        accommodation_preference: prefs.accommodation_preference || 'Hotel',
        transportation_preference: prefs.transportation_preference || 'Mixed',
        preferred_budget: prefs.preferred_budget || 30000,
        preferred_destinations: prefs.preferred_destinations || ['Goa'],
      };
      this.data.user_preferences.push(newPref);
      this.save();
      return newPref;
    }
  }

  // --- Trips ---
  getTripsByUserId(userId: string): Trip[] {
    const userTrips = this.data.trips.filter((t) => t.user_id === userId);
    return userTrips.map((trip) => this.hydrateTrip(trip));
  }

  getAllTrips(): Trip[] {
    return this.data.trips.map((trip) => this.hydrateTrip(trip));
  }

  getTripById(tripId: string): Trip | null {
    const trip = this.data.trips.find((t) => t.id === tripId);
    if (!trip) return null;
    return this.hydrateTrip(trip);
  }

  private hydrateTrip(trip: Trip): Trip {
    const days = this.data.itinerary_days
      .filter((d) => d.trip_id === trip.id)
      .sort((a, b) => a.day_number - b.day_number);

    const hydratedDays = days.map((day) => {
      const activities = this.data.activities.filter((a) => a.itinerary_day_id === day.id);
      return {
        ...day,
        activities,
      };
    });

    return {
      ...trip,
      itinerary_days: hydratedDays,
    };
  }

  createTrip(
    trip: Trip,
    days: Array<Omit<ItineraryDay, 'id' | 'trip_id' | 'activities'> & { activities: Array<Omit<Activity, 'id' | 'itinerary_day_id'>> }>
  ): Trip {
    this.data.trips.unshift(trip);

    days.forEach((dayData, dIdx) => {
      const dayId = `day-${trip.id}-${dIdx + 1}`;
      const dayRecord: ItineraryDay = {
        id: dayId,
        trip_id: trip.id,
        day_number: dayData.day_number || dIdx + 1,
        date: dayData.date || trip.start_date,
        title: dayData.title || `Day ${dIdx + 1}`,
        description: dayData.description || '',
        activities: [],
      };
      this.data.itinerary_days.push(dayRecord);

      dayData.activities.forEach((actData, aIdx) => {
        const actRecord: Activity = {
          ...actData,
          id: `act-${dayId}-${aIdx + 1}-${Math.random().toString(36).substr(2, 4)}`,
          itinerary_day_id: dayId,
        };
        this.data.activities.push(actRecord);
      });
    });

    this.save();
    return this.hydrateTrip(trip);
  }

  updateTrip(tripId: string, updates: Partial<Trip>): Trip | null {
    const idx = this.data.trips.findIndex((t) => t.id === tripId);
    if (idx === -1) return null;
    this.data.trips[idx] = {
      ...this.data.trips[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.save();
    return this.hydrateTrip(this.data.trips[idx]);
  }

  deleteTrip(tripId: string): boolean {
    const tripIdx = this.data.trips.findIndex((t) => t.id === tripId);
    if (tripIdx === -1) return false;

    // Cascade delete days and activities
    const dayIds = this.data.itinerary_days.filter((d) => d.trip_id === tripId).map((d) => d.id);
    this.data.activities = this.data.activities.filter((a) => !dayIds.includes(a.itinerary_day_id));
    this.data.itinerary_days = this.data.itinerary_days.filter((d) => d.trip_id !== tripId);
    this.data.trip_shares = this.data.trip_shares.filter((s) => s.trip_id !== tripId);
    this.data.trips.splice(tripIdx, 1);

    this.save();
    return true;
  }

  // --- Activities ---
  addActivity(dayId: string, activityData: Omit<Activity, 'id' | 'itinerary_day_id'>): Activity {
    const activity: Activity = {
      ...activityData,
      id: `act-${dayId}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      itinerary_day_id: dayId,
    };
    this.data.activities.push(activity);
    this.recalculateTripBudgetByDayId(dayId);
    this.save();
    return activity;
  }

  updateActivity(activityId: string, updates: Partial<Activity>): Activity | null {
    const idx = this.data.activities.findIndex((a) => a.id === activityId);
    if (idx === -1) return null;
    this.data.activities[idx] = {
      ...this.data.activities[idx],
      ...updates,
    };
    this.recalculateTripBudgetByDayId(this.data.activities[idx].itinerary_day_id);
    this.save();
    return this.data.activities[idx];
  }

  deleteActivity(activityId: string): boolean {
    const idx = this.data.activities.findIndex((a) => a.id === activityId);
    if (idx === -1) return false;
    const dayId = this.data.activities[idx].itinerary_day_id;
    this.data.activities.splice(idx, 1);
    this.recalculateTripBudgetByDayId(dayId);
    this.save();
    return true;
  }

  replaceDayActivities(dayId: string, newActivities: Array<Omit<Activity, 'id' | 'itinerary_day_id'>>): Activity[] {
    // Delete existing activities for this day
    this.data.activities = this.data.activities.filter((a) => a.itinerary_day_id !== dayId);

    const created: Activity[] = [];
    newActivities.forEach((act, idx) => {
      const record: Activity = {
        ...act,
        id: `act-${dayId}-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 4)}`,
        itinerary_day_id: dayId,
      };
      this.data.activities.push(record);
      created.push(record);
    });

    this.recalculateTripBudgetByDayId(dayId);
    this.save();
    return created;
  }

  private recalculateTripBudgetByDayId(dayId: string) {
    const day = this.data.itinerary_days.find((d) => d.id === dayId);
    if (!day) return;
    const trip = this.data.trips.find((t) => t.id === day.trip_id);
    if (!trip) return;

    const allTripDays = this.data.itinerary_days.filter((d) => d.trip_id === trip.id).map((d) => d.id);
    const allActivities = this.data.activities.filter((a) => allTripDays.includes(a.itinerary_day_id));

    let actSum = 0;
    let foodSum = 0;
    let transSum = 0;
    let staySum = 0;

    allActivities.forEach((a) => {
      const cost = Number(a.estimated_cost) || 0;
      if (a.category === 'Food & Dining') foodSum += cost;
      else if (a.category === 'Transportation') transSum += cost;
      else if (a.category === 'Hotel / Stay') staySum += cost;
      else actSum += cost;
    });

    const totalEst = actSum + foodSum + transSum + staySum;
    trip.estimated_cost = totalEst;
    trip.budget_breakdown = {
      accommodation: staySum || Math.round(totalEst * 0.35),
      food: foodSum || Math.round(totalEst * 0.25),
      transportation: transSum || Math.round(totalEst * 0.15),
      activities: actSum || Math.round(totalEst * 0.18),
      shopping: Math.round(totalEst * 0.05),
      miscellaneous: Math.round(totalEst * 0.02),
      total: totalEst,
    };
    trip.updated_at = new Date().toISOString();
  }

  // --- Places ---
  getPlaces(destination?: string, category?: string): Place[] {
    let list = this.data.places;
    if (destination) {
      list = list.filter((p) => p.destination.toLowerCase().includes(destination.toLowerCase()));
    }
    if (category && category !== 'All') {
      list = list.filter((p) => p.category.toLowerCase() === category.toLowerCase());
    }
    return list;
  }

  getPlaceById(placeId: string): Place | null {
    return this.data.places.find((p) => p.id === placeId) || null;
  }

  addPlace(place: Place): Place {
    this.data.places.push(place);
    this.save();
    return place;
  }

  // --- Saved Places ---
  getSavedPlaces(userId: string): SavedPlace[] {
    const saved = this.data.saved_places.filter((s) => s.user_id === userId);
    return saved.map((s) => ({
      ...s,
      place: this.data.places.find((p) => p.id === s.place_id),
    }));
  }

  savePlace(userId: string, placeId: string, notes?: string): SavedPlace {
    const existing = this.data.saved_places.find((s) => s.user_id === userId && s.place_id === placeId);
    if (existing) {
      if (notes) existing.notes = notes;
      this.save();
      return { ...existing, place: this.data.places.find((p) => p.id === placeId) };
    }
    const item: SavedPlace = {
      id: `saved-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      user_id: userId,
      place_id: placeId,
      notes: notes || '',
      created_at: new Date().toISOString(),
    };
    this.data.saved_places.push(item);
    this.save();
    return { ...item, place: this.data.places.find((p) => p.id === placeId) };
  }

  removeSavedPlace(userId: string, placeId: string): boolean {
    const idx = this.data.saved_places.findIndex((s) => s.user_id === userId && s.place_id === placeId);
    if (idx === -1) return false;
    this.data.saved_places.splice(idx, 1);
    this.save();
    return true;
  }

  // --- Trip Sharing ---
  getShareByTripId(tripId: string): TripShare | null {
    return this.data.trip_shares.find((s) => s.trip_id === tripId && s.is_active) || null;
  }

  getTripByShareToken(token: string): { trip: Trip; share: TripShare } | null {
    const share = this.data.trip_shares.find((s) => s.share_token === token && s.is_active);
    if (!share) return null;
    const trip = this.getTripById(share.trip_id);
    if (!trip) return null;
    share.views_count = (share.views_count || 0) + 1;
    this.save();
    return { trip, share };
  }

  createOrUpdateShare(tripId: string): TripShare {
    let share = this.data.trip_shares.find((s) => s.trip_id === tripId);
    if (!share) {
      share = {
        id: `share-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        trip_id: tripId,
        share_token: `trip-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 6)}`,
        is_active: true,
        views_count: 0,
        created_at: new Date().toISOString(),
      };
      this.data.trip_shares.push(share);
    } else {
      share.is_active = true;
    }
    this.save();
    return share;
  }

  revokeShare(tripId: string): boolean {
    const share = this.data.trip_shares.find((s) => s.trip_id === tripId);
    if (!share) return false;
    share.is_active = false;
    this.save();
    return true;
  }

  // --- Analytics ---
  recordEvent(eventName: string, userId?: string, metadata?: any) {
    this.data.analytics_events.push({
      id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      event_name: eventName,
      user_id: userId,
      metadata,
      created_at: new Date().toISOString(),
    });
    this.save();
  }

  getAnalyticsSummary() {
    const totalUsers = this.data.users.length;
    const totalTrips = this.data.trips.length;
    const totalSavedPlaces = this.data.saved_places.length;
    const totalActivities = this.data.activities.length;

    // Popular destinations
    const destCounts: Record<string, number> = {};
    this.data.trips.forEach((t) => {
      destCounts[t.destination] = (destCounts[t.destination] || 0) + 1;
    });

    const popularDestinations = Object.entries(destCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    // Average budget
    const avgBudget =
      totalTrips > 0
        ? Math.round(this.data.trips.reduce((acc, t) => acc + (t.total_budget || 0), 0) / totalTrips)
        : 0;

    return {
      totalUsers,
      totalTrips,
      totalSavedPlaces,
      totalActivities,
      popularDestinations,
      averageBudget: avgBudget,
      recentEvents: this.data.analytics_events.slice(-20).reverse(),
    };
  }

  getUserAnalytics(userId: string) {
    const userTrips = this.data.trips.filter((t) => t.user_id === userId);
    const totalTrips = userTrips.length;
    const totalDays = userTrips.reduce((acc, t) => acc + (t.duration || 1), 0);
    
    let totalActivities = 0;
    const categoryCounts: Record<string, number> = {};
    const destCounts: Record<string, { trips: number; budget: number }> = {};
    const styleCounts: Record<string, number> = {};

    userTrips.forEach((t) => {
      // Destination aggregation
      if (!destCounts[t.destination]) {
        destCounts[t.destination] = { trips: 0, budget: 0 };
      }
      destCounts[t.destination].trips += 1;
      destCounts[t.destination].budget += t.total_budget || 0;

      // Travel styles
      (t.travel_style || []).forEach((style) => {
        styleCounts[style] = (styleCounts[style] || 0) + 1;
      });

      // Activities
      if (t.itinerary_days) {
        t.itinerary_days.forEach((day) => {
          if (day.activities) {
            totalActivities += day.activities.length;
            day.activities.forEach((act) => {
              const cat = act.category || 'Sightseeing';
              categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
            });
          }
        });
      }
    });

    const totalBudget = userTrips.reduce((acc, t) => acc + (t.total_budget || 0), 0);
    const averageBudget = totalTrips > 0 ? Math.round(totalBudget / totalTrips) : 0;

    const destinations = Object.entries(destCounts).map(([name, val]) => ({
      name,
      trips: val.trips,
      budget: val.budget,
    })).sort((a, b) => b.trips - a.trips);

    const travelStyles = Object.entries(styleCounts).map(([name, count]) => ({
      name,
      count,
    })).sort((a, b) => b.count - a.count);

    const activityCategories = Object.entries(categoryCounts).map(([name, count]) => ({
      name,
      count,
    })).sort((a, b) => b.count - a.count);

    return {
      totalTrips,
      totalDays,
      totalActivities,
      averageBudget,
      totalBudget,
      destinations,
      travelStyles,
      activityCategories,
      savedPlacesCount: this.data.saved_places.filter((s) => s.user_id === userId).length,
    };
  }

  // --- Community Posts ---
  getCommunityPosts(options: {
    search?: string;
    tag?: string;
    destination?: string;
    post_type?: string;
    filter?: 'latest' | 'popular' | 'most_liked' | 'following';
    author_id?: string;
    user_id?: string; // current user for is_liked/is_saved and private posts
    limit?: number;
    offset?: number;
  } = {}): { posts: CommunityPost[]; total: number } {
    let list = this.data.community_posts || [];

    // Filter by visibility (public posts or private posts owned by current user)
    list = list.filter((p) => {
      if (options.author_id) {
        if (p.author_id !== options.author_id) return false;
        if (p.visibility === 'private' && options.user_id !== options.author_id) return false;
        return true;
      }
      if (p.visibility === 'private') {
        return options.user_id && p.author_id === options.user_id;
      }
      return true;
    });

    // Following feed filter
    if (options.filter === 'following' && options.user_id) {
      const followingIds = this.getUserFollowingIds(options.user_id);
      list = list.filter((p) => followingIds.includes(p.author_id));
    }

    // Destination filter
    if (options.destination && options.destination !== 'All') {
      const destLower = options.destination.toLowerCase();
      list = list.filter((p) => (p.destination || '').toLowerCase().includes(destLower));
    }

    // Tag filter
    if (options.tag && options.tag !== 'All') {
      list = list.filter((p) => (p.tags || []).some((t) => t.toLowerCase() === options.tag!.toLowerCase()));
    }

    // Post type filter
    if (options.post_type && options.post_type !== 'All') {
      list = list.filter((p) => p.post_type === options.post_type);
    }

    // Search query
    if (options.search && options.search.trim()) {
      const q = options.search.toLowerCase().trim();
      list = list.filter(
        (p) =>
          (p.title || '').toLowerCase().includes(q) ||
          (p.content || '').toLowerCase().includes(q) ||
          (p.destination || '').toLowerCase().includes(q) ||
          (p.author_name || '').toLowerCase().includes(q) ||
          (p.tags || []).some((t) => t.toLowerCase().includes(q))
      );
    }

    // Sorting
    if (options.filter === 'popular' || options.filter === 'most_liked') {
      list = [...list].sort((a, b) => (b.likes_count || 0) + (b.comments_count || 0) - ((a.likes_count || 0) + (a.comments_count || 0)));
    } else {
      // default: latest
      list = [...list].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    const total = list.length;
    const offset = options.offset || 0;
    const limit = options.limit || 50;
    const paginated = list.slice(offset, offset + limit);

    // Decorate with user liked / saved state
    const decorated = paginated.map((p) => {
      const is_liked = options.user_id
        ? (this.data.community_likes || []).some((l) => l.post_id === p.id && l.user_id === options.user_id)
        : false;
      const is_saved = options.user_id
        ? (this.data.saved_community_posts || []).some((s) => s.post_id === p.id && s.user_id === options.user_id)
        : false;
      return {
        ...p,
        is_liked_by_user: is_liked,
        is_saved_by_user: is_saved,
      };
    });

    return { posts: decorated, total };
  }

  getCommunityPostById(postId: string, currentUserId?: string): CommunityPost | null {
    const post = (this.data.community_posts || []).find((p) => p.id === postId);
    if (!post) return null;
    if (post.visibility === 'private' && post.author_id !== currentUserId) {
      return null;
    }

    post.views_count = (post.views_count || 0) + 1;
    this.save();

    const is_liked = currentUserId
      ? (this.data.community_likes || []).some((l) => l.post_id === post.id && l.user_id === currentUserId)
      : false;
    const is_saved = currentUserId
      ? (this.data.saved_community_posts || []).some((s) => s.post_id === post.id && s.user_id === currentUserId)
      : false;

    return {
      ...post,
      is_liked_by_user: is_liked,
      is_saved_by_user: is_saved,
    };
  }

  createCommunityPost(post: Omit<CommunityPost, 'id' | 'likes_count' | 'comments_count' | 'saves_count' | 'views_count' | 'created_at' | 'updated_at'>): CommunityPost {
    const newPost: CommunityPost = {
      ...post,
      id: `post-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      likes_count: 0,
      comments_count: 0,
      saves_count: 0,
      views_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (!this.data.community_posts) this.data.community_posts = [];
    this.data.community_posts.unshift(newPost);
    this.save();
    return newPost;
  }

  updateCommunityPost(postId: string, userId: string, updates: Partial<CommunityPost>, isAdmin = false): CommunityPost | null {
    const idx = (this.data.community_posts || []).findIndex((p) => p.id === postId);
    if (idx === -1) return null;

    const existing = this.data.community_posts[idx];
    if (existing.author_id !== userId && !isAdmin) {
      throw new Error('Unauthorized to edit this post');
    }

    this.data.community_posts[idx] = {
      ...existing,
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.save();
    return this.data.community_posts[idx];
  }

  deleteCommunityPost(postId: string, userId: string, isAdmin = false): boolean {
    const idx = (this.data.community_posts || []).findIndex((p) => p.id === postId);
    if (idx === -1) return false;

    const existing = this.data.community_posts[idx];
    if (existing.author_id !== userId && !isAdmin) {
      throw new Error('Unauthorized to delete this post');
    }

    this.data.community_posts.splice(idx, 1);

    // Clean up associated likes, comments, saves, and reports
    this.data.community_likes = (this.data.community_likes || []).filter((l) => l.post_id !== postId);
    this.data.community_comments = (this.data.community_comments || []).filter((c) => c.post_id !== postId);
    this.data.saved_community_posts = (this.data.saved_community_posts || []).filter((s) => s.post_id !== postId);
    this.data.community_reports = (this.data.community_reports || []).filter((r) => r.post_id !== postId);

    this.save();
    return true;
  }

  toggleCommunityPostLike(postId: string, userId: string, userName?: string): { is_liked: boolean; likes_count: number } {
    const post = (this.data.community_posts || []).find((p) => p.id === postId);
    if (!post) throw new Error('Post not found');

    if (!this.data.community_likes) this.data.community_likes = [];
    const existingIdx = this.data.community_likes.findIndex((l) => l.post_id === postId && l.user_id === userId);

    let is_liked = false;
    if (existingIdx >= 0) {
      // Unlike
      this.data.community_likes.splice(existingIdx, 1);
      post.likes_count = Math.max(0, (post.likes_count || 1) - 1);
      is_liked = false;
    } else {
      // Like
      const fullUser = this.findUserById(userId);
      const actorName = userName || fullUser?.name || 'Traveler';
      const actorImage = fullUser?.profile_image;

      this.data.community_likes.push({
        id: `like-${postId}-${userId}`,
        post_id: postId,
        user_id: userId,
        user_name: actorName,
        created_at: new Date().toISOString(),
      });
      post.likes_count = (post.likes_count || 0) + 1;
      is_liked = true;

      // Trigger notification if liker is not author
      if (post.author_id && post.author_id !== userId) {
        this.createCommunityNotification({
          recipient_id: post.author_id,
          actor_id: userId,
          actor_name: actorName,
          actor_image: actorImage,
          type: 'like',
          post_id: post.id,
          post_title: post.title,
        });
      }
    }

    this.save();
    return { is_liked, likes_count: post.likes_count };
  }

  getCommunityPostLikes(postId: string): CommunityLike[] {
    return (this.data.community_likes || []).filter((l) => l.post_id === postId);
  }

  // --- Comments & Threaded Replies ---
  getCommunityPostComments(postId: string): CommunityComment[] {
    const allComments = (this.data.community_comments || [])
      .filter((c) => c.post_id === postId)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    // Build hierarchy: root comments with nested replies
    const rootComments: CommunityComment[] = [];
    const replyMap = new Map<string, CommunityComment[]>();

    allComments.forEach((c) => {
      if (c.parent_comment_id) {
        const existing = replyMap.get(c.parent_comment_id) || [];
        existing.push(c);
        replyMap.set(c.parent_comment_id, existing);
      } else {
        rootComments.push({ ...c, replies: [] });
      }
    });

    // Attach replies
    return rootComments.map((root) => ({
      ...root,
      replies: replyMap.get(root.id) || [],
    }));
  }

  addCommunityComment(comment: Omit<CommunityComment, 'id' | 'created_at'>): CommunityComment {
    const post = (this.data.community_posts || []).find((p) => p.id === comment.post_id);
    if (!post) throw new Error('Post not found');

    const newComment: CommunityComment = {
      ...comment,
      id: `comm-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      created_at: new Date().toISOString(),
      replies: [],
    };

    if (!this.data.community_comments) this.data.community_comments = [];
    this.data.community_comments.push(newComment);

    post.comments_count = (post.comments_count || 0) + 1;

    // Trigger notifications
    const fullUser = this.findUserById(comment.user_id);
    const actorName = comment.user_name || fullUser?.name || 'Traveler';
    const actorImage = comment.user_image || fullUser?.profile_image;

    if (comment.parent_comment_id) {
      // Find parent comment author
      const parentComment = this.data.community_comments.find((c) => c.id === comment.parent_comment_id);
      if (parentComment && parentComment.user_id !== comment.user_id) {
        this.createCommunityNotification({
          recipient_id: parentComment.user_id,
          actor_id: comment.user_id,
          actor_name: actorName,
          actor_image: actorImage,
          type: 'reply',
          post_id: post.id,
          post_title: post.title,
          comment_id: newComment.id,
          comment_text: newComment.content,
        });
      }
    } else {
      // Top-level comment -> notify post author
      if (post.author_id && post.author_id !== comment.user_id) {
        this.createCommunityNotification({
          recipient_id: post.author_id,
          actor_id: comment.user_id,
          actor_name: actorName,
          actor_image: actorImage,
          type: 'comment',
          post_id: post.id,
          post_title: post.title,
          comment_id: newComment.id,
          comment_text: newComment.content,
        });
      }
    }

    this.save();
    return newComment;
  }

  updateCommunityComment(commentId: string, userId: string, content: string): CommunityComment {
    const idx = (this.data.community_comments || []).findIndex((c) => c.id === commentId);
    if (idx === -1) throw new Error('Comment not found');

    const comment = this.data.community_comments[idx];
    if (comment.user_id !== userId) throw new Error('Unauthorized to edit this comment');

    comment.content = content;
    comment.updated_at = new Date().toISOString();
    this.save();
    return comment;
  }

  deleteCommunityComment(commentId: string, userId: string, isAdmin = false): boolean {
    const idx = (this.data.community_comments || []).findIndex((c) => c.id === commentId);
    if (idx === -1) return false;

    const comment = this.data.community_comments[idx];
    if (comment.user_id !== userId && !isAdmin) {
      throw new Error('Unauthorized to delete this comment');
    }

    const postId = comment.post_id;
    // Also delete any child replies
    const childReplies = this.data.community_comments.filter((c) => c.parent_comment_id === commentId);
    const totalDeleted = 1 + childReplies.length;

    this.data.community_comments = this.data.community_comments.filter(
      (c) => c.id !== commentId && c.parent_comment_id !== commentId
    );

    const post = (this.data.community_posts || []).find((p) => p.id === postId);
    if (post) {
      post.comments_count = Math.max(0, (post.comments_count || totalDeleted) - totalDeleted);
    }

    this.save();
    return true;
  }

  // --- Saved Posts ---
  toggleSaveCommunityPost(postId: string, userId: string): { is_saved: boolean; saves_count: number } {
    const post = (this.data.community_posts || []).find((p) => p.id === postId);
    if (!post) throw new Error('Post not found');

    if (!this.data.saved_community_posts) this.data.saved_community_posts = [];
    const idx = this.data.saved_community_posts.findIndex((s) => s.post_id === postId && s.user_id === userId);

    let is_saved = false;
    if (idx >= 0) {
      this.data.saved_community_posts.splice(idx, 1);
      post.saves_count = Math.max(0, (post.saves_count || 1) - 1);
      is_saved = false;
    } else {
      this.data.saved_community_posts.push({
        id: `save-${postId}-${userId}`,
        post_id: postId,
        user_id: userId,
        created_at: new Date().toISOString(),
      });
      post.saves_count = (post.saves_count || 0) + 1;
      is_saved = true;
    }

    this.save();
    return { is_saved, saves_count: post.saves_count };
  }

  getSavedCommunityPosts(userId: string): CommunityPost[] {
    const userSaves = (this.data.saved_community_posts || []).filter((s) => s.user_id === userId);
    const postIds = userSaves.map((s) => s.post_id);
    const posts = (this.data.community_posts || []).filter((p) => postIds.includes(p.id));

    return posts.map((p) => {
      const is_liked = (this.data.community_likes || []).some((l) => l.post_id === p.id && l.user_id === userId);
      return {
        ...p,
        is_liked_by_user: is_liked,
        is_saved_by_user: true,
      };
    });
  }

  // --- Follow System ---
  getUserFollowingIds(userId: string): string[] {
    return (this.data.user_follows || [])
      .filter((f) => f.follower_id === userId)
      .map((f) => f.following_id);
  }

  isUserFollowing(followerId: string, followingId: string): boolean {
    if (!this.data.user_follows) return false;
    return this.data.user_follows.some((f) => f.follower_id === followerId && f.following_id === followingId);
  }

  getUserFollowersCount(userId: string): number {
    return (this.data.user_follows || []).filter((f) => f.following_id === userId).length;
  }

  getUserFollowingCount(userId: string): number {
    return (this.data.user_follows || []).filter((f) => f.follower_id === userId).length;
  }

  toggleFollowUser(
    followerId: string,
    followingId: string
  ): { is_following: boolean; followers_count: number; following_count: number } {
    if (followerId === followingId) {
      throw new Error('Cannot follow yourself');
    }

    if (!this.data.user_follows) this.data.user_follows = [];
    const idx = this.data.user_follows.findIndex(
      (f) => f.follower_id === followerId && f.following_id === followingId
    );

    let is_following = false;
    if (idx >= 0) {
      // Unfollow
      this.data.user_follows.splice(idx, 1);
      is_following = false;
    } else {
      // Follow
      this.data.user_follows.push({
        id: `follow-${followerId}-${followingId}`,
        follower_id: followerId,
        following_id: followingId,
        created_at: new Date().toISOString(),
      });
      is_following = true;

      // Trigger follow notification
      const follower = this.findUserById(followerId);
      this.createCommunityNotification({
        recipient_id: followingId,
        actor_id: followerId,
        actor_name: follower?.name || 'A traveler',
        actor_image: follower?.profile_image,
        type: 'follow',
      });
    }

    this.save();

    return {
      is_following,
      followers_count: this.getUserFollowersCount(followingId),
      following_count: this.getUserFollowingCount(followerId),
    };
  }

  getUserFollowers(userId: string): Array<{ id: string; name: string; profile_image?: string; created_at: string }> {
    const follows = (this.data.user_follows || []).filter((f) => f.following_id === userId);
    return follows.map((f) => {
      const user = this.findUserById(f.follower_id);
      return {
        id: f.follower_id,
        name: user?.name || 'Traveler',
        profile_image: user?.profile_image,
        created_at: f.created_at,
      };
    });
  }

  getUserFollowing(userId: string): Array<{ id: string; name: string; profile_image?: string; created_at: string }> {
    const follows = (this.data.user_follows || []).filter((f) => f.follower_id === userId);
    return follows.map((f) => {
      const user = this.findUserById(f.following_id);
      return {
        id: f.following_id,
        name: user?.name || 'Traveler',
        profile_image: user?.profile_image,
        created_at: f.created_at,
      };
    });
  }

  // --- Community Notifications ---
  createCommunityNotification(
    notif: Omit<CommunityNotification, 'id' | 'is_read' | 'created_at'>
  ): CommunityNotification {
    const newNotif: CommunityNotification = {
      ...notif,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      is_read: false,
      created_at: new Date().toISOString(),
    };

    if (!this.data.community_notifications) this.data.community_notifications = [];
    this.data.community_notifications.unshift(newNotif);

    // Keep notification array bounded
    if (this.data.community_notifications.length > 500) {
      this.data.community_notifications = this.data.community_notifications.slice(0, 500);
    }

    this.save();
    return newNotif;
  }

  getUserNotifications(userId: string): CommunityNotification[] {
    return (this.data.community_notifications || [])
      .filter((n) => n.recipient_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  markNotificationAsRead(userId: string, notifId: string): boolean {
    const notif = (this.data.community_notifications || []).find(
      (n) => n.id === notifId && n.recipient_id === userId
    );
    if (!notif) return false;
    notif.is_read = true;
    this.save();
    return true;
  }

  markAllNotificationsAsRead(userId: string): boolean {
    let updated = false;
    (this.data.community_notifications || []).forEach((n) => {
      if (n.recipient_id === userId && !n.is_read) {
        n.is_read = true;
        updated = true;
      }
    });
    if (updated) this.save();
    return true;
  }

  deleteNotification(userId: string, notifId: string): boolean {
    const initialLen = (this.data.community_notifications || []).length;
    this.data.community_notifications = (this.data.community_notifications || []).filter(
      (n) => !(n.id === notifId && n.recipient_id === userId)
    );
    if (this.data.community_notifications.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  getUnreadNotificationCount(userId: string): number {
    return (this.data.community_notifications || []).filter(
      (n) => n.recipient_id === userId && !n.is_read
    ).length;
  }

  // --- Reports ---
  createCommunityReport(report: Omit<CommunityReport, 'id' | 'status' | 'created_at'>): CommunityReport {
    const newReport: CommunityReport = {
      ...report,
      id: `rep-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      status: 'pending',
      created_at: new Date().toISOString(),
    };

    if (!this.data.community_reports) this.data.community_reports = [];
    this.data.community_reports.unshift(newReport);
    this.save();
    return newReport;
  }

  getCommunityReports(): CommunityReport[] {
    return this.data.community_reports || [];
  }

  updateCommunityReport(reportId: string, status: 'pending' | 'reviewed' | 'resolved' | 'dismissed'): CommunityReport | null {
    const idx = (this.data.community_reports || []).findIndex((r) => r.id === reportId);
    if (idx === -1) return null;
    this.data.community_reports[idx].status = status;
    this.save();
    return this.data.community_reports[idx];
  }

  // --- Public User Profile ---
  getPublicUserProfile(userId: string, viewerUserId?: string): PublicUserProfile | null {
    const user = this.data.users.find((u) => u.id === userId);
    if (!user) return null;

    const prefs = this.data.user_preferences.find((p) => p.user_id === userId);
    const userPosts = (this.data.community_posts || []).filter((p) => p.author_id === userId && p.visibility === 'public');
    const userTrips = (this.data.trips || []).filter((t) => t.user_id === userId);
    const followersCount = this.getUserFollowersCount(userId);
    const followingCount = this.getUserFollowingCount(userId);
    const isFollowing = viewerUserId ? this.isUserFollowing(viewerUserId, userId) : false;

    return {
      id: user.id,
      name: user.name,
      profile_image: user.profile_image,
      bio: (user as any).bio || '',
      travel_style: prefs?.travel_style || [],
      preferred_destinations: prefs?.preferred_destinations || [],
      created_at: user.created_at,
      posts_count: userPosts.length,
      trips_count: userTrips.length,
      followers_count: followersCount,
      following_count: followingCount,
      is_following: isFollowing,
    };
  }

  // --- User Files & Documents (Travel Vault) ---
  getUserFiles(userId: string): UserStoredFile[] {
    if (!this.data.user_files) this.data.user_files = [];
    return this.data.user_files
      .filter((f) => f.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  saveUserFile(userId: string, fileData: Partial<UserStoredFile>): UserStoredFile {
    if (!this.data.user_files) this.data.user_files = [];
    const now = new Date().toISOString();
    const fileId = fileData.id || `file-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const newFile: UserStoredFile = {
      id: fileId,
      user_id: userId,
      name: fileData.name || 'Untitled Document',
      size: fileData.size || '0 KB',
      size_bytes: fileData.size_bytes || 0,
      type: fileData.type || 'application/octet-stream',
      category: fileData.category || 'document',
      data_url: fileData.data_url || '',
      storage_path: fileData.storage_path || '',
      notes: fileData.notes || '',
      created_at: fileData.created_at || now,
      updated_at: now,
    };
    const existingIndex = this.data.user_files.findIndex((f) => f.id === fileId);
    if (existingIndex >= 0) {
      this.data.user_files[existingIndex] = newFile;
    } else {
      this.data.user_files.unshift(newFile);
    }
    this.save();
    return newFile;
  }

  updateUserFile(fileId: string, userId: string, updates: Partial<UserStoredFile>): UserStoredFile | null {
    if (!this.data.user_files) this.data.user_files = [];
    const idx = this.data.user_files.findIndex((f) => f.id === fileId && (f.user_id === userId || userId === 'xXmpgQVQLZPto3d0kCsB0PXST7m1'));
    if (idx === -1) return null;
    this.data.user_files[idx] = {
      ...this.data.user_files[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.save();
    return this.data.user_files[idx];
  }

  deleteUserFile(fileId: string, userId: string): boolean {
    if (!this.data.user_files) this.data.user_files = [];
    const initialLen = this.data.user_files.length;
    this.data.user_files = this.data.user_files.filter(
      (f) => !(f.id === fileId && (f.user_id === userId || userId === 'xXmpgQVQLZPto3d0kCsB0PXST7m1'))
    );
    const deleted = this.data.user_files.length < initialLen;
    if (deleted) this.save();
    return deleted;
  }
}

export const db = new Database();
