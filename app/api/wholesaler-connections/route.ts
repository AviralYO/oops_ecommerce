import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// GET - Fetch connections for a user
export async function GET(request: NextRequest) {
  try {
    const accessToken = request.cookies.get("sb-access-token")?.value

    if (!accessToken) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const authenticatedSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      }
    )

    const { data: { user }, error: userError } = await authenticatedSupabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") // 'retailer' or 'wholesaler'

    let query = supabaseAdmin
      .from("wholesaler_connections")
      .select(`
        *,
        retailer:retailer_id(id, email, name),
        wholesaler:wholesaler_id(id, email, name)
      `)

    if (type === "retailer") {
      query = query.eq("retailer_id", user.id)
    } else if (type === "wholesaler") {
      query = query.eq("wholesaler_id", user.id)
    }

    const { data: connections, error } = await query

    if (error) {
      console.error("[Connections GET] Error:", error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ connections: connections || [] })
  } catch (error: any) {
    console.error("[Connections GET] Exception:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

// POST - Create a connection request
export async function POST(request: NextRequest) {
  try {
    const accessToken = request.cookies.get("sb-access-token")?.value

    if (!accessToken) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const authenticatedSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      }
    )

    const { data: { user }, error: userError } = await authenticatedSupabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { wholesaler_id } = body

    if (!wholesaler_id) {
      return NextResponse.json(
        { error: "Wholesaler ID required" },
        { status: 400 }
      )
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Check if connection already exists
    const { data: existingConnection } = await supabaseAdmin
      .from("wholesaler_connections")
      .select("*")
      .eq("retailer_id", user.id)
      .eq("wholesaler_id", wholesaler_id)
      .single()

    if (existingConnection) {
      return NextResponse.json({ 
        connection: existingConnection,
        message: "Already connected" 
      })
    }

    const { data: connection, error } = await supabaseAdmin
      .from("wholesaler_connections")
      .insert({
        retailer_id: user.id,
        wholesaler_id,
        status: "accepted" // Auto-accept for now
      })
      .select()
      .single()

    if (error) {
      console.error("[Connections POST] Error:", error)
      
      // Handle duplicate key error specifically
      if (error.code === "23505" || error.message.includes("duplicate")) {
        // Fetch the existing connection
        const { data: existing } = await supabaseAdmin
          .from("wholesaler_connections")
          .select("*")
          .eq("retailer_id", user.id)
          .eq("wholesaler_id", wholesaler_id)
          .single()
        
        return NextResponse.json({ 
          connection: existing,
          message: "Already connected" 
        })
      }
      
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ connection })
  } catch (error: any) {
    console.error("[Connections POST] Exception:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

// PATCH - Update connection status
export async function PATCH(request: NextRequest) {
  try {
    const accessToken = request.cookies.get("sb-access-token")?.value

    if (!accessToken) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const authenticatedSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      }
    )

    const { data: { user }, error: userError } = await authenticatedSupabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { connection_id, status } = body

    if (!connection_id || !status) {
      return NextResponse.json(
        { error: "Connection ID and status required" },
        { status: 400 }
      )
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const { data: connection, error } = await supabaseAdmin
      .from("wholesaler_connections")
      .update({ status })
      .eq("id", connection_id)
      .select()
      .single()

    if (error) {
      console.error("[Connections PATCH] Error:", error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ connection })
  } catch (error: any) {
    console.error("[Connections PATCH] Exception:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
