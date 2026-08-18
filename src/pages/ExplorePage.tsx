import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Search,
  MapPin,
  Star,
  Bookmark,
  Sparkles,
  ArrowRight,
  Filter,
  Compass,
  Check,
  Plus,
  Info,
  Utensils,
  ShieldAlert,
  Map as MapIcon,
  LayoutGrid,
  Clock,
  Coins,
  ChevronDown,
  Navigation,
  Globe,
  ExternalLink,
} from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Place, DestinationInfo } from '../types';
import { apiPlaces } from '../services/api';
import { useCurrentTrip } from '../contexts/TripContext';
import { DESTINATIONS_KNOWLEDGE, scorePlaceForTrip } from '../lib/tripPersonalization';
import { formatCurrency } from '../lib/utils';
import { ALL_INDIA_STATES } from '../data/indiaStates';

const CATEGORY_MAPPINGS: { [key: string]: { label: string; backendCat?: string; color: string; bg: string } } = {
  'All': { label: 'All Spots', color: 'text-[#0f172a]', bg: 'bg-[#0f172a] text-[#f8fafc]' },
  'Attraction': { label: 'Sights & Monuments', backendCat: 'Attraction', color: 'text-purple-600', bg: 'bg-purple-600 text-white' },
  'Restaurant': { label: 'Dining & Cafes', backendCat: 'Restaurant', color: 'text-[#C59B27]', bg: 'bg-[#C59B27] text-[#0f172a]' },
  'Hotel': { label: 'Stays & Resorts', backendCat: 'Hotel', color: 'text-blue-600', bg: 'bg-blue-600 text-white' },
  'Hidden Gem': { label: 'Hidden Gems', backendCat: 'Hidden Gem', color: 'text-emerald-600', bg: 'bg-emerald-600 text-white' },
};

const getCategoryMarkerColor = (category: string) => {
  switch (category) {
    case 'Restaurant':
    case 'Dining & Cafes':
    case 'Food':
      return '#C59B27'; // Gold / Dining
    case 'Attraction':
    case 'Sights & Monuments':
    case 'Sightseeing':
      return '#9333ea'; // Purple / Sights
    case 'Hotel':
    case 'Stays & Resorts':
    case 'Stay':
      return '#2563eb'; // Blue / Stays
    case 'Hidden Gem':
    case 'Hidden Gems':
      return '#059669'; // Emerald Green / Marked
    default:
      return '#0f172a'; // Slate Navy
  }
};

