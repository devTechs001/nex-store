import React from 'react';
import {
  ShoppingBag,
  Search,
  Activity,
  Database,
  ShieldCheck,
  Truck,
  Sparkles,
  Sun,
  Moon,
  Heart,
  Layers,
  Store,
  Radio,
  Zap
} from 'lucide-react';
import { CURRENCIES, formatRelativeTime } from '../utils/currency.js';

export default function Navbar({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  searchInputRef,
  currency,
  setCurrency,
  darkMode,
  setDarkMode,
  cartCount,
  wishlistCount,
  compareCount,
  onOpenCart,
  onOpenCompare,
  wsConnected,
  presence,
  latestActivity,
  onSimulateRealtime,
  dbStats
}) {
  const navItems = [
    { id: 'store', label: 'Storefront', icon: Store },
    { id: 'tracker', label: 'Live Order Tracker', icon: Truck },
    { id: 'admin', label: 'Admin Command', icon: ShieldCheck },
    {
      id: 'database',
      label: 'SQLite DB Studio',
      icon: Database,
      badge: dbStats?.totalTables ? `${dbStats.totalTables} Tables` : 'SQLite'
    }
  ];

  return (
    <header
      className={`sticky top-0 z-40 border-b backdrop-blur-xl transition-colors ${
        darkMode
          ? 'bg-slate-950/88 border-slate-800/80 text-slate-100'
          : 'bg-white/90 border-slate-200 text-slate-900'
      }`}
    >
      {/* Top Real-Time Telemetry & Activity Ticker Bar */}
      <div
        className={`border-b px-4 py-1.5 text-xs transition-colors ${
          darkMode
            ? 'bg-slate-900/90 border-slate-800/80 text-slate-300'
            : 'bg-slate-900 border-slate-800 text-slate-200'
        }`}
      >
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3 overflow-hidden">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-0.5 font-mono-num text-[11px] font-medium text-emerald-400 border border-emerald-500/30">
              <span
                className={`h-2 w-2 rounded-full ${
                  wsConnected ? 'bg-emerald-400 animate-pulse-glow' : 'bg-amber-400'
                }`}
              />
              {wsConnected ? 'WS REALTIME LIVE' : 'RECONNECTING'}
            </span>

            <span className="hidden sm:inline-flex items-center gap-1 font-mono-num text-[11px] text-slate-400">
              <Radio className="h-3 w-3 text-indigo-400" />
              {presence?.activeShoppers || 21} active shoppers
            </span>

            {latestActivity && (
              <div className="flex items-center gap-2 truncate text-slate-300">
                <span className="text-slate-600">•</span>
                <Activity className="h-3.5 w-3.5 shrink-0 text-cyan-400" />
                <span className="truncate font-medium text-white">{latestActivity.title}:</span>
                <span className="truncate text-slate-300 max-w-xs md:max-w-md">
                  {latestActivity.message}
                </span>
                <span className="hidden lg:inline font-mono-num text-[11px] text-slate-400">
                  ({formatRelativeTime(latestActivity.created_at)})
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onSimulateRealtime}
              className="inline-flex items-center gap-1.5 rounded-md bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 px-2.5 py-0.5 text-[11px] font-medium text-indigo-300 transition cursor-pointer"
              title="Trigger a live WebSocket store event"
            >
              <Zap className="h-3 w-3 text-amber-400" />
              <span>Pulse Live Event</span>
            </button>
            <span className="hidden md:inline font-mono-num text-[11px] text-slate-400">
              Promo: <strong className="text-cyan-400">NEX20</strong> (20% OFF)
            </span>
          </div>
        </div>
      </div>

      {/* Main Header Navigation Row */}
      <div className="mx-auto max-w-7xl px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Brand Logo */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => setActiveTab('store')}
              className="group flex items-center gap-2.5 text-left cursor-pointer"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-cyan-500 text-white shadow-lg shadow-indigo-500/25">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-display text-lg font-bold tracking-tight">NEX STORE</span>
                  <span className="rounded bg-indigo-500/15 px-1.5 py-0.5 font-mono-num text-[10px] font-semibold text-indigo-400 border border-indigo-500/30">
                    v2.5 DB+WS
                  </span>
                </div>
                <p
                  className={`text-[11px] ${
                    darkMode ? 'text-slate-400' : 'text-slate-500'
                  }`}
                >
                  Precision Hardware & Live Commerce
                </p>
              </div>
            </button>

            {/* Primary Navigation Tabs */}
            <nav className="hidden xl:flex items-center gap-1 rounded-xl p-1 bg-slate-900/60 border border-slate-800/80">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition cursor-pointer ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/40'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span
                        className={`rounded px-1.5 py-0.2 font-mono-num text-[10px] ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
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

          {/* Search + Action Controls */}
          <div className="flex flex-1 items-center justify-end gap-2.5 max-w-xl">
            <div className="relative flex-1 max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (activeTab !== 'store') setActiveTab('store');
                }}
                placeholder="Search hardware, SKU, specs... (⌘K)"
                className={`w-full rounded-xl border pl-9 pr-12 py-2 text-xs transition focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  darkMode
                    ? 'bg-slate-900/90 border-slate-800 text-slate-100 placeholder-slate-500'
                    : 'bg-slate-100 border-slate-300 text-slate-900 placeholder-slate-500'
                }`}
              />
              {searchQuery ? (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-slate-400 hover:text-white cursor-pointer"
                >
                  Clear
                </button>
              ) : (
                <kbd className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 rounded border border-slate-700 bg-slate-800/80 px-1.5 py-0.5 font-mono-num text-[10px] text-slate-400 sm:inline-block">
                  ⌘K
                </kbd>
              )}
            </div>

            {/* Currency Selector */}
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              aria-label="Select currency"
              className={`rounded-xl border px-2.5 py-2 font-mono-num text-xs font-medium transition focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer ${
                darkMode
                  ? 'bg-slate-900 border-slate-800 text-slate-200'
                  : 'bg-slate-100 border-slate-300 text-slate-800'
              }`}
            >
              {Object.values(CURRENCIES).map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} ({c.symbol.trim()})
                </option>
              ))}
            </select>

            {/* Theme Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`flex h-9 w-9 items-center justify-center rounded-xl border transition cursor-pointer ${
                darkMode
                  ? 'border-slate-800 bg-slate-900 text-amber-400 hover:bg-slate-800'
                  : 'border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {/* Compare Drawer Trigger */}
            <button
              onClick={onOpenCompare}
              className={`relative flex h-9 items-center gap-1.5 rounded-xl border px-2.5 text-xs font-medium transition cursor-pointer ${
                darkMode
                  ? 'border-slate-800 bg-slate-900 text-slate-200 hover:bg-slate-800'
                  : 'border-slate-300 bg-slate-100 text-slate-800 hover:bg-slate-200'
              }`}
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

            {/* Wishlist Trigger (opens Cart/Saved Drawer) */}
            <button
              onClick={() => onOpenCart('wishlist')}
              className={`relative flex h-9 w-9 items-center justify-center rounded-xl border transition cursor-pointer ${
                darkMode
                  ? 'border-slate-800 bg-slate-900 text-slate-200 hover:bg-slate-800'
                  : 'border-slate-300 bg-slate-100 text-slate-800 hover:bg-slate-200'
              }`}
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
              className="relative flex h-9 items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-3.5 text-xs font-semibold text-white shadow-md shadow-indigo-500/25 transition cursor-pointer"
            >
              <ShoppingBag className="h-4 w-4" />
              <span className="hidden sm:inline">Cart</span>
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
                className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white'
                    : darkMode
                    ? 'bg-slate-900 text-slate-300 border border-slate-800'
                    : 'bg-slate-100 text-slate-700 border border-slate-200'
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
