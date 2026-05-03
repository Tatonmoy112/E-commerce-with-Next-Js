import prisma from "@/lib/prisma";
import { catchError, response } from "@/lib/helperFunction";

export async function GET() {
  try {
    const product = await prisma.product.findMany({
      where: { deletedAt: null },
      take: 8,
      include: {
        media: true
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!product || product.length === 0) {
      return response(false, 404, "Product not found");
    }

    return response(true, 200, "Product Found", product);
  } catch (error) {
    return catchError(error);
  }
}

