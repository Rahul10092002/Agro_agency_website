# 🌾 Multi-Shop Agricultural Platform

A multi-tenant agricultural shop platform where each deployment serves a single shop's data based on environment configuration. Each shop has its own products, categories, offers, and admin users, completely isolated from other shops.

## 🏗️ Architecture Overview

This platform has been transformed from a single-shop system to a multi-tenant architecture:

- **Shop Isolation**: Each deployment serves only one shop's data using `SHOP_ID` environment variable
- **Data Security**: All API routes filter data by `shopId` to ensure complete isolation
- **Admin Restrictions**: Admin users can only access data from their assigned shop
- **Scalable Deployment**: Each shop can be deployed independently

## 🚀 Quick Setup

### 1. Environment Configuration

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit `.env` and set your configuration:

```env
# Multi-shop Configuration
SHOP_ID=your-shop-mongodb-objectid-here

# MongoDB Database
MONGODB_URI=mongodb://localhost:27017/your-agro-shop

# Authentication
JWT_SECRET=your-super-secret-jwt-key-here

# Other configurations...
```

### 2. Database Setup

Install dependencies and set up your database:

```bash
# Install dependencies
npm install

# Setup your shop and admin user
node scripts/setup-shop.js
```

### 3. Configure Environment

After running the setup script, you'll get a `SHOP_ID`. Add it to your `.env` file:

```env
SHOP_ID=507f1f77bcf86cd799439011
```

### 4. Start the Application

```bash
npm run dev
```

Your shop will be available at `http://localhost:3000`

## 🏪 Shop Management

### Creating a New Shop

1. **Customize Shop Data**: Edit `scripts/setup-shop.js` with your shop details:

   ```javascript
   const shopData = {
     shopName: "आपका कृषि केंद्र", // Hindi name
     shopNameEnglish: "Your Krishi Kendra", // English name
     ownerName: "आपका नाम",
     ownerNameEnglish: "Your Name",
     address: "आपका पता",
     phone: "+91 XXXXXXXXXX",
     email: "your@email.com",
     // ... other details
   };
   ```

2. **Run Setup Script**:

   ```bash
   node scripts/setup-shop.js
   ```

3. **Set Environment Variable**:
   ```bash
   SHOP_ID=your-generated-shop-id
   ```

### Multiple Deployments

Each shop should have its own deployment with a unique `SHOP_ID`:

```env
# Shop 1 deployment
SHOP_ID=507f1f77bcf86cd799439011

# Shop 2 deployment
SHOP_ID=507f1f77bcf86cd799439012

# Shop 3 deployment
SHOP_ID=507f1f77bcf86cd799439013
```

## 🔐 Security Features

### Shop Isolation

- All database queries include `shopId` filter
- API routes validate `SHOP_ID` environment variable
- Admin authentication restricted to shop-specific users
- No cross-shop data access possible

### Admin Access Control

- Admins can only access their shop's data
- Authentication middleware validates shop membership
- All admin operations are shop-scoped

### Data Validation

- Products can only reference categories from same shop
- Offers can only apply to products/categories from same shop
- All CRUD operations are shop-restricted

## 📊 Database Schema

### Shop Model

```typescript
interface IShop {
  shopName: string; // Hindi name
  shopNameEnglish: string; // English name
  ownerName: string; // Owner name (Hindi)
  ownerNameEnglish: string; // Owner name (English)
  address: string; // Full address
  phone: string;
  whatsapp: string;
  email: string;
  timings: {
    weekdays: string;
    weekends: string;
  };
  isActive: boolean;
}
```

### Updated Models

All existing models now include `shopId`:

- **Product**: `shopId` reference to Shop
- **Category**: `shopId` reference to Shop
- **Offer**: `shopId` reference to Shop
- **AdminUser**: `shopId` reference to Shop

### Database Indexes

Optimized indexes for shop-based queries:

```javascript
// Products
{ shopId: 1, featured: -1, createdAt: -1 }
{ shopId: 1, categoryId: 1 }
{ shopId: 1, inStock: 1 }

// Categories
{ slug: 1, shopId: 1 } // Unique
{ shopId: 1, name: 1 }

// Offers
{ shopId: 1, isActive: 1, startDate: 1, endDate: 1 }
{ shopId: 1, productIds: 1 }

// AdminUsers
{ email: 1, shopId: 1 } // Unique
```

## 🔧 API Routes

All API routes now include shop filtering:

### Public Routes

- `GET /api/products` - Shop's products only
- `GET /api/categories` - Shop's categories only
- `GET /api/products/[id]` - Single product (shop-validated)
- `GET /api/shop` - Current shop information

### Admin Routes

- `GET /api/admin/products` - Shop's products (admin)
- `POST /api/admin/products` - Create product in shop
- `GET /api/admin/categories` - Shop's categories (admin)
- `POST /api/admin/categories` - Create category in shop
- `GET /api/admin/offers` - Shop's offers (admin)
- `POST /api/admin/offers` - Create offer in shop

## 🌐 Frontend Integration

The frontend automatically uses shop-specific data:

### Shop Information

```typescript
// Get current shop data
const response = await fetch("/api/shop");
const { data: shop } = await response.json();
```

### Dynamic Content

- Shop name in header/footer
- Shop contact information
- Shop-specific timings and social media
- Localized content (Hindi/English)

## 📱 Features

### Public Store

- 🛍️ Product catalog with search and filtering
- 📑 Category-based browsing
- 📱 Responsive design for mobile/desktop
- 🔍 Advanced search with Hindi/English support
- 💰 Pricing with offer integration
- 📞 Shop contact information

### Admin Panel

- 📊 Dashboard with shop statistics
- 🏷️ Product management (CRUD)
- 📂 Category management
- 🎯 Offers and promotions
- 📸 Image upload with Cloudinary
- 📈 Analytics and insights

### Multi-language Support

- 🇮🇳 Hindi (Primary)
- 🇬🇧 English (Secondary)
- Bilingual product names and descriptions
- Localized UI elements

## 🚀 Deployment

### Single Shop Deployment

1. **Deploy your application** (Vercel, Netlify, etc.)
2. **Set environment variables**:
   ```env
   SHOP_ID=your-shop-id
   MONGODB_URI=your-mongodb-uri
   JWT_SECRET=your-jwt-secret
   ```
3. **Run database migrations** if needed
4. **Your shop is live!**

### Multiple Shops

Deploy the same codebase multiple times with different `SHOP_ID`:

```bash
# Deploy shop 1
vercel --env SHOP_ID=507f1f77bcf86cd799439011

# Deploy shop 2
vercel --env SHOP_ID=507f1f77bcf86cd799439012
```

## 🛠️ Development

### Local Development

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env

# Create shop and admin
node scripts/setup-shop.js

# Start development server
npm run dev
```

### Adding New Features

When adding new features:

1. **Always include `shopId` in new models**
2. **Filter all queries by `shopId`**
3. **Update API routes with shop validation**
4. **Test with multiple shops**

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with multiple shop configurations
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Developer

**Rahul Manohar Patidar**

- GitHub: [@Rahul10092002](https://github.com/Rahul10092002)
- Project: Agricultural Multi-Shop Platform

---

## 🔄 Migration from Single Shop

If you're migrating from the single-shop version:

1. **Backup your database**
2. **Create a shop entry** for your existing data
3. **Update all existing records** to include `shopId`
4. **Set up environment variables**
5. **Test thoroughly**

The platform maintains backward compatibility while adding multi-tenant capabilities.
