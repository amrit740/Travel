import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import L from 'leaflet';
import {
  MapPin,
  Check,
  Plus,
  Sparkles,
  Search,
  Star,
  DollarSign,
  Compass,
  Layers,
  Trash2,
  ExternalLink,
  Navigation,
  Info,
  SlidersHorizontal,
  Eye,
  CheckCircle2,
  X,
  Bookmark,
  Map as MapIcon,
  Grid,
  Maximize2,
  RefreshCw,
  LocateFixed,
} from 'lucide-react';
import { Place, MarkedPlace, DestinationInfo } from '../../types';
import { apiPlaces } from '../../services/api';
import { getDestinationMetadata } from '../../lib/tripPersonalization';
import { formatCurrency } from '../../lib/utils';

interface PlanningPlacesAndMapProps {
  destination: string;
  markedPlaces: MarkedPlace[];
  onToggleMarkPlace: (place: MarkedPlace) => void;
  onAddCustomPlace: (place: MarkedPlace) => void;
  onRemoveMarkedPlace: (placeId: string) => void;
  onClearAllMarked: () => void;
  destinationInfo?: DestinationInfo | null;
}

// Fallback place generator using accurate destination coordinates
const getFallbackPlacesForCity = (cityName: string): Place[] => {
  const city = cityName.trim() || 'Travel Spot';
  const meta = getDestinationMetadata(city);
  const baseLat = meta.latitude || 15.2993;
  const baseLng = meta.longitude || 74.124;

  return [
    {
      id: `dyn-place-${city.toLowerCase()}-1`,
      name: `${city} Iconic Heritage & Cultural Landmark`,
      destination: city,
      category: 'Attraction',
      sub_category: 'Historic Monument & Cultural Center',
      description: `The premier architectural and cultural landmark of ${city}, renowned for its rich heritage, open courtyards, and scenic photography spots.`,
      latitude: baseLat + 0.012,
      longitude: baseLng + 0.008,
      rating: 4.8,
      reviews_count: 3200,
      price_level: '$',
      estimated_cost: 250,
      image: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=800&q=80',
      address: `Historic Quarter, ${city}`,
      opening_hours: '08:30 AM - 07:00 PM',
      best_time_to_visit: 'Morning for quiet strolls or golden hour sunset',
      tags: ['Landmark', 'Culture', 'Photography', 'Heritage'],
    },
    {
      id: `dyn-place-${city.toLowerCase()}-2`,
      name: `${city} Signature Gourmet Bistro & Local Cafe`,
      destination: city,
      category: 'Restaurant',
      sub_category: 'Authentic Local & Regional Dining',
      description: `Top-rated culinary destination serving signature regional dishes, fresh seasonal recipes, hand-crafted breads, and specialty beverages.`,
      latitude: baseLat - 0.015,
      longitude: baseLng + 0.014,
      rating: 4.7,
      reviews_count: 2400,
      price_level: '$$',
      estimated_cost: 850,
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
      address: `Gourmet Promenade, ${city}`,
      opening_hours: '12:00 PM - 10:30 PM',
      best_time_to_visit: 'Lunch or romantic dinner',
      tags: ['Culinary', 'Local Dishes', 'Authentic', 'Dinner'],
    },
    {
      id: `dyn-place-${city.toLowerCase()}-3`,
      name: `${city} Panoramic Sunset Vista & Nature Lookout`,
      destination: city,
      category: 'Hidden Gem',
      sub_category: 'Panoramic Landscape & Nature View',
      description: `Breathtaking high-altitude panoramic viewpoint offering open vistas over ${city}, refreshing breezes, and spectacular sunset views.`,
      latitude: baseLat + 0.024,
      longitude: baseLng - 0.018,
      rating: 4.9,
      reviews_count: 1800,
      price_level: '$',
      estimated_cost: 100,
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
      address: `Hilltop Vista, ${city}`,
      opening_hours: 'Open all day',
      best_time_to_visit: '05:30 PM for sunset golden hour',
      tags: ['Sunset', 'Viewpoint', 'Nature', 'Quiet'],
    },
    {
      id: `dyn-place-${city.toLowerCase()}-4`,
      name: `${city} Boutique Sanctuary & Heritage Stay`,
      destination: city,
      category: 'Hotel',
      sub_category: 'Boutique Heritage Sanctuary',
      description: `Charming boutique retreat offering lush gardens, traditional regional architecture, serene courtyard dining, and plush hospitality.`,
      latitude: baseLat - 0.021,
      longitude: baseLng - 0.011,
      rating: 4.8,
      reviews_count: 1500,
      price_level: '$$$',
      estimated_cost: 4500,
      image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
      address: `Garden Estate, ${city}`,
      opening_hours: '24/7',
      best_time_to_visit: 'Check-in 02:00 PM',
      tags: ['Boutique', 'Stay', 'Heritage', 'Serene'],
    },
  ];
};

