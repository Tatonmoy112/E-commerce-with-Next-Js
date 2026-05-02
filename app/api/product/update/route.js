import { connectDB } from "@/lib/db";
import { catchError, response } from "@/lib/helperFunction";
import { zschema } from "@/lib/ZodSchema";
import ProductModel from "@/models/Product.model";

export async function PUT(request) {
  try {
    await connectDB();
    const payload = await request.json();

    const schema = zschema.pick({
      _id: true,
      name: true,
      slug: true,
      description: true,
      mrp: true,
      sellingPrice: true,
      discountPercentage: true,
      category: true,
      media: true,
    });

    const validate = schema.safeParse(payload);
    if (!validate.success) {
      return response(false, 400, "Invalid or missing fields", validate.error);
    }

    const {
      _id,
      name,
      slug,
      description,
      mrp,
      sellingPrice,
      discountPercentage,
      category,
      media,
    } = validate.data;

    // Find product first
    const product = await ProductModel.findOne({
      deletedAt: null,
      _id,
    });

    if (!product) {
      return response(false, 404, "Product not found");
    }

    // Update product fields
    product.name = name;
    product.slug = slug;
    product.description = description;
    product.mrp = mrp;
    product.sellingPrice = sellingPrice;
    product.discountPercentage = discountPercentage;
    product.category =category ; // categoryId
    product.media = media; // array of media IDs

    await product.save();

    return response(true, 200, "Product updated successfully");
  } catch (error) {
    return catchError(error);
  }
}
