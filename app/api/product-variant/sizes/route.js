import { connectDB } from "@/lib/db";
import { catchError, response } from "@/lib/helperFunction";
import ProductVariantModel from "@/models/ProductVariant.model";



export async function GET() {
  try {
   
    await connectDB();

    const getSize = await ProductVariantModel.aggregate([
  {
    $group: {
      _id: "$size",
      first: { $first: "$_id" }
    }
  },
  {
    $sort: { first: 1 }
  },
  {
    $project: {
      _id: 0,
      size: "$_id"
    }
  }
])


    if (!getSize.length) {
      return response(false, 404, "Size not found");
    }

    const sizes = getSize.map(item=>item.size)

    return response(true, 200, "Size Found", sizes);
  } catch (error) {
    return catchError(error);
  }
}
