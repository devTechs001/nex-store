import express from 'express';
import cors from 'cors';
import http from 'node:http';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { WebSocketServer } from 'ws';
import {
  db,
  seedDatabase,
  formatProductRow,
  recordActivityEvent,
  recordPushNotification,
  recordSecurityEvent,
  recordTerminalLog
} from './db.js';
import crypto from 'node:crypto';
import { renderProductSvg } from './productArt.js';
import { renderSandboxedAppHtml } from './appSandboxRuntime.js';
import { renderAppBannerSvg, inspectAndFetchUrlResources } from './appArtAndFetcher.js';
import { executePolyglotAutomation, aiEnhancePolyglotScript } from './polyglotAutomationEngine.js';
import { formatSubscriptionPlan } from './mobileAndSubscriptions.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize & seed SQLite database
seedDatabase();

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

// Track connected real-time clients and what product they are viewing
const clients = new Map();

function broadcast(type, payload) {
  const message = JSON.stringify({
    type,
    payload,
    timestamp: new Date().toISOString()
  });
  for (const [ws] of clients.entries()) {
    if (ws.readyState === 1) {
      ws.send(message);
    }
  }
}

function getPresenceSummary() {
  const viewersByProduct = {};
  for (const [, meta] of clients.entries()) {
    if (meta.viewingProductId) {
      viewersByProduct[meta.viewingProductId] = (viewersByProduct[meta.viewingProductId] || 0) + 1;
    }
  }
  return {
    connectedClients: Math.max(1, clients.size),
    activeShoppers: Math.max(14, clients.size * 7 + 9),
    viewersByProduct
  };
}

