import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// GET - Fetch wholesale orders
export async function GET(request: NextRequest) {
  try {
    const authToken = request.cookies.get("auth-token")?.value
    const accessToken = request.cookies.get("sb-access-token")?.value

    if (!authToken && !accessToken) {
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
      .from("wholesale_orders")
      .select(`
        *,
        wholesale_order_items(*, products(*)),
        retailer:retailer_id(id, email, name),
        wholesaler:wholesaler_id(id, email, name)
      `)
      .order("created_at", { ascending: false })

    if (type === "retailer") {
      query = query.eq("retailer_id", user.id)
    } else if (type === "wholesaler") {
      query = query.eq("wholesaler_id", user.id)
    }

    const { data: orders, error } = await query

    if (error) {
      console.error("[Wholesale Orders GET] Error:", error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ orders: orders || [] })
  } catch (error: any) {
    console.error("[Wholesale Orders GET] Exception:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

// POST - Create a wholesale order
export async function POST(request: NextRequest) {
  try {
    const authToken = request.cookies.get("auth-token")?.value
    const accessToken = request.cookies.get("sb-access-token")?.value

    if (!authToken && !accessToken) {
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
    const { wholesaler_id, items, total_amount } = body

    if (!wholesaler_id || !items || items.length === 0) {
      return NextResponse.json(
        { error: "Wholesaler ID and items required" },
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

    // Generate order number
    const orderNumber = `WO-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    // Create order
    const { data: order, error: orderError } = await supabaseAdmin
      .from("wholesale_orders")
      .insert({
        order_number: orderNumber,
        retailer_id: user.id,
        wholesaler_id,
        total_amount,
        status: "pending"
      })
      .select()
      .single()

    if (orderError) {
      console.error("[Wholesale Orders POST] Error:", orderError)
      return NextResponse.json(
        { error: orderError.message },
        { status: 500 }
      )
    }

    // Create order items
    const orderItems = items.map((item: any) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price_at_purchase: item.price
    }))

    const { error: itemsError } = await supabaseAdmin
      .from("wholesale_order_items")
      .insert(orderItems)

    if (itemsError) {
      console.error("[Wholesale Orders POST] Items Error:", itemsError)
      return NextResponse.json(
        { error: itemsError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ order })
  } catch (error: any) {
    console.error("[Wholesale Orders POST] Exception:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
