import {
  collection,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  addDoc,
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { User, Trip, CommunityPost, CommunityComment, CommunityReport, Place } from '../types';
import { apiAdmin } from '../services/api';

export const PRIMARY_ADMIN_UID = 'xXmpgQVQLZPto3d0kCsB0PXST7m1';
export const ADMIN_UID = PRIMARY_ADMIN_UID;
export const ADMIN_UIDS = [PRIMARY_ADMIN_UID];

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

export interface FeedbackRecord {
  id: string;
  user_id?: string;
  user_name?: string;
  user_email?: string;
  trip_id?: string | null;
  destination?: string;
  overall_rating: number;
  route_rating?: number;
  recommendation_rating?: number;
  category: 'praise' | 'suggestion' | 'issue';
  comment: string;
  created_at: string;
  status?: 'reviewed' | 'pending' | 'resolved';
}

/**
 * Authoritative check whether a given user, UID, or current session has administrative privileges
 * (Only xXmpgQVQLZPto3d0kCsB0PXST7m1 is authorized as administrator)
 */
export function checkIsAdmin(userOrUid?: string | null | { id?: string; email?: string; role?: string }): boolean {
  if (!userOrUid) {
    const currentFb = auth.currentUser;
    if (currentFb && currentFb.uid === PRIMARY_ADMIN_UID) return true;
    return false;
  }

  if (typeof userOrUid === 'string') {
    if (userOrUid === PRIMARY_ADMIN_UID) return true;
  }

  if (typeof userOrUid === 'object' && userOrUid !== null) {
    if (userOrUid.id === PRIMARY_ADMIN_UID) return true;
  }

  const currentFb = auth.currentUser;
  if (currentFb && currentFb.uid === PRIMARY_ADMIN_UID) return true;

  return false;
}

/**
 * Loads all users from Firestore + Backend along with their metadata (Admin only)
 */
export async function getAdminUsersAndFiles(currentUser?: User | null): Promise<AdminUserRecord[]> {
  const currentUid = currentUser?.id || auth.currentUser?.uid;
  const isAdm = checkIsAdmin(currentUser) || checkIsAdmin(currentUid);

  if (!isAdm) {
    throw new Error('Unauthorized: Admin access required.');
  }

  const mergedUsersMap = new Map<string, AdminUserRecord>();

  // 1. Query Firestore for users & trips
  try {
    const usersCollection = collection(db, 'users');
    const userSnapshots = await getDocs(usersCollection);

    const tripsCollection = collection(db, 'trips');
    const tripSnapshots = await getDocs(tripsCollection);

    const tripsByUser: Record<string, Trip[]> = {};
    tripSnapshots.forEach((docSnap) => {
      const trip = docSnap.data() as Trip;
      if (trip && trip.user_id) {
        if (!tripsByUser[trip.user_id]) {
          tripsByUser[trip.user_id] = [];
        }
        tripsByUser[trip.user_id].push(trip);
      }
    });

    userSnapshots.forEach((docSnap) => {
      const u = docSnap.data() as User & { status?: 'active' | 'suspended' };
      const uid = docSnap.id || u.id;
      const userTrips = tripsByUser[uid] || [];
      const files: AdminUserFile[] = [];

      // A. Profile avatar
      if (u.profile_image) {
        files.push({
          id: `file-avatar-${uid}`,
          name: `${u.name || 'User'} Profile Avatar`,
          url: u.profile_image,
          size: u.profile_image.startsWith('data:') ? 'Custom Upload' : 'External/Cloud',
          type: 'profile_image',
          sourceTitle: 'Account Profile Photo',
          uploadedAt: u.created_at,
        });
      }

      // B. Scan all user trips for cover images
      userTrips.forEach((trip) => {
        if (trip.cover_image && (trip.cover_image.startsWith('data:') || trip.cover_image.startsWith('http'))) {
          files.push({
            id: `file-cover-${trip.id}`,
            name: `${trip.title || 'Trip'} Banner Image`,
            url: trip.cover_image,
            size: trip.cover_image.startsWith('data:') ? 'Uploaded Image' : 'Cloud Photo',
            type: 'trip_cover',
            sourceTitle: `Trip: ${trip.destination || trip.title}`,
            uploadedAt: trip.created_at,
            tripId: trip.id,
          });
        }
      });

      const userRole = uid === PRIMARY_ADMIN_UID ? 'admin' : 'user';

      mergedUsersMap.set(uid, {
        id: uid,
        name: u.name || 'Traveler',
        email: u.email || 'No email provided',
        role: userRole,
        status: u.status || 'active',
        profile_image: u.profile_image,
        created_at: u.created_at || new Date().toISOString(),
        filesCount: files.length,
        files,
        tripsCount: userTrips.length,
      });
    });
  } catch (firestoreErr) {
    console.warn('Firestore user fetch note:', firestoreErr);
  }

  // 2. Query Backend Admin API
  try {
    const backendData = await apiAdmin.getUsersAndFiles(currentUser || { id: currentUid, role: 'admin' });
    if (backendData && Array.isArray(backendData.users)) {
      backendData.users.forEach((bUser) => {
        const existing = mergedUsersMap.get(bUser.id) || Array.from(mergedUsersMap.values()).find((u) => u.email.toLowerCase() === bUser.email.toLowerCase());
        if (existing) {
          const fileMap = new Map<string, AdminUserFile>();
          (existing.files || []).forEach((f) => fileMap.set(f.id, f));
          (bUser.files || []).forEach((f: AdminUserFile) => fileMap.set(f.id, f));

          existing.files = Array.from(fileMap.values());
          existing.filesCount = existing.files.length;
          existing.tripsCount = Math.max(existing.tripsCount || 0, bUser.tripsCount || 0);
          if (bUser.id === PRIMARY_ADMIN_UID) existing.role = 'admin';
          if (bUser.status) existing.status = bUser.status;
        } else {
          bUser.role = bUser.id === PRIMARY_ADMIN_UID ? 'admin' : 'user';
          mergedUsersMap.set(bUser.id, bUser);
        }
      });
    }
  } catch (backendErr) {
    console.warn('Backend admin fetch error:', backendErr);
  }

  // 3. Ensure the active Admin appears in the registry
  if (currentUid === PRIMARY_ADMIN_UID) {
    const hasAdminInList = mergedUsersMap.has(PRIMARY_ADMIN_UID);
    if (!hasAdminInList) {
      const activeAdminRecord: AdminUserRecord = {
        id: PRIMARY_ADMIN_UID,
        name: currentUser?.name || auth.currentUser?.displayName || 'TravelWise Administrator',
        email: currentUser?.email || auth.currentUser?.email || 'admin@travelwise.ai',
        role: 'admin',
        status: 'active',
        profile_image: currentUser?.profile_image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        created_at: currentUser?.created_at || new Date().toISOString(),
        filesCount: 1,
        files: [
          {
            id: `file-avatar-${PRIMARY_ADMIN_UID}`,
            name: 'Admin Profile Avatar',
            url: currentUser?.profile_image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
            type: 'profile_image',
            sourceTitle: 'Account Profile Photo',
            uploadedAt: new Date().toISOString(),
          },
        ],
        tripsCount: 0,
      };
      mergedUsersMap.set(PRIMARY_ADMIN_UID, activeAdminRecord);
    }
  }

  return Array.from(mergedUsersMap.values());
}

/**
 * Update user role (Admin action)
 */
export async function updateUserRoleAsAdmin(userId: string, newRole: string, currentUser?: User | null): Promise<void> {
  const isAdm = checkIsAdmin(currentUser) || checkIsAdmin(auth.currentUser);
  if (!isAdm) throw new Error('Unauthorized: Admin access required.');

  // If attempting to alter primary admin, role must remain admin
  if (userId === PRIMARY_ADMIN_UID && newRole !== 'admin') {
    throw new Error('Cannot revoke primary administrator role.');
  }

  // Update in Firestore
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      role: newRole,
      updated_at: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('Firestore role update note:', err);
  }

  // Update in backend
  try {
    await apiAdmin.updateRole(userId, newRole, currentUser);
  } catch (err) {
    console.warn('Backend role update note:', err);
  }
}

