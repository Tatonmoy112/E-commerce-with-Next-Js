import { isAuthenticated } from "@/lib/authentication";
import prisma from "@/lib/prisma";
import { catchError, response } from "@/lib/helperFunction";

export async function GET(request) {
  try {
    const auth = await isAuthenticated('admin', request);
    if (!auth.isAuth) {
      return response(false, 403, 'Unauthorized');
    }

    const reviews = await prisma.review.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        product: { select: { name: true } },
        user: { select: { name: true, email: true } }
      }
    });

    if (!reviews || !reviews.length) {
      return response(false, 404, 'No reviews found');
    }

    // Flatten relational data for export
    const flattenedReviews = reviews.map(review => ({
        ...review,
        productName: review.product?.name,
        userName: review.user?.name,
        userEmail: review.user?.email,
        product: undefined,
        user: undefined
    }));

    return response(true, 200, 'Data Found', flattenedReviews);
  } catch (error) {
    return catchError(error);
  }
}


