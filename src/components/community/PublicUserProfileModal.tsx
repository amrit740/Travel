import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, User, MapPin, Compass, Calendar, Luggage, MessageSquare, Heart, Sparkles, Loader2, UserPlus, UserCheck, Users } from 'lucide-react';
import { CommunityService } from '../../services/communityService';
import { PublicUserProfile, CommunityPost } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

interface PublicUserProfileModalProps {
  userId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectPost?: (post: CommunityPost) => void;
}

export const PublicUserProfileModal: React.FC<PublicUserProfileModalProps> = ({
  userId,
  isOpen,
  onClose,
  onSelectPost,
}) => {
  const { user: currentUser, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<PublicUserProfile | null>(null);
  const [userPosts, setUserPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  useEffect(() => {
    if (!isOpen || !userId) return;

    let isMounted = true;
    setLoading(true);

    Promise.all([
      CommunityService.getPublicProfile(userId),
      CommunityService.getPosts({ author_id: userId }),
    ])
      .then(([prof, postsRes]) => {
        if (isMounted) {
          setProfile(prof);
          if (prof) {
            setIsFollowing(!!prof.is_following);
            setFollowersCount(prof.followers_count || 0);
            setFollowingCount(prof.following_count || 0);
          }
          setUserPosts(postsRes.posts || []);
        }
      })
      .catch((err) => {
        console.error('Error fetching public profile:', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, userId]);

  const handleToggleFollow = async () => {
    if (!userId || !isAuthenticated || followLoading) return;
    if (currentUser?.id === userId) return;

    setFollowLoading(true);
    const prevFollowing = isFollowing;
    const prevFollowersCount = followersCount;

    // Optimistic update
    setIsFollowing(!prevFollowing);
    setFollowersCount(prevFollowing ? Math.max(0, prevFollowersCount - 1) : prevFollowersCount + 1);

    try {
      const res = await CommunityService.toggleFollow(userId);
      setIsFollowing(res.is_following);
      setFollowersCount(res.followers_count);
    } catch (err) {
      console.error('Failed to toggle follow:', err);
      // Revert
      setIsFollowing(prevFollowing);
      setFollowersCount(prevFollowersCount);
    } finally {
      setFollowLoading(false);
    }
  };

  if (!isOpen) return null;

  const isSelf = currentUser?.id === userId;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8"
        >
          {/* Top Banner */}
          <div className="h-28 bg-gradient-to-r from-slate-900 to-slate-800 relative p-4 flex justify-end">
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Profile Card Body */}
          <div className="px-6 pb-6 pt-0 relative -mt-12">
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-7 h-7 animate-spin text-slate-900" />
                <p className="text-xs text-slate-500">Loading travel profile...</p>
              </div>
            ) : profile ? (
              <div className="space-y-5">
                {/* Avatar & Header */}
                <div className="flex items-end justify-between">
                  <div className="flex items-end gap-3.5">
                    <div className="w-20 h-20 rounded-2xl border-4 border-white shadow-md overflow-hidden bg-slate-100">
                      <img
                        src={
                          profile.profile_image ||
                          `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80`
                        }
                        alt={profile.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="pb-1">
                      <h3 className="text-lg font-serif font-bold text-slate-900">{profile.name}</h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-[#C59B27]" />
                        Member since {new Date(profile.created_at || Date.now()).getFullYear()}
                      </p>
                    </div>
                  </div>

                  {/* Follow Button */}
                  {!isSelf && isAuthenticated && (
                    <button
                      onClick={handleToggleFollow}
                      disabled={followLoading}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm ${
                        isFollowing
                          ? 'bg-slate-200 text-slate-900 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 border border-transparent'
                          : 'bg-slate-900 text-white hover:bg-slate-800'
                      }`}
                    >
                      {followLoading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : isFollowing ? (
                        <>
                          <UserCheck className="w-3.5 h-3.5 text-teal-700" />
                          Following
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-3.5 h-3.5" />
                          Follow
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Bio */}
                {profile.bio && (
                  <p className="text-xs text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed">
                    "{profile.bio}"
                  </p>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-4 gap-2">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                    <span className="text-sm font-bold text-slate-900 block">{followersCount}</span>
                    <span className="text-[10px] text-slate-500 block uppercase font-medium">Followers</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                    <span className="text-sm font-bold text-slate-900 block">{followingCount}</span>
                    <span className="text-[10px] text-slate-500 block uppercase font-medium">Following</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                    <span className="text-sm font-bold text-slate-900 block">{profile.posts_count || userPosts.length}</span>
                    <span className="text-[10px] text-slate-500 block uppercase font-medium">Posts</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                    <span className="text-sm font-bold text-slate-900 block">{profile.trips_count || 0}</span>
                    <span className="text-[10px] text-slate-500 block uppercase font-medium">Trips</span>
                  </div>
                </div>

                {/* Travel Style Tags */}
                {profile.travel_style && profile.travel_style.length > 0 && (
                  <div>
                    <span className="text-xs font-semibold text-slate-900 block mb-2">Travel Interests</span>
                    <div className="flex flex-wrap gap-1.5">
                      {profile.travel_style.map((style, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-medium"
                        >
                          {style}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Public Posts Section */}
                <div>
                  <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-2.5">
                    Public Posts ({userPosts.length})
                  </h4>

                  {userPosts.length === 0 ? (
                    <div className="p-6 text-center bg-slate-50 rounded-xl border border-slate-200">
                      <p className="text-xs text-slate-500">This traveler has not published any public posts yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {userPosts.map((post) => (
                        <div
                          key={post.id}
                          onClick={() => {
                            if (onSelectPost) {
                              onSelectPost(post);
                              onClose();
                            }
                          }}
                          className="p-3 rounded-xl border border-slate-200 bg-white hover:border-slate-400 hover:shadow-sm transition-all cursor-pointer flex items-center justify-between"
                        >
                          <div className="space-y-1">
                            <span className="text-xs font-bold text-slate-900 line-clamp-1">{post.title}</span>
                            <div className="flex items-center gap-2 text-[11px] text-slate-500">
                              <span className="flex items-center gap-0.5 text-slate-900">
                                <MapPin className="w-3 h-3 text-[#C59B27]" /> {post.destination}
                              </span>
                              <span>•</span>
                              <span>{new Date(post.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <Heart className="w-3.5 h-3.5 text-rose-500" /> {post.likes_count || 0}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageSquare className="w-3.5 h-3.5" /> {post.comments_count || 0}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-slate-500">User not found.</div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
