-- Migration: Add missing order_number column to orders table
-- Run this in Supabase SQL Editor

-- Check if column exists and add it if it doesn't
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'order_number'
    ) THEN
        ALTER TABLE orders ADD COLUMN order_number TEXT UNIQUE;
        
        -- Update existing rows with generated order numbers
        UPDATE orders 
        SET order_number = 'ORD-' || EXTRACT(EPOCH FROM created_at)::bigint || '-' || SUBSTRING(id::text FROM 1 FOR 5)
        WHERE order_number IS NULL;
        
        -- Make it NOT NULL after populating
        ALTER TABLE orders ALTER COLUMN order_number SET NOT NULL;
        
        RAISE NOTICE 'order_number column added successfully';
    ELSE
        RAISE NOTICE 'order_number column already exists';
    END IF;
END $$;
