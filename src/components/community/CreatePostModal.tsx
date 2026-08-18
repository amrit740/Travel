import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Plus,
  Image as ImageIcon,
  Compass,
  MapPin,
  Tag,
  Globe,
  Lock,
  Luggage,
  Sparkles,
  BookOpen,
  Utensils,
  Lightbulb,
  AlertTriangle,
  Star,
  Check,
  Loader2,
  Trash2,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { apiTrips } from '../../services/api';
import { getUserTripsFromFirestore } from '../../lib/firebaseSync';
import { CommunityService } from '../../services/communityService';
import { CommunityPost, CommunityPostType, CommunityPostVisibility, Trip } from '../../types';
import { formatCurrency } from '../../lib/utils';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated: (post: CommunityPost) => void;
  initialTrip?: Trip | null;
}

const POST_TYPES: { type: CommunityPostType; label: string; icon: any; color: string }[] = [
  { type: 'trip', label: 'Trip Itinerary', icon: Luggage, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  { type: 'story', label: 'Travel Story', icon: BookOpen, color: 'text-amber-700 bg-amber-50 border-amber-200' },
  { type: 'tip', label: 'Travel Tip', icon: Lightbulb, color: 'text-blue-700 bg-blue-50 border-blue-200' },
  { type: 'food', label: 'Food & Dining', icon: Utensils, color: 'text-rose-700 bg-rose-50 border-rose-200' },
  { type: 'review', label: 'Place Review', icon: Star, color: 'text-purple-700 bg-purple-50 border-purple-200' },
  { type: 'warning', label: 'Travel Notice', icon: AlertTriangle, color: 'text-orange-700 bg-orange-50 border-orange-200' },
];

const SUGGESTED_TAGS = [
  'Budget',
  'Solo',
  'Student Mode',
  'Family',
  'Culture & Heritage',
  'Nature & Wildlife',
  'Beaches',
  'Foodie Paradise',
  'Adventure',
  'Luxury',
  'Hidden Gems',
  'Eco Friendly',
];

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  onClose,
  onPostCreated,
  initialTrip,
}) => {
  const { user, isAuthenticated } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);

  useEffect(() => {
    if (!isOpen || !user) return;
    const fetchTrips = async () => {
      try {
        const list = await apiTrips.getAll();
        setTrips(list);
      } catch (e) {
        // Fallback to firestore if needed
        try {
          const fsList = await getUserTripsFromFirestore(user.id);
          setTrips(fsList);
        } catch {
          // ignore
        }
      }
    };
    fetchTrips();
  }, [isOpen, user]);

  const [postType, setPostType] = useState<CommunityPostType>('story');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [destination, setDestination] = useState('');
  const [selectedTripId, setSelectedTripId] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>(['Travel']);
  const [customTagInput, setCustomTagInput] = useState('');
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [visibility, setVisibility] = useState<CommunityPostVisibility>('public');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Initialize with initialTrip if provided
  useEffect(() => {
    if (initialTrip) {
      setPostType('trip');
      setTitle(`My ${initialTrip.duration}-Day Journey to ${initialTrip.destination}`);
      setDestination(initialTrip.destination);
      setSelectedTripId(initialTrip.id);
      if (initialTrip.cover_image) {
        setImages([initialTrip.cover_image]);
      }
      if (initialTrip.summary) {
        setContent(initialTrip.summary);
      }
      if (initialTrip.travel_style && initialTrip.travel_style.length > 0) {
        setSelectedTags(['Travel', ...initialTrip.travel_style]);
      }
    }
  }, [initialTrip]);

  // When attached trip changes
  const handleTripSelect = (tripId: string) => {
    setSelectedTripId(tripId);
    if (!tripId) return;
    const foundTrip = trips.find((t) => t.id === tripId);
    if (foundTrip) {
      if (!destination) setDestination(foundTrip.destination);
      if (!title) setTitle(`Journey to ${foundTrip.destination} — ${foundTrip.duration} Days`);
      if (foundTrip.cover_image && !images.includes(foundTrip.cover_image)) {
        setImages((prev) => [foundTrip.cover_image, ...prev]);
      }
      if (foundTrip.travel_style && foundTrip.travel_style.length > 0) {
        setSelectedTags((prev) => Array.from(new Set([...prev, ...foundTrip.travel_style])));
      }
    }
  };

  const handleAddImage = () => {
    if (!imageUrlInput.trim()) return;
    try {
      new URL(imageUrlInput.trim());
      setImages((prev) => [...prev, imageUrlInput.trim()]);
      setImageUrlInput('');
    } catch {
      setErrorMessage('Please enter a valid image URL (e.g. https://images.unsplash.com/...)');
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags((prev) => prev.filter((t) => t !== tag));
    } else {
      setSelectedTags((prev) => [...prev, tag]);
    }
  };

  const handleAddCustomTag = () => {
    if (!customTagInput.trim()) return;
    const cleanTag = customTagInput.trim().replace(/^#/, '');
    if (!selectedTags.includes(cleanTag)) {
      setSelectedTags((prev) => [...prev, cleanTag]);
    }
    setCustomTagInput('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !user) {
      setErrorMessage('You must be logged in to create a community post.');
      return;
    }
    if (!title.trim()) {
      setErrorMessage('Please give your post a title.');
      return;
    }
    if (!content.trim()) {
      setErrorMessage('Please share your thoughts, tips, or itinerary in the content box.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      let tripSnapshot: any = undefined;
      if (selectedTripId) {
        const attachedTrip = trips.find((t) => t.id === selectedTripId);
        if (attachedTrip) {
          tripSnapshot = {
            id: attachedTrip.id,
            title: attachedTrip.title,
            destination: attachedTrip.destination,
            duration: attachedTrip.duration,
            total_budget: attachedTrip.total_budget,
            currency: attachedTrip.currency || 'INR',
            traveler_type: attachedTrip.traveler_type,
            cover_image: attachedTrip.cover_image,
            highlights: attachedTrip.travel_tips || [],
            itinerary_summary: attachedTrip.summary,
            tags: attachedTrip.travel_style,
          };
        }
      }

      const post = await CommunityService.createPost({
        author_id: user.id,
        author_name: user.name || 'Traveler',
        author_image: user.profile_image,
        title: title.trim(),
        content: content.trim(),
        destination: (destination || 'Global Travel').trim(),
        trip_id: selectedTripId || undefined,
        trip_snapshot: tripSnapshot,
        images,
        tags: selectedTags.length > 0 ? selectedTags : ['Travel'],
        post_type: postType,
        visibility,
      });

      onPostCreated(post);
      onClose();
    } catch (err: any) {
      console.error('Failed to create community post:', err);
      setErrorMessage(err.message || 'Failed to publish post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-[#FAFAF8]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-[#E5C365] flex items-center justify-center shadow-sm">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-serif font-bold text-slate-900">
                  Create Community Post
                </h3>
                <p className="text-xs text-slate-500">
                  Share your real journey, insights, tips, or itineraries with travelers
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Post Type Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-900 mb-2 uppercase tracking-wider">
                What are you sharing?
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {POST_TYPES.map(({ type, label, icon: Icon, color }) => {
                  const isSelected = postType === type;
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setPostType(type)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-medium transition-all ${
                        isSelected
                          ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                          : 'border-slate-200 bg-white text-slate-800 hover:border-slate-400'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-[#E5C365]' : 'text-slate-400'}`} />
                      <span>{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Attach Real Trip (if user has trips) */}
            {trips && trips.length > 0 && (
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                    <Luggage className="w-4 h-4 text-[#C59B27]" />
                    Attach One of Your Trips (Optional)
                  </label>
                  {selectedTripId && (
                    <button
                      type="button"
                      onClick={() => setSelectedTripId('')}
                      className="text-[11px] text-rose-600 hover:underline"
                    >
                      Detach
                    </button>
                  )}
                </div>
                <select
                  value={selectedTripId}
                  onChange={(e) => handleTripSelect(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
                >
                  <option value="">-- No trip attached (General post) --</option>
                  {trips.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title} ({t.destination} • {t.duration} Days • {formatCurrency(t.total_budget, t.currency || 'INR')})
                    </option>
                  ))}
                </select>
                {selectedTripId && (
                  <p className="text-[11px] text-slate-500">
                    ✨ Travelers in the community can preview your trip overview and use the <span className="font-semibold text-slate-900">🌟 Remix This Trip</span> feature to plan their own copy!
                  </p>
                )}
              </div>
            )}

            {/* Post Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-900 mb-1.5">
                Post Title <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. 5 Underrated Cafes in Anjuna You Can't Miss"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                required
              />
            </div>

            {/* Destination */}
            <div>
              <label className="block text-xs font-semibold text-slate-900 mb-1.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#C59B27]" />
                Destination / Location
              </label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. Goa, Sikkim, Manali, Kerala, Jaipur..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
              />
            </div>

            {/* Post Content */}
            <div>
              <label className="block text-xs font-semibold text-slate-900 mb-1.5">
                Content & Story <span className="text-rose-600">*</span>
              </label>
              <textarea
                rows={4}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share your travel experiences, hidden spots, budgets, best times to visit, warnings, or recommendation details..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                required
              />
            </div>

            {/* Photos & Images */}
            <div>
              <label className="block text-xs font-semibold text-slate-900 mb-1.5 flex items-center gap-1">
                <ImageIcon className="w-3.5 h-3.5 text-[#C59B27]" />
                Add Photos (Image URLs)
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddImage();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddImage}
                  className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 hover:bg-slate-100 transition-colors"
                >
                  Add Image
                </button>
              </div>

              {/* Images Preview Grid */}
              {images.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-2.5">
                  {images.map((imgUrl, idx) => (
                    <div key={idx} className="relative group rounded-lg overflow-hidden border border-slate-200 h-20 bg-black/5">
                      <img src={imgUrl} alt="Post attachment" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tags */}
            <div>
              <label className="block text-xs font-semibold text-slate-900 mb-1.5 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-[#C59B27]" />
                Tags & Categories
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {SUGGESTED_TAGS.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                        isSelected
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                      }`}
                    >
                      #{tag}
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customTagInput}
                  onChange={(e) => setCustomTagInput(e.target.value)}
                  placeholder="Add custom tag (e.g. ScubaDiving)"
                  className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomTag();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddCustomTag}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 text-xs font-semibold text-slate-900 border border-slate-200 hover:bg-slate-200"
                >
                  + Add Tag
                </button>
              </div>
            </div>

            {/* Privacy Setting */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-900 block">Post Visibility</span>
                <span className="text-[11px] text-slate-500">
                  {visibility === 'public'
                    ? '🌍 Public: Everyone in the TravelWise community can see, like, comment, and remix.'
                    : '🔒 Private: Only you can view this post in your personal saved posts tab.'}
                </span>
              </div>
              <div className="flex bg-white rounded-lg p-0.5 border border-slate-200">
                <button
                  type="button"
                  onClick={() => setVisibility('public')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                    visibility === 'public' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  Public
                </button>
                <button
                  type="button"
                  onClick={() => setVisibility('private')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                    visibility === 'private' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  Private
                </button>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold shadow-md hover:bg-slate-800 active:scale-95 transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#E5C365]" />
                    <span>Publishing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-[#E5C365]" />
                    <span>Publish Post</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
