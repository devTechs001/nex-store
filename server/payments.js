// Real payment provider integrations: Stripe, PayPal, Safaricom M-Pesa (Daraja)
// and an honestly-labeled local Test Ledger.
//
// Honesty contract (no fabricated settlements):
//  - A transaction is 'SETTLED' only when a real gateway confirms it.
//  - A transaction is 'TEST_SETTLED' only in Test Ledger mode, and the
//    provider label says "Test Ledger (sandbox)" — never "Live".
//  - Missing credentials yield 'NOT_CONFIGURED'; network/API failures yield
//    'GATEWAY_UNREACHABLE' / 'FAILED' with the true error preserved.

import crypto from 'node:crypto';
import { loadDotEnvFile, getEnvAdminConfig } from './envAndSecurity.js';

export function getPaymentsConfig() {
  loadDotEnvFile();
  const stripe = Boolean(process.env.STRIPE_SECRET_KEY);
  const paypal = Boolean(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET);
  const mpesa = Boolean(
    process.env.MPESA_CONSUMER_KEY &&
      process.env.MPESA_CONSUMER_SECRET &&
      process.env.MPESA_SHORTCODE &&
      process.env.MPESA_PASSKEY
  );
  return {
    currency: 'USD',
    providers: {
      stripe: {
        id: 'stripe',
        label: 'Card — Stripe',
        configured: stripe,
        mode: 'live',
        note: stripe
          ? 'Stripe is configured — payments are processed live via PaymentIntents.'
          : 'Set STRIPE_SECRET_KEY to enable live card payments.'
      },
      paypal: {
        id: 'paypal',
        label: 'PayPal',
        configured: paypal,
        mode: 'live',
        note: paypal
          ? 'PayPal is configured — checkout redirects to PayPal for approval.'
          : 'Set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET to enable PayPal.'
      },
      mpesa: {
        id: 'mpesa',
        label: 'M-Pesa (Safaricom Daraja)',
        configured: mpesa,
        mode: 'live',
        note: mpesa
          ? 'M-Pesa is configured — payments run via real Daraja STK push.'
          : 'Set MPESA_CONSUMER_KEY/SECRET, MPESA_SHORTCODE and MPESA_PASSKEY to enable M-Pesa.'
      },
      test: {
        id: 'test',
        label: 'NEX Test Ledger (sandbox)',
        configured: true,
        mode: 'test',
        note: 'Sandbox ledger — orders complete end-to-end with TEST_SETTLED status. No real money moves.'
      }
    },
    anyLiveConfigured: stripe || paypal || mpesa
  };
}

function providerNotConfigured(provider) {
  return {
    ok: false,
    mode: 'none',
    provider,
    status: 'NOT_CONFIGURED',
    providerRef: '',
    authCode: '',
    error: `Payment provider "${provider}" is not configured on this server. Set its credentials in the environment (.env) or choose the Test Ledger.`
  };
}

// ---------------------------------------------------------------------------
// Test Ledger — a real local ledger entry, honestly labeled.
// ---------------------------------------------------------------------------
function settleOnTestLedger({ orderId, orderNumber, amountDollars, customer }) {
  loadDotEnvFile();
  const envAdmin = getEnvAdminConfig();
  const seed = envAdmin.masterToken || process.env.NEX_SESSION_SECRET || 'nex-test-ledger';
  const providerRef = `tl_${crypto.createHash('sha256').update(`${orderId}:${orderNumber}:${amountDollars}`).digest('hex').slice(0, 16)}`;
  const authCode = `TL-${crypto.createHmac('sha256', seed).update(`${providerRef}:${amountDollars}`).digest('hex').slice(0, 10).toUpperCase()}`;
  return {
    ok: true,
    mode: 'test',
    provider: 'NEX Test Ledger (sandbox)',
    status: 'TEST_SETTLED',
    providerRef,
    authCode,
    customer,
    raw: { ledger: 'test', note: 'No real money moved — sandbox settlement.' }
  };
}

