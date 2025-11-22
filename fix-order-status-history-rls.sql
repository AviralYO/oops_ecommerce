-- Fix RLS policy for order_status_history to allow triggers to insert
-- Run this in Supabase SQL Editor

-- Drop the restrictive INSERT policy
DROP POLICY IF EXISTS "Retailers can create status history for their orders" ON order_status_history;

-- Create a more permissive policy that allows inserts for order owners
CREATE POLICY "Allow insert status history for order owners" ON order_status_history 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = order_status_history.order_id 
    AND orders.customer_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM orders o
    JOIN order_items oi ON oi.order_id = o.id
    JOIN products p ON p.id = oi.product_id
    WHERE o.id = order_status_history.order_id 
    AND p.retailer_id = auth.uid()
  )
);

-- Alternative: Disable RLS for the trigger function context
-- This allows the trigger to bypass RLS when creating initial status
ALTER TABLE order_status_history DISABLE ROW LEVEL SECURITY;

-- Or better: Recreate the trigger function with SECURITY DEFINER
DROP TRIGGER IF EXISTS on_order_created ON orders;
DROP FUNCTION IF EXISTS create_initial_order_status();

CREATE OR REPLACE FUNCTION create_initial_order_status()
RETURNS TRIGGER 
SECURITY DEFINER -- This runs as the function owner, bypassing RLS
SET search_path = public
AS $$
BEGIN
  INSERT INTO order_status_history (order_id, status, comment, created_by)
  VALUES (NEW.id, NEW.status, 'Order placed', NEW.customer_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_order_created
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION create_initial_order_status();

-- Re-enable RLS
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;
