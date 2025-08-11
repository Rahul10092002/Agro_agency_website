import { type NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import { applyOffersToProduct } from "@/lib/offer-utils";

// GET - Fetch single product by ID for public view
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const product = await Product.findById(params.id).lean();

    if (!product) {
      return NextResponse.json(
        { success: false, message: "उत्पाद नहीं मिला" },
        { status: 404 }
      );
    }

    // Increment view count
    await Product.findByIdAndUpdate(params.id, { $inc: { views: 1 } });

    // Apply offers to the product
    const productWithOffer = await applyOffersToProduct({
      ...product,
      views: product.views + 1,
    });

    return NextResponse.json({
      success: true,
      product: productWithOffer,
    });
  } catch (error) {
    console.error("Product fetch error:", error);
    return NextResponse.json(
      { success: false, message: "सर्वर त्रुटि" },
      { status: 500 }
    );
  }
}
