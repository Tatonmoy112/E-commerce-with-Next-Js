import { isAuthenticated } from "@/lib/authentication";
import { connectDB } from "@/lib/db";
import { catchError, response } from "@/lib/helperFunction";
import { zschema } from "@/lib/ZodSchema";
import ProductModel from "@/models/Product.model";


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
    const productData = validate.data

    
    const newProduct = new ProductModel({
          name:productData.name,
          slug:productData.slug,
          category:productData.category,
          mrp:productData.mrp,
          sellingPrice:productData.sellingPrice,
          discountPercentage:productData.discountPercentage,
          media:productData.media,
          description: productData.description

    })
    await newProduct.save()
     return response(true, 200, "Product added successfully");
    
  } catch (error) {
    return catchError(error)
  }
}
