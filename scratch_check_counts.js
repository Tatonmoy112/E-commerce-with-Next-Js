import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

async function checkCategoryProducts() {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    const res = await pool.query(`
      SELECT c.name, c.slug, COUNT(p.id) as product_count
      FROM "Category" c
      LEFT JOIN "Product" p ON p."categoryId" = c.id
      GROUP BY c.id, c.name, c.slug
    `);
    
    console.log('📊 Products per Category:');
    res.rows.forEach(row => {
      console.log(`- ${row.name} (${row.slug}): ${row.product_count} products`);
    });
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await pool.end();
  }
}

checkCategoryProducts();
