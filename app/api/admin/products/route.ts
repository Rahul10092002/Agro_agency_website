import { type NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import { authenticateAdmin } from "@/middleware/auth";
import { applyOffersToProducts } from "@/lib/offer-utils";

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

// GET - Fetch all products with optional filtering
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

    const url = new URL(request.url);
    const search = url.searchParams.get("search");
    const category = url.searchParams.get("category");
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "20");

    const query: any = { shopId };

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

    const skip = (page - 1) * limit;

    const [productsRaw, total] = await Promise.all([
      Product.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(query),
    ]);

    // Apply offers to products
    const products = await applyOffersToProducts(productsRaw);

    return NextResponse.json({
      success: true,
      products,
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

// POST - Create new product
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

    const productData = await request.json();

    // Validate required fields
    const requiredFields = [
      "name",
      "nameEnglish",
      "price",
      "categoryId",
      "unit",
    ];
    for (const field of requiredFields) {
      if (!productData[field]) {
        return NextResponse.json(
          { success: false, message: `${field} आवश्यक है` },
          { status: 400 }
        );
      }
    }

    const product = new Product({
      ...productData,
      shopId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await product.save();

    return NextResponse.json({
      success: true,
      message: "उत्पाद सफलतापूर्वक जोड़ा गया",
      product,
    });
  } catch (error) {
    console.error("Product creation error:", error);
    return NextResponse.json(
      { success: false, message: "सर्वर त्रुटि" },
      { status: 500 }
    );
  }
}