const createCustomMapIcon = (category: string, isSaved: boolean) => {
  const color = isSaved ? '#10b981' : getCategoryMarkerColor(category);
  const size = 32;

  const html = `
    <div style="position: relative; width: ${size}px; height: ${size}px; display: flex; align-items: center; justify-content: center;">
      ${
        isSaved
          ? `<div style="position: absolute; inset: -4px; border-radius: 50%; background: rgba(16, 185, 129, 0.4); box-shadow: 0 0 10px rgba(16, 185, 129, 0.6);"></div>`
          : ''
      }
      <div style="
        background: ${color};
        width: 100%;
        height: 100%;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 3px 8px rgba(0,0,0,0.3);
        border: 2px solid #ffffff;
        position: absolute;
      "></div>
      <span style="
        position: relative;
        z-index: 2;
        color: #ffffff;
        font-weight: 800;
        font-size: 11px;
        font-family: system-ui, sans-serif;
        margin-top: -2px;
      ">${isSaved ? '★' : '•'}</span>
    </div>
  `;

  return L.divIcon({
    className: 'travelwise-custom-pin',
    html,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
};

export const ExplorePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { currentTrip, addSpotToDay, selectedDayNumber } = useCurrentTrip();

  const [destinations, setDestinations] = useState<DestinationInfo[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [savedPlaceIds, setSavedPlaceIds] = useState<string[]>([]);
  const [selectedDestination, setSelectedDestination] = useState<string>(
    searchParams.get('dest') || (currentTrip ? currentTrip.destination : 'Goa')
  );
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [isLoading, setIsLoading] = useState(true);
  const [addingPlaceId, setAddingPlaceId] = useState<string | null>(null);
  const [activeMapPlace, setActiveMapPlace] = useState<Place | null>(null);
  const [showDestDropdown, setShowDestDropdown] = useState(false);
  const [destSearchTerm, setDestSearchTerm] = useState('');

  // Map references
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);

  // Fetch Destinations and Places
  useEffect(() => {
    let isMounted = true;
    const fetchInitial = async () => {
      setIsLoading(true);
      try {
        const dests = await apiPlaces.getDestinations();
        if (isMounted) setDestinations(dests);

        const pList = await apiPlaces.getPlaces({
          destination: selectedDestination,
          category: selectedCategory !== 'All' ? CATEGORY_MAPPINGS[selectedCategory]?.backendCat || selectedCategory : undefined,
          query: searchQuery.trim() || undefined,
        });
        if (isMounted) setPlaces(pList);

        const saved = await apiPlaces.getSavedPlaces();
        if (isMounted) setSavedPlaceIds(saved.map((s) => s.place_id));
      } catch (err) {
        console.warn('Explore load error:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchInitial();

    return () => {
      isMounted = false;
    };
  }, [selectedDestination, selectedCategory, searchQuery]);

  // Leaflet Map Initialization & Updates
  useEffect(() => {
    if (viewMode !== 'map' || !mapContainerRef.current) return;

    // Initialize Map if not yet created
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
        scrollWheelZoom: true,
      }).setView([20.5937, 78.9629], 5);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      const group = L.layerGroup().addTo(map);
      markersGroupRef.current = group;
      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;
    const group = markersGroupRef.current;
    if (!map || !group) return;

    group.clearLayers();
    const bounds: L.LatLngExpression[] = [];

    places.forEach((place) => {
      if (typeof place.latitude === 'number' && typeof place.longitude === 'number') {
        const isSaved = savedPlaceIds.includes(place.id);
        const icon = createCustomMapIcon(place.category, isSaved);
        const marker = L.marker([place.latitude, place.longitude], { icon });

        marker.on('click', () => {
          setActiveMapPlace(place);
        });

        marker.bindTooltip(`<strong>${place.name}</strong><br/><span style="color:#64748b">${place.category}</span>`, {
          direction: 'top',
          offset: [0, -10],
        });

        group.addLayer(marker);
        bounds.push([place.latitude, place.longitude]);
      }
    });

    if (bounds.length > 0) {
      map.fitBounds(L.latLngBounds(bounds), { padding: [40, 40], maxZoom: 15 });
    } else {
      map.setView([20.5937, 78.9629], 5);
    }

    // Invalidate size in case of container changes
    setTimeout(() => {
      map.invalidateSize();
    }, 150);
  }, [viewMode, places, savedPlaceIds]);

  const toggleSavePlace = async (placeId: string) => {
    const isSaved = savedPlaceIds.includes(placeId);
    if (isSaved) {
      setSavedPlaceIds((prev) => prev.filter((id) => id !== placeId));
      await apiPlaces.removeSavedPlace(placeId).catch(() => {});
    } else {
      setSavedPlaceIds((prev) => [...prev, placeId]);
      await apiPlaces.savePlace(placeId).catch(() => {});
    }
  };

  const handleAddToActiveTrip = async (place: Place) => {
    if (!currentTrip) {
      navigate(`/create-trip?destination=${place.destination}`);
      return;
    }

    setAddingPlaceId(place.id);
    const day =
      currentTrip.itinerary_days?.find((d) => d.day_number === selectedDayNumber) ||
      currentTrip.itinerary_days?.[0];

    if (day) {
      await addSpotToDay(day.id, {
        id: place.id,
        name: place.name,
        category: place.category,
        description: place.description,
        image: place.image || '',
        rating: place.rating,
        reviews_count: place.reviews_count,
        estimated_cost: place.estimated_cost,
        address: place.address,
        tags: place.tags,
        destination: place.destination,
      });
    }
    setAddingPlaceId(null);
  };

  const activeDestInfo = destinations.find(
    (d) => d.name.toLowerCase() === selectedDestination.toLowerCase()
  );

  const destinationMeta = DESTINATIONS_KNOWLEDGE[selectedDestination] || null;

  // Filter destinations for searchable dropdown
  const filteredDestOptions = destinations.filter(
    (d) =>
      d.name.toLowerCase().includes(destSearchTerm.toLowerCase()) ||
      d.region.toLowerCase().includes(destSearchTerm.toLowerCase())
  );

  const topQuickDestinations = ['Goa', 'Jaipur', 'Kerala', 'Varanasi', 'Ladakh', 'Mumbai', 'Darjeeling', 'Agra', 'Himachal', 'Uttarakhand'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      {/* Top Header & Search */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#e2e8f0]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#C59B27] uppercase tracking-wider">Discovery Hub</span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-semibold text-[#64748b]">28 States & UTs Catalog</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#0f172a] font-display mt-0.5">
            Explore Places & Curated Spots
          </h1>
          <p className="text-sm text-[#64748b] mt-1">
            Discover verified sights, culinary gems, boutique stays, and secret local highlights across India.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-[#64748b] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search attractions, cafes, hotels..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-[#e2e8f0] bg-white text-xs font-semibold focus:border-[#0f172a] focus:ring-2 focus:ring-[#0f172a]/10 outline-none transition-all shadow-xs"
            />
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center p-1 rounded-2xl bg-[#FAFAF8] border border-[#e2e8f0] shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'grid'
                  ? 'bg-[#0f172a] text-[#f8fafc] shadow-xs'
                  : 'text-[#64748b] hover:text-[#0f172a]'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Grid</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'map'
                  ? 'bg-[#0f172a] text-[#f8fafc] shadow-xs'
                  : 'text-[#64748b] hover:text-[#0f172a]'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>Map View</span>
            </button>
          </div>
        </div>
      </div>

      {/* Destination Quick Selector Bar & Dropdown */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-[#0f172a] flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-[#C59B27]" />
            <span>Select Indian Destination / State:</span>
          </label>

          {/* All Destinations Dropdown Trigger */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowDestDropdown(!showDestDropdown)}
              className="text-xs font-bold text-[#0f172a] bg-white hover:bg-[#FAFAF8] border border-[#e2e8f0] px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all shadow-xs"
            >
              <Globe className="w-3.5 h-3.5 text-[#C59B27]" />
              <span>All Destinations ({destinations.length})</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#64748b]" />
            </button>

            {showDestDropdown && (
              <div className="absolute right-0 mt-2 w-80 max-h-96 bg-white rounded-2xl shadow-xl border border-[#e2e8f0] z-50 p-3 space-y-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-[#64748b] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={destSearchTerm}
                    onChange={(e) => setDestSearchTerm(e.target.value)}
                    placeholder="Filter by city or state..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-[#e2e8f0] text-xs outline-none focus:border-[#0f172a]"
                    autoFocus
                  />
                </div>
                <div className="max-h-72 overflow-y-auto space-y-1 scrollbar-thin">
                  {filteredDestOptions.map((d) => (
                    <button
                      type="button"
                      key={d.name}
                      onClick={() => {
                        setSelectedDestination(d.name);
                        setShowDestDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                        selectedDestination.toLowerCase() === d.name.toLowerCase()
                          ? 'bg-[#0f172a] text-[#f8fafc] font-bold'
                          : 'hover:bg-[#FAFAF8] text-[#0f172a]'
                      }`}
                    >
                      <div className="truncate">
                        <div className="font-semibold">{d.name}</div>
                        <div className="text-[10px] text-[#64748b]">{d.region}</div>
                      </div>
                      {selectedDestination.toLowerCase() === d.name.toLowerCase() && (
                        <Check className="w-3.5 h-3.5 text-[#C59B27] shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {topQuickDestinations.map((name) => {
            const isSelected = selectedDestination.toLowerCase() === name.toLowerCase();
            return (
              <button
                type="button"
                key={name}
                onClick={() => setSelectedDestination(name)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 border ${
                  isSelected
                    ? 'border-[#0f172a] bg-[#0f172a] text-[#f8fafc] shadow-md border-[#C59B27]/40'
                    : 'border-[#e2e8f0] bg-white text-[#64748b] hover:border-slate-300'
                }`}
              >
                <MapPin className="w-3.5 h-3.5 text-[#C59B27]" />
                <span>{name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Destination Hero Banner */}
      {activeDestInfo && (
        <div className="relative rounded-3xl overflow-hidden shadow-md bg-[#0f172a] text-white p-6 sm:p-8 border border-[#C59B27]/20">
          <div className="absolute inset-0 -z-10">
            <img
              src={activeDestInfo.image || 'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&w=1200&q=80'}
              alt={activeDestInfo.name}
              className="w-full h-full object-cover opacity-35"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/80 to-transparent" />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2 max-w-2xl">
              <span className="text-xs uppercase font-bold text-[#C59B27]">Destination Guide</span>
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-[#f8fafc]">
                {activeDestInfo.name}, {activeDestInfo.region}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{activeDestInfo.tagline || activeDestInfo.description}</p>
              <div className="flex flex-wrap gap-4 pt-2 text-xs text-slate-300">
                <span>🗓️ Best Season: <strong className="text-white">{activeDestInfo.best_season || 'October to March'}</strong></span>
                <span>💰 Avg Daily Budget: <strong className="text-white">{formatCurrency(activeDestInfo.avg_budget_per_day || 3500, 'INR')}</strong></span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate(`/create-trip?destination=${activeDestInfo.name}`)}
              className="px-5 py-3 rounded-2xl bg-[#C59B27] hover:bg-[#b08920] text-[#0f172a] font-bold text-xs shadow-lg flex items-center gap-2 self-start sm:self-auto shrink-0 transition-transform active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-[#0f172a]" />
              <span>Plan AI Trip to {activeDestInfo.name}</span>
            </button>
          </div>
        </div>
      )}

      {/* Destination Culture Highlights */}
      {destinationMeta && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#FAFAF8] border border-[#e2e8f0] rounded-2xl p-4 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#0f172a]">
              <Utensils className="w-4 h-4 text-[#C59B27]" />
              <span>Must-Try Local Delicacies</span>
            </div>
            <p className="text-xs text-[#64748b] leading-relaxed">
              {destinationMeta.must_try_foods.join(', ')}
            </p>
          </div>

          <div className="bg-[#FAFAF8] border border-[#e2e8f0] rounded-2xl p-4 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#0f172a]">
              <Info className="w-4 h-4 text-emerald-600" />
              <span>Local Etiquette & Advice</span>
            </div>
            <p className="text-xs text-[#64748b] leading-relaxed">
              {destinationMeta.local_etiquette[0] || 'Dress respectfully at spiritual locations.'}
            </p>
          </div>

          <div className="bg-[#FAFAF8] border border-[#e2e8f0] rounded-2xl p-4 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#0f172a]">
              <ShieldAlert className="w-4 h-4 text-blue-600" />
              <span>Emergency Contacts</span>
            </div>
            <p className="text-xs text-[#64748b] leading-relaxed">
              Police: {destinationMeta.emergency_contacts.police} • Ambulance: {destinationMeta.emergency_contacts.ambulance}
            </p>
          </div>
        </div>
      )}

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {Object.keys(CATEGORY_MAPPINGS).map((catKey) => {
          const cat = CATEGORY_MAPPINGS[catKey];
          const isSelected = selectedCategory === catKey;
          return (
            <button
              type="button"
              key={catKey}
              onClick={() => setSelectedCategory(catKey)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                isSelected
                  ? 'bg-[#0f172a] text-[#f8fafc] shadow-xs'
                  : 'bg-[#FAFAF8] text-[#64748b] hover:bg-slate-200'
              }`}
            >
              {catKey === 'All' ? '🌟 All Spots' : cat.label}
            </button>
          );
        })}
      </div>

      {/* Main Content: Grid vs Map */}
      {isLoading ? (
        <div className="py-24 text-center space-y-3">
          <div className="inline-block w-8 h-8 border-3 border-[#C59B27] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-[#64748b]">Discovering authentic spots in {selectedDestination}...</p>
        </div>
      ) : places.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-[#e2e8f0] p-8 space-y-3">
          <Compass className="w-8 h-8 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-[#0f172a]">No matching spots found</h3>
          <p className="text-xs text-[#64748b] max-w-md mx-auto">
            Try adjusting your search query or switching to another category.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
            }}
            className="px-4 py-2 bg-[#0f172a] text-[#f8fafc] rounded-xl text-xs font-bold hover:bg-[#1e293b] border border-[#C59B27]/30"
          >
            Reset Filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {places.map((place) => {
            const isSaved = savedPlaceIds.includes(place.id);
            const isAdding = addingPlaceId === place.id;
            const scored = currentTrip ? scorePlaceForTrip(place, currentTrip) : null;

            return (
              <div
                key={place.id}
                className="group bg-white rounded-3xl border border-[#e2e8f0] overflow-hidden hover:shadow-xl transition-all flex flex-col justify-between"
              >
                <div className="relative h-48 overflow-hidden bg-slate-100">
                  <img
                    src={
                      place.image ||
                      'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=600&q=80'
                    }
                    alt={place.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />

                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold">
                    {place.category}
                  </span>

                  {scored?.matchScore && (
                    <span className="absolute top-3 right-12 px-2.5 py-1 rounded-lg bg-[#0f172a]/90 backdrop-blur-md text-[#C59B27] text-[10px] font-extrabold flex items-center gap-1 border border-[#C59B27]/30">
                      <Sparkles className="w-3 h-3 text-[#C59B27]" />
                      <span>{scored.matchScore}% Match</span>
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => toggleSavePlace(place.id)}
                    className="absolute top-3 right-3 p-2 rounded-xl bg-white/90 backdrop-blur-md text-slate-700 hover:text-[#C59B27] transition-colors shadow-xs"
                    title={isSaved ? 'Saved in Bookmarks' : 'Bookmark Place'}
                  >
                    <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-[#C59B27] text-[#C59B27]' : ''}`} />
                  </button>

                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                    <span className="flex items-center gap-1 font-bold bg-[#C59B27] px-2 py-0.5 rounded-md text-[#0f172a]">
                      <Star className="w-3 h-3 fill-[#0f172a] text-[#0f172a]" />
                      {place.rating}
                    </span>
                    <span className="font-bold">
                      {place.estimated_cost === 0 ? 'Free Entry' : formatCurrency(place.estimated_cost, 'INR')}
                    </span>
                  </div>
                </div>

                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <h3 className="font-bold text-base text-[#0f172a] line-clamp-1">{place.name}</h3>
                    <p className="text-xs text-[#64748b] line-clamp-2 leading-relaxed">
                      {place.description}
                    </p>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#C59B27] shrink-0" />
                      <span className="truncate">{place.address}</span>
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#e2e8f0] flex items-center justify-between gap-2">
                    <div className="flex flex-wrap gap-1">
                      {place.tags?.slice(0, 2).map((t) => (
                        <span key={t} className="px-2 py-0.5 rounded-md bg-[#FAFAF8] text-[10px] font-semibold text-[#64748b] border border-[#e2e8f0]">
                          {t}
                        </span>
                      ))}
                    </div>

                    {currentTrip ? (
                      <button
                        type="button"
                        onClick={() => handleAddToActiveTrip(place)}
                        disabled={isAdding}
                        className="px-3 py-1.5 rounded-xl bg-[#0f172a] hover:bg-[#1e293b] text-[#f8fafc] text-xs font-bold transition-all shadow-xs flex items-center gap-1 shrink-0 active:scale-95 border border-[#C59B27]/30"
                      >
                        <Plus className="w-3 h-3 text-[#C59B27]" />
                        <span>{isAdding ? 'Adding...' : `Add to Day ${selectedDayNumber}`}</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => navigate(`/create-trip?destination=${place.destination}`)}
                        className="px-3 py-1.5 rounded-xl bg-[#0f172a] hover:bg-[#1e293b] text-[#f8fafc] text-xs font-bold transition-all shadow-xs flex items-center gap-1 border border-[#C59B27]/30"
                      >
                        <Sparkles className="w-3 h-3 text-[#C59B27]" />
                        <span>Plan Trip</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Interactive Map View */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map Canvas */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-[#e2e8f0] overflow-hidden shadow-sm h-[560px] relative">
            <div ref={mapContainerRef} className="w-full h-full z-0" />

            {/* Map Legend */}
            <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-md px-3 py-2 rounded-xl border border-[#e2e8f0] shadow-md z-10 flex flex-wrap gap-3 text-[11px] font-bold text-slate-700">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-600" /> Sights
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#C59B27]" /> Dining
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600" /> Stays
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" /> Hidden Gems
              </span>
            </div>
          </div>

          {/* Active Place Detail in Map Mode */}
          <div className="bg-white rounded-3xl border border-[#e2e8f0] p-5 flex flex-col justify-between h-[560px] overflow-y-auto">
            {activeMapPlace ? (
              <div className="space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="relative h-44 rounded-2xl overflow-hidden bg-slate-100">
                    <img
                      src={activeMapPlace.image || 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=600&q=80'}
                      alt={activeMapPlace.name}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-slate-900/80 text-white text-[10px] font-bold">
                      {activeMapPlace.category}
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleSavePlace(activeMapPlace.id)}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/90 text-slate-700 hover:text-[#C59B27]"
                    >
                      <Bookmark
                        className={`w-4 h-4 ${
                          savedPlaceIds.includes(activeMapPlace.id) ? 'fill-[#C59B27] text-[#C59B27]' : ''
                        }`}
                      />
                    </button>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-base text-[#0f172a]">{activeMapPlace.name}</h3>
                    <p className="text-xs text-[#C59B27] font-semibold">{activeMapPlace.sub_category}</p>
                  </div>

                  <p className="text-xs text-[#64748b] leading-relaxed">{activeMapPlace.description}</p>

                  <div className="space-y-1.5 text-xs text-[#64748b] pt-2 border-t border-[#e2e8f0]">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#C59B27] shrink-0" />
                      <span className="truncate">{activeMapPlace.address}</span>
                    </div>
                    {activeMapPlace.opening_hours && (
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{activeMapPlace.opening_hours}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <Coins className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Est: {activeMapPlace.estimated_cost === 0 ? 'Free' : formatCurrency(activeMapPlace.estimated_cost, 'INR')}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#e2e8f0] space-y-2">
                  {currentTrip ? (
                    <button
                      type="button"
                      onClick={() => handleAddToActiveTrip(activeMapPlace)}
                      className="w-full py-2.5 rounded-xl bg-[#0f172a] hover:bg-[#1e293b] text-[#f8fafc] font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm border border-[#C59B27]/30"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#C59B27]" />
                      <span>Add to Trip Day {selectedDayNumber}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => navigate(`/create-trip?destination=${activeMapPlace.destination}`)}
                      className="w-full py-2.5 rounded-xl bg-[#0f172a] hover:bg-[#1e293b] text-[#f8fafc] font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm border border-[#C59B27]/30"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#C59B27]" />
                      <span>Plan AI Itinerary with this Spot</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#64748b] space-y-2">
                <MapPin className="w-8 h-8 text-slate-300" />
                <p className="text-xs font-semibold text-[#0f172a]">Select any pin on the map to view place details</p>
                <p className="text-[11px] text-[#64748b]">
                  Total {places.length} places marked across {selectedDestination}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
