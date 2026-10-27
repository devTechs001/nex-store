import React, { useState } from 'react';
import {
  BookOpen,
  Terminal,
  Database,
  Server,
  Shield,
  Cpu,
  Globe,
  Code2,
  Search,
  Play,
  Layers,
  CheckCircle2,
  Sparkles,
  FileCode,
  Zap,
  ExternalLink
} from 'lucide-react';

const DOC_SECTIONS = [
  { id: 'overview', label: 'Architecture & Stack', icon: Layers },
  { id: 'terminal', label: 'NEX-SH v3.0 & Scripting', icon: Terminal },
  { id: 'database', label: '17-Table SQLite Schema', icon: Database },
  { id: 'api', label: 'REST & WebSocket API', icon: Code2 },
  { id: 'subsystems', label: 'BTO Rig, Apps & Subsystems', icon: Cpu }
];

const SCHEMA_DOCS = [
  { table: 'categories', pk: 'id', domain: 'Catalog', desc: 'Hardware categories (Silicon, Photonics, Neural, Storage, Networking).' },
  { table: 'products', pk: 'id', domain: 'Catalog', desc: '12 enterprise hardware SKUs with CAD SVG schematics, specs JSON, stock, and ratings.' },
  { table: 'apps', pk: 'id', domain: 'App Ecosystem', desc: 'Sandboxed web/desktop apps deployed via Netlify, Vercel, GitHub Pages, or NEX Registry.' },
  { table: 'coupons', pk: 'code', domain: 'Commerce', desc: 'Promotional discount codes (percentage/fixed, min spend, active status).' },
  { table: 'orders', pk: 'id', domain: 'Commerce', desc: 'Completed customer hardware orders with tax, discount, and shipping metadata.' },
  { table: 'order_items', pk: 'id', domain: 'Commerce', desc: 'Line-item SKU breakdown per order with unit price and quantity.' },
  { table: 'reviews', pk: 'id', domain: 'Catalog', desc: 'Verified buyer hardware & app reviews with star ratings.' },
  { table: 'inventory_logs', pk: 'id', domain: 'Supply Chain', desc: 'Audit trail of stock restocks, order deductions, and warehouse adjustments.' },
  { table: 'activity_events', pk: 'id', domain: 'Telemetry', desc: 'Real-time event stream broadcasted to all connected WebSocket clients.' },
  { table: 'chat_messages', pk: 'id', domain: 'Support', desc: 'Persistent AI concierge & engineer live chat history.' },
  { table: 'wishlist', pk: 'product_id', domain: 'Commerce', desc: 'Saved hardware SKUs for quick comparison and procurement.' },
  { table: 'app_installs', pk: 'app_id', domain: 'App Ecosystem', desc: 'Installed sandboxed applications on the current workstation.' },
  { table: 'server_nodes', pk: 'id', domain: 'Edge Ops', desc: 'Global edge server clusters with CPU%, RAM%, req/s, uptime, and latency.' },
  { table: 'integrations', pk: 'id', domain: 'Connectors', desc: 'External platform webhooks (Netlify, GitHub, Stripe, Cloudflare, Slack, OpenAI).' },
  { table: 'security_events', pk: 'id', domain: 'SecOps', desc: 'Zero-Trust WAF threat logs, IP blocks, mTLS inspections, and severity levels.' },
  { table: 'push_notifications', pk: 'id', domain: 'Alerting', desc: 'Real-time toast & notification center alerts with read/unread state.' },
  { table: 'terminal_logs', pk: 'id', domain: 'CLI Audit', desc: 'Persistent audit trail of NEX-SH commands, outputs, status, and execution latency.' },
  { table: 'terminal_scripts', pk: 'id', domain: 'Automation', desc: 'Saved multi-line .nexsh automation playbooks with category and run counter.' }
];

