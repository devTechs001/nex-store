import { renderProductSvg } from '../../server/productArt.js';
import {
  SEED_CATEGORIES,
  SEED_PRODUCTS,
  SEED_APPS,
  SEED_COUPONS,
  SEED_REVIEWS,
  SEED_ORDERS
} from '../../server/seedData.js';

export function getProductArtUrl(productOrId, { view = 'hero', color = null } = {}) {
  const id = typeof productOrId === 'string' ? productOrId : productOrId?.id || 'prod-aether-pro';
  const prodObj = typeof productOrId === 'object' ? productOrId : null;
  const svgString = renderProductSvg(id, { view, color }, prodObj);
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`;
}

function safeParse(str, fallback) {
  if (!str) return fallback;
  if (typeof str !== 'string') return str;
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

export function hydrateProduct(raw) {
  const colors = safeParse(raw.colors_json || raw.colors, []);
  const gallery = safeParse(raw.gallery_json || raw.gallery, [
    { label: 'Studio Hero', view: 'hero' },
    { label: 'Detail Cutaway', view: 'detail' },
    { label: 'CAD Blueprint', view: 'blueprint' },
    { label: 'Telemetry Spec', view: 'spec' }
  ]);
  const specs = safeParse(raw.specs_json || raw.specs, {});
  const tags = safeParse(raw.tags_json || raw.tags, []);
  const defaultColor = colors[0]?.hex || null;

  return {
    ...raw,
    featured: Boolean(raw.featured),
    is_flash_sale: Boolean(raw.is_flash_sale),
    colors,
    gallery,
    specs,
    tags,
    image_url: getProductArtUrl(raw, { view: 'hero', color: defaultColor })
  };
}

export function getFallbackBootstrapData() {
  const now = new Date().toISOString();
  const products = SEED_PRODUCTS.map(hydrateProduct);
  const apps = SEED_APPS.map((a) => ({ ...a, created_at: now }));
  const categories = [...SEED_CATEGORIES];
  const coupons = [...SEED_COUPONS];
  const orders = SEED_ORDERS.map((o) => ({
    ...o,
    items: (o.items || []).map((item) => ({
      ...item,
      product_image: getProductArtUrl(item.product_id, { view: 'hero' })
    }))
  }));
  const reviews = [...SEED_REVIEWS];
  const inventoryLogs = products.map((p) => ({
    id: `inv-${p.id}`,
    product_id: p.id,
    product_name: p.name,
    change_amount: p.stock,
    previous_stock: 0,
    new_stock: p.stock,
    reason: 'Initial Warehouse Allocation',
    actor: 'System Provisioner',
    created_at: now
  }));
  const activityEvents = [
    {
      id: 'act-1',
      event_type: 'order_placed',
      title: 'Order #NEX-8943 Placed',
      message: 'Chloe Takahashi in London purchased VisionAir Pro Spatial Glasses + Spectre Carbon Mouse ($568.51)',
      created_at: now
    },
    {
      id: 'act-2',
      event_type: 'order_status',
      title: 'Order #NEX-8942 Dispatched',
      message: 'Courier picked up Aether Pro X1 & VoltMatrix 240W for same-day delivery in Nairobi',
      created_at: now
    },
    {
      id: 'act-3',
      event_type: 'price_drop',
      title: 'Flash Deal Activated',
      message: 'Aether Pro X1 Planar Headphones dropped from $549 to $449 (-18%)',
      created_at: now
    }
  ];
  const chatMessages = [
    {
      id: 'chat-welcome-1',
      session_id: 'global',
      sender: 'concierge',
      sender_name: 'NEX Live Concierge',
      message:
        'Welcome to NEX Store! Ask me about specs, stock availability, promo codes (try NEX20 or WELCOME10), or live order tracking.',
      created_at: now
    }
  ];

  const totalRevenue = Number(orders.reduce((s, o) => s + o.total, 0).toFixed(2));
  const avgOrderValue = Number((totalRevenue / Math.max(1, orders.length)).toFixed(2));
  const totalUnitsInStock = products.reduce((s, p) => s + p.stock, 0);
  const lowStockCount = products.filter((p) => p.stock <= p.low_stock_threshold).length;
  const totalUnitsSold = products.reduce((s, p) => s + p.sold_count, 0);

  const catMap = {};
  for (const p of products) {
    if (!catMap[p.category]) {
      catMap[p.category] = {
        category: p.category,
        productCount: 0,
        stockCount: 0,
        soldCount: 0,
        estimatedRevenue: 0
      };
    }
    catMap[p.category].productCount += 1;
    catMap[p.category].stockCount += p.stock;
    catMap[p.category].soldCount += p.sold_count;
    catMap[p.category].estimatedRevenue = Number(
      (catMap[p.category].estimatedRevenue + p.price * p.sold_count).toFixed(2)
    );
  }

  const tables = [
    { name: 'products', rowCount: products.length, rows: products },
    { name: 'apps', rowCount: apps.length, rows: apps },
    { name: 'categories', rowCount: categories.length, rows: categories },
    { name: 'orders', rowCount: orders.length, rows: orders },
    {
      name: 'order_items',
      rowCount: orders.reduce((s, o) => s + (o.items?.length || 0), 0),
      rows: orders.flatMap((o) => o.items || [])
    },
    { name: 'reviews', rowCount: reviews.length, rows: reviews },
    { name: 'coupons', rowCount: coupons.length, rows: coupons },
    { name: 'inventory_logs', rowCount: inventoryLogs.length, rows: inventoryLogs },
    { name: 'activity_events', rowCount: activityEvents.length, rows: activityEvents },
    { name: 'chat_messages', rowCount: chatMessages.length, rows: chatMessages },
    { name: 'subscribers', rowCount: 1, rows: [{ id: 'sub-1', email: 'vip@nexstore.io', created_at: now }] }
  ].map((t) => ({
    ...t,
    columns: Object.keys(t.rows[0] || { id: '' }).map((colName, i) => ({
      name: colName,
      type: typeof t.rows[0]?.[colName] === 'number' ? 'REAL' : 'TEXT',
      pk: i === 0
    }))
  }));

  return {
    categories,
    products,
    apps,
    coupons,
    orders,
    reviews,
    inventoryLogs,
    activityEvents,
    chatMessages,
    analytics: {
      totalOrders: orders.length,
      totalRevenue,
      avgOrderValue,
      totalProducts: products.length,
      totalUnitsInStock,
      lowStockCount,
      totalUnitsSold,
      totalReviews: reviews.length,
      avgRating: 4.9,
      categoryBreakdown: Object.values(catMap).sort(
        (a, b) => b.estimatedRevenue - a.estimatedRevenue
      )
    },
    dbStats: {
      engine: 'SQLite 3 (WAL Mode + Client Replica)',
      filePath: 'data/nexstore.db',
      sizeBytes: 65536,
      sizeFormatted: '64.0 KB',
      totalTables: tables.length,
      totalRows: tables.reduce((s, t) => s + t.rowCount, 0),
      tables
    },
    presence: {
      connectedClients: 1,
      activeShoppers: 24,
      viewersByProduct: {}
    }
  };
}
