import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  MapPin,
  Calendar,
  AlertCircle,
  Lightbulb,
  Share2,
  Printer,
  ChevronRight,
  Plus,
  Compass,
  Radio,
  Sliders,
  Route,
  Zap,
  ShieldAlert,
  DollarSign,
  MessageSquareHeart,
  Luggage,
  Stethoscope,
  SlidersHorizontal,
  Ticket,
  Users,
} from 'lucide-react';
import { Trip, Activity, Place, TripShare } from '../types';
import { apiTrips } from '../services/api';
import { useCurrentTrip } from '../contexts/TripContext';
import { TripOverviewHeader } from '../components/trip/TripOverviewHeader';
import { InteractiveMap } from '../components/trip/InteractiveMap';
import { ItineraryTimeline } from '../components/trip/ItineraryTimeline';
import { BudgetBreakdownCard } from '../components/trip/BudgetBreakdownCard';
import { RecommendationsGrid } from '../components/trip/RecommendationsGrid';
import { AIChatDrawer } from '../components/trip/AIChatDrawer';
import { AddActivityModal } from '../components/trip/AddActivityModal';
import { EditActivityModal } from '../components/trip/EditActivityModal';
import { ShareTripModal } from '../components/trip/ShareTripModal';
import { DynamicTripBanner } from '../components/trip/DynamicTripBanner';
import { UpNextCard } from '../components/trip/UpNextCard';
import { DailyBriefingCard } from '../components/trip/DailyBriefingCard';
import { LiveTripModeView } from '../components/trip/LiveTripModeView';
import { TripStoryModal } from '../components/trip/TripStoryModal';
import { TravelBadgesModal } from '../components/trip/TravelBadgesModal';
import { NearbyDiscoveryCarousel } from '../components/trip/NearbyDiscoveryCarousel';
import { SafetyCenterModal } from '../components/trip/SafetyCenterModal';
import { ExpenseTrackerModal } from '../components/trip/ExpenseTrackerModal';
import { TripFeedbackModal } from '../components/trip/TripFeedbackModal';
import { SmartPackingModal } from '../components/trip/SmartPackingModal';
import { AITripDoctorModal } from '../components/trip/AITripDoctorModal';
import { WhatIfSimulatorModal } from '../components/trip/WhatIfSimulatorModal';
import { ReservationsHubModal } from '../components/trip/ReservationsHubModal';
import { GroupTripModal } from '../components/trip/GroupTripModal';
import { SmartOptimizerModal } from '../components/trip/SmartOptimizerModal';
import { LiveAdaptationAlert } from '../components/trip/LiveAdaptationAlert';
import { EcoScoreModal } from '../components/trip/EcoScoreModal';
import { AccessibilityModal } from '../components/trip/AccessibilityModal';
import { LocalFoodModal } from '../components/trip/LocalFoodModal';
import { PostTripReportModal } from '../components/trip/PostTripReportModal';
import {
  Leaf,
  Utensils,
  Accessibility as AccessibilityIcon,
  BarChart3 as BarChartIcon,
} from 'lucide-react';
import { formatCurrency } from '../lib/utils';

