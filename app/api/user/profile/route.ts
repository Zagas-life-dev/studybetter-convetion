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
    const { data: profile, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", user.id)
      .single()
    if (error && error.code !== "PGRST116") {
      return new NextResponse(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } })
    }
    return new NextResponse(JSON.stringify({ profile: profile || null }), { status: 200, headers: { 'Content-Type': 'application/json' } })
  } catch (error) {
    return new NextResponse(JSON.stringify({ error: error instanceof Error ? error.message : "Internal server error" }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { 'Content-Type': 'application/json' } })
    }
    const body = await request.json()
    const { data: profile, error } = await supabase
      .from("user_profiles")
      .upsert({
        id: user.id,
        ...body,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()
    if (error) {
      return new NextResponse(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } })
    }
    return new NextResponse(JSON.stringify({ profile }), { status: 200, headers: { 'Content-Type': 'application/json' } })
  } catch (error) {
    return new NextResponse(JSON.stringify({ error: error instanceof Error ? error.message : "Internal server error" }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
}


