# LiveMart E-Commerce Platform

A comprehensive multi-role e-commerce platform built with Next.js 14, featuring Customer, Retailer, and Wholesaler interfaces with dual authentication (OAuth + OTP), SMS notifications, and complete order management.

## 🚀 Features

### For Customers
- 🛍️ Browse and search products with advanced filters
- 🛒 Shopping cart management
- 💳 Multiple payment options (Card, UPI, Wallet, Net Banking)
- 📱 SMS notifications for order updates
- 📦 Real-time order tracking
- ⭐ Product reviews and ratings
- 📍 Location-based product filtering

### For Retailers
- 📊 Product inventory management
- 🔔 Inventory alerts for low stock
- 📈 Sales metrics and analytics
- 👥 Wholesaler connection management
- 🛒 Wholesale order placement
- 📦 Customer order fulfillment
- 🔄 Order status management

### For Wholesalers
- 🏪 Wholesale product catalog management
- 🤝 Retailer connection requests
- 📋 Wholesale order management
- 📦 Inventory tracking
- 💼 B2B order fulfillment

## 🛠️ Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **UI**: React 18 + shadcn/ui + Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth + Custom OTP (Twilio)
- **SMS**: Twilio API
- **Payment**: Dummy Gateway (Testing)

## 📋 Prerequisites

- Node.js 18+ 
- npm/yarn/pnpm
- Supabase account
- Twilio account (for SMS)

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/AviralYO/oops_ecommerce.git
   cd oops_ecommerce
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   TWILIO_ACCOUNT_SID=your_twilio_sid
   TWILIO_AUTH_TOKEN=your_twilio_token
   TWILIO_PHONE_NUMBER=your_twilio_number
   ```

4. **Set up Supabase database**
   
   Run the SQL migrations in your Supabase SQL editor:
   ```bash
   # Execute in order:
   1. supabase-schema.sql
   2. add-stock-quantity-column.sql
   3. add-payment-details-column.sql
   4. fix-order-status-constraint.sql
   ```

5. **Run the development server**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📱 Authentication

### OAuth Login
- Traditional email/password authentication
- Powered by Supabase Auth

### OTP Login
- Phone-based authentication with SMS verification
- 6-digit OTP valid for 10 minutes
- Automatic account creation on first login

## 🗄️ Database Schema

### Core Tables
- `profiles` - User information and roles
- `products` - Product catalog
- `cart_items` - Shopping cart
- `orders` - Order records
- `order_items` - Order line items
- `wholesaler_connections` - B2B relationships
- `wholesale_orders` - Wholesale transactions

## 🔐 API Routes

All API routes support dual authentication (OAuth + OTP):

### Customer APIs
- `GET /api/products` - Browse products
- `POST /api/cart` - Add to cart
- `POST /api/orders/place` - Create order
- `GET /api/orders` - Order history

### Retailer APIs
- `POST /api/products` - Create product
- `GET /api/retailer/orders` - View orders
- `PATCH /api/retailer/orders/update-status` - Update status

### Wholesaler APIs
- `GET /api/wholesale-orders` - View orders
- `POST /api/wholesaler-connections` - Manage connections

## 📦 Order Status Flow

```
pending → confirmed → processing → shipped → delivered
   ↓
cancelled
```

## 📱 SMS Notifications

Customers receive SMS notifications for:
- Order placement confirmation
- Order confirmation by retailer
- Shipping updates

## 🧪 Testing

### Manual Testing Checklist
- [ ] Customer signup via OTP
- [ ] Add products to cart
- [ ] Complete checkout with payment
- [ ] Receive order placement SMS
- [ ] Retailer view and update order
- [ ] Receive order confirmation SMS

### Test Credentials

For testing OTP authentication:
- Use your verified phone number (Twilio trial)
- OTP expires in 10 minutes
- Supports Indian phone numbers (+91)

## 🚀 Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Other Platforms
- Netlify
- Railway
- AWS Amplify

## 📝 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes |
| `TWILIO_ACCOUNT_SID` | Twilio account SID | Yes |
| `TWILIO_AUTH_TOKEN` | Twilio auth token | Yes |
| `TWILIO_PHONE_NUMBER` | Twilio phone number | Yes |

## 🐛 Known Issues

- Twilio trial account requires phone verification
- In-memory OTP storage (use Redis for production)
- Dummy payment gateway (replace with real gateway)

## 🔮 Future Enhancements

- [ ] Real payment gateway integration (Razorpay/Stripe)
- [ ] Redis for OTP storage
- [ ] Email notifications
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Real-time order tracking with websockets
- [ ] AI-powered product recommendations
- [ ] Multi-language support

## 📄 License

This project is licensed under the MIT License.

## 👥 Contributors

- **Aviral** - Developer

## 📞 Support

For support, email support@livemart.com or open an issue on GitHub.

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Supabase for backend infrastructure
- shadcn/ui for beautiful components
- Twilio for SMS services

---

**Built with ❤️ using Next.js 14**
