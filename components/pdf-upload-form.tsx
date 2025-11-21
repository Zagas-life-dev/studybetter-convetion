"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { MarkdownPreview } from "./markdown-preview"

import { EnhancedPdfGenerator } from "./enhanced-pdf-generator"

import { Loader2, FileText, Upload, CheckCircle, Copy, Download, AlertCircle, Bot, Info, Save } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/hooks/use-auth"
import { useUser } from "@/hooks/use-user"
import { X } from "lucide-react"
import { Badge } from "@/components/ui/badge"

// Maximum file size: 10MB
const MAX_FILE_SIZE = 20 * 1024 * 1024

// Premade prompts
const PREMADE_PROMPTS = [
  { label: "Use Gen Z language", value: "Use Gen Z language and slang to make this more relatable and engaging." },
  { label: "Simplify terms", value: "Explain everything in simple, easy-to-understand terms." },
  { label: "Add examples", value: "Include practical examples and real-world applications." },
  { label: "Make it concise", value: "Keep it brief and to the point, focusing on key information only." },
  { label: "Add visual descriptions", value: "Include detailed visual descriptions to help visualize concepts." },
  { label: "Use analogies", value: "Use analogies and comparisons to explain complex concepts." },
]

export function PdfUploadForm() {
  const [file, setFile] = useState<File | null>(null)
  const [instructions, setInstructions] = useState("")
  const [taskType, setTaskType] = useState("summarize")
  const [flashcardCount, setFlashcardCount] = useState("25")
  const [selectedLearningStyles, setSelectedLearningStyles] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [markdownContent, setMarkdownContent] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [processingStep, setProcessingStep] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [isSaving, setIsSaving] = useState(false)
  const [usageCount, setUsageCount] = useState<{ remaining: number; count: number } | null>(null)
  const { toast } = useToast()
  const { user } = useAuth()
  const { profile } = useUser()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isInitialMount = useRef(true)
  
  const MAX_LEARNING_STYLES = 3
  const AVAILABLE_LEARNING_STYLES = [
    { value: "adhd", label: "ADHD" },
    { value: "dyslexia", label: "Dyslexia" },
    { value: "autism", label: "Autism" },
  ]

  // Clear any errors on component mount/page refresh
  useEffect(() => {
    setError(null)
    setProcessingStep(null)
    setProgress(0)
    isInitialMount.current = false

    // This will help prevent any unwanted form submissions on page refresh
    const handleBeforeUnload = () => {
      isInitialMount.current = true
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [])

  const fetchUsageCount = async () => {
    try {
      const response = await fetch("/api/user/usage?action_type=summary")
      if (response.ok) {
        const data = await response.json()
        setUsageCount({
          remaining: data.remaining || 0,
          count: data.count || 0
        })
      }
    } catch (error) {
      console.error("Error fetching usage count:", error)
    }
  }

  // Fetch usage count when user is available
  useEffect(() => {
    if (user) {
      fetchUsageCount()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const validateFile = (file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return `File size exceeds the maximum limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB.`
    }

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      return "Only PDF files are supported."
    }

    return null
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      const validationError = validateFile(selectedFile)

      if (validationError) {
        setError(validationError)
        // Reset the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
        return
      }

      setFile(selectedFile)
      setError(null)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0]
      const validationError = validateFile(droppedFile)

      if (validationError) {
        setError(validationError)
        return
      }

      setFile(droppedFile)
      setError(null)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  // Handle premade prompt selection
  const handlePremadePrompt = (promptValue: string) => {
    if (instructions.trim()) {
      setInstructions(instructions + " " + promptValue)
    } else {
      setInstructions(promptValue)
    }
  }

  // Handle learning style selection
  const handleAddLearningStyle = (style: string) => {
    // Don't add if already selected
    if (selectedLearningStyles.includes(style)) {
      return
    }
    // Don't add if max reached
    if (selectedLearningStyles.length >= MAX_LEARNING_STYLES) {
      toast({
        title: "Maximum reached",
        description: `You can select up to ${MAX_LEARNING_STYLES} learning styles.`,
        variant: "destructive",
      })
      return
    }
    setSelectedLearningStyles([...selectedLearningStyles, style])
  }

  const handleRemoveLearningStyle = (style: string) => {
    setSelectedLearningStyles(selectedLearningStyles.filter(s => s !== style))
  }

  // Get available learning styles (exclude already selected ones)
  const getAvailableLearningStyles = () => {
    return AVAILABLE_LEARNING_STYLES.filter(
      style => !selectedLearningStyles.includes(style.value)
    )
  }

  // Update the handleSubmit function to better handle errors
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return

    // Prevent accidental double submissions
    if (isLoading) return

    setIsLoading(true)
    setError(null)
    setMarkdownContent("")
    setProcessingStep("Uploading PDF")
    setProgress(10)

    const formData = new FormData()
    formData.append("pdf", file)
    formData.append("instructions", instructions || "")
    formData.append("taskType", taskType)
    // Send learning styles as JSON array
    formData.append("learningStyles", JSON.stringify(selectedLearningStyles))
    // Add flashcard count if task type is flashcard
    if (taskType === "flashcard") {
      formData.append("flashcardCount", flashcardCount)
    }

    try {
      setProcessingStep("Processing with OCR")
      setProgress(30)

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      })

      setProcessingStep("Agent is analyzing document")
      setProgress(60)

      // Get the response text first
      let responseText
      try {
        responseText = await response.text()
        console.log("Response status:", response.status)
        console.log("Response text preview:", responseText.substring(0, 200))
      } catch (e) {
        console.error("Failed to read response text:", e)
        throw new Error("Failed to read server response. Please try again.")
      }

      // Try to parse it as JSON
      let data
      try {
        data = JSON.parse(responseText)
      } catch (e) {
        console.error("Failed to parse response:", e)
        console.error("Raw response:", responseText)

        // Check if it's an HTML response (likely an error page)
        if (responseText.includes("<!DOCTYPE html>") || responseText.includes("<html>")) {
          throw new Error("Server returned an HTML error page. This might be due to a server timeout or memory issue.")
        }

        // If it starts with "Internal Server Error" or similar
        if (responseText.startsWith("Internal")) {
          throw new Error(
            "Internal server error occurred. Please try again with a smaller PDF or simpler instructions.\n\nRaw response: " +
              responseText,
          )
        }

        throw new Error(
          `Failed to parse server response: ${e.message}\n\nRaw response: ${responseText.substring(0, 100)}...`,
        )
      }
// hey
      if (response.ok) {
        setProcessingStep("Finalizing results")
        setProgress(90)

        if (!data.markdown) {
          throw new Error("Server response did not contain content. Please try again.")
        }

        // For flashcards, handle JSON response and save to database
        if (taskType === "flashcard") {
          try {
            // Parse the JSON flashcards from the markdown response
            let jsonString = data.markdown.trim()
            
            // Remove markdown code blocks if present
            if (jsonString.startsWith("```")) {
              jsonString = jsonString.replace(/^```(?:json)?\n?/i, "").replace(/\n?```$/i, "")
            }
            
            // Clean up common JSON issues
            // Remove any leading/trailing whitespace
            jsonString = jsonString.trim()
            
            // Try to find JSON array in the string if it's embedded in text
            const jsonMatch = jsonString.match(/\[[\s\S]*\]/)
            if (jsonMatch) {
              jsonString = jsonMatch[0]
            }
            
            // Function to properly escape JSON strings
            const fixJsonString = (str: string): string => {
              // First, try to parse as-is
              try {
                JSON.parse(str)
                return str
              } catch {
                // If that fails, we need to fix escape sequences
                // Use a more robust approach: parse character by character
                let result = ''
                let inString = false
                let escapeNext = false
                
                for (let i = 0; i < str.length; i++) {
                  const char = str[i]
                  
                  if (escapeNext) {
                    result += char
                    escapeNext = false
                    continue
                  }
                  
                  if (char === '\\') {
                    result += char
                    escapeNext = true
                    continue
                  }
                  
                  if (char === '"') {
                    inString = !inString
                    result += char
                    continue
                  }
                  
                  if (inString) {
                    // Inside a string, escape control characters
                    if (char === '\n') result += '\\n'
                    else if (char === '\r') result += '\\r'
                    else if (char === '\t') result += '\\t'
                    else if (char === '\f') result += '\\f'
                    else if (char === '\b') result += '\\b'
                    else result += char
                  } else {
                    result += char
                  }
                }
                
                return result
              }
            }
            
            // Try to parse with better error handling
            let parsedFlashcards
            try {
              parsedFlashcards = JSON.parse(jsonString)
            } catch (parseError) {
              // If parsing fails, try to fix common issues
              console.error("Initial JSON parse failed, attempting to fix...", parseError)
              
              try {
                // Try fixing the JSON string
                const fixedJson = fixJsonString(jsonString)
                parsedFlashcards = JSON.parse(fixedJson)
              } catch (secondError) {
                // Last resort: manually fix unescaped characters in string values
                console.error("Second parse attempt failed, trying manual fix...", secondError)
                
                // Extract array and manually fix string values
                const arrayStart = jsonString.indexOf('[')
                const arrayEnd = jsonString.lastIndexOf(']')
                if (arrayStart !== -1 && arrayEnd !== -1 && arrayEnd > arrayStart) {
                  let extractedJson = jsonString.substring(arrayStart, arrayEnd + 1)
                  
                  // Use the same character-by-character fix
                  extractedJson = fixJsonString(extractedJson)
                  
                  try {
                    parsedFlashcards = JSON.parse(extractedJson)
                  } catch (thirdError) {
                    // Final attempt: log the problematic JSON for debugging
                    console.error("Final parse attempt failed. Problematic JSON:", extractedJson.substring(0, 500))
                    throw new Error(`Failed to parse JSON after multiple attempts: ${thirdError instanceof Error ? thirdError.message : String(thirdError)}. The AI may have generated invalid JSON. Please try again.`)
                  }
                } else {
                  throw new Error(`Failed to parse JSON: ${secondError instanceof Error ? secondError.message : String(secondError)}. The AI response may not be valid JSON.`)
                }
              }
            }
            
            if (!Array.isArray(parsedFlashcards)) {
              throw new Error("Flashcards data is not in the expected format (array)")
            }

            // Save flashcards to database
            const saveResponse = await fetch("/api/flashcards/save", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                title: file?.name.replace(".pdf", "") || "Flashcard Set",
                original_filename: file?.name || null,
                flashcards: parsedFlashcards,
                flashcard_count: parseInt(flashcardCount),
                instructions_used: instructions || null,
                learning_styles: selectedLearningStyles,
              }),
            })

            if (saveResponse.ok) {
              toast({
                title: "Flashcards created!",
                description: `Successfully created ${parsedFlashcards.length} flashcards.`,
              })
              // Redirect to flashcards page
              window.location.href = "/dashboard/flashcards"
              return
            } else {
              const errorData = await saveResponse.json()
              throw new Error(errorData.error || "Failed to save flashcards")
            }
          } catch (parseError) {
            console.error("Failed to parse or save flashcards:", parseError)
            throw new Error(
              parseError instanceof Error 
                ? parseError.message 
                : "Failed to process flashcards. The AI may not have returned valid JSON format."
            )
          }
        } else {
          // For summarize/explain, use markdown content
          setMarkdownContent(data.markdown)
        }

        setProcessingStep(null)
        setProgress(100)
        // Refresh usage count after successful processing
        if (user) {
          fetchUsageCount()
        }
      } else {
        const errorMessage = data.error || `Error (${response.status}): ${response.statusText}`
        const errorDetails = data.details ? `\n\nDetails: ${data.details}` : ""
        setError(errorMessage + errorDetails)
        setProcessingStep(null)
        setProgress(0)
      }
    } catch (error) {
      console.error("Error:", error)
      setError(error instanceof Error ? error.message : "An unexpected error occurred. Please try again.")
      setProcessingStep(null)
      setProgress(0)
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(markdownContent)
      toast({
        title: "Copied to clipboard",
        description: "The markdown content has been copied to your clipboard.",
      })
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Could not copy to clipboard. Please try again.",
        variant: "destructive",
      })
    }
  }

  const downloadMarkdown = () => {
    const element = document.createElement("a")
    const blob = new Blob([markdownContent], { type: "text/markdown" })
    element.href = URL.createObjectURL(blob)

    // Create filename based on the original file and task type
    const originalName = file ? file.name.replace(".pdf", "") : "document"
    const suffix = taskType === "summarize" ? "_summarized" : "_explained"
    element.download = `${originalName}${suffix}.md`

    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const hasMathContent = markdownContent.includes("$") || markdownContent.includes("\\")

  const handleSaveResponse = async () => {
    if (!markdownContent || !user) {
      toast({
        title: "Error",
        description: "No content to save or user not logged in.",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    try {
      // Generate a title from the file name or use a default
      const title = file 
        ? `${file.name.replace(".pdf", "")} - ${taskType === "summarize" ? "Summary" : "Explanation"}`
        : `${taskType === "summarize" ? "Summary" : "Explanation"} - ${new Date().toLocaleDateString()}`

      const response = await fetch("/api/responses/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          markdown_content: markdownContent,
          task_type: taskType,
          original_filename: file?.name || null,
          instructions_used: instructions || null,
          neurodivergence_type_used: selectedLearningStyles.length > 0 ? selectedLearningStyles.join(",") : null,
          metadata: {
            learning_styles: selectedLearningStyles,
          },
        }),
      })

      if (response.ok) {
        toast({
          title: "Response saved",
          description: "Your response has been saved successfully.",
        })
      } else {
        const data = await response.json()
        throw new Error(data.error || "Failed to save response")
      }
    } catch (error) {
      console.error("Error saving response:", error)
      toast({
        title: "Failed to save",
        description: error instanceof Error ? error.message : "Could not save response. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-8">
      <Card className="p-6 bg-white/90 backdrop-blur-sm border-violet-200 shadow-lg">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="pdf" className="text-gray-700 font-semibold">Upload PDF Document</Label>
            <div
              className="border-2 border-dashed border-violet-300 rounded-xl p-8 text-center bg-gradient-to-br from-violet-50 to-purple-50 hover:border-violet-400 transition-colors"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              {file ? (
                <div className="flex items-center justify-center space-x-3">
                  <FileText className="h-6 w-6 text-violet-600" />
                  <span className="text-sm font-medium text-gray-700">{file.name}</span>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setFile(null)} className="text-violet-600 hover:text-violet-700">
                    Change
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Upload className="h-10 w-10 text-violet-400 mx-auto" />
                  <div className="text-sm text-gray-600 font-medium">Drag and drop your PDF here, or click to browse</div>
                  <Input
                    id="pdf"
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    required
                    className="hidden"
                    ref={fileInputRef}
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => document.getElementById("pdf")?.click()}
                    className="bg-white border-violet-300 text-violet-600 hover:bg-violet-50 hover:border-violet-400"
                  >
                    Select PDF
                  </Button>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">Maximum file size: 10MB. Only PDF files are accepted.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Task Type</Label>
              <RadioGroup value={taskType} onValueChange={setTaskType} className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="summarize" id="summarize" />
                  <Label htmlFor="summarize">Summarize</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="explain" id="explain" />
                  <Label htmlFor="explain">Explain</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="flashcard" id="flashcard" />
                  <Label htmlFor="flashcard">Flashcard</Label>
                </div>
              </RadioGroup>
            </div>

            {taskType === "flashcard" && (
              <div className="space-y-2">
                <Label htmlFor="flashcard-count">Number of Flashcards</Label>
                <Select value={flashcardCount} onValueChange={setFlashcardCount}>
                  <SelectTrigger id="flashcard-count" className="w-full border-violet-200 focus:border-violet-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 21 }, (_, i) => i + 20).map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} flashcards
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">Select how many flashcards to generate (20-40)</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="learning-styles">Learning Style (Optional)</Label>
              <p className="text-xs text-gray-500 mb-2">
                Optimize content for your learning preferences. You can select up to {MAX_LEARNING_STYLES} styles.
              </p>
              
              {/* Selected learning styles */}
              {selectedLearningStyles.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {selectedLearningStyles.map((style) => {
                    const styleLabel = AVAILABLE_LEARNING_STYLES.find(s => s.value === style)?.label || style
                    return (
                      <Badge
                        key={style}
                        variant="secondary"
                        className="px-3 py-1.5 bg-violet-100 text-violet-700 border-2 border-violet-200 hover:bg-violet-200"
                      >
                        {styleLabel}
                        <button
                          type="button"
                          onClick={() => handleRemoveLearningStyle(style)}
                          className="ml-2 hover:text-violet-900"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    )
                  })}
                </div>
              )}

              {/* Add learning style dropdown */}
              {selectedLearningStyles.length < MAX_LEARNING_STYLES && (
                <Select
                  value=""
                  onValueChange={(value) => {
                    if (value) {
                      handleAddLearningStyle(value)
                    }
                  }}
                >
                  <SelectTrigger id="learning-styles" className="w-full border-violet-200 focus:border-violet-600">
                    <SelectValue placeholder="Add learning style..." />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableLearningStyles().map((style) => (
                      <SelectItem key={style.value} value={style.value}>
                        {style.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              
              {selectedLearningStyles.length === 0 && (
                <p className="text-xs text-gray-500 italic">No learning styles selected. Content will use standard formatting.</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="instructions">Instructions for AI (Optional)</Label>
            <p className="text-xs text-gray-500 mb-2">
              Add custom instructions or select from premade prompts below
            </p>
            
            {/* Premade prompts */}
            <div className="flex flex-wrap gap-2 mb-3">
              {PREMADE_PROMPTS.map((prompt) => (
                <Button
                  key={prompt.label}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handlePremadePrompt(prompt.value)}
                  className="border-2 border-violet-200 text-violet-700 hover:bg-violet-50 hover:border-violet-400 text-xs"
                >
                  {prompt.label}
                </Button>
              ))}
            </div>
            
            <Textarea
              id="instructions"
              placeholder="E.g., Summarize the key points of this document, or Explain the concepts in simple terms... (Optional - you can use premade prompts above or leave empty)"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              rows={4}
            />
          </div>

          <div className="space-y-3">
            {usageCount !== null && (
              <div className="flex items-center justify-between p-3 bg-violet-50 rounded-lg border border-violet-200">
                <span className="text-sm font-medium text-violet-700">Uploads remaining today:</span>
                <span className="text-sm font-bold text-violet-600">{usageCount.remaining} / 3</span>
              </div>
            )}
            <Button 
              type="submit" 
              disabled={isLoading || !file || !user || (usageCount !== null && usageCount.remaining <= 0)} 
              className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-semibold py-6 text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Bot className="mr-2 h-4 w-4" />
                  Process with AI Agent
                </>
              )}
            </Button>
          </div>
        </form>

        {processingStep && (
          <div className="mt-6 space-y-2 p-4 bg-violet-50 rounded-lg border border-violet-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-violet-700">{processingStep}</span>
              <span className="text-sm text-violet-600 font-semibold">{progress}%</span>
            </div>
            <Progress value={progress} className="h-3 bg-violet-100" />
          </div>
        )}

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription className="whitespace-pre-line">{error}</AlertDescription>
          </Alert>
        )}
      </Card>

      {markdownContent && (
        <div className="space-y-6">
          <Card className="p-6 bg-white/90 backdrop-blur-sm border-violet-200 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-violet-600" />
                <h2 className="text-xl font-semibold text-gray-800">AI Agent Response</h2>
              </div>
              <Button
                onClick={handleSaveResponse}
                disabled={isSaving || !user}
                className="bg-violet-600 hover:bg-violet-700 text-white"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Response
                  </>
                )}
              </Button>
            </div>

            {hasMathContent && (
              <Alert className="mb-4">
                <Info className="h-4 w-4" />
                <AlertTitle>Mathematical Content Detected</AlertTitle>
                <AlertDescription>
                  This document contains mathematical expressions. The enhanced PDF export will properly render these
                  expressions with correct positioning of division symbols and other mathematical notation.
                </AlertDescription>
              </Alert>
            )}

            <Tabs defaultValue="preview" className="mb-6">
              <TabsList className="grid w-full grid-cols-2 bg-violet-100">
                <TabsTrigger value="preview" className="data-[state=active]:bg-violet-600 data-[state=active]:text-white">Preview</TabsTrigger>
                <TabsTrigger value="export" className="data-[state=active]:bg-violet-600 data-[state=active]:text-white">Export</TabsTrigger>
              </TabsList>
              <TabsContent value="preview" className="mt-4">
                <div className="prose max-w-none dark:prose-invert">
                  <MarkdownPreview markdown={markdownContent} />
                </div>
              </TabsContent>
              <TabsContent value="export" className="mt-4">
                <div className="grid gap-4">
                  <div className="flex flex-col space-y-2">
                    <h3 className="text-lg font-medium">Download Options</h3>
                    <p className="text-sm text-muted-foreground">
                      Download your results in different formats for sharing or reference.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    <Card className="p-4">
                      <div className="flex flex-col space-y-2 mb-4">
                        <h4 className="font-medium">Markdown Format</h4>
                        <p className="text-sm text-muted-foreground">
                          Download the raw markdown text that can be used in markdown editors.
                        </p>
                      </div>
                      <Button onClick={downloadMarkdown} className="w-full bg-violet-600 hover:bg-violet-700 text-white">
                        <Download className="mr-2 h-4 w-4" />
                        Download Markdown
                      </Button>
                    </Card>

                    <Card className="p-4">
                      <div className="flex flex-col space-y-2 mb-4">
                        <h4 className="font-medium">Enhanced PDF Format</h4>
                        <p className="text-sm text-muted-foreground">
                          Download a single-page PDF with properly rendered equations and Study Better branding.
                        </p>
                      </div>
                      <EnhancedPdfGenerator
                        markdown={markdownContent}
                        fileName={file?.name || "document.pdf"}
                        taskType={taskType}
                      />
                    </Card>


                 
           
                  </div>
                  <div className="mt-2">
                    <Button variant="outline" onClick={copyToClipboard} className="w-full border-violet-300 text-violet-600 hover:bg-violet-50 hover:border-violet-400">
                      <Copy className="mr-2 h-4 w-4" />
                      Copy to Clipboard
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      )}
    </div>
  )
}
