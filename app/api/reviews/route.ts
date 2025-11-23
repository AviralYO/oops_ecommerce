import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// GET - Fetch reviews for a product
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get("product_id")

    if (!productId) {
      return NextResponse.json({ error: "Product ID required" }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: reviews, error } = await supabase
      .from("product_reviews")
      .select(`
        *,
        profiles:customer_id (
          name,
          email
        )
      `)
      .eq("product_id", productId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[Reviews GET] Error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ reviews: reviews || [] })
  } catch (error: any) {
    console.error("[Reviews GET] Error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Submit a review
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
    const { product_id, rating, review_text, order_id } = body

    if (!product_id || !rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Product ID and valid rating (1-5) required" },
        { status: 400 }
      )
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Check if user already reviewed this product for this order
    const { data: existingReview } = await supabaseAdmin
      .from("product_reviews")
      .select("id")
      .eq("customer_id", userId)
      .eq("product_id", product_id)
      .eq("order_id", order_id || "")
      .single()

    if (existingReview) {
      return NextResponse.json(
        { error: "You have already reviewed this product" },
        { status: 400 }
      )
    }

    // Insert review
    const { data: review, error } = await supabaseAdmin
      .from("product_reviews")
      .insert({
        product_id,
        customer_id: userId,
        order_id: order_id || null,
        rating,
        review_text: review_text || null,
      })
      .select()
      .single()

    if (error) {
      console.error("[Reviews POST] Error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, review })
  } catch (error: any) {
    console.error("[Reviews POST] Error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
