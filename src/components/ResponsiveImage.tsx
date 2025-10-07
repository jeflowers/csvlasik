import React from 'react';
import ImageOptimizer from './ImageOptimizer';
import { ImageConfig, getOptimizedImageProps } from '../utils/imageUtils';

interface ResponsiveImageProps extends ImageConfig {
  className?: string;
  loading?: 'lazy' | 'eager';
  objectFit?: 'cover' | 'contain' | 'fill' | 'scale-down' | 'none';
}

const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  className = '',
  loading = 'lazy',
  objectFit = 'cover',
  ...imageConfig
}) => {
  const optimizedProps = getOptimizedImageProps(imageConfig);
  
  return (
    <ImageOptimizer
      {...optimizedProps}
      className={`${className} ${objectFit === 'cover' ? 'object-cover' : 
                   objectFit === 'contain' ? 'object-contain' :
                   objectFit === 'fill' ? 'object-fill' :
                   objectFit === 'scale-down' ? 'object-scale-down' : 'object-none'}`}
    />
  );
};

export default ResponsiveImage;