import prisma from "@/lib/prisma";
import { catchError, response } from "@/lib/helperFunction";

export async function GET() {
  try {
    const getCategory = await prisma.category.findMany({
      where: { deletedAt: null }
    });

    if (!getCategory || getCategory.length === 0) {
      return response(false, 404, "Category not found");
    }

    return response(true, 200, "Category Found", getCategory);
  } catch (error) {
    return catchError(error);
  }
}

