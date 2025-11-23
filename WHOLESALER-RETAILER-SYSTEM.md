# Wholesaler-Retailer System Update

## Overview
This update implements a complete wholesaler-retailer ordering system with automatic stock management and debt tracking.

## New Features

### 1. **Retailer Debt Tracking**
- **New Table**: `retailer_debts`
- Tracks how much money retailers owe to each wholesaler
- Automatically updates when wholesale orders are placed
- Viewable by both retailers and wholesalers

### 2. **Product Source Tracking**
- **New Column**: `source_type` in `products` table
  - `'retailer'` - Products created by retailers for customer sales
  - `'wholesaler'` - Products created by wholesalers for B2B sales
- **New Columns**: 
  - `wholesaler_price` - Price wholesalers sell to retailers
  - `retail_price` - Suggested price for end customers

### 3. **Automatic Stock Reduction**
- When wholesaler confirms an order (`status` = `'confirmed'`)
- Database trigger automatically reduces product quantities
- Updates product status (in-stock/low-stock/out-of-stock)

### 4. **Automatic Debt Accumulation**
- When retailer places wholesale order
- Database trigger automatically adds amount to `retailer_debts`
- Cumulative tracking per retailer-wholesaler pair

## Database Changes

### Run These Migration Files:
1. `retailer-debt-schema.sql` - Main migration file with:
   - `retailer_debts` table
   - Product table columns (source_type, wholesaler_price, retail_price)
   - Database triggers for automatic updates

## API Endpoints

### Retailer Debts
- **GET** `/api/retailer-debts?type=retailer` - View debts as retailer
- **GET** `/api/retailer-debts?type=wholesaler` - View debts owed to you
- **PATCH** `/api/retailer-debts` - Make payment to reduce debt
  ```json
  {
    "wholesaler_id": "uuid",
    "payment_amount": 1000.00
  }
  ```

### Wholesale Orders
- **GET** `/api/wholesale-orders?type=retailer` - View orders placed
- **GET** `/api/wholesale-orders?type=wholesaler` - View orders received
- **POST** `/api/wholesale-orders` - Create order (retailer)
  ```json
  {
    "wholesaler_id": "uuid",
    "items": [
      {
        "product_id": "uuid",
        "quantity": 10,
        "price": 800.00
      }
    ],
    "total_amount": 8000.00
  }
  ```
- **PATCH** `/api/wholesale-orders/[id]` - Update order status (wholesaler)
  ```json
  {
    "status": "confirmed"
  }
  ```

### Products
- **POST** `/api/products` - Create product (retailer or wholesaler)
  - **Retailers**: Include `price` (used as retail_price)
  - **Wholesalers**: Include `wholesaler_price` and `retail_price`
  ```json
  {
    "name": "Product Name",
    "description": "Description",
    "quantity": 100,
    "wholesaler_price": 800.00,
    "retail_price": 999.00,
    "category": "electronics"
  }
  ```

## How It Works

### Retailer Orders from Wholesaler:
1. **Retailer** browses wholesaler products
2. **Retailer** adds items to cart and places order
3. **System** creates `wholesale_order` with status `'pending'`
4. **Database Trigger** automatically:
   - Adds order amount to `retailer_debts` table
   - Creates/updates debt record for this retailer-wholesaler pair

### Wholesaler Confirms Order:
1. **Wholesaler** views pending orders
2. **Wholesaler** updates order status to `'confirmed'`
3. **Database Trigger** automatically:
   - Reduces stock quantities for all ordered products
   - Updates product status based on new stock levels
   - **Retailer's debt already recorded** (happened on order creation)

### Example Flow:
```
1. Retailer orders 10 units @ ₹800 each = ₹8,000
   → retailer_debts.debit_amount += 8000

2. Wholesaler confirms order
   → products.quantity -= 10
   → products.status updated based on new quantity

3. Retailer can view outstanding debt:
   → GET /api/retailer-debts?type=retailer
   → Shows: ₹8,000 owed to Wholesaler X

4. Retailer makes payment:
   → PATCH /api/retailer-debts
   → retailer_debts.debit_amount -= payment_amount
```

## UI Updates

### Wholesaler Product Form
- Now includes two price fields:
  - **Wholesale Price**: Price for retailers
  - **Suggested Retail Price**: Price retailers should charge customers

### Wholesaler Inventory Page
- Shows both wholesaler and retail prices
- Edit button to update prices
- Restock button to add inventory
- **Stock automatically reduces** when orders confirmed

### Retailer Dashboard
- Can create own products (for direct customer sales)
- Can order from wholesalers (for restocking)
- View outstanding debts to wholesalers

## Testing Checklist

- [ ] Wholesaler creates product with both prices
- [ ] Product appears in inventory with correct prices
- [ ] Retailer places order from wholesaler
- [ ] Debt record created/updated automatically
- [ ] Wholesaler confirms order
- [ ] Stock reduces automatically
- [ ] Product status updates (in-stock → low-stock → out-of-stock)
- [ ] Retailer views debt amount
- [ ] Retailer makes payment
- [ ] Debt amount reduces correctly

## Notes

- **Retailers can create products** for direct customer sales
- **Wholesalers create products** for B2B (retailer) sales
- **Dual role support**: Users can be both retailer and wholesaler
- **Debt tracking is automatic** - no manual entry needed
- **Stock management is automatic** - triggers handle it
- **Payment tracking**: Future enhancement for actual payment processing
