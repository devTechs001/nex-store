import React from 'react';
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
  Palette
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
  onOpenHardwareBuilder
}) {
  const badges = navTelemetry?.badges || {};
  const totalTables = badges.database?.totalTables || dbStats?.totalTables || 18;

  const allWorkspaces = [
    { id: 'store', label: 'Hardware Store', sub: '12 Flagship SKUs & CAD', icon: Store, badge: `${badges.store?.products || 12} SKUs` },
    { id: 'apps', label: 'App Store (Netlify/Devs)', sub: 'Verified Multi-Source Apps', icon: Terminal, badge: `${badges.apps?.total || 10} Apps` },
    { id: 'subsystems', label: 'Subsystems & Security', sub: '6 Edge Nodes & WAF Shield', icon: Server, badge: `${badges.subsystems?.onlineNodes || 6} Online` },
    { id: 'tracker', label: 'Order Tracker', sub: 'Live Fulfillment Telemetry', icon: Truck, badge: `${badges.tracker?.activeOrders ?? 3} Active` },
    { id: 'admin', label: 'Admin Operations', sub: 'Inventory & Revenue Studio', icon: ShieldCheck, badge: 'Ops' },
    { id: 'database', label: 'SQLite Studio', sub: 'Live WAL Table Explorer', icon: Database, badge: `${totalTables} DB` },
    { id: 'docs', label: 'Docs & API Guide', sub: 'REST, WS & CLI Manual', icon: BookOpen, badge: 'v3.1' }
  ];

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
            onClick={() => handleSelectWorkspace('subsystems')}
            className={`flex flex-col items-center justify-center gap-0.5 rounded-xl py-1.5 text-[10px] font-bold transition cursor-pointer ${
              activeTab === 'subsystems'
                ? 'text-emerald-400 bg-emerald-500/15'
                : 'theme-text-muted hover:text-emerald-400'
            }`}
          >
            <Server className="h-4 w-4" />
            <span>Nodes</span>
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
            <span>Menu</span>
          </button>
        </div>
      </nav>

      {/* Full-Featured Slide-Up / Slide-Over Mobile Command & Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end bg-black/75 backdrop-blur-md animate-fadeIn select-none">
          <div
            className="fixed inset-0"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative z-10 max-h-[86dvh] w-full rounded-t-3xl border-t border-indigo-500/30 theme-card p-5 overflow-y-auto space-y-5 shadow-2xl">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3.5">
              <div>
                <div className="font-mono-num text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                  NEXUS OS v3.1 // MOBILE COMMAND HUB
                </div>
                <h3 className="text-base font-bold">Workspaces, Studios &amp; Settings</h3>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-xl p-2 theme-subtle cursor-pointer"
                aria-label="Close mobile menu"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* All 7 Workspaces Grid */}
            <div className="space-y-2">
              <div className="font-mono-num text-[10px] font-bold uppercase tracking-wider theme-text-muted">
                All Workspaces (7)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {allWorkspaces.map((ws) => {
                  const Icon = ws.icon;
                  const active = activeTab === ws.id;
                  return (
                    <button
                      key={ws.id}
                      type="button"
                      onClick={() => handleSelectWorkspace(ws.id)}
                      className={`flex items-center justify-between rounded-2xl p-3 text-left transition cursor-pointer ${
                        active
                          ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-lg'
                          : 'theme-subtle hover:border-indigo-500/40'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
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
                        className={`ml-2 rounded-full px-2 py-0.5 font-mono-num text-[10px] font-bold ${
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

            {/* Quick Engineering Studios Row */}
            <div className="space-y-2">
              <div className="font-mono-num text-[10px] font-bold uppercase tracking-wider theme-text-muted">
                Engineering Studios &amp; Drawers
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenTerminal();
                  }}
                  className="flex items-center gap-2 rounded-xl p-2.5 text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 cursor-pointer"
                >
                  <Terminal className="h-4 w-4" />
                  <span>&gt;_ NEX-SH CLI</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenHardwareBuilder();
                  }}
                  className="flex items-center gap-2 rounded-xl p-2.5 text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 cursor-pointer"
                >
                  <Sliders className="h-4 w-4" />
                  <span>5-Slot Rig BTO</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenCommandPalette();
                  }}
                  className="flex items-center gap-2 rounded-xl p-2.5 text-xs font-bold theme-subtle cursor-pointer"
                >
                  <Command className="h-4 w-4 text-indigo-400" />
                  <span>Search (⌘K)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenCart('wishlist');
                  }}
                  className="flex items-center gap-2 rounded-xl p-2.5 text-xs font-bold theme-subtle cursor-pointer"
                >
                  <Heart className="h-4 w-4 text-rose-400" />
                  <span>Wishlist ({wishlistCount})</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenCompare();
                  }}
                  className="flex items-center gap-2 rounded-xl p-2.5 text-xs font-bold theme-subtle cursor-pointer"
                >
                  <Layers className="h-4 w-4 text-purple-400" />
                  <span>Compare ({compareCount})</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenNotifications();
                  }}
                  className="flex items-center gap-2 rounded-xl p-2.5 text-xs font-bold theme-subtle cursor-pointer"
                >
                  <Bell className="h-4 w-4 text-amber-400" />
                  <span>Alerts ({unreadNotificationsCount})</span>
                </button>
              </div>
            </div>

            {/* Theme, Currency & Sound Quick Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-white/[0.08]">
              <div>
                <label className="block font-mono-num text-[10px] uppercase theme-text-muted mb-1">
                  Active Theme (6)
                </label>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {Object.values(THEMES).map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setThemeId(t.id)}
                      className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-semibold border cursor-pointer ${
                        themeId === t.id
                          ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300'
                          : 'theme-subtle'
                      }`}
                    >
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: t.swatch || t.accent || '#6366f1' }}
                      />
                      <span>{t.name.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-start gap-2">
                <div className="flex-1">
                  <label className="block font-mono-num text-[10px] uppercase theme-text-muted mb-1">
                    Currency
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full rounded-xl px-3 py-1.5 text-xs font-mono-num font-semibold theme-input"
                  >
                    {Object.keys(CURRENCIES).map((code) => (
                      <option key={code} value={code}>
                        {code} ({CURRENCIES[code].symbol})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-mono-num text-[10px] uppercase theme-text-muted mb-1">
                    WebAudio
                  </label>
                  <button
                    type="button"
                    onClick={onToggleSound}
                    className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold border cursor-pointer ${
                      soundEnabled
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        : 'theme-subtle'
                    }`}
                  >
                    {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                    <span>{soundEnabled ? 'On' : 'Muted'}</span>
                  </button>
                </div>
              </div>

              {/* Live Health Endpoint Status */}
              <div className="rounded-xl p-2.5 theme-subtle flex items-center justify-between">
                <div className="font-mono-num text-[11px]">
                  <div className="flex items-center gap-1 text-emerald-400 font-bold">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>/api/health: OK</span>
                  </div>
                  <div className="text-[10px] theme-text-muted">
                    {totalTables} SQLite Tables • {healthStatus?.memory?.rssMB || 75} MB RAM
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onRefreshHealth}
                  className="rounded-lg px-2.5 py-1 text-xs font-mono-num theme-card cursor-pointer"
                >
                  <RefreshCw className={`h-3.5 w-3.5 text-cyan-400 ${isPingingHealth ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
