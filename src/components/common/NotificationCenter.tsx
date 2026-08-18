import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Sparkles,
  AlertTriangle,
  CloudRain,
  DollarSign,
  Luggage,
  Info,
  X,
  Heart,
  MessageSquare,
  UserPlus,
  Compass,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { CommunityService } from '../../services/communityService';
import { CommunityNotification } from '../../types';

export interface InAppNotification {
  id: string;
  title: string;
  message: string;
  type: 'trip' | 'budget' | 'weather' | 'system' | 'recommendation' | 'like' | 'comment' | 'follow' | 'reply';
  read: boolean;
  timestamp: string;
  link?: string;
  actor_image?: string;
}

const STORAGE_NOTIF_KEY = 'travelwise_notifications_v1';

export const NotificationCenter: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [localNotifications, setLocalNotifications] = useState<InAppNotification[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_NOTIF_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return [
      {
        id: 'notif-1',
        title: 'Welcome to TravelWise Concierge ✨',
        message: 'Your bespoke AI travel itinerary and offline vault are active and synchronized.',
        type: 'system',
        read: false,
        timestamp: new Date().toISOString(),
      },
      {
        id: 'notif-2',
        title: 'Weather Advisory',
        message: 'Pack a light layer: evening breezes and mild tropical temperatures expected across India.',
        type: 'weather',
        read: false,
        timestamp: new Date(Date.now() - 3600000).toISOString(),
      },
    ];
  });

  const [communityNotifs, setCommunityNotifs] = useState<CommunityNotification[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync Community Notifications from Backend
  const fetchCommunityNotifications = async () => {
    if (!isAuthenticated || !user) return;
    try {
      const res = await CommunityService.getNotifications();
      if (res && res.notifications) {
        setCommunityNotifs(res.notifications);
      }
    } catch (err) {
      console.warn('Failed to load community notifications:', err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchCommunityNotifications();
      const interval = setInterval(fetchCommunityNotifications, 15000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, user?.id]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_NOTIF_KEY, JSON.stringify(localNotifications));
    } catch {}
  }, [localNotifications]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Map community notifications to InAppNotification format
  const mappedCommunityNotifs: InAppNotification[] = communityNotifs.map((cn) => {
    let title = 'Community Update';
    let message = '';
    if (cn.type === 'like') {
      title = `${cn.actor_name} liked your journey`;
      message = cn.post_title ? `Liked "${cn.post_title}"` : 'Liked your community post';
    } else if (cn.type === 'comment') {
      title = `${cn.actor_name} commented on your post`;
      message = cn.post_title ? `Commented on "${cn.post_title}"` : 'Left a comment on your post';
    } else if (cn.type === 'reply') {
      title = `${cn.actor_name} replied to your comment`;
      message = cn.post_title ? `In "${cn.post_title}"` : 'Replied to your comment';
    } else if (cn.type === 'follow') {
      title = `${cn.actor_name} started following you`;
      message = 'Check out their profile and travel stories';
    } else if (cn.type === 'remix') {
      title = `${cn.actor_name} remixed your itinerary`;
      message = cn.post_title ? `Remixed "${cn.post_title}" into their personal trip` : 'Saved your itinerary';
    }

    return {
      id: cn.id,
      title,
      message,
      type: cn.type,
      read: cn.read,
      timestamp: cn.created_at,
      actor_image: cn.actor_image,
    };
  });

  const allNotifications = [...mappedCommunityNotifs, ...localNotifications].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const unreadCount = allNotifications.filter((n) => !n.read).length;

  const markAllAsRead = async () => {
    setLocalNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setCommunityNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
    if (isAuthenticated) {
      await CommunityService.markAllNotificationsRead();
    }
  };

  const markAsRead = async (id: string) => {
    const isComm = communityNotifs.some((n) => n.id === id);
    if (isComm) {
      setCommunityNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
      if (isAuthenticated) {
        await CommunityService.markNotificationRead(id);
      }
    } else {
      setLocalNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    }
  };

  const clearAll = () => {
    setLocalNotifications([]);
  };

  const getIcon = (type: InAppNotification['type'], actor_image?: string) => {
    if (actor_image) {
      return (
        <img
          src={actor_image}
          alt="Avatar"
          className="w-full h-full object-cover rounded-xl"
        />
      );
    }

    switch (type) {
      case 'like':
        return <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />;
      case 'comment':
      case 'reply':
        return <MessageSquare className="w-4 h-4 text-teal-600" />;
      case 'follow':
        return <UserPlus className="w-4 h-4 text-indigo-600" />;
      case 'budget':
        return <DollarSign className="w-4 h-4 text-[#C59B27]" />;
      case 'weather':
        return <CloudRain className="w-4 h-4 text-sky-500" />;
      case 'trip':
        return <Luggage className="w-4 h-4 text-slate-800" />;
      case 'recommendation':
        return <Sparkles className="w-4 h-4 text-[#C59B27]" />;
      default:
        return <Info className="w-4 h-4 text-teal-600" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen && isAuthenticated) {
            fetchCommunityNotifications();
          }
        }}
        aria-label="Notifications"
        className="relative p-2 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-900/10"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-orange-600 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50"
          >
            {/* Header */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h4 className="font-serif-title text-base font-semibold text-slate-900">
                  Notifications
                </h4>
                {unreadCount > 0 && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-900 text-white">
                    {unreadCount} new
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllAsRead}
                    className="text-xs text-slate-700 hover:underline font-medium px-2 py-1 flex items-center gap-1"
                    title="Mark all as read"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Read all</span>
                  </button>
                )}
                {localNotifications.length > 0 && (
                  <button
                    type="button"
                    onClick={clearAll}
                    className="text-xs text-slate-400 hover:text-rose-600 p-1 rounded-lg"
                    title="Clear all notifications"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Notification List */}
            <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100">
              {allNotifications.length === 0 ? (
                <div className="p-8 text-center text-slate-400 space-y-2">
                  <Bell className="w-8 h-8 mx-auto text-[#C59B27]/50" />
                  <p className="text-xs font-light">You’re all caught up! No notifications.</p>
                </div>
              ) : (
                allNotifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => markAsRead(n.id)}
                    className={`p-4 transition-colors cursor-pointer flex items-start gap-3 ${
                      !n.read ? 'bg-slate-100/60 hover:bg-slate-100' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-center shrink-0 mt-0.5 overflow-hidden">
                      {getIcon(n.type, n.actor_image)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h5 className={`text-xs font-semibold truncate ${!n.read ? 'text-slate-900' : 'text-slate-700'}`}>
                          {n.title}
                        </h5>
                        {!n.read && (
                          <span className="w-2 h-2 rounded-full bg-orange-600 shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-slate-500 font-light mt-0.5 line-clamp-2 leading-relaxed">
                        {n.message}
                      </p>
                      <span className="text-[10px] text-slate-400 mt-1 inline-block">
                        {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
