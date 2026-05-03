import prisma from "@/lib/prisma";
import { catchError, response } from "@/lib/helperFunction";

export async function GET() {
  try {
    const colorsData = await prisma.productVariant.findMany({
      where: { deletedAt: null },
      select: { color: true },
      distinct: ['color'],
    });

    const colors = colorsData.map(c => c.color);

    if (!colors.length) {
      return response(false, 404, "Colors not found");
    }

    return response(true, 200, "Colors Found", colors);
  } catch (error) {
    return catchError(error);
  }
}

