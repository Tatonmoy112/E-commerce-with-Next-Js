import dotenv from 'dotenv';
dotenv.config();
import cloudinary from './lib/cloudinary.js';

async function testCloudinary() {
  console.log('☁️ Testing Cloudinary Connection...');
  console.log('Cloud Name:', process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME);
  
  try {
    const result = await cloudinary.api.ping();
    console.log('✅ Cloudinary Connection Successful!');
    console.log('Response:', result);
  } catch (error) {
    console.log('❌ Cloudinary Connection Failed!');
    console.log('Error:', error.message);
    if (error.message.includes('Must supply cloud_name')) {
      console.log('👉 Tip: It looks like you haven\'t set your Cloudinary credentials in the .env file yet.');
    }
  }
}

testCloudinary();
