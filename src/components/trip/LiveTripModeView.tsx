import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Radio,
  CheckCircle2,
  Circle,
  SkipForward,
  Clock,
  MapPin,
  DollarSign,
  Plus,
  Trash2,
  Sparkles,
  Navigation,
  MessageSquare,
  Utensils,
  Camera,
  Compass,
  Footprints,
  Hotel,
  ShoppingBag,
  Moon,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  CreditCard,
  Edit3,
} from 'lucide-react';
import { useCurrentTrip } from '../../contexts/TripContext';
import { formatCurrency } from '../../lib/utils';
import { Activity } from '../../types';

interface LiveTripModeViewProps {
  onOpenAIChat?: (initialPrompt?: string) => void;
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Food & Dining':
      return Utensils;
    case 'Sightseeing':
      return Camera;
    case 'Culture & History':
      return Compass;
    case 'Adventure':
      return Footprints;
    case 'Hotel / Stay':
      return Hotel;
    case 'Shopping':
      return ShoppingBag;
    case 'Nightlife':
      return Moon;
    default:
      return MapPin;
  }
};

export const LiveTripModeView: React.FC<LiveTripModeViewProps> = ({ onOpenAIChat }) => {
  const {
    currentTrip,
    liveState,
    selectedDayNumber,
    setSelectedDayNumber,
    toggleActivityCompleted,
    toggleActivitySkipped,
    logExpense,
    removeExpense,
    saveLiveNote,
    generateSurpriseActivity,
    reorderActivities,
  } = useCurrentTrip();

  // Expense modal / form state
  const [expenseDesc, setExpenseDesc] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('Food & Dining');
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [isGeneratingSurprise, setIsGeneratingSurprise] = useState(false);

  if (!currentTrip) return null;

  const currentDay =
    currentTrip.itinerary_days?.find((d) => d.day_number === selectedDayNumber) ||
    currentTrip.itinerary_days?.[0];

  const activities = currentDay?.activities || [];
  const completedCount = activities.filter((a) =>
    liveState.completedActivityIds.includes(a.id)
  ).length;

  const progressPercent =
    activities.length > 0 ? Math.round((completedCount / activities.length) * 100) : 0;

  // Calculate live spending
  const totalSpent = liveState.expensesLog.reduce((acc, curr) => acc + curr.amount, 0);
  const budgetRatio = Math.min(100, Math.round((totalSpent / currentTrip.total_budget) * 100));

  const handleAddExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(expenseAmount);
    if (!expenseDesc.trim() || isNaN(amt) || amt <= 0) return;

    logExpense({
      description: expenseDesc.trim(),
      amount: amt,
      category: expenseCategory,
    });

    setExpenseDesc('');
    setExpenseAmount('');
    setIsAddingExpense(false);
  };

  const handleSurpriseMe = async () => {
    if (!currentDay) return;
    setIsGeneratingSurprise(true);
    await generateSurpriseActivity(currentDay.id);
    setIsGeneratingSurprise(false);
  };

  return (
    <div className="space-y-8">
      {/* Live Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-3xl p-6 shadow-lg border border-emerald-500/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/30 text-emerald-300 border border-emerald-400/40">
              <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
              Live Expedition Tracker
            </span>
            <span className="text-xs text-slate-300">
              {currentTrip.destination} • Day {selectedDayNumber} of {currentTrip.duration}
            </span>
          </div>

          <h2 className="text-2xl font-extrabold text-white font-display">
            {currentDay?.title || `Day ${selectedDayNumber} Itinerary`}
          </h2>

          {/* Progress Bar */}
          <div className="flex items-center gap-3 pt-1 max-w-md">
            <div className="flex-1 h-2.5 rounded-full bg-white/20 overflow-hidden">
              <div
                className="h-full bg-linear-to-r from-emerald-400 to-teal-300 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-xs font-bold text-emerald-300 shrink-0">
              {completedCount} / {activities.length} Done ({progressPercent}%)
            </span>
          </div>
        </div>

        {/* Surprise Me & Quick AI Actions */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleSurpriseMe}
            disabled={isGeneratingSurprise}
            className="px-4 py-2.5 rounded-2xl bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold text-xs shadow-md shadow-orange-500/20 active:scale-95 transition-all flex items-center gap-2"
          >
            <Sparkles className={`w-4 h-4 ${isGeneratingSurprise ? 'animate-spin' : ''}`} />
            <span>{isGeneratingSurprise ? 'Discovering...' : '🎲 Surprise Me Spot'}</span>
          </button>

          {onOpenAIChat && (
            <button
              type="button"
              onClick={() => onOpenAIChat('What should I do right now near my current spot?')}
              className="px-4 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs border border-white/20 transition-all flex items-center gap-1.5"
            >
              <MessageSquare className="w-4 h-4 text-emerald-300" />
              <span>Ask AI on the Go</span>
            </button>
          )}
        </div>
      </div>

      {/* Day Selector Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {currentTrip.itinerary_days?.map((day) => {
          const isSelected = day.day_number === selectedDayNumber;
          const dayDone = (day.activities || []).filter((a) =>
            liveState.completedActivityIds.includes(a.id)
          ).length;

          return (
            <button
              type="button"
              key={day.id}
              onClick={() => setSelectedDayNumber(day.day_number)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 border-2 ${
                isSelected
                  ? 'border-emerald-600 bg-emerald-600 text-white shadow-md shadow-emerald-600/25 scale-[1.02]'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
              }`}
            >
              <span>Day {day.day_number}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  isSelected ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {dayDone}/{day.activities?.length || 0}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Grid: Left Activities Check-in, Right Expense & Notes Tracker */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Live Activities Check-in Stream */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-600" />
              <span>Live Day {selectedDayNumber} Timeline & Check-ins</span>
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              Click circle to mark completed
            </span>
          </div>

          {activities.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 text-slate-500">
              No activities planned for this day. Click "Surprise Me Spot" to generate!
            </div>
          ) : (
            activities.map((act, index) => {
              const isCompleted = liveState.completedActivityIds.includes(act.id);
              const isSkipped = liveState.skippedActivityIds.includes(act.id);
              const CategoryIcon = getCategoryIcon(act.category);
              const mapLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                `${act.name} ${act.location || currentTrip.destination}`
              )}`;

              return (
                <div
                  key={act.id}
                  className={`rounded-3xl border p-5 transition-all space-y-3 ${
                    isCompleted
                      ? 'bg-emerald-50/50 border-emerald-200/80 shadow-xs'
                      : isSkipped
                      ? 'bg-slate-100/60 border-slate-200 opacity-60'
                      : 'bg-white border-slate-200/80 shadow-sm hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    {/* Checkbox Trigger */}
                    <div className="flex items-start gap-3 flex-1">
                      <button
                        type="button"
                        onClick={() => toggleActivityCompleted(act.id)}
                        className="mt-1 shrink-0 text-emerald-600 hover:scale-110 transition-transform"
                        title={isCompleted ? 'Mark as Incomplete' : 'Mark as Completed'}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-6 h-6 fill-emerald-600 text-white" />
                        ) : (
                          <Circle className="w-6 h-6 text-slate-300 hover:text-emerald-500" />
                        )}
                      </button>

                      <div className="space-y-1 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-slate-100 text-slate-700">
                            <CategoryIcon className="w-3 h-3 text-orange-500" />
                            <span>{act.category}</span>
                          </span>
                          <span className="text-xs font-bold text-orange-600 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{act.start_time || 'Flexible'}</span>
                          </span>
                          {act.duration && (
                            <span className="text-[11px] text-slate-500 font-medium">
                              ({act.duration})
                            </span>
                          )}
                        </div>

                        <h4
                          className={`text-base font-bold ${
                            isCompleted
                              ? 'line-through text-slate-500'
                              : isSkipped
                              ? 'text-slate-400'
                              : 'text-slate-900'
                          }`}
                        >
                          {act.name}
                        </h4>

                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                          {act.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-500">
                          <span className="flex items-center gap-1 font-medium text-slate-700">
                            <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                            <span className="truncate max-w-[180px]">
                              {act.location || currentTrip.destination}
                            </span>
                          </span>
                          {act.estimated_cost !== undefined && (
                            <span className="font-semibold text-slate-900">
                              💵 {formatCurrency(act.estimated_cost, currentTrip.currency)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions: Map Directions & Skip Button */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <a
                        href={mapLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl text-slate-500 hover:text-orange-600 hover:bg-orange-50 transition-colors"
                        title="Open in Google Maps"
                      >
                        <Navigation className="w-4 h-4" />
                      </a>
                      <button
                        type="button"
                        onClick={() => toggleActivitySkipped(act.id)}
                        className={`p-2 rounded-xl transition-colors ${
                          isSkipped
                            ? 'text-orange-600 bg-orange-50 font-bold'
                            : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                        }`}
                        title={isSkipped ? 'Unskip Activity' : 'Skip Activity'}
                      >
                        <SkipForward className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* On-the-ground traveler note field */}
                  <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                    <Edit3 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <input
                      type="text"
                      defaultValue={liveState.liveNotes[act.id] || ''}
                      onBlur={(e) => saveLiveNote(act.id, e.target.value)}
                      placeholder="Add personal memory or quick photo note..."
                      className="w-full bg-transparent text-xs text-slate-700 placeholder:text-slate-400 outline-none border-b border-transparent focus:border-orange-500 py-0.5"
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Real-time Expense Logger & Live Budget Meter */}
        <div className="lg:col-span-5 space-y-6">
          {/* Live Expense & Budget Summary */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <span>Live Expense Tracker</span>
              </h3>
              <span className="text-xs font-bold text-emerald-600">
                {budgetRatio}% of Budget
              </span>
            </div>

            {/* Budget Bar */}
            <div className="space-y-1.5">
              <div className="flex items-baseline justify-between text-xs">
                <span className="font-bold text-slate-700">
                  Spent: {formatCurrency(totalSpent, currentTrip.currency)}
                </span>
                <span className="text-slate-500">
                  Target: {formatCurrency(currentTrip.total_budget, currentTrip.currency)}
                </span>
              </div>
              <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    budgetRatio > 95
                      ? 'bg-rose-500'
                      : budgetRatio > 75
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${budgetRatio}%` }}
                />
              </div>
            </div>

            {/* Add Expense Button or Form */}
            {!isAddingExpense ? (
              <button
                type="button"
                onClick={() => setIsAddingExpense(true)}
                className="w-full py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Log New Expense (Coffee, Taxi, Meal...)</span>
              </button>
            ) : (
              <form onSubmit={handleAddExpenseSubmit} className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <h4 className="text-xs font-bold text-slate-900">Record Live Expense</h4>
                <div className="space-y-2">
                  <input
                    type="text"
                    required
                    value={expenseDesc}
                    onChange={(e) => setExpenseDesc(e.target.value)}
                    placeholder="Description (e.g. Tuk-tuk ride to fort)"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-medium outline-none focus:border-emerald-500"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      required
                      min="1"
                      value={expenseAmount}
                      onChange={(e) => setExpenseAmount(e.target.value)}
                      placeholder={`Amount (${currentTrip.currency})`}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-medium outline-none focus:border-emerald-500"
                    />
                    <select
                      value={expenseCategory}
                      onChange={(e) => setExpenseCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-medium outline-none focus:border-emerald-500"
                    >
                      <option value="Food & Dining">Food & Dining</option>
                      <option value="Transportation">Transportation</option>
                      <option value="Sightseeing / Tickets">Sightseeing / Tickets</option>
                      <option value="Shopping">Shopping</option>
                      <option value="Miscellaneous">Miscellaneous</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsAddingExpense(false)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-xs hover:bg-emerald-700"
                  >
                    Save Expense
                  </button>
                </div>
              </form>
            )}

            {/* Expenses List */}
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1 scrollbar-thin">
              {liveState.expensesLog.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">
                  No live expenses logged yet. Tap button above to track your spending!
                </p>
              ) : (
                liveState.expensesLog.map((exp) => (
                  <div
                    key={exp.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors text-xs"
                  >
                    <div className="space-y-0.5">
                      <p className="font-bold text-slate-900">{exp.description}</p>
                      <p className="text-[10px] text-slate-500">{exp.category}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-slate-900">
                        {formatCurrency(exp.amount, currentTrip.currency)}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeExpense(exp.id)}
                        className="text-slate-400 hover:text-rose-600"
                        title="Delete expense"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
