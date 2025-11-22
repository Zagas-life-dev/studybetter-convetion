import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'
import { buildPersonalizedPrompt } from "@/lib/ai/personalize-prompt"
import type { UserProfile } from "@/hooks/use-user"
import { replaceMediaRequests } from "@/lib/image-enhancer"

const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY
const SUMMARY_AGENT_ID = "ag:ab291cb7:20250507:untitled-agent:64806fa7" // Original agent for summarization
const EXPLAIN_AGENT_ID = "ag:ab291cb7:20250510:explain:9b572715" // New agent for explanation
const FLASHCARD_AGENT_ID = "ag:ab291cb7:20250520:flash-card:cae5677e" // Agent for flashcard generation

// Maximum size for processing in a single request (in bytes) - 5MB is usually safe
const MAX_SINGLE_REQUEST_SIZE = 5 * 1024 * 1024;  // 5MB

// Retry logic for rate limiting (429 errors)
async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 3): Promise<Response> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, options)
      
      // If rate limited (429), wait and retry
      if (response.status === 429 && attempt < maxRetries - 1) {
        const waitTime = Math.pow(2, attempt) * 1000 // Exponential backoff: 1s, 2s, 4s
        console.log(`Rate limited (429). Retrying in ${waitTime}ms... (attempt ${attempt + 1}/${maxRetries})`)
        await new Promise(resolve => setTimeout(resolve, waitTime))
        continue
      }
      
      return response
    } catch (error) {
      // If it's an abort error, don't retry
      if (error instanceof Error && error.name === 'AbortError') {
        throw error
      }
      
      // For other errors, retry if we have attempts left
      if (attempt < maxRetries - 1) {
        const waitTime = Math.pow(2, attempt) * 1000
        console.log(`Request failed. Retrying in ${waitTime}ms... (attempt ${attempt + 1}/${maxRetries})`)
        await new Promise(resolve => setTimeout(resolve, waitTime))
        continue
      }
      
      throw error
    }
  }
  
  // Final attempt
  return await fetch(url, options)
}

// Helper function to check if response indicates PDF parsing failure
function isPdfParsingError(content: string): boolean {
  const errorIndicators = [
    "don't have the ability to directly import and parse PDF",
    "cannot directly import and parse PDF",
    "unable to directly import and parse PDF",
    "don't have access to the PDF",
    "cannot access the PDF",
    "unable to access the PDF",
    "please confirm if this is the format",
    "I cannot read PDF files",
    "I cannot process PDF files",
  ]
  
  const lowerContent = content.toLowerCase()
  return errorIndicators.some(indicator => lowerContent.includes(indicator.toLowerCase()))
}

