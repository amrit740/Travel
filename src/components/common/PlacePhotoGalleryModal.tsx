import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronLeft, ChevronRight, MapPin, Camera, ExternalLink, Sparkles, CheckCircle2 } from 'lucide-react';
import { PlacePhoto, AuthorAttribution } from '../../types';

interface PlacePhotoGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  placeName: string;
  destination?: string;
  category?: string;
  photos: Array<PlacePhoto | string>;
  initialIndex?: number;
  authorAttributions?: AuthorAttribution[];
  address?: string;
  latitude?: number;
  longitude?: number;
}

export const PlacePhotoGalleryModal: React.FC<PlacePhotoGalleryModalProps> = ({
  isOpen,
  onClose,
  placeName,
  destination,
  category,
  photos,
  initialIndex = 0,
  authorAttributions,
  address,
  latitude,
  longitude,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex, isOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, photos.length]);

  if (!isOpen || !photos || photos.length === 0) return null;

  const normalizedPhotos: PlacePhoto[] = photos.map((p) => {
    if (typeof p === 'string') {
      return { url: p, source: 'verified_catalog' };
    }
    return p;
  });

  const currentPhoto = normalizedPhotos[currentIndex] || normalizedPhotos[0];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : normalizedPhotos.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < normalizedPhotos.length - 1 ? prev + 1 : 0));
  };

  const mapLink = latitude && longitude
    ? `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${placeName}, ${destination || 'India'}`)}`;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-stone-950/90 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-5xl h-[92vh] max-h-[850px] flex flex-col bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-stone-800 bg-stone-900/90 z-10">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
                <Camera className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-semibold text-white truncate">{placeName}</h3>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    <CheckCircle2 className="w-3 h-3" /> Exact Place Match
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-stone-400">
                  {destination && (
                    <span className="flex items-center gap-1 text-stone-300">
                      <MapPin className="w-3 h-3 text-teal-400" /> {destination}
                    </span>
                  )}
                  {category && <span>• {category}</span>}
                  <span>• Photo {currentIndex + 1} of {normalizedPhotos.length}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={mapLink}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 transition"
              >
                <ExternalLink className="w-3.5 h-3.5" /> View on Map
              </a>
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Main Visual Display */}
          <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden select-none">
            <AnimatePresence mode="wait">
              <motion.img
                key={currentPhoto.url}
                src={currentPhoto.url}
                alt={placeName}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="max-h-full max-w-full object-contain"
                referrerPolicy="no-referrer"
              />
            </AnimatePresence>

            {/* Navigation Arrows */}
            {normalizedPhotos.length > 1 && (
              <>
                <button
                  onClick={handlePrev}
                  className="absolute left-3 p-3 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-sm border border-white/10 transition shadow-lg"
                  aria-label="Previous photo"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-3 p-3 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-sm border border-white/10 transition shadow-lg"
                  aria-label="Next photo"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Attribution Badge */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-stone-300 pointer-events-none">
              <div className="bg-stone-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-stone-800 pointer-events-auto">
                <span className="text-stone-400">Verified Location: </span>
                <span className="font-medium text-white">{placeName}</span>
                {address && <span className="text-stone-400 hidden md:inline"> ({address})</span>}
              </div>

              {(currentPhoto.authorAttributions || authorAttributions) && (
                <div className="bg-stone-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-stone-800 pointer-events-auto text-[11px]">
                  <span className="text-stone-400">Photo: </span>
                  <span className="text-teal-300">
                    {(currentPhoto.authorAttributions || authorAttributions)
                      ?.map((a) => a.displayName)
                      .join(', ')}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Thumbnail Ribbon */}
          {normalizedPhotos.length > 1 && (
            <div className="px-4 py-3 bg-stone-900 border-t border-stone-800 flex items-center gap-2 overflow-x-auto">
              {normalizedPhotos.map((photo, idx) => (
                <button
                  key={photo.url + idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`relative flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition ${
                    currentIndex === idx
                      ? 'border-teal-400 ring-2 ring-teal-400/30'
                      : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img
                    src={photo.url}
                    alt={`${placeName} thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </button>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
