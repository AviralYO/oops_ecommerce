# IMPORTANT: Run This SQL in Supabase FIRST!

Before using the new wholesaler-retailer system, you MUST run this SQL in your Supabase database.

## How to Run:

1. Go to https://supabase.com/dashboard
2. Select your project
3. Click **SQL Editor** in left sidebar
4. Click **New query**
5. Copy and paste the ENTIRE content of `retailer-debt-schema.sql`
6. Click **Run** button (or press Ctrl+Enter)

## What This Does:

✅ Creates `retailer_debts` table (tracks amounts owed)
✅ Adds `source_type` column to products (wholesaler vs retailer)
✅ Adds `wholesaler_price` column to products
✅ Adds `retail_price` column to products
✅ Sets up triggers for automatic debt tracking
✅ Sets up triggers for automatic stock reduction

## After Running:

The system will automatically:
- Track retailer debts when orders are placed
- Reduce wholesaler stock when orders are confirmed
- Show retail prices to customers
- Show wholesale prices to retailers

## Verification:

After running the SQL, verify in Supabase:
1. Go to **Table Editor**
2. Check that `retailer_debts` table exists
3. Check `products` table has new columns: `source_type`, `wholesaler_price`, `retail_price`
4. Check **Database** → **Triggers** shows the new triggers

## If You Get Errors:

- "relation already exists" = Already run, ignore
- "column already exists" = Already run, ignore
- "function does not exist" = Run `supabase-schema.sql` first
- Any other error = Contact support

---

⚠️ **DO NOT SKIP THIS STEP** - The app will have errors without these database changes!
