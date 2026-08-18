import React from 'react';
import { Link } from 'react-router-dom';
import { TravelWiseLogo } from '../common/TravelWiseLogo';
import { Globe, Compass, Shield, MapPin, Sparkles, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-900 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Col 1: Brand & Tagline */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-block focus:outline-none">
              <TravelWiseLogo variant="horizontal" size="md" theme="dark" showTagline />
            </Link>
            <p className="text-xs sm:text-sm text-slate-400 max-w-sm leading-relaxed font-light">
              Travel smarter. Experience more. Intelligent travel planning for curated Indian journeys with tailored itineraries, interactive maps, and community stories.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-2 text-xs text-slate-400">
              <span className="inline-flex items-center gap-1.5 bg-slate-900 px-3 py-1 rounded-full text-[#E5C365] border border-slate-800">
                <Sparkles className="w-3.5 h-3.5" /> AI Concierge
              </span>
              <span className="inline-flex items-center gap-1.5 bg-slate-900 px-3 py-1 rounded-full text-slate-300 border border-slate-800">
                <Globe className="w-3.5 h-3.5 text-slate-400" /> Pan-India Discovery
              </span>
            </div>
          </div>

          {/* Col 2: Top Destinations */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-4">
              Explore India
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link to="/explore?dest=Goa" className="hover:text-white transition-colors">
                  Goa • Coastal Escapes
                </Link>
              </li>
              <li>
                <Link to="/explore?dest=Kerala" className="hover:text-white transition-colors">
                  Kerala • Backwaters & Tea
                </Link>
              </li>
              <li>
                <Link to="/explore?dest=Darjeeling" className="hover:text-white transition-colors">
                  Darjeeling • Eastern Himalayas
                </Link>
              </li>
              <li>
                <Link to="/explore?dest=Jaipur" className="hover:text-white transition-colors">
                  Jaipur • Royal Heritage
                </Link>
              </li>
              <li>
                <Link to="/explore?dest=Ladakh" className="hover:text-white transition-colors">
                  Ladakh • High Passes
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Features */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-4">
              Platform
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link to="/create-trip" className="hover:text-white transition-colors">
                  Plan Trip
                </Link>
              </li>
              <li>
                <Link to="/explore" className="hover:text-white transition-colors">
                  Explore Destinations
                </Link>
              </li>
              <li>
                <Link to="/community" className="hover:text-white transition-colors">
                  Traveler Community
                </Link>
              </li>
              <li>
                <Link to="/saved" className="hover:text-white transition-colors">
                  Saved Bookmarks
                </Link>
              </li>
              <li>
                <Link to="/analytics" className="hover:text-white transition-colors">
                  Travel Insights
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Quick Start */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-4">
              Start Exploring
            </h4>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed font-light">
              Craft your next adventure with personalized pacing, smart routes, and live budgets.
            </p>
            <Link
              to="/create-trip"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-950 text-xs font-semibold transition-colors shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Plan My Journey</span>
            </Link>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} TravelWise. Plan less. Discover more.</p>
          <div className="flex items-center gap-4">
            <span>Built for modern travelers</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
