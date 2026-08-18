import React, { useState } from 'react';
import {
  Sun,
  CloudSun,
  Sparkles,
  Footprints,
  DollarSign,
  AlertTriangle,
  Volume2,
  VolumeX,
  Clock,
  Compass,
  CheckCircle2,
  Shirt,
  Flame,
} from 'lucide-react';
import { useCurrentTrip } from '../../contexts/TripContext';
import { formatCurrency } from '../../lib/utils';

export const DailyBriefingCard: React.FC = () => {
  const { currentTrip, dailyBriefing, selectedDayNumber } = useCurrentTrip();
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  if (!currentTrip) return null;

  const handleToggleAudio = () => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in this browser.');
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
    } else {
      const textToSpeak = `${dailyBriefing.greeting}. The weather is ${dailyBriefing.weatherSummary} at ${dailyBriefing.temperature}. Your top highlight today is ${dailyBriefing.topHighlight}. Packing tip: ${dailyBriefing.packingTip}. Have an extraordinary day in ${dailyBriefing.destination}!`;
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.rate = 1.0;
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
      setIsPlayingAudio(true);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-[#E3E7E2] p-6 shadow-xs space-y-4">
      {/* Header with Greeting & Audio Guide Button */}
      <div className="flex items-center justify-between gap-3 border-b border-[#E3E7E2] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#0B3D2E] text-[#DFCA9B] flex items-center justify-center shadow-xs border border-[#C8A96B]/30">
            <Sparkles className="w-4 h-4 text-[#C8A96B]" />
          </div>
          <div>
            <h3 className="font-serif-title text-base font-medium text-[#0B3D2E]">
              Concierge Briefing • Day {selectedDayNumber}
            </h3>
            <p className="text-[11px] text-[#66736C] font-light">
              {dailyBriefing.destination} • {dailyBriefing.date}
            </p>
          </div>
        </div>

        {/* Audio Briefing Button */}
        <button
          type="button"
          onClick={handleToggleAudio}
          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all shadow-xs ${
            isPlayingAudio
              ? 'bg-[#0B3D2E] text-[#F7F5EF] animate-pulse border border-[#C8A96B]/40'
              : 'bg-[#F7F5EF] text-[#0B3D2E] border border-[#E3E7E2] hover:bg-[#E3E7E2]'
          }`}
          title="Listen to concierge audio briefing"
        >
          {isPlayingAudio ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-[#0B3D2E]" />}
          <span>{isPlayingAudio ? 'Pause Audio' : 'Listen Briefing'}</span>
        </button>
      </div>

      {/* Grid of Key Morning Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Weather & Climate */}
        <div className="bg-[#FAF9F5] rounded-2xl p-3.5 border border-[#E3E7E2] space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-medium text-[#0B3D2E]">
            <CloudSun className="w-4 h-4 text-[#C8A96B]" />
            <span>Climate & Temp</span>
          </div>
          <p className="font-serif-title text-base font-medium text-[#18221E]">{dailyBriefing.temperature}</p>
          <p className="text-[11px] text-[#66736C] font-light leading-tight">{dailyBriefing.weatherSummary}</p>
        </div>

        {/* Walking & Transit Time */}
        <div className="bg-[#FAF9F5] rounded-2xl p-3.5 border border-[#E3E7E2] space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-medium text-[#0B3D2E]">
            <Footprints className="w-4 h-4 text-[#C8A96B]" />
            <span>Estimated Mobility</span>
          </div>
          <p className="font-serif-title text-base font-medium text-[#18221E]">~{dailyBriefing.walkingTimeMinutes} mins</p>
          <p className="text-[11px] text-[#66736C] font-light leading-tight">Relaxed scenic transit</p>
        </div>

        {/* Est. Daily Expenses */}
        <div className="bg-[#FAF9F5] rounded-2xl p-3.5 border border-[#E3E7E2] space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-medium text-[#0B3D2E]">
            <DollarSign className="w-4 h-4 text-[#176B50]" />
            <span>Estimated Daily Outlay</span>
          </div>
          <p className="font-serif-title text-base font-medium text-[#0B3D2E]">
            {formatCurrency(dailyBriefing.estimatedExpense, currentTrip.currency)}
          </p>
          <p className="text-[11px] text-[#66736C] font-light leading-tight">Dining, admissions & transfers</p>
        </div>
      </div>

      {/* Packing Tip & Golden Hour Alert */}
      <div className="bg-[#F7F5EF] rounded-2xl p-3.5 border border-[#E3E7E2] space-y-2">
        <div className="flex items-start gap-2 text-xs text-[#18221E]">
          <Shirt className="w-4 h-4 text-[#0B3D2E] shrink-0 mt-0.5" />
          <div>
            <span className="font-medium text-[#0B3D2E]">Attire & Preparation Suggestion: </span>
            <span className="font-light text-[#66736C]">{dailyBriefing.packingTip}</span>
          </div>
        </div>

        {dailyBriefing.goldenHourTime && (
          <div className="flex items-center gap-2 text-xs text-[#0B3D2E] pt-1.5 border-t border-[#E3E7E2]">
            <Flame className="w-3.5 h-3.5 text-[#C8A96B] shrink-0" />
            <span className="font-light">
              <strong className="font-medium">Golden Hour at {dailyBriefing.goldenHourTime}</strong> — Prime viewpoint photography light.
            </span>
          </div>
        )}
      </div>

      {/* Smart Alert Notice if present */}
      {dailyBriefing.alertNotice && (
        <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-[#F7F5EF] text-[#0B3D2E] text-xs font-medium border border-[#C8A96B]/50">
          <AlertTriangle className="w-4 h-4 text-[#C8A96B] shrink-0 mt-0.5" />
          <span>{dailyBriefing.alertNotice}</span>
        </div>
      )}
    </div>
  );
};
