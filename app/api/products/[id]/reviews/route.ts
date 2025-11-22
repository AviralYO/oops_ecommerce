import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data: reviews, error } = await supabase
      .from("product_reviews")
      .select(`
        *,
        profiles (
          name
        )
      `)
      .eq("product_id", params.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[Reviews] Fetch error:", error)
      return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 })
    }

    return NextResponse.json({ reviews })
  } catch (error: any) {
    console.error("[Reviews] Error:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authToken = request.cookies.get("auth-token")?.value
    const accessToken = request.cookies.get("sb-access-token")?.value

    if (!authToken && !accessToken) {
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

    const body = await request.json()
    const { rating, comment, order_id } = body

    // Check if user has purchased this product
    const { data: orderItem, error: orderError } = await authenticatedSupabase
      .from("order_items")
      .select("orders(customer_id)")
      .eq("product_id", params.id)
      .eq("order_id", order_id)
      .single()

    if (orderError || !orderItem) {
      return NextResponse.json(
        { error: "You can only review products you've purchased" },
        { status: 403 }
      )
    }

    // Create review
    const { data: review, error: reviewError } = await authenticatedSupabase
      .from("product_reviews")
      .insert({
        product_id: params.id,
        user_id: user.id,
        order_id,
        rating,
        comment,
      })
      .select()
      .single()

    if (reviewError) {
      console.error("[Review] Create error:", reviewError)
      return NextResponse.json({ error: "Failed to create review" }, { status: 500 })
    }

    return NextResponse.json({ review })
  } catch (error: any) {
    console.error("[Review] Error:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
