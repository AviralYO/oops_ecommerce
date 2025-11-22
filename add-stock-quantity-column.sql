-- Rename quantity column to stock_quantity for consistency
-- First check if quantity column exists and stock_quantity doesn't
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'products' AND column_name = 'quantity')
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'products' AND column_name = 'stock_quantity')
    THEN
        ALTER TABLE products RENAME COLUMN quantity TO stock_quantity;
    END IF;
END $$;

-- If both don't exist, add stock_quantity
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock_quantity INTEGER DEFAULT 0;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock_quantity);
