import { connectDB } from "@/lib/db";
import { catchError, response } from "@/lib/helperFunction";
import { zschema } from "@/lib/ZodSchema";
import CuponModel from "@/models/Cupon.model";

export async function PUT(request) {
  try {
    await connectDB();
    const payload = await request.json();

    const schema = zschema.pick({
      _id: true,
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
      _id,
      code,
      discountPercentage,
      minimumShoppingAmount,
      validity,
      
    } = validate.data;

    // Find cupon first
    const cupon = await CuponModel.findOne({
      deletedAt: null,
      _id,
    });

    if (!cupon) {
      return response(false, 404, "Cupon not found");
    }

    // Update cupon fields
    cupon. code = code;
    cupon. discountPercentage = discountPercentage;
    cupon. minimumShoppingAmount = minimumShoppingAmount;
    cupon. validity = validity;
    

    await cupon.save();

    return response(true, 200, "Cupon updated successfully");
  } catch (error) {
    return catchError(error);
  }
}
