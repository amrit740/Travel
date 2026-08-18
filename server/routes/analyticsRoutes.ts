import { Router } from 'express';
import { db } from '../db/database';
import { optionalAuth, AuthenticatedRequest } from '../middleware/authMiddleware';

const router = Router();

// Get Analytics Summary (Platform-wide)
router.get('/analytics/stats', (req, res) => {
  const stats = db.getAnalyticsSummary();
  return res.json(stats);
});

// Get User Personal Analytics Summary
router.get('/analytics/user-stats', optionalAuth, (req: AuthenticatedRequest, res) => {
  const userId = req.user?.id || (req.query.userId as string);
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required for personal analytics' });
  }
  const stats = db.getUserAnalytics(userId);
  return res.json(stats);
});

// Record Client Analytics Event
router.post('/analytics/event', optionalAuth, (req: AuthenticatedRequest, res) => {
  const { eventName, metadata } = req.body;
  if (!eventName) return res.status(400).json({ error: 'eventName is required' });

  db.recordEvent(eventName, req.user?.id, metadata);
  return res.json({ success: true });
});

export default router;
