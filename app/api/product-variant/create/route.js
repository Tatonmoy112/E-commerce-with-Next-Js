import { isAuthenticated } from "@/lib/authentication";
import prisma from "@/lib/prisma";
import { catchError, response } from "@/lib/helperFunction";
import { zschema } from "@/lib/ZodSchema";

export async function POST(request) {
  try {
    const auth = await isAuthenticated('admin', request)
    if (!auth.isAuth){
        return response(false, 403, 'Unauthorized')
    }

    const payload = await request.json();

    const schema = zschema.pick({
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
      return response(false, 400, "Invalid or missing field", validate.error);
    } 
    const variantData = validate.data;

    await prisma.productVariant.create({
      data: {
        color: variantData.color,
        size: variantData.size,
        sku: variantData.sku,
        mrp: variantData.mrp,
        sellingPrice: variantData.sellingPrice,
        discountPercentage: variantData.discountPercentage,
        product: {
          connect: { id: variantData.product }
        },
        media: {
          connect: variantData.media.map(id => ({ id }))
        }
      }
    });

    return response(true, 200, "Product Variant added successfully");
    
  } catch (error) {
    return catchError(error)
  }
}

