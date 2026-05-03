import { isAuthenticated } from "@/lib/authentication";
import prisma from "@/lib/prisma";
import { catchError, response } from "@/lib/helperFunction";

export async function GET(request) {
  try {
    const auth = await isAuthenticated('admin', request)
    if (!auth.isAuth){
        return response(false, 403, 'Unauthorized')
    }

    const categories = await prisma.category.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      }
    });

    if (!categories || !categories.length) {
      return response(false, 404, "Collection empty");
    }

    return response(true, 200, "Data Found", categories);
  } catch (error) {
    return catchError(error);
  }
}

