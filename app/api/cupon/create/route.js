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
      code: true,
      discountPercentage: true,
      minimumShoppingAmount: true,
      validity: true,
    });

    const validate = schema.safeParse(payload);

    if (!validate.success) {
      return response(false, 400, "Invalid or missing field", validate.error);
    } 
    const cuponData = validate.data;

    await prisma.cupon.create({
      data: {
        code: cuponData.code,
        discountPercentage: cuponData.discountPercentage,
        minimumShoppingAmount: cuponData.minimumShoppingAmount,
        validity: new Date(cuponData.validity),
      }
    });

    return response(true, 200, "Coupon added successfully");
    
  } catch (error) {
    return catchError(error)
  }
}

