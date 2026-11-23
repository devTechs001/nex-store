# NEX Store — Next Steps & Suggestions

> Follow-on roadmap after Phase 10. Ordered by expected impact; each item is
> scoped to be shippable as its own PR.

## 🏆 High impact
1. **Stripe live E2E + Payment Element** — with a real `STRIPE_SECRET_KEY`, wire the
   client-side Payment Element (js.stripe.com) to confirm PaymentIntents; add
   `payment_intent.succeeded` webhook tests against a Stripe CLI tunnel.
   *Backend contract is already in place (`clientSecret`, `providerRef`, webhook verify).*
2. **M-Pesa STK completion UX** — poll `/api/payments/mpesa/status/:checkoutId`
   (add a thin query endpoint over Daraja's `stkpushquery`) and drive the checkout
   drawer's pending state until the callback lands.
3. **Refunds & partial captures** — `POST /api/payments/:id/refund` per provider
   (Stripe `refunds`, PayPal `capture refund`, Daraja reversal) with honest statuses.
4. **Role-aware Community moderation** — pin/delete reviews as admin, developer
   response badge, report-to-moderation flow feeding `security_reports`.

## 📈 Platform growth
5. **Real-time request dashboard streaming** — push `metrics.js` samples over the
   existing WebSocket instead of 6s polling in SysCheck.
6. **Per-developer analytics** — downloads/reviews/install trends in the Developer
   Portal, sourced from real rows (the recommendation engine already computes hints).
7. **Share pages with OG previews** — server-rendered `/s/:slug` route with
   `og:` meta tags (the share feed currently deep-links into the SPA).
8. **PWA + offline checkout queue** — the mobile-subscriptions tab advertises PWA;
   queue Test-Ledger orders offline and replay on reconnect (honest `offline-demo` flag exists).

## 🧪 Quality & hardening
9. **E2E browser tests** (Playwright against the live preview) for the checkout,
   login and nav-matrix flows — complements the SSR smoke harness.
10. **Load test the metrics sampler + WS fan-out** (autocannon) and tune the
    memory ring-buffer caps from measured numbers.
11. **Secret rotation runbook** — script that regenerates `.env` admin credentials,
    invalidates sessions (`NEX_SESSION_SECRET` rotation), and prints the checklist.
12. **CI pipeline** — run `npm test` + SSR smoke + `vite build` on every PR
    (the suite is deterministic and runs in ~7s).

## 🎨 Product polish
13. **Theme-aware quantum effects** — light-mode variants for the particle field
    and splash matrix.
14. **Command palette actions** — extend ⌘K with app-level actions (share current
    app, run security scan, open system check) reusing the role-filtered command list.
15. **Localization** — the store defaults to Nairobi/Kenya UX (M-Pesa-first); add
    currency/locale switching on the existing `CURRENCIES` module.

## ⚠️ Known constraints (honest notes)
- Remote network is allowlisted (github/npm/pypi) — live gateways and external link
  checks need real deployment keys/network; failures surface as honest
  `GATEWAY_UNREACHABLE`/`fetchStatus: FAILED` rather than fabricated data.
- Toolchains (Rust/Java/Go/Flutter) report `TOOLCHAIN_UNAVAILABLE` until SDKs are
  installed on the host — by design.
