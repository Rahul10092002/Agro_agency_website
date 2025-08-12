import { type NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
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

    await connectDB();

    // Get shopId from environment variable
    const shopId = process.env.SHOP_ID;
    if (!shopId) {
      return NextResponse.json(
        { success: false, message: "Shop ID not configured" },
        { status: 500 }
      );
    }

    // Get product statistics for the specific shop
    const [
      totalProducts,
      inStockProducts,
      lowStockProducts,
      featuredProducts,
      totalCategories,
      activeOffers,
      mostViewedProductsRaw,
    ] = await Promise.all([
      Product.countDocuments({ shopId }),
      Product.countDocuments({ shopId, inStock: true }),
      Product.countDocuments({ shopId, stockQuantity: { $lt: 10 } }),
      Product.countDocuments({ shopId, featured: true }),
      Category.countDocuments({ shopId }),
      Offer.countDocuments({
        shopId,
        isActive: true,
        startDate: { $lte: new Date() },
        endDate: { $gte: new Date() },
      }),
      Product.find({ shopId })
        .sort({ views: -1 })
        .limit(5)
        .select("name nameEnglish price unit views images categoryId")
        .lean(),
    ]);

    // Calculate total views for the specific shop
    const viewsAggregation = await Product.aggregate([
      { $match: { shopId } },
      { $group: { _id: null, totalViews: { $sum: "$views" } } },
    ]);
    const totalViews = viewsAggregation[0]?.totalViews || 0;

    // Apply offers to most viewed products
    const mostViewedProducts = await applyOffersToProducts(
      mostViewedProductsRaw
    );

    // Get low stock products for alerts and apply offers for the specific shop
    const lowStockAlertsRaw = await Product.find({
      shopId,
      stockQuantity: { $lt: 10 },
    })
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
