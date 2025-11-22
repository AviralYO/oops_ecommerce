-- Add payment_details column to orders table to store payment information
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_details JSONB;

-- Add comment to explain the column
COMMENT ON COLUMN orders.payment_details IS 'Stores payment method and transaction details in JSON format';
