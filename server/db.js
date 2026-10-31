import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  SEED_CATEGORIES,
  SEED_PRODUCTS,
  SEED_COUPONS,
  SEED_REVIEWS,
  SEED_ORDERS,
  SEED_APPS,
  SEED_SERVER_NODES,
  SEED_INTEGRATIONS,
  SEED_SECURITY_EVENTS,
  SEED_NOTIFICATIONS,
  SEED_TERMINAL_LOGS,
  SEED_TERMINAL_SCRIPTS,
  SEED_BTO_CONFIGS
} from './seedData.js';
import { SEED_POLYGLOT_AUTOMATIONS } from './polyglotAutomationEngine.js';
import {
  SEED_SUBSCRIPTION_PLANS,
  SEED_USER_SUBSCRIPTIONS,
  SEED_MOBILE_ADDONS
} from './mobileAndSubscriptions.js';
import {
  INITIAL_USER_ACCOUNTS,
  INITIAL_HOSTING_DEPLOYMENTS,
  INITIAL_BLOCKED_IPS,
  INITIAL_SECURITY_REPORTS,
  INITIAL_PAYMENT_TRANSACTIONS
} from './envAndSecurity.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.resolve(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'nexstore.db');
export const db = new DatabaseSync(dbPath);

// Enable WAL mode and foreign keys
db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA synchronous = NORMAL;
  PRAGMA foreign_keys = ON;