/**
 * Update user status (e.g. active vs suspended) (Admin action)
 */
export async function updateUserStatusAsAdmin(userId: string, status: 'active' | 'suspended', currentUser?: User | null): Promise<void> {
  const isAdm = checkIsAdmin(currentUser) || checkIsAdmin(auth.currentUser);
  if (!isAdm) throw new Error('Unauthorized: Admin access required.');

  if (userId === PRIMARY_ADMIN_UID && status === 'suspended') {
    throw new Error('Cannot suspend primary administrator account.');
  }

  // Update in Firestore
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      status,
      updated_at: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('Firestore status update note:', err);
  }

  // Update in backend
  try {
    await apiAdmin.updateStatus(userId, status, currentUser);
  } catch (err) {
    console.warn('Backend status update note:', err);
  }
}

/**
 * Delete a user profile and their data (Admin action)
 */
export async function deleteUserAsAdmin(userId: string, currentUser?: User | null): Promise<void> {
  const isAdm = checkIsAdmin(currentUser) || checkIsAdmin(auth.currentUser);
  if (!isAdm) throw new Error('Unauthorized: Admin access required.');
  if (userId === PRIMARY_ADMIN_UID) {
    throw new Error('Cannot delete primary administrator account.');
  }

  // 1. Delete from Firestore
  try {
    const tripsCol = collection(db, 'trips');
    const q = query(tripsCol, where('user_id', '==', userId));
    const snap = await getDocs(q);
    const deletePromises: Promise<void>[] = [];
    snap.forEach((d) => {
      deletePromises.push(deleteDoc(doc(db, 'trips', d.id)));
    });
    await Promise.all(deletePromises);

    const userRef = doc(db, 'users', userId);
    await deleteDoc(userRef);
  } catch (err) {
    console.warn('Firestore delete note:', err);
  }

  // 2. Delete from backend
  try {
    await apiAdmin.deleteUser(userId, currentUser);
  } catch (err) {
    console.warn('Backend delete note:', err);
  }
}