const API_ENDPOINTS = [
  { method: 'GET', path: '/api/bootstrap', desc: 'Returns full initial state across all 17 SQLite tables, themes, and telemetry.' },
  { method: 'POST', path: '/api/terminal/exec', desc: 'Executes single commands, Unix pipe chains (|), && sequences, or multi-line .nexsh scripts.' },
  { method: 'POST', path: '/api/terminal/scripts', desc: 'Creates or updates a persistent .nexsh automation playbook in SQLite terminal_scripts.' },
  { method: 'POST', path: '/api/apps/deploy', desc: 'Deploys & verifies a third-party app from Netlify, Vercel, GitHub Pages, or custom HTTPS.' },
  { method: 'POST', path: '/api/apps/:id/install', desc: 'Toggles local workstation installation for a verified app package.' },
  { method: 'POST', path: '/api/servers/:id/action', desc: 'Triggers reboot, scale, or rebalance actions on a regional edge server cluster.' },
  { method: 'POST', path: '/api/security/scan', desc: 'Runs a deep Zero-Trust WAF & TLS 1.3 security sweep and logs threat events.' },
  { method: 'POST', path: '/api/integrations/:id/toggle', desc: 'Connects, disconnects, or syncs an external platform webhook integration.' },
  { method: 'POST', path: '/api/orders', desc: 'Processes hardware checkout, deducts SKU stock, and emits real-time order telemetry.' },
  { method: 'POST', path: '/api/inventory/restock', desc: 'Restocks a specific SKU or bulk-replenishes low-inventory warehouse items.' },
  { method: 'GET', path: '/api/database/:table', desc: 'Inspects schema columns and up to 100 live rows of any allowed SQLite table.' }
];

const CLI_EXAMPLES = [
  {
    title: 'Filter Online Edge Nodes with Pipe (`| grep`)',
    cmd: 'nex servers | grep ONLINE',
    desc: 'Streams regional edge server telemetry and filters only active ONLINE clusters.'
  },
  {
    title: 'Execute Multi-Step SecOps Playbook (`nex run`)',
    cmd: 'nex run nightly-secops-audit.nexsh',
    desc: 'Runs the stored SQLite automation playbook for Zero-Trust WAF & edge node auditing.'
  },
  {
    title: 'System & SQLite IOPS Stress Benchmark',
    cmd: 'nex benchmark',
    desc: 'Measures SQLite 17-table read/write throughput, Anycast RTT, and WAF inspection latency.'
  },
  {
    title: 'Chain Kernel Check, Uptime & Top Process Table (`&&`)',
    cmd: 'uname -a && uptime && top | head 5',
    desc: 'Combines command chaining (&&) with line truncation (| head 5).'
  },
  {
    title: 'Live Read-Only SQLite Query (`nex sql`)',
    cmd: 'nex sql SELECT sku, name, price, stock FROM products ORDER BY price DESC LIMIT 5',
    desc: 'Executes a real-time SQL SELECT against the underlying SQLite 3 database.'
  },
  {
    title: 'Count Total Saved Automation Playbooks (`| count`)',
    cmd: 'nex scripts | count',
    desc: 'Pipes the playbook directory listing into the line & character counter.'
  }
];

