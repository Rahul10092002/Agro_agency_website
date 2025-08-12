import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Shop from "@/models/Shop";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const shopId = process.env.SHOP_ID;

    if (!shopId) {
      return NextResponse.json(
        {
          error: "SHOP_ID environment variable is not configured",
          message: "दुकान ID कॉन्फ़िगर नहीं है",
        },
        { status: 500 }
      );
    }

    const shop = await Shop.findById(shopId);

    if (!shop) {
      return NextResponse.json(
        {
          error: "Shop not found",
          message: "दुकान नहीं मिली",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: shop,
    });
  } catch (error: any) {
    console.error("Shop API Error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch shop information",
        message: "दुकान की जानकारी प्राप्त करने में त्रुटि",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
