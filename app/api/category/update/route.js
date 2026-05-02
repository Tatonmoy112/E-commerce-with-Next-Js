import { connectDB } from "@/lib/db";
import { catchError, response } from "@/lib/helperFunction";
import { zschema } from "@/lib/ZodSchema";
import CategoryModel from "@/models/Category.model";

export async function PUT(request) {
  try {
    // Optional authentication check
    // const auth = await isAuthenticated('admin')
    // if (!auth.isAuth){
    //     return response(false,403,'Unauthorized')
    // }

    await connectDB();
    const payload = await request.json();

    // Validate payload
    const schema = zschema.pick({
      _id: true,
      name: true,
      slug: true,
    });

    const validate = schema.safeParse(payload);

    if (!validate.success) {
      return response(false, 400, "Invalid or missing field", validate.error);
    }

    const { _id, name, slug } = validate.data;

    // Correctly fetch category without `new`
    const getCategory = await CategoryModel.findOne({
      deletedAt: null,
      _id: _id,
    });

    if (!getCategory) {
      return response(false, 404, "Data not found");
    }

    // Update fields
    getCategory.name = name;
    getCategory.slug = slug;

    await getCategory.save();

    return response(true, 200, "Category updated successfully");

  } catch (error) {
    return catchError(error);
  }
}
