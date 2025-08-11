import { type NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Category from "@/models/Category";

// GET - Fetch all categories for public view (no auth required)
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const categories = await Category.find({}).sort({ name: 1 }).lean();

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
