import React, { useState } from 'react';
import {
  Stethoscope,
  X,
  Sparkles,
  TrendingDown,
  Navigation,
  CloudSun,
  ShieldCheck,
  CheckCircle2,
  Zap,
  ChevronRight,
} from 'lucide-react';
import { useCurrentTrip } from '../../contexts/TripContext';
import { formatCurrency } from '../../lib/utils';
import { StructuredAIAction } from '../../types';

interface AITripDoctorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenConcierge?: () => void;
}

export const AITripDoctorModal: React.FC<AITripDoctorModalProps> = ({
  isOpen,
  onClose,
  onOpenConcierge,
}) => {
  const { currentTrip, journeyDiagnosis, applyStructuredAIAction } = useCurrentTrip();
  const [applyingActionIndex, setApplyingActionIndex] = useState<number | null>(null);
  const [appliedActions, setAppliedActions] = useState<Record<number, boolean>>({});
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  if (!isOpen || !currentTrip) return null;

  const handleApplySuggestion = async (sug: typeof journeyDiagnosis.suggestions[0], index: number) => {
    setApplyingActionIndex(index);
    setFeedbackMessage(null);
    try {
      const action: StructuredAIAction = {
        type: sug.category === 'budget' ? 'OPTIMIZE_BUDGET' : sug.category === 'route' ? 'OPTIMIZE_ROUTE' : 'REGENERATE_DAY',
        dayNumber: sug.dayNumber || 1,
        savingsAmount: sug.savingsAmount || 1500,
        previewSummary: `✨ Applied: ${sug.title} (${sug.changeDescription})`,
      };
      const res = await applyStructuredAIAction(action);
      setAppliedActions((prev) => ({ ...prev, [index]: true }));
      setFeedbackMessage(res.message);
    } catch (err: any) {
      setFeedbackMessage(err.message || 'Failed to apply recommendation.');
    } finally {
      setApplyingActionIndex(null);
    }
  };

  const handleApplyAll = async () => {
    setApplyingActionIndex(999);
    for (let i = 0; i < journeyDiagnosis.suggestions.length; i++) {
      const sug = journeyDiagnosis.suggestions[i];
      if (!appliedActions[i]) {
        const action: StructuredAIAction = {
          type: sug.category === 'budget' ? 'OPTIMIZE_BUDGET' : sug.category === 'route' ? 'OPTIMIZE_ROUTE' : 'REGENERATE_DAY',
          dayNumber: sug.dayNumber || 1,
          savingsAmount: sug.savingsAmount || 1500,
          previewSummary: `✨ Applied: ${sug.title}`,
        };
        await applyStructuredAIAction(action);
        setAppliedActions((prev) => ({ ...prev, [i]: true }));
      }
    }
    setApplyingActionIndex(null);
    setFeedbackMessage(`✨ All AI Trip Doctor recommendations applied to ${currentTrip.destination}!`);
  };

  const score = journeyDiagnosis.score;
  const scoreColor =
    score >= 90
      ? 'text-[#176B50] bg-[#176B50]/10 border-[#176B50]/30'
      : score >= 75
      ? 'text-[#C8A96B] bg-[#C8A96B]/10 border-[#C8A96B]/30'
      : 'text-rose-700 bg-rose-50 border-rose-200';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B3D2E]/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-[#F7F5EF] border border-[#E3E7E2] rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden my-8">
        {/* Modal Header */}
        <div className="bg-[#0B3D2E] text-[#F7F5EF] p-6 sm:p-7 relative border-b border-[#C8A96B]/30">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-[#F7F5EF] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-[#C8A96B]/20 border border-[#C8A96B]/40 flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-[#C8A96B]" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-widest text-[#C8A96B] font-medium block">
                Intelligent Diagnostic Engine
              </span>
              <h2 className="font-serif-title text-2xl text-[#F7F5EF] font-medium tracking-tight">
                AI Trip Doctor & Route Health
              </h2>
            </div>
          </div>
          <p className="text-xs text-[#E3E7E2]/80 font-light mt-1">
            Real-time multi-dimensional assessment of route efficiency, budget leakage, weather compatibility, and pace for{' '}
            <span className="text-[#C8A96B] font-medium">{currentTrip.destination}</span>.
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-7 space-y-6 max-h-[75vh] overflow-y-auto">
          {feedbackMessage && (
            <div className="p-4 rounded-2xl bg-[#176B50]/10 border border-[#176B50]/30 text-[#0B3D2E] text-xs font-medium flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-[#176B50] flex-shrink-0" />
              <span>{feedbackMessage}</span>
            </div>
          )}

          {/* Overall Health Score Card */}
          <div className="p-5 rounded-2xl bg-white border border-[#E3E7E2] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-2xl border flex flex-col items-center justify-center font-serif-title text-2xl font-bold ${scoreColor}`}>
                {score}
                <span className="text-[9px] uppercase tracking-widest font-sans font-normal opacity-80">/100</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif-title text-lg text-[#0B3D2E] font-medium">Journey Health Status</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-semibold bg-[#176B50]/10 text-[#176B50]">
                    {score >= 85 ? 'Optimized' : 'Can Be Improved'}
                  </span>
                </div>
                <p className="text-xs text-[#66736C] font-light mt-0.5">
                  {journeyDiagnosis.summary}
                </p>
              </div>
            </div>

            <button
              onClick={handleApplyAll}
              disabled={applyingActionIndex !== null}
              className="w-full sm:w-auto px-4 py-2.5 rounded-full bg-[#0B3D2E] hover:bg-[#176B50] text-[#F7F5EF] text-xs font-medium tracking-wide flex items-center justify-center gap-2 transition-all shadow-sm active:scale-98 border border-[#C8A96B]/30"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#C8A96B]" />
              <span>{applyingActionIndex === 999 ? 'Applying Fixes...' : 'Apply All Fixes'}</span>
            </button>
          </div>

          {/* 4 Diagnostic Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Route Pillar */}
            <div className="p-4 rounded-2xl bg-white border border-[#E3E7E2] space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-[#176B50]" />
                  <span className="text-xs font-medium text-[#0B3D2E]">Route Geometry</span>
                </div>
                <span className="text-[10px] font-semibold text-[#176B50] bg-[#176B50]/10 px-2 py-0.5 rounded-full">
                  Optimized
                </span>
              </div>
              <p className="text-[11px] text-[#66736C] font-light leading-relaxed">
                {journeyDiagnosis.routeNotice}
              </p>
            </div>

            {/* Budget Pillar */}
            <div className="p-4 rounded-2xl bg-white border border-[#E3E7E2] space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-[#C8A96B]" />
                  <span className="text-xs font-medium text-[#0B3D2E]">Cost Optimization</span>
                </div>
                {journeyDiagnosis.budgetSavingAmount > 0 && (
                  <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full">
                    Save {formatCurrency(journeyDiagnosis.budgetSavingAmount, currentTrip.currency)}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#66736C] font-light leading-relaxed">
                {journeyDiagnosis.budgetSavingNotice}
              </p>
            </div>

            {/* Weather Pillar */}
            <div className="p-4 rounded-2xl bg-white border border-[#E3E7E2] space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CloudSun className="w-4 h-4 text-amber-600" />
                  <span className="text-xs font-medium text-[#0B3D2E]">Weather Adaptability</span>
                </div>
                <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                  Favorable
                </span>
              </div>
              <p className="text-[11px] text-[#66736C] font-light leading-relaxed">
                {journeyDiagnosis.weatherAlert}
              </p>
            </div>

            {/* Pacing Radar Pillar */}
            <div className="p-4 rounded-2xl bg-white border border-[#E3E7E2] space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#0B3D2E]" />
                  <span className="text-xs font-medium text-[#0B3D2E]">Pacing & Balance</span>
                </div>
                <span className="text-[10px] font-semibold text-[#0B3D2E] bg-[#E3E7E2] px-2 py-0.5 rounded-full">
                  {journeyDiagnosis.personalizationMatchPct}% Match
                </span>
              </div>
              <p className="text-[11px] text-[#66736C] font-light leading-relaxed">
                {journeyDiagnosis.balanceFeedback}
              </p>
            </div>
          </div>

          {/* Actionable AI Doctor Prescription Suggestions */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-wider text-[#66736C] font-semibold flex items-center justify-between">
              <span>Prescribed AI Adjustments ({journeyDiagnosis.suggestions.length})</span>
              <span className="text-[10px] font-normal text-[#C8A96B]">1-Click Seamless Apply</span>
            </h4>

            <div className="space-y-2.5">
              {journeyDiagnosis.suggestions.map((sug, idx) => {
                const isApplied = appliedActions[idx];
                const isCurrent = applyingActionIndex === idx;

                return (
                  <div
                    key={sug.id || idx}
                    className={`p-4 rounded-2xl border transition-all ${
                      isApplied
                        ? 'bg-[#176B50]/5 border-[#176B50]/30'
                        : 'bg-white border-[#E3E7E2] hover:border-[#C8A96B]/50'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full ${
                              sug.category === 'route'
                                ? 'bg-indigo-50 text-indigo-700'
                                : sug.category === 'budget'
                                ? 'bg-emerald-50 text-emerald-700'
                                : sug.category === 'weather'
                                ? 'bg-amber-50 text-amber-700'
                                : 'bg-[#0B3D2E]/10 text-[#0B3D2E]'
                            }`}
                          >
                            {sug.category}
                          </span>
                          <h5 className="text-xs font-semibold text-[#0B3D2E]">{sug.title}</h5>
                        </div>
                        <p className="text-[11px] text-[#66736C] font-light leading-relaxed">
                          {sug.reason} — {sug.changeDescription}
                        </p>
                        {sug.savingsAmount && sug.savingsAmount > 0 && (
                          <span className="inline-block text-[10px] text-[#176B50] font-medium bg-[#176B50]/10 px-2 py-0.5 rounded-md">
                            ⚡ Save {formatCurrency(sug.savingsAmount, currentTrip.currency)}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => handleApplySuggestion(sug, idx)}
                        disabled={isApplied || isCurrent}
                        className={`w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 flex-shrink-0 transition-all ${
                          isApplied
                            ? 'bg-[#176B50] text-white cursor-default'
                            : 'bg-[#0B3D2E] hover:bg-[#176B50] text-[#F7F5EF] shadow-sm active:scale-95'
                        }`}
                      >
                        {isApplied ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Applied</span>
                          </>
                        ) : isCurrent ? (
                          <span>Applying...</span>
                        ) : (
                          <>
                            <Zap className="w-3.5 h-3.5 text-[#C8A96B]" />
                            <span>Apply Fix</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-[#EAE6DD] p-4 sm:p-5 flex items-center justify-between border-t border-[#E3E7E2]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-full bg-transparent hover:bg-black/5 text-xs text-[#66736C] font-medium transition-colors"
          >
            Close Diagnostics
          </button>

          {onOpenConcierge && (
            <button
              onClick={() => {
                onClose();
                onOpenConcierge();
              }}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#0B3D2E] hover:text-[#176B50] transition-colors"
            >
              <span>Consult Concierge for Custom Changes</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
