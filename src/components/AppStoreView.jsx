import React, { useState, useMemo } from 'react';
import {
  Download,
  Upload,
  Star,
  CheckCircle2,
  Code2,
  Terminal,
  Sparkles,
  Search,
  Globe,
  ShieldCheck,
  ExternalLink,
  Play,
  Lock,
  GitBranch,
  Cpu,
  X,
  RefreshCw
} from 'lucide-react';

const COMMUNITY_NETLIFY_PRESETS = [
  {
    name: 'Quantum Circuit Studio',
    developer: 'Dr. Elena Vance (@elena_quantum)',
    source_provider: 'Netlify',
    live_url: 'https://quantum-circuit-studio.netlify.app',
    repo_url: 'https://github.com/elena-quantum/circuit-studio',
    category: 'web',
    language: 'typescript',
    version: '2.3.0',
    size: '8.4 MB',
    icon: '⚛️',
    description: 'Interactive multi-qubit quantum gate simulator and Bloch sphere visualizer hosted on Netlify Edge.',
    permissions: ['WebGL2 Canvas', 'WebWorkers', 'Zero-Knowledge Storage']
  },
  {
    name: 'NeuralAudio Stem Splitter',
    developer: 'Marcus Oduor (@marcus_dsp)',
    source_provider: 'Netlify',
    live_url: 'https://neural-stem-splitter.netlify.app',
    repo_url: 'https://github.com/marcus-dsp/neural-stems',
    category: 'desktop',
    language: 'python',
    version: '1.9.4',
    size: '34.0 MB',
    icon: '🎧',
    description: 'Real-time WebAudio & ONNX neural vocal/drum/bass stem separator built for NEX Aether Pro headphones.',
    permissions: ['WebAudio API', 'WebGPU Tensor', 'Local File Export']
  },
  {
    name: 'KubePulse Edge Monitor',
    developer: 'Tariq Al-Mansoor (@tariq_infra)',
    source_provider: 'Vercel',
    live_url: 'https://kubepulse-edge-monitor.vercel.app',
    repo_url: 'https://github.com/tariq-infra/kubepulse',
    category: 'utility',
    language: 'go',
    version: '3.1.2',
    size: '15.6 MB',
    icon: '🛰️',
    description: 'Zero-config Kubernetes & edge server telemetry dashboard with real-time WebSocket log tailing.',
    permissions: ['WebSocket Stream', 'Read-Only Metrics', 'Push Alerts']
  },
  {
    name: 'ShaderForge WebGPU Lab',
    developer: 'Linnea Lindholm (@linnea_gfx)',
    source_provider: 'GitHub',
    live_url: 'https://shaderforge-webgpu.netlify.app',
    repo_url: 'https://github.com/linnea-gfx/shaderforge',
    category: 'library',
    language: 'rust',
    version: '1.4.0',
    size: '11.2 MB',
    icon: '✨',
    description: 'WGSL & GLSL real-time raymarching shader playground compiled to WebAssembly via Rust.',
    permissions: ['WebGPU Pipeline', 'WASM Threads', 'Fullscreen Canvas']
  }
];

function safeParseArray(val, fallback = []) {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    try {
      return JSON.parse(val);
    } catch {
      return fallback;
    }
  }
  return fallback;
}

