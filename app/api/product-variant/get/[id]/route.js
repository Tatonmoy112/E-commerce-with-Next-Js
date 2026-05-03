import { isAuthenticated } from "@/lib/authentication";
import prisma from "@/lib/prisma";
import { catchError, response } from "@/lib/helperFunction";

export async function GET(request, context) {
  try {
    const auth = await isAuthenticated("admin", request);
    if (!auth.isAuth) {
      return response(false, 403, "Unauthorized");
    }

    const resolved = await context.params;
    const { id } = resolved;

    if (!id) {
      return response(false, 400, "ID is required");
    }

    const productVariant = await prisma.productVariant.findUnique({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        media: true,
        product: {
            select: { name: true, slug: true }
        }
      }
    });

    if (!productVariant) {
      return response(false, 404, "Product Variant not found");
    }

    return response(true, 200, "Product Variant Found", productVariant);

  } catch (error) {
    return catchError(error);
  }
}