/**
 * Get all trips for a specific user (Admin inspection)
 */
export async function getUserTripsForAdmin(userId: string, currentUser?: User | null): Promise<Trip[]> {
  const isAdm = checkIsAdmin(currentUser) || checkIsAdmin(auth.currentUser);
  if (!isAdm) throw new Error('Unauthorized: Admin access required.');

  const tripsMap = new Map<string, Trip>();

  // 1. Try Firestore
  try {
    const tripsCol = collection(db, 'trips');
    const q = query(tripsCol, where('user_id', '==', userId));
    const snap = await getDocs(q);
    snap.forEach((d) => {
      const trip = d.data() as Trip;
      if (trip && trip.id) tripsMap.set(trip.id, trip);
    });
  } catch (err) {
    console.warn('Firestore trips fetch note:', err);
  }

  // 2. Try Backend
  try {
    const backendTrips = await apiAdmin.getUserTrips(userId, currentUser);
    if (Array.isArray(backendTrips)) {
      backendTrips.forEach((t) => {
        if (t && t.id) tripsMap.set(t.id, t);
      });
    }
  } catch (err) {
    console.warn('Backend user trips fetch note:', err);
  }

  return Array.from(tripsMap.values());
}

/**
 * Get all platform trips (Admin overview)
 */
export async function getAllTripsForAdmin(currentUser?: User | null): Promise<Trip[]> {
  const isAdm = checkIsAdmin(currentUser) || checkIsAdmin(auth.currentUser);
  if (!isAdm) throw new Error('Unauthorized: Admin access required.');

  const tripsMap = new Map<string, Trip>();

  try {
    const tripsCol = collection(db, 'trips');
    const snap = await getDocs(tripsCol);
    snap.forEach((d) => {
      const trip = d.data() as Trip;
      if (trip && trip.id) tripsMap.set(trip.id, trip);
    });
  } catch (err) {
    console.warn('Firestore all trips fetch note:', err);
  }

  try {
    const res = await fetch('/api/trips');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.trips)) {
        data.trips.forEach((t: Trip) => {
          if (t && t.id) tripsMap.set(t.id, t);
        });
      }
    }
  } catch (err) {
    console.warn('API trips fetch note:', err);
  }

  return Array.from(tripsMap.values());
}

/**
 * Delete a trip on behalf of admin moderation
 */
