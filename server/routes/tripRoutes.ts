import { Router } from 'express';
import { db } from '../db/database';
import { requireAuth, optionalAuth, AuthenticatedRequest } from '../middleware/authMiddleware';
import { generateAITrip, regenerateSingleActivity } from '../services/geminiService';
import { getDestinationWeather } from '../services/weatherService';
import { CreateTripInput, Trip, Activity } from '../../src/types/index';

const router = Router();

// Get all trips for the authenticated user
router.get('/trips', requireAuth, (req: AuthenticatedRequest, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const trips = db.getTripsByUserId(req.user.id);
  return res.json(trips);
});

// AI Generate & Create Trip
router.post('/trips/generate', requireAuth, async (req: AuthenticatedRequest, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const input = req.body as CreateTripInput;

    if (!input.destination) {
      return res.status(400).json({ error: 'Destination is required.' });
    }
    if (!input.start_date || !input.end_date) {
      return res.status(400).json({ error: 'Start and end dates are required.' });
    }
    if (new Date(input.end_date) < new Date(input.start_date)) {
      return res.status(400).json({ error: 'End date must be on or after start date.' });
    }
    if (!input.budget || Number(input.budget) <= 0) {
      return res.status(400).json({ error: 'Please enter a valid positive budget amount.' });
    }

    const startDate = new Date(input.start_date);
    const endDate = new Date(input.end_date);
    const duration = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1);

    // Call AI Generation engine
    const aiResult = await generateAITrip(input);

    const tripId = `trip-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;

    const newTrip: Trip = {
      id: tripId,
      user_id: req.user.id,
      title: aiResult.title || `${duration}-Day ${input.destination} Getaway`,
      destination: input.destination,
      destination_country: input.destination.includes(',') ? input.destination.split(',')[1].trim() : 'India',
      start_date: input.start_date,
      end_date: input.end_date,
      duration,
      travelers: input.travelers || 2,
      traveler_type: input.traveler_type || 'Couple',
      total_budget: Number(input.budget),
      currency: input.currency || 'INR',
      travel_style: input.travel_style || ['Adventure', 'Food & Cuisine'],
      food_preferences: input.food_preferences || ['Local Cuisine'],
      accommodation_preference: input.accommodation || 'Hotel',
      transportation_preference: input.transportation || 'Mixed',
      interests: input.interests || ['Historical Sites', 'Local Culture'],
      status: 'planned',
      cover_image: aiResult.cover_image,
      summary: aiResult.summary,
      estimated_cost: aiResult.estimated_cost,
      budget_breakdown: aiResult.budget_breakdown,
      travel_tips: aiResult.travel_tips,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Prepare days and activities for database persistence
    const daysData = aiResult.days.map((d, dIdx) => {
      return {
        day_number: d.day_number || dIdx + 1,
        date: d.date,
        title: d.title || `Day ${dIdx + 1}`,
        description: d.description || '',
        activities: d.activities.map((a) => ({
          name: a.name,
          description: a.description,
          category: a.category,
          start_time: a.start_time,
          end_time: a.end_time,
          duration: a.duration,
          estimated_cost: Number(a.estimated_cost) || 0,
          location: a.location || `${a.name}, ${input.destination}`,
          latitude: a.latitude,
          longitude: a.longitude,
          image: a.image,
          notes: a.notes,
        })),
      };
    });

    const savedTrip = db.createTrip(newTrip, daysData);

    db.recordEvent('trip_generated', req.user.id, {
      destination: input.destination,
      duration,
      budget: input.budget,
    });

    return res.status(201).json(savedTrip);
  } catch (err: any) {
    console.error('Error generating trip:', err);
    return res.status(500).json({ error: err.message || 'Failed to generate trip itinerary.' });
  }
});

// Get Single Trip by ID (with weather)
router.get('/trips/:id', optionalAuth, async (req: AuthenticatedRequest, res) => {
  const trip = db.getTripById(req.params.id);
  if (!trip) {
    return res.status(404).json({ error: 'Trip not found.' });
  }

  // Access check: allow if creator, admin, or shared
  const share = db.getShareByTripId(trip.id);
  const isOwner = req.user && req.user.id === trip.user_id;
  const isAdmin = req.user && req.user.role === 'admin';

  if (!isOwner && !isAdmin && !share) {
    return res.status(403).json({ error: 'You do not have access to view this trip.' });
  }

  // Fetch weather asynchronously for the destination
  const weather = await getDestinationWeather(trip.destination);

  return res.json({
    ...trip,
    weather,
    shareInfo: share,
    isOwner: Boolean(isOwner),
  });
});

// Update Trip Metadata
router.put('/trips/:id', requireAuth, (req: AuthenticatedRequest, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const existing = db.getTripById(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Trip not found.' });
  if (existing.user_id !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized to modify this trip.' });
  }

  const updated = db.updateTrip(req.params.id, req.body);
  return res.json(updated);
});

// Delete Trip
router.delete('/trips/:id', requireAuth, (req: AuthenticatedRequest, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const existing = db.getTripById(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Trip not found.' });
  if (existing.user_id !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized to delete this trip.' });
  }

  db.deleteTrip(req.params.id);
  db.recordEvent('trip_deleted', req.user.id, { tripId: req.params.id });
  return res.json({ message: 'Trip deleted successfully.' });
});

// Duplicate Trip
router.post('/trips/:id/duplicate', requireAuth, (req: AuthenticatedRequest, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const existing = db.getTripById(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Trip not found.' });

  const newTripId = `trip-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
  const duplicatedTrip: Trip = {
    ...existing,
    id: newTripId,
    user_id: req.user.id,
    title: `${existing.title} (Copy)`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const daysData = (existing.itinerary_days || []).map((d) => ({
    day_number: d.day_number,
    date: d.date,
    title: d.title,
    description: d.description,
    activities: d.activities.map((a) => ({
      name: a.name,
      description: a.description,
      category: a.category,
      start_time: a.start_time,
      end_time: a.end_time,
      duration: a.duration,
      estimated_cost: a.estimated_cost,
      location: a.location,
      latitude: a.latitude,
      longitude: a.longitude,
      image: a.image,
      notes: a.notes,
    })),
  }));

  const created = db.createTrip(duplicatedTrip, daysData);
  return res.status(201).json(created);
});

