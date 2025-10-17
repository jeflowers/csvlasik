/**
 * @file YouTubeExternalLink.tsx
 * @description Emergency fallback - opens videos on YouTube instead of embedding
 * @author Development
 * @filepath csvlasik/src/components/YouTubeExternalLink.tsx
 * @category Component
 * @pattern Fallback Strategy
 * @version 1.0.0
 * @last_updated 2025-10-17
 * 
 * @usage
 * Use this if embeds completely fail
 * import YouTubeExternalLink from '@/components/YouTubeExternalLink'
 * <YouTubeExternalLink videoId="dQw4w9WgXcQ" title="Video Title" />
 */

import React from 'react';
import { Play, ExternalLink } from 'lucide-react';

interface YouTubeExternalLinkProps {
  videoId: string;
  title?: string;
  thumbnail?: string;
  className?: string;
}

const YouTubeExternalLink: React.FC<YouTubeExternalLinkProps> = ({
  videoId,
  title = 'Watch Video',
  thumbnail,
  className = "w-full h-96 lg:h-[500px]"
}) => {
  const getThumbnailUrl = () => {
    if (thumbnail) return thumbnail;
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  };

  const openVideo = () => {
    window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div 
      className={`relative ${className} cursor-pointer group overflow-hidden rounded-lg`}
      onClick={openVideo}
    >
      <img
        src={getThumbnailUrl()}
        alt={title}
        className="w-full h-full object-cover"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
        }}
      />
      
      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />
      
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xl mb-4">
          <Play className="w-12 h-12 text-red-600 ml-1 fill-red-600" />
        </div>
        <p className="text-lg font-semibold">Watch on YouTube</p>
        <p className="text-sm opacity-90 mt-1">{title}</p>
      </div>
      
      <div className="absolute top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg">
        <ExternalLink className="w-4 h-4" />
        <span className="font-medium">Open YouTube</span>
      </div>
    </div>
  );
};

export default YouTubeExternalLink;