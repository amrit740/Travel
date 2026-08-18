import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TravelWiseLogo } from './TravelWiseLogo';
import { Sparkles, MapPin, Compass, Calendar, DollarSign, CheckCircle2 } from 'lucide-react';

interface LoadingScreenProps {
  destination?: string;
  duration?: number;
}

const MILESTONES = [
  { text: 'Analyzing your travel preferences and desired pace...', icon: Compass, progress: 18 },
  { text: 'Curating refined accommodations, scenic viewpoints & dining...', icon: MapPin, progress: 42 },
  { text: 'Clustering locations to build fluid, friction-free day schedules...', icon: Calendar, progress: 68 },
  { text: 'Balancing investment allocations and transit options...', icon: DollarSign, progress: 88 },
  { text: 'Finalizing your bespoke TravelWise itinerary ✨', icon: Sparkles, progress: 98 },
];

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ destination, duration }) => {
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIdx((prev) => (prev < MILESTONES.length - 1 ? prev + 1 : prev));
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  const current = MILESTONES[currentIdx];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-[#FAFAF8] rounded-3xl max-w-lg w-full p-8 shadow-2xl border border-slate-200 text-center relative overflow-hidden"
      >
        {/* Official TravelWise Emblem in animated halo */}
        <div className="relative mx-auto w-24 h-24 mb-5 flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 rounded-3xl border-2 border-dashed border-[#C59B27]/50"
          />
          <div className="w-20 h-20 rounded-2xl bg-white flex items-center justify-center shadow-lg border border-[#C59B27]/30 p-2">
            <TravelWiseLogo variant="emblem" size="lg" />
          </div>
        </div>

        {/* Title & destination */}
        <h3 className="text-2xl font-serif-title font-medium text-slate-900 mb-2">
          Curating Your {destination ? `${destination}` : 'TravelWise'} Journey
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 font-light mb-6">
          Our intelligent concierge is designing a tailored {duration ? `${duration}-day ` : ''}itinerary with mapped routes,
          insider tips, and cost breakdowns.
        </p>

        {/* Progress bar */}
        <div className="w-full bg-slate-200 rounded-full h-2.5 mb-6 overflow-hidden">
          <motion.div
            className="bg-slate-900 h-full rounded-full"
            initial={{ width: '10%' }}
            animate={{ width: `${current.progress}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>

        {/* Dynamic milestone message */}
        <div className="min-h-[50px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIdx}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="flex items-center justify-center gap-2 text-xs sm:text-sm font-medium text-slate-900 bg-white border border-[#C59B27]/40 px-4 py-2.5 rounded-2xl shadow-xs"
            >
              <TravelWiseLogo variant="emblem" size="xs" className="w-4 h-4 shrink-0" />
              <span>{current.text}</span>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Subtle status step pills */}
        <div className="flex items-center justify-center gap-1.5 mt-6">
          {MILESTONES.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentIdx
                  ? 'w-6 bg-slate-900'
                  : idx < currentIdx
                  ? 'w-2 bg-[#C59B27]'
                  : 'w-2 bg-slate-200'
              }`}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
};
