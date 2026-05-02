import { isAuthenticated } from "@/lib/authentication";
import { connectDB } from "@/lib/db";
import { catchError, response } from "@/lib/helperFunction";
import { zschema } from "@/lib/ZodSchema";
import CategoryModel from "@/models/Category.model";

export async function POST(request) {
  try {
    const auth = await isAuthenticated('admin',request)
    if (!auth.isAuth){
        return response(false,403,'Unauthorized')
    }

    await connectDB();
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
     const isExist = await CategoryModel.findOne({
      $or: [{ name }, { slug }]
    });

    if (isExist) {
      return response(false, 400, "Duplicate field: name or slug already exists.");
    }
    const newCategory = new CategoryModel({
        name, slug
    })
    await newCategory.save()
     return response(true, 200, "Category added successfully");
    
  } catch (error) {
    return catchError(error)
  }
}
