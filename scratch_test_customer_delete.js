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

async function testCustomerDelete() {
    try {
        console.log("--- Fetching a soft-deleted user ---");
        const user = await prisma.user.findFirst({
            where: { NOT: { deletedAt: null } }
        });

        if (!user) {
            console.log("No soft-deleted users found. Creating one for testing...");
            // Find any user to soft delete
            const anyUser = await prisma.user.findFirst();
            if (!anyUser) return console.log("No users in DB.");
            
            await prisma.user.update({
                where: { id: anyUser.id },
                data: { deletedAt: new Date() }
            });
            console.log(`Soft deleted user: ${anyUser.email}`);
        } else {
            console.log(`Found soft-deleted user: ${user.email} (ID: ${user.id})`);
        }

        const targetUser = await prisma.user.findFirst({ where: { NOT: { deletedAt: null } } });
        if (!targetUser) return;

        console.log("\n--- Testing Restore Logic (RSD) ---");
        // Simulate logic in api/customers/delete/route.js
        const ids = [targetUser.id];
        
        const updateResult = await prisma.user.updateMany({
            where: { id: { in: ids } },
            data: { deletedAt: null }
        });
        console.log(`Updated count: ${updateResult.count}`);

        console.log("\n--- Testing Permanent Delete Logic (PD) ---");
        // Re-delete first
        await prisma.user.update({
            where: { id: targetUser.id },
            data: { deletedAt: new Date() }
        });

        // Permanent delete
        // Note: Check for dependencies (Orders, Reviews, etc.)
        const deleteResult = await prisma.user.deleteMany({
            where: { id: { in: ids } }
        });
        console.log(`Deleted count: ${deleteResult.count}`);

    } catch (error) {
        console.error("Test failed:", error);
    } finally {
        await prisma.$disconnect();
    }
}

testCustomerDelete();
