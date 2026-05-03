import 'dotenv/config';
import prisma from './lib/prisma.js';

async function testProductFlow() {
  console.log('--- Starting Product Flow Test ---');

  try {
    // 1. Setup: Create Category
    console.log('Step 1: Creating category...');
    const cat = await prisma.category.create({
      data: { name: 'Electronics ' + Date.now(), slug: 'elec-' + Date.now() }
    });

    // 2. Create Product
    console.log('Step 2: Creating product...');
    const product = await prisma.product.create({
      data: {
        name: 'Smartphone',
        slug: 'smartphone-' + Date.now(),
        mrp: 1000,
        sellingPrice: 800,
        discountPercentage: 20,
        description: 'Latest model',
        category: { connect: { id: cat.id } }
      }
    });
    console.log('✅ Product created:', product.id);

    // 3. Fetch with Join (Simulation of GET /api/product)
    console.log('Step 3: Fetching product with category...');
    const found = await prisma.product.findUnique({
      where: { id: product.id },
      include: { category: true }
    });
    if (!found.category || found.category.id !== cat.id) throw new Error('❌ Relation failed');
    console.log('✅ Product relation verified:', found.category.name);

    // 4. Update Product
    console.log('Step 4: Updating product...');
    await prisma.product.update({
      where: { id: product.id },
      data: { sellingPrice: 750 }
    });
    const updated = await prisma.product.findUnique({ where: { id: product.id } });
    if (updated.sellingPrice !== 750) throw new Error('❌ Update failed');
    console.log('✅ Product update verified');

    // 5. Cleanup
    console.log('Step 5: Cleaning up...');
    await prisma.product.delete({ where: { id: product.id } });
    await prisma.category.delete({ where: { id: cat.id } });
    console.log('✅ Cleanup successful');

    console.log('--- ALL PRODUCT TESTS PASSED ---');
  } catch (error) {
    console.error('❌ TEST FAILED:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testProductFlow();
