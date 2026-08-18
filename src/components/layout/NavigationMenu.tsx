import React, { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../contexts/AuthContext';
import { checkIsAdmin } from '../../lib/adminService';
import { TravelWiseLogo } from '../common/TravelWiseLogo';
import {
  Home,
  Compass,
  Sparkles,
  Luggage,
  Bookmark,
  Users,
  FolderLock,
  BarChart3,
  User,
  Shield,
  LogOut,
  X,
  MessageSquareHeart,
  ChevronRight,
  Bot,
  MapPin,
  ExternalLink,
  Sliders,
} from 'lucide-react';

interface NavigationMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAssistant: () => void;
  onOpenFeedback: () => void;
}

export const NavigationMenu: React.FC<NavigationMenuProps> = ({
  isOpen,
  onClose,
  onOpenAssistant,
  onOpenFeedback,
}) => {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const menuRef = useRef<HTMLDivElement>(null);
  const isAdmin = checkIsAdmin(user);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const isActive = (path: string) => {
    if (path === '/' && location.pathname !== '/') return false;
    return location.pathname.startsWith(path);
  };

  const mainNavigation = [
    {
      name: 'Home',
      description: 'Curated escapes & featured journeys',
      path: '/',
      icon: Home,
    },
    {
      name: 'Explore India',
      description: 'States, hidden gems & destinations',
      path: '/explore',
      icon: Compass,
    },
    {
      name: 'Plan Trip',
      description: 'AI-assisted custom itinerary builder',
      path: '/create-trip',
      icon: Sparkles,
      highlight: true,
    },
    {
      name: 'Interactive Map',
      description: 'Discover landmarks & curated pins',
      path: '/explore?view=map',
      icon: MapPin,
    },
    {
      name: 'Community',
      description: 'Travel stories, itineraries & tips',
      path: '/community',
      icon: Users,
    },
  ];

  const personalNavigation = isAuthenticated
    ? [
        {
          name: 'My Trips',
          description: 'Active, upcoming & past journeys',
          path: '/dashboard',
          icon: Luggage,
        },
        {
          name: 'Saved & Bookmarks',
          description: 'Favorited destinations & spots',
          path: '/saved',
          icon: Bookmark,
        },
        {
          name: 'My Vault & Documents',
          description: 'Offline tickets, IDs & passes',
          path: '/files',
          icon: FolderLock,
        },
        {
          name: 'Travel Preferences',
          description: 'Pacing, dietary & style profile',
          path: '/profile',
          icon: User,
        },
      ]
    : [];

  const secondaryNavigation = [
    {
      name: 'Travel Insights',
      description: 'Platform metrics & destination trends',
      path: '/analytics',
      icon: BarChart3,
    },
    ...(isAdmin
      ? [
          {
            name: 'Admin Dashboard',
            description: 'Platform management & analytics',
            path: '/admin',
            icon: Shield,
            badge: 'Admin',
          },
        ]
      : []),
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true" aria-label="TravelWise Main Menu">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs"
            onClick={onClose}
          />

          {/* Slide-out Menu Panel */}
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              ref={menuRef}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="w-screen max-w-md bg-white border-l border-slate-200 shadow-2xl flex flex-col justify-between overflow-hidden"
            >
              {/* Header */}
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-[#FAFAF8]">
                <div className="flex items-center gap-3">
                  <TravelWiseLogo variant="horizontal" size="sm" showTagline={false} />
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-900"
                  aria-label="Close menu (Escape)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Navigation Body */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
                {/* AI Assistant Quick Trigger Banner */}
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenAssistant();
                  }}
                  className="w-full text-left p-3.5 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-md hover:shadow-lg transition-all group flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                      <Bot className="w-5 h-5 text-[#E5C365]" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                        <span>TravelWise Concierge</span>
                        <span className="text-[10px] px-1.5 py-0.2 bg-[#C59B27]/30 text-[#E5C365] rounded-md font-medium border border-[#C59B27]/40">
                          AI Assistant
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 font-light mt-0.5">
                        Ask questions, find spots, or adjust trips
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                </button>

                {/* Section: Main Travel Features */}
                <div>
                  <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-2 mb-2">
                    Discover & Explore
                  </h4>
                  <div className="space-y-1">
                    {mainNavigation.map((item) => {
                      const active = isActive(item.path);
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={onClose}
                          className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm transition-colors ${
                            active
                              ? 'bg-slate-100 text-slate-900 font-semibold'
                              : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <Icon
                              className={`w-4 h-4 shrink-0 ${
                                active ? 'text-slate-900' : 'text-slate-400'
                              }`}
                            />
                            <div className="truncate">
                              <span className="block text-xs font-medium leading-none mb-0.5">
                                {item.name}
                              </span>
                              <span className="block text-[11px] text-slate-400 font-light truncate">
                                {item.description}
                              </span>
                            </div>
                          </div>
                          {active && (
                            <span className="text-[10px] font-semibold text-slate-900 bg-slate-200 px-2 py-0.5 rounded-full shrink-0">
                              Active
                            </span>
                          )}
                          {!active && item.highlight && (
                            <span className="text-[10px] font-medium text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full shrink-0">
                              New Trip
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>

                {/* Section: Personal Workspace (Logged-in) */}
                {isAuthenticated && (
                  <div>
                    <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-2 mb-2">
                      My Workspace
                    </h4>
                    <div className="space-y-1">
                      {personalNavigation.map((item) => {
                        const active = isActive(item.path);
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.path}
                            to={item.path}
                            onClick={onClose}
                            className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm transition-colors ${
                              active
                                ? 'bg-slate-100 text-slate-900 font-semibold'
                                : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <Icon
                                className={`w-4 h-4 shrink-0 ${
                                  active ? 'text-slate-900' : 'text-slate-400'
                                }`}
                              />
                              <div className="truncate">
                                <span className="block text-xs font-medium leading-none mb-0.5">
                                  {item.name}
                                </span>
                                <span className="block text-[11px] text-slate-400 font-light truncate">
                                  {item.description}
                                </span>
                              </div>
                            </div>
                            {active && (
                              <span className="text-[10px] font-semibold text-slate-900 bg-slate-200 px-2 py-0.5 rounded-full shrink-0">
                                Active
                              </span>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Section: Platform & Insights */}
                <div>
                  <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-2 mb-2">
                    System & Tools
                  </h4>
                  <div className="space-y-1">
                    {secondaryNavigation.map((item) => {
                      const active = isActive(item.path);
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={onClose}
                          className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm transition-colors ${
                            active
                              ? 'bg-slate-100 text-slate-900 font-semibold'
                              : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <Icon
                              className={`w-4 h-4 shrink-0 ${
                                active ? 'text-slate-900' : 'text-slate-400'
                              }`}
                            />
                            <div className="truncate">
                              <span className="block text-xs font-medium leading-none mb-0.5">
                                {item.name}
                              </span>
                              <span className="block text-[11px] text-slate-400 font-light truncate">
                                {item.description}
                              </span>
                            </div>
                          </div>
                          {item.badge && (
                            <span className="text-[10px] font-semibold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-md shrink-0 border border-amber-200">
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      );
                    })}

                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenFeedback();
                      }}
                      className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <MessageSquareHeart className="w-4 h-4 text-slate-400 shrink-0" />
                        <div className="truncate">
                          <span className="block text-xs font-medium leading-none mb-0.5">
                            Feedback & Ratings
                          </span>
                          <span className="block text-[11px] text-slate-400 font-light truncate">
                            Share suggestions with our engineering team
                          </span>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              {/* Footer / Account Actions */}
              <div className="p-4 border-t border-slate-100 bg-[#FAFAF8] space-y-3">
                {isAuthenticated && user ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 px-2">
                      <img
                        src={
                          user.profile_image ||
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
                        }
                        alt={user.name}
                        className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-200"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-900 truncate">
                          {user.name}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        onClose();
                      }}
                      className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-medium text-rose-700 hover:bg-rose-50 border border-rose-100 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      to="/login"
                      onClick={onClose}
                      className="w-full text-center py-2.5 rounded-xl text-xs font-medium border border-slate-200 bg-white text-slate-900 hover:bg-slate-50 transition-colors shadow-2xs"
                    >
                      Log In
                    </Link>
                    <Link
                      to="/signup"
                      onClick={onClose}
                      className="w-full text-center py-2.5 rounded-xl text-xs font-medium bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-xs"
                    >
                      Join Free
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
