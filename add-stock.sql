-- Update all products to have stock
UPDATE products SET stock_quantity = 100 WHERE stock_quantity = 0 OR stock_quantity IS NULL;

-- Verify the update
SELECT id, name, stock_quantity FROM products LIMIT 10;
