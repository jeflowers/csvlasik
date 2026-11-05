import React, { useState } from 'react';
import { Play, ExternalLink } from 'lucide-react';

interface VimeoEmbedProps {
  videoId: string;
  title?: string;
  className?: string;
}

const VimeoEmbed: React.FC<VimeoEmbedProps> = ({ videoId, title = 'Vimeo video', className = 'w-full h-full' }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const vimeoUrl = `https://vimeo.com/${encodeURIComponent(videoId)}`;

  if (isPlaying) {
    return (
      <iframe
        data-testid="vimeo-iframe"
        src={`https://player.vimeo.com/video/${encodeURIComponent(videoId)}?dnt=1&autoplay=1`}
        className={className}
        style={{ border: 0 }}
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        title={title}
      />
    );
  }

  return (
    <div
      data-testid="vimeo-placeholder"
      className={`relative ${className} flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-gray-800 to-gray-900 text-white p-6 text-center`}
    >
      <button
        type="button"
        data-testid="vimeo-load-button"
        onClick={() => setIsPlaying(true)}
        aria-label={`Play ${title}`}
        className="w-20 h-20 bg-white rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-2xl"
      >
        <Play className="w-10 h-10 text-[#B8860B] ml-1 fill-[#B8860B]" />
      </button>
      <p className="text-sm text-gray-300 max-w-xs leading-relaxed">
        Playing this video connects to Vimeo, which may set cookies.
      </p>
      <a
        href={vimeoUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-xs text-gray-300 hover:text-white underline transition-colors"
      >
        <ExternalLink className="w-3 h-3" />
        Watch on Vimeo
      </a>
    </div>
  );
};

export default VimeoEmbed;
