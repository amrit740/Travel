import { GoogleGenAI } from '@google/genai';
import { CreateTripInput, Activity, BudgetBreakdown } from '../../src/types/index';
import { SEED_PLACES } from '../db/database';

// Initialize Gemini Client
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

export interface GeneratedDayPlan {
  day_number: number;
  date: string;
  title: string;
  description: string;
  activities: Array<{
    name: string;
    description: string;
    category:
      | 'Sightseeing'
      | 'Food & Dining'
      | 'Adventure'
      | 'Culture & History'
      | 'Relaxation'
      | 'Shopping'
      | 'Nightlife'
      | 'Transportation'
      | 'Hotel / Stay';
    start_time: string;
    end_time?: string;
    duration?: string;
    estimated_cost: number;
    location: string;
    latitude: number;
    longitude: number;
    image?: string;
    notes?: string;
  }>;
}

export interface AITripGenerationResult {
  title: string;
  summary: string;
  estimated_cost: number;
  cover_image: string;
  travel_tips: string[];
  budget_breakdown: BudgetBreakdown;
  days: GeneratedDayPlan[];
}

export async function generateAITrip(input: CreateTripInput): Promise<AITripGenerationResult> {
  const ai = getGeminiClient();

  const startDate = new Date(input.start_date);
  const endDate = new Date(input.end_date);
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  const calculatedDuration = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);

  if (ai) {
    try {
      const prompt = `You are a world-class travel planner AI. Create a highly realistic, customized, day-by-day travel itinerary for:
- Destination: ${input.destination}
- Duration: ${calculatedDuration} days (From ${input.start_date} to ${input.end_date})
- Travelers: ${input.travelers} (${input.traveler_type})
- Target Budget: ${input.budget} ${input.currency || 'INR'}
- Travel Style: ${input.travel_style?.join(', ') || 'Exploration, Sightseeing'}
- Food Preferences: ${input.food_preferences?.join(', ') || 'Local cuisine, Vegetarian and Non-Vegetarian'}
- Accommodation: ${input.accommodation || 'Hotel'}
- Transportation: ${input.transportation || 'Mixed (Taxi / Public)'}
- Key Interests: ${input.interests?.join(', ') || 'Must-see attractions, culture, culinary, hidden gems'}
- User-Marked Priority Places on Map: ${input.marked_places && input.marked_places.length > 0 ? input.marked_places.map(p => `${p.name} (${p.category || 'Spot'}, Coords: ${p.latitude}, ${p.longitude}${p.notes ? ` - ${p.notes}` : ''})`).join('; ') : 'None'}
- Special notes: ${input.special_notes || 'None'}

CRITICAL GUIDELINES:
1. Schedule geographically clustered activities per day to prevent unnecessary travel back-and-forth.
${input.marked_places && input.marked_places.length > 0 ? `2. MANDATORY: The user has marked ${input.marked_places.length} specific place(s) on their map: [${input.marked_places.map(p => p.name).join(', ')}]. You MUST include and schedule these marked places into the itinerary days!` : ''}
3. Provide realistic activity times (Morning 09:00 AM, Afternoon 01:00 PM, Evening 05:00 PM, Night 08:00 PM).
4. Include real, authentic attraction and restaurant names with actual approximate coordinates (latitude and longitude for ${input.destination}).
5. Ensure estimated costs across activities, food, stay, and transit fit realistically within the user's budget of ${input.budget} ${input.currency || 'INR'}.
6. Return ONLY a valid JSON object matching this schema. Do not wrap in markdown or prose.

Expected JSON Structure:
{
  "title": "Creative catchy trip title",
  "summary": "2-3 sentences overview of the trip experience",
  "estimated_cost": number,
  "travel_tips": ["tip 1", "tip 2", "tip 3", "tip 4"],
  "budget_breakdown": {
    "accommodation": number,
    "food": number,
    "transportation": number,
    "activities": number,
    "shopping": number,
    "miscellaneous": number,
    "total": number
  },
  "days": [
    {
      "day_number": 1,
      "date": "${input.start_date}",
      "title": "Theme of Day 1",
      "description": "Brief description of the day",
      "activities": [
        {
          "name": "Activity or Place Name",
          "description": "Engaging description of what to experience",
          "category": "Sightseeing" | "Food & Dining" | "Adventure" | "Culture & History" | "Relaxation" | "Shopping" | "Nightlife" | "Transportation",
          "start_time": "09:30 AM",
          "end_time": "11:30 AM",
          "duration": "2 hours",
          "estimated_cost": number,
          "location": "Specific place or area name",
          "latitude": float,
          "longitude": float,
          "notes": "Helpful insider tip"
        }
      ]
    }
  ]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.7,
        },
      });

      const text = response.text?.trim();
      if (text) {
        // Strip markdown backticks if present
        const cleaned = text.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        const parsed = JSON.parse(cleaned) as AITripGenerationResult;

        // Verify minimal integrity
        if (parsed.title && Array.isArray(parsed.days) && parsed.days.length > 0) {
          // Assign nice Unsplash cover image based on destination
          parsed.cover_image = getCoverImageForDestination(input.destination);
          return parsed;
        }
      }
    } catch (err) {
      console.warn('Gemini API call failed, using intelligent fallback generator:', err);
    }
  }

  // Fallback intelligent trip generator
  return generateFallbackTrip(input, calculatedDuration);
}

export async function regenerateSingleActivity(params: {
  destination: string;
  dayTitle: string;
  currentActivity: Activity;
  userBudget: number;
  preferences: string[];
}): Promise<Partial<Activity>> {
  const ai = getGeminiClient();

  if (ai) {
    try {
      const prompt = `The traveler wants an exciting alternative replacement for an activity in ${params.destination}.
Current activity: "${params.currentActivity.name}" (${params.currentActivity.category}, cost: ${params.currentActivity.estimated_cost}) on day "${params.dayTitle}".
Traveler preferences: ${params.preferences.join(', ')}.
Provide ONE distinct, high-quality replacement activity in ${params.destination}.

Return ONLY a JSON object:
{
  "name": "New Activity Name",
  "description": "Vivid 2-sentence description",
  "category": "Sightseeing" | "Food & Dining" | "Adventure" | "Culture & History" | "Relaxation" | "Shopping" | "Nightlife",
  "start_time": "${params.currentActivity.start_time}",
  "end_time": "${params.currentActivity.end_time || '2 hours later'}",
  "duration": "${params.currentActivity.duration || '2 hours'}",
  "estimated_cost": number,
  "location": "Place Name, ${params.destination}",
  "latitude": float,
  "longitude": float,
  "notes": "Insider tip"
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.8,
        },
      });

      const text = response.text?.trim();
      if (text) {
        const cleaned = text.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        return JSON.parse(cleaned);
      }
    } catch (err) {
      console.warn('Gemini single activity regeneration error, using fallback:', err);
    }
  }

  // Fallback alternative activity
  const destPlaces = SEED_PLACES.filter((p) => p.destination.toLowerCase().includes(params.destination.toLowerCase()));
  const alternative = destPlaces.find((p) => p.name !== params.currentActivity.name) || {
    name: `Scenic Sunset Spot in ${params.destination}`,
    description: `A relaxing local exploration spot offering authentic local ambiance and photo opportunities.`,
    category: 'Sightseeing' as const,
    estimated_cost: 300,
    address: `${params.destination} Center`,
    latitude: params.currentActivity.latitude + (Math.random() - 0.5) * 0.02,
    longitude: params.currentActivity.longitude + (Math.random() - 0.5) * 0.02,
  };

  return {
    name: alternative.name,
    description: alternative.description,
    category: (alternative.category === 'Attraction' ? 'Sightseeing' : alternative.category === 'Restaurant' ? 'Food & Dining' : 'Sightseeing'),
    start_time: params.currentActivity.start_time,
    end_time: params.currentActivity.end_time,
    duration: params.currentActivity.duration || '2 hours',
    estimated_cost: alternative.estimated_cost,
    location: alternative.address || `${alternative.name}, ${params.destination}`,
    latitude: alternative.latitude,
    longitude: alternative.longitude,
    notes: 'Handpicked local recommendation.',
  };
}

