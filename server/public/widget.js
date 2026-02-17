(function () {
    // Velocity AI Upsell Widget - Production v1.0
    const API_BASE = 'https://keila-arousable-bimolecularly.ngrok-free.dev/api/v1';

    const styles = `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
        
        #velocity-upsell-root {
            font-family: 'Inter', system-ui, -apple-system, sans-serif;
            position: fixed;
            bottom: 30px;
            right: 30px;
            width: 380px;
            z-index: 999999;
            animation: velocity-slide-up 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes velocity-slide-up {
            from { transform: translateY(100px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }

        .velocity-card {
            background: rgba(255, 255, 255, 0.9);
            backdrop-filter: blur(25px);
            -webkit-backdrop-filter: blur(25px);
            border: 1px solid rgba(255, 255, 255, 0.4);
            border-radius: 32px;
            padding: 32px;
            box-shadow: 0 40px 80px rgba(0, 0, 0, 0.15);
            overflow: hidden;
            position: relative;
        }

        .velocity-badge {
            display: inline-flex;
            align-items: center;
            background: #3b82f6;
            color: white;
            font-size: 11px;
            font-weight: 800;
            text-transform: uppercase;
            padding: 6px 14px;
            border-radius: 10px;
            letter-spacing: 0.05em;
            margin-bottom: 20px;
        }

        .velocity-title {
            font-size: 24px;
            font-weight: 900;
            line-height: 1.1;
            margin-bottom: 24px;
            color: #000;
            text-transform: uppercase;
            font-style: italic;
            letter-spacing: -0.02em;
        }

        .velocity-product-box {
            display: flex;
            gap: 20px;
            background: rgba(0, 0, 0, 0.04);
            border-radius: 20px;
            padding: 16px;
            margin-bottom: 24px;
            border: 1px solid rgba(0, 0, 0, 0.02);
            align-items: center;
        }

        .velocity-img {
            width: 80px;
            height: 80px;
            border-radius: 16px;
            object-fit: contain;
            background: white;
            box-shadow: 0 4px 12px rgba(0,0,0,0.05);
            padding: 4px;
        }

        .velocity-info {
            display: flex;
            flex-direction: column;
            flex: 1;
        }

        .velocity-pname {
            font-weight: 800;
            font-size: 15px;
            color: #1a1a1a;
            margin-bottom: 4px;
            line-height: 1.3;
        }

        .velocity-price-tag {
            display: flex;
            align-items: baseline;
            gap: 8px;
        }

        .velocity-price {
            font-size: 18px;
            font-weight: 900;
            color: #3b82f6;
        }

        .velocity-old-price {
            font-size: 13px;
            text-decoration: line-through;
            color: #94a3b8;
            font-weight: 600;
        }

        .velocity-btn {
            width: 100%;
            background: #000;
            color: white;
            border: none;
            padding: 18px;
            border-radius: 18px;
            font-weight: 800;
            font-size: 15px;
            text-transform: uppercase;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
        }

        .velocity-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
        }

        .velocity-close {
            position: absolute;
            top: 12px;
            right: 12px;
            cursor: pointer;
            opacity: 0.3;
            transition: opacity 0.2s;
        }

        .velocity-close:hover { opacity: 1; }
    `;

    function init() {
        let orderId = window.VELOCITY_DEBUG_ID || null;
        console.log('[Velocity AI] Widget initializing...');

        // 1. Shopify Checkout Thank-You page (most common)
        if (!orderId && window.Shopify && window.Shopify.checkout) {
            orderId = window.Shopify.checkout.order_id;
            console.log('[Velocity AI] Detected from Shopify.checkout:', orderId);
        }

        // 2. Shopify Order Status page (Shopify.order object)
        if (!orderId && window.Shopify && window.Shopify.order) {
            orderId = window.Shopify.order.id;
            console.log('[Velocity AI] Detected from Shopify.order:', orderId);
        }

        // 3. URL query parameters
        if (!orderId) {
            const urlParams = new URLSearchParams(window.location.search);
            orderId = urlParams.get('order_id') || urlParams.get('id') || urlParams.get('order');
        }

        // 4. Extract from URL path patterns
        if (!orderId) {
            const patterns = [
                /\/(?:orders|confirmed)\/(order_|)(\d+)/,            // /orders/12345 or /confirmed/order_12345
                /\/checkouts\/[^/]+\/thank_you.*order_id[=:](\d+)/i, // checkout thank_you with order_id
                /\/(\d{10,})/,                                        // Any long numeric ID in URL (Shopify IDs are 13+ digits)
            ];
            for (const pattern of patterns) {
                const match = window.location.href.match(pattern);
                if (match) {
                    orderId = match[2] || match[1];
                    console.log('[Velocity AI] Detected from URL pattern:', orderId);
                    break;
                }
            }
        }

        // 5. Check page content for order number (e.g., Shopify confirmation pages have it in a meta tag or script)
        if (!orderId) {
            const scripts = document.querySelectorAll('script');
            scripts.forEach(function (s) {
                if (!orderId && s.textContent) {
                    const match = s.textContent.match(/"order_id"\s*:\s*(\d+)/);
                    if (match) {
                        orderId = match[1];
                        console.log('[Velocity AI] Detected from page script:', orderId);
                    }
                }
            });
        }

        // 6. Pre-purchase: Product Page (URL Pattern fallback)
        let productId = null;
        if (!orderId && window.meta && window.meta.product) {
            productId = window.meta.product.id;
        }

        if (!orderId && !productId && (window.location.pathname.includes('/products/') || window.location.pathname.includes('/items/'))) {
            // Try to find any 10-15 digit number in page source for product ID
            const scripts = document.querySelectorAll('script[type="application/json"]');
            scripts.forEach(s => {
                if (!productId && s.textContent.includes('product')) {
                    const match = s.textContent.match(/"id"\s*:\s*(\d{10,})/);
                    if (match) productId = match[1];
                }
            });
        }

        // 7. Pre-purchase: Cart items (AJAX Fallback)
        if (!orderId && !productId && (window.location.pathname.includes('/cart') || window.Shopify?.cart)) {
            console.log('[Velocity AI] On Cart page, fetching live context...');
            fetch('/cart.js')
                .then(res => res.json())
                .then(cart => {
                    if (cart.items && cart.items.length > 0) {
                        const pId = cart.items[0].product_id;
                        console.log('[Velocity AI] Detected Cart Context via AJAX:', pId);
                        fetchWithRetry(`${API_BASE}/ai/recommend?product_id=${pId}`, 1);
                    } else {
                        throw new Error('Empty Cart');
                    }
                })
                .catch(() => {
                    console.log('[Velocity AI] Cart empty or undetected. Retrying...');
                    setTimeout(init, 5000);
                });
            return; // Exit init as we handled it in the promise
        }

        if (orderId) {
            console.log('[Velocity AI] Processing Post-purchase for Order:', orderId);
            fetchWithRetry(`${API_BASE}/upsells/order/${orderId}`, 1);
        } else if (productId) {
            console.log('[Velocity AI] Processing Pre-purchase for Product:', productId);
            fetchWithRetry(`${API_BASE}/ai/recommend?product_id=${productId}`, 1);
        } else {
            console.log('[Velocity AI] No context found yet. Retrying in 5s...');
            setTimeout(init, 5000);
        }
    }

    function fetchWithRetry(url, attempt) {
        if (attempt > 3) return;

        fetch(url, {
            headers: {
                'ngrok-skip-browser-warning': 'true',
                'Content-Type': 'application/json'
            }
        })
            .then(res => {
                if (!res.ok) throw new Error('Pending AI logic...');
                return res.json();
            })
            .then(data => {
                console.log('[Velocity AI] Match Found! Rendering widget.');
                renderWidget(data);
            })
            .catch(err => {
                console.log(`[Velocity AI] AI is still thinking... Retrying in 2s.`);
                setTimeout(() => fetchWithRetry(orderId, attempt + 1), 2000);
            });
    }

    function renderWidget(data) {
        const prod = data.recommended_product;
        const discountPrice = prod.price * (1 - (prod.discount_percent || 0) / 100);

        const container = document.createElement('div');
        container.id = 'velocity-upsell-root';

        const shadow = container.attachShadow({ mode: 'open' });

        shadow.innerHTML = `
            <style>${styles}</style>
            <div class="velocity-card">
                <div class="velocity-close" onclick="this.closest('#velocity-upsell-root').remove()">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </div>
                <div class="velocity-badge">AI Recommendation</div>
                <div class="velocity-title">Perfect Match Found</div>
                
                <div class="velocity-product-box">
                    <img src="${prod.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=200&fit=crop'}" class="velocity-img" onerror="this.src='https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=200&fit=crop'" />
                    <div class="velocity-info">
                        <div class="velocity-pname">${prod.name}</div>
                        <div class="velocity-price-tag">
                            <span class="velocity-old-price">₹${prod.price.toLocaleString()}</span>
                            <span class="velocity-price">₹${discountPrice.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                <button class="velocity-btn">
                    Claim ${prod.discount_percent}% Discount
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                </button>
                
                <p style="text-align: center; font-size: 8px; font-weight: 700; color: #999; text-transform: uppercase; margin-top: 12px; letter-spacing: 0.1em;">
                    Powered by Velocity AI Engine
                </p>
            </div>
        `;

        document.body.appendChild(container);
    }

    // Run when ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
