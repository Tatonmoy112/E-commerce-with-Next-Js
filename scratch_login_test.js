import axios from 'axios';

const BASE = 'http://localhost:3000';

async function testLogin() {
  try {
    console.log('🚀 Attempting login for test_reg_1@example.com...');
    const res = await axios.post(`${BASE}/api/auth/login`, {
      email: 'test_reg_1@example.com',
      password: 'Tab@123456'
    });
    
    console.log('\n✅ Login API Result:');
    console.log(JSON.stringify(res.data, null, 2));
    
    if (res.data.data?.otp) {
      console.log(`\n🔑 YOUR OTP IS: ${res.data.data.otp}`);
    }
  } catch (err) {
    console.error('\n❌ Login Failed:', err.response?.data || err.message);
  }
}

testLogin();
