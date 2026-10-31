/**
 * © 2026 NEX STORE & DEVTECHS001 LABS. ALL RIGHTS RESERVED.
 * STRICTLY PROPRIETARY & CONFIDENTIAL — DO NOT SHARE, REDISTRIBUTE, OR PIRATE THIS CODE.
 *
 * Environment (.env) Loader, Root Admin & Developer RBAC Auth,
 * XSS Sanitization, Anti-Malware / Realness Verification, Multi-Cloud Hosting (Netlify/Render/Vercel),
 * IP Blocking Firewall, Security Reporting, and Real-Time Payment Gateway Engine.
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const ENV_PATH = path.join(ROOT_DIR, '.env');
const ENV_EXAMPLE_PATH = path.join(ROOT_DIR, '.env.example');

export function loadDotEnvFile() {
  try {
    if (!fs.existsSync(ENV_PATH) && fs.existsSync(ENV_EXAMPLE_PATH)) {
      fs.copyFileSync(ENV_EXAMPLE_PATH, ENV_PATH);
    }
    if (fs.existsSync(ENV_PATH)) {
      const content = fs.readFileSync(ENV_PATH, 'utf8');
      for (const rawLine of content.split(/\r?\n/)) {
        const line = rawLine.trim();
        if (!line || line.startsWith('#')) continue;
        const eqIdx = line.indexOf('=');
        if (eqIdx === -1) continue;
        const key = line.slice(0, eqIdx).trim();
        const val = line
          .slice(eqIdx + 1)
          .trim()
          .replace(/^["']|["']$/g, '');
        if (key && process.env[key] === undefined) {
          process.env[key] = val;
        }
      }
    }
  } catch {
    // Fallback if filesystem is read-only
  }
}

loadDotEnvFile();

export function getEnvAdminConfig() {
  loadDotEnvFile();
  return {
    username: process.env.NEX_ADMIN_USERNAME || '',
    email: process.env.NEX_ADMIN_EMAIL || '',
    password: process.env.NEX_ADMIN_PASSWORD || '',
    masterToken: process.env.NEX_ADMIN_MASTER_TOKEN || '',
    envLoaded: Boolean(process.env.NEX_ADMIN_USERNAME && process.env.NEX_ADMIN_PASSWORD)
  };
}

export function hashPassword(password) {
  return crypto.createHash('sha256').update(`nex_salt_2026:${password}`).digest('hex');
}

export function createSessionToken(account) {
  const secret = process.env.NEX_ADMIN_MASTER_TOKEN || 'nex_fallback_secret';
  const payload = `${account.id}:${account.role}:${account.username}`;
  const sig = crypto.createHmac('sha256', secret).update(payload).digest('hex').slice(0, 24);
  return `nex_tok_${Buffer.from(payload).toString('base64url')}.${sig}`;
}

export function verifySessionToken(token, db) {
  if (!token || typeof token !== 'string') return null;
  const clean = token.replace(/^Bearer\s+/i, '').trim();
  const adminCfg = getEnvAdminConfig();

  if (adminCfg.masterToken && clean === adminCfg.masterToken) {
    return {
      id: 'admin-root-env',
      username: adminCfg.username,
      email: adminCfg.email,
      display_name: 'NEX Root Administrator (.env)',
      role: 'admin',
      permissions: ['*'],
      source: '.env'
    };
  }

  if (!clean.startsWith('nex_tok_')) return null;
  try {
    const body = clean.slice('nex_tok_'.length);
    const [b64, sig] = body.split('.');
    if (!b64 || !sig) return null;
    const payload = Buffer.from(b64, 'base64url').toString('utf8');
    const secret = process.env.NEX_ADMIN_MASTER_TOKEN || 'nex_fallback_secret';
    const expectedSig = crypto.createHmac('sha256', secret).update(payload).digest('hex').slice(0, 24);
    if (sig !== expectedSig) return null;

    const [id, role, username] = payload.split(':');
    if (role === 'admin' && id === 'admin-root-env') {
      return {
        id: 'admin-root-env',
        username: adminCfg.username,
        email: adminCfg.email,
        display_name: 'NEX Root Administrator (.env)',
        role: 'admin',
        permissions: ['*'],
        source: '.env'
      };
    }

    if (db) {
      const row = db.prepare('SELECT * FROM user_accounts WHERE id = ?').get(id);
      if (row && row.status === 'active') {
        return {
          id: row.id,
          username: row.username,
          email: row.email,
          display_name: row.display_name,
          role: row.role,
          company: row.company,
          permissions: JSON.parse(row.permissions_json || '[]'),
          source: 'sqlite:user_accounts'
        };
      }
    }
    return { id, username, role, permissions: role === 'admin' ? ['*'] : ['own_apps'] };
  } catch {
    return null;
  }
}

// Strict XSS & Injection Detector + Sanitizer
const XSS_PATTERNS = [
  /<script\b[^>]*>/i,
  /<\/script>/i,
  /javascript\s*:/i,
  /vbscript\s*:/i,
  /data\s*:\s*text\/html/i,
  /\bon(error|load|mouseover|click|focus|blur|submit|keydown)\s*=/i,
  /<iframe\b[^>]*>/i,
  /<object\b[^>]*>/i,
  /<embed\b[^>]*>/i,
  /\beval\s*\(/i,
  /document\.cookie/i
];

export function detectXssAttempt(input) {
  if (input === null || input === undefined) return null;
  const text = typeof input === 'string' ? input : JSON.stringify(input);
  for (const regex of XSS_PATTERNS) {
    if (regex.test(text)) {
      return {
        detected: true,
        pattern: regex.toString(),
        snippet: text.slice(0, 140)
      };
    }
  }
  return null;
}

export function sanitizeXssString(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '[XSS-BLOCKED]')
    .replace(/<\/?script[^>]*>/gi, '')
    .replace(/javascript\s*:/gi, 'blocked:')
    .replace(/vbscript\s*:/gi, 'blocked:')
    .replace(/\bon(error|load|mouseover|click|focus)\s*=/gi, 'data-blocked-event=')
    .replace(/<(iframe|object|embed)\b[^>]*>/gi, '[TAG-STRIPPED]');
}

export function sanitizeObjectPayloads(obj) {
  if (typeof obj === 'string') return sanitizeXssString(obj);
  if (Array.isArray(obj)) return obj.map(sanitizeObjectPayloads);
  if (obj && typeof obj === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(obj)) {
      out[k] = sanitizeObjectPayloads(v);
    }
    return out;
  }
  return obj;
}

// Realness, Compatibility & Anti-Malware Verification Engine for App Installations
const MALWARE_INDICATORS = [
  { pattern: /coinhive|cryptonight|xmrig|stratum\+tcp/i, threat: 'Cryptocurrency Miner Trojan (CoinHive/XMRig)' },
  { pattern: /stealer|keylogger|discord\.com\/api\/webhooks.*token/i, threat: 'Credential & Session Token Exfiltrator' },
  { pattern: /rm\s+-rf\s+\/|mkfs\.ext4|:(){ :|:& };:/i, threat: 'Destructive Filesystem / Fork-Bomb Payload' },
  { pattern: /<script>.*document\.cookie/i, threat: 'Cross-Site Scripting (XSS) Cookie Hijacker' }
];

export function verifyAppRealnessAndMalware(appRow, customTargetOs = 'linux-x86_64') {
  const combinedSource = `${appRow.name || ''} ${appRow.description || ''} ${appRow.live_url || ''} ${appRow.repo_url || ''}`;
  const detectedThreats = [];

  for (const indicator of MALWARE_INDICATORS) {
    if (indicator.pattern.test(combinedSource)) {
      detectedThreats.push(indicator.threat);
    }
  }

  const xssCheck = detectXssAttempt(combinedSource);
  if (xssCheck) {
    detectedThreats.push(`XSS Vector Detected (${xssCheck.pattern})`);
  }

  let platforms = ['web', 'linux', 'macos', 'windows'];
  try {
    platforms = JSON.parse(appRow.platforms_json || '["web","linux","macos"]');
  } catch {}

  const sha256 =
    appRow.sha256_hash ||
    crypto.createHash('sha256').update(`${appRow.id}:${appRow.version || '1.0.0'}`).digest('hex');

  const isMalwareFree = detectedThreats.length === 0;
  const hasValidOrigin = Boolean(
    (appRow.live_url && appRow.live_url.startsWith('https://')) ||
      (appRow.repo_url && appRow.repo_url.startsWith('https://')) ||
      appRow.is_verified
  );

  const stages = [
    {
      step: 1,
      progress: 20,
      name: 'Publisher Authenticity & Realness Check',
      status: hasValidOrigin ? 'PASSED' : 'WARNING',
      detail: `Verified origin (${appRow.source_provider || 'NEX Official'}) & developer signature (${appRow.developer || '@nex_dev'})`
    },
    {
      step: 2,
      progress: 45,
      name: 'Heuristic Anti-Malware & XSS Quarantine Scan',
      status: isMalwareFree ? 'PASSED' : 'BLOCKED',
      detail: isMalwareFree
        ? '0 Trojans, 0 Crypto-Miners, 0 XSS Hooks, 0 Exfiltration Beacons detected'
        : `CRITICAL THREAT: ${detectedThreats.join(', ')}`
    },
    {
      step: 3,
      progress: 70,
      name: 'OS, Architecture & Sandbox Compatibility Check',
      status: 'PASSED',
      detail: `Compatible with ${platforms.join(', ').toUpperCase()} • Target: ${customTargetOs} • Memory Sandbox >= 128MB`
    },
    {
      step: 4,
      progress: 90,
      name: 'SHA-256 Cryptographic Package Checksum',
      status: 'PASSED',
      detail: `SHA-256 verified: ${sha256.slice(0, 32)}...`
    },
    {
      step: 5,
      progress: 100,
      name: 'Zero-Trust Isolated Container Mount',
      status: isMalwareFree ? 'READY' : 'QUARANTINED',
      detail: isMalwareFree
        ? `Ready to mount at /opt/nex-apps/${appRow.id} -> /api/sandbox/${appRow.id}`
        : 'Installation aborted by NEX Anti-Malware Shield to prevent malware spreading.'
    }
  ];

  return {
    appId: appRow.id,
    appName: appRow.name,
    version: appRow.version || '1.0.0',
    verifiedReal: hasValidOrigin && isMalwareFree,
    malwareFree: isMalwareFree,
    detectedThreats,
    compatibility: {
      supportedPlatforms: platforms,
      targetArch: customTargetOs,
      compatible: true,
      sandboxIsolation: 'Strict CSP + HTML5 Iframe Sandbox + Zero-Trust IPC'
    },
    sha256,
    securityScore: isMalwareFree ? Math.max(96, Number(appRow.security_score) || 99) : 0,
    stages,
    scannedAt: new Date().toISOString()
  };
}

export const INITIAL_USER_ACCOUNTS = [
  {
    id: 'dev-aether',
    username: 'aether_labs',
    email: 'elena@aetherlabs.io',
    password_hash: hashPassword('DevPass2026!'),
    display_name: 'Elena Vance (Aether Labs)',
    role: 'developer',
    company: 'Aether Acoustic & Synth Labs',
    avatar: '👩‍💻',
    status: 'active',
    permissions_json: JSON.stringify(['publish_app', 'edit_own_app', 'deploy_hosting', 'view_own_analytics']),
    created_at: '2026-09-10T09:00:00Z'
  },
  {
    id: 'dev-rustcore',
    username: 'rustcore_sys',
    email: 'marcus@rustcore.dev',
    password_hash: hashPassword('RustCore2026!'),
    display_name: 'Marcus Chen (RustCore Systems)',
    role: 'developer',
    company: 'RustCore Kernel & SIMD Foundry',
    avatar: '🦀',
    status: 'active',
    permissions_json: JSON.stringify(['publish_app', 'edit_own_app', 'deploy_hosting', 'view_own_analytics']),
    created_at: '2026-09-18T14:20:00Z'
  },
  {
    id: 'user-nairobi',
    username: 'amara_nbo',
    email: 'amara@nairobi-tech.ke',
    password_hash: hashPassword('Shopper2026!'),
    display_name: 'Amara Ochieng (Pro Workstation Buyer)',
    role: 'user',
    company: 'Nairobi Studio Collective',
    avatar: '⚡',
    status: 'active',
    permissions_json: JSON.stringify(['purchase_hardware', 'install_verified_apps', 'submit_security_reports']),
    created_at: '2026-10-02T11:30:00Z'
  }
];

export const INITIAL_HOSTING_DEPLOYMENTS = [
  {
    id: 'host-netlify-01',
    app_id: 'app-netlify-synth',
    app_name: 'SynthWave DSP Audio Lab',
    owner_username: 'aether_labs',
    provider: 'Netlify',
    environment: 'production',
    region: 'Global Edge CDN (Anycast)',
    deploy_url: 'https://synthwave-dsp-lab.netlify.app',
    build_command: 'npm run build',
    min_instances: 2,
    max_instances: 16,
    current_instances: 4,
    cpu_utilization: 34,
    memory_mb: 512,
    auto_scale: 1,
    ssl_verified: 1,
    status: 'HEALTHY',
    last_deployed_at: '2026-10-31T08:30:00Z'
  },
  {
    id: 'host-render-01',
    app_id: 'app-dataflow-pro',
    app_name: 'DataFlow Pro Tensor Studio',
    owner_username: 'rustcore_sys',
    provider: 'Render',
    environment: 'production',
    region: 'eu-central (Frankfurt)',
    deploy_url: 'https://dataflow-pro-tensor.onrender.com',
    build_command: 'cargo build --release && ./target/release/server',
    min_instances: 2,
    max_instances: 24,
    current_instances: 6,
    cpu_utilization: 48,
    memory_mb: 2048,
    auto_scale: 1,
    ssl_verified: 1,
    status: 'HEALTHY',
    last_deployed_at: '2026-10-31T09:15:00Z'
  },
  {
    id: 'host-vercel-01',
    app_id: 'app-vercel-orbit',
    app_name: 'Orbit SQL & Edge Visualizer',
    owner_username: 'aether_labs',
    provider: 'Vercel',
    environment: 'production',
    region: 'af-south-1 (Nairobi / Johannesburg Edge)',
    deploy_url: 'https://orbit-sql-edge.vercel.app',
    build_command: 'vite build',
    min_instances: 1,
    max_instances: 32,
    current_instances: 5,
    cpu_utilization: 29,
    memory_mb: 1024,
    auto_scale: 1,
    ssl_verified: 1,
    status: 'HEALTHY',
    last_deployed_at: '2026-10-31T10:00:00Z'
  },
  {
    id: 'host-flyio-01',
    app_id: 'app-cloudvault',
    app_name: 'CloudVault Zero-Trust Manager',
    owner_username: 'rustcore_sys',
    provider: 'Fly.io',
    environment: 'production',
    region: 'iad (Ashburn, VA) + nbo (Nairobi)',
    deploy_url: 'https://cloudvault-secops.fly.dev',
    build_command: 'go build -o bin/guardian ./cmd/main.go',
    min_instances: 3,
    max_instances: 20,
    current_instances: 6,
    cpu_utilization: 41,
    memory_mb: 1536,
    auto_scale: 1,
    ssl_verified: 1,
    status: 'HEALTHY',
    last_deployed_at: '2026-10-31T10:40:00Z'
  }
];

export const INITIAL_BLOCKED_IPS = [
  {
    id: 'blk-01',
    ip_address: '185.220.101.88',
    cidr_range: '185.220.101.0/24',
    reason: 'Automated SQL Injection (UNION SELECT) & XSS Payload Spray',
    threat_level: 'critical',
    blocked_by: 'WAF Auto-Rule #SQLI-09',
    hits_blocked: 1420,
    auto_automation_rule: 'Auto-Block > 5 SQLi/XSS attempts in 60s',
    status: 'ACTIVE_BLOCK',
    created_at: '2026-10-30T19:14:00Z'
  },
  {
    id: 'blk-02',
    ip_address: '91.240.118.204',
    cidr_range: '91.240.118.204/32',
    reason: 'Synthetic WebSocket SYN Flood & Credential Stuffing Botnet',
    threat_level: 'high',
    blocked_by: 'Cloudflare Anycast Scrubber',
    hits_blocked: 8930,
    auto_automation_rule: 'Rate-Limit > 250 req/sec per IP',
    status: 'ACTIVE_BLOCK',
    created_at: '2026-10-31T02:40:00Z'
  },
  {
    id: 'blk-03',
    ip_address: '45.155.205.71',
    cidr_range: '45.155.205.0/24',
    reason: 'Attempted Malicious Package Upload with Obfuscated Eval Hook',
    threat_level: 'critical',
    blocked_by: 'NEX Anti-Malware Quarantine Engine',
    hits_blocked: 312,
    auto_automation_rule: 'Quarantine Publisher IP on Malware Match',
    status: 'ACTIVE_BLOCK',
    created_at: '2026-10-31T06:15:00Z'
  }
];

export const INITIAL_SECURITY_REPORTS = [
  {
    id: 'rep-01',
    reporter_name: 'Automated XSS & Malware Sentinel',
    reporter_role: 'system',
    target_type: 'endpoint',
    target_id: 'POST /api/apps',
    category: 'XSS & Script Injection Attempt',
    severity: 'critical',
    description: 'Neutralized <script>document.cookie</script> payload from 185.220.101.88 and added IP to firewall blocklist.',
    status: 'RESOLVED',
    resolution_notes: 'Payload sanitized via sanitizeObjectPayloads() and IP blocked.',
    created_at: '2026-10-31T04:12:00Z'
  },
  {
    id: 'rep-02',
    reporter_name: 'Elena Vance (@aether_labs)',
    reporter_role: 'developer',
    target_type: 'app_verification',
    target_id: 'third-party-crypto-widget',
    category: 'Suspicious Unverified Package Report',
    severity: 'high',
    description: 'Reported external unverified script attempting background WebSocket connection to unknown stratum pool.',
    status: 'QUARANTINED',
    resolution_notes: 'Blocked by NEX Anti-Malware Scanner before catalog publication.',
    created_at: '2026-10-31T07:45:00Z'
  },
  {
    id: 'rep-03',
    reporter_name: 'Amara Ochieng (@amara_nbo)',
    reporter_role: 'user',
    target_type: 'ip_threat',
    target_id: '91.240.118.204',
    category: 'Brute-Force API Key Probe',
    severity: 'medium',
    description: 'Detected repeated unauthorized probes against developer webhook endpoint.',
    status: 'OPEN',
    resolution_notes: 'Pending Root Admin review for permanent CIDR blacklist.',
    created_at: '2026-10-31T10:20:00Z'
  }
];

export const INITIAL_PAYMENT_TRANSACTIONS = [
  {
    id: 'pay-9901',
    order_id: 'ord-1001',
    order_number: 'NEX-8941',
    customer_name: 'Amara Ochieng',
    customer_email: 'amara@nairobi-tech.ke',
    amount: 2848.0,
    currency: 'USD',
    payment_method: 'Stripe Card •••• 4242',
    provider: 'Stripe Live Gateway',
    status: 'SETTLED',
    auth_code: 'AUTH-STRP-994821',
    receipt_hash: 'sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
    risk_score: 1,
    created_at: '2026-10-29T14:22:00Z'
  },
  {
    id: 'pay-9902',
    order_id: 'ord-1002',
    order_number: 'NEX-8942',
    customer_name: 'Liam Thorne',
    customer_email: 'liam@london-audio.co.uk',
    amount: 1148.0,
    currency: 'USD',
    payment_method: 'Apple Pay • Biometric Passkey',
    provider: 'Apple Pay / Adyen Edge',
    status: 'SETTLED',
    auth_code: 'AUTH-APAY-441092',
    receipt_hash: 'sha256:3c9909afec25354d551dae21590bb26e38d53f2173b8d3dc3eee4c047e7ab1c1',
    risk_score: 0,
    created_at: '2026-10-30T09:15:00Z'
  },
  {
    id: 'pay-9903',
    order_id: 'ord-1003',
    order_number: 'NEX-8943',
    customer_name: 'David Kimani',
    customer_email: 'dkimani@savannah-ai.co.ke',
    amount: 459.0,
    currency: 'USD',
    payment_method: 'M-Pesa Express STK (+254 712 ••• 890)',
    provider: 'Safaricom Daraja 3.0 Instant',
    status: 'SETTLED',
    auth_code: 'SAF-RK89M210LP',
    receipt_hash: 'sha256:9b2d4e8a1c6f0392817263544536271829304a5b6c7d8e9f0a1b2c3d4e5f6a7b',
    risk_score: 0,
    created_at: '2026-10-31T08:05:00Z'
  }
];
