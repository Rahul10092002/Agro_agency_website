import { type NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import Category from "@/models/Category";
import { applyOffersToProducts } from "@/lib/offer-utils";

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

// GET - Fetch all products for public view (no auth required)
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

    const url = new URL(request.url);
    const search = url.searchParams.get("search");
    const category = url.searchParams.get("category");
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "20");
    const featured = url.searchParams.get("featured");
    const includeOffers = url.searchParams.get("includeOffers") !== "false"; // Default to true

    const query: any = {
      shopId,
      inStock: true,
    }; // Only show in-stock products for this shop

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { nameEnglish: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (category && category !== "all") {
      query.categoryId = category;
    }

    if (featured === "true") {
      query.featured = true;
    }

    const skip = (page - 1) * limit;

    const [products, total, categories] = await Promise.all([
      Product.find(query)
        .sort({ featured: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(query),
      Category.find({ shopId }).sort({ name: 1 }).lean(),
    ]);

    // Apply offers to products if requested
    let productsWithOffers = products;
    if (includeOffers) {
      productsWithOffers = await applyOffersToProducts(products);
    }

    return NextResponse.json({
      success: true,
      products: productsWithOffers,
      categories,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Products fetch error:", error);
    return NextResponse.json(
      { success: false, message: "सर्वर त्रुटि" },
      { status: 500 }
    );
  }
}
