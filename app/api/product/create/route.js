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
      name: true,
      slug: true,
      category: true,
      mrp: true,
      sellingPrice: true,
      discountPercentage: true,
      media: true,
      description: true,
    });

    const validate = schema.safeParse(payload);

    if (!validate.success) {
      return response(false, 400, "Invalid or missing field", validate.error);
    } 
    const { name, slug, mrp, sellingPrice, discountPercentage, media, description, category } = validate.data;

    await prisma.product.create({
      data: {
        name,
        slug,
        mrp,
        sellingPrice,
        discountPercentage,
        description,
        category: {
          connect: { id: category }
        },
        media: {
          connect: media.map(id => ({ id }))
        }
      }
    });

    return response(true, 200, "Product added successfully");
    
  } catch (error) {
    return catchError(error)
  }
}


