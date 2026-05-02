import { isAuthenticated } from "@/lib/authentication";
import { connectDB } from "@/lib/db";
import { catchError, response } from "@/lib/helperFunction";
import CuponModel from "@/models/Cupon.model";


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
    const getCupon = await CuponModel.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    if (!getCupon || !getCupon.length) {
      return response(false, 404, 'No products found');
    }

    return response(true, 200, 'Data Found', getCupon);
  } catch (error) {
    return catchError(error);
  }
}

