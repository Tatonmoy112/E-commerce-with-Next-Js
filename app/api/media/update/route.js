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
      alt: true,
      title: true,
    });

    const validate = schema.safeParse(payload);

    if (!validate.success) {
      return response(false, 400, "Invalid or missing field", validate.error);
    }

    const { id, alt, title } = validate.data;

    const getMedia = await prisma.media.findUnique({
      where: { id: id }
    });

    if (!getMedia) {
      return response(false, 404, "Media not found");
    }

    await prisma.media.update({
      where: { id: id },
      data: { alt, title }
    });

    return response(true, 200, "Media Updated successfully");
  } catch (error) {
    return catchError(error);
  }
}

