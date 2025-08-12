import { type NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Category from "@/models/Category";

// GET - Fetch all categories for public view (no auth required)
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const shopId = process.env.SHOP_ID;

    if (!shopId) {
      return NextResponse.json(
        {
          success: false,
          message: "SHOP_ID environment variable is not configured",
          messageHindi: "दुकान ID कॉन्फ़िगर नहीं है",
        },
        { status: 500 }
      );
    }

    const categories = await Category.find({ shopId }).sort({ name: 1 }).lean();

    return NextResponse.json({
      success: true,
      categories,
    });
  } catch (error) {
    console.error("Categories fetch error:", error);
    return NextResponse.json(
      { success: false, message: "सर्वर त्रुटि" },
      { status: 500 }
    );
  }
}
