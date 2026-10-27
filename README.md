# NEX STORE // Gen-5 Hardware Commerce & Real-Time Operations Platform

**NEX Store** is a full-stack e-commerce storefront, real-time operations command center, and interactive SQLite database studio built with **React 19**, **Tailwind CSS v4**, **Express 5**, **WebSockets (`ws`)**, and **Node.js Native SQLite (`node:sqlite` in WAL mode)**.

---

## Key Capabilities

### 1. Relational SQLite 3 Database (`data/nexstore.db`)
Automatically provisioned and seeded on startup with **10 relational tables** in Write-Ahead Logging (`WAL`) mode:
- `categories` — Hardware categories (`Spatial Audio`, `Next-Gen Compute`, `Precision Peripherals`, `Biometric & Spatial`, `Optics & Aerial`, `GaN Power & Desk`)
- `products` — Full catalog with SKUs, pricing, live stock counts, low-stock thresholds, multi-angle CAD galleries, technical specs, and colorways
- `orders` & `order_items` — Customer orders, shipping telemetry, promo discounts, and line items
- `reviews` — Verified customer reviews with helpful vote counters and live product rating recalculation
- `coupons` — Promotional discount engine (`WELCOME10`, `NEX20`, `FLASH75`, `STUDIO150`, plus custom codes)
- `inventory_logs` — Immutable audit ledger recording every stock adjustment, order deduction, and warehouse restock
- `activity_events` — Real-time event stream persisted to disk
- `chat_messages` — Customer & AI Concierge live chat history
- `subscribers` — Flash Deal newsletter subscribers

### 2. Real-Time WebSocket Engine (`/ws`)
- **Live Presence & Viewer Telemetry**: Tracks active connected shoppers and how many engineers are inspecting each product in real time.
- **Instant Inventory & Price Sync**: Stock changes, restocks, flash deal toggles, and new product launches in Admin Command immediately broadcast to all open storefront clients.
- **Live Order Fulfillment Pipeline**: Advancing an order through `placed → processing → packed → shipped → delivered` updates the customer's Live Order Tracker without refreshing.
- **Live Store Concierge Chat**: Context-aware AI & Admin support desk backed by SQLite and WebSockets.

### 3. Storefront & UI/UX Highlights
- **Interactive 4-Angle CAD & Studio Viewer**: Switch between `Studio Hero`, `Detail Cutaway`, `CAD Blueprint`, and `Telemetry Spec` renders with dynamic colorway previewing.
- **Multi-Facet Filtering & Command Search (`⌘K`)**: Filter by category, stock availability, flash deals, price ceiling, and sort order.
- **Multi-Currency & Theme Support**: Instant conversion across **USD ($)**, **KES (KSh)**, **EUR (€)**, and **GBP (£)**, plus **Dark / Light Mode**.
- **Side-by-Side Hardware Comparison**: Compare up to 4 products across price, rating, stock, and engineering specs.
- **Interactive SQLite DB Studio**: Browse all 10 tables, inspect column schemas (`PRAGMA table_info`), execute read-only `SELECT` queries, export JSON, or reset & re-seed the database in one click.

---

## Quick Start

```bash
# Build frontend assets and start the unified HTTP + WebSocket + SQLite server on 0.0.0.0:3000
npm run dev

# Run automated SQLite & backend verification suite
npm test
```
