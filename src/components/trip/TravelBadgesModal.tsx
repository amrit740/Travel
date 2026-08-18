import React from 'react';
import {
  X,
  Award,
  Compass,
  CheckCircle2,
  Utensils,
  DollarSign,
  Sparkles,
  Lock,
  Flame,
} from 'lucide-react';
import { useCurrentTrip } from '../../contexts/TripContext';
import { TravelBadge } from '../../types';

interface TravelBadgesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const getBadgeIcon = (iconName: string) => {
  switch (iconName) {
    case 'Compass':
      return Compass;
    case 'CheckCircle2':
      return CheckCircle2;
    case 'Utensils':
      return Utensils;
    case 'DollarSign':
      return DollarSign;
    default:
      return Sparkles;
  }
};

export const TravelBadgesModal: React.FC<TravelBadgesModalProps> = ({ isOpen, onClose }) => {
  const { currentTrip, travelBadges } = useCurrentTrip();

  if (!isOpen) return null;

  const unlockedCount = travelBadges.filter((b) => b.unlocked).length;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200/80 space-y-6 relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-display">
              Travel Badges & Achievements
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            Earn milestone achievements as you plan, personalize, and complete activities on your trips.
          </p>
        </div>

        {/* Unlocked Summary Banner */}
        <div className="bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-yellow-500/15 p-4 rounded-2xl border border-amber-200/60 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-amber-950">Achievements Unlocked</p>
            <p className="text-lg font-extrabold text-orange-600">
              {unlockedCount} of {travelBadges.length} Badges
            </p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white shadow-xs text-xs font-bold text-amber-800 border border-amber-200">
            <Flame className="w-4 h-4 text-orange-500" />
            <span>Active Explorer</span>
          </div>
        </div>

        {/* Badges Grid */}
        <div className="space-y-3">
          {travelBadges.map((badge) => {
            const Icon = getBadgeIcon(badge.iconName);
            const percent = Math.round((badge.progress / badge.maxProgress) * 100);

            return (
              <div
                key={badge.id}
                className={`p-4 rounded-2xl border transition-all flex items-start gap-4 ${
                  badge.unlocked
                    ? 'bg-gradient-to-br from-amber-50/50 to-orange-50/30 border-amber-200 shadow-xs'
                    : 'bg-slate-50/60 border-slate-200 opacity-70'
                }`}
              >
                {/* Icon Badge */}
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                    badge.unlocked
                      ? 'bg-gradient-to-tr from-amber-500 to-orange-500 text-white'
                      : 'bg-slate-200 text-slate-400'
                  }`}
                >
                  {badge.unlocked ? <Icon className="w-6 h-6" /> : <Lock className="w-5 h-5" />}
                </div>

                {/* Info & Progress */}
                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-900">{badge.name}</h4>
                    {badge.unlocked ? (
                      <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                        Unlocked ✓
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold text-slate-400">
                        {badge.progress} / {badge.maxProgress}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">{badge.description}</p>

                  {/* Progress Bar */}
                  <div className="pt-1">
                    <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          badge.unlocked ? 'bg-amber-500' : 'bg-slate-400'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
