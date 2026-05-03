import { isAuthenticated } from "@/lib/authentication";
import prisma from "@/lib/prisma";
import { catchError, response } from "@/lib/helperFunction";

export async function GET(request) {
  try {
    const auth = await isAuthenticated('admin', request);
    if (!auth.isAuth) {
      return response(false, 403, 'Unauthorized');
    }

    const variants = await prisma.productVariant.findMany({
      where: {
        deletedAt: null,
      },
      select: {
        id: true,
        productId: true,
        sku: true,
        color: true,
        size: true,
        mrp: true,
        sellingPrice: true,
        discountPercentage: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      }
    });

    if (!variants || !variants.length) {
      return response(false, 404, 'No variants found');
    }

    return response(true, 200, 'Data Found', variants);
  } catch (error) {
    return catchError(error);
  }
}


