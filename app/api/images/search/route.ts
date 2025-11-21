import { NextResponse, type NextRequest } from 'next/server'
import { searchImages, extractImageKeywords, type ImageSearchOptions } from '@/lib/image-search'

/**
 * API Route for Image Search
 * GET /api/images/search?query=...&limit=...
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('query')
    const limit = parseInt(searchParams.get('limit') || '5', 10)
    const minWidth = searchParams.get('minWidth') ? parseInt(searchParams.get('minWidth')!, 10) : undefined
    const minHeight = searchParams.get('minHeight') ? parseInt(searchParams.get('minHeight')!, 10) : undefined

    if (!query) {
      return new NextResponse(
        JSON.stringify({ error: 'Query parameter is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const options: ImageSearchOptions = {
      limit: Math.min(limit, 10), // Max 10 results
      minWidth,
      minHeight
    }

    const results = await searchImages(query, options)

    return new NextResponse(
      JSON.stringify({ 
        query,
        results,
        count: results.length
      }),
      { 
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' // Cache for 1 hour
        }
      }
    )
  } catch (error) {
    console.error('Image search error:', error)
    return new NextResponse(
      JSON.stringify({ 
        error: 'Failed to search images',
        details: error instanceof Error ? error.message : String(error)
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

/**
 * POST endpoint for batch image search or keyword extraction
 * POST /api/images/search
 * Body: { query?: string, text?: string, extractKeywords?: boolean }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { query, text, extractKeywords, limit, minWidth, minHeight } = body

    // If extractKeywords is true, extract keywords from text and search
    if (extractKeywords && text) {
      const keywords = extractImageKeywords(text, 3)
      
      // Search for images using extracted keywords
      const allResults = []
      for (const keyword of keywords) {
        const options: ImageSearchOptions = {
          limit: Math.min(limit || 2, 3),
          minWidth,
          minHeight
        }
        const results = await searchImages(keyword, options)
        allResults.push(...results)
      }

      // Remove duplicates
      const uniqueResults = Array.from(
        new Map(allResults.map(item => [item.url, item])).values()
      ).slice(0, limit || 5)

      return new NextResponse(
        JSON.stringify({
          keywords,
          results: uniqueResults,
          count: uniqueResults.length
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
          }
        }
      )
    }

    // Regular search
    if (!query) {
      return new NextResponse(
        JSON.stringify({ error: 'Query parameter is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const options: ImageSearchOptions = {
      limit: Math.min(limit || 5, 10),
      minWidth,
      minHeight
    }

    const results = await searchImages(query, options)

    return new NextResponse(
      JSON.stringify({
        query,
        results,
        count: results.length
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
        }
      }
    )
  } catch (error) {
    console.error('Image search error:', error)
    return new NextResponse(
      JSON.stringify({
        error: 'Failed to search images',
        details: error instanceof Error ? error.message : String(error)
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}





