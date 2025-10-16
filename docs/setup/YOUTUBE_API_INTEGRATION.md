# YouTube API Integration Guide

This guide explains how to set up and use the YouTube Data API v3 integration in the ClearSight website.

## Overview

The YouTube API integration provides:
- Dynamic video thumbnail fetching (highest quality available)
- Automatic video metadata retrieval (title, description)
- Client-side caching to minimize API calls
- Graceful fallback when API key is not configured

## Setup Instructions

### 1. Get Your YouTube API Key

Follow these steps to obtain a YouTube Data API key:

1. **Go to Google Cloud Console**
   - Visit: https://console.developers.google.com/
   - Sign in with your Google account

2. **Create a New Project**
   - Click "Select a project" dropdown at the top
   - Click "New Project"
   - Enter project name (e.g., "ClearSight Website")
   - Click "Create"

3. **Enable YouTube Data API v3**
   - In your project, go to "APIs & Services" > "Library"
   - Search for "YouTube Data API v3"
   - Click on it and press "Enable"

4. **Create API Credentials**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API key"
   - Your API key will be generated in 2-3 seconds
   - Copy and save the key securely

5. **Restrict Your API Key (Recommended)**
   - Click on the API key to edit it
   - Under "Application restrictions", select "HTTP referrers"
   - Add your website domains:
     - `https://clearsight-la.com/*`
     - `https://www.clearsight-la.com/*`
     - `http://localhost:5173/*` (for development)
   - Under "API restrictions", select "Restrict key"
   - Choose "YouTube Data API v3"
   - Click "Save"

### 2. Configure Environment Variable

Add your API key to the `.env` file:

```bash
VITE_YOUTUBE_API_KEY=your-actual-api-key-here
```

**Important:** Never commit your API key to version control!

### 3. Using the YouTube API

#### Option 1: Automatic API Thumbnails (Recommended)

Set `useApiThumbnail={true}` to automatically fetch high-quality thumbnails:

```tsx
<YouTubeEmbed
  videoId="m3Wh80B0ygk"
  useApiThumbnail={true}
  className="w-full h-96 lg:h-[500px]"
/>
```

#### Option 2: Custom Thumbnail with API Fallback

Provide a custom thumbnail but let the API fetch metadata:

```tsx
<YouTubeEmbed
  videoId="smzkYORJQQc"
  title="Guam LASIK Treatment"
  thumbnail="/assets/images/team/drflowers/DrFlowers_guam_01.png"
  useApiThumbnail={false}
  className="w-full h-96 lg:h-[500px]"
/>
```

#### Option 3: Fully Manual (No API)

Don't use the API at all (uses YouTube's default thumbnails):

```tsx
<YouTubeEmbed
  videoId="m3Wh80B0ygk"
  title="Dr. Charles W. Flowers Jr., M.D."
  thumbnail="/assets/images/team/drflowers/dr-flowers-headshot.jpg"
  className="w-full h-96 lg:h-[500px]"
/>
```

## API Features

### YouTubeService

The `youtubeService` provides these methods:

```typescript
// Get complete video data
const videoData = await youtubeService.getVideoData('videoId');

// Get best quality thumbnail
const thumbnail = await youtubeService.getVideoThumbnail('videoId');

// Clear cache (useful for testing)
youtubeService.clearCache();
```

### Caching

- Video data is cached for 24 hours
- Reduces API calls and improves performance
- Cache is stored in memory (resets on page reload)

### Error Handling

The integration gracefully handles errors:
- Missing API key: Falls back to default YouTube thumbnails
- API errors: Falls back to default YouTube thumbnails
- Network errors: Falls back to default YouTube thumbnails
- Invalid video ID: Shows default thumbnail with error handling

## API Usage Limits

**Free Quota:** 10,000 units per day

**Typical Operations:**
- `videos.list` (metadata): 1 unit per request
- Each video on your site: ~1 unit per unique visitor per day (thanks to caching)

**Estimated Traffic:**
- 1,000 unique daily visitors viewing videos: ~1,000 units/day
- Well within the free quota

## Cost Considerations

- **Free Tier:** 10,000 units/day (permanent free quota)
- **No Credit Card Required:** For free tier usage
- **Paid Plans:** If you exceed 10,000 units/day
  - $0.20 per 10,000 additional units
  - Very cost-effective for most websites

## Best Practices

1. **Always restrict your API key** to specific domains
2. **Enable caching** (already implemented)
3. **Use custom thumbnails** for critical videos (About page hero)
4. **Test without API key** to ensure fallbacks work
5. **Monitor usage** in Google Cloud Console

## Troubleshooting

### API Key Not Working

1. Check that the key is correctly set in `.env`
2. Verify the key is enabled for YouTube Data API v3
3. Check domain restrictions match your website URL
4. Look for errors in browser console

### No Thumbnails Loading

1. Check browser console for errors
2. Verify internet connection
3. Test with a known working video ID
4. Try clearing cache: `youtubeService.clearCache()`

### Quota Exceeded

1. Check usage in Google Cloud Console
2. Consider reducing API calls by using more custom thumbnails
3. Implement server-side caching if needed
4. Contact Google to increase quota (paid)

## Example Implementation

See these files for reference:
- `src/services/youtubeService.ts` - API service implementation
- `src/components/YouTubeEmbed.tsx` - Component with API integration
- `src/pages/About.tsx` - Usage examples

## Without API Key

The website works perfectly without an API key:
- Uses YouTube's default thumbnail endpoints
- All videos play normally
- Custom thumbnails (like Dr. Flowers headshot) still work
- No degradation in user experience

## Security Notes

- API keys should be restricted to specific domains
- Never commit API keys to version control
- Use environment variables for all API keys
- Rotate keys if compromised
- Monitor API usage regularly

## Additional Resources

- [YouTube Data API Documentation](https://developers.google.com/youtube/v3)
- [API Key Best Practices](https://cloud.google.com/docs/authentication/api-keys)
- [Quota Management](https://developers.google.com/youtube/v3/getting-started#quota)
