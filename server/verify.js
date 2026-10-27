import assert from 'node:assert/strict';
import { db, seedDatabase, formatProductRow } from './db.js';
import { renderProductSvg } from './productArt.js';

console.log('Running NEX Store SQLite & Backend Verification Suite...');

// 1. Ensure schema & seed
const seedResult = seedDatabase();
assert.ok(seedResult.productCount >= 12, 'Expected at least 12 seeded flagship products');

// 2. Verify all 10 relational tables exist
const tables = db
  .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
  .all()
  .map((r) => r.name);

const expectedTables = [
  'categories',
  'products',
  'reviews',
  'coupons',
  'orders',
  'order_items',
  'inventory_logs',
  'activity_events',
  'chat_messages',
  'subscribers'
];

for (const tbl of expectedTables) {
  assert.ok(tables.includes(tbl), `Missing SQLite table: ${tbl}`);
}

// 3. Verify Product Formatting & SVG Studio Render
const sampleProd = formatProductRow(db.prepare('SELECT * FROM products LIMIT 1').get());
assert.ok(sampleProd.id && sampleProd.sku && Array.isArray(sampleProd.colors));

const svgOutput = renderProductSvg(sampleProd.id, { view: 'blueprint' }, sampleProd);
assert.ok(svgOutput.includes('<svg') && svgOutput.includes(sampleProd.sku));

console.log('✅ All 10 SQLite tables, seed records, and CAD SVG renders verified!');