export const TripDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    currentTrip,
    setCurrentTrip,
    liveState,
    setLiveMode,
    selectedDayNumber,
    setSelectedDayNumber,
    optimizeRouteForDay,
    addSpotToDay,
  } = useCurrentTrip();

  const [weather, setWeather] = useState<any>(null);
  const [shareInfo, setShareInfo] = useState<TripShare | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Active Map Focus
  const [selectedActivityId, setSelectedActivityId] = useState<string | undefined>();

  // Modals state
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  const [isBadgesModalOpen, setIsBadgesModalOpen] = useState(false);
  const [isSafetyModalOpen, setIsSafetyModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isPackingModalOpen, setIsPackingModalOpen] = useState(false);
  const [isDoctorModalOpen, setIsDoctorModalOpen] = useState(false);
  const [isWhatIfModalOpen, setIsWhatIfModalOpen] = useState(false);
  const [isReservationsModalOpen, setIsReservationsModalOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isOptimizerOpen, setIsOptimizerOpen] = useState(false);
  const [isEcoModalOpen, setIsEcoModalOpen] = useState(false);
  const [isAccessibilityModalOpen, setIsAccessibilityModalOpen] = useState(false);
  const [isFoodModalOpen, setIsFoodModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const [addDayId, setAddDayId] = useState<string>('');
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);

  // Regeneration loading flags
  const [isRegeneratingActivityId, setIsRegeneratingActivityId] = useState<string | null>(null);
  const [isRegeneratingDayId, setIsRegeneratingDayId] = useState<string | null>(null);
  const [isOptimizingBudget, setIsOptimizingBudget] = useState(false);
  const [isOptimizingRoute, setIsOptimizingRoute] = useState(false);

  const fetchTripDetails = async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiTrips.getById(id);
      setCurrentTrip(data);
      setWeather(data.weather);
      setShareInfo(data.shareInfo || null);
    } catch (err: any) {
      setError(err.message || 'Failed to load trip.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTripDetails();
  }, [id]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-10 h-10 rounded-full border-2 border-[#0B3D2E] border-t-transparent animate-spin mx-auto" />
        <h3 className="font-serif-title text-xl font-medium text-[#0B3D2E]">Curating your bespoke itinerary...</h3>
      </div>
    );
  }

  if (error || !currentTrip) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-[#F7F5EF] text-[#0B3D2E] border border-[#E3E7E2] flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8 text-[#C8A96B]" />
        </div>
        <h3 className="font-serif-title text-2xl font-medium text-[#0B3D2E]">Journey Not Found</h3>
        <p className="text-[#66736C] text-xs font-light">{error || 'This itinerary may have been relocated or archived.'}</p>
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="px-6 py-2.5 rounded-full bg-[#0B3D2E] text-[#F7F5EF] text-xs uppercase tracking-wider font-medium shadow-xs hover:bg-[#176B50] transition-colors"
        >
          Return to Concierge Hub
        </button>
      </div>
    );
  }

  const currentDay =
    currentTrip.itinerary_days?.find((d) => d.day_number === selectedDayNumber) ||
    currentTrip.itinerary_days?.[0];
  const activeActivities = currentDay?.activities || [];

  // Handle Add Activity
  const handleOpenAddModal = (dayId: string) => {
    setAddDayId(dayId);
    setIsAddModalOpen(true);
  };

  const handleAddActivitySubmit = async (activityData: Partial<Activity>) => {
    if (!addDayId) return;
    try {
      const res = await apiTrips.addActivity(currentTrip.id, addDayId, activityData);
      setCurrentTrip(res.trip);
    } catch (err: any) {
      alert(err.message || 'Failed to add activity.');
    }
  };

  // Handle Edit Activity
  const handleSaveActivity = async (updated: Partial<Activity>) => {
    if (!editingActivity) return;
    try {
      await apiTrips.updateActivity(editingActivity.id, updated);
      await fetchTripDetails();
    } catch (err: any) {
      alert(err.message || 'Failed to update activity.');
    }
  };

  // Handle Delete Activity
  const handleDeleteActivity = async (activityId: string) => {
    try {
      await apiTrips.deleteActivity(activityId);
      await fetchTripDetails();
    } catch (err: any) {
      alert(err.message || 'Failed to delete activity.');
    }
  };

  // Handle Regenerate Activity
  const handleRegenerateActivity = async (activityId: string, dayTitle: string) => {
    setIsRegeneratingActivityId(activityId);
    try {
      const res = await apiTrips.regenerateActivity(currentTrip.id, { activityId, dayTitle });
      setCurrentTrip(res.trip);
    } catch (err: any) {
      alert(err.message || 'Failed to regenerate activity.');
    } finally {
      setIsRegeneratingActivityId(null);
    }
  };

  // Handle Regenerate Day
  const handleRegenerateDay = async (dayId: string, dayNumber: number) => {
    setIsRegeneratingDayId(dayId);
    try {
      const res = await apiTrips.regenerateDay(currentTrip.id, { dayId, dayNumber });
      setCurrentTrip(res.trip);
    } catch (err: any) {
      alert(err.message || 'Failed to regenerate day.');
    } finally {
      setIsRegeneratingDayId(null);
    }
  };

  // Handle Reordering activities
  const handleReorderActivities = (dayId: string, newActivities: Activity[]) => {
    if (!currentTrip.itinerary_days) return;
    const updatedDays = currentTrip.itinerary_days.map((d) =>
      d.id === dayId ? { ...d, activities: newActivities } : d
    );
    setCurrentTrip({ ...currentTrip, itinerary_days: updatedDays });
  };

  // Handle Budget Optimization
  const handleOptimizeBudget = async () => {
    setIsOptimizingBudget(true);
    try {
      const res = await apiTrips.optimizeBudget(currentTrip.id);
      setCurrentTrip(res.trip);
    } catch (err: any) {
      alert(err.message || 'Failed to optimize budget.');
    } finally {
      setIsOptimizingBudget(false);
    }
  };

  // Handle Route Optimization for active day
  const handleOptimizeRoute = async () => {
    if (!currentDay) return;
    setIsOptimizingRoute(true);
    await optimizeRouteForDay(currentDay.id);
    setIsOptimizingRoute(false);
  };

  // Handle Duplicate Trip
  const handleDuplicateTrip = async () => {
    try {
      const dup = await apiTrips.duplicate(currentTrip.id);
      navigate(`/trips/${dup.id}`);
    } catch (err: any) {
      alert(err.message || 'Failed to duplicate trip.');
    }
  };

  // Handle Print PDF
  const handlePrint = () => {
    window.print();
  };

  const isLive = liveState.currentMode === 'live';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8">
      {/* Dynamic Trip Status & Mode Banner */}
      <DynamicTripBanner
        onOpenStory={() => setIsStoryModalOpen(true)}
        onOpenBadges={() => setIsBadgesModalOpen(true)}
      />

      {/* Quick Concierge Toolbar (Safety, Expense, Packing, Doctor, Feedback, etc.) */}
      <div className="flex items-center justify-between gap-3 overflow-x-auto pb-2 scrollbar-thin">
        {/* Mode Switcher Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200 shrink-0">
          <button
            type="button"
            onClick={() => setLiveMode('planning')}
            className={`py-2 px-3.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
              !isLive
                ? 'bg-white text-slate-900 shadow-2xs border border-slate-200 font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Itinerary</span>
          </button>

          <button
            type="button"
            onClick={() => setLiveMode('live')}
            className={`py-2 px-3.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
              isLive
                ? 'bg-slate-900 text-white shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-[#E5C365]" />
            <span>Live Travel Mode</span>
          </button>
        </div>

        {/* Feature Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsOptimizerOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium shadow-xs flex items-center gap-1.5 transition-all"
            title="Smart Route, Timing & Transit Optimizer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#E5C365]" />
            <span>Optimize Trip</span>
          </button>

          <button
            type="button"
            onClick={() => setIsFoodModalOpen(true)}
            className="px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium border border-slate-200 flex items-center gap-1.5 transition-colors"
            title="Authentic local dishes & verified culinary spots"
          >
            <Utensils className="w-3.5 h-3.5 text-amber-600" />
            <span>Local Food</span>
          </button>

          <button
            type="button"
            onClick={() => setIsEcoModalOpen(true)}
            className="px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium border border-slate-200 flex items-center gap-1.5 transition-colors"
            title="Sustainability rating & eco carbon insights"
          >
            <Leaf className="w-3.5 h-3.5 text-teal-600" />
            <span>Eco Score</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAccessibilityModalOpen(true)}
            className="px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium border border-slate-200 flex items-center gap-1.5 transition-colors"
            title="Wheelchair, step-free & mobility filters"
          >
            <AccessibilityIcon className="w-3.5 h-3.5 text-indigo-600" />
            <span>Accessibility</span>
          </button>

          <button
            type="button"
            onClick={() => setIsReportModalOpen(true)}
            className="px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium border border-slate-200 flex items-center gap-1.5 transition-colors"
            title="Post-Journey Executive Briefing & Stats"
          >
            <BarChartIcon className="w-3.5 h-3.5 text-slate-600" />
            <span>Travel Report</span>
          </button>

          <button
            type="button"
            onClick={() => setIsSafetyModalOpen(true)}
            className="px-3 py-2 rounded-xl bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-700 text-xs font-medium border border-slate-200 flex items-center gap-1.5 transition-colors"
            title="Safety guidelines, emergency contacts & hospitals"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
            <span>Safety Hub</span>
          </button>

          <button
            type="button"
            onClick={() => setIsExpenseModalOpen(true)}
            className="px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium border border-slate-200 flex items-center gap-1.5 transition-colors"
            title="Live budget & expense ledger"
          >
            <DollarSign className="w-3.5 h-3.5 text-slate-600" />
            <span>Expense Ledger</span>
          </button>

          <button
            type="button"
            onClick={() => setIsPackingModalOpen(true)}
            className="px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium border border-slate-200 flex items-center gap-1.5 transition-colors"
            title="Weather-aware smart packing checklist"
          >
            <Luggage className="w-3.5 h-3.5 text-slate-600" />
            <span>Smart Packing</span>
          </button>

          <button
            type="button"
            onClick={() => setIsDoctorModalOpen(true)}
            className="px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium border border-slate-200 flex items-center gap-1.5 transition-colors"
            title="AI Health diagnosis & balance score for this trip"
          >
            <Stethoscope className="w-3.5 h-3.5 text-slate-600" />
            <span>Trip Doctor</span>
          </button>

          <button
            type="button"
            onClick={() => setIsWhatIfModalOpen(true)}
            className="px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium border border-slate-200 flex items-center gap-1.5 transition-colors"
            title="Simulate budget & duration trade-offs"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-600" />
            <span>What-If</span>
          </button>

          <button
            type="button"
            onClick={() => setIsReservationsModalOpen(true)}
            className="px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium border border-slate-200 flex items-center gap-1.5 transition-colors"
            title="Store tickets & booking confirmations"
          >
            <Ticket className="w-3.5 h-3.5 text-slate-600" />
            <span>Bookings</span>
          </button>

          <button
            type="button"
            onClick={() => setIsGroupModalOpen(true)}
            className="px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium border border-slate-200 flex items-center gap-1.5 transition-colors"
            title="Invite travel companions & vote on activities"
          >
            <Users className="w-3.5 h-3.5 text-slate-600" />
            <span>Group Collab</span>
          </button>

          <button
            type="button"
            onClick={() => setIsFeedbackModalOpen(true)}
            className="px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium border border-slate-200 flex items-center gap-1.5 transition-colors"
            title="Rate itinerary & send feedback"
          >
            <MessageSquareHeart className="w-3.5 h-3.5 text-slate-600" />
            <span>Rate Trip</span>
          </button>
        </div>
      </div>

      {/* If Live Mode is ON, render full Live View */}
      {isLive ? (
        <LiveTripModeView onOpenAIChat={() => {}} />
      ) : (
        <>
          {/* Overview Hero Header */}
          <TripOverviewHeader
            trip={currentTrip}
            weather={weather}
            onShare={() => setIsShareModalOpen(true)}
            onDuplicate={handleDuplicateTrip}
            onPrint={handlePrint}
            onEdit={() => navigate(`/trips/${currentTrip.id}/edit`)}
          />

          {/* Quick Cards: Up Next Card & Daily Briefing Card */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <UpNextCard onAskAI={(act) => setSelectedActivityId(act.id)} />
            <DailyBriefingCard />
          </div>

          {/* Travel Tips Banner */}
          {currentTrip.travel_tips && currentTrip.travel_tips.length > 0 && (
            <div className="bg-[#FAFAF8] border border-slate-200 rounded-3xl p-6 sm:p-7 space-y-3 no-print">
              <div className="flex items-center gap-2 text-slate-900 font-medium text-sm">
                <Lightbulb className="w-4 h-4 text-[#C59B27]" />
                <span className="font-serif-title text-base">TravelWise Concierge Tips for {currentTrip.destination}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {currentTrip.travel_tips.map((tip, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-slate-600 font-light leading-relaxed">
                    <span className="font-bold text-[#C59B27]">•</span>
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Live Trip Adaptation Alert */}
          <LiveAdaptationAlert
            trip={currentTrip}
            onTripUpdated={(updated) => setCurrentTrip(updated)}
          />

          {/* Main Grid: Left Timeline, Right Map & Budget */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Itinerary Timeline */}
            <div className="lg:col-span-7 space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="font-serif-title text-2xl font-medium text-slate-900">
                  Curated Day Schedule
                </h3>

                {currentDay && (
                  <button
                    type="button"
                    onClick={handleOptimizeRoute}
                    disabled={isOptimizingRoute}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white hover:bg-slate-50 text-slate-900 text-xs font-medium border border-slate-200 shadow-2xs transition-all active:scale-95"
                    title="Sort activities by geographic proximity to minimize transit time"
                  >
                    <Route className={`w-3.5 h-3.5 text-[#C59B27] ${isOptimizingRoute ? 'animate-spin' : ''}`} />
                    <span>{isOptimizingRoute ? 'Optimizing...' : 'Optimize Day Route'}</span>
                  </button>
                )}
              </div>

              <ItineraryTimeline
                days={currentTrip.itinerary_days || []}
                selectedDayNumber={selectedDayNumber}
                onSelectDay={setSelectedDayNumber}
                currency={currentTrip.currency}
                onAddActivity={handleOpenAddModal}
                onEditActivity={setEditingActivity}
                onDeleteActivity={handleDeleteActivity}
                onRegenerateActivity={handleRegenerateActivity}
                onRegenerateDay={handleRegenerateDay}
                onReorderActivities={handleReorderActivities}
                onFocusMapPin={(act) => setSelectedActivityId(act.id)}
                isRegeneratingActivityId={isRegeneratingActivityId}
                isRegeneratingDayId={isRegeneratingDayId}
              />
            </div>

            {/* Right Column: Interactive Map & Budget Analytics */}
            <div className="lg:col-span-5 space-y-8">
              {/* Day Interactive Route Map */}
              <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif-title text-base font-medium text-slate-900 flex items-center gap-2">
                    <Compass className="w-4 h-4 text-[#C59B27]" />
                    Day {selectedDayNumber} Waypoint Map
                  </h3>
                  <span className="text-xs font-light text-slate-500">
                    {activeActivities.length} Waypoints
                  </span>
                </div>

                <InteractiveMap
                  activities={activeActivities}
                  destination={currentTrip.destination}
                  selectedActivityId={selectedActivityId}
                  onSelectActivity={(act) => setSelectedActivityId(act.id)}
                  className="h-[360px]"
                />
              </div>

              {/* Budget Breakdown Donut Chart */}
              {currentTrip.budget_breakdown && (
                <BudgetBreakdownCard
                  breakdown={currentTrip.budget_breakdown}
                  targetBudget={currentTrip.total_budget}
                  currency={currentTrip.currency}
                  onOptimize={handleOptimizeBudget}
                  isOptimizing={isOptimizingBudget}
                />
              )}
            </div>
          </div>

          {/* Bottom Section: Destination Recommendations Grid */}
          <NearbyDiscoveryCarousel />
        </>
      )}

      {/* Floating AI Chat Assistant Drawer */}
      <AIChatDrawer trip={currentTrip} onTripUpdated={setCurrentTrip} />

      {/* Add Activity Modal */}
      <AddActivityModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddActivitySubmit}
        dayNumber={selectedDayNumber}
      />

      {/* Edit Activity Modal */}
      <EditActivityModal
        isOpen={Boolean(editingActivity)}
        activity={editingActivity}
        onClose={() => setEditingActivity(null)}
        onSave={handleSaveActivity}
        onDelete={handleDeleteActivity}
      />

      {/* Share Trip Modal */}
      <ShareTripModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        trip={currentTrip}
        shareInfo={shareInfo}
        onShareUpdated={setShareInfo}
      />

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

      {/* Safety & Emergency Center Modal */}
      <SafetyCenterModal
        isOpen={isSafetyModalOpen}
        onClose={() => setIsSafetyModalOpen(false)}
        trip={currentTrip}
      />

      {/* Budget & Expense Tracker Modal */}
      <ExpenseTrackerModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        trip={currentTrip}
      />

      {/* Trip Feedback & Rating Modal */}
      <TripFeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        trip={currentTrip}
      />

      {/* Smart Packing Modal */}
      <SmartPackingModal
        isOpen={isPackingModalOpen}
        onClose={() => setIsPackingModalOpen(false)}
      />

      {/* AITripDoctorModal */}
      <AITripDoctorModal
        isOpen={isDoctorModalOpen}
        onClose={() => setIsDoctorModalOpen(false)}
      />

      {/* WhatIfSimulatorModal */}
      <WhatIfSimulatorModal
        isOpen={isWhatIfModalOpen}
        onClose={() => setIsWhatIfModalOpen(false)}
      />

      {/* ReservationsHubModal */}
      <ReservationsHubModal
        isOpen={isReservationsModalOpen}
        onClose={() => setIsReservationsModalOpen(false)}
      />

      {/* GroupTripModal */}
      <GroupTripModal
        isOpen={isGroupModalOpen}
        onClose={() => setIsGroupModalOpen(false)}
      />

      {/* SmartOptimizerModal */}
      <SmartOptimizerModal
        isOpen={isOptimizerOpen}
        onClose={() => setIsOptimizerOpen(false)}
        trip={currentTrip}
        onTripUpdated={(updated) => setCurrentTrip(updated)}
      />

      {/* EcoScoreModal */}
      <EcoScoreModal
        isOpen={isEcoModalOpen}
        onClose={() => setIsEcoModalOpen(false)}
        trip={currentTrip}
      />

      {/* AccessibilityModal */}
      <AccessibilityModal
        isOpen={isAccessibilityModalOpen}
        onClose={() => setIsAccessibilityModalOpen(false)}
        trip={currentTrip}
      />

      {/* LocalFoodModal */}
      <LocalFoodModal
        isOpen={isFoodModalOpen}
        onClose={() => setIsFoodModalOpen(false)}
        trip={currentTrip}
      />

      {/* PostTripReportModal */}
      <PostTripReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        trip={currentTrip}
      />
    </div>
  );
};
