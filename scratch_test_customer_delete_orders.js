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

async function testCustomerDeleteWithOrders() {
    try {
        console.log("--- Finding a user with orders ---");
        const userWithOrder = await prisma.user.findFirst({
            where: { orders: { some: {} } },
            include: { orders: true }
        });

        if (userWithOrder) {
            console.log(`Found user: ${userWithOrder.email} with ${userWithOrder.orders.length} orders.`);
            
            // Soft delete
            await prisma.user.update({
                where: { id: userWithOrder.id },
                data: { deletedAt: new Date() }
            });
            console.log("Soft deleted successfully.");

            // Try permanent delete
            console.log("Attempting permanent delete (expecting failure if no cascade)...");
            try {
                await prisma.user.delete({
                    where: { id: userWithOrder.id }
                });
                console.log("Permanent delete succeeded! (Cascade must be on)");
            } catch (e) {
                console.log(`Permanent delete failed as expected: ${e.code} - ${e.message}`);
            }
        } else {
            console.log("No users with orders found.");
        }

    } catch (error) {
        console.error("Test failed:", error);
    } finally {
        await prisma.$disconnect();
    }
}

testCustomerDeleteWithOrders();
