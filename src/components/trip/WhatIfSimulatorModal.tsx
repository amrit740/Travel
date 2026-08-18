import React, { useState, useMemo } from 'react';
import {
  Sliders,
  X,
  Sparkles,
  DollarSign,
  Calendar,
  Users,
  Compass,
  ArrowRight,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  Clock,
  Navigation,
} from 'lucide-react';
import { useCurrentTrip } from '../../contexts/TripContext';
import { formatCurrency } from '../../lib/utils';
import { computeWhatIfScenario } from '../../lib/tripPersonalization';
import { WhatIfScenario, TravelStyle } from '../../types';

interface WhatIfSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WhatIfSimulatorModal: React.FC<WhatIfSimulatorModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { currentTrip, applyWhatIfPlan } = useCurrentTrip();

  const [budget, setBudget] = useState<number>(currentTrip?.total_budget || 40000);
  const [duration, setDuration] = useState<number>(currentTrip?.duration || 5);
  const [travelers, setTravelers] = useState<number>(currentTrip?.travelers || 2);
  const [diningTier, setDiningTier] = useState<'Budget' | 'Moderate' | 'Fine Dining'>('Moderate');
  const [travelStyle, setTravelStyle] = useState<TravelStyle[]>(
    currentTrip?.travel_style && currentTrip.travel_style.length > 0
      ? currentTrip.travel_style
      : ['Relaxation', 'Food & Cuisine']
  );
  const [isApplying, setIsApplying] = useState(false);
  const [appliedSuccess, setAppliedSuccess] = useState(false);

  const scenario: WhatIfScenario = useMemo(() => {
    if (!currentTrip) {
      return {
        budget,
        duration,
        travelStyle,
        travelers,
        diningTier,
        compareResult: {
          currentPlan: { cost: 40000, days: 5, activitiesCount: 12, travelTimeHours: '4h', pace: 'Moderate', highlights: [] },
          newPlan: { cost: budget, days: duration, activitiesCount: 14, travelTimeHours: '2.5h', pace: 'Optimized', highlights: [], tradeOffReason: 'Balanced' },
        },
      };
    }
    return computeWhatIfScenario(currentTrip, {
      budget,
      duration,
      travelers,
      travelStyle,
      diningTier,
    });
  }, [currentTrip, budget, duration, travelers, travelStyle, diningTier]);

  if (!isOpen || !currentTrip) return null;

  const budgetDelta = budget - (currentTrip.total_budget || 40000);
  const isHigherBudget = budgetDelta > 0;

  const handleApply = async () => {
    setIsApplying(true);
    try {
      await applyWhatIfPlan(scenario);
      setAppliedSuccess(true);
      setTimeout(() => {
        setAppliedSuccess(false);
        onClose();
      }, 1200);
    } catch {
      // ignore
    } finally {
      setIsApplying(false);
    }
  };

  const toggleStyle = (style: TravelStyle) => {
    if (travelStyle.includes(style)) {
      if (travelStyle.length > 1) {
        setTravelStyle(travelStyle.filter((s) => s !== style));
      }
    } else {
      setTravelStyle([...travelStyle, style]);
    }
  };

  const styleOptions: TravelStyle[] = [
    'Adventure',
    'Relaxation',
    'Cultural',
    'Nature',
    'Food & Cuisine',
    'Luxury',
    'Photography',
  ];

  const compare = scenario.compareResult;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B3D2E]/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-[#F7F5EF] border border-[#E3E7E2] rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden my-8">
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
              <Sliders className="w-5 h-5 text-[#C8A96B]" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-widest text-[#C8A96B] font-medium block">
                Interactive Travel Sandbox
              </span>
              <h2 className="font-serif-title text-2xl text-[#F7F5EF] font-medium tracking-tight">
                What-If Journey Simulator
              </h2>
            </div>
          </div>
          <p className="text-xs text-[#E3E7E2]/80 font-light mt-1">
            Simulate real-time changes to your duration, budget, and group dynamics before committing them to your live itinerary.
          </p>
        </div>

        {/* Body */}
        <div className="p-6 sm:p-7 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Sliders Grid */}
          <div className="space-y-5 p-5 rounded-2xl bg-white border border-[#E3E7E2] shadow-sm">
            {/* Budget Slider */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-[#0B3D2E] flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-[#C8A96B]" />
                  <span>Target Journey Budget</span>
                </label>
                <div className="flex items-center gap-2">
                  <span className="font-serif-title text-lg font-bold text-[#0B3D2E]">
                    {formatCurrency(budget, currentTrip.currency)}
                  </span>
                  {budgetDelta !== 0 && (
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        isHigherBudget
                          ? 'bg-amber-50 text-amber-800'
                          : 'bg-emerald-50 text-emerald-800'
                      }`}
                    >
                      {isHigherBudget ? '+' : ''}
                      {formatCurrency(budgetDelta, currentTrip.currency)}
                    </span>
                  )}
                </div>
              </div>
              <input
                type="range"
                min="15000"
                max="120000"
                step="2500"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full h-2 bg-[#E3E7E2] rounded-lg appearance-none cursor-pointer accent-[#0B3D2E]"
              />
              <div className="flex justify-between text-[10px] text-[#66736C] mt-1 font-light">
                <span>₹15,000 (Backpacker)</span>
                <span>₹50,000 (Comfort)</span>
                <span>₹120,000 (Luxury)</span>
              </div>
            </div>

            {/* Duration Slider */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-[#0B3D2E] flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#176B50]" />
                  <span>Trip Duration</span>
                </label>
                <span className="font-serif-title text-lg font-bold text-[#0B3D2E]">
                  {duration} Days ({duration - 1} Nights)
                </span>
              </div>
              <input
                type="range"
                min="2"
                max="10"
                step="1"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full h-2 bg-[#E3E7E2] rounded-lg appearance-none cursor-pointer accent-[#176B50]"
              />
              <div className="flex justify-between text-[10px] text-[#66736C] mt-1 font-light">
                <span>2 Days (Weekend)</span>
                <span>5 Days (Standard)</span>
                <span>10 Days (Deep Explorer)</span>
              </div>
            </div>

            {/* Travelers & Dining Tier */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-[#0B3D2E] flex items-center gap-1.5 mb-2">
                  <Users className="w-3.5 h-3.5 text-[#0B3D2E]" />
                  <span>Group Composition</span>
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { count: 1, label: 'Solo' },
                    { count: 2, label: 'Couple' },
                    { count: 4, label: 'Family' },
                    { count: 6, label: 'Group' },
                  ].map((item) => (
                    <button
                      key={item.count}
                      type="button"
                      onClick={() => setTravelers(item.count)}
                      className={`py-2 rounded-xl text-xs font-medium border transition-all ${
                        travelers === item.count
                          ? 'bg-[#0B3D2E] text-[#F7F5EF] border-[#0B3D2E]'
                          : 'bg-[#F7F5EF] text-[#2C3531] border-[#E3E7E2] hover:border-[#C8A96B]'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-[#0B3D2E] flex items-center gap-1.5 mb-2">
                  <Compass className="w-3.5 h-3.5 text-[#C8A96B]" />
                  <span>Dining Ambience</span>
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['Budget', 'Moderate', 'Fine Dining'] as const).map((tier) => (
                    <button
                      key={tier}
                      type="button"
                      onClick={() => setDiningTier(tier)}
                      className={`py-2 rounded-xl text-xs font-medium border transition-all ${
                        diningTier === tier
                          ? 'bg-[#176B50] text-[#F7F5EF] border-[#176B50]'
                          : 'bg-[#F7F5EF] text-[#2C3531] border-[#E3E7E2] hover:border-[#0B3D2E]'
                      }`}
                    >
                      {tier}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Travel Style Chips */}
            <div>
              <label className="text-xs font-medium text-[#0B3D2E] flex items-center gap-1.5 mb-2">
                <Compass className="w-3.5 h-3.5 text-[#C8A96B]" />
                <span>Style Focus</span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                {styleOptions.map((opt) => {
                  const isSelected = travelStyle.includes(opt);
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => toggleStyle(opt)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                        isSelected
                          ? 'bg-[#176B50] text-[#F7F5EF] border-[#176B50]'
                          : 'bg-white text-[#66736C] border-[#E3E7E2] hover:border-[#0B3D2E]'
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Simulation Outcome Card Comparison */}
          <div className="p-5 rounded-2xl bg-[#0B3D2E]/5 border border-[#0B3D2E]/15 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest text-[#0B3D2E] font-bold">
                Simulation Projection & Comparison
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#176B50] text-[#F7F5EF] text-[10px] font-semibold">
                {compare.newPlan.pace}
              </span>
            </div>

            {/* Comparison Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-white border border-[#E3E7E2] space-y-2">
                <span className="text-[10px] uppercase font-bold text-[#66736C] block">Current Plan</span>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#66736C]">Investment</span>
                  <span className="font-bold text-[#0B3D2E]">{formatCurrency(compare.currentPlan.cost, currentTrip.currency)}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#66736C]">Pacing</span>
                  <span className="text-[#0B3D2E]">{compare.currentPlan.pace}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#66736C]">Transit Est.</span>
                  <span className="text-[#0B3D2E]">{compare.currentPlan.travelTimeHours}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#176B50]/10 border border-[#176B50]/30 space-y-2">
                <span className="text-[10px] uppercase font-bold text-[#176B50] block">Simulated Plan</span>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#66736C]">New Investment</span>
                  <span className="font-bold text-[#176B50]">{formatCurrency(compare.newPlan.cost, currentTrip.currency)}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#66736C]">Pacing</span>
                  <span className="font-semibold text-[#176B50]">{compare.newPlan.pace}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#66736C]">Transit Est.</span>
                  <span className="font-semibold text-emerald-800">{compare.newPlan.travelTimeHours} (Optimized)</span>
                </div>
              </div>
            </div>

            <div className="space-y-1.5 pt-1">
              <p className="text-xs text-[#0B3D2E] font-medium flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#C8A96B]" />
                <span>Sandbox Assessment:</span>
              </p>
              <p className="text-[11px] text-[#66736C] font-light leading-relaxed">
                {compare.newPlan.tradeOffReason}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#EAE6DD] p-4 sm:p-5 flex items-center justify-between border-t border-[#E3E7E2]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-full bg-transparent hover:bg-black/5 text-xs text-[#66736C] font-medium transition-colors"
          >
            Discard Changes
          </button>

          <button
            onClick={handleApply}
            disabled={isApplying || appliedSuccess}
            className="px-6 py-2.5 rounded-full bg-[#0B3D2E] hover:bg-[#176B50] text-[#F7F5EF] text-xs font-medium tracking-wide flex items-center gap-2 transition-all shadow-md active:scale-98 border border-[#C8A96B]/30"
          >
            {appliedSuccess ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Applied to Trip!</span>
              </>
            ) : isApplying ? (
              <span>Applying Sandbox...</span>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-[#C8A96B]" />
                <span>Apply Simulation to Trip</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
