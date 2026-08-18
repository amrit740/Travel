import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CloudRain,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  X,
  ArrowRight,
  Clock,
  MapPin,
  RefreshCw,
  Sun,
  ShieldAlert,
  Car,
} from 'lucide-react';
import { Trip, Activity } from '../../types';

interface LiveAdaptationAlertProps {
  trip: Trip;
  onTripUpdated: (updatedTrip: Trip) => void;
}

interface AdaptationScenario {
  id: string;
  type: 'weather' | 'closure' | 'traffic';
  icon: any;
  title: string;
  conditionDescription: string;
  recommendedChange: string;
  targetDayNumber: number;
  originalActivityName: string;
  proposedActivity: Partial<Activity>;
  accepted: boolean;
  dismissed: boolean;
}

export const LiveAdaptationAlert: React.FC<LiveAdaptationAlertProps> = ({
  trip,
  onTripUpdated,
}) => {
  const [scenarios, setScenarios] = useState<AdaptationScenario[]>([
    {
      id: 'rain-adapt-1',
      type: 'weather',
      icon: CloudRain,
      title: 'Rain Forecast Alert • 3:30 PM',
      conditionDescription: `Tropical rain shower expected around 3:30 PM in ${trip.destination}. Outdoor walking/beach activities may be disrupted.`,
      recommendedChange: 'Swap afternoon outdoor stroll with the indoor Heritage Gallery & Tea Lounge, shifting outdoor sightseeing to tomorrow morning.',
      targetDayNumber: 1,
      originalActivityName: 'Coastal Beach Walk & Sunset View',
      proposedActivity: {
        name: 'Heritage Art Museum & Artisanal Tea Pavilion',
        category: 'Culture & History',
        start_time: '03:30 PM',
        end_time: '05:30 PM',
        description: 'Sheltered indoor cultural gallery showcasing authentic regional artifacts, handicrafts, and hot spiced teas.',
        location: `Central Heritage Quarters, ${trip.destination}`,
      },
      accepted: false,
      dismissed: false,
    },
  ]);

  const activeAlert = scenarios.find((s) => !s.accepted && !s.dismissed);

  if (!activeAlert) {
    return (
      <div className="bg-[#FAF9F5] border border-[#E3E7E2] rounded-2xl p-3.5 flex items-center justify-between gap-3 text-xs text-[#66736C]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-medium text-[#0B3D2E]">Live Trip Adaptation Monitor Active</span>
          <span>• Weather & routes in {trip.destination} are optimal</span>
        </div>
        <button
          type="button"
          onClick={() =>
            setScenarios([
              {
                id: `sim-${Date.now()}`,
                type: 'weather',
                icon: CloudRain,
                title: 'Live Weather Adaptation Simulation',
                conditionDescription: `Sudden thunderstorm warning detected for afternoon in ${trip.destination}.`,
                recommendedChange: 'Reschedule outdoor monuments to morning; substitute indoor spice workshop at 3:00 PM.',
                targetDayNumber: 1,
                originalActivityName: 'Hill Fort Trek',
                proposedActivity: {
                  name: 'Indoor Spice Plantation Sensory Experience',
                  category: 'Culture & Food',
                  start_time: '03:00 PM',
                  end_time: '05:00 PM',
                  description: 'Covered botanical tour and warm herbal infusion tasting protected from rainfall.',
                },
                accepted: false,
                dismissed: false,
              },
            ])
          }
          className="text-[11px] font-semibold text-[#0B3D2E] hover:underline flex items-center gap-1"
        >
          <RefreshCw className="w-3 h-3 text-[#C8A96B]" />
          <span>Simulate Live Condition</span>
        </button>
      </div>
    );
  }

  const handleAcceptChange = () => {
    // Modify itinerary day activities
    const days = trip.itinerary_days || [];
    const updatedDays = days.map((day) => {
      if (day.day_number === activeAlert.targetDayNumber) {
        const updatedActivities = day.activities.map((act) => {
          if (
            act.name.toLowerCase().includes('beach') ||
            act.name.toLowerCase().includes('outdoor') ||
            act.name === activeAlert.originalActivityName
          ) {
            return {
              ...act,
              name: activeAlert.proposedActivity.name || act.name,
              category: activeAlert.proposedActivity.category || act.category,
              description: activeAlert.proposedActivity.description || act.description,
              start_time: activeAlert.proposedActivity.start_time || act.start_time,
              end_time: activeAlert.proposedActivity.end_time || act.end_time,
              notes: `${act.notes || ''} [Live Weather Adaptation Applied: Moved indoor due to afternoon rain]`,
            };
          }
          return act;
        });

        return {
          ...day,
          activities: updatedActivities,
        };
      }
      return day;
    });

    const updatedTrip: Trip = {
      ...trip,
      itinerary_days: updatedDays,
      updated_at: new Date().toISOString(),
    };

    onTripUpdated(updatedTrip);

    setScenarios((prev) =>
      prev.map((s) => (s.id === activeAlert.id ? { ...s, accepted: true } : s))
    );
  };

  const handleDismiss = () => {
    setScenarios((prev) =>
      prev.map((s) => (s.id === activeAlert.id ? { ...s, dismissed: true } : s))
    );
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="bg-amber-50/90 border border-amber-300 rounded-3xl p-5 sm:p-6 shadow-sm space-y-3"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-200 text-amber-900 flex items-center justify-center shrink-0">
              <activeAlert.icon className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 block">
                Live Trip Adaptation
              </span>
              <h4 className="font-semibold text-amber-950 text-sm">{activeAlert.title}</h4>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDismiss}
            className="w-7 h-7 rounded-full text-amber-700 hover:bg-amber-200/60 flex items-center justify-center transition-colors"
            title="Dismiss alert"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-amber-900 leading-relaxed font-light">
          {activeAlert.conditionDescription}
        </p>

        {/* Suggested Adaptation Box */}
        <div className="bg-white/80 border border-amber-200 rounded-2xl p-3.5 space-y-1.5 text-xs text-slate-700">
          <div className="flex items-center gap-1.5 text-emerald-800 font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-[#C8A96B]" />
            <span>Suggested Intelligent Adjustment:</span>
          </div>
          <p className="text-[#0B3D2E] font-medium leading-relaxed">
            {activeAlert.recommendedChange}
          </p>
          <div className="pt-1 flex items-center gap-3 text-[11px] text-[#66736C]">
            <span>Substituted venue: <strong>{activeAlert.proposedActivity.name}</strong></span>
            <span>• Time: {activeAlert.proposedActivity.start_time}</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-1">
          <button
            type="button"
            onClick={handleDismiss}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-amber-900 hover:bg-amber-100 transition-colors"
          >
            Keep Original
          </button>

          <button
            type="button"
            onClick={handleAcceptChange}
            className="px-4 py-2 rounded-xl bg-[#0B3D2E] hover:bg-[#176B50] text-[#F7F5EF] text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all active:scale-95"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Accept Adaptation</span>
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
