const axios = require('axios');

const payload = {
    id: Date.now(), // Unique order ID
    email: 'testcustomer@gmail.com',
    total_price: '70.00',
    customer: {
        first_name: 'Test',
        last_name: 'Customer'
    },
    shipping_address: {
        city: 'Mumbai',
        province: 'Maharashtra',
        country: 'India'
    },
    line_items: [
        {
            product_id: 8834465628220, // Blue Silk Tuxedo
            quantity: 1,
            title: 'Blue Silk Tuxedo'
        }
    ]
};

async function test() {
    for (let i = 1; i <= 10; i++) {
        try {
            payload.id = Date.now() + i;
            console.log(`[Order ${i}] Sending test webhook...`);
            const response = await axios.post('http://localhost:5001/api/v1/shopify/webhooks/orders/create', payload, {
                headers: {
                    'x-shopify-shop-domain': 'navjivan-kirana-store.myshopify.com',
                    'x-merchant-id': '4'
                }
            });
            console.log(`[Order ${i}] Response:`, response.data.status);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s between orders
        } catch (error) {
            console.error(`[Order ${i}] Error:`, error.response ? error.response.data : error.message);
        }
    }

    console.log('\nFinal Wait: 10 seconds for worker to process all jobs...');
    setTimeout(async () => {
        console.log('Simulation complete. Check analytics for Group A vs Group B results.');
    }, 10000);
}

test();