// Helper function to get neurodivergence-specific prompt modifiers for multiple learning styles
function getNeurodivergencePromptModifier(learningStyles: string[]): string {
  if (!learningStyles || learningStyles.length === 0) {
    return ""
  }

  // Remove duplicates
  const uniqueStyles = Array.from(new Set(learningStyles.filter(s => s && s !== "none")))

  if (uniqueStyles.length === 0) {
    return ""
  }

  // Research-based improved prompts for each learning style
  const modifiers: Record<string, string> = {
    adhd: `
CRITICAL: Optimize content for ADHD learners based on current research:
- Use SHORT, CONCISE sentences (max 12-15 words per sentence) to maintain attention
- Break complex ideas into BULLET POINTS or numbered lists for better processing
- Use CLEAR HEADINGS and subheadings every 2-3 paragraphs to create visual breaks
- Add ACTIONABLE summaries at the end of each section with key takeaways
- Use BOLD and emphasis strategically (max 2-3 per paragraph) to highlight critical information
- Avoid long paragraphs - split into 2-3 sentence chunks with white space
- Include "Key Takeaway" callout boxes for important concepts
- Use active voice and direct, action-oriented language
- Add visual structure with symbols (✓, →, ⚠, •) to break up text
- Create clear transitions between topics with connecting phrases
- Focus on practical applications and real-world examples before theory
- Minimize abstract concepts - always provide concrete context
- Use time-based organization when relevant (first, then, finally)
- Include progress indicators for multi-step processes`,

    dyslexia: `
CRITICAL: Optimize content for dyslexic learners based on current research:
- Use SIMPLE, CLEAR language - avoid jargon, complex vocabulary, and technical terms without explanation
- Break down complex words phonetically and provide definitions immediately
- Use SHORT sentences (8-12 words maximum) for better comprehension
- Structure content with CLEAR visual hierarchy using consistent headings, lists, and spacing
- Use BULLET POINTS and numbered lists instead of long paragraphs (max 3-4 items per list)
- Provide CONTEXT and concrete examples for every abstract concept
- Use CONCRETE examples and analogies that relate to everyday experiences
- Repeat key concepts in different ways throughout the content
- Use BOLD for important terms (but limit to 1-2 per paragraph to avoid visual overwhelm)
- Avoid homophones, ambiguous words, and words that look similar
- Use active voice throughout for clarity
- Break complex topics into smaller, digestible sections (one concept per section)
- Include pronunciation guides in parentheses for difficult terms
- Use high contrast text formatting and adequate spacing between lines
- Avoid justified text alignment (use left-aligned for better readability)`,

    autism: `
CRITICAL: Optimize content for autistic learners based on current research:
- Use CLEAR, LITERAL language - completely avoid idioms, metaphors, sarcasm, and figurative speech
- Provide EXPLICIT, STEP-BY-STEP explanations with no assumptions about prior knowledge
- Use STRUCTURED, CONSISTENT formatting throughout (same heading styles, same list formats)
- Define ALL technical terms, acronyms, and abbreviations immediately upon first use
- Use LOGICAL organization with clear hierarchies (main topic → subtopic → details)
- Provide CONTEXT and background information before introducing new concepts
- Use CONCRETE examples and avoid abstract concepts without detailed explanation
- Be PRECISE and specific - eliminate vague language like "some", "many", "often" (use exact numbers/percentages when possible)
- Use CONSISTENT terminology throughout (never use synonyms for the same concept)
- Break complex processes into numbered steps with clear action items
- Include clear cause-and-effect relationships explicitly stated
- Use visual structure (headings, lists, tables, diagrams) to organize information
- Avoid implied meanings, assumptions, or reading between the lines
- Provide explicit connections between related concepts
- Use predictable patterns and structures throughout the content
- Include clear definitions of social or contextual cues if relevant`
  }

  // If multiple styles, combine them intelligently
  if (uniqueStyles.length === 1) {
    return modifiers[uniqueStyles[0]] || ""
  }

  // For multiple styles, combine the key principles
  const combinedModifier = `
CRITICAL: Optimize content for learners with multiple learning preferences (${uniqueStyles.join(", ").toUpperCase()}):
${uniqueStyles.map(style => modifiers[style] || "").join("\n\n")}

ADDITIONAL CONSIDERATIONS FOR MULTIPLE LEARNING STYLES:
- Balance all the above requirements, prioritizing clarity and accessibility
- Use the most restrictive formatting requirements (e.g., shortest sentence length)
- Ensure content works for all selected learning styles simultaneously
- Test that the content is accessible when all style requirements are applied together`

  return combinedModifier
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }
    
    // Check usage limit before processing
    const { data: usageCheck, error: usageError } = await supabase.rpc("check_usage_limit", {
      p_user_id: user.id,
      p_action_type: "summary",
    })

    if (usageError) {
      return new NextResponse(
        JSON.stringify({ error: "Failed to check usage limit" }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    if (!usageCheck?.allowed) {
      return new NextResponse(
        JSON.stringify({
          error: "Daily limit reached",
          message: "You have reached your daily limit of 3 summaries. Please try again tomorrow.",
          remaining: 0,
        }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      )
  }

    // Fetch user profile for personalization
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    // Check for form data
    const formData = await request.formData()
    const pdfFile = formData.get("pdf") as File | null
    const instructions = formData.get("instructions") as string | null
    const taskType = formData.get("taskType") as string | null
    const learningStylesJson = formData.get("learningStyles") as string | null
    const flashcardCount = formData.get("flashcardCount") as string | null
    
    // Parse learning styles from form data
    let selectedLearningStyles: string[] = []
    try {
      if (learningStylesJson) {
        selectedLearningStyles = JSON.parse(learningStylesJson)
      }
    } catch (e) {
      console.error("Error parsing learning styles:", e)
    }

    // Merge with onboarding profile learning styles (if any)
    const allLearningStyles = new Set<string>()
    
    // Add from onboarding profile
    if (profile?.neurodivergence_type && profile.neurodivergence_type !== "none") {
      // Handle legacy single value or array
      if (Array.isArray(profile.neurodivergence_type)) {
        profile.neurodivergence_type.forEach(style => {
          if (style && style !== "none" && style !== "audhd") {
            allLearningStyles.add(style)
          }
        })
      } else if (profile.neurodivergence_type !== "audhd") {
        allLearningStyles.add(profile.neurodivergence_type)
      } else {
        // Handle legacy audhd - split into autism and adhd
        allLearningStyles.add("autism")
        allLearningStyles.add("adhd")
      }
    }
    
    // Add from form selection
    selectedLearningStyles.forEach(style => {
      if (style && style !== "none") {
        allLearningStyles.add(style)
      }
    })
    
    // Convert to array and remove duplicates (already handled by Set)
    const mergedLearningStyles = Array.from(allLearningStyles)

    // Validate required fields
    if (!pdfFile) {
      return new NextResponse(
        JSON.stringify({ error: "PDF file is required" }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    if (!taskType) {
      return new NextResponse(
        JSON.stringify({ error: "Task type is required" }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    if (!MISTRAL_API_KEY) {
      return new NextResponse(
        JSON.stringify({ error: "Mistral API key is not configured" }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    console.log("Processing file:", pdfFile.name, "Size:", pdfFile.size, "Type:", pdfFile.type)
    console.log("Task type:", taskType)

    try {
      // For very large files, use a different approach to avoid timeout
      const isLargeFile = pdfFile.size > MAX_SINGLE_REQUEST_SIZE;
      
      // For flashcard task type, build instructions with count
      const processInstructions = taskType === "flashcard" && flashcardCount 
        ? `Generate EXACTLY ${flashcardCount} flashcards covering ALL areas in this PDF. ${instructions || ''}`
        : instructions || ""
      
      if (isLargeFile) {
        console.log("Large file detected. Using chunked processing approach.");
        const result = await handleLargeDocument(pdfFile, processInstructions, taskType, mergedLearningStyles, profile as UserProfile | null, new NextResponse(), flashcardCount || null);
        // Increment usage after successful processing
        if (result.status === 200) {
          await supabase.rpc("increment_usage", {
            p_user_id: user.id,
            p_action_type: "summary",
          })
        }
        return result;
      } else {
        const result = await processSingleDocument(pdfFile, processInstructions, taskType, mergedLearningStyles, profile as UserProfile | null, new NextResponse(), flashcardCount || null);
        // Increment usage after successful processing
        if (result.status === 200) {
          await supabase.rpc("increment_usage", {
            p_user_id: user.id,
            p_action_type: "summary",
          })
        }
        return result;
      }
    } catch (error) {
      console.error("Error processing request:", error)
      return new NextResponse(
        JSON.stringify({ error: `Failed to process request: ${error instanceof Error ? error.message : String(error)}` }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }
  } catch (error) {
    console.error('Error handling form data:', error)
    return new NextResponse(
      JSON.stringify({ error: `Server error: ${error instanceof Error ? error.message : String(error)}` }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

// Process a single document in one request
async function processSingleDocument(pdfFile: File, instructions: string, taskType: string, learningStyles: string[], profile: UserProfile | null, res: NextResponse, flashcardCount: string | null = null) {
  // Step 1: Upload the file to Mistral's files API
  const fileFormData = new FormData()
  fileFormData.append("file", pdfFile)
  fileFormData.append("purpose", "ocr")

  console.log("Uploading file to Mistral API")
  const fileUploadResponse = await fetch("https://api.mistral.ai/v1/files", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${MISTRAL_API_KEY}`,
    },
    body: fileFormData,
  })

  if (!fileUploadResponse.ok) {
    const errorText = await fileUploadResponse.text()
    console.error("File upload error:", errorText)
    return new NextResponse(
      JSON.stringify({ error: `Failed to upload PDF file: ${errorText}` }),
      { status: 500, headers: res.headers }
    )
  }

  const fileData = await fileUploadResponse.json()
  const fileId = fileData.id
  console.log("File uploaded successfully with ID:", fileId)

  // Step 2: Get a signed URL for the file
  console.log("Getting signed URL for file")
  const signedUrlResponse = await fetch(`https://api.mistral.ai/v1/files/${fileId}/url`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${MISTRAL_API_KEY}`,
    },
  })

  if (!signedUrlResponse.ok) {
    const errorText = await signedUrlResponse.text()
    console.error("Signed URL error:", errorText)
    return new NextResponse(
      JSON.stringify({ error: `Failed to get signed URL: ${errorText}` }),
      { status: 500, headers: res.headers }
    )
  }

  const signedUrlData = await signedUrlResponse.json()
  const signedUrl = signedUrlData.url
  console.log("Got signed URL for file")

  // Step 3: Create the agent completion payload with document_url
  // Select the appropriate agent ID based on task type
  const agentId = taskType === "summarize" 
    ? SUMMARY_AGENT_ID 
    : taskType === "explain" 
    ? EXPLAIN_AGENT_ID 
    : taskType === "flashcard"
    ? FLASHCARD_AGENT_ID
    : SUMMARY_AGENT_ID
  console.log(`Using agent ID ${agentId} for task type: ${taskType}`)
  console.log(`Learning styles: ${learningStyles.join(", ") || "none"}`)
  
  const neurodivergenceModifier = getNeurodivergencePromptModifier(learningStyles)
  const personalizedPrompt = buildPersonalizedPrompt(profile)
  
  // Build system prompt based on task type
  let systemPrompt = ""
  if (taskType === "flashcard") {
    const count = flashcardCount || "25"
    systemPrompt = `You are an expert at creating educational flashcards from PDF documents.
Your task is to generate EXACTLY ${count} high-quality flashcards that comprehensively cover ALL areas and topics in the PDF.
Each flashcard must be in JSON format with: id, question, answer, topic, and difficulty fields.
The output MUST be a valid JSON array only - no additional text before or after.
Ensure flashcards cover all major topics evenly and include a variety of question types (definitions, explanations, processes, comparisons, applications).
Format mathematical expressions using LaTeX notation with $ for inline math and $$ for block math.
${neurodivergenceModifier}${personalizedPrompt}`
  } else {
    systemPrompt = `You are an expert at analyzing PDF documents. 
Your task is to ${taskType === "summarize" ? "summarize" : "explain in detail"} the content of the PDF according to your system prompt.
Format your response in Markdown, including proper headings, lists, and emphasis.
If the content contains mathematical expressions, format them using LaTeX notation with $ for inline math and $$ for block math.
Be thorough and accurate in your analysis.

MEDIA: NEVER use images from the PDF. ONLY request external images. ${taskType === "summarize" 
  ? `Use [IMAGE: Subject Topic SpecificDetails] format. ALWAYS include Subject (e.g., Mathematics, Biology) + Topic from PDF + Specific concept. Use DIFFERENT queries for different concepts. NEVER use base64, direct URLs, or PDF images.`
  : `Use [IMAGE: Subject Topic SpecificDetails] for images, [VIDEO: Subject Topic SpecificDetails] or [YT: Subject Topic SpecificDetails] for videos. ALWAYS include Subject + Topic + Specific Details. Use DIFFERENT queries for different concepts. NEVER use base64, direct URLs, or PDF images.`}
Example: [IMAGE: Mathematics Set Theory Venn diagram intersection] vs [IMAGE: Mathematics Set Theory Venn diagram union] are DIFFERENT. Use media sparingly (2-3 per section).${neurodivergenceModifier}${personalizedPrompt}`
  }

  const agentPayload = {
    agent_id: agentId,
    max_tokens: 10000, // Reduced from 4000 to save tokens
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: taskType === "flashcard" 
              ? instructions + (neurodivergenceModifier ? `\n\n${neurodivergenceModifier}` : '')
              : `Here are my instructions: ${instructions}${neurodivergenceModifier ? `\n\n${neurodivergenceModifier}` : ''}`,
          },
          {
            type: "document_url",
            document_url: signedUrl,
          },
        ],
      },
    ],
  }

  console.log(`Sending ${taskType} request to agent ${agentId}`)

  // Step 4: Send the request to the Mistral Agent Completion API with retry logic
  const agentResponse = await fetchWithRetry("https://api.mistral.ai/v1/agents/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${MISTRAL_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(agentPayload),
  })

  // Log the status code
  console.log("Agent API response status:", agentResponse.status)

  // Get the response text first to log it in case of an error
  const responseText = await agentResponse.text()
  console.log("Agent API response preview:", responseText.substring(0, 200))

  // Check if the response is OK
  if (!agentResponse.ok) {
    console.error("Agent completion error response:", responseText)
    return new NextResponse(
      JSON.stringify({
        error: `Failed to process request: HTTP error ${agentResponse.status}`,
        details: responseText.substring(0, 500), // Include part of the error for debugging
      }),
      { status: 500 }
    )
  }

  // Try to parse the JSON response
  let agentData
  try {
    agentData = JSON.parse(responseText)
    console.log("Agent completion successful")
  } catch (e) {
    console.error("Failed to parse agent response:", e)
    return new NextResponse(
      JSON.stringify({
        error: "Failed to parse response from agent API",
        details: responseText.substring(0, 1000), // Include part of the response for debugging
      }),
      { status: 500 }
    )
  }

  // Extract the markdown content from the response
  let markdownContent = agentData.choices[0].message.content

  // Check if response indicates PDF parsing failure and retry if needed
  if (isPdfParsingError(markdownContent)) {
    console.log("PDF parsing error detected in response. Retrying...")
    
    // Retry up to 3 times
    for (let retryAttempt = 1; retryAttempt <= 3; retryAttempt++) {
      console.log(`PDF parsing retry attempt ${retryAttempt}/3`)
      
      // Wait a bit before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 1000 * retryAttempt))
      
      // Retry the agent request
      const retryResponse = await fetchWithRetry("https://api.mistral.ai/v1/agents/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${MISTRAL_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(agentPayload),
      })
      
      if (!retryResponse.ok) {
        console.error(`Retry ${retryAttempt} failed with status: ${retryResponse.status}`)
        if (retryAttempt === 3) {
          // Last retry failed, return error
          const errorText = await retryResponse.text()
          return new NextResponse(
            JSON.stringify({
              error: "PDF processing failed after multiple retries. The PDF may be corrupted or in an unsupported format.",
              details: errorText.substring(0, 500),
            }),
            { status: 500 }
          )
        }
        continue
      }
      
      const retryResponseText = await retryResponse.text()
      let retryAgentData
      try {
        retryAgentData = JSON.parse(retryResponseText)
        markdownContent = retryAgentData.choices[0].message.content
        
        // Check if retry was successful (no parsing error)
        if (!isPdfParsingError(markdownContent)) {
          console.log(`PDF parsing successful on retry attempt ${retryAttempt}`)
          break
        } else if (retryAttempt === 3) {
          // Last retry still has error
          console.error("PDF parsing error persists after 3 retries")
          return new NextResponse(
            JSON.stringify({
              error: "PDF processing failed. The AI agent was unable to parse the PDF content after multiple attempts. Please try with a different PDF or contact support.",
              details: "The PDF may be corrupted, password-protected, or in an unsupported format.",
            }),
            { status: 500 }
          )
        }
      } catch (e) {
        console.error(`Failed to parse retry ${retryAttempt} response:`, e)
        if (retryAttempt === 3) {
          return new NextResponse(
            JSON.stringify({
              error: "Failed to parse response after retries",
              details: retryResponseText.substring(0, 500),
            }),
            { status: 500 }
          )
        }
      }
    }
  }

  // Step 5: Enhance markdown with images and videos (replace media requests with actual content)
  // Skip media enhancement for flashcards as they are JSON format
  if (taskType !== "flashcard") {
    try {
      console.log(`Enhancing markdown with media for task type: ${taskType}...`)
      markdownContent = await replaceMediaRequests(markdownContent, {
        enabled: true,
        minImageWidth: 400,
        minImageHeight: 300
      }, taskType as 'summarize' | 'explain')
      console.log("Media enhancement completed")
    } catch (error) {
      console.error("Error enhancing markdown with media:", error)
      // Continue with original markdown if media enhancement fails
    }
  }

  // Step 6: Clean up - delete the uploaded file
  console.log("Deleting uploaded file")
  await fetch(`https://api.mistral.ai/v1/files/${fileId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${MISTRAL_API_KEY}`,
    },
  }).catch((error) => {
    // Just log the error but don't fail the request if cleanup fails
    console.error("Error deleting file:", error)
  })

  return new NextResponse(JSON.stringify({ markdown: markdownContent }), { status: 200 })
}

// Handle large documents using a progressive analysis approach
async function handleLargeDocument(pdfFile: File, instructions: string, taskType: string, learningStyles: string[], profile: UserProfile | null, res: NextResponse, flashcardCount: string | null = null) {
  // Step 1: Upload the file to Mistral's files API with specific ocr and layout parameters
  const fileFormData = new FormData()
  fileFormData.append("file", pdfFile)
  fileFormData.append("purpose", "ocr")

  console.log("Uploading large file to Mistral API")
  const fileUploadResponse = await fetch("https://api.mistral.ai/v1/files", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${MISTRAL_API_KEY}`,
    },
    body: fileFormData,
  })

  if (!fileUploadResponse.ok) {
    const errorText = await fileUploadResponse.text()
    console.error("File upload error:", errorText)
    return new NextResponse(
      JSON.stringify({ error: `Failed to upload PDF file: ${errorText}` }),
      { status: 500, headers: res.headers }
    )
  }

  const fileData = await fileUploadResponse.json()
  const fileId = fileData.id
  console.log("Large file uploaded successfully with ID:", fileId)

  // Step 2: Get a signed URL for the file
  console.log("Getting signed URL for large file")
  const signedUrlResponse = await fetch(`https://api.mistral.ai/v1/files/${fileId}/url`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${MISTRAL_API_KEY}`,
    },
  })

  if (!signedUrlResponse.ok) {
    const errorText = await signedUrlResponse.text()
    console.error("Signed URL error:", errorText)
    return new NextResponse(
      JSON.stringify({ error: `Failed to get signed URL: ${errorText}` }),
      { status: 500, headers: res.headers }
    )
  }

  const signedUrlData = await signedUrlResponse.json()
  const signedUrl = signedUrlData.url
  console.log("Got signed URL for large file")

  // Step 3: Create the agent completion payload with document_url and optimized prompting
  const agentId = taskType === "summarize" 
    ? SUMMARY_AGENT_ID 
    : taskType === "explain" 
    ? EXPLAIN_AGENT_ID 
    : taskType === "flashcard"
    ? FLASHCARD_AGENT_ID
    : SUMMARY_AGENT_ID
  console.log(`Using agent ID ${agentId} for large document ${taskType}`)
  console.log(`Learning styles: ${learningStyles.join(", ") || "none"}`)
  
  const neurodivergenceModifier = getNeurodivergencePromptModifier(learningStyles)
  const personalizedPrompt = buildPersonalizedPrompt(profile)
  
  // Use a modified system prompt to handle large documents more efficiently
  let systemPrompt = ""
  if (taskType === "flashcard") {
    const count = flashcardCount || "25"
    systemPrompt = `You are an expert at creating educational flashcards from large PDF documents.
Your task is to generate EXACTLY ${count} high-quality flashcards that comprehensively cover ALL areas in the PDF.
This is a large document, so focus on extracting key concepts, main ideas, and critical details.
Each flashcard must be in JSON format with: id, question, answer, topic, and difficulty fields.
The output MUST be a valid JSON array only - no additional text before or after.
Format mathematical expressions using LaTeX notation with $ for inline math and $$ for block math.
${neurodivergenceModifier}${personalizedPrompt}`
  } else {
    systemPrompt = `You are an expert at analyzing large PDF documents.
Your task is to ${taskType === "summarize" ? "create a comprehensive summary" : "provide a detailed explanation"} of the content.
This is a large document that may exceed context limits, so:
1. Focus on extracting the most important information first
2. Prioritize capturing key concepts, main ideas, and critical details
3. Use a structured approach with clear sections and hierarchical organization
4. If mathematical content is present, format using LaTeX notation with $ for inline math and $$ for block math
5. Be concise while ensuring no important information is lost

Format your response in Markdown with proper headings, lists, and emphasis.
If you cannot process the entire document due to size limitations, focus on providing the most valuable content from what you can process.

MEDIA: NEVER use images from the PDF. ONLY request external images. ${taskType === "summarize" 
  ? `Use [IMAGE: Subject Topic SpecificDetails] format. ALWAYS include Subject (e.g., Mathematics, Biology) + Topic from PDF + Specific concept. Use DIFFERENT queries for different concepts. NEVER use base64, direct URLs, or PDF images.`
  : `Use [IMAGE: Subject Topic SpecificDetails] for images, [VIDEO: Subject Topic SpecificDetails] or [YT: Subject Topic SpecificDetails] for videos. ALWAYS include Subject + Topic + Specific Details. Use DIFFERENT queries for different concepts. NEVER use base64, direct URLs, or PDF images.`}
Example: [IMAGE: Mathematics Set Theory Venn diagram intersection] vs [IMAGE: Mathematics Set Theory Venn diagram union] are DIFFERENT. Use media sparingly (2-3 per section).${neurodivergenceModifier}${personalizedPrompt}`
  }

  // Modified payload with instructions for handling large documents
  const agentPayload = {
    agent_id: agentId,
    max_tokens: 3000, // Reduced from 4000 to save tokens
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: taskType === "flashcard"
              ? instructions + (neurodivergenceModifier ? `\n\n${neurodivergenceModifier}` : '') + `\n\nPlease analyze this document as thoroughly as possible, focusing on the most important content if you cannot process everything. If the document contains mathematical notation, ensure it's properly formatted in LaTeX.`
              : `This is a large document that might exceed normal processing limits. Here are my instructions: ${instructions}${neurodivergenceModifier ? `\n\n${neurodivergenceModifier}` : ''}\n\nPlease analyze this document as thoroughly as possible, focusing on the most important content if you cannot process everything. If the document contains mathematical notation, ensure it's properly formatted in LaTeX.`,
          },
          {
            type: "document_url",
            document_url: signedUrl,
          },
        ],
      },
    ],
  }

  console.log(`Sending optimized ${taskType} request for large document`)

  // Step 4: Send the request to the Mistral Agent Completion API with extended timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 75000); // 75 second timeout for large documents
  
  try {
    const agentResponse = await fetchWithRetry("https://api.mistral.ai/v1/agents/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${MISTRAL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(agentPayload),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    // Log the status code
    console.log("Large document API response status:", agentResponse.status);
    
    // Get the response text first to log it in case of an error
    const responseText = await agentResponse.text();
    console.log("Large document API response preview:", responseText.substring(0, 200));
    
    // Check if the response is OK
    if (!agentResponse.ok) {
      console.error("Large document agent completion error response:", responseText);
      
      // If the error is related to context length, try with a different approach
      if (responseText.includes("context length") || responseText.includes("token limit") || responseText.includes("too large")) {
        console.log("Context length issue detected. Attempting progressive analysis approach.");
        return await progressiveAnalysis(fileId, instructions, taskType, learningStyles, profile, res, flashcardCount);
      }
      
      return new NextResponse(
        JSON.stringify({
          error: `Failed to process large document: HTTP error ${agentResponse.status}`,
          details: responseText.substring(0, 500),
        }),
        { status: 500 }
      );
    }
    
    // Try to parse the JSON response
    let agentData;
    try {
      agentData = JSON.parse(responseText);
      console.log("Large document agent completion successful");
    } catch (e) {
      console.error("Failed to parse large document agent response:", e);
      return new NextResponse(
        JSON.stringify({
          error: "Failed to parse response from agent API for large document",
          details: responseText.substring(0, 1000),
        }),
        { status: 500 }
      );
    }
    
    // Extract the markdown content from the response
    let markdownContent = agentData.choices[0].message.content;
    
    // Check if response indicates PDF parsing failure and retry if needed
    if (isPdfParsingError(markdownContent)) {
      console.log("PDF parsing error detected in large document response. Retrying...");
      
      // Retry up to 3 times
      for (let retryAttempt = 1; retryAttempt <= 3; retryAttempt++) {
        console.log(`PDF parsing retry attempt ${retryAttempt}/3 for large document`);
        
        // Wait a bit before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * retryAttempt));
        
        // Retry the agent request
        const retryResponse = await fetchWithRetry("https://api.mistral.ai/v1/agents/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${MISTRAL_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(agentPayload),
        });
        
        if (!retryResponse.ok) {
          console.error(`Large document retry ${retryAttempt} failed with status: ${retryResponse.status}`);
          if (retryAttempt === 3) {
            const errorText = await retryResponse.text();
            return new NextResponse(
              JSON.stringify({
                error: "PDF processing failed after multiple retries. The PDF may be corrupted or in an unsupported format.",
                details: errorText.substring(0, 500),
              }),
              { status: 500 }
            );
          }
          continue;
        }
        
        const retryResponseText = await retryResponse.text();
        let retryAgentData;
        try {
          retryAgentData = JSON.parse(retryResponseText);
          markdownContent = retryAgentData.choices[0].message.content;
          
          // Check if retry was successful (no parsing error)
          if (!isPdfParsingError(markdownContent)) {
            console.log(`PDF parsing successful on retry attempt ${retryAttempt} for large document`);
            break;
          } else if (retryAttempt === 3) {
            console.error("PDF parsing error persists after 3 retries for large document");
            return new NextResponse(
              JSON.stringify({
                error: "PDF processing failed. The AI agent was unable to parse the PDF content after multiple attempts. Please try with a different PDF or contact support.",
                details: "The PDF may be corrupted, password-protected, or in an unsupported format.",
              }),
              { status: 500 }
            );
          }
        } catch (e) {
          console.error(`Failed to parse large document retry ${retryAttempt} response:`, e);
          if (retryAttempt === 3) {
            return new NextResponse(
              JSON.stringify({
                error: "Failed to parse response after retries",
                details: retryResponseText.substring(0, 500),
              }),
              { status: 500 }
            );
          }
        }
      }
    }
    
    // Step 5: Enhance markdown with images and videos (replace media requests with actual content)
    // Skip media enhancement for flashcards as they are JSON format
    if (taskType !== "flashcard") {
      try {
        console.log(`Enhancing large document markdown with media for task type: ${taskType}...`);
        markdownContent = await replaceMediaRequests(markdownContent, {
          enabled: true,
          minImageWidth: 400,
          minImageHeight: 300
        }, taskType as 'summarize' | 'explain');
        console.log("Media enhancement completed");
      } catch (error) {
        console.error("Error enhancing markdown with media:", error);
        // Continue with original markdown if media enhancement fails
      }
    }
    
    // Step 6: Clean up - delete the uploaded file
    console.log("Deleting uploaded file");
    await fetch(`https://api.mistral.ai/v1/files/${fileId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${MISTRAL_API_KEY}`,
      },
    }).catch((error) => {
      console.error("Error deleting file:", error);
    });
    
    return new NextResponse(JSON.stringify({ markdown: markdownContent }), { status: 200 });
  } catch (error) {
    clearTimeout(timeoutId);
    
    // If it's an AbortError (timeout), try progressive analysis
    if (error instanceof Error && error.name === 'AbortError') {
      console.log("Request timed out. Attempting progressive analysis approach.");
        return await progressiveAnalysis(fileId, instructions, taskType, learningStyles, profile, res, flashcardCount);
    }
    
    throw error; // Re-throw the error for the outer catch block to handle
  }
}

