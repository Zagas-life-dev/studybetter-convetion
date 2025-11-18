/**
 * Image Enhancement Service
 * Enhances markdown content with relevant images and videos from free sources
 */

import { searchImages, extractImageKeywords } from './image-search'
import { searchVideos, extractYouTubeVideoId, getYouTubeEmbedUrl } from './video-search'

export interface ImageEnhancementOptions {
  maxImagesPerSection?: number
  minImageWidth?: number
  minImageHeight?: number
  enabled?: boolean
}

/**
 * Enhance markdown content with relevant images
 * Searches for images based on section headings and key concepts
 */
export async function enhanceMarkdownWithImages(
  markdown: string,
  options: ImageEnhancementOptions = {}
): Promise<string> {
  const {
    maxImagesPerSection = 1,
    minImageWidth = 400,
    minImageHeight = 300,
    enabled = true
  } = options

  if (!enabled) {
    return markdown
  }

  try {
    // Split markdown into sections based on headings
    const sections = splitMarkdownIntoSections(markdown)
    const enhancedSections: string[] = []

    for (const section of sections) {
      enhancedSections.push(section.content)

      // Extract keywords from section
      const keywords = extractImageKeywords(section.content, 2)
      
      if (keywords.length > 0 && section.heading) {
        // Search for images related to the section
        const searchQuery = section.heading || keywords[0]
        
        try {
          const imageResults = await searchImages(searchQuery, {
            limit: maxImagesPerSection,
            minWidth: minImageWidth,
            minHeight: minImageHeight
          })

          // Add images after the section heading
          if (imageResults.length > 0) {
            const imageMarkdown = imageResults
              .map(img => `![${img.title}](${img.url})`)
              .join('\n\n')
            
            // Insert images after the heading
            enhancedSections[enhancedSections.length - 1] = 
              section.content.replace(
                section.headingMatch,
                `${section.headingMatch}\n\n${imageMarkdown}`
              )
          }
        } catch (error) {
          console.error(`Error searching images for section "${section.heading}":`, error)
          // Continue without images if search fails
        }
      }
    }

    return enhancedSections.join('\n\n')
  } catch (error) {
    console.error('Error enhancing markdown with images:', error)
    // Return original markdown if enhancement fails
    return markdown
  }
}

interface MarkdownSection {
  heading: string | null
  headingMatch: string
  content: string
}

/**
 * Split markdown into sections based on headings
 */
function splitMarkdownIntoSections(markdown: string): MarkdownSection[] {
  const sections: MarkdownSection[] = []
  const lines = markdown.split('\n')
  
  let currentSection: MarkdownSection = {
    heading: null,
    headingMatch: '',
    content: ''
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    
    // Check for markdown headings (# ## ### etc.)
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/)
    
    if (headingMatch) {
      // Save previous section
      if (currentSection.content.trim()) {
        sections.push(currentSection)
      }
      
      // Start new section
      currentSection = {
        heading: headingMatch[2].trim(),
        headingMatch: line,
        content: line
      }
    } else {
      currentSection.content += (currentSection.content ? '\n' : '') + line
    }
  }

  // Add last section
  if (currentSection.content.trim()) {
    sections.push(currentSection)
  }

  return sections
}

/**
 * Extract image requests from AI response
 * Looks for special markers like [IMAGE: query] or <!-- IMAGE: query -->
 */
export function extractImageRequests(markdown: string): string[] {
  const requests: string[] = []
  
  // Pattern 1: [IMAGE: query]
  const pattern1 = /\[IMAGE:\s*([^\]]+)\]/gi
  let match
  while ((match = pattern1.exec(markdown)) !== null) {
    requests.push(match[1].trim())
  }

  // Pattern 2: <!-- IMAGE: query -->
  const pattern2 = /<!--\s*IMAGE:\s*([^>]+)\s*-->/gi
  while ((match = pattern2.exec(markdown)) !== null) {
    requests.push(match[1].trim())
  }

  return requests
}

/**
 * Extract video requests from AI response
 * Looks for special markers like [VIDEO: query] or [YT: query]
 */
export function extractVideoRequests(markdown: string): Array<{ query: string; type?: 'tutorial' | 'explanation' }> {
  const requests: Array<{ query: string; type?: 'tutorial' | 'explanation' }> = []
  
  // Pattern 1: [VIDEO: query] or [VIDEO: query, type]
  const pattern1 = /\[VIDEO:\s*([^\]]+)\]/gi
  let match
  while ((match = pattern1.exec(markdown)) !== null) {
    const parts = match[1].split(',').map(s => s.trim())
    requests.push({
      query: parts[0],
      type: parts[1] as 'tutorial' | 'explanation' || 'tutorial'
    })
  }

  // Pattern 2: [YT: query]
  const pattern2 = /\[YT:\s*([^\]]+)\]/gi
  while ((match = pattern2.exec(markdown)) !== null) {
    requests.push({
      query: match[1].trim(),
      type: 'tutorial'
    })
  }

  // Pattern 3: <!-- VIDEO: query -->
  const pattern3 = /<!--\s*VIDEO:\s*([^>]+)\s*-->/gi
  while ((match = pattern3.exec(markdown)) !== null) {
    const parts = match[1].split(',').map(s => s.trim())
    requests.push({
      query: parts[0],
      type: parts[1] as 'tutorial' | 'explanation' || 'tutorial'
    })
  }

  return requests
}

/**
 * Replace image requests with actual image markdown
 */
