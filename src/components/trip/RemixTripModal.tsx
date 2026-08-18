import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import {
  RotateCcw,
  X,
  Sparkles,
  Calendar,
  DollarSign,
  Users,
  Accessibility,
  GraduationCap,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { Trip, CreateTripInput } from '../../types';
import { formatCurrency } from '../../lib/utils';
import { apiTrips } from '../../services/api';

interface RemixTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceTrip: Partial<Trip>;
}

export const RemixTripModal: React.FC<RemixTripModalProps> = ({
  isOpen,
  onClose,
  sourceTrip,
}) => {
  const navigate = useNavigate();
  const [duration, setDuration] = useState<number>(sourceTrip.duration || 4);
  const [budget, setBudget] = useState<number>(sourceTrip.total_budget || 24000);
  const [travelers, setTravelers] = useState<number>(sourceTrip.travelers || 2);
  const [travelerType, setTravelerType] = useState<string>(sourceTrip.traveler_type || 'Couple');
  const [isStudentMode, setIsStudentMode] = useState<boolean>(false);
  const [isWheelchairMode, setIsWheelchairMode] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  if (!isOpen || !sourceTrip) return null;

  const destination = sourceTrip.destination || 'Goa';

  const handleCreateRemix = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    try {
      const today = new Date();
      const start = new Date(today.setDate(today.getDate() + 7)).toISOString().split('T')[0];
      const end = new Date(today.setDate(today.getDate() + duration - 1)).toISOString().split('T')[0];

      const input: CreateTripInput = {
        destination,
        start_date: start,
        end_date: end,
        travelers,
        traveler_type: isStudentMode ? ('Student' as any) : (travelerType as any),
        budget: isStudentMode ? Math.min(budget, 12000) : budget,
        currency: sourceTrip.currency || 'INR',
        travel_style: sourceTrip.travel_style || ['Cultural', 'Relaxation'],
        food_preferences: sourceTrip.food_preferences || ['Local Regional Cuisine'],
        accommodation: isStudentMode ? 'Hostel' : sourceTrip.accommodation_preference || 'Hotel',
        transportation: isStudentMode ? 'Public Transit (Metro & Bus)' : sourceTrip.transportation_preference || 'Mixed',
        interests: [
          ...(sourceTrip.interests || ['Sightseeing']),
          ...(isWheelchairMode ? ['Wheelchair Accessible Venues'] : []),
          ...(isStudentMode ? ['Budget Trails & Student Discounts'] : []),
        ],
      };

      const newTrip = await apiTrips.generate(input);
      onClose();
      navigate(`/trips/${newTrip.id}`);
    } catch (err: any) {
      alert(err.message || 'Failed to remix trip.');
    } finally {
      setIsGenerating(false);
    }
  };

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
          className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-[#E3E7E2] overflow-hidden z-10 max-h-[92vh] flex flex-col"
        >
          {/* Header */}
          <div className="p-6 bg-[#0B3D2E] text-[#F7F5EF] flex items-center justify-between border-b border-[#C8A96B]/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#C8A96B]/20 border border-[#C8A96B]/40 flex items-center justify-center">
                <RotateCcw className="w-5 h-5 text-[#C8A96B]" />
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-widest text-[#C8A96B] font-semibold block">
                  Itinerary Adaptation Studio
                </span>
                <h2 className="font-serif-title text-2xl font-medium tracking-tight text-[#F7F5EF]">
                  Remix This {destination} Trip
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

          {/* Form */}
          <form onSubmit={handleCreateRemix} className="p-6 overflow-y-auto space-y-5 flex-1 bg-[#F7F5EF]/30">
            <p className="text-xs text-[#66736C] font-light leading-relaxed">
              Clone this popular community itinerary and customize the duration, budget, travel party, and accessibility constraints to suit your exact plans.
            </p>

            {/* Duration & Budget */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Trip Duration (Days)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={14}
                    value={duration}
                    onChange={(e) => setDuration(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-white border border-[#E3E7E2] rounded-xl px-3.5 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:ring-1 focus:ring-[#0B3D2E]"
                  />
                  <span className="text-xs text-slate-500 font-medium">Days</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Custom Budget (INR ₹)</label>
                <input
                  type="number"
                  min={2000}
                  step={1000}
                  value={budget}
                  onChange={(e) => setBudget(parseInt(e.target.value) || 15000)}
                  className="w-full bg-white border border-[#E3E7E2] rounded-xl px-3.5 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:ring-1 focus:ring-[#0B3D2E]"
                />
              </div>
            </div>

            {/* Travelers Count & Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Travelers Count</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={travelers}
                  onChange={(e) => setTravelers(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-white border border-[#E3E7E2] rounded-xl px-3.5 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:ring-1 focus:ring-[#0B3D2E]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Traveler Type</label>
                <select
                  value={travelerType}
                  onChange={(e) => setTravelerType(e.target.value)}
                  className="w-full bg-white border border-[#E3E7E2] rounded-xl px-3.5 py-2 text-xs text-slate-900 font-semibold focus:outline-none focus:ring-1 focus:ring-[#0B3D2E]"
                >
                  <option value="Solo">Solo Traveler</option>
                  <option value="Couple">Couple / Romantic</option>
                  <option value="Family">Family with Kids</option>
                  <option value="Friends">Group of Friends</option>
                  <option value="Senior Citizens">Senior Citizens</option>
                </select>
              </div>
            </div>

            {/* Student Mode / Low-Budget Mode Toggle */}
            <div
              onClick={() => setIsStudentMode(!isStudentMode)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                isStudentMode ? 'bg-amber-50 border-amber-300' : 'bg-white border-[#E3E7E2]'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 text-xs">Student / Ultra Low-Budget Mode</h4>
                  <p className="text-slate-500 text-[11px] font-light">
                    Prioritizes hostels, free attractions, public transit, and student discounts.
                  </p>
                </div>
              </div>

              <input
                type="checkbox"
                checked={isStudentMode}
                onChange={() => {}}
                className="rounded text-[#0B3D2E]"
              />
            </div>

            {/* Accessibility Filter Toggle */}
            <div
              onClick={() => setIsWheelchairMode(!isWheelchairMode)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                isWheelchairMode ? 'bg-emerald-50 border-emerald-300' : 'bg-white border-[#E3E7E2]'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Accessibility className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 text-xs">Wheelchair & Step-Free Accessibility</h4>
                  <p className="text-slate-500 text-[11px] font-light">
                    Selects step-free entrances, elevators, and low-walking cluster routes.
                  </p>
                </div>
              </div>

              <input
                type="checkbox"
                checked={isWheelchairMode}
                onChange={() => {}}
                className="rounded text-[#0B3D2E]"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isGenerating}
                className="w-full py-3 rounded-xl bg-[#0B3D2E] hover:bg-[#176B50] text-[#F7F5EF] text-xs uppercase tracking-wider font-semibold shadow-md flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <RotateCcw className="w-4 h-4 animate-spin text-[#C8A96B]" />
                    <span>Curating Your Bespoke Remix...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-[#C8A96B]" />
                    <span>Generate Personalized Remix Itinerary</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
