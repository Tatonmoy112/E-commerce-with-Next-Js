import { isAuthenticated } from "@/lib/authentication";
import prisma from "@/lib/prisma";
import { catchError, response } from "@/lib/helperFunction";

export async function GET(request, { params }) {
  try {
    const auth = await isAuthenticated("admin", request);
    if (!auth.isAuth) {
      return response(false, 403, "Unauthorized");
    }

    const resolvedParams = await params; 
    const { id } = resolvedParams;

    if (!id) {
      return response(false, 400, "ID is required");
    }

    const product = await prisma.product.findUnique({
      where: { id, deletedAt: null },
      include: {
        media: true,
        category: {
            select: { name: true, slug: true }
        }
      }
    });

    if (!product) {
      return response(false, 404, "Product not found");
    }

    return response(true, 200, "Product Found", product);
  } catch (error) {
    return catchError(error);
  }
}

