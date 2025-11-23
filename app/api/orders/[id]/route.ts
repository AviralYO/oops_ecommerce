import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { sendOrderConfirmedSMS } from "@/lib/sms-notifications"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authToken = request.cookies.get("auth-token")?.value
    const accessToken = request.cookies.get("sb-access-token")?.value

    if (!authToken && !accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: orderId } = await params

    let userId: string

    if (authToken) {
      // OTP-based auth
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
        return NextResponse.json({ error: "User not found" }, { status: 404 })
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

    // Fetch order with items and tracking
    const { data: order, error: orderError } = await supabaseAdmin
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
          email
        )
      `)
      .eq("id", orderId)
      .eq("customer_id", userId)
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check for OTP auth token first
    const authToken = request.cookies.get("auth-token")?.value
    const accessToken = request.cookies.get("sb-access-token")?.value

    if (!authToken && !accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: orderId } = await params

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

    // Use admin client for full access
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

    // Update order status
    const { data: order, error: updateError } = await supabaseAdmin
      .from("orders")
      .update({
        status,
        tracking_number,
        delivery_date,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)
      .select()
      .single()

    if (updateError) {
      console.error("[Order] Update error:", updateError)
      return NextResponse.json({ error: "Failed to update order" }, { status: 500 })
    }

    // Send SMS notification when order is confirmed
    if (status === "confirmed" && order) {
      const { data: customerProfile } = await supabaseAdmin
        .from("profiles")
        .select("name, email")
        .eq("id", order.customer_id)
        .single()

      if (customerProfile) {
        // Extract phone from email if it's a temp email (phone signup)
        let customerPhone = ""
        if (customerProfile.email.includes("@temp.livemart.com")) {
          customerPhone = customerProfile.email.replace("@temp.livemart.com", "")
        }

        if (customerPhone) {
          const estimatedDelivery = delivery_date 
            ? new Date(delivery_date).toLocaleDateString('en-IN', { 
                day: 'numeric', 
                month: 'short', 
                year: 'numeric' 
              })
            : undefined

          sendOrderConfirmedSMS({
            customerPhone,
            customerName: customerProfile.name,
            orderId: order.order_number,
            estimatedDelivery,
          }).catch(err => console.error("[Order Update] SMS failed:", err))
        }
      }
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