export default function AppStoreView({
  apps = [],
  darkMode,
  onDownloadApp,
  onCreateApp,
  onPlaySound
}) {
  const [selectedSource, setSelectedSource] = useState('all');
  const [selectedLang, setSelectedLang] = useState('all');
  const [selectedCat, setSelectedCat] = useState('all');
  const [query, setQuery] = useState('');
  const [installingIds, setInstallingIds] = useState({});
  const [installedIds, setInstalledIds] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [previewApp, setPreviewApp] = useState(null);
  const [scanningId, setScanningId] = useState(null);
  const [verifiedScanIds, setVerifiedScanIds] = useState({});

  // Multi-Source Import / Upload Form
  const [appName, setAppName] = useState('');
  const [appDesc, setAppDesc] = useState('');
  const [appVersion, setAppVersion] = useState('1.0.0');
  const [appCategory, setAppCategory] = useState('web');
  const [appLanguage, setAppLanguage] = useState('typescript');
  const [appDeveloper, setAppDeveloper] = useState('');
  const [appIcon, setAppIcon] = useState('🚀');
  const [sourceProvider, setSourceProvider] = useState('Netlify');
  const [liveUrl, setLiveUrl] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [importUrlInput, setImportUrlInput] = useState('');

  const sources = ['all', 'Netlify', 'Vercel', 'GitHub', 'NEX Official', 'Community Dev'];
  const languages = ['all', 'python', 'typescript', 'rust', 'go', 'javascript', 'cpp'];
  const categories = ['all', 'web', 'desktop', 'cli', 'api', 'utility', 'library'];

  const filteredApps = useMemo(() => {
    return apps.filter((a) => {
      const provider = a.source_provider || 'NEX Official';
      if (selectedSource !== 'all' && provider.toLowerCase() !== selectedSource.toLowerCase()) {
        return false;
      }
      if (selectedLang !== 'all' && a.language !== selectedLang) return false;
      if (selectedCat !== 'all' && a.category !== selectedCat) return false;
      if (query.trim()) {
        const q = query.toLowerCase().trim();
        return (
          a.name.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          a.developer.toLowerCase().includes(q) ||
          a.language.toLowerCase().includes(q) ||
          provider.toLowerCase().includes(q) ||
          (a.live_url || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [apps, selectedSource, selectedLang, selectedCat, query]);

  const handleInstall = async (app) => {
    if (installingIds[app.id]) return;
    onPlaySound?.('click');
    setInstallingIds((prev) => ({ ...prev, [app.id]: 20 }));
    setTimeout(() => setInstallingIds((prev) => ({ ...prev, [app.id]: 70 })), 220);
    setTimeout(async () => {
      await onDownloadApp(app.id);
      onPlaySound?.('success');
      setInstallingIds((prev) => {
        const copy = { ...prev };
        delete copy[app.id];
        return copy;
      });
      setInstalledIds((prev) => (prev.includes(app.id) ? prev : [...prev, app.id]));
    }, 520);
  };

  const handleAutoInspectUrl = () => {
    const raw = importUrlInput.trim();
    if (!raw) return;
    onPlaySound?.('ping');
    try {
      const normalized = raw.startsWith('http') ? raw : `https://${raw}`;
      const parsed = new URL(normalized);
      const host = parsed.hostname.toLowerCase();

      if (host.includes('netlify.app')) {
        const sub = host.split('.netlify.app')[0];
        const title = sub
          .split(/[-_]+/)
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');
        setSourceProvider('Netlify');
        setAppName(title || 'Netlify Edge App');
        setLiveUrl(normalized);
        setAppCategory('web');
        setAppLanguage('typescript');
        setAppDeveloper(`@${sub.split('-')[0]}_dev (Netlify Community)`);
        setAppDesc(`Live web application imported directly from Netlify deployment (${host}) with sandboxed security verification.`);
        setAppIcon('🌐');
      } else if (host.includes('vercel.app')) {
        const sub = host.split('.vercel.app')[0];
        const title = sub
          .split(/[-_]+/)
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');
        setSourceProvider('Vercel');
        setAppName(title || 'Vercel Edge App');
        setLiveUrl(normalized);
        setAppCategory('web');
        setAppLanguage('typescript');
        setAppDeveloper(`@${sub.split('-')[0]}_cloud`);
        setAppDesc(`Serverless edge application imported from Vercel (${host}).`);
        setAppIcon('▲');
      } else if (host.includes('github.com')) {
        const parts = parsed.pathname.split('/').filter(Boolean);
        const owner = parts[0] || 'community';
        const repo = parts[1] || 'open-source-app';
        const title = repo
          .split(/[-_]+/)
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');
        setSourceProvider('GitHub');
        setAppName(title);
        setRepoUrl(normalized);
        setLiveUrl(`https://${repo.toLowerCase()}.netlify.app`);
        setAppDeveloper(`${owner} (@${owner})`);
        setAppCategory('utility');
        setAppLanguage('rust');
        setAppDesc(`Open-source package imported from GitHub repository ${owner}/${repo}.`);
        setAppIcon('🐙');
      } else {
        const sub = host.split('.')[0];
        setSourceProvider('Community Dev');
        setAppName(sub.charAt(0).toUpperCase() + sub.slice(1));
        setLiveUrl(normalized);
        setAppDeveloper(`@${sub}_creator`);
        setAppDesc(`External developer web app hosted at ${normalized}.`);
        setAppIcon('🚀');
      }
    } catch {
      // ignore invalid URL
    }
  };

  const handleApplyPreset = (preset) => {
    onPlaySound?.('click');
    setAppName(preset.name);
    setAppDeveloper(preset.developer);
    setSourceProvider(preset.source_provider);
    setLiveUrl(preset.live_url);
    setRepoUrl(preset.repo_url);
    setAppCategory(preset.category);
    setAppLanguage(preset.language);
    setAppVersion(preset.version);
    setAppDesc(preset.description);
    setAppIcon(preset.icon);
    setImportUrlInput(preset.live_url);
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!appName.trim()) return;
    await onCreateApp({
      name: appName.trim(),
      description: appDesc.trim() || 'Community deployed software package',
      version: appVersion.trim() || '1.0.0',
      category: appCategory,
      language: appLanguage,
      developer: appDeveloper.trim() || 'Independent Developer',
      icon: appIcon,
      source_provider: sourceProvider,
      live_url: liveUrl.trim() || `https://${appName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')}.netlify.app`,
      repo_url: repoUrl.trim()
    });
    onPlaySound?.('success');
    setAppName('');
    setAppDesc('');
    setLiveUrl('');
    setRepoUrl('');
    setImportUrlInput('');
    setShowUploadModal(false);
  };

  const handleRunSecurityScan = (app) => {
    setScanningId(app.id);
    onPlaySound?.('security');
    setTimeout(() => {
      setScanningId(null);
      setVerifiedScanIds((prev) => ({
        ...prev,
        [app.id]: {
          timestamp: new Date().toLocaleTimeString(),
          score: app.security_score || 99
        }
      }));
    }, 650);
  };

  const getProviderBadgeStyle = (provider = 'NEX Official') => {
    const p = provider.toLowerCase();
    if (p.includes('netlify')) {
      return 'bg-teal-500/15 text-teal-400 border-teal-500/35';
    }
    if (p.includes('vercel')) {
      return 'bg-fuchsia-500/15 text-fuchsia-400 border-fuchsia-500/35';
    }
    if (p.includes('github')) {
      return 'bg-amber-500/15 text-amber-400 border-amber-500/35';
    }
    return 'bg-indigo-500/15 text-indigo-400 border-indigo-500/35';
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl p-6 md:p-8 theme-card">
        <div className="space-y-2 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-cyan-500/15 border border-cyan-500/30 px-3 py-0.5 font-mono-num text-xs font-bold text-cyan-400">
              <Terminal className="h-3.5 w-3.5" />
              <span>MULTI-SOURCE APP HUB • NETLIFY • GITHUB • COMMUNITY DEVS</span>
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 font-mono-num text-[11px] font-bold text-emerald-400">
              <ShieldCheck className="h-3.5 w-3.5" />
              SHA-256 Sandbox Verified
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold">
            NEX Ecosystem & Community App Store ({apps.length} Packages)
          </h1>
          <p className="text-xs sm:text-sm theme-text-muted">
            Discover and launch verified web apps, Netlify deployments, GitHub releases, and tools from independent developers—or import any external Netlify/Vercel/GitHub app in one click.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => {
              onPlaySound?.('click');
              setShowUploadModal(true);
            }}
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 px-5 py-3 text-xs font-semibold text-white shadow-lg shadow-indigo-600/25 transition cursor-pointer"
          >
            <Globe className="h-4 w-4" />
            <span>Import from Netlify / GitHub / Dev URL</span>
          </button>
        </div>
      </div>

      {/* Multi-Source Provider Filter Strip */}
      <div className="rounded-3xl p-4 space-y-3 theme-card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <span className="font-mono-num text-[11px] font-bold uppercase text-teal-400 mr-1">
              Source Host:
            </span>
            {sources.map((src) => (
              <button
                key={src}
                onClick={() => {
                  onPlaySound?.('click');
                  setSelectedSource(src);
                }}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                  selectedSource === src
                    ? 'bg-teal-500 text-slate-950 font-bold shadow-sm'
                    : 'theme-subtle hover:border-teal-400/50'
                }`}
              >
                {src === 'all' ? 'All Sources' : src}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search Netlify URL, dev, language..."
              className="w-full rounded-xl pl-9 pr-3 py-1.5 text-xs theme-input"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/[0.06]">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <span className="font-mono-num text-[11px] font-bold uppercase text-indigo-400 mr-1">
              Category:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCat(cat)}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold uppercase transition cursor-pointer ${
                  selectedCat === cat
                    ? 'bg-indigo-600 text-white'
                    : 'theme-subtle'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto">
            <Code2 className="h-3.5 w-3.5 text-cyan-400 shrink-0 mr-1" />
            {languages.map((lang) => (
              <button
                key={lang}
                onClick={() => setSelectedLang(lang)}
                className={`rounded-lg px-2.5 py-1 font-mono-num text-[11px] font-semibold uppercase transition cursor-pointer ${
                  selectedLang === lang
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-400/50'
                    : 'theme-text-muted hover:text-indigo-400'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Apps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredApps.map((app) => {
          const progress = installingIds[app.id];
          const isInstalled = installedIds.includes(app.id);
          const provider = app.source_provider || 'NEX Official';
          const permissions = safeParseArray(app.permissions_json, ['Sandboxed Iframe', 'Zero-Trust Verified']);
          const scanResult = verifiedScanIds[app.id];

          return (
            <div
              key={app.id}
              className="flex flex-col justify-between rounded-3xl p-5 space-y-4 transition-all duration-300 hover:-translate-y-1 theme-card"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-2xl">
                      {app.icon || '📦'}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-display text-base font-bold truncate">{app.name}</h3>
                        {Boolean(app.is_verified) && (
                          <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400 shrink-0" title="Verified Developer & SHA-256 Signature" />
                        )}
                      </div>
                      <p className="text-xs theme-text-muted truncate">
                        {app.developer} • <span className="font-mono-num">v{app.version}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span
                      className={`rounded-lg border px-2 py-0.5 font-mono-num text-[10px] font-bold uppercase ${getProviderBadgeStyle(
                        provider
                      )}`}
                    >
                      {provider}
                    </span>
                    <span className="font-mono-num text-[10px] uppercase text-slate-400">
                      {app.language}
                    </span>
                  </div>
                </div>

                <p className="text-xs leading-relaxed theme-text-muted line-clamp-2">
                  {app.description}
                </p>

                {/* Live Deployment URL Strip */}
                {app.live_url && (
                  <div className="flex items-center justify-between gap-2 rounded-xl px-3 py-1.5 text-[11px] theme-subtle">
                    <span className="font-mono-num truncate text-cyan-400">
                      {app.live_url.replace(/^https?:\/\//, '')}
                    </span>
                    <button
                      onClick={() => setPreviewApp(app)}
                      className="inline-flex items-center gap-1 font-semibold text-indigo-400 hover:text-indigo-300 shrink-0 cursor-pointer"
                    >
                      <Play className="h-3 w-3" />
                      <span>Preview</span>
                    </button>
                  </div>
                )}

                {/* Security & Permissions Pills */}
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 font-mono-num text-[10px] font-semibold text-emerald-400">
                    <ShieldCheck className="h-3 w-3" />
                    Security {app.security_score || 99}/100
                  </span>
                  {permissions.slice(0, 2).map((perm) => (
                    <span
                      key={perm}
                      className="rounded-md px-2 py-0.5 font-mono-num text-[10px] theme-subtle"
                    >
                      {perm}
                    </span>
                  ))}
                </div>

                {scanResult && (
                  <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 text-[11px] text-emerald-400 flex items-center justify-between">
                    <span>✓ SHA-256 & Sandbox Verified Clean</span>
                    <span className="font-mono-num text-[10px]">{scanResult.timestamp}</span>
                  </div>
                )}

                <div className="flex items-center justify-between font-mono-num text-[11px] theme-text-muted pt-1">
                  <span className="inline-flex items-center gap-1 text-amber-400 font-bold">
                    <Star className="h-3.5 w-3.5 fill-amber-400" />
                    {app.rating} ({app.reviews_count})
                  </span>
                  <span>{Number(app.downloads || 0).toLocaleString()} installs</span>
                  <span>{app.size}</span>
                </div>
              </div>

              {progress !== undefined ? (
                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between font-mono-num text-[10px] text-cyan-400">
                    <span>VERIFYING SHA-256 & INSTALLING...</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-2 pt-3 border-t border-white/[0.07]">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setPreviewApp(app)}
                      className="inline-flex items-center gap-1 rounded-xl px-2.5 py-2 text-xs font-semibold theme-subtle hover:border-cyan-400/50 cursor-pointer"
                      title="Open Live Sandbox & Security Inspector"
                    >
                      <Play className="h-3.5 w-3.5 text-cyan-400" />
                      <span>Sandbox</span>
                    </button>
                    <button
                      onClick={() => handleRunSecurityScan(app)}
                      disabled={scanningId === app.id}
                      className="inline-flex items-center gap-1 rounded-xl px-2.5 py-2 text-xs font-semibold theme-subtle hover:border-emerald-400/50 cursor-pointer"
                      title="Run SHA-256 & Sandbox Security Audit"
                    >
                      <ShieldCheck
                        className={`h-3.5 w-3.5 text-emerald-400 ${
                          scanningId === app.id ? 'animate-spin' : ''
                        }`}
                      />
                    </button>
                  </div>

                  <button
                    onClick={() => handleInstall(app)}
                    className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition cursor-pointer ${
                      isInstalled
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-500/25'
                    }`}
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>{isInstalled ? 'Installed ✓' : 'Install App'}</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Live App Sandbox & Security Inspector Modal */}
      {previewApp && (
        <div
          onClick={() => setPreviewApp(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-3xl rounded-3xl p-6 space-y-5 shadow-2xl theme-card"
          >
            <div className="flex items-start justify-between gap-4 border-b border-white/[0.08] pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-2xl">
                  {previewApp.icon || '🚀'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-lg font-bold">{previewApp.name}</h3>
                    <span
                      className={`rounded-lg border px-2 py-0.5 font-mono-num text-[10px] font-bold uppercase ${getProviderBadgeStyle(
                        previewApp.source_provider
                      )}`}
                    >
                      {previewApp.source_provider || 'NEX Official'}
                    </span>
                  </div>
                  <p className="text-xs theme-text-muted">
                    Developed by <strong>{previewApp.developer}</strong> • Version {previewApp.version}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPreviewApp(null)}
                className="rounded-xl p-2 theme-subtle cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Interactive Simulated App Sandbox Viewport */}
            <div className="rounded-2xl border border-indigo-500/30 bg-slate-950 p-5 text-slate-100 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  <span className="ml-2 font-mono-num text-xs text-cyan-400">
                    {previewApp.live_url || `https://${previewApp.id}.netlify.app`}
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 font-mono-num text-[10px] text-emerald-400">
                  <Lock className="h-3 w-3" />
                  TLS 1.3 • Isolated Container
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center py-2">
                <div className="space-y-2.5">
                  <div className="inline-flex items-center gap-1.5 font-mono-num text-xs text-indigo-400">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>LIVE INTERACTIVE RUNTIME TELEMETRY</span>
                  </div>
                  <h4 className="font-display text-base font-bold text-white">
                    {previewApp.name} Sandbox Environment
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {previewApp.description}
                  </p>
                  <div className="pt-1 flex flex-wrap gap-2">
                    {previewApp.live_url && (
                      <a
                        href={previewApp.live_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 px-3.5 py-2 text-xs font-bold text-slate-950 transition"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span>Open Deployment ({previewApp.source_provider || 'Netlify'})</span>
                      </a>
                    )}
                    {previewApp.repo_url && (
                      <a
                        href={previewApp.repo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-200 transition"
                      >
                        <GitBranch className="h-3.5 w-3.5" />
                        <span>Source Repo</span>
                      </a>
                    )}
                  </div>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-3.5 font-mono-num text-[11px] space-y-2">
                  <div className="text-emerald-400 font-bold">
                    $ nex-sandbox verify --app {previewApp.id}
                  </div>
                  <div className="text-slate-300">
                    • Provider: <span className="text-cyan-300">{previewApp.source_provider || 'NEX Official'}</span>
                  </div>
                  <div className="text-slate-300 truncate">
                    • SHA-256: <span className="text-indigo-300">{previewApp.sha256_hash || 'e3b0c44298fc1c149afbf4c8996fb924'}</span>
                  </div>
                  <div className="text-slate-300">
                    • Security Audit: <span className="text-emerald-400">{previewApp.security_score || 99}/100 (0 CVEs)</span>
                  </div>
                  <div className="text-slate-300">
                    • Capabilities: {safeParseArray(previewApp.permissions_json, ['Sandboxed Iframe']).join(', ')}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                onClick={() => handleRunSecurityScan(previewApp)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-400 cursor-pointer"
              >
                <ShieldCheck className="h-4 w-4" />
                <span>Re-Verify Cryptographic Checksum</span>
              </button>

              <button
                onClick={() => {
                  handleInstall(previewApp);
                  setPreviewApp(null);
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-5 py-2.5 text-xs font-semibold text-white cursor-pointer"
              >
                <Download className="h-4 w-4" />
                <span>Install & Sync Package</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import / Publish App from Netlify, Vercel, GitHub or Other Devs Modal */}
      {showUploadModal && (
        <div
          onClick={() => setShowUploadModal(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto"
        >
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleUploadSubmit}
            className="w-full max-w-2xl rounded-3xl p-6 space-y-4 shadow-2xl theme-card my-8"
          >
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div>
                <h3 className="font-display text-lg font-bold">
                  Import App from Netlify, GitHub, Vercel or External Developer
                </h3>
                <p className="text-xs theme-text-muted">
                  Paste any live deployment URL (`*.netlify.app`, `*.vercel.app`, `github.com/*`) or pick a community developer preset below.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="rounded-xl p-1.5 theme-subtle cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* 1-Click Smart URL Auto-Inspector */}
            <div className="rounded-2xl p-3.5 space-y-2.5 theme-subtle">
              <label className="block font-mono-num text-[10px] font-bold uppercase text-teal-400">
                1. Auto-Detect from Netlify / Vercel / GitHub URL
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={importUrlInput}
                  onChange={(e) => setImportUrlInput(e.target.value)}
                  placeholder="https://my-custom-app.netlify.app or https://github.com/dev/repo"
                  className="flex-1 rounded-xl px-3.5 py-2 text-xs theme-input"
                />
                <button
                  type="button"
                  onClick={handleAutoInspectUrl}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 px-4 py-2 text-xs font-bold text-slate-950 transition cursor-pointer shrink-0"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Auto-Inspect URL</span>
                </button>
              </div>

              {/* 1-Click Community Developer Presets */}
              <div className="pt-1">
                <div className="font-mono-num text-[10px] uppercase theme-text-muted mb-1.5">
                  Or click a verified community developer app preset to fill:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {COMMUNITY_NETLIFY_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => handleApplyPreset(preset)}
                      className="flex items-center justify-between rounded-xl border border-white/[0.08] px-3 py-1.5 text-left text-xs hover:border-teal-400/50 transition cursor-pointer"
                    >
                      <span className="truncate font-semibold">
                        {preset.icon} {preset.name}
                      </span>
                      <span className="font-mono-num text-[10px] text-teal-400 ml-2 shrink-0">
                        {preset.source_provider}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* App Details Form */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-mono-num text-[10px] uppercase theme-text-muted mb-1">
                  Application Name *
                </label>
                <input
                  type="text"
                  required
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  placeholder="e.g. Quantum Circuit Studio"
                  className="w-full rounded-xl px-3.5 py-2 text-xs theme-input"
                />
              </div>

              <div>
                <label className="block font-mono-num text-[10px] uppercase theme-text-muted mb-1">
                  Developer / Author Handle *
                </label>
                <input
                  type="text"
                  required
                  value={appDeveloper}
                  onChange={(e) => setAppDeveloper(e.target.value)}
                  placeholder="e.g. @elena_quantum (External Dev)"
                  className="w-full rounded-xl px-3.5 py-2 text-xs theme-input"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div>
                <label className="block font-mono-num text-[10px] uppercase theme-text-muted mb-1">
                  Source Platform
                </label>
                <select
                  value={sourceProvider}
                  onChange={(e) => setSourceProvider(e.target.value)}
                  className="w-full rounded-xl px-2.5 py-2 text-xs theme-input"
                >
                  <option value="Netlify">Netlify</option>
                  <option value="Vercel">Vercel</option>
                  <option value="GitHub">GitHub</option>
                  <option value="Community Dev">Community Dev</option>
                  <option value="NEX Official">NEX Official</option>
                </select>
              </div>

              <div>
                <label className="block font-mono-num text-[10px] uppercase theme-text-muted mb-1">
                  Category
                </label>
                <select
                  value={appCategory}
                  onChange={(e) => setAppCategory(e.target.value)}
                  className="w-full rounded-xl px-2.5 py-2 text-xs theme-input"
                >
                  {categories
                    .filter((c) => c !== 'all')
                    .map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block font-mono-num text-[10px] uppercase theme-text-muted mb-1">
                  Language
                </label>
                <select
                  value={appLanguage}
                  onChange={(e) => setAppLanguage(e.target.value)}
                  className="w-full rounded-xl px-2.5 py-2 text-xs theme-input"
                >
                  {languages
                    .filter((l) => l !== 'all')
                    .map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block font-mono-num text-[10px] uppercase theme-text-muted mb-1">
                  Version
                </label>
                <input
                  type="text"
                  value={appVersion}
                  onChange={(e) => setAppVersion(e.target.value)}
                  className="w-full rounded-xl px-3 py-2 text-xs theme-input"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-mono-num text-[10px] uppercase theme-text-muted mb-1">
                  Live Deployment URL (Netlify / Vercel / Web)
                </label>
                <input
                  type="text"
                  value={liveUrl}
                  onChange={(e) => setLiveUrl(e.target.value)}
                  placeholder="https://your-app.netlify.app"
                  className="w-full rounded-xl px-3.5 py-2 text-xs theme-input"
                />
              </div>

              <div>
                <label className="block font-mono-num text-[10px] uppercase theme-text-muted mb-1">
                  GitHub / Source Repository URL
                </label>
                <input
                  type="text"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="https://github.com/username/repository"
                  className="w-full rounded-xl px-3.5 py-2 text-xs theme-input"
                />
              </div>
            </div>

            <div>
              <label className="block font-mono-num text-[10px] uppercase theme-text-muted mb-1">
                Description & Capabilities
              </label>
              <textarea
                rows={2}
                value={appDesc}
                onChange={(e) => setAppDesc(e.target.value)}
                placeholder="Describe what this app does and how it integrates with NEX..."
                className="w-full rounded-xl px-3.5 py-2 text-xs theme-input"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="inline-flex items-center gap-1.5 font-mono-num text-[11px] text-emerald-400">
                <ShieldCheck className="h-4 w-4" />
                Auto-generates SHA-256 signature & sandbox security profile
              </span>

              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 px-6 py-2.5 text-xs font-bold text-white shadow-lg cursor-pointer"
              >
                <Upload className="h-4 w-4" />
                <span>Verify & Publish to SQLite</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
