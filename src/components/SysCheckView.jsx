import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Activity, Cpu, HardDrive, Gauge, Server, Sparkles, ShieldCheck,
  AlertTriangle, Info, RefreshCw, Boxes, MessageSquareHeart, Share2
} from 'lucide-react';

const SEVERITY_STYLE = {
  critical: 'border-rose-500/40 bg-rose-500/10 text-rose-300',
  warning: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
  info: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300'
};
const SEVERITY_ICON = { critical: AlertTriangle, warning: AlertTriangle, info: Info };
const STATUS_COLOR = { HEALTHY: 'text-emerald-400', DEGRADED: 'text-amber-400', CRITICAL: 'text-rose-400' };

function fmtBytes(mb) {
  return mb >= 1024 ? `${(mb / 1024).toFixed(1)} GB` : `${Math.round(mb)} MB`;
}

function MemoryGraph({ series }) {
  if (!series || series.length < 2) {
    return <p className="text-[11px] theme-text-muted font-mono-num">Collecting samples… graph appears after two points.</p>;
  }
  const w = 560;
  const h = 140;
  const rss = series.map((s) => s.rss / 1048576);
  const heap = series.map((s) => s.heapUsed / 1048576);
  const max = Math.max(...rss, 1) * 1.15;
  const pt = (arr) =>
    arr.map((v, i) => `${((i / (arr.length - 1)) * w).toFixed(1)},${(h - (v / max) * h).toFixed(1)}`).join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-36" preserveAspectRatio="none">
      {[0.25, 0.5, 0.75].map((g) => (
        <line key={g} x1="0" x2={w} y1={h * g} y2={h * g} stroke="currentColor" className="text-white/5" strokeWidth="1" />
      ))}
      <polyline points={pt(rss)} fill="none" stroke="#22d3ee" strokeWidth="2.5" />
      <polyline points={pt(heap)} fill="none" stroke="#a78bfa" strokeWidth="2" strokeDasharray="5 4" />
      <text x="4" y="12" className="fill-cyan-300 text-[9px] font-mono-num">RSS</text>
      <text x="40" y="12" className="fill-violet-300 text-[9px] font-mono-num">HEAP</text>
    </svg>
  );
}

function StatCard({ icon: Icon, label, value, sub, accent = 'text-cyan-300' }) {
  return (
    <div className="theme-card rounded-2xl border p-3.5">
      <div className="flex items-center gap-2 text-[10px] uppercase font-mono-num tracking-wide theme-text-muted">
        <Icon className={`h-3.5 w-3.5 ${accent}`} /> {label}
      </div>
      <p className={`mt-1.5 text-xl font-bold font-mono-num ${accent}`}>{value}</p>
      {sub && <p className="mt-0.5 text-[10px] theme-text-muted font-mono-num">{sub}</p>}
    </div>
  );
}

/**
 * System-wide check dashboard — real memory, resources, configs, uploaded
 * systems, request telemetry, graphs and computed developer recommendations.
 * Refreshes live from /api/system/check (admin: full; developer: masked config).
 */
