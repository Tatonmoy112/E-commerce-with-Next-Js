import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

async function testConnection() {
  const connectionString = process.env.DATABASE_URL;
  console.log('🔗 Connecting to:', connectionString ? 'Found' : 'Not Found');
  
  const pool = new pg.Pool({ connectionString });
  
  try {
    const res = await pool.query('SELECT 1');
    console.log('✅ Success!', res.rows);
    
    const products = await pool.query('SELECT name, "sellingPrice" FROM "Product" LIMIT 5');
    console.log('\n🛍️ Products:', products.rows);
    
    const categories = await pool.query('SELECT name, slug FROM "Category"');
    console.log('\n📁 Categories:', categories.rows);
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await pool.end();
  }
}

testConnection();
