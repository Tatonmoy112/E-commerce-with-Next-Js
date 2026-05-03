import pg from 'pg';

async function checkOTP() {
  const connectionString = "postgres://8f5ae80c8c6d63f376925beb05ff661d23224e9a64a35e775a5d792014a62ea5:sk_wQGCjSpjc06452OzSSTfk@pooled.db.prisma.io:5432/postgres?sslmode=require";
  const pool = new pg.Pool({ connectionString });

  const email = "admin@gmail.com";

  try {
    const query = `
      SELECT otp, "expiresAt" FROM "Otp" 
      WHERE email = $1 
      ORDER BY "createdAt" DESC 
      LIMIT 1;
    `;
    
    const res = await pool.query(query, [email]);
    
    if (res.rows.length > 0) {
      console.log("Recent OTP found:");
      console.log(`Email: ${email}`);
      console.log(`OTP: ${res.rows[0].otp}`);
      console.log(`Expires At: ${res.rows[0].expiresAt}`);
    } else {
      console.log("No OTP found for this email in the database.");
    }
  } catch (err) {
    console.error("Error checking OTP:", err.message);
  } finally {
    await pool.end();
  }
}

checkOTP();
