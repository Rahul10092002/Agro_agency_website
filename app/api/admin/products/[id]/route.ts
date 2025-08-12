import { type NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import { authenticateAdmin } from "@/middleware/auth";

// GET - Fetch single product
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

    const product = await Product.findOne({
      _id: params.id,
      shopId,
    }).lean();

    if (!product) {
      return NextResponse.json(
        { success: false, message: "उत्पाद नहीं मिला" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Product fetch error:", error);
    return NextResponse.json(
      { success: false, message: "सर्वर त्रुटि" },
      { status: 500 }
    );
  }
}

// PUT - Update product
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

    const updateData = await request.json();
    updateData.updatedAt = new Date();

    const product = await Product.findOneAndUpdate(
      { _id: params.id, shopId },
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!product) {
      return NextResponse.json(
        { success: false, message: "उत्पाद नहीं मिला" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "उत्पाद सफलतापूर्वक अपडेट किया गया",
      product,
    });
  } catch (error) {
    console.error("Product update error:", error);
    return NextResponse.json(
      { success: false, message: "सर्वर त्रुटि" },
      { status: 500 }
    );
  }
}

// DELETE - Delete product
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

    const product = await Product.findOneAndDelete({
      _id: params.id,
      shopId,
    });

    if (!product) {
      return NextResponse.json(
        { success: false, message: "उत्पाद नहीं मिला" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "उत्पाद सफलतापूर्वक हटाया गया",
    });
  } catch (error) {
    console.error("Product deletion error:", error);
    return NextResponse.json(
      { success: false, message: "सर्वर त्रुटि" },
      { status: 500 }
    );
  }
}
