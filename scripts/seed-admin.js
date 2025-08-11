const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

// Define the AdminUser schema inline to avoid import issues
const AdminUserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      required: true,
      enum: ["admin"],
      default: "admin",
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
AdminUserSchema.pre("save", async function (next) {
  if (!this.isModified("passwordHash")) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
AdminUserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

const AdminUser = mongoose.model("AdminUser", AdminUserSchema);

async function seedAdmin() {
  try {
    // Connect to MongoDB
    const mongoUrl =
      process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/bhalawat";
    console.log("Attempting to connect to MongoDB...");

    await mongoose.connect(mongoUrl);
    console.log("✅ Connected to MongoDB successfully");

    // Check if admin already exists
    const existingAdmin = await AdminUser.findOne({
      email: "admin@bhalawat.com",
    });

    if (existingAdmin) {
      console.log("Admin user already exists with email: admin@bhalawat.com");

      // Update the password
      existingAdmin.passwordHash = "ADMIN123"; // This will be hashed by the pre-save hook
      await existingAdmin.save();
      console.log("✅ Admin password updated successfully!");
    } else {
      // Create new admin user
      const adminUser = new AdminUser({
        name: "भलावत एडमिन",
        email: "admin@bhalawat.com",
        passwordHash: "ADMIN123", // This will be hashed by the pre-save hook
        role: "admin",
      });

      await adminUser.save();
      console.log("✅ Admin user created successfully!");
    }

    console.log("\n=== Admin Credentials ===");
    console.log("Email: admin@bhalawat.com");
    console.log("Password: ADMIN123");
    console.log("========================\n");

    // Verify the admin user can be found and password works
    const admin = await AdminUser.findOne({ email: "admin@bhalawat.com" });
    const isPasswordValid = await admin.comparePassword("ADMIN123");

    if (isPasswordValid) {
      console.log("✅ Admin user verification successful!");
      console.log(
        "✅ You can now login to the admin panel with these credentials"
      );
    } else {
      console.log("❌ Admin user verification failed!");
    }
  } catch (error) {
    console.error("❌ Error seeding admin user:", error.message);

    if (error.message.includes("authentication failed")) {
      console.log(
        "\n💡 Suggestion: Please check your MONGODB_URI in .env.local"
      );
      console.log("   Make sure the database credentials are correct.");
      console.log(
        "   For local development, you can use: mongodb://127.0.0.1:27017/bhalawat"
      );
    }

    if (error.message.includes("ECONNREFUSED")) {
      console.log(
        "\n💡 Suggestion: Make sure MongoDB is running on your system"
      );
      console.log(
        "   For local development, install and start MongoDB locally"
      );
    }
  } finally {
    try {
      await mongoose.disconnect();
      console.log("Disconnected from MongoDB");
    } catch (e) {
      // Ignore disconnect errors
    }
  }
}

seedAdmin();
