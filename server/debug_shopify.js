const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env') });

const shopName = process.env.SHOPIFY_SHOP_NAME;
const accessToken = process.env.SHOPIFY_ACCESS_TOKEN;

const https = require('https');
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

async function testSync() {
    const url = `https://${shopName}.myshopify.com/admin/api/2024-04/products.json?limit=1`;
    try {
        const response = await axios.get(url, {
            headers: { 'X-Shopify-Access-Token': accessToken },
            httpsAgent
        });
        console.log('Sample Product from Shopify:');
        console.log(JSON.stringify(response.data.products[0], null, 2));
    } catch (e) {
        console.error('Error fetching from Shopify:', e.response?.data || e.message);
    }
}

testSync();
