import React, { useState, useEffect } from 'react';
import {
  Server,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Cpu,
  Activity,
  Globe,
  RefreshCw,
  Zap,
  Lock,
  KeyRound,
  Bell,
  Volume2,
  VolumeX,
  Plus,
  CheckCircle2,
  Radio,
  Layers,
  ExternalLink,
  Terminal,
  Wifi
} from 'lucide-react';

export default function SubsystemsHubView({
  serverNodes = [],
  integrations = [],
  securityEvents = [],
  notifications = [],
  wsConnected,
  soundEnabled,
  setSoundEnabled,
  soundVolume,
  setSoundVolume,
  desktopPushStatus,
  onRequestDesktopPush,
  onPlaySound,
  onServerAction,
  onPulseServers,
  onProvisionServer,
  onSyncIntegration,
  onCreateIntegration,
  onRunSecurityScan,
  onSimulateThreat,
  onRotateKeys,
  onSendPushBroadcast,
  onNavigateTab
}) {
  const [subTab, setSubTab] = useState('servers'); // 'servers' | 'security' | 'integrations' | 'audio-push'
  const [autoPulseServers, setAutoPulseServers] = useState(true);

  // Security Policy Toggles
  const [securityPolicies, setSecurityPolicies] = useState({
    wafSqlXss: true,
    ddosRateLimit: true,
    sha256Verify: true,
    strictCspSandbox: true,
    zeroTrust2FA: true
  });

  // New Server Form
  const [newSrvName, setNewSrvName] = useState('');
  const [newSrvRegion, setNewSrvRegion] = useState('Singapore, SG');
  const [newSrvProvider, setNewSrvProvider] = useState('Netlify Edge + Anycast NVMe');

  // New Integration Form
  const [newIntName, setNewIntName] = useState('');
  const [newIntProvider, setNewIntProvider] = useState('Netlify');
  const [newIntCategory, setNewIntCategory] = useState('Deployment & Hosting');
  const [newIntUrl, setNewIntUrl] = useState('');

  // Push Broadcast Form
  const [pushTitle, setPushTitle] = useState('Flash Firmware & App Update v2.6');
  const [pushMessage, setPushMessage] = useState(
    'All 6 global edge servers and Netlify app sandboxes have been upgraded with zero downtime.'
  );
  const [pushChannel, setPushChannel] = useState('realtime');
  const [pushPriority, setPushPriority] = useState('high');

  useEffect(() => {
    if (!autoPulseServers) return;
    const timer = setInterval(() => {
      onPulseServers?.();
    }, 4500);
    return () => clearInterval(timer);
  }, [autoPulseServers, onPulseServers]);

  const avgLatency = serverNodes.length
    ? Math.round(serverNodes.reduce((s, n) => s + (n.latency_ms || 15), 0) / serverNodes.length)
    : 18;
  const totalRps = serverNodes.reduce((s, n) => s + (n.rps || 0), 0);
  const totalConns = serverNodes.reduce((s, n) => s + (n.active_connections || 0), 0);
  const blockedCount = securityEvents.filter(
    (e) => e.action_taken === 'BLOCKED' || e.action_taken === 'QUARANTINED'
  ).length;
  const connectedIntegrations = integrations.filter((i) => i.status === 'connected').length;

  const handleTogglePolicy = (key) => {
    onPlaySound?.('click');
    setSecurityPolicies((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCreateServerSubmit = (e) => {
    e.preventDefault();
    if (!newSrvName.trim()) return;
    onPlaySound?.('server');
    onProvisionServer?.({
      name: newSrvName.trim(),
      region: newSrvRegion.trim(),
      provider: newSrvProvider.trim()
    });
    setNewSrvName('');
  };

  const handleCreateIntegrationSubmit = (e) => {
    e.preventDefault();
    if (!newIntName.trim()) return;
    onPlaySound?.('success');
    onCreateIntegration?.({
      name: newIntName.trim(),
      provider: newIntProvider,
      category: newIntCategory,
      endpoint_url:
        newIntUrl.trim() ||
        `https://api.${newIntProvider.toLowerCase()}.com/v1/webhooks/nex-store`
    });
    setNewIntName('');
    setNewIntUrl('');
  };

  const handleBroadcastSubmit = (e) => {
    e.preventDefault();
    if (!pushTitle.trim() || !pushMessage.trim()) return;
    onSendPushBroadcast?.({
      title: pushTitle.trim(),
      message: pushMessage.trim(),
      channel: pushChannel,
      priority: pushPriority,
      action_url: 'subsystems'
    });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 space-y-6">
      {/* Top Subsystem Hero Header */}
      <div className="rounded-3xl p-6 md:p-8 theme-card space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/15 border border-indigo-500/35 px-3 py-0.5 font-mono-num text-xs font-bold text-indigo-400">
                <Server className="h-3.5 w-3.5" />
                <span>REAL-TIME SUBSYSTEMS • EDGE SERVERS • SECURITY • INTEGRATIONS</span>
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/35 px-2.5 py-0.5 font-mono-num text-[11px] font-bold text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                {wsConnected ? 'WSS CLUSTER STREAM ACTIVE' : 'EDGE LOCAL REPLICA ACTIVE'}
              </span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold">
              NEX Subsystems, Edge Servers, Integrations & Security Center
            </h1>
            <p className="text-xs sm:text-sm theme-text-muted">
              Live telemetry for global edge servers, Cloudflare WAF & SHA-256 package security, Netlify/GitHub deployment bridges, and WebAudio/Push notification broadcasting.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => {
                onPlaySound?.('security');
                onRunSecurityScan?.();
              }}
              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/20 transition cursor-pointer"
            >
              <ShieldCheck className="h-4 w-4" />
              <span>Run Full Security Audit</span>
            </button>

            <button
              onClick={() => {
                onPlaySound?.('server');
                onPulseServers?.();
              }}
              className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/20 transition cursor-pointer"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Pulse All Edge Servers</span>
            </button>
          </div>
        </div>

        {/* 4 Top Subsystem KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl p-4 theme-subtle space-y-1">
            <div className="flex items-center justify-between text-xs theme-text-muted">
              <span>Global Edge Servers</span>
              <Server className="h-4 w-4 text-cyan-400" />
            </div>
            <div className="font-mono-num text-2xl font-bold text-cyan-400">
              {serverNodes.length} Nodes Online
            </div>
            <div className="font-mono-num text-[11px] theme-text-muted">
              Avg {avgLatency}ms • {totalRps.toLocaleString()} req/s • {totalConns} WS conns
            </div>
          </div>

          <div className="rounded-2xl p-4 theme-subtle space-y-1">
            <div className="flex items-center justify-between text-xs theme-text-muted">
              <span>Zero-Trust Security Shield</span>
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="font-mono-num text-2xl font-bold text-emerald-400">
              99.8% Hardened
            </div>
            <div className="font-mono-num text-[11px] theme-text-muted">
              {blockedCount} threats mitigated • SHA-256 active
            </div>
          </div>

          <div className="rounded-2xl p-4 theme-subtle space-y-1">
            <div className="flex items-center justify-between text-xs theme-text-muted">
              <span>Platform Integrations</span>
              <Globe className="h-4 w-4 text-indigo-400" />
            </div>
            <div className="font-mono-num text-2xl font-bold text-indigo-400">
              {connectedIntegrations}/{integrations.length} Bridges Live
            </div>
            <div className="font-mono-num text-[11px] theme-text-muted">
              Netlify • GitHub • Vercel • Stripe • Turso
            </div>
          </div>

          <div className="rounded-2xl p-4 theme-subtle space-y-1">
            <div className="flex items-center justify-between text-xs theme-text-muted">
              <span>Audio & Push Engine</span>
              <Volume2 className="h-4 w-4 text-amber-400" />
            </div>
            <div className="font-mono-num text-2xl font-bold text-amber-400">
              {soundEnabled ? 'WebAudio ON' : 'Muted'}
            </div>
            <div className="font-mono-num text-[11px] theme-text-muted">
              {notifications.length} push events • Desktop: {desktopPushStatus}
            </div>
          </div>
        </div>

        {/* Subsystem Navigation Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/[0.08]">
          {[
            { id: 'servers', label: `Edge Servers (${serverNodes.length})`, icon: Server },
            { id: 'security', label: `Security & WAF Shield (${securityEvents.length})`, icon: Shield },
            { id: 'integrations', label: `Netlify & Cloud Integrations (${integrations.length})`, icon: Globe },
            { id: 'audio-push', label: 'Audio Synth & Push Broadcast Lab', icon: Bell }
          ].map((tab) => {
            const Icon = tab.icon;
            const active = subTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  onPlaySound?.('click');
                  setSubTab(tab.id);
                }}
                className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-semibold transition cursor-pointer ${
                  active
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25'
                    : 'theme-subtle hover:border-indigo-400/50'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SUB-TAB 1: REAL-TIME EDGE SERVER CLUSTER */}
      {subTab === 'servers' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl p-4 theme-card">
            <div className="flex items-center gap-3">
              <Radio className={`h-5 w-5 ${autoPulseServers ? 'text-emerald-400 animate-pulse' : 'text-slate-400'}`} />
              <div>
                <h2 className="font-display text-sm font-bold">
                  Real-Time Edge Cluster Telemetry Stream (`server_nodes` SQLite Table)
                </h2>
                <p className="text-xs theme-text-muted">
                  Each node runs an isolated SQLite WAL read-replica and WebSocket multiplexer.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => {
                  onPlaySound?.('click');
                  setAutoPulseServers((p) => !p);
                }}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold cursor-pointer ${
                  autoPulseServers
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'theme-subtle'
                }`}
              >
                <Activity className="h-3.5 w-3.5" />
                <span>Auto-Stream: {autoPulseServers ? 'ON (4.5s)' : 'PAUSED'}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {serverNodes.map((node) => (
              <div
                key={node.id}
                className="rounded-3xl p-5 space-y-4 theme-card flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                        <h3 className="font-display text-sm font-bold">{node.name}</h3>
                      </div>
                      <p className="font-mono-num text-[11px] theme-text-muted mt-0.5">
                        {node.region} • {node.ip_address}
                      </p>
                    </div>
                    <span className="rounded-lg bg-cyan-500/15 border border-cyan-500/30 px-2 py-0.5 font-mono-num text-[10px] font-bold text-cyan-400">
                      {node.latency_ms}ms
                    </span>
                  </div>

                  <div className="text-[11px] theme-text-muted flex items-center justify-between">
                    <span>Provider: {node.provider}</span>
                    <span className="font-mono-num text-indigo-400">{node.version}</span>
                  </div>

                  {/* CPU & RAM Bars */}
                  <div className="space-y-2 pt-1">
                    <div>
                      <div className="flex justify-between font-mono-num text-[11px] mb-1">
                        <span className="theme-text-muted">CPU Load</span>
                        <span className={node.cpu_load > 75 ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>
                          {node.cpu_load}%
                        </span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-500"
                          style={{ width: `${node.cpu_load}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between font-mono-num text-[11px] mb-1">
                        <span className="theme-text-muted">RAM Allocation</span>
                        <span className="text-indigo-400 font-bold">{node.ram_usage}%</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-400 transition-all duration-500"
                          style={{ width: `${node.ram_usage}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-1 text-center font-mono-num text-[11px]">
                    <div className="rounded-xl p-2 theme-subtle">
                      <div className="text-[10px] theme-text-muted">RPS</div>
                      <div className="font-bold text-cyan-400">{node.rps}</div>
                    </div>
                    <div className="rounded-xl p-2 theme-subtle">
                      <div className="text-[10px] theme-text-muted">WS Conns</div>
                      <div className="font-bold text-indigo-400">{node.active_connections}</div>
                    </div>
                    <div className="rounded-xl p-2 theme-subtle">
                      <div className="text-[10px] theme-text-muted">Uptime</div>
                      <div className="font-bold text-emerald-400">{node.uptime_pct}%</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-3 border-t border-white/[0.07]">
                  <button
                    onClick={() => {
                      onPlaySound?.('ping');
                      onServerAction?.(node.id, 'ping');
                    }}
                    className="flex-1 rounded-xl py-1.5 text-[11px] font-semibold theme-subtle hover:border-cyan-400/50 cursor-pointer"
                  >
                    Ping
                  </button>
                  <button
                    onClick={() => {
                      onPlaySound?.('server');
                      onServerAction?.(node.id, 'scale');
                    }}
                    className="flex-1 rounded-xl py-1.5 text-[11px] font-semibold theme-subtle hover:border-indigo-400/50 cursor-pointer"
                  >
                    Scale +Workers
                  </button>
                  <button
                    onClick={() => {
                      onPlaySound?.('server');
                      onServerAction?.(node.id, 'restart');
                    }}
                    className="flex-1 rounded-xl py-1.5 text-[11px] font-semibold bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-500/25 cursor-pointer"
                  >
                    Restart
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Provision New Edge Server Node Form */}
          <form
            onSubmit={handleCreateServerSubmit}
            className="rounded-3xl p-5 theme-card space-y-4"
          >
            <h3 className="font-display text-sm font-bold flex items-center gap-2">
              <Plus className="h-4 w-4 text-cyan-400" />
              <span>Deploy New Edge Server Node to Cluster</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <input
                type="text"
                required
                value={newSrvName}
                onChange={(e) => setNewSrvName(e.target.value)}
                placeholder="Node Name (e.g. São Paulo Edge SA-East-1)"
                className="rounded-xl px-3.5 py-2 text-xs theme-input"
              />
              <input
                type="text"
                value={newSrvRegion}
                onChange={(e) => setNewSrvRegion(e.target.value)}
                placeholder="Region (e.g. São Paulo, BR)"
                className="rounded-xl px-3.5 py-2 text-xs theme-input"
              />
              <input
                type="text"
                value={newSrvProvider}
                onChange={(e) => setNewSrvProvider(e.target.value)}
                placeholder="Provider (e.g. Netlify Edge + Anycast)"
                className="rounded-xl px-3.5 py-2 text-xs theme-input"
              />
              <button
                type="submit"
                className="rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 px-4 py-2 text-xs font-bold text-white cursor-pointer"
              >
                Provision Edge Node
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SUB-TAB 2: SECURITY OPERATIONS & ZERO-TRUST SHIELD */}
      {subTab === 'security' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Defense Policies & Threat Controls */}
          <div className="rounded-3xl p-5 theme-card space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-base font-bold flex items-center gap-2">
                  <Shield className="h-4 w-4 text-emerald-400" />
                  <span>Zero-Trust Defense Matrix</span>
                </h3>
                <p className="text-xs theme-text-muted">
                  Real-time protection policies across API, SQLite, and App Sandboxes.
                </p>
              </div>
              <span className="font-mono-num text-xs font-bold text-emerald-400">
                5/5 ACTIVE
              </span>
            </div>

            <div className="space-y-2.5">
              {[
                {
                  key: 'wafSqlXss',
                  title: 'Cloudflare WAF SQLi & XSS Shield',
                  desc: 'Blocks stacked SQL queries & script injection in < 0.4ms'
                },
                {
                  key: 'ddosRateLimit',
                  title: 'Edge Anycast DDoS & Rate Limiter',
                  desc: 'Throttles credential stuffing & coupon brute-force bursts'
                },
                {
                  key: 'sha256Verify',
                  title: 'SHA-256 App Signature Enforcement',
                  desc: 'Verifies hashes for all Netlify, Vercel & GitHub app imports'
                },
                {
                  key: 'strictCspSandbox',
                  title: 'Strict Content-Security-Policy Sandbox',
                  desc: 'Isolates third-party developer apps in zero-trust containers'
                },
                {
                  key: 'zeroTrust2FA',
                  title: 'Ed25519 Admin & Webhook Signing',
                  desc: 'Cryptographic verification on all deployment webhooks'
                }
              ].map((item) => {
                const enabled = securityPolicies[item.key];
                return (
                  <div
                    key={item.key}
                    onClick={() => handleTogglePolicy(item.key)}
                    className="flex items-center justify-between gap-3 rounded-2xl p-3 theme-subtle cursor-pointer"
                  >
                    <div>
                      <div className="text-xs font-bold">{item.title}</div>
                      <div className="text-[11px] theme-text-muted">{item.desc}</div>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-0.5 font-mono-num text-[10px] font-bold ${
                        enabled
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                      }`}
                    >
                      {enabled ? 'ARMED' : 'BYPASSED'}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="space-y-2 pt-2 border-t border-white/[0.08]">
              <button
                onClick={() => {
                  onPlaySound?.('security');
                  onRunSecurityScan?.();
                }}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 py-2.5 text-xs font-bold text-white cursor-pointer"
              >
                <ShieldCheck className="h-4 w-4" />
                <span>Run Deep Vulnerability & SQLite Integrity Audit</span>
              </button>

              <button
                onClick={() => {
                  onPlaySound?.('alert');
                  onSimulateThreat?.();
                }}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 py-2.5 text-xs font-bold text-rose-400 cursor-pointer"
              >
                <ShieldAlert className="h-4 w-4" />
                <span>Simulate Attack & Test WAF Auto-Block</span>
              </button>

              <button
                onClick={() => {
                  onPlaySound?.('ping');
                  onRotateKeys?.();
                }}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-semibold theme-subtle hover:border-indigo-400/50 cursor-pointer"
              >
                <KeyRound className="h-4 w-4 text-indigo-400" />
                <span>Rotate Ed25519 API & Webhook Signing Keys</span>
              </button>
            </div>
          </div>

          {/* Live Security Audit Log Table (`security_events`) */}
          <div className="lg:col-span-2 rounded-3xl p-5 theme-card space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-base font-bold">
                  Real-Time Security Audit Log (`security_events` SQLite Table)
                </h3>
                <p className="text-xs theme-text-muted">
                  Live stream of WAF blocks, SHA-256 package verifications, and key rotations.
                </p>
              </div>
              <span className="font-mono-num text-xs text-cyan-400">
                {securityEvents.length} logged events
              </span>
            </div>

            <div className="space-y-2.5 max-h-[540px] overflow-y-auto pr-1">
              {securityEvents.map((ev) => {
                const isCritical = ev.severity === 'critical' || ev.severity === 'high';
                return (
                  <div
                    key={ev.id}
                    className="rounded-2xl p-3.5 theme-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-md px-2 py-0.5 font-mono-num text-[10px] font-bold uppercase ${
                            ev.action_taken === 'BLOCKED' || ev.action_taken === 'QUARANTINED'
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                              : ev.action_taken === 'ROTATED'
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          }`}
                        >
                          {ev.action_taken}
                        </span>
                        <span
                          className={`font-mono-num text-[10px] font-bold uppercase ${
                            isCritical ? 'text-rose-400' : 'text-cyan-400'
                          }`}
                        >
                          [{ev.severity}]
                        </span>
                        <span className="font-bold text-xs">{ev.target_resource}</span>
                      </div>
                      <p className="text-xs theme-text-muted">{ev.description}</p>
                    </div>

                    <div className="sm:text-right shrink-0 font-mono-num text-[11px] theme-text-muted">
                      <div className="text-indigo-400">{ev.source_ip}</div>
                      <div>{new Date(ev.created_at).toLocaleTimeString()}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: EXTERNAL INTEGRATIONS & NETLIFY/GITHUB BRIDGES */}
      {subTab === 'integrations' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl p-5 theme-card">
            <div>
              <h2 className="font-display text-base font-bold">
                Connected Deployment, Payment, AI & Database Integrations (`integrations` Table)
              </h2>
              <p className="text-xs theme-text-muted">
                Sync deployments from Netlify, Vercel, and GitHub or connect custom webhooks.
              </p>
            </div>
            <button
              onClick={() => {
                onPlaySound?.('click');
                onNavigateTab?.('apps');
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-teal-500 hover:bg-teal-400 px-4 py-2 text-xs font-bold text-slate-950 transition cursor-pointer"
            >
              <Globe className="h-3.5 w-3.5" />
              <span>Import App from Netlify / GitHub</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {integrations.map((intItem) => {
              const isConnected = intItem.status === 'connected';
              return (
                <div
                  key={intItem.id}
                  className="rounded-3xl p-5 theme-card flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-display text-base font-bold">{intItem.name}</h3>
                          <span className="rounded-md bg-indigo-500/15 border border-indigo-500/30 px-2 py-0.5 font-mono-num text-[10px] font-bold text-indigo-400">
                            {intItem.provider}
                          </span>
                        </div>
                        <p className="text-xs theme-text-muted">{intItem.category}</p>
                      </div>

                      <span
                        className={`rounded-full px-2.5 py-0.5 font-mono-num text-[10px] font-bold uppercase ${
                          isConnected
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                        }`}
                      >
                        {intItem.status}
                      </span>
                    </div>

                    <div className="rounded-xl p-2.5 font-mono-num text-[11px] theme-subtle space-y-1">
                      <div className="truncate text-cyan-400">{intItem.endpoint_url}</div>
                      <div className="flex items-center justify-between text-[10px] theme-text-muted">
                        <span>Secret: {intItem.webhook_secret_masked}</span>
                        <span>Latency: {intItem.latency_ms}ms</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/[0.07]">
                    <span className="font-mono-num text-xs theme-text-muted">
                      <strong className="text-indigo-400">
                        {Number(intItem.events_synced || 0).toLocaleString()}
                      </strong>{' '}
                      events synced
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          onPlaySound?.('click');
                          onSyncIntegration?.(intItem.id, true);
                        }}
                        className="rounded-xl px-3 py-1.5 text-xs font-semibold theme-subtle cursor-pointer"
                      >
                        {isConnected ? 'Pause' : 'Resume'}
                      </button>
                      <button
                        onClick={() => {
                          onPlaySound?.('ping');
                          onSyncIntegration?.(intItem.id, false);
                        }}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-3.5 py-1.5 text-xs font-semibold text-white cursor-pointer"
                      >
                        <RefreshCw className="h-3 w-3" />
                        <span>Sync Now</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Connect Custom Integration Form */}
          <form
            onSubmit={handleCreateIntegrationSubmit}
            className="rounded-3xl p-5 theme-card space-y-4"
          >
            <h3 className="font-display text-sm font-bold flex items-center gap-2">
              <Plus className="h-4 w-4 text-teal-400" />
              <span>Connect Custom External Integration / Netlify Webhook</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <input
                type="text"
                required
                value={newIntName}
                onChange={(e) => setNewIntName(e.target.value)}
                placeholder="Integration Name (e.g. Netlify Docs Site)"
                className="rounded-xl px-3.5 py-2 text-xs theme-input"
              />
              <select
                value={newIntProvider}
                onChange={(e) => setNewIntProvider(e.target.value)}
                className="rounded-xl px-3 py-2 text-xs theme-input"
              >
                <option value="Netlify">Netlify</option>
                <option value="Vercel">Vercel</option>
                <option value="GitHub">GitHub</option>
                <option value="Supabase">Supabase</option>
                <option value="Discord">Discord Webhook</option>
                <option value="Linear">Linear Telemetry</option>
              </select>
              <input
                type="text"
                value={newIntUrl}
                onChange={(e) => setNewIntUrl(e.target.value)}
                placeholder="Endpoint or Webhook URL"
                className="rounded-xl px-3.5 py-2 text-xs theme-input"
              />
              <button
                type="submit"
                className="rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 px-4 py-2 text-xs font-bold text-slate-950 cursor-pointer"
              >
                Connect Integration
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SUB-TAB 4: AUDIO SYNTHESIZER & PUSH NOTIFICATION BROADCAST LAB */}
      {subTab === 'audio-push' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Web Audio Synthesizer Soundboard */}
          <div className="rounded-3xl p-6 theme-card space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-base font-bold flex items-center gap-2">
                  <Volume2 className="h-4 w-4 text-cyan-400" />
                  <span>Web Audio API Synthesizer Subsystem</span>
                </h3>
                <p className="text-xs theme-text-muted">
                  Zero-dependency procedural sound engine for real-time store, server, and security events.
                </p>
              </div>
              <button
                onClick={() => setSoundEnabled((prev) => !prev)}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold cursor-pointer ${
                  soundEnabled
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                }`}
              >
                {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                <span>{soundEnabled ? 'Audio Enabled' : 'Audio Muted'}</span>
              </button>
            </div>

            <div>
              <div className="flex justify-between font-mono-num text-xs mb-1.5">
                <span className="theme-text-muted">Master Synthesizer Gain</span>
                <span className="text-cyan-400 font-bold">{Math.round(soundVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="1"
                step="0.05"
                value={soundVolume}
                onChange={(e) => setSoundVolume(parseFloat(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { id: 'ping', label: 'WS Realtime Ping', desc: '740Hz -> 987Hz' },
                { id: 'push', label: 'Push Bell Chime', desc: '880Hz Crystal' },
                { id: 'success', label: 'Order / App Triad', desc: 'C5-E5-G5-C6' },
                { id: 'cart', label: 'Cart Pop', desc: 'Upward Duo' },
                { id: 'security', label: 'Security Scan', desc: 'Cyber Lock' },
                { id: 'alert', label: 'WAF Threat Alert', desc: 'Dual Sawtooth' },
                { id: 'server', label: 'Server Node Sweep', desc: 'Telemetry Boot' },
                { id: 'click', label: 'Tactile UI Tick', desc: '680Hz Micro' }
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => onPlaySound?.(s.id, true)}
                  className="rounded-2xl p-3 text-left theme-subtle hover:border-cyan-400/60 transition cursor-pointer space-y-1"
                >
                  <div className="text-xs font-bold text-indigo-400">▶ {s.label}</div>
                  <div className="font-mono-num text-[10px] theme-text-muted">{s.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Native Desktop Push & WebSocket Broadcast Dispatcher */}
          <div className="rounded-3xl p-6 theme-card space-y-5">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h3 className="font-display text-base font-bold flex items-center gap-2">
                  <Bell className="h-4 w-4 text-amber-400" />
                  <span>Real-Time Push Notification Dispatcher</span>
                </h3>
                <p className="text-xs theme-text-muted">
                  Broadcast live alerts to SQLite `push_notifications`, WebSocket clients, and OS desktop notifications.
                </p>
              </div>
              <button
                type="button"
                onClick={onRequestDesktopPush}
                className="rounded-xl bg-amber-500/15 border border-amber-500/35 px-3 py-1.5 font-mono-num text-[11px] font-bold text-amber-400 cursor-pointer shrink-0"
              >
                OS Push: {desktopPushStatus.toUpperCase()}
              </button>
            </div>

            <form onSubmit={handleBroadcastSubmit} className="space-y-3">
              <div>
                <label className="block font-mono-num text-[10px] uppercase theme-text-muted mb-1">
                  Notification Title
                </label>
                <input
                  type="text"
                  required
                  value={pushTitle}
                  onChange={(e) => setPushTitle(e.target.value)}
                  className="w-full rounded-xl px-3.5 py-2 text-xs theme-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono-num text-[10px] uppercase theme-text-muted mb-1">
                    Channel
                  </label>
                  <select
                    value={pushChannel}
                    onChange={(e) => setPushChannel(e.target.value)}
                    className="w-full rounded-xl px-3 py-2 text-xs theme-input"
                  >
                    <option value="realtime">Real-Time Telemetry</option>
                    <option value="deployment">Netlify / App Deployment</option>
                    <option value="security">Security & WAF Alert</option>
                    <option value="order">Order & Warehouse</option>
                  </select>
                </div>

                <div>
                  <label className="block font-mono-num text-[10px] uppercase theme-text-muted mb-1">
                    Priority
                  </label>
                  <select
                    value={pushPriority}
                    onChange={(e) => setPushPriority(e.target.value)}
                    className="w-full rounded-xl px-3 py-2 text-xs theme-input"
                  >
                    <option value="high">High Priority (Sound + OS Push)</option>
                    <option value="normal">Normal Priority</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-mono-num text-[10px] uppercase theme-text-muted mb-1">
                  Message Payload
                </label>
                <textarea
                  rows={2}
                  required
                  value={pushMessage}
                  onChange={(e) => setPushMessage(e.target.value)}
                  className="w-full rounded-xl px-3.5 py-2 text-xs theme-input"
                />
              </div>

              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 py-3 text-xs font-bold text-white shadow-lg cursor-pointer"
              >
                <Bell className="h-4 w-4" />
                <span>Broadcast Push Notification + Play Chime</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
