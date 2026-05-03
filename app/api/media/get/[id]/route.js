import { isAuthenticated } from "@/lib/authentication";
import prisma from "@/lib/prisma";
import { catchError, response } from "@/lib/helperFunction";

export async function GET(request, { params }) {
  try {
    const auth = await isAuthenticated('admin', request)
    if (!auth.isAuth){
        return response(false, 403, 'Unauthorized')
    }

    const getParams = await params;
    const id = getParams.id;

    if (!id) {
      return response(false, 400, "ID is required");
    }

    const getMedia = await prisma.media.findUnique({
      where: {
        id,
        deletedAt: null,
      }
    });

    if (!getMedia) {
      return response(false, 404, "Media not found");
    }

    return response(true, 200, "Media Found", getMedia);
  } catch (error) {
    return catchError(error);
  }
}

