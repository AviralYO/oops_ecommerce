import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authToken = request.cookies.get("auth-token")?.value
    const accessToken = request.cookies.get("sb-access-token")?.value

    if (!authToken && !accessToken) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { id: orderId } = await params

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      )
    }

    let userId: string

    if (authToken) {
      // OTP-based auth - authToken is the user ID
      userId = authToken
    } else {
      // OAuth/password auth
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

      userId = user.id
    }

    // Use service role client to bypass RLS
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

    // Verify order belongs to user
    const { data: order } = await supabaseAdmin
      .from("orders")
      .select("customer_id")
      .eq("id", orderId)
      .single()

    if (!order || order.customer_id !== userId) {
      return NextResponse.json(
        { error: "Order not found or access denied" },
        { status: 404 }
      )
    }

    // Fetch status history
    const { data: history, error: historyError } = await supabaseAdmin
      .from("order_status_history")
      .select("*")
      .eq("order_id", orderId)
      .order("created_at", { ascending: false })

    if (historyError) {
      console.error("Status history fetch error:", historyError)
      return NextResponse.json(
        { error: "Failed to fetch status history" },
        { status: 500 }
      )
    }

    return NextResponse.json({ history: history || [] })
  } catch (error) {
    console.error("Get status history error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
