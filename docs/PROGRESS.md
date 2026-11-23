# NEX Store — Engineering Progress Log

> Quantum Commerce Fabric · `devTechs001/nex-store` · last updated 2026-11-23
> All figures below are real and reproducible (`npm test`, live preview, in-app runner).

## ✅ Completed phases

### Phase 1–3 — Core commerce, sandbox & platform integrity (merged, PR #22)
- Full-stack store: catalog, cart, coupons, integer-cent money math (`server/money.js`), orders, tracking, live WebSocket updates.
- Auth & RBAC: Root Admin (`.env` only) / Developer / System User / Guest — private portals (admin, overview, database, subsystems, developer-portal, user-portal) gated behind real sessions.
- Real app lifecycle: publish → inspect → sandbox preview (`<iframe sandbox>` opaque-origin IPC) → install/uninstall, 5-stage anti-malware, XSS shield, IP firewall, git-backed upload history.
- Security fixes: `SANITIZE_EXEMPT_KEYS` (byte-exact source/HTML payloads), genuine `crypto.randomBytes` OTP hashes, Mongo reads query real collections.

### Phase 4–6 — Real packages, polyglot conversion, git import (merged, PR #23)
- `app_packages` + `app_builds`: real installable bundles (zip bytes, sha256, manifests), real HTTP link health, Neural Picks recommendations derived from real rows.
- `server/polyglotBuilder.js`: real conversions — TS→JS (esbuild), Python (`py_compile`), C++ (`g++`), with honest `TOOLCHAIN_UNAVAILABLE` when SDKs are absent. `/build` · `/run` · `/bundle.zip` endpoints with true exit codes.
- `server/gitImport.js`: real shallow clone (SSRF-guarded), commit/branch/tree metadata, language detection.

### Phase 7 — Role-based navigation (PR #24)
- `src/utils/navigation.js` single source of truth (`TAB_ROLE_ACCESS`) shared by router and every nav surface; menus show only the links a session can enter.

### Phase 8 — Quantum identity, system-wide check, sharing, collaboration (PR #24)
- Quantum logo, animated orbital favicon, splash screen, particle field, procedural sound engine (quantum/whoosh/toggle/error).
- **System Check** dashboard (`syscheck` tab): real memory/CPU/request telemetry (`server/metrics.js`), live graphs, uploaded-system statuses, config flags (never secrets), computed developer recommendations + health score.
- **Community** tab: developer sharing (`app_shares`) + reviews (1–5★) + threaded comments (`app_reviews`, `app_comments`).

### Phase 9 — Real payments (PR #25)
- `server/payments.js`: **Stripe** PaymentIntents + real webhook HMAC verification, **PayPal** Orders v2, **M-Pesa Daraja** STK push, and an honestly-labeled **Test Ledger** (sandbox).
- Honesty contract: `SETTLED` only when a real gateway confirms; `TEST_SETTLED` for sandbox; `NOT_CONFIGURED`/`FAILED`/`PENDING` otherwise — zero fabricated rows. Seeded fixtures relabeled `mode='demo'`.

### Phase 10 — Boot matrix & dashboard wiring (this PR)
- Splash **Quantum Boot Matrix**: live `/api/boot-status` telemetry (server, database, payments config, systems, security flags) revealed as it loads — pending rows honest, nothing invented.
- **Phantom-dashboard fix**: gated tab blocks used `A && !canAccessTab ? gate : <View/>` — JS precedence parsed it as `(A && B) ? … : <View/>`, stacking the Admin/Database/Subsystems/SysCheck dashboards onto *every other tab* (including public pages). All four blocks now gate correctly; public pages render ~100KB less markup.
- Deep links: `?tab=…` / `?share=…` now land on the real tab (sanitized against the valid tab set).
- Regression guards: SSR **phantom-dashboard matrix** (every tab renders exactly its own view), nav-wiring integrity scan, boot-status no-secret tests.

## 🧪 Verification matrix
| Suite | Coverage | Status |
|---|---|---|
| `npm test` | 20 suites / 80 tests (HTTP e2e + unit) | ✅ green |
| In-app `/api/tests/run` | 9 suites / 30 cases (admin "Run All Suites") | ✅ ALL_PASSED |
| SSR smoke (`smoke/entry-server.mjs`) | mount renders + 5-tab phantom matrix + 6 views | ✅ green |

## 🔐 Environment & credentials
- Root Admin: bootstrapped at first start into `.env` (`NEX_ADMIN_USERNAME/PASSWORD/MASTER_TOKEN`) — generated strong secrets, **never exposed via API**. Rotate by editing `.env`.
- Payment gateways: set `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET`, `PAYPAL_CLIENT_ID/SECRET`, `MPESA_CONSUMER_KEY/SECRET/SHORTCODE/PASSKEY` to switch from Test Ledger to live settlement.
- ⚠️ Git history contains older demo credentials (Mongo password, `rnd_live_…`, `nfp_live_…`) — rotate those at the provider level.

## 📦 Key modules
`server/payments.js` · `server/metrics.js` · `server/polyglotBuilder.js` · `server/gitImport.js` · `server/money.js` · `src/utils/navigation.js` · `src/utils/soundEngine.js` · `smoke/entry-server.mjs` (SSR smoke harness)

## 🧭 See also
`docs/NEXT_STEPS.md` — roadmap and suggestions for the next iteration.