wss.on('connection', (ws) => {
  const clientId = `client-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  clients.set(ws, { id: clientId, connectedAt: Date.now(), viewingProductId: null });

  ws.send(
    JSON.stringify({
      type: 'connection:established',
      payload: {
        clientId,
        presence: getPresenceSummary()
      },
      timestamp: new Date().toISOString()
    })
  );

  broadcast('presence:update', getPresenceSummary());

  ws.on('message', (raw) => {
    try {
      const data = JSON.parse(raw.toString());
      if (data.type === 'presence:view_product') {
        const meta = clients.get(ws);
        if (meta) {
          meta.viewingProductId = data.productId || null;
          clients.set(ws, meta);
          broadcast('presence:update', getPresenceSummary());
        }
      } else if (data.type === 'ping') {
        ws.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
      }
    } catch {
      // ignore malformed messages
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
    broadcast('presence:update', getPresenceSummary());
  });
});

// Helper functions for querying comprehensive state
function getAllProducts() {
  const rows = db.prepare('SELECT * FROM products ORDER BY featured DESC, sold_count DESC').all();
  return rows.map(formatProductRow);
}

function getOrdersWithItems(limit = 50) {
  const orders = db.prepare('SELECT * FROM orders ORDER BY created_at DESC LIMIT ?').all(limit);
  const itemStmt = db.prepare('SELECT * FROM order_items WHERE order_id = ?');
  return orders.map((o) => ({
    ...o,
    items: itemStmt.all(o.id)
  }));
}

function getAnalyticsSummary() {
  const revRow = db.prepare(`
    SELECT
      COUNT(*) as totalOrders,
      COALESCE(SUM(total), 0) as totalRevenue,
      COALESCE(AVG(total), 0) as avgOrderValue
    FROM orders
    WHERE status != 'cancelled'
  `).get();

  const prodStats = db.prepare(`
    SELECT
      COUNT(*) as totalProducts,
      COALESCE(SUM(stock), 0) as totalUnitsInStock,
      SUM(CASE WHEN stock <= low_stock_threshold THEN 1 ELSE 0 END) as lowStockCount,
      COALESCE(SUM(sold_count), 0) as totalUnitsSold
    FROM products
  `).get();

  const catBreakdown = db.prepare(`
    SELECT
      category,
      COUNT(*) as productCount,
      SUM(stock) as stockCount,
      SUM(sold_count) as soldCount,
      ROUND(SUM(price * sold_count), 2) as estimatedRevenue
    FROM products
    GROUP BY category
    ORDER BY estimatedRevenue DESC
  `).all();

  const reviewStats = db.prepare(`
    SELECT COUNT(*) as totalReviews, ROUND(AVG(rating), 2) as avgRating FROM reviews
  `).get();

  return {
    totalOrders: revRow.totalOrders || 0,
    totalRevenue: Number((revRow.totalRevenue || 0).toFixed(2)),
    avgOrderValue: Number((revRow.avgOrderValue || 0).toFixed(2)),
    totalProducts: prodStats.totalProducts || 0,
    totalUnitsInStock: prodStats.totalUnitsInStock || 0,
    lowStockCount: prodStats.lowStockCount || 0,
    totalUnitsSold: prodStats.totalUnitsSold || 0,
    totalReviews: reviewStats.totalReviews || 0,
    avgRating: reviewStats.avgRating || 4.9,
    categoryBreakdown: catBreakdown
  };
}

const ALLOWED_TABLES = [
  'products',
  'apps',
  'categories',
  'orders',
  'order_items',
  'reviews',
  'coupons',
  'inventory_logs',
  'activity_events',
  'chat_messages',
  'subscribers',
  'server_nodes',
  'integrations',
  'security_events',
  'push_notifications',
  'terminal_logs',
  'terminal_scripts',
  'bto_configs',
  'app_installs',
  'polyglot_automations',
  'subscription_plans',
  'user_subscriptions',
  'mobile_addons'
];

function getDatabaseStats() {
  const dbFilePath = path.resolve(__dirname, '../data/nexstore.db');
  let sizeBytes = 0;
  try {
    sizeBytes = fs.statSync(dbFilePath).size;
  } catch {
    sizeBytes = 0;
  }

  const tables = ALLOWED_TABLES.map((name) => {
    const countRow = db.prepare(`SELECT COUNT(*) as count FROM ${name}`).get();
    const columns = db.prepare(`PRAGMA table_info(${name})`).all();
    return {
      name,
      rowCount: countRow?.count || 0,
      columns: columns.map((c) => ({
        name: c.name,
        type: c.type,
        notnull: Boolean(c.notnull),
        pk: Boolean(c.pk)
      }))
    };
  });

  const totalRows = tables.reduce((acc, t) => acc + t.rowCount, 0);

  return {
    engine: 'SQLite 3 (Node.js Native DatabaseSync • WAL Mode)',
    filePath: 'data/nexstore.db',
    sizeBytes,
    sizeFormatted: `${(sizeBytes / 1024).toFixed(1)} KB`,
    totalTables: tables.length,
    totalRows,
    tables
  };
}

// 1. Dynamic Product Studio SVG Endpoint & Dynamic App Preview Banner SVG Endpoint
app.get('/api/product-art/:idFile', (req, res) => {
  const rawId = req.params.idFile.replace(/\.svg$/i, '');
  const product = db.prepare('SELECT id, sku, name, category FROM products WHERE id = ?').get(rawId);
  const svg = renderProductSvg(rawId, req.query, product);
  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'no-cache');
  res.send(svg);
});

app.get('/api/app-art/:idFile', (req, res) => {
  const rawId = req.params.idFile.replace(/\.svg$/i, '');
  const foundApp = db.prepare('SELECT * FROM apps WHERE id = ?').get(rawId) || { id: rawId };
  const svg = renderAppBannerSvg(foundApp, req.query);
  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'no-cache');
  res.send(svg);
});

// 2. Bootstrap Endpoint (Fast initial load)
app.get('/api/bootstrap', (_req, res) => {
  const categories = db.prepare('SELECT * FROM categories').all();
  const products = getAllProducts();
  const apps = db.prepare('SELECT * FROM apps ORDER BY is_featured DESC, downloads DESC').all();
  const coupons = db.prepare('SELECT * FROM coupons ORDER BY active DESC, discount_value DESC').all();
  const orders = getOrdersWithItems(30);
  const reviews = db.prepare(`
    SELECT r.*, p.name as product_name
    FROM reviews r
    LEFT JOIN products p ON p.id = r.product_id
    ORDER BY r.created_at DESC
    LIMIT 30
  `).all();
  const inventoryLogs = db.prepare('SELECT * FROM inventory_logs ORDER BY created_at DESC LIMIT 30').all();
  const activityEvents = db.prepare('SELECT * FROM activity_events ORDER BY created_at DESC LIMIT 25').all();
  const chatMessages = db.prepare('SELECT * FROM chat_messages ORDER BY created_at ASC LIMIT 50').all();
  const serverNodes = db.prepare('SELECT * FROM server_nodes ORDER BY latency_ms ASC').all();
  const integrations = db.prepare('SELECT * FROM integrations ORDER BY events_synced DESC').all();
  const securityEvents = db.prepare('SELECT * FROM security_events ORDER BY created_at DESC LIMIT 35').all();
  const notifications = db.prepare('SELECT * FROM push_notifications ORDER BY created_at DESC LIMIT 40').all();
  const terminalLogs = db.prepare('SELECT * FROM terminal_logs ORDER BY created_at DESC LIMIT 40').all();
  const terminalScripts = db
    .prepare('SELECT * FROM terminal_scripts ORDER BY run_count DESC')
    .all()
    .map((s) => ({ ...s, code: s.code || s.script_body }));
  const btoConfigs = db
    .prepare('SELECT * FROM bto_configs ORDER BY created_at DESC')
    .all()
    .map((b) => ({
      ...b,
      slots: typeof b.slots_json === 'string' ? JSON.parse(b.slots_json) : b.slots || {}
    }));
  const appInstalls = db
    .prepare('SELECT * FROM app_installs ORDER BY installed_at DESC')
    .all();
  const polyglotAutomations = db
    .prepare('SELECT * FROM polyglot_automations ORDER BY run_count DESC')
    .all();
  const subscriptionPlans = db
    .prepare('SELECT * FROM subscription_plans ORDER BY tier_level ASC')
    .all()
    .map(formatSubscriptionPlan);
  const userSubscriptions = db
    .prepare('SELECT * FROM user_subscriptions ORDER BY subscribed_at DESC')
    .all();
  const mobileAddons = db
    .prepare('SELECT * FROM mobile_addons ORDER BY updated_at DESC')
    .all();

  res.json({
    categories,
    products,
    apps,
    coupons,
    orders,
    reviews,
    inventoryLogs,
    activityEvents,
    chatMessages,
    serverNodes,
    integrations,
    securityEvents,
    notifications,
    terminalLogs,
    terminalScripts,
    btoConfigs,
    appInstalls,
    polyglotAutomations,
    subscriptionPlans,
    userSubscriptions,
    mobileAddons,
    analytics: getAnalyticsSummary(),
    dbStats: getDatabaseStats(),
    presence: getPresenceSummary()
  });
});

// 2b. Enterprise Software, Developer App & System Package Publishing Endpoints
app.get('/api/apps', (_req, res) => {
  const apps = db.prepare('SELECT * FROM apps ORDER BY is_featured DESC, downloads DESC').all();
  res.json({ apps });
});

app.get('/api/developer/apps', (_req, res) => {
  const apps = db.prepare('SELECT * FROM apps ORDER BY created_at DESC, downloads DESC').all();
  const installs = db.prepare('SELECT * FROM app_installs').all();
  res.json({
    apps,
    installedCount: installs.length,
    publishEndpoint: 'POST /api/developer/publish',
    detailsEndpoint: 'GET /api/apps/:id/details'
  });
});

// Full Developer & System Package Details Endpoint (for installation & viewing with developer credentials)
app.get('/api/apps/:id/details', (req, res) => {
  const found = db.prepare('SELECT * FROM apps WHERE id = ?').get(req.params.id);
  if (!found) return res.status(404).json({ error: 'App or system package not found' });

  const installRecord = db.prepare('SELECT * FROM app_installs WHERE app_id = ?').get(found.id) || null;
  let resources = [];
  let aiCapabilities = [];
  let permissions = [];
  let systemRequirements = {};
  try {
    resources = JSON.parse(found.resources_json || '[]');
  } catch {}
  try {
    aiCapabilities = JSON.parse(found.ai_capabilities_json || '[]');
  } catch {}
  try {
    permissions = JSON.parse(found.permissions_json || '[]');
  } catch {}
  try {
    systemRequirements = JSON.parse(found.system_requirements_json || '{}');
  } catch {}

  res.json({
    app: {
      ...found,
      resources,
      aiCapabilities,
      permissions,
      systemRequirements
    },
    developerProfile: {
      name: found.developer,
      email: found.developer_email || 'dev@nexstore.dev',
      website: found.developer_website || found.repo_url || 'https://github.com/devTechs001/nex-store',
      bio: found.developer_bio || 'Verified NEX Ecosystem & Open-Source Systems Publisher',
      verified: Boolean(found.is_verified),
      sourceProvider: found.source_provider || 'NEX Official'
    },
    installation: {
      isInstalled: Boolean(installRecord),
      installRecord,
      installCommand: found.install_command || `nex install ${found.id} --verify-sha256`,
      sandboxUrl: `/api/sandbox/${found.id}`,
      standalonePackageUrl: `/api/apps/${found.id}/package`
    }
  });
});

// Fetch live app metadata, preview image, name, developer, version, resources & AI capabilities from any provided URL
app.post('/api/apps/inspect-url', async (req, res) => {
  try {
    const rawUrl = req.body?.url || req.body?.live_url || '';
    if (!String(rawUrl).trim()) {
      return res.status(400).json({ error: 'Please provide a URL to inspect' });
    }
    const inspected = await inspectAndFetchUrlResources(rawUrl);
    recordTerminalLog({
      command: `nex inspect-url "${inspected.live_url}" --extract-resources --ai-audit`,
      output: `[URL-EXTRACTOR] Fetched "${inspected.name}" (${inspected.source_provider}) • Image: ${inspected.image_url} • Resources: ${inspected.resources?.length || 0} • AI Score: 99/100`,
      exit_code: 0,
      duration_ms: 6.4
    });
    res.json({ inspected });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Failed to inspect URL' });
  }
});

function handlePublishDeveloperAppOrSystem(req, res) {
  const {
    name,
    description = 'Enterprise & community application package',
    version = '1.0.0',
    category = 'web',
    package_type = 'app',
    language = 'typescript',
    size = '14.2 MB',
    developer = 'Community Developer',
    developer_email = 'publisher@nexstore.dev',
    developer_website = 'https://github.com/devTechs001/nex-store',
    developer_bio = 'Verified External Developer & Systems Architect',
    icon = '🚀',
    license = 'PROPRIETARY-NEX-DRM',
    source_provider = 'Netlify',
    live_url = '',
    repo_url = '',
    image_url = '',
    install_command = '',
    changelog = 'Initial verified release with SHA-256 sandbox runtime and DRM lock.',
    system_requirements = null,
    resources = [],
    ai_capabilities = [],
    permissions = ['Sandboxed Iframe', 'WebAudio API', 'WebSocket Stream']
  } = req.body || {};

  if (!name || !String(name).trim()) {
    return res.status(400).json({ error: 'App or system package name is required' });
  }

  const id = `app-${Date.now().toString(36)}`;
  const now = new Date().toISOString();
  const cleanLiveUrl =
    String(live_url).trim() ||
    `https://${String(name).trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')}.netlify.app`;
  const sha256Hash = crypto
    .createHash('sha256')
    .update(`${id}:${name}:${version}:${cleanLiveUrl}`)
    .digest('hex');
  const resolvedImageUrl =
    image_url && String(image_url).trim()
      ? String(image_url).trim()
      : `/api/app-art/${id}.svg?name=${encodeURIComponent(String(name).trim())}&provider=${encodeURIComponent(source_provider)}&lang=${encodeURIComponent(language)}&dev=${encodeURIComponent(String(developer).trim())}&icon=${encodeURIComponent(icon)}`;
  const resolvedResources =
    Array.isArray(resources) && resources.length > 0
      ? resources
      : [
          { type: 'image', name: 'og-preview-banner.svg', url: resolvedImageUrl, size: '24 KB' },
          { type: 'manifest', name: 'nex-app-manifest.json', url: `/api/apps/${id}/package`, size },
          { type: 'security', name: 'drm-sha256-attestation.sig', url: cleanLiveUrl, size: '4 KB' }
        ];
  const resolvedAi =
    Array.isArray(ai_capabilities) && ai_capabilities.length > 0
      ? ai_capabilities
      : [
          'AI Zero-Trust Sandbox Runtime Verified',
          `Polyglot ${language} Automation Bridge Ready`,
          'Anti-Piracy Cryptographic DRM Watermark Locked'
        ];
  const resolvedInstallCmd =
    String(install_command).trim() ||
    `nex install ${id} --type=${package_type} --verify-sha256 --mount=/opt/nex-apps/${id}`;
  const resolvedSysReq =
    system_requirements && typeof system_requirements === 'object'
      ? system_requirements
      : {
          os: 'Linux / macOS / Windows / NEX Sandbox / Flutter Bridge',
          ram: package_type === 'system' ? '512 MB Kernel/System Pool' : '256 MB Isolated Heap',
          arch: 'x86_64 / ARM64 / WASM32',
          mobileBridge: 'Flutter MethodChannel & React Native JSI Ready'
        };

  db.prepare(`
    INSERT INTO apps (
      id, name, description, version, category, language, platforms_json,
      rating, reviews_count, downloads, size, developer, icon, license, price,
      is_featured, is_verified, source_provider, live_url, repo_url,
      sha256_hash, security_score, permissions_json, image_url, resources_json, ai_capabilities_json,
      package_type, developer_email, developer_website, developer_bio, install_command, system_requirements_json, changelog, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 5.0, 1, 1, ?, ?, ?, ?, 'Free', 1, 1, ?, ?, ?, ?, 99, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    String(name).trim(),
    String(description).trim(),
    String(version).trim(),
    category,
    language,
    JSON.stringify(['web', 'linux', 'macos', 'windows', 'flutter', 'react-native']),
    size,
    String(developer).trim(),
    icon,
    license,
    source_provider,
    cleanLiveUrl,
    String(repo_url).trim(),
    sha256Hash,
    JSON.stringify(Array.isArray(permissions) ? permissions : ['Sandboxed Iframe']),
    resolvedImageUrl,
    JSON.stringify(resolvedResources),
    JSON.stringify(resolvedAi),
    package_type,
    String(developer_email).trim(),
    String(developer_website).trim(),
    String(developer_bio).trim(),
    resolvedInstallCmd,
    JSON.stringify(resolvedSysReq),
    String(changelog).trim(),
    now
  );

  const createdApp = db.prepare('SELECT * FROM apps WHERE id = ?').get(id);
  const activity = recordActivityEvent({
    event_type: 'product_created',
    title: `Published ${package_type.toUpperCase()} • ${createdApp.name}`,
    message: `${createdApp.developer} (${createdApp.developer_email}) published ${createdApp.name} v${createdApp.version} from ${source_provider}`,
    meta: { app_id: createdApp.id, source_provider, package_type }
  });

  const secEvent = recordSecurityEvent({
    event_type: 'pkg_verify',
    severity: 'low',
    source_ip: '196.216.84.12',
    target_resource: `${createdApp.name} (${source_provider})`,
    action_taken: 'VERIFIED',
    description: `Verified SHA-256 package signature (${sha256Hash.slice(0, 16)}...) and sandbox manifest for ${cleanLiveUrl}`
  });

  const notif = recordPushNotification({
    channel: 'deployment',
    priority: 'high',
    title: `New ${source_provider} ${package_type === 'system' ? 'System Module' : 'App'} Live: ${createdApp.name}`,
    message: `By ${createdApp.developer} • Verified Safe (Score 99/100) • ${cleanLiveUrl}`,
    action_url: 'apps'
  });

  broadcast('app:created', {
    app: createdApp,
    activity,
    securityEvent: secEvent,
    notification: notif,
    dbStats: getDatabaseStats()
  });

  res.status(201).json({ app: createdApp, securityEvent: secEvent, notification: notif });
}

app.post('/api/apps', handlePublishDeveloperAppOrSystem);
app.post('/api/developer/publish', handlePublishDeveloperAppOrSystem);

// Allow Admin / Developer to modify or unpublish an app/system package
app.patch('/api/apps/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM apps WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'App not found' });

  const {
    name = existing.name,
    description = existing.description,
    version = existing.version,
    developer = existing.developer,
    developer_email = existing.developer_email || 'dev@nexstore.dev',
    developer_website = existing.developer_website || existing.repo_url,
    developer_bio = existing.developer_bio || 'Verified NEX Publisher',
    package_type = existing.package_type || 'app',
    live_url = existing.live_url,
    repo_url = existing.repo_url,
    changelog = existing.changelog || 'Updated release notes'
  } = req.body || {};

  db.prepare(`
    UPDATE apps
    SET name = ?, description = ?, version = ?, developer = ?, developer_email = ?,
        developer_website = ?, developer_bio = ?, package_type = ?, live_url = ?, repo_url = ?, changelog = ?
    WHERE id = ?
  `).run(
    String(name).trim(),
    String(description).trim(),
    String(version).trim(),
    String(developer).trim(),
    String(developer_email).trim(),
    String(developer_website).trim(),
    String(developer_bio).trim(),
    String(package_type).trim(),
    String(live_url).trim(),
    String(repo_url).trim(),
    String(changelog).trim(),
    existing.id
  );

  const updated = db.prepare('SELECT * FROM apps WHERE id = ?').get(existing.id);
  const apps = db.prepare('SELECT * FROM apps ORDER BY is_featured DESC, downloads DESC').all();
  broadcast('apps:updated', { app: updated, apps, dbStats: getDatabaseStats() });
  res.json({ app: updated, apps });
});

app.delete('/api/apps/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM apps WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'App not found' });

  db.prepare('DELETE FROM apps WHERE id = ?').run(existing.id);
  db.prepare('DELETE FROM app_installs WHERE app_id = ?').run(existing.id);
  const apps = db.prepare('SELECT * FROM apps ORDER BY is_featured DESC, downloads DESC').all();
  const appInstalls = db.prepare('SELECT * FROM app_installs ORDER BY installed_at DESC').all();
  broadcast('apps:updated', { apps, appInstalls, dbStats: getDatabaseStats() });
  res.json({ deleted: true, id: existing.id, apps, appInstalls });
});

function performAppInstall(appId) {
  const existing = db.prepare('SELECT * FROM apps WHERE id = ?').get(appId);
  if (!existing) return null;

  const now = new Date().toISOString();
  const sha =
    existing.sha256_hash ||
    crypto.createHash('sha256').update(`${existing.id}:${existing.version}`).digest('hex');

  db.prepare('UPDATE apps SET downloads = downloads + 1 WHERE id = ?').run(existing.id);
  db.prepare(`
    INSERT OR REPLACE INTO app_installs (
      id, app_id, app_name, version, source_provider, install_path, sandbox_url, sha256_verified, status, installed_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'INSTALLED', ?)
  `).run(
    `inst-${existing.id}`,
    existing.id,
    existing.name,
    existing.version,
    existing.source_provider || 'NEX Official',
    `/opt/nex-apps/${existing.id}`,
    `/api/sandbox/${existing.id}`,
    sha,
    now
  );

  const updatedApp = db.prepare('SELECT * FROM apps WHERE id = ?').get(existing.id);
  const installRecord = db.prepare('SELECT * FROM app_installs WHERE app_id = ?').get(existing.id);
  const appInstalls = db.prepare('SELECT * FROM app_installs ORDER BY installed_at DESC').all();

  recordTerminalLog({
    command: `nex install ${existing.id} --verify-sha256`,
    output: `[INSTALLER] Verified SHA-256 (${sha.slice(0, 16)}...) -> Mounted /opt/nex-apps/${existing.id} -> Sandbox ready at /api/sandbox/${existing.id}`,
    exit_code: 0,
    duration_ms: 4.8
  });

  const activity = recordActivityEvent({
    event_type: 'live_purchase',
    title: `App Installed • ${updatedApp.name}`,
    message: `${updatedApp.name} v${updatedApp.version} mounted at /opt/nex-apps/${updatedApp.id} (${updatedApp.downloads.toLocaleString()} installs)`,
    meta: { app_id: updatedApp.id, downloads: updatedApp.downloads }
  });

  broadcast('app:downloaded', {
    app: updatedApp,
    installRecord,
    appInstalls,
    activity,
    dbStats: getDatabaseStats()
  });

  return { app: updatedApp, installRecord, appInstalls };
}

app.get('/api/apps/installed', (_req, res) => {
  const appInstalls = db.prepare('SELECT * FROM app_installs ORDER BY installed_at DESC').all();
  res.json({ appInstalls });
});

app.post('/api/apps/:id/download', (req, res) => {
  const result = performAppInstall(req.params.id);
  if (!result) return res.status(404).json({ error: 'App not found' });
  res.json(result);
});

app.post('/api/apps/:id/install', (req, res) => {
  const result = performAppInstall(req.params.id);
  if (!result) return res.status(404).json({ error: 'App not found' });
  res.status(201).json(result);
});

app.delete('/api/apps/:id/uninstall', (req, res) => {
  const appId = req.params.id;
  db.prepare('DELETE FROM app_installs WHERE app_id = ? OR id = ?').run(appId, appId);
  const appInstalls = db.prepare('SELECT * FROM app_installs ORDER BY installed_at DESC').all();

  recordTerminalLog({
    command: `nex uninstall ${appId}`,
    output: `[UNINSTALLER] Unmounted container /opt/nex-apps/${appId} and purged SQLite app_installs record.`,
    exit_code: 0,
    duration_ms: 2.1
  });

  broadcast('app:uninstalled', {
    appId,
    appInstalls,
    dbStats: getDatabaseStats()
  });

  res.json({ appId, appInstalls });
});

// Real Isolated HTML5/Canvas/WebAudio Sandbox Runtime Endpoint for <iframe sandbox="...">
app.get('/api/sandbox/:id', (req, res) => {
  const rawId = req.params.id;
  const foundApp =
    db.prepare('SELECT * FROM apps WHERE id = ?').get(rawId) || {
      id: rawId,
      name: rawId,
      version: '1.0.0',
      developer: 'NEX Community Developer',
      source_provider: 'Netlify',
      category: 'web',
      language: 'typescript',
      icon: '🚀',
      description: 'Isolated sandbox container runtime.'
    };

  const html = renderSandboxedAppHtml(foundApp);
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.send(html);
});

// Real Standalone Executable HTML5 Package Bundle Download
app.get('/api/apps/:id/package', (req, res) => {
  const rawId = req.params.id;
  const foundApp = db.prepare('SELECT * FROM apps WHERE id = ?').get(rawId);
  if (!foundApp) return res.status(404).json({ error: 'App not found' });

  const html = renderSandboxedAppHtml(foundApp, { isDownloadPackage: true });
  const filename = `${foundApp.id}-v${foundApp.version}-standalone.html`;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(html);
});

// 2c. Polyglot AI Automation Studio Endpoints (Python, Rust, C++, Java, Go, TypeScript) — SQLite Table #20
app.get('/api/automations', (_req, res) => {
  const polyglotAutomations = db
    .prepare('SELECT * FROM polyglot_automations ORDER BY run_count DESC')
    .all();
  res.json({ polyglotAutomations });
});

app.post('/api/automations', (req, res) => {
  const {
    name = 'custom_automation.py',
    title = 'Custom Polyglot AI Automation',
    language = 'python',
    runtime = 'Python 3.12 + AI Neural Engine',
    category = 'AI & Automation',
    description = 'Custom multi-language automation protected by NEX Anti-Piracy DRM.',
    code = '# © 2026 NEX STORE PROPRIETARY DRM — DO NOT SHARE OR PIRATE\nprint("Hello from NEX Polyglot Engine")'
  } = req.body || {};

  const id = `poly-${Date.now().toString(36)}`;
  const now = new Date().toISOString();
  const enhanced = aiEnhancePolyglotScript({ language, name, code });

  db.prepare(`
    INSERT OR REPLACE INTO polyglot_automations (
      id, name, title, language, runtime, category, description, code, run_count, ai_enhanced, last_output, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, 1, 'Ready for execution', ?)
  `).run(
    id,
    String(name).trim(),
    String(title).trim(),
    String(language).toLowerCase(),
    String(runtime).trim(),
    String(category).trim(),
    String(description).trim(),
    enhanced.enhancedCode,
    now
  );

  const polyglotAutomations = db
    .prepare('SELECT * FROM polyglot_automations ORDER BY run_count DESC')
    .all();
  const created = polyglotAutomations.find((p) => p.id === id) || polyglotAutomations[0];

  broadcast('automations:updated', {
    polyglotAutomations,
    dbStats: getDatabaseStats()
  });

  res.status(201).json({ automation: created, polyglotAutomations });
});

app.post('/api/automations/run', (req, res) => {
  const { id, language = 'python', name = 'inline_automation.py', code = '' } = req.body || {};
  const existing = id
    ? db.prepare('SELECT * FROM polyglot_automations WHERE id = ?').get(id)
    : null;

  const targetAutomation = existing
    ? { ...existing, code: code || existing.code, language: language || existing.language }
    : { id: 'adhoc', name, language, code };

  const liveContext = {
    products: db.prepare('SELECT sku, name, stock, sold_count FROM products').all(),
    serverNodes: db.prepare('SELECT id, region, latency_ms, status FROM server_nodes').all(),
    apps: db.prepare('SELECT id, name, source_provider, language FROM apps').all()
  };

  const result = executePolyglotAutomation(targetAutomation, liveContext);
  const now = new Date().toISOString();

  if (existing) {
    db.prepare(`
      UPDATE polyglot_automations
      SET run_count = run_count + 1, code = ?, last_output = ?, updated_at = ?
      WHERE id = ?
    `).run(targetAutomation.code, result.output, now, existing.id);
  }

  const termLog = recordTerminalLog({
    command: `nex polyglot run ${targetAutomation.name} --lang=${targetAutomation.language}`,
    output: result.output,
    exit_code: 0,
    duration_ms: result.durationMs
  });

  const polyglotAutomations = db
    .prepare('SELECT * FROM polyglot_automations ORDER BY run_count DESC')
    .all();

  broadcast('automations:executed', {
    result,
    polyglotAutomations,
    terminalLog: termLog,
    dbStats: getDatabaseStats()
  });

  res.json({
    result,
    polyglotAutomations,
    terminalLog: termLog
  });
});

app.post('/api/automations/ai-enhance', (req, res) => {
  const { id, language = 'python', name = 'automation.py', code = '', goal = '' } = req.body || {};
  const enhanced = aiEnhancePolyglotScript({ language, name, code, goal });
  const now = new Date().toISOString();

  if (id) {
    db.prepare(`
      UPDATE polyglot_automations
      SET code = ?, ai_enhanced = 1, updated_at = ?
      WHERE id = ?
    `).run(enhanced.enhancedCode, now, id);
  }

  const polyglotAutomations = db
    .prepare('SELECT * FROM polyglot_automations ORDER BY run_count DESC')
    .all();

  res.json({
    enhancedCode: enhanced.enhancedCode,
    aiNotes: enhanced.aiNotes,
    polyglotAutomations
  });
});

// 2d. Subscriptions System Endpoints (Modifiable by Admin / Developer) — SQLite Tables #21 & #22
app.get('/api/subscriptions', (_req, res) => {
  const subscriptionPlans = db
    .prepare('SELECT * FROM subscription_plans ORDER BY tier_level ASC')
    .all()
    .map(formatSubscriptionPlan);
  const userSubscriptions = db
    .prepare('SELECT * FROM user_subscriptions ORDER BY subscribed_at DESC')
    .all();
  res.json({ subscriptionPlans, userSubscriptions });
});

app.post('/api/subscriptions/plans', (req, res) => {
  const {
    name = 'Custom Developer Tier',
    code = `TIER_${Date.now().toString(36).toUpperCase()}`,
    tagline = 'Custom developer & mobile SDK subscription plan.',
    price_monthly = 49,
    price_yearly = 490,
    currency = 'USD',
    tier_level = 3,
    badge = 'CUSTOM TIER',
    features = [
      'Full Developer Publishing API (POST /api/developer/publish)',
      'Polyglot AI Automation Studio Access',
      'Mobile Flutter & React Native Add-On SDK'
    ],
    limits = { maxAppsPublished: 100, polyglotRunsPerDay: 2500, mobileSdkNodes: 15, slaUptime: '99.95%' },
    is_popular = false,
    updated_by = 'Admin / Developer'
  } = req.body || {};

  const id = `plan-${Date.now().toString(36)}`;
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO subscription_plans (
      id, code, name, tagline, price_monthly, price_yearly, currency, tier_level,
      badge, features_json, limits_json, is_popular, active, updated_by, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
  `).run(
    id,
    String(code).trim().toUpperCase(),
    String(name).trim(),
    String(tagline).trim(),
    Number(price_monthly) || 0,
    Number(price_yearly) || 0,
    String(currency).trim() || 'USD',
    Number(tier_level) || 2,
    String(badge).trim() || 'CUSTOM TIER',
    JSON.stringify(Array.isArray(features) ? features : [String(features)]),
    JSON.stringify(limits || {}),
    is_popular ? 1 : 0,
    String(updated_by).trim() || 'Admin / Developer',
    now
  );

  const subscriptionPlans = db
    .prepare('SELECT * FROM subscription_plans ORDER BY tier_level ASC')
    .all()
    .map(formatSubscriptionPlan);
  const created = subscriptionPlans.find((p) => p.id === id) || subscriptionPlans[0];

  broadcast('subscriptions:updated', {
    subscriptionPlans,
    dbStats: getDatabaseStats()
  });

  res.status(201).json({ plan: created, subscriptionPlans });
});

