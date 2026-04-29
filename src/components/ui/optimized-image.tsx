import React, { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Palette } from 'lucide-react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  aspectRatio?: 'square' | 'portrait' | 'landscape' | 'auto';
  size?: 'thumbnail' | 'card' | 'detail' | 'full';
  loading?: 'lazy' | 'eager';
  priority?: boolean;
  onError?: () => void;
  onClick?: () => void;
  quality?: number; // 1-100, default 85
  objectFit?: 'cover' | 'contain' | 'fill'; // How image should fit container
}

const sizeConfigs = {
  thumbnail: {
    sizes: '(max-width: 640px) 80px, 64px',
    intrinsicSize: '64px 64px',
    maxWidth: 64
  },
  card: {
    sizes: '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1536px) 25vw, 400px',
    intrinsicSize: '400px 400px',
    maxWidth: 800 // Increased for high-DPI displays (2x = 400px display)
  },
  detail: {
    sizes: '(max-width: 1024px) 100vw, 50vw',
    intrinsicSize: '800px 800px',
    maxWidth: 1200 // Increased for high quality
  },
  full: {
    sizes: '100vw',
    intrinsicSize: '1200px 800px',
    maxWidth: 1200
  }
};

const aspectClasses = {
  square: 'aspect-square',
  portrait: 'aspect-[3/4]',
  landscape: 'aspect-[4/3]',
  auto: ''
};

export function OptimizedImage({
  src,
  alt,
  className,
  aspectRatio = 'square',
  size = 'card',
  loading = 'lazy',
  priority = false,
  onError,
  onClick,
  quality = 85,
  objectFit = 'cover'
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [inferredAspectRatio, setInferredAspectRatio] = useState<number | null>(null);
  const [hasError, setHasError] = useState(false);

  const config = sizeConfigs[size];

  // Generate responsive srcset for different screen densities
  const srcSet = useMemo(() => {
    if (!src || hasError) return undefined;
    
    // For Supabase storage URLs, we can add query parameters for resizing
    const baseUrl = src.split('?')[0];
    const params = new URLSearchParams(src.split('?')[1] || '');
    
    // Generate different sizes for responsive images - higher densities for better quality
    const sizes = [1, 1.5, 2, 2.5, 3]; // Different pixel densities - higher for crisp rendering
    const srcSetValues = sizes.map(scale => {
      const width = Math.round(config.maxWidth * scale);
      params.set('width', width.toString());
      params.set('quality', quality.toString());
      params.set('format', 'webp'); // Use WebP for better compression
      return `${baseUrl}?${params.toString()} ${width}w`;
    });
    
    return srcSetValues.join(', ');
  }, [src, config.maxWidth, quality, hasError]);

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setIsLoaded(true);
    try {
      const img = e.currentTarget;
      if (img.naturalWidth && img.naturalHeight) {
        setInferredAspectRatio(img.naturalWidth / img.naturalHeight);
      }
    } catch {}
  };

  if (hasError || !src) {
    return (
      <div 
        className={cn(
          "flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400",
          aspectClasses[aspectRatio],
          className
        )}
        onClick={onClick}
      >
        <Palette className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div 
      className={cn(
        "relative overflow-hidden bg-slate-100",
        aspectClasses[aspectRatio],
        className
      )}
      style={
        aspectRatio === 'auto' && inferredAspectRatio
          ? { aspectRatio: `${inferredAspectRatio}` }
          : undefined
      }
      onClick={onClick}
    >
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200 animate-pulse" />
      )}
      <img
        src={src}
        srcSet={srcSet}
        sizes={config.sizes}
        alt={alt}
        loading={loading}
        fetchPriority={priority ? 'high' : 'auto'}
        className={cn(
          "w-full h-full transition-all duration-300",
          objectFit === 'cover' && "object-cover",
          objectFit === 'contain' && "object-contain",
          objectFit === 'fill' && "object-fill",
          isLoaded ? "opacity-100" : "opacity-0",
          onClick && "cursor-pointer hover:scale-105"
        )}
        onLoad={handleLoad}
        onError={handleError}
        style={{
          objectPosition: 'center',
          contentVisibility: 'auto',
          containIntrinsicSize: config.intrinsicSize,
          // Ensure crisp rendering on high-DPI displays - use auto for best quality
          imageRendering: 'auto',
          // Optimize for performance
          willChange: isLoaded ? 'auto' : 'transform',
          // Prevent image blur on scale transforms
          backfaceVisibility: 'hidden',
          transform: 'translateZ(0)'
        }}
        // Add decoding hint for better performance
        decoding="async"
      />
    </div>
  );
}

// Gallery component for multiple images with optimized rendering
interface OptimizedGalleryProps {
  images: string[];
  coverImageIndex?: number;
  className?: string;
  onImageClick?: (index: number) => void;
  onSetCover?: (index: number) => void;
  quality?: number;
}

export function OptimizedGallery({
  images,
  coverImageIndex = 0,
  className,
  onImageClick,
  onSetCover,
  quality = 85
}: OptimizedGalleryProps) {
  if (!images || images.length === 0) {
    return (
      <div className={cn("aspect-square bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center rounded-lg", className)}>
        <Palette className="h-16 w-16 text-slate-400" />
      </div>
    );
  }

  return (
    <div className={cn("grid grid-cols-2 gap-2", className)}>
      {/* Main image */}
      <div className="col-span-2">
        <OptimizedImage
          src={images[coverImageIndex]}
          alt="Main artwork"
          size="detail"
          aspectRatio="auto"
          onClick={() => onImageClick?.(coverImageIndex)}
          quality={quality}
          priority={true} // Load main image with high priority
          objectFit="contain"
        />
      </div>
      
      {/* Thumbnail grid */}
      {images.length > 1 && (
        <div className="col-span-2 grid grid-cols-4 gap-2">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <OptimizedImage
                src={image}
                alt={`Artwork view ${index + 1}`}
                size="thumbnail"
                aspectRatio="square"
                onClick={() => onImageClick?.(index)}
                className={cn(
                  "rounded border-2 transition-all",
                  index === coverImageIndex 
                    ? "border-blue-500 ring-2 ring-blue-200" 
                    : "border-transparent hover:border-slate-300"
                )}
                quality={quality}
                loading="lazy" // Thumbnails can be lazy loaded
              />
              {index !== coverImageIndex && onSetCover && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSetCover(index);
                  }}
                  className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                >
                  <span className="text-white text-xs font-medium">Set as cover</span>
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
