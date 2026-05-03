// Verify user email by calling the verify-email API with a generated JWT
import { SignJWT } from 'jose';
import axios from 'axios';

const BASE = 'http://localhost:3000';
const SECRET = new TextEncoder().encode('your_secret_key');

// First find the user by trying to login
const emails = ['tatonmoy112@gmail.com'];

for (const email of emails) {
  try {
    // Try to login — if user exists but unverified, the login API returns 401
    const loginRes = await axios.post(`${BASE}/api/auth/login`, {
      email: email,
      password: 'Tatb0123456'
    }).catch(e => e.response);

    console.log(`\n📧 ${email}:`);
    console.log(`   Status: ${loginRes.status}, Message: ${loginRes.data.message}`);

    if (loginRes.status === 401 && loginRes.data.message.includes('not verified')) {
      console.log('   → Email not verified. Generating verification token...');
      
      // We need the user ID. Let's try to get it from the DB via an admin route
      // For now, let's use the verify-email endpoint with a token
      // The register route creates token with { userId: user.id }
      // We don't have the userId, so let's try a different approach
    }
    
    if (loginRes.data.success) {
      console.log('   → Login succeeded! OTP:', loginRes.data.data?.otp || '(check email)');
    }
  } catch (err) {
    console.log(`   Error: ${err.message}`);
  }
}

// Also try the admin login
try {
  const adminRes = await axios.post(`${BASE}/api/auth/login`, {
    email: 'admin@gmail.com',
    password: 'Admin@123'
  }).catch(e => e.response);
  
  console.log(`\n🔑 Admin (admin@gmail.com):`);
  console.log(`   Status: ${adminRes.status}, Message: ${adminRes.data.message}`);
  if (adminRes.data.data?.otp) {
    console.log(`   → OTP: ${adminRes.data.data.otp}`);
  }
} catch (err) {
  console.log(`   Error: ${err.message}`);
}