// Add Activity to Day
router.post('/trips/:id/days/:dayId/activities', requireAuth, (req: AuthenticatedRequest, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const { name, category, start_time, estimated_cost, description, location, latitude, longitude } = req.body;

  if (!name || !category || !start_time) {
    return res.status(400).json({ error: 'Activity name, category, and start time are required.' });
  }

  const activity = db.addActivity(req.params.dayId, {
    name,
    category,
    start_time,
    end_time: req.body.end_time,
    duration: req.body.duration || '1.5 hours',
    estimated_cost: Number(estimated_cost) || 0,
    description: description || '',
    location: location || name,
    latitude: Number(latitude) || 15.2993,
    longitude: Number(longitude) || 74.124,
    image: req.body.image,
    notes: req.body.notes,
  });

  const updatedTrip = db.getTripById(req.params.id);
  return res.status(201).json({ activity, trip: updatedTrip });
});

// Update Activity
router.put('/activities/:id', requireAuth, (req: AuthenticatedRequest, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const updated = db.updateActivity(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Activity not found.' });
  return res.json(updated);
});

// Delete Activity
router.delete('/activities/:id', requireAuth, (req: AuthenticatedRequest, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const success = db.deleteActivity(req.params.id);
  if (!success) return res.status(404).json({ error: 'Activity not found.' });
  return res.json({ message: 'Activity removed.' });
});

// AI Regenerate Single Activity
router.post('/trips/:id/regenerate-activity', requireAuth, async (req: AuthenticatedRequest, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const { activityId, dayTitle } = req.body;

  const trip = db.getTripById(req.params.id);
  if (!trip) return res.status(404).json({ error: 'Trip not found.' });

  // Find the activity
  let currentActivity: Activity | undefined;
  for (const d of trip.itinerary_days || []) {
    currentActivity = d.activities.find((a) => a.id === activityId);
    if (currentActivity) break;
  }

  if (!currentActivity) {
    return res.status(404).json({ error: 'Activity not found in this trip.' });
  }

  const replacement = await regenerateSingleActivity({
    destination: trip.destination,
    dayTitle: dayTitle || 'Exploration Day',
    currentActivity,
    userBudget: trip.total_budget,
    preferences: trip.travel_style,
  });

  const updated = db.updateActivity(activityId, replacement);
  const refreshedTrip = db.getTripById(req.params.id);

  return res.json({ activity: updated, trip: refreshedTrip });
});

// AI Regenerate Entire Day
router.post('/trips/:id/regenerate-day', requireAuth, async (req: AuthenticatedRequest, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const { dayId, dayNumber } = req.body;

  const trip = db.getTripById(req.params.id);
  if (!trip) return res.status(404).json({ error: 'Trip not found.' });

  const targetDay = (trip.itinerary_days || []).find((d) => d.id === dayId || d.day_number === Number(dayNumber));
  if (!targetDay) return res.status(404).json({ error: 'Day not found.' });

  // Generate fresh day plan via single day AI call
  const singleDayResult = await generateAITrip({
    destination: trip.destination,
    start_date: targetDay.date,
    end_date: targetDay.date,
    travelers: trip.travelers,
    traveler_type: trip.traveler_type,
    budget: Math.round(trip.total_budget / trip.duration),
    travel_style: trip.travel_style,
    food_preferences: trip.food_preferences,
    accommodation: trip.accommodation_preference,
    transportation: trip.transportation_preference,
    interests: trip.interests,
  });

  const newActivities = singleDayResult.days[0]?.activities || [];
  const updatedActs = db.replaceDayActivities(
    targetDay.id,
    newActivities.map((a) => ({
      name: a.name,
      description: a.description,
      category: a.category,
      start_time: a.start_time,
      end_time: a.end_time,
      duration: a.duration,
      estimated_cost: a.estimated_cost,
      location: a.location,
      latitude: a.latitude,
      longitude: a.longitude,
      notes: a.notes,
    }))
  );

  const refreshedTrip = db.getTripById(req.params.id);
  return res.json({ dayId: targetDay.id, activities: updatedActs, trip: refreshedTrip });
});

// Smart Budget Optimization
router.post('/trips/:id/optimize-budget', requireAuth, async (req: AuthenticatedRequest, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const trip = db.getTripById(req.params.id);
  if (!trip) return res.status(404).json({ error: 'Trip not found.' });

  const targetBudget = trip.total_budget;
  const days = trip.itinerary_days || [];

  // Intelligently scale down expensive meals/activities to fit comfortably inside target budget
  let currentTotal = trip.estimated_cost || targetBudget;
  const reductionFactor = targetBudget < currentTotal ? targetBudget / currentTotal * 0.92 : 0.85;

  for (const day of days) {
    for (const act of day.activities) {
      if (act.estimated_cost > 300) {
        const optimizedCost = Math.round(act.estimated_cost * reductionFactor);
        db.updateActivity(act.id, {
          estimated_cost: Math.max(100, optimizedCost),
          notes: `${act.notes || ''} [Budget Optimized: Group/free passes & local alternatives applied]`,
        });
      }
    }
  }

  const updatedTrip = db.getTripById(req.params.id);
  return res.json({
    message: 'Trip budget successfully optimized to match your target budget!',
    trip: updatedTrip,
  });
});

// Trip Share Token
router.post('/trips/:id/share', requireAuth, (req: AuthenticatedRequest, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const trip = db.getTripById(req.params.id);
  if (!trip) return res.status(404).json({ error: 'Trip not found.' });
  if (trip.user_id !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const share = db.createOrUpdateShare(trip.id);
  db.recordEvent('trip_shared', req.user.id, { tripId: trip.id });
  return res.json(share);
});

// Revoke Trip Share
router.delete('/trips/:id/share', requireAuth, (req: AuthenticatedRequest, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  db.revokeShare(req.params.id);
  return res.json({ message: 'Trip share link disabled.' });
});

// Public Shared Trip Viewer (No login required)
router.get('/shared-trip/:token', async (req, res) => {
  const result = db.getTripByShareToken(req.params.token);
  if (!result) {
    return res.status(404).json({ error: 'Shared trip not found or link has expired.' });
  }

  const weather = await getDestinationWeather(result.trip.destination);
  return res.json({
    trip: result.trip,
    share: result.share,
    weather,
  });
});

export default router;
