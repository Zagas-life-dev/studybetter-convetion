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
      markdown_content,
      task_type,
      original_filename,
      instructions_used,
      neurodivergence_type_used,
      metadata,
    } = body
    if (!title || !markdown_content || !task_type) {
      return new NextResponse(JSON.stringify({ error: "Missing required fields: title, markdown_content, task_type" }), { status: 400, headers: { 'Content-Type': 'application/json' } })
    }
    const { data: response, error } = await supabase
      .from("saved_responses")
      .insert({
        user_id: user.id,
        title,
        markdown_content,
        task_type,
        original_filename: original_filename || null,
        instructions_used: instructions_used || null,
        neurodivergence_type_used: neurodivergence_type_used || null,
        metadata: metadata || {},
      })
      .select()
      .single()
    if (error) {
      return new NextResponse(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } })
    }
    return new NextResponse(JSON.stringify({ response }), { status: 200, headers: { 'Content-Type': 'application/json' } })
  } catch (error) {
    return new NextResponse(JSON.stringify({ error: error instanceof Error ? error.message : "Internal server error" }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
}


