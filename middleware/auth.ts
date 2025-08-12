import { type NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/mongodb";
import AdminUser from "@/models/AdminUser";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export async function authenticateAdmin(request: NextRequest) {
  try {
    const token = request.cookies.get("admin-token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "प्राधिकरण टोकन नहीं मिला" },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;

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

    const user = await AdminUser.findOne({
      _id: decoded.id,
      shopId,
    }).select("-passwordHash");

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "अवैध टोकन या आप इस दुकान के व्यवस्थापक नहीं हैं",
        },
        { status: 401 }
      );
    }

    return { user };
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "अवैध टोकन" },
      { status: 401 }
    );
  }
}

export function generateToken(userId: string) {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: "7d" });
}
