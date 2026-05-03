import axios from 'axios';
import pg from 'pg';

const BASE_URL = 'http://localhost:3000';
const connectionString = "postgres://8f5ae80c8c6d63f376925beb05ff661d23224e9a64a35e775a5d792014a62ea5:sk_wQGCjSpjc06452OzSSTfk@pooled.db.prisma.io:5432/postgres?sslmode=require";

async function testVerification() {
  const email = "testuser514@gmail.com";
  const pool = new pg.Pool({ connectionString });

  try {
    console.log(`--- Phase 1: Verification Test ---`);
    console.log(`Fetching OTP for ${email}...`);
    
    const otpRes = await pool.query('SELECT otp FROM "Otp" WHERE email = $1 ORDER BY "createdAt" DESC LIMIT 1', [email]);
    
    if (otpRes.rows.length === 0) {
      console.error("❌ No OTP found in database for this user.");
      return;
    }

    const otp = otpRes.rows[0].otp;
    console.log(`✅ Found OTP: ${otp}. Verifying...`);

    const res = await axios.post(`${BASE_URL}/api/auth/verify-email`, { email, otp });
    
    if (res.data.success) {
      console.log("✅ Verification Successful!");
      console.log("Message:", res.data.message);
    } else {
      console.error("❌ Verification Failed:", res.data.message);
    }
  } catch (error) {
    console.error("❌ Error:", error.response?.data || error.message);
  } finally {
    await pool.end();
  }
}

testVerification();
