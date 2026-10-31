import React, { useState } from 'react';
import {
  ShoppingBag,
  Search,
  Sparkles,
  Palette,
  Heart,
  Layers,
  Zap,
  Command,
  Terminal,
  Check,
  Bell,
  Volume2,
  VolumeX,
  Sliders,
  Menu,
  PanelLeft,
  Smartphone,
  CreditCard
} from 'lucide-react';
import { CURRENCIES } from '../utils/currency.js';
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
  onSimulateRealtime,
  soundEnabled,
  onToggleSound,
  unreadNotificationsCount = 0,
  onOpenNotifications,
  onOpenTerminal,
  onOpenHardwareBuilder,
  onToggleSideNav,
  onOpenMobileMenu
}) {
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const activeTheme = THEMES[themeId] || THEMES.obsidian;

  return (
    <header className="theme-header sticky top-0 z-40 h-14 border-b backdrop-blur-2xl transition-colors duration-200 select-none">
      <div className="mx-auto flex h-14 max-w-[1600px] items-center justify-between gap-2 sm:gap-3 px-3 sm:px-4">
        {/* Left: Drawer / SideNav Toggle + Compact Standard Brand Identity */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {onToggleSideNav && (
            <button
              type="button"
              onClick={onToggleSideNav}
              title="Toggle Desktop Sidebar"
              className="theme-subtle hidden lg:inline-flex h-9 w-9 items-center justify-center rounded-xl hover:border-indigo-500/40 cursor-pointer transition"
            >
              <PanelLeft className="h-4 w-4 text-indigo-400" />
            </button>
          )}
          {onOpenMobileMenu && (
            <button
              type="button"
              onClick={onOpenMobileMenu}
              aria-label="Open Mobile Sidebar Drawer"
              title="Open Mobile Navigation Drawer"
              className="theme-subtle inline-flex lg:hidden h-9 w-9 items-center justify-center rounded-xl border border-indigo-500/30 hover:border-indigo-400 cursor-pointer transition active:scale-95"
            >
              <Menu className="h-4 w-4 text-indigo-400" />
            </button>
          )}

          <button
            type="button"
            onClick={() => setActiveTab('store')}
            className="group flex items-center gap-2 text-left cursor-pointer"
          >
            <div
              className="flex h-8 w-8 items-center justify-center rounded-xl text-white shadow-sm ring-1 ring-white/20 transition duration-200 group-hover:scale-105"
              style={{
                background: `linear-gradient(135deg, var(--accent), var(--accent-secondary))`
              }}
            >
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-display text-sm sm:text-base font-bold tracking-tight">
                NEX STORE
              </span>
              <span
                title={wsConnected ? 'WebSocket & 23-Table SQLite Synced' : 'Live Store Active'}
                className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-1.5 py-0.5 font-mono-num text-[9px] font-bold text-emerald-400"
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    wsConnected ? 'bg-emerald-400 animate-pulse' : 'bg-cyan-400'
                  }`}
                />
                <span className="hidden sm:inline">LIVE</span>
              </span>
            </div>
          </button>
        </div>

        {/* Center: Standard Compact Global Search & Command Palette Bar (⌘K) */}
        <div className="relative flex-1 max-w-md mx-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 opacity-50" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (activeTab !== 'store') setActiveTab('store');
            }}
            placeholder="Search hardware, apps, or press ⌘K..."
            className="theme-input h-9 w-full rounded-xl pl-8 pr-12 text-xs transition"
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-indigo-400 cursor-pointer"
            >
              Clear
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenCommandPalette}
              title="Open Command Palette (⌘K)"
              className="theme-subtle absolute right-1.5 top-1/2 -translate-y-1/2 inline-flex items-center gap-0.5 rounded-lg px-1.5 py-0.5 font-mono-num text-[10px] font-semibold hover:border-indigo-500 cursor-pointer"
            >
              <Command className="h-2.5 w-2.5" />
              <span>K</span>
            </button>
          )}
        </div>

        {/* Right: Compact Action Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Quick Mobile SDK & Subscriptions Tab Button */}
          <button
            type="button"
            onClick={() => setActiveTab('mobile-subs')}
            title="Open Subscriptions, PWA & Mobile (Flutter/Native) Integration Hub"
            className={`hidden md:inline-flex h-8 items-center gap-1.5 rounded-xl px-2.5 text-[11px] font-semibold transition cursor-pointer ${
              activeTab === 'mobile-subs'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'theme-input text-cyan-400 hover:border-cyan-400/50'
            }`}
          >
            <Smartphone className="h-3.5 w-3.5" />
            <span className="hidden xl:inline">Mobile &amp; Plans</span>
          </button>

          {/* Live Event Pulse Trigger (Desktop) */}
          <button
            type="button"
            onClick={onSimulateRealtime}
            title={`Broadcast simulated live event (${presence?.activeShoppers || 24} engineers online)`}
            className="theme-input hidden xl:inline-flex h-8 items-center gap-1 rounded-xl px-2.5 text-[11px] font-semibold text-indigo-400 cursor-pointer"
          >
            <Zap className="h-3 w-3 text-amber-400" />
            <span>Pulse</span>
          </button>

          {/* Currency Selector */}
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            aria-label="Select currency"
            className="theme-input hidden sm:block h-8 rounded-xl px-2 font-mono-num text-[11px] font-semibold cursor-pointer"
          >
            {Object.values(CURRENCIES).map((c) => (
              <option key={c.code} value={c.code}>
                {c.code}
              </option>
            ))}
          </select>

          {/* 6-Theme Palette Switcher Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setThemeMenuOpen((o) => !o)}
              className="theme-input flex h-8 items-center gap-1.5 rounded-xl px-2 text-xs font-semibold transition cursor-pointer"
              title="Switch UI Theme Palette"
            >
              <Palette className="h-3.5 w-3.5 text-indigo-400" />
              <span
                className="h-2.5 w-2.5 rounded-full border border-white/30"
                style={{ backgroundColor: activeTheme.swatch[0] }}
              />
            </button>

            {themeMenuOpen && (
              <>
                <div
                  onClick={() => setThemeMenuOpen(false)}
                  className="fixed inset-0 z-40"
                />
                <div className="theme-card absolute right-0 mt-2 z-50 w-52 rounded-2xl p-2 shadow-2xl space-y-1">
                  <div className="px-2.5 py-1 font-mono-num text-[10px] font-bold uppercase tracking-wider opacity-60">
                    Theme Palette (6)
                  </div>
                  {Object.values(THEMES).map((t) => {
                    const isCurrent = t.id === themeId;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          setThemeId(t.id);
                          setThemeMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between rounded-xl px-2.5 py-1.5 text-xs font-semibold transition cursor-pointer ${
                          isCurrent
                            ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/40'
                            : 'hover:bg-indigo-500/10'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-1">
                            {t.swatch.map((hex, i) => (
                              <span
                                key={i}
                                className="h-3 w-3 rounded-full border border-white/30"
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

          {/* Custom Hardware BTO Rig Builder Trigger */}
          <button
            type="button"
            onClick={onOpenHardwareBuilder}
            className="theme-input hidden md:flex h-8 items-center gap-1 rounded-xl px-2 text-[11px] font-semibold text-indigo-400 transition cursor-pointer"
            title="Open Custom 5-Slot Hardware Build-to-Order Studio"
          >
            <Sliders className="h-3.5 w-3.5 text-indigo-400" />
            <span className="hidden lg:inline">BTO</span>
          </button>

          {/* Interactive NEX-SH Cloud Terminal Trigger */}
          <button
            type="button"
            onClick={onOpenTerminal}
            className="theme-input hidden sm:flex h-8 items-center gap-1 rounded-xl px-2 font-mono-num text-[11px] font-bold text-cyan-400 transition cursor-pointer"
            title="Open Interactive NEX-SH Cloud CLI Terminal (⌘J)"
          >
            <Terminal className="h-3.5 w-3.5 text-cyan-400" />
            <span className="hidden lg:inline">CLI</span>
          </button>

          {/* Sound Synthesizer Mute/Unmute Toggle */}
          <button
            type="button"
            onClick={onToggleSound}
            className="theme-input hidden sm:flex h-8 w-8 items-center justify-center rounded-xl transition cursor-pointer"
            title={soundEnabled ? 'WebAudio Synth ON' : 'WebAudio Muted'}
          >
            {soundEnabled ? (
              <Volume2 className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <VolumeX className="h-3.5 w-3.5 text-rose-400" />
            )}
          </button>

          {/* Push Notification Center Drawer Trigger */}
          <button
            type="button"
            onClick={onOpenNotifications}
            className="theme-input relative flex h-8 w-8 items-center justify-center rounded-xl transition cursor-pointer"
            title="Open Push & Real-Time Notification Center"
          >
            <Bell className="h-3.5 w-3.5 text-amber-400" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 font-mono-num text-[9px] font-bold text-slate-950">
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* Compare Drawer Trigger */}
          {compareCount > 0 && (
            <button
              type="button"
              onClick={onOpenCompare}
              className="theme-input hidden sm:flex h-8 items-center gap-1 rounded-xl px-2 text-[11px] font-semibold transition cursor-pointer"
              title="Compare Hardware Specs"
            >
              <Layers className="h-3.5 w-3.5 text-cyan-400" />
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-cyan-500 px-1 font-mono-num text-[9px] font-bold text-slate-950">
                {compareCount}
              </span>
            </button>
          )}

          {/* Wishlist Trigger */}
          <button
            type="button"
            onClick={() => onOpenCart('wishlist')}
            className="theme-input relative hidden sm:flex h-8 w-8 items-center justify-center rounded-xl transition cursor-pointer"
            title="Saved Wishlist"
          >
            <Heart className={`h-3.5 w-3.5 ${wishlistCount > 0 ? 'fill-rose-500 text-rose-500' : ''}`} />
            {wishlistCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 font-mono-num text-[9px] font-bold text-white">
                {wishlistCount}
              </span>
            )}
          </button>

          {/* Cart Trigger */}
          <button
            type="button"
            onClick={() => onOpenCart('cart')}
            style={{
              background: `linear-gradient(135deg, var(--accent), var(--accent-secondary))`
            }}
            className="relative flex h-8 items-center gap-1.5 rounded-xl px-2.5 sm:px-3 text-xs font-semibold text-white shadow-sm ring-1 ring-white/15 transition cursor-pointer"
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Cart</span>
            <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-white/20 px-1 font-mono-num text-[10px] font-bold">
              {cartCount}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
