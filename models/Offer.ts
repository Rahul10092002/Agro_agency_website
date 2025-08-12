import mongoose, { type Document, Schema } from "mongoose";

export interface IOffer extends Document {
  title: string;
  description: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minimumOrderAmount?: number;
  maximumDiscountAmount?: number;
  productIds: string[];
  categoryIds: string[];
  isActive: boolean;
  startDate: Date;
  endDate: Date;
  usageLimit?: number;
  usedCount: number;
  applicableToAll: boolean;
  shopId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Clear existing model to avoid caching issues
if (mongoose.models.Offer) {
  delete mongoose.models.Offer;
}

const OfferSchema = new Schema<IOffer>(
  {
    title: {
      type: String,
      required: [true, "ऑफर का शीर्षक आवश्यक है"],
      trim: true,
      maxlength: [200, "शीर्षक 200 अक्षरों से अधिक नहीं हो सकता"],
    },
    description: {
      type: String,
      required: [true, "ऑफर का विवरण आवश्यक है"],
      trim: true,
      maxlength: [1000, "विवरण 1000 अक्षरों से अधिक नहीं हो सकता"],
    },
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      required: [true, "छूट का प्रकार आवश्यक है"],
      default: "percentage",
    },
    discountValue: {
      type: Number,
      required: [true, "छूट की राशि आवश्यक है"],
      min: [0, "छूट की राशि 0 से कम नहीं हो सकती"],
    },
    minimumOrderAmount: {
      type: Number,
      min: [0, "न्यूनतम ऑर्डर राशि 0 से कम नहीं हो सकती"],
      default: 0,
    },
    maximumDiscountAmount: {
      type: Number,
      min: [0, "अधिकतम छूट राशि 0 से कम नहीं हो सकती"],
    },
    productIds: {
      type: [String],
      default: [],
    },
    categoryIds: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    startDate: {
      type: Date,
      required: [true, "शुरुआती तारीख आवश्यक है"],
    },
    endDate: {
      type: Date,
      required: [true, "समाप्ति तारीख आवश्यक है"],
    },
    usageLimit: {
      type: Number,
      min: [1, "उपयोग सीमा कम से कम 1 होनी चाहिए"],
    },
    usedCount: {
      type: Number,
      default: 0,
      min: [0, "उपयोग की संख्या 0 से कम नहीं हो सकती"],
    },
    applicableToAll: {
      type: Boolean,
      default: false,
    },
    shopId: {
      type: Schema.Types.ObjectId,
      ref: "Shop",
      required: [true, "दुकान ID आवश्यक है"],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Validation to ensure end date is after start date
OfferSchema.pre("save", function (next) {
  if (this.endDate <= this.startDate) {
    next(new Error("समाप्ति तारीख शुरुआती तारीख के बाद होनी चाहिए"));
  } else {
    next();
  }
});

// Virtual to check if offer is currently active
OfferSchema.virtual("isCurrentlyActive").get(function () {
  const now = new Date();
  return (
    this.isActive &&
    this.startDate <= now &&
    this.endDate >= now &&
    (this.usageLimit === undefined || this.usedCount < this.usageLimit)
  );
});

// Index for efficient queries
OfferSchema.index({ shopId: 1, isActive: 1, startDate: 1, endDate: 1 });
OfferSchema.index({ shopId: 1, productIds: 1 });
OfferSchema.index({ shopId: 1, categoryIds: 1 });
OfferSchema.index({ shopId: 1, createdAt: -1 });

export default mongoose.model<IOffer>("Offer", OfferSchema);
