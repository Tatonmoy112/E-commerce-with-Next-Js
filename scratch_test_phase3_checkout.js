import axios from 'axios';
import pg from 'pg';

const BASE_URL = 'http://localhost:3000';
const connectionString = "postgres://8f5ae80c8c6d63f376925beb05ff661d23224e9a64a35e775a5d792014a62ea5:sk_wQGCjSpjc06452OzSSTfk@pooled.db.prisma.io:5432/postgres?sslmode=require";

async function runPhase3() {
  const pool = new pg.Pool({ connectionString });
  
  const logPass = (msg) => console.log(`✅ [PASS] ${msg}`);
  const logFail = (msg, err) => {
    console.error(`❌ [FAIL] ${msg}`);
    if (err) console.error("   Details:", err?.response?.data || err?.message);
    process.exit(1);
  };

  try {
    console.log(`\n🚀 STARTING PHASE 3: CART & CHECKOUT API\n`);

    // 1. Get User Session for Checkout
    let authHeader;
    const testEmail = "admin@gmail.com"; // Let's use the admin as a user for testing purchase
    try {
      await axios.post(`${BASE_URL}/api/auth/login`, { email: testEmail, password: "Admin@123" });
      const adminOtpRes = await pool.query('SELECT otp FROM "Otp" WHERE email = $1 ORDER BY "createdAt" DESC LIMIT 1', [testEmail]);
      const adminVerifyRes = await axios.post(`${BASE_URL}/api/auth/verify-otp`, { email: testEmail, otp: adminOtpRes.rows[0].otp });
      const cookies = adminVerifyRes.headers['set-cookie'];
      authHeader = { headers: { Cookie: cookies.join('; ') } };
    } catch (e) { logFail("Test User Login Failed", e); }

    // 2. Fetch a Product to Add to Cart
    let product;
    try {
      const prodRes = await pool.query('SELECT id, name, "sellingPrice" FROM "Product" WHERE "deletedAt" IS NULL LIMIT 1');
      if (prodRes.rows.length === 0) throw new Error("No products found in DB to test cart");
      product = prodRes.rows[0];
      logPass(`Found Product for Cart: ${product.name}`);
    } catch(e) { logFail("Failed to fetch product for cart test", e); }

    // 3. Mock the Redux Cart Payload
    const mockCartPayload = {
      cartItems: [
        {
          id: product.id,
          name: product.name,
          cartQuantity: 2, // buying 2 items
        }
      ],
      shippingAddress: "123 Phase3 Test Lane, Node City"
    };

    // 4. Test Checkout API
    let newOrderId;
    try {
      const checkoutRes = await axios.post(`${BASE_URL}/api/checkout`, mockCartPayload, authHeader);
      console.log("DEBUG response:", checkoutRes.data);
      newOrderId = checkoutRes.data.data.id;
      const totalAmt = checkoutRes.data.data.totalAmount;
      
      // Verification: 2 items * sellingPrice
      const expectedTotal = product.sellingPrice * 2;
      if (totalAmt !== expectedTotal) {
         throw new Error(`Server calculated total (${totalAmt}) does not match expected (${expectedTotal})`);
      }
      
      logPass(`Checkout API Success - Order ID: ${newOrderId} (Total: ${totalAmt})`);
    } catch (e) { logFail("Checkout API Failed", e); }

    // 5. Verify Order saved in Database successfully
    try {
      const orderDb = await pool.query('SELECT id, status FROM "Order" WHERE id = $1', [newOrderId]);
      if (orderDb.rows.length === 0) throw new Error("Order not found in DB");
      
      const orderItemsDb = await pool.query('SELECT * FROM "OrderItem" WHERE "orderId" = $1', [newOrderId]);
      if (orderItemsDb.rows.length !== 1 || orderItemsDb.rows[0].quantity !== 2) {
          throw new Error("Order Items not saved correctly");
      }
      logPass(`Database Verification: Order and OrderItems securely saved with status: ${orderDb.rows[0].status}`);
    } catch(e) { logFail("Database Verification Failed", e); }

    console.log(`\n🎉 PHASE 3 COMPLETE: Cart logic and Checkout flow perfectly functioning securely!`);
  } catch (err) {
    console.error("Critical Failure:", err);
  } finally {
    await pool.end();
  }
}

runPhase3();
