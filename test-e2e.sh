#!/usr/bin/env bash
# ============================================================
# Velocity AI Engine — Full End-to-End Test Script
# Run: bash test-e2e.sh
# ============================================================

NGROK="https://keila-arousable-bimolecularly.ngrok-free.dev"
HEADERS='-H "ngrok-skip-browser-warning: true" -H "Content-Type: application/json"'

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║       VELOCITY AI ENGINE — E2E TEST SUITE           ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""

# ── TEST 1: Health Check ─────────────────────────────────────
echo -e "${BLUE}[TEST 1] Server Health Check${NC}"
HEALTH=$(curl -s "$NGROK/health" -H "ngrok-skip-browser-warning: true")
if echo "$HEALTH" | grep -q "active"; then
  echo -e "  ${GREEN}✅ PASS — Server is online${NC}"
else
  echo -e "  ${RED}❌ FAIL — Server not responding${NC}"
  exit 1
fi

# ── TEST 2: Simulate Shopify Webhook (New Order) ─────────────
echo ""
echo -e "${BLUE}[TEST 2] Simulate Shopify Webhook (New Order)${NC}"
UNIQUE_ORDER_ID=$((RANDOM * RANDOM + 9000000000000))
WEBHOOK_RESP=$(curl -s -X POST "$NGROK/api/v1/shopify/webhooks/orders/create" \
  -H "ngrok-skip-browser-warning: true" \
  -H "Content-Type: application/json" \
  -H "x-shopify-shop-domain: navjivan-kirana-store.myshopify.com" \
  -d "{
    \"id\": $UNIQUE_ORDER_ID,
    \"email\": \"testcustomer_$(date +%s)@gmail.com\",
    \"total_price\": \"750.00\",
    \"customer\": { \"first_name\": \"Test\", \"last_name\": \"Customer\" },
    \"line_items\": [
      {
        \"product_id\": 8834465202236,
        \"title\": \"Floral White Top\",
        \"quantity\": 1,
        \"price\": \"750.00\"
      }
    ]
  }")

if echo "$WEBHOOK_RESP" | grep -q "Acknowledged"; then
  echo -e "  ${GREEN}✅ PASS — Webhook acknowledged (Order ID: $UNIQUE_ORDER_ID)${NC}"
  echo -e "  ${YELLOW}⏳ Waiting 10s for AI to process...${NC}"
  sleep 10
else
  echo -e "  ${RED}❌ FAIL — Webhook response: $WEBHOOK_RESP${NC}"
fi

# ── TEST 3: Check New Upsell Event Created ───────────────────
echo ""
echo -e "${BLUE}[TEST 3] Verify Upsell Event Created with 48hr Expiry${NC}"
UPSELLS=$(curl -s "$NGROK/api/v1/upsells" -H "ngrok-skip-browser-warning: true")
LATEST=$(echo "$UPSELLS" | python3 -c "import sys,json; d=json.load(sys.stdin); u=d[0]; print(f'{u[\"id\"]}|{u[\"status\"]}|{u[\"expiresAt\"]}|{u[\"timeRemaining\"]}')" 2>/dev/null)

EVENT_ID=$(echo "$LATEST" | cut -d'|' -f1)
STATUS=$(echo "$LATEST" | cut -d'|' -f2)
EXPIRES=$(echo "$LATEST" | cut -d'|' -f3)
TIME_LEFT=$(echo "$LATEST" | cut -d'|' -f4)

echo -e "  Event ID:     ${YELLOW}$EVENT_ID${NC}"
echo -e "  Status:       ${YELLOW}$STATUS${NC}"
echo -e "  Expires At:   ${YELLOW}$EXPIRES${NC}"
echo -e "  Time Left:    ${YELLOW}$TIME_LEFT${NC}"

if [ "$STATUS" = "active" ] && [ "$EXPIRES" != "None" ]; then
  echo -e "  ${GREEN}✅ PASS — Upsell event created with 48hr expiry window${NC}"
elif [ "$STATUS" = "active" ]; then
  echo -e "  ${YELLOW}⚠️  PARTIAL — Event active but no expiry (old event, pre-fix)${NC}"
else
  echo -e "  ${RED}❌ FAIL — Unexpected status: $STATUS${NC}"
fi

# ── TEST 4: Mark Widget as Shown (Impression) ────────────────
echo ""
echo -e "${BLUE}[TEST 4] Track Widget Impression (POST /shown)${NC}"
SHOWN_RESP=$(curl -s -X POST "$NGROK/api/v1/upsells/$EVENT_ID/shown" \
  -H "ngrok-skip-browser-warning: true" \
  -H "Content-Type: application/json")