// Handle extremely large documents through progressive analysis
async function progressiveAnalysis(fileId: string, instructions: string, taskType: string, learningStyles: string[], profile: UserProfile | null, res: NextResponse, flashcardCount: string | null = null) {
  console.log("Starting progressive analysis for very large document");
  
  try {
    // Get a signed URL for the file
    const signedUrlResponse = await fetch(`https://api.mistral.ai/v1/files/${fileId}/url`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${MISTRAL_API_KEY}`,
      },
    });
    
    if (!signedUrlResponse.ok) {
      const errorText = await signedUrlResponse.text();
      console.error("Progressive analysis: Signed URL error:", errorText);
      throw new Error(`Failed to get signed URL: ${errorText}`);
    }
    
    const signedUrlData = await signedUrlResponse.json();
    const signedUrl = signedUrlData.url;
    
    // Step 1: First pass - get initial structure/overview
    console.log("Progressive analysis: First pass - overview");
    const agentId = taskType === "summarize" 
      ? SUMMARY_AGENT_ID 
      : taskType === "explain" 
      ? EXPLAIN_AGENT_ID 
      : taskType === "flashcard"
      ? FLASHCARD_AGENT_ID
      : SUMMARY_AGENT_ID;
    
    const firstPassPrompt = `FIRST PASS: Identify document structure, major sections, and key themes only. Create a concise markdown outline. No detailed analysis. No images.`;
    
    const firstPassPayload = {
      agent_id: agentId,
      max_tokens: 1500, // Reduced from 2000 to save tokens
      messages: [
        {
          role: "system",
          content: firstPassPrompt,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `This is a large document that requires progressive analysis. For this FIRST PASS, please ONLY identify the document's structure, major sections, and organization. Do not perform detailed analysis yet.`,
            },
            {
              type: "document_url",
              document_url: signedUrl,
            },
          ],
        },
      ],
    };
    
    const firstPassResponse = await fetchWithRetry("https://api.mistral.ai/v1/agents/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${MISTRAL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(firstPassPayload),
    });
    
    if (!firstPassResponse.ok) {
      const errorText = await firstPassResponse.text();
      console.error("Progressive analysis: First pass error:", errorText);
      throw new Error(`First pass failed: ${errorText}`);
    }
    
    const firstPassData = await firstPassResponse.json();
    const structureOutline = firstPassData.choices[0].message.content;
    
    // Step 2: Second pass - detailed analysis based on structure
    console.log("Progressive analysis: Second pass - detailed analysis");
    console.log(`Learning styles: ${learningStyles.join(", ") || "none"}`);
    
    const neurodivergenceModifier = getNeurodivergencePromptModifier(learningStyles)
    const personalizedPrompt = buildPersonalizedPrompt(profile)
    
    let secondPassPrompt = ""
    if (taskType === "flashcard") {
      const count = flashcardCount || "25"
      secondPassPrompt = `SECOND PASS: Using the structure outline, generate EXACTLY ${count} flashcards covering ALL areas. Output MUST be valid JSON array only with id, question, answer, topic, and difficulty fields. Format math using LaTeX.${neurodivergenceModifier}${personalizedPrompt}`
    } else {
      secondPassPrompt = `SECOND PASS: Using the structure outline, provide a ${taskType === "summarize" ? "comprehensive summary" : "detailed explanation"}. Format in markdown with LaTeX for math. MEDIA: NEVER use PDF images. ONLY request external images. ${taskType === "summarize" ? `Use [IMAGE: Subject Topic SpecificDetails] only.` : `Use [IMAGE: Subject Topic SpecificDetails] or [VIDEO: Subject Topic SpecificDetails]/[YT: Subject Topic SpecificDetails].`} ALWAYS include Subject + Topic + Specific Details. Use DIFFERENT queries for different concepts. Never use base64, direct URLs, or PDF images. Use sparingly.${neurodivergenceModifier}${personalizedPrompt}`
    }
    
    const secondPassPayload = {
      agent_id: agentId,
      max_tokens: 3000, // Reduced from 4000 to save tokens
      messages: [
        {
          role: "system",
          content: secondPassPrompt,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: taskType === "flashcard"
                ? `Here is the structural outline of the document from our first pass:\n\n${structureOutline}\n\nNow, generate flashcards covering ALL areas based on this structure. ${instructions}${neurodivergenceModifier ? `\n\n${neurodivergenceModifier}` : ''}`
                : `Here is the structural outline of the document from our first pass:\n\n${structureOutline}\n\nNow, please provide a ${taskType === "summarize" ? "comprehensive summary" : "detailed explanation"} based on this structure, following my instructions: ${instructions}${neurodivergenceModifier ? `\n\n${neurodivergenceModifier}` : ''}`,
            },
            {
              type: "document_url",
              document_url: signedUrl,
            },
          ],
        },
      ],
    };
    
    const secondPassResponse = await fetchWithRetry("https://api.mistral.ai/v1/agents/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${MISTRAL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(secondPassPayload),
    });
    
    if (!secondPassResponse.ok) {
      const errorText = await secondPassResponse.text();
      console.error("Progressive analysis: Second pass error:", errorText);
      throw new Error(`Second pass failed: ${errorText}`);
    }
    
    const secondPassData = await secondPassResponse.json();
    let detailedContent = secondPassData.choices[0].message.content;
    
    // Check if response indicates PDF parsing failure and retry if needed
    if (isPdfParsingError(detailedContent)) {
      console.log("PDF parsing error detected in progressive analysis response. Retrying...");
      
      // Retry up to 3 times
      for (let retryAttempt = 1; retryAttempt <= 3; retryAttempt++) {
        console.log(`PDF parsing retry attempt ${retryAttempt}/3 for progressive analysis`);
        
        // Wait a bit before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * retryAttempt));
        
        // Retry the second pass request
        const retryResponse = await fetchWithRetry("https://api.mistral.ai/v1/agents/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${MISTRAL_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(secondPassPayload),
        });
        
        if (!retryResponse.ok) {
          console.error(`Progressive analysis retry ${retryAttempt} failed with status: ${retryResponse.status}`);
          if (retryAttempt === 3) {
            const errorText = await retryResponse.text();
            throw new Error(`PDF processing failed after multiple retries: ${errorText.substring(0, 200)}`);
          }
          continue;
        }
        
        const retryResponseText = await retryResponse.text();
        let retryAgentData;
        try {
          retryAgentData = JSON.parse(retryResponseText);
          detailedContent = retryAgentData.choices[0].message.content;
          
          // Check if retry was successful (no parsing error)
          if (!isPdfParsingError(detailedContent)) {
            console.log(`PDF parsing successful on retry attempt ${retryAttempt} for progressive analysis`);
            break;
          } else if (retryAttempt === 3) {
            console.error("PDF parsing error persists after 3 retries for progressive analysis");
            throw new Error("PDF processing failed. The AI agent was unable to parse the PDF content after multiple attempts.");
          }
        } catch (e) {
          if (e instanceof Error && e.message.includes("PDF processing failed")) {
            throw e;
          }
          console.error(`Failed to parse progressive analysis retry ${retryAttempt} response:`, e);
          if (retryAttempt === 3) {
            throw new Error(`Failed to parse response after retries: ${retryResponseText.substring(0, 200)}`);
          }
        }
      }
    }
    
    // Enhance markdown with images and videos (replace media requests with actual content)
    // Skip media enhancement for flashcards as they are JSON format
    if (taskType !== "flashcard") {
      try {
        console.log(`Progressive analysis: Enhancing markdown with media for task type: ${taskType}...`);
        detailedContent = await replaceMediaRequests(detailedContent, {
          enabled: true,
          minImageWidth: 400,
          minImageHeight: 300
        }, taskType as 'summarize' | 'explain');
        console.log("Progressive analysis: Media enhancement completed");
      } catch (error) {
        console.error("Progressive analysis: Error enhancing markdown with media:", error);
        // Continue with original markdown if media enhancement fails
      }
    }
    
    // Clean up - delete the uploaded file
    console.log("Progressive analysis: Deleting uploaded file");
    await fetch(`https://api.mistral.ai/v1/files/${fileId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${MISTRAL_API_KEY}`,
      },
    }).catch((error) => {
      console.error("Error deleting file:", error);
    });
    
    return new NextResponse(JSON.stringify({ markdown: detailedContent }), { status: 200 });
  } catch (error) {
    // Clean up regardless of success or failure
    console.log("Progressive analysis: Deleting uploaded file after error");
    await fetch(`https://api.mistral.ai/v1/files/${fileId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${MISTRAL_API_KEY}`,
      },
    }).catch((cleanupError) => {
      console.error("Error deleting file during error cleanup:", cleanupError);
    });
    
    throw error; // Re-throw for the outer catch block to handle
  }
}

// Add a GET handler to prevent errors on page load/refresh
export async function GET() {
  return new NextResponse(JSON.stringify({ message: "This endpoint requires a POST request with PDF data" }), { status: 405 })
}
