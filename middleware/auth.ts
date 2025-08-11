import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import dbConnect from "@/lib/mongodb"
import AdminUser from "@/models/AdminUser"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string
    email: string
    name: string
    role: string
  }
}

export async function authenticateAdmin(request: NextRequest) {
  try {
    const token = request.cookies.get("admin-token")?.value

    if (!token) {
      return NextResponse.json({ success: false, message: "प्राधिकरण टोकन नहीं मिला" }, { status: 401 })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any

    await dbConnect()
    const user = await AdminUser.findById(decoded.id).select("-passwordHash")

    if (!user) {
      return NextResponse.json({ success: false, message: "अवैध टोकन" }, { status: 401 })
    }

    return { user }
  } catch (error) {
    return NextResponse.json({ success: false, message: "अवैध टोकन" }, { status: 401 })
  }
}

export function generateToken(userId: string) {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: "7d" })
}
