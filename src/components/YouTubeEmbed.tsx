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
  useApiThumbnail?: boolean;
}

const YouTubeEmbed: React.FC<YouTubeEmbedProps> = ({
  videoId,
  title,
  thumbnail,
  start,
  end,
  className = "w-full h-96 lg:h-[500px]",
  useApiThumbnail = false
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [embedError, setEmbedError] = useState(false);
  const [apiThumbnail, setApiThumbnail] = useState<string | null>(null);
  const [videoTitle, setVideoTitle] = useState(title || '');

  useEffect(() => {
    if (useApiThumbnail && !thumbnail) {
      youtubeService.getVideoData(videoId).then((data) => {
        if (data) {
          setApiThumbnail(youtubeService.getBestThumbnail(videoId, data.thumbnails));
          if (!title) {
            setVideoTitle(data.title);
          }
        }
      });
    }
  }, [videoId, useApiThumbnail, thumbnail, title]);

  const getThumbnailUrl = () => {
    if (thumbnail) return thumbnail;
    if (apiThumbnail) return apiThumbnail;
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  };

  const getVideoUrl = () => {
    let url = `https://www.youtube.com/watch?v=${videoId}`;
    if (start) url += `&t=${start}s`;
    return url;
  };

  const getEmbedUrl = () => {
    const params = new URLSearchParams({
      autoplay: '1',
      rel: '0',
      modestbranding: '1'
    });

    if (start) params.append('start', start.toString());
    if (end) params.append('end', end.toString());

    return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
  };

  const handlePlay = () => {
    if (embedError) {
      window.open(getVideoUrl(), '_blank', 'noopener,noreferrer');
    } else {
      setIsPlaying(true);
    }
  };

  if (isPlaying && !embedError) {
    return (
      <div className={`relative ${className}`}>
        <iframe
          className="w-full h-full"
          src={getEmbedUrl()}
          title={videoTitle || 'YouTube video player'}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          sandbox="allow-scripts allow-same-origin allow-presentation"
          onError={() => setEmbedError(true)}
        ></iframe>
        {embedError && (
          <div className="absolute inset-0 bg-gray-900 flex flex-col items-center justify-center text-white p-8">
            <ExternalLink className="w-16 h-16 mb-4" />
            <p className="text-xl mb-4">Unable to embed video</p>
            <button
              onClick={() => window.open(getVideoUrl(), '_blank', 'noopener,noreferrer')}
              className="bg-[#B8860B] text-white px-6 py-3 rounded-lg hover:bg-[#9A7209] transition-colors"
            >
              Watch on YouTube
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`relative ${className} cursor-pointer group`} onClick={handlePlay}>
      <img
        src={getThumbnailUrl()}
        alt={videoTitle}
        className="w-full h-full object-cover"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
        }}
      />
      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex items-center justify-center">
        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center group-hover:scale-110 transition-all shadow-2xl">
          {embedError ? (
            <ExternalLink className="w-10 h-10 text-[#B8860B]" />
          ) : (
            <Play className="w-10 h-10 text-[#B8860B] ml-1 fill-[#B8860B]" />
          )}
        </div>
      </div>
      <div className="absolute bottom-4 right-4 bg-black/80 text-white px-3 py-1 rounded text-sm">
        {embedError ? 'Open on YouTube' : 'Watch on YouTube'}
      </div>
    </div>
  );
};

export default YouTubeEmbed;
