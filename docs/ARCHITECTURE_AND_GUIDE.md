# NEX Store — Architecture, SQLite Schema & NEX-SH v3.0 Scripting Manual

## 1. High-Level Architecture

NEX Store is architected as a **Dual-Mode Real-Time Full-Stack Application**:

1. **Primary Mode (Node.js + Express + WebSocket + SQLite 3 WAL)**:
   - Served from `server/index.js` on `0.0.0.0:3000`.
   - Uses `better-sqlite3` (`server/db.js`) with `PRAGMA journal_mode = WAL` and `PRAGMA foreign_keys = ON`.
   - Broadcasts state mutations immediately over a shared WebSocket bus (`/ws`) so all connected browser tabs stay synchronized without polling.
2. **Static-Host Resilient Fallback Mode (Netlify / Vercel / GitHub Pages)**:
   - If the browser is hosted on a static CDN where `/api/*` is unreachable, `src/utils/storeEngine.js` hydrates all 17 tables, CAD SVG product schematics, `.nexsh` scripts, and pipe execution locally in the browser.

---

## 2. NEX-SH v3.0 Power Shell & Pipe Engine (`POST /api/terminal/exec`)

### 2.1 Execution Pipeline
Every input submitted to `POST /api/terminal/exec` (or the client fallback engine) passes through a 3-stage parser:
1. **Multi-Line Playbook Splitter**: Splits input by newline (`\n`), strips `#` comments, and expands `&&` chained commands into sequential execution steps.
2. **Command Dispatcher (`executeSingleCommand`)**: Executes the base command (`nex status`, `nex benchmark`, `nex servers`, `nex security`, `nex integrations`, `nex stock`, `nex restock`, `nex deploy <url>`, `nex scripts`, `nex run <script>`, `nex sql <SELECT ...>`, `top`, `netstat`, `uname -a`, `uptime`, `env`, `whoami`, `echo`).
3. **Unix Pipe Filter Stage (`applyTerminalPipes`)**: Pipes the command output sequentially through any chained `|` operators:
   - `| grep <pattern>` (case-insensitive substring match)
   - `| head <n>` (first `n` lines, default `5`)
   - `| tail <n>` (last `n` lines, default `5`)
   - `| count` / `| wc` (line, non-empty line, and character counts)
   - `| sort` (lexicographical line sort)
   - `| reverse` (reverse line order)
   - `| upper` / `| lower` (case transformation)

### 2.2 Authoring `.nexsh` Playbooks (`POST /api/terminal/scripts`)
Playbooks are stored in the `terminal_scripts` SQLite table and can be created or updated from the **.nexsh Script Studio** tab inside the Terminal modal (`⌘J`).

Example `.nexsh` playbook:
```bash
# Nightly SecOps & Edge Audit Playbook
echo "=== [1/4] KERNEL & UPTIME CHECK ==="
uname -a && uptime
echo "=== [2/4] ONLINE EDGE NODES ==="
nex servers | grep ONLINE
echo "=== [3/4] ZERO-TRUST WAF TELEMETRY ==="
nex security | head 5
echo "=== [4/4] SQLITE IOPS BENCHMARK ==="
nex benchmark
```

---

## 3. REST API Specification

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/api/bootstrap` | Full initial snapshot of all 17 SQLite tables, analytics, and presence |
| `POST` | `/api/terminal/exec` | Execute a command, pipe pipeline, `&&` chain, or multi-line `.nexsh` script |
| `POST` | `/api/terminal/scripts` | Save or update a `.nexsh` playbook in `terminal_scripts` |
| `POST` | `/api/apps/deploy` | Import & verify a live app from Netlify, Vercel, GitHub Pages, or HTTPS |
| `POST` | `/api/apps/:id/download` | Increment install count & record workstation installation |
| `POST` | `/api/servers/:id/action` | Reboot, scale, or toggle maintenance on an edge server node |
| `POST` | `/api/servers/pulse` | Calibrate latency & RPS across all regional edge server nodes |
| `POST` | `/api/security/scan` | Run deep WAF & SHA-256 package security audit |
| `POST` | `/api/security/simulate-threat` | Simulate & block a live SQLi/XSS/DDoS attack vector |
| `POST` | `/api/integrations/:id/sync` | Trigger immediate webhook sync with external platform |
| `POST` | `/api/orders` | Create a hardware order, deduct SKU stock, and log inventory change |
| `GET` | `/api/database/:table` | Inspect live schema and up to 100 rows for any of the 17 tables |
