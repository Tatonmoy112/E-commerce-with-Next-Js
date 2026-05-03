import { isAuthenticated } from "@/lib/authentication";
import prisma from "@/lib/prisma";
import { catchError, response } from "@/lib/helperFunction";

export async function PUT(request) {
  try {
    const auth = await isAuthenticated('user', request);
    if (!auth.isAuth) {
      return response(false, 401, "Please login to update profile");
    }

    const payload = await request.json();
    const { name, phone, address } = payload;

    const updatedUser = await prisma.user.update({
      where: { id: auth.userId },
      data: {
        name,
        phone,
        address
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        avatar_url: true,
        role: true
      }
    });

    return response(true, 200, "Profile updated successfully", updatedUser);
  } catch (error) {
    return catchError(error);
  }
}
