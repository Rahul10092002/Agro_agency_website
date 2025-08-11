import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Offer from "@/models/Offer";
import Product from "@/models/Product";
import Category from "@/models/Category";
import { authenticateAdmin } from "@/middleware/auth";

// GET /api/admin/offers - Get all offers
export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateAdmin(request);
    if (!("user" in authResult)) {
      return authResult;
    }

    await dbConnect();

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "20");
    const status = url.searchParams.get("status"); // active, inactive, expired
    const search = url.searchParams.get("search");

    const skip = (page - 1) * limit;

    // Build query
    const query: any = {};

    if (status === "active") {
      const now = new Date();
      query.isActive = true;
      query.startDate = { $lte: now };
      query.endDate = { $gte: now };
    } else if (status === "inactive") {
      query.isActive = false;
    } else if (status === "expired") {
      query.endDate = { $lt: new Date() };
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Get offers with pagination
    const [offers, total] = await Promise.all([
      Offer.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Offer.countDocuments(query),
    ]);

    // Get related products and categories for each offer
    const offersWithDetails = await Promise.all(
      offers.map(async (offer) => {
        const [products, categories] = await Promise.all([
          Product.find({ _id: { $in: offer.productIds } })
            .select("name nameEnglish price images")
            .lean(),
          Category.find({ _id: { $in: offer.categoryIds } })
            .select("name nameEnglish")
            .lean(),
        ]);

        return {
          ...offer,
          products,
          categories,
        };
      })
    );

    const pagination = {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    };

    return NextResponse.json({
      success: true,
      offers: offersWithDetails,
      pagination,
    });
  } catch (error) {
    console.error("Error fetching offers:", error);
    return NextResponse.json(
      {
        success: false,
        message: "ऑफर लोड करने में त्रुटि",
      },
      { status: 500 }
    );
  }
}

// POST /api/admin/offers - Create new offer
export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateAdmin(request);
    if (!("user" in authResult)) {
      return authResult;
    }

    await dbConnect();

    const body = await request.json();
    const {
      title,
      description,
      discountType,
      discountValue,
      minimumOrderAmount,
      maximumDiscountAmount,
      productIds,
      categoryIds,
      isActive,
      startDate,
      endDate,
      usageLimit,
      applicableToAll,
    } = body;

    // Validation
    if (!title || !description || !discountValue || !startDate || !endDate) {
      return NextResponse.json(
        {
          success: false,
          message: "सभी आवश्यक फील्ड भरें",
        },
        { status: 400 }
      );
    }

    if (new Date(endDate) <= new Date(startDate)) {
      return NextResponse.json(
        {
          success: false,
          message: "समाप्ति तारीख शुरुआती तारीख के बाद होनी चाहिए",
        },
        { status: 400 }
      );
    }

    if (discountType === "percentage" && discountValue > 100) {
      return NextResponse.json(
        {
          success: false,
          message: "प्रतिशत छूट 100% से अधिक नहीं हो सकती",
        },
        { status: 400 }
      );
    }

    // Verify products exist
    if (productIds && productIds.length > 0) {
      const existingProducts = await Product.find({
        _id: { $in: productIds },
      }).countDocuments();
      if (existingProducts !== productIds.length) {
        return NextResponse.json(
          {
            success: false,
            message: "कुछ उत्पाद मौजूद नहीं हैं",
          },
          { status: 400 }
        );
      }
    }

    // Verify categories exist
    if (categoryIds && categoryIds.length > 0) {
      const existingCategories = await Category.find({
        _id: { $in: categoryIds },
      }).countDocuments();
      if (existingCategories !== categoryIds.length) {
        return NextResponse.json(
          {
            success: false,
            message: "कुछ श्रेणियां मौजूद नहीं हैं",
          },
          { status: 400 }
        );
      }
    }

    const offer = new Offer({
      title,
      description,
      discountType: discountType || "percentage",
      discountValue,
      minimumOrderAmount: minimumOrderAmount || 0,
      maximumDiscountAmount,
      productIds: productIds || [],
      categoryIds: categoryIds || [],
      isActive: isActive !== undefined ? isActive : true,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      usageLimit,
      applicableToAll: applicableToAll || false,
    });

    await offer.save();

    return NextResponse.json({
      success: true,
      message: "ऑफर सफलतापूर्वक बनाया गया",
      offer,
    });
  } catch (error) {
    console.error("Error creating offer:", error);
    return NextResponse.json(
      {
        success: false,
        message: "ऑफर बनाने में त्रुटि",
      },
      { status: 500 }
    );
  }
}
