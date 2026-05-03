import 'dotenv/config';
import prisma from './lib/prisma.js';

async function testCategoryFlow() {
  console.log('--- Starting Category Flow Test ---');

  try {
    // 1. Create Category
    console.log('Step 1: Creating category...');
    const newCat = await prisma.category.create({
      data: {
        name: 'Test Electronics',
        slug: 'test-electronics'
      }
    });
    console.log('✅ Category created:', newCat.id);

    // 2. Fetch Category (Simulation of GET /api/category)
    console.log('Step 2: Fetching categories...');
    const categories = await prisma.category.findMany({
      where: { deletedAt: null }
    });
    const found = categories.find(c => c.id === newCat.id);
    if (!found) throw new Error('❌ Category not found in active list');
    console.log('✅ Category found in active list');

    // 3. Update Category
    console.log('Step 3: Updating category...');
    await prisma.category.update({
      where: { id: newCat.id },
      data: { name: 'Updated Electronics' }
    });
    const updated = await prisma.category.findUnique({ where: { id: newCat.id } });
    if (updated.name !== 'Updated Electronics') throw new Error('❌ Update failed');
    console.log('✅ Category updated successfully');

    // 4. Soft Delete (SD)
    console.log('Step 4: Soft deleting...');
    await prisma.category.update({
      where: { id: newCat.id },
      data: { deletedAt: new Date() }
    });
    const softDeleted = await prisma.category.findUnique({ where: { id: newCat.id } });
    if (!softDeleted.deletedAt) throw new Error('❌ Soft delete failed');
    console.log('✅ Soft delete successful');

    // 5. Restore (RSD)
    console.log('Step 5: Restoring...');
    await prisma.category.update({
      where: { id: newCat.id },
      data: { deletedAt: null }
    });
    const restored = await prisma.category.findUnique({ where: { id: newCat.id } });
    if (restored.deletedAt) throw new Error('❌ Restore failed');
    console.log('✅ Restore successful');

    // 6. Permanent Delete (PD)
    console.log('Step 6: Permanent deleting...');
    await prisma.category.delete({
      where: { id: newCat.id }
    });
    const permanentlyDeleted = await prisma.category.findUnique({ where: { id: newCat.id } });
    if (permanentlyDeleted) throw new Error('❌ Permanent delete failed');
    console.log('✅ Permanent delete successful');

    console.log('--- ALL CATEGORY TESTS PASSED ---');
  } catch (error) {
    console.error('❌ TEST FAILED:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testCategoryFlow();
