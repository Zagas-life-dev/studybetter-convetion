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
    const { data, error } = await supabase.rpc("check_usage_limit", {
      p_user_id: user.id,
      p_action_type: "download",
    })
    if (error) {
      return new NextResponse(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } })
    }
    return new NextResponse(JSON.stringify(data), { status: 200, headers: { 'Content-Type': 'application/json' } })
  } catch (error) {
    return new NextResponse(JSON.stringify({ error: error instanceof Error ? error.message : "Internal server error" }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { 'Content-Type': 'application/json' } })
    }
    const { error } = await supabase.rpc("increment_usage", {
      p_user_id: user.id,
      p_action_type: "download",
    })
    if (error) {
      return new NextResponse(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } })
    }
    return new NextResponse(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } })
  } catch (error) {
    return new NextResponse(JSON.stringify({ error: error instanceof Error ? error.message : "Internal server error" }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
}


