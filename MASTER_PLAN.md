# 🚀 Velocity AI Engine — Master Implementation Plan
*Last Updated: February 18, 2026*

---

## 📊 Current State (What's Done)

| Layer | Status | Notes |
|-------|--------|-------|
| Frontend UI (all pages) | ✅ Done | Dashboard, Inventory, Campaigns, Analytics, Orders, Settings, Landing |
| Auth (Clerk) | ✅ Done | Login, Signup, Protected routes |
| DB Schema (Prisma + PostgreSQL) | ✅ Done | merchants, products, orders, upsell_events, upsell_rules, users |
| Server (Express + TypeScript) | ✅ Done | Running on port 5001 |
| AI Service (Ollama / GLM) | ✅ Done | Smart recommendation + AI Analytics Insights |
| Shopify Webhook (orders/create) | ✅ Done | Creates upsell_event on new order |
| Widget (widget.js) | ✅ Done | Shows popup + Impression tracking |
| Analytics API | ✅ Done | Dashboard stats, Revenue trajectory, Real-time telemetry |
| Email Service (Nodemailer) | ✅ Done | Automated post-purchase upsell emails |
| Conversion Tracking | ✅ Done | `POST /api/v1/upsells/:eventId/convert` works |
| Dynamic Widget URL | ✅ Done | Auto-detects server origin in `widget.js` |

---

## ❌ What's MISSING / TO-DO

1. **Live Pulse Notifications** — Real-time toast/feed updates when conversions happen.
2. **Email Customization UI** — Ability for merchants to edit templates.
3. **Merchant Onboarding Flow** — First-time setup walk-through.
4. **A/B Testing Engine** — Testing different discounts (10% vs 20%).

---

## 🗺️ Implementation Roadmap (Step by Step)

---

### STEP 1 — Fix the 48-Hour Expiry Window
**File**: `server/src/controllers/webhook.controller.ts`
**What**: When creating a `upsell_event`, set `expires_at = now + 48 hours`
**Why**: This is the core business rule — upsell offer is only valid for 48 hours

---

### STEP 2 — Add "Convert" API Endpoint
**File**: `server/src/controllers/upsell.controller.ts`
**Route**: `POST /api/v1/upsells/:eventId/convert`
**What**: 
- Check if event exists and not expired
- Set `converted = true` on the upsell_event
- Return success/failure
**Why**: Widget "Add to Order" button needs to call this

---

### STEP 3 — Fix Widget Click Tracking
**File**: `server/public/widget.js`
**What**:
- Store `eventId` from the API response
- On "Claim Discount" button click → call `POST /api/v1/upsells/:eventId/convert`
- Show success state after click
- Redirect to Shopify product page (add to cart)
**Why**: Currently the button does nothing — this is the most critical missing piece

---

### STEP 4 — Add Email Service (Nodemailer)
**Files**: 
- `server/src/services/email.service.ts` (NEW)
- `server/src/controllers/webhook.controller.ts` (UPDATE)
**What**:
- Install nodemailer + @types/nodemailer
- Create EmailService with `sendUpsellEmail(to, productName, discountPercent, upsellLink)`
- After creating upsell_event in webhook → send email
- Email contains: product image, discount, CTA button linking to widget page
**Why**: Email is the primary channel for post-purchase upsell (48hr window)

---

### STEP 5 — Add "Track Shown" API Endpoint  
**File**: `server/src/controllers/upsell.controller.ts`
**Route**: `POST /api/v1/upsells/:eventId/shown`
**What**: Mark when widget was actually displayed (update `shown_at`)
**Why**: Distinguish between "upsell created" vs "upsell actually seen by user"

---

### STEP 6 — Wire Campaigns Page to Real Data
**File**: `client/src/pages/Campaigns.tsx`
**What**: Replace mock data with real API call to `GET /api/v1/upsells`
**Data to show**: customer email, recommended product, status (pending/converted/expired), discount %, revenue earned, time remaining in 48hr window
**Why**: Dashboard currently shows fake data

---

### STEP 7 — Wire Analytics Page to Real Data
**File**: `client/src/pages/Analytics.tsx`
**What**: Replace mock charts with real data from `GET /api/v1/analytics/dashboard`
**Metrics**: Conversion rate, total upsell revenue, open rate, click rate
**Why**: Analytics page shows hardcoded numbers

---

### STEP 8 — Add Expiry Status to Upsell Events
**File**: `server/src/controllers/upsell.controller.ts`
**What**: In `getAllUpsells`, compute status dynamically:
- `converted` → "Converted" 
- `expires_at < now` → "Expired"
- else → "Active" (with time remaining)
**Why**: Frontend needs to show correct status badges

---

## 📋 Implementation Order (Priority)

```
Step 1 → Step 2 → Step 3 → Step 4 → Step 5 → Step 6 → Step 7 → Step 8
  ↑           ↑         ↑         ↑
48hr fix   Convert   Widget    Email
           endpoint  tracking  sending
```

**Start with Steps 1-3 first** — these make the core upsell loop work end-to-end.
**Then Step 4** — email is the 48hr delivery mechanism.
**Then Steps 5-8** — dashboard polish and real data.

---

## 🔧 Tech Additions Needed

| Package | Purpose | Install Command |
|---------|---------|----------------|
| `nodemailer` | Email sending | `npm install nodemailer @types/nodemailer` |
| `@sendgrid/mail` (optional) | Production email | `npm install @sendgrid/mail` |

---

## 📧 Email Flow Diagram

```
Shopify Order Created
        ↓
Webhook fires → webhook.controller.ts
        ↓
AI generates recommendation
        ↓
upsell_event created (expires_at = now + 48hrs)
        ↓
Email sent to customer:
  "You just bought X. Add Y for 10% off — offer expires in 48hrs!"
  [CTA Button → links to thank-you page with widget]
        ↓
Customer clicks widget "Claim Discount"
        ↓
POST /api/v1/upsells/:eventId/convert
        ↓
converted = true → Revenue tracked in dashboard
```

---

## 🎯 Success Criteria

After all 8 steps:
- [ ] Widget button click records conversion in DB
- [ ] 48-hour window enforced (expired offers rejected)
- [ ] Email sent within seconds of order
- [ ] Campaigns page shows real upsell events with live status
- [ ] Analytics shows real conversion rates
- [ ] Full loop: Order → AI → Email → Widget → Click → Tracked ✅
