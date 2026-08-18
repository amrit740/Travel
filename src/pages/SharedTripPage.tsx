import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Sparkles, MapPin, Calendar, Users, DollarSign, Printer, Compass, Lightbulb } from 'lucide-react';
import { Trip } from '../types';
import { apiTrips } from '../services/api';
import { InteractiveMap } from '../components/trip/InteractiveMap';
import { ItineraryTimeline } from '../components/trip/ItineraryTimeline';
import { BudgetBreakdownCard } from '../components/trip/BudgetBreakdownCard';
import { formatCurrency, formatDate } from '../lib/utils';

export const SharedTripPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [weather, setWeather] = useState<any>(null);
  const [selectedDayNumber, setSelectedDayNumber] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchShared = async () => {
      if (!token) return;
      setIsLoading(true);
      try {
        const data = await apiTrips.getSharedTrip(token);
        setTrip(data.trip);
        setWeather(data.weather);
      } catch (err: any) {
        setError(err.message || 'Shared itinerary not found or has expired.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchShared();
  }, [token]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-10 h-10 rounded-full border-2 border-[#0B3D2E] border-t-transparent animate-spin mx-auto" />
        <p className="text-[#0B3D2E] font-serif-title text-xl font-medium">Curating shared journey itinerary...</p>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h3 className="font-serif-title text-2xl font-medium text-[#0B3D2E]">Itinerary Unavailable</h3>
        <p className="text-[#66736C] text-xs font-light">{error || 'This bespoke link may have expired or been revoked by the creator.'}</p>
        <Link
          to="/"
          className="inline-block px-6 py-2.5 rounded-full bg-[#0B3D2E] text-[#F7F5EF] font-medium text-xs tracking-wider uppercase shadow-xs hover:bg-[#176B50] transition-colors"
        >
          Explore Travel Wise
        </Link>
      </div>
    );
  }

  const currentDay =
    trip.itinerary_days?.find((d) => d.day_number === selectedDayNumber) || trip.itinerary_days?.[0];
  const activeActivities = currentDay?.activities || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Top Banner Notice */}
      <div className="bg-[#FAF9F5] border border-[#E3E7E2] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#0B3D2E] no-print">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#C8A96B]" />
          <span className="font-light">You are viewing a bespoke travel itinerary curated with <strong className="font-medium text-[#0B3D2E]">Travel Wise</strong>.</span>
        </div>
        <Link
          to={`/create-trip?destination=${trip.destination}`}
          className="px-4 py-1.5 rounded-full bg-[#0B3D2E] text-[#F7F5EF] font-medium text-xs tracking-wider uppercase hover:bg-[#176B50] transition-colors shadow-xs"
        >
          Craft Your Journey
        </Link>
      </div>

      {/* Hero Header */}
      <div className="relative rounded-3xl overflow-hidden shadow-xl border border-[#C8A96B]/30 bg-[#0B3D2E] text-[#F7F5EF] p-6 sm:p-10">
        <div className="absolute inset-0 -z-10">
          <img
            src={trip.cover_image || 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1600&q=80'}
            alt={trip.destination}
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#071F18] via-[#0B3D2E]/85 to-[#0B3D2E]/40" />
        </div>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-[#176B50] text-[#DFCA9B] text-xs font-medium uppercase tracking-wider border border-[#C8A96B]/30">
              {trip.destination}
            </span>
            <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[#F7F5EF] text-xs font-light border border-white/15">
              {trip.duration} Days ({formatDate(trip.start_date)} - {formatDate(trip.end_date)})
            </span>
          </div>

          <h1 className="font-serif-title text-3xl sm:text-5xl font-medium text-[#F7F5EF]">
            {trip.title}
          </h1>
          {trip.summary && <p className="text-[#A2B3AA] text-xs sm:text-sm font-light max-w-2xl">{trip.summary}</p>}

          <div className="pt-4 border-t border-white/15 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-4 text-[#A2B3AA] font-light">
              <span>Guests: <strong className="text-[#F7F5EF] font-medium">{trip.travelers} ({trip.traveler_type})</strong></span>
              <span>Target Investment: <strong className="text-[#DFCA9B] font-medium">{formatCurrency(trip.total_budget, trip.currency)}</strong></span>
            </div>

            <button
              type="button"
              onClick={() => window.print()}
              className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-[#F7F5EF] text-xs font-medium flex items-center gap-1.5 border border-white/20 no-print transition-all"
            >
              <Printer className="w-3.5 h-3.5 text-[#A2B3AA]" />
              <span>Export PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Timeline and Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7">
          <ItineraryTimeline
            days={trip.itinerary_days || []}
            selectedDayNumber={selectedDayNumber}
            onSelectDay={setSelectedDayNumber}
            currency={trip.currency}
            onAddActivity={() => {}}
            onEditActivity={() => {}}
            onDeleteActivity={() => {}}
            onRegenerateActivity={() => {}}
            onRegenerateDay={() => {}}
            readOnly
          />
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl border border-[#E3E7E2] p-5 shadow-xs space-y-3">
            <h3 className="font-serif-title text-base font-medium text-[#0B3D2E] flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#C8A96B]" />
              Day {selectedDayNumber} Waypoint Map
            </h3>
            <InteractiveMap activities={activeActivities} destination={trip.destination} className="h-[360px]" />
          </div>

          {trip.budget_breakdown && (
            <BudgetBreakdownCard
              breakdown={trip.budget_breakdown}
              targetBudget={trip.total_budget}
              currency={trip.currency}
            />
          )}
        </div>
      </div>
    </div>
  );
};
