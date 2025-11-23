import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// GET - Fetch retailer debts
export async function GET(request: NextRequest) {
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

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") // 'retailer' or 'wholesaler'

    let query = supabaseAdmin
      .from("retailer_debts")
      .select(`
        *,
        retailer:retailer_id(id, email, name),
        wholesaler:wholesaler_id(id, email, name)
      `)

    if (type === "retailer") {
      query = query.eq("retailer_id", user.id)
    } else if (type === "wholesaler") {
      query = query.eq("wholesaler_id", user.id)
    }

    const { data: debts, error } = await query

    if (error) {
      console.error("[Retailer Debts GET] Error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ debts: debts || [] })
  } catch (error: any) {
    console.error("[Retailer Debts GET] Exception:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

// PATCH - Pay off debt (reduce debit amount)
export async function PATCH(request: NextRequest) {
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
    const { wholesaler_id, payment_amount } = body

    if (!wholesaler_id || !payment_amount || payment_amount <= 0) {
      return NextResponse.json(
        { error: "Wholesaler ID and valid payment amount required" },
        { status: 400 }
      )
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    // Get current debt
    const { data: currentDebt, error: fetchError } = await supabaseAdmin
      .from("retailer_debts")
      .select("*")
      .eq("retailer_id", user.id)
      .eq("wholesaler_id", wholesaler_id)
      .single()

    if (fetchError || !currentDebt) {
      return NextResponse.json(
        { error: "Debt record not found" },
        { status: 404 }
      )
    }

    // Calculate new debt amount
    const newDebitAmount = Math.max(0, currentDebt.debit_amount - payment_amount)

    // Update debt
    const { data: updatedDebt, error: updateError } = await supabaseAdmin
      .from("retailer_debts")
      .update({ debit_amount: newDebitAmount })
      .eq("retailer_id", user.id)
      .eq("wholesaler_id", wholesaler_id)
      .select()
      .single()

    if (updateError) {
      console.error("[Retailer Debts PATCH] Error:", updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ debt: updatedDebt })
  } catch (error: any) {
    console.error("[Retailer Debts PATCH] Exception:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}
