import 'dotenv/config';
import prisma from './lib/prisma.js';
import bcrypt from 'bcrypt';

async function testAuthFlow() {
  const testEmail = `testuser_${Date.now()}@example.com`;
  const testPassword = 'Password123!';
  const testName = 'Test User';

  console.log('--- Starting Auth Flow Test ---');

  try {
    // 1. Register
    console.log('Step 1: Registering user...');
    const hashedPassword = await bcrypt.hash(testPassword, 10);
    const user = await prisma.user.create({
      data: {
        name: testName,
        email: testEmail,
        password: hashedPassword,
        isEmailVerified: true, // Bypass email verification for testing
      }
    });
    console.log('✅ User registered:', user.email);

    // 2. Login (Find User)
    console.log('Step 2: Testing login lookup...');
    const foundUser = await prisma.user.findFirst({
      where: { email: testEmail }
    });
    
    if (foundUser && await bcrypt.compare(testPassword, foundUser.password)) {
      console.log('✅ Password comparison successful');
    } else {
      throw new Error('❌ Password comparison failed');
    }

    // 3. OTP Creation
    console.log('Step 3: Creating OTP...');
    const otp = await prisma.otp.create({
      data: {
        email: testEmail,
        otp: '123456',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000)
      }
    });
    console.log('✅ OTP created:', otp.otp);

    // 4. OTP Cleanup
    console.log('Step 4: Cleaning up...');
    await prisma.otp.deleteMany({ where: { email: testEmail } });
    await prisma.user.delete({ where: { id: user.id } });
    console.log('✅ Cleanup successful');

    console.log('--- ALL AUTH TESTS PASSED ---');
  } catch (error) {
    console.error('❌ TEST FAILED:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAuthFlow();
