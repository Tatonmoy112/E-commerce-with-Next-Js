import { isAuthenticated } from "@/lib/authentication";
import prisma from "@/lib/prisma";
import { catchError, response } from "@/lib/helperFunction";

export async function GET(request) {
  try {
    const auth = await isAuthenticated('admin', request);
    if (!auth.isAuth) {
      return response(false, 403, 'Unauthorized');
    }

    const products = await prisma.product.findMany({
      where: {
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        mrp: true,
        sellingPrice: true,
        discountPercentage: true,
        categoryId: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      }
    });

    if (!products || !products.length) {
      return response(false, 404, 'No products found');
    }

    return response(true, 200, 'Data Found', products);
  } catch (error) {
    return catchError(error);
  }
}


