import { type NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Category from "@/models/Category";
import { authenticateAdmin } from "@/middleware/auth";

// Helper function to generate slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/[\s_-]+/g, "-") // Replace spaces with hyphens
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
}

// GET - Fetch all categories
export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateAdmin(request);
    if (!("user" in authResult)) {
      return authResult;
    }

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

// POST - Create new category
export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateAdmin(request);
    if (!("user" in authResult)) {
      return authResult;
    }

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

    const categoryData = await request.json();

    // Validate required fields
    if (!categoryData.name || !categoryData.nameEnglish) {
      return NextResponse.json(
        { success: false, message: "नाम और अंग्रेजी नाम आवश्यक हैं" },
        { status: 400 }
      );
    }

    // Generate slug from nameEnglish
    const baseSlug = generateSlug(categoryData.nameEnglish);
    let slug = baseSlug;
    let counter = 1;

    // Ensure slug is unique within the shop
    while (await Category.findOne({ slug, shopId })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const category = new Category({
      ...categoryData,
      slug,
      shopId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await category.save();

    return NextResponse.json({
      success: true,
      message: "श्रेणी सफलतापूर्वक जोड़ी गई",
      category,
    });
  } catch (error) {
    console.error("Category creation error:", error);
    return NextResponse.json(
      { success: false, message: "सर्वर त्रुटि" },
      { status: 500 }
    );
  }
}