// ---------------------------------------------------------------------------
// Stripe — real PaymentIntents REST + real webhook signature verification.
// ---------------------------------------------------------------------------
async function settleOnStripe({ orderId, orderNumber, amountDollars, customer, description }) {
  loadDotEnvFile();
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) return providerNotConfigured('stripe');

  const params = new URLSearchParams({
    amount: String(Math.round(amountDollars * 100)),
    currency: (process.env.NEX_CURRENCY || 'usd').toLowerCase(),
    description: description || `NEX Store order ${orderNumber}`,
    'receipt_email': customer.email || '',
    'metadata[order_id]': orderId,
    'metadata[order_number]': orderNumber,
    confirm: 'false'
  });
  try {
    const res = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secret}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Idempotency-Key': `nex-order-${orderId}`
      },
      body: params.toString()
    });
    const json = await res.json();
    if (!res.ok) {
      return {
        ok: false,
        mode: 'live',
        provider: 'Stripe',
        status: 'FAILED',
        providerRef: json?.error?.payment_intent?.id || '',
        authCode: '',
        error: `Stripe: ${json?.error?.message || `HTTP ${res.status}`}`
      };
    }
    const pi = json;
    const settled = pi.status === 'succeeded';
    return {
      ok: settled || pi.status === 'requires_confirmation' || pi.status === 'processing',
      mode: 'live',
      provider: 'Stripe',
      status: settled ? 'SETTLED' : pi.status === 'processing' ? 'PENDING' : 'AWAITING_CONFIRMATION',
      providerRef: pi.id,
      authCode: pi.id,
      clientSecret: pi.client_secret || '',
      raw: { id: pi.id, status: pi.status },
      error: settled ? '' : `Stripe payment intent status: ${pi.status}`
    };
  } catch (err) {
    return {
      ok: false,
      mode: 'live',
      provider: 'Stripe',
      status: 'GATEWAY_UNREACHABLE',
      providerRef: '',
      authCode: '',
      error: `Stripe unreachable: ${err.message}`
    };
  }
}

/**
 * Verify a Stripe-Signature webhook header (real scheme:
 * v1 = HMAC-SHA256(secret, `${t}.${payload}`), replay-window enforced).
 */
export function verifyStripeSignature(payload, sigHeader, secret, toleranceSec = 300, nowMs = Date.now()) {
  if (!payload || !sigHeader || !secret) return false;
  const parts = Object.fromEntries(
    String(sigHeader)
      .split(',')
      .map((kv) => kv.split('=').map((s) => s.trim()))
      .filter((kv) => kv.length === 2)
  );
  const t = Number(parts.t);
  const v1 = parts.v1;
  if (!Number.isFinite(t) || !v1) return false;
  if (Math.abs(Math.floor(nowMs / 1000) - t) > toleranceSec) return false;
  const expected = crypto.createHmac('sha256', secret).update(`${t}.${payload}`).digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(expected, 'utf8'), Buffer.from(v1, 'utf8'));
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// PayPal — real Orders v2 API (OAuth client-credentials + create order).
// ---------------------------------------------------------------------------
async function createPaypalOrder({ orderId, orderNumber, amountDollars }) {
  loadDotEnvFile();
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !clientSecret) return providerNotConfigured('paypal');
  const base = process.env.PAYPAL_MODE === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';
  try {
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const tokenRes = await fetch(`${base}/v1/oauth2/token`, {
      method: 'POST',
      headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'grant_type=client_credentials'
    });
    const tokenJson = await tokenRes.json();
    if (!tokenRes.ok) {
      return { ok: false, mode: 'live', provider: 'PayPal', status: 'FAILED', providerRef: '', authCode: '', error: `PayPal auth: ${tokenJson?.error_description || tokenJson?.error || `HTTP ${tokenRes.status}`}` };
    }
    const orderRes = await fetch(`${base}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenJson.access_token}`,
        'Content-Type': 'application/json',
        'PayPal-Request-Id': `nex-order-${orderId}`
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            reference_id: orderNumber,
            amount: { currency_code: 'USD', value: amountDollars.toFixed(2) }
          }
        ]
      })
    });
    const orderJson = await orderRes.json();
    if (!orderRes.ok) {
      return { ok: false, mode: 'live', provider: 'PayPal', status: 'FAILED', providerRef: '', authCode: '', error: `PayPal: ${orderJson?.details?.[0]?.description || orderJson?.name || `HTTP ${orderRes.status}`}` };
    }
    const approveLink = (orderJson.links || []).find((l) => l.rel === 'approve')?.href || '';
    return {
      ok: true,
      mode: 'live',
      provider: 'PayPal',
      status: 'AWAITING_APPROVAL',
      providerRef: orderJson.id,
      authCode: orderJson.id,
      approveUrl: approveLink,
      raw: { id: orderJson.id, status: orderJson.status },
      error: ''
    };
  } catch (err) {
    return { ok: false, mode: 'live', provider: 'PayPal', status: 'GATEWAY_UNREACHABLE', providerRef: '', authCode: '', error: `PayPal unreachable: ${err.message}` };
  }
}

