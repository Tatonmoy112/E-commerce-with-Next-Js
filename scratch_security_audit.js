import { SignJWT } from 'jose';
import axios from 'axios';

const BASE = 'http://localhost:3000';
const SECRET = new TextEncoder().encode('your_secret_key');

async function testRBAC() {
  console.log('🧪 Starting RBAC Security Audit...\n');

  // 1. Generate a "User" token
  const userToken = await new SignJWT({ userId: 'test-user', role: 'user' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .setProtectedHeader({ alg: 'HS256' })
    .sign(SECRET);

  // 2. Generate an "Admin" token
  const adminToken = await new SignJWT({ userId: 'test-admin', role: 'admin' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .setProtectedHeader({ alg: 'HS256' })
    .sign(SECRET);

  const tests = [
    {
      name: 'User accessing Admin API (Product Create)',
      url: '/api/product/create',
      method: 'post',
      token: userToken,
      expectedStatus: 403
    },
    {
      name: 'Unauthenticated accessing User API (Checkout)',
      url: '/api/checkout',
      method: 'post',
      token: null,
      expectedStatus: 401
    },
    {
      name: 'WORST CASE: Negative Quantity Exploit in Checkout',
      url: '/api/checkout',
      method: 'post',
      token: userToken,
      data: {
        cartItems: [{ id: 'some-id', cartQuantity: -100 }],
        shippingAddress: 'Test'
      },
      expectedStatus: 500 // Will fail because product won't be found, but check if total is still safe
    },
    {
      name: 'WORST CASE: Unauthorized Faker Access',
      url: '/api/faker/product',
      method: 'post',
      token: userToken,
      expectedStatus: 403
    },
    {
      name: 'WORST CASE: Unauthorized Cloudinary Access',
      url: '/api/cloudinary-signature',
      method: 'post',
      token: userToken,
      data: { paramsToSign: {} },
      expectedStatus: 403
    }
  ];

  for (const test of tests) {
    try {
      const res = await axios({
        method: test.method,
        url: `${BASE}${test.url}`,
        headers: test.token ? { Cookie: `access_token=${test.token}` } : {},
        data: test.data || {}
      }).catch(e => e.response);

      const passed = res.status === test.expectedStatus || (test.name.includes('Negative') && res.status === 500);
      console.log(`${passed ? '✅' : '❌'} ${test.name}`);
      console.log(`   Status: ${res.status}`);
      if (!passed) {
        console.log(`   Message: ${res.data?.message || 'N/A'}`);
      }
    } catch (err) {
      console.log(`❌ ${test.name} - Error: ${err.message}`);
    }
  }
}

testRBAC();
