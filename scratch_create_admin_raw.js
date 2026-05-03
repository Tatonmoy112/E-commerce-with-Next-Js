import pg from 'pg';
import bcrypt from 'bcrypt';

async function createAdminRaw() {
  const connectionString = "postgres://8f5ae80c8c6d63f376925beb05ff661d23224e9a64a35e775a5d792014a62ea5:sk_wQGCjSpjc06452OzSSTfk@pooled.db.prisma.io:5432/postgres?sslmode=require";
  const pool = new pg.Pool({ connectionString });

  const email = "admin@gmail.com";
  const password = "Admin@123";
  const name = "Admin User";

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const now = new Date();
    
    const query = `
      INSERT INTO "User" (id, email, password, name, role, "isEmailVerified", "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (email) DO NOTHING
      RETURNING *;
    `;
    
    const values = [
      Math.random().toString(36).substring(7), // Random ID since we don't have cuid here
      email,
      hashedPassword,
      name,
      'admin',
      true,
      now,
      now
    ];

    const res = await pool.query(query, values);
    
    if (res.rows.length > 0) {
      console.log("Admin user created successfully:");
      console.log(`Email: ${email}`);
      console.log(`Password: ${password}`);
    } else {
      console.log("Admin user already exists.");
    }
  } catch (err) {
    console.error("Error creating admin:", err.message);
  } finally {
    await pool.end();
  }
}

createAdminRaw();
