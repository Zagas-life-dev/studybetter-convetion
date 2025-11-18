# Media Search Setup Guide

This guide explains how to set up and use the free image and video search feature for summaries and explanations.

## Overview

The media search feature automatically enhances AI-generated summaries and explanations with relevant images and video tutorials from free public sources. The system uses:

- **Wikipedia/Wikimedia Commons** (Free, no API key required) - Images
- **Unsplash** (Free tier available) - Images
- **YouTube** (Free tier, requires API key - optional) - Video tutorials
- **Pexels** (Currently disabled)

## How It Works

1. **AI Request**: When generating summaries/explanations, the AI can request images using the format: `[IMAGE: search query]`
2. **Automatic Replacement**: The system automatically searches for relevant images and replaces the request with actual image markdown
3. **Free Sources Only**: All images come from free, public sources to minimize costs

## Setup Instructions

### 1. Basic Setup (Wikipedia/Wikimedia Commons Only)

No configuration needed! The system works out of the box using Wikipedia and Wikimedia Commons APIs, which are completely free and don't require API keys.

### 2. Optional: Add YouTube API (Recommended)

YouTube provides access to educational video tutorials. To enable YouTube video search:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the YouTube Data API v3
4. Create credentials (API Key)
5. Add it to your `.env.local` file:

```env
YOUTUBE_API_KEY=your_youtube_api_key_here
```

**Note**: YouTube free tier allows 10,000 units per day. Each search uses 100 units, so you get ~100 searches per day (more than enough for most use cases).

### 3. Optional: Add Unsplash API (Advanced)

For better Unsplash integration, you can use their official API:

1. Sign up at [Unsplash Developers](https://unsplash.com/developers)
2. Create a new application
3. Get your Access Key
4. Add it to your `.env.local` file:

```env
UNSPLASH_ACCESS_KEY=your_unsplash_access_key_here
```

**Note**: The current implementation uses a simplified approach that works without an API key, but using the official API provides better results.

### 4. Pexels (Currently Disabled)

Pexels is currently disabled. To re-enable it in the future, uncomment the Pexels search function in `lib/image-search.ts` and add:

```env
PEXELS_API_KEY=your_pexels_api_key_here
```

## Usage

### Automatic Usage

The media search is **automatically enabled** for all summaries and explanations. The AI will intelligently request images and video tutorials when they would enhance understanding.

### Manual Image Search API

You can also use the image search API directly:

#### GET Request

```bash
GET /api/images/search?query=photosynthesis&limit=5
```

#### POST Request

```bash
POST /api/images/search
Content-Type: application/json

{
  "query": "human brain anatomy",
  "limit": 5,
  "minWidth": 400,
  "minHeight": 300
}
```

#### Extract Keywords from Text

```bash
POST /api/images/search
Content-Type: application/json

{
  "text": "The process of photosynthesis converts light energy into chemical energy...",
  "extractKeywords": true,
  "limit": 3
}
```

## Media Request Format

In your AI prompts or markdown content, use:

### Images
```
[IMAGE: search query]
```

Examples:
- `[IMAGE: photosynthesis diagram]`
- `[IMAGE: human brain anatomy]`
- `[IMAGE: DNA structure]`
- `[IMAGE: solar system planets]`

### Video Tutorials
```
[VIDEO: search query]
[YT: search query]  // Short form
[VIDEO: search query, tutorial]  // Specify type
[VIDEO: search query, explanation]  // Alternative type
```

Examples:
- `[VIDEO: how photosynthesis works]`
- `[YT: calculus derivatives explained]`
- `[VIDEO: human brain anatomy, tutorial]`
- `[VIDEO: DNA replication process, explanation]`

The system will automatically replace these with appropriate images from free sources and YouTube video embeds.

## Features

- ✅ **100% Free Sources**: Wikipedia, Wikimedia Commons (no API key needed)
- ✅ **Optional Premium Sources**: YouTube, Unsplash (free tiers available)
- ✅ **Automatic Enhancement**: Images and videos are automatically added to summaries/explanations
- ✅ **Video Tutorials**: YouTube integration for educational video content
- ✅ **Smart Keyword Extraction**: Automatically extracts relevant keywords from content
- ✅ **Caching**: Results are cached for 1 hour to reduce API calls
- ✅ **Error Handling**: Gracefully falls back if media search fails
- ✅ **Responsive Embeds**: YouTube videos are embedded with responsive design

## Cost Considerations

- **Wikipedia/Wikimedia Commons**: Completely free, unlimited
- **YouTube**: Free tier = 10,000 units/day (~100 searches/day)
- **Unsplash**: Free tier available (50 requests/hour without API key)
- **Pexels**: Currently disabled

**Total Monthly Cost**: $0 (if using only Wikipedia/Wikimedia Commons) or minimal (if using all free tiers)

## Troubleshooting

### Images Not Appearing

1. Check that the AI is using the `[IMAGE: query]` format
2. Verify the search query is specific enough
3. Check server logs for image search errors
4. Ensure network connectivity to image APIs

### Rate Limiting

If you hit rate limits:
- Wikipedia/Wikimedia: No limits
- Pexels: 200 requests/hour (free tier)
- Unsplash: 50 requests/hour (without API key)

The system includes caching to minimize API calls.

### Image Quality

- Wikipedia/Wikimedia: Best for educational/scientific content
- Pexels: Best for general stock photos
- Unsplash: Best for high-quality photography

The system prioritizes Wikipedia/Wikimedia for educational content.

## API Response Format

```json
{
  "query": "photosynthesis",
  "results": [
    {
      "url": "https://example.com/image.jpg",
      "thumbnailUrl": "https://example.com/thumb.jpg",
      "title": "Photosynthesis Diagram",
      "source": "wikipedia",
      "width": 800,
      "height": 600,
      "attribution": "Wikipedia - Photosynthesis"
    }
  ],
  "count": 1
}
```

## Security Notes

- All image URLs are from trusted public sources
- No user data is sent to image APIs
- Images are loaded directly from source (no proxy/caching on our servers)
- User-Agent headers are set for API compliance

## Future Enhancements

Potential improvements:
- Image caching/proxy for faster loading
- Image optimization/compression
- Support for more free image sources
- Custom image search preferences per user
- Image relevance scoring

