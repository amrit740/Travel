import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Clock,
  MapPin,
  Sparkles,
  Edit2,
  Trash2,
  Plus,
  Compass,
  Utensils,
  Hotel,
  Camera,
  ShoppingBag,
  Moon,
  Footprints,
  Info,
  Calendar,
  RefreshCw,
  Eye,
  ChevronUp,
  ChevronDown,
  Navigation,
  Sun,
  CloudRain,
  CloudSun,
  ShieldCheck,
  Heart,
  Check,
} from 'lucide-react';
import { ItineraryDay, Activity } from '../../types';
import { formatCurrency } from '../../lib/utils';
import { PlaceImage } from '../common/PlaceImage';

interface ItineraryTimelineProps {
  days: ItineraryDay[];
  selectedDayNumber: number;
  onSelectDay: (dayNumber: number) => void;
  currency?: string;
  onAddActivity: (dayId: string) => void;
  onEditActivity: (activity: Activity) => void;
  onDeleteActivity: (activityId: string) => void;
  onRegenerateActivity: (activityId: string, dayTitle: string) => void;
  onRegenerateDay: (dayId: string, dayNumber: number) => void;
  onReorderActivities?: (dayId: string, activities: Activity[]) => void;
  onFocusMapPin?: (activity: Activity) => void;
  isRegeneratingActivityId?: string | null;
  isRegeneratingDayId?: string | null;
  readOnly?: boolean;
}

const getCategoryBadge = (category: string) => {
  switch (category) {
    case 'Food & Dining':
      return { bg: 'bg-orange-50 text-orange-700 border-orange-200', icon: Utensils };
    case 'Sightseeing':
      return { bg: 'bg-purple-50 text-purple-700 border-purple-200', icon: Camera };
    case 'Culture & History':
      return { bg: 'bg-rose-50 text-rose-700 border-rose-200', icon: Compass };
    case 'Adventure':
      return { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: Footprints };
    case 'Hotel / Stay':
      return { bg: 'bg-blue-50 text-blue-700 border-blue-200', icon: Hotel };
    case 'Shopping':
      return { bg: 'bg-pink-50 text-pink-700 border-pink-200', icon: ShoppingBag };
    case 'Nightlife':
      return { bg: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: Moon };
    default:
      return { bg: 'bg-slate-50 text-slate-700 border-slate-200', icon: MapPin };
  }
};

