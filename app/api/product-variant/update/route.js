import { connectDB } from "@/lib/db";
import { catchError, response } from "@/lib/helperFunction";
import { zschema } from "@/lib/ZodSchema";
import ProductVariantModel from "@/models/ProductVariant.model";

export async function PUT(request) {
  try {
    await connectDB();
    const payload = await request.json();

 const schema = zschema.pick({
  _id:true,
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
      return response(false, 400, "Invalid or missing fields", validate.error);
    }

    const {
      _id,
      product,
      color,
      size,
      sku,
      mrp,
      sellingPrice,
      discountPercentage,
      media,
    } = validate.data;

    // Find product first
    const productVariant = await ProductVariantModel.findOne({
      deletedAt: null,
      _id,
    });

    if (!productVariant) {
      return response(false, 404, "Product not found");
    }

    // Update productVariant fields
    productVariant.product = product;
    productVariant.color = color;
    productVariant.size = size;
    productVariant.sku = sku;
    productVariant.mrp = mrp;
    productVariant.sellingPrice = sellingPrice;
    productVariant.discountPercentage = discountPercentage;
    productVariant.media = media; // array of media IDs

    await productVariant.save();

    return response(true, 200, "Product Variant updated successfully");
  } catch (error) {
    return catchError(error);
  }
}