export async function processAIChat(params: {
  tripContext: any;
  userMessage: string;
  history: Array<{ sender: string; text: string }>;
}): Promise<{
  text: string;
  suggestedActions?: Array<{
    type: 'ADD_ACTIVITY' | 'REMOVE_ACTIVITY' | 'UPDATE_ACTIVITY' | 'REGENERATE_DAY' | 'OPTIMIZE_BUDGET' | 'CHANGE_RESTAURANT' | 'CHANGE_HOTEL';
    label: string;
    payload?: any;
  }>;
}> {
  const ai = getGeminiClient();

  if (ai) {
    try {
      const prompt = `You are a friendly, intelligent AI Travel Concierge assisting a user with their trip to ${params.tripContext.destination}.
Trip Context:
- Destination: ${params.tripContext.destination}
- Duration: ${params.tripContext.duration} days (${params.tripContext.start_date} to ${params.tripContext.end_date})
- Travelers: ${params.tripContext.travelers} (${params.tripContext.traveler_type})
- Budget: ${params.tripContext.total_budget} ${params.tripContext.currency} (Estimated: ${params.tripContext.estimated_cost})
- Travel style: ${params.tripContext.travel_style?.join(', ')}

Chat History:
${params.history.map((h) => `${h.sender.toUpperCase()}: ${h.text}`).join('\n')}

User Request: "${params.userMessage}"

Respond thoughtfully and helpfully to the traveler. If the traveler is asking to modify their trip (e.g. reduce cost, replace an activity, add food spot, change pace), provide actionable structured action buttons they can click to apply the changes.

Return ONLY a JSON response:
{
  "text": "Helpful, concise, friendly advice and explanation",
  "suggestedActions": [
    {
      "type": "ADD_ACTIVITY" | "REMOVE_ACTIVITY" | "UPDATE_ACTIVITY" | "REGENERATE_DAY" | "OPTIMIZE_BUDGET" | "CHANGE_RESTAURANT" | "CHANGE_HOTEL",
      "label": "Clickable Button Label",
      "payload": { ... }
    }
  ]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.7,
        },
      });

      const text = response.text?.trim();
      if (text) {
        const cleaned = text.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        return JSON.parse(cleaned);
      }
    } catch (err) {
      console.warn('Gemini chat error, using rule-based response:', err);
    }
  }

  // Rule-based conversational assistant fallback
  const query = params.userMessage.toLowerCase();
  if (query.includes('cheap') || query.includes('budget') || query.includes('expensive') || query.includes('reduce')) {
    return {
      text: `I've analyzed your itinerary for ${params.tripContext.destination}. We can optimize your budget by swapping high-cost dining for authentic local eateries and incorporating scenic free attractions and walking routes. Would you like me to optimize your entire trip budget?`,
      suggestedActions: [
        {
          type: 'OPTIMIZE_BUDGET',
          label: '⚡ Optimize Trip Budget Now',
        },
      ],
    };
  }

  if (query.includes('food') || query.includes('restaurant') || query.includes('eat') || query.includes('dinner')) {
    return {
      text: `Great choice! In ${params.tripContext.destination}, the local culinary scene is outstanding. I recommend trying regional specialties like authentic coastal curries, fresh bakeries, and street thalis. Would you like to add a top-rated dining spot to Day 2?`,
      suggestedActions: [
        {
          type: 'ADD_ACTIVITY',
          label: `🍴 Add Authentic Dinner to Day 2`,
          payload: {
            dayNumber: 2,
            activity: {
              name: `Authentic Heritage Dinner in ${params.tripContext.destination}`,
              description: 'Sample celebrated chef specials and local seasonal delicacies in a vibrant heritage setting.',
              category: 'Food & Dining',
              start_time: '08:00 PM',
              end_time: '10:00 PM',
              estimated_cost: 1200,
              location: `${params.tripContext.destination} Center`,
              latitude: 15.498,
              longitude: 73.826,
            },
          },
        },
      ],
    };
  }

  if (query.includes('nightlife') || query.includes('party') || query.includes('club')) {
    return {
      text: `${params.tripContext.destination} has fantastic evening entertainment ranging from live acoustic beach shacks to vibrant music lounges. I can add a lively evening lounge experience to your schedule!`,
      suggestedActions: [
        {
          type: 'ADD_ACTIVITY',
          label: `🎵 Add Live Music Lounge to Day 1`,
          payload: {
            dayNumber: 1,
            activity: {
              name: `Sunset & Live Music Lounge`,
              description: 'Enjoy handcrafted cocktails, ocean breeze, and acoustic rock performances.',
              category: 'Nightlife',
              start_time: '08:30 PM',
              end_time: '11:00 PM',
              estimated_cost: 1800,
              location: `Beachfront Strip, ${params.tripContext.destination}`,
              latitude: 15.58,
              longitude: 73.74,
            },
          },
        },
      ],
    };
  }

  return {
    text: `Here are my recommendations for your trip to ${params.tripContext.destination}: The weather is typically ideal for morning sightseeing before 11:30 AM and evening sunset walks after 4:30 PM. I can help adjust activity timings, swap restaurants, or regenerate any day's plan.`,
    suggestedActions: [
      {
        type: 'REGENERATE_DAY',
        label: '🔄 Refresh Day 1 Activities',
        payload: { dayNumber: 1 },
      },
      {
        type: 'OPTIMIZE_BUDGET',
        label: '💰 Check Budget Balance',
      },
    ],
  };
}

