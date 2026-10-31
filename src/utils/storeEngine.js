import { renderProductSvg } from '../../server/productArt.js';
import {
  SEED_CATEGORIES,
  SEED_PRODUCTS,
  SEED_APPS,
  SEED_COUPONS,
  SEED_REVIEWS,
  SEED_ORDERS,
  SEED_SERVER_NODES,
  SEED_INTEGRATIONS,
  SEED_SECURITY_EVENTS,
  SEED_NOTIFICATIONS,
  SEED_TERMINAL_LOGS,
  SEED_TERMINAL_SCRIPTS,
  SEED_BTO_CONFIGS
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
  const serverNodes = SEED_SERVER_NODES.map((s) => ({ ...s, updated_at: now }));
  const integrations = SEED_INTEGRATIONS.map((i) => ({ ...i, last_sync_at: now }));
  const securityEvents = [...SEED_SECURITY_EVENTS];
  const notifications = [...SEED_NOTIFICATIONS];
  const terminalLogs = [...SEED_TERMINAL_LOGS];
  const terminalScripts = SEED_TERMINAL_SCRIPTS.map((s) => ({
    ...s,
    code: s.code || s.script_body
  }));
  const btoConfigs = SEED_BTO_CONFIGS.map((b) => ({
    ...b,
    slots: typeof b.slots_json === 'string' ? JSON.parse(b.slots_json) : b.slots || {}
  }));
  const appInstalls = apps.slice(0, 3).map((a) => ({
    id: `inst-${a.id}`,
    app_id: a.id,
    app_name: a.name,
    version: a.version,
    source_provider: a.source_provider || 'NEX Official',
    install_path: `/opt/nex-apps/${a.id}`,
    sandbox_url: `/api/sandbox/${a.id}`,
    sha256_verified: a.sha256_hash || 'e3b0c44298fc1c149afbf4c8996fb924',
    status: 'INSTALLED',
    installed_at: new Date().toISOString()
  }));
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
        'Welcome to NEX Store! Ask me about specs, stock availability, promo codes (try NEX20 or WELCOME10), Netlify app imports, or live order tracking.',
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
    { name: 'subscribers', rowCount: 1, rows: [{ id: 'sub-1', email: 'vip@nexstore.io', created_at: now }] },
    { name: 'server_nodes', rowCount: serverNodes.length, rows: serverNodes },
    { name: 'integrations', rowCount: integrations.length, rows: integrations },
    { name: 'security_events', rowCount: securityEvents.length, rows: securityEvents },
    { name: 'push_notifications', rowCount: notifications.length, rows: notifications },
    { name: 'terminal_logs', rowCount: terminalLogs.length, rows: terminalLogs },
    { name: 'terminal_scripts', rowCount: terminalScripts.length, rows: terminalScripts },
    { name: 'bto_configs', rowCount: btoConfigs.length, rows: btoConfigs },
    { name: 'app_installs', rowCount: appInstalls.length, rows: appInstalls }
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
    serverNodes,
    integrations,
    securityEvents,
    notifications,
    terminalLogs,
    terminalScripts,
    btoConfigs,
    appInstalls,
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
      categoryBreakdown: Object.values(catMap)
    },
    dbStats: {
      engine: 'SQLite 3 (Node.js Native DatabaseSync • WAL Mode)',
      filePath: 'data/nexstore.db',
      sizeBytes: 142336,
      sizeFormatted: '139.0 KB',
      totalTables: tables.length,
      totalRows: tables.reduce((s, t) => s + t.rowCount, 0),
      tables
    },
    presence: {
      connectedClients: 1,
      activeShoppers: 24,
      viewersByProduct: {
        'prod-aether-pro': 7,
        'prod-nova-book': 5,
        'prod-chronos-key': 4
      }
    }
  };
}
