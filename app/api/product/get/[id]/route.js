import { isAuthenticated } from "@/lib/authentication";
import { connectDB } from "@/lib/db";
import { catchError, response } from "@/lib/helperFunction";
import ProductModel from "@/models/Product.model";
import { isValidObjectId } from "mongoose";
import MediaModel from "@/models/Media.model";
export async function GET(request, { params }) {
  try {
    const auth = await isAuthenticated("admin", request);
    if (!auth.isAuth) {
      return response(false, 403, "Unauthorized");
    }

    await connectDB();

     const resolvedParams = await params; // <-- unwrap the Promise
    const { id } = resolvedParams;
     console.log("Product ID:", id);

    if (!isValidObjectId(id)) {
      return response(false, 404, "Invalid object id");
    }
    console.log("Product ID:", id);


    const product = await ProductModel.findOne({ _id: id, deletedAt: null })
      .populate("media", "asset_id public_id path thumbnail_url secure_url alt title")
      .populate("category", "name slug")
      .lean();

    if (!product) {
      return response(false, 404, "Product not found");
    }

    return response(true, 200, "Product Found", product);
  } catch (error) {
    return catchError(error);
  }
}
