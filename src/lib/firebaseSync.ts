import {
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore';
import { db } from './firebase';
import { Trip, User, UserPreferences, SavedPlace } from '../types';

/**
 * Manually syncs or creates user record in Firestore
 */
export async function syncUserToFirestore(user: User, preferences?: UserPreferences | null) {
  try {
    if (!db || !user || !user.id) return;
    const userRef = doc(db, 'users', user.id);
    await setDoc(
      userRef,
      {
        id: user.id,
        name: user.name,
        email: user.email,
        profile_image: user.profile_image || '',
        role: user.role || 'user',
        preferences: preferences || null,
        updated_at: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('Firestore user manual sync status:', err);
  }
}

/**
 * Manually saves / persists a Trip in Firestore
 */
export async function syncTripToFirestore(trip: Trip) {
  try {
    if (!db || !trip || !trip.id) return;
    const tripRef = doc(db, 'trips', trip.id);
    await setDoc(
      tripRef,
      {
        ...trip,
        updated_at: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('Firestore trip sync status:', err);
  }
}

/**
 * Loads a single Trip directly from Firestore
 */
export async function getTripFromFirestore(tripId: string): Promise<Trip | null> {
  try {
    if (!db || !tripId) return null;
    const tripRef = doc(db, 'trips', tripId);
    const snap = await getDoc(tripRef);
    if (snap.exists()) {
      return snap.data() as Trip;
    }
  } catch (err) {
    console.warn('Firestore load trip error:', err);
  }
  return null;
}

/**
 * Loads user trips from Firestore
 */
export async function getUserTripsFromFirestore(userId: string): Promise<Trip[]> {
  try {
    if (!db || !userId) return [];
    const tripsCol = collection(db, 'trips');
    const q = query(tripsCol, where('user_id', '==', userId));
    const snap = await getDocs(q);
    const list: Trip[] = [];
    snap.forEach((d) => list.push(d.data() as Trip));
    return list;
  } catch (err) {
    console.warn('Firestore user trips fetch error:', err);
    return [];
  }
}

/**
 * Deletes a Trip from Firestore
 */
export async function deleteTripFromFirestore(tripId: string) {
  try {
    if (!db || !tripId) return;
    const tripRef = doc(db, 'trips', tripId);
    await deleteDoc(tripRef);
  } catch (err) {
    console.warn('Firestore delete trip error:', err);
  }
}
