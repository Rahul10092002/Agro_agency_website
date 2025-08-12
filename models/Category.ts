import mongoose, { type Document, Schema } from "mongoose";

export interface ICategory extends Document {
  name: string;
  nameEnglish: string;
  slug: string;
  description?: string;
  icon?: string;
  shopId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Clear existing model to avoid caching issues
if (mongoose.models.Category) {
  delete mongoose.models.Category;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: [true, "श्रेणी का नाम आवश्यक है"],
      trim: true,
      maxlength: [100, "नाम 100 अक्षरों से अधिक नहीं हो सकता"],
    },
    nameEnglish: {
      type: String,
      required: [true, "English name is required"],
      trim: true,
      maxlength: [100, "Name cannot be more than 100 characters"],
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    shopId: {
      type: Schema.Types.ObjectId,
      ref: "Shop",
      required: [true, "दुकान ID आवश्यक है"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "विवरण 500 अक्षरों से अधिक नहीं हो सकता"],
      default: "",
    },
    icon: {
      type: String,
      default: "📦",
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for efficient querying
CategorySchema.index({ slug: 1, shopId: 1 }, { unique: true });
CategorySchema.index({ shopId: 1, createdAt: -1 });
CategorySchema.index({ shopId: 1, name: 1 });

export default mongoose.model<ICategory>("Category", CategorySchema);
