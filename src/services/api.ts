import {
  Trip,
  CreateTripInput,
  User,
  UserPreferences,
  Place,
  SavedPlace,
  TripShare,
  DestinationInfo,
  Activity,
  AIChatMessage,
} from '../types';
import { auth } from '../lib/firebase';

const TOKEN_KEY = 'ai_trip_planner_token';

export const getStoredToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setStoredToken = (token: string) => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const removeStoredToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

async function request<T>(endpoint: string, options: RequestInit = {}, isRetry: boolean = false): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  // If 401 Unauthorized occurs on a protected endpoint and we haven't retried yet,
  // attempt silent token re-verification via active Firebase user if available
  if (
    response.status === 401 &&
    !isRetry &&
    endpoint !== '/api/auth/login' &&
    endpoint !== '/api/auth/register' &&
    endpoint !== '/api/auth/verify-firebase'
  ) {
    try {
      const currentFbUser = auth.currentUser;
      if (currentFbUser) {
        const idToken = await currentFbUser.getIdToken(true);
        const res = await fetch('/api/auth/verify-firebase', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            idToken,
            email: currentFbUser.email || undefined,
            name: currentFbUser.displayName || undefined,
            profile_image: currentFbUser.photoURL || undefined,
          }),
        });

        if (res.ok) {
          const authData = await res.json();
          if (authData && authData.token) {
            setStoredToken(authData.token);
            // Retry the original request with the fresh token
            return request<T>(endpoint, options, true);
          }
        }
      }
    } catch (refreshErr) {
      console.warn('Session refresh attempt note:', refreshErr);
    }
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMsg = data?.error || data?.message || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data as T;
}

