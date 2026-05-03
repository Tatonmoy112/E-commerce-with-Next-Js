require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const pg = require('pg');

const prismaClientSingleton = () => {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
};

const prisma = prismaClientSingleton();

async function testDeletion() {
  console.log("--- Starting Deletion Safety Test ---");

  try {
    const timestamp = Date.now();
    
    // 1. Create a Category
    const category = await prisma.category.create({
      data: { name: "Test Category " + timestamp, slug: "test-category-" + timestamp }
    });
    console.log("Created Category:", category.id);

    // 2. Create a Product in that category
    const product = await prisma.product.create({
      data: {
        name: "Test Product " + timestamp,
        slug: "test-product-" + timestamp,
        description: "Test description",
        mrp: 100,
        sellingPrice: 80,
        discountPercentage: 20,
        categoryId: category.id
      }
    });
    console.log("Created Product:", product.id);

    // 3. Create a Variant for the product
    const variant = await prisma.productVariant.create({
      data: {
        productId: product.id,
        color: "Red",
        size: "M",
        sku: "sku-" + timestamp,
        mrp: 110,
        sellingPrice: 90,
        discountPercentage: 10
      }
    });
    console.log("Created Variant:", variant.id);

    // 4. Create an Order with this product
    const user = await prisma.user.create({
      data: {
        name: "Test Buyer " + timestamp,
        email: "buyer-" + timestamp + "@example.com",
        password: "password123",
        role: "user",
        isEmailVerified: true
      }
    });
    console.log("Created User:", user.id);

    const order = await prisma.order.create({
      data: {
        userId: user.id,
        totalAmount: 80,
        discount: 0,
        payableAmount: 80,
        status: "PENDING",
        paymentMethod: "COD",
        shippingAddress: "Test Address",
        items: {
          create: [
            { productId: product.id, quantity: 1, price: 80 }
          ]
        }
      }
    });
    console.log("Created Order:", order.id);

    // 5. Test Product Deletion (should clean up Variants and OrderItems)
    console.log("\nTesting Product Deletion (Permanent)...");
    await prisma.$transaction([
      prisma.orderItem.deleteMany({ where: { productId: product.id } }),
      prisma.review.deleteMany({ where: { productId: product.id } }),
      prisma.productVariant.deleteMany({ where: { productId: product.id } }),
      prisma.product.delete({ where: { id: product.id } })
    ]);
    console.log("Product Deleted Successfully!");

    // 6. Test Category Deletion
    console.log("\nTesting Category Deletion...");
    await prisma.category.delete({ where: { id: category.id } });
    console.log("Category Deleted Successfully!");

    // 7. Cleanup User
    await prisma.order.deleteMany({ where: { userId: user.id } });
    await prisma.user.delete({ where: { id: user.id } });
    console.log("User Cleanup Successful!");

    console.log("\n--- ALL TESTS PASSED ---");
  } catch (error) {
    console.error("\n!!! TEST FAILED !!!");
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

testDeletion();
