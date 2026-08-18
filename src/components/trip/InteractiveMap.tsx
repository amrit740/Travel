import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Activity } from '../../types';
import { getDestinationMetadata } from '../../lib/tripPersonalization';
import { LocateFixed, MapPin } from 'lucide-react';

interface InteractiveMapProps {
  activities: Activity[];
  destination?: string;
  selectedActivityId?: string;
  onSelectActivity?: (activity: Activity) => void;
  className?: string;
}

// Marker Pin Colors by Standard TravelWise Category:
// Green = Marked for Itinerary / Adventure
// Purple = Sightseeing / Sights / Culture
// Orange = Dining & Cafes / Food
// Blue = Stays & Resorts
const getCategoryColor = (category: string) => {
  switch (category) {
    case 'Food & Dining':
    case 'Dining & Cafes':
    case 'Restaurant':
    case 'Food':
      return '#f97316'; // Orange = Dining & Cafes
    case 'Sightseeing':
    case 'Sights':
    case 'Culture & History':
    case 'Attraction':
    case 'Monument':
      return '#9333ea'; // Purple = Sightseeing / Sights
    case 'Hotel / Stay':
    case 'Stays & Resorts':
    case 'Hotel':
    case 'Stay':
      return '#2563eb'; // Blue = Stays & Resorts
    case 'Marked for Itinerary':
    case 'Adventure':
    case 'Relaxation':
    case 'Shopping':
    case 'Nightlife':
    default:
      return '#10b981'; // Green = Marked for Itinerary
  }
};

