import React from 'react';
import { X, Layers, Star, ShoppingBag, Trash2 } from 'lucide-react';
import { formatPrice } from '../utils/currency.js';
import { getProductArtUrl } from '../utils/storeEngine.js';

export default function CompareModal({
  isOpen,
  onClose,
  compareProducts,
  onRemoveCompare,
  onClearCompare,
  onAddToCart,
  currency,
  darkMode
}) {
  if (!isOpen) return null;

  const allSpecKeys = Array.from(
    new Set(compareProducts.flatMap((p) => Object.keys(p.specs || {})))
  );

  const minPrice = compareProducts.length
    ? Math.min(...compareProducts.map((p) => p.price))
    : 0;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-3xl border shadow-2xl transition-colors ${
          darkMode
            ? 'bg-slate-900 border-white/[0.1] text-slate-100'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        <div
          className={`sticky top-0 z-10 flex items-center justify-between border-b px-6 py-4 backdrop-blur-md ${
            darkMode
              ? 'border-white/[0.08] bg-slate-900/95'
              : 'border-slate-200 bg-white/95'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Layers className="h-5 w-5 text-cyan-400" />
            <h2 className="font-display text-lg font-bold">
              Hardware Side-by-Side Spec Comparison ({compareProducts.length}/4)
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {compareProducts.length > 0 && (
              <button
                onClick={onClearCompare}
                className={`rounded-xl border px-3 py-1.5 text-xs hover:text-rose-400 cursor-pointer ${
                  darkMode
                    ? 'border-white/[0.1] text-slate-300'
                    : 'border-slate-200 text-slate-700'
                }`}
              >
                Clear All
              </button>
            )}
            <button
              onClick={onClose}
              className={`rounded-xl border p-2 cursor-pointer ${
                darkMode
                  ? 'border-white/[0.1] bg-slate-800 text-slate-300 hover:text-white'
                  : 'border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {compareProducts.length === 0 ? (
            <div
              className={`rounded-2xl border p-12 text-center space-y-2 ${
                darkMode ? 'border-white/[0.08]' : 'border-slate-200'
              }`}
            >
              <Layers className="mx-auto h-10 w-10 text-slate-500" />
              <p className="text-sm font-bold">No Hardware Selected for Comparison</p>
              <p className="text-xs text-slate-400">
                Click the layer icon on up to 4 product cards to compare their engineering telemetry side-by-side.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr
                    className={`border-b ${
                      darkMode ? 'border-white/[0.08]' : 'border-slate-200'
                    }`}
                  >
                    <th className="w-44 py-4 pr-4 font-mono-num uppercase text-slate-400">
                      Metric / Spec
                    </th>
                    {compareProducts.map((p) => {
                      const isBestValue =
                        compareProducts.length > 1 && p.price === minPrice;
                      return (
                        <th key={p.id} className="min-w-[215px] p-3 align-top">
                          <div
                            className={`relative rounded-2xl p-3.5 space-y-2.5 ${
                              darkMode ? 'surface-card-dark' : 'surface-card-light'
                            }`}
                          >
                            {isBestValue && (
                              <span className="inline-block rounded-md bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 font-mono-num text-[9px] font-bold text-emerald-400">
                                BEST VALUE
                              </span>
                            )}
                            <button
                              onClick={() => onRemoveCompare(p.id)}
                              className="absolute right-2.5 top-2.5 rounded-lg bg-slate-900/80 p-1.5 text-slate-300 hover:text-rose-400 cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                            <img
                              src={getProductArtUrl(p)}
                              alt={p.name}
                              className="h-32 w-full rounded-xl object-cover bg-slate-950"
                            />
                            <div className="font-mono-num text-[10px] font-bold text-indigo-400">
                              {p.sku}
                            </div>
                            <div className="font-display text-sm font-bold leading-snug">
                              {p.name}
                            </div>
                            <div className="flex items-center justify-between pt-1">
                              <span className="font-mono-num text-base font-bold text-indigo-400">
                                {formatPrice(p.price, currency)}
                              </span>
                              <button
                                onClick={() => onAddToCart(p)}
                                className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 px-2.5 py-1.5 text-[11px] font-semibold text-white cursor-pointer"
                              >
                                <ShoppingBag className="h-3 w-3" /> Add
                              </button>
                            </div>
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody
                  className={`divide-y ${
                    darkMode ? 'divide-white/[0.06]' : 'divide-slate-200'
                  }`}
                >
                  <tr>
                    <td className="py-3 pr-4 font-semibold text-slate-400">Brand</td>
                    {compareProducts.map((p) => (
                      <td key={p.id} className="p-3 font-semibold">
                        {p.brand}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 font-semibold text-slate-400">Rating</td>
                    {compareProducts.map((p) => (
                      <td key={p.id} className="p-3">
                        <span className="inline-flex items-center gap-1 font-mono-num font-bold text-amber-400">
                          <Star className="h-3.5 w-3.5 fill-amber-400" />
                          {p.rating} ({p.review_count} reviews)
                        </span>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 font-semibold text-slate-400">
                      Live Warehouse Stock
                    </td>
                    {compareProducts.map((p) => (
                      <td
                        key={p.id}
                        className="p-3 font-mono-num font-semibold text-emerald-400"
                      >
                        {p.stock} units available
                      </td>
                    ))}
                  </tr>
                  {allSpecKeys.map((specKey) => (
                    <tr key={specKey}>
                      <td className="py-3 pr-4 font-mono-num text-[11px] uppercase font-bold text-indigo-400">
                        {specKey}
                      </td>
                      {compareProducts.map((p) => (
                        <td
                          key={p.id}
                          className={`p-3 ${
                            darkMode ? 'text-slate-300' : 'text-slate-700'
                          }`}
                        >
                          {p.specs?.[specKey] || '—'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
