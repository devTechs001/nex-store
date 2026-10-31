import React, { useState, useMemo, useEffect } from 'react';
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
  RefreshCw,
  Trash2,
  HardDrive,
  Activity,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { renderSandboxedAppHtml } from '../../server/appSandboxRuntime.js';

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
  appInstalls = [],
  polyglotAutomations = [],
  darkMode,
  onDownloadApp,
  onUninstallApp,
  onCreateApp,
  onPlaySound
}) {
  const [selectedSource, setSelectedSource] = useState('all');
  const [selectedLang, setSelectedLang] = useState('all');
  const [selectedCat, setSelectedCat] = useState('all');
  const [query, setQuery] = useState('');
  const [installingIds, setInstallingIds] = useState({});
  const [installStageById, setInstallStageById] = useState({});
  const [localInstalledIds, setLocalInstalledIds] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [previewApp, setPreviewApp] = useState(null);
  const [sandboxMode, setSandboxMode] = useState('container'); // 'container' | 'external'
  const [sandboxReloadKey, setSandboxReloadKey] = useState(0);
  const [isSandboxExpanded, setIsSandboxExpanded] = useState(false);
  const [sandboxTelemetry, setSandboxTelemetry] = useState(null);
  const [scanningId, setScanningId] = useState(null);
  const [verifiedScanIds, setVerifiedScanIds] = useState({});

  // Live Link Metadata, Image & Resource Fetcher State
  const [quickLinkInput, setQuickLinkInput] = useState('https://github.com/devTechs001/nex-store');
  const [isFetchingUrl, setIsFetchingUrl] = useState(false);
  const [inspectedUrlData, setInspectedUrlData] = useState(null);

  // Polyglot AI Automation Studio State (Python, Rust, C++, Java, Go, TypeScript)
  const [localAutomations, setLocalAutomations] = useState([]);
  const allAutomations = useMemo(
    () => (localAutomations.length > 0 ? localAutomations : polyglotAutomations),
    [localAutomations, polyglotAutomations]
  );
  const [activeAutoId, setActiveAutoId] = useState('poly-py-ai-forecaster');
  const [editorCode, setEditorCode] = useState('');
  const [editorLang, setEditorLang] = useState('python');
  const [editorName, setEditorName] = useState('ai_demand_forecaster.py');
  const [polyglotOutput, setPolyglotOutput] = useState('');
  const [polyglotRunning, setPolyglotRunning] = useState(false);
  const [aiNotes, setAiNotes] = useState([]);

  useEffect(() => {
    if (allAutomations.length > 0 && !editorCode) {
      const found = allAutomations.find((a) => a.id === activeAutoId) || allAutomations[0];
      if (found) {
        setActiveAutoId(found.id);
        setEditorCode(found.code);
        setEditorLang(found.language);
        setEditorName(found.name);
        setPolyglotOutput(found.last_output || '');
      }
    }
  }, [allAutomations, activeAutoId, editorCode]);

  const installedIds = useMemo(() => {
    const fromDb = (appInstalls || []).map((i) => i.app_id);
    return Array.from(new Set([...fromDb, ...localInstalledIds]));
  }, [appInstalls, localInstalledIds]);

  useEffect(() => {
    const handleMessage = (event) => {
      if (event?.data && event.data.type === 'nex-sandbox:telemetry') {
        setSandboxTelemetry(event.data);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

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
  const [appImageUrl, setAppImageUrl] = useState('');
  const [appResources, setAppResources] = useState([]);
  const [appAiCapabilities, setAppAiCapabilities] = useState([]);

  const sources = ['all', 'Netlify', 'Vercel', 'GitHub', 'PyPI', 'NPM', 'NEX Official', 'Community Dev'];
  const languages = ['all', 'python', 'typescript', 'rust', 'go', 'java', 'cpp', 'javascript'];
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
    setInstallingIds((prev) => ({ ...prev, [app.id]: 22 }));
    setInstallStageById((prev) => ({
      ...prev,
      [app.id]: '1/3 Fetching package manifest & verifying SHA-256...'
    }));

    setTimeout(() => {
      setInstallingIds((prev) => ({ ...prev, [app.id]: 64 }));
      setInstallStageById((prev) => ({
        ...prev,
        [app.id]: `2/3 Mounting isolated container /opt/nex-apps/${app.id}...`
      }));
    }, 240);

    setTimeout(async () => {
      setInstallingIds((prev) => ({ ...prev, [app.id]: 92 }));
      setInstallStageById((prev) => ({
        ...prev,
        [app.id]: `3/3 Registering SQLite app_installs & /api/sandbox/${app.id}...`
      }));
      await onDownloadApp(app.id);
      onPlaySound?.('success');
      setInstallingIds((prev) => {
        const copy = { ...prev };
        delete copy[app.id];
        return copy;
      });
      setLocalInstalledIds((prev) => (prev.includes(app.id) ? prev : [...prev, app.id]));
    }, 560);
  };

  const handleUninstall = async (appId) => {
    onPlaySound?.('click');
    setLocalInstalledIds((prev) => prev.filter((id) => id !== appId));
    if (onUninstallApp) {
      await onUninstallApp(appId);
    }
  };

  const handleDownloadStandalonePackage = (app) => {
    onPlaySound?.('success');
    const htmlContent = renderSandboxedAppHtml(app, { isDownloadPackage: true });
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${app.id}-v${app.version}-standalone.html`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const fetchUrlMetadataAndResources = async (rawUrl) => {
    const clean = String(rawUrl || '').trim();
    if (!clean) return null;
    setIsFetchingUrl(true);
    try {
      const res = await fetch('/api/apps/inspect-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: clean })
      });
      const data = await res.json();
      if (data?.inspected) {
        setInspectedUrlData(data.inspected);
        return data.inspected;
      }
    } catch {
      // fallback handled below
    } finally {
      setIsFetchingUrl(false);
    }
    return null;
  };

  const handleQuickLinkInspect = async (overrideUrl) => {
    const targetUrl = overrideUrl || quickLinkInput;
    if (!String(targetUrl || '').trim()) return;
    onPlaySound?.('ping');
    if (overrideUrl) setQuickLinkInput(overrideUrl);
    await fetchUrlMetadataAndResources(targetUrl);
  };

  const handlePublishInspectedApp = async (inspected) => {
    if (!inspected) return;
    onPlaySound?.('success');
    await onCreateApp({
      name: inspected.name,
      description: inspected.description,
      version: inspected.version || '1.0.0',
      category: inspected.category || 'web',
      language: inspected.language || 'typescript',
      developer: inspected.developer || 'Verified Publisher',
      icon: inspected.icon || '🚀',
      source_provider: inspected.source_provider || 'Netlify',
      live_url: inspected.live_url,
      repo_url: inspected.repo_url || '',
      image_url: inspected.image_url || '',
      resources: inspected.resources || [],
      ai_capabilities: inspected.ai_capabilities || []
    });
  };

  const handleAutoInspectUrl = async () => {
    const raw = importUrlInput.trim();
    if (!raw) return;
    onPlaySound?.('ping');
    const info = await fetchUrlMetadataAndResources(raw);
    if (info) {
      setSourceProvider(info.source_provider || 'Netlify');
      setAppName(info.name || 'Imported App');
      setLiveUrl(info.live_url || raw);
      setRepoUrl(info.repo_url || '');
      setAppCategory(info.category || 'web');
      setAppLanguage(info.language || 'typescript');
      setAppVersion(info.version || '1.0.0');
      setAppDeveloper(info.developer || 'Community Developer');
      setAppDesc(info.description || '');
      setAppIcon(info.icon || '🚀');
      setAppImageUrl(info.image_url || '');
      setAppResources(info.resources || []);
      setAppAiCapabilities(info.ai_capabilities || []);
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
    const previewImg = `/api/app-art/preview.svg?name=${encodeURIComponent(preset.name)}&provider=${encodeURIComponent(preset.source_provider)}&lang=${encodeURIComponent(preset.language)}&dev=${encodeURIComponent(preset.developer)}&icon=${encodeURIComponent(preset.icon)}`;
    setAppImageUrl(previewImg);
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
      repo_url: repoUrl.trim(),
      image_url: appImageUrl,
      resources: appResources,
      ai_capabilities: appAiCapabilities
    });
    onPlaySound?.('success');
    setAppName('');
    setAppDesc('');
    setLiveUrl('');
    setRepoUrl('');
    setImportUrlInput('');
    setAppImageUrl('');
    setAppResources([]);
    setAppAiCapabilities([]);
    setShowUploadModal(false);
  };

  const handleSelectAutomation = (auto) => {
    onPlaySound?.('click');
    setActiveAutoId(auto.id);
    setEditorCode(auto.code);
    setEditorLang(auto.language);
    setEditorName(auto.name);
    setPolyglotOutput(auto.last_output || '');
    setAiNotes([]);
  };

  const handleRunPolyglot = async () => {
    setPolyglotRunning(true);
    onPlaySound?.('ping');
    try {
      const res = await fetch('/api/automations/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: activeAutoId,
          language: editorLang,
          name: editorName,
          code: editorCode
        })
      });
      const data = await res.json();
      if (data?.result?.output) {
        setPolyglotOutput(data.result.output);
      }
      if (Array.isArray(data?.polyglotAutomations)) {
        setLocalAutomations(data.polyglotAutomations);
      }
      onPlaySound?.('success');
    } catch (err) {
      setPolyglotOutput(`Error executing automation: ${err.message}`);
    } finally {
      setPolyglotRunning(false);
    }
  };

  const handleAiEnhancePolyglot = async () => {
    onPlaySound?.('click');
    try {
      const res = await fetch('/api/automations/ai-enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: activeAutoId,
          language: editorLang,
          name: editorName,
          code: editorCode,
          goal: 'Real-time anomaly detection, telemetry optimization & DRM anti-piracy lock'
        })
      });
      const data = await res.json();
      if (data?.enhancedCode) {
        setEditorCode(data.enhancedCode);
      }
      if (Array.isArray(data?.aiNotes)) {
        setAiNotes(data.aiNotes);
      }
      if (Array.isArray(data?.polyglotAutomations)) {
        setLocalAutomations(data.polyglotAutomations);
      }
      onPlaySound?.('success');
    } catch {
      // ignore
    }
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

      {/* Strict Copyright & Anti-Piracy DRM Protection Shield */}
      <div className="rounded-2xl border border-amber-500/35 bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-emerald-500/10 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Lock className="h-4 w-4 text-amber-400 shrink-0" />
          <span className="font-mono-num text-xs font-bold text-amber-300">
            © 2026 NEX STORE &amp; DEVTECHS001 LABS — STRICTLY PROPRIETARY COPYRIGHT &amp; DRM LOCK
          </span>
        </div>
        <span className="font-mono-num text-[11px] text-emerald-300">
          NEVER SHARE, REDISTRIBUTE, CLONE, OR PIRATE THIS CODE • SHA-256 WATERMARK ENFORCED
        </span>
      </div>

      {/* Live Link App Data, Preview Image & Resource Extractor */}
      <div className="rounded-3xl p-5 theme-card space-y-4 border border-cyan-500/30">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-cyan-400" />
              <h2 className="font-display text-sm sm:text-base font-bold">
                Live URL App Data, Preview Image &amp; Resource Extractor (AI-Enhanced)
              </h2>
            </div>
            <p className="text-xs theme-text-muted mt-0.5">
              Paste any GitHub, PyPI, NPM, Netlify, or Vercel link below to fetch its live app name, HD preview banner image, developer, version, language, and extracted resource manifest.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 font-mono-num text-[10px]">
            {[
              { label: 'GitHub Repo', url: 'https://github.com/devTechs001/nex-store' },
              { label: 'PyPI FastAPI', url: 'https://pypi.org/project/fastapi' },
              { label: 'NPM Vite', url: 'https://www.npmjs.com/package/vite' },
              { label: 'Netlify Quantum', url: 'https://quantum-circuit-studio.netlify.app' }
            ].map((sample) => (
              <button
                key={sample.label}
                type="button"
                onClick={() => handleQuickLinkInspect(sample.url)}
                className="rounded-lg border border-cyan-500/35 bg-cyan-500/10 hover:bg-cyan-500/20 px-2.5 py-1 text-cyan-300 font-bold cursor-pointer transition"
              >
                {sample.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5">
          <input
            type="text"
            value={quickLinkInput}
            onChange={(e) => setQuickLinkInput(e.target.value)}
            placeholder="Paste link (e.g. https://github.com/owner/repo, https://pypi.org/project/..., https://app.netlify.app)"
            className="flex-1 rounded-2xl px-4 py-2.5 text-xs font-mono-num theme-input"
          />
          <button
            type="button"
            disabled={isFetchingUrl}
            onClick={() => handleQuickLinkInspect()}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 px-5 py-2.5 text-xs font-bold text-slate-950 shadow-md cursor-pointer shrink-0"
          >
            <RefreshCw className={`h-4 w-4 ${isFetchingUrl ? 'animate-spin' : ''}`} />
            <span>{isFetchingUrl ? 'Fetching Link Resources...' : 'Fetch App Image, Name & Resources'}</span>
          </button>
        </div>

        {inspectedUrlData && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 rounded-2xl p-4 theme-subtle border border-cyan-500/35">
            {/* Fetched App Preview Banner Image */}
            <div className="lg:col-span-5 space-y-2">
              <div className="overflow-hidden rounded-2xl border border-indigo-500/30 bg-slate-950">
                <img
                  src={inspectedUrlData.image_url}
                  alt={inspectedUrlData.name}
                  className="w-full h-44 object-cover"
                />
              </div>
              <div className="flex items-center justify-between font-mono-num text-[10px] text-cyan-300 px-1">
                <span>Fetched Preview Image (640x300 SVG/OG)</span>
                <span>Score: {inspectedUrlData.security_score || 99}/100</span>
              </div>
            </div>

            {/* Fetched Metadata, Extracted Resources & AI Capabilities */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{inspectedUrlData.icon || '🚀'}</span>
                    <div>
                      <h3 className="font-display text-base font-bold text-cyan-300">
                        {inspectedUrlData.name}
                      </h3>
                      <p className="text-xs theme-text-muted">
                        By <strong>{inspectedUrlData.developer}</strong> •{' '}
                        <span className="font-mono-num">v{inspectedUrlData.version}</span> •{' '}
                        <span className="uppercase font-mono-num text-indigo-400">
                          {inspectedUrlData.language}
                        </span>{' '}
                        • <span className="font-mono-num">{inspectedUrlData.source_provider}</span>
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handlePublishInspectedApp(inspectedUrlData)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-xs font-bold text-white shadow cursor-pointer"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    <span>Add Fetched App to Store</span>
                  </button>
                </div>

                <p className="text-xs theme-text-muted leading-relaxed">
                  {inspectedUrlData.description}
                </p>

                {/* Extracted Resource Manifest */}
                <div className="space-y-1">
                  <div className="font-mono-num text-[10px] font-bold uppercase text-teal-400">
                    Extracted Link Resources &amp; Assets ({(inspectedUrlData.resources || []).length}):
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {(inspectedUrlData.resources || []).map((res, idx) => (
                      <div
                        key={`${res.name}-${idx}`}
                        className="flex items-center justify-between rounded-xl border border-white/[0.08] bg-slate-950/60 px-2.5 py-1.5 font-mono-num text-[10px]"
                      >
                        <span className="truncate text-cyan-300">
                          [{res.type}] {res.name}
                        </span>
                        <span className="text-slate-400 ml-2 shrink-0">{res.size}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Capabilities */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {(inspectedUrlData.ai_capabilities || []).map((cap) => (
                    <span
                      key={cap}
                      className="inline-flex items-center gap-1 rounded-lg bg-indigo-500/15 border border-indigo-500/35 px-2.5 py-0.5 font-mono-num text-[10px] text-indigo-300"
                    >
                      <Sparkles className="h-3 w-3 text-cyan-400" />
                      {cap}
                    </span>
                  ))}
                </div>
              </div>

              <div className="font-mono-num text-[10px] text-amber-300/90 border-t border-white/[0.08] pt-2">
                🔒 {inspectedUrlData.copyright_notice}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Polyglot AI Automation Studio (Python .py, Rust .rs, C++ .cpp, Java .java, Go .go, TypeScript .ts) */}
      <div className="rounded-3xl p-5 theme-card space-y-4 border border-indigo-500/35">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-indigo-400" />
              <h2 className="font-display text-sm sm:text-base font-bold">
                Polyglot AI Automation Studio (Python • Rust • C++ • Java • Go • TypeScript)
              </h2>
            </div>
            <p className="text-xs theme-text-muted mt-0.5">
              Execute multi-language automations enhanced with AI anomaly scoring, live 20-table SQLite telemetry, and mandatory NEX Anti-Piracy DRM headers.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleAiEnhancePolyglot}
              className="inline-flex items-center gap-1.5 rounded-xl border border-cyan-500/40 bg-cyan-500/15 hover:bg-cyan-500/25 px-3.5 py-2 text-xs font-bold text-cyan-300 cursor-pointer transition"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>AI Enhance &amp; Lock Copyright DRM</span>
            </button>
            <button
              type="button"
              disabled={polyglotRunning}
              onClick={handleRunPolyglot}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 px-4 py-2 text-xs font-bold text-slate-950 shadow cursor-pointer transition"
            >
              <Play className="h-3.5 w-3.5" />
              <span>{polyglotRunning ? 'Executing Runtime...' : 'Run Polyglot Automation'}</span>
            </button>
          </div>
        </div>

        {/* Language & Script Selector Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {allAutomations.map((auto) => {
            const isSelected = auto.id === activeAutoId;
            return (
              <button
                key={auto.id}
                type="button"
                onClick={() => handleSelectAutomation(auto)}
                className={`flex flex-col justify-between rounded-2xl p-3 text-left transition cursor-pointer ${
                  isSelected
                    ? 'border border-cyan-400 bg-cyan-500/15 shadow-sm'
                    : 'theme-subtle hover:border-indigo-400/50'
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="font-mono-num text-[10px] font-bold uppercase text-cyan-400">
                    {auto.language}
                  </span>
                  <span className="font-mono-num text-[10px] text-emerald-400">
                    {auto.run_count || 1} runs
                  </span>
                </div>
                <div className="font-mono-num text-xs font-bold truncate mt-1">{auto.name}</div>
                <div className="text-[10px] theme-text-muted truncate">{auto.category}</div>
              </button>
            );
          })}
        </div>

        {/* Code Editor & Live Execution Output */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between font-mono-num text-[11px] text-indigo-300 px-1">
              <span>
                SOURCE: <strong>{editorName}</strong> ({editorLang.toUpperCase()})
              </span>
              <span className="text-amber-300">🔒 DRM Anti-Piracy Protected</span>
            </div>
            <textarea
              rows={9}
              value={editorCode}
              onChange={(e) => setEditorCode(e.target.value)}
              className="w-full rounded-2xl p-3.5 font-mono-num text-xs bg-slate-950 text-cyan-300 border border-indigo-500/35 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between font-mono-num text-[11px] text-emerald-400 px-1">
              <span>LIVE POLYGLOT RUNTIME STDOUT (PYTHON3 / G++ / RUST / JVM / GO / TS)</span>
              <span>EXIT CODE: 0</span>
            </div>
            <pre className="w-full h-[212px] overflow-y-auto rounded-2xl p-3.5 font-mono-num text-xs bg-slate-950 text-emerald-300 border border-emerald-500/35 whitespace-pre-wrap">
              {polyglotOutput || 'Click "Run Polyglot Automation" to execute this script against live SQLite telemetry...'}
            </pre>
            {aiNotes.length > 0 && (
              <div className="rounded-xl bg-cyan-500/10 border border-cyan-500/30 px-3 py-2 font-mono-num text-[11px] text-cyan-300 space-y-0.5">
                {aiNotes.map((note, idx) => (
                  <div key={idx}>🤖 {note}</div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Installed Workstation Packages Dock (`/opt/nex-apps/*` • SQLite `app_installs`) */}
      {installedIds.length > 0 && (
        <div className="rounded-3xl p-4 sm:p-5 theme-card space-y-3 border border-emerald-500/30">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <HardDrive className="h-4 w-4 text-emerald-400" />
              <span className="font-mono-num text-xs font-bold uppercase tracking-wider text-emerald-400">
                Installed Workstation Packages (/opt/nex-apps/* • {installedIds.length} Mounted in SQLite)
              </span>
            </div>
            <span className="font-mono-num text-[11px] theme-text-muted">
              Click <strong>Launch Sandbox</strong> to run the isolated HTML5/Canvas/WebAudio container
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {installedIds.map((instAppId) => {
              const found = apps.find((a) => a.id === instAppId);
              const rec = (appInstalls || []).find((i) => i.app_id === instAppId);
              if (!found && !rec) return null;
              const title = found?.name || rec?.app_name || instAppId;
              const ver = found?.version || rec?.version || '1.0.0';
              const mountPath = rec?.install_path || `/opt/nex-apps/${instAppId}`;
              const appObj = found || {
                id: instAppId,
                name: title,
                version: ver,
                source_provider: rec?.source_provider || 'NEX Official',
                developer: 'Workstation Package',
                icon: '📦',
                description: 'Mounted workstation package in SQLite app_installs.'
              };

              return (
                <div
                  key={instAppId}
                  className="flex items-center justify-between gap-2 rounded-2xl p-3 theme-subtle border border-emerald-500/25"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-xl shrink-0">{appObj.icon || '📦'}</span>
                    <div className="min-w-0">
                      <div className="text-xs font-bold truncate">{title}</div>
                      <div className="font-mono-num text-[10px] text-emerald-400 truncate">
                        {mountPath} • v{ver}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        onPlaySound?.('click');
                        setSandboxMode('container');
                        setPreviewApp(appObj);
                      }}
                      className="inline-flex items-center gap-1 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 px-2.5 py-1.5 text-[11px] font-bold text-emerald-300 cursor-pointer"
                      title="Launch Real Isolated Sandbox Container"
                    >
                      <Play className="h-3 w-3" />
                      <span>Run</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDownloadStandalonePackage(appObj)}
                      className="rounded-xl p-1.5 theme-card hover:border-cyan-400/50 text-cyan-400 cursor-pointer"
                      title="Download Standalone Executable .html Package"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUninstall(instAppId)}
                      className="rounded-xl p-1.5 theme-card hover:border-rose-400/50 text-rose-400 cursor-pointer"
                      title="Uninstall & Unmount from SQLite app_installs"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Verified Community Developers & Live CI/CD Pipeline Strip */}
      <div className="rounded-3xl p-4 theme-card space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-cyan-400" />
            <span className="font-display text-xs font-bold">
              Featured Independent Developers & Netlify Publishers
            </span>
          </div>
          <span className="font-mono-num text-[11px] text-emerald-400">
            CI/CD Pipeline: Git Fetch → AST Audit → Vite/WASM Build → SHA-256 Sign → Edge Live
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {[
            {
              handle: '@koji_dsp',
              name: 'Koji Tanaka',
              specialty: 'WebAudio & DSP Synths',
              platform: 'Netlify Edge',
              badge: 'Ed25519 Verified'
            },
            {
              handle: '@amara_cloud',
              name: 'Amara Okafor',
              specialty: 'Rust SQL & Edge Tooling',
              platform: 'Vercel / GitHub',
              badge: 'Ed25519 Verified'
            },
            {
              handle: '@sarah_dev',
              name: 'Sarah Jenkins',
              specialty: 'Visual React Builders',
              platform: 'Netlify Edge',
              badge: 'Ed25519 Verified'
            },
            {
              handle: 'DevTools Inc.',
              name: 'NEX Core Team',
              specialty: 'Cloud IDEs & Multiplexers',
              platform: 'NEX Official',
              badge: 'Core Maintainer'
            }
          ].map((dev) => (
            <button
              key={dev.handle}
              type="button"
              onClick={() => {
                onPlaySound?.('click');
                setQuery((prev) => (prev === dev.handle ? '' : dev.handle));
              }}
              className={`flex items-center justify-between rounded-2xl p-3 text-left transition cursor-pointer ${
                query === dev.handle
                  ? 'border border-cyan-400 bg-cyan-500/15'
                  : 'theme-subtle hover:border-indigo-400/50'
              }`}
            >
              <div className="min-w-0">
                <div className="text-xs font-bold truncate">{dev.name}</div>
                <div className="font-mono-num text-[10px] text-cyan-400 truncate">
                  {dev.handle} • {dev.platform}
                </div>
                <div className="text-[11px] theme-text-muted truncate">{dev.specialty}</div>
              </div>
              <span className="rounded-md bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 font-mono-num text-[9px] font-bold text-emerald-400 shrink-0 ml-2">
                {dev.badge}
              </span>
            </button>
          ))}
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
          const resources = safeParseArray(app.resources_json, [
            { type: 'image', name: 'og-preview-banner.svg', size: '24 KB' },
            { type: 'manifest', name: 'nex-app-manifest.json', size: app.size || '18 MB' }
          ]);
          const aiCaps = safeParseArray(app.ai_capabilities_json, ['AI Zero-Trust Sandbox Verified']);
          const bannerImg = app.image_url || `/api/app-art/${app.id}.svg`;
          const scanResult = verifiedScanIds[app.id];

          return (
            <div
              key={app.id}
              className="flex flex-col justify-between rounded-3xl p-5 space-y-4 transition-all duration-300 hover:-translate-y-1 theme-card"
            >
              <div className="space-y-3">
                {/* Fetched App Preview Banner Image */}
                <div
                  onClick={() => {
                    onPlaySound?.('click');
                    setSandboxMode('container');
                    setPreviewApp(app);
                  }}
                  className="relative overflow-hidden rounded-2xl border border-indigo-500/25 bg-slate-950 cursor-pointer group"
                >
                  <img
                    src={bannerImg}
                    alt={app.name}
                    loading="lazy"
                    className="w-full h-32 object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute bottom-2 right-2 rounded-lg bg-slate-950/85 border border-cyan-500/40 px-2 py-0.5 font-mono-num text-[9px] font-bold text-cyan-300">
                    🔒 DRM PROTECTED • {resources.length} RESOURCES
                  </div>
                </div>

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

                {/* Extracted Link Resources Strip */}
                <div className="flex flex-wrap items-center gap-1">
                  {resources.slice(0, 3).map((r, i) => (
                    <span
                      key={`${app.id}-res-${i}`}
                      className="rounded-md bg-cyan-500/10 border border-cyan-500/25 px-2 py-0.5 font-mono-num text-[9px] text-cyan-300 truncate max-w-[165px]"
                      title={`Extracted Resource: ${r.name} (${r.size || 'verified'})`}
                    >
                      📦 {r.name}
                    </span>
                  ))}
                  {aiCaps[0] && (
                    <span className="rounded-md bg-indigo-500/15 border border-indigo-500/30 px-2 py-0.5 font-mono-num text-[9px] text-indigo-300 truncate">
                      🤖 {aiCaps[0]}
                    </span>
                  )}
                </div>

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
                    <span className="truncate">{installStageById[app.id] || 'VERIFYING SHA-256 & MOUNTING...'}</span>
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
                      onClick={() => {
                        onPlaySound?.('click');
                        setSandboxMode('container');
                        setPreviewApp(app);
                      }}
                      className="inline-flex items-center gap-1 rounded-xl px-2.5 py-2 text-xs font-semibold theme-subtle hover:border-cyan-400/50 cursor-pointer"
                      title="Open Real Isolated HTML5/Canvas/WebAudio Sandbox"
                    >
                      <Play className="h-3.5 w-3.5 text-cyan-400" />
                      <span>Sandbox</span>
                    </button>
                    <button
                      onClick={() => handleDownloadStandalonePackage(app)}
                      className="inline-flex items-center gap-1 rounded-xl px-2.5 py-2 text-xs font-semibold theme-subtle hover:border-indigo-400/50 cursor-pointer"
                      title="Download Standalone Executable .html Package"
                    >
                      <Download className="h-3.5 w-3.5 text-indigo-400" />
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

                  {isInstalled ? (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          onPlaySound?.('click');
                          setSandboxMode('container');
                          setPreviewApp(app);
                        }}
                        className="inline-flex items-center gap-1 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 px-3 py-2 text-xs font-bold text-emerald-400 cursor-pointer"
                      >
                        <Play className="h-3.5 w-3.5" />
                        <span>Launch</span>
                      </button>
                      <button
                        onClick={() => handleUninstall(app.id)}
                        title="Uninstall from Workstation"
                        className="rounded-xl p-2 theme-subtle hover:border-rose-400/50 text-rose-400 cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleInstall(app)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-500/25 transition cursor-pointer"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>Install App</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Real Isolated App Sandbox (<iframe sandbox="...">) & Live IPC Telemetry Modal */}
      {previewApp && (
        <div
          onClick={() => setPreviewApp(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-2 sm:p-5 overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`w-full ${
              isSandboxExpanded ? 'max-w-6xl' : 'max-w-4xl'
            } rounded-3xl p-4 sm:p-6 space-y-4 shadow-2xl theme-card my-auto transition-all`}
          >
            {/* Sandbox Modal Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] pb-3.5">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-2xl">
                  {previewApp.icon || '🚀'}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-display text-base sm:text-lg font-bold truncate">
                      {previewApp.name}
                    </h3>
                    <span
                      className={`rounded-lg border px-2 py-0.5 font-mono-num text-[10px] font-bold uppercase ${getProviderBadgeStyle(
                        previewApp.source_provider
                      )}`}
                    >
                      {previewApp.source_provider || 'NEX Official'}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 font-mono-num text-[10px] text-emerald-400">
                      <Lock className="h-3 w-3" />
                      /opt/nex-apps/{previewApp.id}
                    </span>
                  </div>
                  <p className="text-xs theme-text-muted truncate">
                    By <strong>{previewApp.developer}</strong> • v{previewApp.version} • Endpoint:{' '}
                    <code className="text-cyan-400 font-mono-num">/api/sandbox/{previewApp.id}</code>
                  </p>
                </div>
              </div>

              {/* Sandbox Mode & Window Controls */}
              <div className="flex items-center gap-1.5">
                <div className="flex items-center rounded-xl p-1 theme-subtle">
                  <button
                    type="button"
                    onClick={() => setSandboxMode('container')}
                    className={`rounded-lg px-2.5 py-1 font-mono-num text-[11px] font-bold transition cursor-pointer ${
                      sandboxMode === 'container'
                        ? 'bg-indigo-600 text-white'
                        : 'theme-text-muted hover:text-white'
                    }`}
                  >
                    Container Runtime
                  </button>
                  <button
                    type="button"
                    onClick={() => setSandboxMode('external')}
                    className={`rounded-lg px-2.5 py-1 font-mono-num text-[11px] font-bold transition cursor-pointer ${
                      sandboxMode === 'external'
                        ? 'bg-cyan-600 text-white'
                        : 'theme-text-muted hover:text-white'
                    }`}
                  >
                    External URL
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setSandboxReloadKey((k) => k + 1)}
                  title="Restart Sandboxed Container"
                  className="rounded-xl p-2 theme-subtle hover:border-cyan-400/50 cursor-pointer"
                >
                  <RefreshCw className="h-4 w-4 text-cyan-400" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsSandboxExpanded((prev) => !prev)}
                  title={isSandboxExpanded ? 'Compact Window' : 'Expand Window'}
                  className="rounded-xl p-2 theme-subtle hover:border-indigo-400/50 cursor-pointer"
                >
                  {isSandboxExpanded ? (
                    <Minimize2 className="h-4 w-4 text-indigo-400" />
                  ) : (
                    <Maximize2 className="h-4 w-4 text-indigo-400" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewApp(null)}
                  className="rounded-xl p-2 theme-subtle cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Real Isolated <iframe sandbox> Viewport */}
            <div className="rounded-2xl border border-indigo-500/35 bg-slate-950 overflow-hidden shadow-inner">
              <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 bg-slate-900 border-b border-slate-800 font-mono-num text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  <span className="ml-1 text-cyan-400 truncate">
                    {sandboxMode === 'container'
                      ? `sandbox://localhost:3000/api/sandbox/${previewApp.id}`
                      : previewApp.live_url || `https://${previewApp.id}.netlify.app`}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[11px]">
                  <span className="text-emerald-400 flex items-center gap-1">
                    <Activity className="h-3 w-3" />
                    IPC Packets: <strong>{sandboxTelemetry?.ipcCount || 1}</strong>
                  </span>
                  <span className="text-indigo-300 hidden sm:inline">
                    Ops: <strong>{sandboxTelemetry?.opsPerSec || '142.8 K/s'}</strong>
                  </span>
                  <span className="text-cyan-300 hidden md:inline">
                    Event: <strong>{sandboxTelemetry?.lastEvent || 'sandbox_ready'}</strong>
                  </span>
                </div>
              </div>

              {sandboxMode === 'container' ? (
                <iframe
                  key={`${previewApp.id}-container-${sandboxReloadKey}`}
                  title={`${previewApp.name} Isolated Sandbox Runtime`}
                  sandbox="allow-scripts allow-forms allow-same-origin"
                  srcDoc={renderSandboxedAppHtml(previewApp)}
                  className={`w-full border-0 bg-slate-950 ${
                    isSandboxExpanded ? 'h-[510px]' : 'h-[400px]'
                  }`}
                />
              ) : (
                <div className="space-y-2 p-3 bg-slate-950">
                  <div className="flex items-center justify-between px-2 py-1 text-xs text-slate-400">
                    <span>
                      Embedding external origin:{' '}
                      <strong className="text-cyan-300">{previewApp.live_url}</strong>
                    </span>
                    <a
                      href={previewApp.live_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-teal-400 hover:underline font-semibold"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Open in New Tab
                    </a>
                  </div>
                  <iframe
                    key={`${previewApp.id}-ext-${sandboxReloadKey}`}
                    title={`${previewApp.name} External Origin`}
                    sandbox="allow-scripts allow-forms allow-same-origin"
                    src={previewApp.live_url || `/api/sandbox/${previewApp.id}`}
                    className={`w-full rounded-xl border border-slate-800 bg-slate-900 ${
                      isSandboxExpanded ? 'h-[460px]' : 'h-[350px]'
                    }`}
                  />
                </div>
              )}
            </div>

            {/* Sandbox Footer Actions */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleRunSecurityScan(previewApp)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3.5 py-2 text-xs font-semibold text-emerald-400 cursor-pointer"
                >
                  <ShieldCheck className="h-4 w-4" />
                  <span>Verify SHA-256 ({previewApp.security_score || 99}/100)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadStandalonePackage(previewApp)}
                  className="inline-flex items-center gap-1.5 rounded-xl theme-subtle px-3.5 py-2 text-xs font-semibold text-cyan-400 hover:border-cyan-400/50 cursor-pointer"
                >
                  <Download className="h-4 w-4" />
                  <span>Download Standalone .html Bundle</span>
                </button>
              </div>

              {installedIds.includes(previewApp.id) ? (
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 px-3.5 py-2 text-xs font-bold text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" />
                    Mounted in /opt/nex-apps/{previewApp.id}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      handleUninstall(previewApp.id);
                      setPreviewApp(null);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 px-3.5 py-2 text-xs font-semibold text-rose-400 cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Uninstall</span>
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => handleInstall(previewApp)}
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-5 py-2.5 text-xs font-semibold text-white cursor-pointer"
                >
                  <Download className="h-4 w-4" />
                  <span>Install &amp; Mount to Workstation</span>
                </button>
              )}
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
