import { connectDB } from "@/lib/db";
import { catchError, response } from "@/lib/helperFunction";
import ProductModel from "@/models/Product.model";
import MediaModel from "@/models/Media.model";
export async function GET() {
  try {
    await connectDB();
    const product = await ProductModel.find({  deletedAt: null })
      .populate("media", "asset_id public_id path thumbnail_url secure_url alt title")
      .limit(8)
      .lean();

    if (!product) {
      return response(false, 404, "Product not found");
    }

    return response(true, 200, "Product Found", product);
  } catch (error) {
    return catchError(error);
  }
}
