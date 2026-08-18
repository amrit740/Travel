import { Router } from 'express';
import { db, SEED_DESTINATIONS } from '../db/database';
import { requireAuth, AuthenticatedRequest } from '../middleware/authMiddleware';
import { PlaceDiscoveryService } from '../services/placeDiscoveryService';
import { ALL_INDIA_STATES } from '../../src/data/indiaStates';
import { CORE_INDIAN_DESTINATIONS } from '../../src/lib/indiaLocationService';
import { DestinationInfo } from '../../src/types';

const router = Router();

// Get complete destinations catalog across all 28 Indian States & top travel hubs
router.get('/destinations', (req, res) => {
  const destMap = new Map<string, DestinationInfo>();

  // 1. Seed destinations
  SEED_DESTINATIONS.forEach((d) => {
    destMap.set(d.name.toLowerCase(), d);
  });

  // 2. Core destinations from location service
  CORE_INDIAN_DESTINATIONS.forEach((c) => {
    if (!destMap.has(c.name.toLowerCase())) {
      destMap.set(c.name.toLowerCase(), {
        name: c.name,
        country: 'India',
        region: c.state,
        tagline: `${c.subcategory} in ${c.state}`,
        description: c.description,
        image: c.image || 'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&w=1200&q=80',
        popular_for: c.activities || ['Sightseeing', 'Heritage', 'Culture'],
        best_season: c.best_time_to_visit,
        avg_budget_per_day: c.budget_category === 'Premium' ? 6000 : c.budget_category === 'Budget' ? 2200 : 3500,
        latitude: c.latitude,
        longitude: c.longitude,
        highlighted_tags: c.travel_themes || ['Heritage', 'Culture', 'Sightseeing'],
      });
    }
  });

  // 3. States & their major destinations
  ALL_INDIA_STATES.forEach((st) => {
    st.destinations.forEach((sd) => {
      if (!destMap.has(sd.name.toLowerCase())) {
        destMap.set(sd.name.toLowerCase(), {
          name: sd.name,
          country: 'India',
          region: st.name,
          tagline: `${sd.type} Destination in ${st.name}`,
          description: sd.description,
          image: sd.image || 'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&w=1200&q=80',
          popular_for: sd.attractions?.map((a) => a.name).slice(0, 4) || ['Landmarks', 'Culture'],
          best_season: sd.best_time || st.best_seasons,
          avg_budget_per_day: sd.budget_category === 'Premium' ? 5500 : sd.budget_category === 'Budget' ? 2200 : 3400,
          latitude: sd.latitude,
          longitude: sd.longitude,
          highlighted_tags: [sd.type, 'India', st.name],
        });
      }
    });
  });

  const destinations = Array.from(destMap.values());
  return res.json(destinations);
});

// Get places with dynamic discovery, verified categories, and search
router.get('/places', (req, res) => {
  const { destination, category, query, search } = req.query;
  const destStr = destination ? String(destination) : undefined;
  const catStr = category ? String(category) : undefined;
  const searchStr = (query || search) ? String(query || search) : undefined;

  // Fetch using the comprehensive PlaceDiscoveryService
  const places = PlaceDiscoveryService.getPlacesForDestination(destStr, catStr, searchStr);
  return res.json(places);
});

// Search places across all categories and locations
router.get('/places/search', (req, res) => {
  const { q, destination, category } = req.query;
  const searchStr = q ? String(q) : undefined;
  const destStr = destination ? String(destination) : undefined;
  const catStr = category ? String(category) : undefined;

  const places = PlaceDiscoveryService.getPlacesForDestination(destStr, catStr, searchStr);
  return res.json(places);
});

// Get place details by ID
router.get('/places/:id', (req, res) => {
  const place = db.getPlaceById(req.params.id);
  if (place) return res.json(place);

  // Search in discovery service
  const allPlaces = PlaceDiscoveryService.getPlacesForDestination('All');
  const found = allPlaces.find((p) => p.id === req.params.id);
  if (!found) return res.status(404).json({ error: 'Place not found.' });
  return res.json(found);
});

// Get user saved places
router.get('/saved-places', requireAuth, (req: AuthenticatedRequest, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const saved = db.getSavedPlaces(req.user.id);
  return res.json(saved);
});

// Bookmark a place
router.post('/saved-places', requireAuth, (req: AuthenticatedRequest, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const { place_id, notes } = req.body;
  if (!place_id) return res.status(400).json({ error: 'place_id is required.' });

  const saved = db.savePlace(req.user.id, place_id, notes);
  db.recordEvent('place_saved', req.user.id, { place_id });
  return res.status(201).json(saved);
});

// Remove bookmark
router.delete('/saved-places/:placeId', requireAuth, (req: AuthenticatedRequest, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const success = db.removeSavedPlace(req.user.id, req.params.placeId);
  return res.json({ message: 'Place removed from saved items.', success });
});

export default router;
