const axios = require('axios');

async function main() {
  const apiKey = 're_6C2hZbQz_4cSAMansTdLpSth3D52FQwgM';
  const toEmail = 'kingamaan14@gmail.com';
  
  console.log('Testing Resend API Key:', apiKey);
  
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
