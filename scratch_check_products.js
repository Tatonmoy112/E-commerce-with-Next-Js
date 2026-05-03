import dotenv from 'dotenv';
dotenv.config();
import prisma from './lib/prisma.js';

async function checkProducts() {
  console.log('🔍 Checking categories and products...');
  
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: { products: true }
      }
    }
  });

  console.log('\n📁 Categories:');
  categories.forEach(cat => {
    console.log(`- ${cat.name} (${cat.slug}): ${cat._count.products} products`);
  });

  const products = await prisma.product.findMany({
    take: 5,
    include: {
      category: true,
      media: true
    }
  });

  console.log('\n🛍️ Sample Products:');
  products.forEach(p => {
    console.log(`- ${p.name} (Cat: ${p.category?.name}, Media: ${p.media?.length})`);
  });
}

checkProducts();