const createCustomPinIcon = (number: number, category: string, isSelected: boolean = false) => {
  const color = getCategoryColor(category);
  const size = isSelected ? 38 : 30;

  const svgHtml = `
    <div style="position: relative; width: ${size}px; height: ${size}px; display: flex; align-items: center; justify-content: center;">
      ${
        isSelected
          ? `<div style="position: absolute; inset: -4px; border-radius: 50%; background: ${color}50; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>`
          : ''
      }
      <div style="
        background-color: ${color};
        width: 100%;
        height: 100%;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 4px 10px rgba(0,0,0,0.35);
        border: 2px solid #ffffff;
        position: absolute;
      "></div>
      <span style="
        position: relative;
        z-index: 2;
        color: #ffffff;
        font-weight: 800;
        font-size: ${isSelected ? 13 : 11}px;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        margin-top: -2px;
      ">${number}</span>
    </div>
  `;

  return L.divIcon({
    className: 'custom-leaflet-pin',
    html: svgHtml,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
};

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  activities,
  destination,
  selectedActivityId,
  onSelectActivity,
  className = 'h-[420px]',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const polylineRef = useRef<L.Polyline | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);

  // Get destination base coordinates
  const meta = destination ? getDestinationMetadata(destination) : null;
  const defaultLat = meta?.latitude || 15.2993;
  const defaultLng = meta?.longitude || 74.124;

  const handleRecenter = () => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;
    if (markersRef.current.length > 0) {
      const group = L.featureGroup(markersRef.current);
      map.fitBounds(group.getBounds().pad(0.15), { maxZoom: 15 });
    } else {
      map.setView([defaultLat, defaultLng], 12);
    }
  };

  useEffect(() => {
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

      // Initialize map instance if not yet initialized
      if (!mapInstanceRef.current) {
        const map = L.map(container, {
          center: [defaultLat, defaultLng],
          zoom: 12,
          zoomControl: true,
          attributionControl: false,
        });

        // CartoDB Voyager clean tile layer
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
          maxZoom: 19,
          subdomains: 'abcd',
        }).addTo(map);

        mapInstanceRef.current = map;

        // Set up ResizeObserver to handle container resize / modal transitions
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

      // Invalidate size after layout settles
      map.invalidateSize();
      const t1 = setTimeout(() => map.invalidateSize(), 100);
      const t2 = setTimeout(() => map.invalidateSize(), 300);

      // Clear existing markers & polyline
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      if (polylineRef.current) {
        polylineRef.current.remove();
        polylineRef.current = null;
      }

      const validActivities = activities.filter(
        (a) => typeof a.latitude === 'number' && typeof a.longitude === 'number' && !isNaN(a.latitude) && !isNaN(a.longitude)
      );

      if (validActivities.length > 0) {
        const latLngs: L.LatLngTuple[] = [];

        validActivities.forEach((act, idx) => {
          const isSelected = act.id === selectedActivityId;
          const icon = createCustomPinIcon(idx + 1, act.category, isSelected);

          const marker = L.marker([act.latitude, act.longitude], { icon }).addTo(map);

          const googleMapsDirUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
            act.name + ', ' + (act.location || destination || '')
          )}`;

          const imgUrl = act.image || `https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=400&q=80`;

          const popupContent = `
            <div style="font-family: system-ui, -apple-system, sans-serif; min-width: 220px; max-width: 240px; padding: 2px;">
              <div style="position: relative; height: 100px; border-radius: 8px; overflow: hidden; margin-bottom: 6px; background: #f1f5f9;">
                <img src="${imgUrl}" alt="${act.name}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=400&q=80'" />
                <span style="position: absolute; top: 4px; left: 4px; font-size: 9px; font-weight: 700; text-transform: uppercase; background: rgba(15,23,42,0.85); color: #ffffff; padding: 2px 6px; border-radius: 4px;">
                  ${act.category}
                </span>
              </div>
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
                <span style="font-size: 10px; font-weight: 700; color: ${getCategoryColor(act.category)};">
                  Spot #${idx + 1}
                </span>
                <span style="font-weight: 700; font-size: 11px; color: #0B3D2E;">₹${act.estimated_cost || 0}</span>
              </div>
              <h4 style="font-size: 13px; font-weight: 700; margin: 0 0 4px 0; color: #0f172a; line-height: 1.2;">
                ${act.name}
              </h4>
              <div style="font-size: 11px; color: #64748b; margin-bottom: 6px;">
                ⏰ ${act.start_time || 'Flexible'} • 📍 ${act.location || destination || ''}
              </div>
              <a href="${googleMapsDirUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; font-size: 11px; font-weight: 700; color: #ffffff; background: #0B3D2E; padding: 6px 8px; border-radius: 6px; text-decoration: none; text-align: center; width: 100%; box-sizing: border-box;">
                Get Directions ↗
              </a>
            </div>
          `;

          marker.bindPopup(popupContent);

          marker.on('click', () => {
            if (onSelectActivity) {
              onSelectActivity(act);
            }
          });

          markersRef.current.push(marker);
          latLngs.push([act.latitude, act.longitude]);
        });

        // Draw chronological connecting route path
        if (latLngs.length > 1) {
          polylineRef.current = L.polyline(latLngs, {
            color: '#0B3D2E',
            weight: 3.5,
            opacity: 0.85,
            dashArray: '6, 8',
          }).addTo(map);
        }

        // Auto-fit bounds
        const bounds = L.latLngBounds(latLngs);
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
      } else {
        // Default view
        map.setView([defaultLat, defaultLng], 12);
      }

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    } catch (err) {
      console.error('Error in InteractiveMap:', err);
      setMapError('Map tiles could not be initialized.');
    }
  }, [activities, selectedActivityId, destination, onSelectActivity, defaultLat, defaultLng]);

  // Clean up on unmount
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

  return (
    <div className="relative rounded-3xl overflow-hidden border border-[#E3E7E2] shadow-xs bg-[#e2e8f0]">
      <div ref={mapContainerRef} className={`w-full ${className} z-0`} />

      {/* Recenter Button */}
      <div className="absolute top-3 left-3 z-10">
        <button
          type="button"
          onClick={handleRecenter}
          className="bg-white/95 backdrop-blur-md p-2 rounded-xl shadow-md border border-[#E3E7E2] text-[#0B3D2E] hover:bg-[#FAF9F5] transition-all flex items-center gap-1.5 text-xs font-semibold"
          title="Recenter & Fit All Waypoints"
        >
          <LocateFixed className="w-3.5 h-3.5 text-[#C8A96B]" />
          <span>Fit Route</span>
        </button>
      </div>

      {/* Error fallback banner */}
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

      {/* Map Legend Floating Overlay with designated TravelWise colors */}
      <div className="absolute bottom-3 left-3 z-10 bg-white/95 backdrop-blur-md rounded-2xl p-2.5 shadow-md border border-[#E3E7E2] text-[11px] font-semibold text-[#2D3A34] hidden sm:flex items-center gap-3">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" /> Marked for Itinerary
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#9333ea]" /> Sightseeing / Sights
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#f97316]" /> Dining & Cafes
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#2563eb]" /> Stays & Resorts
        </span>
      </div>
    </div>
  );
};
