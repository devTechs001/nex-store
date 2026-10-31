import React from 'react';
import {
  Store,
  Terminal,
  Server,
  Truck,
  ShieldCheck,
  Database,
  BookOpen,
  Sliders,
  Command,
  ShoppingBag,
  Heart,
  Layers,
  Bell,
  ChevronLeft,
  ChevronRight,
  Activity,
  RefreshCw,
  CheckCircle2,
  Cpu
} from 'lucide-react';

export default function DesktopSideNav({
  activeTab,
  setActiveTab,
  collapsed,
  setCollapsed,
  darkMode,
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
  const storeCount = badges.store?.products || 12;
  const appsCount = badges.apps?.total || 10;
  const onlineNodes = badges.subsystems?.onlineNodes || 6;
  const totalNodes = badges.subsystems?.totalNodes || 6;
  const activeOrders = badges.tracker?.activeOrders ?? 3;
  const lowStockCount = badges.admin?.lowStock ?? 2;
  const savedRigsCount = badges.bto?.savedRigs || 3;

  const primaryNav = [
    {
      id: 'store',
      label: 'Hardware Store',
      sub: 'Flagship SKUs & CAD',
      icon: Store,
      badge: `${storeCount} SKUs`,
      badgeColor: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30'
    },
    {
      id: 'apps',
      label: 'App Store (Netlify)',
      sub: 'Multi-Source Sandbox',
      icon: Terminal,
      badge: `${appsCount} Apps`,
      badgeColor: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30'
    },
    {
      id: 'subsystems',
      label: 'Subsystems & WAF',
      sub: 'Edge Cluster & Shield',
      icon: Server,
      badge: `${onlineNodes}/${totalNodes} Live`,
      badgeColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
    },
    {
      id: 'tracker',
      label: 'Order Tracker',
      sub: 'Live Telemetry Stages',
      icon: Truck,
      badge: `${activeOrders} Active`,
      badgeColor: 'bg-amber-500/15 text-amber-400 border-amber-500/30'
    },
    {
      id: 'admin',
      label: 'Admin Ops',
      sub: 'Inventory & Revenue',
      icon: ShieldCheck,
      badge: lowStockCount > 0 ? `${lowStockCount} Low` : 'Healthy',
      badgeColor:
        lowStockCount > 0
          ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
          : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
    },
    {
      id: 'database',
      label: 'SQLite Studio',
      sub: 'WAL Explorer & SQL',
      icon: Database,
      badge: `${totalTables} DB`,
      badgeColor: 'bg-purple-500/15 text-purple-400 border-purple-500/30'
    },
    {
      id: 'docs',
      label: 'Docs & API Guide',
      sub: 'REST, WS & CLI Manual',
      icon: BookOpen,
      badge: 'v3.1',
      badgeColor: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30'
    }
  ];

  const studioTools = [
    {
      id: 'bto-studio',
      label: '5-Slot Rig BTO',
      badge: `${savedRigsCount} Saved`,
      icon: Sliders,
      accent: 'text-amber-400',
      onClick: onOpenHardwareBuilder
    },
    {
      id: 'cli-terminal',
      label: 'NEX-SH v3.0 CLI',
      badge: '⌘J',
      icon: Terminal,
      accent: 'text-emerald-400',
      onClick: onOpenTerminal
    },
    {
      id: 'cmd-palette',
      label: 'Command Palette',
      badge: '⌘K',
      icon: Command,
      accent: 'text-indigo-400',
      onClick: onOpenCommandPalette
    },
    {
      id: 'cart-drawer',
      label: 'Express Cart',
      badge: `${cartCount}`,
      icon: ShoppingBag,
      accent: 'text-cyan-400',
      onClick: () => onOpenCart('cart')
    },
    {
      id: 'wishlist-drawer',
      label: 'Saved Wishlist',
      badge: `${wishlistCount}`,
      icon: Heart,
      accent: 'text-rose-400',
      onClick: () => onOpenCart('wishlist')
    },
    {
      id: 'compare-modal',
      label: 'Compare Specs',
      badge: `${compareCount}`,
      icon: Layers,
      accent: 'text-purple-400',
      onClick: onOpenCompare
    },
    {
      id: 'push-center',
      label: 'Push Alerts',
      badge: unreadNotificationsCount > 0 ? `${unreadNotificationsCount} New` : 'Sync',
      icon: Bell,
      accent: 'text-amber-400',
      onClick: onOpenNotifications
    }
  ];

  return (
    <aside
      aria-label="Desktop Workspace Side Navigation"
      className={`nex-desktop-sidenav hidden lg:flex flex-col shrink-0 sticky top-[112px] h-[calc(100dvh-112px)] z-30 select-none ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top Collapse Toggle Header */}
      <div className="flex items-center justify-between px-3.5 py-3 border-b border-white/[0.07]">
        {!collapsed && (
          <div className="flex items-center gap-2 min-w-0">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono-num text-[11px] font-bold uppercase tracking-wider theme-text-muted truncate">
              Workspace Dock
            </span>
          </div>
        )}
        <button
          type="button"
          onClick={() => setCollapsed((prev) => !prev)}
          title={collapsed ? 'Expand Side Navigation' : 'Collapse Side Navigation'}
          className="mx-auto lg:mx-0 inline-flex items-center justify-center rounded-xl p-1.5 theme-subtle hover:border-indigo-500/40 cursor-pointer transition"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4 text-indigo-400" />
          ) : (
            <ChevronLeft className="h-4 w-4 text-indigo-400" />
          )}
        </button>
      </div>

      {/* Scrollable Navigation Sections */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-2.5 py-3 space-y-5">
        {/* Section 1: Core Workspaces */}
        <div className="space-y-1">
          {!collapsed && (
            <div className="px-2.5 pb-1 font-mono-num text-[10px] font-bold uppercase tracking-wider theme-text-muted">
              Core Workspaces (7)
            </div>
          )}
          {primaryNav.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                title={collapsed ? `${item.label} (${item.badge})` : item.sub}
                className={`w-full flex items-center ${
                  collapsed ? 'justify-center px-2 py-2.5' : 'justify-between px-3 py-2.5'
                } rounded-2xl text-left transition-all cursor-pointer group ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-lg shadow-indigo-500/20'
                    : darkMode
                    ? 'text-slate-300 hover:bg-white/[0.06] hover:text-white'
                    : 'text-slate-700 hover:bg-slate-200/75 hover:text-slate-950'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`relative flex items-center justify-center rounded-xl p-1.5 ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'theme-subtle group-hover:border-indigo-500/40'
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                  </div>
                  {!collapsed && (
                    <div className="min-w-0">
                      <div className="text-xs font-bold truncate">{item.label}</div>
                      <div
                        className={`text-[10px] truncate ${
                          isActive ? 'text-indigo-100' : 'theme-text-muted'
                        }`}
                      >
                        {item.sub}
                      </div>
                    </div>
                  )}
                </div>

                {!collapsed && item.badge && (
                  <span
                    className={`ml-2 shrink-0 rounded-full border px-2 py-0.5 font-mono-num text-[10px] font-bold ${
                      isActive
                        ? 'bg-white/20 text-white border-white/30'
                        : item.badgeColor
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Section 2: Studios & Quick Actions */}
        <div className="space-y-1 pt-2 border-t border-white/[0.07]">
          {!collapsed && (
            <div className="px-2.5 pb-1 font-mono-num text-[10px] font-bold uppercase tracking-wider theme-text-muted">
              Studios &amp; Quick Tools
            </div>
          )}
          {studioTools.map((tool) => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.id}
                type="button"
                onClick={tool.onClick}
                title={collapsed ? `${tool.label} (${tool.badge})` : tool.label}
                className={`w-full flex items-center ${
                  collapsed ? 'justify-center px-2 py-2' : 'justify-between px-3 py-2'
                } rounded-xl text-xs font-semibold transition cursor-pointer ${
                  darkMode
                    ? 'text-slate-300 hover:bg-white/[0.06] hover:text-white'
                    : 'text-slate-700 hover:bg-slate-200/75 hover:text-slate-950'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon className={`h-4 w-4 shrink-0 ${tool.accent}`} />
                  {!collapsed && <span className="truncate">{tool.label}</span>}
                </div>
                {!collapsed && (
                  <span className="rounded-md px-1.5 py-0.5 font-mono-num text-[10px] theme-subtle">
                    {tool.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Live Endpoint Telemetry Footer (`/api/health`) */}
      <div className="p-3 border-t border-white/[0.07]">
        {collapsed ? (
          <button
            type="button"
            onClick={onRefreshHealth}
            title="Ping /api/health live endpoint"
            className="w-full flex items-center justify-center rounded-xl p-2 theme-subtle hover:border-emerald-500/40 cursor-pointer"
          >
            <Activity
              className={`h-4 w-4 text-emerald-400 ${isPingingHealth ? 'animate-spin' : ''}`}
            />
          </button>
        ) : (
          <div className="rounded-2xl p-3 theme-subtle space-y-2">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 font-mono-num text-[10px] font-bold uppercase text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                /api/health Live
              </span>
              <button
                type="button"
                onClick={onRefreshHealth}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[10px] font-mono-num theme-card hover:border-cyan-400/50 cursor-pointer"
                title="Ping /api/health & /api/nav/telemetry"
              >
                <RefreshCw className={`h-3 w-3 text-cyan-400 ${isPingingHealth ? 'animate-spin' : ''}`} />
                Ping
              </button>
            </div>
            <div className="grid grid-cols-2 gap-1.5 font-mono-num text-[10px]">
              <div className="rounded-lg px-2 py-1 bg-black/20">
                <div className="theme-text-muted">SQLite WAL</div>
                <div className="font-bold text-cyan-400">{totalTables} Tables</div>
              </div>
              <div className="rounded-lg px-2 py-1 bg-black/20">
                <div className="theme-text-muted">Node RAM</div>
                <div className="font-bold text-indigo-400">
                  {healthStatus?.memory?.rssMB ? `${healthStatus.memory.rssMB} MB` : '74.2 MB'}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
