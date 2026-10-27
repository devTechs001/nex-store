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
  recordActivityEvent
} from './db.js';
import { renderProductSvg } from './productArt.js';

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
  'subscribers'
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

// 1. Dynamic Product Studio SVG Endpoint
app.get('/api/product-art/:idFile', (req, res) => {
  const rawId = req.params.idFile.replace(/\.svg$/i, '');
  const product = db.prepare('SELECT id, sku, name, category FROM products WHERE id = ?').get(rawId);
  const svg = renderProductSvg(rawId, req.query, product);
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
    analytics: getAnalyticsSummary(),
    dbStats: getDatabaseStats(),
    presence: getPresenceSummary()
  });
});

// 2b. Enterprise Software Apps Endpoints (SQLite + Real-Time WS)
app.get('/api/apps', (_req, res) => {
  const apps = db.prepare('SELECT * FROM apps ORDER BY is_featured DESC, downloads DESC').all();
  res.json({ apps });
});

app.post('/api/apps', (req, res) => {
  const {
    name,
    description = 'Enterprise application package',
    version = '1.0.0',
    category = 'utility',
    language = 'typescript',
    size = '24.5 MB',
    developer = 'Community Developer',
    icon = '🚀',
    license = 'MIT'
  } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'App name is required' });
  }

  const id = `app-${Date.now().toString(36)}`;
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO apps (
      id, name, description, version, category, language, platforms_json,
      rating, reviews_count, downloads, size, developer, icon, license, price,
      is_featured, is_verified, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 5.0, 1, 1, ?, ?, ?, ?, 'Free', 1, 1, ?)
  `).run(
    id,
    name.trim(),
    description.trim(),
    version.trim(),
    category,
    language,
    JSON.stringify(['linux', 'macos', 'windows']),
    size,
    developer.trim(),
    icon,
    license,
    now
  );

  const createdApp = db.prepare('SELECT * FROM apps WHERE id = ?').get(id);
  const activity = recordActivityEvent({
    event_type: 'product_created',
    title: `New App Published • ${createdApp.name}`,
    message: `${createdApp.developer} published ${createdApp.name} v${createdApp.version} (${createdApp.language})`,
    meta: { app_id: createdApp.id }
  });

  broadcast('app:created', {
    app: createdApp,
    activity,
    dbStats: getDatabaseStats()
  });

  res.status(201).json({ app: createdApp });
});

app.post('/api/apps/:id/download', (req, res) => {
  const existing = db.prepare('SELECT * FROM apps WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'App not found' });

  db.prepare('UPDATE apps SET downloads = downloads + 1 WHERE id = ?').run(existing.id);
  const updatedApp = db.prepare('SELECT * FROM apps WHERE id = ?').get(existing.id);

  const activity = recordActivityEvent({
    event_type: 'live_purchase',
    title: `App Installed • ${updatedApp.name}`,
    message: `${updatedApp.name} v${updatedApp.version} deployed (${updatedApp.downloads.toLocaleString()} total installs)`,
    meta: { app_id: updatedApp.id, downloads: updatedApp.downloads }
  });

  broadcast('app:downloaded', {
    app: updatedApp,
    activity,
    dbStats: getDatabaseStats()
  });

  res.json({ app: updatedApp });
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
    coupons: db.prepare('SELECT * FROM coupons ORDER BY active DESC').all(),
    orders: getOrdersWithItems(30),
    reviews: db.prepare('SELECT * FROM reviews ORDER BY created_at DESC LIMIT 30').all(),
    inventoryLogs: db.prepare('SELECT * FROM inventory_logs ORDER BY created_at DESC LIMIT 30').all(),
    activityEvents: db.prepare('SELECT * FROM activity_events ORDER BY created_at DESC LIMIT 25').all(),
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

// Serve frontend build or attach Vite middleware
const distPath = path.resolve(__dirname, '../dist');
if (fs.existsSync(path.join(distPath, 'index.html'))) {
  app.use(express.static(distPath));
  app.use((req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/ws')) return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

const PORT = Number(process.env.PORT) || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`NEX Store Full-Stack Server (HTTP + WebSocket + SQLite) listening on http://0.0.0.0:${PORT}`);
});
