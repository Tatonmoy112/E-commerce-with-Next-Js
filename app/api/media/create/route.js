import { isAuthenticated } from "@/lib/authentication";
import cloudinary from "@/lib/cloudinary";
import prisma from "@/lib/prisma";
import { catchError, response } from "@/lib/helperFunction";

export async function POST(request) {
  const payload = await request.json();

  try {
    const auth = await isAuthenticated("admin", request);

    if (!auth.isAuth) {
      return response(false, 403, "Unauthorized");
    }

    // createMany returns the count of inserted records
    await prisma.media.createMany({
      data: payload,
    });

    // Fetch the newly created media if needed, or just return success
    // For simplicity and matching Mongoose insertMany behavior as much as possible:
    return response(true, 200, "Media uploaded successfully", payload);

  } catch (error) {
    if (payload && payload.length > 0) {
      const publicIds = payload.map(data => data.public_id);

      try {
        await cloudinary.api.delete_resources(publicIds);
      } catch (deleteError) {
        error.cloudinary = deleteError;
      }
    }

    return catchError(error);
  }
}

