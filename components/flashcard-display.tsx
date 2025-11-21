"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RotateCcw, ChevronLeft, ChevronRight, RotateCw, Home, CheckCircle, XCircle } from "lucide-react"
import { MarkdownPreview } from "./markdown-preview"
import { useUser } from "@/hooks/use-user"

interface Flashcard {
  id: number
  question: string
  answer: string
  topic: string
  difficulty: "easy" | "medium" | "hard"
}

interface FlashcardDisplayProps {
  flashcards: Flashcard[]
  onReset: () => void
}

export function FlashcardDisplay({ flashcards, onReset }: FlashcardDisplayProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [studiedCards, setStudiedCards] = useState<Set<number>>(new Set())
  const [correctCards, setCorrectCards] = useState<Set<number>>(new Set())
  const { profile } = useUser()

  const currentCard = flashcards[currentIndex]
  const progress = ((currentIndex + 1) / flashcards.length) * 100

  useEffect(() => {
    setIsFlipped(false)
  }, [currentIndex])

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const handleFlip = () => {
    setIsFlipped(!isFlipped)
    if (!isFlipped) {
      setStudiedCards(new Set([...studiedCards, currentCard.id]))
    }
  }

  const handleMarkCorrect = () => {
    setCorrectCards(new Set([...correctCards, currentCard.id]))
    handleNext()
  }

  const handleMarkIncorrect = () => {
    setCorrectCards((prev) => {
      const newSet = new Set(prev)
      newSet.delete(currentCard.id)
      return newSet
    })
    handleNext()
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-700 border-green-200"
      case "medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-200"
      case "hard":
        return "bg-red-100 text-red-700 border-red-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  const getTopicStats = () => {
    const topicCounts: Record<string, number> = {}
    flashcards.forEach((card) => {
      topicCounts[card.topic] = (topicCounts[card.topic] || 0) + 1
    })
    return topicCounts
  }

  const topicStats = getTopicStats()

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 bg-white/90 backdrop-blur-sm border-violet-200 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Flashcards</h2>
            <p className="text-sm text-gray-600 mt-1">
              {flashcards.length} flashcards generated
            </p>
          </div>
          <Button
            variant="outline"
            onClick={onReset}
            className="border-violet-300 text-violet-600 hover:bg-violet-50"
          >
            <Home className="mr-2 h-4 w-4" />
            Create New Set
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Progress</span>
            <span className="font-semibold text-violet-600">
              {currentIndex + 1} / {flashcards.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-violet-600 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-gray-600">
              Correct: <span className="font-semibold text-green-600">{correctCards.size}</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-600">
              Studied: <span className="font-semibold text-violet-600">{studiedCards.size}</span>
            </span>
          </div>
        </div>

        {/* Topic Distribution */}
        {Object.keys(topicStats).length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm font-semibold text-gray-700 mb-2">Topics Covered:</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(topicStats).map(([topic, count]) => (
                <Badge key={topic} variant="outline" className="text-xs">
                  {topic} ({count})
                </Badge>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Flashcard */}
      {currentCard && (
        <div className="relative">
          <Card
            className="min-h-[400px] bg-white/90 backdrop-blur-sm border-2 border-violet-200 shadow-xl cursor-pointer transition-all duration-300 hover:shadow-2xl"
            onClick={handleFlip}
          >
            <div className="p-8">
              {/* Card Header */}
              <div className="flex items-center justify-between mb-6">
                <Badge className={getDifficultyColor(currentCard.difficulty)}>
                  {currentCard.difficulty}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {currentCard.topic}
                </Badge>
              </div>

              {/* Card Content */}
              <div className="min-h-[300px] flex items-center justify-center">
                {!isFlipped ? (
                  <div className="text-center w-full">
                    <div className="text-sm font-semibold text-gray-500 mb-4 uppercase tracking-wide">
                      Question
                    </div>
                    <div className="prose max-w-none text-lg">
                      <MarkdownPreview markdown={currentCard.question} />
                    </div>
                    <div className="mt-6 text-xs text-gray-400">
                      Click to reveal answer
                    </div>
                  </div>
                ) : (
                  <div className="text-center w-full">
                    <div className="text-sm font-semibold text-violet-600 mb-4 uppercase tracking-wide">
                      Answer
                    </div>
                    <div className="prose max-w-none text-base">
                      <MarkdownPreview markdown={currentCard.answer} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Navigation Controls */}
          <div className="mt-6 flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="border-violet-300 text-violet-600 hover:bg-violet-50 disabled:opacity-50"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={handleFlip}
                className="border-violet-300 text-violet-600 hover:bg-violet-50"
              >
                {isFlipped ? (
                  <>
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Show Question
                  </>
                ) : (
                  <>
                    <RotateCw className="mr-2 h-4 w-4" />
                    Show Answer
                  </>
                )}
              </Button>

              {isFlipped && (
                <>
                  <Button
                    variant="outline"
                    onClick={handleMarkIncorrect}
                    className="border-red-300 text-red-600 hover:bg-red-50"
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Incorrect
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleMarkCorrect}
                    className="border-green-300 text-green-600 hover:bg-green-50"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Correct
                  </Button>
                </>
              )}
            </div>

            <Button
              variant="outline"
              onClick={handleNext}
              disabled={currentIndex === flashcards.length - 1}
              className="border-violet-300 text-violet-600 hover:bg-violet-50 disabled:opacity-50"
            >
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Completion Message */}
      {currentIndex === flashcards.length - 1 && studiedCards.size === flashcards.length && (
        <Card className="p-6 bg-gradient-to-r from-violet-50 to-purple-50 border-2 border-violet-300">
          <div className="text-center">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Great Job!</h3>
            <p className="text-gray-600 mb-4">
              You've completed all {flashcards.length} flashcards!
            </p>
            <p className="text-sm text-gray-500">
              You got {correctCards.size} out of {flashcards.length} correct.
            </p>
          </div>
        </Card>
      )}
    </div>
  )
}


