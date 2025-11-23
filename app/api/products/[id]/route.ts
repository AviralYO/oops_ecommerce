import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// PATCH - Update individual product
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get user from session
    const authToken = request.cookies.get("auth-token")?.value
    const accessToken = request.cookies.get("sb-access-token")?.value
    if (!authToken && !accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Create authenticated Supabase client
    const authenticatedSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      }
    )

    const { data: { user } } = await authenticatedSupabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const updates: any = {}

    // Map the incoming fields to database columns
    if (body.wholesale_price !== undefined) updates.wholesaler_price = body.wholesale_price
    if (body.retail_price !== undefined) updates.retail_price = body.retail_price
    if (body.wholesaler_price !== undefined) updates.wholesaler_price = body.wholesaler_price
    if (body.price !== undefined) updates.price = body.price
    if (body.quantity !== undefined) updates.quantity = body.quantity
    if (body.stock_quantity !== undefined) updates.quantity = body.stock_quantity
    if (body.name !== undefined) updates.name = body.name
    if (body.description !== undefined) updates.description = body.description
    if (body.category !== undefined) updates.category = body.category

    // Check if product belongs to user
    const { data: product } = await authenticatedSupabase
      .from("products")
      .select("retailer_id")
      .eq("id", params.id)
      .single()

    if (!product || product.retailer_id !== user.id) {
      return NextResponse.json({ error: "Product not found or unauthorized" }, { status: 404 })
    }

    // Update status if quantity is being updated
    if (updates.quantity !== undefined) {
      if (updates.quantity > 10) {
        updates.status = "in-stock"
      } else if (updates.quantity > 0) {
        updates.status = "low-stock"
      } else {
        updates.status = "out-of-stock"
      }
    }

    // Update product using authenticated client
    const { data: updatedProduct, error } = await authenticatedSupabase
      .from("products")
      .update(updates)
      .eq("id", params.id)
      .select()
      .single()

    if (error) {
      console.error("[Products] Update error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ product: updatedProduct })
  } catch (error) {
    console.error("[Products PATCH] Exception:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE - Delete individual product
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get user from session
    const authToken = request.cookies.get("auth-token")?.value
    const accessToken = request.cookies.get("sb-access-token")?.value
    if (!authToken && !accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Create authenticated Supabase client
    const authenticatedSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      }
    )

    const { data: { user } } = await authenticatedSupabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if product belongs to user
    const { data: product } = await authenticatedSupabase
      .from("products")
      .select("retailer_id")
      .eq("id", params.id)
      .single()

    if (!product || product.retailer_id !== user.id) {
      return NextResponse.json({ error: "Product not found or unauthorized" }, { status: 404 })
    }

    // Delete product using authenticated client
    const { error } = await authenticatedSupabase
      .from("products")
      .delete()
      .eq("id", params.id)

    if (error) {
      console.error("[Products] Delete error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: "Product deleted successfully" })
  } catch (error) {
    console.error("[Products DELETE] Exception:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
