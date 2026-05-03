import axios from 'axios';
import pg from 'pg';

const BASE_URL = 'http://localhost:3000';
const connectionString = "postgres://8f5ae80c8c6d63f376925beb05ff661d23224e9a64a35e775a5d792014a62ea5:sk_wQGCjSpjc06452OzSSTfk@pooled.db.prisma.io:5432/postgres?sslmode=require";

async function runAudit() {
  const pool = new pg.Pool({ connectionString });
  const suffix = Math.floor(Math.random() * 10000);
  const testUser = { email: `audit_user_${suffix}@test.com`, password: "Password@123", name: "Audit User" };
  const adminEmail = "admin@gmail.com";
  const adminPassword = "Admin@123";

  try {
    console.log("--- 🏁 STARTING FULL SYSTEM AUDIT ---");

    // 1. AUTH TEST
    console.log("\n1. Testing Auth Flow...");
    await axios.post(`${BASE_URL}/api/auth/register`, testUser);
    await pool.query('UPDATE "User" SET "isEmailVerified" = true WHERE email = $1', [testUser.email]);
    const loginRes = await axios.post(`${BASE_URL}/api/auth/login`, { email: testUser.email, password: testUser.password });
    const otpRes = await pool.query('SELECT otp FROM "Otp" WHERE email = $1 ORDER BY "createdAt" DESC LIMIT 1', [testUser.email]);
    const verifyRes = await axios.post(`${BASE_URL}/api/auth/verify-otp`, { email: testUser.email, otp: otpRes.rows[0].otp });
    console.log("✅ Auth Flow: SUCCESS");

    // 2. ADMIN FLOW
    console.log("\n2. Testing Admin Flow...");
    const adminLoginRes = await axios.post(`${BASE_URL}/api/auth/login`, { email: adminEmail, password: adminPassword });
    const adminOtpRes = await pool.query('SELECT otp FROM "Otp" WHERE email = $1 ORDER BY "createdAt" DESC LIMIT 1', [adminEmail]);
    const adminVerifyRes = await axios.post(`${BASE_URL}/api/auth/verify-otp`, { email: adminEmail, otp: adminOtpRes.rows[0].otp });
    const adminCookie = adminVerifyRes.headers['set-cookie'];
    const authHeader = { headers: { Cookie: adminCookie.join('; ') } };

    // Create Category
    const catName = "Audit Category " + suffix;
    await axios.post(`${BASE_URL}/api/category/create`, { name: catName, slug: "audit-cat-" + suffix }, authHeader);
    const catIdRes = await pool.query('SELECT id FROM "Category" WHERE name = $1', [catName]);
    const catId = catIdRes.rows[0].id;
    console.log("✅ Category Creation: SUCCESS");

    // Create Media
    await axios.post(`${BASE_URL}/api/media/create`, [{
      asset_id: "audit_asset_" + suffix, public_id: "audit_public_" + suffix,
      path: "https://example.com/audit.jpg", thumbnail_url: "https://example.com/audit_thumb.jpg",
      secure_url: "https://example.com/audit.jpg", alt: "Audit", title: "Audit"
    }], authHeader);
    const mediaIdRes = await pool.query('SELECT id FROM "Media" ORDER BY "createdAt" DESC LIMIT 1');
    const mediaId = mediaIdRes.rows[0].id;
    console.log("✅ Media Creation: SUCCESS");

    // Create Product
    const prodName = "Audit Product " + suffix;
    await axios.post(`${BASE_URL}/api/product/create`, {
      name: prodName, slug: "audit-prod-" + suffix, category: catId,
      mrp: 5000, sellingPrice: 4000, discountPercentage: 20,
      media: [mediaId], description: "Audit product description"
    }, authHeader);
    console.log("✅ Product Creation: SUCCESS");

    // 3. LISTING & DATATABLE FIX TEST
    console.log("\n3. Testing Datatable Fixes (API Side)...");
    // This simulates the fix I made in Datatable.jsx (sending globalFilter="" instead of [""])
    const customerList = await axios.get(`${BASE_URL}/api/customers?start=0&size=10&globalFilter=`, authHeader);
    const productList = await axios.get(`${BASE_URL}/api/product?start=0&size=10&globalFilter=`, authHeader);
    
    console.log(`✅ Customers List: Returned ${customerList.data.data.length} users`);
    console.log(`✅ Product List: Returned ${productList.data.data.length} products`);

    if (customerList.data.data.length === 0 || productList.data.data.length === 0) {
      throw new Error("Listing APIs returned 0 results even though data exists!");
    }

    // 4. DISCOVERY & SHOP TEST
    console.log("\n4. Testing Shop Discovery...");
    const shopRes = await axios.get(`${BASE_URL}/api/shop?q=Audit`);
    console.log(`✅ Shop Search: Found ${shopRes.data.data.length} products matching 'Audit'`);

    console.log("\n--- ✨ SYSTEM AUDIT COMPLETE: ALL SYSTEMS NOMINAL ✨ ---");

  } catch (error) {
    console.error("\n❌ AUDIT FAILED:", error.response?.data || error.message);
  } finally {
    await pool.end();
  }
}

runAudit();
