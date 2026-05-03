import { isAuthenticated } from "@/lib/authentication";
import prisma from "@/lib/prisma";
import { catchError, response } from "@/lib/helperFunction";

export async function GET(request) {
  try {
    const auth = await isAuthenticated('user', request);
    if (!auth.isAuth) {
      return response(false, 401, "Please login to view orders");
    }

    const orders = await prisma.order.findMany({
      where: {
        userId: auth.userId,
        deletedAt: null
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                media: {
                  take: 1
                }
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return response(true, 200, "Orders fetched successfully", orders);
  } catch (error) {
    return catchError(error);
  }
}
