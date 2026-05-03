import pg from 'pg';

async function testConnection() {
  const pool = new pg.Pool({ 
    connectionString: "postgres://8f5ae80c8c6d63f376925beb05ff661d23224e9a64a35e775a5d792014a62ea5:sk_wQGCjSpjc06452OzSSTfk@pooled.db.prisma.io:5432/postgres?sslmode=require" 
  });

  try {
    const res = await pool.query('SELECT current_user, current_database()');
    console.log("Connection successful:", res.rows[0]);
    
    const users = await pool.query('SELECT email, role FROM "User" WHERE role = \'admin\'');
    console.log("Admins:", users.rows);
  } catch (err) {
    console.error("Connection failed:", err.message);
  } finally {
    await pool.end();
  }
}

testConnection();
