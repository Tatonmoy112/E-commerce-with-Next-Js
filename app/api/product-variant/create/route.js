import { isAuthenticated } from "@/lib/authentication";
import { connectDB } from "@/lib/db";
import { catchError, response } from "@/lib/helperFunction";
import { zschema } from "@/lib/ZodSchema";
import ProductVariantModel from "@/models/ProductVariant.model";


export async function POST(request) {
  try {
    const auth = await isAuthenticated('admin',request)
    if (!auth.isAuth){
        return response(false,403,'Unauthorized')
    }

    await connectDB();
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
    const variantData = validate.data

    
    const newProductVariant = new ProductVariantModel({
          product:variantData.product,
          color:variantData.color,
          size:variantData.size,
          sku:variantData.sku,
          mrp:variantData.mrp,
          sellingPrice:variantData.sellingPrice,
          discountPercentage:variantData.discountPercentage,
          media:variantData.media,

    })
    await newProductVariant.save()
     return response(true, 200, "Product VAriant added successfully");
    
  } catch (error) {
    return catchError(error)
  }
}
