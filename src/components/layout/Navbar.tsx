import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useNetworkStatus } from '../../lib/offlineService';
import { NotificationCenter } from '../common/NotificationCenter';
import { TripFeedbackModal } from '../trip/TripFeedbackModal';
import { TravelWiseLogo } from '../common/TravelWiseLogo';
import { NavigationMenu } from './NavigationMenu';
import { GlobalSearchModal } from '../common/GlobalSearchModal';
import { GlobalAIChatModal } from '../common/GlobalAIChatModal';
import {
  MoreVertical,
  Search,
  Globe,
  Sparkles,
  User,
  LogOut,
  Luggage,
  Bookmark,
  FolderLock,
  Shield,
  Wifi,
  WifiOff,
  Bot,
} from 'lucide-react';
import { checkIsAdmin } from '../../lib/adminService';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { language, setLanguage, supportedLanguages } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const { isOnline, isSyncing } = useNetworkStatus();
  const isAdmin = checkIsAdmin(user);

  // Global keyboard shortcut for search (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = () => {
    logout();
    setIsProfileOpen(false);
    navigate('/');
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* LEFT: TravelWise Logo & Name */}
            <div className="flex items-center gap-4">
              <Link
                to="/"
                className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-slate-900 rounded-xl"
                aria-label="TravelWise Home"
              >
                <TravelWiseLogo variant="horizontal" size="sm" showTagline={false} />
              </Link>
            </div>

            {/* CENTER: Clean Minimal Space (Intentionally free of cluttered link rows) */}
            <div className="hidden lg:flex items-center justify-center flex-1" />

            {/* RIGHT: Search, Notifications, Profile, and ⋮ Three-dot Menu */}
            <div className="flex items-center gap-1.5 sm:gap-3">
              {/* Quick Search Trigger */}
              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                className="flex items-center gap-2 px-3 py-2 rounded-full bg-[#FAFAF8] hover:bg-slate-100 border border-slate-200/80 text-slate-500 hover:text-slate-900 text-xs font-medium transition-all group"
                aria-label="Search destinations (Ctrl+K)"
                title="Search destinations & stories (Ctrl+K)"
              >
                <Search className="w-4 h-4 text-slate-400 group-hover:text-slate-700" />
                <span className="hidden md:inline text-slate-500 font-normal">Search India...</span>
                <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[9px] font-semibold text-slate-400 bg-white rounded border border-slate-200">
                  ⌘K
                </kbd>
              </button>

              {/* Offline & Sync Status Indicator (Subtle) */}
              <div
                className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${
                  !isOnline
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : isSyncing
                    ? 'bg-sky-50 text-sky-800 border-sky-200'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-100'
                }`}
                title={!isOnline ? 'Offline Mode - Viewing cached vault' : 'Cloud Sync Active'}
              >
                {!isOnline ? (
                  <>
                    <WifiOff className="w-3 h-3 text-amber-600" />
                    <span>Offline</span>
                  </>
                ) : isSyncing ? (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-ping" />
                    <span>Syncing</span>
                  </>
                ) : (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                    <span className="hidden xl:inline">Live</span>
                  </>
                )}
              </div>

              {/* Language Selector Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsLangOpen(!isLangOpen)}
                  className="p-2 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center gap-1 text-xs font-semibold"
                  title="Switch Language"
                  aria-label="Language selection"
                >
                  <Globe className="w-4 h-4 text-slate-600" />
                  <span className="uppercase text-[11px] font-bold hidden sm:inline">{language}</span>
                </button>

                {isLangOpen && (
                  <div
                    className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 max-h-64 overflow-y-auto"
                    onMouseLeave={() => setIsLangOpen(false)}
                  >
                    <div className="px-3 py-1.5 border-b border-slate-100 text-[10px] uppercase font-bold text-slate-400">
                      Indian Languages
                    </div>
                    {supportedLanguages.map((lang) => (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => {
                          setLanguage(lang.code as any);
                          setIsLangOpen(false);
                        }}
                        className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between transition-colors ${
                          language === lang.code
                            ? 'bg-slate-100 text-slate-900 font-bold'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span>{lang.nativeName}</span>
                        <span className="text-[10px] text-slate-400">({lang.name})</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Notification Center */}
              <NotificationCenter />

              {/* Plan Trip Primary Action (Clean & Refined) */}
              <Link
                to="/create-trip"
                className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-all active:scale-98 shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#E5C365]" />
                <span>Plan Trip</span>
              </Link>

              {/* Profile Avatar or Auth Buttons */}
              {isAuthenticated && user ? (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-900"
                    aria-label="User account menu"
                  >
                    <img
                      src={
                        user.profile_image ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
                      }
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
                    />
                  </button>

                  {/* Profile Popover */}
                  {isProfileOpen && (
                    <div
                      className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50"
                      onMouseLeave={() => setIsProfileOpen(false)}
                    >
                      <div className="px-4 py-3 border-b border-slate-100">
                        <p className="text-xs font-semibold text-slate-900 truncate">{user.name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                      </div>

                      <Link
                        to="/dashboard"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors font-medium"
                      >
                        <Luggage className="w-4 h-4 text-slate-400" />
                        My Trips & Journeys
                      </Link>

                      <Link
                        to="/saved"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                      >
                        <Bookmark className="w-4 h-4 text-slate-400" />
                        Saved Places
                      </Link>

                      <Link
                        to="/files"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                      >
                        <FolderLock className="w-4 h-4 text-slate-400" />
                        My Vault & Documents
                      </Link>

                      <Link
                        to="/profile"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                      >
                        <User className="w-4 h-4 text-slate-400" />
                        Travel Preferences
                      </Link>

                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs text-amber-900 bg-amber-50/60 hover:bg-amber-50 font-semibold transition-colors"
                        >
                          <Shield className="w-4 h-4 text-[#C59B27]" />
                          Admin Console
                        </Link>
                      )}

                      <div className="border-t border-slate-100 my-1" />

                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-700 hover:bg-rose-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <Link
                    to="/login"
                    className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 transition-colors"
                  >
                    Log In
                  </Link>
                </div>
              )}

              {/* ⭐ THE THREE-DOT / MORE MENU (⋮) */}
              <button
                type="button"
                onClick={() => setIsMenuOpen(true)}
                className={`p-2.5 rounded-full border transition-all flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-slate-900 ${
                  isMenuOpen
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-[#FAFAF8] hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
                aria-label="Open TravelWise main menu (⋮)"
                aria-expanded={isMenuOpen}
                title="Open TravelWise Menu (⋮)"
              >
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Global Navigation Menu Popover / Slide-out */}
      <NavigationMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onOpenAssistant={() => setIsAssistantOpen(true)}
        onOpenFeedback={() => setIsFeedbackOpen(true)}
      />

      {/* Global Search Palette Modal (Cmd+K) */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      {/* Global TravelWise AI Concierge Modal */}
      <GlobalAIChatModal
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
      />

      {/* Global Feedback Modal */}
      <TripFeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
      />
    </>
  );
};
