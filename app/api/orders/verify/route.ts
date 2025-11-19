import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: NextRequest) {
  try {
    const accessToken = request.cookies.get("sb-access-token")?.value

    if (!accessToken) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
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

    const body = await request.json()
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderDetails,
    } = body

    // Verify signature
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex")

    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json(
        { error: "Invalid payment signature" },
        { status: 400 }
      )
    }

    // Get user
    const { data: { user }, error: userError } = await authenticatedSupabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Create order in database
    const { data: order, error: orderError } = await authenticatedSupabase
      .from("orders")
      .insert({
        customer_id: user.id,
        total_amount: orderDetails.total_amount,
        shipping_address: orderDetails.shipping_address,
        status: "confirmed",
        payment_id: razorpay_payment_id,
        payment_status: "completed",
      })
      .select()
      .single()

    if (orderError) {
      console.error("[Order Verify] Order creation error:", orderError)
      return NextResponse.json(
        { error: "Failed to create order" },
        { status: 500 }
      )
    }

    // Create order items
    const orderItems = orderDetails.items.map((item: any) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price_at_purchase: item.price,
    }))

    const { error: itemsError } = await authenticatedSupabase
      .from("order_items")
      .insert(orderItems)

    if (itemsError) {
      console.error("[Order Verify] Order items error:", itemsError)
      // Order created but items failed - still return success
    }

    // Clear cart items
    const { error: clearCartError } = await authenticatedSupabase
      .from("cart_items")
      .delete()
      .eq("customer_id", user.id)

    if (clearCartError) {
      console.error("[Order Verify] Clear cart error:", clearCartError)
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      message: "Payment verified and order created successfully",
    })
  } catch (error: any) {
    console.error("[Order Verify] Error:", error)
    return NextResponse.json(
      { error: error.message || "Payment verification failed" },
      { status: 500 }
    )
  }
}