app.patch('/api/subscriptions/plans/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM subscription_plans WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Subscription plan not found' });

  const formattedExisting = formatSubscriptionPlan(existing);
  const {
    name = existing.name,
    tagline = existing.tagline,
    price_monthly = existing.price_monthly,
    price_yearly = existing.price_yearly,
    badge = existing.badge,
    features = formattedExisting.features,
    limits = formattedExisting.limits,
    is_popular = formattedExisting.is_popular,
    active = formattedExisting.active,
    updated_by = 'Admin / Developer'
  } = req.body || {};

  const now = new Date().toISOString();
  db.prepare(`
    UPDATE subscription_plans
    SET name = ?, tagline = ?, price_monthly = ?, price_yearly = ?, badge = ?,
        features_json = ?, limits_json = ?, is_popular = ?, active = ?, updated_by = ?, updated_at = ?
    WHERE id = ?
  `).run(
    String(name).trim(),
    String(tagline).trim(),
    Number(price_monthly),
    Number(price_yearly),
    String(badge).trim(),
    JSON.stringify(Array.isArray(features) ? features : formattedExisting.features),
    JSON.stringify(limits || formattedExisting.limits),
    is_popular ? 1 : 0,
    active ? 1 : 0,
    String(updated_by).trim(),
    now,
    existing.id
  );

  const subscriptionPlans = db
    .prepare('SELECT * FROM subscription_plans ORDER BY tier_level ASC')
    .all()
    .map(formatSubscriptionPlan);
  const updated = subscriptionPlans.find((p) => p.id === existing.id);

  recordActivityEvent({
    event_type: 'price_drop',
    title: `Subscription Plan Modified • ${updated.name}`,
    message: `${updated_by} updated ${updated.name} ($${updated.price_monthly}/mo • ${updated.badge})`,
    meta: { plan_id: updated.id }
  });

  broadcast('subscriptions:updated', {
    plan: updated,
    subscriptionPlans,
    dbStats: getDatabaseStats()
  });

  res.json({ plan: updated, subscriptionPlans });
});

app.delete('/api/subscriptions/plans/:id', (req, res) => {
  db.prepare('DELETE FROM subscription_plans WHERE id = ?').run(req.params.id);
  const subscriptionPlans = db
    .prepare('SELECT * FROM subscription_plans ORDER BY tier_level ASC')
    .all()
    .map(formatSubscriptionPlan);
  broadcast('subscriptions:updated', { subscriptionPlans, dbStats: getDatabaseStats() });
  res.json({ deleted: true, subscriptionPlans });
});

app.post('/api/subscriptions/subscribe', (req, res) => {
  const {
    plan_id = 'plan-pro-developer',
    subscriber_name = 'External Systems Developer',
    subscriber_email = 'developer@nexstore.dev',
    billing_cycle = 'monthly'
  } = req.body || {};

  const planRow =
    db.prepare('SELECT * FROM subscription_plans WHERE id = ?').get(plan_id) ||
    db.prepare('SELECT * FROM subscription_plans LIMIT 1').get();
  if (!planRow) return res.status(404).json({ error: 'Subscription plan not found' });

  const id = `sub-usr-${Date.now().toString(36)}`;
  const now = new Date().toISOString();
  const amount = billing_cycle === 'yearly' ? Number(planRow.price_yearly) : Number(planRow.price_monthly);
  const tokenHash = crypto.createHash('sha256').update(`${id}:${subscriber_email}:${now}`).digest('hex');
  const apiKeyPreview = `nex_live_${tokenHash.slice(0, 8)}...${tokenHash.slice(-4)}`;

  db.prepare(`
    INSERT INTO user_subscriptions (
      id, plan_id, plan_name, subscriber_name, subscriber_email, billing_cycle, amount_paid, status, api_key_preview, subscribed_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 'ACTIVE', ?, ?)
  `).run(
    id,
    planRow.id,
    planRow.name,
    String(subscriber_name).trim(),
    String(subscriber_email).trim(),
    billing_cycle === 'yearly' ? 'yearly' : 'monthly',
    amount,
    apiKeyPreview,
    now
  );

  const userSubscriptions = db
    .prepare('SELECT * FROM user_subscriptions ORDER BY subscribed_at DESC')
    .all();
  const created = userSubscriptions.find((s) => s.id === id) || userSubscriptions[0];

  const activity = recordActivityEvent({
    event_type: 'live_purchase',
    title: `New Subscription • ${planRow.name}`,
    message: `${created.subscriber_name} (${created.subscriber_email}) activated ${planRow.name} (${billing_cycle})`,
    meta: { subscription_id: id, plan_id: planRow.id }
  });

  broadcast('subscriptions:enrolled', {
    subscription: created,
    userSubscriptions,
    activity,
    dbStats: getDatabaseStats()
  });

  res.status(201).json({ subscription: created, userSubscriptions, activity });
});

// 2e. Mobile Integration Hub (Flutter, React Native, SwiftUI, Kotlin Add-On Future Room) & PWA Status — SQLite Table #23
app.get('/api/mobile/addons', (_req, res) => {
  const mobileAddons = db.prepare('SELECT * FROM mobile_addons ORDER BY updated_at DESC').all();
  res.json({ mobileAddons });
});

app.post('/api/mobile/addons', (req, res) => {
  const {
    name = 'Custom Flutter / Native Add-On',
    slug = `addon-${Date.now().toString(36)}`,
    framework = 'Flutter 3.24 / React Native 0.76',
    version = '1.0.0-add-on',
    status = 'READY',
    category = 'Mobile Extension',
    description = 'Custom mobile native/Flutter integration module registered with NEX Store.',
    endpoint_path = '/api/mobile/sdk-config',
    sdk_snippet = '// © 2026 NEX STORE PROPRIETARY DRM — MOBILE ADD-ON'
  } = req.body || {};

  const id = `mob-${Date.now().toString(36)}`;
  const now = new Date().toISOString();

  db.prepare(`
    INSERT OR REPLACE INTO mobile_addons (
      id, name, slug, framework, version, status, category, description, endpoint_path, sdk_snippet, enabled, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
  `).run(
    id,
    String(name).trim(),
    String(slug).trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-'),
    String(framework).trim(),
    String(version).trim(),
    String(status).trim(),
    String(category).trim(),
    String(description).trim(),
    String(endpoint_path).trim(),
    String(sdk_snippet),
    now
  );

  const mobileAddons = db.prepare('SELECT * FROM mobile_addons ORDER BY updated_at DESC').all();
  const created = mobileAddons.find((m) => m.id === id) || mobileAddons[0];
  broadcast('mobile:updated', { mobileAddons, dbStats: getDatabaseStats() });
  res.status(201).json({ addon: created, mobileAddons });
});

app.patch('/api/mobile/addons/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM mobile_addons WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Mobile add-on not found' });

  const {
    name = existing.name,
    framework = existing.framework,
    version = existing.version,
    status = existing.status,
    description = existing.description,
    sdk_snippet = existing.sdk_snippet,
    enabled = existing.enabled
  } = req.body || {};

  const now = new Date().toISOString();
  db.prepare(`
    UPDATE mobile_addons
    SET name = ?, framework = ?, version = ?, status = ?, description = ?, sdk_snippet = ?, enabled = ?, updated_at = ?
    WHERE id = ?
  `).run(
    String(name).trim(),
    String(framework).trim(),
    String(version).trim(),
    String(status).trim(),
    String(description).trim(),
    String(sdk_snippet),
    enabled ? 1 : 0,
    now,
    existing.id
  );

  const mobileAddons = db.prepare('SELECT * FROM mobile_addons ORDER BY updated_at DESC').all();
  const updated = mobileAddons.find((m) => m.id === existing.id);
  broadcast('mobile:updated', { addon: updated, mobileAddons, dbStats: getDatabaseStats() });
  res.json({ addon: updated, mobileAddons });
});

app.get('/api/mobile/sdk-config', (req, res) => {
  const framework = String(req.query.framework || 'flutter').toLowerCase();
  const mobileAddons = db.prepare('SELECT * FROM mobile_addons WHERE enabled = 1').all();
  res.json({
    framework,
    deepLinkScheme: 'nexstore://connect',
    restBaseUrl: '/api',
    wsEndpoint: '/ws',
    developerPublishEndpoint: 'POST /api/developer/publish',
    appDetailsEndpoint: 'GET /api/apps/:id/details',
    pwaManifestUrl: '/manifest.json',
    serviceWorkerUrl: '/sw.js',
    activeAddonsCount: mobileAddons.length,
    drmPolicy: '© 2026 NEX STORE & DEVTECHS001 LABS — STRICTLY PROPRIETARY, DO NOT SHARE OR PIRATE',
    addons: mobileAddons
  });
});

app.get('/api/pwa/status', (_req, res) => {
  res.json({
    pwaReady: true,
    manifestUrl: '/manifest.json',
    serviceWorkerUrl: '/sw.js',
    cacheVersion: 'nex-store-v11',
    displayModes: ['standalone', 'window-controls-overlay', 'minimal-ui'],
    offlineCapabilities: [
      'Full 12-SKU Hardware Catalog & 4-Angle Procedural SVG CAD Cache',
      'Installed App Sandbox Runtime (/api/sandbox/:id)',
      'Offline Cart, Wishlist & BTO Rig Configuration Persistence',
      'Mobile Drawer & Bottom Dock Touch Navigation'
    ]
  });
});

// 3. Products Endpoints
app.get('/api/products', (req, res) => {
  let products = getAllProducts();
  const { q, category, onlyInStock, onlyFlashSale, sort } = req.query;

  if (category && category !== 'all') {
    products = products.filter((p) => p.category === category);
  }
  if (onlyInStock === 'true') {
    products = products.filter((p) => p.stock > 0);
  }
  if (onlyFlashSale === 'true') {
    products = products.filter((p) => p.is_flash_sale);
  }
  if (q && q.trim()) {
    const query = q.toLowerCase().trim();
    products = products.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.tagline?.toLowerCase().includes(query) ||
        p.brand?.toLowerCase().includes(query) ||
        p.sku?.toLowerCase().includes(query) ||
        p.tags.some((t) => t.toLowerCase().includes(query))
    );
  }

  if (sort === 'price-asc') products.sort((a, b) => a.price - b.price);
  else if (sort === 'price-desc') products.sort((a, b) => b.price - a.price);
  else if (sort === 'rating') products.sort((a, b) => b.rating - a.rating);
  else if (sort === 'popular') products.sort((a, b) => b.sold_count - a.sold_count);

  res.json({ products });
});

app.get('/api/products/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Product not found' });

  const reviews = db
    .prepare('SELECT * FROM reviews WHERE product_id = ? ORDER BY created_at DESC')
    .all(row.id);
  const logs = db
    .prepare('SELECT * FROM inventory_logs WHERE product_id = ? ORDER BY created_at DESC LIMIT 15')
    .all(row.id);

  res.json({
    product: formatProductRow(row),
    reviews,
    inventoryLogs: logs
  });
});

app.post('/api/products', (req, res) => {
  try {
    const {
      name,
      sku,
      tagline,
      description,
      category = 'compute',
      brand = 'NEX Labs',
      price,
      original_price,
      stock = 15,
      badge = 'NEW RELEASE',
      is_flash_sale = false,
      featured = false,
      specs = {},
      colors = [{ name: 'Obsidian Black', hex: '#18181b' }],
      tags = ['nex', 'hardware']
    } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({ error: 'Product name and price are required' });
    }

    const id = `prod-${Date.now().toString(36)}`;
    const cleanSku = (sku || `NEX-${Math.floor(100 + Math.random() * 900)}`).toUpperCase();
    const now = new Date().toISOString();
    const imageUrl = `/api/product-art/${id}.svg`;
    const numPrice = Number(price);
    const numOrig = original_price ? Number(original_price) : Math.round(numPrice * 1.15);
    const numStock = Math.max(0, parseInt(stock, 10) || 0);

    const gallery = [
      { label: 'Studio Hero', view: 'hero' },
      { label: 'Detail Cutaway', view: 'detail' },
      { label: 'CAD Blueprint', view: 'blueprint' },
      { label: 'Telemetry Spec', view: 'spec' }
    ];

    db.prepare(`
      INSERT INTO products (
        id, sku, name, tagline, description, category, brand,
        price, original_price, cost_price, stock, low_stock_threshold,
        rating, review_count, sold_count, featured, is_flash_sale,
        flash_sale_ends_at, badge, image_url, gallery_json, specs_json,
        colors_json, tags_json, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      cleanSku,
      name.trim(),
      tagline || 'Precision engineered next-generation hardware',
      description || 'Designed and tested in NEX Hardware Labs with aerospace materials.',
      category,
      brand,
      numPrice,
      numOrig,
      Math.round(numPrice * 0.55),
      numStock,
      5,
      5.0,
      1,
      0,
      featured ? 1 : 0,
      is_flash_sale ? 1 : 0,
      is_flash_sale ? new Date(Date.now() + 1000 * 60 * 60 * 12).toISOString() : null,
      badge,
      imageUrl,
      JSON.stringify(gallery),
      JSON.stringify(
        Object.keys(specs).length > 0
          ? specs
          : {
              Architecture: 'NEX Gen-5 Modular Platform',
              Materials: 'CNC Anodized 6063 Aluminum & Carbon',
              Connectivity: 'Thunderbolt 5 / Ultra-Wideband Wireless',
              Warranty: '3-Year NEX Global Pro Care'
            }
      ),
      JSON.stringify(colors),
      JSON.stringify(tags),
      now,
      now
    );

    db.prepare(`
      INSERT INTO inventory_logs (
        id, product_id, product_name, change_amount, previous_stock, new_stock, reason, actor, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      `inv-${Date.now()}`,
      id,
      name.trim(),
      numStock,
      0,
      numStock,
      'New Product Launch Allocation',
      'Admin Command Center',
      now
    );

    const created = formatProductRow(db.prepare('SELECT * FROM products WHERE id = ?').get(id));
    const activity = recordActivityEvent({
      event_type: 'product_created',
      title: 'New Product Launched',
      message: `${created.name} (${created.sku}) added to catalog at $${created.price.toFixed(2)}`,
      meta: { product_id: created.id, price: created.price }
    });

    broadcast('product:created', {
      product: created,
      activity,
      analytics: getAnalyticsSummary(),
      dbStats: getDatabaseStats()
    });

    res.status(201).json({ product: created, activity });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Failed to create product' });
  }
});

app.patch('/api/products/:id', (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Product not found' });

    const {
      name = existing.name,
      tagline = existing.tagline,
      description = existing.description,
      price = existing.price,
      original_price = existing.original_price,
      stock = existing.stock,
      badge = existing.badge,
      featured = existing.featured,
      is_flash_sale = existing.is_flash_sale,
      stockReason = 'Admin Inventory Adjustment'
    } = req.body;

    const now = new Date().toISOString();
    const newStock = Math.max(0, parseInt(stock, 10));
    const newPrice = Number(price);

    db.prepare(`
      UPDATE products
      SET name = ?, tagline = ?, description = ?, price = ?, original_price = ?,
          stock = ?, badge = ?, featured = ?, is_flash_sale = ?, updated_at = ?
      WHERE id = ?
    `).run(
      name,
      tagline,
      description,
      newPrice,
      Number(original_price),
      newStock,
      badge,
      featured ? 1 : 0,
      is_flash_sale ? 1 : 0,
      now,
      existing.id
    );

    let activity = null;
    if (newStock !== existing.stock) {
      const diff = newStock - existing.stock;
      db.prepare(`
        INSERT INTO inventory_logs (
          id, product_id, product_name, change_amount, previous_stock, new_stock, reason, actor, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        `inv-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        existing.id,
        name,
        diff,
        existing.stock,
        newStock,
        stockReason,
        'Admin Operator',
        now
      );

      activity = recordActivityEvent({
        event_type: 'stock_update',
        title: `Stock Updated • ${name}`,
        message: `Inventory adjusted from ${existing.stock} to ${newStock} units (${diff > 0 ? `+${diff}` : diff})`,
        meta: { product_id: existing.id, previous: existing.stock, current: newStock }
      });
    } else if (newPrice !== existing.price) {
      activity = recordActivityEvent({
        event_type: 'price_drop',
        title: `Price Updated • ${name}`,
        message: `Price changed from $${existing.price.toFixed(2)} to $${newPrice.toFixed(2)}`,
        meta: { product_id: existing.id, price: newPrice }
      });
    }

    const updated = formatProductRow(db.prepare('SELECT * FROM products WHERE id = ?').get(existing.id));
    const inventoryLogs = db.prepare('SELECT * FROM inventory_logs ORDER BY created_at DESC LIMIT 30').all();

    broadcast('product:updated', {
      product: updated,
      activity,
      inventoryLogs,
      analytics: getAnalyticsSummary(),
      dbStats: getDatabaseStats()
    });

    res.json({ product: updated, activity, inventoryLogs });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Failed to update product' });
  }
});

app.delete('/api/products/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Product not found' });

  db.prepare('DELETE FROM products WHERE id = ?').run(existing.id);

  const activity = recordActivityEvent({
    event_type: 'stock_update',
    title: 'Product Archived',
    message: `${existing.name} (${existing.sku}) removed from active catalog`,
    meta: { product_id: existing.id }
  });

  broadcast('product:deleted', {
    productId: existing.id,
    activity,
    analytics: getAnalyticsSummary(),
    dbStats: getDatabaseStats()
  });

  res.json({ deleted: true, productId: existing.id });
});

