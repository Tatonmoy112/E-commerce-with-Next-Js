import pg from 'pg';
const pool = new pg.Pool({connectionString:'postgres://8f5ae80c8c6d63f376925beb05ff661d23224e9a64a35e775a5d792014a62ea5:sk_wQGCjSpjc06452OzSSTfk@pooled.db.prisma.io:5432/postgres?sslmode=require'});

async function main() {
  try {
    // Verify specific users
    const emails = ['tatonmoy112@gmail.com', 'test_reg_1@example.com'];
    for (const email of emails) {
      const res = await pool.query('UPDATE "User" SET "isEmailVerified" = true WHERE email = $1', [email]);
      console.log(`✅ User ${email} verification status updated. Rows affected: ${res.rowCount}`);
    }

    // List all users to confirm
    const users = await pool.query('SELECT id, name, email, role, "isEmailVerified" FROM "User"');
    console.log('\n👤 Current Users:');
    console.table(users.rows);
  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    await pool.end();
  }
}

main();
