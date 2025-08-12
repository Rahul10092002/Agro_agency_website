const path = require("path");

require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Predefined shop templates
const SHOP_TEMPLATES = {
  1: {
    shopName: "भालावत कृषि सेवा केंद्र",
    ownerName: "बाबूलाल जी भीमाजी",
    address: "गांव - दसाई, जिला - धार, मध्य प्रदेश - 454441",
    phone: "+91 9584699863",
    whatsapp: "+91 9584699863",
    email: "admin@bhalawat.com",
    timings: "सुबह 8:00 बजे से शाम 8:00 बजे तक (रविवार बंद)",
    mapUrl: "https://maps.app.goo.gl/JiAHrpFgERwUBfXLA",
    shopNameEnglish: "Bhalawat Krishi Seva Kendra",
    ownerNameEnglish: "Babulal Ji Bhimaji",
    addressEnglish: "Village - Dasai, District - Dhar, Madhya Pradesh - 454441",
    description:
      "सभी प्रकार के कृषि उत्पाद - बीज, खाद, कीटनाशक और कृषि यंत्र उपलब्ध हैं। किसानों की पहली पसंद।",
    descriptionEnglish:
      "All types of agricultural products - seeds, fertilizers, pesticides and agricultural equipment available. Farmers first choice.",
  },
};

// Simple inline schemas
const shopSchema = new mongoose.Schema(
  {
    shopId: {
      type: String,
      required: [true, "Shop ID is required"],
      trim: true,
      unique: true,
    },
    shopName: { type: String, required: true, trim: true },
    shopNameEnglish: { type: String, required: true, trim: true },
    ownerName: { type: String, required: true, trim: true },
    ownerNameEnglish: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    addressEnglish: { type: String, required: true, trim: true },
    phone: { type: String, required: true },
    whatsapp: { type: String },
    email: { type: String, required: true, unique: true, lowercase: true },
    website: { type: String, default: "" },
    description: { type: String, default: "" },
    descriptionEnglish: { type: String, default: "" },
    timings: {
      weekdays: { type: String, default: "सुबह 9:00 - शाम 7:00" },
      weekdaysEnglish: { type: String, default: "9:00 AM - 7:00 PM" },
      weekends: { type: String, default: "सुबह 9:00 - दोपहर 2:00" },
      weekendsEnglish: { type: String, default: "9:00 AM - 2:00 PM" },
    },
    socialMedia: {
      facebook: { type: String, default: "" },
      instagram: { type: String, default: "" },
      youtube: { type: String, default: "" },
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const adminUserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, required: true, enum: ["admin"], default: "admin" },
    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
    },
  },
  { timestamps: true }
);

adminUserSchema.index({ email: 1, shopId: 1 }, { unique: true });

adminUserSchema.pre("save", async function (next) {
  if (!this.isModified("passwordHash")) return next();
  try {
    const salt = await bcrypt.genSalt(12);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (error) {
    next(error);
  }
});

let Shop, AdminUser;

// Function to generate a unique shop ID
function generateShopId() {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substr(2, 5);
  return `shop-${timestamp}-${randomPart}`;
}

async function connectDB() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error("❌ MONGODB_URI environment variable is not set");
      console.log("Please set MONGODB_URI in your .env file");
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB");

    Shop = mongoose.model("Shop", shopSchema);
    AdminUser = mongoose.model("AdminUser", adminUserSchema);
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1);
  }
}

function showTemplates() {
  console.log("\n🏪 Available Shop Templates:\n");

  Object.keys(SHOP_TEMPLATES).forEach((key) => {
    const template = SHOP_TEMPLATES[key];
    console.log(`${key}. ${template.shopNameEnglish} (${template.shopName})`);
    console.log(`   Owner: ${template.ownerNameEnglish}`);
    console.log(
      `   Location: ${template.addressEnglish
        .split(",")
        .slice(-2)
        .join(",")
        .trim()}`
    );
    console.log(`   Email: ${template.email}\n`);
  });
}

