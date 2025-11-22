// TypeScript interfaces for Flashcard database schema

export interface FlashcardSet {
  id: string
  user_id: string
  title: string
  original_filename: string | null
  total_cards: number
  flashcard_count: number // Number of cards requested (20-40)
  instructions_used: string | null
  neurodivergence_type_used: string | null
  learning_styles: string[] | null
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface Flashcard {
  id: string
  flashcard_set_id: string
  user_id: string
  card_order: number
  question: string
  answer: string
  topic: string
  difficulty: 'easy' | 'medium' | 'hard'
  times_studied: number
  times_correct: number
  times_incorrect: number
  last_studied_at: string | null
  mastery_level: number // 0.00 to 1.00
  is_mastered: boolean
  created_at: string
  updated_at: string
}

export interface FlashcardStudySession {
  id: string
  user_id: string
  flashcard_set_id: string
  cards_studied: number
  cards_correct: number
  cards_incorrect: number
  session_duration_seconds: number
  started_at: string
  completed_at: string | null
  metadata: Record<string, any>
}

export interface FlashcardSetStats {
  total_cards: number
  studied_cards: number
  mastered_cards: number
  average_mastery: number
  total_studies: number
  total_correct: number
  total_incorrect: number
  by_difficulty: {
    easy: number
    medium: number
    hard: number
  }
  by_topic: Record<string, number>
}

// Input types for creating flashcards
export interface CreateFlashcardSetInput {
  title: string
  original_filename?: string
  total_cards: number
  flashcard_count: number
  instructions_used?: string
  neurodivergence_type_used?: string
  learning_styles?: string[]
  metadata?: Record<string, any>
}

export interface CreateFlashcardInput {
  flashcard_set_id: string
  card_order: number
  question: string
  answer: string
  topic: string
  difficulty: 'easy' | 'medium' | 'hard'
}

export interface UpdateFlashcardStudyInput {
  times_studied?: number
  times_correct?: number
  times_incorrect?: number
}

// Response from AI (before saving to database)
export interface FlashcardAIResponse {
  id: number
  question: string
  answer: string
  topic: string
  difficulty: 'easy' | 'medium' | 'hard'
}



