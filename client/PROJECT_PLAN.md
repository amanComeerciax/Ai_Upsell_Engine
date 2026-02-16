# 🚀 Velocity AI Engine: Project Roadmap & Status

This document outlines the architectural vision, current implementation status, and future development phases for the Velocity AI Upsell Engine.

---

## 🌩️ Project Vision
**Velocity** is a high-performance, autonomous upsell engine designed to boost E-commerce revenue (AOV) using local AI inference (Ollama). It bridges the gap between complex ML models and merchant-friendly "Command Center" operations.

---

## ✅ Phase 1: Foundation & Premium UI/UX (COMPLETED)
*Focus: Establishing the brand aesthetic and core navigation.*

- [x] **Technical Migration**: Successfully moved from Next.js to Vite + React for sub-millisecond frontend performance.
- [x] **"High-Velocity" Landing Page**: Built a premium, dark-mode landing page inspired by `neweb.ai`.
- [x] **Command Center UI**: 
    - [x] Glassmorphism Dashboard Layout.
    - [x] Collapsible sidebar with real-time "System Status" indicators.
    - [x] Premium Dashboard with revenue trajectory charts.
- [x] **Core Management Pages**:
    - [x] **Inventory (The Vault)**: Product catalog with performance tracking.
    - [x] **AI Models (The Core)**: Monitoring for local LLMs (Llama3) and Latency.
    - [x] **Campaigns (The Pipeline)**: Real-time tracking of AI-driven offers.
    - [x] **Analytics (The Results)**: Deep-dive conversion and yield telemetry.

---

## 🏗️ Phase 2: Logic & Intelligent Core (IN PROGRESS)
*Focus: Bringing the AI to life and building operational tools.*

- [ ] **AI Service Layer**:
    - [ ] Integrate `Ollama` API for local inference calls.
    - [ ] Implement `nomic-embed-text` for semantic product searching.
- [ ] **The Bundle Builder**:
    - [ ] Add a "Create Bundle" interface in the Inventory section.
    - [ ] Logic for "Bought Together" pattern recognition.
- [ ] **Inference Logic**:
    - [ ] Script to simulate order triggers and AI response generation.
    - [ ] Dynamic campaign generation based on mock order data.
- [ ] **Search Refinement**: Finalize the multi-search and semantic search capabilities.

---

## 🔌 Phase 3: External Integration (FUTURE)
*Focus: Connecting the engine to the real world (Shopify/WooCommerce).*

- [ ] **Velocity SDK**:
    - [ ] Build a lightweight JS snippet for frontend injection.
    - [ ] Create a "Preview Mode" to see bundles on a mock shopify store.
- [ ] **Shopify App Bridge**:
    - [ ] Setup authentication for Shopify store owners.
    - [ ] Webhook handlers for `orders/create` to trigger the AI engine.
- [ ] **Post-Purchase Flow**:
    - [ ] Design the "Thank You Page" upsell widget.
    - [ ] "One-Click Add-to-Order" logic.

---

## 📈 Phase 4: Enterprise Scaling & Optimization (FUTURE)
*Focus: Performance at scale and advanced features.*

- [ ] **Advanced A/B Testing**: System for testing different AI prompts for better conversion.
- [ ] **Multi-Tenant Architecture**: Support for managing multiple stores from one dashboard.
- [ ] **Mobile Command App**: A simplified mobile dashboard for monitoring revenue on the go.
- [ ] **Predictive Stock Alerts**: AI alerting merchants when high-converting upsell products are low on stock.

---

## 🛠 Tech Stack Summary
- **Frontend**: React 19, Vite, Tailwind CSS.
- **UI Architecture**: Radix UI, Lucide Icons, Recharts.
- **AI Backend (Local)**: Ollama (Llama3 8B, Phi-3).
- **Inference Strategy**: Semantic matching + Decision Trees.

---
*Last Updated: February 13, 2026*
