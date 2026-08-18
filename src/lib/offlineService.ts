import { useState, useEffect } from 'react';
import { Trip, SavedPlace, DestinationInfo } from '../types';

export interface OfflineCacheData {
  lastSyncedAt: string;
  cachedTrips: Trip[];
  activeTrip: Trip | null;
  savedPlaces: SavedPlace[];
  emergencyGuides: Record<string, any>;
  pendingMutations: Array<{
    id: string;
    type: 'ADD_EXPENSE' | 'EDIT_ACTIVITY' | 'DELETE_ACTIVITY';
    payload: any;
    timestamp: string;
  }>;
}

const STORAGE_KEY = 'travelwise_offline_cache_v2';

export class OfflineStorageManager {
  private static getStoredData(): OfflineCacheData {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn('Failed to read offline cache:', e);
    }
    return {
      lastSyncedAt: new Date().toISOString(),
      cachedTrips: [],
      activeTrip: null,
      savedPlaces: [],
      emergencyGuides: {},
      pendingMutations: [],
    };
  }

  private static setStoredData(data: OfflineCacheData) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Failed to write to offline cache:', e);
    }
  }

  public static cacheActiveTrip(trip: Trip) {
    const data = this.getStoredData();
    data.activeTrip = trip;
    const existingIdx = data.cachedTrips.findIndex((t) => t.id === trip.id);
    if (existingIdx >= 0) {
      data.cachedTrips[existingIdx] = trip;
    } else {
      data.cachedTrips.push(trip);
    }
    data.lastSyncedAt = new Date().toISOString();
    this.setStoredData(data);
  }

  public static getCachedActiveTrip(tripId?: string): Trip | null {
    const data = this.getStoredData();
    if (tripId) {
      return data.cachedTrips.find((t) => t.id === tripId) || data.activeTrip;
    }
    return data.activeTrip;
  }

  public static cacheSavedPlaces(places: SavedPlace[]) {
    const data = this.getStoredData();
    data.savedPlaces = places;
    data.lastSyncedAt = new Date().toISOString();
    this.setStoredData(data);
  }

  public static getCachedSavedPlaces(): SavedPlace[] {
    return this.getStoredData().savedPlaces;
  }

  public static cacheEmergencyGuide(destination: string, guide: any) {
    const data = this.getStoredData();
    data.emergencyGuides[destination.toLowerCase()] = guide;
    this.setStoredData(data);
  }

  public static getCachedEmergencyGuide(destination: string): any | null {
    const data = this.getStoredData();
    return data.emergencyGuides[destination.toLowerCase()] || null;
  }

  public static getLastSyncTime(): string {
    return this.getStoredData().lastSyncedAt || new Date().toISOString();
  }
}

/**
 * Custom React Hook to monitor online/offline network connectivity & sync status
 */
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [lastSynced, setLastSynced] = useState<string>(OfflineStorageManager.getLastSyncTime());
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setIsSyncing(true);
      setTimeout(() => {
        setIsSyncing(false);
        setLastSynced(new Date().toISOString());
      }, 1200);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return {
    isOnline,
    isSyncing,
    lastSynced,
  };
}