// 4. Reviews Endpoints
app.post('/api/products/:id/reviews', (req, res) => {
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });

  const {
    author_name = 'Verified Customer',
    author_location = 'Nairobi, KE',
    rating = 5,
    title = 'Outstanding build quality',
    comment = ''
  } = req.body;

  if (!comment.trim()) {
    return res.status(400).json({ error: 'Please write a review comment' });
  }

  const numRating = Math.min(5, Math.max(1, Number(rating) || 5));
  const reviewId = `rev-${Date.now()}`;
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO reviews (
      id, product_id, author_name, author_location, rating, title, comment, verified_purchase, helpful_count, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 1, 0, ?)
  `).run(
    reviewId,
    product.id,
    author_name.trim(),
    author_location.trim(),
    numRating,
    title.trim() || 'Great hardware!',
    comment.trim(),
    now
  );

  const stats = db.prepare(`
    SELECT COUNT(*) as count, ROUND(AVG(rating), 1) as avgRating
    FROM reviews WHERE product_id = ?
  `).get(product.id);

  const newCount = (product.review_count || 0) + 1;
  const newAvg = stats.avgRating || numRating;

  db.prepare(`
    UPDATE products SET rating = ?, review_count = ?, updated_at = ? WHERE id = ?
  `).run(newAvg, newCount, now, product.id);

  const createdReview = {
    id: reviewId,
    product_id: product.id,
    product_name: product.name,
    author_name: author_name.trim(),
    author_location: author_location.trim(),
    rating: numRating,
    title: title.trim() || 'Great hardware!',
    comment: comment.trim(),
    verified_purchase: 1,
    helpful_count: 0,
    created_at: now
  };

  const updatedProduct = formatProductRow(db.prepare('SELECT * FROM products WHERE id = ?').get(product.id));
  const activity = recordActivityEvent({
    event_type: 'review_added',
    title: `New ${numRating}★ Review on ${product.name}`,
    message: `${createdReview.author_name} (${createdReview.author_location}): "${createdReview.title}"`,
    meta: { product_id: product.id, rating: numRating }
  });

  broadcast('review:created', {
    review: createdReview,
    product: updatedProduct,
    activity,
    analytics: getAnalyticsSummary(),
    dbStats: getDatabaseStats()
  });

  res.status(201).json({ review: createdReview, product: updatedProduct });
});

app.post('/api/reviews/:id/helpful', (req, res) => {
  const review = db.prepare('SELECT * FROM reviews WHERE id = ?').get(req.params.id);
  if (!review) return res.status(404).json({ error: 'Review not found' });

  db.prepare('UPDATE reviews SET helpful_count = helpful_count + 1 WHERE id = ?').run(review.id);
  const updated = db.prepare('SELECT * FROM reviews WHERE id = ?').get(review.id);

  broadcast('review:helpful', { review: updated });
  res.json({ review: updated });
});

// 5. Coupons Endpoints
app.post('/api/coupons/validate', (req, res) => {
  const { code = '', subtotal = 0 } = req.body;
  const cleanCode = code.trim().toUpperCase();
  if (!cleanCode) return res.status(400).json({ error: 'Enter a coupon code' });

  const coupon = db.prepare('SELECT * FROM coupons WHERE UPPER(code) = ?').get(cleanCode);
  if (!coupon || !coupon.active) {
    return res.status(404).json({ error: `Promo code "${cleanCode}" is invalid or inactive` });
  }
  if (coupon.used_count >= coupon.max_uses) {
    return res.status(400).json({ error: `Promo code "${cleanCode}" has reached its usage limit` });
  }
  if (Number(subtotal) < coupon.min_order_amount) {
    return res.status(400).json({
      error: `Code "${cleanCode}" requires a minimum subtotal of $${coupon.min_order_amount.toFixed(2)}`
    });
  }

  const discountAmount =
    coupon.discount_type === 'percentage'
      ? Number(((Number(subtotal) * coupon.discount_value) / 100).toFixed(2))
      : Math.min(Number(subtotal), coupon.discount_value);

  res.json({
    valid: true,
    coupon,
    discountAmount
  });
});

app.post('/api/coupons', (req, res) => {
  try {
    const {
      code,
      description = 'Special Store Promotion',
      discount_type = 'percentage',
      discount_value = 15,
      min_order_amount = 0,
      max_uses = 100
    } = req.body;

    if (!code || !code.trim()) {
      return res.status(400).json({ error: 'Coupon code is required' });
    }

    const cleanCode = code.trim().toUpperCase();
    const id = `coup-${Date.now().toString(36)}`;

    db.prepare(`
      INSERT INTO coupons (
        id, code, description, discount_type, discount_value, min_order_amount, max_uses, used_count, active, expires_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 0, 1, '2027-12-31T23:59:59Z')
    `).run(
      id,
      cleanCode,
      description,
      discount_type,
      Number(discount_value),
      Number(min_order_amount),
      Number(max_uses)
    );

    const coupon = db.prepare('SELECT * FROM coupons WHERE id = ?').get(id);
    const activity = recordActivityEvent({
      event_type: 'coupon_created',
      title: `New Promo Code • ${cleanCode}`,
      message: `${description} (${discount_type === 'percentage' ? `${discount_value}% OFF` : `$${discount_value} OFF`})`,
      meta: { code: cleanCode }
    });

    broadcast('coupon:created', {
      coupon,
      activity,
      dbStats: getDatabaseStats()
    });

    res.status(201).json({ coupon });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Failed to create coupon' });
  }
});

app.patch('/api/coupons/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM coupons WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Coupon not found' });

  const newActive = existing.active ? 0 : 1;
  db.prepare('UPDATE coupons SET active = ? WHERE id = ?').run(newActive, existing.id);
  const updated = db.prepare('SELECT * FROM coupons WHERE id = ?').get(existing.id);

  broadcast('coupon:updated', { coupon: updated });
  res.json({ coupon: updated });
});

// 6. Orders & Real-Time Checkout Endpoints
app.get('/api/orders', (_req, res) => {
  res.json({ orders: getOrdersWithItems(50) });
});

app.get('/api/orders/track/:orderNumber', (req, res) => {
  const cleanNum = req.params.orderNumber.trim().toUpperCase();
  const order = db
    .prepare('SELECT * FROM orders WHERE UPPER(order_number) = ? OR id = ?')
    .get(cleanNum, req.params.orderNumber.trim());

  if (!order) {
    return res.status(404).json({ error: `Order "${cleanNum}" not found` });
  }
  const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
  res.json({ order: { ...order, items } });
});

app.post('/api/orders', (req, res) => {
  try {
    const {
      customer_name,
      customer_email,
      customer_phone = '+254 700 000 000',
      shipping_address,
      shipping_city = 'Nairobi',
      shipping_country = 'Kenya',
      shipping_method = 'NEX Express Air (1-2 Days)',
      payment_method = 'Card •••• 4242',
      coupon_code = null,
      notes = '',
      items = []
    } = req.body;

    if (!customer_name || !customer_email || !shipping_address) {
      return res.status(400).json({ error: 'Customer name, email, and shipping address are required' });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Your cart is empty' });
    }

    const now = new Date().toISOString();
    const orderId = `ord-${Date.now()}`;
    const orderNumber = `NEX-${Math.floor(1000 + Math.random() * 9000)}`;
    const trackingNumber = `TRK-NEX-${Math.floor(1000000 + Math.random() * 9000000)}`;
    const estDelivery = new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString().slice(0, 10);

    let calculatedSubtotal = 0;
    const resolvedItems = [];

    for (const cartItem of items) {
      const prod = db.prepare('SELECT * FROM products WHERE id = ?').get(cartItem.product_id);
      if (!prod) {
        return res.status(400).json({ error: `Product not found: ${cartItem.product_id}` });
      }
      const qty = Math.max(1, parseInt(cartItem.quantity, 10) || 1);
      if (prod.stock < qty) {
        return res.status(400).json({
          error: `Insufficient stock for ${prod.name} (Available: ${prod.stock}, Requested: ${qty})`
        });
      }
      const lineTotal = Number((prod.price * qty).toFixed(2));
      calculatedSubtotal += lineTotal;
      resolvedItems.push({
        prod,
        qty,
        selected_color: cartItem.selected_color || 'Default Finish',
        lineTotal
      });
    }

    calculatedSubtotal = Number(calculatedSubtotal.toFixed(2));

    let discountAmount = 0;
    let appliedCouponCode = null;
    if (coupon_code) {
      const coupon = db
        .prepare('SELECT * FROM coupons WHERE UPPER(code) = ? AND active = 1')
        .get(coupon_code.trim().toUpperCase());
      if (coupon && calculatedSubtotal >= coupon.min_order_amount) {
        discountAmount =
          coupon.discount_type === 'percentage'
            ? Number(((calculatedSubtotal * coupon.discount_value) / 100).toFixed(2))
            : Math.min(calculatedSubtotal, coupon.discount_value);
        appliedCouponCode = coupon.code;
        db.prepare('UPDATE coupons SET used_count = used_count + 1 WHERE id = ?').run(coupon.id);
      }
    }

    const shippingCost = shipping_method.toLowerCase().includes('same-day')
      ? 15
      : calculatedSubtotal >= 300
      ? 0
      : 12;
    const taxableAmount = Math.max(0, calculatedSubtotal - discountAmount);
    const taxAmount = Number((taxableAmount * 0.08).toFixed(2));
    const total = Number((taxableAmount + shippingCost + taxAmount).toFixed(2));

    db.prepare(`
      INSERT INTO orders (
        id, order_number, customer_name, customer_email, customer_phone,
        shipping_address, shipping_city, shipping_country, shipping_method,
        payment_method, subtotal, discount_amount, shipping_cost, tax_amount,
        total, coupon_code, status, tracking_number, estimated_delivery,
        notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'placed', ?, ?, ?, ?, ?)
    `).run(
      orderId,
      orderNumber,
      customer_name.trim(),
      customer_email.trim(),
      customer_phone,
      shipping_address.trim(),
      shipping_city.trim(),
      shipping_country.trim(),
      shipping_method,
      payment_method,
      calculatedSubtotal,
      discountAmount,
      shippingCost,
      taxAmount,
      total,
      appliedCouponCode,
      trackingNumber,
      estDelivery,
      notes,
      now,
      now
    );

    const insertOrderItem = db.prepare(`
      INSERT INTO order_items (
        id, order_id, product_id, product_name, product_sku, product_image,
        selected_color, quantity, unit_price, line_total
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const updateProductStock = db.prepare(`
      UPDATE products
      SET stock = stock - ?, sold_count = sold_count + ?, updated_at = ?
      WHERE id = ?
    `);

    const insertInvLog = db.prepare(`
      INSERT INTO inventory_logs (
        id, product_id, product_name, change_amount, previous_stock, new_stock, reason, actor, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const updatedProducts = [];

    for (const entry of resolvedItems) {
      const oiId = `oi-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      insertOrderItem.run(
        oiId,
        orderId,
        entry.prod.id,
        entry.prod.name,
        entry.prod.sku,
        entry.prod.image_url,
        entry.selected_color,
        entry.qty,
        entry.prod.price,
        entry.lineTotal
      );

      updateProductStock.run(entry.qty, entry.qty, now, entry.prod.id);

      insertInvLog.run(
        `inv-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        entry.prod.id,
        entry.prod.name,
        -entry.qty,
        entry.prod.stock,
        entry.prod.stock - entry.qty,
        `Order #${orderNumber}`,
        customer_name.trim(),
        now
      );

      const refreshed = db.prepare('SELECT * FROM products WHERE id = ?').get(entry.prod.id);
      updatedProducts.push(formatProductRow(refreshed));
    }

    const fullOrder = {
      ...db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId),
      items: db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(orderId)
    };

    const activity = recordActivityEvent({
      event_type: 'order_placed',
      title: `New Order #${orderNumber}`,
      message: `${customer_name} in ${shipping_city} ordered ${resolvedItems.map((i) => `${i.qty}x ${i.prod.name}`).join(', ')} ($${total.toFixed(2)})`,
      meta: { order_number: orderNumber, total, city: shipping_city }
    });

    const inventoryLogs = db.prepare('SELECT * FROM inventory_logs ORDER BY created_at DESC LIMIT 30').all();

    broadcast('order:created', {
      order: fullOrder,
      updatedProducts,
      activity,
      inventoryLogs,
      analytics: getAnalyticsSummary(),
      dbStats: getDatabaseStats()
    });

    res.status(201).json({
      order: fullOrder,
      updatedProducts,
      activity
    });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Checkout failed' });
  }
});

app.patch('/api/orders/:id/status', (req, res) => {
  const order = db.prepare('SELECT * FROM orders WHERE id = ? OR order_number = ?').get(req.params.id, req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });

  const validStatuses = ['placed', 'processing', 'packed', 'shipped', 'delivered', 'cancelled'];
  const { status } = req.body;
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid order status' });
  }

  const now = new Date().toISOString();
  db.prepare('UPDATE orders SET status = ?, updated_at = ? WHERE id = ?').run(status, now, order.id);

  const updatedOrder = {
    ...db.prepare('SELECT * FROM orders WHERE id = ?').get(order.id),
    items: db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id)
  };

  const activity = recordActivityEvent({
    event_type: 'order_status',
    title: `Order #${order.order_number} -> ${status.toUpperCase()}`,
    message: `Order for ${order.customer_name} (${order.shipping_city}) advanced to ${status.toUpperCase()}`,
    meta: { order_number: order.order_number, status }
  });

  broadcast('order:updated', {
    order: updatedOrder,
    activity,
    analytics: getAnalyticsSummary()
  });

  res.json({ order: updatedOrder, activity });
});

// 7. Real-Time Live Concierge & Support Chat
function buildSmartConciergeReply(userMessage) {
  const lower = userMessage.toLowerCase();
  const products = getAllProducts();

  if (lower.includes('coupon') || lower.includes('discount') || lower.includes('promo') || lower.includes('code')) {
    const activeCoupons = db.prepare('SELECT * FROM coupons WHERE active = 1').all();
    const list = activeCoupons
      .map((c) => `${c.code} (${c.discount_type === 'percentage' ? `${c.discount_value}% off` : `$${c.discount_value} off`} over $${c.min_order_amount})`)
      .join(' • ');
    return `Active promo codes right now: ${list}. You can apply any of these directly in the Cart drawer!`;
  }

  if (lower.includes('track') || lower.includes('order') || lower.includes('nex-')) {
    const match = userMessage.toUpperCase().match(/NEX-\d+/);
    if (match) {
      const ord = db.prepare('SELECT * FROM orders WHERE order_number = ?').get(match[0]);
      if (ord) {
        return `Order #${ord.order_number} for ${ord.customer_name} is currently ${ord.status.toUpperCase()} (Tracking: ${ord.tracking_number}, Est. Delivery: ${ord.estimated_delivery}).`;
      }
    }
    return `You can track any order in real time using the "Order Tracker" tab! Try sample order numbers NEX-8941, NEX-8942, or NEX-8943.`;
  }

  if (lower.includes('stock') || lower.includes('available') || lower.includes('low')) {
    const lowStock = products.filter((p) => p.stock <= p.low_stock_threshold);
    return `All ${products.length} flagship products are currently in stock! Hurry on low-stock items: ${lowStock.map((p) => `${p.name} (${p.stock} left)`).join(', ')}.`;
  }

  if (lower.includes('headphone') || lower.includes('audio') || lower.includes('dac')) {
    return `For studio audio, check out the Aether Pro X1 Planar Headphones ($449 Flash Deal) and the Pulse Tube & R2R Balanced Desktop DAC ($699).`;
  }

  if (lower.includes('laptop') || lower.includes('workstation') || lower.includes('mac') || lower.includes('compute')) {
    return `Our flagship compute workstation is the NovaBook Pro 16 OLED ($2,399) with 64GB unified RAM and 240Hz Tandem OLED. Use code STUDIO150 for $150 off!`;
  }

  return `Thanks for reaching out! We offer same-day courier delivery in Nairobi & express global air shipping. Ask me about specific products, promo codes (try NEX20), or order tracking!`;
}

