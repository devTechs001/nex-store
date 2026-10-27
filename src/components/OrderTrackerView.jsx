import React, { useState, useEffect } from 'react';
import {
  Truck,
  Search,
  CheckCircle2,
  Clock,
  Zap
} from 'lucide-react';
import { formatPrice, formatRelativeTime } from '../utils/currency.js';

const STAGES = [
  { id: 'placed', label: 'Order Placed', desc: 'Verified & allocated in SQLite' },
  { id: 'processing', label: 'Lab QA & Prep', desc: 'Hardware diagnostics passed' },
  { id: 'packed', label: 'Sealed & Packed', desc: 'Anti-static flight case sealed' },
  { id: 'shipped', label: 'In Transit', desc: 'Courier telemetry active' },
  { id: 'delivered', label: 'Delivered', desc: 'Signed at destination' }
];

export default function OrderTrackerView({
  orders,
  initialOrderNumber,
  currency,
  darkMode,
  onAdvanceOrderStatus
}) {
  const [searchNum, setSearchNum] = useState(
    initialOrderNumber || orders?.[0]?.order_number || 'NEX-8942'
  );
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialOrderNumber) {
      setSearchNum(initialOrderNumber);
    }
  }, [initialOrderNumber]);

  useEffect(() => {
    const found = orders.find(
      (o) => o.order_number.toUpperCase() === searchNum.trim().toUpperCase()
    );
    if (found) {
      setSelectedOrder(found);
      setError('');
    }
  }, [orders, searchNum]);

  const handleLookup = async (e) => {
    e?.preventDefault();
    if (!searchNum.trim()) return;
    setError('');
    const localMatch = orders.find(
      (o) => o.order_number.toUpperCase() === searchNum.trim().toUpperCase()
    );
    if (localMatch) {
      setSelectedOrder(localMatch);
      return;
    }
    try {
      const res = await fetch(`/api/orders/track/${encodeURIComponent(searchNum.trim())}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Order not found');
      } else {
        setSelectedOrder(data.order);
      }
    } catch {
      setError('Failed to fetch order');
    }
  };

  const currentStageIdx = selectedOrder
    ? Math.max(
        0,
        STAGES.findIndex((s) => s.id === selectedOrder.status)
      )
    : 0;

  const nextStage =
    selectedOrder && currentStageIdx < STAGES.length - 1
      ? STAGES[currentStageIdx + 1]
      : STAGES[0];

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 space-y-6">
      {/* Header & Order Lookup Bar */}
      <div
        className={`rounded-3xl p-6 md:p-8 ${
          darkMode ? 'surface-card-dark' : 'surface-card-light'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/15 border border-indigo-500/30 px-3 py-0.5 font-mono-num text-xs font-bold text-indigo-400">
              <Truck className="h-3.5 w-3.5" />
              <span>LIVE WEBSOCKET ORDER TELEMETRY</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold">
              Real-Time Order Fulfillment Tracker
            </h1>
            <p className={`text-xs sm:text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Track any shipment live. Status updates in Admin Ops push to this screen automatically via WebSockets.
            </p>
          </div>

          <form onSubmit={handleLookup} className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchNum}
                onChange={(e) => setSearchNum(e.target.value.toUpperCase())}
                placeholder="Order # (e.g. NEX-8942)"
                className={`w-full rounded-xl border pl-10 pr-4 py-2.5 font-mono-num text-xs uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  darkMode
                    ? 'border-white/[0.08] bg-slate-950 text-white'
                    : 'border-slate-300 bg-slate-100 text-slate-900'
                }`}
              />
            </div>
            <button
              type="submit"
              className="rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-indigo-500/25 cursor-pointer"
            >
              Track Live
            </button>
          </form>
        </div>

        {/* Quick Select Pills for All Orders */}
        <div
          className={`mt-5 flex flex-wrap items-center gap-2 pt-4 border-t ${
            darkMode ? 'border-white/[0.07]' : 'border-slate-200'
          }`}
        >
          <span className="text-xs font-semibold text-slate-400">Active Orders in SQLite:</span>
          {orders.slice(0, 8).map((ord) => (
            <button
              key={ord.id}
              onClick={() => {
                setSearchNum(ord.order_number);
                setSelectedOrder(ord);
                setError('');
              }}
              className={`inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 font-mono-num text-xs font-semibold transition cursor-pointer ${
                selectedOrder?.id === ord.id
                  ? 'border-indigo-500 bg-indigo-500/20 text-indigo-400'
                  : darkMode
                  ? 'border-white/[0.08] bg-slate-950/70 text-slate-300 hover:text-white'
                  : 'border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>#{ord.order_number}</span>
              <span className="rounded bg-indigo-500/15 px-1.5 py-0.2 text-[10px] uppercase text-cyan-400">
                {ord.status}
              </span>
            </button>
          ))}
        </div>

        {error && (
          <div className="mt-4 rounded-xl bg-rose-500/15 border border-rose-500/30 p-3 text-xs text-rose-400">
            {error}
          </div>
        )}
      </div>

      {/* Selected Order Live Pipeline */}
      {selectedOrder && (
        <div
          className={`rounded-3xl p-6 md:p-8 space-y-8 ${
            darkMode ? 'surface-card-dark' : 'surface-card-light'
          }`}
        >
          {/* Top Metadata Row */}
          <div
            className={`flex flex-wrap items-center justify-between gap-4 border-b pb-6 ${
              darkMode ? 'border-white/[0.08]' : 'border-slate-200'
            }`}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h2 className="font-display text-2xl font-bold">
                  Order #{selectedOrder.order_number}
                </h2>
                <span className="rounded-lg bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 font-mono-num text-xs font-bold uppercase text-emerald-400">
                  {selectedOrder.status}
                </span>
              </div>
              <p className="font-mono-num text-xs text-slate-400">
                Tracking ID:{' '}
                <strong className={darkMode ? 'text-slate-200' : 'text-slate-800'}>
                  {selectedOrder.tracking_number}
                </strong>{' '}
                • Last updated {formatRelativeTime(selectedOrder.updated_at)}
              </p>
            </div>

            {/* Interactive Real-Time Advance Button */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => onAdvanceOrderStatus(selectedOrder.id, nextStage.id)}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-cyan-500 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/25 transition cursor-pointer"
              >
                <Zap className="h-3.5 w-3.5 text-amber-300" />
                <span>Advance Live Status → {nextStage.label}</span>
              </button>
            </div>
          </div>

          {/* 5-Stage Visual Progress Stepper */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
            {STAGES.map((stage, idx) => {
              const isCompleted = idx <= currentStageIdx;
              const isCurrent = idx === currentStageIdx;
              return (
                <div
                  key={stage.id}
                  onClick={() => onAdvanceOrderStatus(selectedOrder.id, stage.id)}
                  title="Click to jump order to this stage in real time"
                  className={`relative rounded-2xl border p-4 transition cursor-pointer ${
                    isCurrent
                      ? 'border-indigo-500 bg-indigo-500/15 shadow-lg shadow-indigo-500/15'
                      : isCompleted
                      ? 'border-emerald-500/40 bg-emerald-500/10'
                      : darkMode
                      ? 'border-white/[0.07] bg-slate-950/60 opacity-60 hover:opacity-100'
                      : 'border-slate-200 bg-slate-100/70 opacity-70 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono-num text-xs font-bold text-slate-400">
                      0{idx + 1}
                    </span>
                    {isCompleted ? (
                      <CheckCircle2
                        className={`h-4 w-4 ${
                          isCurrent ? 'text-indigo-400 animate-pulse' : 'text-emerald-400'
                        }`}
                      />
                    ) : (
                      <Clock className="h-4 w-4 text-slate-500" />
                    )}
                  </div>
                  <div className="font-display text-sm font-bold">{stage.label}</div>
                  <p className="mt-1 text-[11px] text-slate-400">{stage.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Order Items & Destination Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
            {/* Items (7 cols) */}
            <div className="lg:col-span-7 space-y-3">
              <h3 className="font-display text-sm font-bold uppercase tracking-wider text-slate-400">
                Hardware Manifest ({selectedOrder.items?.length || 0} Items)
              </h3>
              <div className="space-y-2.5">
                {(selectedOrder.items || []).map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between gap-4 rounded-2xl border p-3.5 ${
                      darkMode
                        ? 'border-white/[0.08] bg-slate-950/70'
                        : 'border-slate-200 bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <img
                        src={item.product_image || `/api/product-art/${item.product_id}.svg`}
                        alt={item.product_name}
                        className="h-14 w-18 rounded-xl object-cover bg-slate-900 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="font-mono-num text-[10px] font-bold text-indigo-400">
                          {item.product_sku}
                        </div>
                        <div className="text-xs font-bold truncate">{item.product_name}</div>
                        <div className="text-[11px] text-slate-400">
                          Finish: {item.selected_color} • Qty: {item.quantity}
                        </div>
                      </div>
                    </div>
                    <div className="font-mono-num text-xs font-bold shrink-0">
                      {formatPrice(item.line_total, currency)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery & Payment Telemetry (5 cols) */}
            <div
              className={`lg:col-span-5 rounded-2xl border p-5 space-y-4 ${
                darkMode
                  ? 'border-white/[0.08] bg-slate-950/75'
                  : 'border-slate-200 bg-slate-50'
              }`}
            >
              <h3 className="font-display text-sm font-bold uppercase tracking-wider text-slate-400">
                Courier & Billing Telemetry
              </h3>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Recipient:</span>
                  <span className="font-semibold">{selectedOrder.customer_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Address:</span>
                  <span className="font-semibold text-right">
                    {selectedOrder.shipping_address}, {selectedOrder.shipping_city},{' '}
                    {selectedOrder.shipping_country}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Courier Service:</span>
                  <span className="font-semibold text-cyan-400">
                    {selectedOrder.shipping_method}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Payment Method:</span>
                  <span className="font-mono-num">{selectedOrder.payment_method}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Estimated Delivery:</span>
                  <span className="font-mono-num text-emerald-400 font-semibold">
                    {selectedOrder.estimated_delivery}
                  </span>
                </div>
              </div>

              <div
                className={`border-t pt-3 space-y-1.5 text-xs ${
                  darkMode ? 'border-white/[0.08]' : 'border-slate-200'
                }`}
              >
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal</span>
                  <span className="font-mono-num">
                    {formatPrice(selectedOrder.subtotal, currency)}
                  </span>
                </div>
                {selectedOrder.discount_amount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Promo Discount ({selectedOrder.coupon_code})</span>
                    <span className="font-mono-num">
                      -{formatPrice(selectedOrder.discount_amount, currency)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-slate-400">
                  <span>Shipping & Tax</span>
                  <span className="font-mono-num">
                    {formatPrice(
                      (selectedOrder.shipping_cost || 0) + (selectedOrder.tax_amount || 0),
                      currency
                    )}
                  </span>
                </div>
                <div
                  className={`flex justify-between pt-2 border-t text-sm font-bold ${
                    darkMode ? 'border-white/[0.08]' : 'border-slate-200'
                  }`}
                >
                  <span>Total Paid</span>
                  <span className="font-mono-num text-base text-indigo-400">
                    {formatPrice(selectedOrder.total, currency)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
