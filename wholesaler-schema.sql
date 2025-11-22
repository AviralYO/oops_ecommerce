-- Create wholesaler_connections table
CREATE TABLE IF NOT EXISTS wholesaler_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  retailer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  wholesaler_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(retailer_id, wholesaler_id)
);

-- Create wholesale_orders table
CREATE TABLE IF NOT EXISTS wholesale_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  retailer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  wholesaler_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  total_amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create wholesale_order_items table
CREATE TABLE IF NOT EXISTS wholesale_order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES wholesale_orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price_at_purchase DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_wholesaler_connections_retailer ON wholesaler_connections(retailer_id);
CREATE INDEX IF NOT EXISTS idx_wholesaler_connections_wholesaler ON wholesaler_connections(wholesaler_id);
CREATE INDEX IF NOT EXISTS idx_wholesale_orders_retailer ON wholesale_orders(retailer_id);
CREATE INDEX IF NOT EXISTS idx_wholesale_orders_wholesaler ON wholesale_orders(wholesaler_id);
CREATE INDEX IF NOT EXISTS idx_wholesale_order_items_order ON wholesale_order_items(order_id);

-- Disable RLS for these tables (since we're using service role key)
ALTER TABLE wholesaler_connections DISABLE ROW LEVEL SECURITY;
ALTER TABLE wholesale_orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE wholesale_order_items DISABLE ROW LEVEL SECURITY;
