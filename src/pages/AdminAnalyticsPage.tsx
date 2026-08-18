import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  Users,
  Luggage,
  Sparkles,
  DollarSign,
  MapPin,
  Calendar,
  Activity as ActivityIcon,
  ShieldCheck,
  Compass,
  Bookmark,
  Clock,
  PieChart as PieIcon,
  Shield,
  ArrowRight,
  RefreshCw,
  Award,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { checkIsAdmin } from '../lib/adminService';
import { getUserTripsFromFirestore } from '../lib/firebaseSync';
import { apiAnalytics, apiTrips } from '../services/api';
import { Trip } from '../types';
import { formatCurrency } from '../lib/utils';

const CHART_COLORS = ['#0B3D2E', '#C8A96B', '#176B50', '#ea580c', '#3b82f6', '#8b5cf6', '#ec4899'];

export const AdminAnalyticsPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const isAdmin = checkIsAdmin(user);

  // View toggle for Admin: 'personal' vs 'platform'
  const [viewMode, setViewMode] = useState<'personal' | 'platform'>(isAdmin ? 'personal' : 'personal');

  const [platformStats, setPlatformStats] = useState<any>(null);
  const [userTrips, setUserTrips] = useState<Trip[]>([]);
  const [userBackendStats, setUserBackendStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadAllAnalytics = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch user-specific trips from Firestore + API
      if (user?.id) {
        const [fbTrips, apiUserTrips, userStats] = await Promise.allSettled([
          getUserTripsFromFirestore(user.id),
          apiTrips.getAll().then((all) => all.filter((t) => t.user_id === user.id)),
          apiAnalytics.getUserStats(user.id),
        ]);

        const tripsMap = new Map<string, Trip>();
        if (fbTrips.status === 'fulfilled' && Array.isArray(fbTrips.value)) {
          fbTrips.value.forEach((t) => {
            if (t && t.id) tripsMap.set(t.id, t);
          });
        }
        if (apiUserTrips.status === 'fulfilled' && Array.isArray(apiUserTrips.value)) {
          apiUserTrips.value.forEach((t) => {
            if (t && t.id) tripsMap.set(t.id, t);
          });
        }

        setUserTrips(Array.from(tripsMap.values()));
        if (userStats.status === 'fulfilled') {
          setUserBackendStats(userStats.value);
        }
      }

      // 2. Fetch platform telemetry if admin or as background baseline
      try {
        const pStats = await apiAnalytics.getStats();
        setPlatformStats(pStats);
      } catch (err) {
        console.warn('Could not load platform telemetry:', err);
      }
    } catch (err) {
      console.warn('Error compiling analytics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllAnalytics();
  }, [user?.id]);

  // Compute live user stats from user's loaded trips
  const computedPersonalStats = useMemo(() => {
    const totalTrips = userTrips.length;
    const totalDays = userTrips.reduce((acc, t) => acc + (t.duration || 1), 0);
    const totalBudget = userTrips.reduce((acc, t) => acc + (t.total_budget || 0), 0);
    const averageBudget = totalTrips > 0 ? Math.round(totalBudget / totalTrips) : 0;

    let totalActivities = 0;
    const destCounts: Record<string, { trips: number; totalBudget: number }> = {};
    const styleCounts: Record<string, number> = {};
    const categoryCounts: Record<string, number> = {};

    userTrips.forEach((trip) => {
      // Destinations
      const dest = trip.destination || 'Unspecified';
      if (!destCounts[dest]) {
        destCounts[dest] = { trips: 0, totalBudget: 0 };
      }
      destCounts[dest].trips += 1;
      destCounts[dest].totalBudget += trip.total_budget || 0;

      // Travel Styles
      if (Array.isArray(trip.travel_style)) {
        trip.travel_style.forEach((style) => {
          styleCounts[style] = (styleCounts[style] || 0) + 1;
        });
      }

      // Activities & Categories
      if (Array.isArray(trip.itinerary_days)) {
        trip.itinerary_days.forEach((day) => {
          if (Array.isArray(day.activities)) {
            totalActivities += day.activities.length;
            day.activities.forEach((act) => {
              const cat = act.category || 'Sightseeing';
              categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
            });
          }
        });
      }
    });

    const destinationChartData = Object.entries(destCounts)
      .map(([name, data]) => ({
        name,
        trips: data.trips,
        budget: data.totalBudget,
      }))
      .sort((a, b) => b.trips - a.trips);

    const styleChartData = Object.entries(styleCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    const categoryChartData = Object.entries(categoryCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    return {
      totalTrips,
      totalDays,
      totalActivities: totalActivities || userBackendStats?.totalActivities || 0,
      totalBudget,
      averageBudget: averageBudget || userBackendStats?.averageBudget || 0,
      destinationChartData,
      styleChartData,
      categoryChartData,
    };
  }, [userTrips, userBackendStats]);

  const platformDestData =
    platformStats?.popularDestinations?.map((d: any) => ({
      name: d.name,
      trips: d.count,
    })) || [];

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center space-y-3">
        <div className="w-8 h-8 border-2 border-[#0B3D2E] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-medium text-[#66736C]">Compiling travel intelligence and metrics...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-[#E3E7E2]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase tracking-widest text-[#C8A96B] font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              TravelWise Intelligence
            </span>
          </div>
          <h1 className="font-serif-title text-3xl sm:text-4xl text-[#0B3D2E] font-medium tracking-tight">
            {viewMode === 'personal' ? 'Personal Travel Insights' : 'Platform & System Telemetry'}
          </h1>
          <p className="text-xs sm:text-sm text-[#66736C] font-light mt-1">
            {viewMode === 'personal'
              ? 'Real-time analytics on your curated journeys, travel habits, waypoints, and itinerary budgets.'
              : 'Global metrics on all platform users, generated itineraries, and AI system health.'}
          </p>
        </div>

        {/* View Switcher (For Admins) & Action Buttons */}
        <div className="flex items-center gap-3">
          {isAdmin && (
            <div className="p-1 bg-[#F7F5EF] rounded-2xl border border-[#E3E7E2] flex items-center gap-1">
              <button
                type="button"
                onClick={() => setViewMode('personal')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  viewMode === 'personal'
                    ? 'bg-[#0B3D2E] text-white shadow-xs'
                    : 'text-[#66736C] hover:text-[#0B3D2E]'
                }`}
              >
                My Insights
              </button>
              <button
                type="button"
                onClick={() => setViewMode('platform')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  viewMode === 'platform'
                    ? 'bg-[#0B3D2E] text-white shadow-xs'
                    : 'text-[#66736C] hover:text-[#0B3D2E]'
                }`}
              >
                <Shield className="w-3 h-3 text-[#C8A96B]" />
                Platform Telemetry
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={loadAllAnalytics}
            className="p-2.5 rounded-xl bg-white hover:bg-[#F7F5EF] text-[#0B3D2E] border border-[#E3E7E2] transition-colors shadow-xs"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. PERSONAL TRAVELER INSIGHTS VIEW (Default for all users)               */}
      {/* ========================================================================= */}
      {viewMode === 'personal' && (
        <div className="space-y-8">
          {/* Top 4 KPI Metrics Grid (Scoped to User) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Metric 1: My Total Trips */}
            <div className="bg-white rounded-3xl p-6 border border-[#E3E7E2] shadow-xs space-y-2 relative overflow-hidden">
              <div className="flex items-center justify-between text-[#66736C]">
                <span className="text-xs font-bold uppercase tracking-wider">Total Journeys</span>
                <div className="p-2.5 rounded-2xl bg-[#0B3D2E]/10 text-[#0B3D2E]">
                  <Luggage className="w-5 h-5" />
                </div>
              </div>
              <p className="font-serif-title text-3xl sm:text-4xl font-semibold text-[#0B3D2E]">
                {computedPersonalStats.totalTrips}
              </p>
              <p className="text-[11px] font-medium text-[#176B50]">
                {computedPersonalStats.totalTrips === 1 ? '1 curated journey' : `${computedPersonalStats.totalTrips} curated itineraries`}
              </p>
            </div>

            {/* Metric 2: Days on the Road (Replaces Registered Users) */}
            <div className="bg-white rounded-3xl p-6 border border-[#E3E7E2] shadow-xs space-y-2 relative overflow-hidden">
              <div className="flex items-center justify-between text-[#66736C]">
                <span className="text-xs font-bold uppercase tracking-wider">Days Explored</span>
                <div className="p-2.5 rounded-2xl bg-[#C8A96B]/15 text-[#0B3D2E]">
                  <Calendar className="w-5 h-5 text-[#C8A96B]" />
                </div>
              </div>
              <p className="font-serif-title text-3xl sm:text-4xl font-semibold text-[#0B3D2E]">
                {computedPersonalStats.totalDays}
              </p>
              <p className="text-[11px] font-medium text-[#C8A96B]">
                Total itinerary duration planned
              </p>
            </div>

            {/* Metric 3: Activities Scheduled */}
            <div className="bg-white rounded-3xl p-6 border border-[#E3E7E2] shadow-xs space-y-2 relative overflow-hidden">
              <div className="flex items-center justify-between text-[#66736C]">
                <span className="text-xs font-bold uppercase tracking-wider">Activity Waypoints</span>
                <div className="p-2.5 rounded-2xl bg-[#0B3D2E]/10 text-[#0B3D2E]">
                  <ActivityIcon className="w-5 h-5 text-[#176B50]" />
                </div>
              </div>
              <p className="font-serif-title text-3xl sm:text-4xl font-semibold text-[#0B3D2E]">
                {computedPersonalStats.totalActivities}
              </p>
              <p className="text-[11px] font-medium text-[#176B50]">
                Scheduled sights & experiences
              </p>
            </div>

            {/* Metric 4: Average Budget */}
            <div className="bg-white rounded-3xl p-6 border border-[#E3E7E2] shadow-xs space-y-2 relative overflow-hidden">
              <div className="flex items-center justify-between text-[#66736C]">
                <span className="text-xs font-bold uppercase tracking-wider">Average Budget</span>
                <div className="p-2.5 rounded-2xl bg-amber-50 text-amber-700">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
              <p className="font-serif-title text-2xl sm:text-3xl font-semibold text-[#0B3D2E] truncate">
                {computedPersonalStats.averageBudget > 0
                  ? formatCurrency(computedPersonalStats.averageBudget, user?.preferences?.preferred_currency || 'INR')
                  : '₹0'}
              </p>
              <p className="text-[11px] font-medium text-amber-700">
                Avg. per journey allocation
              </p>
            </div>
          </div>

          {/* Empty State Prompt if user has no trips yet */}
          {computedPersonalStats.totalTrips === 0 && (
            <div className="bg-white rounded-3xl border border-[#E3E7E2] p-8 sm:p-12 text-center max-w-xl mx-auto space-y-4 shadow-xs">
              <div className="w-16 h-16 rounded-2xl bg-[#F7F5EF] text-[#0B3D2E] border border-[#E3E7E2] flex items-center justify-center mx-auto">
                <Compass className="w-8 h-8 text-[#C8A96B]" />
              </div>
              <h3 className="font-serif-title text-2xl font-medium text-[#0B3D2E]">
                Begin Your Travel Intelligence
              </h3>
              <p className="text-xs sm:text-sm text-[#66736C] font-light leading-relaxed">
                As you generate and customize travel journeys with TravelWise, this dashboard automatically tracks your destination visits, favorite travel styles, time allocation, and budget optimization.
              </p>
              <Link
                to="/create-trip"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#0B3D2E] hover:bg-[#176B50] text-[#F7F5EF] font-medium text-xs tracking-wider uppercase shadow-md transition-all border border-[#C8A96B]/30"
              >
                <Sparkles className="w-4 h-4 text-[#C8A96B]" />
                <span>Craft Your First Journey</span>
              </Link>
            </div>
          )}

          {/* Charts & Breakdown Section (when trips exist) */}
          {computedPersonalStats.totalTrips > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left 7 Cols: My Visited / Planned Destinations */}
              <div className="lg:col-span-7 bg-white rounded-3xl border border-[#E3E7E2] p-6 sm:p-8 shadow-xs space-y-6">
                <div>
                  <h3 className="font-serif-title text-lg font-medium text-[#0B3D2E] flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-[#C8A96B]" />
                    My Destinations & Itinerary Frequency
                  </h3>
                  <p className="text-xs text-[#66736C] mt-0.5">
                    Journeys planned per destination in your TravelWise account
                  </p>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={computedPersonalStats.destinationChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#66736C' }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#66736C' }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0B3D2E',
                          borderRadius: '16px',
                          color: '#F7F5EF',
                          border: '1px solid #C8A96B',
                          fontSize: '12px',
                        }}
                      />
                      <Bar dataKey="trips" fill="#0B3D2E" radius={[8, 8, 0, 0]} name="Trips Planned" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Right 5 Cols: Travel Style & Interests */}
              <div className="lg:col-span-5 bg-white rounded-3xl border border-[#E3E7E2] p-6 sm:p-8 shadow-xs space-y-6 flex flex-col justify-between">
                <div>
                  <h3 className="font-serif-title text-lg font-medium text-[#0B3D2E] flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#C8A96B]" />
                    My Travel DNA & Style Interests
                  </h3>
                  <p className="text-xs text-[#66736C] mt-0.5">
                    Key themes discovered across your journeys
                  </p>
                </div>

                {computedPersonalStats.styleChartData.length > 0 ? (
                  <div className="space-y-3">
                    {computedPersonalStats.styleChartData.map((style, idx) => (
                      <div key={style.name} className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-semibold text-[#18221E]">
                          <span className="flex items-center gap-1.5">
                            <span
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }}
                            />
                            {style.name}
                          </span>
                          <span className="text-[#66736C] font-mono">{style.count} journeys</span>
                        </div>
                        <div className="w-full bg-[#F7F5EF] h-2 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.min(100, (style.count / computedPersonalStats.totalTrips) * 100)}%`,
                              backgroundColor: CHART_COLORS[idx % CHART_COLORS.length],
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center bg-[#F7F5EF] rounded-2xl border border-dashed border-[#E3E7E2] text-xs text-[#66736C]">
                    Style preferences will populate as you create varied journeys.
                  </div>
                )}

                <div className="pt-4 border-t border-[#E3E7E2] flex items-center justify-between">
                  <span className="text-xs text-[#66736C]">Total Planned Investment:</span>
                  <span className="font-serif-title text-base font-medium text-[#0B3D2E]">
                    {formatCurrency(computedPersonalStats.totalBudget, user?.preferences?.preferred_currency || 'INR')}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Activity Category Highlights */}
          {computedPersonalStats.categoryChartData.length > 0 && (
            <div className="bg-[#FAF9F5] rounded-3xl border border-[#E3E7E2] p-6 sm:p-8 space-y-4">
              <h3 className="font-serif-title text-lg font-medium text-[#0B3D2E] flex items-center gap-2">
                <ActivityIcon className="w-5 h-5 text-[#176B50]" />
                Itinerary Activity Distribution
              </h3>
              <p className="text-xs text-[#66736C]">
                How your scheduled waypoints are categorized across culture, dining, sightseeing, and relaxation.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                {computedPersonalStats.categoryChartData.map((cat, idx) => (
                  <div key={cat.name} className="p-4 rounded-2xl bg-white border border-[#E3E7E2] shadow-xs">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#66736C]">{cat.name}</p>
                    <p className="font-serif-title text-2xl font-semibold text-[#0B3D2E] mt-1">{cat.count}</p>
                    <span className="text-[10px] text-[#C8A96B] font-medium">scheduled stops</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. PLATFORM & SYSTEM TELEMETRY VIEW (For Admins)                         */}
      {/* ========================================================================= */}
      {viewMode === 'platform' && isAdmin && (
        <div className="space-y-8">
          {/* Admin Platform KPI Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Total Platform Trips</span>
                <div className="p-2.5 rounded-xl bg-orange-50 text-orange-600">
                  <Luggage className="w-5 h-5" />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-slate-900 font-display">
                {platformStats?.totalTrips || 0}
              </p>
              <span className="text-[11px] font-semibold text-emerald-600">Active itineraries system-wide</span>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Registered Users</span>
                <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-slate-900 font-display">
                {platformStats?.totalUsers || 0}
              </p>
              <span className="text-[11px] font-semibold text-blue-600">Active traveler accounts</span>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Activities Scheduled</span>
                <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
                  <ActivityIcon className="w-5 h-5" />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-slate-900 font-display">
                {platformStats?.totalActivities || 0}
              </p>
              <span className="text-[11px] font-semibold text-purple-600">Geo-tagged waypoints</span>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Platform Avg Budget</span>
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display truncate">
                {formatCurrency(platformStats?.averageBudget || 0, 'INR')}
              </p>
              <span className="text-[11px] font-semibold text-emerald-600">Average plan budget</span>
            </div>
          </div>

          {/* Visual Analytics Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 font-display flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-orange-600" />
                  Most Popular Platform Destinations
                </h3>
                <p className="text-xs text-slate-500">Number of itineraries planned across all platform travelers</p>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={platformDestData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderRadius: '12px',
                        color: '#fff',
                        border: 'none',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="trips" fill="#ea580c" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* TravelWise AI Engine Info */}
            <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-5 flex flex-col justify-between">
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-slate-900 font-display flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  TravelWise AI Architecture
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Powered by TravelWise AI engine with server-side structured JSON schemas and real-time geospatial intelligence.
                </p>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <span className="text-slate-600 font-medium">Assistant Engine</span>
                  <span className="font-bold text-slate-900">TravelWise Intelligence</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <span className="text-slate-600 font-medium">Map Engine</span>
                  <span className="font-bold text-slate-900">Leaflet + OpenStreetMap</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <span className="text-slate-600 font-medium">Weather Engine</span>
                  <span className="font-bold text-slate-900">Open-Meteo & Climate API</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
