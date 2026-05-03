import axios from 'axios';
import pg from 'pg';

const BASE_URL = 'http://localhost:3000';
const connectionString = "postgres://8f5ae80c8c6d63f376925beb05ff661d23224e9a64a35e775a5d792014a62ea5:sk_wQGCjSpjc06452OzSSTfk@pooled.db.prisma.io:5432/postgres?sslmode=require";

async function adminLogin() {
  const email = "admin@gmail.com";
  const password = "Admin@123";
  const pool = new pg.Pool({ connectionString });

  try {
    console.log(`--- Phase 2: Admin Login ---`);
    
    // Step 1: Login call
    const loginRes = await axios.post(`${BASE_URL}/api/auth/login`, { email, password });
    if (!loginRes.data.success) {
        console.error("❌ Admin Login Failed:", loginRes.data.message);
        return null;
    }

    // Step 2: Fetch fresh OTP
    const otpRes = await pool.query('SELECT otp FROM "Otp" WHERE email = $1 ORDER BY "createdAt" DESC LIMIT 1', [email]);
    if (otpRes.rows.length === 0) {
      console.error("❌ No OTP found.");
      return null;
    }
    const otp = otpRes.rows[0].otp;

    // Step 3: Verify OTP and get cookie
    const verifyRes = await axios.post(`${BASE_URL}/api/auth/verify-otp`, { email, otp });
    
    if (verifyRes.data.success) {
      console.log("✅ Admin Login Successful!");
      // Extract set-cookie header
      const cookie = verifyRes.headers['set-cookie'];
      return cookie;
    }
  } catch (error) {
    console.error("❌ Error:", error.response?.data || error.message);
  } finally {
    await pool.end();
  }
  return null;
}

async function testCategoryCreation() {
  const cookie = await adminLogin();
  if (!cookie) return;

  console.log(`--- Phase 2: Category Creation ---`);
  const categoryData = {
    name: "Test Category " + Math.floor(Math.random() * 1000),
    slug: "test-category-" + Math.floor(Math.random() * 1000)
  };

  try {
    const res = await axios.post(`${BASE_URL}/api/category/create`, categoryData, {
      headers: { Cookie: cookie.join('; ') }
    });

    if (res.data.success) {
      console.log("✅ Category Created Successfully!");
      console.log("Category Name:", categoryData.name);
    } else {
      console.error("❌ Category Creation Failed:", res.data.message);
    }
  } catch (error) {
    console.error("❌ API Error:", error.response?.data || error.message);
  }
}

testCategoryCreation();
