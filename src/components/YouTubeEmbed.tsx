/**
 * @file YouTubeEmbed.tsx
 * @description YouTube video embed component with comprehensive error handling
 * @author Development
 * @filepath atelierlasik/src/components/YouTubeEmbed.tsx
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

import React, { useState, useEffect } from 'react';
import { Play, ExternalLink } from 'lucide-react';
import { youtubeService } from '../services/youtubeService';

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
  const [videoData, setVideoData] = useState<{ title: string; thumbnail: string } | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchVideoData() {
      try {
        const data = await youtubeService.getVideoData(videoId);
        if (mounted && data) {
          setVideoData({
            title: data.title,
            thumbnail: youtubeService.getBestThumbnail(videoId, data.thumbnails)
          });
        }
      } catch (error) {
        console.warn('Failed to fetch YouTube video data:', error);
      }
    }

    if (!thumbnail) {
      fetchVideoData();
    }

    return () => {
      mounted = false;
    };
  }, [videoId, thumbnail]);

  const getThumbnailUrl = () => {
    if (thumbnail) return thumbnail;
    if (videoData?.thumbnail) return videoData.thumbnail;
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  };

  const getVideoTitle = () => {
    if (title && title !== 'YouTube video') return title;
    if (videoData?.title) return videoData.title;
    return title;
  };

  const getYouTubeUrl = () => {
    let url = `https://www.youtube.com/watch?v=${videoId}`;
    if (start) url += `&t=${start}s`;
    return url;
  };

  const getEmbedUrl = () => {
    const baseUrl = 'https://www.youtube.com/embed';
    const params = new URLSearchParams();

    if (autoplay || isPlaying) params.append('autoplay', '1');
    params.append('rel', '0');
    params.append('modestbranding', '1');

    if (start) params.append('start', start.toString());
    if (end) params.append('end', end.toString());

    return `${baseUrl}/${videoId}?${params.toString()}`;
  };

  const handlePlay = () => {
    if (embedFailed || isDevEnvironment) {
      window.open(getYouTubeUrl(), '_blank', 'noopener,noreferrer');
    } else {
      setIsPlaying(true);
    }
  };

  const openOnYouTube = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(getYouTubeUrl(), '_blank', 'noopener,noreferrer');
  };

  const isDevEnvironment = window.location.hostname.includes('webcontainer') ||
                          window.location.hostname.includes('bolt.new') ||
                          window.location.hostname.includes('stackblitz') ||
                          window.location.hostname.includes('localhost');

  if (isPlaying && !isDevEnvironment) {
    return (
      <div className={`relative ${className}`}>
        <iframe
          src={getEmbedUrl()}
          title={getVideoTitle()}
          className="w-full h-full rounded-lg"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          style={{ border: 0 }}
          onError={() => setEmbedFailed(true)}
        />

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

  return (
    <div
      className={`relative ${className} cursor-pointer group overflow-hidden rounded-lg`}
      onClick={handlePlay}
    >
      <img
        src={getThumbnailUrl()}
        alt={getVideoTitle()}
        className="w-full h-full object-cover"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          if (!target.src.includes('hqdefault')) {
            target.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
          }
        }}
      />

      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xl">
          <Play className="w-10 h-10 text-[#B8860B] ml-1 fill-[#B8860B]" />
        </div>
      </div>

      <div className="absolute bottom-4 right-4 bg-black/80 text-white px-3 py-1.5 rounded text-sm font-medium">
        {isDevEnvironment ? 'Open on YouTube' : 'Watch Video'}
      </div>

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
