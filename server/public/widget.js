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

        if (!orderId && window.Shopify && window.Shopify.checkout) {
            orderId = window.Shopify.checkout.order_id;
            const checkoutToken = window.Shopify.checkout.token;
            console.log('[Velocity AI] Detected Token:', checkoutToken);
        }

        if (!orderId) {
            const urlParams = new URLSearchParams(window.location.search);
            orderId = urlParams.get('order_id') || urlParams.get('id');
        }

        // Final Fallback: Extract from URL path (e.g., /orders/12345678)
        if (!orderId) {
            const pathMatches = window.location.pathname.match(/\/orders\/(\d+)/);
            if (pathMatches && pathMatches[1]) {
                orderId = pathMatches[1];
            }
        }

        if (!orderId) {
            console.log('[Velocity AI] Order ID detection pending...');
            return;
        }

        fetchWithRetry(orderId, 1);
    }

    function fetchWithRetry(orderId, attempt) {
        if (attempt > 5) {
            console.log('[Velocity AI] Max retries reached. No recommendation found.');
            return;
        }

        console.log(`[Velocity AI] Fetching recommendation (Attempt ${attempt}/5)...`);

        fetch(`${API_BASE}/upsells/order/${orderId}`, {
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
