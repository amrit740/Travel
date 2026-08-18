import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Share2,
  MapPin,
  Calendar,
  DollarSign,
  Play,
  Pause,
  Download,
  Check,
} from 'lucide-react';
import { useCurrentTrip } from '../../contexts/TripContext';
import { formatCurrency } from '../../lib/utils';

interface TripStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TripStoryModal: React.FC<TripStoryModalProps> = ({ isOpen, onClose }) => {
  const { currentTrip, tripStorySlides, destinationData } = useCurrentTrip();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen || !isAutoPlaying || tripStorySlides.length <= 1) return;

    const timer = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % tripStorySlides.length);
    }, 5000);

    return () => clearTimeout(timer);
  }, [isOpen, currentIndex, isAutoPlaying, tripStorySlides.length]);

  if (!isOpen || !currentTrip || tripStorySlides.length === 0) return null;

  const currentSlide = tripStorySlides[currentIndex];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % tripStorySlides.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + tripStorySlides.length) % tripStorySlides.length);
  };

  const handleShareStory = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 select-none animate-in fade-in duration-200">
      {/* Modal Container */}
      <div className="relative w-full max-w-md h-[90vh] max-h-[700px] bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-white/20 flex flex-col justify-between text-white">
        {/* Background Slide Image with Gradient Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src={currentSlide.image}
            alt={currentSlide.title}
            className="w-full h-full object-cover transform scale-105 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/70" />
        </div>

        {/* Top Header: Story Segment Bars & Controls */}
        <div className="relative z-10 p-5 space-y-3">
          {/* Progress Indicators */}
          <div className="flex items-center gap-1.5 w-full">
            {tripStorySlides.map((_, idx) => (
              <div
                key={idx}
                className="h-1.5 flex-1 rounded-full bg-white/30 overflow-hidden cursor-pointer"
                onClick={() => setCurrentIndex(idx)}
              >
                <div
                  className={`h-full bg-white transition-all duration-300 ${
                    idx === currentIndex ? 'w-full bg-orange-400' : idx < currentIndex ? 'w-full' : 'w-0'
                  }`}
                />
              </div>
            ))}
          </div>

          {/* Top Bar with Destination, Play/Pause & Close */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-ping" />
              <span className="text-xs font-extrabold uppercase tracking-wider text-orange-300">
                {currentTrip.destination} Story • Day {currentSlide.dayNumber}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                className="p-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors"
                title={isAutoPlaying ? 'Pause Story' : 'Play Story'}
              >
                {isAutoPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Middle: Clickable Navigation Hotspots */}
        <div className="relative z-10 flex-1 flex">
          <div className="w-1/3 h-full cursor-pointer" onClick={handlePrev} />
          <div className="w-2/3 h-full cursor-pointer" onClick={handleNext} />
        </div>

        {/* Bottom Card Content */}
        <div className="relative z-10 p-6 space-y-3 bg-gradient-to-t from-black via-black/80 to-transparent">
          {/* Day Vibe Tag */}
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-orange-500/30 text-orange-200 border border-orange-400/40">
            <Sparkles className="w-3 h-3 text-orange-300" />
            <span>{currentSlide.vibe}</span>
          </span>

          <h3 className="text-2xl font-extrabold text-white font-display leading-tight">
            {currentSlide.title}
          </h3>

          <div className="space-y-1.5 pt-1">
            {currentSlide.highlights.map((h, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-slate-200">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" />
                <span>{h}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-white/20 text-xs text-slate-300">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-orange-400" />
              <span className="truncate max-w-[150px]">{currentSlide.location}</span>
            </span>

            {currentSlide.budgetSpent !== undefined && currentSlide.budgetSpent > 0 && (
              <span className="font-bold text-white">
                💰 {formatCurrency(currentSlide.budgetSpent, currentTrip.currency)}
              </span>
            )}
          </div>

          {/* Action: Share Story */}
          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={handleShareStory}
              className="flex-1 py-2.5 rounded-2xl bg-white text-slate-900 font-bold text-xs hover:bg-slate-100 flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
              <span>{copied ? 'Story Link Copied!' : 'Share Trip Story'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
