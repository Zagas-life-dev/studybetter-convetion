/**
 * Free Image Search Service
 * Uses only free/public APIs: Wikipedia, Unsplash, Wikimedia Commons, YouTube
 */

export interface ImageResult {
  url: string
  thumbnailUrl?: string
  title: string
  source: 'wikipedia' | 'unsplash' | 'wikimedia' | 'youtube'
  width?: number
  height?: number
  attribution?: string
  videoId?: string // For YouTube videos
  duration?: string // For YouTube videos
}

export interface VideoResult {
  videoId: string
  title: string
  thumbnailUrl: string
  channelName: string
  duration?: string
  url: string
}

export interface ImageSearchOptions {
  limit?: number
  minWidth?: number
  minHeight?: number
}

/**
 * Search for images using Wikipedia/Wikimedia Commons
 * Free, no API key required
 */
async function searchWikipedia(query: string, options: ImageSearchOptions = {}): Promise<ImageResult[]> {
  const limit = options.limit || 5
  const results: ImageResult[] = []

  try {
    // Search Wikipedia for the topic
    const searchUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'StudyBetterAI/1.0 (Educational Tool)'
      }
    })

    if (response.ok) {
      const data = await response.json()
      
      // Get the main image if available
      if (data.thumbnail?.source) {
        const imageUrl = data.originalimage?.source || data.thumbnail.source.replace(/\/\d+px-/, '/800px-')
        
        // Skip PDF files - they should not be used as images
        if (!imageUrl.toLowerCase().endsWith('.pdf') && !imageUrl.toLowerCase().includes('.pdf')) {
          results.push({
            url: imageUrl,
            thumbnailUrl: data.thumbnail.source,
            title: data.title || query,
            source: 'wikipedia',
            width: data.originalimage?.width || data.thumbnail.width,
            height: data.originalimage?.height || data.thumbnail.height,
            attribution: `Wikipedia - ${data.title}`
          })
        }
      }
    }

    // Search Wikimedia Commons for more images
    try {
      const commonsSearchUrl = `https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search&gsrnamespace=6&gsrsearch=${encodeURIComponent(query)}&gsrlimit=${limit}&prop=imageinfo&iiprop=url|size&origin=*`
      const commonsResponse = await fetch(commonsSearchUrl, {
        headers: {
          'User-Agent': 'StudyBetterAI/1.0 (Educational Tool)'
        }
      })

      if (commonsResponse.ok) {
        const commonsData = await commonsResponse.json()
        if (commonsData.query?.pages) {
          for (const page of Object.values(commonsData.query.pages) as any[]) {
            if (page.imageinfo?.[0]?.url && results.length < limit) {
              const imageInfo = page.imageinfo[0]
              const imageUrl = imageInfo.url
              
              // Skip PDF files - they should not be used as images
              if (imageUrl.toLowerCase().endsWith('.pdf') || imageUrl.toLowerCase().includes('.pdf')) {
                continue
              }
              
              if (!options.minWidth || (imageInfo.width && imageInfo.width >= options.minWidth)) {
                if (!options.minHeight || (imageInfo.height && imageInfo.height >= options.minHeight)) {
                  results.push({
                    url: imageUrl,
                    thumbnailUrl: imageInfo.thumburl || imageUrl,
                    title: page.title?.replace('File:', '') || query,
                    source: 'wikimedia',
                    width: imageInfo.width,
                    height: imageInfo.height,
                    attribution: `Wikimedia Commons - ${page.title}`
                  })
                }
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Wikimedia Commons search error:', error)
    }
  } catch (error) {
    console.error('Wikipedia search error:', error)
  }

  return results
}

/**
 * Search for images using Unsplash
 * Free tier: 50 requests per hour (requires API key for better results)
 * Falls back to simple approach if no API key is provided
 */
async function searchUnsplash(query: string, options: ImageSearchOptions = {}): Promise<ImageResult[]> {
  const limit = Math.min(options.limit || 5, 10) // Unsplash free limit
  const results: ImageResult[] = []
  const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY

  try {
    // If API key is provided, use official Unsplash API
    if (UNSPLASH_ACCESS_KEY) {
      const searchUrl = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${limit}&client_id=${UNSPLASH_ACCESS_KEY}`
      const response = await fetch(searchUrl)

      if (response.ok) {
        const data = await response.json()
        if (data.results) {
          for (const photo of data.results) {
            if (!options.minWidth || (photo.width && photo.width >= options.minWidth)) {
              if (!options.minHeight || (photo.height && photo.height >= options.minHeight)) {
                results.push({
                  url: photo.urls.regular || photo.urls.full,
                  thumbnailUrl: photo.urls.thumb,
                  title: photo.alt_description || photo.description || query,
                  source: 'unsplash',
                  width: photo.width,
                  height: photo.height,
                  attribution: `Unsplash - ${photo.user.name}`
                })
              }
            }
          }
        }
      }
    } else {
      // Fallback: Use Unsplash Source API (simpler, but less reliable)
      // Note: This is a basic approach. For production, use the official API with a key
      const searchUrl = `https://source.unsplash.com/800x600/?${encodeURIComponent(query)}`
      results.push({
        url: searchUrl,
        thumbnailUrl: searchUrl,
        title: query,
        source: 'unsplash',
        width: 800,
        height: 600,
        attribution: 'Unsplash'
      })
    }
  } catch (error) {
    console.error('Unsplash search error:', error)
  }

  return results
}

/**
 * Search for videos using YouTube Data API
 * Free tier: 10,000 units per day (1 search = 100 units, so ~100 searches/day)
 * Requires API key but free
 */
async function searchYouTube(query: string, options: ImageSearchOptions = {}): Promise<ImageResult[]> {
  const limit = Math.min(options.limit || 3, 5) // Limit YouTube results
  const results: ImageResult[] = []
  const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY

  // Only use YouTube if API key is provided
  if (!YOUTUBE_API_KEY) {
    return results
  }

  try {
    // Search for educational/tutorial videos
    const searchQuery = `${query} tutorial explanation`
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchQuery)}&type=video&maxResults=${limit}&key=${YOUTUBE_API_KEY}&videoEmbeddable=true&videoSyndicated=true`
    
    const response = await fetch(searchUrl)

    if (response.ok) {
      const data = await response.json()
      if (data.items) {
        // Get video details for duration
        const videoIds = data.items.map((item: any) => item.id.videoId).join(',')
        const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,snippet&id=${videoIds}&key=${YOUTUBE_API_KEY}`
        
        let videoDetails: any = {}
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
            url: `https://www.youtube.com/watch?v=${videoId}`,
            thumbnailUrl: snippet.thumbnails?.high?.url || snippet.thumbnails?.medium?.url || snippet.thumbnails?.default?.url,
            title: snippet.title,
            source: 'youtube',
            width: snippet.thumbnails?.high?.width || 480,
            height: snippet.thumbnails?.high?.height || 360,
            attribution: `YouTube - ${snippet.channelTitle}`,
            videoId: videoId,
            duration: duration
          })
        }
      }
    }
  } catch (error) {
    console.error('YouTube search error:', error)
  }

  return results
}

