require('dotenv').config();
const axios = require('axios');

async function testApi() {
  try {
    // We can't call localhost:3000 easily if it's not running in this process
    // But we can simulate the API logic
    const { PrismaClient } = require('@prisma/client');
    const { PrismaPg } = require('@prisma/adapter-pg');
    const pg = require('pg');

    const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter });

    const slug = 'trends';
    const product = await prisma.product.findUnique({
      where: { slug, deletedAt: null },
      include: {
        category: true,
        media: true,
        variants: { where: { deletedAt: null } },
        reviews: {
          where: { deletedAt: null },
          include: { user: { select: { name: true, avatar_url: true } } },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    console.log("API Simulation Result:", product ? "Found" : "Not Found");
    if (product) console.log("Product Name:", product.name);
    
    await prisma.$disconnect();
  } catch (error) {
    console.error("Test Error:", error);
  }
}

testApi();
