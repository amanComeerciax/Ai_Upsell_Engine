(function () {
    // Velocity AI Upsell Widget - Production v2.0
    // Now with: Click tracking, Conversion recording, 48hr expiry enforcement
    // Detect origin dynamically (so you don't have to update ngrok URL manually)
    const scriptSrc = document.currentScript ? document.currentScript.src : 'https://keila-arousable-bimolecularly.ngrok-free.dev/widget.js';
    const scriptOrigin = new URL(scriptSrc).origin;
    const API_BASE = `${scriptOrigin}/api/v1`;

    const styles = `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap');
        
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
            background: rgba(255, 255, 255, 0.95);
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
            gap: 6px;
            background: linear-gradient(135deg, #3b82f6, #6366f1);
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
            font-size: 22px;
            font-weight: 900;
            line-height: 1.1;
            margin-bottom: 8px;
            color: #000;
            text-transform: uppercase;
            font-style: italic;
            letter-spacing: -0.02em;
        }

        .velocity-timer {
            font-size: 12px;
            font-weight: 700;
            color: #ef4444;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 5px;
        }

        .velocity-timer-dot {
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: #ef4444;
            animation: velocity-pulse 1s infinite;
        }

        @keyframes velocity-pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.3; }
        }

        .velocity-product-box {
            display: flex;
            gap: 20px;
            background: rgba(0, 0, 0, 0.04);
            border-radius: 20px;
            padding: 16px;
            margin-bottom: 24px;
            border: 1px solid rgba(0, 0, 0, 0.06);
            align-items: center;
        }

        .velocity-img {
            width: 80px;
            height: 80px;
            border-radius: 16px;
            object-fit: contain;
            background: white;
            box-shadow: 0 4px 12px rgba(0,0,0,0.08);
            padding: 4px;
            flex-shrink: 0;
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

        .velocity-reason {
            font-size: 12px;
            color: #64748b;
            font-weight: 500;
            margin-bottom: 8px;
            line-height: 1.4;
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

        .velocity-discount-badge {
            background: #dcfce7;
            color: #16a34a;
            font-size: 11px;
            font-weight: 800;
            padding: 2px 8px;
            border-radius: 6px;
        }

        .velocity-btn {
            width: 100%;
            background: linear-gradient(135deg, #1a1a1a, #3b3b3b);
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
            letter-spacing: 0.02em;
        }

        .velocity-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2);
            background: linear-gradient(135deg, #000, #222);
        }

        .velocity-btn:disabled {
            opacity: 0.7;
            cursor: not-allowed;
            transform: none;
        }

        .velocity-btn.success {
            background: linear-gradient(135deg, #16a34a, #15803d);
        }

        .velocity-btn.loading {
            background: linear-gradient(135deg, #6366f1, #4f46e5);
        }

        .velocity-close {
            position: absolute;
            top: 14px;
            right: 14px;
            cursor: pointer;
            opacity: 0.25;
            transition: opacity 0.2s;
            background: none;
            border: none;
            padding: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .velocity-close:hover { opacity: 1; }

        .velocity-footer {
            text-align: center;
            font-size: 9px;
            font-weight: 700;
            color: #cbd5e1;
            text-transform: uppercase;
            margin-top: 14px;
            letter-spacing: 0.1em;
        }

        .velocity-success-msg {
            text-align: center;
            padding: 10px 0 0;
            font-size: 13px;
            font-weight: 700;
            color: #16a34a;
        }
    `;

    // ─── State ────────────────────────────────────────────────────────────────
    let currentEventId = null;
    let currentProductUrl = null;

    // ─── Init ─────────────────────────────────────────────────────────────────
    function init() {
        let orderId = window.VELOCITY_DEBUG_ID || null;
        console.log('[Velocity AI] Widget v2.0 initializing...');

        // 1. Shopify Checkout Thank-You page
        if (!orderId && window.Shopify && window.Shopify.checkout) {
            orderId = window.Shopify.checkout.order_id;
            console.log('[Velocity AI] Detected from Shopify.checkout:', orderId);
        }

        // 2. Shopify Order Status page
        if (!orderId && window.Shopify && window.Shopify.order) {
            orderId = window.Shopify.order.id;
            console.log('[Velocity AI] Detected from Shopify.order:', orderId);
        }

        // 3. URL query parameters
        let eventId = null;
        const urlParams = new URLSearchParams(window.location.search);
        eventId = urlParams.get('event_id');

        if (!orderId) {
            orderId = urlParams.get('order_id') || urlParams.get('id') || urlParams.get('order');
        }

        // 4. Extract from URL path patterns
        if (!orderId) {
            const patterns = [
                /\/(?:orders|confirmed)\/(order_|)(\d+)/,
                /\/checkouts\/[^/]+\/thank_you.*order_id[=:](\d+)/i,
                /\/(\d{10,})/,
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

        // 5. Check page scripts
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

        // 6. Pre-purchase: Product Page
        let productId = null;
        if (!orderId && window.meta && window.meta.product) {
            productId = window.meta.product.id;
        }

        if (!orderId && !productId && (window.location.pathname.includes('/products/') || window.location.pathname.includes('/items/'))) {
            const scripts = document.querySelectorAll('script[type="application/json"]');
            scripts.forEach(s => {
                if (!productId && s.textContent.includes('product')) {
                    const match = s.textContent.match(/"id"\s*:\s*(\d{10,})/);
                    if (match) productId = match[1];
                }
            });
        }

        // 7. Cart page
        if (!orderId && !productId && (window.location.pathname.includes('/cart') || window.Shopify?.cart)) {
            console.log('[Velocity AI] On Cart page, fetching live context...');
            fetch('/cart.js')
                .then(res => res.json())
                .then(cart => {
                    if (cart.items && cart.items.length > 0) {
                        const pId = cart.items[0].product_id;
                        console.log('[Velocity AI] Detected Cart Context via AJAX:', pId);
                        fetchRecommendation(`${API_BASE}/ai/recommend?product_id=${pId}`, 1);
                    } else {
                        throw new Error('Empty Cart');
                    }
                })
                .catch(() => {
                    console.log('[Velocity AI] Cart empty or undetected. Retrying...');
                    setTimeout(init, 5000);
                });
            return;
        }

        if (eventId) {
            console.log('[Velocity AI] Processing direct Event Link:', eventId);
            fetchRecommendation(`${API_BASE}/upsells/${eventId}`, 1);
        } else if (orderId) {
            console.log('[Velocity AI] Processing Post-purchase for Order:', orderId);
            fetchRecommendation(`${API_BASE}/upsells/order/${orderId}`, 1);
        } else if (productId) {
            console.log('[Velocity AI] Processing Pre-purchase for Product:', productId);
            fetchRecommendation(`${API_BASE}/ai/recommend?product_id=${productId}`, 1);
        } else {
            console.log('[Velocity AI] No context found yet. Retrying in 5s...');
            setTimeout(init, 5000);
        }
    }

    // ─── Fetch Recommendation ─────────────────────────────────────────────────
    function fetchRecommendation(url, attempt) {
        if (attempt > 3) return;

        fetch(url, {
            headers: {
                'ngrok-skip-browser-warning': 'true',
                'Content-Type': 'application/json'
            }
        })
            .then(res => {
                if (res.status === 410) throw new Error('EXPIRED');
                if (!res.ok) throw new Error('Pending AI logic...');
                return res.json();
            })
            .then(data => {
                console.log('[Velocity AI] Match Found! Rendering widget.');
                // Store event_id for tracking
                currentEventId = data.event_id || null;
                renderWidget(data);

                // Track impression (shown)
                if (currentEventId) {
                    trackShown(currentEventId);
                }
            })
            .catch(err => {
                if (err.message === 'EXPIRED') {
                    console.log('[Velocity AI] Offer expired. Widget will not show.');
                    return;
                }
                console.log(`[Velocity AI] AI is still thinking... Retrying in 2s. (attempt ${attempt})`);
                setTimeout(() => fetchRecommendation(url, attempt + 1), 2000);
            });
    }

    // ─── Track Impression ─────────────────────────────────────────────────────
    function trackShown(eventId) {
        fetch(`${API_BASE}/upsells/${eventId}/shown`, {
            method: 'POST',
            headers: {
                'ngrok-skip-browser-warning': 'true',
                'Content-Type': 'application/json'
            }
        }).catch(err => console.warn('[Velocity AI] Could not track impression:', err));
    }

    // ─── Track Conversion ─────────────────────────────────────────────────────
    function trackConversion(eventId, btn) {
        btn.disabled = true;
        btn.className = 'velocity-btn loading';
        btn.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="animation: spin 1s linear infinite">
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
            </svg>
            Processing...
        `;

        fetch(`${API_BASE}/upsells/${eventId}/convert`, {
            method: 'POST',
            headers: {
                'ngrok-skip-browser-warning': 'true',
                'Content-Type': 'application/json'
            }
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    console.log('[Velocity AI] ✅ Conversion recorded! Adding to cart...');

                    const variantId = data.recommended_product?.shopify_variant_id || data.shopify_variant_id;

                    if (!variantId) {
                        console.error('[Velocity AI] No Variant ID found, falling back to product page');
                        window.location.href = currentProductUrl;
                        return;
                    }

                    // Show "Redirecting..." status
                    btn.innerHTML = `
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="animation: spin 1s linear infinite">
                            <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                        </svg>
                        Going to Checkout...
                    `;

                    // Real Shopify AJAX Add to Cart (Direct format)
                    fetch('/cart/add.js', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            id: variantId,
                            quantity: 1
                        })
                    })
                        .then(response => {
                            if (!response.ok) throw new Error('Add to cart failed');
                            return response.json();
                        })
                        .then(() => {
                            console.log('[Velocity AI] Product added! Redirecting to checkout...');
                            window.location.href = '/checkout';
                        })
                        .catch(err => {
                            console.warn('[Velocity AI] Cart add failed, trying direct cart page:', err);
                            window.location.href = '/cart';
                        });
                } else {
                    btn.disabled = false;
                    btn.className = 'velocity-btn';
                    btn.textContent = 'Try Again';
                }
            })
            .catch(err => {
                console.error('[Velocity AI] Conversion error:', err);
                btn.disabled = false;
                btn.className = 'velocity-btn';
                btn.textContent = 'Retry';
            });
    }

    // ─── Render Widget ────────────────────────────────────────────────────────
    function renderWidget(data) {
        const prod = data.recommended_product;
        if (!prod) return;

        const discountPrice = prod.price * (1 - (prod.discount_percent || 0) / 100);

        // ── Set redirect URL (priority: shopify_url > cart add > fallback) ──
        if (prod.shopify_url) {
            currentProductUrl = prod.shopify_url;
        } else if (prod.shopify_id) {
            currentProductUrl = `/cart/add?id=${prod.shopify_id}&quantity=1`;
        }

        // Calculate time remaining display
        let timerHtml = '';
        if (data.expires_at) {
            const msLeft = new Date(data.expires_at).getTime() - Date.now();
            if (msLeft > 0) {
                const hoursLeft = Math.floor(msLeft / (1000 * 60 * 60));
                const minutesLeft = Math.floor((msLeft % (1000 * 60 * 60)) / (1000 * 60));
                timerHtml = `
                    <div class="velocity-timer">
                        <div class="velocity-timer-dot"></div>
                        Offer expires in ${hoursLeft}h ${minutesLeft}m
                    </div>
                `;
            }
        }

        const container = document.createElement('div');
        container.id = 'velocity-upsell-root';

        // Critical: Set styles on the host element so it positions correctly in the main page
        Object.assign(container.style, {
            position: 'fixed',
            bottom: '30px',
            right: '30px',
            width: '380px',
            zIndex: '2147483647', // Maximum possible z-index
            pointerEvents: 'none' // Allow clicking through if needed, but inner card will enable it
        });

        const shadow = container.attachShadow({ mode: 'open' });

        shadow.innerHTML = `
            <style>
                ${styles}
                .velocity-card {
                    pointer-events: auto; /* Enable clicks on the card itself */
                }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            </style>
            <div class="velocity-card">
                <button class="velocity-close" id="vel-close-btn" aria-label="Close">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>

                <div class="velocity-badge">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                    AI Recommendation
                </div>

                <div class="velocity-title">Perfect Match Found</div>

                ${timerHtml}

                <div class="velocity-product-box">
                    <img 
                        src="${prod.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=200&fit=crop'}" 
                        class="velocity-img" 
                        onerror="this.src='https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=200&fit=crop'"
                        alt="${prod.name}"
                    />
                    <div class="velocity-info">
                        <div class="velocity-pname">${prod.name}</div>
                        <div class="velocity-price-tag">
                            <span class="velocity-old-price">₹${prod.price.toLocaleString('en-IN')}</span>
                            <span class="velocity-price">₹${discountPrice.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                            <span class="velocity-discount-badge">-${prod.discount_percent}%</span>
                        </div>
                    </div>
                </div>

                <button class="velocity-btn" id="vel-claim-btn">
                    Claim ${prod.discount_percent}% Discount
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                </button>

                <div class="velocity-footer">Powered by Velocity AI Engine</div>
            </div>
        `;

        document.body.appendChild(container);

        // ── Event Listeners ──
        shadow.getElementById('vel-close-btn').addEventListener('click', () => {
            container.remove();
        });

        shadow.getElementById('vel-claim-btn').addEventListener('click', () => {
            if (currentEventId) {
                trackConversion(currentEventId, shadow.getElementById('vel-claim-btn'));
            } else {
                // No event ID (pre-purchase flow) — just redirect to product
                if (currentProductUrl) {
                    window.location.href = currentProductUrl;
                }
            }
        });
    }

    // ─── Boot ─────────────────────────────────────────────────────────────────
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
