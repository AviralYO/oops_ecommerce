import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { sendOrderPlacedSMS } from "@/lib/sms-notifications"

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { 
      total_amount, 
      gst_amount, 
      shipping_amount = 0, 
      shipping_address, 
      payment_details,
      delivery_method = 'delivery',
      pickup_datetime = null,
      items 
    } = body

    if (!total_amount || !shipping_address || !items || items.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields" },
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

    // Use service role client for database operations
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

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`

    // Check stock availability before creating order
    for (const item of items) {
      const { data: product, error: productError } = await supabaseAdmin
        .from("products")
        .select("quantity, name")
        .eq("id", item.product_id)
        .single()

      console.log(`[Stock Check] Product ID: ${item.product_id}, Product:`, product, "Error:", productError)

      if (!product || product.quantity < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${product?.name || 'product'}. Only ${product?.quantity || 0} available. Requested: ${item.quantity}` },
          { status: 400 }
        )
      }
    }

    // Create order
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({
        order_number: orderNumber,
        customer_id: userId,
        total_amount,
        gst_amount: gst_amount || 0,
        shipping_amount,
        status: "pending",
        shipping_address,
        payment_details: payment_details || null,
      })
      .select()
      .single()

    if (orderError) {
      console.error("Order creation error:", orderError)
      return NextResponse.json(
        { error: "Failed to create order", details: orderError.message, code: orderError.code },
        { status: 500 }
      )
    }

    // Create order items
    const orderItems = items.map((item: any) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price_at_purchase: item.price,
    }))

    const { error: itemsError } = await supabaseAdmin
      .from("order_items")
      .insert(orderItems)

    if (itemsError) {
      console.error("Order items creation error:", itemsError)
      // Rollback order creation
      await supabaseAdmin.from("orders").delete().eq("id", order.id)
      return NextResponse.json(
        { error: "Failed to create order items", details: itemsError.message, code: itemsError.code },
        { status: 500 }
      )
    }

    // Reduce stock quantity for each ordered product
    for (const item of items) {
      const { data: product } = await supabaseAdmin
        .from("products")
        .select("quantity")
        .eq("id", item.product_id)
        .single()

      if (product && product.quantity >= item.quantity) {
        const newQuantity = product.quantity - item.quantity
        let newStatus = "out-of-stock"
        if (newQuantity > 10) {
          newStatus = "in-stock"
        } else if (newQuantity > 0) {
          newStatus = "low-stock"
        }
        
        await supabaseAdmin
          .from("products")
          .update({ 
            quantity: newQuantity,
            status: newStatus
          })
          .eq("id", item.product_id)
      }
    }

    // If pickup order, create offline_orders records
    if (delivery_method === 'pickup' && pickup_datetime) {
      for (const item of items) {
        // Get retailer_id from product
        const { data: product } = await supabaseAdmin
          .from("products")
          .select("retailer_id")
          .eq("id", item.product_id)
          .single()

        if (product) {
          await supabaseAdmin
            .from("offline_orders")
            .insert({
              customer_id: userId,
              retailer_id: product.retailer_id,
              product_id: item.product_id,
              quantity: item.quantity,
              total_amount: item.price * item.quantity,
              pickup_datetime,
              status: 'scheduled',
              customer_notes: `Order #${orderNumber}`,
            })
        }
      }
    }

    // Clear cart
    await supabaseAdmin
      .from("cart_items")
      .delete()
      .eq("customer_id", userId)

    // Get customer profile for SMS notification
    const { data: customerProfile } = await supabaseAdmin
      .from("profiles")
      .select("name, email")
      .eq("id", userId)
      .single()

    // Send SMS notification (don't block response if SMS fails)
    if (customerProfile) {
      // Extract phone from email if it's a temp email (phone signup)
      let customerPhone = ""
      if (customerProfile.email.includes("@temp.livemart.com")) {
        customerPhone = customerProfile.email.replace("@temp.livemart.com", "")
      }

      if (customerPhone) {
        sendOrderPlacedSMS({
          customerPhone,
          customerName: customerProfile.name,
          orderId: orderNumber,
          totalAmount: total_amount,
          itemCount: items.length,
        }).catch(err => console.error("[Order Place] SMS failed:", err))
      }
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        order_number: orderNumber,
        status: order.status,
      },
    })
  } catch (error) {
    console.error("Place order error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
