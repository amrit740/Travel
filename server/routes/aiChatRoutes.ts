import { Router } from 'express';
import { db } from '../db/database';
import { requireAuth, AuthenticatedRequest } from '../middleware/authMiddleware';
import { processAIChat } from '../services/geminiService';

const router = Router();

// Chat with AI Travel Assistant
router.post('/ai/chat', requireAuth, async (req: AuthenticatedRequest, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const { tripId, userMessage, history = [] } = req.body;

    if (!userMessage) {
      return res.status(400).json({ error: 'Message is required.' });
    }

    let tripContext: any = {
      destination: 'Unknown Destination',
      duration: 3,
      travelers: 2,
      traveler_type: 'Couple',
      total_budget: 30000,
      currency: 'INR',
    };

    if (tripId) {
      const trip = db.getTripById(tripId);
      if (trip) {
        tripContext = {
          id: trip.id,
          destination: trip.destination,
          duration: trip.duration,
          start_date: trip.start_date,
          end_date: trip.end_date,
          travelers: trip.travelers,
          traveler_type: trip.traveler_type,
          total_budget: trip.total_budget,
          estimated_cost: trip.estimated_cost,
          currency: trip.currency,
          travel_style: trip.travel_style,
          days_count: trip.itinerary_days?.length || 0,
        };
      }
    }

    const aiResponse = await processAIChat({
      tripContext,
      userMessage,
      history,
    });

    db.recordEvent('ai_chat_interaction', req.user.id, { tripId, query: userMessage.substring(0, 40) });

    return res.json({
      message: aiResponse.text,
      suggestedActions: aiResponse.suggestedActions || [],
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('AI chat endpoint error:', err);
    return res.status(500).json({
      error: 'AI assistant is momentarily unavailable. Please try again.',
    });
  }
});

// Execute structured AI Action upon user confirmation
router.post('/ai/apply-action', requireAuth, (req: AuthenticatedRequest, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  const { tripId, actionType, payload } = req.body;
  const trip = db.getTripById(tripId);
  if (!trip) return res.status(404).json({ error: 'Trip not found.' });

  try {
    switch (actionType) {
      case 'ADD_ACTIVITY': {
        const { dayNumber = 1, activity } = payload;
        const targetDay = (trip.itinerary_days || []).find((d) => d.day_number === dayNumber) || trip.itinerary_days?.[0];
        if (!targetDay) return res.status(400).json({ error: 'Target day not found.' });

        const added = db.addActivity(targetDay.id, {
          name: activity.name,
          description: activity.description || '',
          category: activity.category || 'Sightseeing',
          start_time: activity.start_time || '03:00 PM',
          end_time: activity.end_time,
          duration: activity.duration || '2 hours',
          estimated_cost: Number(activity.estimated_cost) || 0,
          location: activity.location || trip.destination,
          latitude: Number(activity.latitude) || 15.2993,
          longitude: Number(activity.longitude) || 74.124,
          notes: 'Added via AI Assistant',
        });

        const refreshed = db.getTripById(tripId);
        return res.json({ message: `Added "${added.name}" to Day ${targetDay.day_number}!`, trip: refreshed });
      }

      case 'REMOVE_ACTIVITY': {
        const { activityId } = payload;
        db.deleteActivity(activityId);
        const refreshed = db.getTripById(tripId);
        return res.json({ message: 'Activity removed from itinerary.', trip: refreshed });
      }

      case 'OPTIMIZE_BUDGET': {
        const reductionFactor = 0.85;
        (trip.itinerary_days || []).forEach((day) => {
          day.activities.forEach((act) => {
            if (act.estimated_cost > 400) {
              db.updateActivity(act.id, {
                estimated_cost: Math.round(act.estimated_cost * reductionFactor),
                notes: `${act.notes || ''} [Budget Optimized]`,
              });
            }
          });
        });
        const refreshed = db.getTripById(tripId);
        return res.json({ message: 'Budget optimized successfully!', trip: refreshed });
      }

      default:
        return res.status(400).json({ error: `Unsupported action type: ${actionType}` });
    }
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to apply AI action.' });
  }
});

export default router;