`);

export function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      icon TEXT,
      accent_color TEXT
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      sku TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      tagline TEXT,
      description TEXT,
      category TEXT NOT NULL,
      brand TEXT NOT NULL,
      price REAL NOT NULL,
      original_price REAL,
      cost_price REAL DEFAULT 0,
      stock INTEGER NOT NULL DEFAULT 0,
      low_stock_threshold INTEGER NOT NULL DEFAULT 5,
      rating REAL NOT NULL DEFAULT 4.8,
      review_count INTEGER NOT NULL DEFAULT 0,
      sold_count INTEGER NOT NULL DEFAULT 0,
      featured INTEGER NOT NULL DEFAULT 0,
      is_flash_sale INTEGER NOT NULL DEFAULT 0,
      flash_sale_ends_at TEXT,
      badge TEXT,
      image_url TEXT NOT NULL,
      gallery_json TEXT,
      specs_json TEXT,
      colors_json TEXT,
      tags_json TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      author_name TEXT NOT NULL,
      author_location TEXT,
      rating INTEGER NOT NULL,
      title TEXT NOT NULL,
      comment TEXT NOT NULL,
      verified_purchase INTEGER NOT NULL DEFAULT 1,
      helpful_count INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS coupons (
      id TEXT PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      description TEXT NOT NULL,
      discount_type TEXT NOT NULL,
      discount_value REAL NOT NULL,
      min_order_amount REAL NOT NULL DEFAULT 0,
      max_uses INTEGER NOT NULL DEFAULT 100,
      used_count INTEGER NOT NULL DEFAULT 0,
      active INTEGER NOT NULL DEFAULT 1,
      expires_at TEXT
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      order_number TEXT UNIQUE NOT NULL,
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      customer_phone TEXT,
      shipping_address TEXT NOT NULL,
      shipping_city TEXT NOT NULL,
      shipping_country TEXT NOT NULL,
      shipping_method TEXT NOT NULL,
      payment_method TEXT NOT NULL,
      subtotal REAL NOT NULL,
      discount_amount REAL NOT NULL DEFAULT 0,
      shipping_cost REAL NOT NULL DEFAULT 0,
      tax_amount REAL NOT NULL DEFAULT 0,
      total REAL NOT NULL,
      coupon_code TEXT,
      status TEXT NOT NULL,
      tracking_number TEXT,
      estimated_delivery TEXT,
      notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      product_name TEXT NOT NULL,
      product_sku TEXT NOT NULL,
      product_image TEXT,
      selected_color TEXT,
      quantity INTEGER NOT NULL,
      unit_price REAL NOT NULL,
      line_total REAL NOT NULL
    );

    CREATE TABLE IF NOT EXISTS inventory_logs (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      product_name TEXT NOT NULL,
      change_amount INTEGER NOT NULL,
      previous_stock INTEGER NOT NULL,
      new_stock INTEGER NOT NULL,
      reason TEXT NOT NULL,
      actor TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS activity_events (
      id TEXT PRIMARY KEY,
      event_type TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      meta_json TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS chat_messages (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      sender TEXT NOT NULL,
      sender_name TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS subscribers (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS apps (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      version TEXT NOT NULL,
      category TEXT NOT NULL,
      language TEXT NOT NULL,
      platforms_json TEXT,
      rating REAL NOT NULL DEFAULT 4.8,
      reviews_count INTEGER NOT NULL DEFAULT 1,
      downloads INTEGER NOT NULL DEFAULT 0,
      size TEXT NOT NULL,
      developer TEXT NOT NULL,
      icon TEXT NOT NULL DEFAULT '📦',
      license TEXT NOT NULL DEFAULT 'MIT',
      price TEXT NOT NULL DEFAULT 'Free',
      is_featured INTEGER NOT NULL DEFAULT 0,
      is_verified INTEGER NOT NULL DEFAULT 1,
      source_provider TEXT DEFAULT 'NEX Official',
      live_url TEXT DEFAULT '',
      repo_url TEXT DEFAULT '',
      sha256_hash TEXT DEFAULT '',
      security_score INTEGER DEFAULT 99,
      permissions_json TEXT DEFAULT '[]',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS server_nodes (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      region TEXT NOT NULL,
      provider TEXT NOT NULL,
      ip_address TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'online',
      cpu_load INTEGER NOT NULL DEFAULT 25,
      ram_usage INTEGER NOT NULL DEFAULT 45,
      latency_ms INTEGER NOT NULL DEFAULT 15,
      active_connections INTEGER NOT NULL DEFAULT 120,
      rps INTEGER NOT NULL DEFAULT 500,
      uptime_pct REAL NOT NULL DEFAULT 99.99,
      version TEXT NOT NULL DEFAULT 'v2.6.0-wal',
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS integrations (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      provider TEXT NOT NULL,
      category TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'connected',
      endpoint_url TEXT NOT NULL,
      webhook_secret_masked TEXT NOT NULL,
      events_synced INTEGER NOT NULL DEFAULT 0,
      latency_ms INTEGER NOT NULL DEFAULT 15,
      last_sync_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS security_events (
      id TEXT PRIMARY KEY,
      event_type TEXT NOT NULL,
      severity TEXT NOT NULL DEFAULT 'low',
      source_ip TEXT NOT NULL,
      target_resource TEXT NOT NULL,
      action_taken TEXT NOT NULL,
      description TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS push_notifications (
      id TEXT PRIMARY KEY,
      channel TEXT NOT NULL DEFAULT 'realtime',
      priority TEXT NOT NULL DEFAULT 'normal',
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      action_url TEXT DEFAULT 'store',
      is_read INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS terminal_logs (
      id TEXT PRIMARY KEY,
      command TEXT NOT NULL,
      output TEXT NOT NULL,
      exit_code INTEGER NOT NULL DEFAULT 0,
      actor TEXT NOT NULL DEFAULT 'root@nex-edge',
      duration_ms REAL NOT NULL DEFAULT 1.2,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS terminal_scripts (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      title TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'Automation',
      description TEXT NOT NULL,
      author TEXT NOT NULL DEFAULT 'root@nex-edge',
      script_body TEXT NOT NULL,
      run_count INTEGER NOT NULL DEFAULT 0,
      last_status TEXT NOT NULL DEFAULT 'READY',
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS bto_configs (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      engineer TEXT NOT NULL DEFAULT 'NEX Hardware Lab',
      slots_json TEXT NOT NULL,
      total_wattage INTEGER NOT NULL DEFAULT 0,
      psu_capacity INTEGER NOT NULL DEFAULT 1250,
      subtotal REAL NOT NULL DEFAULT 0,
      discount_amount REAL NOT NULL DEFAULT 0,
      final_price REAL NOT NULL DEFAULT 0,
      notes TEXT DEFAULT '',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS app_installs (
      id TEXT PRIMARY KEY,
      app_id TEXT UNIQUE NOT NULL,
      app_name TEXT NOT NULL,
      version TEXT NOT NULL,
      source_provider TEXT NOT NULL DEFAULT 'NEX Official',
      install_path TEXT NOT NULL,
      sandbox_url TEXT NOT NULL,
      sha256_verified TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'INSTALLED',
      installed_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS polyglot_automations (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      title TEXT NOT NULL,
      language TEXT NOT NULL DEFAULT 'python',
      runtime TEXT NOT NULL DEFAULT 'Python 3.12',
      category TEXT NOT NULL DEFAULT 'AI & Automation',
      description TEXT NOT NULL,
      code TEXT NOT NULL,
      run_count INTEGER NOT NULL DEFAULT 0,
      ai_enhanced INTEGER NOT NULL DEFAULT 1,
      last_output TEXT DEFAULT '',
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS subscription_plans (
      id TEXT PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      tagline TEXT NOT NULL,
      price_monthly REAL NOT NULL DEFAULT 0,
      price_yearly REAL NOT NULL DEFAULT 0,
      currency TEXT NOT NULL DEFAULT 'USD',
      tier_level INTEGER NOT NULL DEFAULT 1,
      badge TEXT DEFAULT 'STANDARD',
      features_json TEXT NOT NULL DEFAULT '[]',
      limits_json TEXT NOT NULL DEFAULT '{}',
      is_popular INTEGER NOT NULL DEFAULT 0,
      active INTEGER NOT NULL DEFAULT 1,
      updated_by TEXT NOT NULL DEFAULT 'Admin',
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS user_subscriptions (
      id TEXT PRIMARY KEY,
      plan_id TEXT NOT NULL,
      plan_name TEXT NOT NULL,
      subscriber_name TEXT NOT NULL,
      subscriber_email TEXT NOT NULL,
      billing_cycle TEXT NOT NULL DEFAULT 'monthly',
      amount_paid REAL NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'ACTIVE',
      api_key_preview TEXT NOT NULL,
      subscribed_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS mobile_addons (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      framework TEXT NOT NULL,
      version TEXT NOT NULL DEFAULT '1.0.0',
      status TEXT NOT NULL DEFAULT 'READY',
      category TEXT NOT NULL DEFAULT 'Mobile Bridge',
      description TEXT NOT NULL,
      endpoint_path TEXT NOT NULL DEFAULT '/api/mobile/sdk-config',
      sdk_snippet TEXT NOT NULL DEFAULT '',
      enabled INTEGER NOT NULL DEFAULT 1,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS user_accounts (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      display_name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'developer',
      company TEXT DEFAULT 'Independent Developer',
      avatar TEXT DEFAULT '👩‍💻',
      status TEXT NOT NULL DEFAULT 'active',
      permissions_json TEXT NOT NULL DEFAULT '["publish_app","edit_own_app"]',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS hosting_deployments (
      id TEXT PRIMARY KEY,
      app_id TEXT NOT NULL,
      app_name TEXT NOT NULL,
      owner_username TEXT NOT NULL,
      provider TEXT NOT NULL DEFAULT 'Netlify',
      environment TEXT NOT NULL DEFAULT 'production',
      region TEXT NOT NULL DEFAULT 'Global Edge CDN',
      deploy_url TEXT NOT NULL,
      build_command TEXT NOT NULL DEFAULT 'npm run build',
      min_instances INTEGER NOT NULL DEFAULT 1,
      max_instances INTEGER NOT NULL DEFAULT 12,
      current_instances INTEGER NOT NULL DEFAULT 2,
      cpu_utilization INTEGER NOT NULL DEFAULT 28,
      memory_mb INTEGER NOT NULL DEFAULT 512,
      auto_scale INTEGER NOT NULL DEFAULT 1,
      ssl_verified INTEGER NOT NULL DEFAULT 1,
      status TEXT NOT NULL DEFAULT 'HEALTHY',
      last_deployed_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS blocked_ips (
      id TEXT PRIMARY KEY,
      ip_address TEXT UNIQUE NOT NULL,
      cidr_range TEXT NOT NULL,
      reason TEXT NOT NULL,
      threat_level TEXT NOT NULL DEFAULT 'high',
      blocked_by TEXT NOT NULL DEFAULT 'Root Admin WAF',
      hits_blocked INTEGER NOT NULL DEFAULT 1,
      auto_automation_rule TEXT DEFAULT 'Manual / WAF Rule',
      status TEXT NOT NULL DEFAULT 'ACTIVE_BLOCK',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS security_reports (
      id TEXT PRIMARY KEY,
      reporter_name TEXT NOT NULL,
      reporter_role TEXT NOT NULL DEFAULT 'user',
      target_type TEXT NOT NULL DEFAULT 'app_verification',
      target_id TEXT NOT NULL,
      category TEXT NOT NULL,
      severity TEXT NOT NULL DEFAULT 'high',
      description TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'OPEN',
      resolution_notes TEXT DEFAULT '',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS payment_transactions (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      order_number TEXT NOT NULL,
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      amount REAL NOT NULL,
      currency TEXT NOT NULL DEFAULT 'USD',
      payment_method TEXT NOT NULL,
      provider TEXT NOT NULL DEFAULT 'Stripe Live Gateway',
      status TEXT NOT NULL DEFAULT 'SETTLED',
      auth_code TEXT NOT NULL,
      receipt_hash TEXT NOT NULL,
      risk_score INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );
  `);

  // Ensure existing apps table has multi-source, image_url, resources, AI & developer system columns
  const appCols = db.prepare('PRAGMA table_info(apps)').all().map((c) => c.name);
  const alterColumns = [
    ['source_provider', "TEXT DEFAULT 'NEX Official'"],
    ['live_url', "TEXT DEFAULT ''"],
    ['repo_url', "TEXT DEFAULT ''"],
    ['sha256_hash', "TEXT DEFAULT ''"],
    ['security_score', 'INTEGER DEFAULT 99'],
    ['permissions_json', "TEXT DEFAULT '[]'"],
    ['image_url', "TEXT DEFAULT ''"],
    ['resources_json', "TEXT DEFAULT '[]'"],
    ['ai_capabilities_json', "TEXT DEFAULT '[]'"],
    ['package_type', "TEXT DEFAULT 'app'"],
    ['developer_email', "TEXT DEFAULT 'dev@nexstore.dev'"],
    ['developer_website', "TEXT DEFAULT 'https://github.com/devTechs001/nex-store'"],
    ['developer_bio', "TEXT DEFAULT 'Verified NEX Ecosystem & Open-Source Systems Publisher'"],
    ['install_command', "TEXT DEFAULT ''"],
    ['system_requirements_json', "TEXT DEFAULT '{}'"],
    ['changelog', "TEXT DEFAULT 'v1.0.0 — Verified SHA-256 sandbox runtime & anti-piracy DRM lock.'"]
  ];
  for (const [colName, colDef] of alterColumns) {
    if (!appCols.includes(colName)) {
      try {
        db.exec(`ALTER TABLE apps ADD COLUMN ${colName} ${colDef}`);
      } catch {
        // column already exists
      }
    }
  }
}

