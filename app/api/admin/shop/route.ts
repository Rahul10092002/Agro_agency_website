import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Shop from "@/models/Shop";
import { authenticateAdmin } from "@/middleware/auth";

export async function PUT(req: NextRequest) {
  try {
    // Check admin authentication
    const authResult = await authenticateAdmin(req);
    if (!authResult.user) {
      return authResult; // Return the error response from authenticateAdmin
    }

    await dbConnect();

    const shopId = process.env.SHOP_ID;
    if (!shopId) {
      return NextResponse.json(
        { success: false, message: "Shop ID not configured" },
        { status: 500 }
      );
    }

    // Parse request body
    const body = await req.json();

    // Validate required fields
    const requiredFields = [
      "shopName",
      "shopNameEnglish",
      "ownerName",
      "ownerNameEnglish",
      "address",
      "addressEnglish",
      "phone",
      "whatsapp",
      "email",
    ];

    for (const field of requiredFields) {
      if (!body[field] || body[field].trim() === "") {
        return NextResponse.json(
          {
            success: false,
            message: `फील्ड '${field}' आवश्यक है`,
          },
          { status: 400 }
        );
      }
    }

    // Validate timings structure
    if (
      !body.timings ||
      !body.timings.weekdays ||
      !body.timings.weekdaysEnglish ||
      !body.timings.weekends ||
      !body.timings.weekendsEnglish
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "समय सारिणी की जानकारी अधूरी है",
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        {
          success: false,
          message: "गलत ईमेल फॉर्मेट",
        },
        { status: 400 }
      );
    }

    // Validate phone numbers (basic validation)
    const phoneRegex = /^[\+]?[0-9\-\s\(\)]{10,15}$/;
    if (!phoneRegex.test(body.phone)) {
      return NextResponse.json(
        {
          success: false,
          message: "गलत फोन नंबर फॉर्मेट",
        },
        { status: 400 }
      );
    }

    if (!phoneRegex.test(body.whatsapp)) {
      return NextResponse.json(
        {
          success: false,
          message: "गलत WhatsApp नंबर फॉर्मेट",
        },
        { status: 400 }
      );
    }

    // Validate website URL if provided
    if (body.website && body.website.trim() !== "") {
      try {
        new URL(body.website);
      } catch {
        return NextResponse.json(
          {
            success: false,
            message: "गलत वेबसाइट URL फॉर्मेट",
          },
          { status: 400 }
        );
      }
    }

    // Validate social media URLs if provided
    const socialMediaFields = ["facebook", "instagram", "youtube"];
    if (body.socialMedia) {
      for (const field of socialMediaFields) {
        if (body.socialMedia[field] && body.socialMedia[field].trim() !== "") {
          try {
            new URL(body.socialMedia[field]);
          } catch {
            return NextResponse.json(
              {
                success: false,
                message: `गलत ${field} URL फॉर्मेट`,
              },
              { status: 400 }
            );
          }
        }
      }
    }

    // Prepare update data
    const updateData = {
      shopId,
      shopName: body.shopName.trim(),
      shopNameEnglish: body.shopNameEnglish.trim(),
      ownerName: body.ownerName.trim(),
      ownerNameEnglish: body.ownerNameEnglish.trim(),
      address: body.address.trim(),
      addressEnglish: body.addressEnglish.trim(),
      phone: body.phone.trim(),
      whatsapp: body.whatsapp.trim(),
      email: body.email.trim().toLowerCase(),
      website: body.website ? body.website.trim() : "",
      description: body.description ? body.description.trim() : "",
      descriptionEnglish: body.descriptionEnglish
        ? body.descriptionEnglish.trim()
        : "",
      timings: {
        weekdays: body.timings.weekdays.trim(),
        weekdaysEnglish: body.timings.weekdaysEnglish.trim(),
        weekends: body.timings.weekends.trim(),
        weekendsEnglish: body.timings.weekendsEnglish.trim(),
      },
      socialMedia: {
        facebook: body.socialMedia?.facebook
          ? body.socialMedia.facebook.trim()
          : "",
        instagram: body.socialMedia?.instagram
          ? body.socialMedia.instagram.trim()
          : "",
        youtube: body.socialMedia?.youtube
          ? body.socialMedia.youtube.trim()
          : "",
      },
      updatedAt: new Date(),
    };

    // Update shop details
    const updatedShop = await Shop.findOneAndUpdate({ shopId }, updateData, {
      new: true,
      runValidators: true,
      // Create if doesn't exist (upsert)
      upsert: true,
      setDefaultsOnInsert: true,
    });

    if (!updatedShop) {
      return NextResponse.json(
        { success: false, message: "दुकान अपडेट करने में त्रुटि" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "दुकान की जानकारी सफलतापूर्वक अपडेट हो गई",
      data: updatedShop,
    });
  } catch (error) {
    console.error("Error updating shop:", error);

    // Handle mongoose validation errors
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(
        (err: any) => err.message
      );
      return NextResponse.json(
        {
          success: false,
          message: "डेटा वेलिडेशन त्रुटि",
          errors: validationErrors,
        },
        { status: 400 }
      );
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          message: "यह ईमेल या फोन नंबर पहले से मौजूद है",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: "सर्वर त्रुटि" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    // Check admin authentication
    const authResult = await authenticateAdmin(req);
    if (!authResult.user) {
      return authResult; // Return the error response from authenticateAdmin
    }

    await dbConnect();

    const shopId = process.env.SHOP_ID;
    if (!shopId) {
      return NextResponse.json(
        { success: false, message: "Shop ID not configured" },
        { status: 500 }
      );
    }

    // Get shop details
    const shop = await Shop.findOne({ shopId });

    if (!shop) {
      return NextResponse.json(
        { success: false, message: "दुकान की जानकारी नहीं मिली" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: shop,
    });
  } catch (error) {
    console.error("Error fetching shop details:", error);
    return NextResponse.json(
      { success: false, message: "सर्वर त्रुटि" },
      { status: 500 }
    );
  }
}