// Authentication API
export const apiAuth = {
  verifyFirebase: (data: { idToken: string; name?: string; email?: string; profile_image?: string }) =>
    request<{ user: User; preferences: UserPreferences; token: string }>('/api/auth/verify-firebase', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  register: (data: { name: string; email: string; password: string }) =>
    request<{ user: User; preferences: UserPreferences; token: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  login: (data: { email: string; password: string }) =>
    request<{ user: User; preferences: UserPreferences; token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  demoLogin: (role: 'user' | 'admin' = 'user') =>
    request<{ user: User; preferences: UserPreferences; token: string }>('/api/auth/demo-login', {
      method: 'POST',
      body: JSON.stringify({ role }),
    }),

  getMe: () => request<{ user: User; preferences: UserPreferences }>('/api/auth/me'),

  updateProfile: (data: { name?: string; profile_image?: string }) =>
    request<{ user: User; message: string }>('/api/auth/update-profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  updatePreferences: (data: Partial<UserPreferences>) =>
    request<{ preferences: UserPreferences; message: string }>('/api/auth/update-preferences', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  logout: () => request<{ message: string }>('/api/auth/logout', { method: 'POST' }),

  syncUser: (data: { id: string; name: string; email: string; role?: string; profile_image?: string; created_at?: string; status?: string }) =>
    request<{ user: User; token?: string; success: boolean }>('/api/admin/sync-user', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// Admin API
export const apiAdmin = {
  getUsersAndFiles: (adminUser?: { id?: string; email?: string; role?: string } | null) => {
    const headers: Record<string, string> = {};
    if (adminUser?.email) headers['x-user-email'] = adminUser.email;
    if (adminUser?.id) headers['x-user-id'] = adminUser.id;
    if (adminUser?.role) headers['x-user-role'] = adminUser.role;

    return request<{
      users: any[];
      totalUsers: number;
      totalTrips: number;
      totalFiles: number;
    }>('/api/admin/users-and-files', {
      headers,
    });
  },

  updateRole: (userId: string, role: string, adminUser?: { id?: string; email?: string; role?: string } | null) => {
    const headers: Record<string, string> = {};
    if (adminUser?.email) headers['x-user-email'] = adminUser.email;
    if (adminUser?.id) headers['x-user-id'] = adminUser.id;
    if (adminUser?.role) headers['x-user-role'] = adminUser.role;

    return request<{ user: User; message: string }>(`/api/admin/users/${userId}/role`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ role }),
    });
  },

  updateStatus: (userId: string, status: 'active' | 'suspended', adminUser?: { id?: string; email?: string; role?: string } | null) => {
    const headers: Record<string, string> = {};
    if (adminUser?.email) headers['x-user-email'] = adminUser.email;
    if (adminUser?.id) headers['x-user-id'] = adminUser.id;
    if (adminUser?.role) headers['x-user-role'] = adminUser.role;

    return request<{ user: User; message: string }>(`/api/admin/users/${userId}/status`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ status }),
    });
  },

  deleteUser: (userId: string, adminUser?: { id?: string; email?: string; role?: string } | null) => {
    const headers: Record<string, string> = {};
    if (adminUser?.email) headers['x-user-email'] = adminUser.email;
    if (adminUser?.id) headers['x-user-id'] = adminUser.id;
    if (adminUser?.role) headers['x-user-role'] = adminUser.role;

    return request<{ success: boolean; message: string }>(`/api/admin/users/${userId}`, {
      method: 'DELETE',
      headers,
    });
  },

  getUserTrips: (userId: string, adminUser?: { id?: string; email?: string; role?: string } | null) => {
    const headers: Record<string, string> = {};
    if (adminUser?.email) headers['x-user-email'] = adminUser.email;
    if (adminUser?.id) headers['x-user-id'] = adminUser.id;
    if (adminUser?.role) headers['x-user-role'] = adminUser.role;

    return request<Trip[]>(`/api/admin/users/${userId}/trips`, {
      headers,
    });
  },

  deleteTrip: (tripId: string, adminUser?: { id?: string; email?: string; role?: string } | null) => {
    const headers: Record<string, string> = {};
    if (adminUser?.email) headers['x-user-email'] = adminUser.email;
    if (adminUser?.id) headers['x-user-id'] = adminUser.id;
    if (adminUser?.role) headers['x-user-role'] = adminUser.role;

    return request<{ success: boolean; message: string }>(`/api/admin/trips/${tripId}`, {
      method: 'DELETE',
      headers,
    });
  },
};

// Trips API
export const apiTrips = {
  getAll: () => request<Trip[]>('/api/trips'),

  getById: (id: string) => request<Trip & { weather?: any; shareInfo?: TripShare; isOwner?: boolean }>(`/api/trips/${id}`),

  generate: (input: CreateTripInput) =>
    request<Trip>('/api/trips/generate', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  update: (id: string, updates: Partial<Trip>) =>
    request<Trip>(`/api/trips/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),

  delete: (id: string) => request<{ message: string }>(`/api/trips/${id}`, { method: 'DELETE' }),

  duplicate: (id: string) => request<Trip>(`/api/trips/${id}/duplicate`, { method: 'POST' }),

  addActivity: (tripId: string, dayId: string, activity: Partial<Activity>) =>
    request<{ activity: Activity; trip: Trip }>(`/api/trips/${tripId}/days/${dayId}/activities`, {
      method: 'POST',
      body: JSON.stringify(activity),
    }),

  updateActivity: (activityId: string, updates: Partial<Activity>) =>
    request<Activity>(`/api/activities/${activityId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),

  deleteActivity: (activityId: string) =>
    request<{ message: string }>(`/api/activities/${activityId}`, { method: 'DELETE' }),

  regenerateActivity: (tripId: string, data: { activityId: string; dayTitle: string }) =>
    request<{ activity: Activity; trip: Trip }>(`/api/trips/${tripId}/regenerate-activity`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  regenerateDay: (tripId: string, data: { dayId?: string; dayNumber?: number }) =>
    request<{ dayId: string; activities: Activity[]; trip: Trip }>(`/api/trips/${tripId}/regenerate-day`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  optimizeBudget: (tripId: string) =>
    request<{ message: string; trip: Trip }>(`/api/trips/${tripId}/optimize-budget`, { method: 'POST' }),

  createShare: (tripId: string) => request<TripShare>(`/api/trips/${tripId}/share`, { method: 'POST' }),

  revokeShare: (tripId: string) => request<{ message: string }>(`/api/trips/${tripId}/share`, { method: 'DELETE' }),

  getSharedTrip: (token: string) =>
    request<{ trip: Trip; share: TripShare; weather: any }>(`/api/shared-trip/${token}`),
};

// Places & Destinations API
export const apiPlaces = {
  getDestinations: () => request<DestinationInfo[]>('/api/destinations'),

  getPlaces: (params?: { destination?: string; category?: string; query?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.destination) query.append('destination', params.destination);
    if (params?.category) query.append('category', params.category);
    if (params?.query || params?.search) query.append('query', params.query || params.search || '');
    return request<Place[]>(`/api/places?${query.toString()}`);
  },

  searchPlaces: (params: { q: string; destination?: string; category?: string }) => {
    const query = new URLSearchParams();
    query.append('q', params.q);
    if (params.destination) query.append('destination', params.destination);
    if (params.category) query.append('category', params.category);
    return request<Place[]>(`/api/places/search?${query.toString()}`);
  },

  getPlaceById: (id: string) => request<Place>(`/api/places/${id}`),

  getSavedPlaces: () => request<SavedPlace[]>('/api/saved-places'),

  savePlace: (placeId: string, notes?: string) =>
    request<SavedPlace>('/api/saved-places', {
      method: 'POST',
      body: JSON.stringify({ place_id: placeId, notes }),
    }),

  removeSavedPlace: (placeId: string) =>
    request<{ message: string }>(`/api/saved-places/${placeId}`, { method: 'DELETE' }),
};

// AI Assistant & Chat API
export const apiAIChat = {
  sendMessage: (data: { tripId?: string; userMessage: string; history?: Array<{ sender: string; text: string }> }) =>
    request<{
      message: string;
      suggestedActions: Array<{
        type:
          | 'ADD_ACTIVITY'
          | 'REMOVE_ACTIVITY'
          | 'UPDATE_ACTIVITY'
          | 'REGENERATE_DAY'
          | 'OPTIMIZE_BUDGET'
          | 'CHANGE_RESTAURANT'
          | 'CHANGE_HOTEL';
        label: string;
        payload?: any;
      }>;
      timestamp: string;
    }>('/api/ai/chat', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  applyAction: (data: { tripId: string; actionType: string; payload?: any }) =>
    request<{ message: string; trip: Trip }>('/api/ai/apply-action', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// Analytics API
export const apiAnalytics = {
  getStats: () =>
    request<{
      totalUsers: number;
      totalTrips: number;
      totalSavedPlaces: number;
      totalActivities: number;
      popularDestinations: Array<{ name: string; count: number }>;
      averageBudget: number;
      recentEvents: Array<{ id: string; event_name: string; user_id?: string; metadata?: any; created_at: string }>;
    }>('/api/analytics/stats'),

  getUserStats: (userId?: string) =>
    request<{
      totalTrips: number;
      totalDays: number;
      totalActivities: number;
      averageBudget: number;
      totalBudget: number;
      destinations: Array<{ name: string; trips: number; budget: number }>;
      travelStyles: Array<{ name: string; count: number }>;
      activityCategories: Array<{ name: string; count: number }>;
      savedPlacesCount: number;
    }>(`/api/analytics/user-stats${userId ? `?userId=${encodeURIComponent(userId)}` : ''}`),

  trackEvent: (eventName: string, metadata?: any) =>
    request<{ success: boolean }>('/api/analytics/event', {
      method: 'POST',
      body: JSON.stringify({ eventName, metadata }),
    }),
};

// Community API
export const apiCommunity = {
  getPosts: (params: {
    search?: string;
    tag?: string;
    destination?: string;
    post_type?: string;
    filter?: string;
    author_id?: string;
    limit?: number;
    offset?: number;
  } = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.tag && params.tag !== 'All') query.set('tag', params.tag);
    if (params.destination && params.destination !== 'All') query.set('destination', params.destination);
    if (params.post_type && params.post_type !== 'All') query.set('post_type', params.post_type);
    if (params.filter) query.set('filter', params.filter);
    if (params.author_id) query.set('author_id', params.author_id);
    if (params.limit) query.set('limit', params.limit.toString());
    if (params.offset) query.set('offset', params.offset.toString());
    const qs = query.toString();
    return request<{ posts: any[]; total: number }>(`/api/community/posts${qs ? `?${qs}` : ''}`);
  },

  getPost: (id: string) =>
    request<{ post: any }>(`/api/community/posts/${id}`),

  createPost: (data: any) =>
    request<{ post: any; message: string }>('/api/community/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updatePost: (id: string, data: any) =>
    request<{ post: any; message: string }>(`/api/community/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deletePost: (id: string) =>
    request<{ success: boolean; message: string }>(`/api/community/posts/${id}`, {
      method: 'DELETE',
    }),

  toggleLike: (postId: string) =>
    request<{ is_liked: boolean; likes_count: number }>(`/api/community/posts/${postId}/like`, {
      method: 'POST',
    }),

  getLikes: (postId: string) =>
    request<{ likes: any[]; count: number }>(`/api/community/posts/${postId}/likes`),

  getComments: (postId: string) =>
    request<{ comments: any[] }>(`/api/community/posts/${postId}/comments`),

  addComment: (postId: string, content: string, parentCommentId?: string) =>
    request<{ comment: any; message: string }>(`/api/community/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content, parent_comment_id: parentCommentId }),
    }),

  updateComment: (commentId: string, content: string) =>
    request<{ comment: any; message: string }>(`/api/community/comments/${commentId}`, {
      method: 'PUT',
      body: JSON.stringify({ content }),
    }),

  deleteComment: (commentId: string) =>
    request<{ success: boolean; message: string }>(`/api/community/comments/${commentId}`, {
      method: 'DELETE',
    }),

  toggleSave: (postId: string) =>
    request<{ is_saved: boolean; saves_count: number }>(`/api/community/posts/${postId}/save`, {
      method: 'POST',
    }),

  getSavedPosts: () =>
    request<{ posts: any[] }>('/api/community/saved'),

  toggleFollow: (userId: string) =>
    request<{ is_following: boolean; followers_count: number; following_count: number; message: string }>(
      `/api/community/users/${userId}/follow`,
      { method: 'POST' }
    ),

  getFollowers: (userId: string) =>
    request<{ followers: any[]; count: number }>(`/api/community/users/${userId}/followers`),

  getFollowing: (userId: string) =>
    request<{ following: any[]; count: number }>(`/api/community/users/${userId}/following`),

  getNotifications: () =>
    request<{ notifications: any[]; unread_count: number }>('/api/community/notifications'),

  markNotificationRead: (id: string) =>
    request<{ success: boolean }>(`/api/community/notifications/${id}/read`, { method: 'PUT' }),

  markAllNotificationsRead: () =>
    request<{ success: boolean; message: string }>('/api/community/notifications/read-all', { method: 'PUT' }),

  deleteNotification: (id: string) =>
    request<{ success: boolean }>(`/api/community/notifications/${id}`, { method: 'DELETE' }),

  reportPost: (postId: string, data: { reason: string; details?: string }) =>
    request<{ report: any; message: string }>(`/api/community/posts/${postId}/report`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getPublicProfile: (userId: string) =>
    request<{ profile: any }>(`/api/community/users/${userId}`),
};

// Files & Travel Vault API
export const apiFiles = {
  getAll: () => request<any[]>('/api/files'),
  create: (data: any) =>
    request<any>('/api/files', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    request<any>(`/api/files/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    request<{ success: boolean; message: string }>(`/api/files/${id}`, {
      method: 'DELETE',
    }),
};
