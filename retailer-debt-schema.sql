-- Add debit tracking for retailer-wholesaler transactions
-- This tracks how much money retailers owe to wholesalers

-- Create retailer_debts table to track outstanding amounts
CREATE TABLE IF NOT EXISTS retailer_debts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  retailer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  wholesaler_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  debit_amount DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (debit_amount >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(retailer_id, wholesaler_id)
);

-- Add source tracking to products table (to distinguish retailer vs wholesaler products)
ALTER TABLE products ADD COLUMN IF NOT EXISTS source_type VARCHAR(20) DEFAULT 'retailer' CHECK (source_type IN ('retailer', 'wholesaler'));
ALTER TABLE products ADD COLUMN IF NOT EXISTS wholesaler_price DECIMAL(10, 2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS retail_price DECIMAL(10, 2);

-- For existing products, set prices appropriately
UPDATE products SET retail_price = price WHERE retail_price IS NULL;
UPDATE products SET source_type = 'wholesaler' WHERE retailer_id IN (
  SELECT id FROM profiles WHERE role = 'wholesaler'
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_retailer_debts_retailer ON retailer_debts(retailer_id);
CREATE INDEX IF NOT EXISTS idx_retailer_debts_wholesaler ON retailer_debts(wholesaler_id);
CREATE INDEX IF NOT EXISTS idx_products_source_type ON products(source_type);

-- Create updated_at trigger for retailer_debts
CREATE TRIGGER update_retailer_debts_updated_at BEFORE UPDATE ON retailer_debts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Disable RLS for retailer_debts (using service role key)
ALTER TABLE retailer_debts DISABLE ROW LEVEL SECURITY;

-- Function to update debit amount when wholesale order is created
CREATE OR REPLACE FUNCTION update_retailer_debt_on_wholesale_order()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert or update the debit amount for this retailer-wholesaler pair
  INSERT INTO retailer_debts (retailer_id, wholesaler_id, debit_amount)
  VALUES (NEW.retailer_id, NEW.wholesaler_id, NEW.total_amount)
  ON CONFLICT (retailer_id, wholesaler_id)
  DO UPDATE SET 
    debit_amount = retailer_debts.debit_amount + NEW.total_amount,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update debt when wholesale order is created
DROP TRIGGER IF EXISTS trigger_update_retailer_debt ON wholesale_orders;
CREATE TRIGGER trigger_update_retailer_debt
AFTER INSERT ON wholesale_orders
FOR EACH ROW
EXECUTE FUNCTION update_retailer_debt_on_wholesale_order();

-- Function to reduce wholesaler stock when wholesale order is confirmed
CREATE OR REPLACE FUNCTION reduce_wholesaler_stock_on_order()
RETURNS TRIGGER AS $$
BEGIN
  -- Only reduce stock when order status changes to 'confirmed'
  IF NEW.status = 'confirmed' AND (OLD.status IS NULL OR OLD.status != 'confirmed') THEN
    -- Reduce stock for all items in this order
    UPDATE products p
    SET 
      quantity = p.quantity - woi.quantity,
      status = CASE
        WHEN p.quantity - woi.quantity <= 0 THEN 'out-of-stock'
        WHEN p.quantity - woi.quantity < 10 THEN 'low-stock'
        ELSE 'in-stock'
      END
    FROM wholesale_order_items woi
    WHERE woi.order_id = NEW.id AND p.id = woi.product_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically reduce stock when wholesale order is confirmed
DROP TRIGGER IF EXISTS trigger_reduce_wholesaler_stock ON wholesale_orders;
CREATE TRIGGER trigger_reduce_wholesaler_stock
AFTER INSERT OR UPDATE ON wholesale_orders
FOR EACH ROW
EXECUTE FUNCTION reduce_wholesaler_stock_on_order();
