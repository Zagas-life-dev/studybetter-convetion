"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MarkdownPreview } from "./markdown-preview"

import { EnhancedPdfGenerator } from "./enhanced-pdf-generator"

import { Loader2, FileText, Upload, CheckCircle, Copy, Download, AlertCircle, Bot, Info, Save, LogIn } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/hooks/use-auth"
import Link from "next/link"

// Maximum file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024

interface PdfUploadFormProps {
  hideHeading?: boolean
}

export function PdfUploadForm({ hideHeading = false }: PdfUploadFormProps) {
  const [file, setFile] = useState<File | null>(null)
  const [instructions, setInstructions] = useState("")
  const [taskType, setTaskType] = useState("summarize")
  const [neurodivergenceType, setNeurodivergenceType] = useState<string>("none")
  const [isLoading, setIsLoading] = useState(false)
  const [markdownContent, setMarkdownContent] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [processingStep, setProcessingStep] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [usageRemaining, setUsageRemaining] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()
  const { user, loading: authLoading } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isInitialMount = useRef(true)

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

  // Fetch usage limits when user is authenticated
  useEffect(() => {
    if (user && !authLoading) {
      fetchUsageLimit()
    } else {
      // Reset usage remaining when user logs out
      setUsageRemaining(null)
    }
  }, [user, authLoading])

  const fetchUsageLimit = async () => {
    // Don't fetch if user is not authenticated
    if (!user || authLoading) {
      return
    }

    try {
      const response = await fetch("/api/user/usage?action_type=summary")
      
      // Handle 401 (Unauthorized) - user session expired or invalid
      if (response.status === 401) {
        setUsageRemaining(null)
        return
      }

      if (!response.ok) {
        console.error("Error fetching usage limit:", response.status, response.statusText)
        return
      }

      const data = await response.json()
      if (data.remaining !== undefined) {
        setUsageRemaining(data.remaining)
      }
    } catch (error) {
      // Silently fail - don't show errors for usage limit fetches
      // This prevents console spam when user is not authenticated
      if (error instanceof Error && !error.message.includes('401')) {
        console.error("Error fetching usage limit:", error)
      }
      setUsageRemaining(null)
    }
  }

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

  // Update the handleSubmit function to better handle errors
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !instructions) return

    // Prevent accidental double submissions
    if (isLoading) return

    setIsLoading(true)
    setError(null)
    setMarkdownContent("")
    setProcessingStep("Uploading PDF")
    setProgress(10)

    const formData = new FormData()
    formData.append("pdf", file)
    formData.append("instructions", instructions)
    formData.append("taskType", taskType)
    formData.append("neurodivergenceType", neurodivergenceType)

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
          throw new Error("Server response did not contain markdown content. Please try again.")
        }

        setMarkdownContent(data.markdown)
        setProcessingStep(null)
        setProgress(100)
        // Refresh usage limit after successful processing
        if (user) {
          fetchUsageLimit()
        }
        
        toast({
          title: "PDF Processed Successfully",
          description: `Your ${taskType === "summarize" ? "summary" : "explanation"} has been generated successfully!`,
        })
      } else {
        const errorMessage = data.error || `Error (${response.status}): ${response.statusText}`
        const errorDetails = data.details ? `\n\nDetails: ${data.details}` : ""
        
        // Handle specific error cases
        if (response.status === 401) {
          const errorMsg = "Please sign in to process PDFs. " + errorMessage
          setError(errorMsg)
          toast({
            title: "Authentication Required",
            description: "Please sign in to process PDFs.",
            variant: "destructive",
          })
        } else if (response.status === 429) {
          const errorMsg = data.message || errorMessage
          setError(errorMsg)
          if (data.remaining !== undefined) {
            setUsageRemaining(data.remaining)
          }
          toast({
            title: "Daily Limit Reached",
            description: errorMsg,
            variant: "destructive",
          })
        } else {
          const errorMsg = errorMessage + errorDetails
          setError(errorMsg)
          toast({
            title: "Processing Failed",
            description: errorMessage,
            variant: "destructive",
          })
        }
        
        setProcessingStep(null)
        setProgress(0)
      }
    } catch (error) {
      console.error("Error:", error)
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred. Please try again."
      setError(errorMessage)
      toast({
        title: "Processing Error",
        description: errorMessage,
        variant: "destructive",
      })
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

  const handleSaveResponse = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save resources.",
        variant: "destructive",
      })
      return
    }

    if (!markdownContent || !file) return

    setSaving(true)
    try {
      const response = await fetch("/api/responses/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: file.name.replace(".pdf", "") + (taskType === "summarize" ? " - Summary" : " - Explanation"),
          markdown_content: markdownContent,
          task_type: taskType,
          original_filename: file.name,
          instructions_used: instructions,
          neurodivergence_type_used: neurodivergenceType,
          metadata: {
            file_size: file.size,
            processing_date: new Date().toISOString(),
          },
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to save resource")
      }

      toast({
        title: "Resource Saved Successfully",
        description: "Your resource has been saved to your dashboard. You can view it in your saved resources.",
      })
    } catch (error) {
      console.error("Error saving resource:", error)
      toast({
        title: "Failed to Save Resource",
        description: error instanceof Error ? error.message : "Failed to save resource. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const hasMathContent = markdownContent.includes("$") || markdownContent.includes("\\")

  return (
    <div className="space-y-10">
      {!hideHeading && (
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-black text-black mb-4">Upload & Process</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Transform your PDF into an AI-powered learning resource
          </p>
        </div>
      )}
      {!authLoading && !user && (
        <div className="mt-4">
          <Alert className="max-w-2xl mx-auto border-2 border-purple-200 bg-purple-50">
            <LogIn className="h-5 w-5 text-purple-600" />
            <AlertTitle className="font-bold text-black">Sign in required</AlertTitle>
            <AlertDescription className="text-gray-700">
              Please{" "}
              <Link href="/auth/sign-in" className="text-purple-600 hover:text-purple-700 font-semibold underline">
                sign in
              </Link>{" "}
              to process PDFs and save your resources.
            </AlertDescription>
          </Alert>
        </div>
      )}
      {user && usageRemaining !== null && (
        <div className="mt-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-full">
            <span className="text-sm font-semibold text-purple-700">
              {usageRemaining} summaries remaining today
            </span>
          </div>
        </div>
      )}

      <Card className="p-10 bg-white border-2 border-purple-100 shadow-2xl rounded-3xl hover:shadow-purple-500/10 transition-all duration-300">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-4">
            <Label htmlFor="pdf" className="text-black font-black text-xl flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-600" />
              Upload PDF Document
            </Label>
            <div
              className="border-2 border-dashed border-purple-300 rounded-2xl p-16 text-center bg-gradient-to-br from-purple-50/50 to-purple-50/30 hover:border-purple-500 hover:bg-gradient-to-br hover:from-purple-50 hover:to-purple-100 transition-all duration-300 cursor-pointer group"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              {file ? (
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="w-20 h-20 bg-purple-100 rounded-2xl flex items-center justify-center">
                    <FileText className="h-10 w-10 text-purple-600" />
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-black mb-1">{file.name}</div>
                    <Button type="button" variant="ghost" size="sm" onClick={() => setFile(null)} className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 font-semibold">
                      Change File
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="w-20 h-20 bg-purple-600 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Upload className="h-10 w-10 text-white" />
                  </div>
                  <div>
                    <div className="text-xl text-black font-black mb-2">Drag and drop your PDF here</div>
                    <div className="text-sm text-gray-500 mb-4">or click the button below</div>
                  </div>
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
                    className="bg-white border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white font-bold px-8 py-6 text-base shadow-md hover:shadow-lg transition-all"
                  >
                    Browse Files
                  </Button>
                </div>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-3 text-center">Maximum file size: 10MB. Only PDF files are accepted.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Label className="text-black font-black text-lg">Task Type</Label>
              <RadioGroup value={taskType} onValueChange={setTaskType} className="flex space-x-6">
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="summarize" id="summarize" className="border-2 border-purple-600 data-[state=checked]:bg-purple-600 w-5 h-5" />
                  <Label htmlFor="summarize" className="text-black font-semibold cursor-pointer text-base">Summarize</Label>
                </div>
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="explain" id="explain" className="border-2 border-purple-600 data-[state=checked]:bg-purple-600 w-5 h-5" />
                  <Label htmlFor="explain" className="text-black font-semibold cursor-pointer text-base">Explain</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-4">
              <Label htmlFor="neurodivergence" className="text-black font-black text-lg">Learning Style (Optional)</Label>
              <p className="text-xs text-gray-600 mb-2">
                Optimize content for your neurodivergence type
              </p>
              <Select value={neurodivergenceType} onValueChange={setNeurodivergenceType}>
                <SelectTrigger id="neurodivergence" className="w-full border-2 border-purple-200 focus:border-purple-600 h-12">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None (Standard)</SelectItem>
                  <SelectItem value="adhd">ADHD</SelectItem>
                  <SelectItem value="dyslexia">Dyslexia</SelectItem>
                  <SelectItem value="autism">Autism</SelectItem>
                  <SelectItem value="audhd">AUDHD (Autism + ADHD)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <Label htmlFor="instructions" className="text-black font-black text-lg">Instructions for AI</Label>
            <Textarea
              id="instructions"
              placeholder="E.g., Summarize the key points of this document, or Explain the concepts in simple terms..."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              rows={5}
              required
              className="border-2 border-purple-200 focus:border-purple-600 resize-none text-base"
            />
          </div>

          <Button 
            type="submit" 
            disabled={isLoading || !file || !instructions || !user || (usageRemaining !== null && usageRemaining === 0)} 
            className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-black py-7 text-lg shadow-xl hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed rounded-xl"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Bot className="mr-2 h-5 w-5" />
                Process with AI Agent
              </>
            )}
          </Button>
        </form>

        {processingStep && (
          <div className="mt-8 space-y-3 p-6 bg-gradient-to-r from-purple-50 to-purple-100 rounded-2xl border-2 border-purple-200 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-base font-bold text-purple-700">{processingStep}</span>
              <span className="text-base text-purple-600 font-black">{progress}%</span>
            </div>
            <Progress value={progress} className="h-3 bg-purple-200" />
          </div>
        )}

        {error && (
          <Alert variant="destructive" className="mt-6 border-2 border-red-500 rounded-xl p-6">
            <AlertCircle className="h-5 w-5" />
            <AlertTitle className="font-black text-lg">Error</AlertTitle>
            <AlertDescription className="whitespace-pre-line mt-2">{error}</AlertDescription>
          </Alert>
        )}
      </Card>

      {markdownContent && (
        <div className="space-y-8 mt-12">
            <Card className="p-10 bg-white border-2 border-purple-100 shadow-2xl rounded-3xl">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl flex items-center justify-center shadow-lg">
                  <CheckCircle className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-black">AI Agent Response</h2>
                  <p className="text-sm text-gray-500 mt-1">Your document has been processed successfully</p>
                </div>
              </div>
              {user && (
                <Button
                  onClick={handleSaveResponse}
                  disabled={saving}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-6"
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Resource
                    </>
                  )}
                </Button>
              )}
            </div>

            {hasMathContent && (
              <Alert className="mb-8 border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-purple-100 rounded-2xl p-6">
                <Info className="h-6 w-6 text-purple-600" />
                <AlertTitle className="font-black text-lg text-black">Mathematical Content Detected</AlertTitle>
                <AlertDescription className="text-gray-700 mt-2 text-base">
                  This document contains mathematical expressions. The enhanced PDF export will properly render these
                  expressions with correct positioning of division symbols and other mathematical notation.
                </AlertDescription>
              </Alert>
            )}

            <Tabs defaultValue="preview" className="mb-8">
              <TabsList className="grid w-full grid-cols-2 bg-purple-100 rounded-xl p-1.5 h-14">
                <TabsTrigger value="preview" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white font-bold text-base rounded-lg">Preview</TabsTrigger>
                <TabsTrigger value="export" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white font-bold text-base rounded-lg">Export</TabsTrigger>
              </TabsList>
              <TabsContent value="preview" className="mt-4">
                <div className="prose max-w-none dark:prose-invert">
                  <MarkdownPreview markdown={markdownContent} />
                </div>
              </TabsContent>
              <TabsContent value="export" className="mt-6">
                <div className="grid gap-6">
                  <div className="flex flex-col space-y-2 mb-4">
                    <h3 className="text-2xl font-black text-black">Download Options</h3>
                    <p className="text-base text-gray-600">
                      Download your results in different formats for sharing or reference.
                    </p>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <Card className="p-6 border-2 border-purple-100 bg-white hover:border-purple-300 transition-all duration-300 rounded-2xl">
                      <div className="flex flex-col space-y-3 mb-5">
                        <h4 className="font-black text-black text-xl">Markdown Format</h4>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          Download the raw markdown text that can be used in markdown editors.
                        </p>
                      </div>
                      <Button onClick={downloadMarkdown} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-6 rounded-xl shadow-lg">
                        <Download className="mr-2 h-5 w-5" />
                        Download Markdown
                      </Button>
                    </Card>

                    <Card className="p-6 border-2 border-purple-100 bg-white hover:border-purple-300 transition-all duration-300 rounded-2xl">
                      <div className="flex flex-col space-y-3 mb-5">
                        <h4 className="font-black text-black text-xl">Standard PDF</h4>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          Download a PDF with properly rendered equations, optimized for general accessibility.
                        </p>
                      </div>
                      <EnhancedPdfGenerator
                        markdown={markdownContent}
                        fileName={file?.name || "document.pdf"}
                        taskType={taskType}
                        neurodivergentFriendly={false}
                      />
                    </Card>

                    <Card className="md:col-span-2 p-6 border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-purple-100 hover:border-purple-500 transition-all duration-300 rounded-2xl">
                      <div className="flex flex-col space-y-3 mb-5">
                        <div className="flex items-center gap-3">
                          <h4 className="font-black text-black text-xl">Neurodivergent-Friendly PDF</h4>
                          <span className="px-3 py-1 bg-purple-600 text-white text-xs font-black rounded-full">Accessible</span>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          Optimized for ADHD, dyslexia, autism, and AUDHD with larger fonts, increased spacing, high contrast, and clearer typography.
                        </p>
                        <ul className="text-xs text-gray-600 list-disc list-inside mt-2 space-y-1">
                          <li>Larger, sans-serif fonts</li>
                          <li>Increased line & letter spacing</li>
                          <li>High contrast black text</li>
                          <li>Shorter line lengths (65 characters)</li>
                          <li>More whitespace between sections</li>
                        </ul>
                      </div>
                      <EnhancedPdfGenerator
                        markdown={markdownContent}
                        fileName={file?.name || "document.pdf"}
                        taskType={taskType}
                        neurodivergentFriendly={true}
                      />
                    </Card>
                  </div>
                  <div className="mt-4">
                    <Button variant="outline" onClick={copyToClipboard} className="w-full border-2 border-purple-300 text-purple-600 hover:bg-purple-50 hover:border-purple-600 font-bold py-6 rounded-xl">
                      <Copy className="mr-2 h-5 w-5" />
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
