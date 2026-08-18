import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  MapPin,
  Compass,
  Luggage,
  Users,
  Sparkles,
  ArrowRight,
  X,
  Clock,
  TrendingUp,
} from 'lucide-react';
import { TravelWiseLogo } from './TravelWiseLogo';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const POPULAR_DESTINATIONS = [
  { name: 'Goa', state: 'Goa', tag: 'Coastal Escape', path: '/create-trip?destination=Goa' },
  { name: 'Kerala', state: 'Kerala', tag: 'Backwaters & Wellness', path: '/create-trip?destination=Kerala' },
  { name: 'Jaipur', state: 'Rajasthan', tag: 'Royal Heritage', path: '/create-trip?destination=Jaipur' },
  { name: 'Darjeeling', state: 'West Bengal', tag: 'Himalayan Serenity', path: '/create-trip?destination=Darjeeling' },
  { name: 'Varanasi', state: 'Uttar Pradesh', tag: 'Spiritual & Ghats', path: '/create-trip?destination=Varanasi' },
  { name: 'Ladakh', state: 'UT of Ladakh', tag: 'High Altitude Passes', path: '/create-trip?destination=Ladakh' },
];

const QUICK_ACTIONS = [
  { label: 'Plan a New Custom Trip', path: '/create-trip', icon: Sparkles },
  { label: 'Explore Indian States & Spots', path: '/explore', icon: Compass },
  { label: 'Community Stories & Itineraries', path: '/community', icon: Users },
  { label: 'Interactive Destination Map', path: '/explore?view=map', icon: MapPin },
];

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // Toggle or open search
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSelect = (path: string) => {
    onClose();
    navigate(path);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    onClose();
    navigate(`/explore?search=${encodeURIComponent(query.trim())}`);
  };

  const filteredDestinations = query.trim()
    ? POPULAR_DESTINATIONS.filter(
        (d) =>
          d.name.toLowerCase().includes(query.toLowerCase()) ||
          d.state.toLowerCase().includes(query.toLowerCase()) ||
          d.tag.toLowerCase().includes(query.toLowerCase())
      )
    : POPULAR_DESTINATIONS;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-20 flex items-start justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs"
            onClick={onClose}
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.15 }}
            className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10"
          >
            {/* Search Input Bar */}
            <form onSubmit={handleSearchSubmit} className="flex items-center px-4 py-3.5 border-b border-slate-100 bg-[#FAFAF8]">
              <Search className="w-5 h-5 text-slate-400 shrink-0 mr-3" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search Indian destinations, states, itineraries... (e.g. Goa, Kerala, Palaces)"
                className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 outline-none font-medium"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg mr-1"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold text-slate-400 bg-slate-100 rounded-md border border-slate-200 shrink-0">
                ESC
              </kbd>
            </form>

            {/* Results / Suggestions list */}
            <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
              {/* Quick Actions */}
              {!query && (
                <div className="space-y-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 px-2 block">
                    Quick Actions
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {QUICK_ACTIONS.map((action, i) => {
                      const Icon = action.icon;
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleSelect(action.path)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors group text-xs text-slate-700"
                        >
                          <Icon className="w-4 h-4 text-slate-500 group-hover:text-slate-900" />
                          <span className="font-medium group-hover:text-slate-900">{action.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Destinations */}
              <div className="space-y-1">
                <div className="flex items-center justify-between px-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    {query ? 'Matching Destinations' : 'Popular Destinations in India'}
                  </span>
                </div>

                <div className="space-y-1">
                  {filteredDestinations.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 text-xs">
                      No exact matches found for "{query}".
                      <button
                        type="button"
                        onClick={() => handleSelect(`/create-trip?destination=${encodeURIComponent(query)}`)}
                        className="mt-2 block mx-auto text-xs font-semibold text-slate-900 underline"
                      >
                        Plan custom trip to "{query}"
                      </button>
                    </div>
                  ) : (
                    filteredDestinations.map((dest) => (
                      <button
                        key={dest.name}
                        type="button"
                        onClick={() => handleSelect(dest.path)}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 text-left transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                            <MapPin className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-slate-900 flex items-center gap-2">
                              <span>{dest.name}</span>
                              <span className="text-[10px] font-normal text-slate-400">({dest.state})</span>
                            </div>
                            <span className="text-[11px] text-slate-500 font-light">{dest.tag}</span>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-all" />
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between px-4">
              <span>Press <kbd className="font-semibold text-slate-600 bg-white px-1.5 py-0.5 rounded border border-slate-200">↵ Enter</kbd> to search</span>
              <span className="flex items-center gap-1">
                <TravelWiseLogo variant="emblem" size="xs" className="w-3.5 h-3.5" />
                TravelWise Search
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
