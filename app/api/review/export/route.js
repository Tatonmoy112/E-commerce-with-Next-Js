import { isAuthenticated } from "@/lib/authentication";
import { connectDB } from "@/lib/db";
import { catchError, response } from "@/lib/helperFunction";
import ReviewModel from "@/models/Review.model";



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
    const getReview = await ReviewModel.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    if (!getReview || !getReview.length) {
      return response(false, 404, 'No products found');
    }

    return response(true, 200, 'Data Found', getReview);
  } catch (error) {
    return catchError(error);
  }
}

