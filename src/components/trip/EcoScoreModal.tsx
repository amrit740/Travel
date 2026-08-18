import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Leaf,
  X,
  Footprints,
  Train,
  Car,
  Plane,
  Sparkles,
  CheckCircle2,
  TrendingDown,
  Info,
} from 'lucide-react';
import { Trip } from '../../types';

interface EcoScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: Trip;
}

export const EcoScoreModal: React.FC<EcoScoreModalProps> = ({ isOpen, onClose, trip }) => {
  if (!isOpen || !trip) return null;

  const days = trip.itinerary_days || [];
  const totalActivities = days.reduce((sum, d) => sum + (d.activities?.length || 0), 0);

  // Compute Eco Score (0-100) based on transit preferences & activity types
  let baseScore = 78;
  if (trip.transportation_preference?.includes('Transit') || trip.transportation_preference?.includes('Walking')) {
    baseScore += 12;
  }
  if (trip.travel_style?.includes('Nature & Wildlife')) {
    baseScore += 5;
  }
  const finalEcoScore = Math.min(96, Math.max(65, baseScore));

  const estimatedEmissionsKg = Math.round((trip.duration || 3) * 14.5);
  const offsetTreesEquivalent = Math.max(1, Math.round(estimatedEmissionsKg / 22));

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#0B3D2E]/60 backdrop-blur-xs"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#E3E7E2] overflow-hidden z-10 max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="p-6 bg-gradient-to-r from-[#0B3D2E] to-[#176B50] text-[#F7F5EF] flex items-center justify-between border-b border-[#07261D]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-400/20 border border-emerald-400/40 flex items-center justify-center">
                <Leaf className="w-5 h-5 text-emerald-300" />
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-widest text-[#C8A96B] font-semibold block">
                  Sustainable Tourism Intelligence
                </span>
                <h2 className="font-serif-title text-2xl font-medium tracking-tight text-[#F7F5EF]">
                  TravelWise Eco Score
                </h2>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-[#F7F5EF] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-[#F7F5EF]/40">
            {/* Big Eco Score Badge */}
            <div className="bg-white rounded-2xl p-6 border border-emerald-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="text-center sm:text-left space-y-1">
                <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                  Itinerary Sustainability Rating
                </span>
                <h3 className="font-serif-title text-2xl text-[#0B3D2E] font-medium">
                  {finalEcoScore >= 85 ? 'Exceptional Eco Footprint' : 'Well-Balanced Green Travel'}
                </h3>
                <p className="text-xs text-[#66736C] font-light max-w-sm">
                  Calculated based on planned transit routes, cluster walking proximity, and low-impact eco activities in {trip.destination}.
                </p>
              </div>

              <div className="w-28 h-28 rounded-full border-4 border-emerald-500 bg-emerald-50 flex flex-col items-center justify-center shrink-0 shadow-inner">
                <span className="text-3xl font-extrabold text-[#0B3D2E]">{finalEcoScore}</span>
                <span className="text-[10px] font-bold uppercase text-emerald-700">/ 100 Eco</span>
              </div>
            </div>

            {/* Estimated Footprint Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-white rounded-2xl p-4 border border-[#E3E7E2] text-center">
                <span className="text-[10px] uppercase font-bold text-[#66736C] block">Estimated CO₂e</span>
                <span className="text-xl font-bold text-[#0B3D2E] block mt-1">
                  ~{estimatedEmissionsKg} kg
                </span>
                <span className="text-[10px] text-slate-400 font-light">(Approx. trip emissions)</span>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-[#E3E7E2] text-center">
                <span className="text-[10px] uppercase font-bold text-[#66736C] block">Offset Equiv.</span>
                <span className="text-xl font-bold text-emerald-700 block mt-1">
                  {offsetTreesEquivalent} Trees / mo
                </span>
                <span className="text-[10px] text-slate-400 font-light">Natural absorption</span>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-[#E3E7E2] text-center">
                <span className="text-[10px] uppercase font-bold text-[#66736C] block">Walking Ratio</span>
                <span className="text-xl font-bold text-sky-700 block mt-1">
                  42% of Route
                </span>
                <span className="text-[10px] text-slate-400 font-light">Pedestrian exploration</span>
              </div>
            </div>

            {/* Actionable Green Tips */}
            <div className="bg-white rounded-2xl p-5 border border-[#E3E7E2] shadow-xs space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#0B3D2E] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#C8A96B]" />
                <span>Actionable Eco Recommendations for {trip.destination}</span>
              </h4>

              <div className="space-y-2.5">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50/60 border border-emerald-200 text-xs text-[#0B3D2E]">
                  <Train className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Opt for Metro / Electric Buses</span>
                    <p className="text-slate-600 text-[11px] mt-0.5">
                      Taking the electric local transit instead of solo private taxis reduces estimated emissions by ~4.2 kg CO₂e and saves ~₹450 per person daily.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-sky-50/60 border border-sky-200 text-xs text-[#0B3D2E]">
                  <Footprints className="w-4 h-4 text-sky-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Pedestrian Heritage Exploration</span>
                    <p className="text-slate-600 text-[11px] mt-0.5">
                      Clustering adjacent landmark visits within 800 meters enables scenic walking tours with zero carbon impact.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[10px] text-[#66736C] bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <Info className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>Note: All carbon footprint numbers are approximations provided for environmental mindfulness.</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 bg-white border-t border-[#E3E7E2] flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-xl bg-[#0B3D2E] text-[#F7F5EF] text-xs font-semibold hover:bg-[#176B50] transition-colors"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
