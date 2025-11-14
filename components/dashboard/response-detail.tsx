"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Loader2 } from "lucide-react"
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

export function ResponseDetail({ id }: { id: string }) {
  const [response, setResponse] = useState<SavedResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { profile } = useUser()

  useEffect(() => {
    fetchResponse()
  }, [id])

  const fetchResponse = async () => {
    try {
      const res = await fetch(`/api/responses?id=${id}`)
      const data = await res.json()
      if (data.response) {
        setResponse(data.response)
      }
    } catch (error) {
      console.error("Error fetching response:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    )
  }

  if (!response) {
    return (
      <div className="p-8">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Card className="p-8 text-center">
          <p className="text-gray-600">Resource not found</p>
        </Card>
      </div>
    )
  }

  // Get adaptive container styles based on profile
  const getContainerStyles = () => {
    const neurodivergenceType = profile?.neurodivergence_type || null
    switch (neurodivergenceType) {
      case "dyslexia":
        return {
          backgroundColor: "#ffffff",
          padding: "2rem",
          borderRadius: "1rem",
        }
      case "adhd":
        return {
          backgroundColor: "#fafafa",
          padding: "2rem",
          borderRadius: "1rem",
          border: "2px solid #a78bfa40",
        }
      case "autism":
        return {
          backgroundColor: "#ffffff",
          padding: "2rem",
          borderRadius: "0.5rem",
          border: "2px solid #60a5fa40",
        }
      case "audhd":
        return {
          backgroundColor: "#ffffff",
          padding: "2rem",
          borderRadius: "1rem",
        }
      default:
        return {
          backgroundColor: "#ffffff",
          padding: "2rem",
          borderRadius: "1rem",
        }
    }
  }

  const containerStyles = getContainerStyles()
  const neurodivergenceType = profile?.neurodivergence_type || null

  return (
    <div
      className="p-4 sm:p-6 md:p-8"
      style={{
        backgroundColor: containerStyles.backgroundColor,
      }}
    >
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Resources
      </Button>

      <Card
        className="border-2 rounded-3xl w-full"
        style={{
          ...containerStyles,
          borderColor: neurodivergenceType === "adhd" ? "#a78bfa" : neurodivergenceType === "autism" ? "#60a5fa" : "#e9d5ff",
          maxWidth: neurodivergenceType === "dyslexia" || neurodivergenceType === "audhd" ? "700px" : "900px",
          margin: "0 auto", // Center the card
        }}
      >
        <div className="mb-6">
          <h1
            className="font-black mb-4"
            style={{
              fontSize: neurodivergenceType === "dyslexia" || neurodivergenceType === "audhd" ? "2.5rem" : "2rem",
              color: "#000000",
              letterSpacing: neurodivergenceType === "dyslexia" || neurodivergenceType === "audhd" ? "0.5px" : "normal",
            }}
          >
            {response.title}
          </h1>
          <div className="flex flex-wrap gap-4 text-sm" style={{ color: "#4a5568" }}>
            {response.original_filename && (
              <div>
                <span className="font-semibold">File:</span> {response.original_filename}
              </div>
            )}
            <div>
              <span className="font-semibold">Type:</span>{" "}
              <span className="capitalize">{response.task_type}</span>
            </div>
            <div>
              <span className="font-semibold">Date:</span>{" "}
              {format(new Date(response.created_at), "MMMM d, yyyy 'at' h:mm a")}
            </div>
            {response.neurodivergence_type_used && (
              <div>
                <span className="font-semibold">Optimized for:</span>{" "}
                <span className="capitalize">{response.neurodivergence_type_used}</span>
              </div>
            )}
            {profile?.neurodivergence_type && (
              <div>
                <span className="font-semibold">Display mode:</span>{" "}
                <span className="capitalize">{profile.neurodivergence_type}</span> friendly
              </div>
            )}
          </div>
          {response.instructions_used && (
            <div
              className="mt-4 p-4 rounded-xl border"
              style={{
                backgroundColor: neurodivergenceType === "adhd" ? "#f3e8ff" : "#f5f3ff",
                borderColor: neurodivergenceType === "adhd" ? "#a78bfa" : "#c4b5fd",
              }}
            >
              <p className="text-sm">
                <span className="font-semibold text-black">Instructions:</span>{" "}
                <span style={{ color: "#374151" }}>{response.instructions_used}</span>
              </p>
            </div>
          )}
        </div>

        <div className="prose max-w-none">
          <AdaptiveMarkdownPreview markdown={response.markdown_content} profile={profile} />
        </div>
      </Card>
    </div>
  )
}


