"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, BookOpen, Plus, FileText, Calendar, Trash2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { FlashcardDisplay } from "@/components/flashcard-display"
import type { FlashcardSet } from "@/types/flashcard"

export default function FlashcardsPage() {
  const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedSetId, setSelectedSetId] = useState<string | null>(null)
  const [selectedFlashcards, setSelectedFlashcards] = useState<any[]>([])
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    fetchFlashcardSets()
  }, [])

  const fetchFlashcardSets = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/sign-in")
        return
      }

      const { data, error } = await supabase
        .from("flashcard_sets")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) throw error

      setFlashcardSets(data || [])
    } catch (error) {
      console.error("Error fetching flashcard sets:", error)
      toast({
        title: "Error",
        description: "Failed to load flashcard sets. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteSet = async (setId: string) => {
    if (!confirm("Are you sure you want to delete this flashcard set? This action cannot be undone.")) {
      return
    }

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("flashcard_sets")
        .delete()
        .eq("id", setId)

      if (error) throw error

      toast({
        title: "Deleted",
        description: "Flashcard set has been deleted.",
      })

      // If deleted set was selected, clear selection
      if (selectedSetId === setId) {
        setSelectedSetId(null)
        setSelectedFlashcards([])
      }

      fetchFlashcardSets()
    } catch (error) {
      console.error("Error deleting flashcard set:", error)
      toast({
        title: "Error",
        description: "Failed to delete flashcard set. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleViewSet = async (setId: string) => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("flashcards")
        .select("*")
        .eq("flashcard_set_id", setId)
        .order("card_order", { ascending: true })

      if (error) throw error

      // Transform database format to display format
      const transformedFlashcards = (data || []).map((card) => ({
        id: card.id,
        question: card.question,
        answer: card.answer,
        topic: card.topic,
        difficulty: card.difficulty,
      }))

      setSelectedFlashcards(transformedFlashcards)
      setSelectedSetId(setId)
    } catch (error) {
      console.error("Error fetching flashcards:", error)
      toast({
        title: "Error",
        description: "Failed to load flashcards. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (selectedSetId && selectedFlashcards.length > 0) {
    return (
      <FlashcardDisplay
        flashcards={selectedFlashcards}
        onReset={() => {
          setSelectedSetId(null)
          setSelectedFlashcards([])
        }}
      />
    )
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full">
      <div className="mb-6 sm:mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-black mb-2">Flashcard Collections</h1>
          <p className="text-sm sm:text-base text-gray-600">View and study your flashcard sets</p>
        </div>
        <Button
          onClick={() => router.push("/dashboard/new")}
          className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create New Set
        </Button>
      </div>

      {isLoading ? (
        <Card className="p-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-violet-600" />
          <p className="mt-4 text-gray-600">Loading flashcard sets...</p>
        </Card>
      ) : flashcardSets.length === 0 ? (
        <Card className="p-12 text-center bg-white/90 backdrop-blur-sm border-violet-200 shadow-lg">
          <BookOpen className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No Flashcard Sets Yet</h2>
          <p className="text-gray-600 mb-6">
            Create your first flashcard set by uploading a PDF and selecting "Flashcard" as the task type.
          </p>
          <Button
            onClick={() => router.push("/dashboard/new")}
            className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Flashcard Set
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {flashcardSets.map((set) => (
            <Card
              key={set.id}
              className="p-6 bg-white/90 backdrop-blur-sm border-violet-200 shadow-lg hover:shadow-xl transition-all cursor-pointer"
              onClick={() => handleViewSet(set.id)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">{set.title}</h3>
                  {set.original_filename && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <FileText className="w-4 h-4" />
                      <span className="truncate">{set.original_filename}</span>
                    </div>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteSet(set.id)
                  }}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <div className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4" />
                  <span>{set.total_cards} cards</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{format(new Date(set.created_at), "MMM d, yyyy")}</span>
                </div>
              </div>

              {set.learning_styles && set.learning_styles.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {set.learning_styles.map((style) => (
                    <Badge key={style} variant="outline" className="text-xs capitalize">
                      {style}
                    </Badge>
                  ))}
                </div>
              )}

              <Button
                className="w-full mt-4 bg-violet-600 hover:bg-violet-700 text-white"
                onClick={(e) => {
                  e.stopPropagation()
                  handleViewSet(set.id)
                }}
              >
                Study Set
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
