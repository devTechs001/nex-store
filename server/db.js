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
  SEED_TERMINAL_LOGS
} from './seedData.js';

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
  `);

  // Ensure existing apps table has multi-source & security columns
  const appCols = db.prepare('PRAGMA table_info(apps)').all().map((c) => c.name);
  const alterColumns = [
    ['source_provider', "TEXT DEFAULT 'NEX Official'"],
    ['live_url', "TEXT DEFAULT ''"],
    ['repo_url', "TEXT DEFAULT ''"],
    ['sha256_hash', "TEXT DEFAULT ''"],
    ['security_score', 'INTEGER DEFAULT 99'],
    ['permissions_json', "TEXT DEFAULT '[]'"]
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
    `);
  }

  const nowApps = new Date().toISOString();
  const appCountRow = db.prepare('SELECT COUNT(*) as count FROM apps').get();
  if (!appCountRow || appCountRow.count < SEED_APPS.length) {
    const insertApp = db.prepare(`
      INSERT OR REPLACE INTO apps (
        id, name, description, version, category, language, platforms_json,
        rating, reviews_count, downloads, size, developer, icon, license, price,
        is_featured, is_verified, source_provider, live_url, repo_url,
        sha256_hash, security_score, permissions_json, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const a of SEED_APPS) {
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