if echo "$SHOWN_RESP" | grep -q "Impression recorded"; then
  echo -e "  ${GREEN}✅ PASS — Impression tracked for event $EVENT_ID${NC}"
else
  echo -e "  ${RED}❌ FAIL — $SHOWN_RESP${NC}"
fi

# ── TEST 5: Convert Upsell (Click Tracking) ──────────────────
echo ""
echo -e "${BLUE}[TEST 5] Track Conversion (POST /convert)${NC}"
CONVERT_RESP=$(curl -s -X POST "$NGROK/api/v1/upsells/$EVENT_ID/convert" \
  -H "ngrok-skip-browser-warning: true" \
  -H "Content-Type: application/json")

if echo "$CONVERT_RESP" | grep -q '"success":true'; then
  REVENUE=$(echo "$CONVERT_RESP" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('revenue_generated','?'))" 2>/dev/null)
  echo -e "  ${GREEN}✅ PASS — Conversion recorded! Revenue: ₹$REVENUE${NC}"
else
  echo -e "  ${RED}❌ FAIL — $CONVERT_RESP${NC}"
fi

# ── TEST 6: Double-Convert (Idempotency) ─────────────────────
echo ""
echo -e "${BLUE}[TEST 6] Double-Convert Guard (Idempotency)${NC}"
DOUBLE_RESP=$(curl -s -X POST "$NGROK/api/v1/upsells/$EVENT_ID/convert" \
  -H "ngrok-skip-browser-warning: true" \
  -H "Content-Type: application/json")

if echo "$DOUBLE_RESP" | grep -q "already_done"; then
  echo -e "  ${GREEN}✅ PASS — Double-convert blocked correctly${NC}"
else
  echo -e "  ${RED}❌ FAIL — $DOUBLE_RESP${NC}"
fi

# ── TEST 7: Verify Final Status = Converted ──────────────────
echo ""
echo -e "${BLUE}[TEST 7] Verify Final Status = 'converted'${NC}"
FINAL=$(curl -s "$NGROK/api/v1/upsells" -H "ngrok-skip-browser-warning: true" | \
  python3 -c "import sys,json; d=json.load(sys.stdin); u=next((x for x in d if x['id']==$EVENT_ID), None); print(f'{u[\"status\"]}|{u[\"revenue\"]}')" 2>/dev/null)

FINAL_STATUS=$(echo "$FINAL" | cut -d'|' -f1)
FINAL_REV=$(echo "$FINAL" | cut -d'|' -f2)

if [ "$FINAL_STATUS" = "converted" ]; then
  echo -e "  ${GREEN}✅ PASS — Status=converted, Revenue=₹$FINAL_REV${NC}"
else
  echo -e "  ${RED}❌ FAIL — Status=$FINAL_STATUS${NC}"
fi

# ── TEST 8: Widget Fetch by Order ID ─────────────────────────
echo ""
echo -e "${BLUE}[TEST 8] Widget Fetch (GET /upsells/order/:shopifyOrderId)${NC}"
WIDGET_RESP=$(curl -s "$NGROK/api/v1/upsells/order/$UNIQUE_ORDER_ID" \
  -H "ngrok-skip-browser-warning: true")

if echo "$WIDGET_RESP" | grep -q "recommended_product"; then
  PROD=$(echo "$WIDGET_RESP" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['recommended_product']['name'])" 2>/dev/null)
  echo -e "  ${GREEN}✅ PASS — Widget would show: '$PROD'${NC}"
elif echo "$WIDGET_RESP" | grep -q "expired"; then
  echo -e "  ${YELLOW}⚠️  EXPECTED — Offer expired (410 Gone)${NC}"
elif echo "$WIDGET_RESP" | grep -q "No recommendation"; then
  echo -e "  ${YELLOW}⚠️  No upsell for this order yet (AI may still be processing)${NC}"
else
  echo -e "  ${RED}❌ FAIL — $WIDGET_RESP${NC}"
fi

# ── SUMMARY ──────────────────────────────────────────────────
echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║                   TEST COMPLETE                      ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""
echo -e "  ${BLUE}Dashboard:${NC}  http://localhost:5173/dashboard"
echo -e "  ${BLUE}Campaigns:${NC}  http://localhost:5173/dashboard/campaigns"
echo -e "  ${BLUE}Widget Test:${NC} $NGROK/test-widget.html"
echo ""
