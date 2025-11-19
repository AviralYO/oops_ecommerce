import { NextRequest, NextResponse } from "next/server"
import Razorpay from "razorpay"

export async function POST(request: NextRequest) {
  try {
    const accessToken = request.cookies.get("sb-access-token")?.value

    if (!accessToken) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { amount, currency, receipt } = body

    // Validate input
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid amount" },
        { status: 400 }
      )
    }

    // Initialize Razorpay
    const razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    })

    // Create Razorpay order
    const options = {
      amount: amount * 100, // Razorpay expects amount in paise
      currency: currency || "INR",
      receipt: receipt || `receipt_${Date.now()}`,
    }

    const order = await razorpay.orders.create(options)

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    })
  } catch (error: any) {
    console.error("[Order Create] Error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to create order" },
      { status: 500 }
    )
  }
}
