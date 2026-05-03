import axios from 'axios';

const BASE_URL = 'http://localhost:3000';

async function testRegistration() {
  console.log("--- Phase 1: Registration Test ---");
  const testUser = {
    name: "Test User " + Math.floor(Math.random() * 1000),
    email: "testuser" + Math.floor(Math.random() * 1000) + "@gmail.com",
    password: "Password@123",
    confirmPassword: "Password@123"
  };

  try {
    console.log(`Registering user: ${testUser.email}...`);
    const res = await axios.post(`${BASE_URL}/api/auth/register`, testUser);
    
    if (res.data.success) {
      console.log("✅ Registration Successful!");
      console.log("Message:", res.data.message);
      return testUser.email;
    } else {
      console.error("❌ Registration Failed:", res.data.message);
    }
  } catch (error) {
    console.error("❌ API Error:", error.response?.data || error.message);
  }
  return null;
}

testRegistration().then(email => {
    if(email) {
        process.exit(0);
    } else {
        process.exit(1);
    }
});
