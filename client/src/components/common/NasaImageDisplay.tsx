import React, { useState, useEffect } from 'react';
import { Box, Image as ImageIcon } from 'lucide-react';

interface NasaImageDisplayProps {
  src: string;
  alt: string;
  title?: string;
  nasaId?: string;
  className?: string;
  aspectRatio?: string; // e.g. "aspect-video", "aspect-square", "aspect-[4/3]"
}

// Guaranteed backup CDN images that always load
const DEFAULT_NASA_BACKUPS = [
  'https://images-assets.nasa.gov/image/PIA24484/PIA24484~medium.jpg',
  'https://images-assets.nasa.gov/image/AS17-147-22527/AS17-147-22527~medium.jpg',
  'https://images-assets.nasa.gov/image/AS11-40-5903/AS11-40-5903~medium.jpg',
  'https://images-assets.nasa.gov/image/PIA22223/PIA22223~medium.jpg',
  'https://images-assets.nasa.gov/image/PIA23623/PIA23623~medium.jpg',
];

export const NasaImageDisplay: React.FC<NasaImageDisplayProps> = ({
  src,
  alt,
  title,
  nasaId,
  className = '',
  aspectRatio = 'aspect-video',
}) => {
  const [imgSrc, setImgSrc] = useState<string>(src);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  const [fallbackAttempt, setFallbackAttempt] = useState<number>(0);

  useEffect(() => {
    setImgSrc(src);
    setIsLoading(true);
    setHasError(false);
    setFallbackAttempt(0);
  }, [src]);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    if (fallbackAttempt < DEFAULT_NASA_BACKUPS.length) {
      setImgSrc(DEFAULT_NASA_BACKUPS[fallbackAttempt]);
      setFallbackAttempt((prev) => prev + 1);
    } else {
      setIsLoading(false);
      setHasError(true);
    }
  };

  if (hasError) {
    return (
      <div 
        className={`w-full ${aspectRatio} rounded-2xl bg-gradient-to-br from-[#0c1224] via-[#111936] to-[#0c1224] border border-white/10 p-6 flex flex-col items-center justify-center text-center space-y-2 select-none ${className}`}
        role="img"
        aria-label={alt}
      >
        <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-400/30 shadow-sm flex items-center justify-center text-cyan-400">
          <Box className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <span className="text-[11px] font-mono text-cyan-400 font-bold uppercase tracking-wider block">
            NASA Open Data Artifact
          </span>
          <p className="text-xs font-semibold text-slate-200 line-clamp-1">{title || alt}</p>
          <span className="text-[10px] font-mono text-slate-500 block">ID: {nasaId || 'NASA-ARCHIVE'}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${aspectRatio} rounded-2xl bg-white/[0.03] border border-white/[0.06] ${className}`}>
      {/* Skeleton Shimmer while loading (Strict layout reservation, zero layout shift) */}
      {isLoading && (
        <div className="absolute inset-0 z-10 bg-white/[0.04] loading-shimmer flex items-center justify-center">
          <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 uppercase tracking-wider">
            <ImageIcon className="w-4 h-4 animate-pulse text-cyan-400/60" />
            <span>Loading NASA Media...</span>
          </div>
        </div>
      )}

      {/* Image with smooth fade-in once loaded */}
      <img
        src={imgSrc}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        className={`w-full h-full object-cover transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        loading="lazy"
        decoding="async"
      />
    </div>
  );
};

export default NasaImageDisplay;
