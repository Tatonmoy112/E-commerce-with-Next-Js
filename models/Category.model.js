import mongoose from "mongoose";
import { lowercase } from "zod";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique:true
    },
    slug: {
      type: String,
      required: true,
      unique:true,
      lowercase:true,
      trim: true
    },
    deletedAt: {
      type: Date,
      default: null,
      index: true
    }
  },
  { timestamps: true }
);

// TTL index to auto-delete expired OTPs
categorySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const CategoryModel = mongoose.models.Category || mongoose.model("Category", categorySchema, "categories");

export default CategoryModel;