export async function deleteTripAsAdmin(tripId: string, currentUser?: User | null): Promise<void> {
  const isAdm = checkIsAdmin(currentUser) || checkIsAdmin(auth.currentUser);
  if (!isAdm) throw new Error('Unauthorized: Admin access required.');

  // Firestore
  try {
    const tripRef = doc(db, 'trips', tripId);
    await deleteDoc(tripRef);
  } catch (err) {
    console.warn('Firestore trip delete note:', err);
  }

  // Backend
  try {
    await apiAdmin.deleteTrip(tripId, currentUser);
  } catch (err) {
    console.warn('Backend trip delete note:', err);
  }
}

/**
 * Delete a file or avatar as admin
 */
export async function deleteFileAsAdmin(file: AdminUserFile, userId: string, currentUser?: User | null): Promise<void> {
  const isAdm = checkIsAdmin(currentUser) || checkIsAdmin(auth.currentUser);
  if (!isAdm) throw new Error('Unauthorized: Admin access required.');

  if (file.type === 'profile_image') {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        profile_image: '',
        updated_at: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('Firestore file delete note:', err);
    }
  } else if (file.type === 'trip_cover' && file.tripId) {
    try {
      const tripRef = doc(db, 'trips', file.tripId);
      await updateDoc(tripRef, {
        cover_image: '',
        updated_at: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('Firestore file delete note:', err);
    }
  }
}

/**
 * Community moderation functions
 */
export async function getAllCommunityPostsForAdmin(currentUser?: User | null): Promise<CommunityPost[]> {
  const isAdm = checkIsAdmin(currentUser) || checkIsAdmin(auth.currentUser);
  if (!isAdm) throw new Error('Unauthorized: Admin access required.');

  const postsMap = new Map<string, CommunityPost>();

  try {
    const postsCol = collection(db, 'community_posts');
    const snap = await getDocs(postsCol);
    snap.forEach((d) => {
      const post = d.data() as CommunityPost;
      if (post && post.id) postsMap.set(post.id, post);
    });
  } catch (err) {
    console.warn('Firestore community posts note:', err);
  }

  try {
    const res = await fetch('/api/community/posts');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.posts)) {
        data.posts.forEach((p: CommunityPost) => {
          if (p && p.id) postsMap.set(p.id, p);
        });
      }
    }
  } catch (err) {
    console.warn('Backend community posts note:', err);
  }

  return Array.from(postsMap.values());
}

export async function deleteCommunityPostAsAdmin(postId: string, currentUser?: User | null): Promise<void> {
  const isAdm = checkIsAdmin(currentUser) || checkIsAdmin(auth.currentUser);
  if (!isAdm) throw new Error('Unauthorized: Admin access required.');

  try {
    await deleteDoc(doc(db, 'community_posts', postId));
  } catch (err) {
    console.warn('Firestore post delete note:', err);
  }

  try {
    await fetch(`/api/community/posts/${postId}`, {
      method: 'DELETE',
      headers: {
        'x-user-id': PRIMARY_ADMIN_UID,
        'x-user-role': 'admin',
      },
    });
  } catch (err) {
    console.warn('Backend post delete note:', err);
  }
}

export async function getCommunityReportsForAdmin(currentUser?: User | null): Promise<CommunityReport[]> {
  const isAdm = checkIsAdmin(currentUser) || checkIsAdmin(auth.currentUser);
  if (!isAdm) throw new Error('Unauthorized: Admin access required.');

  const reports: CommunityReport[] = [];
  try {
    const reportsCol = collection(db, 'community_reports');
    const snap = await getDocs(reportsCol);
    snap.forEach((d) => {
      reports.push({ id: d.id, ...d.data() } as CommunityReport);
    });
  } catch (err) {
    console.warn('Firestore community reports note:', err);
  }

  return reports;
}

export async function resolveCommunityReportAsAdmin(reportId: string, status: 'resolved' | 'dismissed', currentUser?: User | null): Promise<void> {
  const isAdm = checkIsAdmin(currentUser) || checkIsAdmin(auth.currentUser);
  if (!isAdm) throw new Error('Unauthorized: Admin access required.');

  try {
    await updateDoc(doc(db, 'community_reports', reportId), {
      status,
      reviewed_at: new Date().toISOString(),
      reviewed_by: PRIMARY_ADMIN_UID,
    });
  } catch (err) {
    console.warn('Firestore report update note:', err);
  }
}

/**
 * Places Catalog Administration
 */
