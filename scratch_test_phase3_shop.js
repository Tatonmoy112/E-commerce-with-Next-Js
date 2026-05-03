import axios from 'axios';

const BASE_URL = 'http://localhost:3000';

async function testShop() {
  try {
    console.log("--- Phase 3: Filter Options Test ---");
    const colorsRes = await axios.get(`${BASE_URL}/api/product-variant/colors`);
    const sizesRes = await axios.get(`${BASE_URL}/api/product-variant/sizes`);
    
    console.log("Available Colors:", colorsRes.data.data);
    console.log("Available Sizes:", sizesRes.data.data);

    if (!colorsRes.data.data.includes("Blue")) console.warn("⚠️ 'Blue' not found in colors!");
    if (!sizesRes.data.data.includes("XL")) console.warn("⚠️ 'XL' not found in sizes!");

    console.log("--- Phase 3: Shop Products Fetch ---");
    const shopRes = await axios.get(`${BASE_URL}/api/shop`);
    console.log(`✅ Shop returned ${shopRes.data.meta.totalCount} products.`);

    console.log("--- Phase 3: Filter by Color (Blue) ---");
    const filteredRes = await axios.get(`${BASE_URL}/api/shop?color=Blue`);
    const blueProducts = filteredRes.data.data;
    console.log(`✅ Color filter (Blue) returned ${blueProducts.length} products.`);
    
    if (blueProducts.length > 0) {
        console.log("Sample Product Name:", blueProducts[0].name);
    } else {
        console.error("❌ Expected at least 1 blue product.");
    }

  } catch (error) {
    console.error("❌ Error:", error.response?.data || error.message);
  }
}

testShop();
