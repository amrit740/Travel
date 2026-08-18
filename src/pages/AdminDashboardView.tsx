import React, { useState, useEffect } from 'react';
import { TravelWiseLogo } from '../components/common/TravelWiseLogo';
import {
  Users,
  Shield,
  FileText,
  Calendar,
  Search,
  Eye,
  Download,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Trash2,
  Luggage,
  X,
  FileQuestion,
  UserCheck,
  UserX,
  Edit2,
  Sliders,
  MapPin,
  ExternalLink,
  ShieldAlert,
  FolderGit2,
  MessageSquare,
  Sparkles,
  Heart,
  Star,
  Plus,
  Compass,
  Layers,
  Flag,
  Lock,
  Activity,
  Check,
  TrendingUp,
  Database,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
  PRIMARY_ADMIN_UID,
  checkIsAdmin,
  getAdminUsersAndFiles,
  AdminUserRecord,
  AdminUserFile,
  FeedbackRecord,
  updateUserRoleAsAdmin,
  updateUserStatusAsAdmin,
  deleteUserAsAdmin,
  getUserTripsForAdmin,
  getAllTripsForAdmin,
  deleteTripAsAdmin,
  deleteFileAsAdmin,
  getAllCommunityPostsForAdmin,
  deleteCommunityPostAsAdmin,
  getCommunityReportsForAdmin,
  resolveCommunityReportAsAdmin,
  getPlacesCatalogForAdmin,
  savePlaceAsAdmin,
  deletePlaceAsAdmin,
  getFeedbacksForAdmin,
  updateFeedbackStatusAsAdmin,
} from '../lib/adminService';
import { Trip, CommunityPost, CommunityReport, Place } from '../types';
import { formatDate, formatCurrency } from '../lib/utils';

