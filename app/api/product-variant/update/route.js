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
      product: true,
      sku: true,
      color: true,
      size: true,
      mrp: true,
      sellingPrice: true,
      discountPercentage: true,
      media: true,
    });

    const validate = schema.safeParse(payload);
    if (!validate.success) {
      return response(false, 400, "Invalid or missing fields", validate.error);
    }

    const {
      id,
      product,
      color,
      size,
      sku,
      mrp,
      sellingPrice,
      discountPercentage,
      media,
    } = validate.data;

    // Find variant first
    const productVariant = await prisma.productVariant.findUnique({
      where: {
        id: id,
        deletedAt: null,
      }
    });

    if (!productVariant) {
      return response(false, 404, "Product Variant not found");
    }

    // Update productVariant fields
    await prisma.productVariant.update({
      where: { id: id },
      data: {
        product: { connect: { id: product } },
        color,
        size,
        sku,
        mrp,
        sellingPrice,
        discountPercentage,
        media: {
          set: [], // Clear existing
          connect: (media || []).map(id => ({ id }))
        }
      }
    });

    return response(true, 200, "Product Variant updated successfully");
  } catch (error) {
    return catchError(error);
  }
}

