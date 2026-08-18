import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Heart,
  MessageSquare,
  Bookmark,
  Share2,
  MoreHorizontal,
  MapPin,
  Calendar,
  Luggage,
  Sparkles,
  BookOpen,
  Utensils,
  Lightbulb,
  AlertTriangle,
  Star,
  Send,
  Trash2,
  Edit2,
  Check,
  Globe,
  Lock,
  Loader2,
  Copy,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  CornerDownRight,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { apiTrips } from '../../services/api';
import { CommunityService } from '../../services/communityService';
import { CommunityPost, CommunityComment, CommunityPostType } from '../../types';
import { formatCurrency } from '../../lib/utils';

interface CommunityPostCardProps {
  post: CommunityPost;
  onPostUpdated?: (post: CommunityPost) => void;
  onPostDeleted?: (postId: string) => void;
  onViewProfile?: (userId: string) => void;
  onReportPost?: (postId: string, postTitle: string) => void;
  onEditPost?: (post: CommunityPost) => void;
  onRemixTrip?: (tripSnapshot: any) => void;
}

const TYPE_CONFIG: Record<
  CommunityPostType,
  { label: string; icon: any; badgeClass: string }
> = {
  trip: {
    label: 'Trip Itinerary',
    icon: Luggage,
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  },
  story: {
    label: 'Travel Story',
    icon: BookOpen,
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
  },
  tip: {
    label: 'Travel Tip',
    icon: Lightbulb,
    badgeClass: 'bg-blue-50 text-blue-800 border-blue-200',
  },
  food: {
    label: 'Food & Dining',
    icon: Utensils,
    badgeClass: 'bg-rose-50 text-rose-800 border-rose-200',
  },
  review: {
    label: 'Place Review',
    icon: Star,
    badgeClass: 'bg-purple-50 text-purple-800 border-purple-200',
  },
  warning: {
    label: 'Travel Notice',
    icon: AlertTriangle,
    badgeClass: 'bg-orange-50 text-orange-800 border-orange-200',
  },
  experience: {
    label: 'Experience',
    icon: Sparkles,
    badgeClass: 'bg-teal-50 text-teal-800 border-teal-200',
  },
};

