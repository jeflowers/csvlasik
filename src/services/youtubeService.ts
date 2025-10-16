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

interface YouTubeAPIResponse {
  items: Array<{
    id: string;
    snippet: {
      title: string;
      description: string;
      thumbnails: YouTubeVideoData['thumbnails'];
      channelTitle: string;
      publishedAt: string;
    };
  }>;
}

class YouTubeService {
  private apiKey: string;
  private baseURL = 'https://www.googleapis.com/youtube/v3';
  private cache: Map<string, { data: YouTubeVideoData; timestamp: number }> = new Map();
  private cacheDuration = 24 * 60 * 60 * 1000;

  constructor() {
    this.apiKey = import.meta.env.VITE_YOUTUBE_API_KEY || '';
  }

  private isApiKeyConfigured(): boolean {
    return this.apiKey.length > 0;
  }

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
    if (!this.isApiKeyConfigured()) {
      console.warn('YouTube API key not configured. Using default thumbnails.');
      return null;
    }

    const cached = this.getCachedData(videoId);
    if (cached) {
      return cached;
    }

    try {
      const url = `${this.baseURL}/videos?id=${videoId}&key=${this.apiKey}&part=snippet`;
      const response = await fetch(url);

      if (!response.ok) {
        console.error('YouTube API error:', response.status, response.statusText);
        return null;
      }

      const data: YouTubeAPIResponse = await response.json();

      if (!data.items || data.items.length === 0) {
        console.error('Video not found:', videoId);
        return null;
      }

      const video = data.items[0];
      const videoData: YouTubeVideoData = {
        id: video.id,
        title: video.snippet.title,
        description: video.snippet.description,
        thumbnails: video.snippet.thumbnails,
        channelTitle: video.snippet.channelTitle,
        publishedAt: video.snippet.publishedAt,
      };

      this.setCachedData(videoId, videoData);
      return videoData;
    } catch (error) {
      console.error('Error fetching YouTube video data:', error);
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
