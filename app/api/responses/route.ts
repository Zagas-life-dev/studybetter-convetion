import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { 'Content-Type': 'application/json' } })
    }
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (id) {
      const { data: response, error } = await supabase
        .from("saved_responses")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .single()
      if (error) {
        return new NextResponse(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } })
      }
      if (!response) {
        return new NextResponse(JSON.stringify({ error: "Response not found" }), { status: 404, headers: { 'Content-Type': 'application/json' } })
      }
      return new NextResponse(JSON.stringify({ response }), { status: 200, headers: { 'Content-Type': 'application/json' } })
    } else {
      const { data: responses, error } = await supabase
        .from("saved_responses")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
      if (error) {
        return new NextResponse(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } })
      }
      return new NextResponse(JSON.stringify({ responses: responses || [] }), { status: 200, headers: { 'Content-Type': 'application/json' } })
    }
  } catch (error) {
    return new NextResponse(JSON.stringify({ error: error instanceof Error ? error.message : "Internal server error" }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { 'Content-Type': 'application/json' } })
    }
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (!id) {
      return new NextResponse(JSON.stringify({ error: "Missing id parameter" }), { status: 400, headers: { 'Content-Type': 'application/json' } })
    }
    const { error } = await supabase
      .from("saved_responses")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id)
    if (error) {
      return new NextResponse(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } })
    }
    return new NextResponse(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } })
  } catch (error) {
    return new NextResponse(JSON.stringify({ error: error instanceof Error ? error.message : "Internal server error" }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
}


