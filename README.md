# ⚡ NEX Store — Real-Time Enterprise Hardware, Multi-Source App Store, Edge Subsystems & NEX-SH v3.0 CLI

**NEX Store** is a full-stack, real-time enterprise hardware e-commerce platform, multi-source developer app marketplace (**Netlify**, **Vercel**, **GitHub Pages**, and custom HTTPS), 5-slot Build-to-Order (BTO) rig configurator, and cloud subsystem command center powered by **Express**, **WebSockets (`/ws`)**, **SQLite 3 (17 tables in WAL mode)**, and the **NEX-SH v3.0 Power Shell & `.nexsh` Scripting Studio**.

---

## 🌟 Key Capabilities

### 1. 🖥️ NEX-SH v3.0 Power Shell, Unix Pipe Engine & `.nexsh` Scripting Studio (`⌘J` / `>_ CLI`)
- **Interactive Shell Tab**:
  - Unix-style pipe operators: `| grep <pattern>`, `| head <n>`, `| tail <n>`, `| count`, `| sort`, `| reverse`, and `| upper`.
  - Sequential command chaining via `&&` (e.g., `uname -a && uptime && nex status`).
  - System, kernel, process, and socket diagnostics: `top`, `netstat`, `uname -a`, `uptime`, `env`, `whoami`, and `nex benchmark`.
  - Live read-only SQLite 3 query execution: `nex sql SELECT sku, name, price, stock FROM products ORDER BY price DESC LIMIT 5`.
  - One-click `.log` session transcript export.
- **`.nexsh` Script Studio & Automation Playbook Runner Tab**:
  - Persistent **17th SQLite table (`terminal_scripts`)** storing multi-line `.nexsh` automation playbooks with `#` comments, pipe chains, and run counters.
  - Preloaded with 4 enterprise playbooks:
    1. `nightly-secops-audit.nexsh` (*SecOps*)
    2. `warehouse-auto-replenish.nexsh` (*Supply Chain*)
    3. `netlify-ecosystem-sync.nexsh` (*App Ecosystem*)
    4. `edge-cluster-healthcheck.nexsh` (*Edge Ops*)
  - Create, edit, save to SQLite (`POST /api/terminal/scripts`), and execute playbooks via UI or `nex run <playbook-name>`.

### 2. 🛠️ Custom 5-Slot Hardware Rig Configurator (BTO Studio)
- Interactive Build-to-Order modal (`Rig BTO` button in header) across 5 hardware slots:
  1. **Primary Compute Unit**
  2. **Neural / AI Accelerator**
  3. **Display & Optics Array**
  4. **Quantum / Security Module**
  5. **High-Throughput Peripherals**
- Live **1250W PSU Power Budget Meter**, PCIe 5.0 / Thunderbolt 5 compatibility verification, **5% Full-Rig Bundle Discount** when 3+ slots are populated, and 1-click **Deploy Rig to Cart**.

### 3. 🚀 Multi-Source App Store & Independent Developer Spotlight
- Import, verify, and sandbox web applications deployed on **Netlify** (`*.netlify.app`), **Vercel** (`*.vercel.app`), **GitHub Pages** (`*.github.io`), or custom HTTPS endpoints.
- Generates deterministic **SHA-256 package hashes** and **TLS 1.3 security badges**, plus an interactive **Live App Sandbox Modal**.

### 4. 🌐 Subsystems Command Center (5 Operational Sub-Tabs)
- **Global Edge Server Cluster**: Monitor and control 6 regional nodes (`us-east`, `eu-central`, `ap-northeast`, `us-west`, `sa-east`, `af-south`) with CPU/RAM telemetry, latency calibration, and new node provisioning.
- **Zero-Trust Security & WAF Shield**: Real-time SQLi/XSS/DDoS threat mitigation logs, deep security scans, and Ed25519 key rotation.
- **External Platform Integrations**: Live webhook connectors for Netlify, GitHub Actions, Stripe, Cloudflare WAF, Slack SecOps, and Vercel.
- **WebAudio Synthesizer & Push Notification Center**: Pure WebAudio API synthesized sound effects (`success`, `alert`, `security`, `push`, `click`, `ping`) + OS Desktop Notification API.
- **Cross-Browser Compatibility & Standards Matrix**: Live User-Agent engine detection and feature verification across **Chrome**, **Safari**, **Firefox**, **Edge**, and **Brave**.

