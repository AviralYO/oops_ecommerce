import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { z } from "zod"

const createProductSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().min(1, "Description is required"),
  price: z.number().positive("Price must be positive"),
  quantity: z.number().int().nonnegative("Quantity must be non-negative"),
  category: z.string().min(1, "Category is required"),
})

// GET - List all products or filter by retailer
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const retailerId = searchParams.get("retailer_id")
    const category = searchParams.get("category")
    const status = searchParams.get("status")
    const userPincode = searchParams.get("pincode")

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

    // Join with profiles to get retailer pincode
    let query = supabaseAdmin
      .from("products")
      .select(`
        *,
        retailer:retailer_id(id, name, pincode)
      `)

    if (retailerId) {
      query = query.eq("retailer_id", retailerId)
    }
    if (category) {
      query = query.eq("category", category)
    }
    if (status) {
      query = query.eq("status", status)
    }

    const { data: products, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Sort by location if user pincode is provided
    let sortedProducts = products || []
    if (userPincode && sortedProducts.length > 0) {
      sortedProducts = sortedProducts.sort((a: any, b: any) => {
        const aRetailerPincode = a.retailer?.pincode
        const bRetailerPincode = b.retailer?.pincode
        
        // Products from same pincode come first
        const aMatch = aRetailerPincode === userPincode ? 0 : 1
        const bMatch = bRetailerPincode === userPincode ? 0 : 1
        
        if (aMatch !== bMatch) return aMatch - bMatch
        
        // Then sort by created date
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      })
    } else {
      // Default sort by created date
      sortedProducts.sort((a: any, b: any) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
    }

    return NextResponse.json({ products: sortedProducts }, { status: 200 })
  } catch (error) {
    console.error("[Products] GET error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST - Create new product
export async function POST(request: NextRequest) {
  try {
    // Get user from session
    const accessToken = request.cookies.get("sb-access-token")?.value
    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Create authenticated Supabase client with user's access token
    const { createClient } = require('@supabase/supabase-js')
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

    // Check if user is a retailer
    const { data: profile } = await authenticatedSupabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (!profile || profile.role !== "retailer") {
      return NextResponse.json({ error: "Only retailers can create products" }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = createProductSchema.parse(body)

    // Determine status based on quantity
    let status: "in-stock" | "low-stock" | "out-of-stock" = "out-of-stock"
    if (validatedData.quantity > 10) {
      status = "in-stock"
    } else if (validatedData.quantity > 0) {
      status = "low-stock"
    }

    // Create product in database using authenticated client
    const { data: product, error } = await authenticatedSupabase
      .from("products")
      .insert({
        ...validatedData,
        retailer_id: user.id,
        status,
      })
      .select()
      .single()

    if (error) {
      console.error("[Products] Insert error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ product }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    console.error("[Products] POST error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PATCH - Update product
export async function PATCH(request: NextRequest) {
  try {
    // Get user from session
    const accessToken = request.cookies.get("sb-access-token")?.value
    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Create authenticated Supabase client
    const { createClient } = require('@supabase/supabase-js')
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
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: "Product ID required" }, { status: 400 })
    }

    // Check if product belongs to user
    const { data: product } = await authenticatedSupabase
      .from("products")
      .select("retailer_id")
      .eq("id", id)
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
      .eq("id", id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ product: updatedProduct }, { status: 200 })
  } catch (error) {
    console.error("[Products] PATCH error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE - Delete product
export async function DELETE(request: NextRequest) {
  try {
    // Get user from session
    const accessToken = request.cookies.get("sb-access-token")?.value
    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Create authenticated Supabase client
    const { createClient } = require('@supabase/supabase-js')
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

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Product ID required" }, { status: 400 })
    }

    // Check if product belongs to user
    const { data: product } = await authenticatedSupabase
      .from("products")
      .select("retailer_id, image_url")
      .eq("id", id)
      .single()

    if (!product || product.retailer_id !== user.id) {
      return NextResponse.json({ error: "Product not found or unauthorized" }, { status: 404 })
    }

    // Delete image from storage if exists
    if (product.image_url) {
      const imagePath = product.image_url.split("/").pop()
      if (imagePath) {
        await authenticatedSupabase.storage.from("product-images").remove([`${user.id}/${imagePath}`])
      }
    }

    // Delete product using authenticated client
    const { error } = await authenticatedSupabase.from("products").delete().eq("id", id)

    if (error) {
      console.error("[Products] Delete error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: "Product deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("[Products] DELETE error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
