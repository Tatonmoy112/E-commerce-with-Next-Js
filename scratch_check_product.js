require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const pg = require('pg');

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function check() {
  const product = await prisma.product.findUnique({
    where: { slug: 'trends' }
  });
  console.log("Product 'trends' found:", JSON.stringify(product, null, 2));
  
  const allProducts = await prisma.product.findMany({ select: { slug: true, deletedAt: true } });
  console.log("All product slugs:", allProducts);
}

check().finally(() => prisma.$disconnect());
