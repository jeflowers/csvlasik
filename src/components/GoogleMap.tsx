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

import React, { useState } from 'react';
import { MapPin, ExternalLink } from 'lucide-react';
import { useThirdPartyEmbedConsent } from '../lib/consent';

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
  const hasConsent = useThirdPartyEmbedConsent();
  const [userLoaded, setUserLoaded] = useState(false);
  const show = hasConsent || userLoaded;

  const getEmbedUrl = () => {
    const params = new URLSearchParams({
      q: address,
      z: zoom.toString(),
      output: 'embed',
      iwloc: '',
      t: ''
    });

    return `https://maps.google.com/maps?${params.toString()}`;
  };

  if (!show) {
    return (
      <div
        data-testid="map-placeholder"
        className={`relative bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center ${className}`}
        style={{ height }}
      >
        <div className="text-center px-6 max-w-sm">
          <MapPin className="h-12 w-12 mx-auto mb-3 text-gray-400" />
          <p className="text-gray-800 font-medium mb-1">{address}</p>
          <p className="text-sm text-gray-500 mb-4">
            Loading the map connects to Google, which may set cookies.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <button
              type="button"
              data-testid="map-load-button"
              onClick={() => setUserLoaded(true)}
              className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Load map
            </button>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1 px-4 py-2 rounded-md border border-gray-300 text-gray-700 text-sm font-medium hover:bg-white transition-colors"
            >
              Open in Google Maps
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative bg-gray-100 rounded-lg overflow-hidden ${className}`}
      style={{ height }}
    >
      <iframe
        data-testid="map-iframe"
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