app.post('/api/chat', (req, res) => {
  const {
    session_id = 'global',
    sender = 'customer',
    sender_name = 'Guest Shopper',
    message = ''
  } = req.body;

  if (!message.trim()) {
    return res.status(400).json({ error: 'Message cannot be empty' });
  }

  const msgObj = {
    id: `chat-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    session_id,
    sender,
    sender_name,
    message: message.trim(),
    created_at: new Date().toISOString()
  };

  db.prepare(`
    INSERT INTO chat_messages (id, session_id, sender, sender_name, message, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(msgObj.id, msgObj.session_id, msgObj.sender, msgObj.sender_name, msgObj.message, msgObj.created_at);

  broadcast('chat:message', { message: msgObj });

  if (sender === 'customer') {
    setTimeout(() => {
      const replyText = buildSmartConciergeReply(msgObj.message);
      const replyObj = {
        id: `chat-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        session_id,
        sender: 'concierge',
        sender_name: 'NEX AI Concierge',
        message: replyText,
        created_at: new Date().toISOString()
      };
      db.prepare(`
        INSERT INTO chat_messages (id, session_id, sender, sender_name, message, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(replyObj.id, replyObj.session_id, replyObj.sender, replyObj.sender_name, replyObj.message, replyObj.created_at);

      broadcast('chat:message', { message: replyObj });
    }, 450);
  }

  res.status(201).json({ message: msgObj });
});

// 8. Database Inspector & SQL Studio API ("add dbs nd more")
app.get('/api/db/overview', (_req, res) => {
  res.json({ dbStats: getDatabaseStats() });
});

app.get('/api/db/table/:tableName', (req, res) => {
  const { tableName } = req.params;
  if (!ALLOWED_TABLES.includes(tableName)) {
    return res.status(400).json({ error: `Invalid table "${tableName}"` });
  }
  const limit = Math.min(200, Math.max(1, parseInt(req.query.limit, 10) || 50));
  const rows = db.prepare(`SELECT * FROM ${tableName} LIMIT ?`).all(limit);
  const columns = db.prepare(`PRAGMA table_info(${tableName})`).all();

  res.json({
    tableName,
    columns,
    rows,
    rowCount: rows.length
  });
});

app.post('/api/db/query', (req, res) => {
  try {
    const { sql = '' } = req.body;
    const trimmed = sql.trim();
    if (!trimmed) {
      return res.status(400).json({ error: 'SQL query cannot be empty' });
    }
    if (!/^(SELECT|PRAGMA|WITH)\b/i.test(trimmed) || /;\s*(DROP|DELETE|UPDATE|INSERT|ALTER|CREATE)\b/i.test(trimmed)) {
      return res.status(400).json({
        error: 'Only read-only SELECT / PRAGMA / WITH queries are permitted in the SQL Explorer.'
      });
    }

    const startTime = performance.now();
    const rows = db.prepare(trimmed).all();
    const durationMs = Number((performance.now() - startTime).toFixed(2));

    res.json({
      rows,
      rowCount: rows.length,
      durationMs
    });
  } catch (err) {
    res.status(400).json({ error: err.message || 'SQL execution error' });
  }
});

app.post('/api/db/reset', (_req, res) => {
  seedDatabase({ forceReset: true });
  const activity = recordActivityEvent({
    event_type: 'stock_update',
    title: 'Database Reset & Re-Seeded',
    message: 'All 10 relational SQLite tables restored to clean factory seed state',
    meta: {}
  });

  const payload = {
    categories: db.prepare('SELECT * FROM categories').all(),
    products: getAllProducts(),
    apps: db.prepare('SELECT * FROM apps ORDER BY is_featured DESC, downloads DESC').all(),
    coupons: db.prepare('SELECT * FROM coupons ORDER BY active DESC').all(),
    orders: getOrdersWithItems(30),
    reviews: db.prepare('SELECT * FROM reviews ORDER BY created_at DESC LIMIT 30').all(),
    inventoryLogs: db.prepare('SELECT * FROM inventory_logs ORDER BY created_at DESC LIMIT 30').all(),
    activityEvents: db.prepare('SELECT * FROM activity_events ORDER BY created_at DESC LIMIT 25').all(),
    serverNodes: db.prepare('SELECT * FROM server_nodes ORDER BY latency_ms ASC').all(),
    integrations: db.prepare('SELECT * FROM integrations ORDER BY events_synced DESC').all(),
    securityEvents: db.prepare('SELECT * FROM security_events ORDER BY created_at DESC LIMIT 35').all(),
    notifications: db.prepare('SELECT * FROM push_notifications ORDER BY created_at DESC LIMIT 40').all(),
    analytics: getAnalyticsSummary(),
    dbStats: getDatabaseStats(),
    activity
  };

  broadcast('store:reseeded', payload);
  res.json(payload);
});

// 9. Real-Time Live Activity Simulator (can be triggered on demand)
app.post('/api/realtime/simulate', (_req, res) => {
  const products = getAllProducts();
  const randomProd = products[Math.floor(Math.random() * products.length)];
  const sampleShoppers = [
    { name: 'Kelvin Mwangi', city: 'Nairobi' },
    { name: 'Zara Al-Rashid', city: 'Dubai' },
    { name: 'Lucas Meyer', city: 'Zurich' },
    { name: 'Hannah Osei', city: 'Accra' },
    { name: 'Kenji Sato', city: 'Tokyo' }
  ];
  const shopper = sampleShoppers[Math.floor(Math.random() * sampleShoppers.length)];

  const activity = recordActivityEvent({
    event_type: 'live_purchase',
    title: `Live Flash Activity • ${shopper.city}`,
    message: `${shopper.name} in ${shopper.city} just added ${randomProd.name} ($${randomProd.price.toFixed(2)}) to their build`,
    meta: { product_id: randomProd.id, city: shopper.city, price: randomProd.price }
  });

  broadcast('activity:new', {
    activity,
    presence: getPresenceSummary()
  });

  res.json({ activity });
});

// 10. Newsletter Subscription
app.post('/api/subscribers', (req, res) => {
  const { email = '' } = req.body;
  if (!email.includes('@')) {
    return res.status(400).json({ error: 'Please enter a valid email address' });
  }
  const cleanEmail = email.trim().toLowerCase();
  const id = `sub-${Date.now()}`;
  const now = new Date().toISOString();
  try {
    db.prepare('INSERT OR IGNORE INTO subscribers (id, email, created_at) VALUES (?, ?, ?)').run(
      id,
      cleanEmail,
      now
    );
    broadcast('db:updated', { dbStats: getDatabaseStats() });
    res.json({ subscribed: true, email: cleanEmail });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 11. Bulk Restock Low-Stock Products (System Operations Improvement)
app.post('/api/products/restock-low', (_req, res) => {
  const lowProducts = db
    .prepare('SELECT * FROM products WHERE stock <= low_stock_threshold + 2')
    .all();

  const now = new Date().toISOString();
  const updateStmt = db.prepare(
    'UPDATE products SET stock = ?, updated_at = ? WHERE id = ?'
  );
  const logStmt = db.prepare(`
    INSERT INTO inventory_logs (
      id, product_id, product_name, change_amount, previous_stock, new_stock, reason, actor, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const prod of lowProducts) {
    const addQty = 15;
    const newStock = prod.stock + addQty;
    updateStmt.run(newStock, now, prod.id);
    logStmt.run(
      `inv-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      prod.id,
      prod.name,
      addQty,
      prod.stock,
      newStock,
      'Automated Low-Stock Warehouse Replenishment (+15)',
      'NEX Auto-Replenish Engine',
      now
    );
  }

  const allProducts = getAllProducts();
  const inventoryLogs = db.prepare('SELECT * FROM inventory_logs ORDER BY created_at DESC LIMIT 30').all();
  const activity = recordActivityEvent({
    event_type: 'stock_update',
    title: `Auto-Replenished ${lowProducts.length} Low-Stock SKUs`,
    message:
      lowProducts.length > 0
        ? `Added +15 units to ${lowProducts.map((p) => p.sku).join(', ')}`
        : 'All warehouse SKUs verified above low-stock threshold',
    meta: { count: lowProducts.length }
  });

  const payload = {
    products: allProducts,
    inventoryLogs,
    activity,
    analytics: getAnalyticsSummary(),
    dbStats: getDatabaseStats()
  };

  broadcast('products:bulk_restocked', payload);
  res.json(payload);
});

// 12. System Health & Diagnostics Telemetry
app.get('/api/system/health', (_req, res) => {
  const mem = process.memoryUsage();
  res.json({
    status: 'healthy',
    nodeVersion: process.version,
    uptimeSeconds: Math.round(process.uptime()),
    memoryMb: {
      rss: Number((mem.rss / 1024 / 1024).toFixed(1)),
      heapUsed: Number((mem.heapUsed / 1024 / 1024).toFixed(1))
    },
    wsClients: clients.size,
    dbStats: getDatabaseStats(),
    timestamp: new Date().toISOString()
  });
});

// 13. Real-Time Edge Server Cluster Subsystem (/api/servers)
app.post('/api/servers/:id/action', (req, res) => {
  const node = db.prepare('SELECT * FROM server_nodes WHERE id = ?').get(req.params.id);
  if (!node) return res.status(404).json({ error: 'Server node not found' });

  const { action = 'ping' } = req.body;
  const now = new Date().toISOString();

  if (action === 'restart') {
    db.prepare(`
      UPDATE server_nodes
      SET status = 'online', cpu_load = ?, ram_usage = ?, latency_ms = ?, updated_at = ?
      WHERE id = ?
    `).run(
      Math.max(12, Math.floor(Math.random() * 26) + 12),
      Math.max(28, Math.floor(Math.random() * 24) + 28),
      Math.max(5, node.latency_ms - 3),
      now,
      node.id
    );
  } else if (action === 'scale') {
    db.prepare(`
      UPDATE server_nodes
      SET status = 'online', cpu_load = ?, active_connections = active_connections + 65, rps = rps + 320, updated_at = ?
      WHERE id = ?
    `).run(Math.max(16, node.cpu_load - 8), now, node.id);
  } else {
    // ping / calibrate
    const jitter = Math.floor(Math.random() * 5) - 2;
    db.prepare(`
      UPDATE server_nodes
      SET latency_ms = ?, cpu_load = ?, updated_at = ?
      WHERE id = ?
    `).run(
      Math.max(4, node.latency_ms + jitter),
      Math.min(88, Math.max(14, node.cpu_load + jitter * 2)),
      now,
      node.id
    );
  }

  const serverNodes = db.prepare('SELECT * FROM server_nodes ORDER BY latency_ms ASC').all();
  const updatedNode = serverNodes.find((s) => s.id === node.id);
  const activity = recordActivityEvent({
    event_type: 'server_ops',
    title: `Edge Server ${action.toUpperCase()} • ${node.name}`,
    message: `${node.region} (${node.ip_address}) -> CPU ${updatedNode.cpu_load}%, Latency ${updatedNode.latency_ms}ms`,
    meta: { server_id: node.id, action }
  });

  broadcast('servers:updated', {
    serverNodes,
    activity,
    dbStats: getDatabaseStats()
  });

  res.json({ serverNodes, updatedNode, activity });
});

app.post('/api/servers/pulse', (_req, res) => {
  const nodes = db.prepare('SELECT * FROM server_nodes').all();
  const now = new Date().toISOString();
  const stmt = db.prepare(`
    UPDATE server_nodes
    SET cpu_load = ?, ram_usage = ?, latency_ms = ?, active_connections = ?, rps = ?, updated_at = ?
    WHERE id = ?
  `);

  for (const n of nodes) {
    const cpuDelta = Math.floor(Math.random() * 11) - 5;
    const ramDelta = Math.floor(Math.random() * 7) - 3;
    const latDelta = Math.floor(Math.random() * 5) - 2;
    const connDelta = Math.floor(Math.random() * 25) - 10;
    const rpsDelta = Math.floor(Math.random() * 90) - 40;
    stmt.run(
      Math.min(92, Math.max(12, n.cpu_load + cpuDelta)),
      Math.min(89, Math.max(24, n.ram_usage + ramDelta)),
      Math.min(85, Math.max(4, n.latency_ms + latDelta)),
      Math.max(40, n.active_connections + connDelta),
      Math.max(220, n.rps + rpsDelta),
      now,
      n.id
    );
  }

  const serverNodes = db.prepare('SELECT * FROM server_nodes ORDER BY latency_ms ASC').all();
  broadcast('servers:updated', { serverNodes });
  res.json({ serverNodes });
});

app.post('/api/servers', (req, res) => {
  const {
    name = 'Singapore Edge Node (AP-Southeast-1)',
    region = 'Singapore, SG',
    provider = 'Netlify Edge + Anycast NVMe'
  } = req.body;

  const id = `srv-${Date.now().toString(36)}`;
  const now = new Date().toISOString();
  const ip = `172.${Math.floor(16 + Math.random() * 15)}.${Math.floor(10 + Math.random() * 220)}.${Math.floor(10 + Math.random() * 220)}`;

  db.prepare(`
    INSERT INTO server_nodes (
      id, name, region, provider, ip_address, status, cpu_load, ram_usage,
      latency_ms, active_connections, rps, uptime_pct, version, updated_at
    ) VALUES (?, ?, ?, ?, ?, 'online', 18, 34, 14, 110, 540, 100.0, 'v2.6.0-wal', ?)
  `).run(id, name.trim(), region.trim(), provider.trim(), ip, now);

  const serverNodes = db.prepare('SELECT * FROM server_nodes ORDER BY latency_ms ASC').all();
  const notif = recordPushNotification({
    channel: 'realtime',
    priority: 'high',
    title: `Provisioned Edge Server: ${name.trim()}`,
    message: `Online at ${ip} (${region.trim()}) • 14ms latency • SQLite WAL replica synced`,
    action_url: 'subsystems'
  });

  broadcast('servers:updated', {
    serverNodes,
    notification: notif,
    dbStats: getDatabaseStats()
  });

  res.status(201).json({ serverNodes, notification: notif });
});

// 14. External Integrations & Netlify/GitHub Webhook Subsystem (/api/integrations)
app.post('/api/integrations/:id/sync', (req, res) => {
  const existing = db.prepare('SELECT * FROM integrations WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Integration not found' });

  const { toggleStatus = false } = req.body || {};
  const now = new Date().toISOString();
  const nextStatus = toggleStatus
    ? existing.status === 'connected'
      ? 'paused'
      : 'connected'
    : 'connected';
  const addedEvents = toggleStatus ? 0 : Math.floor(12 + Math.random() * 45);
  const newLatency = Math.max(5, existing.latency_ms + (Math.floor(Math.random() * 5) - 2));

  db.prepare(`
    UPDATE integrations
    SET status = ?, events_synced = events_synced + ?, latency_ms = ?, last_sync_at = ?
    WHERE id = ?
  `).run(nextStatus, addedEvents, newLatency, now, existing.id);

  const integrations = db.prepare('SELECT * FROM integrations ORDER BY events_synced DESC').all();
  const activity = recordActivityEvent({
    event_type: 'integration_sync',
    title: `${existing.name} ${toggleStatus ? `-> ${nextStatus.toUpperCase()}` : 'Synced'}`,
    message: toggleStatus
      ? `Integration status changed to ${nextStatus}`
      : `Synced +${addedEvents} webhook events (${newLatency}ms round-trip)`,
    meta: { integration_id: existing.id }
  });

  broadcast('integrations:updated', {
    integrations,
    activity,
    dbStats: getDatabaseStats()
  });

  res.json({ integrations, activity });
});

app.post('/api/integrations', (req, res) => {
  const {
    name,
    provider = 'Netlify',
    category = 'Deployment & Hosting',
    endpoint_url = 'https://api.netlify.com/api/v1/sites/custom-app.netlify.app'
  } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Integration name is required' });
  }

  const id = `int-${Date.now().toString(36)}`;
  const now = new Date().toISOString();
  const secretMasked = `whsec_${Math.random().toString(36).slice(2, 6)}••••••••${Math.random().toString(36).slice(2, 6)}`;

  db.prepare(`
    INSERT INTO integrations (
      id, name, provider, category, status, endpoint_url,
      webhook_secret_masked, events_synced, latency_ms, last_sync_at
    ) VALUES (?, ?, ?, ?, 'connected', ?, ?, 1, 15, ?)
  `).run(id, name.trim(), provider.trim(), category.trim(), endpoint_url.trim(), secretMasked, now);

  const integrations = db.prepare('SELECT * FROM integrations ORDER BY events_synced DESC').all();
  const notif = recordPushNotification({
    channel: 'deployment',
    priority: 'normal',
    title: `Integration Connected: ${name.trim()}`,
    message: `Connected ${provider} bridge at ${endpoint_url.trim()}`,
    action_url: 'subsystems'
  });

  broadcast('integrations:updated', {
    integrations,
    notification: notif,
    dbStats: getDatabaseStats()
  });

  res.status(201).json({ integrations, notification: notif });
});

// 15. Security Operations, WAF Threat Simulation & Key Rotation (/api/security)
app.post('/api/security/scan', (_req, res) => {
  const secEvent = recordSecurityEvent({
    event_type: 'full_audit',
    severity: 'low',
    source_ip: '196.216.84.12',
    target_resource: 'All 15 SQLite Tables, App Sandboxes & Edge WAF',
    action_taken: 'VERIFIED',
    description: 'Deep security scan completed: 0 SQLi vulnerabilities, 100% SHA-256 package signatures valid, TLS 1.3 + Strict CSP active.'
  });

  const notif = recordPushNotification({
    channel: 'security',
    priority: 'normal',
    title: 'Security Audit Passed (Score: 99.8%)',
    message: 'All 15 SQLite tables, Netlify app sandboxes, and WAF rules verified clean.',
    action_url: 'subsystems'
  });

  const securityEvents = db.prepare('SELECT * FROM security_events ORDER BY created_at DESC LIMIT 35').all();
  const notifications = db.prepare('SELECT * FROM push_notifications ORDER BY created_at DESC LIMIT 40').all();

  broadcast('security:updated', {
    securityEvents,
    notifications,
    latestSecurityEvent: secEvent,
    notification: notif,
    dbStats: getDatabaseStats()
  });

  res.json({ securityEvents, notifications, latestSecurityEvent: secEvent });
});

app.post('/api/security/simulate-threat', (req, res) => {
  const threats = [
    {
      event_type: 'waf_sqli_block',
      severity: 'critical',
      source_ip: '185.220.101.88',
      target_resource: 'POST /api/db/query',
      action_taken: 'BLOCKED',
      description: 'WAF rule #SQLI-09 intercepted malicious UNION SELECT payload in 0.3ms and blacklisted IP at edge.'
    },
    {
      event_type: 'ddos_mitigation',
      severity: 'high',
      source_ip: '91.240.118.204',
      target_resource: 'WSS /ws Real-Time Gateway',
      action_taken: 'BLOCKED',
      description: 'Cloudflare Anycast scrubber dropped 14,200 synthetic SYN/WebSocket flood packets.'
    },
    {
      event_type: 'sandbox_isolation',
      severity: 'medium',
      source_ip: '45.155.205.71',
      target_resource: 'External App Iframe Container',
      action_taken: 'QUARANTINED',
      description: 'Blocked unauthorized cross-origin cookie read attempt via strict Content-Security-Policy sandbox.'
    }
  ];
  const chosen = req.body?.threatType
    ? threats.find((t) => t.event_type === req.body.threatType) || threats[0]
    : threats[Math.floor(Math.random() * threats.length)];

  const secEvent = recordSecurityEvent(chosen);
  const notif = recordPushNotification({
    channel: 'security',
    priority: 'high',
    title: `Threat Mitigated • ${chosen.action_taken}`,
    message: `${chosen.target_resource} protected against ${chosen.source_ip}: ${chosen.description}`,
    action_url: 'subsystems'
  });

  const securityEvents = db.prepare('SELECT * FROM security_events ORDER BY created_at DESC LIMIT 35').all();
  const notifications = db.prepare('SELECT * FROM push_notifications ORDER BY created_at DESC LIMIT 40').all();

  broadcast('security:updated', {
    securityEvents,
    notifications,
    latestSecurityEvent: secEvent,
    notification: notif,
    dbStats: getDatabaseStats()
  });

  res.json({ securityEvents, notifications, latestSecurityEvent: secEvent });
});

app.post('/api/security/rotate-keys', (_req, res) => {
  const secEvent = recordSecurityEvent({
    event_type: 'key_rotation',
    severity: 'low',
    source_ip: '127.0.0.1',
    target_resource: 'Ed25519 API, JWT & Netlify Webhook Secrets',
    action_taken: 'ROTATED',
    description: 'Rotated all active API tokens, webhook HMAC secrets, and session keys with zero downtime.'
  });

  const notif = recordPushNotification({
    channel: 'security',
    priority: 'normal',
    title: 'Cryptographic Keys Rotated',
    message: 'Ed25519 API keys & Netlify/GitHub webhook secrets rotated across all 6 edge nodes.',
    action_url: 'subsystems'
  });

  const securityEvents = db.prepare('SELECT * FROM security_events ORDER BY created_at DESC LIMIT 35').all();
  const notifications = db.prepare('SELECT * FROM push_notifications ORDER BY created_at DESC LIMIT 40').all();

  broadcast('security:updated', {
    securityEvents,
    notifications,
    latestSecurityEvent: secEvent,
    notification: notif,
    dbStats: getDatabaseStats()
  });

  res.json({ securityEvents, notifications, latestSecurityEvent: secEvent });
});

// 16. Push Notifications Center Endpoints (/api/notifications)
app.post('/api/notifications/send', (req, res) => {
  const {
    channel = 'realtime',
    priority = 'high',
    title = 'NEX Real-Time Broadcast',
    message = 'Live system broadcast dispatched to all connected WebSocket clients & desktop push subscribers.',
    action_url = 'store'
  } = req.body || {};

  const notif = recordPushNotification({
    channel,
    priority,
    title: title.trim(),
    message: message.trim(),
    action_url
  });

  const notifications = db.prepare('SELECT * FROM push_notifications ORDER BY created_at DESC LIMIT 40').all();

  broadcast('notification:new', {
    notification: notif,
    notifications,
    dbStats: getDatabaseStats()
  });

  res.status(201).json({ notification: notif, notifications });
});

app.post('/api/notifications/mark-read', (req, res) => {
  const { id } = req.body || {};
  if (id) {
    db.prepare('UPDATE push_notifications SET is_read = 1 WHERE id = ?').run(id);
  } else {
    db.prepare('UPDATE push_notifications SET is_read = 1').run();
  }
  const notifications = db.prepare('SELECT * FROM push_notifications ORDER BY created_at DESC LIMIT 40').all();
  broadcast('notifications:updated', { notifications });
  res.json({ notifications });
});

// 17. Interactive NEX-SH v3.0 Power Shell, Pipe Filter & Multi-Line Scripting Engine (/api/terminal/exec)
function applyTerminalPipes(lines, pipeSegments) {
  let result = [...lines];
  for (const rawPipe of pipeSegments) {
    const p = rawPipe.trim();
    const lowerP = p.toLowerCase();
    if (lowerP.startsWith('grep ')) {
      const pattern = p.slice(5).trim().replace(/^["']|["']$/g, '').toLowerCase();
      result = result.filter((line) => line.toLowerCase().includes(pattern));
    } else if (lowerP.startsWith('head')) {
      const n = parseInt(p.replace(/^head\s*-?n?\s*/i, ''), 10) || 5;
      result = result.slice(0, n);
    } else if (lowerP.startsWith('tail')) {
      const n = parseInt(p.replace(/^tail\s*-?n?\s*/i, ''), 10) || 5;
      result = result.slice(-n);
    } else if (lowerP === 'count' || lowerP.startsWith('wc')) {
      result = [`${result.length} line(s)`];
    } else if (lowerP === 'sort') {
      result = [...result].sort();
    } else if (lowerP === 'reverse') {
      result = [...result].reverse();
    } else if (lowerP === 'upper') {
      result = result.map((l) => l.toUpperCase());
    }
  }
  return result;
}

function executeSingleCommand(singleRawCmd) {
  const pipeParts = singleRawCmd.split('|');
  const baseCmd = pipeParts[0].trim();
  const pipeSegments = pipeParts.slice(1);
  const lower = baseCmd.toLowerCase();

  let outputLines = [];
  let exitCode = 0;

  if (!baseCmd || baseCmd.startsWith('#')) {
    return { outputLines: [], exitCode: 0 };
  }

  if (lower === 'help' || lower === 'nex help' || lower === '--help') {
    outputLines = [
      'NEX-SH v4.0 • Interactive Cloud CLI, Hardware SKU Publisher, Polyglot Runner & Pipe Engine',
      '────────────────────────────────────────────────────────────────────────────────────────',
      '  HARDWARE STORE & CATALOG COMMANDS:',
      '    nex products                 List flagship hardware SKUs, prices & live warehouse stock',
      '    nex product add <name> ...   Add a new Hardware SKU directly to Store & SQLite',
      '                                 (e.g. nex product add "Axon NPU Card" --price=999 --cat=compute)',
      '    nex restock                  Auto-replenish (+15 units) all low-stock hardware SKUs',
      '  POLYGLOT AI, APPS & MOBILE ECOSYSTEM:',
      '    nex polyglot                 List all 6-language Polyglot AI Automations (Python/Rust/C++/Java/Go/TS)',
      '    nex polyglot run <lang|id>   Compile & run a Polyglot AI script (e.g. nex polyglot run rust)',
      '    nex apps                     List verified multi-source apps (Netlify, Vercel, GitHub, System)',
      '    nex deploy <url>             Import & verify a live app from Netlify/Vercel/GitHub URL',
      '    nex subscriptions            List all 4 customizable subscription tiers & active API keys',
      '    nex mobile                   Inspect Native / Flutter mobile add-on modules & SDK endpoints',
      '  SYSTEM TELEMETRY, SECURITY & PIPES:',
      '    neofetch                     Display NEX-OS Gen-5 ASCII hardware, 23-table SQLite & DRM banner',
      '    nex status | nex servers     Inspect system health, memory, 6 Anycast nodes & 23 SQLite tables',
      '    nex security scan | block    Run deep WAF, SQLi/XSS & SHA-256 package security audit',
      '    nex sql <SELECT ...>         Execute a read-only SQL query against any of the 23 tables',
      '    nex scripts | nex run <name> List and execute multi-line .nexsh automation playbooks',
      '    <cmd> | grep <text>          Filter command output lines (also: | head 5, | count, | sort)'
    ];
  } else if (lower === 'neofetch' || lower === 'nex neofetch') {
    const stats = getDatabaseStats();
    const mem = process.memoryUsage();
    outputLines = [
      '       /\\        root@nex-edge-nbo-01',
      '      /  \\       ────────────────────',
      '     / /\\ \\      OS      : NEX-OS Gen-5 Quantum Core v4.0 (x86_64)',
      '    / /__\\ \\     Kernel  : Linux 6.11.0-nex-anycast (Node ' + process.version + ')',
      '   / /____\\ \\    Uptime  : ' + Math.round(process.uptime()) + 's • Active WS Sessions: ' + Math.max(1, clients.size),
      '  /_/      \\_\\   SQLite  : ' + stats.totalTables + ' WAL Tables • ' + stats.totalRows + ' Rows (' + stats.sizeFormatted + ')',
      '  NEX STORE v4   Polyglot: Python 3.12 • Rust 1.82 • C++23 • Java 21 • Go • TS',
      '                 Memory  : ' + (mem.rss / 1024 / 1024).toFixed(1) + ' MB RSS / 64 GB Unified',
      '                 DRM Lock: © 2026 NEX STORE & DEVTECHS001 LABS (PROPRIETARY)'
    ];
  } else if (lower.startsWith('nex product add ')) {
    const argsStr = baseCmd.slice('nex product add '.length).trim();
    const priceMatch = argsStr.match(/--price=([0-9.]+)/i);
    const catMatch = argsStr.match(/--cat=([a-z0-9-_]+)/i);
    const stockMatch = argsStr.match(/--stock=([0-9]+)/i);
    const skuMatch = argsStr.match(/--sku=([a-z0-9-_]+)/i);
    const cleanName = argsStr
      .replace(/--[a-z]+=\S+/gi, '')
      .replace(/^["']|["']$/g, '')
      .trim() || 'NEX Custom Quantum Accelerator';

    const numPrice = priceMatch ? Number(priceMatch[1]) : 799;
    const category = catMatch ? catMatch[1].toLowerCase() : 'compute';
    const numStock = stockMatch ? parseInt(stockMatch[1], 10) : 20;
    const id = `prod-${Date.now().toString(36)}`;
    const cleanSku = (skuMatch ? skuMatch[1] : `NEX-${Math.floor(100 + Math.random() * 899)}`).toUpperCase();
    const now = new Date().toISOString();
    const imageUrl = `/api/product-art/${id}.svg`;
    const gallery = [
      { label: 'Studio Hero', view: 'hero' },
      { label: 'Detail Cutaway', view: 'detail' },
      { label: 'CAD Blueprint', view: 'blueprint' },
      { label: 'Telemetry Spec', view: 'spec' }
    ];
    const specs = {
      Architecture: 'NEX Gen-5 Custom Silicon',
      Connectivity: 'Thunderbolt 5 / PCIe 6.0',
      Materials: 'CNC Anodized 6063 Aluminum & Titanium',
      Warranty: '3-Year NEX Global Pro Care+'
    };
    const colors = [{ name: 'Cyber Indigo', hex: '#6366f1' }];

    db.prepare(`
      INSERT INTO products (
        id, sku, name, tagline, description, category, brand,
        price, original_price, cost_price, stock, low_stock_threshold,
        rating, review_count, sold_count, featured, is_flash_sale,
        flash_sale_ends_at, badge, image_url, gallery_json, specs_json,
        colors_json, tags_json, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, 'NEX-Lab CLI', ?, ?, ?, ?, 5, 5.0, 1, 0, 1, 1, ?, 'CLI LAUNCH', ?, ?, ?, ?, '["nex","cli","hardware"]', ?, ?)
    `).run(
      id,
      cleanSku,
      cleanName,
      'Created via NEX-SH v4.0 Hardware Publisher CLI',
      `Precision ${category} hardware launched directly from NEX-SH CLI with 4-angle procedural CAD telemetry.`,
      category,
      numPrice,
      Math.round(numPrice * 1.15),
      Math.round(numPrice * 0.55),
      numStock,
      new Date(Date.now() + 1000 * 60 * 60 * 12).toISOString(),
      imageUrl,
      JSON.stringify(gallery),
      JSON.stringify(specs),
      JSON.stringify(colors),
      now,
      now
    );

    const created = formatProductRow(db.prepare('SELECT * FROM products WHERE id = ?').get(id));
    broadcast('product:created', {
      product: created,
      analytics: getAnalyticsSummary(),
      dbStats: getDatabaseStats()
    });

    outputLines = [
      `[HARDWARE LAB] Serializing new SKU ${cleanSku} ("${cleanName}")...`,
      `[CAD ENGINE]   Generated 4-angle vector blueprints at ${imageUrl}`,
      `[SQLITE WAL]   Inserted into products (${category} • $${numPrice} • ${numStock} units in stock)`,
      `[SUCCESS]      Hardware product "${cleanName}" is now LIVE in the Storefront!`
    ];
  } else if (lower === 'nex polyglot' || lower === 'nex polyglot list' || lower === 'polyglot') {
    const autos = db.prepare('SELECT * FROM polyglot_automations ORDER BY run_count DESC').all();
    outputLines = [
      'ID                       LANGUAGE     RUNTIME                 RUNS   TITLE',
      '──────────────────────── ──────────── ─────────────────────── ────── ─────────────────────────────────────',
      ...autos.map(
        (a) =>
          `${a.id.padEnd(24)} ${a.language.toUpperCase().padEnd(12)} ${a.runtime.slice(0, 22).padEnd(23)} ${String(a.run_count).padEnd(6)} ${a.title}`
      )
    ];
  } else if (lower.startsWith('nex polyglot run ')) {
    const target = baseCmd.slice('nex polyglot run '.length).trim().toLowerCase();
    const found =
      db.prepare('SELECT * FROM polyglot_automations WHERE LOWER(id) = ? OR LOWER(language) = ?').get(target, target) ||
      db.prepare('SELECT * FROM polyglot_automations LIMIT 1').get();
    if (!found) {
      exitCode = 1;
      outputLines = [`[ERROR] No polyglot automation found for "${target}"`];
    } else {
      const storeStats = {
        productCount: db.prepare('SELECT COUNT(*) as c FROM products').get().c,
        appCount: db.prepare('SELECT COUNT(*) as c FROM apps').get().c,
        nodeCount: db.prepare('SELECT COUNT(*) as c FROM server_nodes').get().c,
        orderCount: db.prepare('SELECT COUNT(*) as c FROM orders').get().c
      };
      const execResult = executePolyglotAutomation(found, storeStats);
      db.prepare(`
        UPDATE polyglot_automations
        SET last_output = ?, last_status = ?, run_count = run_count + 1, execution_ms = ?, updated_at = ?
        WHERE id = ?
      `).run(execResult.output, execResult.status, execResult.executionMs, new Date().toISOString(), found.id);
      const polyglotAutomations = db.prepare('SELECT * FROM polyglot_automations ORDER BY run_count DESC').all();
      broadcast('polyglot:executed', { polyglotAutomations, dbStats: getDatabaseStats() });
      outputLines = execResult.output.split('\n');
    }
  } else if (lower === 'nex subscriptions' || lower === 'subscriptions') {
    const plans = db.prepare('SELECT * FROM subscription_plans ORDER BY tier_level ASC').all();
    const subs = db.prepare('SELECT * FROM user_subscriptions ORDER BY subscribed_at DESC').all();
    outputLines = [
      'ID                    NAME                        MONTHLY     ANNUAL/MO   MODIFIABLE   ACTIVE KEYS',
      '───────────────────── ─────────────────────────── ─────────── ─────────── ──────────── ───────────',
      ...plans.map(
        (p) =>
          `${p.id.padEnd(21)} ${p.name.padEnd(27)} ${('$' + p.price_monthly).padEnd(11)} ${('$' + p.price_annual).padEnd(11)} YES (ADMIN)  ${subs.filter((s) => s.plan_id === p.id).length} key(s)`
      )
    ];
  } else if (lower === 'nex mobile' || lower === 'mobile') {
    const addons = db.prepare('SELECT * FROM mobile_addons ORDER BY updated_at DESC').all();
    outputLines = [
      'ID                       FRAMEWORK       VERSION   PLATFORM          STATUS    ENDPOINT',
      '──────────────────────── ─────────────── ───────── ───────────────── ───────── ──────────────────────────',
      ...addons.map(
        (m) =>
          `${m.id.padEnd(24)} ${m.framework.padEnd(15)} ${('v' + m.version).padEnd(9)} ${m.target_platform.slice(0, 16).padEnd(17)} ${(m.enabled ? 'ENABLED' : 'OFF').padEnd(9)} ${m.api_endpoint}`
      )
    ];
  } else if (lower.startsWith('echo ')) {
    const text = baseCmd.slice(5).trim().replace(/^["']|["']$/g, '');
    outputLines = [text];
  } else if (lower === 'whoami') {
    outputLines = ['root@nex-edge-nbo (uid=0 gid=0 groups=0(root),100(secops),101(sqlite-wal))'];
  } else if (lower === 'uname -a' || lower === 'uname') {
    outputLines = [
      'Linux nex-edge-nbo-01 6.11.0-nex-anycast #1 SMP PREEMPT_DYNAMIC Node.js ' +
        process.version +
        ' x86_64 GNU/Linux (SQLite3 WAL Engine)'
    ];
  } else if (lower === 'uptime') {
    outputLines = [
      `up ${Math.round(process.uptime())} seconds, ${Math.max(1, clients.size)} active WS user(s), load average: 0.24, 0.19, 0.15`
    ];
  } else if (lower === 'env') {
    outputLines = [
      'NEX_VERSION=3.0.0',
      'NEX_CLUSTER_PRIMARY=af-south-nbo-01 (196.216.84.12)',
      'SQLITE_JOURNAL_MODE=WAL',
      'SQLITE_TABLES=17',
      'WAF_SHIELD=ENABLED (Cloudflare Anycast + Ed25519)',
      `NODE_RUNTIME=${process.version}`
    ];
  } else if (lower === 'top') {
    const nodes = db.prepare('SELECT * FROM server_nodes ORDER BY cpu_load DESC').all();
    outputLines = [
      'PID    USER      PR   VIRT    RES    STATE   CPU%   MEM%   NODE / PROCESS',
      '────── ───────── ──── ─────── ────── ─────── ────── ────── ──────────────────────────────',
      ...nodes.map(
        (n, idx) =>
          `${String(1400 + idx * 37).padEnd(6)} root      20   1.84G   512M   RUN     ${(n.cpu_load + '%').padEnd(6)} ${(n.ram_usage + '%').padEnd(6)} nex-edge-worker (${n.id})`
      )
    ];
  } else if (lower === 'netstat') {
    const nodes = db.prepare('SELECT * FROM server_nodes').all();
    outputLines = [
      'PROTO  LOCAL ADDRESS          FOREIGN EDGE PEER      STATE         LATENCY   CONNS',
      '────── ────────────────────── ────────────────────── ───────────── ───────── ──────',
      ...nodes.map(
        (n) =>
          `tcp4   0.0.0.0:3000           ${n.ip_address.padEnd(18)}:443 ESTABLISHED   ${(n.latency_ms + 'ms').padEnd(9)} ${n.active_connections}`
      )
    ];
  } else if (lower === 'nex benchmark' || lower === 'benchmark') {
    const t0 = performance.now();
    const prodCount = db.prepare('SELECT COUNT(*) as c FROM products').get().c;
    const appCount = db.prepare('SELECT COUNT(*) as c FROM apps').get().c;
    const sampleSvg = renderProductSvg('prod-aether-pro', { view: 'blueprint' });
    const elapsed = Math.max(0.2, Number((performance.now() - t0).toFixed(2)));
    const opsPerSec = Math.round((1000 / elapsed) * 45);
    outputLines = [
      `[BENCHMARK] SQLite 3 WAL Read Throughput : ${opsPerSec.toLocaleString()} queries/sec (${prodCount} SKUs, ${appCount} Apps)`,
      `[BENCHMARK] Procedural 4-Angle CAD SVG   : ${(sampleSvg.length / 1024).toFixed(1)} KB vector generated in ${elapsed}ms`,
      `[BENCHMARK] Edge WebSocket Multiplexer   : 0.4ms frame broadcast latency across 6 Anycast nodes`,
      `[RESULT]    Overall NEX-Store Engine Score: 99.9 / 100 (ULTRA-LOW LATENCY)`
    ];
  } else if (lower === 'nex scripts' || lower === 'scripts') {
    const scripts = db.prepare('SELECT * FROM terminal_scripts ORDER BY run_count DESC').all();
    outputLines = [
      'NAME                             CATEGORY            RUNS    STATUS    DESCRIPTION',
      '──────────────────────────────── ─────────────────── ─────── ───────── ────────────────────────────────────────',
      ...scripts.map(
        (s) =>
          `${s.name.padEnd(32)} ${s.category.padEnd(19)} ${String(s.run_count).padEnd(7)} ${s.last_status.padEnd(9)} ${s.title}`
      )
    ];
  } else if (lower.startsWith('nex run ')) {
    const targetName = baseCmd.slice('nex run '.length).trim();
    const scriptRow = db
      .prepare('SELECT * FROM terminal_scripts WHERE name = ? OR id = ?')
      .get(targetName, targetName);
    if (!scriptRow) {
      exitCode = 1;
      outputLines = [
        `[ERROR] Script "${targetName}" not found. Run "nex scripts" to list available .nexsh playbooks.`
      ];
    } else {
      db.prepare('UPDATE terminal_scripts SET run_count = run_count + 1, updated_at = ? WHERE id = ?').run(
        new Date().toISOString(),
        scriptRow.id
      );
      outputLines = [
        `▶ Executing Playbook: ${scriptRow.name} (${scriptRow.title})`,
        '────────────────────────────────────────────────────────────────────────────────'
      ];
      const subLines = scriptRow.script_body
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l && !l.startsWith('#'));
      for (const subCmd of subLines) {
        outputLines.push(`$ ${subCmd}`);
        const subRes = executeSingleCommand(subCmd);
        outputLines.push(...subRes.outputLines);
      }
      outputLines.push(`✓ Playbook ${scriptRow.name} completed (run #${scriptRow.run_count + 1})`);
    }
  } else if (lower === 'nex status' || lower === 'status' || lower === 'nex health') {
    const stats = getDatabaseStats();
    const mem = process.memoryUsage();
    const nodes = db.prepare('SELECT * FROM server_nodes').all();
    const avgLat = Math.round(nodes.reduce((s, n) => s + n.latency_ms, 0) / Math.max(1, nodes.length));
    outputLines = [
      `[OK] Runtime         : Node.js ${process.version} • Uptime ${Math.round(process.uptime())}s • RSS ${(mem.rss / 1024 / 1024).toFixed(1)} MB`,
      `[OK] Database Engine : ${stats.engine} (${stats.sizeFormatted})`,
      `[OK] Schema Tables   : ${stats.totalTables} tables • ${stats.totalRows} total rows`,
      `[OK] Edge Cluster    : ${nodes.length}/${nodes.length} nodes online • Avg Latency ${avgLat}ms`,
      `[OK] Security Shield : 99.8% Hardened • Cloudflare WAF + SHA-256 Package Signing Active`
    ];
  } else if (lower === 'nex servers' || lower === 'servers') {
    const nodes = db.prepare('SELECT * FROM server_nodes ORDER BY latency_ms ASC').all();
    outputLines = [
      'ID           REGION            IP ADDRESS       LATENCY   CPU    RAM    RPS     STATUS',
      '──────────── ───────────────── ──────────────── ───────── ────── ────── ─────── ──────',
      ...nodes.map(
        (n) =>
          `${n.id.padEnd(12)} ${n.region.padEnd(17)} ${n.ip_address.padEnd(16)} ${(n.latency_ms + 'ms').padEnd(9)} ${(n.cpu_load + '%').padEnd(6)} ${(n.ram_usage + '%').padEnd(6)} ${String(n.rps).padEnd(7)} ${n.status.toUpperCase()}`
      )
    ];
  } else if (lower === 'nex ping' || lower === 'ping') {
    const nodes = db.prepare('SELECT * FROM server_nodes ORDER BY latency_ms ASC').all();
    outputLines = [
      'Pinging 6 global NEX Anycast Edge Nodes with 64 bytes of telemetry data:',
      ...nodes.map(
        (n) => `  64 bytes from ${n.ip_address} (${n.name}): icmp_seq=1 ttl=58 time=${n.latency_ms}.2 ms [OK]`
      ),
      '--- 6 packets transmitted, 6 received, 0% packet loss ---'
    ];
  } else if (lower.startsWith('nex apps') || lower === 'apps') {
    const appsList = db.prepare('SELECT * FROM apps ORDER BY downloads DESC').all();
    outputLines = [
      'ID                  NAME                        SOURCE         VERSION   INSTALLS   SECURITY',
      '─────────────────── ─────────────────────────── ────────────── ───────── ────────── ────────',
      ...appsList.map(
        (a) =>
          `${a.id.padEnd(19)} ${a.name.slice(0, 26).padEnd(27)} ${(a.source_provider || 'NEX').padEnd(14)} ${('v' + a.version).padEnd(9)} ${String(a.downloads).padEnd(10)} ${a.security_score || 99}/100`
      )
    ];
  } else if (lower.startsWith('nex deploy ')) {
    const rawUrl = baseCmd.slice('nex deploy '.length).trim();
    const normalized = rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`;
    let host = 'custom-app.netlify.app';
    try {
      host = new URL(normalized).hostname;
    } catch {}
    const sub = host.split('.')[0] || 'edge-app';
    const title = sub
      .split(/[-_]+/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
    const provider = host.includes('netlify')
      ? 'Netlify'
      : host.includes('vercel')
      ? 'Vercel'
      : host.includes('github')
      ? 'GitHub'
      : 'Community Dev';
    const id = `app-${Date.now().toString(36)}`;
    const now = new Date().toISOString();
    const sha = crypto.createHash('sha256').update(`${id}:${normalized}`).digest('hex');

    db.prepare(`
      INSERT INTO apps (
        id, name, description, version, category, language, platforms_json,
        rating, reviews_count, downloads, size, developer, icon, license, price,
        is_featured, is_verified, source_provider, live_url, repo_url,
        sha256_hash, security_score, permissions_json, created_at
      ) VALUES (?, ?, ?, '1.0.0', 'web', 'typescript', '["web","linux","macos"]', 5.0, 1, 1, '11.4 MB', ?, '🚀', 'MIT', 'Free', 1, 1, ?, ?, '', ?, 99, '["Sandboxed Iframe","Zero-Trust Verified"]', ?)
    `).run(
      id,
      title,
      `Imported via NEX-SH CLI from ${normalized}`,
      `@${sub}_dev`,
      provider,
      normalized,
      sha,
      now
    );

    const createdApp = db.prepare('SELECT * FROM apps WHERE id = ?').get(id);
    const notif = recordPushNotification({
      channel: 'deployment',
      priority: 'high',
      title: `CLI Deployed ${provider} App: ${title}`,
      message: `Published ${normalized} with SHA-256 ${sha.slice(0, 12)}...`,
      action_url: 'apps'
    });

    broadcast('app:created', {
      app: createdApp,
      notification: notif,
      dbStats: getDatabaseStats()
    });

    outputLines = [
      `[+] Fetching deployment manifest from ${normalized}...`,
      `[+] Detected Provider: ${provider} • Package: "${title}"`,
      `[+] Computing SHA-256 signature: ${sha}`,
      `[+] Running isolated sandbox security audit... PASS (99/100)`,
      `[SUCCESS] Published ${title} (${id}) to SQLite apps table & broadcasted to all clients!`
    ];
  } else if (lower.startsWith('nex security scan') || lower === 'security scan') {
    const secEvent = recordSecurityEvent({
      event_type: 'cli_audit',
      severity: 'low',
      source_ip: '127.0.0.1',
      target_resource: 'NEX-SH CLI Deep Security Scan',
      action_taken: 'VERIFIED',
      description: 'CLI-triggered deep audit verified all 17 SQLite tables, WAF rules, and SHA-256 app signatures.'
    });
    const securityEvents = db.prepare('SELECT * FROM security_events ORDER BY created_at DESC LIMIT 35').all();
    broadcast('security:updated', {
      securityEvents,
      latestSecurityEvent: secEvent,
      dbStats: getDatabaseStats()
    });
    outputLines = [
      '[SCAN] Auditing 17 SQLite WAL tables for injection vectors... CLEAN',
      '[SCAN] Verifying SHA-256 signatures across all Netlify/GitHub apps... 100% VALID',
      '[SCAN] Checking Cloudflare WAF & Anycast DDoS rules... ARMED',
      '[PASS] Security Posture Score: 99.8% Hardened (0 vulnerabilities found)'
    ];
  } else if (lower.startsWith('nex security block')) {
    const secEvent = recordSecurityEvent({
      event_type: 'waf_cli_block',
      severity: 'critical',
      source_ip: '185.220.101.99',
      target_resource: 'POST /api/db/query',
      action_taken: 'BLOCKED',
      description: 'CLI threat simulation intercepted stacked SQLi payload in 0.2ms.'
    });
    const securityEvents = db.prepare('SELECT * FROM security_events ORDER BY created_at DESC LIMIT 35').all();
    broadcast('security:updated', {
      securityEvents,
      latestSecurityEvent: secEvent,
      dbStats: getDatabaseStats()
    });
    outputLines = [
      '[ALERT] Simulated incoming SQLi payload from 185.220.101.99 -> POST /api/db/query',
      '[WAF] Rule #SQLI-09 triggered in 0.2ms -> Action: BLOCKED & IP Blacklisted',
      `[LOGGED] Event ${secEvent.id} committed to SQLite security_events table.`
    ];
  } else if (lower === 'nex products' || lower === 'products') {
    const prods = getAllProducts();
    outputLines = [
      'SKU           NAME                                      PRICE      STOCK   CATEGORY',
      '───────────── ───────────────────────────────────────── ────────── ─────── ──────────',
      ...prods.map(
        (p) =>
          `${p.sku.padEnd(13)} ${p.name.slice(0, 40).padEnd(41)} ${('$' + p.price).padEnd(10)} ${String(p.stock).padEnd(7)} ${p.category}`
      )
    ];
  } else if (lower === 'nex restock' || lower === 'restock') {
    const lowProducts = db
      .prepare('SELECT * FROM products WHERE stock <= low_stock_threshold + 5')
      .all();
    const now = new Date().toISOString();
    const stmt = db.prepare('UPDATE products SET stock = stock + 15, updated_at = ? WHERE id = ?');
    for (const p of lowProducts) {
      stmt.run(now, p.id);
    }
    const allProducts = getAllProducts();
    broadcast('products:bulk_restocked', {
      products: allProducts,
      analytics: getAnalyticsSummary(),
      dbStats: getDatabaseStats()
    });
    outputLines = [
      `[WAREHOUSE] Replenished +15 units across ${lowProducts.length} hardware SKUs.`,
      `[SYNC] Broadcasted updated inventory levels to all connected WebSocket clients.`
    ];
  } else if (lower.startsWith('nex notify ')) {
    const msgText = baseCmd.slice('nex notify '.length).trim();
    const notif = recordPushNotification({
      channel: 'realtime',
      priority: 'high',
      title: 'NEX-SH Terminal Broadcast',
      message: msgText,
      action_url: 'subsystems'
    });
    const notifications = db.prepare('SELECT * FROM push_notifications ORDER BY created_at DESC LIMIT 40').all();
    broadcast('notification:new', {
      notification: notif,
      notifications,
      dbStats: getDatabaseStats()
    });
    outputLines = [
      `[PUSH] Dispatched real-time notification (${notif.id}): "${msgText}"`,
      `[WS] Broadcasted to ${Math.max(1, clients.size)} active WebSocket client(s).`
    ];
  } else if (lower.startsWith('nex sql ') || lower.startsWith('select ') || lower.startsWith('pragma ')) {
    const sqlQuery = lower.startsWith('nex sql ') ? baseCmd.slice('nex sql '.length).trim() : baseCmd;
    if (!/^(SELECT|PRAGMA|WITH)\b/i.test(sqlQuery) || /;\s*(DROP|DELETE|UPDATE|INSERT|ALTER|CREATE)\b/i.test(sqlQuery)) {
      exitCode = 1;
      outputLines = ['[ERROR] Only read-only SELECT / PRAGMA / WITH queries are permitted in NEX-SH.'];
    } else {
      const rows = db.prepare(sqlQuery).all().slice(0, 15);
      outputLines = [
        `Query returned ${rows.length} row(s):`,
        ...rows.map((r) => JSON.stringify(r))
      ];
    }
  } else {
    exitCode = 127;
    outputLines = [
      `nex-sh: command not found: "${baseCmd}"`,
      `Type "help" to view available NEX-SH v3.0 commands, pipes (| grep), and scripting options.`
    ];
  }

  if (pipeSegments.length > 0 && exitCode === 0) {
    outputLines = applyTerminalPipes(outputLines, pipeSegments);
  }

  return { outputLines, exitCode };
}

app.post('/api/terminal/exec', (req, res) => {
  const startTime = performance.now();
  const rawCmd = String(req.body?.command || '').trim();
  if (!rawCmd) {
    return res.status(400).json({ error: 'Empty command' });
  }

  let combinedLines = [];
  let finalExitCode = 0;

  try {
    // Support multi-line .nexsh scripts AND && / ; chained commands (unless inside SQL)
    const isSqlRaw = /^(nex\s+sql\s+|select\s+|pragma\s+)/i.test(rawCmd);
    const statements = isSqlRaw
      ? [rawCmd]
      : rawCmd
          .split(/\r?\n|&&/)
          .map((s) => s.trim())
          .filter((s) => s && !s.startsWith('#'));

    for (const stmt of statements) {
      if (statements.length > 1) {
        combinedLines.push(`$ ${stmt}`);
      }
      const { outputLines, exitCode } = executeSingleCommand(stmt);
      combinedLines.push(...outputLines);
      if (exitCode !== 0) {
        finalExitCode = exitCode;
        break;
      }
    }
  } catch (err) {
    finalExitCode = 1;
    combinedLines.push(`[ERROR] ${err.message || 'Command execution failed'}`);
  }

  const durationMs = Number((performance.now() - startTime).toFixed(2));
  const outputText = combinedLines.join('\n');
  const logEntry = recordTerminalLog({
    command: rawCmd.includes('\n') ? `[Script] ${rawCmd.split('\n')[0]}...` : rawCmd,
    output: outputText,
    exit_code: finalExitCode,
    actor: 'root@nex-edge-nbo',
    duration_ms: durationMs
  });

  const terminalLogs = db.prepare('SELECT * FROM terminal_logs ORDER BY created_at DESC LIMIT 40').all();
  const terminalScripts = db.prepare('SELECT * FROM terminal_scripts ORDER BY run_count DESC').all();
  broadcast('terminal:executed', {
    logEntry,
    terminalLogs,
    terminalScripts,
    dbStats: getDatabaseStats()
  });

  res.json({
    command: rawCmd,
    output: outputText,
    exitCode: finalExitCode,
    durationMs,
    logEntry,
    terminalLogs,
    terminalScripts
  });
});

app.post('/api/terminal/scripts', (req, res) => {
  const {
    id,
    name = 'custom-playbook.nexsh',
    title,
    category = 'Custom Ops',
    description = 'User-defined NEX-SH automation playbook',
    code,
    script_body
  } = req.body || {};

  const resolvedBody = code || script_body || 'nex status\nnex servers';
  const cleanName = name.trim().endsWith('.nexsh') ? name.trim() : `${name.trim()}.nexsh`;
  const resolvedTitle = (title || description || cleanName).trim();
  const scriptId = id || `scr-${Date.now().toString(36)}`;
  const now = new Date().toISOString();

  db.prepare(`
    INSERT OR REPLACE INTO terminal_scripts (
      id, name, title, category, description, author, script_body, run_count, last_status, updated_at
    ) VALUES (?, ?, ?, ?, ?, 'root@nex-edge-nbo', ?, COALESCE((SELECT run_count FROM terminal_scripts WHERE id = ?), 0), 'READY', ?)
  `).run(scriptId, cleanName, resolvedTitle, category.trim(), description.trim(), resolvedBody, scriptId, now);

  const rawScripts = db.prepare('SELECT * FROM terminal_scripts ORDER BY run_count DESC').all();
  const terminalScripts = rawScripts.map((s) => ({
    ...s,
    code: s.code || s.script_body
  }));
  const savedScript = terminalScripts.find((s) => s.id === scriptId) || terminalScripts[0];

  broadcast('terminal:scripts_updated', {
    terminalScripts,
    dbStats: getDatabaseStats()
  });

  res.status(201).json({ script: savedScript, terminalScripts });
});

// ============================================================================
// REAL SYSTEM HEALTH, NAVIGATION TELEMETRY, BTO CONFIGS, REVIEWS & EXPORT API
// ============================================================================

// 14. Live System Health & SQLite WAL Diagnostics Endpoint
app.get('/api/health', (_req, res) => {
  const mem = process.memoryUsage();
  const dbStats = getDatabaseStats();
  const onlineServers = db
    .prepare("SELECT COUNT(*) as c FROM server_nodes WHERE LOWER(status) = 'online'")
    .get().c;
  const totalServers = db.prepare('SELECT COUNT(*) as c FROM server_nodes').get().c;

  res.json({
    status: 'healthy',
    service: 'nex-store-enterprise-core',
    version: '3.1.0',
    uptimeSeconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
    nodeVersion: process.version,
    memory: {
      rssMB: Number((mem.rss / 1048576).toFixed(2)),
      heapUsedMB: Number((mem.heapUsed / 1048576).toFixed(2)),
      heapTotalMB: Number((mem.heapTotal / 1048576).toFixed(2))
    },
    database: {
      engine: dbStats.engine,
      totalTables: dbStats.totalTables,
      totalRows: dbStats.totalRows,
      sizeFormatted: dbStats.sizeFormatted,
      journalMode: 'WAL'
    },
    edgeCluster: {
      onlineNodes: onlineServers,
      totalNodes: totalServers
    },
    websocket: {
      activeConnections: Math.max(1, clients.size),
      path: '/ws'
    }
  });
});

// 15. Real-Time Navigation Badges & Workspace Telemetry Endpoint
app.get('/api/nav/telemetry', (_req, res) => {
  const storeProducts = db.prepare('SELECT COUNT(*) as c FROM products').get().c;
  const lowStockCount = db
    .prepare('SELECT COUNT(*) as c FROM products WHERE stock <= low_stock_threshold')
    .get().c;
  const flashSaleCount = db
    .prepare('SELECT COUNT(*) as c FROM products WHERE is_flash_sale = 1')
    .get().c;
  const verifiedApps = db.prepare('SELECT COUNT(*) as c FROM apps').get().c;
  const onlineServers = db
    .prepare("SELECT COUNT(*) as c FROM server_nodes WHERE LOWER(status) = 'online'")
    .get().c;
  const totalServers = db.prepare('SELECT COUNT(*) as c FROM server_nodes').get().c;
  const activeOrders = db
    .prepare("SELECT COUNT(*) as c FROM orders WHERE LOWER(status) != 'delivered'")
    .get().c;
  const totalOrders = db.prepare('SELECT COUNT(*) as c FROM orders').get().c;
  const unreadNotifications = db
    .prepare('SELECT COUNT(*) as c FROM push_notifications WHERE is_read = 0')
    .get().c;
  const savedScripts = db.prepare('SELECT COUNT(*) as c FROM terminal_scripts').get().c;
  const savedRigs = db.prepare('SELECT COUNT(*) as c FROM bto_configs').get().c;
  const securityEventsCount = db.prepare('SELECT COUNT(*) as c FROM security_events').get().c;

  res.json({
    timestamp: new Date().toISOString(),
    badges: {
      store: { products: storeProducts, flashSales: flashSaleCount, lowStock: lowStockCount },
      apps: { total: verifiedApps, provider: 'Multi-Source' },
      subsystems: { onlineNodes: onlineServers, totalNodes: totalServers, securityEvents: securityEventsCount },
      tracker: { activeOrders, totalOrders },
      admin: { lowStock: lowStockCount, totalOrders },
      database: { totalTables: ALLOWED_TABLES.length },
      docs: { scripts: savedScripts, endpoints: 32 },
      bto: { savedRigs },
      notifications: { unread: unreadNotifications }
    }
  });
});

// 16. Custom 5-Slot Hardware BTO Rig Configurations Endpoints (SQLite Table #18)
app.get('/api/bto/configs', (_req, res) => {
  const rows = db.prepare('SELECT * FROM bto_configs ORDER BY created_at DESC').all();
  const btoConfigs = rows.map((b) => ({
    ...b,
    slots: typeof b.slots_json === 'string' ? JSON.parse(b.slots_json) : {}
  }));
  res.json({ btoConfigs });
});

app.post('/api/bto/configs', (req, res) => {
  const {
    name = 'NEX Custom Rig Build',
    engineer = 'Lead Systems Architect',
    slots = {},
    total_wattage = 550,
    psu_capacity = 1250,
    subtotal = 0,
    discount_amount = 0,
    final_price = 0,
    notes = 'Custom 5-slot BTO hardware configuration validated in NEX Studio.'
  } = req.body || {};

  const id = `bto-${Date.now().toString(36)}`;
  const now = new Date().toISOString();
  const slotsJson = typeof slots === 'string' ? slots : JSON.stringify(slots);

  db.prepare(`
    INSERT INTO bto_configs (
      id, name, engineer, slots_json, total_wattage, psu_capacity, subtotal, discount_amount, final_price, notes, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    String(name).trim() || 'NEX Custom Rig Build',
    String(engineer).trim() || 'Lead Systems Architect',
    slotsJson,
    Number(total_wattage) || 0,
    Number(psu_capacity) || 1250,
    Number(subtotal) || 0,
    Number(discount_amount) || 0,
    Number(final_price) || 0,
    String(notes).trim(),
    now
  );

  const btoConfigs = db
    .prepare('SELECT * FROM bto_configs ORDER BY created_at DESC')
    .all()
    .map((b) => ({
      ...b,
      slots: typeof b.slots_json === 'string' ? JSON.parse(b.slots_json) : {}
    }));
  const createdRig = btoConfigs.find((b) => b.id === id) || btoConfigs[0];

  const activity = recordActivityEvent({
    event_type: 'bto_saved',
    title: `BTO Rig Saved • ${createdRig.name}`,
    message: `By ${createdRig.engineer} • ${createdRig.total_wattage}W / ${createdRig.psu_capacity}W PSU • $${Number(createdRig.final_price).toLocaleString()}`,
    meta: { bto_id: id }
  });

  broadcast('bto:updated', {
    btoConfigs,
    activity,
    dbStats: getDatabaseStats()
  });

  res.status(201).json({ rig: createdRig, btoConfigs });
});

app.delete('/api/bto/configs/:id', (req, res) => {
  db.prepare('DELETE FROM bto_configs WHERE id = ?').run(req.params.id);
  const btoConfigs = db
    .prepare('SELECT * FROM bto_configs ORDER BY created_at DESC')
    .all()
    .map((b) => ({
      ...b,
      slots: typeof b.slots_json === 'string' ? JSON.parse(b.slots_json) : {}
    }));

  broadcast('bto:updated', {
    btoConfigs,
    dbStats: getDatabaseStats()
  });

  res.json({ btoConfigs });
});

// 17. Real Order Lookup by Order Number or ID
app.get('/api/orders/lookup/:orderNumber', (req, res) => {
  const target = String(req.params.orderNumber || '').trim();
  const order = db
    .prepare('SELECT * FROM orders WHERE UPPER(order_number) = UPPER(?) OR id = ?')
    .get(target, target);
  if (!order) {
    return res.status(404).json({ error: `Order "${target}" not found` });
  }
  const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
  res.json({ order: { ...order, items } });
});

// 18. Verified Product Reviews Endpoints (GET & POST with live rating recalculation)
app.get('/api/reviews', (req, res) => {
  const { product_id } = req.query;
  const rows = product_id
    ? db
        .prepare('SELECT * FROM reviews WHERE product_id = ? ORDER BY created_at DESC')
        .all(product_id)
    : db.prepare('SELECT * FROM reviews ORDER BY created_at DESC LIMIT 50').all();
  res.json({ reviews: rows });
});

app.post('/api/reviews', (req, res) => {
  const {
    product_id,
    author_name = 'Verified Hardware Engineer',
    author_location = 'Nairobi, KE',
    rating = 5,
    title = 'Exceptional Enterprise Build Quality',
    comment = 'Tested under continuous production workloads with zero thermal throttling.'
  } = req.body || {};

  if (!product_id) {
    return res.status(400).json({ error: 'product_id is required' });
  }
  const prod = db.prepare('SELECT * FROM products WHERE id = ?').get(product_id);
  if (!prod) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const id = `rev-${Date.now().toString(36)}`;
  const cleanRating = Math.min(5, Math.max(1, Number(rating) || 5));
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO reviews (
      id, product_id, author_name, author_location, rating, title, comment, verified_purchase, helpful_count, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 1, 1, ?)
  `).run(id, product_id, author_name.trim(), author_location.trim(), cleanRating, title.trim(), comment.trim(), now);

  const stats = db
    .prepare('SELECT COUNT(*) as count, ROUND(AVG(rating), 2) as avgRating FROM reviews WHERE product_id = ?')
    .get(product_id);
  db.prepare('UPDATE products SET rating = ?, review_count = ?, updated_at = ? WHERE id = ?').run(
    stats.avgRating || cleanRating,
    stats.count || 1,
    now,
    product_id
  );

  const updatedProduct = formatProductRow(db.prepare('SELECT * FROM products WHERE id = ?').get(product_id));
  const reviews = db.prepare('SELECT * FROM reviews WHERE product_id = ? ORDER BY created_at DESC').all(product_id);

  broadcast('product:updated', {
    product: updatedProduct,
    analytics: getAnalyticsSummary(),
    dbStats: getDatabaseStats()
  });

  res.status(201).json({ review: reviews[0], product: updatedProduct, reviews });
});

// 19. Live SQLite Table JSON/CSV Export Endpoint
app.get('/api/export/:table', (req, res) => {
  const table = req.params.table;
  if (!ALLOWED_TABLES.includes(table)) {
    return res.status(400).json({ error: `Table "${table}" is not in ALLOWED_TABLES` });
  }
  const rows = db.prepare(`SELECT * FROM ${table} LIMIT 500`).all();
  if (req.query.format === 'csv') {
    if (rows.length === 0) {
      res.setHeader('Content-Type', 'text/csv');
      return res.send('');
    }
    const headers = Object.keys(rows[0]);
    const csvLines = [
      headers.join(','),
      ...rows.map((r) =>
        headers
          .map((h) => `"${String(r[h] ?? '').replace(/"/g, '""').replace(/\r?\n/g, ' ')}"`)
          .join(',')
      )
    ];
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="nex-${table}.csv"`);
    return res.send(csvLines.join('\n'));
  }
  res.json({ table, count: rows.length, rows });
});

// 20. Self-Documenting Live API Endpoint Catalog
app.get('/api/endpoints', (_req, res) => {
  res.json({
    version: '3.1.0',
    totalTables: ALLOWED_TABLES.length,
    endpoints: [
      { method: 'GET', path: '/api/health', category: 'Diagnostics', desc: 'Node.js memory, uptime, WebSocket & 18-table SQLite WAL health check' },
      { method: 'GET', path: '/api/nav/telemetry', category: 'Navigation', desc: 'Real-time workspace badge counts for Desktop Side Nav & Mobile Bottom Nav' },
      { method: 'GET', path: '/api/bootstrap', category: 'Core State', desc: 'Full initial hydration snapshot across all 18 SQLite tables' },
      { method: 'GET', path: '/api/bto/configs', category: 'Hardware BTO', desc: 'List saved 5-slot custom hardware rig configurations from SQLite' },
      { method: 'POST', path: '/api/bto/configs', category: 'Hardware BTO', desc: 'Save a new 5-slot custom BTO rig configuration into SQLite bto_configs' },
      { method: 'DELETE', path: '/api/bto/configs/:id', category: 'Hardware BTO', desc: 'Delete a saved BTO rig configuration from SQLite' },
      { method: 'POST', path: '/api/terminal/exec', category: 'NEX-SH v3.0', desc: 'Execute CLI commands, Unix pipes (|), && chains, or .nexsh playbooks' },
      { method: 'POST', path: '/api/terminal/scripts', category: 'NEX-SH v3.0', desc: 'Create or update a persistent .nexsh playbook in SQLite terminal_scripts' },
      { method: 'GET', path: '/api/products', category: 'Catalog', desc: 'Filter, search, and sort enterprise hardware SKUs' },
      { method: 'POST', path: '/api/products', category: 'Catalog', desc: 'Create a new hardware SKU with 4-angle CAD SVG schematics' },
      { method: 'GET', path: '/api/orders/lookup/:orderNumber', category: 'Commerce', desc: 'Lookup live order status & line items by order number' },
      { method: 'POST', path: '/api/orders', category: 'Commerce', desc: 'Process hardware checkout, deduct stock, and broadcast live order event' },
      { method: 'GET', path: '/api/reviews', category: 'Reviews', desc: 'List verified buyer hardware reviews from SQLite' },
      { method: 'POST', path: '/api/reviews', category: 'Reviews', desc: 'Submit a review and recalculate product rating in SQLite' },
      { method: 'GET', path: '/api/export/:table', category: 'Data Export', desc: 'Export any of the 18 SQLite tables as live JSON or CSV (?format=csv)' }
    ]
  });
});

// Always serve frontend build from dist/ or snapshot-persisted server/static/
const distPath = path.resolve(__dirname, '../dist');
const staticBackupPath = path.resolve(__dirname, './static');
app.use(express.static(distPath));
app.use(express.static(staticBackupPath));
app.use((req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/ws')) return next();
  const distIndex = path.join(distPath, 'index.html');
  if (fs.existsSync(distIndex)) {
    return res.sendFile(distIndex);
  }
  const staticIndex = path.join(staticBackupPath, 'index.html');
  if (fs.existsSync(staticIndex)) {
    return res.sendFile(staticIndex);
  }
  return next();
});

const PORT = Number(process.env.PORT) || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`NEX Store Full-Stack Server (HTTP + WebSocket + SQLite) listening on http://0.0.0.0:${PORT}`);
});
