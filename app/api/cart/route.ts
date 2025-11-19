import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET(request: NextRequest) {
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

    // Get user
    const { data: { user }, error: userError } = await authenticatedSupabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Fetch cart items with product details
    const { data: cartItems, error: cartError } = await authenticatedSupabase
      .from("cart_items")
      .select(`
        *,
        products (
          name,
          price,
          image_url,
          quantity as stock
        )
      `)
      .eq("customer_id", user.id)

    if (cartError) {
      console.error("[Cart] Fetch error:", cartError)
      return NextResponse.json(
        { error: "Failed to fetch cart" },
        { status: 500 }
      )
    }

    return NextResponse.json({ cartItems })
  } catch (error: any) {
    console.error("[Cart] Error:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

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
    const { product_id, quantity } = body

    // Get user
    const { data: { user }, error: userError } = await authenticatedSupabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Check if product exists and is in stock
    const { data: product, error: productError } = await authenticatedSupabase
      .from("products")
      .select("*")
      .eq("id", product_id)
      .single()

    if (productError || !product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      )
    }

    if (product.quantity < quantity) {
      return NextResponse.json(
        { error: "Not enough stock" },
        { status: 400 }
      )
    }

    // Check if item already in cart
    const { data: existingItem } = await authenticatedSupabase
      .from("cart_items")
      .select("*")
      .eq("customer_id", user.id)
      .eq("product_id", product_id)
      .single()

    if (existingItem) {
      // Update quantity
      const { data: updatedItem, error: updateError } = await authenticatedSupabase
        .from("cart_items")
        .update({ quantity: existingItem.quantity + quantity })
        .eq("id", existingItem.id)
        .select()
        .single()

      if (updateError) {
        return NextResponse.json(
          { error: "Failed to update cart" },
          { status: 500 }
        )
      }

      return NextResponse.json({ cartItem: updatedItem })
    } else {
      // Add new item
      const { data: newItem, error: insertError } = await authenticatedSupabase
        .from("cart_items")
        .insert({
          customer_id: user.id,
          product_id,
          quantity,
        })
        .select()
        .single()

      if (insertError) {
        return NextResponse.json(
          { error: "Failed to add to cart" },
          { status: 500 }
        )
      }

      return NextResponse.json({ cartItem: newItem })
    }
  } catch (error: any) {
    console.error("[Cart] Add error:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const itemId = searchParams.get("id")

    if (!itemId) {
      return NextResponse.json(
        { error: "Item ID required" },
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

    // Delete cart item
    const { error: deleteError } = await authenticatedSupabase
      .from("cart_items")
      .delete()
      .eq("id", itemId)
      .eq("customer_id", user.id)

    if (deleteError) {
      console.error("[Cart] Delete error:", deleteError)
      return NextResponse.json(
        { error: "Failed to remove from cart" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[Cart] Error:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