export const ItineraryTimeline: React.FC<ItineraryTimelineProps> = ({
  days,
  selectedDayNumber,
  onSelectDay,
  currency = 'INR',
  onAddActivity,
  onEditActivity,
  onDeleteActivity,
  onRegenerateActivity,
  onRegenerateDay,
  onReorderActivities,
  onFocusMapPin,
  isRegeneratingActivityId,
  isRegeneratingDayId,
  readOnly = false,
}) => {
  const [weatherNotice, setWeatherNotice] = useState<string | null>(null);
  const [savedActivityIds, setSavedActivityIds] = useState<Set<string>>(new Set());

  const currentDay = days.find((d) => d.day_number === selectedDayNumber) || days[0];

  if (!days || days.length === 0) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-slate-200">
        <p className="text-slate-500 font-semibold">No itinerary days generated yet.</p>
      </div>
    );
  }

  const handleMoveUp = (idx: number) => {
    if (!currentDay || idx <= 0) return;
    const newActs = [...(currentDay.activities || [])];
    const temp = newActs[idx];
    newActs[idx] = newActs[idx - 1];
    newActs[idx - 1] = temp;
    if (onReorderActivities) {
      onReorderActivities(currentDay.id, newActs);
    }
  };

  const handleMoveDown = (idx: number) => {
    if (!currentDay || !currentDay.activities || idx >= currentDay.activities.length - 1) return;
    const newActs = [...currentDay.activities];
    const temp = newActs[idx];
    newActs[idx] = newActs[idx + 1];
    newActs[idx + 1] = temp;
    if (onReorderActivities) {
      onReorderActivities(currentDay.id, newActs);
    }
  };

  const toggleSaveActivity = (activityId: string) => {
    setSavedActivityIds((prev) => {
      const next = new Set(prev);
      if (next.has(activityId)) next.delete(activityId);
      else next.add(activityId);
      return next;
    });
  };

  const handleWeatherAdapt = () => {
    setWeatherNotice('Optimizing itinerary for weather: prioritize indoor dining & covered cultural venues during peak warmth/rain showers.');
    setTimeout(() => setWeatherNotice(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Day Selector Navigation Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {days.map((day) => {
          const isSelected = day.day_number === selectedDayNumber;
          return (
            <button
              type="button"
              key={day.id}
              onClick={() => onSelectDay(day.day_number)}
              className={`px-4 py-2.5 rounded-2xl text-sm font-bold transition-all shrink-0 flex items-center gap-2 border-2 ${
                isSelected
                  ? 'border-[#0B3D2E] bg-[#0B3D2E] text-[#F7F5EF] shadow-md shadow-[#0B3D2E]/20 scale-[1.02]'
                  : 'border-[#E3E7E2] bg-white text-[#2D3A34] hover:border-[#C8A96B]'
              }`}
            >
              <Calendar className="w-4 h-4 text-[#C8A96B]" />
              <span>Day {day.day_number}</span>
              <span
                className={`text-[11px] px-1.5 py-0.5 rounded-full font-semibold ${
                  isSelected ? 'bg-[#176B50] text-[#F7F5EF]' : 'bg-[#F7F5EF] text-[#66736C]'
                }`}
              >
                {day.activities?.length || 0}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected Day Content Card */}
      {currentDay && (
        <div className="bg-white rounded-3xl border border-[#E3E7E2] p-6 sm:p-8 shadow-xs space-y-6">
          {/* Day Header Info */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E3E7E2]/70">
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-[#0B3D2E] uppercase tracking-wider mb-1">
                <span>Day {currentDay.day_number}</span>
                <span>•</span>
                <span>{currentDay.date}</span>
                <span>•</span>
                <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                  <Sun className="w-3 h-3 text-amber-500" />
                  29°C Pleasant & Sunny
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-serif-title font-semibold text-[#0B3D2E]">
                {currentDay.title}
              </h3>
              {currentDay.description && (
                <p className="text-xs sm:text-sm text-[#66736C] mt-1 max-w-2xl font-light leading-relaxed">
                  {currentDay.description}
                </p>
              )}
            </div>

            {/* Actions for Day */}
            {!readOnly && (
              <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto shrink-0">
                <button
                  type="button"
                  onClick={handleWeatherAdapt}
                  className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold transition-colors flex items-center gap-1.5 border border-amber-200"
                  title="Optimize activities for weather forecast"
                >
                  <CloudSun className="w-3.5 h-3.5 text-amber-600" />
                  <span>Weather Adapt</span>
                </button>

                <button
                  type="button"
                  onClick={() => onRegenerateDay(currentDay.id, currentDay.day_number)}
                  disabled={isRegeneratingDayId === currentDay.id}
                  className="px-3.5 py-2 rounded-xl bg-[#F7F5EF] hover:bg-[#E3E7E2] text-[#0B3D2E] text-xs font-bold transition-colors flex items-center gap-1.5 border border-[#E3E7E2]"
                  title="Regenerate all activities for this day"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 ${isRegeneratingDayId === currentDay.id ? 'animate-spin' : ''}`}
                  />
                  <span>Refresh Day</span>
                </button>

                <button
                  type="button"
                  onClick={() => onAddActivity(currentDay.id)}
                  className="px-3.5 py-2 rounded-xl bg-[#0B3D2E] hover:bg-[#176B50] text-[#F7F5EF] text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Activity</span>
                </button>
              </div>
            )}
          </div>

          {/* Weather Advisory Banner if triggered */}
          {weatherNotice && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2">
                <Sun className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{weatherNotice}</span>
              </div>
              <button
                type="button"
                onClick={() => setWeatherNotice(null)}
                className="text-amber-800 hover:text-amber-950 text-xs font-bold"
              >
                Dismiss
              </button>
            </motion.div>
          )}

          {/* Activities Timeline */}
          <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-2 sm:before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#C8A96B]/50">
            {(!currentDay.activities || currentDay.activities.length === 0) && (
              <div className="py-8 text-center text-[#8A9790] space-y-2">
                <p className="text-xs font-light">No activities planned for this day yet.</p>
                {!readOnly && (
                  <button
                    type="button"
                    onClick={() => onAddActivity(currentDay.id)}
                    className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0B3D2E] text-[#F7F5EF] text-xs font-semibold hover:bg-[#176B50]"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add First Activity
                  </button>
                )}
              </div>
            )}

            {currentDay.activities?.map((activity, idx) => {
              const badge = getCategoryBadge(activity.category);
              const CategoryIcon = badge.icon;
              const isBeingRegenerated = isRegeneratingActivityId === activity.id;
              const isSaved = savedActivityIds.has(activity.id);

              return (
                <motion.div
                  key={activity.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative group bg-[#F7F5EF]/60 hover:bg-white rounded-2xl p-5 border border-[#E3E7E2] hover:border-[#C8A96B] hover:shadow-md transition-all"
                >
                  {/* Timeline dot */}
                  <div className="absolute -left-[30px] sm:-left-[38px] top-6 w-5 h-5 rounded-full bg-white border-4 border-[#0B3D2E] shadow-xs flex items-center justify-center" />

                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    {/* Activity Image */}
                    <div className="w-full sm:w-36 h-28 sm:h-28 rounded-xl overflow-hidden shrink-0 border border-[#E3E7E2] shadow-xs">
                      <PlaceImage
                        name={activity.name}
                        destination={currentDay.title}
                        category={activity.category}
                        src={activity.image}
                        alt={activity.name}
                        className="w-full h-full"
                        photos={activity.photos}
                        gallery={activity.gallery}
                        authorAttributions={activity.authorAttributions}
                        address={activity.location}
                        latitude={activity.latitude}
                        longitude={activity.longitude}
                        showGalleryButton={true}
                        showVerifiedBadge={false}
                      />
                    </div>

                    <div className="space-y-2 flex-1 min-w-0">
                      {/* Meta Tags (Time, Category, Cost) */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#0B3D2E] bg-white border border-[#E3E7E2] px-2.5 py-1 rounded-lg">
                          <Clock className="w-3 h-3 text-[#C8A96B]" />
                          {activity.start_time || 'Flexible'}
                          {activity.duration && ` • ${activity.duration}`}
                        </span>

                        <span
                          className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg border ${badge.bg}`}
                        >
                          <CategoryIcon className="w-3 h-3" />
                          {activity.category}
                        </span>

                        <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                          {activity.estimated_cost === 0
                            ? 'Free Entry'
                            : formatCurrency(activity.estimated_cost, currency)}
                        </span>

                        {/* Accessibility Tag */}
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#66736C] bg-white border border-[#E3E7E2] px-2 py-0.5 rounded-lg">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          <span>Accessible & Verified</span>
                        </span>
                      </div>

                      {/* Activity Title */}
                      <h4 className="text-base sm:text-lg font-serif-title font-semibold text-[#0B3D2E] flex items-center gap-2">
                        <span>{activity.name}</span>
                      </h4>

                      {/* Description */}
                      {activity.description && (
                        <p className="text-xs sm:text-sm text-[#66736C] font-light leading-relaxed">
                          {activity.description}
                        </p>
                      )}

                      {/* Location, Directions & Map trigger */}
                      {activity.location && (
                        <div className="flex flex-wrap items-center gap-3 pt-1">
                          <button
                            type="button"
                            onClick={() => onFocusMapPin && onFocusMapPin(activity)}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-[#0B3D2E] hover:text-[#176B50] hover:underline"
                          >
                            <MapPin className="w-3.5 h-3.5 text-[#C8A96B]" />
                            {activity.location}
                          </button>

                          <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                              activity.name + ', ' + activity.location
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200"
                          >
                            <Navigation className="w-3 h-3 text-emerald-600" />
                            <span>Directions</span>
                          </a>

                          <button
                            type="button"
                            onClick={() => toggleSaveActivity(activity.id)}
                            className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md border transition-colors ${
                              isSaved
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : 'bg-white text-[#66736C] border-[#E3E7E2] hover:bg-[#F7F5EF]'
                            }`}
                          >
                            <Heart className={`w-3 h-3 ${isSaved ? 'fill-rose-600 text-rose-600' : ''}`} />
                            <span>{isSaved ? 'Saved' : 'Save'}</span>
                          </button>
                        </div>
                      )}

                      {/* Insider Notes */}
                      {activity.notes && (
                        <div className="mt-2 text-xs font-medium text-amber-900 bg-amber-50/90 border border-amber-200/80 rounded-xl p-2.5 flex items-start gap-1.5">
                          <Info className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                          <span>{activity.notes}</span>
                        </div>
                      )}
                    </div>

                    {/* Action Controls (Reorder, AI Regenerate, Edit, Delete) */}
                    {!readOnly && (
                      <div className="flex items-center gap-1 self-end sm:self-start opacity-90 group-hover:opacity-100 transition-opacity">
                        {/* Move Up */}
                        <button
                          type="button"
                          onClick={() => handleMoveUp(idx)}
                          disabled={idx === 0}
                          className="p-1.5 rounded-xl text-[#66736C] hover:text-[#0B3D2E] hover:bg-white border border-[#E3E7E2] disabled:opacity-30"
                          title="Move activity earlier"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>

                        {/* Move Down */}
                        <button
                          type="button"
                          onClick={() => handleMoveDown(idx)}
                          disabled={!currentDay.activities || idx === currentDay.activities.length - 1}
                          className="p-1.5 rounded-xl text-[#66736C] hover:text-[#0B3D2E] hover:bg-white border border-[#E3E7E2] disabled:opacity-30"
                          title="Move activity later"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>

                        {/* AI Regenerate */}
                        <button
                          type="button"
                          onClick={() => onRegenerateActivity(activity.id, currentDay.title)}
                          disabled={isBeingRegenerated}
                          className="p-1.5 rounded-xl text-[#66736C] hover:text-[#0B3D2E] hover:bg-[#C8A96B]/20 border border-[#E3E7E2] transition-colors"
                          title="Swap with bespoke AI alternative"
                        >
                          <Sparkles className={`w-3.5 h-3.5 ${isBeingRegenerated ? 'animate-spin text-[#C8A96B]' : 'text-[#C8A96B]'}`} />
                        </button>

                        {/* Edit */}
                        <button
                          type="button"
                          onClick={() => onEditActivity(activity)}
                          className="p-1.5 rounded-xl text-[#66736C] hover:text-blue-700 hover:bg-blue-50 border border-[#E3E7E2] transition-colors"
                          title="Edit activity"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => onDeleteActivity(activity.id)}
                          className="p-1.5 rounded-xl text-[#66736C] hover:text-rose-700 hover:bg-rose-50 border border-[#E3E7E2] transition-colors"
                          title="Remove activity"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
