import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Accessibility,
  X,
  CheckCircle2,
  Heart,
  Baby,
  UserCheck,
  Building,
  Sparkles,
  Shield,
  HelpCircle,
} from 'lucide-react';
import { Trip } from '../../types';

interface AccessibilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: Trip;
  onUpdatePreferences?: (preferences: string[]) => void;
}

const ACCESSIBILITY_OPTIONS = [
  {
    id: 'wheelchair',
    title: 'Wheelchair Accessible Routes & Ramps',
    description: 'Ensure venues have step-free entrances, wide elevators, and smooth paved walkways.',
    icon: Accessibility,
    tag: 'Wheelchair Friendly ♿',
  },
  {
    id: 'reduced_walking',
    title: 'Reduced Walking Distance',
    description: 'Clusters destinations close together and minimizes transit footpaths under 400m.',
    icon: UserCheck,
    tag: 'Low Walking Effort',
  },
  {
    id: 'avoid_stairs',
    title: 'Avoid Steep Stairs & Incline Climbs',
    description: 'Bypasses steep steps, mountain ascents, and heritage fort staircase climbs.',
    icon: Building,
    tag: 'Step-Free Access',
  },
  {
    id: 'elevators',
    title: 'Elevator & Lift Required',
    description: 'Prioritizes attractions and stays with functional multi-level elevators.',
    icon: Building,
    tag: 'Elevator Available',
  },
  {
    id: 'accessible_restrooms',
    title: 'Accessible Restrooms at Venues',
    description: 'Filters for restaurants and landmarks with verified accessible facilities.',
    icon: Shield,
    tag: 'Accessible WC',
  },
  {
    id: 'senior_friendly',
    title: 'Senior Citizen Friendly',
    description: 'Gentle itinerary pacing with ample rest benches, shade, and hydration spots.',
    icon: Heart,
    tag: 'Senior Friendly',
  },
  {
    id: 'child_friendly',
    title: 'Child & Stroller Friendly',
    description: 'Safe sidewalks, family-friendly eateries, and stroller-accessible museum halls.',
    icon: Baby,
    tag: 'Stroller / Kid Friendly',
  },
];

export const AccessibilityModal: React.FC<AccessibilityModalProps> = ({
  isOpen,
  onClose,
  trip,
  onUpdatePreferences,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(['wheelchair', 'senior_friendly']);
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen || !trip) return null;

  const toggleOption = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSave = () => {
    const selectedTags = ACCESSIBILITY_OPTIONS.filter((opt) =>
      selectedIds.includes(opt.id)
    ).map((opt) => opt.tag);

    if (onUpdatePreferences) {
      onUpdatePreferences(selectedTags);
    }
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 800);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-slate-800 border border-[#C59B27]/40 flex items-center justify-center">
                <Accessibility className="w-5 h-5 text-[#E5C365]" />
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-widest text-[#E5C365] font-semibold block">
                  Inclusive Journey Design
                </span>
                <h2 className="font-serif-title text-2xl font-medium tracking-tight text-white">
                  Accessibility & Mobility Preferences
                </h2>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto space-y-4 flex-1 bg-[#FAFAF8]">
            <p className="text-xs text-slate-500 font-light leading-relaxed">
              TravelWise automatically tailors itineraries, walking segments, and venue recommendations to ensure comfortable and seamless access for everyone.
            </p>

            <div className="space-y-2.5">
              {ACCESSIBILITY_OPTIONS.map((opt) => {
                const isChecked = selectedIds.includes(opt.id);
                return (
                  <div
                    key={opt.id}
                    onClick={() => toggleOption(opt.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-4 ${
                      isChecked
                        ? 'bg-white border-slate-900 shadow-sm'
                        : 'bg-white/80 border-slate-200 hover:border-slate-400'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          isChecked
                            ? 'bg-slate-900 text-white'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        <opt.icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-slate-900 text-xs">{opt.title}</h4>
                          <span className="text-[10px] font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                            {opt.tag}
                          </span>
                        </div>
                        <p className="text-slate-500 text-[11px] font-light mt-0.5 leading-relaxed">
                          {opt.description}
                        </p>
                      </div>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-1 transition-colors ${
                        isChecked
                          ? 'bg-slate-900 border-slate-900 text-white'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isChecked && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              {selectedIds.length} accessibility filters active
            </span>

            <button
              type="button"
              onClick={handleSave}
              className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all"
            >
              {isSaved ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Preferences Applied</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#E5C365]" />
                  <span>Apply Accessibility Filters</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
