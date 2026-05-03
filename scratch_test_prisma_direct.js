import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function test() {
  try {
    const user = await prisma.user.findFirst();
    const product = await prisma.product.findFirst();
    
    const newOrder = await prisma.order.create({
      data: {
        userId: user.id,
        totalAmount: 100,
        payableAmount: 100,
        items: {
          create: [
            {
              productId: product.id,
              quantity: 1,
              price: 100
            }
          ]
        }
      }
    });
    console.log("SUCCESS! Created order:", newOrder.id);
  } catch(e) {
    console.error("FAIL", e);
  } finally {
    await prisma.$disconnect();
  }
}
test();
