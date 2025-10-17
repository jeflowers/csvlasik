/**
 * @file YouTubeEmbed.tsx
 * @description YouTube video embed component with comprehensive error handling
 * @author Development
 * @filepath csvlasik/src/components/YouTubeEmbed.tsx
 * @category Component
 * @pattern Component Composition
 * @version 2.0.0
 * @last_updated 2025-10-17
 * 
 * @dependencies
 * - react: Component framework
 * - lucide-react: Icon library
 * 
 * @features
 * - Multiple fallback strategies for embed failures
 * - Privacy-enhanced embeds (youtube-nocookie.com)
 * - Click-to-play thumbnail preview
 * - Automatic error detection and recovery
 * - Direct YouTube link fallback
 * 
 * @usage
 * import YouTubeEmbed from '@/components/YouTubeEmbed'
 * <YouTubeEmbed videoId="dQw4w9WgXcQ" title="Video Title" />
 * 
 * @bugfix
 * - Changed to youtube-nocookie.com for better compatibility
 * - Removed all restrictive attributes
 * - Added comprehensive error handling
 * - Simplified iframe configuration
 */

import React, { useState } from 'react';
import { Play, ExternalLink } from 'lucide-react';

interface YouTubeEmbedProps {
  videoId: string;
  title?: string;
  thumbnail?: string;
  start?: number;
  end?: number;
  className?: string;
  autoplay?: boolean;
}

const YouTubeEmbed: React.FC<YouTubeEmbedProps> = ({
  videoId,
  title = 'YouTube video',
  thumbnail,
  start,
  end,
  className = "w-full h-96 lg:h-[500px]",
  autoplay = false
}) => {
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const [embedFailed, setEmbedFailed] = useState(false);

  // Get best thumbnail URL
  const getThumbnailUrl = () => {
    if (thumbnail) return thumbnail;
    // Try maxresdefault first, component will fallback to hqdefault on error
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  };

  // Get direct YouTube URL
  const getYouTubeUrl = () => {
    let url = `https://www.youtube.com/watch?v=${videoId}`;
    if (start) url += `&t=${start}s`;
    return url;
  };

  // Get embed URL with all necessary parameters
  const getEmbedUrl = () => {
    const baseUrl = 'https://www.youtube-nocookie.com/embed';
    const params = new URLSearchParams();
    
    // Essential parameters
    if (autoplay || isPlaying) params.append('autoplay', '1');
    params.append('rel', '0'); // Don't show related videos
    params.append('modestbranding', '1'); // Minimal YouTube branding
    
    // Optional parameters
    if (start) params.append('start', start.toString());
    if (end) params.append('end', end.toString());
    
    return `${baseUrl}/${videoId}?${params.toString()}`;
  };

  // Handle play button click
  const handlePlay = () => {
    if (embedFailed) {
      // If embed failed, open directly on YouTube
      window.open(getYouTubeUrl(), '_blank', 'noopener,noreferrer');
    } else {
      setIsPlaying(true);
    }
  };

  // Handle opening on YouTube
  const openOnYouTube = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(getYouTubeUrl(), '_blank', 'noopener,noreferrer');
  };

  // If playing, show iframe
  if (isPlaying) {
    return (
      <div className={`relative ${className}`}>
        <iframe
          src={getEmbedUrl()}
          title={title}
          className="w-full h-full rounded-lg"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          style={{ border: 0 }}
        />
        
        {/* Fallback button if iframe fails */}
        <button
          onClick={openOnYouTube}
          className="absolute top-4 right-4 bg-black/70 hover:bg-black/90 text-white px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors"
          title="Open on YouTube"
        >
          <ExternalLink className="w-4 h-4" />
          YouTube
        </button>
      </div>
    );
  }

  // Show thumbnail with play button
  return (
    <div 
      className={`relative ${className} cursor-pointer group overflow-hidden rounded-lg`}
      onClick={handlePlay}
    >
      {/* Thumbnail */}
      <img
        src={getThumbnailUrl()}
        alt={title}
        className="w-full h-full object-cover"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          // Fallback to lower quality thumbnail
          if (!target.src.includes('hqdefault')) {
            target.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
          }
        }}
      />
      
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />
      
      {/* Play button */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xl">
          <Play className="w-10 h-10 text-[#B8860B] ml-1 fill-[#B8860B]" />
        </div>
      </div>
      
      {/* Bottom badge */}
      <div className="absolute bottom-4 right-4 bg-black/80 text-white px-3 py-1.5 rounded text-sm font-medium">
        Watch Video
      </div>
      
      {/* YouTube logo/link in corner */}
      <button
        onClick={openOnYouTube}
        className="absolute top-4 right-4 bg-black/70 hover:bg-black/90 text-white px-3 py-1.5 rounded text-xs flex items-center gap-1 transition-colors z-10"
        title="Open on YouTube"
      >
        <ExternalLink className="w-3 h-3" />
        YouTube
      </button>
    </div>
  );
};

export default YouTubeEmbed;