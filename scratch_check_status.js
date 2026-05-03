import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

async function checkProductStatus() {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    const res = await pool.query(`
      SELECT p.name, p."sellingPrice", p."deletedAt", c.slug, c.name as cat_name
      FROM "Product" p
      JOIN "Category" c ON p."categoryId" = c.id
      WHERE c.slug = 'mega-cat-96011'
    `);
    
    console.log('🛍️ Product Status in Mega Cat 96011:');
    res.rows.forEach(row => {
      console.log(`- Name: ${row.name}`);
      console.log(`  Price: ${row.sellingPrice}`);
      console.log(`  DeletedAt: ${row.deletedAt}`);
      console.log(`  Category: ${row.cat_name} (${row.slug})`);
    });
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await pool.end();
  }
}

checkProductStatus();