export function seedDatabase({ forceReset = false } = {}) {
  initSchema();

  if (forceReset) {
    db.exec(`
      DELETE FROM order_items;
      DELETE FROM orders;
      DELETE FROM reviews;
      DELETE FROM coupons;
      DELETE FROM inventory_logs;
      DELETE FROM activity_events;
      DELETE FROM chat_messages;
      DELETE FROM products;
      DELETE FROM categories;
      DELETE FROM apps;
      DELETE FROM server_nodes;
      DELETE FROM integrations;
      DELETE FROM security_events;
      DELETE FROM push_notifications;
      DELETE FROM terminal_logs;
      DELETE FROM terminal_scripts;
      DELETE FROM bto_configs;
      DELETE FROM app_installs;
      DELETE FROM polyglot_automations;
      DELETE FROM subscription_plans;
      DELETE FROM user_subscriptions;
      DELETE FROM mobile_addons;
      DELETE FROM user_accounts;
      DELETE FROM hosting_deployments;
      DELETE FROM blocked_ips;
      DELETE FROM security_reports;
      DELETE FROM payment_transactions;
    `);
  }

  // Seed user_accounts, hosting_deployments, blocked_ips, security_reports, payment_transactions
  const uaCount = db.prepare('SELECT COUNT(*) as count FROM user_accounts').get();
  if (!uaCount || uaCount.count === 0) {
    const insUa = db.prepare(`
      INSERT OR REPLACE INTO user_accounts (
        id, username, email, password_hash, display_name, role, company, avatar, status, permissions_json, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const u of INITIAL_USER_ACCOUNTS) {
      insUa.run(
        u.id, u.username, u.email, u.password_hash, u.display_name, u.role, u.company, u.avatar, u.status, u.permissions_json, u.created_at
      );
    }
  }

  const insHost = db.prepare(`
    INSERT OR REPLACE INTO hosting_deployments (
      id, app_id, app_name, owner_username, provider, environment, region, deploy_url,
      build_command, min_instances, max_instances, current_instances, cpu_utilization,
      memory_mb, auto_scale, ssl_verified, status, last_deployed_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const h of INITIAL_HOSTING_DEPLOYMENTS) {
    insHost.run(
      h.id, h.app_id, h.app_name, h.owner_username, h.provider, h.environment, h.region,
      h.deploy_url, h.build_command, h.min_instances, h.max_instances, h.current_instances,
      h.cpu_utilization, h.memory_mb, h.auto_scale, h.ssl_verified, h.status, h.last_deployed_at
    );
  }

  const blkCount = db.prepare('SELECT COUNT(*) as count FROM blocked_ips').get();
  if (!blkCount || blkCount.count === 0) {
    const insBlk = db.prepare(`
      INSERT OR REPLACE INTO blocked_ips (
        id, ip_address, cidr_range, reason, threat_level, blocked_by, hits_blocked, auto_automation_rule, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const b of INITIAL_BLOCKED_IPS) {
      insBlk.run(
        b.id, b.ip_address, b.cidr_range, b.reason, b.threat_level, b.blocked_by, b.hits_blocked, b.auto_automation_rule, b.status, b.created_at
      );
    }
  }

  const repCount = db.prepare('SELECT COUNT(*) as count FROM security_reports').get();
  if (!repCount || repCount.count === 0) {
    const insRep = db.prepare(`
      INSERT OR REPLACE INTO security_reports (
        id, reporter_name, reporter_role, target_type, target_id, category, severity, description, status, resolution_notes, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const r of INITIAL_SECURITY_REPORTS) {
      insRep.run(
        r.id, r.reporter_name, r.reporter_role, r.target_type, r.target_id, r.category, r.severity, r.description, r.status, r.resolution_notes, r.created_at
      );
    }
  }

  const payCount = db.prepare('SELECT COUNT(*) as count FROM payment_transactions').get();
  if (!payCount || payCount.count === 0) {
    const insPay = db.prepare(`
      INSERT OR REPLACE INTO payment_transactions (
        id, order_id, order_number, customer_name, customer_email, amount, currency, payment_method, provider, status, auth_code, receipt_hash, risk_score, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const p of INITIAL_PAYMENT_TRANSACTIONS) {
      insPay.run(
        p.id, p.order_id, p.order_number, p.customer_name, p.customer_email, p.amount, p.currency, p.payment_method, p.provider, p.status, p.auth_code, p.receipt_hash, p.risk_score, p.created_at
      );
    }
  }

  const nowApps = new Date().toISOString();
  const appCountRow = db.prepare('SELECT COUNT(*) as count FROM apps').get();
  if (!appCountRow || appCountRow.count < SEED_APPS.length) {
    const insertApp = db.prepare(`
      INSERT OR REPLACE INTO apps (
        id, name, description, version, category, language, platforms_json,
        rating, reviews_count, downloads, size, developer, icon, license, price,
        is_featured, is_verified, source_provider, live_url, repo_url,
        sha256_hash, security_score, permissions_json, image_url, resources_json, ai_capabilities_json, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const a of SEED_APPS) {
      const defaultResources = JSON.stringify([
        { type: 'image', name: 'og-preview-banner.svg', url: `/api/app-art/${a.id}.svg`, size: '24 KB' },
        { type: 'manifest', name: 'nex-app-manifest.json', url: `/api/apps/${a.id}/package`, size: a.size || '18 MB' },
        { type: 'security', name: 'drm-sha256-attestation.sig', url: a.repo_url || 'https://github.com/devTechs001/nex-store', size: '4 KB' }
      ]);
      const defaultAi = JSON.stringify([
        'AI Zero-Trust Sandbox Runtime Verified',
        `Polyglot ${a.language || 'Rust/Python'} Bridge Ready`,
        'Anti-Piracy Cryptographic DRM Watermark Locked'
      ]);
      insertApp.run(
        a.id,
        a.name,
        a.description,
        a.version,
        a.category,
        a.language,
        a.platforms_json,
        a.rating,
        a.reviews_count,
        a.downloads,
        a.size,
        a.developer,
        a.icon,
        a.license,
        a.price,
        a.is_featured,
        a.is_verified,
        a.source_provider || 'NEX Official',
        a.live_url || '',
        a.repo_url || '',
        a.sha256_hash || 'e3b0c44298fc1c149afbf4c8996fb924',
        a.security_score || 99,
        a.permissions_json || '[]',
        a.image_url || `/api/app-art/${a.id}.svg`,
        a.resources_json || defaultResources,
        a.ai_capabilities_json || defaultAi,
        nowApps
      );
    }
  }

  // Ensure any pre-existing app rows have image_url, resources_json, ai_capabilities_json & system metadata populated
  const allExistingApps = db.prepare('SELECT id, name, category, language, size, repo_url, image_url, resources_json, ai_capabilities_json, install_command, system_requirements_json FROM apps').all();
  const updateAppMeta = db.prepare('UPDATE apps SET image_url = ?, resources_json = ?, ai_capabilities_json = ?, install_command = ?, system_requirements_json = ?, package_type = ? WHERE id = ?');
  for (const row of allExistingApps) {
    if (!row.image_url || !row.resources_json || row.resources_json === '[]' || !row.install_command) {
      const imgUrl = row.image_url || `/api/app-art/${row.id}.svg`;
      const resJson =
        row.resources_json && row.resources_json !== '[]'
          ? row.resources_json
          : JSON.stringify([
              { type: 'image', name: 'og-preview-banner.svg', url: imgUrl, size: '24 KB' },
              { type: 'manifest', name: 'nex-app-manifest.json', url: `/api/apps/${row.id}/package`, size: row.size || '18 MB' },
              { type: 'security', name: 'drm-sha256-attestation.sig', url: row.repo_url || 'https://github.com/devTechs001/nex-store', size: '4 KB' }
            ]);
      const aiJson =
        row.ai_capabilities_json && row.ai_capabilities_json !== '[]'
          ? row.ai_capabilities_json
          : JSON.stringify([
              'AI Zero-Trust Sandbox Runtime Verified',
              `Polyglot ${row.language || 'Rust/Python'} Bridge Ready`,
              'Anti-Piracy Cryptographic DRM Watermark Locked'
            ]);
      const instCmd = row.install_command || `nex install ${row.id} --verify-sha256 --mount=/opt/nex-apps/${row.id}`;
      const sysReq =
        row.system_requirements_json && row.system_requirements_json !== '{}'
          ? row.system_requirements_json
          : JSON.stringify({
              os: 'Linux / macOS / Windows / NEX Sandbox / Flutter Bridge',
              ram: '256 MB Isolated Heap',
              arch: 'x86_64 / ARM64 / WASM32',
              mobileBridge: 'Flutter MethodChannel & React Native JSI Ready'
            });
      const pkgType = row.category === 'cli' || row.category === 'utility' ? 'system' : 'app';
      updateAppMeta.run(imgUrl, resJson, aiJson, instCmd, sysReq, pkgType, row.id);
    }
  }

  const plansCountRow = db.prepare('SELECT COUNT(*) as count FROM subscription_plans').get();
  if (!plansCountRow || plansCountRow.count === 0) {
    const insertPlan = db.prepare(`
      INSERT OR REPLACE INTO subscription_plans (
        id, code, name, tagline, price_monthly, price_yearly, currency, tier_level,
        badge, features_json, limits_json, is_popular, active, updated_by, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const pl of SEED_SUBSCRIPTION_PLANS) {
      insertPlan.run(
        pl.id,
        pl.code,
        pl.name,
        pl.tagline,
        pl.price_monthly,
        pl.price_yearly,
        pl.currency || 'USD',
        pl.tier_level || 1,
        pl.badge || 'STANDARD',
        pl.features_json,
        pl.limits_json,
        pl.is_popular ? 1 : 0,
        pl.active ?? 1,
        pl.updated_by || 'System Seed',
        pl.updated_at || nowApps
      );
    }
  }

  const userSubsCountRow = db.prepare('SELECT COUNT(*) as count FROM user_subscriptions').get();
  if (!userSubsCountRow || userSubsCountRow.count === 0) {
    const insertUserSub = db.prepare(`
      INSERT OR REPLACE INTO user_subscriptions (
        id, plan_id, plan_name, subscriber_name, subscriber_email, billing_cycle, amount_paid, status, api_key_preview, subscribed_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const us of SEED_USER_SUBSCRIPTIONS) {
      insertUserSub.run(
        us.id,
        us.plan_id,
        us.plan_name,
        us.subscriber_name,
        us.subscriber_email,
        us.billing_cycle,
        us.amount_paid,
        us.status,
        us.api_key_preview,
        us.subscribed_at || nowApps
      );
    }
  }

  const mobileAddonsCountRow = db.prepare('SELECT COUNT(*) as count FROM mobile_addons').get();
  if (!mobileAddonsCountRow || mobileAddonsCountRow.count === 0) {
    const insertMob = db.prepare(`
      INSERT OR REPLACE INTO mobile_addons (
        id, name, slug, framework, version, status, category, description, endpoint_path, sdk_snippet, enabled, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const m of SEED_MOBILE_ADDONS) {
      insertMob.run(
        m.id,
        m.name,
        m.slug,
        m.framework,
        m.version,
        m.status,
        m.category,
        m.description,
        m.endpoint_path,
        m.sdk_snippet,
        m.enabled ?? 1,
        m.updated_at || nowApps
      );
    }
  }

  const polyCountRow = db.prepare('SELECT COUNT(*) as count FROM polyglot_automations').get();
  if (!polyCountRow || polyCountRow.count === 0) {
    const insertPoly = db.prepare(`
      INSERT OR REPLACE INTO polyglot_automations (
        id, name, title, language, runtime, category, description, code, run_count, ai_enhanced, last_output, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const p of SEED_POLYGLOT_AUTOMATIONS) {
      insertPoly.run(
        p.id,
        p.name,
        p.title,
        p.language,
        p.runtime,
        p.category,
        p.description,
        p.code,
        p.run_count || 10,
        p.ai_enhanced ?? 1,
        p.last_output || '',
        p.updated_at || nowApps
      );
    }
  }

  const installsCountRow = db.prepare('SELECT COUNT(*) as count FROM app_installs').get();
  if (!installsCountRow || installsCountRow.count === 0) {
    const insertInstall = db.prepare(`
      INSERT OR REPLACE INTO app_installs (
        id, app_id, app_name, version, source_provider, install_path, sandbox_url, sha256_verified, status, installed_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'INSTALLED', ?)
    `);
    for (const a of SEED_APPS.slice(0, 3)) {
      insertInstall.run(
        `inst-${a.id}`,
        a.id,
        a.name,
        a.version,
        a.source_provider || 'NEX Official',
        `/opt/nex-apps/${a.id}`,
        `/api/sandbox/${a.id}`,
        a.sha256_hash || 'e3b0c44298fc1c149afbf4c8996fb924',
        nowApps
      );
    }
  }

  const srvCount = db.prepare('SELECT COUNT(*) as count FROM server_nodes').get();
  if (!srvCount || srvCount.count === 0) {
    const insertSrv = db.prepare(`
      INSERT INTO server_nodes (
        id, name, region, provider, ip_address, status, cpu_load, ram_usage,
        latency_ms, active_connections, rps, uptime_pct, version, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const s of SEED_SERVER_NODES) {
      insertSrv.run(
        s.id, s.name, s.region, s.provider, s.ip_address, s.status,
        s.cpu_load, s.ram_usage, s.latency_ms, s.active_connections,
        s.rps, s.uptime_pct, s.version, nowApps
      );
    }
  }

  const intCount = db.prepare('SELECT COUNT(*) as count FROM integrations').get();
  if (!intCount || intCount.count === 0) {
    const insertInt = db.prepare(`
      INSERT INTO integrations (
        id, name, provider, category, status, endpoint_url,
        webhook_secret_masked, events_synced, latency_ms, last_sync_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const item of SEED_INTEGRATIONS) {
      insertInt.run(
        item.id, item.name, item.provider, item.category, item.status,
        item.endpoint_url, item.webhook_secret_masked, item.events_synced,
        item.latency_ms, nowApps
      );
    }
  }

  const secCount = db.prepare('SELECT COUNT(*) as count FROM security_events').get();
  if (!secCount || secCount.count === 0) {
    const insertSec = db.prepare(`
      INSERT INTO security_events (
        id, event_type, severity, source_ip, target_resource, action_taken, description, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const sec of SEED_SECURITY_EVENTS) {
      insertSec.run(
        sec.id, sec.event_type, sec.severity, sec.source_ip,
        sec.target_resource, sec.action_taken, sec.description, sec.created_at
      );
    }
  }

  const notifCount = db.prepare('SELECT COUNT(*) as count FROM push_notifications').get();
  if (!notifCount || notifCount.count === 0) {
    const insertNotif = db.prepare(`
      INSERT INTO push_notifications (
        id, channel, priority, title, message, action_url, is_read, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const n of SEED_NOTIFICATIONS) {
      insertNotif.run(
        n.id, n.channel, n.priority, n.title, n.message,
        n.action_url, n.is_read, n.created_at
      );
    }
  }

  const termCount = db.prepare('SELECT COUNT(*) as count FROM terminal_logs').get();
  if (!termCount || termCount.count === 0) {
    const insertTerm = db.prepare(`
      INSERT INTO terminal_logs (
        id, command, output, exit_code, actor, duration_ms, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    for (const t of SEED_TERMINAL_LOGS) {
      insertTerm.run(
        t.id, t.command, t.output, t.exit_code, t.actor, t.duration_ms, t.created_at
      );
    }
  }

  const scriptCount = db.prepare('SELECT COUNT(*) as count FROM terminal_scripts').get();
  if (!scriptCount || scriptCount.count === 0) {
    const insertScript = db.prepare(`
      INSERT INTO terminal_scripts (
        id, name, title, category, description, author, script_body, run_count, last_status, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const s of SEED_TERMINAL_SCRIPTS) {
      insertScript.run(
        s.id, s.name, s.title, s.category, s.description,
        s.author, s.script_body, s.run_count, s.last_status, s.updated_at
      );
    }
  }

  const btoCount = db.prepare('SELECT COUNT(*) as count FROM bto_configs').get();
  if (!btoCount || btoCount.count === 0) {
    const insertBto = db.prepare(`
      INSERT INTO bto_configs (
        id, name, engineer, slots_json, total_wattage, psu_capacity, subtotal, discount_amount, final_price, notes, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const b of SEED_BTO_CONFIGS) {
      insertBto.run(
        b.id,
        b.name,
        b.engineer,
        b.slots_json,
        b.total_wattage,
        b.psu_capacity,
        b.subtotal,
        b.discount_amount,
        b.final_price,
        b.notes,
        b.created_at
      );
    }
  }

  const countRow = db.prepare('SELECT COUNT(*) as count FROM products').get();
  if (countRow && countRow.count > 0) {
    return { seeded: false, productCount: countRow.count };
  }

  const now = new Date().toISOString();

  const insertCat = db.prepare(`
    INSERT INTO categories (id, name, slug, description, icon, accent_color)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  for (const cat of SEED_CATEGORIES) {
    insertCat.run(cat.id, cat.name, cat.slug, cat.description, cat.icon, cat.accent_color);
  }

  const insertProd = db.prepare(`
    INSERT INTO products (
      id, sku, name, tagline, description, category, brand,
      price, original_price, cost_price, stock, low_stock_threshold,
      rating, review_count, sold_count, featured, is_flash_sale,
      flash_sale_ends_at, badge, image_url, gallery_json, specs_json,
      colors_json, tags_json, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertInvLog = db.prepare(`
    INSERT INTO inventory_logs (
      id, product_id, product_name, change_amount, previous_stock, new_stock, reason, actor, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const p of SEED_PRODUCTS) {
    insertProd.run(
      p.id, p.sku, p.name, p.tagline, p.description, p.category, p.brand,
      p.price, p.original_price, p.cost_price, p.stock, p.low_stock_threshold,
      p.rating, p.review_count, p.sold_count, p.featured, p.is_flash_sale,
      p.flash_sale_ends_at, p.badge, p.image_url, p.gallery_json, p.specs_json,
      p.colors_json, p.tags_json, now, now
    );

    insertInvLog.run(
      `inv-${p.id}`,
      p.id,
      p.name,
      p.stock,
      0,
      p.stock,
      'Initial Warehouse Allocation',
      'System Provisioner',
      now
    );
  }

  const insertCoupon = db.prepare(`
    INSERT INTO coupons (
      id, code, description, discount_type, discount_value, min_order_amount, max_uses, used_count, active, expires_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const c of SEED_COUPONS) {
    insertCoupon.run(
      c.id, c.code, c.description, c.discount_type, c.discount_value,
      c.min_order_amount, c.max_uses, c.used_count, c.active, c.expires_at
    );
  }

  const insertReview = db.prepare(`
    INSERT INTO reviews (
      id, product_id, author_name, author_location, rating, title, comment, verified_purchase, helpful_count, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const r of SEED_REVIEWS) {
    insertReview.run(
      r.id, r.product_id, r.author_name, r.author_location, r.rating,
      r.title, r.comment, r.verified_purchase, r.helpful_count, r.created_at
    );
  }

  const insertOrder = db.prepare(`
    INSERT INTO orders (
      id, order_number, customer_name, customer_email, customer_phone,
      shipping_address, shipping_city, shipping_country, shipping_method,
      payment_method, subtotal, discount_amount, shipping_cost, tax_amount,
      total, coupon_code, status, tracking_number, estimated_delivery,
      notes, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertOrderItem = db.prepare(`
    INSERT INTO order_items (
      id, order_id, product_id, product_name, product_sku, product_image,
      selected_color, quantity, unit_price, line_total
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const o of SEED_ORDERS) {
    insertOrder.run(
      o.id, o.order_number, o.customer_name, o.customer_email, o.customer_phone,
      o.shipping_address, o.shipping_city, o.shipping_country, o.shipping_method,
      o.payment_method, o.subtotal, o.discount_amount, o.shipping_cost, o.tax_amount,
      o.total, o.coupon_code, o.status, o.tracking_number, o.estimated_delivery,
      o.notes, o.created_at, o.updated_at
    );
    for (const item of o.items) {
      insertOrderItem.run(
        item.id, o.id, item.product_id, item.product_name, item.product_sku,
        item.product_image, item.selected_color, item.quantity, item.unit_price, item.line_total
      );
    }
  }

  const insertActivity = db.prepare(`
    INSERT INTO activity_events (id, event_type, title, message, meta_json, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const initialEvents = [
    {
      id: 'act-1',
      event_type: 'order_placed',
      title: 'Order #NEX-8943 Placed',
      message: 'Chloe Takahashi in London purchased VisionAir Pro Spatial Glasses + Spectre Carbon Mouse ($568.51)',
      meta_json: JSON.stringify({ order_number: 'NEX-8943', city: 'London', amount: 568.51 }),
      created_at: '2026-10-27T07:20:00Z'
    },
    {
      id: 'act-2',
      event_type: 'order_status',
      title: 'Order #NEX-8942 Dispatched',
      message: 'Courier picked up Aether Pro X1 & VoltMatrix 240W for same-day delivery in Nairobi',
      meta_json: JSON.stringify({ order_number: 'NEX-8942', status: 'shipped' }),
      created_at: '2026-10-27T08:10:00Z'
    },
    {
      id: 'act-3',
      event_type: 'review_added',
      title: 'New 5★ Verified Review',
      message: 'Sofia Lindqvist rated Solaris Apex Titanium Chronometer 5.0 stars',
      meta_json: JSON.stringify({ product_id: 'prod-solaris-watch', rating: 5 }),
      created_at: '2026-10-26T16:12:00Z'
    },
    {
      id: 'act-4',
      event_type: 'price_drop',
      title: 'Flash Deal Activated',
      message: 'Aether Pro X1 Planar Headphones dropped from $549 to $449 (-18%)',
      meta_json: JSON.stringify({ product_id: 'prod-aether-pro', price: 449 }),
      created_at: '2026-10-26T12:00:00Z'
    }
  ];

  for (const ev of initialEvents) {
    insertActivity.run(ev.id, ev.event_type, ev.title, ev.message, ev.meta_json, ev.created_at);
  }

  const insertChat = db.prepare(`
    INSERT INTO chat_messages (id, session_id, sender, sender_name, message, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  insertChat.run(
    'chat-welcome-1',
    'global',
    'concierge',
    'NEX Live Concierge',
    'Welcome to NEX Store! Ask me about specs, stock availability, promo codes (try NEX20 or WELCOME10), or live order tracking.',
    now
  );

  return { seeded: true, productCount: SEED_PRODUCTS.length };
}

export function formatProductRow(row) {
  if (!row) return null;
  return {
    ...row,
    featured: Boolean(row.featured),
    is_flash_sale: Boolean(row.is_flash_sale),
    gallery: safeParseJson(row.gallery_json, []),
    specs: safeParseJson(row.specs_json, {}),
    colors: safeParseJson(row.colors_json, []),
    tags: safeParseJson(row.tags_json, [])
  };
}

function safeParseJson(str, fallback) {
  if (!str) return fallback;
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

export function recordActivityEvent({ event_type, title, message, meta = {} }) {
  const id = `act-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const created_at = new Date().toISOString();
  db.prepare(`
    INSERT INTO activity_events (id, event_type, title, message, meta_json, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, event_type, title, message, JSON.stringify(meta), created_at);

  return {
    id,
    event_type,
    title,
    message,
    meta,
    created_at
  };
}

export function recordPushNotification({
  channel = 'realtime',
  priority = 'normal',
  title,
  message,
  action_url = 'store'
}) {
  const id = `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const created_at = new Date().toISOString();
  db.prepare(`
    INSERT INTO push_notifications (id, channel, priority, title, message, action_url, is_read, created_at)
    VALUES (?, ?, ?, ?, ?, ?, 0, ?)
  `).run(id, channel, priority, title, message, action_url, created_at);

  return {
    id,
    channel,
    priority,
    title,
    message,
    action_url,
    is_read: 0,
    created_at
  };
}

export function recordSecurityEvent({
  event_type = 'security_audit',
  severity = 'low',
  source_ip = '196.216.84.12',
  target_resource = 'System Core',
  action_taken = 'VERIFIED',
  description = 'Security check completed'
}) {
  const id = `sec-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const created_at = new Date().toISOString();
  db.prepare(`
    INSERT INTO security_events (id, event_type, severity, source_ip, target_resource, action_taken, description, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, event_type, severity, source_ip, target_resource, action_taken, description, created_at);

  return {
    id,
    event_type,
    severity,
    source_ip,
    target_resource,
    action_taken,
    description,
    created_at
  };
}

export function recordTerminalLog({
  command,
  output,
  exit_code = 0,
  actor = 'root@nex-edge-nbo',
  duration_ms = 1.2
}) {
  const id = `term-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const created_at = new Date().toISOString();
  db.prepare(`
    INSERT INTO terminal_logs (id, command, output, exit_code, actor, duration_ms, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, command, output, exit_code, actor, duration_ms, created_at);

  return {
    id,
    command,
    output,
    exit_code,
    actor,
    duration_ms,
    created_at
  };
}
