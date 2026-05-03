import axios from 'axios';
import pg from 'pg';

const BASE_URL = 'http://localhost:3000';
const connectionString = "postgres://8f5ae80c8c6d63f376925beb05ff661d23224e9a64a35e775a5d792014a62ea5:sk_wQGCjSpjc06452OzSSTfk@pooled.db.prisma.io:5432/postgres?sslmode=require";

async function runFinalAudit() {
  const pool = new pg.Pool({ connectionString });
  let passed = 0;
  let failed = 0;

  const logPass = (msg) => { console.log(`✅ [PASS] ${msg}`); passed++; };
  const logFail = (msg, err) => {
    console.error(`❌ [FAIL] ${msg}`);
    if (err) console.error("   Details:", err?.response?.data || err?.message);
    failed++;
  };

  try {
    console.log(`\n🔒 FINAL COMPREHENSIVE SYSTEM AUDIT\n`);

    // ===== ADMIN SESSION =====
    let adminAuthHeader;
    const adminEmail = "admin@gmail.com";
    await axios.post(`${BASE_URL}/api/auth/login`, { email: adminEmail, password: "Admin@123" });
    const adminOtp = await pool.query('SELECT otp FROM "Otp" WHERE email = $1 ORDER BY "createdAt" DESC LIMIT 1', [adminEmail]);
    const adminVerify = await axios.post(`${BASE_URL}/api/auth/verify-otp`, { email: adminEmail, otp: adminOtp.rows[0].otp });
    adminAuthHeader = { headers: { Cookie: adminVerify.headers['set-cookie'].join('; ') } };

    // ===== USER SESSION =====
    let userAuthHeader;
    const userEmail = `finalaudit_${Date.now()}@gmail.com`;
    await axios.post(`${BASE_URL}/api/auth/register`, { name: "Final Audit User", email: userEmail, password: "Password@123" });
    await pool.query('UPDATE "User" SET "isEmailVerified" = true WHERE email = $1', [userEmail]);
    await axios.post(`${BASE_URL}/api/auth/login`, { email: userEmail, password: "Password@123" });
    const userOtp = await pool.query('SELECT otp FROM "Otp" WHERE email = $1 ORDER BY "createdAt" DESC LIMIT 1', [userEmail]);
    const userVerify = await axios.post(`${BASE_URL}/api/auth/verify-otp`, { email: userEmail, otp: userOtp.rows[0].otp });
    userAuthHeader = { headers: { Cookie: userVerify.headers['set-cookie'].join('; ') } };

    console.log("━━━━ 1. ADMIN-ONLY API ACCESS ━━━━");

    // Admin CAN access admin APIs
    try {
      await axios.get(`${BASE_URL}/api/dashboard/admin/count`, adminAuthHeader);
      logPass("Admin → Dashboard Count API: ALLOWED");
    } catch(e) { logFail("Admin → Dashboard Count API: should be allowed", e); }

    try {
      await axios.get(`${BASE_URL}/api/category?start=0&size=5&globalFilter=`, adminAuthHeader);
      logPass("Admin → Category List API: ALLOWED");
    } catch(e) { logFail("Admin → Category List API: should be allowed", e); }

    try {
      await axios.get(`${BASE_URL}/api/product?start=0&size=5&globalFilter=`, adminAuthHeader);
      logPass("Admin → Product List API: ALLOWED");
    } catch(e) { logFail("Admin → Product List API: should be allowed", e); }

    try {
      await axios.get(`${BASE_URL}/api/customers?start=0&size=5&globalFilter=`, adminAuthHeader);
      logPass("Admin → Customer List API: ALLOWED");
    } catch(e) { logFail("Admin → Customer List API: should be allowed", e); }

    try {
      await axios.get(`${BASE_URL}/api/cupon?start=0&size=5&globalFilter=`, adminAuthHeader);
      logPass("Admin → Coupon List API: ALLOWED");
    } catch(e) { logFail("Admin → Coupon List API: should be allowed", e); }

    console.log("\n━━━━ 2. USER BLOCKED FROM ADMIN APIs ━━━━");

    // User CANNOT access admin APIs
    try {
      const res = await axios.get(`${BASE_URL}/api/dashboard/admin/count`, userAuthHeader);
      if (!res.data.success) logPass("User → Dashboard Count API: BLOCKED");
      else logFail("User → Dashboard Count API: should be blocked!");
    } catch(e) {
      if (e.response?.status === 403 || e.response?.status === 401) logPass("User → Dashboard Count API: BLOCKED (HTTP " + e.response.status + ")");
      else logFail("User → Dashboard Count: unexpected error", e);
    }

    try {
      const res = await axios.post(`${BASE_URL}/api/category/create`, { name: "hack", slug: "hack" }, userAuthHeader);
      if (!res.data.success) logPass("User → Category Create API: BLOCKED");
      else logFail("User → Category Create API: should be blocked!");
    } catch(e) {
      if (e.response?.status === 403 || e.response?.status === 401) logPass("User → Category Create API: BLOCKED (HTTP " + e.response.status + ")");
      else logFail("User → Category Create: unexpected error", e);
    }

    try {
      const res = await axios.post(`${BASE_URL}/api/product/create`, { name: "hack" }, userAuthHeader);
      if (!res.data.success) logPass("User → Product Create API: BLOCKED");
      else logFail("User → Product Create API: should be blocked!");
    } catch(e) {
      if (e.response?.status === 403 || e.response?.status === 401) logPass("User → Product Create API: BLOCKED (HTTP " + e.response.status + ")");
      else logFail("User → Product Create: unexpected error", e);
    }

    console.log("\n━━━━ 3. ADMIN BLOCKED FROM USER APIs ━━━━");

    // Admin CANNOT access user checkout
    try {
      const res = await axios.post(`${BASE_URL}/api/checkout`, { cartItems: [{ id: "fake", cartQuantity: 1 }] }, adminAuthHeader);
      if (!res.data.success) logPass("Admin → Checkout API: BLOCKED");
      else logFail("Admin → Checkout API: should be blocked!");
    } catch(e) {
      if (e.response?.status === 401 || e.response?.status === 403) logPass("Admin → Checkout API: BLOCKED (HTTP " + e.response.status + ")");
      else logFail("Admin → Checkout: unexpected error", e);
    }

    console.log("\n━━━━ 4. USER CHECKOUT HAPPY PATH ━━━━");

    // User CAN checkout
    let product;
    try {
      const prodRes = await pool.query('SELECT id, name, "sellingPrice" FROM "Product" WHERE "deletedAt" IS NULL LIMIT 1');
      product = prodRes.rows[0];
      
      const checkoutRes = await axios.post(`${BASE_URL}/api/checkout`, {
        cartItems: [{ id: product.id, name: product.name, cartQuantity: 1 }],
        shippingAddress: "Final Audit Address"
      }, userAuthHeader);
      
      if (checkoutRes.data.success && checkoutRes.data.data.id) {
        logPass(`User → Checkout API: ORDER PLACED (${checkoutRes.data.data.id})`);
      } else {
        logFail("User → Checkout: response was not successful", { message: JSON.stringify(checkoutRes.data) });
      }
    } catch(e) { logFail("User → Checkout Failed", e); }

    console.log("\n━━━━ 5. PUBLIC APIs (NO AUTH NEEDED) ━━━━");

    try {
      const shopRes = await axios.get(`${BASE_URL}/api/shop?size=10&start=0`);
      if (Array.isArray(shopRes.data.data)) logPass("Guest → Shop Listing API: ALLOWED");
      else logFail("Guest → Shop Listing: invalid response");
    } catch(e) { logFail("Guest → Shop Listing Failed", e); }

    console.log("\n━━━━ 6. UNAUTHENTICATED ACCESS ━━━━");

    try {
      const res = await axios.get(`${BASE_URL}/api/dashboard/admin/count`);
      if (!res.data.success) logPass("Guest → Dashboard Count API: BLOCKED");
      else logFail("Guest → Dashboard Count API: should be blocked!");
    } catch(e) {
      if (e.response?.status === 403 || e.response?.status === 401) logPass("Guest → Dashboard Count API: BLOCKED (HTTP " + e.response.status + ")");
      else logFail("Guest → Dashboard Count: unexpected error", e);
    }

    try {
      const res = await axios.post(`${BASE_URL}/api/checkout`, { cartItems: [] });
      if (!res.data.success) logPass("Guest → Checkout API: BLOCKED");
      else logFail("Guest → Checkout API: should be blocked!");
    } catch(e) {
      if (e.response?.status === 401) logPass("Guest → Checkout API: BLOCKED (HTTP 401)");
      else logFail("Guest → Checkout: unexpected error", e);
    }

    // ===== SUMMARY =====
    console.log(`\n${"═".repeat(50)}`);
    console.log(`📊 FINAL RESULTS: ${passed} PASSED | ${failed} FAILED`);
    console.log(`${"═".repeat(50)}`);
    if (failed === 0) {
      console.log(`🎉 ALL TESTS PASSED! System is perfectly secure.\n`);
    } else {
      console.log(`⚠️  ${failed} test(s) failed. Review the output above.\n`);
    }

  } catch (err) {
    console.error("Critical Failure:", err);
  } finally {
    await pool.end();
    process.exit(failed > 0 ? 1 : 0);
  }
}

runFinalAudit();
