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
  console.log('='.repeat(80));
  console.log(`[YouTubeEmbed INIT] videoId: ${videoId}`);
  console.log(`[YouTubeEmbed INIT] title: ${title}`);
  console.log(`[YouTubeEmbed INIT] autoplay: ${autoplay}`);

  const [isPlaying, setIsPlaying] = useState(autoplay);
  const [embedFailed, setEmbedFailed] = useState(false);

  console.log(`[YouTubeEmbed STATE] isPlaying: ${isPlaying}`);
  console.log(`[YouTubeEmbed STATE] embedFailed: ${embedFailed}`);

  const getThumbnailUrl = () => {
    const url = thumbnail || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    console.log(`[YouTubeEmbed] getThumbnailUrl: ${url}`);
    return url;
  };

  const getYouTubeUrl = () => {
    let url = `https://www.youtube.com/watch?v=${videoId}`;
    if (start) url += `&t=${start}s`;
    console.log(`[YouTubeEmbed] getYouTubeUrl: ${url}`);
    return url;
  };

  const getEmbedUrl = () => {
    const baseUrl = 'https://www.youtube-nocookie.com/embed';
    const params = new URLSearchParams();

    if (autoplay || isPlaying) params.append('autoplay', '1');
    params.append('rel', '0');
    params.append('modestbranding', '1');

    if (start) params.append('start', start.toString());
    if (end) params.append('end', end.toString());

    const embedUrl = `${baseUrl}/${videoId}?${params.toString()}`;
    console.log(`[YouTubeEmbed] getEmbedUrl: ${embedUrl}`);
    return embedUrl;
  };

  const handlePlay = () => {
    console.log(`[YouTubeEmbed] handlePlay CALLED`);
    console.log(`[YouTubeEmbed] handlePlay - embedFailed: ${embedFailed}`);
    console.log(`[YouTubeEmbed] handlePlay - current isPlaying: ${isPlaying}`);

    const isDevEnvironment = window.location.hostname.includes('webcontainer') ||
                            window.location.hostname.includes('bolt.new') ||
                            window.location.hostname.includes('stackblitz');

    if (embedFailed || isDevEnvironment) {
      console.log(`[YouTubeEmbed] handlePlay - Opening YouTube in new tab (dev environment or embed failed)`);
      window.open(getYouTubeUrl(), '_blank', 'noopener,noreferrer');
    } else {
      console.log(`[YouTubeEmbed] handlePlay - Setting isPlaying to TRUE`);
      setIsPlaying(true);
      console.log(`[YouTubeEmbed] handlePlay - setIsPlaying(true) called`);
    }
  };

  const openOnYouTube = (e: React.MouseEvent) => {
    console.log(`[YouTubeEmbed] openOnYouTube CALLED (YouTube button clicked)`);
    e.stopPropagation();
    window.open(getYouTubeUrl(), '_blank', 'noopener,noreferrer');
  };

  if (isPlaying) {
    console.log(`[YouTubeEmbed] RENDERING IFRAME MODE`);
    console.log(`[YouTubeEmbed] Iframe src will be: ${getEmbedUrl()}`);

    return (
      <div className={`relative ${className}`}>
        <iframe
          src={getEmbedUrl()}
          title={title}
          className="w-full h-full rounded-lg"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{ border: 0 }}
          onLoad={(e) => {
            console.log(`[YouTubeEmbed] IFRAME LOADED SUCCESSFULLY`);
            const iframe = e.target as HTMLIFrameElement;
            console.log(`[YouTubeEmbed] Iframe element:`, iframe);
          }}
          onError={(e) => {
            console.error(`[YouTubeEmbed] IFRAME ERROR:`, e);
            setEmbedFailed(true);
          }}
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

  console.log(`[YouTubeEmbed] RENDERING THUMBNAIL MODE`);

  const isDevEnvironment = window.location.hostname.includes('webcontainer') ||
                          window.location.hostname.includes('bolt.new') ||
                          window.location.hostname.includes('stackblitz');

  return (
    <div
      className={`relative ${className} cursor-pointer group overflow-hidden rounded-lg`}
      onClick={handlePlay}
    >
      <img
        src={getThumbnailUrl()}
        alt={title}
        className="w-full h-full object-cover"
        onLoad={(e) => {
          console.log(`[YouTubeEmbed] Thumbnail loaded successfully`);
        }}
        onError={(e) => {
          console.error(`[YouTubeEmbed] Thumbnail load error`);
          const target = e.target as HTMLImageElement;
          if (!target.src.includes('hqdefault')) {
            console.log(`[YouTubeEmbed] Falling back to hqdefault thumbnail`);
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
