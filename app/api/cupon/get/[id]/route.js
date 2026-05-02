import { connectDB } from "@/lib/db";
import { catchError, response } from "@/lib/helperFunction";
import { isValidObjectId } from "mongoose";
import CuponModel from "@/models/Cupon.model";
import { isAuthenticated } from "@/lib/authentication";

export async function GET(request, context) {
  try {
    const auth = await isAuthenticated("admin", request);
    if (!auth.isAuth) return response(false, 403, "Unauthorized");

    await connectDB();

    const resolved = await context.params;
    const { id } = resolved;

    if (!isValidObjectId(id)) return response(false, 404, "Invalid ObjectId");

    const cupon = await CuponModel.findOne({ _id: id, deletedAt: null }).lean();
    if (!cupon) return response(false, 404, "Cupon not found");

    return response(true, 200, "Cupon Found", cupon);
  } catch (error) {
    return catchError(error);
  }
}
