import prisma from "@/lib/prisma";
import { catchError, response } from "@/lib/helperFunction";
import { isAuthenticated } from "@/lib/authentication";

export async function GET(request, context) {
  try {
    const auth = await isAuthenticated("admin", request);
    if (!auth.isAuth) return response(false, 403, "Unauthorized");

    const resolved = await context.params;
    const { id } = resolved;

    if (!id) return response(false, 400, "ID is required");

    const coupon = await prisma.cupon.findUnique({
      where: { id, deletedAt: null }
    });

    if (!coupon) return response(false, 404, "Coupon not found");

    return response(true, 200, "Coupon Found", coupon);
  } catch (error) {
    return catchError(error);
  }
}