export const AdminDashboardView: React.FC = () => {
  const { user } = useAuth();
  const [usersList, setUsersList] = useState<AdminUserRecord[]>([]);
  const [allTrips, setAllTrips] = useState<Trip[]>([]);
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([]);
  const [communityReports, setCommunityReports] = useState<CommunityReport[]>([]);
  const [placesCatalog, setPlacesCatalog] = useState<Place[]>([]);
  const [feedbacks, setFeedbacks] = useState<FeedbackRecord[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<AdminUserRecord | null>(null);
  const [selectedUserTrips, setSelectedUserTrips] = useState<Trip[]>([]);
  const [isLoadingTrips, setIsLoadingTrips] = useState(false);
  const [previewFile, setPreviewFile] = useState<AdminUserFile | null>(null);

  // Main navigation tabs
  const [currentSection, setCurrentSection] = useState<'overview' | 'users' | 'community' | 'destinations' | 'trips' | 'feedback' | 'security'>('overview');

  // Place Modal state
  const [isPlaceModalOpen, setIsPlaceModalOpen] = useState(false);
  const [editingPlace, setEditingPlace] = useState<Partial<Place>>({
    name: '',
    destination: 'Goa',
    category: 'Attraction',
    sub_category: 'Sightseeing',
    description: '',
    rating: 4.8,
    price_level: '$$',
    estimated_cost: 500,
    address: '',
    opening_hours: '09:00 AM - 06:00 PM',
    best_time_to_visit: 'Morning & Sunset',
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80',
    tags: ['Must Visit', 'Scenic'],
  });

  // User delete confirmation
  const [userToDelete, setUserToDelete] = useState<AdminUserRecord | null>(null);
  const [postToDelete, setPostToDelete] = useState<CommunityPost | null>(null);

  const loadAllData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [records, trips, posts, reports, places, userFeedbacks] = await Promise.all([
        getAdminUsersAndFiles(user).catch(() => []),
        getAllTripsForAdmin(user).catch(() => []),
        getAllCommunityPostsForAdmin(user).catch(() => []),
        getCommunityReportsForAdmin(user).catch(() => []),
        getPlacesCatalogForAdmin(user).catch(() => []),
        getFeedbacksForAdmin(user).catch(() => []),
      ]);

      setUsersList(records);
      setAllTrips(trips);
      setCommunityPosts(posts);
      setCommunityReports(reports);
      setPlacesCatalog(places);
      setFeedbacks(userFeedbacks);

      if (selectedUser) {
        const updated = records.find((u) => u.id === selectedUser.id);
        if (updated) setSelectedUser(updated);
      }
    } catch (err: any) {
      console.error('Error fetching admin data:', err);
      setError(err.message || 'Failed to retrieve admin control records.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadAllData();
    }
  }, [user?.id, user?.email]);

  useEffect(() => {
    if (selectedUser) {
      loadUserTrips(selectedUser.id);
    } else {
      setSelectedUserTrips([]);
    }
  }, [selectedUser?.id]);

  const loadUserTrips = async (userId: string) => {
    setIsLoadingTrips(true);
    try {
      const trips = await getUserTripsForAdmin(userId, user);
      setSelectedUserTrips(trips);
    } catch (err) {
      console.warn('Failed to load trips for user:', err);
    } finally {
      setIsLoadingTrips(false);
    }
  };

  const showNotification = (msg: string) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(null), 3500);
  };

  // User Actions
  const handleToggleStatus = async (targetUser: AdminUserRecord) => {
    if (targetUser.id === PRIMARY_ADMIN_UID) {
      alert('Cannot suspend the primary platform administrator.');
      return;
    }
    const newStatus = targetUser.status === 'suspended' ? 'active' : 'suspended';
    try {
      await updateUserStatusAsAdmin(targetUser.id, newStatus, user);
      setUsersList((prev) =>
        prev.map((u) => (u.id === targetUser.id ? { ...u, status: newStatus } : u))
      );
      if (selectedUser?.id === targetUser.id) {
        setSelectedUser((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
      showNotification(`User account has been marked as ${newStatus}.`);
    } catch (err: any) {
      alert(err.message || 'Failed to update user status.');
    }
  };

  const handleToggleRole = async (targetUser: AdminUserRecord) => {
    if (targetUser.id === PRIMARY_ADMIN_UID) {
      alert('The primary administrator role cannot be altered.');
      return;
    }
    const newRole = targetUser.role === 'concierge' ? 'user' : 'concierge';
    try {
      await updateUserRoleAsAdmin(targetUser.id, newRole, user);
      setUsersList((prev) =>
        prev.map((u) => (u.id === targetUser.id ? { ...u, role: newRole } : u))
      );
      if (selectedUser?.id === targetUser.id) {
        setSelectedUser((prev) => (prev ? { ...prev, role: newRole } : null));
      }
      showNotification(`User role updated to ${newRole}.`);
    } catch (err: any) {
      alert(err.message || 'Failed to update user role.');
    }
  };

  const handleConfirmDeleteUser = async () => {
    if (!userToDelete) return;
    if (userToDelete.id === PRIMARY_ADMIN_UID) {
      alert('The primary administrator account cannot be deleted.');
      setUserToDelete(null);
      return;
    }
    try {
      await deleteUserAsAdmin(userToDelete.id, user);
      setUsersList((prev) => prev.filter((u) => u.id !== userToDelete.id));
      if (selectedUser?.id === userToDelete.id) {
        setSelectedUser(null);
      }
      showNotification(`User ${userToDelete.name} and associated records deleted.`);
      setUserToDelete(null);
    } catch (err: any) {
      alert(err.message || 'Failed to delete user.');
    }
  };

  // Place Actions
  const handleSavePlace = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const saved = await savePlaceAsAdmin(editingPlace, user);
      setPlacesCatalog((prev) => {
        const idx = prev.findIndex((p) => p.id === saved.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = saved;
          return next;
        }
        return [saved, ...prev];
      });
      setIsPlaceModalOpen(false);
      showNotification(`Place "${saved.name}" successfully saved to catalog.`);
    } catch (err: any) {
      alert(err.message || 'Failed to save place.');
    }
  };

  const handleDeletePlace = async (placeId: string) => {
    if (!window.confirm('Are you sure you want to remove this place from the catalog?')) return;
    try {
      await deletePlaceAsAdmin(placeId, user);
      setPlacesCatalog((prev) => prev.filter((p) => p.id !== placeId));
      showNotification('Place removed from catalog.');
    } catch (err: any) {
      alert(err.message || 'Failed to remove place.');
    }
  };

  // Community Post Actions
  const handleConfirmDeletePost = async () => {
    if (!postToDelete) return;
    try {
      await deleteCommunityPostAsAdmin(postToDelete.id, user);
      setCommunityPosts((prev) => prev.filter((p) => p.id !== postToDelete.id));
      showNotification('Community post removed by administrator.');
      setPostToDelete(null);
    } catch (err: any) {
      alert(err.message || 'Failed to delete post.');
    }
  };

  const handleResolveReport = async (reportId: string, status: 'resolved' | 'dismissed') => {
    try {
      await resolveCommunityReportAsAdmin(reportId, status, user);
      setCommunityReports((prev) =>
        prev.map((r) => (r.id === reportId ? { ...r, status } : r))
      );
      showNotification(`Report marked as ${status}.`);
    } catch (err: any) {
      alert(err.message || 'Failed to update report.');
    }
  };

  // Feedback Actions
  const handleFeedbackStatus = async (feedbackId: string, status: 'reviewed' | 'resolved') => {
    try {
      await updateFeedbackStatusAsAdmin(feedbackId, status, user);
      setFeedbacks((prev) =>
        prev.map((f) => (f.id === feedbackId ? { ...f, status } : f))
      );
      showNotification(`Feedback status updated to ${status}.`);
    } catch (err: any) {
      alert(err.message || 'Failed to update feedback status.');
    }
  };

  // Filtered Users
  const filteredUsers = usersList.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.role && u.role.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalFiles = usersList.reduce((acc, u) => acc + (u.filesCount || 0), 0);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] pb-24">
      {/* Top Banner / Navigation */}
      <header className="bg-[#0f172a] text-[#f8fafc] border-b border-[#1e293b] sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <TravelWiseLogo variant="full" size="md" />
            <div className="h-6 w-px bg-slate-700 hidden sm:block" />
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-[#1e293b] border border-[#C59B27]/40 text-[#E5C365] text-xs font-semibold">
              <Shield className="w-3.5 h-3.5" />
              <span>Admin Control Center</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-xs font-bold text-slate-200">
                Primary Admin UID
              </span>
              <span className="text-[10px] text-[#C59B27] font-mono">
                {PRIMARY_ADMIN_UID}
              </span>
            </div>
            <button
              onClick={loadAllData}
              disabled={isLoading}
              className="p-2.5 rounded-xl bg-[#1e293b] hover:bg-[#334155] text-slate-200 border border-slate-700 transition-colors flex items-center gap-2 text-xs font-medium"
              title="Refresh Platform Data"
            >
              <RefreshCw className={`w-4 h-4 text-[#C59B27] ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh Data</span>
            </button>
          </div>
        </div>

        {/* Section Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1 overflow-x-auto no-scrollbar border-t border-slate-800">
          {[
            { id: 'overview', label: 'Overview & KPIs', icon: Activity },
            { id: 'users', label: `Users & Files (${usersList.length})`, icon: Users },
            { id: 'destinations', label: `Places & Catalog (${placesCatalog.length})`, icon: Compass },
            { id: 'community', label: `Community & Moderation (${communityPosts.length})`, icon: MessageSquare },
            { id: 'trips', label: `Global Itineraries (${allTrips.length})`, icon: Luggage },
            { id: 'feedback', label: `Traveler Feedback (${feedbacks.length})`, icon: Star },
            { id: 'security', label: 'Security & Access', icon: Lock },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = currentSection === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setCurrentSection(tab.id as any)}
                className={`py-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${
                  isActive
                    ? 'border-[#C59B27] text-[#E5C365] bg-[#1e293b]/50'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#C59B27]' : ''}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Notification banner */}
        {actionSuccess && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2 shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-semibold flex items-center gap-2 shadow-xs">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 1. OVERVIEW SECTION */}
        {currentSection === 'overview' && (
          <div className="space-y-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="p-5 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                  <Users className="w-5 h-5" />
                </div>
                <div className="text-2xl font-bold text-[#0f172a]">{usersList.length}</div>
                <div className="text-xs text-[#64748b] font-medium">Registered Users</div>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                  <Luggage className="w-5 h-5" />
                </div>
                <div className="text-2xl font-bold text-[#0f172a]">{allTrips.length}</div>
                <div className="text-xs text-[#64748b] font-medium">Active Itineraries</div>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs">
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
                  <Compass className="w-5 h-5" />
                </div>
                <div className="text-2xl font-bold text-[#0f172a]">{placesCatalog.length}</div>
                <div className="text-xs text-[#64748b] font-medium">Catalog Places</div>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div className="text-2xl font-bold text-[#0f172a]">{communityPosts.length}</div>
                <div className="text-xs text-[#64748b] font-medium">Stories Shared</div>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs">
                <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3">
                  <Flag className="w-5 h-5" />
                </div>
                <div className="text-2xl font-bold text-[#0f172a]">{communityReports.length}</div>
                <div className="text-xs text-[#64748b] font-medium">Reported Items</div>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                  <FolderGit2 className="w-5 h-5" />
                </div>
                <div className="text-2xl font-bold text-[#0f172a]">{totalFiles}</div>
                <div className="text-xs text-[#64748b] font-medium">Platform Media Files</div>
              </div>
            </div>

            {/* Quick Actions and Highlights */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Quick Actions Card */}
              <div className="p-6 rounded-3xl bg-white border border-[#e2e8f0] shadow-xs space-y-4">
                <h3 className="font-serif-title text-base font-bold text-[#0f172a] flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#C59B27]" />
                  <span>Admin Management Controls</span>
                </h3>
                <div className="space-y-2.5">
                  <button
                    onClick={() => setCurrentSection('users')}
                    className="w-full p-3 rounded-2xl bg-[#f8fafc] hover:bg-[#e2e8f0]/60 border border-[#e2e8f0] text-left transition-colors flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-bold text-[#0f172a]">User Accounts & Roles</div>
                      <div className="text-[11px] text-[#64748b]">Inspect traveler uploads, status & trips</div>
                    </div>
                    <Users className="w-4 h-4 text-[#64748b]" />
                  </button>

                  <button
                    onClick={() => {
                      setCurrentSection('destinations');
                      setIsPlaceModalOpen(true);
                    }}
                    className="w-full p-3 rounded-2xl bg-[#f8fafc] hover:bg-[#e2e8f0]/60 border border-[#e2e8f0] text-left transition-colors flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-bold text-[#0f172a]">Add Destination Landmark</div>
                      <div className="text-[11px] text-[#64748b]">Create places in Goa, Kerala, Jaipur, etc.</div>
                    </div>
                    <Plus className="w-4 h-4 text-[#C59B27]" />
                  </button>

                  <button
                    onClick={() => setCurrentSection('community')}
                    className="w-full p-3 rounded-2xl bg-[#f8fafc] hover:bg-[#e2e8f0]/60 border border-[#e2e8f0] text-left transition-colors flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-bold text-[#0f172a]">Moderate Community Content</div>
                      <div className="text-[11px] text-[#64748b]">Review stories, comments, and reports</div>
                    </div>
                    <MessageSquare className="w-4 h-4 text-[#64748b]" />
                  </button>

                  <button
                    onClick={() => setCurrentSection('feedback')}
                    className="w-full p-3 rounded-2xl bg-[#f8fafc] hover:bg-[#e2e8f0]/60 border border-[#e2e8f0] text-left transition-colors flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-bold text-[#0f172a]">Review Traveler Feedback</div>
                      <div className="text-[11px] text-[#64748b]">See ratings & feature suggestions</div>
                    </div>
                    <Star className="w-4 h-4 text-[#C59B27]" />
                  </button>
                </div>
              </div>

              {/* Recent Community Feed / Moderation Queue */}
              <div className="p-6 rounded-3xl bg-white border border-[#e2e8f0] shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif-title text-base font-bold text-[#0f172a]">
                    Latest Community Stories
                  </h3>
                  <button
                    onClick={() => setCurrentSection('community')}
                    className="text-xs font-bold text-[#C59B27] hover:underline"
                  >
                    View All ({communityPosts.length})
                  </button>
                </div>

                <div className="space-y-3">
                  {communityPosts.slice(0, 4).map((post) => (
                    <div
                      key={post.id}
                      className="p-3 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0] flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-[#0f172a] truncate">{post.title}</div>
                        <div className="text-[11px] text-[#64748b] truncate">
                          By {post.author_name} • {post.destination}
                        </div>
                      </div>
                      <button
                        onClick={() => setPostToDelete(post)}
                        className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete Post"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {communityPosts.length === 0 && (
                    <div className="text-center py-6 text-xs text-[#64748b]">No community posts yet.</div>
                  )}
                </div>
              </div>

              {/* Security & Admin Status Card */}
              <div className="p-6 rounded-3xl bg-white border border-[#e2e8f0] shadow-xs space-y-4">
                <h3 className="font-serif-title text-base font-bold text-[#0f172a] flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-emerald-600" />
                  <span>Security & Enforcement</span>
                </h3>
                <div className="space-y-3">
                  <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200">
                    <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Single Active Admin Enforced</span>
                    </div>
                    <p className="text-[11px] text-emerald-800 font-mono mt-1 break-all">
                      UID: {PRIMARY_ADMIN_UID}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-[#e2e8f0] space-y-1">
                    <div className="text-xs font-bold text-[#0f172a]">Database Security Rules</div>
                    <div className="text-[11px] text-[#64748b]">
                      Strict RBAC active in <code className="font-mono text-[10px] bg-slate-200 px-1 py-0.5 rounded">firestore.rules</code> and backend API gateway.
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-[#e2e8f0] space-y-1">
                    <div className="text-xs font-bold text-[#0f172a]">Data Integrity Guard</div>
                    <div className="text-[11px] text-[#64748b]">
                      Primary admin account cannot be deleted or revoked through UI controls.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. USERS SECTION */}
        {currentSection === 'users' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* User List Column */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-[#64748b] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search users by name, email, role, or UID..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-[#e2e8f0] text-xs font-medium text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#0f172a]/20"
                  />
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-[#e2e8f0] overflow-hidden shadow-xs">
                <div className="p-4 bg-slate-50 border-b border-[#e2e8f0] flex items-center justify-between text-xs font-bold text-[#64748b] uppercase tracking-wider">
                  <span>Traveler Account</span>
                  <span>Role & Actions</span>
                </div>

                <div className="divide-y divide-[#e2e8f0]">
                  {filteredUsers.map((u) => {
                    const isSelected = selectedUser?.id === u.id;
                    const isPrimary = u.id === PRIMARY_ADMIN_UID;
                    return (
                      <div
                        key={u.id}
                        onClick={() => setSelectedUser(u)}
                        className={`p-4 transition-colors cursor-pointer flex items-center justify-between gap-4 ${
                          isSelected ? 'bg-[#f8fafc] border-l-4 border-l-[#C59B27]' : 'hover:bg-slate-50/80'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={u.profile_image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                            alt={u.name}
                            className="w-10 h-10 rounded-full object-cover border border-[#e2e8f0]"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-[#0f172a] truncate">{u.name}</span>
                              {isPrimary ? (
                                <span className="px-2 py-0.5 rounded-full bg-[#0f172a] text-[#E5C365] font-bold text-[10px]">
                                  PRIMARY ADMIN
                                </span>
                              ) : u.role === 'concierge' ? (
                                <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold text-[10px]">
                                  CONCIERGE
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold text-[10px]">
                                  TRAVELER
                                </span>
                              )}
                              {u.status === 'suspended' && (
                                <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold text-[10px]">
                                  SUSPENDED
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-[#64748b] truncate">{u.email}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[11px] text-[#64748b] font-medium hidden sm:inline">
                            {u.tripsCount} trips • {u.filesCount} files
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedUser(u);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-[#0f172a] transition-colors"
                          >
                            Inspect
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {filteredUsers.length === 0 && (
                    <div className="p-8 text-center text-xs text-[#64748b]">
                      No user accounts found matching your query.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Selected User Details Drawer */}
            <div className="lg:col-span-5">
              {selectedUser ? (
                <div className="bg-white rounded-3xl border border-[#e2e8f0] p-6 shadow-xs space-y-6 sticky top-28">
                  {/* User Profile Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <img
                        src={selectedUser.profile_image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                        alt={selectedUser.name}
                        className="w-14 h-14 rounded-2xl object-cover border border-[#e2e8f0]"
                      />
                      <div>
                        <h4 className="font-serif-title text-base font-bold text-[#0f172a]">
                          {selectedUser.name}
                        </h4>
                        <p className="text-xs text-[#64748b]">{selectedUser.email}</p>
                        <p className="text-[10px] text-[#94a3b8] font-mono mt-0.5">UID: {selectedUser.id}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedUser(null)}
                      className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Actions Bar */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#e2e8f0]">
                    <button
                      onClick={() => handleToggleStatus(selectedUser)}
                      disabled={selectedUser.id === PRIMARY_ADMIN_UID}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                        selectedUser.status === 'suspended'
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          : 'bg-rose-50 text-rose-700 hover:bg-rose-100 disabled:opacity-40'
                      }`}
                    >
                      {selectedUser.status === 'suspended' ? (
                        <>
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Re-activate User</span>
                        </>
                      ) : (
                        <>
                          <UserX className="w-3.5 h-3.5" />
                          <span>Suspend User</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleToggleRole(selectedUser)}
                      disabled={selectedUser.id === PRIMARY_ADMIN_UID}
                      className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-[#0f172a] transition-colors flex items-center justify-center gap-1.5 disabled:opacity-40"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>{selectedUser.role === 'concierge' ? 'Make Traveler' : 'Make Concierge'}</span>
                    </button>
                  </div>

                  {/* User Files & Media */}
                  <div className="space-y-3 pt-2 border-t border-[#e2e8f0]">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#0f172a] uppercase tracking-wider">
                        Uploaded Media & Files ({selectedUser.files.length})
                      </span>
                    </div>

                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {selectedUser.files.map((file) => (
                        <div
                          key={file.id}
                          className="p-2.5 rounded-xl bg-slate-50 border border-[#e2e8f0] flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="min-w-0">
                            <div className="font-semibold text-[#0f172a] truncate">{file.name}</div>
                            <div className="text-[10px] text-[#64748b] truncate">{file.sourceTitle}</div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <a
                              href={file.url}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded-lg bg-white border border-[#e2e8f0] text-slate-700 hover:text-black"
                              title="Open image / file"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                            <button
                              onClick={() => deleteFileAsAdmin(file, selectedUser.id, user)}
                              className="p-1.5 rounded-lg bg-white border border-[#e2e8f0] text-rose-600 hover:bg-rose-50"
                              title="Delete file"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                      {selectedUser.files.length === 0 && (
                        <div className="text-xs text-[#64748b] py-2">No files attached to this user.</div>
                      )}
                    </div>
                  </div>

                  {/* User Itineraries */}
                  <div className="space-y-3 pt-2 border-t border-[#e2e8f0]">
                    <span className="text-xs font-bold text-[#0f172a] uppercase tracking-wider block">
                      User Itineraries ({selectedUserTrips.length})
                    </span>

                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {isLoadingTrips ? (
                        <div className="text-xs text-[#64748b] py-2 flex items-center gap-2">
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Loading itineraries...</span>
                        </div>
                      ) : (
                        selectedUserTrips.map((t) => (
                          <div
                            key={t.id}
                            className="p-2.5 rounded-xl bg-slate-50 border border-[#e2e8f0] flex items-center justify-between gap-3 text-xs"
                          >
                            <div className="min-w-0">
                              <div className="font-semibold text-[#0f172a] truncate">{t.title}</div>
                              <div className="text-[10px] text-[#64748b]">
                                {t.destination} • {t.duration} Days • {formatCurrency(t.total_budget || 0)}
                              </div>
                            </div>
                            <button
                              onClick={async () => {
                                if (window.confirm(`Delete trip "${t.title}"?`)) {
                                  await deleteTripAsAdmin(t.id, user);
                                  setSelectedUserTrips((prev) => prev.filter((item) => item.id !== t.id));
                                  showNotification('Trip deleted.');
                                }
                              }}
                              className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50"
                              title="Delete Trip"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))
                      )}
                      {!isLoadingTrips && selectedUserTrips.length === 0 && (
                        <div className="text-xs text-[#64748b] py-2">No itineraries created yet.</div>
                      )}
                    </div>
                  </div>

                  {/* Danger Zone: Delete User Account */}
                  {selectedUser.id !== PRIMARY_ADMIN_UID && (
                    <div className="pt-3 border-t border-rose-100">
                      <button
                        onClick={() => setUserToDelete(selectedUser)}
                        className="w-full py-2.5 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-semibold border border-rose-200 transition-colors flex items-center justify-center gap-2"
                      >
                        <Trash2 className="w-4 h-4 text-rose-600" />
                        <span>Delete User & All Records</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-3xl border border-[#e2e8f0] p-10 text-center text-xs text-[#64748b] space-y-2">
                  <Users className="w-8 h-8 text-slate-300 mx-auto" />
                  <div className="font-bold text-[#0f172a]">No User Selected</div>
                  <p>Click "Inspect" on any user from the directory to review files, itineraries, and status controls.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 3. DESTINATIONS & PLACES CATALOG */}
        {currentSection === 'destinations' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-serif-title text-xl font-bold text-[#0f172a]">
                  Destinations & Places Catalog
                </h3>
                <p className="text-xs text-[#64748b]">
                  Manage landmarks, restaurants, boutique stays, and curated attractions across India.
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingPlace({
                    name: '',
                    destination: 'Goa',
                    category: 'Attraction',
                    sub_category: 'Sightseeing',
                    description: '',
                    rating: 4.8,
                    price_level: '$$',
                    estimated_cost: 500,
                    address: '',
                    opening_hours: '09:00 AM - 06:00 PM',
                    best_time_to_visit: 'Morning & Sunset',
                    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80',
                    tags: ['Must Visit', 'Scenic'],
                  });
                  setIsPlaceModalOpen(true);
                }}
                className="px-4 py-2.5 rounded-xl bg-[#0f172a] hover:bg-[#1e293b] text-[#f8fafc] text-xs font-semibold transition-colors flex items-center gap-2 shadow-xs"
              >
                <Plus className="w-4 h-4 text-[#C59B27]" />
                <span>Add New Place</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {placesCatalog.map((place) => (
                <div
                  key={place.id}
                  className="bg-white rounded-3xl border border-[#e2e8f0] overflow-hidden shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="relative h-44 overflow-hidden">
                      <img
                        src={place.image}
                        alt={place.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[#0f172a]/80 backdrop-blur-xs text-[#E5C365] text-[11px] font-bold">
                        {place.destination}
                      </div>
                      <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-xs text-[#0f172a] text-[11px] font-bold flex items-center gap-1">
                        <Star className="w-3 h-3 text-[#C59B27] fill-[#C59B27]" />
                        <span>{place.rating}</span>
                      </div>
                    </div>

                    <div className="p-5 space-y-2">
                      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#C59B27]">
                        <span>{place.category}</span>
                        <span>•</span>
                        <span className="text-[#64748b]">{place.sub_category}</span>
                      </div>
                      <h4 className="font-serif-title text-base font-bold text-[#0f172a]">
                        {place.name}
                      </h4>
                      <p className="text-xs text-[#64748b] line-clamp-2 leading-relaxed">
                        {place.description}
                      </p>
                      <div className="text-[11px] text-[#64748b] flex items-center gap-1.5 pt-1">
                        <MapPin className="w-3.5 h-3.5 text-[#C59B27] shrink-0" />
                        <span className="truncate">{place.address || place.destination}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 border-t border-[#e2e8f0] flex items-center justify-between">
                    <span className="text-xs font-bold text-[#0f172a]">
                      ₹{place.estimated_cost} <span className="text-[10px] text-[#64748b] font-normal">/ person</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingPlace(place);
                          setIsPlaceModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg bg-white border border-[#e2e8f0] text-slate-700 hover:text-black"
                        title="Edit Place"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeletePlace(place.id)}
                        className="p-1.5 rounded-lg bg-white border border-[#e2e8f0] text-rose-600 hover:bg-rose-50"
                        title="Delete Place"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. COMMUNITY & MODERATION */}
        {currentSection === 'community' && (
          <div className="space-y-8">
            {/* Reports Queue */}
            {communityReports.length > 0 && (
              <div className="p-6 rounded-3xl bg-amber-50/60 border border-amber-200 shadow-xs space-y-4">
                <h3 className="font-serif-title text-base font-bold text-amber-950 flex items-center gap-2">
                  <Flag className="w-4 h-4 text-amber-700" />
                  <span>Pending Community Reports ({communityReports.length})</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {communityReports.map((r) => (
                    <div
                      key={r.id}
                      className="p-4 rounded-2xl bg-white border border-amber-200 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-rose-700 uppercase tracking-wider text-[10px]">
                          Reason: {r.reason}
                        </span>
                        <span className="text-[10px] text-slate-400">{formatDate(r.created_at)}</span>
                      </div>
                      <p className="text-[#0f172a] font-medium">{r.details || 'No additional notes provided.'}</p>
                      <div className="flex items-center justify-end gap-2 pt-2">
                        <button
                          onClick={() => handleResolveReport(r.id, 'dismissed')}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#0f172a] font-semibold text-[11px]"
                        >
                          Dismiss
                        </button>
                        <button
                          onClick={() => handleResolveReport(r.id, 'resolved')}
                          className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-[11px]"
                        >
                          Mark Action Taken
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Posts Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif-title text-xl font-bold text-[#0f172a]">
                  Community Posts & Stories ({communityPosts.length})
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {communityPosts.map((post) => (
                  <div
                    key={post.id}
                    className="bg-white rounded-3xl border border-[#e2e8f0] p-6 shadow-xs flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={post.author_image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                            alt={post.author_name}
                            className="w-8 h-8 rounded-full object-cover border border-[#e2e8f0]"
                          />
                          <div>
                            <div className="text-xs font-bold text-[#0f172a]">{post.author_name}</div>
                            <div className="text-[10px] text-[#64748b]">{formatDate(post.created_at)}</div>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[#64748b] text-[10px] font-bold">
                          {post.destination}
                        </span>
                      </div>

                      <h4 className="font-serif-title text-base font-bold text-[#0f172a]">
                        {post.title}
                      </h4>
                      <p className="text-xs text-[#64748b] line-clamp-3 leading-relaxed">
                        {post.content}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[#e2e8f0] flex items-center justify-between text-xs">
                      <span className="text-[#64748b] text-[11px]">
                        ❤️ {post.likes_count || 0} likes • 💬 {post.comments_count || 0} comments
                      </span>
                      <button
                        onClick={() => setPostToDelete(post)}
                        className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs transition-colors flex items-center gap-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Story</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 5. GLOBAL ITINERARIES */}
        {currentSection === 'trips' && (
          <div className="space-y-6">
            <h3 className="font-serif-title text-xl font-bold text-[#0f172a]">
              Global Itinerary Records ({allTrips.length})
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allTrips.map((t) => (
                <div
                  key={t.id}
                  className="bg-white rounded-3xl border border-[#e2e8f0] overflow-hidden shadow-xs flex flex-col justify-between"
                >
                  <div>
                    {t.cover_image && (
                      <img src={t.cover_image} alt={t.title} className="w-full h-36 object-cover" />
                    )}
                    <div className="p-5 space-y-2">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-[#C59B27]">
                        {t.destination} • {t.duration} Days
                      </div>
                      <h4 className="font-serif-title text-base font-bold text-[#0f172a]">
                        {t.title}
                      </h4>
                      <p className="text-xs text-[#64748b] line-clamp-2">{t.summary}</p>
                      <div className="text-[11px] text-[#64748b] pt-1">
                        Budget: <span className="font-bold text-[#0f172a]">{formatCurrency(t.total_budget || 0)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 border-t border-[#e2e8f0] flex items-center justify-between text-xs">
                    <span className="text-[10px] text-[#64748b]">ID: {t.id}</span>
                    <button
                      onClick={async () => {
                        if (window.confirm(`Delete itinerary "${t.title}"?`)) {
                          await deleteTripAsAdmin(t.id, user);
                          setAllTrips((prev) => prev.filter((item) => item.id !== t.id));
                          showNotification('Itinerary deleted.');
                        }
                      }}
                      className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. FEEDBACK & RATINGS */}
        {currentSection === 'feedback' && (
          <div className="space-y-6">
            <h3 className="font-serif-title text-xl font-bold text-[#0f172a]">
              Traveler Reviews & Experience Feedback ({feedbacks.length})
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {feedbacks.map((f) => (
                <div
                  key={f.id}
                  className="p-6 rounded-3xl bg-white border border-[#e2e8f0] shadow-xs space-y-3 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-4 h-4 ${
                            s <= f.overall_rating
                              ? 'text-[#C59B27] fill-[#C59B27]'
                              : 'text-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider ${
                        f.category === 'praise'
                          ? 'bg-emerald-100 text-emerald-800'
                          : f.category === 'suggestion'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {f.category}
                    </span>
                  </div>

                  <p className="text-[#0f172a] font-medium leading-relaxed">
                    "{f.comment}"
                  </p>

                  <div className="pt-2 border-t border-[#e2e8f0] flex items-center justify-between text-[11px] text-[#64748b]">
                    <span>
                      {f.user_name || 'Traveler'} • {f.destination || 'India'}
                    </span>
                    <div className="flex items-center gap-2">
                      {f.status !== 'resolved' ? (
                        <button
                          onClick={() => handleFeedbackStatus(f.id, 'resolved')}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 font-semibold text-[#0f172a]"
                        >
                          Mark Resolved
                        </button>
                      ) : (
                        <span className="text-emerald-700 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Resolved</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {feedbacks.length === 0 && (
                <div className="p-8 text-center text-xs text-[#64748b] bg-white rounded-3xl border border-[#e2e8f0] col-span-full">
                  No traveler feedback logged yet.
                </div>
              )}
            </div>
          </div>
        )}

        {/* 7. SECURITY & ACCESS TAB */}
        {currentSection === 'security' && (
          <div className="max-w-3xl space-y-6">
            <div className="p-8 rounded-3xl bg-white border border-[#e2e8f0] shadow-xs space-y-6">
              <h3 className="font-serif-title text-xl font-bold text-[#0f172a] flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#C59B27]" />
                <span>Primary Administrator Security Profile</span>
              </h3>

              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-[#e2e8f0] space-y-1">
                  <div className="text-xs font-bold text-[#64748b] uppercase tracking-wider">
                    Authoritative Admin UID
                  </div>
                  <div className="text-sm font-mono font-bold text-[#0f172a]">
                    {PRIMARY_ADMIN_UID}
                  </div>
                  <div className="text-[11px] text-emerald-700 font-semibold">
                    ✓ Verified in Firestore Security Rules & Server API Middleware
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-[#e2e8f0] space-y-1">
                  <div className="text-xs font-bold text-[#64748b] uppercase tracking-wider">
                    Access Policy
                  </div>
                  <p className="text-xs text-[#0f172a] leading-relaxed">
                    Only the authenticated user matching UID <code className="font-mono bg-slate-200 px-1 rounded">{PRIMARY_ADMIN_UID}</code> is granted full administrative privilege across database mutations, user suspensions, role updates, and platform catalogs.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Place Creation / Edit Modal */}
      {isPlaceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-[#e2e8f0] w-full max-w-xl p-6 sm:p-8 space-y-5 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between">
              <h3 className="font-serif-title text-lg font-bold text-[#0f172a]">
                {editingPlace.id ? 'Edit Destination Place' : 'Add Landmark to Catalog'}
              </h3>
              <button onClick={() => setIsPlaceModalOpen(false)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePlace} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#64748b] mb-1 uppercase tracking-wider text-[10px]">
                  Place Name
                </label>
                <input
                  type="text"
                  required
                  value={editingPlace.name || ''}
                  onChange={(e) => setEditingPlace({ ...editingPlace, name: e.target.value })}
                  placeholder="e.g. Fort Aguada Lighthouse"
                  className="w-full p-3 rounded-xl border border-[#e2e8f0] focus:border-[#0f172a] outline-none font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#64748b] mb-1 uppercase tracking-wider text-[10px]">
                    Destination
                  </label>
                  <select
                    value={editingPlace.destination || 'Goa'}
                    onChange={(e) => setEditingPlace({ ...editingPlace, destination: e.target.value })}
                    className="w-full p-3 rounded-xl border border-[#e2e8f0] font-semibold bg-white"
                  >
                    {['Goa', 'Jaipur', 'Kerala', 'Kolkata', 'Darjeeling', 'Manali', 'Varanasi', 'Agra'].map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#64748b] mb-1 uppercase tracking-wider text-[10px]">
                    Category
                  </label>
                  <select
                    value={editingPlace.category || 'Attraction'}
                    onChange={(e) => setEditingPlace({ ...editingPlace, category: e.target.value as any })}
                    className="w-full p-3 rounded-xl border border-[#e2e8f0] font-semibold bg-white"
                  >
                    <option value="Attraction">Attraction</option>
                    <option value="Restaurant">Restaurant</option>
                    <option value="Hotel">Hotel</option>
                    <option value="Activity">Activity</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#64748b] mb-1 uppercase tracking-wider text-[10px]">
                    Estimated Cost (₹)
                  </label>
                  <input
                    type="number"
                    value={editingPlace.estimated_cost || 0}
                    onChange={(e) => setEditingPlace({ ...editingPlace, estimated_cost: Number(e.target.value) })}
                    className="w-full p-3 rounded-xl border border-[#e2e8f0] font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#64748b] mb-1 uppercase tracking-wider text-[10px]">
                    Rating (1-5)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={editingPlace.rating || 4.8}
                    onChange={(e) => setEditingPlace({ ...editingPlace, rating: Number(e.target.value) })}
                    className="w-full p-3 rounded-xl border border-[#e2e8f0] font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#64748b] mb-1 uppercase tracking-wider text-[10px]">
                  Image URL
                </label>
                <input
                  type="url"
                  required
                  value={editingPlace.image || ''}
                  onChange={(e) => setEditingPlace({ ...editingPlace, image: e.target.value })}
                  className="w-full p-3 rounded-xl border border-[#e2e8f0] font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-[#64748b] mb-1 uppercase tracking-wider text-[10px]">
                  Description
                </label>
                <textarea
                  rows={3}
                  required
                  value={editingPlace.description || ''}
                  onChange={(e) => setEditingPlace({ ...editingPlace, description: e.target.value })}
                  className="w-full p-3 rounded-xl border border-[#e2e8f0] font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsPlaceModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#0f172a] hover:bg-[#1e293b] text-[#f8fafc] font-semibold shadow-xs"
                >
                  Save Place
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-[#e2e8f0] w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <h4 className="font-serif-title text-lg font-bold text-[#0f172a]">
              Delete Traveler Account?
            </h4>
            <p className="text-xs text-[#64748b] leading-relaxed">
              Are you sure you want to delete <strong className="text-[#0f172a]">{userToDelete.name}</strong> ({userToDelete.email})? This action will remove all user itineraries, bookmarks, and account records.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteUser}
                className="px-4 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-semibold shadow-xs"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Post Confirmation Modal */}
      {postToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-[#e2e8f0] w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <h4 className="font-serif-title text-lg font-bold text-[#0f172a]">
              Delete Community Post?
            </h4>
            <p className="text-xs text-[#64748b] leading-relaxed">
              Are you sure you want to remove <strong className="text-[#0f172a]">"{postToDelete.title}"</strong> by {postToDelete.author_name}?
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setPostToDelete(null)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeletePost}
                className="px-4 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-semibold shadow-xs"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
