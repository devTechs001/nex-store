import assert from 'node:assert/strict';
import { db, seedDatabase, formatProductRow } from './db.js';
import { renderProductSvg } from './productArt.js';

console.log('Running NEX Store SQLite & Subsystems Verification Suite...');

// 1. Ensure schema & seed
const seedResult = seedDatabase();
assert.ok(seedResult.productCount >= 12, 'Expected at least 12 seeded flagship products');

// 2. Verify all 15 relational tables exist
const tables = db
  .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
  .all()
  .map((r) => r.name);

const expectedTables = [
  'categories',
  'products',
  'apps',
  'reviews',
  'coupons',
  'orders',
  'order_items',
  'inventory_logs',
  'activity_events',
  'chat_messages',
  'subscribers',
  'server_nodes',
  'integrations',
  'security_events',
  'push_notifications'
];

for (const tbl of expectedTables) {
  assert.ok(tables.includes(tbl), `Missing SQLite table: ${tbl}`);
}

// 3. Verify Multi-Source Apps, Server Nodes, Integrations & Security Events
const appCount = db.prepare('SELECT COUNT(*) as c FROM apps').get().c;
const srvCount = db.prepare('SELECT COUNT(*) as c FROM server_nodes').get().c;
const intCount = db.prepare('SELECT COUNT(*) as c FROM integrations').get().c;
const secCount = db.prepare('SELECT COUNT(*) as c FROM security_events').get().c;
assert.ok(appCount >= 8, 'Expected at least 8 seeded multi-source apps');
assert.ok(srvCount >= 6, 'Expected at least 6 seeded edge server nodes');
assert.ok(intCount >= 8, 'Expected at least 8 seeded platform integrations');
assert.ok(secCount >= 5, 'Expected at least 5 seeded security events');

// 4. Verify Product Formatting & SVG Studio Render
const sampleProd = formatProductRow(db.prepare('SELECT * FROM products LIMIT 1').get());
assert.ok(sampleProd.id && sampleProd.sku && Array.isArray(sampleProd.colors));

const svgOutput = renderProductSvg(sampleProd.id, { view: 'blueprint' }, sampleProd);
assert.ok(svgOutput.includes('<svg') && svgOutput.includes(sampleProd.sku));

console.log('✅ All 15 SQLite tables, multi-source apps, edge servers, security shield, and CAD SVG renders verified!');
