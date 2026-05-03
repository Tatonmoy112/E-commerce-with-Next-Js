import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

async function checkProductPrice() {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    const res = await pool.query(`
      SELECT p.name, p."sellingPrice", c.slug
      FROM "Product" p
      JOIN "Category" c ON p."categoryId" = c.id
      WHERE c.slug = 'mega-cat-96011'
    `);
    
    console.log('🛍️ Products in Mega Cat 96011:');
    res.rows.forEach(row => {
      console.log(`- ${row.name}: Price ${row.sellingPrice}`);
    });
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await pool.end();
  }
}

checkProductPrice();
