import axios from 'axios';
import pg from 'pg';

const BASE_URL = 'http://localhost:3000';
const connectionString = "postgres://8f5ae80c8c6d63f376925beb05ff661d23224e9a64a35e775a5d792014a62ea5:sk_wQGCjSpjc06452OzSSTfk@pooled.db.prisma.io:5432/postgres?sslmode=require";

async function runPhase2() {
  const pool = new pg.Pool({ connectionString });
  
  const logPass = (msg) => console.log(`✅ [PASS] ${msg}`);
  const logFail = (msg, err) => {
    console.error(`❌ [FAIL] ${msg}`);
    if (err) console.error("   Details:", err.response?.data || err.message);
    process.exit(1);
  };

  try {
    console.log(`\n🚀 STARTING PHASE 2: PUBLIC APIs & DASHBOARD\n`);

    // 1. Get Admin Session for Dashboard Count
    let authHeader;
    try {
      const adminEmail = "admin@gmail.com";
      await axios.post(`${BASE_URL}/api/auth/login`, { email: adminEmail, password: "Admin@123" });
      const adminOtpRes = await pool.query('SELECT otp FROM "Otp" WHERE email = $1 ORDER BY "createdAt" DESC LIMIT 1', [adminEmail]);
      const adminVerifyRes = await axios.post(`${BASE_URL}/api/auth/verify-otp`, { email: adminEmail, otp: adminOtpRes.rows[0].otp });
      const cookies = adminVerifyRes.headers['set-cookie'];
      authHeader = { headers: { Cookie: cookies.join('; ') } };
    } catch (e) { logFail("Admin Setup Failed", e); }

    // 2. Dashboard Count
    try {
      const dashRes = await axios.get(`${BASE_URL}/api/dashboard/admin/count`, authHeader);
      const data = dashRes.data.data;
      if (typeof data.category !== 'number' || typeof data.product !== 'number' || typeof data.customer !== 'number') {
         throw new Error("Invalid Dashboard Count Format");
      }
      logPass(`Dashboard Count API (Categories: ${data.category}, Products: ${data.product}, Users: ${data.customer})`);
    } catch(e) { logFail("Dashboard Count Failed", e); }

    // 3. Shop API (Public list)
    try {
      const shopRes = await axios.get(`${BASE_URL}/api/shop?size=10&start=0`);
      if (!Array.isArray(shopRes.data.data)) throw new Error("Shop API returned invalid structure");
      logPass("Shop Listing API");
    } catch(e) { logFail("Shop API Failed", e); }

    console.log(`\n🎉 PHASE 2 COMPLETE: Dashboard and Shop Public APIs perfectly functioning!`);
  } catch (err) {
    console.error("Critical Failure:", err);
  } finally {
    await pool.end();
  }
}

runPhase2();
