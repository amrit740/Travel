import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Compass,
  Calendar,
  Clock,
  Sparkles,
  MapPin,
  Flame,
  CheckCircle2,
  ChevronDown,
  Layers,
  Sliders,
  DollarSign,
  Users,
  Radio,
  BookOpen,
  Award,
  Stethoscope,
  Luggage,
  Ticket,
  TrendingDown,
  Navigation,
} from 'lucide-react';
import { useCurrentTrip } from '../../contexts/TripContext';
import { formatCurrency } from '../../lib/utils';

interface DynamicTripBannerProps {
  onOpenStory?: () => void;
  onOpenBadges?: () => void;
  onOpenDoctor?: () => void;
  onOpenWhatIf?: () => void;
  onOpenPacking?: () => void;
  onOpenReservations?: () => void;
  onOpenGroup?: () => void;
  onOpenNearby?: () => void;
}

export const DynamicTripBanner: React.FC<DynamicTripBannerProps> = ({
  onOpenStory,
  onOpenBadges,
  onOpenDoctor,
  onOpenWhatIf,
  onOpenPacking,
  onOpenReservations,
  onOpenGroup,
  onOpenNearby,
}) => {
  const {
    currentTrip,
    countdown,
    liveState,
    setLiveMode,
    destinationData,
    travelBadges,
    journeyPulse,
    journeyDiagnosis,
  } = useCurrentTrip();
  const navigate = useNavigate();

  if (!currentTrip) return null;

  const unlockedBadgesCount = travelBadges.filter((b) => b.unlocked).length;
  const isLive = liveState.currentMode === 'live';

  return (
    <div className="bg-[#0B3D2E] text-[#F7F5EF] rounded-3xl p-6 sm:p-7 shadow-xl border border-[#C8A96B]/30 relative overflow-hidden space-y-6">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#176B50]/30 rounded-full blur-3xl pointer-events-none" />

      {/* Top Banner Row */}
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left: Active Trip Details & Destination Badge */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium bg-[#176B50] text-[#DFCA9B] border border-[#C8A96B]/30 tracking-wider uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C8A96B] animate-ping" />
              Active Focus Journey
            </span>

            {/* Mode Indicator Pill */}
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium ${
                isLive
                  ? 'bg-[#176B50]/80 text-[#DFCA9B] border border-[#C8A96B]/50'
                  : 'bg-white/10 text-[#E3E7E2] border border-white/10'
              }`}
            >
              {isLive ? <Radio className="w-3 h-3 text-[#DFCA9B] animate-pulse" /> : <Sliders className="w-3 h-3" />}
              <span>{isLive ? 'Live Concierge Active' : 'Planning Stage'}</span>
            </span>

            {/* Unlocked Badges count */}
            {onOpenBadges && (
              <button
                type="button"
                onClick={onOpenBadges}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-light bg-white/10 text-[#DFCA9B] border border-[#C8A96B]/30 hover:bg-white/20 transition-colors"
                title="View travel achievements"
              >
                <Award className="w-3.5 h-3.5" />
                <span>{unlockedBadgesCount} / {travelBadges.length} Accolades</span>
              </button>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4">
            <h2 className="font-serif-title text-3xl sm:text-4xl font-medium tracking-tight text-[#F7F5EF]">
              {currentTrip.destination}
            </h2>
            <span className="text-xs sm:text-sm text-[#A2B3AA] font-light flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-[#C8A96B] shrink-0" />
              <span>{destinationData.country || currentTrip.destination_country || 'Global'}</span>
              <span>•</span>
              <span>{currentTrip.duration} Days ({currentTrip.traveler_type || `${currentTrip.travelers} Guests`})</span>
            </span>
          </div>

          {/* Preferences Pills */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#A2B3AA]">
            <span className="px-2.5 py-0.5 rounded-lg bg-white/10 text-[#F7F5EF] font-medium border border-white/10">
              Est. Investment: {formatCurrency(currentTrip.total_budget, currentTrip.currency)}
            </span>
            {(currentTrip.travel_style || []).slice(0, 3).map((st) => (
              <span key={st} className="px-2.5 py-0.5 rounded-lg bg-white/5 border border-white/10 text-[#A2B3AA] font-light">
                {st}
              </span>
            ))}
          </div>
        </div>

        {/* Right: Countdown & Quick Action Links */}
        <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end gap-4 shrink-0">
          {/* Departure Countdown Timer Card */}
          <div className="bg-[#071F18]/80 backdrop-blur-md rounded-2xl px-4 py-2.5 border border-[#C8A96B]/30 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#176B50] text-[#DFCA9B] flex items-center justify-center shadow-xs border border-[#C8A96B]/30">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-medium uppercase tracking-widest text-[#C8A96B]">
                {countdown.isOngoing ? 'Journey Status' : 'Departure Countdown'}
              </p>
              <p className="font-serif-title text-sm sm:text-base font-medium text-[#F7F5EF]">
                {countdown.label}
              </p>
            </div>
          </div>

          {/* Primary View / Live buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setLiveMode(isLive ? 'planning' : 'live')}
              className={`px-3.5 py-2 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 shadow-sm ${
                isLive
                  ? 'bg-[#176B50] hover:bg-[#0E543E] text-[#F7F5EF] border border-[#C8A96B]/40'
                  : 'bg-white/15 hover:bg-white/25 text-[#F7F5EF] border border-white/20'
              }`}
            >
              <Radio className={`w-3.5 h-3.5 ${isLive ? 'animate-pulse' : ''}`} />
              <span>{isLive ? 'Exit Live Mode' : 'Begin Live Mode'}</span>
            </button>

            {onOpenStory && (
              <button
                type="button"
                onClick={onOpenStory}
                className="px-3.5 py-2 rounded-full text-xs font-medium bg-[#C8A96B] hover:bg-[#B5965A] text-[#071F18] shadow-sm transition-all flex items-center gap-1.5"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Story Journal</span>
              </button>
            )}

            <Link
              to={`/trips/${currentTrip.id}`}
              className="px-3.5 py-2 rounded-full text-xs font-medium bg-[#F7F5EF] text-[#0B3D2E] hover:bg-white shadow-xs transition-all"
            >
              View Full Itinerary
            </Link>
          </div>
        </div>
      </div>

      {/* Journey Pulse Metrics Bar */}
      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-4 border-t border-white/15 text-xs">
        <div className="p-3 rounded-2xl bg-black/20 border border-white/10">
          <span className="text-[10px] uppercase tracking-wider text-[#A2B3AA] block">Schedule Balance</span>
          <div className="flex items-center gap-2 mt-1">
            <span className="font-serif-title text-base font-bold text-[#F7F5EF] capitalize">
              {journeyPulse.scheduleStatus || 'Balanced'}
            </span>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-black/20 border border-white/10">
          <span className="text-[10px] uppercase tracking-wider text-[#A2B3AA] block">Budget Health</span>
          <span className="font-serif-title text-base font-bold text-[#C8A96B] block mt-1 capitalize">
            {journeyPulse.budgetStatus.replace('_', ' ') || 'On Track'}
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-black/20 border border-white/10">
          <span className="text-[10px] uppercase tracking-wider text-[#A2B3AA] block">Route Optimization</span>
          <span className="font-serif-title text-base font-bold text-emerald-400 block mt-1 capitalize">
            {journeyPulse.routeStatus.replace('_', ' ') || 'Optimized'}
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-black/20 border border-white/10">
          <span className="text-[10px] uppercase tracking-wider text-[#A2B3AA] block">AI Health Score</span>
          <div className="flex items-center justify-between mt-1">
            <span className="font-serif-title text-base font-bold text-[#DFCA9B]">
              {journeyDiagnosis.score} / 100
            </span>
            {onOpenDoctor && (
              <button
                onClick={onOpenDoctor}
                className="text-[10px] text-[#C8A96B] hover:underline"
              >
                Inspect →
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Concierge Desk Power Tools Buttons */}
      <div className="relative z-10 pt-2 border-t border-white/10 flex items-center gap-2 overflow-x-auto no-scrollbar">
        {onOpenDoctor && (
          <button
            onClick={onOpenDoctor}
            className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-[#DFCA9B] text-xs font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap border border-[#C8A96B]/30"
          >
            <Stethoscope className="w-3.5 h-3.5 text-[#C8A96B]" />
            <span>AI Trip Doctor</span>
          </button>
        )}

        {onOpenWhatIf && (
          <button
            onClick={onOpenWhatIf}
            className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-[#DFCA9B] text-xs font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap border border-white/15"
          >
            <Sliders className="w-3.5 h-3.5 text-[#C8A96B]" />
            <span>What-If Sandbox</span>
          </button>
        )}

        {onOpenPacking && (
          <button
            onClick={onOpenPacking}
            className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-[#DFCA9B] text-xs font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap border border-white/15"
          >
            <Luggage className="w-3.5 h-3.5 text-[#C8A96B]" />
            <span>Smart Packing</span>
          </button>
        )}

        {onOpenReservations && (
          <button
            onClick={onOpenReservations}
            className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-[#DFCA9B] text-xs font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap border border-white/15"
          >
            <Ticket className="w-3.5 h-3.5 text-[#C8A96B]" />
            <span>Reservations Ledger</span>
          </button>
        )}

        {onOpenGroup && (
          <button
            onClick={onOpenGroup}
            className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-[#DFCA9B] text-xs font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap border border-white/15"
          >
            <Users className="w-3.5 h-3.5 text-[#C8A96B]" />
            <span>Group Split & Polls</span>
          </button>
        )}

        {onOpenNearby && (
          <button
            onClick={onOpenNearby}
            className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-[#DFCA9B] text-xs font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap border border-white/15"
          >
            <Compass className="w-3.5 h-3.5 text-[#C8A96B]" />
            <span>Smart Nearby</span>
          </button>
        )}
      </div>
    </div>
  );
};

