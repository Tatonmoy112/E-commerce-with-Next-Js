import pg from 'pg';
const pool = new pg.Pool({connectionString:'postgres://8f5ae80c8c6d63f376925beb05ff661d23224e9a64a35e775a5d792014a62ea5:sk_wQGCjSpjc06452OzSSTfk@pooled.db.prisma.io:5432/postgres?sslmode=require'});

async function main() {
  try {
    const res = await pool.query('SELECT * FROM "User" WHERE email = $1', ['tatonmoy112@gmail.com']);
    console.log('\n🔍 User lookup (tatonmoy112@gmail.com):');
    console.table(res.rows);
    
    if (res.rows.length > 0) {
        // If it exists, make sure it's verified
        await pool.query('UPDATE "User" SET "isEmailVerified" = true WHERE email = $1', ['tatonmoy112@gmail.com']);
        console.log('✅ User verified.');
    }
  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    await pool.end();
  }
}

main();