// Fallback high-quality trip generator
function generateFallbackTrip(input: CreateTripInput, duration: number): AITripGenerationResult {
  const dest = input.destination;
  const days: GeneratedDayPlan[] = [];
  const startDate = new Date(input.start_date || new Date());

  const placeCoords = getCoordinatesForDestination(dest);

  // Template activity themes
  const activityThemes = [
    {
      dayTitle: 'Arrival, Iconic Landmarks & Welcome Sunset',
      desc: 'Settle in, get oriented with landmark monuments, and enjoy an evening sunset view.',
      acts: [
        {
          name: `Arrival & Check-in at ${input.accommodation || 'Boutique Hotel'}`,
          desc: `Arrive in ${dest}, complete check-in, freshen up, and prepare for exploration.`,
          cat: 'Hotel / Stay' as const,
          time: '11:00 AM',
          dur: '1.5 hours',
          cost: 0,
          loc: `${dest} Central Area`,
        },
        {
          name: `Traditional Welcome Lunch & Local Delicacies`,
          desc: `Taste celebrated local dishes, fresh breads, and regional spices at an authentic dining hall.`,
          cat: 'Food & Dining' as const,
          time: '01:00 PM',
          dur: '1.5 hours',
          cost: 700,
          loc: `Old Town, ${dest}`,
        },
        {
          name: `Historic Landmark & Architectural Exploration`,
          desc: `Tour iconic heritage monument, admire intricate historical craftsmanship, and take photos.`,
          cat: 'Sightseeing' as const,
          time: '03:30 PM',
          dur: '2.5 hours',
          cost: 300,
          loc: `Heritage District, ${dest}`,
        },
        {
          name: `Panoramic Sunset Viewpoint & Evening Chai / Coffee`,
          desc: `Watch golden hour illumination across the city skyline with refreshing local brew and snacks.`,
          cat: 'Relaxation' as const,
          time: '06:30 PM',
          dur: '1.5 hours',
          cost: 250,
          loc: `Sunset Hill, ${dest}`,
        },
      ],
    },
    {
      dayTitle: 'Cultural Heritage, Art Galleries & Local Bazaars',
      desc: 'Dive into deep cultural traditions, master artisan workshops, and bustling local markets.',
      acts: [
        {
          name: `Morning Heritage Walk & Ancient Spiritual Shrine`,
          desc: `Experience serene morning prayers, tranquil courtyards, and centuries-old spiritual architecture.`,
          cat: 'Culture & History' as const,
          time: '09:00 AM',
          dur: '2 hours',
          cost: 150,
          loc: `Ancient Temple Quarter, ${dest}`,
        },
        {
          name: `Artisanal Craft Workshop & Handloom Studios`,
          desc: `Observe master craftsmen weaving textiles, carving woodwork, and sculpting pottery.`,
          cat: 'Sightseeing' as const,
          time: '11:30 AM',
          dur: '1.5 hours',
          cost: 200,
          loc: `Artisan Village, ${dest}`,
        },
        {
          name: `Courtyard Garden Lunch & Thali Experience`,
          desc: `Multi-course traditional thali served on brass or banana leaf with seasonal vegetables and chutneys.`,
          cat: 'Food & Dining' as const,
          time: '01:30 PM',
          dur: '1.5 hours',
          cost: 850,
          loc: `Heritage Bistro, ${dest}`,
        },
        {
          name: `Bustling Local Spice & Souvenir Bazaar`,
          desc: `Bargain for aromatic whole spices, handmade leather goods, brassware, and local snacks.`,
          cat: 'Shopping' as const,
          time: '04:00 PM',
          dur: '2.5 hours',
          cost: 1200,
          loc: `Central Bazaar, ${dest}`,
        },
        {
          name: `Rooftop Dinner with Folk Music Performance`,
          desc: `Enjoy stargazing, dinner, and traditional acoustic instrumental performances.`,
          cat: 'Nightlife' as const,
          time: '08:00 PM',
          dur: '2 hours',
          cost: 1400,
          loc: `Rooftop Terrace, ${dest}`,
        },
      ],
    },
    {
      dayTitle: 'Nature Escapes, Scenic Trails & Coastal / Mountain Vistas',
      desc: 'Connect with serene natural landscapes, scenic trails, and outdoor adventures.',
      acts: [
        {
          name: `Sunrise Nature Walk & Botanical Gardens`,
          desc: `Lush green trails with exotic flora, towering canopy trees, and crisp morning mountain/sea breeze.`,
          cat: 'Adventure' as const,
          time: '08:00 AM',
          dur: '2 hours',
          cost: 150,
          loc: `Botanical Sanctuary, ${dest}`,
        },
        {
          name: `Fresh Bakery Breakfast & Artisan Coffee`,
          desc: `Warm sourdough pastries, fresh fruits, and single-origin estate coffee.`,
          cat: 'Food & Dining' as const,
          time: '10:30 AM',
          dur: '1 hour',
          cost: 450,
          loc: `Garden Cafe, ${dest}`,
        },
        {
          name: `Boat Cruise / Wildlife Safari Exploration`,
          desc: `Guided water cruise or eco-safari spotting native bird species and panoramic landscapes.`,
          cat: 'Sightseeing' as const,
          time: '12:30 PM',
          dur: '2.5 hours',
          cost: 900,
          loc: `River Jetty / Safari Gate, ${dest}`,
        },
        {
          name: `Seafood / Farm-to-Table Riverside Lunch`,
          desc: `Freshly prepared seasonal specialties right next to tranquil waters.`,
          cat: 'Food & Dining' as const,
          time: '03:30 PM',
          dur: '1.5 hours',
          cost: 800,
          loc: `Riverside Pavilions, ${dest}`,
        },
      ],
    },
    {
      dayTitle: 'Hidden Gems, Secret Cafes & Relaxed Vibes',
      desc: 'Venture off the beaten track to discover secluded spots, indie cafes, and historic lanes.',
      acts: [
        {
          name: `Off-Beat Village Trail & Photography Tour`,
          desc: `Discover vintage cobblestone lanes, pastel painted doorways, and quiet historic quarters.`,
          cat: 'Sightseeing' as const,
          time: '09:30 AM',
          dur: '2 hours',
          cost: 100,
          loc: `Old Quarter Lanes, ${dest}`,
        },
        {
          name: `Hidden Courtyard Cafe Brunch`,
          desc: `Cozy atmosphere, smoothie bowls, wood-fired artisanal snacks, and fresh smoothies.`,
          cat: 'Food & Dining' as const,
          time: '12:00 PM',
          dur: '1.5 hours',
          cost: 650,
          loc: `Secret Alley Cafe, ${dest}`,
        },
        {
          name: `Spa & Ayurvedic Wellness / Relaxation Session`,
          desc: `Rejuvenate with traditional soothing herbal therapies and aromatic massage oils.`,
          cat: 'Relaxation' as const,
          time: '03:00 PM',
          dur: '2 hours',
          cost: 1800,
          loc: `Wellness Sanctuary, ${dest}`,
        },
        {
          name: `Fine Dining Candlelight Dinner`,
          desc: `Signature culinary pairings and candlelit ambiance to celebrate your journey.`,
          cat: 'Food & Dining' as const,
          time: '07:30 PM',
          dur: '2 hours',
          cost: 1800,
          loc: `Fine Dine Pavilion, ${dest}`,
        },
      ],
    },
    {
      dayTitle: 'Souvenir Collecting, Cafe Brunch & Farewell',
      desc: 'Collect handcrafted gifts, savor a leisurely brunch, and prepare for departure.',
      acts: [
        {
          name: `Leisurely Morning Cafe & Breakfast`,
          desc: `Relax with specialty coffee, pancakes, and reflecting on your favorite memories.`,
          cat: 'Food & Dining' as const,
          time: '09:30 AM',
          dur: '1.5 hours',
          cost: 500,
          loc: `Sunrise Bistro, ${dest}`,
        },
        {
          name: `Last-Minute Souvenirs & Specialty Food Box Shopping`,
          desc: `Pick up famous regional sweets, tea/spices, postcards, and gifts for friends and family.`,
          cat: 'Shopping' as const,
          time: '11:30 AM',
          dur: '1.5 hours',
          cost: 1000,
          loc: `Main Market Road, ${dest}`,
        },
        {
          name: `Airport / Transit Terminal Transfer`,
          desc: `Head to airport/train terminal with fond memories of ${dest}.`,
          cat: 'Transportation' as const,
          time: '02:00 PM',
          dur: '1.5 hours',
          cost: 600,
          loc: `${dest} Transit Hub`,
        },
      ],
    },
  ];

  let totalEstCost = 0;

  for (let i = 0; i < duration; i++) {
    const dayDate = new Date(startDate);
    dayDate.setDate(startDate.getDate() + i);
    const dateStr = dayDate.toISOString().split('T')[0];

    const theme = activityThemes[i % activityThemes.length];
    const dayActs: GeneratedDayPlan['activities'] = theme.acts.map((a, aIdx) => {
      totalEstCost += a.cost;
      return {
        name: a.name,
        description: a.desc,
        category: a.cat,
        start_time: a.time,
        duration: a.dur,
        estimated_cost: a.cost,
        location: a.loc,
        latitude: placeCoords.lat + (Math.random() - 0.5) * 0.04,
        longitude: placeCoords.lng + (Math.random() - 0.5) * 0.04,
        notes: 'Pre-booking advised during peak weekend hours.',
      };
    });

    // If user marked specific places, distribute them across the itinerary days
    if (input.marked_places && input.marked_places.length > 0) {
      const placesForThisDay = input.marked_places.filter((_, idx) => idx % duration === i);
      placesForThisDay.forEach((p, pIdx) => {
        const catName = p.category === 'Food' || p.category === 'Restaurant'
          ? ('Food & Dining' as const)
          : p.category === 'Hotel' || p.category === 'Stay'
          ? ('Hotel / Stay' as const)
          : ('Sightseeing' as const);
        
        const markedCost = p.estimated_cost || 400;
        totalEstCost += markedCost;

        dayActs.splice(Math.min(1 + pIdx, dayActs.length - 1), 0, {
          name: p.name,
          description: p.notes || `Priority visit to ${p.name} in ${dest}. Highly recommended spot marked by traveler.`,
          category: catName,
          start_time: pIdx === 0 ? '11:30 AM' : '04:30 PM',
          duration: '2 hours',
          estimated_cost: markedCost,
          location: p.address || `${p.name}, ${dest}`,
          latitude: p.latitude,
          longitude: p.longitude,
          image: p.image,
          notes: p.is_custom ? '📍 Custom marked spot on map' : '★ Handpicked marked place',
        });
      });
    }

    days.push({
      day_number: i + 1,
      date: dateStr,
      title: theme.dayTitle,
      description: theme.desc,
      activities: dayActs,
    });
  }

  // Add hotel stay estimate per night
  const hotelPerNight = Math.round((input.budget * 0.35) / duration);
  const totalWithHotel = totalEstCost + hotelPerNight * duration;

  return {
    title: `${duration}-Day Personalized ${dest} Explorer`,
    summary: `A carefully curated ${duration}-day journey across ${dest} balancing landmark historical sights, culinary trails, relaxed evenings, and rich cultural experiences tailored to your travel style.`,
    estimated_cost: Math.min(totalWithHotel, Math.round(input.budget * 0.95)),
    cover_image: getCoverImageForDestination(dest),
    travel_tips: [
      `Carry light cotton clothing, comfortable walking sneakers, and sunscreen for daytime exploration.`,
      `Digital payments (UPI/cards) are widely accepted across ${dest}, but keep small cash bills for autos and street food.`,
      `Book popular museum and monument entry tickets online in advance to bypass ticket queues.`,
      `Stay hydrated with fresh coconut water and local teas during outdoor sightseeing walks.`,
    ],
    budget_breakdown: {
      accommodation: Math.round(totalWithHotel * 0.38),
      food: Math.round(totalWithHotel * 0.28),
      transportation: Math.round(totalWithHotel * 0.14),
      activities: Math.round(totalWithHotel * 0.12),
      shopping: Math.round(totalWithHotel * 0.05),
      miscellaneous: Math.round(totalWithHotel * 0.03),
      total: totalWithHotel,
    },
    days,
  };
}

