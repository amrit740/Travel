import { Router, Response, NextFunction } from 'express';
import { db } from '../db/database';
import { AuthenticatedRequest, optionalAuth, requireAuth, generateToken } from '../middleware/authMiddleware';
import { User, Trip } from '../../src/types';

const router = Router();

export const PRIMARY_ADMIN_UID = 'xXmpgQVQLZPto3d0kCsB0PXST7m1';
const ADMIN_UIDS = [PRIMARY_ADMIN_UID];

export function isUserAdmin(user?: { id?: string; email?: string; role?: string } | null): boolean {
  if (!user) return false;
  if (user.id === PRIMARY_ADMIN_UID) return true;
  return false;
}

// Admin authorization guard
function adminGuard(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const user = req.user;
  const headerUid = req.headers['x-user-id'] as string;

  // 1. Authenticated user via session token
  if (user && user.id === PRIMARY_ADMIN_UID) {
    return next();
  }

  // 2. Direct validated header with database check
  if (headerUid === PRIMARY_ADMIN_UID) {
    const dbUser = db.findUserById(PRIMARY_ADMIN_UID);
    if (dbUser && dbUser.role === 'admin' && dbUser.id === PRIMARY_ADMIN_UID) {
      req.user = { id: dbUser.id, name: dbUser.name, email: dbUser.email, role: 'admin' };
      return next();
    }
  }

  return res.status(403).json({ error: 'Unauthorized: Admin access required.' });
}

export interface AdminUserFile {
  id: string;
  name: string;
  url: string;
  size?: string;
  type: 'profile_image' | 'reservation_ticket' | 'trip_cover' | 'document';
  sourceTitle: string;
  uploadedAt?: string;
  tripId?: string;
}

export interface AdminUserRecord {
  id: string;
  name: string;
  email: string;
  role?: string;
  status?: 'active' | 'suspended';
  profile_image?: string;
  created_at: string;
  filesCount: number;
  files: AdminUserFile[];
  tripsCount: number;
}

// 1. Get all users and their associated files / trip summaries
router.get('/admin/users-and-files', optionalAuth, adminGuard, (req: AuthenticatedRequest, res) => {
  try {
    const rawUsers = db.getAllUsers();
    const allTrips = db.getAllTrips();

    const tripsByUser: Record<string, Trip[]> = {};
    allTrips.forEach((trip) => {
      if (trip && trip.user_id) {
        if (!tripsByUser[trip.user_id]) tripsByUser[trip.user_id] = [];
        tripsByUser[trip.user_id].push(trip);
      }
    });

    const records: AdminUserRecord[] = rawUsers.map((u) => {
      const userTrips = tripsByUser[u.id] || [];
      const files: AdminUserFile[] = [];

      // Avatar
      if (u.profile_image) {
        files.push({
          id: `file-avatar-${u.id}`,
          name: `${u.name || 'User'} Profile Photo`,
          url: u.profile_image,
          size: u.profile_image.startsWith('data:') ? 'Custom Upload' : 'Cloud Photo',
          type: 'profile_image',
          sourceTitle: 'Account Profile Photo',
          uploadedAt: u.created_at,
        });
      }

      // Trip covers and attachments
      userTrips.forEach((t) => {
        if (t.cover_image && (t.cover_image.startsWith('http') || t.cover_image.startsWith('data:'))) {
          files.push({
            id: `file-cover-${t.id}`,
            name: `${t.title || 'Trip'} Cover Image`,
            url: t.cover_image,
            size: t.cover_image.startsWith('data:') ? 'Uploaded Image' : 'Cloud Image',
            type: 'trip_cover',
            sourceTitle: `Trip: ${t.destination || t.title}`,
            uploadedAt: t.created_at,
            tripId: t.id,
          });
        }
      });

      const isAdm = isUserAdmin(u);

      return {
        id: u.id,
        name: u.name || 'Traveler',
        email: u.email,
        role: isAdm ? 'admin' : (u.role || 'user'),
        status: (u as any).status || 'active',
        profile_image: u.profile_image,
        created_at: u.created_at || new Date().toISOString(),
        filesCount: files.length,
        files,
        tripsCount: userTrips.length,
      };
    });

    const totalFiles = records.reduce((acc, r) => acc + r.filesCount, 0);
    const totalTrips = allTrips.length;
    const totalUsers = records.length;

    return res.json({
      users: records,
      totalUsers,
      totalTrips,
      totalFiles,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to retrieve admin records.' });
  }
});

// 2. Sync user (from Firebase or client auth)
router.post('/admin/sync-user', optionalAuth, (req, res) => {
  try {
    const { id, name, email, role, profile_image, created_at, status } = req.body;
    if (!id || !email) {
      return res.status(400).json({ error: 'User id and email are required for sync.' });
    }

    const isAdmin = isUserAdmin({ id, email, role });
    const user = db.upsertUser({
      id,
      name: name || email.split('@')[0],
      email,
      role: isAdmin ? 'admin' : (role || 'user'),
      profile_image,
      created_at,
      status: status || 'active',
    });

    const token = generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    return res.json({ user, token, success: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to sync user.' });
  }
});

// 3. Update User Role
router.post('/admin/users/:userId/role', optionalAuth, adminGuard, (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    if (!role) return res.status(400).json({ error: 'Role is required.' });

    const updated = db.updateUser(userId, { role });
    if (!updated) return res.status(404).json({ error: 'User not found.' });

    return res.json({ user: updated, message: `User role updated to ${role}.` });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to update user role.' });
  }
});

// 4. Update User Status (active / suspended)
router.post('/admin/users/:userId/status', optionalAuth, adminGuard, (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;
    if (!status || !['active', 'suspended'].includes(status)) {
      return res.status(400).json({ error: 'Status must be active or suspended.' });
    }

    const updated = db.updateUser(userId, { status } as any);
    if (!updated) return res.status(404).json({ error: 'User not found.' });

    return res.json({ user: updated, message: `User account marked as ${status}.` });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to update user status.' });
  }
});

// 5. Delete User
router.delete('/admin/users/:userId', optionalAuth, adminGuard, (req, res) => {
  try {
    const { userId } = req.params;
    if (ADMIN_UIDS.includes(userId)) {
      return res.status(400).json({ error: 'Cannot delete primary system administrator.' });
    }

    const ok = db.deleteUser(userId);
    if (!ok) return res.status(404).json({ error: 'User not found.' });

    return res.json({ success: true, message: 'User and all associated data deleted.' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to delete user.' });
  }
});

// 6. Get User Trips for Admin
router.get('/admin/users/:userId/trips', optionalAuth, adminGuard, (req, res) => {
  try {
    const { userId } = req.params;
    const trips = db.getTripsByUserId(userId);
    return res.json(trips);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to retrieve user trips.' });
  }
});

// 7. Delete Trip as Admin
router.delete('/admin/trips/:tripId', optionalAuth, adminGuard, (req, res) => {
  try {
    const { tripId } = req.params;
    const ok = db.deleteTrip(tripId);
    if (!ok) return res.status(404).json({ error: 'Trip not found.' });

    return res.json({ success: true, message: 'Trip deleted.' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to delete trip.' });
  }
});

export default router;
