import React, { useState, useMemo } from 'react';
import {
  Download,
  Upload,
  Star,
  CheckCircle2,
  Code2,
  Terminal,
  Sparkles,
  Plus,
  Search
} from 'lucide-react';

export default function AppStoreView({ apps = [], darkMode, onDownloadApp, onCreateApp }) {
  const [selectedLang, setSelectedLang] = useState('all');
  const [selectedCat, setSelectedCat] = useState('all');
  const [query, setQuery] = useState('');
  const [installingIds, setInstallingIds] = useState({});
  const [installedIds, setInstalledIds] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Upload Form
  const [appName, setAppName] = useState('');
  const [appDesc, setAppDesc] = useState('');
  const [appVersion, setAppVersion] = useState('1.0.0');
  const [appCategory, setAppCategory] = useState('cli');
  const [appLanguage, setAppLanguage] = useState('rust');
  const [appDeveloper, setAppDeveloper] = useState('NEX Labs');
  const [appIcon, setAppIcon] = useState('🚀');

  const languages = ['all', 'python', 'typescript', 'rust', 'go', 'javascript', 'cpp'];
  const categories = ['all', 'desktop', 'cli', 'api', 'web', 'utility', 'library'];

  const filteredApps = useMemo(() => {
    return apps.filter((a) => {
      if (selectedLang !== 'all' && a.language !== selectedLang) return false;
      if (selectedCat !== 'all' && a.category !== selectedCat) return false;
      if (query.trim()) {
        const q = query.toLowerCase().trim();
        return (
          a.name.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          a.developer.toLowerCase().includes(q) ||
          a.language.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [apps, selectedLang, selectedCat, query]);

  const handleInstall = async (app) => {
    if (installingIds[app.id]) return;
    setInstallingIds((prev) => ({ ...prev, [app.id]: 15 }));
    setTimeout(() => setInstallingIds((prev) => ({ ...prev, [app.id]: 65 })), 220);
    setTimeout(async () => {
      await onDownloadApp(app.id);
      setInstallingIds((prev) => {
        const copy = { ...prev };
        delete copy[app.id];
        return copy;
      });
      setInstalledIds((prev) => (prev.includes(app.id) ? prev : [...prev, app.id]));
    }, 520);
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!appName.trim()) return;
    await onCreateApp({
      name: appName.trim(),
      description: appDesc.trim() || 'Enterprise software package',
      version: appVersion.trim(),
      category: appCategory,
      language: appLanguage,
      developer: appDeveloper.trim(),
      icon: appIcon
    });
    setAppName('');
    setAppDesc('');
    setShowUploadModal(false);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 space-y-6">
      {/* Header Banner */}
      <div
        className={`flex flex-wrap items-center justify-between gap-4 rounded-3xl p-6 md:p-8 ${
          darkMode ? 'surface-card-dark' : 'surface-card-light'
        }`}
      >
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 rounded-full bg-cyan-500/15 border border-cyan-500/30 px-3 py-0.5 font-mono-num text-xs font-bold text-cyan-400">
            <Terminal className="h-3.5 w-3.5" />
            <span>ENTERPRISE SOFTWARE & DEVELOPER ECOSYSTEM</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold">
            NEX Enterprise App Store ({apps.length} Packages)
          </h1>
          <p className={`text-xs sm:text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            Verified developer tools, IDEs, CLI multiplexers, and data pipelines backed by our real-time SQLite `apps` table.
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 px-5 py-3 text-xs font-semibold text-white shadow-lg shadow-indigo-600/25 transition cursor-pointer"
        >
          <Upload className="h-4 w-4" />
          <span>Publish App to SQLite</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div
        className={`rounded-3xl p-4 space-y-3 ${
          darkMode ? 'surface-card-dark' : 'surface-card-light'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <span className="font-mono-num text-[11px] font-bold uppercase text-indigo-400 mr-1">
              Category:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCat(cat)}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold uppercase transition cursor-pointer ${
                  selectedCat === cat
                    ? 'bg-indigo-600 text-white'
                    : darkMode
                    ? 'bg-slate-950/80 text-slate-300 border border-white/[0.07]'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search apps, language, dev..."
              className={`w-full rounded-xl border pl-9 pr-3 py-1.5 text-xs ${
                darkMode
                  ? 'bg-slate-950 border-white/[0.08] text-white'
                  : 'bg-slate-100 border-slate-300 text-slate-900'
              }`}
            />
          </div>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-white/[0.06]">
          <Code2 className="h-3.5 w-3.5 text-cyan-400 shrink-0 mr-1" />
          <span className="font-mono-num text-[11px] font-bold uppercase text-cyan-400 mr-1">
            Language:
          </span>
          {languages.map((lang) => (
            <button
              key={lang}
              onClick={() => setSelectedLang(lang)}
              className={`rounded-lg px-2.5 py-1 font-mono-num text-[11px] font-semibold uppercase transition cursor-pointer ${
                selectedLang === lang
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      {/* Apps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredApps.map((app) => {
          const progress = installingIds[app.id];
          const isInstalled = installedIds.includes(app.id);
          return (
            <div
              key={app.id}
              className={`flex flex-col justify-between rounded-3xl p-5 space-y-4 transition-all duration-300 hover:-translate-y-1 ${
                darkMode ? 'surface-card-dark' : 'surface-card-light'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-2xl">
                      {app.icon || '📦'}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-display text-base font-bold">{app.name}</h3>
                        {Boolean(app.is_verified) && (
                          <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400" />
                        )}
                      </div>
                      <p className="text-xs text-slate-400">
                        {app.developer} • <span className="font-mono-num">v{app.version}</span>
                      </p>
                    </div>
                  </div>

                  <span className="rounded-lg bg-indigo-500/15 border border-indigo-500/30 px-2 py-0.5 font-mono-num text-[10px] font-bold uppercase text-indigo-400">
                    {app.language}
                  </span>
                </div>

                <p className={`text-xs leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  {app.description}
                </p>

                <div className="flex items-center justify-between font-mono-num text-[11px] text-slate-400 pt-1">
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
                    <span>INSTALLING PACKAGE...</span>
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
                <div className="flex items-center justify-between pt-3 border-t border-white/[0.07]">
                  <span className="font-mono-num text-xs font-bold text-emerald-400">
                    {app.price || 'Free'} • {app.license}
                  </span>
                  <button
                    onClick={() => handleInstall(app)}
                    className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition cursor-pointer ${
                      isInstalled
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-500/25'
                    }`}
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>{isInstalled ? 'Installed ✓ (Re-run)' : 'Install Package'}</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Upload App Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <form
            onSubmit={handleUploadSubmit}
            className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-6 space-y-4 text-slate-100 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-display text-lg font-bold">Publish App to SQLite `apps`</h3>
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="text-xs text-slate-400 hover:text-white cursor-pointer"
              >
                Close ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block font-mono-num text-[10px] uppercase text-slate-400 mb-1">
                  Application Name
                </label>
                <input
                  type="text"
                  required
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  placeholder="e.g. NeuralDeploy CLI"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-mono-num text-[10px] uppercase text-slate-400 mb-1">
                    Version
                  </label>
                  <input
                    type="text"
                    value={appVersion}
                    onChange={(e) => setAppVersion(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 font-mono-num text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block font-mono-num text-[10px] uppercase text-slate-400 mb-1">
                    Category
                  </label>
                  <select
                    value={appCategory}
                    onChange={(e) => setAppCategory(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-2.5 py-2 text-xs text-white"
                  >
                    {categories.filter((c) => c !== 'all').map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-mono-num text-[10px] uppercase text-slate-400 mb-1">
                    Language
                  </label>
                  <select
                    value={appLanguage}
                    onChange={(e) => setAppLanguage(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-2.5 py-2 text-xs text-white"
                  >
                    {languages.filter((l) => l !== 'all').map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block font-mono-num text-[10px] uppercase text-slate-400 mb-1">
                    Publisher / Developer
                  </label>
                  <input
                    type="text"
                    value={appDeveloper}
                    onChange={(e) => setAppDeveloper(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block font-mono-num text-[10px] uppercase text-slate-400 mb-1">
                    Icon Emoji
                  </label>
                  <input
                    type="text"
                    value={appIcon}
                    onChange={(e) => setAppIcon(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-center text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono-num text-[10px] uppercase text-slate-400 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  required
                  value={appDesc}
                  onChange={(e) => setAppDesc(e.target.value)}
                  placeholder="Describe the application capabilities..."
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 py-2.5 text-xs font-semibold text-white cursor-pointer"
            >
              Publish App & Broadcast via WebSockets
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
