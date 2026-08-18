import React, { useState, useEffect } from 'react';
import { Camera, MapPin, Image as ImageIcon, ExternalLink, Sparkles } from 'lucide-react';
import { fetchDestinationGallery } from '../../services/placeImageClient';
import { PlacePhotoGalleryModal } from './PlacePhotoGalleryModal';

interface DestinationGallerySectionProps {
  destinationName: string;
  stateOrRegion?: string;
  heroImage?: string;
  className?: string;
}

export const DestinationGallerySection: React.FC<DestinationGallerySectionProps> = ({
  destinationName,
  stateOrRegion,
  heroImage,
  className = '',
}) => {
  const [galleryPhotos, setGalleryPhotos] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  useEffect(() => {
    let isMounted = true;
    fetchDestinationGallery(destinationName).then((res) => {
      if (!isMounted) return;
      if (res.gallery && res.gallery.length > 0) {
        setGalleryPhotos(res.gallery);
      } else if (heroImage) {
        setGalleryPhotos([heroImage]);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [destinationName, heroImage]);

  const displayPhotos = galleryPhotos.length > 0 ? galleryPhotos : heroImage ? [heroImage] : [];

  if (displayPhotos.length === 0) return null;

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Camera className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          <h4 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
            Real Photos of {destinationName}
          </h4>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
            {displayPhotos.length} Photos
          </span>
        </div>

        {displayPhotos.length > 3 && (
          <button
            onClick={() => {
              setSelectedPhotoIndex(0);
              setIsModalOpen(true);
            }}
            className="text-xs font-medium text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
          >
            View All ({displayPhotos.length})
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {displayPhotos.slice(0, 4).map((url, idx) => (
          <button
            key={url + idx}
            type="button"
            onClick={() => {
              setSelectedPhotoIndex(idx);
              setIsModalOpen(true);
            }}
            className="group relative h-28 sm:h-32 rounded-xl overflow-hidden bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <img
              src={url}
              alt={`${destinationName} scenic photo ${idx + 1}`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
            {idx === 3 && displayPhotos.length > 4 && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-sm font-semibold backdrop-blur-xs">
                +{displayPhotos.length - 4} More
              </div>
            )}
          </button>
        ))}
      </div>

      {isModalOpen && (
        <PlacePhotoGalleryModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          placeName={destinationName}
          destination={stateOrRegion || 'India'}
          photos={displayPhotos}
          initialIndex={selectedPhotoIndex}
        />
      )}
    </div>
  );
};
