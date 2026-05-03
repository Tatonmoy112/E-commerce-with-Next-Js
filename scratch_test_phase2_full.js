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
  } catch (error) {
    console.error("❌ Login Failed");
    return null;
  } finally { await pool.end(); }
}

async function runPhase2() {
  const cookie = await adminLogin();
  if (!cookie) return;
  const authHeader = { headers: { Cookie: cookie.join('; ') } };

  console.log("--- Phase 2: Media Creation ---");
  const mediaPayload = [{
    asset_id: "test_asset_" + Date.now(),
    public_id: "test_public_" + Date.now(),
    path: "https://example.com/test.jpg",
    thumbnail_url: "https://example.com/thumb.jpg",
    secure_url: "https://example.com/test.jpg",
    alt: "Test Image",
    title: "Test Image Title"
  }];

  const mediaRes = await axios.post(`${BASE_URL}/api/media/create`, mediaPayload, authHeader);
  console.log("✅ Media Created");

  // Get Media ID from DB
  const pool = new pg.Pool({ connectionString });
  const mediaIdRes = await pool.query('SELECT id FROM "Media" ORDER BY "createdAt" DESC LIMIT 1');
  const mediaId = mediaIdRes.rows[0].id;
  const categoryId = 'cmopd0exv0004v4vph38s9o33';

  console.log("--- Phase 2: Product Creation ---");
  const productPayload = {
    name: "Test Product " + Math.floor(Math.random() * 1000),
    slug: "test-product-" + Math.floor(Math.random() * 1000),
    category: categoryId,
    mrp: 1000,
    sellingPrice: 800,
    discountPercentage: 20,
    media: [mediaId],
    description: "This is a test product description."
  };
  const productRes = await axios.post(`${BASE_URL}/api/product/create`, productPayload, authHeader);
  console.log("✅ Product Created");

  // Get Product ID from DB
  const productIdRes = await pool.query('SELECT id FROM "Product" ORDER BY "createdAt" DESC LIMIT 1');
  const productId = productIdRes.rows[0].id;

  console.log("--- Phase 2: Product Variant Creation ---");
  const variantPayload = {
    product: productId,
    sku: "SKU-" + Math.floor(Math.random() * 10000),
    color: "Blue",
    size: "XL",
    mrp: 1200,
    sellingPrice: 900,
    discountPercentage: 25,
    media: [mediaId]
  };
  const variantRes = await axios.post(`${BASE_URL}/api/product-variant/create`, variantPayload, authHeader);
  console.log("✅ Product Variant Created");

  await pool.end();
}

runPhase2();
