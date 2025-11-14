"use client"

import { useEffect, useState } from "react"
import { ResponseCard } from "./response-card"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface SavedResponse {
  id: string
  title: string
  markdown_content: string
  task_type: string
  original_filename: string | null
  created_at: string
}

export function ResponsesList() {
  const [responses, setResponses] = useState<SavedResponse[]>([])
  const [filteredResponses, setFilteredResponses] = useState<SavedResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const supabase = createClient()
  const { toast } = useToast()

  useEffect(() => {
    fetchResponses()
  }, [])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredResponses(responses)
    } else {
      const filtered = responses.filter(
        (response) =>
          response.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          response.original_filename?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          response.markdown_content.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredResponses(filtered)
    }
  }, [searchQuery, responses])

  const fetchResponses = async () => {
    try {
      const response = await fetch("/api/responses")
      const data = await response.json()
      if (data.responses) {
        setResponses(data.responses)
        setFilteredResponses(data.responses)
      }
    } catch (error) {
      console.error("Error fetching responses:", error)
      toast({
        title: "Error",
        description: "Failed to load your resources.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/responses?id=${id}`, {
        method: "DELETE",
      })
      if (response.ok) {
        setResponses(responses.filter((r) => r.id !== id))
        setFilteredResponses(filteredResponses.filter((r) => r.id !== id))
        toast({
          title: "Resource Deleted",
          description: "The resource has been successfully deleted.",
        })
      } else {
        throw new Error("Failed to delete resource")
      }
    } catch (error) {
      console.error("Error deleting response:", error)
      toast({
        title: "Error",
        description: "Could not delete the resource. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <Input
          placeholder="Search resources..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md border-2 border-purple-200 focus:border-purple-600"
        />
      </div>

      {filteredResponses.length === 0 ? (
        <div className="text-center py-12 bg-purple-50 rounded-2xl border-2 border-purple-100">
          <p className="text-gray-600 text-lg">
            {searchQuery ? "No resources found matching your search." : "No saved resources yet."}
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResponses.map((response) => (
            <ResponseCard
              key={response.id}
              response={response}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}


