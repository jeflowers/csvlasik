import React, { useState, useEffect, useRef } from 'react';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  placeholderSrc?: string;
  threshold?: number;
  rootMargin?: string;
}

const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  placeholderSrc,
  threshold = 0.1,
  rootMargin = '50px',
  className = '',
  ...props
}) => {
  const [imageSrc, setImageSrc] = useState<string>(placeholderSrc || '');
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!imgRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(imgRef.current);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin]);

  useEffect(() => {
    if (!isInView) return;

    const img = new Image();
    img.src = src;

    img.onload = () => {
      setImageSrc(src);
      setIsLoaded(true);
    };

    img.onerror = () => {
      console.error(`Failed to load image: ${src}`);
      setIsLoaded(true);
    };
  }, [src, isInView]);

  return (
    <img
      ref={imgRef}
      src={imageSrc}
      alt={alt}
      className={`transition-opacity duration-300 ${
        isLoaded ? 'opacity-100' : 'opacity-0'
      } ${className}`}
      loading="lazy"
      {...props}
    />
  );
};

export default LazyImage;
