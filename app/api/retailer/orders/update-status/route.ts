import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function PATCH(request: NextRequest) {
  try {
    const authToken = request.cookies.get("auth-token")?.value
    const accessToken = request.cookies.get("sb-access-token")?.value

    if (!authToken && !accessToken) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { order_id, status, comment } = body

    if (!order_id || !status) {
      return NextResponse.json(
        { error: "Missing order_id or status" },
        { status: 400 }
      )
    }

    const validStatuses = ["pending", "confirmed", "shipped", "delivered", "cancelled"]
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      )
    }

    // Create authenticated Supabase client
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

    // Get user
    const { data: { user }, error: userError } = await authenticatedSupabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
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

    // Check if user is a retailer
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (profile?.role !== "retailer") {
      return NextResponse.json(
        { error: "Only retailers can update order status" },
        { status: 403 }
      )
    }

    // Verify that the order contains retailer's products
    const { data: orderItems } = await supabaseAdmin
      .from("order_items")
      .select(`
        id,
        products (
          retailer_id
        )
      `)
      .eq("order_id", order_id)

    const hasRetailerProducts = orderItems?.some(
      (item: any) => item.products?.retailer_id === user.id
    )

    if (!hasRetailerProducts) {
      return NextResponse.json(
        { error: "You can only update orders containing your products" },
        { status: 403 }
      )
    }

    // Update order status
    const { data: updatedOrder, error: updateError } = await supabaseAdmin
      .from("orders")
      .update({ 
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", order_id)
      .select()
      .single()

    if (updateError) {
      console.error("Order update error:", updateError)
      return NextResponse.json(
        { error: "Failed to update order status" },
        { status: 500 }
      )
    }

    // Add status history entry with comment
    if (comment) {
      await supabaseAdmin
        .from("order_status_history")
        .insert({
          order_id,
          status,
          comment,
          created_by: user.id,
        })
    }

    // Send notification to customer about status update
    const { data: customer } = await supabaseAdmin
      .from("profiles")
      .select("name, email")
      .eq("id", updatedOrder.customer_id)
      .single()

    if (customer) {
      const statusMessages: Record<string, string> = {
        confirmed: "Your order has been confirmed and is being prepared.",
        shipped: "Your order has been shipped and is on its way!",
        delivered: "Your order has been delivered. Thank you for shopping with us!",
        cancelled: "Your order has been cancelled."
      }

      const message = statusMessages[status] || `Your order status has been updated to ${status}`

      // Send email notification
      fetch(`${request.nextUrl.origin}/api/notifications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: updatedOrder.customer_id,
          notification_type: "email",
          message_type: `order_${status}`,
          recipient: customer.email,
          message_content: `Hi ${customer.name}, ${message} Order #${updatedOrder.order_number}`,
        }),
      }).catch(err => console.error("Email notification failed:", err))

      // Send SMS notification if phone available
      if (customer.email.includes("@temp.livemart.com")) {
        const phone = customer.email.replace("@temp.livemart.com", "")
        fetch(`${request.nextUrl.origin}/api/notifications`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: updatedOrder.customer_id,
            notification_type: "sms",
            message_type: `order_${status}`,
            recipient: phone,
            message_content: `${message} Order #${updatedOrder.order_number}`,
          }),
        }).catch(err => console.error("SMS notification failed:", err))
      }
    }

    return NextResponse.json({
      success: true,
      order: updatedOrder,
    })
  } catch (error) {
    console.error("Update order status error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
