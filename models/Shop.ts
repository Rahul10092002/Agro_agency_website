import mongoose, { type Document, Schema } from "mongoose";

export interface IShop extends Document {
  shopId: string;
  shopName: string;
  shopNameEnglish: string;
  ownerName: string;
  ownerNameEnglish: string;
  address: string;
  addressEnglish: string;
  phone: string;
  whatsapp: string;
  email: string;
  website?: string;
  description?: string;
  descriptionEnglish?: string;
  timings: {
    weekdays: string;
    weekdaysEnglish: string;
    weekends: string;
    weekendsEnglish: string;
  };
  socialMedia: {
    facebook?: string;
    instagram?: string;
    youtube?: string;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Clear existing model to avoid caching issues
if (mongoose.models.Shop) {
  delete mongoose.models.Shop;
}

const ShopSchema = new Schema<IShop>(
  {
    shopId: {
      type: String,
      required: [true, "Shop ID is required"],
      trim: true,
      unique: true,
    },
    shopName: {
      type: String,
      required: [true, "दुकान का नाम आवश्यक है"],
      trim: true,
      maxlength: [200, "नाम 200 अक्षरों से अधिक नहीं हो सकता"],
    },
    shopNameEnglish: {
      type: String,
      required: [true, "Shop name in English is required"],
      trim: true,
      maxlength: [200, "Name cannot be more than 200 characters"],
    },
    ownerName: {
      type: String,
      required: [true, "मालिक का नाम आवश्यक है"],
      trim: true,
      maxlength: [100, "नाम 100 अक्षरों से अधिक नहीं हो सकता"],
    },
    ownerNameEnglish: {
      type: String,
      required: [true, "Owner name in English is required"],
      trim: true,
      maxlength: [100, "Name cannot be more than 100 characters"],
    },
    address: {
      type: String,
      required: [true, "पता आवश्यक है"],
      trim: true,
      maxlength: [500, "पता 500 अक्षरों से अधिक नहीं हो सकता"],
    },
    addressEnglish: {
      type: String,
      required: [true, "Address in English is required"],
      trim: true,
      maxlength: [500, "Address cannot be more than 500 characters"],
    },
    phone: {
      type: String,
      required: [true, "फोन नंबर आवश्यक है"],
      trim: true,
      match: [/^[\+]?[0-9\s\-\(\)]{10,15}$/, "कृपया वैध फोन नंबर दर्ज करें"],
    },
    whatsapp: {
      type: String,
      required: [true, "WhatsApp नंबर आवश्यक है"],
      trim: true,
      match: [
        /^[\+]?[0-9\s\-\(\)]{10,15}$/,
        "कृपया वैध WhatsApp नंबर दर्ज करें",
      ],
    },
    email: {
      type: String,
      required: [true, "ईमेल आवश्यक है"],
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "कृपया वैध ईमेल दर्ज करें",
      ],
    },
    website: {
      type: String,
      trim: true,
      default: "",
      validate: {
        validator: function (v: string) {
          return !v || /^https?:\/\/.+/.test(v);
        },
        message: "कृपया वैध website URL दर्ज करें",
      },
    },
    timings: {
      weekdays: {
        type: String,
        required: [true, "सप्ताह के दिनों का समय आवश्यक है"],
        trim: true,
        default: "सुबह 9:00 - शाम 7:00",
      },
      weekdaysEnglish: {
        type: String,
        required: [true, "Weekdays timings in English are required"],
        trim: true,
        default: "9:00 AM - 7:00 PM",
      },
      weekends: {
        type: String,
        required: [true, "सप्ताहांत का समय आवश्यक है"],
        trim: true,
        default: "सुबह 9:00 - दोपहर 2:00",
      },
      weekendsEnglish: {
        type: String,
        required: [true, "Weekend timings in English are required"],
        trim: true,
        default: "9:00 AM - 2:00 PM",
      },
    },
    socialMedia: {
      facebook: {
        type: String,
        trim: true,
        default: "",
      },
      instagram: {
        type: String,
        trim: true,
        default: "",
      },
      youtube: {
        type: String,
        trim: true,
        default: "",
      },
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "विवरण 1000 अक्षरों से अधिक नहीं हो सकता"],
      default: "",
    },
    descriptionEnglish: {
      type: String,
      trim: true,
      maxlength: [1000, "Description cannot be more than 1000 characters"],
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index for efficient queries
ShopSchema.index({ isActive: 1 });
ShopSchema.index({
  shopName: "text",
  shopNameEnglish: "text",
  ownerName: "text",
  ownerNameEnglish: "text",
});

// Compound unique index for shopId + email (each shop can have unique email)
ShopSchema.index({ shopId: 1, email: 1 }, { unique: true });

export default mongoose.model<IShop>("Shop", ShopSchema);
