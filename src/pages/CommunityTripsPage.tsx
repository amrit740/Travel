import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Users,
  Compass,
  Search,
  Plus,
  Bookmark,
  User,
  Sparkles,
  Luggage,
  BookOpen,
  Lightbulb,
  Utensils,
  Star,
  AlertTriangle,
  RotateCcw,
  SlidersHorizontal,
  Flame,
  Clock,
  Globe,
  Lock,
  RefreshCw,
  Loader2,
  Share2,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { CommunityService } from '../services/communityService';
import { CommunityPost, CommunityPostType, Trip } from '../types';
import { CommunityPostCard } from '../components/community/CommunityPostCard';
import { CreatePostModal } from '../components/community/CreatePostModal';
import { EditPostModal } from '../components/community/EditPostModal';
import { PublicUserProfileModal } from '../components/community/PublicUserProfileModal';
import { ReportPostModal } from '../components/community/ReportPostModal';
import { RemixTripModal } from '../components/trip/RemixTripModal';

const POST_FILTER_TYPES: { type: string; label: string; icon: any }[] = [
  { type: 'All', label: 'All Content', icon: Compass },
  { type: 'trip', label: 'Itineraries', icon: Luggage },
  { type: 'story', label: 'Stories', icon: BookOpen },
  { type: 'tip', label: 'Tips & Guides', icon: Lightbulb },
  { type: 'food', label: 'Food & Dining', icon: Utensils },
  { type: 'review', label: 'Reviews', icon: Star },
  { type: 'warning', label: 'Notices', icon: AlertTriangle },
];

const SUGGESTED_TAGS = [
  'All',
  'Budget',
  'Solo',
  'Student Mode',
  'Family',
  'Culture & Heritage',
  'Nature & Wildlife',
  'Beaches',
  'Foodie Paradise',
  'Adventure',
  'Hidden Gems',
  'Luxury',
];