export async function replaceImageRequests(
  markdown: string,
  options: ImageEnhancementOptions = {}
): Promise<string> {
  const {
    minImageWidth = 400,
    minImageHeight = 300,
    enabled = true
  } = options

  if (!enabled) {
    // Remove image request markers
    return markdown
      .replace(/\[IMAGE:\s*[^\]]+\]/gi, '')
      .replace(/<!--\s*IMAGE:\s*[^>]+\s*-->/gi, '')
  }

  const requests = extractImageRequests(markdown)
  let enhancedMarkdown = markdown

  for (const query of requests) {
    try {
      const imageResults = await searchImages(query, {
        limit: 1,
        minWidth: minImageWidth,
        minHeight: minImageHeight
      })

      if (imageResults.length > 0) {
        const image = imageResults[0]
        const imageMarkdown = `![${image.title}](${image.url})`
        
        // Replace the request marker with actual image
        enhancedMarkdown = enhancedMarkdown
          .replace(`[IMAGE: ${query}]`, imageMarkdown)
          .replace(`<!-- IMAGE: ${query} -->`, imageMarkdown)
      } else {
        // Remove the request marker if no image found
        enhancedMarkdown = enhancedMarkdown
          .replace(`[IMAGE: ${query}]`, '')
          .replace(`<!-- IMAGE: ${query} -->`, '')
      }
    } catch (error) {
      console.error(`Error processing image request "${query}":`, error)
      // Remove the request marker on error
      enhancedMarkdown = enhancedMarkdown
        .replace(`[IMAGE: ${query}]`, '')
        .replace(`<!-- IMAGE: ${query} -->`, '')
    }
  }

  return enhancedMarkdown
}

/**
 * Replace video requests with YouTube embed markdown
 */
export async function replaceVideoRequests(
  markdown: string,
  options: ImageEnhancementOptions = {}
): Promise<string> {
  const { enabled = true } = options

  if (!enabled) {
    // Remove video request markers
    return markdown
      .replace(/\[VIDEO:\s*[^\]]+\]/gi, '')
      .replace(/\[YT:\s*[^\]]+\]/gi, '')
      .replace(/<!--\s*VIDEO:\s*[^>]+\s*-->/gi, '')
  }

  const requests = extractVideoRequests(markdown)
  let enhancedMarkdown = markdown

  for (const request of requests) {
    try {
      const videoResults = await searchVideos(request.query, {
        limit: 1,
        type: request.type || 'tutorial'
      })

      if (videoResults.length > 0) {
        const video = videoResults[0]
        const embedUrl = getYouTubeEmbedUrl(video.videoId)
        const durationText = video.duration ? ` (${video.duration})` : ''
        
        // Create YouTube embed using iframe (works in most markdown renderers)
        const videoMarkdown = `<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; margin: 1.5rem 0;">
<iframe style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" src="${embedUrl}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>
<p style="text-align: center; color: #666; font-size: 0.9em; margin-top: 0.5rem;"><strong>${video.title}</strong>${durationText} - ${video.channelName}</p>`
        
        // Replace all variations of the request marker
        enhancedMarkdown = enhancedMarkdown
          .replace(`[VIDEO: ${request.query}${request.type ? `, ${request.type}` : ''}]`, videoMarkdown)
          .replace(`[YT: ${request.query}]`, videoMarkdown)
          .replace(`<!-- VIDEO: ${request.query}${request.type ? `, ${request.type}` : ''} -->`, videoMarkdown)
      } else {
        // Remove the request marker if no video found
        enhancedMarkdown = enhancedMarkdown
          .replace(`[VIDEO: ${request.query}${request.type ? `, ${request.type}` : ''}]`, '')
          .replace(`[YT: ${request.query}]`, '')
          .replace(`<!-- VIDEO: ${request.query}${request.type ? `, ${request.type}` : ''} -->`, '')
      }
    } catch (error) {
      console.error(`Error processing video request "${request.query}":`, error)
      // Remove the request marker on error
      enhancedMarkdown = enhancedMarkdown
        .replace(`[VIDEO: ${request.query}${request.type ? `, ${request.type}` : ''}]`, '')
        .replace(`[YT: ${request.query}]`, '')
        .replace(`<!-- VIDEO: ${request.query}${request.type ? `, ${request.type}` : ''} -->`, '')
    }
  }

  return enhancedMarkdown
}

/**
 * Replace both image and video requests
 * @param markdown - The markdown content to enhance
 * @param options - Enhancement options
 * @param taskType - 'summarize' or 'explain' - videos only work for 'explain'
 */
export async function replaceMediaRequests(
  markdown: string,
  options: ImageEnhancementOptions = {},
  taskType: 'summarize' | 'explain' = 'explain'
): Promise<string> {
  let enhancedMarkdown = markdown
  
  // First replace images (works for both summaries and explanations)
  enhancedMarkdown = await replaceImageRequests(enhancedMarkdown, options)
  
  // Only replace videos for explanations, not summaries
  if (taskType === 'explain') {
    enhancedMarkdown = await replaceVideoRequests(enhancedMarkdown, options)
  } else {
    // Remove video requests from summaries
    enhancedMarkdown = enhancedMarkdown
      .replace(/\[VIDEO:\s*[^\]]+\]/gi, '')
      .replace(/\[YT:\s*[^\]]+\]/gi, '')
      .replace(/<!--\s*VIDEO:\s*[^>]+\s*-->/gi, '')
  }
  
  return enhancedMarkdown
}

