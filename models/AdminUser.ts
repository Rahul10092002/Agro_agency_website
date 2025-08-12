import mongoose, { type Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";

export interface IAdminUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: "admin";
  shopId: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const AdminUserSchema = new Schema<IAdminUser>(
  {
    name: {
      type: String,
      required: [true, "नाम आवश्यक है"],
      trim: true,
      maxlength: [100, "नाम 100 अक्षरों से अधिक नहीं हो सकता"],
    },
    email: {
      type: String,
      required: [true, "ईमेल आवश्यक है"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "कृपया वैध ईमेल दर्ज करें",
      ],
    },
    passwordHash: {
      type: String,
      required: [true, "पासवर्ड आवश्यक है"],
      minlength: [6, "पासवर्ड कम से कम 6 अक्षरों का होना चाहिए"],
    },
    role: {
      type: String,
      required: true,
      enum: ["admin"],
      default: "admin",
    },
    shopId: {
      type: Schema.Types.ObjectId,
      ref: "Shop",
      required: [true, "दुकान ID आवश्यक है"],
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for efficient querying
AdminUserSchema.index({ email: 1, shopId: 1 }, { unique: true });
AdminUserSchema.index({ shopId: 1 });

// Hash password before saving
AdminUserSchema.pre("save", async function (next) {
  if (!this.isModified("passwordHash")) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
AdminUserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

export default mongoose.models.AdminUser ||
  mongoose.model<IAdminUser>("AdminUser", AdminUserSchema);
