import React, { useEffect } from 'react';
import {
  Store,
  Terminal,
  Server,
  Truck,
  ShieldCheck,
  Database,
  BookOpen,
  ShoppingBag,
  Sliders,
  Menu,
  X,
  Command,
  Heart,
  Layers,
  Bell,
  Volume2,
  VolumeX,
  RefreshCw,
  CheckCircle2,
  Smartphone,
  Download,
  Sparkles
} from 'lucide-react';
import { CURRENCIES } from '../utils/currency.js';
import { THEMES } from '../utils/themes.js';

export default function MobileBottomNav({
  activeTab,
  setActiveTab,
  mobileMenuOpen,
  setMobileMenuOpen,
  darkMode,
  themeId,
  setThemeId,
  currency,
  setCurrency,
  soundEnabled,
  onToggleSound,
  cartCount = 0,
  wishlistCount = 0,
  compareCount = 0,
  unreadNotificationsCount = 0,
  dbStats,
  navTelemetry,
  healthStatus,
  onRefreshHealth,
  isPingingHealth = false,
  onOpenCart,
  onOpenCompare,
  onOpenCommandPalette,
  onOpenNotifications,
  onOpenTerminal,
  onOpenHardwareBuilder,
  onTriggerPwaInstall
}) {
  const badges = navTelemetry?.badges || {};
  const totalTables = badges.database?.totalTables || dbStats?.totalTables || 23;

  const allWorkspaces = [
    { id: 'store', label: 'Hardware Store', sub: '12 Flagship SKUs & CAD', icon: Store, badge: `${badges.store?.products || 12} SKUs` },
    { id: 'apps', label: 'App Store (Devs)', sub: 'Publish Apps & Systems', icon: Terminal, badge: `${badges.apps?.total || 10} Apps` },
    { id: 'mobile-subs', label: 'Mobile SDK, PWA & Plans', sub: 'Flutter, Native & Tiers', icon: Smartphone, badge: 'SDK + PWA' },
    { id: 'subsystems', label: 'Subsystems & Security', sub: '6 Edge Nodes & WAF Shield', icon: Server, badge: `${badges.subsystems?.onlineNodes || 6} Online` },
    { id: 'tracker', label: 'Order Tracker', sub: 'Live Fulfillment Telemetry', icon: Truck, badge: `${badges.tracker?.activeOrders ?? 3} Active` },
    { id: 'admin', label: 'Admin Operations', sub: 'Inventory & Revenue Studio', icon: ShieldCheck, badge: 'Ops' },
    { id: 'database', label: 'SQLite Studio', sub: 'Live WAL Table Explorer', icon: Database, badge: `${totalTables} DB` },
    { id: 'docs', label: 'Docs & API Guide', sub: 'REST, WS & CLI Manual', icon: BookOpen, badge: 'v3.2' }
  ];

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mobileMenuOpen, setMobileMenuOpen]);

  const handleSelectWorkspace = (id) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Fixed Bottom Navigation Dock for Mobile & Tablet (< lg) */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="nex-mobile-bottomnav lg:hidden fixed bottom-0 inset-x-0 z-40 select-none"
      >
        <div className="mx-auto grid max-w-lg grid-cols-6 items-center px-1.5 py-1.5">
          <button
            type="button"
            onClick={() => handleSelectWorkspace('store')}
            className={`flex flex-col items-center justify-center gap-0.5 rounded-xl py-1.5 text-[10px] font-bold transition cursor-pointer ${
              activeTab === 'store'
                ? 'text-indigo-400 bg-indigo-500/15'
                : 'theme-text-muted hover:text-indigo-400'
            }`}
          >
            <Store className="h-4 w-4" />
            <span>Store</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectWorkspace('apps')}
            className={`flex flex-col items-center justify-center gap-0.5 rounded-xl py-1.5 text-[10px] font-bold transition cursor-pointer ${
              activeTab === 'apps'
                ? 'text-cyan-400 bg-cyan-500/15'
                : 'theme-text-muted hover:text-cyan-400'
            }`}
          >
            <Terminal className="h-4 w-4" />
            <span>Apps</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectWorkspace('mobile-subs')}
            className={`flex flex-col items-center justify-center gap-0.5 rounded-xl py-1.5 text-[10px] font-bold transition cursor-pointer ${
              activeTab === 'mobile-subs'
                ? 'text-teal-400 bg-teal-500/15'
                : 'theme-text-muted hover:text-teal-400'
            }`}
          >
            <Smartphone className="h-4 w-4" />
            <span>Mobile/Plans</span>
          </button>

          <button
            type="button"
            onClick={onOpenHardwareBuilder}
            className="flex flex-col items-center justify-center gap-0.5 rounded-xl py-1.5 text-[10px] font-bold text-amber-400 hover:bg-amber-500/15 transition cursor-pointer"
          >
            <Sliders className="h-4 w-4" />
            <span>Rig BTO</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenCart('cart')}
            className="relative flex flex-col items-center justify-center gap-0.5 rounded-xl py-1.5 text-[10px] font-bold text-cyan-400 hover:bg-cyan-500/15 transition cursor-pointer"
          >
            <div className="relative">
              <ShoppingBag className="h-4 w-4" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-2.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-indigo-600 px-1 font-mono-num text-[9px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </div>
            <span>Cart</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className={`relative flex flex-col items-center justify-center gap-0.5 rounded-xl py-1.5 text-[10px] font-bold transition cursor-pointer ${
              mobileMenuOpen
                ? 'text-indigo-400 bg-indigo-500/15'
                : 'theme-text-muted hover:text-indigo-400'
            }`}
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            <span>Drawer</span>
          </button>
        </div>
      </nav>

      {/* Smooth 60fps GPU-Accelerated Left Slide-Over Mobile Sidebar Drawer */}
      <div
        aria-hidden={!mobileMenuOpen}
        className={`nex-mobile-drawer-backdrop fixed inset-0 z-50 lg:hidden select-none ${
          mobileMenuOpen
            ? 'opacity-100 visible pointer-events-auto'
            : 'opacity-0 invisible pointer-events-none'
        }`}
      >
        {/* Backdrop */}
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm"
        />

        {/* Slide-Over Left Sidebar Panel */}
        <aside
          aria-label="Mobile Sidebar Navigation Drawer"
          className={`nex-mobile-drawer-panel relative z-10 flex h-full w-80 max-w-[86vw] flex-col justify-between overflow-y-auto p-4 shadow-2xl ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="space-y-4">
            {/* Drawer Brand Header */}
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-2.5">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-xl text-white shadow-sm"
                  style={{
                    background: `linear-gradient(135deg, var(--accent), var(--accent-secondary))`
                  }}
                >
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-display text-sm font-bold tracking-tight">
                    NEX STORE // DRAWER
                  </div>
                  <div className="font-mono-num text-[10px] text-emerald-400">
                    PWA • Flutter SDK • {totalTables} SQLite DBs
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-xl p-1.5 theme-subtle hover:border-indigo-400/50 cursor-pointer"
                aria-label="Close mobile sidebar drawer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* All 8 Workspaces List */}
            <div className="space-y-1.5">
              <div className="px-1 font-mono-num text-[10px] font-bold uppercase tracking-wider theme-text-muted">
                Workspaces (8)
              </div>
              <div className="space-y-1">
                {allWorkspaces.map((ws) => {
                  const Icon = ws.icon;
                  const active = activeTab === ws.id;
                  return (
                    <button
                      key={ws.id}
                      type="button"
                      onClick={() => handleSelectWorkspace(ws.id)}
                      className={`w-full flex items-center justify-between rounded-2xl px-3 py-2.5 text-left transition cursor-pointer ${
                        active
                          ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-md'
                          : 'theme-subtle hover:border-indigo-500/40'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon className="h-4 w-4 shrink-0" />
                        <div className="min-w-0">
                          <div className="text-xs font-bold truncate">{ws.label}</div>
                          <div
                            className={`text-[10px] truncate ${
                              active ? 'text-indigo-100' : 'theme-text-muted'
                            }`}
                          >
                            {ws.sub}
                          </div>
                        </div>
                      </div>
                      <span
                        className={`ml-2 rounded-full px-2 py-0.5 font-mono-num text-[9px] font-bold shrink-0 ${
                          active ? 'bg-white/20 text-white' : 'theme-card'
                        }`}
                      >
                        {ws.badge}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Engineering Studios & PWA Action Grid */}
            <div className="space-y-1.5">
              <div className="px-1 font-mono-num text-[10px] font-bold uppercase tracking-wider theme-text-muted">
                Studios, PWA &amp; Drawers
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenTerminal();
                  }}
                  className="flex items-center gap-1.5 rounded-xl p-2 text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 cursor-pointer"
                >
                  <Terminal className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">NEX-SH CLI</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenHardwareBuilder();
                  }}
                  className="flex items-center gap-1.5 rounded-xl p-2 text-[11px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 cursor-pointer"
                >
                  <Sliders className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">5-Slot BTO</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (onTriggerPwaInstall) {
                      onTriggerPwaInstall();
                    } else {
                      handleSelectWorkspace('mobile-subs');
                    }
                  }}
                  className="flex items-center gap-1.5 rounded-xl p-2 text-[11px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">Install PWA</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenCommandPalette();
                  }}
                  className="flex items-center gap-1.5 rounded-xl p-2 text-[11px] font-bold theme-subtle cursor-pointer"
                >
                  <Command className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                  <span className="truncate">Search (⌘K)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenCart('wishlist');
                  }}
                  className="flex items-center gap-1.5 rounded-xl p-2 text-[11px] font-bold theme-subtle cursor-pointer"
                >
                  <Heart className="h-3.5 w-3.5 text-rose-400 shrink-0" />
                  <span className="truncate">Wishlist ({wishlistCount})</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenNotifications();
                  }}
                  className="flex items-center gap-1.5 rounded-xl p-2 text-[11px] font-bold theme-subtle cursor-pointer"
                >
                  <Bell className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                  <span className="truncate">Alerts ({unreadNotificationsCount})</span>
                </button>
              </div>
            </div>

            {/* Theme Palette & Currency Controls */}
            <div className="space-y-2.5 pt-2 border-t border-white/[0.08]">
              <div>
                <label className="block font-mono-num text-[10px] uppercase theme-text-muted mb-1">
                  Theme Palette (6)
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {Object.values(THEMES).map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setThemeId(t.id)}
                      className={`inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[10px] font-semibold border cursor-pointer truncate ${
                        themeId === t.id
                          ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300'
                          : 'theme-subtle'
                      }`}
                    >
                      <span
                        className="h-2 w-2 rounded-full shrink-0"
                        style={{ backgroundColor: t.swatch?.[0] || '#6366f1' }}
                      />
                      <span className="truncate">{t.name.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="flex-1 rounded-xl px-2.5 py-1.5 text-xs font-mono-num font-semibold theme-input"
                >
                  {Object.keys(CURRENCIES).map((code) => (
                    <option key={code} value={code}>
                      {code} ({CURRENCIES[code].symbol})
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={onToggleSound}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold border cursor-pointer ${
                    soundEnabled
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                      : 'theme-subtle'
                  }`}
                >
                  {soundEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
                  <span>{soundEnabled ? 'Audio' : 'Muted'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Drawer Footer: Live Health & Copyright DRM */}
          <div className="mt-4 pt-3 border-t border-white/[0.08] space-y-2">
            <div className="rounded-xl p-2.5 theme-subtle flex items-center justify-between">
              <div className="font-mono-num text-[10px]">
                <div className="flex items-center gap-1 text-emerald-400 font-bold">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>/api/health: OK</span>
                </div>
                <div className="text-[9px] theme-text-muted">
                  {totalTables} SQLite Tables • {healthStatus?.memory?.rssMB || 75} MB RAM
                </div>
              </div>
              <button
                type="button"
                onClick={onRefreshHealth}
                className="rounded-lg p-1.5 theme-card cursor-pointer"
              >
                <RefreshCw className={`h-3.5 w-3.5 text-cyan-400 ${isPingingHealth ? 'animate-spin' : ''}`} />
              </button>
            </div>
            <div className="font-mono-num text-[9px] text-amber-300/90 text-center">
              🔒 © 2026 NEX STORE PROPRIETARY • DO NOT PIRATE
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
