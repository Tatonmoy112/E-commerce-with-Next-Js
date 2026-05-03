import axios from 'axios';
import pg from 'pg';

const BASE_URL = 'http://localhost:3000';
const connectionString = "postgres://8f5ae80c8c6d63f376925beb05ff661d23224e9a64a35e775a5d792014a62ea5:sk_wQGCjSpjc06452OzSSTfk@pooled.db.prisma.io:5432/postgres?sslmode=require";

async function adminLogin() {
  const email = "admin@gmail.com";
  const password = "Admin@123";
  const pool = new pg.Pool({ connectionString });
  try {
    const loginRes = await axios.post(`${BASE_URL}/api/auth/login`, { email, password });
    const otpRes = await pool.query('SELECT otp FROM "Otp" WHERE email = $1 ORDER BY "createdAt" DESC LIMIT 1', [email]);
    const otp = otpRes.rows[0].otp;
    const verifyRes = await axios.post(`${BASE_URL}/api/auth/verify-otp`, { email, otp });
    return verifyRes.headers['set-cookie'];
  } catch (error) { return null; } finally { await pool.end(); }
}

async function diagnoseListing() {
  const cookie = await adminLogin();
  if (!cookie) {
    console.error("Failed to login as admin");
    return;
  }
  const authHeader = { headers: { Cookie: cookie.join('; ') } };

  try {
    console.log("--- Diagnosing Customers API ---");
    // Simulate what the frontend sends: start=0, size=10, filters=[], globalFilter="", sorting=[], deleteType=SD
    const url = `${BASE_URL}/api/customers?start=0&size=10&filters=[]&sorting=[]&deleteType=SD`;
    const res = await axios.get(url, authHeader);
    
    console.log("Response Success:", res.data.success);
    console.log("Data Length:", res.data.data?.length);
    console.log("Meta:", res.data.meta);
    console.log("Sample User:", res.data.data?.[0]?.email);

  } catch (error) {
    console.error("API Error:", error.response?.data || error.message);
  }
}

diagnoseListing();
