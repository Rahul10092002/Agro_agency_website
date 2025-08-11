import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Offer from "@/models/Offer";
import Product from "@/models/Product";
import Category from "@/models/Category";

// GET /api/offers - Get active offers for public use
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const url = new URL(request.url);
    const productId = url.searchParams.get("productId");
    const categoryId = url.searchParams.get("categoryId");

    const now = new Date();

    // Build query for active offers
    const query: any = {
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
      $or: [
        { usageLimit: { $exists: false } },
        { $expr: { $lt: ["$usedCount", "$usageLimit"] } },
      ],
    };

    // If specific product or category is requested, filter offers
    if (productId || categoryId) {
      const orConditions: any[] = [{ applicableToAll: true }];

      if (productId) {
        orConditions.push({ productIds: productId });
      }

      if (categoryId) {
        orConditions.push({ categoryIds: categoryId });
      }

      query.$and = [query, { $or: orConditions }];
    }

    const offers = await Offer.find(query).sort({ createdAt: -1 }).lean();

    // Get related products and categories for each offer
    const offersWithDetails = await Promise.all(
      offers.map(async (offer) => {
        const [products, categories] = await Promise.all([
          Product.find({ _id: { $in: offer.productIds } })
            .select("name nameEnglish price originalPrice images")
            .lean(),
          Category.find({ _id: { $in: offer.categoryIds } })
            .select("name nameEnglish")
            .lean(),
        ]);

        return {
          _id: offer._id,
          title: offer.title,
          description: offer.description,
          discountType: offer.discountType,
          discountValue: offer.discountValue,
          minimumOrderAmount: offer.minimumOrderAmount,
          maximumDiscountAmount: offer.maximumDiscountAmount,
          startDate: offer.startDate,
          endDate: offer.endDate,
          applicableToAll: offer.applicableToAll,
          products,
          categories,
        };
      })
    );

    return NextResponse.json({
      success: true,
      offers: offersWithDetails,
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
