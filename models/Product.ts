import mongoose, { type Document, Schema } from "mongoose";

export interface IProduct extends Document {
  name: string;
  nameEnglish: string;
  price: number;
  originalPrice?: number;
  unit: string;
  categoryId: string;
  shopId: string;
  description?: string;
  usageInstructions?: string;
  benefits?: string[];
  precautions?: string[];
  images: string[];
  inStock: boolean;
  stockQuantity: number;
  featured: boolean;
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

// Clear existing model to avoid caching issues
if (mongoose.models.Product) {
  delete mongoose.models.Product;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, "उत्पाद का नाम आवश्यक है"],
      trim: true,
      maxlength: [200, "नाम 200 अक्षरों से अधिक नहीं हो सकता"],
    },
    nameEnglish: {
      type: String,
      required: [true, "English name is required"],
      trim: true,
      maxlength: [200, "Name cannot be more than 200 characters"],
    },
    price: {
      type: Number,
      required: [true, "कीमत आवश्यक है"],
      min: [0, "कीमत 0 से कम नहीं हो सकती"],
    },
    originalPrice: {
      type: Number,
      min: [0, "मूल कीमत 0 से कम नहीं हो सकती"],
    },
    unit: {
      type: String,
      required: [true, "इकाई आवश्यक है"],
      trim: true,
    },
    categoryId: {
      type: String,
      required: [true, "श्रेणी आवश्यक है"],
    },
    shopId: {
      type: Schema.Types.ObjectId,
      ref: "Shop",
      required: [true, "दुकान ID आवश्यक है"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, "विवरण 2000 अक्षरों से अधिक नहीं हो सकता"],
      default: "",
    },
    usageInstructions: {
      type: String,
      trim: true,
      maxlength: [1000, "उपयोग विधि 1000 अक्षरों से अधिक नहीं हो सकती"],
      default: "",
    },
    benefits: {
      type: [String],
      default: [],
    },
    precautions: {
      type: [String],
      default: [],
    },
    images: {
      type: [String],
      default: [],
    },
    inStock: {
      type: Boolean,
      default: true,
    },
    stockQuantity: {
      type: Number,
      default: 0,
      min: [0, "स्टॉक मात्रा 0 से कम नहीं हो सकती"],
    },
    featured: {
      type: Boolean,
      default: false,
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index for search functionality
ProductSchema.index({ name: "text", nameEnglish: "text", description: "text" });
ProductSchema.index({ categoryId: 1 });
ProductSchema.index({ shopId: 1 });
ProductSchema.index({ inStock: 1 });
ProductSchema.index({ featured: 1 });
ProductSchema.index({ shopId: 1, categoryId: 1 });
ProductSchema.index({ shopId: 1, featured: 1 });

// Virtual to calculate effective price after offers
ProductSchema.virtual("effectivePrice").get(function () {
  // This will be calculated at runtime when offers are applied
  return this.originalPrice && this.originalPrice > this.price
    ? this.price
    : this.price;
});

// Virtual to check if product has discount
ProductSchema.virtual("hasDiscount").get(function () {
  return this.originalPrice && this.originalPrice > this.price;
});

// Virtual to calculate discount percentage
ProductSchema.virtual("discountPercentage").get(function () {
  if (this.originalPrice && this.originalPrice > this.price) {
    return Math.round(
      ((this.originalPrice - this.price) / this.originalPrice) * 100
    );
  }
  return 0;
});

export default mongoose.model<IProduct>("Product", ProductSchema);
