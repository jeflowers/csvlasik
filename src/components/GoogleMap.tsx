/**
 * @file GoogleMap.tsx
 * @description Reusable Google Maps embed component
 * @author Development
 * @filepath atelierlasik/src/components/GoogleMap.tsx
 * @category Component
 * @pattern Component Composition
 * @version 1.0.0
 * @last_updated 2025-10-24
 *
 * @features
 * - Interactive Google Maps embed
 * - Loading state with fallback
 * - Configurable location and zoom
 * - Accessibility support
 * - Responsive design
 *
 * @usage
 * import GoogleMap from '@/components/GoogleMap'
 * <GoogleMap address="123 Main St, City, State ZIP" />
 */

import React from 'react';
import { MapPin } from 'lucide-react';

interface GoogleMapProps {
  address: string;
  zoom?: number;
  height?: string;
  className?: string;
  title?: string;
  allowGeolocation?: boolean;
}

const GoogleMap: React.FC<GoogleMapProps> = ({
  address,
  zoom = 15,
  height = '500px',
  className = '',
  title = 'Location Map',
  allowGeolocation = true
}) => {
  const getEmbedUrl = () => {
    const encodedAddress = encodeURIComponent(address);
    const params = new URLSearchParams({
      q: address,
      z: zoom.toString(),
      output: 'embed',
      iwloc: '',
      t: ''
    });

    return `https://maps.google.com/maps?${params.toString()}`;
  };

  return (
    <div
      className={`relative bg-gray-100 rounded-lg overflow-hidden ${className}`}
      style={{ height }}
    >
      <iframe
        src={getEmbedUrl()}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title={title}
        className="w-full h-full"
        allow={allowGeolocation ? 'geolocation' : undefined}
        aria-label={`Interactive map showing ${address}`}
      />

      {/* Fallback loading indicator */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10">
        <div className="text-center text-gray-400">
          <MapPin className="h-16 w-16 mx-auto mb-2 opacity-20" />
          <p className="text-sm">Loading map...</p>
        </div>
      </div>
    </div>
  );
};

export default GoogleMap;
