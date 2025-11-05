"use client";

import React, { Suspense, lazy, ComponentType } from "react";
import { LoadingSpinner, LoadingSkeleton } from "@/components/ui/loading";

interface LazyWrapperProps {
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

// Generic lazy wrapper component
export const LazyWrapper: React.FC<LazyWrapperProps> = ({
  fallback = <LoadingSpinner />,
  children,
}) => {
  return <Suspense fallback={fallback}>{children}</Suspense>;
};

// Higher-order component for lazy loading
export function withLazyLoading<P = {}>(
  Component: React.ComponentType<P>,
  fallback?: React.ReactNode,
) {
  const LazyComponent = lazy(() => Promise.resolve({ default: Component }));

  return (props: P) => {
    return (
      <Suspense fallback={fallback || <LoadingSpinner />}>
        <LazyComponent {...(props as any)} />
      </Suspense>
    );
  };
}

// Intersection Observer based lazy loading
interface IntersectionLazyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  rootMargin?: string;
  threshold?: number;
  className?: string;
}

export const IntersectionLazy: React.FC<IntersectionLazyProps> = ({
  children,
  fallback = <LoadingSkeleton />,
  rootMargin = "50px",
  threshold = 0.1,
  className,
}) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const [hasLoaded, setHasLoaded] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting && !hasLoaded) {
          setIsVisible(true);
          setHasLoaded(true);
        }
      },
      {
        rootMargin,
        threshold,
      },
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [rootMargin, threshold, hasLoaded]);

  return (
    <div ref={ref} className={className}>
      {isVisible ? (
        <Suspense fallback={fallback}>{children}</Suspense>
      ) : (
        fallback
      )}
    </div>
  );
};

// Lazy load images with intersection observer
interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className,
  placeholder = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+TG9hZGluZy4uLjwvdGV4dD48L3N2Zz4=",
  onLoad,
  onError,
}) => {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [isInView, setIsInView] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);
  const imgRef = React.useRef<HTMLImageElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <img
        ref={imgRef}
        src={isInView ? src : placeholder}
        alt={alt}
        className={`transition-opacity duration-300 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
        onLoad={handleLoad}
        onError={handleError}
        loading="lazy"
        decoding="async"
      />
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 animate-pulse bg-gray-200" />
      )}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <span className="text-sm text-gray-500">Failed to load image</span>
        </div>
      )}
    </div>
  );
};

// Lazy load components based on user interaction
interface InteractionLazyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  trigger?: "hover" | "click" | "focus";
  className?: string;
}

export const InteractionLazy: React.FC<InteractionLazyProps> = ({
  children,
  fallback = <LoadingSkeleton />,
  trigger = "hover",
  className,
}) => {
  const [shouldLoad, setShouldLoad] = React.useState(false);

  const handleInteraction = () => {
    if (!shouldLoad) {
      setShouldLoad(true);
    }
  };

  const eventProps = {
    [trigger === "hover"
      ? "onMouseEnter"
      : trigger === "click"
        ? "onClick"
        : "onFocus"]: handleInteraction,
  };

  return (
    <div className={className} {...eventProps}>
      {shouldLoad ? (
        <Suspense fallback={fallback}>{children}</Suspense>
      ) : (
        fallback
      )}
    </div>
  );
};

// Preload component for critical resources
interface PreloadProps {
  href: string;
  as: "script" | "style" | "font" | "image";
  crossOrigin?: "anonymous" | "use-credentials";
  type?: string;
}

export const Preload: React.FC<PreloadProps> = ({
  href,
  as,
  crossOrigin,
  type,
}) => {
  React.useEffect(() => {
    const link = document.createElement("link");
    link.rel = "preload";
    link.href = href;
    link.as = as;
    if (crossOrigin) link.crossOrigin = crossOrigin;
    if (type) link.type = type;

    document.head.appendChild(link);

    return () => {
      if (document.head.contains(link)) {
        document.head.removeChild(link);
      }
    };
  }, [href, as, crossOrigin, type]);

  return null;
};
