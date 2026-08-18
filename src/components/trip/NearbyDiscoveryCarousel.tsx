import React, { useState } from 'react';
import {
  Compass,
  Star,
  MapPin,
  DollarSign,
  Plus,
  Sparkles,
  ExternalLink,
  Check,
  Tag,
  Filter,
} from 'lucide-react';
import { useCurrentTrip } from '../../contexts/TripContext';
import { formatCurrency } from '../../lib/utils';
import { PersonalizedPlace } from '../../types';

interface NearbyDiscoveryCarouselProps {
  onAddPlace?: (dayId: string, place: PersonalizedPlace) => Promise<void>;
}

export const NearbyDiscoveryCarousel: React.FC<NearbyDiscoveryCarouselProps> = ({ onAddPlace }) => {
  const { currentTrip, personalizedPlaces, selectedDayNumber, addSpotToDay } = useCurrentTrip();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [addingPlaceId, setAddingPlaceId] = useState<string | null>(null);

  if (!currentTrip || personalizedPlaces.length === 0) return null;

  const categories = ['All', 'Attraction', 'Restaurant', 'Hotel', 'Hidden Gem'];

  const filteredPlaces = personalizedPlaces.filter((p) => {
    if (selectedCategory === 'All') return true;
    return p.category === selectedCategory;
  });

  const handleAdd = async (place: PersonalizedPlace) => {
    setAddingPlaceId(place.id);
    const day =
      currentTrip.itinerary_days?.find((d) => d.day_number === selectedDayNumber) ||
      currentTrip.itinerary_days?.[0];

    if (day) {
      if (onAddPlace) {
        await onAddPlace(day.id, place);
      } else {
        await addSpotToDay(day.id, place);
      }
    }
    setAddingPlaceId(null);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
      {/* Header & Category Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
              <Compass className="w-5 h-5" />
            </span>
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-display">
              Personalized Recommendations for {currentTrip.destination}
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Handpicked attractions, culinary hotspots, and hidden gems scored for your travel preferences.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              type="button"
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                selectedCategory === cat
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Places Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filteredPlaces.slice(0, 8).map((place) => {
          const isAdding = addingPlaceId === place.id;
          return (
            <div
              key={place.id}
              className="group rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-xs hover:shadow-md hover:border-orange-300 transition-all flex flex-col justify-between"
            >
              {/* Image with Category & Match Score Overlay */}
              <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                <img
                  src={place.image}
                  alt={place.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Match Score Badge */}
                {place.matchScore && (
                  <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-xl bg-orange-600/90 backdrop-blur-xs text-white text-[11px] font-extrabold flex items-center gap-1 shadow-sm">
                    <Sparkles className="w-3 h-3 text-orange-200" />
                    <span>{place.matchScore}% Match</span>
                  </div>
                )}

                {/* Category Pill */}
                <div className="absolute bottom-2.5 left-2.5 px-2.5 py-0.5 rounded-lg bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold">
                  {place.category}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 space-y-2.5 flex-1 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      <span>{place.rating || 4.8}</span>
                      {place.reviews_count && (
                        <span className="text-[10px] text-slate-400">({place.reviews_count})</span>
                      )}
                    </div>
                    <span className="text-xs font-bold text-slate-900">
                      {place.estimated_cost
                        ? formatCurrency(place.estimated_cost, currentTrip.currency)
                        : place.price_level || '$$'}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 line-clamp-1 group-hover:text-orange-600 transition-colors">
                    {place.name}
                  </h4>

                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {place.description}
                  </p>

                  {/* Match Reason snippet */}
                  {place.matchReasons && place.matchReasons.length > 0 && (
                    <div className="text-[11px] text-orange-700 bg-orange-50/80 px-2 py-1 rounded-lg font-medium line-clamp-1">
                      💡 {place.matchReasons[0]}
                    </div>
                  )}
                </div>

                {/* Card Actions: 1-Click Add to Day */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-400 truncate max-w-[120px]">
                    {place.address || place.destination}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleAdd(place)}
                    disabled={isAdding}
                    className="px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-xs active:scale-95 transition-all flex items-center gap-1 shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isAdding ? 'Adding...' : `Add to Day ${selectedDayNumber}`}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
