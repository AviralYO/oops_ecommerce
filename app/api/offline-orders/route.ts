import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// GET - Fetch offline orders
export async function GET(request: NextRequest) {
  try {
    const authToken = request.cookies.get("auth-token")?.value
    const accessToken = request.cookies.get("sb-access-token")?.value

    if (!authToken && !accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let userId: string

    if (authToken) {
      userId = authToken
    } else {
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

      userId = user.id
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") // 'customer' or 'retailer'

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    let query = supabaseAdmin
      .from("offline_orders")
      .select(`
        *,
        products (
          name,
          price,
          image_url
        ),
        customer:customer_id (
          name,
          email
        ),
        retailer:retailer_id (
          name,
          email,
          pincode
        )
      `)

    if (type === "customer") {
      query = query.eq("customer_id", userId)
    } else if (type === "retailer") {
      query = query.eq("retailer_id", userId)
    }

    const { data: orders, error } = await query.order("pickup_datetime", { ascending: true })

    if (error) {
      console.error("[Offline Orders GET] Error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ orders: orders || [] })
  } catch (error: any) {
    console.error("[Offline Orders GET] Error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Create offline order with calendar integration
export async function POST(request: NextRequest) {
  try {
    const authToken = request.cookies.get("auth-token")?.value
    const accessToken = request.cookies.get("sb-access-token")?.value

    if (!authToken && !accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let userId: string

    if (authToken) {
      userId = authToken
    } else {
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

      userId = user.id
    }

    const body = await request.json()
    const { retailer_id, product_id, quantity, total_amount, pickup_datetime, customer_notes } = body

    if (!retailer_id || !product_id || !quantity || !total_amount || !pickup_datetime) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Create offline order
    const { data: order, error } = await supabaseAdmin
      .from("offline_orders")
      .insert({
        customer_id: userId,
        retailer_id,
        product_id,
        quantity,
        total_amount,
        pickup_datetime,
        customer_notes: customer_notes || null,
        status: "scheduled",
      })
      .select(`
        *,
        products (name),
        retailer:retailer_id (name, shop_name),
        customer:customer_id (name, email)
      `)
      .single()

    if (error) {
      console.error("[Offline Orders POST] Error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Create Google Calendar event (placeholder for actual implementation)
    // In production, you would use Google Calendar API here
    const calendarEventId = `offline-order-${order.id}`
    
    // Update order with calendar event ID
    await supabaseAdmin
      .from("offline_orders")
      .update({ google_calendar_event_id: calendarEventId })
      .eq("id", order.id)

    // Send notification to customer
    const pickupDate = new Date(pickup_datetime)
    const notificationContent = `Your offline order for ${order.products.name} is scheduled for pickup on ${pickupDate.toLocaleDateString()} at ${pickupDate.toLocaleTimeString()}. Retailer: ${order.retailer.shop_name || order.retailer.name}`

    // Log notification (actual sending would be handled by notification service)
    await fetch(`${request.nextUrl.origin}/api/notifications`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userId,
        notification_type: "email",
        message_type: "offline_order_scheduled",
        recipient: order.customer.email,
        message_content: notificationContent,
      }),
    }).catch(err => console.error("Notification failed:", err))

    return NextResponse.json({
      success: true,
      order,
      calendar_event_id: calendarEventId,
    })
  } catch (error: any) {
    console.error("[Offline Orders POST] Error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PATCH - Update offline order status
export async function PATCH(request: NextRequest) {
  try {
    const authToken = request.cookies.get("auth-token")?.value
    const accessToken = request.cookies.get("sb-access-token")?.value

    if (!authToken && !accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { order_id, status } = body

    if (!order_id || !status) {
      return NextResponse.json(
        { error: "Order ID and status required" },
        { status: 400 }
      )
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: order, error } = await supabaseAdmin
      .from("offline_orders")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", order_id)
      .select()
      .single()

    if (error) {
      console.error("[Offline Orders PATCH] Error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, order })
  } catch (error: any) {
    console.error("[Offline Orders PATCH] Error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
