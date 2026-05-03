import { isAuthenticated } from "@/lib/authentication";
import prisma from "@/lib/prisma";
import { catchError, response } from "@/lib/helperFunction";

export async function GET(request) {
  try {
    const auth = await isAuthenticated('admin', request);
    if (!auth.isAuth) {
      return response(false, 403, 'Unauthorized');
    }

    const coupons = await prisma.cupon.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      }
    });

    if (!coupons || !coupons.length) {
      return response(false, 404, 'No coupons found');
    }

    return response(true, 200, 'Data Found', coupons);
  } catch (error) {
    return catchError(error);
  }
}


