import { isAuthenticated } from "@/lib/authentication";
import { connectDB } from "@/lib/db";
import { catchError, response } from "@/lib/helperFunction";
import { zschema } from "@/lib/ZodSchema";
import CuponModel from "@/models/Cupon.model";


export async function POST(request) {
  try {
    const auth = await isAuthenticated('admin',request)
    if (!auth.isAuth){
        return response(false,403,'Unauthorized')
    }

    await connectDB();
    const payload = await request.json();

    const schema = zschema.pick({
    code: true,
    discountPercentage: true,
    minimumShoppingAmount: true,
    validity: true,
});

    const validate = schema.safeParse(payload);

    if (!validate.success) {
      return response(false, 400, "Invalid or missing field", validate.error);
    } 
    const cuponData = validate.data

    
    const newCupon = new CuponModel({
          code:cuponData.code,
          discountPercentage:cuponData.discountPercentage,
          minimumShoppingAmount:cuponData.minimumShoppingAmount,
          validity:cuponData.validity,
          

    })
    await newCupon.save()
     return response(true, 200, "Cuppon added successfully");
    
  } catch (error) {
    return catchError(error)
  }
}