// ---------------------------------------------------------------------------
// M-Pesa — real Safaricom Daraja STK push (Lipa Na M-Pesa Online).
// ---------------------------------------------------------------------------
async function initiateMpesaStk({ amountDollars, customer, phone }) {
  loadDotEnvFile();
  const key = process.env.MPESA_CONSUMER_KEY;
  const secret = process.env.MPESA_CONSUMER_SECRET;
  const shortcode = process.env.MPESA_SHORTCODE;
  const passkey = process.env.MPESA_PASSKEY;
  if (!key || !secret || !shortcode || !passkey) return providerNotConfigured('mpesa');
  const base = process.env.MPESA_MODE === 'live' ? 'https://api.safaricom.co.ke' : 'https://sandbox.safaricom.co.ke';
  const cleanPhone = String(phone || customer.phone || '').replace(/[^\d]/g, '');
  const msisdn = cleanPhone.startsWith('254') ? cleanPhone : cleanPhone.startsWith('0') ? `254${cleanPhone.slice(1)}` : `254${cleanPhone}`;
  if (msisdn.length < 12) {
    return { ok: false, mode: 'live', provider: 'M-Pesa', status: 'FAILED', providerRef: '', authCode: '', error: 'A valid M-Pesa phone number is required (format 07XXXXXXXX or 2547XXXXXXXX).' };
  }
  try {
    const auth = Buffer.from(`${key}:${secret}`).toString('base64');
    const tokenRes = await fetch(`${base}/oauth/v1/generate?grant_type=client_credentials`, {
      headers: { Authorization: `Basic ${auth}` }
    });
    const tokenJson = await tokenRes.json();
    if (!tokenRes.ok || !tokenJson.access_token) {
      return { ok: false, mode: 'live', provider: 'M-Pesa', status: 'FAILED', providerRef: '', authCode: '', error: `Daraja auth: ${tokenJson?.errorMessage || `HTTP ${tokenRes.status}`}` };
    }
    const timestamp = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);
    const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');
    const stkRes = await fetch(`${base}/mpesa/stkpush/v1/processrequest`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenJson.access_token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: String(Math.max(1, Math.round(amountDollars * 100))), // M-Pesa whole KES units
        PartyA: msisdn,
        PartyB: shortcode,
        PhoneNumber: msisdn,
        CallBackURL: process.env.MPESA_CALLBACK_URL || `${process.env.PUBLIC_BASE_URL || ''}/api/payments/mpesa/callback`,
        AccountReference: `NEX${Date.now().toString(36).toUpperCase()}`.slice(0, 12),
        TransactionDesc: 'NEX Store order'
      })
    });
    const stkJson = await stkRes.json();
    if (!stkRes.ok || stkJson.ResponseCode !== '0') {
      return { ok: false, mode: 'live', provider: 'M-Pesa', status: 'FAILED', providerRef: stkJson.CheckoutRequestID || '', authCode: '', error: `Daraja STK: ${stkJson?.errorMessage || stkJson?.ResponseDescription || `HTTP ${stkRes.status}`}` };
    }
    return {
      ok: true,
      mode: 'live',
      provider: 'Safaricom Daraja (M-Pesa STK)',
      status: 'PENDING_CONFIRMATION',
      providerRef: stkJson.CheckoutRequestID || '',
      authCode: stkJson.MerchantRequestID || '',
      raw: stkJson,
      error: ''
    };
  } catch (err) {
    return { ok: false, mode: 'live', provider: 'M-Pesa', status: 'GATEWAY_UNREACHABLE', providerRef: '', authCode: '', error: `Daraja unreachable: ${err.message}` };
  }
}

// ---------------------------------------------------------------------------
// Public dispatcher — routes to a real provider or the Test Ledger.
// ---------------------------------------------------------------------------
export async function processPayment({ provider, orderId, orderNumber, amountDollars, customer = {}, phone = '', description = '' }) {
  const normalized = String(provider || 'test').toLowerCase();
  switch (normalized) {
    case 'stripe':
      return settleOnStripe({ orderId, orderNumber, amountDollars, customer, description });
    case 'paypal':
      return createPaypalOrder({ orderId, orderNumber, amountDollars });
    case 'mpesa':
      return initiateMpesaStk({ amountDollars, customer, phone });
    case 'test':
      return settleOnTestLedger({ orderId, orderNumber, amountDollars, customer });
    default:
      return {
        ok: false,
        mode: 'none',
        provider: normalized,
        status: 'UNKNOWN_PROVIDER',
        providerRef: '',
        authCode: '',
        error: `Unknown payment provider "${provider}". Choose stripe, paypal, mpesa or test.`
      };
  }
}
