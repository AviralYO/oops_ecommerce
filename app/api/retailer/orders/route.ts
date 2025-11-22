import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

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

    // Create authenticated Supabase client for user verification
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

    // Check if user is a retailer
    const { data: profile } = await authenticatedSupabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (profile?.role !== "retailer") {
      return NextResponse.json(
        { error: "Only retailers can access this endpoint" },
        { status: 403 }
      )
    }

    // Use service role client to bypass RLS for fetching orders
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

    // Fetch ALL orders with items and products using admin client
    const { data: allOrders, error: ordersError } = await supabaseAdmin
      .from("orders")
      .select(`
        *,
        profiles!orders_customer_id_fkey (
          name,
          email
        ),
        order_items (
          id,
          quantity,
          price_at_purchase,
          products (
            id,
            name,
            image_url,
            retailer_id
          )
        )
      `)
      .order("created_at", { ascending: false })

    console.log("All orders fetched:", allOrders?.length)
    console.log("Sample order:", allOrders?.[0])

    if (ordersError) {
      console.error("Orders fetch error:", ordersError)
      return NextResponse.json(
        { error: "Failed to fetch orders" },
        { status: 500 }
      )
    }

    // Filter to only orders that contain retailer's products
    const filteredOrders = allOrders
      ?.map(order => {
        console.log(`Order ${order.order_number} - items:`, order.order_items?.map((i: any) => ({
          product_id: i.products?.id,
          retailer_id: i.products?.retailer_id,
          matches: i.products?.retailer_id === user.id
        })))
        
        return {
          ...order,
          order_items: order.order_items.filter(
            (item: any) => item.products?.retailer_id === user.id
          ),
        }
      })
      .filter(order => order.order_items.length > 0) // Only keep orders with retailer's products

    console.log("Filtered orders:", filteredOrders?.length)

    return NextResponse.json({ orders: filteredOrders })
  } catch (error) {
    console.error("Retailer orders error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
