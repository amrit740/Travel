import React, { useState } from 'react';
import {
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Share2,
  Printer,
  Copy,
  Edit3,
  CloudSun,
  Sparkles,
  Thermometer,
  Wind,
  Droplets,
} from 'lucide-react';
import { Trip, WeatherInfo } from '../../types';
import { formatCurrency, formatDate } from '../../lib/utils';

interface TripOverviewHeaderProps {
  trip: Trip;
  weather?: WeatherInfo;
  onShare: () => void;
  onDuplicate: () => void;
  onPrint: () => void;
  onEdit: () => void;
  readOnly?: boolean;
}

export const TripOverviewHeader: React.FC<TripOverviewHeaderProps> = ({
  trip,
  weather,
  onShare,
  onDuplicate,
  onPrint,
  onEdit,
  readOnly = false,
}) => {
  const [showWeatherDetail, setShowWeatherDetail] = useState(false);

  return (
    <div className="relative rounded-3xl overflow-hidden shadow-xl border border-[#C8A96B]/30 bg-[#0B3D2E] text-[#F7F5EF] mb-8">
      {/* Cover Image & Gradient Mask */}
      <div className="absolute inset-0 -z-10">
        <img
          src={
            trip.cover_image ||
            'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1600&q=80'
          }
          alt={trip.destination}
          className="w-full h-full object-cover object-center opacity-30 scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#071F18] via-[#0B3D2E]/85 to-[#0B3D2E]/40" />
      </div>

      <div className="p-6 sm:p-10 relative z-10 space-y-6">
        {/* Top Badges & Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#176B50] text-[#DFCA9B] text-xs font-medium tracking-wider uppercase border border-[#C8A96B]/30 shadow-xs">
              <MapPin className="w-3.5 h-3.5 text-[#C8A96B]" />
              {trip.destination}
            </span>

            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[#F7F5EF] text-xs font-light border border-white/15">
              <Calendar className="w-3.5 h-3.5 text-[#C8A96B]" />
              {trip.duration} Days ({formatDate(trip.start_date)} - {formatDate(trip.end_date)})
            </span>

            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[#F7F5EF] text-xs font-light border border-white/15">
              <Users className="w-3.5 h-3.5 text-[#C8A96B]" />
              {trip.travelers} {trip.travelers === 1 ? 'Guest' : 'Guests'} ({trip.traveler_type})
            </span>
          </div>

          {/* Quick Toolbar */}
          <div className="flex items-center gap-2 no-print">
            <button
              type="button"
              onClick={onShare}
              className="px-3.5 py-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-[#F7F5EF] text-xs font-medium transition-all flex items-center gap-1.5 border border-white/20 active:scale-95"
              title="Share Trip Link"
            >
              <Share2 className="w-3.5 h-3.5 text-[#DFCA9B]" />
              <span>Share</span>
            </button>

            <button
              type="button"
              onClick={onPrint}
              className="px-3.5 py-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-[#F7F5EF] text-xs font-medium transition-all flex items-center gap-1.5 border border-white/20 active:scale-95"
              title="Export / Print PDF Itinerary"
            >
              <Printer className="w-3.5 h-3.5 text-[#A2B3AA]" />
              <span className="hidden sm:inline">Export PDF</span>
            </button>

            {!readOnly && (
              <>
                <button
                  type="button"
                  onClick={onDuplicate}
                  className="px-3.5 py-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-[#F7F5EF] text-xs font-medium transition-all flex items-center gap-1.5 border border-white/20 active:scale-95 hidden sm:flex"
                  title="Duplicate Trip"
                >
                  <Copy className="w-3.5 h-3.5 text-[#A2B3AA]" />
                  <span>Duplicate</span>
                </button>

                <button
                  type="button"
                  onClick={onEdit}
                  className="px-4 py-2 rounded-full bg-[#C8A96B] hover:bg-[#B5965A] text-[#071F18] text-xs font-medium transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
                  title="Edit Trip Settings"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Details</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Trip Title & Summary */}
        <div className="space-y-2 max-w-3xl">
          <h1 className="font-serif-title text-3xl sm:text-5xl font-medium tracking-tight text-[#F7F5EF]">
            {trip.title}
          </h1>
          {trip.summary && (
            <p className="text-[#A2B3AA] text-xs sm:text-sm leading-relaxed max-w-2xl font-light">
              {trip.summary}
            </p>
          )}
        </div>

        {/* Bottom Highlights & Weather Card */}
        <div className="pt-4 border-t border-white/15 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Key Metrics Chips */}
          <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <span className="text-[#A2B3AA] font-light">Target Investment:</span>
              <span className="font-serif-title font-medium text-[#DFCA9B] text-base">
                {formatCurrency(trip.total_budget, trip.currency)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[#A2B3AA] font-light">Est. Total:</span>
              <span className="font-serif-title font-medium text-[#F7F5EF]">
                {formatCurrency(trip.estimated_cost || trip.total_budget, trip.currency)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[#A2B3AA] font-light">Travel Persona:</span>
              <span className="font-light text-[#F7F5EF]">
                {trip.travel_style?.slice(0, 3).join(', ')}
              </span>
            </div>
          </div>

          {/* Live Destination Weather Widget */}
          {weather && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowWeatherDetail(!showWeatherDetail)}
                className="bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl px-3.5 py-2 flex items-center gap-3 transition-colors text-left"
              >
                <div className="flex items-center gap-1.5 text-[#DFCA9B]">
                  <CloudSun className="w-5 h-5" />
                  <span className="font-serif-title font-medium text-base text-[#F7F5EF]">{weather.temperature}°C</span>
                </div>
                <div className="text-[11px] leading-tight">
                  <p className="font-medium text-[#F7F5EF]">{weather.condition}</p>
                  <p className="text-[#A2B3AA] font-light">{weather.destination}</p>
                </div>
              </button>

              {/* Weather Forecast Popover */}
              {showWeatherDetail && (
                <div
                  className="absolute right-0 bottom-full mb-2 w-64 bg-[#071F18]/95 backdrop-blur-xl border border-[#C8A96B]/40 rounded-2xl p-4 shadow-2xl z-50 text-xs"
                  onMouseLeave={() => setShowWeatherDetail(false)}
                >
                  <div className="flex items-center justify-between font-medium text-[#F7F5EF] mb-2 border-b border-white/10 pb-1.5">
                    <span>{weather.destination} Forecast</span>
                    <span className="text-[#DFCA9B]">{weather.condition}</span>
                  </div>
                  <p className="text-[#A2B3AA] font-light text-[11px] mb-3">{weather.description}</p>
                  <div className="space-y-1.5">
                    {weather.forecast?.map((f, i) => (
                      <div key={i} className="flex items-center justify-between text-[#E3E7E2] font-light">
                        <span>{f.day}</span>
                        <span className="text-[#A2B3AA]">{f.condition}</span>
                        <span className="font-medium text-[#DFCA9B]">{f.temp}°C</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
