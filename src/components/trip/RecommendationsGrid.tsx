import React, { useState, useEffect } from 'react';
import { Sparkles, Star, Plus, Bookmark, MapPin, ExternalLink, Check } from 'lucide-react';
import { Place, ItineraryDay } from '../../types';
import { apiPlaces } from '../../services/api';
import { formatCurrency } from '../../lib/utils';

interface RecommendationsGridProps {
  destination: string;
  days: ItineraryDay[];
  onAddPlaceToDay: (dayId: string, place: Place) => void;
  currency?: string;
}

export const RecommendationsGrid: React.FC<RecommendationsGridProps> = ({
  destination,
  days,
  onAddPlaceToDay,
  currency = 'INR',
}) => {
  const [places, setPlaces] = useState<Place[]>([]);
  const [savedPlaceIds, setSavedPlaceIds] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isLoading, setIsLoading] = useState(true);
  const [activeDayTarget, setActiveDayTarget] = useState<string>(days[0]?.id || '');
  const [addedPlaces, setAddedPlaces] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchPlaces = async () => {
      setIsLoading(true);
      try {
        const data = await apiPlaces.getPlaces({ destination });
        setPlaces(data);
      } catch (err) {
        console.warn('Failed to load places:', err);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchSaved = async () => {
      try {
        const saved = await apiPlaces.getSavedPlaces();
        setSavedPlaceIds(saved.map((s) => s.place_id));
      } catch (err) {
        // ignore
      }
    };

    fetchPlaces();
    fetchSaved();
  }, [destination]);

  useEffect(() => {
    if (days.length > 0 && !activeDayTarget) {
      setActiveDayTarget(days[0].id);
    }
  }, [days, activeDayTarget]);

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

  const handleAdd = (place: Place) => {
    if (!activeDayTarget && days[0]) {
      onAddPlaceToDay(days[0].id, place);
    } else {
      onAddPlaceToDay(activeDayTarget, place);
    }
    setAddedPlaces((prev) => ({ ...prev, [place.id]: true }));
    setTimeout(() => {
      setAddedPlaces((prev) => ({ ...prev, [place.id]: false }));
    }, 2500);
  };

  const categories = ['All', 'Attraction', 'Restaurant', 'Hotel', 'Hidden Gem'];

  const filteredPlaces = places.filter((p) => {
    if (selectedCategory === 'All') return true;
    return p.category === selectedCategory;
  });

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2 font-display">
            <Sparkles className="w-5 h-5 text-orange-600" />
            Top Recommendations & Hidden Gems in {destination}
          </h3>
          <p className="text-xs text-slate-500">Discover highly rated spots and easily add them to your daily schedule</p>
        </div>

        {/* Day Target Selector for Quick-Adding */}
        {days.length > 0 && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs font-semibold text-slate-500">Add to:</span>
            <select
              value={activeDayTarget}
              onChange={(e) => setActiveDayTarget(e.target.value)}
              className="py-1.5 px-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-slate-50 outline-none"
            >
              {days.map((d) => (
                <option key={d.id} value={d.id}>
                  Day {d.day_number} ({d.title})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            type="button"
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              selectedCategory === cat
                ? 'bg-orange-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {cat === 'All' ? '🌟 All Highlights' : cat}
          </button>
        ))}
      </div>

      {/* Places Cards Grid */}
      {isLoading ? (
        <div className="py-12 text-center text-slate-400 text-xs font-semibold">
          Finding recommendations for {destination}...
        </div>
      ) : filteredPlaces.length === 0 ? (
        <div className="py-12 text-center text-slate-400 text-xs font-semibold">
          No recommendations found for this filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPlaces.map((place) => {
            const isSaved = savedPlaceIds.includes(place.id);
            const isJustAdded = addedPlaces[place.id];

            return (
              <div
                key={place.id}
                className="group bg-slate-50/70 hover:bg-white rounded-2xl border border-slate-200/80 overflow-hidden hover:shadow-md transition-all flex flex-col justify-between"
              >
                {/* Photo & Badges */}
                <div className="relative h-40 overflow-hidden">
                  <img
                    src={
                      place.images?.[0] ||
                      'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=600&q=80'
                    }
                    alt={place.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />

                  {/* Category Pill */}
                  <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold">
                    {place.category}
                  </span>

                  {/* Bookmark Button */}
                  <button
                    type="button"
                    onClick={() => toggleSavePlace(place.id)}
                    className="absolute top-2.5 right-2.5 p-2 rounded-xl bg-white/90 backdrop-blur-md text-slate-700 hover:text-orange-600 transition-colors shadow-xs"
                    title={isSaved ? 'Saved in Bookmarks' : 'Bookmark Place'}
                  >
                    <Bookmark
                      className={`w-3.5 h-3.5 ${isSaved ? 'fill-orange-600 text-orange-600' : ''}`}
                    />
                  </button>

                  {/* Rating & Cost */}
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-white text-xs">
                    <span className="flex items-center gap-1 font-bold bg-amber-500/90 px-2 py-0.5 rounded-md">
                      <Star className="w-3 h-3 fill-white text-white" />
                      {place.rating}
                    </span>
                    <span className="font-bold">
                      {place.estimated_cost === 0
                        ? 'Free'
                        : formatCurrency(place.estimated_cost, currency)}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-slate-900 line-clamp-1">{place.name}</h4>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {place.description}
                    </p>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-orange-500 shrink-0" />
                      <span className="truncate">{place.address}</span>
                    </p>
                  </div>

                  {/* Add to day button */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-500">
                      ⏱️ {place.best_time_to_visit || 'Morning / Evening'}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleAdd(place)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 shadow-xs ${
                        isJustAdded
                          ? 'bg-emerald-600 text-white'
                          : 'bg-orange-600 hover:bg-orange-700 text-white active:scale-95'
                      }`}
                    >
                      {isJustAdded ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                      <span>{isJustAdded ? 'Added!' : 'Add to Day'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