// Colors for category pins matching TravelWise standard categories:
// Green = Marked for Itinerary / Adventure
// Purple = Sightseeing / Sights
// Orange = Dining & Cafes / Food
// Blue = Stays & Resorts / Hotel
const getCategoryColor = (category: string) => {
  switch (category) {
    case 'Food':
    case 'Restaurant':
    case 'Food & Dining':
    case 'Dining & Cafes':
      return '#f97316'; // Orange = Dining & Cafes
    case 'Attraction':
    case 'Sightseeing':
    case 'Sights':
    case 'Culture & History':
      return '#9333ea'; // Purple = Sightseeing / Sights
    case 'Hotel':
    case 'Stay':
    case 'Hotel / Stay':
    case 'Stays & Resorts':
      return '#2563eb'; // Blue = Stays & Resorts
    case 'Hidden Gem':
      return '#ec4899'; // Pink = Hidden Gem
    case 'Adventure':
    case 'Marked for Itinerary':
    default:
      return '#10b981'; // Green = Marked for Itinerary
  }
};

const createMarkerIcon = (
  number: number,
  category: string,
  isMarked: boolean,
  isSelected: boolean = false
) => {
  const color = isMarked ? '#10b981' : getCategoryColor(category);
  const size = isSelected ? 40 : isMarked ? 36 : 30;

  const html = `
    <div style="position: relative; width: ${size}px; height: ${size}px; display: flex; align-items: center; justify-content: center;">
      ${
        isMarked
          ? `<div style="position: absolute; inset: -4px; border-radius: 50%; background: rgba(16, 185, 129, 0.4); box-shadow: 0 0 12px rgba(16, 185, 129, 0.6);"></div>`
          : ''
      }
      <div style="
        background: ${color};
        width: 100%;
        height: 100%;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 4px 12px rgba(0,0,0,0.35);
        border: 2px solid #ffffff;
        position: absolute;
      "></div>
      <span style="
        position: relative;
        z-index: 2;
        color: #ffffff;
        font-weight: 800;
        font-size: ${isSelected ? 13 : isMarked ? 12 : 10}px;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        margin-top: -2px;
      ">${isMarked ? '✓' : number}</span>
    </div>
  `;

  return L.divIcon({
    className: 'custom-map-pin',
    html,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
};

export const PlanningPlacesAndMap: React.FC<PlanningPlacesAndMapProps> = ({
  destination,
  markedPlaces,
  onToggleMarkPlace,
  onAddCustomPlace,
  onRemoveMarkedPlace,
  onClearAllMarked,
  destinationInfo,
}) => {
  const [places, setPlaces] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'split' | 'gallery' | 'map'>('split');
  const [activePlace, setActivePlace] = useState<Place | MarkedPlace | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);

  // Custom marker modal state
  const [isAddingCustomPin, setIsAddingCustomPin] = useState(false);
  const [customPinCoords, setCustomPinCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [customPlaceName, setCustomPlaceName] = useState('');
  const [customPlaceCategory, setCustomPlaceCategory] = useState('Sightseeing');
  const [customPlaceNotes, setCustomPlaceNotes] = useState('');
  const [customPlaceCost, setCustomPlaceCost] = useState('');

  // Map refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});
  const tempMarkerRef = useRef<L.Marker | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  // Resolve destination coordinates
  const meta = getDestinationMetadata(destination);
  const destLat = destinationInfo?.latitude || meta.latitude || 15.2993;
  const destLng = destinationInfo?.longitude || meta.longitude || 74.124;

  // Fetch places when destination changes
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    const loadPlaces = async () => {
      try {
        const res = await apiPlaces.getPlaces({ destination });
        if (!isMounted) return;

        if (res && res.length > 0) {
          setPlaces(res);
        } else {
          setPlaces(getFallbackPlacesForCity(destination));
        }
      } catch (err) {
        if (!isMounted) return;
        setPlaces(getFallbackPlacesForCity(destination));
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadPlaces();
    return () => {
      isMounted = false;
    };
  }, [destination]);

  // Filtered places
  const filteredPlaces = places.filter((p) => {
    const matchesCat =
      selectedCategory === 'All' ||
      p.category.toLowerCase() === selectedCategory.toLowerCase() ||
      (selectedCategory === 'Food' && (p.category.includes('Food') || p.category.includes('Dining') || p.category.includes('Restaurant'))) ||
      (selectedCategory === 'Stay' && (p.category.includes('Hotel') || p.category.includes('Stay') || p.category.includes('Resort'))) ||
      (selectedCategory === 'Attraction' && (p.category.includes('Attraction') || p.category.includes('Sightseeing') || p.category.includes('Sights')));

    const matchesSearch =
      !searchQuery.trim() ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.tags && p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));

    return matchesCat && matchesSearch;
  });

  // Check if a place is marked
  const isPlaceMarked = (placeId: string, placeName: string) => {
    return markedPlaces.some(
      (m) => m.id === placeId || m.name.toLowerCase() === placeName.toLowerCase()
    );
  };

  // Helper to re-center map on destination or fit bounds
  const handleRecenter = () => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;
    const allMarkers = Object.values(markersRef.current) as L.Marker[];
    if (allMarkers.length > 0) {
      const group = L.featureGroup(allMarkers);
      map.fitBounds(group.getBounds().pad(0.15), { maxZoom: 15 });
    } else {
      map.setView([destLat, destLng], 12);
    }
  };

  // Initialize and update Leaflet Map
  useEffect(() => {
    if (viewMode === 'gallery') return;
    const container = mapContainerRef.current;
    if (!container) return;

    try {
      setMapError(null);

      // Clean up previous map if container DOM node changed
      if (mapInstanceRef.current && mapInstanceRef.current.getContainer() !== container) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // If container has leftover leaflet ID, clean it
      if ((container as any)._leaflet_id && !mapInstanceRef.current) {
        delete (container as any)._leaflet_id;
      }

      // Initialize map instance if not existing
      if (!mapInstanceRef.current) {
        const map = L.map(container, {
          center: [destLat, destLng],
          zoom: 12,
          zoomControl: true,
          attributionControl: false,
        });

        // Add CartoDB Voyager tile layer with high reliability
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
          maxZoom: 19,
          subdomains: 'abcd',
        }).addTo(map);

        // Click map to drop custom pin
        map.on('click', (e: L.LeafletMouseEvent) => {
          const { lat, lng } = e.latlng;
          setCustomPinCoords({ lat, lng });
          setIsAddingCustomPin(true);

          if (tempMarkerRef.current) {
            tempMarkerRef.current.remove();
          }

          const tempIcon = L.divIcon({
            className: 'custom-temp-pin',
            html: `
              <div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;">
                <div style="position: absolute; inset: -6px; border-radius: 50%; background: rgba(249, 115, 22, 0.45); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
                <div style="background: #f97316; width: 100%; height: 100%; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 2px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.4);"></div>
                <span style="position: relative; z-index: 2; color: white; font-weight: 900; font-size: 14px;">+</span>
              </div>
            `,
            iconSize: [34, 34],
            iconAnchor: [17, 34],
          });

          tempMarkerRef.current = L.marker([lat, lng], { icon: tempIcon }).addTo(map);
        });

        mapInstanceRef.current = map;

        // Set up ResizeObserver to automatically invalidateSize on layout changes
        if (window.ResizeObserver) {
          if (resizeObserverRef.current) resizeObserverRef.current.disconnect();
          resizeObserverRef.current = new ResizeObserver(() => {
            if (mapInstanceRef.current) {
              mapInstanceRef.current.invalidateSize();
            }
          });
          resizeObserverRef.current.observe(container);
        }
      }

      const map = mapInstanceRef.current;

      // Invalidate size immediately and after layout settle
      map.invalidateSize();
      const t1 = setTimeout(() => map.invalidateSize(), 100);
      const t2 = setTimeout(() => map.invalidateSize(), 350);

      // Clear existing markers
      Object.values(markersRef.current).forEach((m: L.Marker) => m.remove());
      markersRef.current = {};

      const allMapItems: Array<{
        id: string;
        name: string;
        category: string;
        lat: number;
        lng: number;
        isMarked: boolean;
        image?: string;
        price_level?: string;
        estimated_cost?: number;
        rating?: number;
        description?: string;
        address?: string;
        is_custom?: boolean;
      }> = [];

      // Add places from filtered list
      filteredPlaces.forEach((p) => {
        if (p.latitude && p.longitude) {
          allMapItems.push({
            id: p.id,
            name: p.name,
            category: p.category,
            lat: p.latitude,
            lng: p.longitude,
            isMarked: isPlaceMarked(p.id, p.name),
            image: p.image,
            price_level: p.price_level,
            estimated_cost: p.estimated_cost,
            rating: p.rating,
            description: p.description,
            address: p.address,
          });
        }
      });

      // Add marked custom places
      markedPlaces.forEach((mp) => {
        if (
          mp.latitude &&
          mp.longitude &&
          !allMapItems.some((item) => item.name.toLowerCase() === mp.name.toLowerCase())
        ) {
          allMapItems.push({
            id: mp.id,
            name: mp.name,
            category: mp.category,
            lat: mp.latitude,
            lng: mp.longitude,
            isMarked: true,
            image: mp.image || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
            price_level: '$$',
            estimated_cost: mp.estimated_cost || 300,
            rating: mp.rating || 4.8,
            description: mp.notes || 'Custom marked spot on map',
            address: mp.address || `${destination} area`,
            is_custom: true,
          });
        }
      });

      const bounds: L.LatLngExpression[] = [];

      allMapItems.forEach((item, index) => {
        const isSelected = activePlace?.name === item.name;
        const marker = L.marker([item.lat, item.lng], {
          icon: createMarkerIcon(index + 1, item.category, item.isMarked, isSelected),
          zIndexOffset: item.isMarked ? 100 : 10,
        }).addTo(map);

        bounds.push([item.lat, item.lng]);

        const googleMapsDirUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
          item.name + ', ' + (item.address || destination)
        )}`;

        // Rich interactive popup
        const popupContent = `
          <div style="font-family: system-ui, -apple-system, sans-serif; min-width: 220px; max-width: 260px; padding: 2px;">
            ${
              item.image
                ? `<img src="${item.image}" alt="${item.name}" style="width: 100%; height: 110px; object-fit: cover; border-radius: 8px; margin-bottom: 8px;" onerror="this.src='https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80'" />`
                : ''
            }
            <div style="font-weight: 700; font-size: 13px; color: #0f172a; line-height: 1.2; margin-bottom: 4px;">${item.name}</div>
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
              <span style="background: ${getCategoryColor(item.category)}20; color: ${getCategoryColor(item.category)}; font-size: 10px; padding: 2px 6px; border-radius: 4px; font-weight: 700;">${item.category}</span>
              <span style="color: #f59e0b; font-weight: 700; font-size: 11px;">★ ${item.rating || 4.8}</span>
            </div>
            <p style="font-size: 11px; color: #64748b; margin: 0 0 8px 0; line-height: 1.3;">${item.description ? item.description.slice(0, 80) + '...' : ''}</p>
            <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px solid #e2e8f0; padding-top: 6px; gap: 4px;">
              <span style="font-weight: 700; font-size: 11px; color: #0B3D2E;">${item.estimated_cost ? '₹' + item.estimated_cost : 'Free'}</span>
              <a href="${googleMapsDirUrl}" target="_blank" rel="noopener noreferrer" style="font-size: 10px; font-weight: 700; color: #0B3D2E; background: #E3E7E2; padding: 3px 6px; border-radius: 4px; text-decoration: none;">
                Directions ↗
              </a>
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);

        marker.on('click', () => {
          setActivePlace({
            id: item.id,
            name: item.name,
            destination,
            category: item.category as any,
            description: item.description || '',
            latitude: item.lat,
            longitude: item.lng,
            rating: item.rating || 4.8,
            reviews_count: 120,
            price_level: (item.price_level as any) || '$$',
            estimated_cost: item.estimated_cost || 300,
            image: item.image || '',
            address: item.address || '',
          });
        });

        markersRef.current[item.id] = marker;
      });

      // Fit bounds if valid coordinates exist
      if (bounds.length > 0) {
        map.fitBounds(bounds as L.LatLngBoundsExpression, { padding: [40, 40], maxZoom: 14 });
      } else {
        map.setView([destLat, destLng], 12);
      }

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    } catch (err: any) {
      console.error('Error initializing map:', err);
      setMapError('Interactive map tiles could not be initialized. Please click Retry.');
    }
  }, [filteredPlaces, markedPlaces, viewMode, activePlace?.name, destination, destLat, destLng]);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
        resizeObserverRef.current = null;
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const handleSaveCustomPin = () => {
    if (!customPinCoords || !customPlaceName.trim()) return;

    const parsedCost = parseInt(customPlaceCost, 10);
    const newMarkedPlace: MarkedPlace = {
      id: `custom-spot-${Date.now()}`,
      name: customPlaceName.trim(),
      category: customPlaceCategory,
      destination,
      latitude: customPinCoords.lat,
      longitude: customPinCoords.lng,
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
      notes: customPlaceNotes.trim() || 'Custom spot dropped directly on map',
      rating: 5.0,
      estimated_cost: isNaN(parsedCost) ? 300 : parsedCost,
      is_custom: true,
      address: `Marked spot (${customPinCoords.lat.toFixed(4)}, ${customPinCoords.lng.toFixed(4)}), ${destination}`,
    };

    onAddCustomPlace(newMarkedPlace);
    setIsAddingCustomPin(false);
    setCustomPlaceName('');
    setCustomPlaceNotes('');
    setCustomPlaceCost('');
    if (tempMarkerRef.current) {
      tempMarkerRef.current.remove();
      tempMarkerRef.current = null;
    }
  };

  const handleTogglePlace = (p: Place) => {
    const isMarked = isPlaceMarked(p.id, p.name);
    if (isMarked) {
      const existing = markedPlaces.find(
        (m) => m.id === p.id || m.name.toLowerCase() === p.name.toLowerCase()
      );
      if (existing) onRemoveMarkedPlace(existing.id);
    } else {
      const newMarked: MarkedPlace = {
        id: p.id,
        name: p.name,
        category: p.category,
        destination: p.destination,
        latitude: p.latitude,
        longitude: p.longitude,
        image: p.image,
        address: p.address,
        rating: p.rating,
        estimated_cost: p.estimated_cost,
        notes: `Selected from ${destination} curated places`,
      };
      onToggleMarkPlace(newMarked);
    }
  };

  const handleMarkAllTop = () => {
    places.slice(0, 5).forEach((p) => {
      if (!isPlaceMarked(p.id, p.name)) {
        onToggleMarkPlace({
          id: p.id,
          name: p.name,
          category: p.category,
          destination: p.destination,
          latitude: p.latitude,
          longitude: p.longitude,
          image: p.image,
          address: p.address,
          rating: p.rating,
          estimated_cost: p.estimated_cost,
          notes: 'Top sight marked automatically',
        });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Destination Hero */}
      <div className="relative rounded-2xl overflow-hidden border border-[#E3E7E2] bg-[#071F18] text-[#F7F5EF] shadow-lg">
        {destinationInfo?.image || meta?.image ? (
          <img
            src={destinationInfo?.image || meta?.image}
            alt={destination}
            className="absolute inset-0 w-full h-full object-cover opacity-30"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B3D2E] via-[#071F18] to-[#071F18]" />
        )}
        <div className="relative p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full bg-[#176B50]/40 text-[#DFCA9B] font-semibold text-xs border border-[#C8A96B]/30 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {destination} Interactive Map
              </span>
              <span className="text-[#A2B3AA] text-xs font-medium">
                {places.length} Curated Spots
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-serif-title font-bold text-[#F7F5EF] tracking-tight">
              {destinationInfo?.tagline || meta?.tagline || `Discover & Mark Iconic Places in ${destination}`}
            </h3>
            <p className="text-xs sm:text-sm text-[#A2B3AA] max-w-xl mt-1">
              Browse photos, tap places to mark them for your TravelWise itinerary, or click anywhere on the map to drop custom secret pins!
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-[#0B3D2E]/80 backdrop-blur-md p-1.5 rounded-2xl border border-[#C8A96B]/30 shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('split')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'split'
                  ? 'bg-[#C8A96B] text-[#071F18] shadow-sm font-bold'
                  : 'text-[#E3E7E2] hover:text-white hover:bg-[#176B50]/60'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Split View
            </button>
            <button
              type="button"
              onClick={() => setViewMode('gallery')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'gallery'
                  ? 'bg-[#C8A96B] text-[#071F18] shadow-sm font-bold'
                  : 'text-[#E3E7E2] hover:text-white hover:bg-[#176B50]/60'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              Places Photos
            </button>
            <button
              type="button"
              onClick={() => setViewMode('map')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'map'
                  ? 'bg-[#C8A96B] text-[#071F18] shadow-sm font-bold'
                  : 'text-[#E3E7E2] hover:text-white hover:bg-[#176B50]/60'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              Map View
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-[#E3E7E2] shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {['All', 'Attraction', 'Food', 'Stay', 'Hidden Gem'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-[#0B3D2E] text-[#F7F5EF] shadow-sm'
                  : 'bg-[#F7F5EF] text-[#66736C] hover:bg-[#E3E7E2] border border-[#E3E7E2]'
              }`}
            >
              {cat === 'All' && 'All Spots'}
              {cat === 'Attraction' && '🏛️ Sights & Monuments'}
              {cat === 'Food' && '🍴 Dining & Cafes'}
              {cat === 'Stay' && '🏨 Stays & Resorts'}
              {cat === 'Hidden Gem' && '💎 Hidden Gems'}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8E9C95]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search spots, food, tags..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#FAF9F5] border border-[#E3E7E2] rounded-xl focus:outline-none focus:border-[#0B3D2E] text-[#18221E]"
            />
          </div>

          <button
            type="button"
            onClick={handleMarkAllTop}
            className="px-3 py-1.5 rounded-xl bg-[#FAF9F5] hover:bg-[#E3E7E2] text-[#0B3D2E] border border-[#E3E7E2] text-xs font-bold whitespace-nowrap flex items-center gap-1 transition-all"
          >
            <Sparkles className="w-3 h-3 text-[#C8A96B]" />
            Mark Top 5
          </button>
        </div>
      </div>

      {/* Main Grid / Map Body */}
      <div
        className={`grid gap-6 ${
          viewMode === 'split'
            ? 'grid-cols-1 lg:grid-cols-12'
            : viewMode === 'gallery'
            ? 'grid-cols-1'
            : 'grid-cols-1'
        }`}
      >
        {/* Left / Gallery Column: Places Cards with Photos */}
        {(viewMode === 'split' || viewMode === 'gallery') && (
          <div
            className={`${
              viewMode === 'split' ? 'lg:col-span-6' : 'col-span-1'
            } space-y-4`}
          >
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-[#18221E] flex items-center gap-2">
                <span>Curated Places ({filteredPlaces.length})</span>
                <span className="text-xs text-[#8E9C95] font-normal">
                  Tap card to mark for trip
                </span>
              </h4>
              <span className="text-xs text-[#0B3D2E] font-bold bg-[#10b981]/15 px-2.5 py-0.5 rounded-full border border-[#10b981]/30">
                {markedPlaces.length} Marked
              </span>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((n) => (
                  <div
                    key={n}
                    className="h-64 rounded-2xl bg-[#E3E7E2]/50 animate-pulse border border-[#E3E7E2]"
                  />
                ))}
              </div>
            ) : filteredPlaces.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-[#E3E7E2]">
                <Compass className="w-8 h-8 text-[#8E9C95] mx-auto mb-2" />
                <p className="text-sm font-bold text-[#18221E]">No places match your search filter</p>
                <p className="text-xs text-[#66736C] mt-1">Try resetting the category filter or searching a different keyword.</p>
              </div>
            ) : (
              <div
                className={`grid gap-4 ${
                  viewMode === 'gallery'
                    ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3'
                    : 'grid-cols-1 sm:grid-cols-2 max-h-[560px] overflow-y-auto pr-1'
                }`}
              >
                {filteredPlaces.map((p, idx) => {
                  const marked = isPlaceMarked(p.id, p.name);
                  return (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      onClick={() => handleTogglePlace(p)}
                      className={`group relative rounded-2xl overflow-hidden border transition-all cursor-pointer bg-white flex flex-col justify-between ${
                        marked
                          ? 'border-[#10b981] ring-2 ring-[#10b981]/25 shadow-md bg-[#10b981]/5'
                          : 'border-[#E3E7E2] hover:border-[#C8A96B] hover:shadow-md'
                      }`}
                    >
                      {/* Place Photo with Overlay Badges */}
                      <div className="relative h-36 w-full overflow-hidden bg-[#E3E7E2]">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#071F18]/90 via-[#071F18]/20 to-transparent" />

                        {/* Top Badges */}
                        <div className="absolute top-2 left-2 right-2 flex items-center justify-between">
                          <span
                            className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white shadow-xs backdrop-blur-md"
                            style={{ backgroundColor: getCategoryColor(p.category) }}
                          >
                            {p.category}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-[#071F18]/80 backdrop-blur-md text-[#DFCA9B] text-[10px] font-bold flex items-center gap-0.5">
                            <Star className="w-2.5 h-2.5 fill-[#DFCA9B]" />
                            {p.rating || 4.8}
                          </span>
                        </div>

                        {/* Bottom Photo Title */}
                        <div className="absolute bottom-2 left-2.5 right-2.5">
                          <h5 className="text-white font-bold text-xs line-clamp-1 leading-tight drop-shadow-xs">
                            {p.name}
                          </h5>
                          <p className="text-[#A2B3AA] text-[10px] line-clamp-1">
                            {p.sub_category || p.address}
                          </p>
                        </div>
                      </div>

                      {/* Card Body & Details */}
                      <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                        <p className="text-xs text-[#66736C] line-clamp-2 leading-relaxed">
                          {p.description}
                        </p>

                        {/* Footer with Cost & Mark Button */}
                        <div className="pt-2 border-t border-[#E3E7E2] flex items-center justify-between mt-auto">
                          <div>
                            <span className="text-[10px] text-[#8E9C95] block font-medium">
                              Estimated Cost
                            </span>
                            <span className="text-xs font-bold text-[#0B3D2E]">
                              {p.estimated_cost ? `₹${p.estimated_cost}` : 'Free'}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTogglePlace(p);
                            }}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                              marked
                                ? 'bg-[#10b981] text-white shadow-xs hover:bg-[#059669]'
                                : 'bg-[#0B3D2E] hover:bg-[#176B50] text-[#F7F5EF]'
                            }`}
                          >
                            {marked ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                Marked
                              </>
                            ) : (
                              <>
                                <Plus className="w-3.5 h-3.5" />
                                Mark Spot
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Right / Map Column: Interactive Map with Pin Dropping */}
        {(viewMode === 'split' || viewMode === 'map') && (
          <div
            className={`${
              viewMode === 'split' ? 'lg:col-span-6' : 'col-span-1'
            } space-y-4`}
          >
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-[#18221E] flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#C8A96B]" />
                <span>Interactive Map & Mark Section</span>
              </h4>
              <span className="text-xs text-[#0B3D2E] font-semibold bg-[#FAF9F5] px-2.5 py-1 rounded-xl border border-[#E3E7E2] flex items-center gap-1.5 shadow-2xs">
                <Info className="w-3.5 h-3.5 text-[#C8A96B]" />
                Click map to drop custom pin
              </span>
            </div>

            {/* Map Container */}
            <div className="relative rounded-3xl overflow-hidden border border-[#E3E7E2] shadow-md h-[460px] sm:h-[500px] bg-[#e2e8f0]">
              <div ref={mapContainerRef} className="w-full h-full z-0" />

              {/* Map Floating Actions: Recenter */}
              <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRecenter}
                  className="bg-white/95 backdrop-blur-md p-2 rounded-xl shadow-md border border-[#E3E7E2] text-[#0B3D2E] hover:bg-[#FAF9F5] transition-all flex items-center gap-1.5 text-xs font-semibold"
                  title="Recenter Map & Fit All Spots"
                >
                  <LocateFixed className="w-3.5 h-3.5 text-[#C8A96B]" />
                  <span>Fit Spots</span>
                </button>
              </div>

              {/* Map Legend Overlay */}
              <div className="absolute top-3 right-3 z-10 bg-white/95 backdrop-blur-md px-3 py-2.5 rounded-2xl shadow-lg border border-[#E3E7E2] text-[11px] space-y-1.5">
                <div className="font-bold text-[#0B3D2E] border-b border-[#E3E7E2] pb-1">
                  Map Pins
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] inline-block shadow-xs" />
                  <span className="text-[#18221E] font-semibold">Marked for Itinerary</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#9333ea] inline-block" />
                  <span className="text-[#66736C]">Sightseeing / Sights</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#f97316] inline-block" />
                  <span className="text-[#66736C]">Dining & Cafes</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#2563eb] inline-block" />
                  <span className="text-[#66736C]">Stays & Resorts</span>
                </div>
              </div>

              {/* Error fallback banner if any */}
              {mapError && (
                <div className="absolute inset-0 z-30 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center space-y-3">
                  <MapPin className="w-8 h-8 text-rose-500" />
                  <p className="text-sm font-semibold text-[#18221E]">{mapError}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setMapError(null);
                      if (mapInstanceRef.current) {
                        mapInstanceRef.current.invalidateSize();
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-[#0B3D2E] text-white text-xs font-bold"
                  >
                    Retry Map
                  </button>
                </div>
              )}

              {/* Custom Pin Flyout / Modal */}
              <AnimatePresence>
                {isAddingCustomPin && customPinCoords && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="absolute bottom-4 left-4 right-4 z-20 bg-white rounded-3xl shadow-2xl border border-[#E3E7E2] p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-xl bg-[#0B3D2E] text-[#DFCA9B] flex items-center justify-center font-bold">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <div>
                          <h5 className="text-xs font-bold text-[#18221E]">
                            Mark Custom Spot on Map
                          </h5>
                          <p className="text-[10px] text-[#66736C]">
                            Coordinates: {customPinCoords.lat.toFixed(4)},{' '}
                            {customPinCoords.lng.toFixed(4)}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingCustomPin(false);
                          if (tempMarkerRef.current) {
                            tempMarkerRef.current.remove();
                            tempMarkerRef.current = null;
                          }
                        }}
                        className="p-1.5 rounded-xl text-[#8E9C95] hover:text-[#18221E] hover:bg-[#FAF9F5]"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-bold text-[#18221E] mb-1">
                          Spot / Place Name *
                        </label>
                        <input
                          type="text"
                          value={customPlaceName}
                          onChange={(e) => setCustomPlaceName(e.target.value)}
                          placeholder="e.g., Secret Sunset Point, Grandma's Cafe..."
                          className="w-full px-3 py-2 text-xs bg-[#FAF9F5] border border-[#E3E7E2] rounded-xl focus:outline-none focus:border-[#0B3D2E] font-medium"
                          autoFocus
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-[#18221E] mb-1">
                          Category
                        </label>
                        <select
                          value={customPlaceCategory}
                          onChange={(e) => setCustomPlaceCategory(e.target.value)}
                          className="w-full px-2.5 py-2 text-xs bg-[#FAF9F5] border border-[#E3E7E2] rounded-xl focus:outline-none focus:border-[#0B3D2E] font-medium"
                        >
                          <option value="Sightseeing">🏛️ Sightseeing / Sights</option>
                          <option value="Dining & Cafes">🍴 Dining & Cafes</option>
                          <option value="Stays & Resorts">🏨 Stays & Resorts</option>
                          <option value="Hidden Gem">💎 Hidden Gem</option>
                          <option value="Adventure">🏄 Outdoor Adventure</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-bold text-[#18221E] mb-1">
                          Traveler Note / Reason for Marking (Optional)
                        </label>
                        <input
                          type="text"
                          value={customPlaceNotes}
                          onChange={(e) => setCustomPlaceNotes(e.target.value)}
                          placeholder="e.g., Must try their coconut cooler, best view at golden hour"
                          className="w-full px-3 py-2 text-xs bg-[#FAF9F5] border border-[#E3E7E2] rounded-xl focus:outline-none focus:border-[#0B3D2E]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-[#18221E] mb-1">
                          Estimated Cost (₹)
                        </label>
                        <input
                          type="number"
                          value={customPlaceCost}
                          onChange={(e) => setCustomPlaceCost(e.target.value)}
                          placeholder="e.g. 300"
                          className="w-full px-3 py-2 text-xs bg-[#FAF9F5] border border-[#E3E7E2] rounded-xl focus:outline-none focus:border-[#0B3D2E]"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingCustomPin(false);
                          if (tempMarkerRef.current) {
                            tempMarkerRef.current.remove();
                            tempMarkerRef.current = null;
                          }
                        }}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-[#66736C] hover:bg-[#FAF9F5]"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveCustomPin}
                        disabled={!customPlaceName.trim()}
                        className="px-4 py-1.5 rounded-xl bg-[#0B3D2E] hover:bg-[#176B50] text-[#F7F5EF] font-bold text-xs disabled:opacity-50 flex items-center gap-1.5 shadow-xs transition-all"
                      >
                        <Check className="w-3.5 h-3.5 text-[#DFCA9B]" />
                        Save Marked Spot
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>

      {/* Live Marked Places Tray */}
      {markedPlaces.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl bg-[#071F18] text-[#F7F5EF] p-4 sm:p-5 border border-[#C8A96B]/30 shadow-xl space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-[#176B50]/50 text-[#DFCA9B] border border-[#C8A96B]/30 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#F7F5EF] flex items-center gap-2">
                  <span>Marked Places for TravelWise Itinerary ({markedPlaces.length})</span>
                </h4>
                <p className="text-xs text-[#A2B3AA]">
                  The AI itinerary generator will automatically schedule these marked waypoints into your custom itinerary!
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClearAllMarked}
              className="text-xs text-[#A2B3AA] hover:text-rose-400 flex items-center gap-1 font-semibold transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear All
            </button>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto pb-2 pt-1 scrollbar-thin">
            {markedPlaces.map((mp) => (
              <div
                key={mp.id}
                className="flex items-center gap-2.5 bg-[#0B3D2E]/80 border border-[#C8A96B]/30 rounded-2xl p-2 shrink-0 min-w-[220px] max-w-[280px] group"
              >
                {mp.image ? (
                  <img
                    src={mp.image}
                    alt={mp.name}
                    className="w-11 h-11 rounded-xl object-cover shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80';
                    }}
                  />
                ) : (
                  <div className="w-11 h-11 rounded-xl bg-[#176B50] text-[#DFCA9B] flex items-center justify-center font-bold shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-white truncate">{mp.name}</div>
                  <div className="text-[10px] text-[#DFCA9B] flex items-center gap-1">
                    <span className="px-1.5 py-0.2 rounded bg-[#071F18] font-semibold">
                      {mp.category}
                    </span>
                    <span>• {mp.estimated_cost ? `₹${mp.estimated_cost}` : 'Free'}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onRemoveMarkedPlace(mp.id)}
                  className="p-1.5 rounded-lg text-[#A2B3AA] hover:text-rose-300 hover:bg-rose-950/40 opacity-70 group-hover:opacity-100 transition-opacity"
                  title="Remove marked place"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};
