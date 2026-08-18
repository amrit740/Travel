import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TravelWiseLogo } from '../components/common/TravelWiseLogo';
import {
  Luggage,
  Sparkles,
  Plus,
  Calendar,
  MapPin,
  DollarSign,
  Users,
  Search,
  MoreVertical,
  Trash2,
  Copy,
  Edit3,
  ExternalLink,
  Radio,
  Sliders,
  CheckCircle2,
  Compass,
  Stethoscope,
  Ticket,
  BarChart3,
  Activity,
  ArrowRight,
} from 'lucide-react';
import { Trip } from '../types';
import { apiTrips } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useCurrentTrip } from '../contexts/TripContext';
import { getUserTripsFromFirestore, deleteTripFromFirestore } from '../lib/firebaseSync';
import { formatCurrency, formatDate } from '../lib/utils';
import { DynamicTripBanner } from '../components/trip/DynamicTripBanner';
import { UpNextCard } from '../components/trip/UpNextCard';
import { DailyBriefingCard } from '../components/trip/DailyBriefingCard';
import { TripStoryModal } from '../components/trip/TripStoryModal';
import { TravelBadgesModal } from '../components/trip/TravelBadgesModal';
import { AITripDoctorModal } from '../components/trip/AITripDoctorModal';
import { WhatIfSimulatorModal } from '../components/trip/WhatIfSimulatorModal';
import { SmartPackingModal } from '../components/trip/SmartPackingModal';
import { ReservationsHubModal } from '../components/trip/ReservationsHubModal';
import { GroupTripModal } from '../components/trip/GroupTripModal';
import { SmartNearbyModal } from '../components/trip/SmartNearbyModal';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { currentTrip, setCurrentTrip, setLiveMode, liveState } = useCurrentTrip();

  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'planned' | 'completed'>('all');

  // Modals state
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  const [isBadgesModalOpen, setIsBadgesModalOpen] = useState(false);
  const [isDoctorModalOpen, setIsDoctorModalOpen] = useState(false);
  const [isWhatIfModalOpen, setIsWhatIfModalOpen] = useState(false);
  const [isPackingModalOpen, setIsPackingModalOpen] = useState(false);
  const [isReservationsModalOpen, setIsReservationsModalOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isNearbyModalOpen, setIsNearbyModalOpen] = useState(false);

  const fetchTrips = async () => {
    if (!user) {
      setTrips([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      // 1. Fetch user-specific trips directly from Firestore
      const fbTrips = await getUserTripsFromFirestore(user.id);
      
      // 2. Fetch from backend API
      let apiData: Trip[] = [];
      try {
        const res = await apiTrips.getAll();
        // Strict user filter: only include trips created by or belonging to this specific user
        apiData = res.filter((t) => t.user_id === user.id);
      } catch (err) {
        console.warn('API trips fetch warning:', err);
      }

      // Merge and deduplicate trips
      const tripMap = new Map<string, Trip>();
      [...fbTrips, ...apiData].forEach((trip) => {
        if (trip && trip.id && trip.user_id === user.id) {
          tripMap.set(trip.id, trip);
        }
      });

      const userTrips = Array.from(tripMap.values());
      setTrips(userTrips);

      if (!currentTrip && userTrips.length > 0) {
        setCurrentTrip(userTrips[0]);
      } else if (currentTrip && !userTrips.some((t) => t.id === currentTrip.id)) {
        setCurrentTrip(userTrips.length > 0 ? userTrips[0] : null);
      }
    } catch (err) {
      console.warn('Error loading user trips:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, [user?.id]);

  const handleDelete = async (e: React.MouseEvent, tripId: string) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this trip itinerary?')) return;
    try {
      await Promise.allSettled([
        apiTrips.delete(tripId),
        deleteTripFromFirestore(tripId),
      ]);
      setTrips((prev) => prev.filter((t) => t.id !== tripId));
      if (currentTrip?.id === tripId) {
        const remaining = trips.filter((t) => t.id !== tripId);
        setCurrentTrip(remaining.length > 0 ? remaining[0] : null);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete trip.');
    }
  };

  const handleDuplicate = async (e: React.MouseEvent, tripId: string) => {
    e.stopPropagation();
    try {
      const dup = await apiTrips.duplicate(tripId);
      navigate(`/trips/${dup.id}`);
    } catch (err: any) {
      alert(err.message || 'Failed to duplicate trip.');
    }
  };

  const handleSelectActiveTrip = (e: React.MouseEvent, trip: Trip) => {
    e.stopPropagation();
    setCurrentTrip(trip);
  };

  const filteredTrips = trips.filter((trip) => {
    const matchesSearch =
      trip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trip.destination.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (activeTab === 'all') return true;
    return trip.status === activeTab;
  });

  const totalTripsCount = trips.length;
  const totalDaysCount = trips.reduce((acc, t) => acc + (t.duration || 1), 0);
  const totalActivitiesCount = trips.reduce((acc, t) => {
    let count = 0;
    if (t.itinerary_days) {
      t.itinerary_days.forEach((day) => {
        if (day.activities) count += day.activities.length;
      });
    }
    return acc + count;
  }, 0);
  const totalBudgetSum = trips.reduce((acc, t) => acc + (t.total_budget || 0), 0);
  const avgBudget = totalTripsCount > 0 ? Math.round(totalBudgetSum / totalTripsCount) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#C59B27] font-semibold block mb-1">
            Personal Concierge Desk
          </span>
          <h1 className="font-serif-title text-3xl sm:text-4xl text-slate-900 font-medium tracking-tight">
            My TravelWise Journeys
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-light mt-1">
            Centralized hub for your bespoke itineraries, live day briefings, and curated experiences.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <Link
            to="/analytics"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white hover:bg-slate-50 text-slate-800 font-medium text-xs border border-slate-200 shadow-2xs transition-all"
          >
            <BarChart3 className="w-3.5 h-3.5 text-slate-500" />
            <span>Travel Insights</span>
          </Link>
          <Link
            to="/create-trip"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs shadow-xs active:scale-98 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#E5C365]" />
            <span>Craft New Journey</span>
          </Link>
        </div>
      </div>

      {/* Traveler Personal Insights Quick Ribbon */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-[#E5C365]" />
            </div>
            <div>
              <h3 className="font-serif-title text-base font-semibold text-slate-900">
                Personal Traveler Insights
              </h3>
              <p className="text-[11px] text-slate-500">
                Your journey metrics, scheduled waypoints, and itinerary allocations.
              </p>
            </div>
          </div>
          <Link
            to="/analytics"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-900 hover:text-slate-700 transition-colors self-start sm:self-auto"
          >
            <span>Detailed Breakdown</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-[#FAFAF8] rounded-2xl p-3 sm:p-4 border border-slate-200/80">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total Journeys</span>
            <p className="font-serif-title text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">
              {totalTripsCount}
            </p>
            <span className="text-[10px] text-slate-500 font-medium">Curated plans</span>
          </div>

          <div className="bg-[#FAFAF8] rounded-2xl p-3 sm:p-4 border border-slate-200/80">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Days Explored</span>
            <p className="font-serif-title text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">
              {totalDaysCount}
            </p>
            <span className="text-[10px] text-[#C59B27] font-medium">Total itinerary days</span>
          </div>

          <div className="bg-[#FAFAF8] rounded-2xl p-3 sm:p-4 border border-slate-200/80">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Activities Scheduled</span>
            <p className="font-serif-title text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">
              {totalActivitiesCount}
            </p>
            <span className="text-[10px] text-slate-600 font-medium">Planned waypoints</span>
          </div>

          <div className="bg-[#FAFAF8] rounded-2xl p-3 sm:p-4 border border-slate-200/80">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Average Budget</span>
            <p className="font-serif-title text-lg sm:text-xl font-bold text-slate-900 mt-0.5 truncate">
              {avgBudget > 0 ? formatCurrency(avgBudget, user?.preferences?.preferred_currency || 'INR') : '₹0'}
            </p>
            <span className="text-[10px] text-slate-500 font-medium">Per journey allocation</span>
          </div>
        </div>
      </div>

      {/* Active Trip Dynamic Experience Section */}
      {currentTrip && (
        <div className="space-y-6">
          <DynamicTripBanner
            onOpenStory={() => setIsStoryModalOpen(true)}
            onOpenBadges={() => setIsBadgesModalOpen(true)}
            onOpenDoctor={() => setIsDoctorModalOpen(true)}
            onOpenWhatIf={() => setIsWhatIfModalOpen(true)}
            onOpenPacking={() => setIsPackingModalOpen(true)}
            onOpenReservations={() => setIsReservationsModalOpen(true)}
            onOpenGroup={() => setIsGroupModalOpen(true)}
            onOpenNearby={() => setIsNearbyModalOpen(true)}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <UpNextCard />
            <DailyBriefingCard />
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-2xl w-full sm:w-auto border border-slate-200">
          {[
            { id: 'all', label: 'All Journeys' },
            { id: 'planned', label: 'Upcoming / Curated' },
            { id: 'completed', label: 'Past Journeys' },
          ].map((tab) => (
            <button
              type="button"
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition-all flex-1 sm:flex-initial ${
                activeTab === tab.id
                  ? 'bg-white text-slate-900 shadow-2xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by destination or title..."
            className="w-full pl-10 pr-4 py-2 rounded-2xl border border-slate-200 text-xs font-medium bg-white text-slate-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition-colors"
          />
        </div>
      </div>

      {/* Trips Grid */}
      {isLoading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-500 text-xs font-medium">Loading your journeys...</p>
        </div>
      ) : filteredTrips.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-4 shadow-xs flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-[#FAFAF8] text-slate-900 border border-slate-200 flex items-center justify-center p-2">
            <TravelWiseLogo variant="emblem" size="md" />
          </div>
          <h3 className="font-serif-title text-xl font-medium text-slate-900">No Journeys Found</h3>
          <p className="text-xs text-slate-500 font-light leading-relaxed">
            {searchQuery
              ? `No itineraries matching "${searchQuery}".`
              : 'You haven’t created any travel itineraries yet. Start planning your bespoke journey now.'}
          </p>
          <Link
            to="/create-trip"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-900 text-white font-medium text-xs shadow-xs hover:bg-slate-800 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#E5C365]" />
            <span>Curate Your First Journey</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrips.map((trip) => {
            const isCurrentlyActive = currentTrip?.id === trip.id;

            return (
              <div
                key={trip.id}
                onClick={() => navigate(`/trips/${trip.id}`)}
                className={`group bg-white rounded-3xl border overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col justify-between relative ${
                  isCurrentlyActive
                    ? 'border-slate-900 ring-2 ring-slate-900/10'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Image Cover */}
                <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                  <img
                    src={trip.cover_image}
                    alt={trip.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />

                  {/* Active Indicator Badge */}
                  {isCurrentlyActive && (
                    <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-slate-900 text-white text-[10px] tracking-wider uppercase font-medium flex items-center gap-1.5 shadow-md border border-white/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#E5C365] animate-pulse" />
                      <span>Active Focus</span>
                    </div>
                  )}

                  {/* Destination Tag on bottom of image */}
                  <div className="absolute bottom-3 left-4 right-4 text-white">
                    <span className="text-[10px] uppercase tracking-widest text-[#DFCA9B] font-medium">
                      {trip.destination_country || 'Destination'}
                    </span>
                    <h3 className="font-serif-title text-lg font-medium truncate text-white">{trip.title}</h3>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-2.5">
                    {/* Meta stats */}
                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-500">
                      <div className="flex items-center gap-1.5 font-light">
                        <Calendar className="w-3.5 h-3.5 text-slate-700 shrink-0" />
                        <span className="truncate">{trip.duration} Days</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-light">
                        <Users className="w-3.5 h-3.5 text-slate-700 shrink-0" />
                        <span className="truncate">
                          {trip.traveler_type || `${trip.travelers} Guests`}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                      <span className="text-slate-500 font-light">Est. Investment</span>
                      <span className="font-serif-title font-medium text-sm text-slate-900">
                        {formatCurrency(trip.total_budget, trip.currency)}
                      </span>
                    </div>

                    {/* Travel Style Tags */}
                    <div className="flex flex-wrap gap-1 pt-1">
                      {(trip.travel_style || []).slice(0, 3).map((st) => (
                        <span
                          key={st}
                          className="px-2 py-0.5 rounded-md bg-[#FAFAF8] text-[10px] font-medium text-slate-600 border border-slate-200"
                        >
                          {st}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Card Bottom Actions */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={(e) => handleSelectActiveTrip(e, trip)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                        isCurrentlyActive
                          ? 'bg-slate-900 text-white'
                          : 'bg-[#FAFAF8] hover:bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {isCurrentlyActive ? 'Current Focus' : 'Set as Focus'}
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => handleDuplicate(e, trip.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                        title="Duplicate Trip"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleDelete(e, trip.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete Trip"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Story Mode Modal */}
      <TripStoryModal
        isOpen={isStoryModalOpen}
        onClose={() => setIsStoryModalOpen(false)}
      />

      {/* Travel Badges Modal */}
      <TravelBadgesModal
        isOpen={isBadgesModalOpen}
        onClose={() => setIsBadgesModalOpen(false)}
      />

      {/* AI Trip Doctor Modal */}
      <AITripDoctorModal
        isOpen={isDoctorModalOpen}
        onClose={() => setIsDoctorModalOpen(false)}
      />

      {/* What-If Simulator Modal */}
      <WhatIfSimulatorModal
        isOpen={isWhatIfModalOpen}
        onClose={() => setIsWhatIfModalOpen(false)}
      />

      {/* Smart Packing Modal */}
      <SmartPackingModal
        isOpen={isPackingModalOpen}
        onClose={() => setIsPackingModalOpen(false)}
      />

      {/* Reservations Hub Modal */}
      <ReservationsHubModal
        isOpen={isReservationsModalOpen}
        onClose={() => setIsReservationsModalOpen(false)}
      />

      {/* Group Trip Modal */}
      <GroupTripModal
        isOpen={isGroupModalOpen}
        onClose={() => setIsGroupModalOpen(false)}
      />

      {/* Smart Nearby Modal */}
      <SmartNearbyModal
        isOpen={isNearbyModalOpen}
        onClose={() => setIsNearbyModalOpen(false)}
      />
    </div>
  );
};

