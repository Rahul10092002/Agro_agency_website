import { type NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import AdminUser from "@/models/AdminUser";
import { generateToken } from "@/middleware/auth";
import rateLimit from "@/lib/rate-limit";

// Rate limiting for login attempts
const limiter = rateLimit({
  interval: 15 * 60 * 1000, // 15 minutes
  uniqueTokenPerInterval: 500,
});

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    try {
      await limiter.check(request, 5, "CACHE_TOKEN"); // 5 attempts per 15 minutes
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "बहुत सारे प्रयास। कृपया बाद में कोशिश करें।",
        },
        { status: 429 }
      );
    }

    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "ईमेल और पासवर्ड आवश्यक हैं" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Get the shop ID from environment variable
    const shopId = process.env.SHOP_ID;
    if (!shopId) {
      return NextResponse.json(
        {
          success: false,
          message: "दुकान ID कॉन्फ़िगर नहीं है",
        },
        { status: 500 }
      );
    }

    // Find user by email and ensure they belong to the correct shop
    const user = await AdminUser.findOne({
      email: email.toLowerCase(),
      shopId: shopId,
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "अवैध ईमेल या पासवर्ड या आप इस दुकान के व्यवस्थापक नहीं हैं",
        },
        { status: 401 }
      );
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: "अवैध ईमेल या पासवर्ड" },
        { status: 401 }
      );
    }

    const token = generateToken(user._id.toString());

    const response = NextResponse.json({
      success: true,
      message: "सफलतापूर्वक लॉगिन हो गए",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

    // Set HTTP-only cookie
    response.cookies.set("admin-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, message: "सर्वर त्रुटि" },
      { status: 500 }
    );
  }
}
