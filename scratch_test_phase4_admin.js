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

async function runPhase4() {
  const cookie = await adminLogin();
  if (!cookie) return;
  const authHeader = { headers: { Cookie: cookie.join('; ') } };

  console.log("--- Phase 4: Dashboard Stats Test ---");
  const statsRes = await axios.get(`${BASE_URL}/api/dashboard/admin/count`, authHeader);
  console.log("✅ Stats Received:", statsRes.data.data);

  console.log("--- Phase 4: Coupon Creation ---");
  const couponPayload = {
    code: "TESTPROMO" + Math.floor(Math.random() * 1000),
    discountPercentage: 15,
    minimumShoppingAmount: 500,
    validity: "2026-12-31"
  };
  const couponRes = await axios.post(`${BASE_URL}/api/cupon/create`, couponPayload, authHeader);
  
  if (couponRes.data.success) {
    console.log("✅ Coupon Created Successfully!");
  } else {
    console.error("❌ Coupon Creation Failed:", couponRes.data.message);
  }
}

runPhase4();
