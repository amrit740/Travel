import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bookmark, Sparkles, Trash2, MapPin, Star, Plus } from 'lucide-react';
import { SavedPlace, Place } from '../types';
import { apiPlaces } from '../services/api';
import { formatCurrency } from '../lib/utils';

export const SavedPlacesPage: React.FC = () => {
  const navigate = useNavigate();
  const [savedPlaces, setSavedPlaces] = useState<SavedPlace[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSaved = async () => {
    setIsLoading(true);
    try {
      const data = await apiPlaces.getSavedPlaces();
      setSavedPlaces(data);
    } catch (err) {
      console.warn('Failed to load saved places:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSaved();
  }, []);

  const handleRemove = async (placeId: string) => {
    try {
      await apiPlaces.removeSavedPlace(placeId);
      setSavedPlaces((prev) => prev.filter((p) => p.place_id !== placeId));
    } catch (err: any) {
      alert(err.message || 'Failed to remove saved place.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#e2e8f0]">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#C59B27] font-medium block mb-1">
            Personal Bookmarks
          </span>
          <h1 className="font-serif-title text-3xl font-medium text-[#0f172a]">
            Saved Places & Bookmarks
          </h1>
          <p className="text-xs sm:text-sm text-[#64748b] font-light mt-1">
            Spots you have saved for future travel adventures across India.
          </p>
        </div>

        {savedPlaces.length > 0 && (
          <button
            type="button"
            onClick={() => {
              const dest = savedPlaces[0]?.place?.destination || 'Goa';
              navigate(`/create-trip?destination=${encodeURIComponent(dest)}`);
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0f172a] hover:bg-[#1e293b] text-[#f8fafc] text-xs font-semibold shadow-md border border-[#C59B27]/30 active:scale-95 transition-all"
          >
            <Sparkles className="w-4 h-4 text-[#C59B27]" />
            <span>Plan Trip with Saved Spots</span>
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-[#64748b] font-medium text-xs">
          Loading bookmarks...
        </div>
      ) : savedPlaces.length === 0 ? (
        <div className="max-w-md mx-auto py-16 text-center space-y-4 bg-[#FAFAF8] rounded-3xl p-8 border border-[#e2e8f0] shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-[#0f172a]/10 text-[#0f172a] flex items-center justify-center mx-auto">
            <Bookmark className="w-8 h-8 text-[#C59B27]" />
          </div>
          <h3 className="text-lg font-bold text-[#0f172a]">No Saved Places Yet</h3>
          <p className="text-xs text-[#64748b] leading-relaxed">
            As you explore destinations, click the bookmark icon on any attraction, restaurant, or hotel to save it here.
          </p>
          <button
            type="button"
            onClick={() => navigate('/explore')}
            className="px-5 py-2.5 rounded-full bg-[#0f172a] text-[#f8fafc] text-xs font-semibold shadow-xs hover:bg-[#1e293b] border border-[#C59B27]/30"
          >
            Explore Places
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedPlaces.map((sp) => {
            const place = sp.place;
            if (!place) return null;

            return (
              <div
                key={sp.id}
                className="bg-white rounded-3xl border border-[#e2e8f0] overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="relative h-44">
                  <img
                    src={place.images?.[0] || 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=600&q=80'}
                    alt={place.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />

                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold">
                    {place.destination} • {place.category}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleRemove(place.id)}
                    className="absolute top-3 right-3 p-2 rounded-xl bg-white/90 text-rose-600 hover:bg-rose-50 transition-colors shadow-xs"
                    title="Remove from Saved"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                    <span className="flex items-center gap-1 font-bold bg-[#C59B27] px-2 py-0.5 rounded-md text-[#0f172a]">
                      <Star className="w-3 h-3 fill-[#0f172a] text-[#0f172a]" />
                      {place.rating}
                    </span>
                    <span className="font-bold">
                      {place.estimated_cost === 0 ? 'Free' : formatCurrency(place.estimated_cost, 'INR')}
                    </span>
                  </div>
                </div>

                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <h3 className="font-bold text-base text-[#0f172a]">{place.name}</h3>
                    <p className="text-xs text-[#64748b] line-clamp-2">{place.description}</p>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#C59B27] shrink-0" />
                      <span className="truncate">{place.address}</span>
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#e2e8f0] flex items-center justify-between">
                    <span className="text-[11px] text-[#64748b]">
                      Saved on {new Date(sp.created_at).toLocaleDateString()}
                    </span>
                    <button
                      type="button"
                      onClick={() => navigate(`/create-trip?destination=${place.destination}`)}
                      className="px-3.5 py-1.5 rounded-xl bg-[#0f172a] hover:bg-[#1e293b] text-[#f8fafc] text-xs font-semibold shadow-xs flex items-center gap-1 border border-[#C59B27]/30"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#C59B27]" />
                      <span>Plan Trip</span>
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
