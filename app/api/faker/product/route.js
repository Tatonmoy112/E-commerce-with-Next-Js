import { faker } from "@faker-js/faker";
import prisma from "@/lib/prisma";
import { response } from "@/lib/helperFunction";
import { isAuthenticated } from "@/lib/authentication";

function getRandomItems(array, count = 1) {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

export async function POST(req) {
  try {
    const auth = await isAuthenticated('admin', req)
    if (!auth.isAuth){
        return response(false, 403, 'Unauthorized')
    }
    const categories = await prisma.category.findMany();
    if (categories.length === 0) {
      return response(false, 400, "No categories found!");
    }

    const mediaList = await prisma.media.findMany();
    const mediaIds = mediaList.map((m) => m.id);

    const colors = ["Red", "Blue", "Green", "Black"];
    const sizes = ["S", "M", "L", "XL", "2XL"];

    for (const category of categories) {
      for (let i = 0; i < 5; i++) {
        const mrp = Number(faker.commerce.price({ min: 500, max: 2000 }));
        const discountPercentage = faker.number.int({ min: 10, max: 50 });
        const sellingPrice = Math.round(mrp - (mrp * discountPercentage) / 100);

        const product = await prisma.product.create({
          data: {
            name: faker.commerce.productName(),
            slug: faker.lorem.slug() + "-" + faker.string.alphanumeric(5),
            mrp,
            sellingPrice,
            discountPercentage,
            description: faker.commerce.productDescription(),
            category: { connect: { id: category.id } },
            media: {
              connect: getRandomItems(mediaIds, 4).map(id => ({ id }))
            }
          }
        });

        const variantData = [];
        for (const color of colors) {
          for (const size of sizes) {
            variantData.push({
              productId: product.id,
              color,
              size,
              mrp: product.mrp,
              sellingPrice: product.sellingPrice,
              discountPercentage: product.discountPercentage,
              sku: `${product.slug}-${color}-${size}-${faker.number.int({ min: 1000, max: 9999 })}`,
              // stock: faker.number.int({ min: 10, max: 100 }), // Add stock to schema if needed
            });
          }
        }
        
        await prisma.productVariant.createMany({
          data: variantData
        });
      }
    }

    return response(true, 200, "Fake data generated successfully.");
  } catch (error) {
    console.error("Faker error:", error);
    return response(false, 500, error.message);
  }
}

