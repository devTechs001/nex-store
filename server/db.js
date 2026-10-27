import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  SEED_CATEGORIES,
  SEED_PRODUCTS,
  SEED_COUPONS,
  SEED_REVIEWS,
  SEED_ORDERS
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
  `);
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
    `);
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
