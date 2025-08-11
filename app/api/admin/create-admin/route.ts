import { type NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import AdminUser from "@/models/AdminUser";

// This is a development-only route for creating admin users
export async function POST(request: NextRequest) {
  try {
    // Only allow in development
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        {
          success: false,
          message: "This endpoint is only available in development",
        },
        { status: 403 }
      );
    }

    await dbConnect();

    const { email, password, name } = await request.json();

    // Default values if not provided
    const adminEmail = email || "admin@bhalawat.com";
    const adminPassword = password || "ADMIN123";
    const adminName = name || "भलावत एडमिन";

    // Check if admin already exists
    const existingAdmin = await AdminUser.findOne({ email: adminEmail });

    if (existingAdmin) {
      // Update existing admin
      existingAdmin.passwordHash = adminPassword; // Will be hashed by pre-save hook
      existingAdmin.name = adminName;
      await existingAdmin.save();

      return NextResponse.json({
        success: true,
        message: "Admin user updated successfully",
        admin: {
          email: adminEmail,
          password: adminPassword,
          name: adminName,
        },
      });
    } else {
      // Create new admin
      const adminUser = new AdminUser({
        name: adminName,
        email: adminEmail,
        passwordHash: adminPassword, // Will be hashed by pre-save hook
        role: "admin",
      });

      await adminUser.save();

      return NextResponse.json({
        success: true,
        message: "Admin user created successfully",
        admin: {
          email: adminEmail,
          password: adminPassword,
          name: adminName,
        },
      });
    }
  } catch (error) {
    console.error("Admin creation error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create admin user",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
