/**
 * Video Search Service
 * Searches YouTube for educational video tutorials
 */

export interface VideoResult {
  videoId: string
  title: string
  thumbnailUrl: string
  channelName: string
  duration?: string
  url: string
  description?: string
}

export interface VideoSearchOptions {
  limit?: number
  type?: 'tutorial' | 'explanation' | 'any'
}

/**
 * Search for videos using YouTube Data API
 * Free tier: 10,000 units per day (1 search = 100 units, so ~100 searches/day)
 * Requires API key but free
 */
export async function searchVideos(
  query: string,
  options: VideoSearchOptions = {}
): Promise<VideoResult[]> {
  const limit = Math.min(options.limit || 5, 10) // Max 10 results
  const type = options.type || 'tutorial'
  const results: VideoResult[] = []
  const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY

  // Only use YouTube if API key is provided
  if (!YOUTUBE_API_KEY) {
    console.warn('YouTube API key not provided. Video search disabled.')
    return results
  }

  try {
    // Enhance query based on type
    let searchQuery = query
    if (type === 'tutorial') {
      searchQuery = `${query} tutorial`
    } else if (type === 'explanation') {
      searchQuery = `${query} explanation`
    }

    // Search for educational videos
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchQuery)}&type=video&maxResults=${limit}&key=${YOUTUBE_API_KEY}&videoEmbeddable=true&videoSyndicated=true&order=relevance`
    
    const response = await fetch(searchUrl)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('YouTube API error:', response.status, errorText)
      return results
    }

    const data = await response.json()
    
    if (data.items && data.items.length > 0) {
      // Get video details for duration and description
      const videoIds = data.items.map((item: any) => item.id.videoId).join(',')
      const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,snippet&id=${videoIds}&key=${YOUTUBE_API_KEY}`
      
      let videoDetails: Record<string, any> = {}
      try {
        const detailsResponse = await fetch(detailsUrl)
        if (detailsResponse.ok) {
          const detailsData = await detailsResponse.json()
          if (detailsData.items) {
            detailsData.items.forEach((item: any) => {
              videoDetails[item.id] = item
            })
          }
        }
      } catch (error) {
        console.error('YouTube details fetch error:', error)
      }

      for (const item of data.items) {
        const videoId = item.id.videoId
        const snippet = item.snippet
        const details = videoDetails[videoId]
        
        // Parse duration (ISO 8601 format: PT1H2M10S)
        let duration: string | undefined
        if (details?.contentDetails?.duration) {
          const dur = details.contentDetails.duration
          const match = dur.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
          if (match) {
            const hours = match[1] ? `${match[1]}:` : ''
            const minutes = match[2] || '0'
            const seconds = match[3]?.padStart(2, '0') || '00'
            duration = `${hours}${minutes}:${seconds}`
          }
        }

        results.push({
          videoId: videoId,
          title: snippet.title,
          thumbnailUrl: snippet.thumbnails?.high?.url || snippet.thumbnails?.medium?.url || snippet.thumbnails?.default?.url,
          channelName: snippet.channelTitle,
          duration: duration,
          url: `https://www.youtube.com/watch?v=${videoId}`,
          description: snippet.description?.substring(0, 200) // First 200 chars
        })
      }
    }
  } catch (error) {
    console.error('YouTube search error:', error)
  }

  return results
}

/**
 * Extract YouTube video ID from various URL formats
 */
export function extractYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/ // Direct video ID
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match && match[1]) {
      return match[1]
    }
  }

  return null
}

/**
 * Generate YouTube embed URL
 */
export function getYouTubeEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}`
}






