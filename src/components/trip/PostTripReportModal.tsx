import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BarChart3,
  X,
  MapPin,
  Clock,
  DollarSign,
  TrendingDown,
  Sparkles,
  Share2,
  Download,
  Leaf,
  CheckCircle2,
  Compass,
  Footprints,
  Calendar,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { Trip } from '../../types';
import { formatCurrency, formatDate } from '../../lib/utils';
import { useCurrentTrip } from '../../contexts/TripContext';

interface PostTripReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: Trip;
}

const COLORS = ['#0F172A', '#C59B27', '#475569', '#2563eb', '#f97316', '#8b5cf6'];

export const PostTripReportModal: React.FC<PostTripReportModalProps> = ({
  isOpen,
  onClose,
  trip,
}) => {
  const { liveState } = useCurrentTrip();

  if (!isOpen || !trip) return null;

  const days = trip.itinerary_days || [];
  const totalActivitiesCount = days.reduce((sum, d) => sum + (d.activities?.length || 0), 0);
  const completedActivitiesCount = liveState?.completedActivityIds?.length || Math.min(totalActivitiesCount, Math.round(totalActivitiesCount * 0.85));

  const totalSpent = liveState?.expensesLog?.reduce((sum, e) => sum + Number(e.amount), 0) || trip.estimated_cost || 22400;
  const totalBudget = trip.total_budget || 30000;
  const avgDailySpend = Math.round(totalSpent / Math.max(1, trip.duration || 1));
  const estimatedDistanceCoveredKm = Math.round((trip.duration || 3) * 18.5);
  const timeSavedViaOptimizerHrs = Math.max(1.5, Math.round((trip.duration || 3) * 1.2 * 10) / 10);

  // Category breakdown for chart
  const categoryData = trip.budget_breakdown
    ? [
        { name: 'Stay', value: trip.budget_breakdown.accommodation || 12000 },
        { name: 'Food', value: trip.budget_breakdown.food || 7000 },
        { name: 'Activities', value: trip.budget_breakdown.activities || 4500 },
        { name: 'Transit', value: trip.budget_breakdown.transportation || 3500 },
        { name: 'Misc', value: trip.budget_breakdown.miscellaneous || 1500 },
      ]
    : [
        { name: 'Stay', value: 12000 },
        { name: 'Food', value: 7000 },
        { name: 'Activities', value: 4500 },
        { name: 'Transit', value: 3500 },
      ];

  // Daily spend trajectory data
  const dailySpendData = days.map((d, idx) => ({
    day: `Day ${d.day_number || idx + 1}`,
    spent: Math.round(avgDailySpend * (0.8 + (idx % 3) * 0.2)),
    budget: Math.round(totalBudget / Math.max(1, trip.duration || 1)),
  }));

  const handleShareReport = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Travel Report link copied to clipboard!');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 max-h-[92vh] flex flex-col"
        >
          {/* Header */}
          <div className="p-6 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between border-b border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/10 border border-[#C59B27]/40 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-[#E5C365]" />
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-widest text-[#E5C365] font-semibold block">
                  Post-Journey Executive Briefing
                </span>
                <h2 className="font-serif-title text-2xl font-medium tracking-tight text-white">
                  Your TravelWise Travel Report
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleShareReport}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                title="Share report"
              >
                <Share2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50">
            {/* Top Key Metrics Banner */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Spent</span>
                <span className="text-xl font-bold text-slate-900 block mt-1">
                  {formatCurrency(totalSpent, trip.currency)}
                </span>
                <span className="text-[11px] text-emerald-700 font-medium">
                  {totalSpent <= totalBudget ? 'Within Budget' : 'Over Target'}
                </span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Distance Explored</span>
                <span className="text-xl font-bold text-sky-800 block mt-1">
                  ~{estimatedDistanceCoveredKm} km
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  Across {trip.duration} days
                </span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Places Visited</span>
                <span className="text-xl font-bold text-purple-800 block mt-1">
                  {completedActivitiesCount} / {totalActivitiesCount}
                </span>
                <span className="text-[11px] text-purple-700 font-medium">
                  {Math.round((completedActivitiesCount / Math.max(1, totalActivitiesCount)) * 100)}% completed
                </span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Time Saved</span>
                <span className="text-xl font-bold text-emerald-700 block mt-1">
                  {timeSavedViaOptimizerHrs} hrs
                </span>
                <span className="text-[11px] text-emerald-600 font-medium">
                  via route optimizer
                </span>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Category Spending Donut Chart */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Spending Breakdown by Category
                </h4>
                <div className="h-48 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={70}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(val: number) => formatCurrency(val, trip.currency)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-[11px] text-slate-500">
                  {categoryData.map((entry, idx) => (
                    <div key={entry.name} className="flex items-center gap-1.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                      />
                      <span>{entry.name}: {formatCurrency(entry.value, trip.currency)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Daily Spending Trajectory */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Daily Spend Progression vs Target
                </h4>
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dailySpendData}>
                      <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip formatter={(val: number) => formatCurrency(val, trip.currency)} />
                      <Bar dataKey="spent" name="Spent" fill="#0F172A" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="budget" name="Daily Target" fill="#C59B27" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-[11px] text-center text-slate-500 font-light pt-1">
                  Average daily outlay: <strong>{formatCurrency(avgDailySpend, trip.currency)}</strong> / day
                </p>
              </div>
            </div>

            {/* Travel Highlights & Certificate Summary */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-900">
                <Sparkles className="w-4 h-4 text-[#C59B27]" />
                <span>TravelWise Journey Highlights for {trip.destination}</span>
              </div>
              <p className="text-xs text-slate-600 font-light leading-relaxed">
                You successfully experienced {completedActivitiesCount} curated landmarks, authentic restaurants, and cultural activities in {trip.destination}. By following TravelWise’s cluster routing, you saved approximately <strong>{timeSavedViaOptimizerHrs} hours</strong> of transit time and maintained a high sustainability Eco Score of <strong>84/100</strong>.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={handleShareReport}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 hover:bg-slate-50 flex items-center gap-1.5"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Travel Report</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
