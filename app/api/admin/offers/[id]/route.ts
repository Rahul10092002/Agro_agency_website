import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Offer from "@/models/Offer";
import Product from "@/models/Product";
import Category from "@/models/Category";
import { authenticateAdmin } from "@/middleware/auth";

// GET /api/admin/offers/[id] - Get specific offer
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await authenticateAdmin(request);
    if (!("user" in authResult)) {
      return authResult;
    }

    await dbConnect();

    const offer = await Offer.findById(params.id).lean();

    if (!offer) {
      return NextResponse.json(
        {
          success: false,
          message: "ऑफर नहीं मिला",
        },
        { status: 404 }
      );
    }

    // Get related products and categories
    const [products, categories] = await Promise.all([
      Product.find({ _id: { $in: offer.productIds } })
        .select("name nameEnglish price images")
        .lean(),
      Category.find({ _id: { $in: offer.categoryIds } })
        .select("name nameEnglish")
        .lean(),
    ]);

    return NextResponse.json({
      success: true,
      offer: {
        ...offer,
        products,
        categories,
      },
    });
  } catch (error) {
    console.error("Error fetching offer:", error);
    return NextResponse.json(
      {
        success: false,
        message: "ऑफर लोड करने में त्रुटि",
      },
      { status: 500 }
    );
  }
}

// PUT /api/admin/offers/[id] - Update offer
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const offer = await Offer.findById(params.id);

    if (!offer) {
      return NextResponse.json(
        {
          success: false,
          message: "ऑफर नहीं मिला",
        },
        { status: 404 }
      );
    }

    // Validation
    if (endDate && startDate && new Date(endDate) <= new Date(startDate)) {
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

    // Update offer
    if (title !== undefined) offer.title = title;
    if (description !== undefined) offer.description = description;
    if (discountType !== undefined) offer.discountType = discountType;
    if (discountValue !== undefined) offer.discountValue = discountValue;
    if (minimumOrderAmount !== undefined)
      offer.minimumOrderAmount = minimumOrderAmount;
    if (maximumDiscountAmount !== undefined)
      offer.maximumDiscountAmount = maximumDiscountAmount;
    if (productIds !== undefined) offer.productIds = productIds;
    if (categoryIds !== undefined) offer.categoryIds = categoryIds;
    if (isActive !== undefined) offer.isActive = isActive;
    if (startDate !== undefined) offer.startDate = new Date(startDate);
    if (endDate !== undefined) offer.endDate = new Date(endDate);
    if (usageLimit !== undefined) offer.usageLimit = usageLimit;
    if (applicableToAll !== undefined) offer.applicableToAll = applicableToAll;

    await offer.save();

    return NextResponse.json({
      success: true,
      message: "ऑफर सफलतापूर्वक अपडेट किया गया",
      offer,
    });
  } catch (error) {
    console.error("Error updating offer:", error);
    return NextResponse.json(
      {
        success: false,
        message: "ऑफर अपडेट करने में त्रुटि",
      },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/offers/[id] - Delete offer
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await authenticateAdmin(request);
    if (!("user" in authResult)) {
      return authResult;
    }

    await dbConnect();

    const offer = await Offer.findById(params.id);

    if (!offer) {
      return NextResponse.json(
        {
          success: false,
          message: "ऑफर नहीं मिला",
        },
        { status: 404 }
      );
    }

    await Offer.findByIdAndDelete(params.id);

    return NextResponse.json({
      success: true,
      message: "ऑफर सफलतापूर्वक हटाया गया",
    });
  } catch (error) {
    console.error("Error deleting offer:", error);
    return NextResponse.json(
      {
        success: false,
        message: "ऑफर हटाने में त्रुटि",
      },
      { status: 500 }
    );
  }
}
