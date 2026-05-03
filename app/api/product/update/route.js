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

    const schema = zschema.pick({
      id: true,
      name: true,
      slug: true,
      description: true,
      mrp: true,
      sellingPrice: true,
      discountPercentage: true,
      category: true,
      media: true,
    });

    const validate = schema.safeParse(payload);
    if (!validate.success) {
      return response(false, 400, "Invalid or missing fields", validate.error);
    }

    const {
      id,
      name,
      slug,
      description,
      mrp,
      sellingPrice,
      discountPercentage,
      category,
      media,
    } = validate.data;

    // Find product first
    const product = await prisma.product.findUnique({
      where: {
        id: id,
        deletedAt: null,
      }
    });

    if (!product) {
      return response(false, 404, "Product not found");
    }

    // Update product fields
    await prisma.product.update({
      where: { id: id },
      data: {
        name,
        slug,
        description,
        mrp,
        sellingPrice,
        discountPercentage,
        category: {
          connect: { id: category }
        },
        media: {
          set: media.map(id => ({ id }))
        }
      }
    });


    return response(true, 200, "Product updated successfully");
  } catch (error) {
    return catchError(error);
  }
}

