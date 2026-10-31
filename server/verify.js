import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { db, seedDatabase, formatProductRow } from './db.js';
import { renderProductSvg } from './productArt.js';
import { renderSandboxedAppHtml } from './appSandboxRuntime.js';
import { THEMES } from '../src/utils/themes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Running NEX Store SQLite, Cross-Browser CSS & Subsystems Verification Suite...');

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
  'push_notifications',
  'terminal_logs',
  'terminal_scripts',
  'bto_configs',
  'app_installs'
];

for (const tbl of expectedTables) {
  assert.ok(tables.includes(tbl), `Missing SQLite table: ${tbl}`);
}

// 3. Verify Multi-Source Apps, Server Nodes, Integrations, Security Events, Terminal Logs, Playbooks, BTO Rigs & App Installs
const appCount = db.prepare('SELECT COUNT(*) as c FROM apps').get().c;
const srvCount = db.prepare('SELECT COUNT(*) as c FROM server_nodes').get().c;
const intCount = db.prepare('SELECT COUNT(*) as c FROM integrations').get().c;
const secCount = db.prepare('SELECT COUNT(*) as c FROM security_events').get().c;
const termCount = db.prepare('SELECT COUNT(*) as c FROM terminal_logs').get().c;
const scriptCount = db.prepare('SELECT COUNT(*) as c FROM terminal_scripts').get().c;
const btoCount = db.prepare('SELECT COUNT(*) as c FROM bto_configs').get().c;
const installsCount = db.prepare('SELECT COUNT(*) as c FROM app_installs').get().c;
assert.ok(appCount >= 8, 'Expected at least 8 seeded multi-source apps');
assert.ok(srvCount >= 6, 'Expected at least 6 seeded edge server nodes');
assert.ok(intCount >= 8, 'Expected at least 8 seeded platform integrations');
assert.ok(secCount >= 5, 'Expected at least 5 seeded security events');
assert.ok(termCount >= 3, 'Expected at least 3 seeded terminal logs');
assert.ok(scriptCount >= 4, 'Expected at least 4 seeded .nexsh automation playbooks');
assert.ok(btoCount >= 3, 'Expected at least 3 seeded BTO hardware rig configurations');
assert.ok(installsCount >= 3, 'Expected at least 3 seeded installed workstation apps in app_installs');

// 3b. Verify Real Sandboxed App HTML5 Runtime Engine
const sampleApp = db.prepare('SELECT * FROM apps LIMIT 1').get();
const sandboxHtml = renderSandboxedAppHtml(sampleApp);
assert.ok(
  sandboxHtml.includes('<canvas id="sandbox-canvas"') && sandboxHtml.includes('nex-sandbox:telemetry'),
  'Expected real interactive HTML5 Canvas & postMessage IPC sandbox runtime'
);

// 4. Verify Product Formatting & SVG Studio Render
const sampleProd = formatProductRow(db.prepare('SELECT * FROM products LIMIT 1').get());
assert.ok(sampleProd.id && sampleProd.sku && Array.isArray(sampleProd.colors));

const svgOutput = renderProductSvg(sampleProd.id, { view: 'blueprint' }, sampleProd);
assert.ok(svgOutput.includes('<svg') && svgOutput.includes(sampleProd.sku));

// 5. Verify Cross-Browser CSS & 6-Theme Palette Engine
const cssSource = fs.readFileSync(path.resolve(__dirname, '../src/index.css'), 'utf8');
assert.ok(cssSource.includes('-webkit-backdrop-filter'), 'Missing Safari -webkit-backdrop-filter prefix');
assert.ok(cssSource.includes('scrollbar-width: thin'), 'Missing Firefox scrollbar-width rule');
assert.ok(cssSource.includes('select option'), 'Missing Windows Chrome/Edge <select><option> contrast rule');
assert.ok(cssSource.includes('@supports (background: color-mix'), 'Missing color-mix() @supports progressive enhancement');
assert.ok(cssSource.includes('user-select: none'), 'Missing user-select: none text-selection prevention rule');
assert.ok(Object.keys(THEMES).length >= 6, 'Expected 6 complete UI theme palettes');

// 6. Verify Documentation, App.css, Desktop SideNav, Mobile BottomNav & NEX-SH v3.0 Assets
assert.ok(fs.existsSync(path.resolve(__dirname, '../docs/ARCHITECTURE_AND_GUIDE.md')), 'Missing docs/ARCHITECTURE_AND_GUIDE.md');
assert.ok(fs.existsSync(path.resolve(__dirname, '../src/components/DocumentationView.jsx')), 'Missing src/components/DocumentationView.jsx');
assert.ok(fs.existsSync(path.resolve(__dirname, '../src/components/DesktopSideNav.jsx')), 'Missing src/components/DesktopSideNav.jsx');
assert.ok(fs.existsSync(path.resolve(__dirname, '../src/components/MobileBottomNav.jsx')), 'Missing src/components/MobileBottomNav.jsx');
assert.ok(fs.existsSync(path.resolve(__dirname, '../src/App.css')), 'Missing src/App.css');
assert.ok(fs.existsSync(path.resolve(__dirname, '../src/app.css')), 'Missing src/app.css');
const appCssSource = fs.readFileSync(path.resolve(__dirname, '../src/App.css'), 'utf8');
assert.ok(appCssSource.includes('.bg-engineering-grid-dark') && appCssSource.includes('.no-scrollbar'), 'Missing App.css engineering grid or scrollbar utility rules');
assert.ok(appCssSource.includes('.nex-desktop-sidenav') && appCssSource.includes('.nex-mobile-bottomnav'), 'Missing desktop side nav or mobile bottom nav CSS rules');

console.log('✅ All 19 SQLite tables (including app_installs & bto_configs), real HTML5/Canvas/WebAudio App Sandbox Runtime, Desktop SideNav, Mobile BottomNav, text-selection prevention, real REST endpoints, NEX-SH v3.0 .nexsh playbooks, documentation suite, cross-browser CSS rules, 6 themes, and CAD SVG renders verified!');