/**
 * Main image search function
 * Searches multiple free sources and returns combined results
 */
export async function searchImages(
  query: string,
  options: ImageSearchOptions = {}
): Promise<ImageResult[]> {
  const limit = options.limit || 5
  const allResults: ImageResult[] = []

  // Search all sources in parallel (Pexels disabled for now)
  const [wikipediaResults, unsplashResults, youtubeResults] = await Promise.all([
    searchWikipedia(query, { ...options, limit: Math.ceil(limit / 2) }),
    searchUnsplash(query, { ...options, limit: Math.ceil(limit / 3) }),
    searchYouTube(query, { ...options, limit: Math.ceil(limit / 3) })
  ])

  // Combine results, prioritizing Wikipedia/Wikimedia for educational content
  allResults.push(...wikipediaResults)
  allResults.push(...unsplashResults)
  allResults.push(...youtubeResults)

  // Remove duplicates based on URL
  const uniqueResults = Array.from(
    new Map(allResults.map(item => [item.url, item])).values()
  )

  // Limit results
  return uniqueResults.slice(0, limit)
}

/**
 * Extract keywords from text for image search
 * Simple keyword extraction for educational content
 */
export function extractImageKeywords(text: string, maxKeywords: number = 3): string[] {
  // Remove markdown syntax
  const cleanText = text
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Remove markdown links
    .replace(/#{1,6}\s+/g, '') // Remove markdown headers
    .replace(/\*\*([^\*]+)\*\*/g, '$1') // Remove bold
    .replace(/\*([^\*]+)\*/g, '$1') // Remove italic
    .replace(/`([^`]+)`/g, '$1') // Remove code
    .replace(/\$\$?[^\$]+\$\$?/g, '') // Remove LaTeX
    .toLowerCase()

  // Extract potential keywords (simple approach)
  // Look for capitalized words, technical terms, etc.
  const words = cleanText
    .split(/\s+/)
    .filter(word => word.length > 4) // Filter short words
    .filter(word => !['the', 'this', 'that', 'with', 'from', 'have', 'been', 'will', 'would', 'could', 'should'].includes(word))

  // Get most common words (simple frequency-based)
  const wordFreq = new Map<string, number>()
  words.forEach(word => {
    wordFreq.set(word, (wordFreq.get(word) || 0) + 1)
  })

  const sortedWords = Array.from(wordFreq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxKeywords)
    .map(([word]) => word)

  return sortedWords
}

