const axios = require('axios');
async function test() {
  try {
    const url = 'http://localhost:5001/api/v1/ai/recommend?product_id=8840182300732&shop=navjivan-kirana-store';
    const res = await axios.get(url, { headers: { 'ngrok-skip-browser-warning': 'true' } });
    console.log(JSON.stringify(res.data, null, 2));
  } catch (e) {
    console.error(e.response?.data || e.message);
  }
}
test();
