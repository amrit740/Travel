import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  DollarSign,
  Plus,
  Trash2,
  PieChart,
  Users,
  AlertTriangle,
  CheckCircle2,
  X,
  CreditCard,
  ShoppingBag,
  Utensils,
  Hotel,
  Car,
  Footprints,
  Layers,
} from 'lucide-react';
import { Trip, ExpenseItem } from '../../types';
import { formatCurrency } from '../../lib/utils';
import { useCurrentTrip } from '../../contexts/TripContext';

interface ExpenseTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: Trip | null;
}

const EXPENSE_CATEGORIES = [
  { id: 'Food & Dining', label: 'Food & Dining', icon: Utensils, color: 'text-orange-600 bg-orange-50 border-orange-200' },
  { id: 'Accommodation', label: 'Accommodation', icon: Hotel, color: 'text-blue-600 bg-blue-50 border-blue-200' },
  { id: 'Transportation', label: 'Transportation', icon: Car, color: 'text-purple-600 bg-purple-50 border-purple-200' },
  { id: 'Activities', label: 'Activities & Tours', icon: Footprints, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  { id: 'Shopping', label: 'Shopping & Souvenirs', icon: ShoppingBag, color: 'text-pink-600 bg-pink-50 border-pink-200' },
  { id: 'Other', label: 'Miscellaneous / Other', icon: Layers, color: 'text-slate-600 bg-slate-50 border-slate-200' },
];

export const ExpenseTrackerModal: React.FC<ExpenseTrackerModalProps> = ({
  isOpen,
  onClose,
  trip,
}) => {
  const { liveState, logExpense } = useCurrentTrip();

  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState('Food & Dining');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  if (!isOpen || !trip) return null;

  const expenses = liveState?.expensesLog || [];
  const currency = trip.currency || 'INR';
  const totalBudget = trip.total_budget || 30000;
  const travelersCount = trip.travelers || 1;

  const totalSpent = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const remainingBudget = totalBudget - totalSpent;
  const percentSpent = Math.min(100, Math.round((totalSpent / totalBudget) * 100));
  const perPersonCost = Math.round(totalSpent / travelersCount);

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!desc.trim() || isNaN(numAmount) || numAmount <= 0) return;

    const newExpense: ExpenseItem = {
      id: `exp-${Date.now()}`,
      category,
      amount: numAmount,
      description: desc.trim(),
      timestamp: new Date().toISOString(),
    };

    logExpense(newExpense);
    setDesc('');
    setAmount('');
  };

  const filteredExpenses = filterCategory === 'all'
    ? expenses
    : expenses.filter((e) => e.category === filterCategory);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-[#E3E7E2] overflow-hidden z-10 max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="p-6 bg-[#0B3D2E] text-[#F7F5EF] flex items-center justify-between border-b border-[#07261D]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#176B50] border border-[#C8A96B]/40 flex items-center justify-center text-[#DFCA9B]">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif-title text-xl font-medium tracking-tight">
                  Budget & Expense Ledger
                </h3>
                <p className="text-xs text-[#A2B3AA] font-light">
                  Track actual spending against your {formatCurrency(totalBudget, currency)} target budget
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6 overflow-y-auto flex-1">
            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-[#F7F5EF] border border-[#E3E7E2] space-y-1">
                <span className="text-[11px] font-semibold text-[#66736C] uppercase tracking-wider">
                  Total Spent
                </span>
                <div className="text-2xl font-bold text-[#0B3D2E]">
                  {formatCurrency(totalSpent, currency)}
                </div>
                <div className="text-xs text-[#8A9790] font-light">
                  {percentSpent}% of total budget
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#F7F5EF] border border-[#E3E7E2] space-y-1">
                <span className="text-[11px] font-semibold text-[#66736C] uppercase tracking-wider">
                  Remaining Budget
                </span>
                <div className={`text-2xl font-bold ${remainingBudget >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                  {formatCurrency(remainingBudget, currency)}
                </div>
                <div className="text-xs text-[#8A9790] font-light">
                  {remainingBudget >= 0 ? 'Comfortable runway' : 'Budget exceeded'}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#F7F5EF] border border-[#E3E7E2] space-y-1">
                <span className="text-[11px] font-semibold text-[#66736C] uppercase tracking-wider">
                  Per-Person Split
                </span>
                <div className="text-2xl font-bold text-[#0B3D2E]">
                  {formatCurrency(perPersonCost, currency)}
                </div>
                <div className="text-xs text-[#8A9790] font-light">
                  for {travelersCount} traveler{travelersCount > 1 ? 's' : ''}
                </div>
              </div>
            </div>

            {/* Progress Bar & Warning Banner */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-[#0B3D2E]">
                <span>Spending Progress</span>
                <span>{percentSpent}%</span>
              </div>
              <div className="w-full bg-[#E3E7E2] h-2.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    percentSpent > 90 ? 'bg-rose-500' : percentSpent > 75 ? 'bg-amber-500' : 'bg-emerald-600'
                  }`}
                  style={{ width: `${percentSpent}%` }}
                />
              </div>

              {percentSpent >= 85 && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-rose-800 text-xs font-medium">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>
                    You have utilized {percentSpent}% of your planned trip budget. Consider reviewing dining or shopping options!
                  </span>
                </div>
              )}
            </div>

            {/* Add Expense Form */}
            <form onSubmit={handleAddExpense} className="p-4 rounded-2xl bg-[#F7F5EF] border border-[#E3E7E2] space-y-3">
              <h4 className="font-serif-title text-sm font-semibold text-[#0B3D2E] flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-[#C8A96B]" />
                <span>Log New Expense Item</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-5">
                  <input
                    type="text"
                    required
                    placeholder="Expense title (e.g. Seafood Dinner at Brittos)"
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#E3E7E2] text-xs text-[#2D3A34] focus:outline-none focus:ring-2 focus:ring-[#0B3D2E]/20"
                  />
                </div>

                <div className="sm:col-span-3">
                  <input
                    type="number"
                    required
                    min="1"
                    step="any"
                    placeholder={`Amount (${currency})`}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#E3E7E2] text-xs text-[#2D3A34] focus:outline-none focus:ring-2 focus:ring-[#0B3D2E]/20"
                  />
                </div>

                <div className="sm:col-span-3">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#E3E7E2] text-xs text-[#2D3A34] focus:outline-none focus:ring-2 focus:ring-[#0B3D2E]/20"
                  >
                    {EXPENSE_CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-1">
                  <button
                    type="submit"
                    className="w-full h-full py-2 rounded-xl bg-[#0B3D2E] hover:bg-[#176B50] text-[#F7F5EF] text-xs font-semibold flex items-center justify-center transition-colors shadow-xs"
                    title="Add Expense"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </form>

            {/* Expense Log List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-serif-title text-sm font-semibold text-[#0B3D2E]">
                  Logged Expenses ({expenses.length})
                </h4>

                {/* Category filter pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-[60%]">
                  <button
                    type="button"
                    onClick={() => setFilterCategory('all')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold shrink-0 transition-colors ${
                      filterCategory === 'all'
                        ? 'bg-[#0B3D2E] text-[#F7F5EF]'
                        : 'bg-[#F7F5EF] text-[#66736C] hover:bg-[#E3E7E2]'
                    }`}
                  >
                    All
                  </button>
                  {EXPENSE_CATEGORIES.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setFilterCategory(c.id)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold shrink-0 transition-colors ${
                        filterCategory === c.id
                          ? 'bg-[#0B3D2E] text-[#F7F5EF]'
                          : 'bg-[#F7F5EF] text-[#66736C] hover:bg-[#E3E7E2]'
                      }`}
                    >
                      {c.label.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>

              {filteredExpenses.length === 0 ? (
                <div className="p-8 text-center bg-[#F7F5EF] rounded-2xl border border-[#E3E7E2] text-[#8A9790] space-y-1">
                  <p className="text-xs font-light">No expenses recorded in this category yet.</p>
                  <p className="text-[11px] text-[#A2B3AA]">Use the form above to log meal tickets, taxis, or souvenirs.</p>
                </div>
              ) : (
                <div className="divide-y divide-[#E3E7E2]/70 border border-[#E3E7E2] rounded-2xl overflow-hidden bg-white">
                  {filteredExpenses.map((item) => (
                    <div key={item.id} className="p-3.5 flex items-center justify-between gap-3 hover:bg-[#F7F5EF]/50 transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-[#F7F5EF] border border-[#E3E7E2] flex items-center justify-center shrink-0">
                          <DollarSign className="w-4 h-4 text-[#C8A96B]" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-[#0B3D2E] truncate">{item.description}</div>
                          <div className="text-[10px] text-[#8A9790] flex items-center gap-2">
                            <span>{item.category}</span>
                            <span>•</span>
                            <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-sm font-bold text-[#0B3D2E] shrink-0">
                        {formatCurrency(item.amount, currency)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 bg-[#F7F5EF] border-t border-[#E3E7E2] flex items-center justify-between">
            <span className="text-xs text-[#8A9790] font-light">
              Automatically saved to your secure cloud trip ledger
            </span>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-[#0B3D2E] hover:bg-[#176B50] text-[#F7F5EF] text-xs font-medium uppercase tracking-wider shadow-xs transition-colors"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
