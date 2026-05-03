import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config();

const IMAGE_PATH = 'C:/Users/User/.gemini/antigravity/brain/48b818e4-f6ab-45f5-9bfd-38390e8ae293/test_product_upload_1777804235442.png';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY,
});

async function runUploadTests() {
  console.log('🚀 Starting Cloudinary Upload Audit...');

  // 1. Normal Case: Upload a valid image
  console.log('\n📸 Test 1: Normal Image Upload');
  try {
    const result = await cloudinary.uploader.upload(IMAGE_PATH, {
      folder: 'test_uploads',
    });
    console.log('✅ Success! Image uploaded.');
    console.log('   URL:', result.secure_url);
    console.log('   Public ID:', result.public_id);
  } catch (error) {
    console.log('❌ Failed normal upload:', error.message);
  }

  // 2. Worst Case: Missing Credentials
  console.log('\n🚫 Test 2: WORST CASE - Missing Secret Key');
  try {
    const badCloudinary = {...cloudinary};
    badCloudinary.config({
        cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
        api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
        api_secret: '', // Empty secret
    });
    await badCloudinary.uploader.upload(IMAGE_PATH);
    console.log('❌ Failure! Should have failed with empty secret.');
  } catch (error) {
    console.log('✅ Correctly failed:', error.message);
  }

  // 3. Worst Case: Invalid File Path
  console.log('\n📂 Test 3: WORST CASE - Invalid File Path');
  try {
    await cloudinary.uploader.upload('./non_existent_file.png');
    console.log('❌ Failure! Should have failed with invalid path.');
  } catch (error) {
    console.log('✅ Correctly failed:', error.message);
  }

  console.log('\n✨ Audit Complete.');
}

runUploadTests();
