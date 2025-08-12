# 🌾 Multi-Tenant Agricultural Shop - Complete Setup Guide

## 🎯 Overview

Your agricultural shop website has been successfully transformed from a **single-tenant** to a **multi-tenant** architecture! This means:

- ✅ **Dynamic Data**: All shop information is now fetched from the database
- ✅ **Shop-Specific**: Each deployment serves data for one specific shop
- ✅ **Scalable**: Easy to deploy for multiple shops with different SHOP_ID
- ✅ **No Static Data**: Removed hardcoded contact information
- ✅ **Context-Based**: Uses React Context for state management

## 🚀 Quick Start

### 1. **Environment Setup**

```bash
# Run the complete setup wizard
node scripts/complete-setup.js
```

This interactive script will:

- Set up your MongoDB password
- Test database connection
- Create a shop with sample data
- Guide you through the configuration

### 2. **Alternative: Manual Setup**

If you prefer manual setup:

```bash
# 1. Set up MongoDB password
node scripts/setup-mongodb.js

# 2. Create a shop (choose option 1 for quick setup)
node scripts/quick-shop-creator.js

# 3. Verify everything is working
node scripts/verify-setup.js
```

### 3. **Start Your Application**

```bash
npm run dev
```

Visit `http://localhost:3000` to see your shop!

## 📋 Required Environment Variables

Your `.env` file should contain:

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname

# Shop Configuration (get this from shop creation script)
SHOP_ID=your_shop_id_here

# Authentication (if you haven't set these yet)
NEXTAUTH_SECRET=your_secret_here
NEXTAUTH_URL=http://localhost:3000
```

## 🏪 Shop Management

### Creating a Shop

**Option 1: Interactive Setup (Recommended)**

```bash
node scripts/complete-setup.js
```

**Option 2: Quick Creation with Template**

```bash
node scripts/quick-shop-creator.js 1
```

**Option 3: View Available Templates**

```bash
node scripts/quick-shop-creator.js
```

### Admin Panel Access

After creating a shop:

1. Visit: `http://localhost:3000/admin/login`
2. Login with:
   - **Email**: The email you provided during shop creation
   - **Password**: `admin123` (change this immediately!)

## 🔧 Architecture Overview

### Before (Single-Tenant)

```
Components → Static Data (lib/data.ts) → Hardcoded Information
```

### After (Multi-Tenant)

```
Components → Shop Context → API → MongoDB → Dynamic Shop Data
```

### Key Components Transformed

1. **Shop Context Provider** (`contexts/shop-context.tsx`)

   - Fetches shop data from `/api/shop`
   - Provides `useContactInfo()` hook
   - Handles loading and error states

2. **API Endpoint** (`app/api/shop/route.ts`)

   - Fetches shop data based on `SHOP_ID` environment variable
   - Returns shop-specific information

3. **Updated Components**:
   - `components/public-header.tsx` - Dynamic shop name
   - `components/public-footer.tsx` - Dynamic contact info
   - `components/admin-header.tsx` - Dynamic shop name
   - `app/page.tsx` - Dynamic contact buttons
   - `app/contact/page.tsx` - Dynamic contact information
   - `app/about/page.tsx` - Dynamic shop story
   - `app/products/[id]/page.tsx` - Dynamic contact functions

## 🔍 Verification

### Automated Verification

```bash
node scripts/verify-setup.js
```

This script checks:

- ✅ Environment configuration
- ✅ Database connection
- ✅ Shop data existence
- ✅ API file structure
- ✅ Multi-tenant setup completion

### Manual Verification

1. **Shop Data Loading**: Visit your website and check if shop name appears correctly
2. **Contact Information**: Verify phone/WhatsApp buttons work with your shop's numbers
3. **Admin Panel**: Login and verify shop information is correct
4. **No Static Data**: Ensure no hardcoded contact information is displayed

## 🛠️ Common Issues & Solutions

### "Shop not found" Error

```bash
# Check if your SHOP_ID is correct
node scripts/verify-setup.js

# Or create a new shop
node scripts/quick-shop-creator.js 1
```

### "Contact information not available"

- Ensure your shop has complete contact information
- Check that SHOP_ID matches a shop in your database
- Verify the shop context is loading correctly

### MongoDB Connection Issues

```bash
# Fix password and connection issues
node scripts/setup-mongodb.js
```

### Static Data Still Showing

```bash
# Verify all static imports have been removed
node scripts/verify-setup.js
```

## 📊 Database Schema

### Shop Collection

```javascript
{
  _id: ObjectId,
  shopName: "Shop Name in Hindi/Local",
  shopNameEnglish: "Shop Name in English",
  ownerName: "Owner Name in Hindi/Local",
  ownerNameEnglish: "Owner Name in English",
  phone: "+91-XXXXXXXXXX",
  whatsapp: "+91-XXXXXXXXXX",
  email: "contact@shop.com",
  address: "Address in Hindi/Local",
  addressEnglish: "Address in English",
  description: "Description in Hindi/Local",
  descriptionEnglish: "Description in English",
  timings: {
    weekdays: "सुबह 9:00 - शाम 7:00",
    weekdaysEnglish: "9:00 AM - 7:00 PM",
    weekends: "सुबह 9:00 - दोपहर 2:00",
    weekendsEnglish: "9:00 AM - 2:00 PM"
  },
  socialMedia: {
    facebook: "facebook_url",
    instagram: "instagram_url",
    youtube: "youtube_url"
  },
  isActive: true,
  createdAt: Date,
  updatedAt: Date
}
```

## 🚀 Deployment for Multiple Shops

To deploy this application for different shops:

1. **Create a Shop**: Use the creation scripts to add shop data to database
2. **Set SHOP_ID**: Update the environment variable for each deployment
3. **Deploy**: Each deployment will automatically serve that shop's data

Example deployment environments:

```bash
# Shop 1 Deployment
SHOP_ID=shop_1_id_here

# Shop 2 Deployment
SHOP_ID=shop_2_id_here
```

## 📱 Features Working with Dynamic Data

- ✅ **Homepage**: Shop name, contact buttons
- ✅ **Header**: Shop name display
- ✅ **Footer**: Complete contact information, social media links
- ✅ **Contact Page**: Contact form, shop details, map integration
- ✅ **About Page**: Shop story, owner information
- ✅ **Product Pages**: WhatsApp/Phone contact with shop numbers
- ✅ **Admin Panel**: Shop-specific administration

## 🎯 Next Steps

1. **Customize Your Shop**:

   - Update shop information through admin panel
   - Add your logo and branding
   - Configure social media links

2. **Add Products & Categories**:

   - Use admin panel to add product categories
   - Add products with images and descriptions
   - Set up special offers and pricing

3. **Advanced Configuration**:
   - Set up payment integrations
   - Configure delivery options
   - Add custom fields to shop schema

## 📞 Support

If you encounter any issues:

1. **Run Diagnostics**: `node scripts/verify-setup.js`
2. **Check Environment**: Ensure all environment variables are set
3. **Database Connection**: Verify MongoDB Atlas setup and IP whitelist
4. **Shop Data**: Ensure shop exists and SHOP_ID is correct

---

## 🏆 Transformation Complete!

Your agricultural shop website is now a **fully functional multi-tenant platform**! Each deployment can serve a different shop by simply changing the `SHOP_ID` environment variable.

**Key Achievement**: Eliminated static data dependencies and implemented dynamic, database-driven content management.

🎉 **Congratulations on completing the multi-tenant transformation!**