function getCoordinatesForDestination(dest: string): { lat: number; lng: number } {
  const d = dest.toLowerCase();
  if (d.includes('goa')) return { lat: 15.2993, lng: 74.124 };
  if (d.includes('agra') || d.includes('taj mahal')) return { lat: 27.1751, lng: 78.0421 };
  if (d.includes('manali') || d.includes('solang')) return { lat: 32.2432, lng: 77.1892 };
  if (d.includes('shimla')) return { lat: 31.1048, lng: 77.1734 };
  if (d.includes('kolkata')) return { lat: 22.5726, lng: 88.3639 };
  if (d.includes('darjeeling')) return { lat: 27.041, lng: 88.2663 };
  if (d.includes('jaipur')) return { lat: 26.9124, lng: 75.7873 };
  if (d.includes('udaipur')) return { lat: 24.5854, lng: 73.7125 };
  if (d.includes('jodhpur')) return { lat: 26.2389, lng: 73.0243 };
  if (d.includes('jaisalmer')) return { lat: 26.9157, lng: 70.9083 };
  if (d.includes('delhi')) return { lat: 28.6139, lng: 77.209 };
  if (d.includes('mumbai')) return { lat: 18.922, lng: 72.8347 };
  if (d.includes('pune')) return { lat: 18.5204, lng: 73.8567 };
  if (d.includes('bengaluru') || d.includes('bangalore')) return { lat: 12.9716, lng: 77.5946 };
  if (d.includes('mysore') || d.includes('mysuru')) return { lat: 12.2958, lng: 76.6394 };
  if (d.includes('hampi')) return { lat: 15.335, lng: 76.46 };
  if (d.includes('varanasi') || d.includes('kashi')) return { lat: 25.3176, lng: 82.9739 };
  if (d.includes('ayodhya')) return { lat: 26.7922, lng: 82.1998 };
  if (d.includes('lucknow')) return { lat: 26.8467, lng: 80.9462 };
  if (d.includes('rishikesh')) return { lat: 30.0869, lng: 78.2676 };
  if (d.includes('haridwar')) return { lat: 29.9457, lng: 78.1642 };
  if (d.includes('amritsar')) return { lat: 31.62, lng: 74.8765 };
  if (d.includes('srinagar') || d.includes('kashmir')) return { lat: 34.0837, lng: 74.7973 };
  if (d.includes('gulmarg')) return { lat: 34.0484, lng: 74.3805 };
  if (d.includes('ladakh') || d.includes('leh')) return { lat: 34.1526, lng: 77.5771 };
  if (d.includes('kerala') || d.includes('kochi') || d.includes('munnar') || d.includes('alleppey')) return { lat: 9.9312, lng: 76.2673 };
  if (d.includes('varkala')) return { lat: 8.7379, lng: 76.7163 };
  if (d.includes('chennai')) return { lat: 13.0827, lng: 80.2707 };
  if (d.includes('madurai')) return { lat: 9.9252, lng: 78.1198 };
  if (d.includes('hyderabad')) return { lat: 17.385, lng: 78.4867 };
  if (d.includes('sikkim') || d.includes('gangtok')) return { lat: 27.3389, lng: 88.6065 };
  if (d.includes('shillong') || d.includes('meghalaya') || d.includes('cherrapunji')) return { lat: 25.5788, lng: 91.8933 };
  if (d.includes('kaziranga') || d.includes('assam') || d.includes('guwahati')) return { lat: 26.5775, lng: 93.1711 };
  if (d.includes('puri') || d.includes('konark') || d.includes('odisha')) return { lat: 19.8135, lng: 85.8312 };
  if (d.includes('andaman') || d.includes('havelock') || d.includes('port blair')) return { lat: 11.9761, lng: 92.9876 };
  return { lat: 20.5937, lng: 78.9629 };
}

function getCoverImageForDestination(dest: string): string {
  const d = dest.toLowerCase();
  if (d.includes('goa'))
    return 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80';
  if (d.includes('agra') || d.includes('taj mahal'))
    return 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80';
  if (d.includes('manali') || d.includes('himachal'))
    return 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80';
  if (d.includes('kolkata'))
    return 'https://images.unsplash.com/photo-1558431382-27e303142255?auto=format&fit=crop&w=1200&q=80';
  if (d.includes('darjeeling'))
    return 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80';
  if (d.includes('jaipur'))
    return 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1200&q=80';
  if (d.includes('delhi'))
    return 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1200&q=80';
  if (d.includes('mumbai'))
    return 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1200&q=80';
  if (d.includes('kerala'))
    return 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80';
  if (d.includes('varanasi'))
    return 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1200&q=80';
  if (d.includes('sikkim') || d.includes('gangtok'))
    return 'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&w=1200&q=80';
  if (d.includes('ladakh') || d.includes('leh'))
    return 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80';
  if (d.includes('andaman'))
    return 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80';
  return 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80';
}
