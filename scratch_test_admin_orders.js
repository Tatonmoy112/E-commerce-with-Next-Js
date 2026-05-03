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

async function testAdminOrders() {
    try {
        console.log("--- Checking Orders in DB ---");
        const orderCount = await prisma.order.count();
        console.log(`Total Orders: ${orderCount}`);

        if (orderCount > 0) {
            const orders = await prisma.order.findMany({
                where: { deletedAt: null },
                take: 5,
                include: {
                    user: {
                        select: {
                            name: true,
                            email: true,
                            phone: true
                        }
                    },
                    items: {
                        include: {
                            product: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });

            console.log(`\nFetched ${orders.length} orders for admin view.`);
            orders.forEach((order, idx) => {
                console.log(`\nOrder ${idx + 1}:`);
                console.log(`  ID: ${order.id}`);
                console.log(`  Customer: ${order.user?.name} (${order.user?.email})`);
                console.log(`  Total: ৳${order.totalAmount}`);
                console.log(`  Status: ${order.status}`);
                console.log(`  Items: ${order.items.map(i => i.product?.name).join(", ")}`);
            });
        } else {
            console.log("No orders found to display.");
        }

    } catch (error) {
        console.error("Test failed:", error);
    } finally {
        await prisma.$disconnect();
    }
}

testAdminOrders();
