(function () {
    // ─── Velocity AI Upsell Widget v2.5.0 ────────────────────────────────────
    // Fixes: event_id priority, cart page detection, double-init guard,
    //        ngrok interstitial bypass, AbortController for stale requests
    const VERSION = '2.6.0';

    // Detect origin dynamically — 3 sources (priority order):
    // 1. data-api-url attribute on the script tag (explicit override)
    // 2. Script tag src origin (auto-detect from wherever script is loaded)
    // 3. Render production URL (final fallback)
    const currentScript = document.currentScript;
    const dataApiUrl = currentScript?.getAttribute('data-api-url');
    const scriptSrc = currentScript
        ? currentScript.src
        : 'https://ai-upsell-engine.onrender.com/widget.js';
    const scriptOrigin = new URL(scriptSrc).origin;
    const API_BASE = dataApiUrl || `${scriptOrigin}/api/v1`;

    // ─── Styles ───────────────────────────────────────────────────────────────
    const styles = `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap');

        #velocity-upsell-root {
            font-family: 'Inter', system-ui, -apple-system, sans-serif;
            position: fixed;
            bottom: 30px;
            right: 30px;
            width: 380px;
            z-index: 2147483647;
            animation: velocity-slide-up 0.6s cubic-bezier(0.16, 1, 0.3, 1);
            pointer-events: none;
        }

        @keyframes velocity-slide-up {
            from { transform: translateY(100px); opacity: 0; }
            to   { transform: translateY(0);     opacity: 1; }
        }

        .velocity-card {
            background: rgba(255,255,255,0.95);
            backdrop-filter: blur(25px);
            -webkit-backdrop-filter: blur(25px);
            border: 1px solid rgba(255,255,255,0.4);
            border-radius: 32px;
            padding: 32px;
            box-shadow: 0 40px 80px rgba(0,0,0,0.15);
            overflow: hidden;
            position: relative;
            pointer-events: auto;
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
            width: 6px; height: 6px;
            border-radius: 50%;
            background: #ef4444;
            animation: velocity-pulse 1s infinite;
        }

        @keyframes velocity-pulse {
            0%, 100% { opacity: 1; }
            50%       { opacity: 0.3; }
        }

        .velocity-product-box {
            display: flex;
            gap: 20px;
            background: rgba(0,0,0,0.04);
            border-radius: 20px;
            padding: 16px;
            margin-bottom: 24px;
            border: 1px solid rgba(0,0,0,0.06);
            align-items: center;
        }

        .velocity-img {
            width: 80px; height: 80px;
            border-radius: 16px;
            object-fit: contain;
            background: white;
            box-shadow: 0 4px 12px rgba(0,0,0,0.08);
            padding: 4px;
            flex-shrink: 0;
        }

        .velocity-info { display: flex; flex-direction: column; flex: 1; }

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

        .velocity-price-tag { display: flex; align-items: baseline; gap: 8px; }

        .velocity-price    { font-size: 18px; font-weight: 900; color: #3b82f6; }
        .velocity-old-price { font-size: 13px; text-decoration: line-through; color: #94a3b8; font-weight: 600; }
        .velocity-discount-badge { background: #dcfce7; color: #16a34a; font-size: 11px; font-weight: 800; padding: 2px 8px; border-radius: 6px; }

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
            transition: all 0.3s cubic-bezier(0.16,1,0.3,1);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            letter-spacing: 0.02em;
        }
        .velocity-btn:hover    { transform: translateY(-2px); box-shadow: 0 12px 24px rgba(0,0,0,0.2); background: linear-gradient(135deg, #000, #222); }
        .velocity-btn:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }
        .velocity-btn.success  { background: linear-gradient(135deg, #16a34a, #15803d); }
        .velocity-btn.loading  { background: linear-gradient(135deg, #6366f1, #4f46e5); }

        .velocity-close {
            position: absolute;
            top: 14px; right: 14px;
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

        /* ── Carousel ──────────────────────────────────── */
        .velocity-carousel-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
        }
        .velocity-counter {
            font-size: 12px; font-weight: 700;
            color: #94a3b8;
            background: rgba(0,0,0,0.05);
            padding: 3px 10px;
            border-radius: 20px;
        }
        .velocity-nav-arrows { display: flex; gap: 6px; }
        .velocity-nav-btn {
            width: 28px; height: 28px;
            border-radius: 50%;
            border: 1.5px solid #e2e8f0;
            background: white;
            cursor: pointer;
            display: flex; align-items: center; justify-content: center;
            color: #374151;
            transition: all 0.2s;
            font-size: 14px; line-height: 1;
        }
        .velocity-nav-btn:hover { background: #3b82f6; color: white; border-color: #3b82f6; }
        .velocity-nav-btn:disabled { opacity: 0.3; cursor: not-allowed; }
        .velocity-slides-container { overflow: hidden; margin-bottom: 14px; }
        .velocity-slides-track {
            display: flex;
            transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .velocity-slide { min-width: 100%; }
        .velocity-dots {
            display: flex; justify-content: center; gap: 6px; margin-bottom: 16px;
        }
        .velocity-dot {
            width: 6px; height: 6px; border-radius: 50%;
            background: #e2e8f0; border: none; cursor: pointer;
            transition: all 0.25s; padding: 0;
        }
        .velocity-dot.active { background: #3b82f6; width: 20px; border-radius: 3px; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        /* ── Gamified Progress Bar ────────────────────── */
        .velocity-progress-area {
            margin-bottom: 24px;
            padding: 20px;
            background: rgba(255,255,255,0.6);
            border-radius: 24px;
            border: 1px solid rgba(0,0,0,0.03);
        }
        .velocity-progress-text {
            font-size: 13px;
            font-weight: 700;
            color: #1e293b;
            margin-bottom: 12px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .velocity-progress-track {
            height: 10px;
            background: #f1f5f9;
            border-radius: 5px;
            overflow: hidden;
            position: relative;
            margin-bottom: 16px;
        }
        .velocity-progress-bar {
            height: 100%;
            background: linear-gradient(90deg, #3b82f6, #06b6d4);
            border-radius: 5px;
            transition: width 1s cubic-bezier(0.34, 1.56, 0.64, 1);
            position: relative;
        }
        .velocity-progress-bar::after {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
            animation: velocity-shimmer 2s infinite;
        }
        @keyframes velocity-shimmer {
            0%   { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
        }
        .velocity-suggestion-strip {
            display: flex;
            gap: 10px;
            overflow-x: auto;
            padding-bottom: 4px;
            scrollbar-width: none;
        }
        .velocity-suggestion-strip::-webkit-scrollbar { display: none; }
        .velocity-mini-card {
            min-width: 140px;
            background: white;
            border-radius: 16px;
            padding: 10px;
            display: flex;
            align-items: center;
            gap: 10px;
            cursor: pointer;
            border: 1px solid #f1f5f9;
            transition: all 0.2s;
        }
        .velocity-mini-card:hover { border-color: #3b82f6; box-shadow: 0 4px 12px rgba(59,130,246,0.1); }
        .velocity-mini-img {
            width: 32px; height: 32px;
            border-radius: 8px;
            object-fit: cover;
            background: #f8fafc;
        }
        .velocity-mini-info { display: flex; flex-direction: column; flex: 1; min-width: 0; }
        .velocity-mini-name {
            font-size: 10px; font-weight: 700;
            color: #1e293b;
            white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .velocity-mini-price { font-size: 11px; font-weight: 800; color: #3b82f6; }
        .velocity-unlocked-glow {
            animation: velocity-glow 2s infinite;
            background: linear-gradient(90deg, #10b981, #34d399);
        }
        @keyframes velocity-glow {
            0%, 100% { box-shadow: 0 0 10px rgba(16,185,129,0.2); }
            50%       { box-shadow: 0 0 20px rgba(16,185,129,0.5); }
        }
        /* ── Launcher ────────────────────────────────── */
        .velocity-launcher {
            position: fixed;
            bottom: 30px;
            right: 30px;
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: linear-gradient(135deg, #06b6d4, #3b82f6);
            box-shadow: 0 10px 30px rgba(6, 182, 212, 0.4);
            cursor: pointer;
            z-index: 999998;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            border: none;
            transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            pointer-events: auto;
        }
        .velocity-launcher:hover { transform: scale(1.1) rotate(5deg); }
        .velocity-launcher svg { width: 28px; height: 28px; }
    `;

    // ─── State ────────────────────────────────────────────────────────────────
    let currentEventId = null;
    let currentProductUrl = null;
    let currentVariantId = null;
    let isLoading = false;   // Guard: prevents double-init race condition
    let activeController = null;    // AbortController: cancels stale requests

    // ─── Shared fetch options (bypasses ngrok interstitial on API calls) ──────
    const FETCH_OPTS = {
        headers: {
            'ngrok-skip-browser-warning': 'true',
            'Content-Type': 'application/json'
        }
    };

    // ─── Init ─────────────────────────────────────────────────────────────────
    function init() {
        if (isLoading) {
            console.log(`[Velocity AI] ⏳ v${VERSION} already loading — skipping duplicate init.`);
            return;
        }

        console.log(`[Velocity AI] 🚀 Version ${VERSION} initializing... URL: ${window.location.pathname}`);
        console.log('[Velocity AI] 🔍 Context check: ', {
            shop: window.Shopify?.shop,
            pathname: window.location.pathname,
            checkout: !!window.Shopify?.checkout,
            order: !!window.Shopify?.order
        });

        const urlParams = new URLSearchParams(window.location.search);
        const shopParam = window.Shopify?.shop
            ? `&shop=${window.Shopify.shop}`
            : (window.location.hostname.includes('.myshopify.com')
                ? `&shop=${window.location.hostname}`
                : '');

        // ── PRIORITY 1: Direct email/event link (?event_id=XX) ───────────────
        // Must check BEFORE cart detection so upsell emails work even on /cart
        const eventId = urlParams.get('event_id');
        if (eventId) {
            console.log('[Velocity AI] 📧 Direct Event Link detected:', eventId);
            fetchRecommendation(`${API_BASE}/upsells/${eventId}?debug=1${shopParam}`, 1);
            return;
        }

        // ── PRIORITY 2: Post-purchase order ID ───────────────────────────────
        let orderId = window.VELOCITY_DEBUG_ID || null;

        if (!orderId && window.Shopify?.checkout) {
            orderId = window.Shopify.checkout.order_id;
            console.log('[Velocity AI] Detected from Shopify.checkout:', orderId);
        }
        if (!orderId && window.Shopify?.order) {
            orderId = window.Shopify.order.id;
            console.log('[Velocity AI] Detected from Shopify.order:', orderId);
        }
        if (!orderId) {
            orderId = urlParams.get('order_id') || urlParams.get('id') || urlParams.get('order');
        }
        if (!orderId) {
            const patterns = [
                /\/(?:orders|confirmed)\/(order_|)(\d+)/,
                /\/checkouts\/[^/]+\/thank_you.*order_id[=:](\d+)/i,
            ];
            for (const p of patterns) {
                const m = window.location.href.match(p);
                if (m) { orderId = m[2] || m[1]; console.log('[Velocity AI] Detected order from URL:', orderId); break; }
            }
        }
        if (!orderId) {
            document.querySelectorAll('script').forEach(s => {
                if (!orderId && s.textContent) {
                    const m = s.textContent.match(/"order_id"\s*:\s*(\d+)/);
                    if (m) { orderId = m[1]; console.log('[Velocity AI] Detected order from script:', orderId); }
                }
            });
        }

        if (orderId) {
            console.log('[Velocity AI] 📦 Post-purchase flow for Order:', orderId);
            fetchRecommendation(`${API_BASE}/upsells/order/${orderId}?debug=1${shopParam}`, 1);
            return;
        }

        // ── PRIORITY 3: Cart page ─────────────────────────────────────────────
        if (window.location.pathname === '/cart' || window.location.pathname.startsWith('/cart/')) {
            console.log('[Velocity AI] 🛒 Cart page detected. Fetching items...');
            fetch('/cart.js', FETCH_OPTS)
                .then(r => r.json())
                .then(cart => {
                    if (cart.items && cart.items.length > 0) {
                        const pId = cart.items[0].product_id;
                        console.log('[Velocity AI] ✅ Cart has items. Fetching recommendation for product:', pId);
                        fetchRecommendation(`${API_BASE}/ai/recommend?product_id=${pId}${shopParam}`, 1);
                    } else {
                        console.log('[Velocity AI] ℹ️ Cart is empty. Widget will wait for items.');
                    }
                })
                .catch(err => {
                    console.warn('[Velocity AI] ❌ Cart fetch failed:', err);
                    setTimeout(init, 5000);
                });
            return;
        }

        // ── PRIORITY 4: Product page ──────────────────────────────────────────
        let productId = null;
        if (window.meta?.product) productId = window.meta.product.id;

        if (!productId && (window.location.pathname.includes('/products/') || window.location.pathname.includes('/items/'))) {
            document.querySelectorAll('script[type="application/json"]').forEach(s => {
                if (!productId && s.textContent && s.textContent.includes('product')) {
                    const m = s.textContent.match(/"id"\s*:\s*(\d{10,})/);
                    if (m) productId = m[1];
                }
            });
        }

        if (productId) {
            console.log('[Velocity AI] 🏷️ Pre-purchase flow for Product:', productId);
            fetchRecommendation(`${API_BASE}/ai/recommend?product_id=${productId}${shopParam}`, 1);
            return;
        }

        console.log('[Velocity AI] ℹ️ No context detected on this page. Watching for cart actions...');
        
        // Always check for progress bar if active merchant
        if (window.location.pathname === '/cart' || window.location.pathname.startsWith('/cart/')) {
            checkProgressBar();
        }
    }

    // ─── Progress Bar Logic ──────────────────────────────────────────────────
    async function checkProgressBar() {
        const shop = window.Shopify?.shop || window.location.hostname;
        try {
            const cartRes = await fetch('/cart.js', FETCH_OPTS);
            const cart = await cartRes.json();
            const total = cart.total_price / 100; // Shopify cents to dollars/rupees

            const res = await fetch(`${API_BASE}/upsells/filling-products?cart_total=${total}&shop=${shop}`, FETCH_OPTS);
            const data = await res.json();

            if (data.active) {
                renderProgressBar(data, total);
            }
        } catch (e) {
            console.warn('[Velocity AI] Progress bar check failed:', e);
        }
    }

    function renderProgressBar(data, cartTotal) {
        const root = document.getElementById('velocity-upsell-root') || createRootContainer();
        const shadow = root.shadowRoot;
        
        // Check if progress bar already exists in shadow
        let area = shadow.querySelector('.velocity-progress-area');
        if (!area) {
            area = document.createElement('div');
            area.className = 'velocity-progress-area';
            // Insert before the footer or claim button
            const footer = shadow.querySelector('.velocity-footer') || shadow.querySelector('.velocity-btn');
            shadow.querySelector('.velocity-card').insertBefore(area, footer);
        }

        const pct = Math.min((cartTotal / data.threshold) * 100, 100);
        const remaining = Math.max(0, data.threshold - cartTotal);

        let content = '';
        if (data.unlocked || pct >= 100) {
            content = `
                <div class="velocity-progress-text">
                    <span style="color:#10b981">✨ FREE SHIPPING UNLOCKED</span>
                    <span>100%</span>
                </div>
                <div class="velocity-progress-track">
                    <div class="velocity-progress-bar velocity-unlocked-glow" style="width: 100%"></div>
                </div>
                <p style="font-size:11px; color:#64748b; font-weight:600; text-align:center">Excellent choice! Your shipping is on us.</p>
            `;
        } else {
            const suggestionsHtml = (data.suggestions || []).map(s => `
                <div class="velocity-mini-card" onclick="window.VelocityAPI.addToCart('${s.shopify_variant_id || s.shopify_id}')">
                    <img src="${s.image}" class="velocity-mini-img" />
                    <div class="velocity-mini-info">
                        <div class="velocity-mini-name">${s.name}</div>
                        <div class="velocity-mini-price">&#8377;${Number(s.price).toLocaleString()}</div>
                    </div>
                </div>
            `).join('');

            content = `
                <div class="velocity-progress-text">
                    <span>Add ₹${remaining.toLocaleString()} for 🚚 FREE Shipping</span>
                    <span>${Math.round(pct)}%</span>
                </div>
                <div class="velocity-progress-track">
                    <div class="velocity-progress-bar" style="width: ${pct}%"></div>
                </div>
                <div style="font-size:10px; color:#64748b; font-weight:700; text-transform:uppercase; margin-bottom:10px; letter-spacing:0.02em">Suggested Boosters</div>
                <div class="velocity-suggestion-strip">
                    ${suggestionsHtml}
                </div>
            `;
        }

        area.innerHTML = content;
        
        // Show the container if it was hidden
        root.style.display = 'block';
    }

    function createRootContainer() {
        const container = document.createElement('div');
        container.id = 'velocity-upsell-root';
        Object.assign(container.style, {
            position: 'fixed', bottom: '30px', right: '30px',
            width: '380px', zIndex: '2147483647', pointerEvents: 'none'
        });
        const shadow = container.attachShadow({ mode: 'open' });
        shadow.innerHTML = `
            <style>${styles}</style>
            <div class="velocity-card">
                <button class="velocity-close" onclick="this.closest('#velocity-upsell-root').remove()" style="position:absolute; top:14px; right:14px; opacity:0.25; cursor:pointer; background:none; border:none; padding:4px"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
                <div class="velocity-title" style="margin-top:10px">Your Progress</div>
                <div class="velocity-footer" style="margin-top:20px">Powered by Velocity AI Engine</div>
            </div>`;
        document.body.appendChild(container);
        return container;
    }

    window.VelocityAPI = {
        addToCart: (variantId) => {
            fetch('/cart/add.js', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: variantId, quantity: 1 })
            }).then(() => {
                window.location.reload();
            });
        }
    };

    // ─── Fetch Recommendation ─────────────────────────────────────────────────
    function fetchRecommendation(url, attempt) {
        if (attempt > 3) {
            console.warn('[Velocity AI] ⚠️ Max retry attempts reached.');
            isLoading = false;
            return;
        }

        // Cancel any previous in-flight request
        if (activeController) activeController.abort();
        activeController = new AbortController();
        isLoading = true;

        console.log(`[Velocity AI] 📡 Calling API (attempt ${attempt}):`, url);

        fetch(url, { signal: activeController.signal, ...FETCH_OPTS })
            .then(res => {
                if (res.status === 410) throw new Error('EXPIRED');
                if (res.status === 401) throw new Error('UNAUTHORIZED');
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            })
            .then(data => {
                isLoading = false;
                const hasRecs = Array.isArray(data.recommendations) && data.recommendations.length > 0;
                const hasLegacy = !!data.recommended_product;
                if (!data.success && !hasRecs && !hasLegacy) throw new Error('No recommendation');
                console.log('[Velocity AI] ✨ Recommendation Found! Rendering carousel...');
                currentEventId = data.event_id || null;
                renderWidget(data);
                if (currentEventId) trackShown(currentEventId);
            })
            .catch(err => {
                if (err.name === 'AbortError') {
                    console.log('[Velocity AI] 🔄 Request aborted (stale). New fetch will take over.');
                    return;
                }
                isLoading = false;
                if (err.message === 'EXPIRED') { console.log('[Velocity AI] ⏹️ Offer expired.'); return; }
                if (err.message === 'UNAUTHORIZED') { console.warn('[Velocity AI] ❌ Unauthorized! Check shop param.'); return; }
                if (err.message.includes('HTTP 400')) { console.warn('[Velocity AI] ⚠️ Insufficient data for recommendations.'); return; }
                
                console.log(`[Velocity AI] ⏳ ${err.message}. Retrying in 2s... (attempt ${attempt})`);
                setTimeout(() => fetchRecommendation(url, attempt + 1), 2000);
            });
    }

    // ─── Track Impression ─────────────────────────────────────────────────────
    function trackShown(eventId) {
        fetch(`${API_BASE}/upsells/${eventId}/shown`, { method: 'POST', ...FETCH_OPTS })
            .catch(e => console.warn('[Velocity AI] Track shown error:', e));
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

        fetch(`${API_BASE}/upsells/${eventId}/convert`, { method: 'POST', ...FETCH_OPTS })
            .then(res => {
                if (!res.ok) throw new Error('Convert failed');
                return res.json();
            })
            .then(data => {
                btn.className = 'velocity-btn success';
                btn.innerHTML = `✓ Added to Cart! Redirecting...`;

                const variantId = data.shopify_variant_id || data.recommended_product?.shopify_variant_id;
                if (variantId) {
                    fetch('/cart/add.js', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id: variantId, quantity: 1 })
                    })
                        .then(r => { if (!r.ok) throw new Error(); return r.json(); })
                        .then(() => { window.location.href = '/checkout'; })
                        .catch(() => { window.location.href = '/cart'; });
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

    // ─── Render Widget (Carousel) ─────────────────────────────────────────────
    function renderWidget(data) {
        // Normalize: support new recommendations[] and legacy recommended_product
        const recs = (Array.isArray(data.recommendations) && data.recommendations.length > 0)
            ? data.recommendations
            : (data.recommended_product ? [data.recommended_product] : []);
        if (recs.length === 0) return;

        const existing = document.getElementById('velocity-upsell-root');
        if (existing) {
            existing.style.display = 'block';
            return; // Already rendered, just show it
        }

        const total = recs.length;
        const FALLBACK_IMG = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=200&fit=crop';

        // Timer
        let timerHtml = '';
        if (data.expires_at) {
            const msLeft = new Date(data.expires_at).getTime() - Date.now();
            if (msLeft > 0) {
                const h = Math.floor(msLeft / 3600000);
                const m = Math.floor((msLeft % 3600000) / 60000);
                timerHtml = `<div class="velocity-timer"><div class="velocity-timer-dot"></div>Offer expires in ${h}h ${m}m</div>`;
            }
        }

        // Build slides HTML
        const slidesHtml = recs.map(prod => {
            const dPrice = (prod.price * (1 - (prod.discount_percent || 0) / 100)).toLocaleString('en-IN', { maximumFractionDigits: 0 });
            const oPrice = Number(prod.price).toLocaleString('en-IN');
            return `
            <div class="velocity-slide">
                <div class="velocity-product-box">
                    <img src="${prod.image || FALLBACK_IMG}" class="velocity-img"
                         onerror="this.src='${FALLBACK_IMG}'" alt="${prod.name || 'Product'}" />
                    <div class="velocity-info">
                        <div class="velocity-pname">${prod.name || 'Top Pick'}</div>
                        ${prod.reason ? `<div class="velocity-reason">${prod.reason}</div>` : ''}
                        <div class="velocity-price-tag">
                            <span class="velocity-old-price">&#8377;${oPrice}</span>
                            <span class="velocity-price">&#8377;${dPrice}</span>
                            <span class="velocity-discount-badge">-${prod.discount_percent || 15}%</span>
                        </div>
                    </div>
                </div>
            </div>`;
        }).join('');

        // Dots HTML
        const dotsHtml = total > 1
            ? `<div class="velocity-dots">${recs.map((_, i) => `<button class="velocity-dot${i === 0 ? ' active' : ''}" data-idx="${i}"></button>`).join('')}</div>`
            : '';

        // Counter / arrows
        const counterHtml = total > 1 ? `<span class="velocity-counter">1 / ${total}</span>` : '';
        const arrowsHtml = total > 1
            ? `<div class="velocity-nav-arrows">
                <button class="velocity-nav-btn" id="vel-prev" disabled>&#8592;</button>
                <button class="velocity-nav-btn" id="vel-next">&#8594;</button>
               </div>`
            : '';

        const container = document.createElement('div');
        container.id = 'velocity-upsell-root';
        Object.assign(container.style, {
            position: 'fixed', bottom: '30px', right: '30px',
            width: '380px', zIndex: '2147483647', pointerEvents: 'none'
        });

        const shadow = container.attachShadow({ mode: 'open' });
        shadow.innerHTML = `
            <style>${styles}</style>
            <div class="velocity-card">
                <button class="velocity-close" id="vel-close" aria-label="Close">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>

                <div class="velocity-carousel-header">
                    <div style="display:flex;align-items:center;gap:8px">
                        ${counterHtml}
                        ${arrowsHtml}
                    </div>
                </div>

                <div class="velocity-title">Perfect Match Found</div>
                ${timerHtml}

                <div class="velocity-slides-container">
                    <div class="velocity-slides-track" id="vel-track">${slidesHtml}</div>
                </div>

                ${dotsHtml}

                <button class="velocity-btn" id="vel-claim">
                    Claim ${recs[0].discount_percent || 15}% Discount
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </button>

                <div class="velocity-footer">Powered by Velocity AI Engine</div>
            </div>
            <button class="velocity-launcher" id="vel-launcher" style="display:none">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
            </button>
        `;

        document.body.appendChild(container);

        let currentSlide = 0;

        function goTo(idx) {
            currentSlide = idx;
            shadow.getElementById('vel-track').style.transform = `translateX(-${idx * 100}%)`;

            // Update counter
            const counter = shadow.querySelector('.velocity-counter');
            if (counter) counter.textContent = `${idx + 1} / ${total}`;

            // Update dots
            shadow.querySelectorAll('.velocity-dot').forEach((d, i) => {
                d.classList.toggle('active', i === idx);
            });

            // Update nav buttons
            const prev = shadow.getElementById('vel-prev');
            const next = shadow.getElementById('vel-next');
            if (prev) prev.disabled = idx === 0;
            if (next) next.disabled = idx === total - 1;

            // Update claim button text + current product URL
            const prod = recs[idx];
            const claimBtn = shadow.getElementById('vel-claim');
            claimBtn.innerHTML = `Claim ${prod.discount_percent || 15}% Discount <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>`;

            if (prod.shopify_url) currentProductUrl = prod.shopify_url;
            else currentProductUrl = null;
            currentVariantId = prod.shopify_variant_id || null;
        }

        // Event listeners
        shadow.getElementById('vel-close').addEventListener('click', () => {
            shadow.querySelector('.velocity-card').style.display = 'none';
            shadow.getElementById('vel-launcher').style.display = 'flex';
        });

        shadow.getElementById('vel-launcher').addEventListener('click', () => {
            shadow.querySelector('.velocity-card').style.display = 'block';
            shadow.getElementById('vel-launcher').style.display = 'none';
        });

        shadow.getElementById('vel-claim').addEventListener('click', () => {
            const btn = shadow.getElementById('vel-claim');
            if (currentEventId) {
                trackConversion(currentEventId, btn);
            } else if (currentVariantId) {
                // No event_id (cart/product page carousel) — add to cart directly
                btn.disabled = true;
                btn.innerHTML = 'Adding to cart...';
                fetch('/cart/add.js', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: currentVariantId, quantity: 1 })
                })
                .then(r => { if (!r.ok) throw new Error(); return r.json(); })
                .then(() => { window.location.href = '/cart'; })
                .catch(() => {
                    // Fallback: redirect to product page
                    if (currentProductUrl) window.location.href = currentProductUrl;
                    else { btn.disabled = false; btn.textContent = 'Try Again'; }
                });
            } else if (currentProductUrl) {
                window.location.href = currentProductUrl;
            }
        });

        if (total > 1) {
            shadow.getElementById('vel-prev').addEventListener('click', () => { if (currentSlide > 0) goTo(currentSlide - 1); });
            shadow.getElementById('vel-next').addEventListener('click', () => { if (currentSlide < total - 1) goTo(currentSlide + 1); });

            shadow.querySelectorAll('.velocity-dot').forEach((dot, i) => {
                dot.addEventListener('click', () => goTo(i));
            });

            // Touch swipe
            let touchStartX = 0;
            const track = shadow.getElementById('vel-track');
            track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
            track.addEventListener('touchend', e => {
                const diff = touchStartX - e.changedTouches[0].clientX;
                if (Math.abs(diff) > 50) {
                    if (diff > 0 && currentSlide < total - 1) goTo(currentSlide + 1);
                    else if (diff < 0 && currentSlide > 0) goTo(currentSlide - 1);
                }
            }, { passive: true });
        }

        // Initialize first slide
        goTo(0);
    }

    // ─── Navigation Monitor ───────────────────────────────────────────────────
    function watchNavigation() {
        console.log('[Velocity AI] 📡 Monitoring navigation and cart events...');

        // AJAX Cart events (fetch hijack)
        const origFetch = window.fetch;
        window.fetch = function () {
            const arg = arguments[0];
            const url = typeof arg === 'string' ? arg : (arg && arg.url) ? arg.url : '';
            if (url && (url.includes('/cart/add.js') || url.includes('/cart/change.js') || url.includes('/cart/update.js'))) {
                console.log('[Velocity AI] ⚡ Cart change detected (fetch). Re-initializing after delay...');
                isLoading = false; // Allow fresh init
                setTimeout(init, 1000);
            }
            return origFetch.apply(this, arguments);
        };

        // AJAX Cart events (XHR hijack)
        const origSend = XMLHttpRequest.prototype.send;
        XMLHttpRequest.prototype.send = function () {
            this.addEventListener('load', function () {
                if (this.responseURL && (this.responseURL.includes('/cart/add.js') || this.responseURL.includes('/cart/change.js'))) {
                    console.log('[Velocity AI] ⚡ Cart change detected (XHR). Re-initializing...');
                    isLoading = false;
                    setTimeout(init, 1000);
                }
            });
            return origSend.apply(this, arguments);
        };

        // SPA navigation (History API)
        const origPush = history.pushState;
        history.pushState = function () {
            origPush.apply(this, arguments);
            isLoading = false;
            console.log('[Velocity AI] 🧭 SPA navigation detected (pushState)');
            setTimeout(init, 500);
        };

        window.addEventListener('popstate', () => {
            isLoading = false;
            console.log('[Velocity AI] 🧭 SPA navigation detected (popstate)');
            setTimeout(init, 500);
        });
    }

    // ─── Boot ─────────────────────────────────────────────────────────────────
    watchNavigation();

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