export const CommunityTripsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, isAuthenticated } = useAuth();

  // Active view tab: 'feed' | 'following' | 'saved' | 'my_posts'
  const [activeTab, setActiveTab] = useState<'feed' | 'following' | 'saved' | 'my_posts'>('feed');

  // Search and filters
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [selectedPostType, setSelectedPostType] = useState<string>('All');
  const [sortFilter, setSortFilter] = useState<'latest' | 'popular'>('latest');

  // Data states
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [followingPosts, setFollowingPosts] = useState<CommunityPost[]>([]);
  const [savedPosts, setSavedPosts] = useState<CommunityPost[]>([]);
  const [myPosts, setMyPosts] = useState<CommunityPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [tripToAttach, setTripToAttach] = useState<Trip | null>(null);
  const [editingPost, setEditingPost] = useState<CommunityPost | null>(null);
  const [viewProfileUserId, setViewProfileUserId] = useState<string | null>(null);
  const [reportingPostData, setReportingPostData] = useState<{ id: string; title: string } | null>(null);
  const [remixTripData, setRemixTripData] = useState<Partial<Trip> | null>(null);

  // Real-time subscription to feed posts
  useEffect(() => {
    setIsLoading(true);

    const unsubscribe = CommunityService.subscribeToFeed(
      (livePosts) => {
        setPosts(livePosts);
        setIsLoading(false);
        setIsRefreshing(false);
      },
      (err) => {
        console.error('Community live stream error:', err);
        setIsLoading(false);
        setIsRefreshing(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  // Fetch saved, following, and user's posts when switching tabs or when authenticated
  const loadTabSpecificData = async () => {
    if (!isAuthenticated || !user) return;

    try {
      if (activeTab === 'following') {
        const res = await CommunityService.getPosts({ filter: 'following' });
        setFollowingPosts(res.posts || []);
      } else if (activeTab === 'saved') {
        const saved = await CommunityService.getSavedPosts();
        setSavedPosts(saved);
      } else if (activeTab === 'my_posts') {
        const res = await CommunityService.getPosts({ author_id: user.id });
        setMyPosts(res.posts);
      }
    } catch (err) {
      console.error('Error fetching tab data:', err);
    }
  };

  useEffect(() => {
    loadTabSpecificData();
  }, [activeTab, isAuthenticated, user]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      const res = await CommunityService.getPosts();
      setPosts(res.posts);
      await loadTabSpecificData();
    } catch (err) {
      console.error('Manual refresh failed:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Filter and search computation
  const currentList = useMemo(() => {
    if (activeTab === 'following') return followingPosts;
    if (activeTab === 'saved') return savedPosts;
    if (activeTab === 'my_posts') return myPosts;
    return posts;
  }, [activeTab, posts, followingPosts, savedPosts, myPosts]);

  const filteredPosts = useMemo(() => {
    let result = [...currentList];

    // Filter by tag
    if (selectedTag !== 'All') {
      const tagLower = selectedTag.toLowerCase();
      result = result.filter((p) =>
        (p.tags || []).some((t) => t.toLowerCase() === tagLower)
      );
    }

    // Filter by post type
    if (selectedPostType !== 'All') {
      result = result.filter((p) => p.post_type === selectedPostType);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          (p.title || '').toLowerCase().includes(q) ||
          (p.content || '').toLowerCase().includes(q) ||
          (p.destination || '').toLowerCase().includes(q) ||
          (p.author_name || '').toLowerCase().includes(q) ||
          (p.tags || []).some((t) => t.toLowerCase().includes(q))
      );
    }

    // Sorting
    if (sortFilter === 'popular') {
      result.sort(
        (a, b) =>
          (b.likes_count || 0) + (b.comments_count || 0) - ((a.likes_count || 0) + (a.comments_count || 0))
      );
    } else {
      result.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }

    return result;
  }, [currentList, selectedTag, selectedPostType, searchQuery, sortFilter]);

  const handlePostCreated = (newPost: CommunityPost) => {
    setPosts((prev) => [newPost, ...prev]);
    if (activeTab === 'my_posts') {
      setMyPosts((prev) => [newPost, ...prev]);
    }
  };

  const handlePostUpdated = (updated: CommunityPost) => {
    setPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    setSavedPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    setMyPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const handlePostDeleted = (deletedId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== deletedId));
    setSavedPosts((prev) => prev.filter((p) => p.id !== deletedId));
    setMyPosts((prev) => prev.filter((p) => p.id !== deletedId));
  };

  return (
    <div className="min-h-screen bg-[#F7F5EF] pb-24">
      {/* Top Hero Header */}
      <div className="bg-[#0B3D2E] text-[#F7F5EF] py-12 px-4 sm:px-6 lg:px-8 border-b border-[#C8A96B]/30 relative overflow-hidden">
        {/* Subtle decorative background element */}
        <div className="absolute -right-16 -top-16 w-96 h-96 rounded-full bg-[#176B50]/20 blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto space-y-5 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C8A96B]/20 border border-[#C8A96B]/30 text-[#C8A96B] text-xs font-semibold uppercase tracking-wider">
                <Users className="w-3.5 h-3.5" />
                <span>TravelWise Community</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white">
                Real Stories, <span className="text-[#C8A96B] italic">Authentic Journeys</span>
              </h1>
              <p className="text-xs sm:text-sm text-[#F7F5EF]/80 max-w-xl font-light leading-relaxed">
                Connect with travelers worldwide. Share your travel stories, explore real itineraries, discover local gems, and remix journeys in 1-click.
              </p>
            </div>

            {/* Primary Action Button */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  if (!isAuthenticated) {
                    navigate('/login?redirect=/community');
                    return;
                  }
                  setIsCreateModalOpen(true);
                }}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#C8A96B] text-[#18221E] text-xs sm:text-sm font-bold shadow-lg hover:bg-[#D6BC83] active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4 text-[#0B3D2E]" />
                <span>Create Post</span>
              </button>
            </div>
          </div>

          {/* Search Input */}
          <div className="pt-2 max-w-2xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#66736C]" />
              <input
                type="text"
                placeholder="Search Indian destinations (Goa, Jaipur, Manali, Kerala), story keywords, or traveler name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white text-[#18221E] placeholder:text-[#66736C] pl-11 pr-10 py-3 rounded-2xl text-xs sm:text-sm font-medium shadow-md border border-transparent focus:outline-none focus:ring-2 focus:ring-[#C8A96B]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#66736C] hover:text-[#18221E]"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Navigation Tabs (Feed / Following / Saved / My Posts) & Refresh */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E3E7E2] pb-4">
          <div className="flex items-center gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('feed')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'feed'
                  ? 'bg-[#0B3D2E] text-white shadow-xs'
                  : 'bg-white text-[#66736C] border border-[#E3E7E2] hover:text-[#18221E]'
              }`}
            >
              <Globe className="w-4 h-4 text-[#C8A96B]" />
              <span>Explore</span>
              <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px]">
                {posts.length}
              </span>
            </button>

            <button
              onClick={() => {
                if (!isAuthenticated) {
                  navigate('/login?redirect=/community');
                  return;
                }
                setActiveTab('following');
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'following'
                  ? 'bg-[#0B3D2E] text-white shadow-xs'
                  : 'bg-white text-[#66736C] border border-[#E3E7E2] hover:text-[#18221E]'
              }`}
            >
              <Users className="w-4 h-4 text-[#C8A96B]" />
              <span>Following</span>
            </button>

            <button
              onClick={() => {
                if (!isAuthenticated) {
                  navigate('/login?redirect=/community');
                  return;
                }
                setActiveTab('saved');
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'saved'
                  ? 'bg-[#0B3D2E] text-white shadow-xs'
                  : 'bg-white text-[#66736C] border border-[#E3E7E2] hover:text-[#18221E]'
              }`}
            >
              <Bookmark className="w-4 h-4 text-[#C8A96B]" />
              <span>Saved</span>
            </button>

            <button
              onClick={() => {
                if (!isAuthenticated) {
                  navigate('/login?redirect=/community');
                  return;
                }
                setActiveTab('my_posts');
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'my_posts'
                  ? 'bg-[#0B3D2E] text-white shadow-xs'
                  : 'bg-white text-[#66736C] border border-[#E3E7E2] hover:text-[#18221E]'
              }`}
            >
              <User className="w-4 h-4 text-[#C8A96B]" />
              <span>My Stories</span>
            </button>
          </div>

          {/* Sort & Manual Refresh controls */}
          <div className="flex items-center gap-2">
            <div className="flex bg-white rounded-xl border border-[#E3E7E2] p-1">
              <button
                type="button"
                onClick={() => setSortFilter('latest')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  sortFilter === 'latest'
                    ? 'bg-[#0B3D2E] text-white'
                    : 'text-[#66736C] hover:text-[#18221E]'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Latest</span>
              </button>
              <button
                type="button"
                onClick={() => setSortFilter('popular')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  sortFilter === 'popular'
                    ? 'bg-[#0B3D2E] text-white'
                    : 'text-[#66736C] hover:text-[#18221E]'
                }`}
              >
                <Flame className="w-3.5 h-3.5 text-[#C8A96B]" />
                <span>Popular</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="p-2 rounded-xl bg-white border border-[#E3E7E2] text-[#66736C] hover:text-[#18221E] hover:bg-black/5 transition-colors disabled:opacity-50"
              title="Refresh feed"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#0B3D2E]' : ''}`} />
            </button>
          </div>
        </div>

        {/* Content Type Filter Pills */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {POST_FILTER_TYPES.map(({ type, label, icon: Icon }) => {
              const isSelected = selectedPostType === type;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSelectedPostType(type)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                    isSelected
                      ? 'bg-[#0B3D2E] text-white shadow-xs'
                      : 'bg-white text-[#66736C] hover:text-[#18221E] border border-[#E3E7E2]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-[#C8A96B]' : 'text-[#66736C]'}`} />
                  <span>{label}</span>
                </button>
              );
            })}
          </div>

          {/* Tags bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-[11px] font-semibold text-[#66736C] uppercase tracking-wider pr-1">
              Themes:
            </span>
            {SUGGESTED_TAGS.map((tag) => {
              const isSelected = selectedTag === tag;
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSelectedTag(tag)}
                  className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                    isSelected
                      ? 'bg-[#C8A96B] text-[#18221E] font-bold shadow-xs'
                      : 'bg-white/80 text-[#66736C] hover:bg-white border border-[#E3E7E2]'
                  }`}
                >
                  #{tag}
                </button>
              );
            })}
          </div>
        </div>

        {/* Posts Feed Grid / List */}
        {isLoading ? (
          <div className="py-24 text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#0B3D2E] mx-auto" />
            <p className="text-xs text-[#66736C] font-medium">
              Connecting to real-time community stream...
            </p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-3xl border border-[#E3E7E2] p-8 max-w-lg mx-auto space-y-4 shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-[#F7F5EF] text-[#0B3D2E] flex items-center justify-center mx-auto">
              <Compass className="w-7 h-7 text-[#C8A96B]" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-[#18221E]">
                {activeTab === 'following'
                  ? 'No Posts From Followed Travelers'
                  : activeTab === 'saved'
                  ? 'No Saved Posts Yet'
                  : activeTab === 'my_posts'
                  ? 'You Haven’t Posted Yet'
                  : 'No Community Posts Match Your Filters'}
              </h3>
              <p className="text-xs text-[#66736C] leading-relaxed">
                {activeTab === 'following'
                  ? 'Follow other travelers on TravelWise to see their latest itineraries, guides, and stories in your personal feed.'
                  : activeTab === 'saved'
                  ? 'Bookmark useful posts and itineraries using the bookmark icon on any community card.'
                  : activeTab === 'my_posts'
                  ? 'Share your first trip itinerary or travel story with the TravelWise community.'
                  : 'Be the first traveler to share your story or journey for this destination or theme!'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                if (!isAuthenticated) {
                  navigate('/login?redirect=/community');
                  return;
                }
                setIsCreateModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0B3D2E] text-white text-xs font-bold shadow-md hover:bg-[#0B3D2E]/90 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4 text-[#C8A96B]" />
              <span>Create First Post</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredPosts.map((post) => (
              <CommunityPostCard
                key={post.id}
                post={post}
                onPostUpdated={handlePostUpdated}
                onPostDeleted={handlePostDeleted}
                onViewProfile={(userId) => setViewProfileUserId(userId)}
                onReportPost={(postId, title) => setReportingPostData({ id: postId, title })}
                onEditPost={(p) => setEditingPost(p)}
                onRemixTrip={(tripSnapshot) => setRemixTripData(tripSnapshot)}
              />
            ))}
          </div>
        )}
      </div>

      {/* 1. Create Post Modal */}
      {isCreateModalOpen && (
        <CreatePostModal
          isOpen={isCreateModalOpen}
          onClose={() => {
            setIsCreateModalOpen(false);
            setTripToAttach(null);
          }}
          onPostCreated={handlePostCreated}
          initialTrip={tripToAttach}
        />
      )}

      {/* 2. Edit Post Modal */}
      {editingPost && (
        <EditPostModal
          post={editingPost}
          isOpen={!!editingPost}
          onClose={() => setEditingPost(null)}
          onPostUpdated={handlePostUpdated}
        />
      )}

      {/* 3. Public User Profile Modal */}
      {viewProfileUserId && (
        <PublicUserProfileModal
          userId={viewProfileUserId}
          isOpen={!!viewProfileUserId}
          onClose={() => setViewProfileUserId(null)}
        />
      )}

      {/* 4. Report Post Modal */}
      {reportingPostData && (
        <ReportPostModal
          postId={reportingPostData.id}
          postTitle={reportingPostData.title}
          isOpen={!!reportingPostData}
          onClose={() => setReportingPostData(null)}
        />
      )}

      {/* 5. Remix Trip Modal */}
      {remixTripData && (
        <RemixTripModal
          isOpen={!!remixTripData}
          onClose={() => setRemixTripData(null)}
          sourceTrip={remixTripData}
        />
      )}
    </div>
  );
};
