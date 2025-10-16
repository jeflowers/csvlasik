import React, { useState, useEffect } from 'react';
import { Play } from 'lucide-react';
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
      modestbranding: '1',
      enablejsapi: '1',
      origin: window.location.origin
    });

    if (start) params.append('start', start.toString());
    if (end) params.append('end', end.toString());

    return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
  };

  if (isPlaying) {
    return (
      <iframe
        className={className}
        src={getEmbedUrl()}
        title={videoTitle || 'YouTube video player'}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
      ></iframe>
    );
  }

  return (
    <div className={`relative ${className} cursor-pointer group`} onClick={() => setIsPlaying(true)}>
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
        <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center group-hover:bg-red-700 transition-all transform group-hover:scale-110">
          <Play className="w-8 h-8 text-white ml-1 fill-white" />
        </div>
      </div>
      <div className="absolute bottom-4 right-4 bg-black/80 text-white px-3 py-1 rounded text-sm">
        Watch on YouTube
      </div>
    </div>
  );
};

export default YouTubeEmbed;
