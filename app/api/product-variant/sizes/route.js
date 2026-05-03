import prisma from "@/lib/prisma";
import { catchError, response } from "@/lib/helperFunction";

export async function GET() {
  try {
    const sizesData = await prisma.productVariant.findMany({
      where: { deletedAt: null },
      select: { size: true },
      distinct: ['size'],
      orderBy: { createdAt: 'asc' }
    });

    const sizes = sizesData.map(s => s.size);

    if (!sizes.length) {
      return response(false, 404, "Sizes not found");
    }

    return response(true, 200, "Sizes Found", sizes);
  } catch (error) {
    return catchError(error);
  }
}