export default function SysCheckView({ session, onPlaySound, onNavigateTab }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const timerRef = useRef(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/system/check', {
        headers: { Authorization: `Bearer ${session?.token || ''}` }
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
      setData(json);
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [session?.token]);

  useEffect(() => {
    load();
    timerRef.current = setInterval(load, 6000);
    return () => clearInterval(timerRef.current);
  }, [load]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <RefreshCw className="h-6 w-6 animate-spin text-cyan-400" />
      </div>
    );
  }
  if (error || !data) {
    return (
      <div className="theme-card rounded-2xl border border-rose-500/40 p-6 text-sm text-rose-300">
        System check unavailable: {error}. Verify your session and try again.
      </div>
    );
  }

  const { metrics, config, recommendations } = data;

  return (
    <div className="space-y-5" data-view="syscheck">
      {/* Header: health score */}
      <div className="theme-card rounded-3xl border p-5 flex flex-wrap items-center gap-5">
        <div className="relative h-24 w-24">
          <svg viewBox="0 0 100 100" className="h-24 w-24 -rotate-90">
            <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" className="text-white/10" strokeWidth="9" />
            <circle
              cx="50" cy="50" r="42" fill="none"
              stroke={data.healthScore >= 85 ? '#34d399' : data.healthScore >= 60 ? '#fbbf24' : '#f43f5e'}
              strokeWidth="9" strokeLinecap="round"
              strokeDasharray={`${(data.healthScore / 100) * 264} 264`}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-black font-mono-num">{data.healthScore}</span>
            <span className="text-[8px] uppercase tracking-wide theme-text-muted">health</span>
          </div>
        </div>
        <div className="flex-1 min-w-52">
          <h2 className="font-display text-2xl font-bold">System-Wide Check</h2>
          <p className={`text-xs font-mono-num font-bold ${STATUS_COLOR[data.status]}`}>
            {data.status} · generated {new Date(data.generatedAt).toLocaleTimeString()}
          </p>
          <p className="mt-1 text-[11px] theme-text-muted">
            Memory, resources, configs, uploaded systems, request telemetry and developer
            recommendations — every figure below is measured live on this host.
          </p>
        </div>
        <button
          type="button"
          onClick={() => { onPlaySound?.('toggle'); load(); }}
          className="theme-input h-9 rounded-xl px-3 text-[11px] font-semibold flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </button>
      </div>

      {/* Resource cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        <StatCard icon={HardDrive} label="Process RSS" value={`${metrics.process.rssMb} MB`} sub={`heap ${metrics.process.heapUsedMb} MB`} />
        <StatCard icon={Server} label="System Memory" value={`${metrics.system.memUsedPct}%`} sub={`${fmtBytes(metrics.system.freeMemMb)} free of ${fmtBytes(metrics.system.totalMemMb)}`} accent="text-violet-300" />
        <StatCard icon={Cpu} label="CPU / Load" value={`${metrics.system.cpuCount} cores`} sub={`load ${metrics.system.loadAvg1} · ${metrics.system.loadAvg5}`} accent="text-emerald-300" />
        <StatCard icon={Activity} label="Requests" value={metrics.requests.total} sub={`p95 ${metrics.requests.p95Ms} ms · avg ${metrics.requests.avgMs} ms`} />
        <StatCard icon={Gauge} label="5xx Error Rate" value={`${metrics.requests.errorRatePct}%`} sub={`${metrics.requests.errors5xx} errors · ${metrics.requests.slowTotal} slow`} accent={metrics.requests.errorRatePct > 2 ? 'text-rose-300' : 'text-emerald-300'} />
        <StatCard icon={Boxes} label="Uptime" value={`${Math.round(metrics.process.uptimeSec / 60)}m`} sub={`node ${metrics.process.nodeVersion}`} accent="text-amber-300" />
      </div>

      {/* Graphs + requests */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="theme-card rounded-2xl border p-4">
          <h3 className="text-xs font-bold uppercase tracking-wide flex items-center gap-1.5">
            <Activity className="h-3.5 w-3.5 text-cyan-400" /> Memory graph (live samples)
          </h3>
          <div className="mt-3 text-white/70">
            <MemoryGraph series={metrics.memorySeries} />
          </div>
          <p className="text-[10px] theme-text-muted font-mono-num">
            {metrics.memorySeries.length} samples · {metrics.process.heapTotal ? `heap total ${Number((metrics.process.heapTotal / 1048576).toFixed(1))} MB` : ''}
          </p>
        </div>
        <div className="theme-card rounded-2xl border p-4">
          <h3 className="text-xs font-bold uppercase tracking-wide flex items-center gap-1.5">
            <Gauge className="h-3.5 w-3.5 text-violet-400" /> Request telemetry (top routes)
          </h3>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-[10px] font-mono-num">
              <thead>
                <tr className="text-left theme-text-muted">
                  <th className="pb-1.5 pr-2">Route</th><th className="pr-2">n</th><th className="pr-2">avg</th><th className="pr-2">p95</th><th>2xx/4xx/5xx</th>
                </tr>
              </thead>
              <tbody>
                {metrics.requests.topRoutes.slice(0, 9).map((r) => (
                  <tr key={r.route} className="border-t border-white/5">
                    <td className="py-1 pr-2 whitespace-nowrap">{r.route}</td>
                    <td className="pr-2">{r.count}</td>
                    <td className="pr-2">{r.avgMs}ms</td>
                    <td className="pr-2">{r.maxMs}ms</td>
                    <td className="text-emerald-300">{r.s2xx}<span className="text-white/40">/</span><span className="text-amber-300">{r.s4xx}</span><span className="text-white/40">/</span><span className="text-rose-300">{r.s5xx}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Uploaded systems + app status + config */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="theme-card rounded-2xl border p-4">
          <h3 className="text-xs font-bold uppercase tracking-wide flex items-center gap-1.5">
            <Boxes className="h-3.5 w-3.5 text-emerald-400" /> Uploaded systems (converted)
          </h3>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-[10px] font-mono-num">
              <thead>
                <tr className="text-left theme-text-muted">
                  <th className="pb-1.5 pr-2">System</th><th className="pr-2">Lang</th><th className="pr-2">Status</th><th className="pr-2">Size</th>
                </tr>
              </thead>
              <tbody>
                {data.uploadedSystems.slice(0, 8).map((s) => (
                  <tr key={`${s.app_id}-${s.convertedAt}`} className="border-t border-white/5">
                    <td className="py-1 pr-2">{s.name}</td>
                    <td className="pr-2">{s.language}</td>
                    <td className={`pr-2 font-bold ${s.build_status === 'VALIDATED' || s.build_status === 'TRANSPILED' || s.build_status === 'COMPILED' ? 'text-emerald-300' : s.build_status === 'INVALID' ? 'text-rose-300' : 'text-amber-300'}`}>{s.build_status}</td>
                    <td>{(s.sourceBytes / 1024).toFixed(1)} KB</td>
                  </tr>
                ))}
                {data.uploadedSystems.length === 0 && (
                  <tr><td colSpan="4" className="py-3 theme-text-muted">No converted systems yet — upload one from the App Store.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {Object.entries(data.buildStatusCounts).map(([st, n]) => (
              <span key={st} className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[9px] font-mono-num">{st}: {n}</span>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-[10px] font-mono-num">
            <div className="rounded-xl bg-white/5 p-2"><p className="theme-text-muted">Apps</p><p className="text-sm font-bold">{data.apps.total}</p></div>
            <div className="rounded-xl bg-white/5 p-2"><p className="theme-text-muted">Reviews</p><p className="text-sm font-bold">{data.reviews.count} · {data.reviews.avg}★</p></div>
            <div className="rounded-xl bg-white/5 p-2"><p className="theme-text-muted">Shares</p><p className="text-sm font-bold">{data.shares.total}</p></div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="theme-card rounded-2xl border p-4">
            <h3 className="text-xs font-bold uppercase tracking-wide flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" /> Configuration status
            </h3>
            <div className="mt-3 grid grid-cols-2 gap-1.5 text-[10px] font-mono-num">
              {Object.entries(config)
                .filter(([k]) => k !== 'restricted')
                .map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between rounded-lg bg-white/5 px-2 py-1.5">
                    <span className="theme-text-muted">{k}</span>
                    <span className={v === true ? 'text-emerald-300' : v === false ? 'text-amber-300' : 'text-white/80'}>
                      {v === true ? 'SET' : v === false ? '—' : String(v)}
                    </span>
                  </div>
                ))}
            </div>
            {config.restricted && (
              <p className="mt-2 text-[9px] theme-text-muted">
                Detailed secret configuration is visible to Root Admin only — values are never exposed regardless of role.
              </p>
            )}
          </div>

          <div className="theme-card rounded-2xl border p-4">
            <h3 className="text-xs font-bold uppercase tracking-wide flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" /> Recommendations for developers
            </h3>
            <div className="mt-3 space-y-2">
              {recommendations.length === 0 && (
                <p className="text-[11px] theme-text-muted">No findings right now — every measured signal is inside healthy bounds.</p>
              )}
              {recommendations.map((r, i) => {
                const Icon = SEVERITY_ICON[r.severity] || Info;
                return (
                  <div key={i} className={`rounded-xl border p-2.5 ${SEVERITY_STYLE[r.severity]}`}>
                    <p className="text-[11px] font-bold flex items-center gap-1.5"><Icon className="h-3.5 w-3.5" />{r.title}</p>
                    <p className="mt-1 text-[10px] opacity-90">{r.detail}</p>
                    <p className="mt-1 text-[10px] font-semibold opacity-80">→ {r.action}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Collaboration quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => {
            onPlaySound?.('click');
            onNavigateTab?.('community');
          }}
          className="theme-card rounded-2xl border p-4 text-left hover:border-violet-400/50 cursor-pointer transition"
        >
          <p className="text-xs font-bold flex items-center gap-1.5"><MessageSquareHeart className="h-3.5 w-3.5 text-violet-400" /> Reviews & discussions live in the Community tab →</p>
          <p className="mt-1 text-[10px] theme-text-muted">Threaded comments and reviews per app, publicly readable.</p>
        </button>
        <button
          type="button"
          onClick={() => {
            onPlaySound?.('click');
            onNavigateTab?.('apps');
          }}
          className="theme-card rounded-2xl border p-4 text-left hover:border-cyan-400/50 cursor-pointer transition"
        >
          <p className="text-xs font-bold flex items-center gap-1.5"><Share2 className="h-3.5 w-3.5 text-cyan-400" /> Share systems from the App Store →</p>
          <p className="mt-1 text-[10px] theme-text-muted">Published shares appear instantly in the public community feed.</p>
        </button>
      </div>
    </div>
  );
}
