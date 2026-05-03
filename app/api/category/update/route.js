import { isAuthenticated } from "@/lib/authentication";
import prisma from "@/lib/prisma";
import { catchError, response } from "@/lib/helperFunction";
import { zschema } from "@/lib/ZodSchema";

export async function PUT(request) {
  try {
    const auth = await isAuthenticated('admin', request)
    if (!auth.isAuth){
        return response(false, 403, 'Unauthorized')
    }

    const payload = await request.json();

    // Validate payload
    const schema = zschema.pick({
      id: true,
      name: true,
      slug: true,
    });

    const validate = schema.safeParse(payload);

    if (!validate.success) {
      return response(false, 400, "Invalid or missing field", validate.error);
    }

    const { id, name, slug } = validate.data;

    const getCategory = await prisma.category.findUnique({
      where: {
        id: id,
        deletedAt: null,
      }
    });

    if (!getCategory) {
      return response(false, 404, "Data not found");
    }

    await prisma.category.update({
      where: { id: id },
      data: {
        name,
        slug
      }
    });

    return response(true, 200, "Category updated successfully");

  } catch (error) {
    return catchError(error);
  }
}

