import React from 'react';
import {
  Clock,
  MapPin,
  CheckCircle2,
  Navigation,
  Sparkles,
  ArrowRight,
  DollarSign,
  Utensils,
  Camera,
  Compass,
  Footprints,
  Hotel,
  ShoppingBag,
  Moon,
  ChevronRight,
  SkipForward,
} from 'lucide-react';
import { useCurrentTrip } from '../../contexts/TripContext';
import { formatCurrency } from '../../lib/utils';
import { Activity } from '../../types';

interface UpNextCardProps {
  onAskAI?: (activity: Activity) => void;
  onViewLocation?: (activity: Activity) => void;
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Food & Dining':
      return Utensils;
    case 'Sightseeing':
      return Camera;
    case 'Culture & History':
      return Compass;
    case 'Adventure':
      return Footprints;
    case 'Hotel / Stay':
      return Hotel;
    case 'Shopping':
      return ShoppingBag;
    case 'Nightlife':
      return Moon;
    default:
      return MapPin;
  }
};

export const UpNextCard: React.FC<UpNextCardProps> = ({ onAskAI, onViewLocation }) => {
  const { currentTrip, upNextActivity, toggleActivityCompleted, toggleActivitySkipped } =
    useCurrentTrip();

  if (!currentTrip) return null;

  if (!upNextActivity) {
    return (
      <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/5 rounded-3xl border border-emerald-200/80 p-6 text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900">All Scheduled Activities Completed!</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            You've experienced all planned stops for your {currentTrip.destination} itinerary. Ready to explore spontaneous nearby spots?
          </p>
        </div>
      </div>
    );
  }

  const { activity, dayNumber, dayTitle } = upNextActivity;
  const CategoryIcon = getCategoryIcon(activity.category);

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${activity.name} ${activity.location || currentTrip.destination}`
  )}`;

  return (
    <div className="bg-white rounded-3xl border border-[#E3E7E2] p-6 shadow-xs relative overflow-hidden space-y-4">
      {/* Top Banner with Day Badge & Time */}
      <div className="flex items-center justify-between gap-2 border-b border-[#E3E7E2] pb-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#176B50] animate-ping" />
          <span className="text-[11px] font-medium uppercase tracking-widest text-[#0B3D2E]">
            Up Next • Day {dayNumber}
          </span>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-light bg-[#F7F5EF] text-[#0B3D2E] border border-[#E3E7E2]">
          <Clock className="w-3.5 h-3.5 text-[#C8A96B]" />
          <span>{activity.start_time || 'Next Scheduled Stop'}</span>
        </span>
      </div>

      {/* Activity Details Main */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-lg bg-[#F7F5EF] text-[#18221E] text-[11px] font-medium border border-[#E3E7E2] flex items-center gap-1">
              <CategoryIcon className="w-3 h-3 text-[#0B3D2E]" />
              <span>{activity.category}</span>
            </span>
            {activity.duration && (
              <span className="text-xs text-[#66736C] font-light">
                ⏱️ {activity.duration}
              </span>
            )}
          </div>

          <h3 className="font-serif-title text-xl sm:text-2xl font-medium text-[#0B3D2E]">
            {activity.name}
          </h3>

          <p className="text-xs text-[#66736C] font-light line-clamp-2 leading-relaxed">
            {activity.description || `Key signature attraction scheduled on Day ${dayNumber} in ${currentTrip.destination}.`}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-[#66736C]">
            <span className="flex items-center gap-1 font-light text-[#18221E]">
              <MapPin className="w-3.5 h-3.5 text-[#C8A96B]" />
              <span className="truncate max-w-[200px]">{activity.location || currentTrip.destination}</span>
            </span>
            {activity.estimated_cost !== undefined && (
              <span className="font-medium text-[#0B3D2E]">
                Est: {formatCurrency(activity.estimated_cost, currentTrip.currency)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons: Check In, Skip, Map Directions, AI Ask */}
      <div className="pt-3 flex flex-wrap items-center gap-2 border-t border-[#E3E7E2]">
        <button
          type="button"
          onClick={() => toggleActivityCompleted(activity.id)}
          className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-[#0B3D2E] hover:bg-[#176B50] text-[#F7F5EF] text-xs font-medium tracking-wide shadow-xs active:scale-98 transition-all"
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-[#C8A96B]" />
          <span>Mark as Visited</span>
        </button>

        <button
          type="button"
          onClick={() => toggleActivitySkipped(activity.id)}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-full bg-[#F7F5EF] hover:bg-[#E3E7E2] text-[#18221E] text-xs font-medium border border-[#E3E7E2] transition-all"
          title="Skip this activity for now"
        >
          <SkipForward className="w-3.5 h-3.5" />
          <span>Skip</span>
        </button>

        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-full border border-[#E3E7E2] text-[#18221E] hover:border-[#0B3D2E] text-xs font-light transition-all"
        >
          <Navigation className="w-3.5 h-3.5 text-[#C8A96B]" />
          <span>Get Directions</span>
        </a>

        {onAskAI && (
          <button
            type="button"
            onClick={() => onAskAI(activity)}
            className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-full bg-[#F7F5EF] text-[#0B3D2E] border border-[#C8A96B]/40 hover:bg-[#FAF9F5] text-xs font-medium transition-all ml-auto"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#C8A96B]" />
            <span>Concierge Insight</span>
          </button>
        )}
      </div>
    </div>
  );
};
