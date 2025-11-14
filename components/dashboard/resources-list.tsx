"use client"

import { useEffect, useState } from "react"
import { ResourceCard } from "@/components/dashboard/resource-card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2, ServerCrash, FileText } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface SavedResponse {
  id: string
  title: string
  markdown_content: string
  task_type: string
  created_at: string
}

export function ResourcesList() {
  const [responses, setResponses] = useState<SavedResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortOrder, setSortOrder] = useState("newest")
  const { toast } = useToast()

  useEffect(() => {
    fetchResponses()
  }, [])

  const fetchResponses = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/responses")
      const data = await res.json()
      if (res.ok) {
        setResponses(data.responses)
      } else {
        throw new Error(data.error || "Failed to fetch resources")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred"
      setError(errorMessage)
      toast({
        title: "Error",
        description: "Could not fetch your resources. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const deleteResponse = async (id: string) => {
    try {
      const res = await fetch(`/api/responses?id=${id}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to delete resource")
      }

      setResponses((prev) => prev.filter((r) => r.id !== id))
    } catch (err) {
      // The toast is handled in the ResourceCard component, but we throw to stop execution
      throw err
    }
  }

  const filteredResponses = responses
    .filter((response) =>
      response.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const dateA = new Date(a.created_at).getTime()
      const dateB = new Date(b.created_at).getTime()
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB
    })

  if (loading) {
    return (
      <div className="flex items-center justify-center p-10">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-10 bg-red-50 text-red-700 rounded-xl">
        <ServerCrash className="w-10 h-10 mb-4" />
        <h3 className="text-xl font-bold mb-2">Could not load resources</h3>
        <p>{error}</p>
        <Button onClick={fetchResponses} className="mt-4">
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
        <Input
          placeholder="Search resources..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:max-w-xs"
        />
        <Select value={sortOrder} onValueChange={setSortOrder}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredResponses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredResponses.map((response) => (
            <ResourceCard key={response.id} response={response} onDelete={deleteResponse} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 sm:py-10 bg-gray-50 rounded-xl px-4">
          <FileText className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg sm:text-xl font-bold text-black">No resources found</h3>
          <p className="text-sm sm:text-base text-gray-600">
            {searchTerm
              ? "Try adjusting your search."
              : "Create a new resource to get started."}
          </p>
        </div>
      )}
    </div>
  )
}

