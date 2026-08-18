import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { checkIsAdmin } from '../../lib/adminService';
import { TravelWiseLogo } from '../common/TravelWiseLogo';
import { Home, Compass, Luggage, Users, Sparkles, User, Shield } from 'lucide-react';

export const MobileNav: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const isAdmin = checkIsAdmin(user);

  const isActive = (path: string) => {
    if (path === '/' && location.pathname !== '/') return false;
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/80 px-2 py-1.5 shadow-lg no-print">
      <div className="flex items-center justify-around">
        <Link
          to="/"
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl text-[10px] font-medium transition-colors ${
            isActive('/') ? 'text-slate-900 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Home className="w-4 h-4" />
          <span>Home</span>
        </Link>

        <Link
          to="/explore"
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl text-[10px] font-medium transition-colors ${
            isActive('/explore') ? 'text-slate-900 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Explore</span>
        </Link>

        <Link
          to="/create-trip"
          className="flex flex-col items-center -mt-4 group"
          aria-label="Plan a new trip"
        >
          <div className="w-11 h-11 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-md active:scale-95 transition-transform border-2 border-white">
            <Sparkles className="w-5 h-5 text-[#E5C365]" />
          </div>
          <span className="text-[10px] font-semibold text-slate-900 mt-0.5">Plan</span>
        </Link>

        <Link
          to="/community"
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl text-[10px] font-medium transition-colors ${
            isActive('/community') ? 'text-slate-900 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Community</span>
        </Link>

        {isAuthenticated ? (
          <Link
            to="/dashboard"
            className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl text-[10px] font-medium transition-colors ${
              isActive('/dashboard') ? 'text-slate-900 font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Luggage className="w-4 h-4" />
            <span>Trips</span>
          </Link>
        ) : (
          <Link
            to="/login"
            className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl text-[10px] font-medium transition-colors ${
              isActive('/login') ? 'text-slate-900 font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Sign In</span>
          </Link>
        )}
      </div>
    </nav>
  );
};
