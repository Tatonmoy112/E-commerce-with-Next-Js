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
    });

    const validate = schema.safeParse(payload);

    if (!validate.success) {
      return response(false, 400, "Invalid or missing field", validate.error);
    } 
    const { name, slug } = payload;
    
    const isExist = await prisma.category.findFirst({
      where: {
        OR: [
          { name },
          { slug }
        ]
      }
    });

    if (isExist) {
      return response(false, 400, "Duplicate field: name or slug already exists.");
    }

    await prisma.category.create({
      data: {
        name,
        slug
      }
    });

    return response(true, 200, "Category added successfully");
    
  } catch (error) {
    return catchError(error)
  }
}

