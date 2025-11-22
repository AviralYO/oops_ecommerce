import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET(request: NextRequest) {
  try {
    // Check for OTP auth token first
    const authToken = request.cookies.get("auth-token")?.value
    const accessToken = request.cookies.get("sb-access-token")?.value

    if (!authToken && !accessToken) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Use service role client
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

    // Fetch orders with items
    const { data: orders, error: ordersError } = await supabaseAdmin
      .from("orders")
      .select(`
        *,
        order_items (
          *,
          products (
            name,
            image_url
          )
        )
      `)
      .eq("customer_id", userId)
      .order("created_at", { ascending: false })

    if (ordersError) {
      console.error("[Orders] Fetch error:", ordersError)
      return NextResponse.json(
        { error: "Failed to fetch orders" },
        { status: 500 }
      )
    }

    return NextResponse.json({ orders })
  } catch (error: any) {
    console.error("[Orders] Error:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
