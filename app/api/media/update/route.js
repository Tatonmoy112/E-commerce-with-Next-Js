import { isAuthenticated } from "@/lib/authentication";
import { connectDB } from "@/lib/db";
import { catchError, response } from "@/lib/helperFunction";
import { zschema } from "@/lib/ZodSchema";
import MediaModel from "@/models/Media.model";
import { isValidObjectId } from "mongoose";

export async function PUT(request) {
  try {
        const auth = await isAuthenticated('admin',request)
    if (!auth.isAuth){
        return response(false,403,'Unauthorized')
    }
    await connectDB();
    const payload = await request.json();

    const schema = zschema.pick({
      _id: true,
      alt: true,
      title: true,
    });

    const validate = schema.safeParse(payload);

    if (!validate.success) {
      return response(false, 400, "Invalid or missing field", validate.error);
    }

    const { _id, alt, title } = validate.data;
    if (!isValidObjectId(_id)) {
      return response(false, 400, "Invalid object id");
    }
    const getMedia = await MediaModel.findById(_id);

    if (!getMedia) {
      return response(false, 404, "Media not found");
    }
    getMedia.alt = alt;
    getMedia.title = title;
    await getMedia.save();

    return response(true, 200, "Media Updated successfully");
  } catch (error) {
    return catchError(error);
  }
}