export async function getPlacesCatalogForAdmin(currentUser?: User | null): Promise<Place[]> {
  const isAdm = checkIsAdmin(currentUser) || checkIsAdmin(auth.currentUser);
  if (!isAdm) throw new Error('Unauthorized: Admin access required.');

  const placesMap = new Map<string, Place>();

  try {
    const placesCol = collection(db, 'places');
    const snap = await getDocs(placesCol);
    snap.forEach((d) => {
      const place = d.data() as Place;
      if (place && place.id) placesMap.set(place.id, place);
    });
  } catch (err) {
    console.warn('Firestore places fetch note:', err);
  }

  try {
    const res = await fetch('/api/places');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.places)) {
        data.places.forEach((p: Place) => {
          if (p && p.id) placesMap.set(p.id, p);
        });
      }
    }
  } catch (err) {
    console.warn('Backend places fetch note:', err);
  }

  return Array.from(placesMap.values());
}

export async function savePlaceAsAdmin(place: Partial<Place>, currentUser?: User | null): Promise<Place> {
  const isAdm = checkIsAdmin(currentUser) || checkIsAdmin(auth.currentUser);
  if (!isAdm) throw new Error('Unauthorized: Admin access required.');

  const placeId = place.id || `place-${Date.now()}`;
  const completePlace: Place = {
    id: placeId,
    name: place.name || 'New Landmark',
    destination: place.destination || 'India',
    category: place.category || 'Attraction',
    sub_category: place.sub_category || 'Landmark',
    description: place.description || '',
    latitude: place.latitude || 15.2993,
    longitude: place.longitude || 74.124,
    rating: place.rating || 4.8,
    reviews_count: place.reviews_count || 120,
    price_level: place.price_level || '$$',
    estimated_cost: place.estimated_cost || 500,
    image: place.image || 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80',
    address: place.address || '',
    opening_hours: place.opening_hours || '09:00 AM - 06:00 PM',
    best_time_to_visit: place.best_time_to_visit || 'Morning or Sunset',
    tags: place.tags || ['Scenic', 'Must Visit'],
  };

  try {
    await setDoc(doc(db, 'places', placeId), completePlace, { merge: true });
  } catch (err) {
    console.warn('Firestore place save note:', err);
  }

  return completePlace;
}

export async function deletePlaceAsAdmin(placeId: string, currentUser?: User | null): Promise<void> {
  const isAdm = checkIsAdmin(currentUser) || checkIsAdmin(auth.currentUser);
  if (!isAdm) throw new Error('Unauthorized: Admin access required.');

  try {
    await deleteDoc(doc(db, 'places', placeId));
  } catch (err) {
    console.warn('Firestore place delete note:', err);
  }
}

/**
 * Feedbacks Administration
 */
export async function getFeedbacksForAdmin(currentUser?: User | null): Promise<FeedbackRecord[]> {
  const isAdm = checkIsAdmin(currentUser) || checkIsAdmin(auth.currentUser);
  if (!isAdm) throw new Error('Unauthorized: Admin access required.');

  const feedbacks: FeedbackRecord[] = [];

  try {
    const feedCol = collection(db, 'feedbacks');
    const snap = await getDocs(feedCol);
    snap.forEach((d) => {
      feedbacks.push({ id: d.id, ...d.data() } as FeedbackRecord);
    });
  } catch (err) {
    console.warn('Firestore feedbacks fetch note:', err);
  }

  // Also check local storage feedback logs
  try {
    const local = JSON.parse(localStorage.getItem('travelwise_user_feedbacks') || '[]');
    local.forEach((item: any, idx: number) => {
      const id = item.id || `local-feed-${idx}`;
      if (!feedbacks.some((f) => f.comment === item.comment && f.created_at === item.created_at)) {
        feedbacks.push({ id, ...item });
      }
    });
  } catch {}

  feedbacks.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  return feedbacks;
}

export async function updateFeedbackStatusAsAdmin(feedbackId: string, status: 'reviewed' | 'resolved', currentUser?: User | null): Promise<void> {
  const isAdm = checkIsAdmin(currentUser) || checkIsAdmin(auth.currentUser);
  if (!isAdm) throw new Error('Unauthorized: Admin access required.');

  try {
    await updateDoc(doc(db, 'feedbacks', feedbackId), { status });
  } catch (err) {
    console.warn('Firestore feedback status note:', err);
  }
}
