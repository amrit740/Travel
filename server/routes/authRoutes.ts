import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db/database';
import { generateToken, requireAuth, AuthenticatedRequest } from '../middleware/authMiddleware';
import { verifyFirebaseIdToken } from '../services/firebaseAdmin';

const router = Router();
const PRIMARY_ADMIN_UID = 'xXmpgQVQLZPto3d0kCsB0PXST7m1';

// Verify Firebase ID Token and issue App JWT Session
router.post('/verify-firebase', async (req, res) => {
  try {
    const { idToken, name, email, profile_image } = req.body;

    if (!idToken) {
      return res.status(400).json({ error: 'Firebase ID token is required for verification.' });
    }

    const verified = await verifyFirebaseIdToken(idToken);
    const userId = verified.uid;
    const userEmail = verified.email || email || '';
    const userName = name || verified.name || (userEmail ? userEmail.split('@')[0] : 'Traveler');
    const userAvatar = profile_image || verified.picture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';
    const isAdmin = userId === PRIMARY_ADMIN_UID;

    const existingUser = db.findUserById(userId);
    const user = db.upsertUser({
      id: userId,
      name: userName || (isAdmin ? 'TravelWise Administrator' : 'Traveler'),
      email: userEmail,
      role: isAdmin ? 'admin' : (existingUser?.role || 'user'),
      profile_image: userAvatar,
      created_at: existingUser?.created_at || new Date().toISOString(),
      status: existingUser?.status || 'active',
    });

    let preferences = db.getUserPreferences(user.id);
    if (!preferences) {
      preferences = db.setUserPreferences(user.id, {
        travel_style: ['Adventure', 'Cultural'],
        preferred_activities: ['Historical Sites', 'Photography'],
        food_preferences: ['Local Cuisine'],
        accommodation_preference: 'Hotel',
        transportation_preference: 'Mixed',
        preferred_budget: 50000,
        preferred_destinations: ['Goa', 'Jaipur', 'Kerala', 'Manali'],
      });
    }

    db.recordEvent('firebase_user_authenticated', user.id, { email: user.email });

    // Generate custom 7-day Application JWT
    const token = generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    return res.json({
      user,
      preferences,
      token,
      message: 'Firebase authentication verified and application session initialized.',
    });
  } catch (err: any) {
    console.error('Firebase verification error:', err);
    return res.status(401).json({ error: err.message || 'Invalid or expired Firebase ID token.' });
  }
});

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const existing = db.findUserByEmail(email);
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const password_hash = bcrypt.hashSync(password, 8);
    const userId = `usr-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;

    const role = userId === 'xXmpgQVQLZPto3d0kCsB0PXST7m1' ? 'admin' : 'user';

    const user = db.createUser({
      id: userId,
      name,
      email,
      profile_image: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80`,
      role,
      password_hash,
      created_at: new Date().toISOString(),
    });

    // Initialize default preferences
    const preferences = db.setUserPreferences(userId, {});

    db.recordEvent('user_signup', userId, { email });

    const token = generateToken({ id: user.id, email: user.email, name: user.name, role: user.role });

    return res.status(201).json({
      user,
      preferences,
      token,
      message: 'Account created successfully!',
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Registration failed.' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const userRecord = db.findUserByEmail(email);
    if (!userRecord) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isValid = bcrypt.compareSync(password, userRecord.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const { password_hash, ...safeUser } = userRecord;
    const preferences = db.getUserPreferences(safeUser.id);
    const token = generateToken({ id: safeUser.id, email: safeUser.email, name: safeUser.name, role: safeUser.role });

    db.recordEvent('user_login', safeUser.id);

    return res.json({
      user: safeUser,
      preferences,
      token,
      message: 'Welcome back!',
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Login failed.' });
  }
});

// Demo 1-Click Login (Standard traveler account only)
router.post('/demo-login', async (req, res) => {
  try {
    const email = 'anjalireal24@gmail.com';

    const userRecord = db.findUserByEmail(email);
    if (!userRecord) {
      return res.status(404).json({ error: 'Demo traveler account not initialized.' });
    }

    const { password_hash, ...safeUser } = userRecord;
    // Enforce role is user for demo login
    const normalizedUser = {
      ...safeUser,
      role: 'user',
    };
    const preferences = db.getUserPreferences(normalizedUser.id);
    const token = generateToken({ id: normalizedUser.id, email: normalizedUser.email, name: normalizedUser.name, role: 'user' });

    return res.json({
      user: normalizedUser,
      preferences,
      token,
      message: 'Signed in as demo traveler',
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Demo login failed.' });
  }
});

// Get Current User (Me)
router.get('/me', requireAuth, (req: AuthenticatedRequest, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const user = db.findUserById(req.user.id);
  const preferences = db.getUserPreferences(req.user.id);
  return res.json({ user, preferences });
});

// Update Profile
router.put('/update-profile', requireAuth, (req: AuthenticatedRequest, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const { name, profile_image } = req.body;
  const updated = db.updateUser(req.user.id, {
    ...(name ? { name } : {}),
    ...(profile_image ? { profile_image } : {}),
  });
  return res.json({ user: updated, message: 'Profile updated successfully!' });
});

// Update Preferences
router.put('/update-preferences', requireAuth, (req: AuthenticatedRequest, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const preferences = db.setUserPreferences(req.user.id, req.body);
  return res.json({ preferences, message: 'Travel preferences saved!' });
});

// Logout
router.post('/logout', (req, res) => {
  return res.json({ message: 'Logged out successfully.' });
});

export default router;
