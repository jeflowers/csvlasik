import React, { useState, useEffect } from 'react';

interface ImageOptimizerProps {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  webpSrc?: string;
  avifSrc?: string;
  placeholder?: string;
}

const ImageOptimizer: React.FC<ImageOptimizerProps> = ({
  src,
  alt,
  className = '',
  sizes = '100vw',
  priority = false,
  webpSrc,
  avifSrc,
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PC9zdmc+'
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority);

  useEffect(() => {
    if (priority) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    const element = document.getElementById(`img-${src.replace(/[^a-zA-Z0-9]/g, '')}`);
    if (element) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, [src, priority]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(true);
  };

  // Generate responsive image sources
  const generateSrcSet = (baseSrc: string, format?: string) => {
    const ext = format || baseSrc.split('.').pop();
    const baseName = baseSrc.replace(/\.[^/.]+$/, '');
    
    return [
      `${baseName}-400w.${ext} 400w`,
      `${baseName}-800w.${ext} 800w`,
      `${baseName}-1200w.${ext} 1200w`,
      `${baseName}-1920w.${ext} 1920w`
    ].join(', ');
  };

  return (
    <div 
      id={`img-${src.replace(/[^a-zA-Z0-9]/g, '')}`}
      className={`relative overflow-hidden ${className}`}
    >
      {!isLoaded && (
        <img
          src={placeholder}
          alt=""
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-0' : 'opacity-100'
          }`}
          aria-hidden="true"
        />
      )}
      
      {(isInView || priority) && (
        <picture>
          {avifSrc && (
            <source
              srcSet={generateSrcSet(avifSrc, 'avif')}
              sizes={sizes}
              type="image/avif"
            />
          )}
          {webpSrc && (
            <source
              srcSet={generateSrcSet(webpSrc, 'webp')}
              sizes={sizes}
              type="image/webp"
            />
          )}
          <img
            src={hasError ? placeholder : src}
            srcSet={generateSrcSet(src)}
            sizes={sizes}
            alt={alt}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            } ${className}`}
            onLoad={handleLoad}
            onError={handleError}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
          />
        </picture>
      )}
    </div>
  );
};

export default ImageOptimizer;