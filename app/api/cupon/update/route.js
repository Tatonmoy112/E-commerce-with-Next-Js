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
     code: true,
     discountPercentage: true,
     minimumShoppingAmount: true,
     validity: true,
    });

    const validate = schema.safeParse(payload);
    if (!validate.success) {
      return response(false, 400, "Invalid or missing fields", validate.error);
    }

    const {
      id,
      code,
      discountPercentage,
      minimumShoppingAmount,
      validity,
      
    } = validate.data;

    // Find coupon first
    const coupon = await prisma.cupon.findUnique({
      where: {
        id: id,
        deletedAt: null,
      }
    });

    if (!coupon) {
      return response(false, 404, "Coupon not found");
    }

    // Update coupon fields
    await prisma.cupon.update({
      where: { id: id },
      data: {
        code,
        discountPercentage,
        minimumShoppingAmount,
        validity: new Date(validity),
      }
    });

    return response(true, 200, "Coupon updated successfully");
  } catch (error) {
    return catchError(error);
  }
}

