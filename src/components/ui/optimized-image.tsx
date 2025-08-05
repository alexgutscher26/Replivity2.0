'use client';

import Image, { ImageProps } from 'next/image';
import { useState, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps extends Omit<ImageProps, 'onLoad' | 'onError'> {
  fallbackSrc?: string;
  showLoadingState?: boolean;
  loadingClassName?: string;
  errorClassName?: string;
  onLoadComplete?: () => void;
  onError?: () => void;
}

export const OptimizedImage = forwardRef<HTMLImageElement, OptimizedImageProps>(
  ({
    src,
    alt,
    className,
    fallbackSrc = '/images/placeholder.svg',
    showLoadingState = true,
    loadingClassName,
    errorClassName,
    onLoadComplete,
    onError,
    ...props
  }, ref) => {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [currentSrc, setCurrentSrc] = useState(src);

    const handleLoad = () => {
      setIsLoading(false);
      onLoadComplete?.();
    };

    const handleError = () => {
      setIsLoading(false);
      setHasError(true);
      if (currentSrc !== fallbackSrc) {
        setCurrentSrc(fallbackSrc);
      }
      onError?.();
    };

    return (
      <div className={cn('relative overflow-hidden', className)}>
        <Image
          ref={ref}
          src={currentSrc}
          alt={alt}
          className={cn(
            'transition-opacity duration-300',
            isLoading ? 'opacity-0' : 'opacity-100',
            hasError && errorClassName
          )}
          onLoad={handleLoad}
          onError={handleError}
          {...props}
        />
        
        {/* Loading state */}
        {isLoading && showLoadingState && (
          <div
            className={cn(
              'absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center',
              loadingClassName
            )}
          >
            <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
          </div>
        )}
        
        {/* Error state */}
        {hasError && currentSrc === fallbackSrc && (
          <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <svg
                className="w-8 h-8 mx-auto mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
              <span className="text-xs">Failed to load</span>
            </div>
          </div>
        )}
      </div>
    );
  }
);

OptimizedImage.displayName = 'OptimizedImage';

// Avatar component with optimized image loading
interface OptimizedAvatarProps {
  src?: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  fallback?: string;
}

export const OptimizedAvatar: React.FC<OptimizedAvatarProps> = ({
  src,
  alt,
  size = 'md',
  className,
  fallback
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const sizePx = {
    sm: 32,
    md: 40,
    lg: 48,
    xl: 64
  };

  if (!src) {
    return (
      <div
        className={cn(
          'rounded-full bg-gray-200 flex items-center justify-center',
          sizeClasses[size],
          className
        )}
      >
        <span className="text-gray-500 font-medium">
          {fallback || alt.charAt(0).toUpperCase()}
        </span>
      </div>
    );
  }

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={sizePx[size]}
      height={sizePx[size]}
      className={cn(
        'rounded-full object-cover',
        sizeClasses[size],
        className
      )}
      fallbackSrc={`data:image/svg+xml;base64,${btoa(
        `<svg width="${sizePx[size]}" height="${sizePx[size]}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#f0f0f0"/><text x="50%" y="50%" font-family="Arial" font-size="${sizePx[size] / 2}" fill="#999" text-anchor="middle" dy=".3em">${fallback || alt.charAt(0).toUpperCase()}</text></svg>`
      )}`}
    />
  );
};

// Logo component with optimized loading
interface OptimizedLogoProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
}

export const OptimizedLogo: React.FC<OptimizedLogoProps> = ({
  src,
  alt,
  width = 120,
  height = 40,
  className,
  priority = true
}) => {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority={priority}
      quality={90}
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
    />
  );
};

// Hero image component with optimized loading
interface OptimizedHeroImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}

export const OptimizedHeroImage: React.FC<OptimizedHeroImageProps> = ({
  src,
  alt,
  className,
  priority = true
}) => {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      fill
      className={cn('object-cover', className)}
      priority={priority}
      quality={85}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
    />
  );
};