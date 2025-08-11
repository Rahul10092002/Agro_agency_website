import { type NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Category from "@/models/Category";
import Product from "@/models/Product";
import { authenticateAdmin } from "@/middleware/auth";

// GET - Fetch single category
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

    const category = await Category.findById(params.id).lean();

    if (!category) {
      return NextResponse.json(
        { success: false, message: "श्रेणी नहीं मिली" },
        { status: 404 }
      );
    }

    // Get product count for this category
    const productCount = await Product.countDocuments({
      categoryId: params.id,
    });

    return NextResponse.json({
      success: true,
      category: {
        ...category,
        productCount,
      },
    });
  } catch (error) {
    console.error("Category fetch error:", error);
    return NextResponse.json(
      { success: false, message: "सर्वर त्रुटि" },
      { status: 500 }
    );
  }
}

// PUT - Update category
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

    const updateData = await request.json();
    updateData.updatedAt = new Date();

    const category = await Category.findByIdAndUpdate(params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!category) {
      return NextResponse.json(
        { success: false, message: "श्रेणी नहीं मिली" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "श्रेणी सफलतापूर्वक अपडेट की गई",
      category,
    });
  } catch (error) {
    console.error("Category update error:", error);
    return NextResponse.json(
      { success: false, message: "सर्वर त्रुटि" },
      { status: 500 }
    );
  }
}

// DELETE - Delete category
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

    // Check if category has products
    const productCount = await Product.countDocuments({
      categoryId: params.id,
    });
    if (productCount > 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "इस श्रेणी में उत्पाद हैं। पहले उत्पादों को हटाएं या दूसरी श्रेणी में स्थानांतरित करें।",
        },
        { status: 400 }
      );
    }

    const category = await Category.findByIdAndDelete(params.id);

    if (!category) {
      return NextResponse.json(
        { success: false, message: "श्रेणी नहीं मिली" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "श्रेणी सफलतापूर्वक हटाई गई",
    });
  } catch (error) {
    console.error("Category deletion error:", error);
    return NextResponse.json(
      { success: false, message: "सर्वर त्रुटि" },
      { status: 500 }
    );
  }
}
