"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Loader2, Calendar, FileText, BrainCircuit, Type } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { AdaptiveMarkdownPreview } from "@/components/adaptive-markdown-preview"
import { useUser } from "@/hooks/use-user"
import { format } from "date-fns"

interface SavedResponse {
  id: string
  title: string
  markdown_content: string
  task_type: string
  original_filename: string | null
  instructions_used: string | null
  neurodivergence_type_used: string | null
  created_at: string
}

export function ResourceDetail({ id }: { id: string }) {
  const [response, setResponse] = useState<SavedResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { profile } = useUser()

  useEffect(() => {
    if (id) {
      fetchResponse()
    }
  }, [id])

  const fetchResponse = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/responses?id=${id}`)
      const data = await res.json()
      if (data.response) {
        setResponse(data.response)
      }
    } catch (error) {
      console.error("Error fetching resource:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    )
  }

  if (!response) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Resource not found</h2>
        <Button onClick={() => router.push("/dashboard")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>
    )
  }
  
  return (
    <div className="w-full bg-white min-h-full">
      <header className="border-b border-gray-200 sticky top-0 bg-white z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-4 sm:py-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4 sm:mb-6 text-gray-700 hover:text-black px-0 text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Back to Resources</span>
            <span className="sm:hidden">Back</span>
          </Button>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-black mb-3 sm:mb-4 break-words">{response.title}</h1>
          <div className="flex flex-wrap items-center gap-x-4 sm:gap-x-6 gap-y-2 text-xs sm:text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>{format(new Date(response.created_at), "MMMM d, yyyy")}</span>
            </div>
            <div className="flex items-center gap-2">
              <Type className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="capitalize">{response.task_type}</span>
            </div>
            {response.original_filename && (
              <div className="flex items-center gap-2">
                <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="truncate max-w-[150px] sm:max-w-none">{response.original_filename}</span>
              </div>
            )}
            {response.neurodivergence_type_used && (
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Optimized for {response.neurodivergence_type_used}</span>
                <span className="sm:hidden">{response.neurodivergence_type_used}</span>
              </div>
            )}
          </div>
        </div>
      </header>
      
      <main className="py-6 sm:py-8 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16">
        <div className="w-full max-w-7xl mx-auto">
          {response.instructions_used && (
            <Card className="mb-6 sm:mb-8 p-3 sm:p-4 bg-purple-50 border-purple-200">
              <p className="text-xs sm:text-sm">
                <span className="font-semibold text-black">Instructions Used:</span>{" "}
                <span className="text-gray-700">{response.instructions_used}</span>
              </p>
            </Card>
          )}
          
          <article className="w-full">
            <AdaptiveMarkdownPreview markdown={response.markdown_content} profile={profile} />
          </article>
        </div>
      </main>
    </div>
  )
}
