import { isAuthenticated } from "@/lib/authentication";
import { connectDB } from "@/lib/db";
import { catchError, response } from "@/lib/helperFunction";
import ProductVariantModel from "@/models/ProductVariant.model";
import { isValidObjectId } from "mongoose";

export async function GET(request, context) {
  try {
    const auth = await isAuthenticated("admin", request);
    if (!auth.isAuth) {
      return response(false, 403, "Unauthorized");
    }

    await connectDB();

    // 👉 params is a Promise, unwrap it (Next.js 15)
    const resolved = await context.params;
    const { id } = resolved;

    console.log("Resolved ID:", id);

    if (!isValidObjectId(id)) {
      return response(false, 404, "Invalid Object ID");
    }

    const productVariant = await ProductVariantModel.findOne({
      _id: id,
      deletedAt: null,
    })
      .populate("media", "asset_id public_id path thumbnail_url secure_url alt title")
      .populate("product", "name slug") 
      .lean();

    if (!productVariant) {
      return response(false, 404, "Product Variant not found");
    }

    return response(true, 200, "Product Variant Found", productVariant);

  } catch (error) {
    return catchError(error);  // ✅ now defined
  }
}