### 5. 🎨 6-Theme CSS Custom Property Engine & Cross-Browser Hardening
- Instant switching between **6 full-coverage themes** (`Obsidian`, `Light`, `Cyberpunk`, `Midnight`, `Forest`, and `Ocean`) powered by CSS custom properties (`--nex-bg-primary`, `--nex-accent`, etc.).
- Hardened with `-webkit-backdrop-filter`, `100dvh` dynamic viewport sizing, `scrollbar-width: thin`, and PWA Service Worker (`public/sw.js` `nex-store-v6`).

---

## 🗄️ 17-Table SQLite 3 Schema (`server/db.js`)

| # | Table Name | Primary Key | Domain | Description |
|---|------------|-------------|--------|-------------|
| 1 | `categories` | `id` | Catalog | Hardware categories & metadata |
| 2 | `products` | `id` | Catalog | 12 flagship hardware SKUs with 4-angle CAD SVG schematics |
| 3 | `apps` | `id` | App Store | Verified multi-source apps (Netlify, Vercel, GitHub, NEX) |
| 4 | `coupons` | `code` | Commerce | Promotional discount codes (`NEX20`, `BUILD10`, `QUANTUM15`) |
| 5 | `orders` | `id` | Commerce | Customer orders, shipping status, and totals |
| 6 | `order_items` | `id` | Commerce | Line-item SKU breakdown per order |
| 7 | `reviews` | `id` | Catalog | Verified buyer ratings and technical reviews |
| 8 | `inventory_logs` | `id` | Warehouse | Stock restock and order deduction audit log |
| 9 | `activity_events` | `id` | Telemetry | Real-time broadcast feed events |
| 10 | `chat_messages` | `id` | Concierge | Live engineering support chat history |
| 11 | `wishlist` | `product_id` | Commerce | Saved wishlist SKUs |
| 12 | `app_installs` | `app_id` | App Store | Installed sandboxed applications |
| 13 | `server_nodes` | `id` | Edge Ops | Regional edge server telemetry & status |
| 14 | `integrations` | `id` | Webhooks | External platform connectors & sync counters |
| 15 | `security_events` | `id` | SecOps | Zero-Trust WAF threat & audit events |
| 16 | `push_notifications` | `id` | Alerting | Real-time toast & notification center messages |
| 17 | `terminal_logs` / `terminal_scripts` | `id` | CLI & Automation | Command audit trail & `.nexsh` multi-line playbooks |

---

## 💻 NEX-SH v3.0 Command & Pipe Quick Reference

```bash
# 1. System & 17-Table Telemetry Overview
nex status
nex benchmark

# 2. Unix Pipe Filtering (grep, head, tail, count, sort, reverse, upper)
nex servers | grep ONLINE
nex security | head 5
nex scripts | sort | upper
nex servers | count

# 3. Command Chaining (&&) & Kernel/Network Diagnostics
uname -a && uptime && whoami
top
netstat

# 4. Run or List Persistent SQLite .nexsh Automation Playbooks
nex scripts
nex run nightly-secops-audit.nexsh
nex run warehouse-auto-replenish.nexsh

# 5. Live Read-Only SQLite 3 Queries
nex sql SELECT sku, name, price, stock FROM products ORDER BY price DESC LIMIT 5
nex sql SELECT id, name, category, run_count FROM terminal_scripts
```

---

## 🚀 Quick Start & Verification

```bash
# Install dependencies
npm install

# Build production frontend bundle into dist/
npm run build

# Run the automated 17-table SQLite, NEX-SH v3.0, CAD SVG & Cross-Browser verification suite
npm test

# Start the unified Express + WebSocket + SQLite server on 0.0.0.0:3000
npm start
```

For deep architectural diagrams, REST/WebSocket payload schemas, and `.nexsh` playbook authoring guidelines, see **[`docs/ARCHITECTURE_AND_GUIDE.md`](./docs/ARCHITECTURE_AND_GUIDE.md)** or open the **Docs & CLI Guide** tab directly inside the application.
