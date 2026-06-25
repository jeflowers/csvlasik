import { supabase } from '../lib/supabase';

interface YouTubeVideoData {
  id: string;
  title: string;
  description: string;
  thumbnails: {
    default: { url: string; width: number; height: number };
    medium: { url: string; width: number; height: number };
    high: { url: string; width: number; height: number };
    standard?: { url: string; width: number; height: number };
    maxres?: { url: string; width: number; height: number };
  };
  channelTitle: string;
  publishedAt: string;
}

class YouTubeService {
  private cache: Map<string, { data: YouTubeVideoData; timestamp: number }> = new Map();
  private cacheDuration = 24 * 60 * 60 * 1000;

  private getCachedData(videoId: string): YouTubeVideoData | null {
    const cached = this.cache.get(videoId);
    if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
      return cached.data;
    }
    return null;
  }

  private setCachedData(videoId: string, data: YouTubeVideoData): void {
    this.cache.set(videoId, { data, timestamp: Date.now() });
  }

  async getVideoData(videoId: string): Promise<YouTubeVideoData | null> {
    const cached = this.getCachedData(videoId);
    if (cached) {
      return cached;
    }

    try {
      const { data, error } = await supabase.functions.invoke('youtube-proxy', {
        body: { videoId },
      });

      if (error) throw error;

      if (!data?.videos || data.videos.length === 0) {
        console.warn('Video not found:', videoId);
        return null;
      }

      const videoData: YouTubeVideoData = data.videos[0];
      this.setCachedData(videoId, videoData);
      return videoData;
    } catch (error) {
      console.warn('Error fetching YouTube video data:', error);
      return null;
    }
  }

  getBestThumbnail(videoId: string, thumbnails?: YouTubeVideoData['thumbnails']): string {
    if (!thumbnails) {
      return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    }

    if (thumbnails.maxres) return thumbnails.maxres.url;
    if (thumbnails.standard) return thumbnails.standard.url;
    if (thumbnails.high) return thumbnails.high.url;
    if (thumbnails.medium) return thumbnails.medium.url;
    return thumbnails.default.url;
  }

  async getVideoThumbnail(videoId: string): Promise<string> {
    const videoData = await this.getVideoData(videoId);
    if (!videoData) {
      return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    }
    return this.getBestThumbnail(videoId, videoData.thumbnails);
  }

  clearCache(): void {
    this.cache.clear();
  }
}

export const youtubeService = new YouTubeService();
export type { YouTubeVideoData };
