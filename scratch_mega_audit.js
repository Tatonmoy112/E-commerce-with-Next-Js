import axios from 'axios';
import pg from 'pg';

const BASE_URL = 'http://localhost:3000';
const connectionString = "postgres://8f5ae80c8c6d63f376925beb05ff661d23224e9a64a35e775a5d792014a62ea5:sk_wQGCjSpjc06452OzSSTfk@pooled.db.prisma.io:5432/postgres?sslmode=require";

async function runMegaAudit() {
  const pool = new pg.Pool({ connectionString });
  const suffix = Math.floor(Math.random() * 100000);
  let adminCookie = null;
  let authHeader = null;
  let catId = null;
  let mediaId = null;
  let prodId = null;
  let variantId = null;
  let cuponId = null;

  const logPass = (msg) => console.log(`✅ [PASS] ${msg}`);
  const logFail = (msg, err) => {
    console.error(`❌ [FAIL] ${msg}`);
    if (err) console.error("   Details:", err.response?.data || err.message);
    process.exit(1);
  };

  try {
    console.log(`\n🚀 STARTING MEGA AUDIT (Run ID: ${suffix})\n`);

    // --- 1. AUTHENTICATION ---
    try {
      const adminEmail = "admin@gmail.com";
      const adminPassword = "Admin@123";
      await axios.post(`${BASE_URL}/api/auth/login`, { email: adminEmail, password: adminPassword });
      const adminOtpRes = await pool.query('SELECT otp FROM "Otp" WHERE email = $1 ORDER BY "createdAt" DESC LIMIT 1', [adminEmail]);
      const adminVerifyRes = await axios.post(`${BASE_URL}/api/auth/verify-otp`, { email: adminEmail, otp: adminOtpRes.rows[0].otp });
      adminCookie = adminVerifyRes.headers['set-cookie'];
      authHeader = { headers: { Cookie: adminCookie.join('; ') } };
      logPass("Admin Authentication & Session Setup");
    } catch (e) { logFail("Admin Auth Failed", e); }

    // --- 2. CATEGORY CRUD ---
    try {
      const catName = "Mega Cat " + suffix;
      const slug = "mega-cat-" + suffix;
      // Create
      await axios.post(`${BASE_URL}/api/category/create`, { name: catName, slug: slug }, authHeader);
      const catRes = await pool.query('SELECT id FROM "Category" WHERE name = $1', [catName]);
      catId = catRes.rows[0].id;
      // List
      const listRes = await axios.get(`${BASE_URL}/api/category?start=0&size=10&globalFilter=`, authHeader);
      if (!listRes.data.data.find(c => c.id === catId)) throw new Error("Category not in list");
      // Update
      await axios.put(`${BASE_URL}/api/category/update`, { id: catId, name: catName + " Updated", slug: slug + "-updated" }, authHeader);
      // Soft Delete
      await axios.put(`${BASE_URL}/api/category/delete`, { ids: [catId], deleteType: "SD" }, authHeader);
      // Restore
      await axios.put(`${BASE_URL}/api/category/delete`, { ids: [catId], deleteType: "RSD" }, authHeader);
      logPass("Category CRUD Pipeline (Create, List, Update, SoftDelete, Restore)");
    } catch (e) { logFail("Category Pipeline Failed", e); }

    // --- 3. MEDIA CRUD ---
    try {
      await axios.post(`${BASE_URL}/api/media/create`, [{
        asset_id: "mega_asset_" + suffix, public_id: "mega_public_" + suffix,
        path: "https://example.com/mega.jpg", thumbnail_url: "https://example.com/mega_thumb.jpg",
        secure_url: "https://example.com/mega.jpg", alt: "Mega", title: "Mega"
      }], authHeader);
      const mediaRes = await pool.query('SELECT id FROM "Media" ORDER BY "createdAt" DESC LIMIT 1');
      mediaId = mediaRes.rows[0].id;
      logPass("Media Pipeline (Create)");
    } catch (e) { logFail("Media Pipeline Failed", e); }

    // --- 4. PRODUCT CRUD ---
    try {
      const prodName = "Mega Product " + suffix;
      // Create
      const pRes = await axios.post(`${BASE_URL}/api/product/create`, {
        name: prodName, slug: "mega-prod-" + suffix, category: catId,
        mrp: 500, sellingPrice: 400, discountPercentage: 20,
        media: [mediaId], description: "Mega product description"
      }, authHeader);
      prodId = pRes.data.data.id;
      if (!prodId) {
         // Some APIs return id differently or don't return data directly. Let's fetch from DB.
         const pDb = await pool.query('SELECT id FROM "Product" WHERE name = $1', [prodName]);
         prodId = pDb.rows[0].id;
      }
      // List
      const pListRes = await axios.get(`${BASE_URL}/api/product?start=0&size=10&globalFilter=`, authHeader);
      if (pListRes.data.data.length === 0) throw new Error("Product List Empty");
      // Update
      await axios.put(`${BASE_URL}/api/product/update`, {
        id: prodId, name: prodName + " Updated", slug: "mega-prod-" + suffix + "-updated",
        category: catId, media: [mediaId], mrp: 500, sellingPrice: 400,
        discountPercentage: 20, description: "Mega product description updated"
      }, authHeader);
      logPass("Product CRUD Pipeline (Create, List, Update)");
    } catch (e) { logFail("Product Pipeline Failed", e); }

    // --- 5. PRODUCT VARIANT CRUD ---
    try {
      // Create
      await axios.post(`${BASE_URL}/api/product-variant/create`, {
        product: prodId, color: "Red", size: "XL",
        mrp: 100, sellingPrice: 90, discountPercentage: 10,
        sku: "MEGA-SKU-" + suffix, media: [mediaId]
      }, authHeader);
      const vDb = await pool.query('SELECT id FROM "ProductVariant" WHERE sku = $1', ["MEGA-SKU-" + suffix]);
      variantId = vDb.rows[0].id;
      // List
      const vListRes = await axios.get(`${BASE_URL}/api/product-variant?start=0&size=10&globalFilter=`, authHeader);
      // Update
      await axios.put(`${BASE_URL}/api/product-variant/update`, {
         id: variantId, product: prodId, color: "Blue", size: "XL",
         mrp: 100, sellingPrice: 90, discountPercentage: 10,
         sku: "MEGA-SKU-" + suffix, media: [mediaId]
      }, authHeader);
      logPass("Product Variant CRUD Pipeline (Create, List, Update)");
    } catch (e) { logFail("Product Variant Pipeline Failed", e); }

    // --- 6. CUPON CRUD ---
    try {
      const code = "MEGA" + suffix;
      // Create
      await axios.post(`${BASE_URL}/api/cupon/create`, {
        code: code, discountPercentage: 15, minimumShoppingAmount: 1000,
        validity: new Date(Date.now() + 86400000).toISOString()
      }, authHeader);
      const cDb = await pool.query('SELECT id FROM "Cupon" WHERE code = $1', [code]);
      cuponId = cDb.rows[0].id;
      // List
      await axios.get(`${BASE_URL}/api/cupon?start=0&size=10&globalFilter=`, authHeader);
      // Update
      await axios.put(`${BASE_URL}/api/cupon/update`, {
        id: cuponId, code: "MEGA" + suffix, discountPercentage: 25,
        minimumShoppingAmount: 1000, validity: new Date(Date.now() + 86400000).toISOString()
      }, authHeader);
      logPass("Coupon CRUD Pipeline (Create, List, Update)");
    } catch (e) { logFail("Coupon Pipeline Failed", e); }

    // --- 7. CLEANUP (PERMANENT DELETE TEST) ---
    try {
      // Delete from leaf nodes up to prevent foreign key constraint errors
      await axios.delete(`${BASE_URL}/api/product-variant/delete`, { data: { ids: [variantId], deleteType: "PD" }, ...authHeader });
      await axios.delete(`${BASE_URL}/api/product/delete`, { data: { ids: [prodId], deleteType: "PD" }, ...authHeader });
      await axios.delete(`${BASE_URL}/api/category/delete`, { data: { ids: [catId], deleteType: "PD" }, ...authHeader });
      await axios.delete(`${BASE_URL}/api/cupon/delete`, { data: { ids: [cuponId], deleteType: "PD" }, ...authHeader });
      
      // Wait, media delete requires cloudinary API which might fail in test env if mock data is used.
      // We will skip PD for media to avoid cloudinary crash.
      
      logPass("Cleanup Pipeline (Permanent Deletions Successful)");
    } catch (e) { logFail("Cleanup Pipeline Failed", e); }

    console.log(`\n🎉 MEGA AUDIT COMPLETE: 100% SUCCESSFUL`);
  } catch (err) {
    console.error("Critical Failure:", err);
  } finally {
    await pool.end();
  }
}

runMegaAudit();
