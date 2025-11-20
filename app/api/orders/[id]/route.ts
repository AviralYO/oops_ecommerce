import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const accessToken = request.cookies.get("sb-access-token")?.value

    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
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
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Fetch order with items and tracking
    const { data: order, error: orderError } = await authenticatedSupabase
      .from("orders")
      .select(`
        *,
        order_items (
          *,
          products (
            name,
            image_url,
            description
          )
        ),
        profiles!orders_customer_id_fkey (
          name,
          email,
          phone
        )
      `)
      .eq("id", params.id)
      .single()

    if (orderError) {
      console.error("[Order] Fetch error:", orderError)
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    return NextResponse.json({ order })
  } catch (error: any) {
    console.error("[Order] Error:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const accessToken = request.cookies.get("sb-access-token")?.value

    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
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

    const body = await request.json()
    const { status, tracking_number, delivery_date } = body

    // Update order status
    const { data: order, error: updateError } = await authenticatedSupabase
      .from("orders")
      .update({
        status,
        tracking_number,
        delivery_date,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .select()
      .single()

    if (updateError) {
      console.error("[Order] Update error:", updateError)
      return NextResponse.json({ error: "Failed to update order" }, { status: 500 })
    }

    // TODO: Send notification email/SMS
    // await sendOrderStatusNotification(order)

    return NextResponse.json({ order })
  } catch (error: any) {
    console.error("[Order] Error:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
