import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Sparkles, DollarSign, ArrowDownRight, TrendingDown, CheckCircle, AlertTriangle } from 'lucide-react';
import { BudgetBreakdown } from '../../types';
import { formatCurrency } from '../../lib/utils';

interface BudgetBreakdownCardProps {
  breakdown: BudgetBreakdown;
  targetBudget: number;
  currency?: string;
  onOptimize?: () => void;
  isOptimizing?: boolean;
}

const CATEGORY_COLORS: Record<string, string> = {
  Accommodation: '#3b82f6', // Blue
  'Food & Dining': '#f97316', // Orange
  Transportation: '#10b981', // Emerald
  'Activities & Sights': '#8b5cf6', // Purple
  Shopping: '#ec4899', // Pink
  Miscellaneous: '#64748b', // Slate
};

export const BudgetBreakdownCard: React.FC<BudgetBreakdownCardProps> = ({
  breakdown,
  targetBudget,
  currency = 'INR',
  onOptimize,
  isOptimizing,
}) => {
  const chartData = [
    { name: 'Accommodation', value: breakdown.accommodation || 0 },
    { name: 'Food & Dining', value: breakdown.food || 0 },
    { name: 'Transportation', value: breakdown.transportation || 0 },
    { name: 'Activities & Sights', value: breakdown.activities || 0 },
    { name: 'Shopping', value: breakdown.shopping || 0 },
    { name: 'Miscellaneous', value: breakdown.miscellaneous || 0 },
  ].filter((item) => item.value > 0);

  const totalEstimated = breakdown.total || chartData.reduce((acc, curr) => acc + curr.value, 0);
  const isOverBudget = totalEstimated > targetBudget;
  const diff = Math.abs(totalEstimated - targetBudget);
  const percentUsed = Math.min(100, Math.round((totalEstimated / (targetBudget || 1)) * 100));

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            Budget & Expense Breakdown
          </h3>
          <p className="text-xs text-slate-500">Estimated cost distribution across categories</p>
        </div>

        {/* Budget Status Badge */}
        {isOverBudget ? (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200/80 px-2.5 py-1 rounded-full">
            <AlertTriangle className="w-3.5 h-3.5" />
            {formatCurrency(diff, currency)} over target
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-full">
            <CheckCircle className="w-3.5 h-3.5" />
            Within Budget
          </span>
        )}
      </div>

      {/* Target vs Estimated Comparison Bar */}
      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 mb-6">
        <div className="flex items-center justify-between text-sm mb-1.5">
          <span className="text-slate-600 font-medium">Estimated Total</span>
          <span className="font-extrabold text-slate-900 text-base">
            {formatCurrency(totalEstimated, currency)}
            <span className="text-xs font-normal text-slate-400 ml-1">
              / {formatCurrency(targetBudget, currency)} target
            </span>
          </span>
        </div>

        <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isOverBudget ? 'bg-amber-500' : 'bg-gradient-to-r from-emerald-500 to-teal-500'
            }`}
            style={{ width: `${percentUsed}%` }}
          />
        </div>
      </div>

      {/* Donut Chart & Category Legend */}
      <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-4">
        {/* Donut Chart */}
        <div className="h-48 w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={48}
                outerRadius={72}
                paddingAngle={3}
                dataKey="value"
              >
                {chartData.map((entry) => (
                  <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name] || '#94a3b8'} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: any) => [formatCurrency(Number(value), currency), 'Estimated']}
                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Categories List */}
        <div className="space-y-2">
          {chartData.map((item) => {
            const pct = Math.round((item.value / totalEstimated) * 100);
            return (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: CATEGORY_COLORS[item.name] || '#94a3b8' }}
                  />
                  <span className="font-semibold text-slate-700">{item.name}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-900">{formatCurrency(item.value, currency)}</span>
                  <span className="text-slate-400 ml-1 text-[11px]">({pct}%)</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 1-Click Budget Optimizer CTA */}
      {onOptimize && (
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            {isOverBudget
              ? 'AI can swap high-cost items for budget-friendly alternatives.'
              : 'Optimize routes & local deals to save even more.'}
          </div>
          <button
            type="button"
            onClick={onOptimize}
            disabled={isOptimizing}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs font-bold border border-orange-200 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-orange-600" />
            {isOptimizing ? 'Optimizing...' : '⚡ Optimize Budget'}
          </button>
        </div>
      )}
    </div>
  );
};
