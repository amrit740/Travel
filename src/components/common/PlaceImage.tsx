import React, { useState, useEffect } from 'react';
import { Camera, ImageOff, CheckCircle2, Sparkles } from 'lucide-react';
import { PlacePhoto, AuthorAttribution, ResolvedPlaceImage } from '../../types';
import { fetchPlaceImage, getFastClientPlaceFallback, getCachedPlaceImage } from '../../services/placeImageClient';
import { PlacePhotoGalleryModal } from './PlacePhotoGalleryModal';

interface PlaceImageProps {
  name: string;
  destination?: string;
  category?: string;
  src?: string;
  alt?: string;
  className?: string;
  aspectRatio?: 'square' | 'video' | 'wide' | 'tall' | 'auto';
  showGalleryButton?: boolean;
  showVerifiedBadge?: boolean;
  showAttribution?: boolean;
  photos?: Array<PlacePhoto | string>;
  gallery?: string[];
  authorAttributions?: AuthorAttribution[];
  address?: string;
  latitude?: number;
  longitude?: number;
  priority?: boolean;
  onImageLoaded?: (resolved: ResolvedPlaceImage) => void;
}

export const PlaceImage: React.FC<PlaceImageProps> = ({
  name,
  destination,
  category,
  src: initialSrc,
  alt,
  className = '',
  aspectRatio = 'auto',
  showGalleryButton = true,
  showVerifiedBadge = false,
  showAttribution = false,
  photos: initialPhotos,
  gallery: initialGallery,
  authorAttributions: initialAttributions,
  address,
  latitude,
  longitude,
  priority = false,
  onImageLoaded,
}) => {
  const [currentSrc, setCurrentSrc] = useState<string>(() => {
    if (initialSrc && !initialSrc.includes('placeholder')) return initialSrc;
    const cached = getCachedPlaceImage(name, destination);
    if (cached) return cached.heroImage;
    return getFastClientPlaceFallback(name, destination, category);
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState<boolean>(false);
  const [resolvedData, setResolvedData] = useState<ResolvedPlaceImage | null>(() => {
    return getCachedPlaceImage(name, destination);
  });

  // Resolve dynamic place image on mount / prop change
  useEffect(() => {
    let isMounted = true;

    // Check if currentSrc is already specific
    const isGeneric = !initialSrc || initialSrc.includes('placeholder') || initialSrc.includes('unsplash.com/photo-1512343879784');

    if (isGeneric || !resolvedData) {
      fetchPlaceImage(name, destination, category, latitude, longitude)
        .then((res) => {
          if (!isMounted) return;
          setResolvedData(res);
          if (res.heroImage) {
            setCurrentSrc(res.heroImage);
          }
          if (onImageLoaded) {
            onImageLoaded(res);
          }
        })
        .catch(() => {
          if (!isMounted) return;
          const fallback = getFastClientPlaceFallback(name, destination, category);
          setCurrentSrc(fallback);
        });
    }

    return () => {
      isMounted = false;
    };
  }, [name, destination, category, initialSrc]);

  const allPhotos: Array<PlacePhoto | string> =
    initialPhotos && initialPhotos.length > 0
      ? initialPhotos
      : initialGallery && initialGallery.length > 0
      ? initialGallery
      : resolvedData?.photos && resolvedData.photos.length > 0
      ? resolvedData.photos
      : resolvedData?.gallery && resolvedData.gallery.length > 0
      ? resolvedData.gallery
      : [currentSrc];

  const aspectClass =
    aspectRatio === 'square'
      ? 'aspect-square'
      : aspectRatio === 'video'
      ? 'aspect-video'
      : aspectRatio === 'wide'
      ? 'aspect-[21/9]'
      : aspectRatio === 'tall'
      ? 'aspect-[3/4]'
      : '';

  const handleImageError = () => {
    setHasError(true);
    setIsLoading(false);
    const fallback = getFastClientPlaceFallback(name, destination, category);
    if (currentSrc !== fallback) {
      setCurrentSrc(fallback);
    }
  };

  return (
    <div className={`relative overflow-hidden bg-stone-100 dark:bg-stone-900 group ${aspectClass} ${className}`}>
      {/* Shimmer skeleton while loading */}
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-r from-stone-200 via-stone-300 to-stone-200 dark:from-stone-800 dark:via-stone-700 dark:to-stone-800 animate-pulse" />
      )}

      {/* Actual Image */}
      <img
        src={currentSrc}
        alt={alt || name}
        loading={priority ? 'eager' : 'lazy'}
        onLoad={() => setIsLoading(false)}
        onError={handleImageError}
        className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        referrerPolicy="no-referrer"
      />

      {/* Verified Badge */}
      {showVerifiedBadge && !isLoading && (
        <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1 px-2 py-1 rounded-md bg-stone-900/80 backdrop-blur-md text-[10px] font-medium text-emerald-300 border border-emerald-500/30 shadow-sm">
          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          <span>Verified Place</span>
        </div>
      )}

      {/* Interactive Gallery Button */}
      {showGalleryButton && allPhotos.length > 1 && !isLoading && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            setIsGalleryOpen(true);
          }}
          className="absolute bottom-2.5 right-2.5 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-900/80 hover:bg-stone-900 text-white backdrop-blur-md text-xs font-medium border border-stone-700 transition shadow-md hover:scale-105 active:scale-95"
          title={`View ${allPhotos.length} photos of ${name}`}
        >
          <Camera className="w-3.5 h-3.5 text-teal-400" />
          <span>{allPhotos.length} Photos</span>
        </button>
      )}

      {/* Photographer Attribution Link */}
      {showAttribution && resolvedData?.authorAttributions?.[0] && !isLoading && (
        <div className="absolute bottom-2 left-2 z-10 px-2 py-0.5 rounded bg-stone-950/70 text-[10px] text-stone-300 backdrop-blur-xs">
          Photo: {resolvedData.authorAttributions[0].displayName}
        </div>
      )}

      {/* Fullscreen Photo Gallery Lightbox Modal */}
      {isGalleryOpen && (
        <PlacePhotoGalleryModal
          isOpen={isGalleryOpen}
          onClose={() => setIsGalleryOpen(false)}
          placeName={name}
          destination={destination}
          category={category}
          photos={allPhotos}
          authorAttributions={resolvedData?.authorAttributions || initialAttributions}
          address={address || resolvedData?.formattedAddress}
          latitude={latitude || resolvedData?.latitude}
          longitude={longitude || resolvedData?.longitude}
        />
      )}
    </div>
  );
};
