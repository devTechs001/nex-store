import React, { useState } from 'react';
import {
  ShoppingBag,
  Search,
  Activity,
  Database,
  ShieldCheck,
  Truck,
  Sparkles,
  Palette,
  Heart,
  Layers,
  Store,
  Radio,
  Zap,
  Command,
  Terminal,
  Check
} from 'lucide-react';
import { CURRENCIES, formatRelativeTime } from '../utils/currency.js';
import { THEMES } from '../utils/themes.js';

export default function Navbar({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  searchInputRef,
  currency,
  setCurrency,
  themeId,
  setThemeId,
  darkMode,
  cartCount,
  wishlistCount,
  compareCount,
  onOpenCart,
  onOpenCompare,
  onOpenCommandPalette,
  wsConnected,
  presence,
  latestActivity,
  onSimulateRealtime,
  dbStats
}) {
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);

  const navItems = [
    { id: 'store', label: 'Hardware Store', icon: Store },
    { id: 'apps', label: 'App Store', icon: Terminal },
    { id: 'tracker', label: 'Order Tracker', icon: Truck },
    { id: 'admin', label: 'Admin Ops', icon: ShieldCheck },
    {
      id: 'database',
      label: 'SQLite Studio',
      icon: Database,
      badge: dbStats?.totalTables ? `${dbStats.totalTables} DB` : 'SQLite'
    }
  ];

  const activeTheme = THEMES[themeId] || THEMES.obsidian;

  return (
    <header className="theme-header sticky top-0 z-40 border-b backdrop-blur-2xl transition-colors duration-200">
      {/* Top Real-Time Telemetry & Activity Ticker Bar */}
      <div
        className={`border-b px-4 py-1.5 text-xs transition-colors ${
          darkMode
            ? 'bg-slate-950/75 border-white/[0.07] text-slate-300'
            : 'bg-slate-200/75 border-slate-300/80 text-slate-700'
        }`}
      >
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3 overflow-hidden">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-0.5 font-mono-num text-[10px] font-bold tracking-wider text-emerald-400 border border-emerald-500/30">
              <span
                className={`h-2 w-2 rounded-full ${
                  wsConnected ? 'bg-emerald-400 animate-pulse-glow' : 'bg-cyan-400'
                }`}
              />
              {wsConnected ? 'WS / SQLITE SYNCED' : 'LIVE STORE ACTIVE'}
            </span>

            <span className="hidden sm:inline-flex items-center gap-1.5 font-mono-num text-[11px]">
              <Radio className="h-3 w-3 text-indigo-400" />
              <strong>{presence?.activeShoppers || 24}</strong> live engineers online
            </span>

            {latestActivity && (
              <div className="flex items-center gap-2 truncate">
                <span className="opacity-40">•</span>
                <Activity className="h-3.5 w-3.5 shrink-0 text-cyan-400" />
                <span className="truncate font-bold">{latestActivity.title}:</span>
                <span className="truncate opacity-85 max-w-xs md:max-w-md">
                  {latestActivity.message}
                </span>
                <span className="hidden lg:inline font-mono-num text-[10px] opacity-65">
                  ({formatRelativeTime(latestActivity.created_at)})
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onSimulateRealtime}
              className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/35 px-3 py-0.5 text-[11px] font-semibold text-indigo-400 transition cursor-pointer"
              title="Broadcast a live simulated shopper event"
            >
              <Zap className="h-3 w-3 text-amber-400" />
              <span>Pulse Live Event</span>
            </button>
            <span className="hidden md:inline font-mono-num text-[11px]">
              VIP Code: <strong className="text-cyan-400">NEX20</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Main Header Navigation Row */}
      <div className="mx-auto max-w-7xl px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Brand Logo + Workspace Switcher */}
          <div className="flex items-center gap-5">
            <button
              onClick={() => setActiveTab('store')}
              className="group flex items-center gap-3 text-left cursor-pointer"
            >
              <div
                className="relative flex h-10 w-10 items-center justify-center rounded-2xl text-white shadow-lg ring-1 ring-white/25 transition duration-300 group-hover:scale-105"
                style={{
                  background: `linear-gradient(135deg, var(--accent), var(--accent-secondary))`
                }}
              >
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-display text-lg font-bold tracking-tight">NEX STORE</span>
                  <span className="rounded-md bg-indigo-500/15 px-1.5 py-0.5 font-mono-num text-[10px] font-bold text-indigo-400 border border-indigo-500/30">
                    GEN-5
                  </span>
                </div>
                <p className="text-[11px] font-medium opacity-70">
                  Flagship Hardware & App Ecosystem
                </p>
              </div>
            </button>

            {/* Primary Navigation Tabs */}
            <nav className="theme-subtle hidden xl:flex items-center gap-1 rounded-2xl p-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    style={
                      isActive
                        ? {
                            background: `linear-gradient(135deg, var(--accent), var(--accent-secondary))`,
                            color: '#ffffff'
                          }
                        : undefined
                    }
                    className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                      isActive ? 'shadow-md' : 'opacity-80 hover:opacity-100'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span
                        className={`rounded-md px-1.5 py-0.2 font-mono-num text-[10px] font-bold ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Search + Theme Switcher + Action Controls */}
          <div className="flex flex-1 items-center justify-end gap-2 max-w-xl">
            <div className="relative flex-1 max-w-xs">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 opacity-50" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (activeTab !== 'store') setActiveTab('store');
                }}
                placeholder="Filter catalog or press ⌘K..."
                className="theme-input w-full rounded-xl pl-9 pr-14 py-2 text-xs transition"
              />
              {searchQuery ? (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] font-medium text-indigo-400 cursor-pointer"
                >
                  Clear
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onOpenCommandPalette}
                  title="Open Command Palette (⌘K)"
                  className="theme-subtle absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 font-mono-num text-[10px] font-semibold hover:border-indigo-500 cursor-pointer"
                >
                  <Command className="h-2.5 w-2.5" />
                  <span>K</span>
                </button>
              )}
            </div>

            {/* Currency Selector */}
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              aria-label="Select currency"
              className="theme-input rounded-xl px-2.5 py-2 font-mono-num text-xs font-semibold cursor-pointer"
            >
              {Object.values(CURRENCIES).map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} ({c.symbol.trim()})
                </option>
              ))}
            </select>

            {/* 6-Theme Palette Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setThemeMenuOpen((o) => !o)}
                className="theme-input flex h-9 items-center gap-1.5 rounded-xl px-2.5 text-xs font-semibold transition cursor-pointer"
                title="Switch UI Theme Palette"
              >
                <Palette className="h-4 w-4 text-indigo-400" />
                <span className="hidden md:inline">{activeTheme.name.split(' ')[0]}</span>
                <span
                  className="h-3 w-3 rounded-full border border-white/30"
                  style={{ backgroundColor: activeTheme.swatch[0] }}
                />
              </button>

              {themeMenuOpen && (
                <>
                  <div
                    onClick={() => setThemeMenuOpen(false)}
                    className="fixed inset-0 z-40"
                  />
                  <div className="theme-card absolute right-0 mt-2 z-50 w-56 rounded-2xl p-2 shadow-2xl space-y-1">
                    <div className="px-2.5 py-1 font-mono-num text-[10px] font-bold uppercase tracking-wider opacity-60">
                      Select Theme Palette (6)
                    </div>
                    {Object.values(THEMES).map((t) => {
                      const isCurrent = t.id === themeId;
                      return (
                        <button
                          key={t.id}
                          onClick={() => {
                            setThemeId(t.id);
                            setThemeMenuOpen(false);
                          }}
                          className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition cursor-pointer ${
                            isCurrent
                              ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/40'
                              : 'hover:bg-indigo-500/10'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="flex -space-x-1">
                              {t.swatch.map((hex, i) => (
                                <span
                                  key={i}
                                  className="h-3.5 w-3.5 rounded-full border border-white/30"
                                  style={{ backgroundColor: hex }}
                                />
                              ))}
                            </div>
                            <span>{t.name}</span>
                          </div>
                          {isCurrent && <Check className="h-3.5 w-3.5 text-indigo-400" />}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Compare Drawer Trigger */}
            <button
              onClick={onOpenCompare}
              className="theme-input relative flex h-9 items-center gap-1.5 rounded-xl px-2.5 text-xs font-semibold transition cursor-pointer"
              title="Compare Hardware Specs"
            >
              <Layers className="h-4 w-4 text-cyan-400" />
              <span className="hidden sm:inline">Compare</span>
              {compareCount > 0 && (
                <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-cyan-500 px-1 font-mono-num text-[10px] font-bold text-slate-950">
                  {compareCount}
                </span>
              )}
            </button>

            {/* Wishlist Trigger */}
            <button
              onClick={() => onOpenCart('wishlist')}
              className="theme-input relative flex h-9 w-9 items-center justify-center rounded-xl transition cursor-pointer"
              title="Saved Wishlist"
            >
              <Heart className={`h-4 w-4 ${wishlistCount > 0 ? 'fill-rose-500 text-rose-500' : ''}`} />
              {wishlistCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 font-mono-num text-[10px] font-bold text-white">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart Trigger */}
            <button
              onClick={() => onOpenCart('cart')}
              style={{
                background: `linear-gradient(135deg, var(--accent), var(--accent-secondary))`
              }}
              className="relative flex h-9 items-center gap-2 rounded-xl px-3.5 text-xs font-semibold text-white shadow-md ring-1 ring-white/15 transition cursor-pointer"
            >
              <ShoppingBag className="h-4 w-4" />
              <span className="hidden sm:inline">Build Cart</span>
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white/20 px-1.5 font-mono-num text-[11px] font-bold">
                {cartCount}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile / Tablet Navigation Bar */}
        <div className="mt-2.5 flex xl:hidden items-center gap-1.5 overflow-x-auto pb-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={
                  isActive
                    ? {
                        background: `linear-gradient(135deg, var(--accent), var(--accent-secondary))`,
                        color: '#ffffff'
                      }
                    : undefined
                }
                className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition cursor-pointer ${
                  isActive ? 'shadow-xs' : 'theme-subtle'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
