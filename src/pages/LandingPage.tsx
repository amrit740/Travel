import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { TravelWiseLogo } from '../components/common/TravelWiseLogo';
import {
  MapPin,
  Compass,
  ArrowRight,
  ShieldCheck,
  Globe,
  Star,
  Search,
  Check,
  Calendar,
  Wallet,
  Clock,
  Navigation,
  Sparkles,
  Users,
  Bot,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const CURATED_JOURNEYS = [
  {
    name: 'Goa',
    region: 'Coastal India',
    tagline: 'Secluded beaches, Portuguese heritage villas & coastal gastronomy',
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80',
    duration: '5 Days',
    style: 'Coastal & Heritage',
    fromCost: '₹32,000',
    highlight: 'Private spice estate & sunset cruise',
  },
  {
    name: 'Kerala',
    region: 'South India',
    tagline: 'Misty tea sanctuaries, emerald backwaters & serene Ayurvedic wellness retreats',
    image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80',
    duration: '6 Days',
    style: 'Slow Living & Nature',
    fromCost: '₹38,000',
    highlight: 'Heritage houseboat & cardamom hills',
  },
  {
    name: 'Darjeeling',
    region: 'Eastern Himalayas',
    tagline: 'Colonial tea estates, sunrise over Mt. Kanchenjunga & alpine train trails',
    image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80',
    duration: '4 Days',
    style: 'Mountain Serenity',
    fromCost: '₹26,000',
    highlight: 'Single-estate tea tastings & monastery walks',
  },
  {
    name: 'Jaipur',
    region: 'Rajasthan',
    tagline: 'Amber-hued palaces, royal astronomical observatories & artisanal textile bazaars',
    image: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1200&q=80',
    duration: '4 Days',
    style: 'Royal Heritage',
    fromCost: '₹28,500',
    highlight: 'Private heritage palace walk & courtyard dining',
  },
];

const PILLARS = [
  {
    title: 'Intelligent Itinerary Curation',
    description: 'Bespoke daily schedules mathematically balanced for travel pace, opening hours, and personal inclinations.',
    badge: 'Precision',
  },
  {
    title: 'Geographic Route Optimization',
    description: 'Every activity is clustered logically across districts to preserve your time and eliminate transit friction.',
    badge: 'Clarity',
  },
  {
    title: 'Real-Time Travel Concierge',
    description: 'An AI-powered companion aware of your active itinerary, nearby culinary spots, and unexpected weather changes.',
    badge: 'Composure',
  },
  {
    title: 'Balanced Budget Architecture',
    description: 'Complete transparency into lodging, transport, dining, and admission with real-time expense calibration.',
    badge: 'Control',
  },
];

export const LandingPage: React.FC = () => {
  const [searchDestination, setSearchDestination] = useState('');
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchDestination.trim()) {
      navigate(`/create-trip?destination=${encodeURIComponent(searchDestination.trim())}`);
    } else {
      navigate('/create-trip');
    }
  };

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      {/* 1. Hero Section - Classy, Modern, Editorial */}
      <section className="relative pt-4 sm:pt-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="relative rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 shadow-xl min-h-[520px] lg:min-h-[580px] flex items-center">
          {/* Subtle Background Photography */}
          <div className="absolute inset-0 z-0">
            <img
              src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2000&q=85"
              alt="Coastal Escape"
              className="w-full h-full object-cover object-center filter brightness-[0.75] transform scale-102 transition-transform duration-1000"
            />
            {/* Elegant dark slate gradient vignette */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/80 to-slate-900/40" />
            <div className="absolute inset-0 bg-radial-at-c from-transparent via-slate-950/30 to-slate-950/90" />
          </div>

          {/* Hero Content */}
          <div className="relative z-10 max-w-3xl px-6 sm:px-12 lg:px-16 py-14 space-y-7">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#E5C365] text-xs font-medium tracking-wide">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Intelligent Travel Planning</span>
              </div>

              <h1 className="font-serif-title text-3xl sm:text-5xl lg:text-6xl font-medium text-white tracking-tight leading-[1.1]">
                Travel smarter. <br />
                <span className="italic font-light text-slate-200">Experience more.</span>
              </h1>
            </div>

            <p className="text-sm sm:text-base text-slate-300 max-w-xl font-light leading-relaxed">
              Your intelligent companion for bespoke journeys across India. Thoughtfully curated itineraries, seamless pacing, and verified local discoveries.
            </p>

            {/* Concierge Search Bar */}
            <div className="space-y-3 pt-1">
              <form
                onSubmit={handleSearchSubmit}
                className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xl flex flex-col sm:flex-row items-center gap-2 max-w-xl"
              >
                <div className="flex items-center gap-3 px-3.5 py-2.5 w-full flex-1">
                  <MapPin className="w-5 h-5 text-slate-500 shrink-0" />
                  <input
                    type="text"
                    value={searchDestination}
                    onChange={(e) => setSearchDestination(e.target.value)}
                    placeholder="Where will you go? (e.g. Goa, Kerala, Jaipur...)"
                    className="w-full text-sm font-normal text-slate-900 placeholder:text-slate-400 bg-transparent outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs shadow-xs flex items-center justify-center gap-2 transition-all active:scale-98 shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#E5C365]" />
                  <span>Plan My Journey</span>
                </button>
              </form>

              {/* Popular Curations */}
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300 pt-1">
                <span className="font-medium text-slate-400">Popular:</span>
                {['Goa', 'Kerala', 'Darjeeling', 'Jaipur', 'Ladakh'].map((city) => (
                  <button
                    type="button"
                    key={city}
                    onClick={() => navigate(`/create-trip?destination=${city}`)}
                    className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/10 text-xs font-normal transition-colors"
                  >
                    {city}
                  </button>
                ))}
                <Link
                  to="/explore"
                  className="ml-auto text-xs text-slate-300 hover:text-white font-medium flex items-center gap-1 transition-colors"
                >
                  Explore India <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Featured Section - Journeys Worth Taking */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pb-4 border-b border-slate-200">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Curated Escapes</span>
            <h2 className="font-serif-title text-2xl sm:text-3xl text-slate-900">
              Journeys Worth Taking
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-light">
              Distinctive destinations crafted with thoughtful pacing and rich immersion.
            </p>
          </div>
          <Link
            to="/explore"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-900 hover:text-slate-700 transition-colors"
          >
            <span>View All Destinations</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {CURATED_JOURNEYS.map((journey) => (
            <div
              key={journey.name}
              className="group bg-white rounded-2xl overflow-hidden border border-slate-200/90 hover:border-slate-300 hover:shadow-lg transition-all duration-200 flex flex-col justify-between"
            >
              <div className="relative h-52 overflow-hidden">
                <img
                  src={journey.image}
                  alt={journey.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-slate-950/70 backdrop-blur-xs text-white text-[11px] font-medium border border-white/10">
                  {journey.duration}
                </div>
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <span className="text-[10px] uppercase tracking-wider text-slate-300 font-light block">
                    {journey.region}
                  </span>
                  <h3 className="font-serif-title text-xl font-medium text-white">{journey.name}</h3>
                </div>
              </div>

              <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                <p className="text-xs text-slate-600 font-light leading-relaxed">{journey.tagline}</p>

                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Style</span>
                    <span className="font-medium text-slate-800">{journey.style}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Est. Investment</span>
                    <span className="font-semibold text-slate-900">{journey.fromCost}</span>
                  </div>

                  <Link
                    to={`/create-trip?destination=${journey.name}`}
                    className="mt-2 w-full py-2 rounded-xl bg-[#FAFAF8] hover:bg-slate-900 hover:text-white text-slate-900 border border-slate-200 text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Plan This Journey</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. The TravelWise Standard - Clean White Cards (Anti-Green Slop) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <div className="lg:col-span-5 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-medium border border-slate-200">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>The TravelWise Standard</span>
              </div>
              <h2 className="font-serif-title text-2xl sm:text-4xl font-medium tracking-tight text-slate-900 leading-tight">
                Places worth discovering. <br />
                <span className="text-slate-500 italic font-normal">Moments designed to linger.</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 font-light leading-relaxed">
                TravelWise bypasses generic tourist checklists to curate exceptional heritage stays, scenic viewpoints, and authentic culinary spots tailored for memorable Indian journeys.
              </p>
              <div className="pt-2">
                <Link
                  to="/create-trip"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs transition-colors shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#E5C365]" />
                  <span>Begin Personal Curation</span>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {PILLARS.map((pillar, idx) => (
                <div
                  key={idx}
                  className="bg-[#FAFAF8] rounded-2xl p-5 border border-slate-200/80 space-y-2"
                >
                  <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-md bg-white text-slate-700 border border-slate-200 inline-block">
                    {pillar.badge}
                  </span>
                  <h3 className="text-sm font-semibold text-slate-900">{pillar.title}</h3>
                  <p className="text-xs text-slate-500 font-light leading-relaxed">{pillar.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. Editorial Invitation Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="bg-[#FAFAF8] rounded-3xl p-8 sm:p-14 border border-slate-200/90 shadow-2xs space-y-5 max-w-4xl mx-auto flex flex-col items-center">
          <TravelWiseLogo variant="emblem" size="md" />
          <div className="space-y-2">
            <h2 className="font-serif-title text-2xl sm:text-3xl text-slate-900 font-medium">
              Your next adventure is waiting.
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-light max-w-lg mx-auto leading-relaxed">
              Experience the tranquility of bespoke travel planning tailored precisely to your schedule,
              budget, and taste.
            </p>
          </div>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/create-trip"
              className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs shadow-xs transition-all active:scale-98 flex items-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#E5C365]" />
              <span>Plan My Journey</span>
            </Link>
            <Link
              to="/explore"
              className="px-5 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-medium text-xs border border-slate-200 transition-colors shadow-2xs"
            >
              <span>Explore Escapes</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
