import { type NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import Category from "@/models/Category";
import Offer from "@/models/Offer";
import { authenticateAdmin } from "@/middleware/auth";
import { applyOffersToProducts } from "@/lib/offer-utils";

// GET - Fetch dashboard statistics
export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateAdmin(request);
    if (!("user" in authResult)) {
      return authResult;
    }

    await dbConnect();

    // Get product statistics
    const [
      totalProducts,
      inStockProducts,
      lowStockProducts,
      featuredProducts,
      totalCategories,
      activeOffers,
      mostViewedProductsRaw,
    ] = await Promise.all([
      Product.countDocuments(),
      Product.countDocuments({ inStock: true }),
      Product.countDocuments({ stockQuantity: { $lt: 10 } }),
      Product.countDocuments({ featured: true }),
      Category.countDocuments(),
      Offer.countDocuments({
        isActive: true,
        startDate: { $lte: new Date() },
        endDate: { $gte: new Date() },
      }),
      Product.find({})
        .sort({ views: -1 })
        .limit(5)
        .select("name nameEnglish price unit views images categoryId")
        .lean(),
    ]);

    // Calculate total views
    const viewsAggregation = await Product.aggregate([
      { $group: { _id: null, totalViews: { $sum: "$views" } } },
    ]);
    const totalViews = viewsAggregation[0]?.totalViews || 0;

    // Apply offers to most viewed products
    const mostViewedProducts = await applyOffersToProducts(
      mostViewedProductsRaw
    );

    // Get low stock products for alerts and apply offers
    const lowStockAlertsRaw = await Product.find({ stockQuantity: { $lt: 10 } })
      .sort({ stockQuantity: 1 })
      .limit(5)
      .select("name nameEnglish price unit stockQuantity categoryId")
      .lean();

    const lowStockAlerts = await applyOffersToProducts(lowStockAlertsRaw);

    return NextResponse.json({
      success: true,
      stats: {
        totalProducts,
        inStockProducts,
        outOfStockProducts: totalProducts - inStockProducts,
        lowStockProducts,
        featuredProducts,
        totalCategories,
        totalViews,
        activeOffers,
      },
      mostViewedProducts,
      lowStockAlerts,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      { success: false, message: "सर्वर त्रुटि" },
      { status: 500 }
    );
  }
}
