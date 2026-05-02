import { faker } from "@faker-js/faker";
import mongoose from "mongoose";

import CategoryModel from "@/models/Category.model";
import ProductModel from "@/models/Product.model";
import ProductVariantModel from "@/models/ProductVariant.model";
import MediaModel from "@/models/Media.model";

import { response } from "@/lib/helperFunction";
import { connectDB } from "@/lib/db"; // ✅ FIXED PATH

function getRandomItems(array, count = 1) {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

export async function POST(req) {
  await connectDB();

  try {
    const categories = await CategoryModel.find();
    if (categories.length === 0) {
      return response(false, 400, "No categories found!");
    }

    const mediaList = await MediaModel.find();
    const mediaIds = mediaList.map((m) => m._id);

    const colors = ["Red", "Blue", "Green", "Black"];
    const sizes = ["S", "M", "L", "XL", "2XL"];

    let products = [];
    let variants = [];

    for (const category of categories) {
      for (let i = 0; i < 5; i++) {
        const mrp = Number(faker.commerce.price({ min: 500, max: 2000 }));
        const discountPercentage = faker.number.int({ min: 10, max: 50 });
        const sellingPrice = Math.round(mrp - (mrp * discountPercentage) / 100);

        const productId = new mongoose.Types.ObjectId();

        const product = {
          _id: productId,
          name: faker.commerce.productName(),
          slug: faker.lorem.slug(),
          category: category._id,
          mrp,
          sellingPrice,
          discountPercentage,
          media: getRandomItems(mediaIds, 4),
          description: faker.commerce.productDescription(),
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        products.push(product);

        for (const color of colors) {
          for (const size of sizes) {
            variants.push({
              _id: new mongoose.Types.ObjectId(),
              product: productId,
              color,
              size,
              mrp: product.mrp,
              sellingPrice: product.sellingPrice,
              discountPercentage: product.discountPercentage,
              sku: `${product.slug}-${color}-${size}-${faker.number.int({ min: 1000, max: 9999 })}`,
              stock: faker.number.int({ min: 10, max: 100 }),
              media: getRandomItems(mediaIds, 4),
              deletedAt: null,
              createdAt: new Date(),
              updatedAt: new Date(),
            });
          }
        }
      }
    }

    await ProductModel.insertMany(products);
    await ProductVariantModel.insertMany(variants);

    return response(true, 200, "Fake data generated successfully.");
  } catch (error) {
    return response(false, 500, error.message);
  }
}
