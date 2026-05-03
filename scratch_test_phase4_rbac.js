import axios from 'axios';
import pg from 'pg';

const BASE_URL = 'http://localhost:3000';
const connectionString = "postgres://8f5ae80c8c6d63f376925beb05ff661d23224e9a64a35e775a5d792014a62ea5:sk_wQGCjSpjc06452OzSSTfk@pooled.db.prisma.io:5432/postgres?sslmode=require";

async function runRBACAudit() {
  const pool = new pg.Pool({ connectionString });
  
  const logPass = (msg) => console.log(`✅ [PASS] ${msg}`);
  const logFail = (msg, err) => {
    console.error(`❌ [FAIL] ${msg}`);
    if (err) console.error("   Details:", err?.response?.data || err?.message);
    process.exit(1);
  };

  try {
    console.log(`\n🚀 STARTING PHASE 4: ROLE-BASED ACCESS CONTROL (RBAC) AUDIT\n`);

    // 1. Get Admin Session
    let adminAuthHeader;
    try {
      const adminEmail = "admin@gmail.com";
      await axios.post(`${BASE_URL}/api/auth/login`, { email: adminEmail, password: "Admin@123" });
      const adminOtpRes = await pool.query('SELECT otp FROM "Otp" WHERE email = $1 ORDER BY "createdAt" DESC LIMIT 1', [adminEmail]);
      const adminVerifyRes = await axios.post(`${BASE_URL}/api/auth/verify-otp`, { email: adminEmail, otp: adminOtpRes.rows[0].otp });
      const cookies = adminVerifyRes.headers['set-cookie'];
      adminAuthHeader = { headers: { Cookie: cookies.join('; ') } };
    } catch (e) { logFail("Admin Login Failed", e); }

    // 2. Get Normal User Session
    let userAuthHeader;
    let userId;
    try {
      const testEmail = `normaluser_${Date.now()}@gmail.com`;
      await axios.post(`${BASE_URL}/api/auth/register`, { name: "Normal User", email: testEmail, password: "Password@123" });
      await pool.query('UPDATE "User" SET "isEmailVerified" = true WHERE email = $1', [testEmail]);
      
      await axios.post(`${BASE_URL}/api/auth/login`, { email: testEmail, password: "Password@123" });
      const userOtpRes = await pool.query('SELECT otp FROM "Otp" WHERE email = $1 ORDER BY "createdAt" DESC LIMIT 1', [testEmail]);
      const userVerifyRes = await axios.post(`${BASE_URL}/api/auth/verify-otp`, { email: testEmail, otp: userOtpRes.rows[0].otp });
      
      const userRes = await pool.query('SELECT id FROM "User" WHERE email = $1', [testEmail]);
      userId = userRes.rows[0].id;

      const cookies = userVerifyRes.headers['set-cookie'];
      userAuthHeader = { headers: { Cookie: cookies.join('; ') } };
    } catch (e) { logFail("Normal User Login Failed", e); }

    console.log("\n--- TESTING ADMIN BOUNDARIES ---");
    // Admin trying to use Checkout API (Should Fail)
    try {
      const res = await axios.post(`${BASE_URL}/api/checkout`, { cartItems: [], shippingAddress: "123" }, adminAuthHeader);
      // If we get here with HTTP 200, check the JSON body
      if (res.data.success === false) {
        logPass("Admin successfully blocked from User Checkout API (via JSON body)");
      } else {
        logFail("SECURITY VULNERABILITY: Admin was able to hit User Checkout API");
      }
    } catch (err) {
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        logPass("Admin successfully blocked from User Checkout API (HTTP " + err.response.status + ")");
      } else {
        logFail("Admin checkout blocked, but unexpected error", err);
      }
    }

    console.log("\n--- TESTING USER BOUNDARIES ---");
    // Normal User trying to use Admin Category Create API (Should Fail)
    try {
      await axios.post(`${BASE_URL}/api/category/create`, { name: "Hacked", slug: "hacked" }, userAuthHeader);
      logFail("SECURITY VULNERABILITY: Normal User was able to create a Category");
    } catch (err) {
      if (err.response && (err.response.status === 401 || err.response.status === 403)) logPass("Normal User successfully blocked from Admin Category API");
      else logFail("User category create blocked, but unexpected status code", err);
    }

    // Normal User trying to use Admin Dashboard Count API (Should Fail)
    try {
      await axios.get(`${BASE_URL}/api/dashboard/admin/count`, userAuthHeader);
      logFail("SECURITY VULNERABILITY: Normal User was able to view Admin Dashboard stats");
    } catch (err) {
      if (err.response && (err.response.status === 401 || err.response.status === 403)) logPass("Normal User successfully blocked from Admin Dashboard API");
      else logFail("User dashboard count blocked, but unexpected status code", err);
    }

    console.log("\n--- TESTING USER HAPPY PATH ---");
    // Normal User successfully buying a product
    let product;
    try {
      const prodRes = await pool.query('SELECT id, name, "sellingPrice" FROM "Product" WHERE "deletedAt" IS NULL LIMIT 1');
      if (prodRes.rows.length === 0) throw new Error("No products found in DB");
      product = prodRes.rows[0];
      
      const mockCartPayload = {
        cartItems: [{ id: product.id, name: product.name, cartQuantity: 1 }],
        shippingAddress: "Normal User Real Address"
      };

      const checkoutRes = await axios.post(`${BASE_URL}/api/checkout`, mockCartPayload, userAuthHeader);
      const newOrderId = checkoutRes.data.data.id;
      
      const orderDb = await pool.query('SELECT status FROM "Order" WHERE id = $1', [newOrderId]);
      if (orderDb.rows.length === 1 && orderDb.rows[0].status === 'PENDING') {
          logPass(`Normal User successfully placed order (ID: ${newOrderId})!`);
      } else {
          throw new Error("Order not found or invalid status");
      }
    } catch (e) { logFail("Normal User Checkout Failed", e); }

    console.log(`\n🎉 PHASE 4 COMPLETE: Role-Based Access Control & Middleware Perfectly Validated!`);
  } catch (err) {
    console.error("Critical Failure:", err);
  } finally {
    await pool.end();
  }
}

runRBACAudit();
