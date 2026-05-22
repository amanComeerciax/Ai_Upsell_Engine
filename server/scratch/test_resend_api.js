const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const axios = require('axios');

async function main() {
  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = 'kingamaan14@gmail.com';
  
  if (!apiKey) {
    console.error('❌ Error: RESEND_API_KEY is not defined in your environment or .env file!');
    process.exit(1);
  }
  
  console.log('Testing Resend API Key: (configured from environment)');
  
  try {
    const response = await axios.post('https://api.resend.com/emails', {
      from: 'Velocity AI <onboarding@resend.dev>',
      to: [toEmail],
      subject: '🎁 Test Resend Delivery - Velocity AI',
      html: '<h1>It Works!</h1><p>This email was successfully sent from your live Resend API integration!</p>'
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Resend API call succeeded!');
    console.log('Response ID:', response.data.id);
  } catch (error) {
    console.error('❌ Resend API call failed:', error.response?.data || error.message);
  }
}

main();
