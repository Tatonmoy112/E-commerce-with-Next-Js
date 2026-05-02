import { isAuthenticated } from "@/lib/authentication";
import { connectDB } from "@/lib/db";
import { catchError, response } from "@/lib/helperFunction";
import ProductVariantModel from "@/models/ProductVariant.model";


export async function GET(request) {
  try {
    const auth = await isAuthenticated('admin', request);
    if (!auth.isAuth) {
      return response(false, 403, 'Unauthorized');
    }

    await connectDB();

    const filter = {
      deletedAt: null,
    };

    // Return all products as an array
    const getProductVariants = await ProductVariantModel.find(filter)
      .select('-media ') // exclude large fields
      .sort({ createdAt: -1 })
      .lean();

    if (!getProductVariants || !getProductVariants.length) {
      return response(false, 404, 'No products found');
    }

    return response(true, 200, 'Data Found', getProductVariants);
  } catch (error) {
    return catchError(error);
  }
}