async function createQuickShop() {
  try {
    await connectDB();

    console.log("🌾 Quick Shop Creator");
    console.log("====================\n");

    // Get template choice from command line argument or default to 1
    const templateChoice = process.argv[2] || "1";

    if (!SHOP_TEMPLATES[templateChoice]) {
      console.log("❌ Invalid template choice!");
      showTemplates();
      console.log(
        "Usage: node scripts/quick-shop-creator.js [template_number]"
      );
      console.log("Example: node scripts/quick-shop-creator.js 2");
      return;
    }

    const template = SHOP_TEMPLATES[templateChoice];

    console.log(`📋 Creating shop from template ${templateChoice}:`);
    console.log(`   ${template.shopNameEnglish} (${template.shopName})`);
    console.log(`   Owner: ${template.ownerNameEnglish}`);
    console.log(`   Email: ${template.email}\n`);

    // Check if shop already exists
    const existingShop = await Shop.findOne({ email: template.email });

    if (existingShop) {
      console.log("⚠️  Shop with this email already exists!");
      console.log(`Existing shop: ${existingShop.shopNameEnglish}`);
      console.log(`Shop ID: ${existingShop._id}\n`);

      console.log("🔧 Environment Configuration:");
      console.log(`SHOP_ID=${existingShop._id}`);
      return;
    }

    // Create shop
    console.log("🔄 Creating shop...");
    const shopData = {
      ...template,
      shopId: generateShopId(),
    };
    const shop = new Shop(shopData);
    await shop.save();
    console.log("✅ Shop created successfully!");

    // Create admin user
    console.log("🔄 Creating admin user...");
    const adminData = {
      name: template.ownerNameEnglish,
      email: template.email,
      passwordHash: "ADMIN123",
      role: "admin",
      shopId: shop._id,
    };

    const admin = new AdminUser(adminData);
    await admin.save();
    console.log("✅ Admin user created successfully!");

    // Display results
    console.log("\n🎉 === Shop Created Successfully! ===");
    console.log(`\n🏪 Shop Details:`);
    console.log(`   Name: ${shop.shopNameEnglish} (${shop.shopName})`);
    console.log(`   Owner: ${shop.ownerNameEnglish} (${shop.ownerName})`);
    console.log(`   Email: ${shop.email}`);
    console.log(`   Phone: ${shop.phone}`);
    console.log(`   Shop ID: ${shop._id}`);

    console.log(`\n👤 Admin Login:`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Password: ADMIN123`);

    console.log(`\n🔧 Environment Configuration:`);
    console.log(`   Add this to your .env file:`);
    console.log(`   SHOP_ID=${shop._id}`);

    console.log(`\n⚠️  Next Steps:`);
    console.log(`   1. Copy the SHOP_ID to your .env file`);
    console.log(`   2. Restart your application`);
    console.log(`   3. Login to admin panel and change password`);
    console.log(`   4. Customize shop details as needed`);
  } catch (error) {
    console.error("\n❌ Error creating shop:", error.message);
    if (error.code === 11000) {
      console.log("Duplicate email detected. Shop may already exist.");
    }
  } finally {
    await mongoose.disconnect();
    console.log("\n🔌 Disconnected from MongoDB");
  }
}

// Show available templates if no arguments
if (process.argv.length === 2) {
  console.log("🌾 Quick Shop Creator");
  console.log("====================");
  showTemplates();
  console.log("Usage: node scripts/quick-shop-creator.js [template_number]");
  console.log("Example: node scripts/quick-shop-creator.js 2");
  console.log("\nOr run without arguments to see this help.");
  process.exit(0);
}

// Run the script
if (require.main === module) {
  createQuickShop()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error("Script failed:", error.message);
      process.exit(1);
    });
}

module.exports = { createQuickShop, SHOP_TEMPLATES };
