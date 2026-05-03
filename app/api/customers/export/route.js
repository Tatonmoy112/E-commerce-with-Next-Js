import { isAuthenticated } from "@/lib/authentication";
import prisma from "@/lib/prisma";
import { catchError, response } from "@/lib/helperFunction";

export async function GET(request) {
  try {
    const auth = await isAuthenticated('admin', request);
    if (!auth.isAuth) {
      return response(false, 403, 'Unauthorized');
    }

    const users = await prisma.user.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        role: true,
        isEmailVerified: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    if (!users || !users.length) {
      return response(false, 404, 'No customers found');
    }

    return response(true, 200, 'Data Found', users);
  } catch (error) {
    return catchError(error);
  }
}