export default function DocumentationView({
  tables = [],
  terminalScripts = [],
  onOpenTerminal,
  onRunCommandInTerminal,
  onOpenRigBuilder
}) {
  const [activeSection, setActiveSection] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');

  const q = searchQuery.trim().toLowerCase();

  const filteredSchema = SCHEMA_DOCS.filter(
    (s) =>
      !q ||
      s.table.toLowerCase().includes(q) ||
      s.domain.toLowerCase().includes(q) ||
      s.desc.toLowerCase().includes(q)
  );

  const filteredEndpoints = API_ENDPOINTS.filter(
    (e) =>
      !q ||
      e.method.toLowerCase().includes(q) ||
      e.path.toLowerCase().includes(q) ||
      e.desc.toLowerCase().includes(q)
  );

  const filteredCli = CLI_EXAMPLES.filter(
    (c) =>
      !q ||
      c.title.toLowerCase().includes(q) ||
      c.cmd.toLowerCase().includes(q) ||
      c.desc.toLowerCase().includes(q)
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Hero Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/95 to-cyan-950/30 border border-slate-800 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
              <BookOpen className="w-3.5 h-3.5" />
              <span>NEXUS OS v3.0 — ENTERPRISE ARCHITECTURE & CLI MANUAL</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              System Documentation, SQLite Schema & NEX-SH v3.0 Guide
            </h1>
            <p className="text-sm text-slate-300 max-w-3xl">
              Complete engineering reference for the NEX Store commerce platform, 17-table SQLite 3 persistence engine,
              NEX-SH v3.0 Unix Pipe &amp; <code className="text-cyan-300">.nexsh</code> Scripting Studio, Multi-Source App Importer, and 5-Slot Hardware Rig Configurator.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={onOpenTerminal}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all"
            >
              <Terminal className="w-4 h-4" />
              Launch NEX-SH v3.0 Studio
            </button>
            {onOpenRigBuilder && (
              <button
                onClick={onOpenRigBuilder}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 font-mono font-semibold text-xs transition-all"
              >
                <Cpu className="w-4 h-4" />
                Open 5-Slot Rig BTO
              </button>
            )}
          </div>
        </div>

        {/* Search & Section Pills */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 md:pb-0">
            {DOC_SECTIONS.map((sec) => {
              const Icon = sec.icon;
              const active = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => setActiveSection(sec.id)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium transition-all shrink-0 ${
                    active
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                      : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {sec.label}
                </button>
              );
            })}
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter commands, tables, APIs..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* SECTION 1: ARCHITECTURE & STACK */}
      {activeSection === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-bold uppercase tracking-wider">
              <Server className="w-4 h-4" />
              1. Full-Stack Real-Time Engine
            </div>
            <h3 className="text-base font-bold text-white">
              Express + WebSocket + SQLite 3 (WAL)
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              The backend (<code className="text-cyan-300">server/index.js</code> &amp;{' '}
              <code className="text-cyan-300">server/db.js</code>) runs on <code className="text-emerald-300">0.0.0.0:3000</code>,
              combining REST endpoints, a real-time WebSocket broadcast bus (<code className="text-cyan-300">/ws</code>),
              and a 17-table SQLite database. When deployed to static hosts (Netlify/Vercel),{' '}
              <code className="text-cyan-300">src/utils/storeEngine.js</code> provides automatic client-side fallback persistence.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-purple-400 font-mono text-xs font-bold uppercase tracking-wider">
              <Terminal className="w-4 h-4" />
              2. NEX-SH v3.0 &amp; .nexsh Playbooks
            </div>
            <h3 className="text-base font-bold text-white">
              Unix Pipes, Chaining &amp; SQLite Scripts
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono">⌘J</kbd> or click{' '}
              <code className="text-cyan-300">&gt;_ CLI</code> to open the NEX-SH v3.0 Power Shell. Supports pipe operators (
              <code className="text-purple-300">| grep</code>, <code className="text-purple-300">| head</code>,{' '}
              <code className="text-purple-300">| tail</code>, <code className="text-purple-300">| count</code>,{' '}
              <code className="text-purple-300">| sort</code>, <code className="text-purple-300">| upper</code>),{' '}
              <code className="text-cyan-300">&amp;&amp;</code> command chaining, and multi-line{' '}
              <code className="text-emerald-300">.nexsh</code> playbooks stored in SQLite.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold uppercase tracking-wider">
              <Globe className="w-4 h-4" />
              3. 6-Theme &amp; Cross-Browser Hardened
            </div>
            <h3 className="text-base font-bold text-white">
              Chrome, Safari, Firefox, Edge &amp; Brave
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              All colors dynamically bind to CSS custom properties (<code className="text-cyan-300">--nex-bg-primary</code>,{' '}
              <code className="text-cyan-300">--nex-accent</code>) across 6 instant themes (Cyber Dark, Arctic Daylight,
              Emerald Matrix, Crimson Forge, Solar Gold, Amethyst Void) with WebKit/Blink/Gecko prefixes and PWA Service Worker v6 caching.
            </p>
          </div>
        </div>
      )}

      {/* SECTION 2: NEX-SH v3.0 & SCRIPTING */}
      {activeSection === 'terminal' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCli.map((item) => (
              <div
                key={item.cmd}
                className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between gap-3"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-white">{item.title}</span>
                    <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-[10px] font-mono">
                      NEX-SH v3.0
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{item.desc}</p>
                </div>
                <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs">
                  <code className="text-cyan-300 break-all">$ {item.cmd}</code>
                  {onRunCommandInTerminal && (
                    <button
                      onClick={() => onRunCommandInTerminal(item.cmd)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-semibold shrink-0"
                    >
                      <Play className="w-3 h-3" />
                      Run Live
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Preloaded SQLite .nexsh Playbooks */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-purple-400" />
                  Saved SQLite Automation Playbooks (`terminal_scripts`)
                </h3>
                <p className="text-xs text-slate-400">
                  Multi-line scripts stored in SQLite table #17. Run any playbook with one click:
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {terminalScripts.map((s) => (
                <div
                  key={s.id}
                  className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <code className="text-xs font-bold text-purple-300 truncate">{s.name}</code>
                      <span className="px-2 py-0.5 rounded bg-slate-900 text-[10px] font-mono text-cyan-300 border border-slate-800">
                        {s.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 truncate">{s.description}</p>
                  </div>
                  {onRunCommandInTerminal && (
                    <button
                      onClick={() => onRunCommandInTerminal(`nex run ${s.name}`)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-mono text-xs font-semibold shrink-0"
                    >
                      <Play className="w-3 h-3" />
                      Run
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: 17-TABLE SQLITE SCHEMA */}
      {activeSection === 'database' && (
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-white">
                SQLite 3 Database Schema Dictionary ({SCHEMA_DOCS.length} Tables)
              </h3>
              <p className="text-xs text-slate-400">
                Inspect live rows anytime in the Database Explorer tab or query via <code className="text-cyan-300">nex sql SELECT ...</code>
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-xs font-mono">
              WAL Mode • Foreign Keys Enforced
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono uppercase">
                  <th className="py-2.5 px-3">Table Name</th>
                  <th className="py-2.5 px-3">Primary Key</th>
                  <th className="py-2.5 px-3">Domain</th>
                  <th className="py-2.5 px-3">Live Rows</th>
                  <th className="py-2.5 px-3">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {filteredSchema.map((item) => {
                  const liveTable = tables.find((t) => t.name === item.table);
                  return (
                    <tr key={item.table} className="hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 font-mono font-bold text-cyan-300">{item.table}</td>
                      <td className="py-2.5 px-3 font-mono text-purple-300">{item.pk}</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 font-mono text-[11px]">
                          {item.domain}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-emerald-400">
                        {liveTable ? liveTable.rowCount : 'Active'}
                      </td>
                      <td className="py-2.5 px-3 text-slate-300">{item.desc}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 4: REST & WEBSOCKET API */}
      {activeSection === 'api' && (
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div>
            <h3 className="text-base font-bold text-white">
              REST API Endpoints &amp; Real-Time WebSocket Protocol
            </h3>
            <p className="text-xs text-slate-400">
              All mutations persist to SQLite and broadcast live delta updates over <code className="text-cyan-300">ws://0.0.0.0:3000/ws</code>.
            </p>
          </div>
          <div className="space-y-2.5">
            {filteredEndpoints.map((ep) => (
              <div
                key={ep.path}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2.5 font-mono text-xs">
                  <span
                    className={`px-2 py-0.5 rounded font-bold ${
                      ep.method === 'GET'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    }`}
                  >
                    {ep.method}
                  </span>
                  <code className="text-white font-semibold">{ep.path}</code>
                </div>
                <span className="text-xs text-slate-400">{ep.desc}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 5: BTO RIG, APPS & SUBSYSTEMS */}
      {activeSection === 'subsystems' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2.5">
            <h3 className="text-sm font-bold text-amber-300 font-mono uppercase">
              Custom 5-Slot Hardware Rig Configurator (BTO)
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Accessible via the <strong className="text-white">Rig BTO</strong> button in the header. Lets engineers pick compatible
              components across 5 slots (Compute Processor, Neural Accelerator, Photonics Interconnect, NVMe Fabric Storage, and
              Quantum Security Module), calculates real-time TDP wattage budget (1250W PSU ceiling), applies a 5% full-rig bundle
              discount, and deploys all selected SKUs to the cart in one click.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2.5">
            <h3 className="text-sm font-bold text-cyan-300 font-mono uppercase">
              Multi-Source App Store &amp; Developer Spotlight
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Import and verify web applications hosted on <strong className="text-white">Netlify</strong>,{' '}
              <strong className="text-white">Vercel</strong>, <strong className="text-white">GitHub Pages</strong>, or custom HTTPS
              origins. Generates deterministic SHA-256 package signatures and launches apps inside an interactive sandboxed modal.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
