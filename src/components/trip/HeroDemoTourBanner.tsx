import React, { useState } from 'react';
import {
  Sparkles,
  Zap,
  TrendingDown,
  Navigation,
  Compass,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Stethoscope,
  Sliders,
} from 'lucide-react';
import { useCurrentTrip } from '../../contexts/TripContext';
import { apiTrips } from '../../services/api';

interface HeroDemoTourBannerProps {
  onOpenDoctor?: () => void;
  onOpenWhatIf?: () => void;
}

export const HeroDemoTourBanner: React.FC<HeroDemoTourBannerProps> = ({
  onOpenDoctor,
  onOpenWhatIf,
}) => {
  const { currentTrip, setCurrentTrip, applyStructuredAIAction } = useCurrentTrip();
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizedDone, setOptimizedDone] = useState(false);
  const [bannerMessage, setBannerMessage] = useState<string | null>(null);

  const isGoaHero = currentTrip?.destination?.toLowerCase().includes('goa');

  const handleLoadHeroGoaTrip = async () => {
    try {
      const all = await apiTrips.getAll();
      const goaTrip = all.find((t) => t.destination.toLowerCase().includes('goa')) || all[0];
      if (goaTrip) {
        setCurrentTrip(goaTrip);
        setBannerMessage('Loaded featured 5-Day Goa Couple Luxury Flow (₹40,000 Budget).');
      }
    } catch {
      // ignore
    }
  };

  const handleHeroOptimizeDay3 = async () => {
    setIsOptimizing(true);
    setBannerMessage(null);
    try {
      const res = await applyStructuredAIAction({
        type: 'OPTIMIZE_ROUTE',
        dayNumber: 3,
        savingsAmount: 2300,
        previewSummary: '⚡ Day 3 Optimized! Swapped resort dining for Gunpowder bistro, saving ₹2,300 and 55m transit time.',
      });
      setOptimizedDone(true);
      setBannerMessage(res.message);
    } catch (err: any) {
      setBannerMessage(err.message || 'Failed to optimize Day 3.');
    } finally {
      setIsOptimizing(false);
    }
  };

  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-[#0B3D2E] via-[#0E4736] to-[#071F18] text-[#F7F5EF] border border-[#C8A96B]/40 shadow-xl relative overflow-hidden space-y-4">
      {/* Decorative Shimmer */}
      <div className="absolute -top-10 -right-10 w-48 h-48 bg-[#C8A96B]/15 rounded-full blur-2xl pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#C8A96B] text-[#071F18] text-[10px] uppercase font-bold tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 fill-current" />
              Featured Luxury Concierge Showcase
            </span>
            <span className="text-[11px] text-[#C8A96B] font-medium hidden sm:inline">
              5-Day Goa Couple Flow (₹40,000 Budget)
            </span>
          </div>

          <h3 className="font-serif-title text-xl sm:text-2xl font-medium tracking-tight text-[#F7F5EF]">
            Experience Travel Wise in Action
          </h3>

          <p className="text-xs text-[#E3E7E2]/85 font-light leading-relaxed">
            Test the live AI Doctor on Day 3: cluster North Goa stops, resolve a zigzag route, and swap overpriced dining for celebrated local bistros with 1-click execution.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 flex-shrink-0">
          {!isGoaHero && (
            <button
              onClick={handleLoadHeroGoaTrip}
              className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-[#DFCA9B] text-xs font-medium border border-white/20 transition-colors"
            >
              Load Goa Journey
            </button>
          )}

          <button
            onClick={handleHeroOptimizeDay3}
            disabled={isOptimizing || optimizedDone}
            className={`px-5 py-2.5 rounded-full text-xs font-medium tracking-wide flex items-center gap-1.5 transition-all shadow-md active:scale-98 ${
              optimizedDone
                ? 'bg-[#176B50] text-[#F7F5EF] border border-[#C8A96B]/40'
                : 'bg-[#C8A96B] hover:bg-[#B5965A] text-[#071F18] border border-[#C8A96B]'
            }`}
          >
            {optimizedDone ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                <span>Day 3 Route Optimized (-₹2,300)</span>
              </>
            ) : isOptimizing ? (
              <span>Optimizing Clustered Route...</span>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5" />
                <span>⚡ 1-Click Optimize Day 3</span>
              </>
            )}
          </button>

          {onOpenDoctor && (
            <button
              onClick={onOpenDoctor}
              className="px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-[#F7F5EF] text-xs font-medium border border-white/20 transition-colors flex items-center gap-1.5"
            >
              <Stethoscope className="w-3.5 h-3.5 text-[#C8A96B]" />
              <span>Full Diagnostic</span>
            </button>
          )}
        </div>
      </div>

      {bannerMessage && (
        <div className="p-3 rounded-2xl bg-[#176B50]/40 border border-[#C8A96B]/30 text-xs text-[#F7F5EF] flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{bannerMessage}</span>
        </div>
      )}
    </div>
  );
};
