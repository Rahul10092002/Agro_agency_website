import { type NextRequest, NextResponse } from "next/server"
import { authenticateAdmin } from "@/middleware/auth"

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateAdmin(request)

    if ("user" in authResult) {
      return NextResponse.json({
        success: true,
        user: authResult.user,
      })
    } else {
      return authResult // Return the error response
    }
  } catch (error) {
    console.error("Auth check error:", error)
    return NextResponse.json({ success: false, message: "सर्वर त्रुटि" }, { status: 500 })
  }
}
