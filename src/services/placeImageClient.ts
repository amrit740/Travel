import { ResolvedPlaceImage, PlacePhoto, AuthorAttribution } from '../types/index';

// In-Memory cache for current browser session
const clientCache = new Map<string, ResolvedPlaceImage>();

// Session storage key prefix
const STORAGE_PREFIX = 'tw_place_img_';

export function getCachedPlaceImage(name: string, destination?: string): ResolvedPlaceImage | null {
  const key = `${name} ${destination || ''}`.trim().toLowerCase();
  if (clientCache.has(key)) {
    return clientCache.get(key)!;
  }

  try {
    const raw = sessionStorage.getItem(STORAGE_PREFIX + key);
    if (raw) {
      const parsed = JSON.parse(raw) as ResolvedPlaceImage;
      clientCache.set(key, parsed);
      return parsed;
    }
  } catch {
    // Session storage disabled or full
  }

  return null;
}

export function cachePlaceImage(name: string, destination: string | undefined, data: ResolvedPlaceImage): void {
  const key = `${name} ${destination || ''}`.trim().toLowerCase();
  clientCache.set(key, data);

  try {
    sessionStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data));
  } catch {
    // Session storage disabled or full
  }
}

/**
 * Resolves exact place image using server PlaceImageService / Google Places API
 */
export async function fetchPlaceImage(
  name: string,
  destination?: string,
  category?: string,
  latitude?: number,
  longitude?: number
): Promise<ResolvedPlaceImage> {
  const cached = getCachedPlaceImage(name, destination);
  if (cached && cached.isExactMatch) {
    return cached;
  }

  try {
    const response = await fetch('/api/places/resolve-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        destination,
        category,
        latitude,
        longitude,
      }),
    });

    if (response.ok) {
      const data = (await response.json()) as ResolvedPlaceImage;
      cachePlaceImage(name, destination, data);
      return data;
    }
  } catch (err) {
    console.warn('Place image fetch failed, using fallback:', err);
  }

  // Fast client fallback
  const fallbackUrl = getFastClientPlaceFallback(name, destination, category);
  const fallbackData: ResolvedPlaceImage = {
    placeId: `client-${Date.now()}`,
    name,
    destination: destination || 'India',
    country: 'India',
    heroImage: fallbackUrl,
    photos: [{ url: fallbackUrl, source: 'fallback' }],
    gallery: [fallbackUrl],
    latitude,
    longitude,
    category,
    isExactMatch: false,
    source: 'fallback',
  };

  cachePlaceImage(name, destination, fallbackData);
  return fallbackData;
}

/**
 * Fetch multi-photo gallery for a destination
 */
export async function fetchDestinationGallery(destinationName: string): Promise<{
  heroImage: string;
  gallery: string[];
  attractions: any[];
}> {
  try {
    const response = await fetch(`/api/destinations/${encodeURIComponent(destinationName)}/gallery`);
    if (response.ok) {
      return await response.json();
    }
  } catch (err) {
    console.warn('Failed to fetch destination gallery:', err);
  }

  const fallback = getFastClientPlaceFallback(destinationName, destinationName);
  return {
    heroImage: fallback,
    gallery: [fallback],
    attractions: [],
  };
}

/**
 * Fast synchronous client fallback mapping
 */
export function getFastClientPlaceFallback(name: string, destination?: string, category?: string): string {
  const q = `${name} ${destination || ''}`.toLowerCase();

  // Exact landmark matches
  if (q.includes('taj mahal')) return 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80';
  if (q.includes('agra fort')) return 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1200&q=80';
  if (q.includes('red fort')) return 'https://images.unsplash.com/photo-1598324789736-4861f89564a0?auto=format&fit=crop&w=1200&q=80';
  if (q.includes('india gate')) return 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1200&q=80';
  if (q.includes('qutub minar')) return 'https://images.unsplash.com/photo-1545232979-fbf6c965c71a?auto=format&fit=crop&w=1200&q=80';
  if (q.includes('hawa mahal')) return 'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&w=1200&q=80';
  if (q.includes('amber fort') || q.includes('amer fort')) return 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80';
  if (q.includes('city palace jaipur')) return 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&w=1200&q=80';
  if (q.includes('city palace udaipur') || q.includes('lake pichola')) return 'https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?auto=format&fit=crop&w=1200&q=80';
  if (q.includes('mehrangarh')) return 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80';
  if (q.includes('jaisalmer fort') || q.includes('sonar qila')) return 'https://images.unsplash.com/photo-1572979203492-c13f9c636f4d?auto=format&fit=crop&w=1200&q=80';
  if (q.includes('pangong')) return 'https://images.unsplash.com/photo-1593181629936-11c609b8db9b?auto=format&fit=crop&w=1200&q=80';
  if (q.includes('leh palace') || q.includes('thiksey') || q.includes('shanti stupa')) return 'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=1200&q=80';
  if (q.includes('nubra') || q.includes('hunder')) return 'https://images.unsplash.com/photo-1605649487212-47bdab064df8?auto=format&fit=crop&w=1200&q=80';
  if (q.includes('backwaters') || q.includes('houseboat') || q.includes('alleppey')) return 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80';
  if (q.includes('munnar') || q.includes('tea estate')) return 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=1200&q=80';
  if (q.includes('fort kochi') || q.includes('chinese fishing nets')) return 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80';
  if (q.includes('golden temple') || q.includes('harmandir')) return 'https://images.unsplash.com/photo-1514890547357-a9ee288728e0?auto=format&fit=crop&w=1200&q=80';
  if (q.includes('ganga aarti') || q.includes('dashashwamedh') || q.includes('varanasi ghats')) return 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1200&q=80';
  if (q.includes('gateway of india') || q.includes('marine drive')) return 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1200&q=80';
  if (q.includes('victoria memorial')) return 'https://images.unsplash.com/photo-1558431382-27e303142255?auto=format&fit=crop&w=1200&q=80';
  if (q.includes('solang') || q.includes('rohtang') || q.includes('manali')) return 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80';
  if (q.includes('dal lake') || q.includes('shikara') || q.includes('gulmarg')) return 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=1200&q=80';
  if (q.includes('rann of kutch') || q.includes('white desert')) return 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80';

  // Category fallback
  if (category === 'Food & Dining' || category === 'Restaurant') {
    return 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80';
  }
  if (category === 'Hotel' || category === 'Hotel / Stay') {
    return 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80';
  }

  return 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=80';
}
