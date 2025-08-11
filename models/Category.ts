import mongoose, { type Document, Schema } from "mongoose";

export interface ICategory extends Document {
  name: string;
  nameEnglish: string;
  slug: string;
  description?: string;
  icon?: string;
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
      unique: true,
      lowercase: true,
      trim: true,
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

export default mongoose.model<ICategory>("Category", CategorySchema);
