import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search,
  Store,
  Truck,
  ShieldCheck,
  Database,
  Sparkles,
  ArrowRight,
  Tag,
  Sun,
  Moon,
  Zap,
  X,
  Command
} from 'lucide-react';
import { formatPrice } from '../utils/currency.js';

export default function CommandPaletteModal({
  isOpen,
  onClose,
  products,
  coupons,
  currency,
  darkMode,
  setDarkMode,
  setActiveTab,
  onSelectProduct,
  onAddToCart,
  onSimulateRealtime
}) {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 40);
    }
  }, [isOpen]);

  const matchingProducts = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return products.slice(0, 5);
    return products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          (p.tags || []).some((t) => t.toLowerCase().includes(q))
      )
      .slice(0, 6);
  }, [products, query]);

  const quickCommands = [
    {
      id: 'cmd-store',
      label: 'Go to Hardware Storefront',
      hint: 'Browse catalog & flash deals',
      icon: Store,
      action: () => {
        setActiveTab('store');
        onClose();
      }
    },
    {
      id: 'cmd-tracker',
      label: 'Open Live Order Tracker',
      hint: 'Track shipments in real time via WebSockets',
      icon: Truck,
      action: () => {
        setActiveTab('tracker');
        onClose();
      }
    },
    {
      id: 'cmd-admin',
      label: 'Open Admin Operations Command Center',
      hint: 'Manage stock, orders, products & coupons',
      icon: ShieldCheck,
      action: () => {
        setActiveTab('admin');
        onClose();
      }
    },
    {
      id: 'cmd-db',
      label: 'Open SQLite Database Studio',
      hint: 'Inspect all 10 tables & run live SQL queries',
      icon: Database,
      action: () => {
        setActiveTab('database');
        onClose();
      }
    },
    {
      id: 'cmd-pulse',
      label: 'Trigger Live WebSocket Store Event',
      hint: 'Broadcast simulated real-time shopper activity',
      icon: Zap,
      action: () => {
        onSimulateRealtime();
        onClose();
      }
    },
    {
      id: 'cmd-theme',
      label: darkMode ? 'Switch to Light Mode (Alabaster)' : 'Switch to Dark Mode (Obsidian)',
      hint: 'Toggle interface appearance',
      icon: darkMode ? Sun : Moon,
      action: () => {
        setDarkMode(!darkMode);
        onClose();
      }
    }
  ];

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/75 backdrop-blur-md pt-16 sm:pt-24 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-2xl overflow-hidden rounded-3xl border shadow-2xl transition-all ${
          darkMode
            ? 'bg-slate-900/95 border-slate-700/80 text-slate-100 shadow-indigo-950/50'
            : 'bg-white border-slate-200 text-slate-900 shadow-slate-900/15'
        }`}
      >
        {/* Top Command Input Bar */}
        <div
          className={`flex items-center gap-3 border-b px-5 py-4 ${
            darkMode ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200 bg-slate-50/80'
          }`}
        >
          <Command className="h-4 w-4 text-indigo-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search hardware by name, SKU, spec..."
            className="flex-1 bg-transparent text-sm focus:outline-none placeholder-slate-500"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="rounded-lg px-2 py-0.5 text-xs text-slate-400 hover:text-indigo-400 cursor-pointer"
            >
              Clear
            </button>
          )}
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-700/60 px-2 py-1 font-mono-num text-[10px] text-slate-400 hover:text-white cursor-pointer"
          >
            ESC
          </button>
        </div>

        {/* Results Body */}
        <div className="max-h-[68vh] overflow-y-auto p-4 space-y-5">
          {/* Matching Hardware Models */}
          <div>
            <div className="px-2 pb-2 flex items-center justify-between">
              <span className="font-mono-num text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                Hardware Catalog ({matchingProducts.length})
              </span>
              <span className="text-[11px] text-slate-500">Click to inspect 4-angle CAD & specs</span>
            </div>

            {matchingProducts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-800 p-6 text-center text-xs text-slate-400">
                No hardware models matched "{query}"
              </div>
            ) : (
              <div className="space-y-1.5">
                {matchingProducts.map((prod) => (
                  <div
                    key={prod.id}
                    onClick={() => {
                      onSelectProduct(prod);
                      onClose();
                    }}
                    className={`group flex items-center justify-between gap-3 rounded-2xl border p-2.5 transition cursor-pointer ${
                      darkMode
                        ? 'border-transparent hover:border-indigo-500/40 hover:bg-slate-800/60'
                        : 'border-transparent hover:border-indigo-300 hover:bg-indigo-50/50'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={prod.image_url}
                        alt={prod.name}
                        className="h-11 w-14 rounded-xl object-cover bg-slate-950 border border-slate-800 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono-num text-[10px] font-semibold text-indigo-400">
                            {prod.sku}
                          </span>
                          <span className="text-xs font-bold truncate">{prod.name}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate">{prod.tagline}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      <span className="font-mono-num text-xs font-bold text-emerald-400">
                        {formatPrice(prod.price, currency)}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddToCart(prod);
                          onClose();
                        }}
                        className="rounded-lg bg-indigo-600 hover:bg-indigo-500 px-2.5 py-1 text-[11px] font-semibold text-white cursor-pointer"
                      >
                        + Cart
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Platform Actions */}
          <div>
            <div className="px-2 pb-2 font-mono-num text-[10px] font-bold uppercase tracking-wider text-cyan-400">
              Platform Navigation & Real-Time Actions
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {quickCommands.map((cmd) => {
                const Icon = cmd.icon;
                return (
                  <button
                    key={cmd.id}
                    onClick={cmd.action}
                    className={`flex items-center justify-between rounded-xl border p-2.5 text-left transition cursor-pointer ${
                      darkMode
                        ? 'border-slate-800/80 bg-slate-950/50 hover:border-indigo-500/40 hover:bg-slate-800/70'
                        : 'border-slate-200 bg-slate-50 hover:border-indigo-400 hover:bg-indigo-50/40'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-400">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold truncate">{cmd.label}</div>
                        <div className="text-[10px] text-slate-400 truncate">{cmd.hint}</div>
                      </div>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Promo Codes */}
          {coupons && coupons.length > 0 && (
            <div>
              <div className="px-2 pb-2 font-mono-num text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                Active VIP Promo Codes (Click to Copy)
              </div>
              <div className="flex flex-wrap gap-2 px-1">
                {coupons
                  .filter((c) => c.active)
                  .map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        navigator.clipboard?.writeText(c.code);
                        onClose();
                      }}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1.5 font-mono-num text-xs text-emerald-300 cursor-pointer"
                    >
                      <Tag className="h-3 w-3" />
                      <strong>{c.code}</strong>
                      <span className="text-[10px] opacity-80">
                        ({c.discount_type === 'percentage' ? `${c.discount_value}% OFF` : `$${c.discount_value} OFF`})
                      </span>
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
