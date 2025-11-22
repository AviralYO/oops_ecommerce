-- Fix RLS policies to allow retailers to see orders with their products
-- Run this in Supabase SQL Editor

-- 1. Fix orders table policy
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
DROP POLICY IF EXISTS "Users can view relevant orders" ON orders;

CREATE POLICY "Users can view relevant orders" ON orders 
FOR SELECT 
USING (
  -- Customer can see their own orders
  auth.uid() = customer_id
  OR
  -- Retailer can see orders containing their products
  EXISTS (
    SELECT 1 FROM order_items oi
    JOIN products p ON p.id = oi.product_id
    WHERE oi.order_id = orders.id
    AND p.retailer_id = auth.uid()
  )
);

-- 2. Ensure order_items can be read by customers and retailers
DROP POLICY IF EXISTS "Users can view order items" ON order_items;

CREATE POLICY "Users can view order items" ON order_items
FOR SELECT
USING (
  -- Customer can see items in their orders
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_items.order_id
    AND orders.customer_id = auth.uid()
  )
  OR
  -- Retailer can see items for their products
  EXISTS (
    SELECT 1 FROM products
    WHERE products.id = order_items.product_id
    AND products.retailer_id = auth.uid()
  )
);

-- 3. Ensure products can be read by everyone (needed for order display)
DROP POLICY IF EXISTS "Products are viewable by everyone" ON products;
DROP POLICY IF EXISTS "Anyone can view products" ON products;

CREATE POLICY "Anyone can view products" ON products
FOR SELECT
USING (true);
