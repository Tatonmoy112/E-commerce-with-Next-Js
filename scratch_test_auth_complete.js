import axios from 'axios';
import pg from 'pg';

const BASE_URL = 'http://localhost:3000';
const connectionString = "postgres://8f5ae80c8c6d63f376925beb05ff661d23224e9a64a35e775a5d792014a62ea5:sk_wQGCjSpjc06452OzSSTfk@pooled.db.prisma.io:5432/postgres?sslmode=require";

async function testFullAuth() {
  const email = "testuser514@gmail.com";
  const password = "Password@123";
  const pool = new pg.Pool({ connectionString });

  try {
    console.log(`--- Phase 1: Authentication Full Flow ---`);
    
    // Step 2: Manually verify email in DB
    console.log(`Step 2: Manually verifying email for ${email}...`);
    await pool.query('UPDATE "User" SET "isEmailVerified" = true WHERE email = $1', [email]);
    console.log(`✅ User verified.`);

    // Step 3: Login to generate OTP
    console.log(`Step 3: Logging in to generate OTP...`);
    const loginRes = await axios.post(`${BASE_URL}/api/auth/login`, { email, password });
    
    if (!loginRes.data.success) {
        console.error("❌ Login Failed:", loginRes.data.message);
        return;
    }
    console.log(`✅ Login API called. OTP sent to database.`);

    // Step 4: Fetch OTP and Verify
    console.log(`Step 4: Fetching OTP from DB...`);
    const otpRes = await pool.query('SELECT otp FROM "Otp" WHERE email = $1 ORDER BY "createdAt" DESC LIMIT 1', [email]);
    
    if (otpRes.rows.length === 0) {
      console.error("❌ No OTP found in database.");
      return;
    }

    const otp = otpRes.rows[0].otp;
    console.log(`✅ Found OTP: ${otp}. Verifying...`);

    const verifyRes = await axios.post(`${BASE_URL}/api/auth/verify-otp`, { email, otp });
    
    if (verifyRes.data.success) {
      console.log("✅ Verification Successful! Login Complete.");
      console.log("User Data:", verifyRes.data.data);
    } else {
      console.error("❌ Verification Failed:", verifyRes.data.message);
    }
  } catch (error) {
    console.error("❌ Error:", error.response?.data || error.message);
  } finally {
    await pool.end();
  }
}

testFullAuth();
