import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Star,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  X,
  Send,
  AlertCircle,
  ThumbsUp,
  Heart,
} from 'lucide-react';
import { Trip } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

interface TripFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip?: Trip | null;
}

export const TripFeedbackModal: React.FC<TripFeedbackModalProps> = ({
  isOpen,
  onClose,
  trip,
}) => {
  const { user } = useAuth();

  const [rating, setRating] = useState<number>(5);
  const [routeRating, setRouteRating] = useState<number>(5);
  const [recommendationRating, setRecommendationRating] = useState<number>(5);
  const [comment, setComment] = useState('');
  const [category, setCategory] = useState<'praise' | 'suggestion' | 'issue'>('praise');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const feedbackData = {
      user_id: user?.id || 'anonymous',
      user_name: user?.name || 'Traveler',
      user_email: user?.email || '',
      trip_id: trip?.id || null,
      destination: trip?.destination || 'General Experience',
      overall_rating: rating,
      route_rating: routeRating,
      recommendation_rating: recommendationRating,
      category,
      comment: comment.trim(),
      created_at: new Date().toISOString(),
    };

    try {
      // 1. Try to save to Firestore
      if (db) {
        try {
          await addDoc(collection(db, 'feedbacks'), feedbackData);
        } catch (fbErr) {
          console.warn('Firestore feedback logging notice:', fbErr);
        }
      }

      // 2. Try to post to backend API
      try {
        await fetch('/api/feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(feedbackData),
        });
      } catch (apiErr) {
        console.warn('API feedback logging notice:', apiErr);
      }

      // 3. Save to local storage for persistent feedback logs
      try {
        const stored = JSON.parse(localStorage.getItem('travelwise_user_feedbacks') || '[]');
        stored.unshift(feedbackData);
        localStorage.setItem('travelwise_user_feedbacks', JSON.stringify(stored.slice(0, 50)));
      } catch {}

      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        onClose();
      }, 2200);
    } catch (err: any) {
      alert('Thank you! Your feedback has been recorded locally.');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-[#E3E7E2] overflow-hidden z-10"
        >
          {/* Header */}
          <div className="p-6 bg-[#0B3D2E] text-[#F7F5EF] flex items-center justify-between border-b border-[#07261D]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#176B50] border border-[#C8A96B]/40 flex items-center justify-center text-[#DFCA9B]">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif-title text-xl font-medium tracking-tight">
                  Travel Experience & Rating
                </h3>
                <p className="text-xs text-[#A2B3AA] font-light">
                  {trip ? `How was your itinerary for ${trip.destination}?` : 'Share your thoughts with TravelWise Concierge'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Content */}
          {isSubmitted ? (
            <div className="p-10 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto ring-8 ring-emerald-50">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="font-serif-title text-xl font-bold text-[#0B3D2E]">
                Thank You for Your Feedback!
              </h4>
              <p className="text-xs text-[#66736C] max-w-sm mx-auto font-light leading-relaxed">
                Your ratings and insights help our AI concierge craft smoother, more tailored itineraries.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Overall Star Rating */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#0B3D2E] uppercase tracking-wider block">
                  Overall Trip & Planning Experience
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1.5 focus:outline-none transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= rating
                            ? 'text-[#C8A96B] fill-[#C8A96B]'
                            : 'text-slate-200 fill-slate-100'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-[#0B3D2E] ml-2">
                    {rating === 5 ? 'Exceptional' : rating === 4 ? 'Great' : rating === 3 ? 'Good' : 'Needs Improvement'}
                  </span>
                </div>
              </div>

              {/* Sub-Ratings */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-[#66736C]">Venue Recommendations</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setRecommendationRating(s)}
                        className="p-1 focus:outline-none"
                      >
                        <Star
                          className={`w-4 h-4 ${
                            s <= recommendationRating
                              ? 'text-[#C8A96B] fill-[#C8A96B]'
                              : 'text-slate-200'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-[#66736C]">Route & Daily Flow</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setRouteRating(s)}
                        className="p-1 focus:outline-none"
                      >
                        <Star
                          className={`w-4 h-4 ${
                            s <= routeRating
                              ? 'text-[#C8A96B] fill-[#C8A96B]'
                              : 'text-slate-200'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Category Pills */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#0B3D2E] uppercase tracking-wider block">
                  Feedback Category
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setCategory('praise')}
                    className={`py-2 px-3 rounded-xl text-xs font-medium border transition-colors flex items-center justify-center gap-1.5 ${
                      category === 'praise'
                        ? 'bg-[#0B3D2E] text-[#F7F5EF] border-[#0B3D2E]'
                        : 'bg-[#F7F5EF] text-[#66736C] border-[#E3E7E2] hover:bg-[#E3E7E2]'
                    }`}
                  >
                    <Heart className="w-3.5 h-3.5" />
                    <span>Compliment</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCategory('suggestion')}
                    className={`py-2 px-3 rounded-xl text-xs font-medium border transition-colors flex items-center justify-center gap-1.5 ${
                      category === 'suggestion'
                        ? 'bg-[#0B3D2E] text-[#F7F5EF] border-[#0B3D2E]'
                        : 'bg-[#F7F5EF] text-[#66736C] border-[#E3E7E2] hover:bg-[#E3E7E2]'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Feature Idea</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCategory('issue')}
                    className={`py-2 px-3 rounded-xl text-xs font-medium border transition-colors flex items-center justify-center gap-1.5 ${
                      category === 'issue'
                        ? 'bg-rose-700 text-white border-rose-700'
                        : 'bg-[#F7F5EF] text-[#66736C] border-[#E3E7E2] hover:bg-[#E3E7E2]'
                    }`}
                  >
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Report Issue</span>
                  </button>
                </div>
              </div>

              {/* Text Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#0B3D2E] uppercase tracking-wider block">
                  Detailed Comments or Suggestions
                </label>
                <textarea
                  rows={3}
                  required
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tell us what you loved about this itinerary or what we can refine..."
                  className="w-full p-3.5 rounded-2xl bg-[#F7F5EF] border border-[#E3E7E2] text-xs text-[#2D3A34] focus:outline-none focus:ring-2 focus:ring-[#0B3D2E]/20"
                />
              </div>

              {/* Submit CTA */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#66736C] hover:bg-[#F7F5EF] transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting || !comment.trim()}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#0B3D2E] hover:bg-[#176B50] text-[#F7F5EF] text-xs font-medium uppercase tracking-wider transition-all disabled:opacity-50 shadow-xs"
                >
                  <Send className="w-3.5 h-3.5 text-[#C8A96B]" />
                  <span>{isSubmitting ? 'Submitting...' : 'Send Feedback'}</span>
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
