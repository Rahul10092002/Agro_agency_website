# Setup Scripts Documentation

This folder contains helpful scripts to set up your agricultural shop website.

## Scripts Overview

### 1. `complete-setup.js` - **Recommended for first-time setup**

A comprehensive setup wizard that guides you through:

- Setting up MongoDB password in .env file
- Testing database connection
- Creating a shop with sample or custom data
- Setting up admin user

**Usage:**

```bash
node scripts/complete-setup.js
```

**What it does:**

- ✅ Checks your .env file
- ✅ Helps set MongoDB password if needed
- ✅ Tests database connection
- ✅ Creates shop and admin user
- ✅ Provides next steps

### 2. `quick-shop-creator.js` - **For creating additional shops**

Creates shops quickly using predefined templates.

**Usage:**

```bash
# Show available templates
node scripts/quick-shop-creator.js

# Create shop using template 1
node scripts/quick-shop-creator.js 1
```

**Templates available:**

1. भालावत कृषि सेवा केंद्र (Bhalawat Krishi Seva Kendra)

### 3. `setup-mongodb.js` - **For MongoDB troubleshooting**

Helps fix MongoDB connection issues by setting up the correct password.

**Usage:**

```bash
node scripts/setup-mongodb.js
```

## Getting Started (First Time)

### Step 1: Check your .env file

Make sure you have a `.env` file with your MongoDB URI:

```
MONGODB_URI=mongodb+srv://username:<db_password>@cluster.mongodb.net/dbname
```

### Step 2: Run the complete setup

```bash
node scripts/complete-setup.js
```

### Step 3: Follow the wizard

The script will guide you through:

1. Setting up your MongoDB password
2. Testing the connection
3. Creating your first shop
4. Setting up admin access

### Step 4: Update your .env

Add the generated SHOP_ID to your .env file:

```
SHOP_ID=your_generated_shop_id_here
```

### Step 5: Start your application

```bash
npm run dev
```

## Common Issues and Solutions

### "MONGODB_URI not found"

- Make sure you have a `.env` file in your project root
- Add your MongoDB connection string to the `.env` file

### "authentication failed"

- Check your MongoDB username and password
- Make sure your IP is whitelisted in MongoDB Atlas
- Verify the database name is correct

### "Shop already exists"

- Each email can only be used for one shop
- Use a different email or update the existing shop

### "No SHOP_ID found"

- Make sure to add the SHOP_ID to your .env file after creating a shop
- Restart your development server after updating .env

## Environment Variables

Your `.env` file should contain:

```
# MongoDB Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname

# Shop Configuration
SHOP_ID=your_shop_id_here

# Other variables...
NEXTAUTH_SECRET=your_secret_here
NEXTAUTH_URL=http://localhost:3000
```

## Admin Panel Access

After creating a shop, you can access the admin panel at:

```
http://localhost:3000/admin/login
```

**Default credentials:**

- Email: The email you provided during shop creation
- Password: `admin123` (change this immediately after first login)

## Troubleshooting

If you encounter issues:

1. **Run the MongoDB setup script:**

   ```bash
   node scripts/setup-mongodb.js
   ```

2. **Check your environment:**

   ```bash
   node scripts/complete-setup.js
   ```

3. **Create a new shop:**
   ```bash
   node scripts/quick-shop-creator.js 1
   ```

## Need Help?

If you're still having issues:

1. Check that all environment variables are set correctly
2. Ensure your MongoDB cluster is running and accessible
3. Verify your IP is whitelisted in MongoDB Atlas
4. Make sure you have the latest dependencies installed: `npm install`

## Script Dependencies

These scripts require:

- Node.js
- MongoDB connection
- npm packages: `mongoose`, `bcryptjs`, `dotenv`

All dependencies should already be installed if you've run `npm install` in your project.
