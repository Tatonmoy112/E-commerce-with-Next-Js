import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config();

console.log('☁️ Direct Cloudinary Test...');
console.log('Env Cloud Name:', process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME);

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY,
});

try {
  const result = await cloudinary.api.ping();
  console.log('✅ Success! Cloudinary is working.');
  console.log(result);
} catch (error) {
  console.log('❌ Failed!');
  console.log(error);
}
