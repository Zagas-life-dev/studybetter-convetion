import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { 'Content-Type': 'application/json' } })
    }

    const body = await request.json()
    const {
      title,
      original_filename,
      flashcards,
      flashcard_count,
      instructions_used,
      learning_styles,
    } = body

    if (!title || !flashcards || !Array.isArray(flashcards) || flashcards.length === 0) {
      return new NextResponse(
        JSON.stringify({ error: "Missing required fields: title, flashcards (array)" }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Create flashcard set
    const { data: flashcardSet, error: setError } = await supabase
      .from("flashcard_sets")
      .insert({
        user_id: user.id,
        title,
        original_filename: original_filename || null,
        total_cards: flashcards.length,
        flashcard_count: flashcard_count || flashcards.length,
        instructions_used: instructions_used || null,
        learning_styles: learning_styles && learning_styles.length > 0 ? learning_styles : null,
        neurodivergence_type_used: learning_styles && learning_styles.length > 0 ? learning_styles.join(",") : null,
      })
      .select()
      .single()

    if (setError) {
      console.error("Error creating flashcard set:", setError)
      return new NextResponse(
        JSON.stringify({ error: `Failed to create flashcard set: ${setError.message}` }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Insert flashcards
    const flashcardsToInsert = flashcards.map((card: any, index: number) => {
      // Validate and normalize difficulty
      let difficulty = "medium" // default
      if (card.difficulty) {
        // Convert to string and normalize
        const difficultyStr = String(card.difficulty).toLowerCase().trim()
        if (["easy", "medium", "hard"].includes(difficultyStr)) {
          difficulty = difficultyStr
        }
      }
      
      return {
        flashcard_set_id: flashcardSet.id,
        user_id: user.id,
        card_order: index + 1,
        question: String(card.question || ""),
        answer: String(card.answer || ""),
        topic: String(card.topic || "General"),
        difficulty: difficulty,
      }
    })

    const { error: cardsError } = await supabase
      .from("flashcards")
      .insert(flashcardsToInsert)

    if (cardsError) {
      console.error("Error creating flashcards:", cardsError)
      // Try to clean up the set if cards insertion fails
      await supabase.from("flashcard_sets").delete().eq("id", flashcardSet.id)
      return new NextResponse(
        JSON.stringify({ error: `Failed to create flashcards: ${cardsError.message}` }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    return new NextResponse(
      JSON.stringify({ 
        success: true, 
        flashcard_set: flashcardSet,
        cards_created: flashcards.length 
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error("Error in flashcard save route:", error)
    return new NextResponse(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal server error" }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