export const CommunityPostCard: React.FC<CommunityPostCardProps> = ({
  post,
  onPostUpdated,
  onPostDeleted,
  onViewProfile,
  onReportPost,
  onEditPost,
  onRemixTrip,
}) => {
  const { user, isAuthenticated } = useAuth();

  // Local interactive states
  const [isLiked, setIsLiked] = useState<boolean>(!!post.is_liked_by_user);
  const [likesCount, setLikesCount] = useState<number>(post.likes_count || 0);
  const [isSaved, setIsSaved] = useState<boolean>(!!post.is_saved_by_user);
  const [savesCount, setSavesCount] = useState<number>(post.saves_count || 0);
  const [commentsCount, setCommentsCount] = useState<number>(post.comments_count || 0);

  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState<{ id: string; userName: string } | null>(null);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentText, setEditCommentText] = useState('');

  const [showMenu, setShowMenu] = useState(false);
  const [isCopiedLink, setIsCopiedLink] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isRemixing, setIsRemixing] = useState(false);
  const [remixSuccessMessage, setRemixSuccessMessage] = useState<string | null>(null);

  const isAuthor = user?.id === post.author_id;
  const isAdmin = user?.role === 'admin' || user?.email === 'admin@travelwise.ai' || user?.email === 'anjalireal24@gmail.com';
  const typeConfig = TYPE_CONFIG[post.post_type] || TYPE_CONFIG.story;
  const TypeIcon = typeConfig.icon;

  // Real-time comments listener when expanded
  useEffect(() => {
    if (!showComments) return;
    const unsub = CommunityService.subscribeToComments(post.id, (list) => {
      setComments(list);
      setCommentsCount(list.length);
    });
    return () => unsub();
  }, [showComments, post.id]);

  const handleToggleLike = async () => {
    if (!isAuthenticated || !user) {
      alert('Please log in to like community posts.');
      return;
    }

    // Optimistic UI update
    const nextState = !isLiked;
    setIsLiked(nextState);
    setLikesCount((prev) => (nextState ? prev + 1 : Math.max(0, prev - 1)));

    try {
      const res = await CommunityService.toggleLike(post.id, user.id, user.name);
      setIsLiked(res.is_liked);
      setLikesCount(res.likes_count);
    } catch (err) {
      // Revert if failed
      setIsLiked(!nextState);
      setLikesCount((prev) => (!nextState ? prev + 1 : Math.max(0, prev - 1)));
    }
  };

  const handleToggleSave = async () => {
    if (!isAuthenticated || !user) {
      alert('Please log in to save community posts.');
      return;
    }

    const nextState = !isSaved;
    setIsSaved(nextState);
    setSavesCount((prev) => (nextState ? prev + 1 : Math.max(0, prev - 1)));

    try {
      const res = await CommunityService.toggleSave(post.id, user.id);
      setIsSaved(res.is_saved);
      setSavesCount(res.saves_count);
    } catch (err) {
      setIsSaved(!nextState);
      setSavesCount((prev) => (!nextState ? prev + 1 : Math.max(0, prev - 1)));
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/community?post=${post.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: `Check out "${post.title}" on TravelWise Community!`,
          url: shareUrl,
        });
        return;
      } catch (err) {
        // Fall through to copy to clipboard
      }
    }

    navigator.clipboard.writeText(shareUrl);
    setIsCopiedLink(true);
    setTimeout(() => setIsCopiedLink(false), 2500);
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    if (!isAuthenticated || !user) {
      alert('Please log in to comment.');
      return;
    }

    setIsSubmittingComment(true);
    try {
      const added = await CommunityService.addComment(
        post.id,
        newCommentText.trim(),
        replyingTo?.id,
        {
          id: user.id,
          name: user.name,
          profile_image: user.profile_image,
        }
      );
      if (replyingTo?.id) {
        setComments((prev) =>
          prev.map((c) =>
            c.id === replyingTo.id
              ? { ...c, replies: [...(c.replies || []), added] }
              : c
          )
        );
      } else {
        setComments((prev) => [...prev, { ...added, replies: [] }]);
      }
      setCommentsCount((prev) => prev + 1);
      setNewCommentText('');
      setReplyingTo(null);
    } catch (err) {
      console.error('Failed to add comment:', err);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string, parentCommentId?: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;
    try {
      await CommunityService.deleteComment(commentId, post.id);
      if (parentCommentId) {
        setComments((prev) =>
          prev.map((c) =>
            c.id === parentCommentId
              ? { ...c, replies: (c.replies || []).filter((r) => r.id !== commentId) }
              : c
          )
        );
      } else {
        setComments((prev) => prev.filter((c) => c.id !== commentId));
      }
      setCommentsCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to delete comment:', err);
    }
  };

  const handleUpdateComment = async (commentId: string, parentCommentId?: string) => {
    if (!editCommentText.trim()) return;
    try {
      const updated = await CommunityService.updateComment(commentId, editCommentText.trim());
      if (parentCommentId) {
        setComments((prev) =>
          prev.map((c) =>
            c.id === parentCommentId
              ? {
                  ...c,
                  replies: (c.replies || []).map((r) => (r.id === commentId ? { ...r, ...updated } : r)),
                }
              : c
          )
        );
      } else {
        setComments((prev) =>
          prev.map((c) => (c.id === commentId ? { ...c, ...updated } : c))
        );
      }
      setEditingCommentId(null);
      setEditCommentText('');
    } catch (err) {
      console.error('Failed to update comment:', err);
    }
  };

  const handleDeletePost = async () => {
    if (!confirm('Are you sure you want to delete this community post?')) return;
    try {
      await CommunityService.deletePost(post.id);
      if (onPostDeleted) onPostDeleted(post.id);
    } catch (err) {
      console.error('Failed to delete post:', err);
      alert('Could not delete post. Please try again.');
    }
  };

  // Remix Trip action
  const handleRemix = async () => {
    if (!isAuthenticated || !user) {
      alert('Please log in to remix this trip into your account.');
      return;
    }

    if (onRemixTrip && post.trip_snapshot) {
      onRemixTrip(post.trip_snapshot);
      return;
    }

    if (!post.trip_snapshot) {
      alert('No trip data attached to remix.');
      return;
    }

    setIsRemixing(true);
    try {
      const snap = post.trip_snapshot;
      const newTrip = await apiTrips.generate({
        destination: snap.destination || post.destination,
        start_date: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
        end_date: new Date(Date.now() + 86400000 * (7 + (snap.duration || 3))).toISOString().split('T')[0],
        travelers: 1,
        traveler_type: (snap.traveler_type as any) || 'Solo',
        budget: snap.total_budget || 25000,
        currency: snap.currency || 'INR',
        travel_style: ['Cultural', 'Adventure'],
        food_preferences: ['Local Cuisine'],
        accommodation: 'Hotel',
        transportation: 'Mixed',
        interests: ['Local Culture', 'Hidden Gems', 'Historical Sites'],
        special_notes: `Remixed from @${post.author_name}'s TravelWise community post: ${post.title}`,
      });

      setRemixSuccessMessage(`✨ Remixed! Added "${newTrip.title}" to your Saved Trips.`);
      setTimeout(() => setRemixSuccessMessage(null), 4000);
    } catch (err: any) {
      console.error('Failed to remix trip:', err);
      alert('Could not remix trip: ' + err.message);
    } finally {
      setIsRemixing(false);
    }
  };

  const isLongContent = (post.content || '').length > 280;

  return (
    <motion.article
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden"
    >
      {/* Top Author Bar */}
      <div className="p-4 sm:p-5 flex items-center justify-between gap-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onViewProfile && onViewProfile(post.author_id)}
            className="w-11 h-11 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 flex-shrink-0 hover:ring-2 hover:ring-slate-900 transition-all"
            title={`View ${post.author_name}'s travel profile`}
          >
            <img
              src={
                post.author_image ||
                `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80`
              }
              alt={post.author_name}
              className="w-full h-full object-cover"
            />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onViewProfile && onViewProfile(post.author_id)}
                className="text-sm font-bold text-slate-900 hover:underline transition-colors"
              >
                {post.author_name}
              </button>
              {post.visibility === 'private' && (
                <span className="flex items-center gap-0.5 text-[10px] font-semibold bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded border">
                  <Lock className="w-2.5 h-2.5" /> Private
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="flex items-center gap-1 text-slate-900 font-medium">
                <MapPin className="w-3 h-3 text-[#C59B27]" />
                {post.destination}
              </span>
              <span>•</span>
              <span>{new Date(post.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
            </div>
          </div>
        </div>

        {/* Post Type Badge & Options Menu */}
        <div className="flex items-center gap-2">
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${typeConfig.badgeClass}`}
          >
            <TypeIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{typeConfig.label}</span>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-8 z-30 w-44 bg-white rounded-xl shadow-xl border border-slate-200 py-1 text-xs">
                {isAuthor && onEditPost && (
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onEditPost(post);
                    }}
                    className="w-full text-left px-3.5 py-2 flex items-center gap-2 text-slate-900 hover:bg-slate-50"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-blue-600" />
                    Edit Post
                  </button>
                )}
                {(isAuthor || isAdmin) && (
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      handleDeletePost();
                    }}
                    className="w-full text-left px-3.5 py-2 flex items-center gap-2 text-rose-600 hover:bg-rose-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete Post
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowMenu(false);
                    if (onReportPost) onReportPost(post.id, post.title);
                  }}
                  className="w-full text-left px-3.5 py-2 flex items-center gap-2 text-slate-600 hover:bg-slate-50"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  Report Post
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-4 sm:p-5 space-y-3.5">
        {/* Post Title */}
        <h3 className="text-base sm:text-lg font-serif font-bold text-slate-900 leading-snug">
          {post.title}
        </h3>

        {/* Post Body / Story */}
        <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
          {isLongContent && !isExpanded ? (
            <>
              {post.content.slice(0, 280)}...
              <button
                type="button"
                onClick={() => setIsExpanded(true)}
                className="ml-1.5 text-xs font-semibold text-slate-900 hover:underline inline-flex items-center gap-0.5"
              >
                Read more <ChevronDown className="w-3 h-3" />
              </button>
            </>
          ) : (
            <>
              {post.content}
              {isLongContent && (
                <button
                  type="button"
                  onClick={() => setIsExpanded(false)}
                  className="ml-2 text-xs font-semibold text-slate-900 hover:underline inline-flex items-center gap-0.5"
                >
                  Show less <ChevronUp className="w-3 h-3" />
                </button>
              )}
            </>
          )}
        </div>

        {/* Attached Trip Snapshot (Interactive Card + Remix Feature) */}
        {post.trip_snapshot && (
          <div className="mt-4 p-4 rounded-xl bg-gradient-to-br from-slate-50 to-white border border-[#C59B27]/40 shadow-xs space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-slate-900 text-white text-[10px] font-bold tracking-wide uppercase">
                    Attached Itinerary
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    {post.trip_snapshot.duration || 3} Days • {post.trip_snapshot.traveler_type || 'Explorer'}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900">
                  {post.trip_snapshot.title || post.destination}
                </h4>
              </div>

              {post.trip_snapshot.total_budget && (
                <div className="text-right">
                  <span className="text-xs text-slate-500 block">Estimated Budget</span>
                  <span className="text-xs font-bold text-slate-900">
                    {formatCurrency(post.trip_snapshot.total_budget, post.trip_snapshot.currency || 'INR')}
                  </span>
                </div>
              )}
            </div>

            {post.trip_snapshot.itinerary_summary && (
              <p className="text-xs text-slate-600 line-clamp-2">
                {post.trip_snapshot.itinerary_summary}
              </p>
            )}

            {/* Remix Button */}
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#C59B27]" />
                Love this plan? Copy & customize it for your next trip!
              </span>
              <button
                type="button"
                onClick={handleRemix}
                disabled={isRemixing}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold shadow-xs hover:bg-slate-800 active:scale-95 transition-all disabled:opacity-50"
              >
                {isRemixing ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#E5C365]" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-[#E5C365]" />
                )}
                <span>Remix This Trip</span>
              </button>
            </div>

            {remixSuccessMessage && (
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center gap-1.5 border border-emerald-200">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>{remixSuccessMessage}</span>
              </div>
            )}
          </div>
        )}

        {/* Photos Grid */}
        {post.images && post.images.length > 0 && (
          <div
            className={`grid gap-2 rounded-xl overflow-hidden ${
              post.images.length === 1
                ? 'grid-cols-1 max-h-96'
                : post.images.length === 2
                ? 'grid-cols-2 max-h-72'
                : 'grid-cols-3 max-h-64'
            }`}
          >
            {post.images.map((imgUrl, i) => (
              <div key={i} className="relative group h-full overflow-hidden bg-black/5">
                <img
                  src={imgUrl}
                  alt={`Post photo ${i + 1}`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        )}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {post.tags.map((tag, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Interactive Action Bar */}
      <div className="px-4 sm:px-5 py-3 border-t border-slate-200 bg-white flex items-center justify-between">
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Like Button */}
          <button
            onClick={handleToggleLike}
            className={`flex items-center gap-1.5 text-xs font-semibold transition-colors ${
              isLiked ? 'text-rose-600' : 'text-slate-500 hover:text-rose-600'
            }`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-600' : ''}`} />
            <span>{likesCount}</span>
          </button>

          {/* Comment Button */}
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            <span>{commentsCount}</span>
          </button>

          {/* Save / Bookmark Button */}
          <button
            onClick={handleToggleSave}
            className={`flex items-center gap-1.5 text-xs font-semibold transition-colors ${
              isSaved ? 'text-slate-900' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-slate-900' : ''}`} />
            <span>{savesCount}</span>
          </button>
        </div>

        {/* Share Button */}
        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
          title="Share post"
        >
          {isCopiedLink ? (
            <span className="text-teal-700 font-semibold flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Copied!
            </span>
          ) : (
            <>
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">Share</span>
            </>
          )}
        </button>
      </div>

      {/* Real-time Comments Section */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-slate-200 bg-slate-50 p-4 sm:p-5 space-y-4"
          >
            {/* Replying banner indicator */}
            {replyingTo && (
              <div className="flex items-center justify-between px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-800">
                <span className="flex items-center gap-1.5 font-medium">
                  <CornerDownRight className="w-3.5 h-3.5 text-slate-600" />
                  Replying to <strong className="font-semibold text-slate-900">@{replyingTo.userName}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => setReplyingTo(null)}
                  className="text-slate-500 hover:text-slate-900 font-bold px-1.5 py-0.5 rounded text-xs transition-colors"
                >
                  ✕ Cancel
                </button>
              </div>
            )}

            {/* New Comment Input */}
            <form onSubmit={handleAddComment} className="flex gap-2">
              <input
                type="text"
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                placeholder={
                  !isAuthenticated
                    ? 'Log in to join the conversation...'
                    : replyingTo
                    ? `Reply to @${replyingTo.userName}...`
                    : 'Write a comment or ask for tips...'
                }
                disabled={!isAuthenticated || isSubmittingComment}
                className="flex-1 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 disabled:bg-gray-100"
              />
              <button
                type="submit"
                disabled={!isAuthenticated || isSubmittingComment || !newCommentText.trim()}
                className="px-3 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold disabled:opacity-40 hover:bg-slate-800 transition-colors flex items-center gap-1"
              >
                {isSubmittingComment ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>Send</span>
              </button>
            </form>

            {/* Comments List */}
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {comments.length === 0 ? (
                <p className="text-xs text-center py-4 text-slate-400">
                  No comments yet. Be the first to share your thoughts!
                </p>
              ) : (
                comments.map((comment) => {
                  const isCommentAuthor = user?.id === comment.user_id;
                  const isEditing = editingCommentId === comment.id;

                  return (
                    <div
                      key={comment.id}
                      className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img
                            src={
                              comment.user_image ||
                              `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80`
                            }
                            alt={comment.user_name}
                            className="w-5 h-5 rounded-full object-cover"
                          />
                          <span className="font-bold text-slate-900">{comment.user_name}</span>
                          <span className="text-[10px] text-slate-500">
                            {new Date(comment.created_at).toLocaleDateString()}
                          </span>
                        </div>

                        {(isCommentAuthor || isAdmin) && (
                          <div className="flex items-center gap-1">
                            {isCommentAuthor && !isEditing && (
                              <button
                                onClick={() => {
                                  setEditingCommentId(comment.id);
                                  setEditCommentText(comment.content);
                                }}
                                className="p-1 text-slate-500 hover:text-slate-900"
                                title="Edit comment"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteComment(comment.id)}
                              className="p-1 text-slate-500 hover:text-rose-600"
                              title="Delete comment"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>

                      {isEditing ? (
                        <div className="flex gap-2 pt-1">
                          <input
                            type="text"
                            value={editCommentText}
                            onChange={(e) => setEditCommentText(e.target.value)}
                            className="flex-1 px-2 py-1 rounded border border-slate-200 text-xs text-slate-900"
                          />
                          <button
                            onClick={() => handleUpdateComment(comment.id)}
                            className="px-2 py-1 rounded bg-slate-900 text-white text-[11px] font-semibold"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingCommentId(null)}
                            className="px-2 py-1 rounded text-slate-500 text-[11px]"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <p className="text-slate-700 leading-relaxed">{comment.content}</p>
                      )}

                      {/* Reply button */}
                      {isAuthenticated && !comment.parent_comment_id && (
                        <div className="pt-0.5">
                          <button
                            type="button"
                            onClick={() => setReplyingTo({ id: comment.id, userName: comment.user_name })}
                            className="text-[11px] text-slate-500 hover:text-slate-900 font-medium flex items-center gap-1 transition-colors"
                          >
                            <CornerDownRight className="w-3 h-3 text-slate-700" />
                            Reply
                          </button>
                        </div>
                      )}

                      {/* Threaded Nested Replies */}
                      {comment.replies && comment.replies.length > 0 && (
                        <div className="mt-2 pl-3.5 border-l-2 border-slate-200 space-y-2">
                          {comment.replies.map((reply) => {
                            const isReplyAuthor = user?.id === reply.user_id;
                            const isEditingReply = editingCommentId === reply.id;

                            return (
                              <div
                                key={reply.id}
                                className="p-2.5 bg-[#FAFAF8] rounded-xl border border-slate-200 text-xs space-y-1"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <img
                                      src={
                                        reply.user_image ||
                                        `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80`
                                      }
                                      alt={reply.user_name}
                                      className="w-4 h-4 rounded-full object-cover"
                                    />
                                    <span className="font-bold text-slate-900 text-[11px]">{reply.user_name}</span>
                                    <span className="text-[10px] text-slate-500">
                                      {new Date(reply.created_at).toLocaleDateString()}
                                    </span>
                                  </div>

                                  {(isReplyAuthor || isAdmin) && (
                                    <div className="flex items-center gap-1">
                                      {isReplyAuthor && !isEditingReply && (
                                        <button
                                          onClick={() => {
                                            setEditingCommentId(reply.id);
                                            setEditCommentText(reply.content);
                                          }}
                                          className="p-0.5 text-slate-500 hover:text-slate-900"
                                          title="Edit reply"
                                        >
                                          <Edit2 className="w-2.5 h-2.5" />
                                        </button>
                                      )}
                                      <button
                                        onClick={() => handleDeleteComment(reply.id, comment.id)}
                                        className="p-0.5 text-slate-500 hover:text-rose-600"
                                        title="Delete reply"
                                      >
                                        <Trash2 className="w-2.5 h-2.5" />
                                      </button>
                                    </div>
                                  )}
                                </div>

                                {isEditingReply ? (
                                  <div className="flex gap-2 pt-1">
                                    <input
                                      type="text"
                                      value={editCommentText}
                                      onChange={(e) => setEditCommentText(e.target.value)}
                                      className="flex-1 px-2 py-1 rounded border border-slate-200 text-xs text-slate-900"
                                    />
                                    <button
                                      onClick={() => handleUpdateComment(reply.id, comment.id)}
                                      className="px-2 py-1 rounded bg-slate-900 text-white text-[11px] font-semibold"
                                    >
                                      Save
                                    </button>
                                    <button
                                      onClick={() => setEditingCommentId(null)}
                                      className="px-2 py-1 rounded text-slate-500 text-[11px]"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                ) : (
                                  <p className="text-slate-700 leading-relaxed text-[11px]">{reply.content}</p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
};
