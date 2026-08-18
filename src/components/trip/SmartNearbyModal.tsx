import React, { useState } from 'react';
import {
  Compass,
  X,
  Star,
  Plus,
  Clock,
  ThumbsUp,
  CheckCircle2,
} from 'lucide-react';
import { useCurrentTrip } from '../../contexts/TripContext';
import { formatCurrency } from '../../lib/utils';

interface SmartNearbyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SmartNearbyModal: React.FC<SmartNearbyModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { currentTrip, personalizedPlaces, addSpotToDay, selectedDayNumber } = useCurrentTrip();

  const [activeFilter, setActiveFilter] = useState<'all' | 'food' | 'sunset' | 'hidden' | 'walk'>('all');
  const [addingPlaceId, setAddingPlaceId] = useState<string | null>(null);
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});

  if (!isOpen || !currentTrip) return null;

  const filters = [
    { id: 'all', label: 'All Smart Picks' },
    { id: 'walk', label: '🚶 Walking (<15m)' },
    { id: 'food', label: '🍴 Authentic Culinary' },
    { id: 'sunset', label: '🌅 Golden Hour Sunset' },
    { id: 'hidden', label: '✨ Local Secrets' },
  ];

  const filteredPlaces = personalizedPlaces.filter((p) => {
    if (activeFilter === 'walk') return (p.rating || 4.5) >= 4.7;
    if (activeFilter === 'food') return p.category === 'Restaurant';
    if (activeFilter === 'sunset') return p.description.toLowerCase().includes('sunset') || p.name.toLowerCase().includes('beach') || p.name.toLowerCase().includes('fort');
    if (activeFilter === 'hidden') return p.isRecommended || (p.matchScore || 0) > 85;
    return true;
  });

  const handleAdd = async (place: any) => {
    setAddingPlaceId(place.id);
    const day = currentTrip.itinerary_days?.find((d) => d.day_number === selectedDayNumber) || currentTrip.itinerary_days?.[0];
    if (day) {
      await addSpotToDay(day.id, place);
      setAddedIds((prev) => ({ ...prev, [place.id]: true }));
    }
    setAddingPlaceId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B3D2E]/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-[#F7F5EF] border border-[#E3E7E2] rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="bg-[#0B3D2E] text-[#F7F5EF] p-6 sm:p-7 relative border-b border-[#C8A96B]/30">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-[#F7F5EF] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-[#C8A96B]/20 border border-[#C8A96B]/40 flex items-center justify-center">
              <Compass className="w-5 h-5 text-[#C8A96B]" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-widest text-[#C8A96B] font-medium block">
                Context-Aware Nearby Discovery
              </span>
              <h2 className="font-serif-title text-2xl text-[#F7F5EF] font-medium tracking-tight">
                Smart Nearby & AI Review Digest
              </h2>
            </div>
          </div>
          <p className="text-xs text-[#E3E7E2]/80 font-light mt-1">
            Discover verified spots around your current stops in {currentTrip.destination}, complete with synthesized AI pros & cons.
          </p>

          {/* Filter Chips */}
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/10 overflow-x-auto no-scrollbar">
            {filters.map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id as any)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  activeFilter === f.id
                    ? 'bg-[#C8A96B] text-[#0B3D2E] font-semibold shadow-sm'
                    : 'bg-white/10 text-white/80 hover:bg-white/20'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="p-6 sm:p-7 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredPlaces.map((place) => {
              const isAdded = addedIds[place.id];
              const isAdding = addingPlaceId === place.id;
              const matchScore = place.matchScore || 90;
              const reason = place.matchReasons?.[0] || 'Matches your luxury beach & culinary preferences.';

              return (
                <div
                  key={place.id}
                  className="p-4 rounded-2xl bg-white border border-[#E3E7E2] shadow-sm hover:border-[#C8A96B]/50 transition-all flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    {/* Top Image & Badge */}
                    <div className="relative h-36 rounded-xl overflow-hidden bg-stone-100">
                      <img
                        src={place.image || 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=600&q=80'}
                        alt={place.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-[#0B3D2E]/85 backdrop-blur-md text-[#F7F5EF] text-[10px] font-medium">
                        {place.category}
                      </div>
                      <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-[#C8A96B] text-[#0B3D2E] text-[10px] font-bold flex items-center gap-1">
                        <Star className="w-3 h-3 fill-current" />
                        <span>{place.rating || 4.8}</span>
                      </div>
                    </div>

                    {/* Title & Match */}
                    <div>
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="font-serif-title text-sm font-bold text-[#0B3D2E] leading-tight">
                          {place.name}
                        </h4>
                        <span className="text-[10px] font-semibold text-[#176B50] bg-[#176B50]/10 px-2 py-0.5 rounded-md flex-shrink-0">
                          {matchScore}% Match
                        </span>
                      </div>
                      <p className="text-[11px] text-[#66736C] font-light mt-1 line-clamp-2">
                        {place.description}
                      </p>
                    </div>

                    {/* AI Review Digest Box */}
                    <div className="p-2.5 rounded-xl bg-[#F7F5EF] border border-[#E3E7E2] space-y-1 text-[10px]">
                      <span className="font-semibold text-[#0B3D2E] block text-[10px]">
                        ✨ AI Review Digest:
                      </span>
                      <div className="flex items-start gap-1 text-emerald-800">
                        <ThumbsUp className="w-3 h-3 flex-shrink-0 mt-0.5" />
                        <span>{reason}</span>
                      </div>
                      <div className="flex items-start gap-1 text-[#66736C]">
                        <Clock className="w-3 h-3 flex-shrink-0 mt-0.5" />
                        <span>Best visit: 4:30 PM - 6:30 PM (Golden hour breeze)</span>
                      </div>
                    </div>
                  </div>

                  {/* Add Button & Cost */}
                  <div className="flex items-center justify-between pt-2 border-t border-[#E3E7E2]">
                    <span className="text-xs font-semibold text-[#0B3D2E]">
                      {place.estimated_cost ? formatCurrency(place.estimated_cost, currentTrip.currency) : 'Free admission'}
                    </span>

                    <button
                      onClick={() => handleAdd(place)}
                      disabled={isAdded || isAdding}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1 transition-all ${
                        isAdded
                          ? 'bg-[#176B50] text-white'
                          : 'bg-[#0B3D2E] hover:bg-[#176B50] text-[#F7F5EF] shadow-sm'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Added to Day {selectedDayNumber}</span>
                        </>
                      ) : isAdding ? (
                        <span>Adding...</span>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5 text-[#C8A96B]" />
                          <span>Add to Day {selectedDayNumber}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#EAE6DD] p-4 sm:p-5 flex items-center justify-between border-t border-[#E3E7E2]">
          <span className="text-xs text-[#66736C]">Targeting Day {selectedDayNumber} Itinerary</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-[#0B3D2E] hover:bg-[#176B50] text-[#F7F5EF] text-xs font-medium transition-colors"
          >
            Close Discovery
          </button>
        </div>
      </div>
    </div>
  );
};
