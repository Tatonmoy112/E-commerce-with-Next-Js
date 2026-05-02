import { isAuthenticated } from "@/lib/authentication";
import { connectDB } from "@/lib/db";
import { catchError, response } from "@/lib/helperFunction";
import CategoryModel from "@/models/Category.model";

export async function GET(request) {
  try {
       const auth = await isAuthenticated('admin',request)
    if (!auth.isAuth){
        return response(false,403,'Unauthorized')
    }
    await connectDB();

    const filter = {
      deletedAt: null,
    };

    const getCategory = await CategoryModel.findOne(filter)
      .sort({ createdAt: -1 })
      .lean();

    if (!getCategory) {
      return response(false, 404, "Collection empty");
    }

    return response(true, 200, "Data Found", getCategory);
  } catch (error) {
    return catchError(error);
  }
}
