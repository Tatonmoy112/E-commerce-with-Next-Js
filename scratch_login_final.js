import axios from 'axios';

const BASE = 'http://localhost:3000';

async function testLogin() {
  try {
    console.log('🚀 Triggering login for tatonmoy112@gmail.com...');
    const res = await axios.post(`${BASE}/api/auth/login`, {
      email: 'tatonmoy112@gmail.com',
      password: 'Tab@123456'
    });
    
    console.log('\n✅ Login API Result:');
    if (res.data.data?.otp) {
      console.log(`\n🔑 YOUR OTP IS: ${res.data.data.otp}`);
    } else {
       console.log(JSON.stringify(res.data, null, 2));
    }
  } catch (err) {
    console.error('\n❌ Login Failed:', err.response?.data || err.message);
  }
}

testLogin();
