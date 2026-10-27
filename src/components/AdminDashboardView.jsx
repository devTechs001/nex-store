import React, { useState } from 'react';
import {
  ShieldCheck,
  TrendingUp,
  Package,
  Plus,
  Flame,
  Tag,
  Truck,
  History,
  Trash2,
  DollarSign,
  Users,
  RefreshCw
} from 'lucide-react';
import { formatPrice, formatRelativeTime } from '../utils/currency.js';

export default function AdminDashboardView({
  products,
  categories,
  orders,
  coupons,
  inventoryLogs,
  activityEvents,
  analytics,
  presence,
  currency,
  darkMode,
  onQuickStockUpdate,
  onBulkRestockLow,
  onToggleFlashSale,
  onCreateProduct,
  onDeleteProduct,
  onAdvanceOrderStatus,
  onCreateCoupon,
  onToggleCoupon
}) {
  const [adminSection, setAdminSection] = useState('inventory'); // 'inventory' | 'orders' | 'coupons' | 'logs'
  const [showNewProductModal, setShowNewProductModal] = useState(false);
  const [restockingLow, setRestockingLow] = useState(false);

  // New Product Form State
  const [newProdName, setNewProdName] = useState('');
  const [newProdSku, setNewProdSku] = useState('NEX-LAB-099');
  const [newProdTagline, setNewProdTagline] = useState(
    'Modular CNC aluminum neural accelerator deck'
  );
  const [newProdCategory, setNewProdCategory] = useState('compute');
  const [newProdPrice, setNewProdPrice] = useState('399');
  const [newProdStock, setNewProdStock] = useState('20');
  const [newProdBadge, setNewProdBadge] = useState('NEW LAUNCH');
  const [newProdFlash, setNewProdFlash] = useState(true);

  // New Coupon Form State
  const [couponCode, setCouponCode] = useState('');
  const [couponDesc, setCouponDesc] = useState('');
  const [couponType, setCouponType] = useState('percentage');
  const [couponVal, setCouponVal] = useState('25');
  const [couponMin, setCouponMin] = useState('200');

  const handleCreateProductSubmit = async (e) => {
    e.preventDefault();
    if (!newProdName.trim()) return;
    await onCreateProduct({
      name: newProdName.trim(),
      sku: newProdSku.trim(),
      tagline: newProdTagline.trim(),
      category: newProdCategory,
      price: Number(newProdPrice) || 299,
      stock: Number(newProdStock) || 15,
      badge: newProdBadge.trim(),
      is_flash_sale: newProdFlash,
      featured: true
    });
    setNewProdName('');
    setShowNewProductModal(false);
  };

  const handleCreateCouponSubmit = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    await onCreateCoupon({
      code: couponCode.trim().toUpperCase(),
      description: couponDesc.trim() || 'Special VIP Hardware Discount',
      discount_type: couponType,
      discount_value: Number(couponVal) || 15,
      min_order_amount: Number(couponMin) || 0
    });
    setCouponCode('');
    setCouponDesc('');
  };

  const maxCatRevenue = Math.max(
    1,
    ...(analytics?.categoryBreakdown || []).map((c) => c.estimatedRevenue || 0)
  );

  const cardSurface = darkMode ? 'surface-card-dark' : 'surface-card-light';
  const inputSurface = darkMode
    ? 'border-white/[0.08] bg-slate-950 text-white placeholder-slate-500'
    : 'border-slate-300 bg-white text-slate-900 placeholder-slate-400';

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 space-y-6">
      {/* Top Admin Command Banner */}
      <div className={`flex flex-wrap items-center justify-between gap-4 rounded-3xl p-6 md:p-8 ${cardSurface}`}>
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/15 border border-indigo-500/30 px-3 py-0.5 font-mono-num text-xs font-bold text-indigo-400">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>REAL-TIME STORE OPERATIONS & INVENTORY COMMAND</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold">
            NEX Operations Command Center
          </h1>
          <p className={`text-xs sm:text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            Every stock adjustment, new product, order status update, and coupon change persists to SQLite and syncs across all connected clients immediately.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            disabled={restockingLow}
            onClick={async () => {
              setRestockingLow(true);
              await onBulkRestockLow?.();
              setRestockingLow(false);
            }}
            className="inline-flex items-center gap-2 rounded-2xl border border-emerald-500/40 bg-emerald-500/15 hover:bg-emerald-500/25 px-4 py-3 text-xs font-semibold text-emerald-400 transition cursor-pointer"
          >
            <RefreshCw className={`h-4 w-4 ${restockingLow ? 'animate-spin' : ''}`} />
            <span>Auto-Replenish Low Stock (+15)</span>
          </button>

          <button
            onClick={() => setShowNewProductModal(true)}
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 px-5 py-3 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 transition cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Launch New Hardware Product</span>
          </button>
        </div>
      </div>

      {/* 4 Live KPI Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`rounded-3xl p-5 ${cardSurface}`}>
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Gross Order Revenue</span>
            <DollarSign className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 font-mono-num text-2xl font-bold text-emerald-400">
            {formatPrice(analytics?.totalRevenue || 0, currency)}
          </div>
          <div className="mt-1 font-mono-num text-[11px] text-slate-400">
            {analytics?.totalOrders || 0} orders • Avg{' '}
            {formatPrice(analytics?.avgOrderValue || 0, currency)}
          </div>
        </div>

        <div className={`rounded-3xl p-5 ${cardSurface}`}>
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Warehouse Inventory</span>
            <Package className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="mt-2 font-mono-num text-2xl font-bold">
            {analytics?.totalUnitsInStock || 0}{' '}
            <span className="text-sm font-normal text-slate-400">units</span>
          </div>
          <div className="mt-1 flex items-center gap-2 font-mono-num text-[11px]">
            <span className="text-amber-400 font-semibold">
              {analytics?.lowStockCount || 0} low-stock alerts
            </span>
            <span>•</span>
            <span className="text-slate-400">{analytics?.totalProducts || 0} SKUs</span>
          </div>
        </div>

        <div className={`rounded-3xl p-5 ${cardSurface}`}>
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Units Deployed & Rating</span>
            <TrendingUp className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="mt-2 font-mono-num text-2xl font-bold text-cyan-400">
            {analytics?.totalUnitsSold || 0}{' '}
            <span className="text-sm font-normal text-slate-400">sold</span>
          </div>
          <div className="mt-1 font-mono-num text-[11px] text-slate-400">
            {analytics?.avgRating || 4.9}★ average across {analytics?.totalReviews || 0} reviews
          </div>
        </div>

        <div className={`rounded-3xl p-5 ${cardSurface}`}>
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Live WebSocket Presence</span>
            <Users className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-2 font-mono-num text-2xl font-bold text-amber-400">
            {presence?.activeShoppers || 21}{' '}
            <span className="text-sm font-normal text-slate-400">live</span>
          </div>
          <div className="mt-1 font-mono-num text-[11px] text-emerald-400">
            {presence?.connectedClients || 1} active WS socket(s) connected
          </div>
        </div>
      </div>

      {/* Category Revenue & Stock Telemetry Bar Chart */}
      <div className={`rounded-3xl p-5 ${cardSurface}`}>
        <h2 className="font-display text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">
          Category Revenue & Stock Telemetry
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(analytics?.categoryBreakdown || []).map((cat) => {
            const pct = Math.min(100, Math.round((cat.estimatedRevenue / maxCatRevenue) * 100));
            return (
              <div
                key={cat.category}
                className={`rounded-2xl border p-3.5 space-y-2 ${
                  darkMode
                    ? 'border-white/[0.08] bg-slate-950/60'
                    : 'border-slate-200 bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono-num uppercase font-bold text-indigo-400">
                    {cat.category}
                  </span>
                  <span className="font-mono-num font-bold">
                    {formatPrice(cat.estimatedRevenue, currency)}
                  </span>
                </div>
                <div
                  className={`h-2 w-full rounded-full overflow-hidden ${
                    darkMode ? 'bg-slate-800' : 'bg-slate-200'
                  }`}
                >
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="flex justify-between font-mono-num text-[11px] text-slate-400">
                  <span>{cat.productCount} SKUs</span>
                  <span>{cat.soldCount} sold</span>
                  <span className="text-emerald-400 font-semibold">{cat.stockCount} in stock</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section Sub-Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { id: 'inventory', label: `Product & Stock Control (${products.length})`, icon: Package },
          { id: 'orders', label: `Order Fulfillment Board (${orders.length})`, icon: Truck },
          { id: 'coupons', label: `Promo & Coupon Engine (${coupons.length})`, icon: Tag },
          {
            id: 'logs',
            label: `Live Inventory & Activity Logs (${inventoryLogs.length})`,
            icon: History
          }
        ].map((tab) => {
          const Icon = tab.icon;
          const active = adminSection === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setAdminSection(tab.id)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition cursor-pointer ${
                active
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-500/25'
                  : darkMode
                  ? 'bg-slate-900 border border-white/[0.08] text-slate-300 hover:text-white'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. Product & Stock Control Table */}
      {adminSection === 'inventory' && (
        <div className={`overflow-x-auto rounded-3xl ${cardSurface}`}>
          <table className="w-full text-left text-xs">
            <thead
              className={`border-b font-mono-num uppercase text-[11px] text-slate-400 ${
                darkMode
                  ? 'border-white/[0.08] bg-slate-950/60'
                  : 'border-slate-200 bg-slate-100/80'
              }`}
            >
              <tr>
                <th className="p-4">Hardware SKU & Model</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price</th>
                <th className="p-4">Live Stock (Real-Time Adjust)</th>
                <th className="p-4">Flash Deal</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody
              className={`divide-y ${
                darkMode ? 'divide-white/[0.06]' : 'divide-slate-200'
              }`}
            >
              {products.map((prod) => {
                const isLow = prod.stock <= prod.low_stock_threshold;
                return (
                  <tr
                    key={prod.id}
                    className={
                      darkMode ? 'hover:bg-slate-800/30' : 'hover:bg-slate-100/60'
                    }
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={prod.image_url}
                          alt={prod.name}
                          className="h-11 w-14 rounded-xl object-cover bg-slate-950 shrink-0"
                        />
                        <div>
                          <div className="font-mono-num text-[10px] font-bold text-indigo-400">
                            {prod.sku}
                          </div>
                          <div className="font-bold text-sm">{prod.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-mono-num uppercase text-slate-400">
                      {prod.category}
                    </td>
                    <td className="p-4 font-mono-num font-bold">
                      {formatPrice(prod.price, currency)}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex min-w-16 items-center justify-center rounded-lg px-2.5 py-1 font-mono-num text-xs font-bold ${
                            prod.stock === 0
                              ? 'bg-rose-500/20 text-rose-400'
                              : isLow
                              ? 'bg-amber-500/20 text-amber-400'
                              : 'bg-emerald-500/15 text-emerald-400'
                          }`}
                        >
                          {prod.stock} units
                        </span>

                        <button
                          onClick={() =>
                            onQuickStockUpdate(
                              prod.id,
                              Math.max(0, prod.stock - 1),
                              'Admin -1 Adjustment'
                            )
                          }
                          className={`rounded-lg border px-2 py-1 font-mono-num text-xs font-bold cursor-pointer ${
                            darkMode
                              ? 'border-white/[0.1] bg-slate-800 hover:bg-slate-700 text-slate-200'
                              : 'border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-800'
                          }`}
                        >
                          -1
                        </button>
                        <button
                          onClick={() =>
                            onQuickStockUpdate(
                              prod.id,
                              prod.stock + 1,
                              'Admin +1 Restock'
                            )
                          }
                          className={`rounded-lg border px-2 py-1 font-mono-num text-xs font-bold cursor-pointer ${
                            darkMode
                              ? 'border-white/[0.1] bg-slate-800 hover:bg-slate-700 text-slate-200'
                              : 'border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-800'
                          }`}
                        >
                          +1
                        </button>
                        <button
                          onClick={() =>
                            onQuickStockUpdate(
                              prod.id,
                              prod.stock + 10,
                              'Warehouse Batch +10 Restock'
                            )
                          }
                          className="rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 px-2.5 py-1 font-mono-num text-xs font-bold text-emerald-400 cursor-pointer"
                        >
                          +10 Restock
                        </button>
                      </div>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => onToggleFlashSale(prod.id, !prod.is_flash_sale)}
                        className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 font-mono-num text-[11px] font-semibold transition cursor-pointer ${
                          prod.is_flash_sale
                            ? 'border-amber-500/50 bg-amber-500/20 text-amber-400'
                            : darkMode
                            ? 'border-white/[0.08] bg-slate-950 text-slate-400 hover:text-white'
                            : 'border-slate-200 bg-slate-100 text-slate-600'
                        }`}
                      >
                        <Flame className="h-3.5 w-3.5" />
                        <span>{prod.is_flash_sale ? 'ACTIVE' : 'OFF'}</span>
                      </button>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => onDeleteProduct(prod.id)}
                        className={`rounded-lg border p-2 text-slate-400 hover:border-rose-500/40 hover:text-rose-400 cursor-pointer ${
                          darkMode ? 'border-white/[0.08]' : 'border-slate-200'
                        }`}
                        title="Delete Product"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* 2. Order Fulfillment Board */}
      {adminSection === 'orders' && (
        <div className="space-y-3">
          {orders.map((ord) => (
            <div
              key={ord.id}
              className={`flex flex-wrap items-center justify-between gap-4 rounded-3xl p-4 ${cardSurface}`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono-num text-sm font-bold text-indigo-400">
                    #{ord.order_number}
                  </span>
                  <span className="font-bold text-sm">{ord.customer_name}</span>
                  <span className="text-xs text-slate-400">
                    ({ord.shipping_city}, {ord.shipping_country})
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  {(ord.items || []).map((i) => `${i.quantity}x ${i.product_name}`).join(' • ')}
                </p>
                <p className="font-mono-num text-[11px] text-slate-400">
                  Tracking: {ord.tracking_number} • Payment: {ord.payment_method}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="text-right mr-2">
                  <div className="font-mono-num text-sm font-bold text-emerald-400">
                    {formatPrice(ord.total, currency)}
                  </div>
                  <div className="font-mono-num text-[10px] text-slate-400">
                    {formatRelativeTime(ord.updated_at)}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  {['placed', 'processing', 'packed', 'shipped', 'delivered', 'cancelled'].map(
                    (st) => (
                      <button
                        key={st}
                        onClick={() => onAdvanceOrderStatus(ord.id, st)}
                        className={`rounded-lg px-2.5 py-1.5 font-mono-num text-[10px] font-bold uppercase transition cursor-pointer ${
                          ord.status === st
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : darkMode
                            ? 'bg-slate-950 border border-white/[0.08] text-slate-400 hover:text-white'
                            : 'bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {st}
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3. Promo & Coupon Engine */}
      {adminSection === 'coupons' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-3">
            {coupons.map((c) => (
              <div
                key={c.id}
                className={`flex items-center justify-between rounded-3xl p-4 ${cardSurface}`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono-num text-sm font-bold text-indigo-400">
                      {c.code}
                    </span>
                    <span className="rounded bg-emerald-500/15 px-2 py-0.5 font-mono-num text-[10px] font-bold text-emerald-400">
                      {c.discount_type === 'percentage'
                        ? `${c.discount_value}% OFF`
                        : `$${c.discount_value} OFF`}
                    </span>
                    <span className="font-mono-num text-[11px] text-slate-400">
                      Min Order: ${c.min_order_amount}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{c.description}</p>
                  <p className="font-mono-num text-[11px] text-slate-400">
                    Used {c.used_count} / {c.max_uses} times
                  </p>
                </div>

                <button
                  onClick={() => onToggleCoupon(c.id)}
                  className={`rounded-xl px-3.5 py-2 font-mono-num text-xs font-bold cursor-pointer ${
                    c.active
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-slate-500/15 text-slate-400'
                  }`}
                >
                  {c.active ? 'ACTIVE ✓' : 'DISABLED'}
                </button>
              </div>
            ))}
          </div>

          <form
            onSubmit={handleCreateCouponSubmit}
            className={`lg:col-span-5 rounded-3xl p-5 space-y-3.5 ${cardSurface}`}
          >
            <h3 className="font-display text-base font-bold">Create New Promo Code in SQLite</h3>
            <div>
              <label className="block text-[11px] uppercase font-mono-num text-slate-400 mb-1">
                Promo Code
              </label>
              <input
                type="text"
                required
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="e.g. NAIROBI30"
                className={`w-full rounded-xl border px-3.5 py-2 font-mono-num text-xs uppercase ${inputSurface}`}
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase font-mono-num text-slate-400 mb-1">
                Description
              </label>
              <input
                type="text"
                required
                value={couponDesc}
                onChange={(e) => setCouponDesc(e.target.value)}
                placeholder="30% VIP flash discount"
                className={`w-full rounded-xl border px-3.5 py-2 text-xs ${inputSurface}`}
              />
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <label className="block text-[11px] uppercase font-mono-num text-slate-400 mb-1">
                  Type
                </label>
                <select
                  value={couponType}
                  onChange={(e) => setCouponType(e.target.value)}
                  className={`w-full rounded-xl border px-2.5 py-2 text-xs ${inputSurface}`}
                >
                  <option value="percentage">% Off</option>
                  <option value="fixed">$ Fixed</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] uppercase font-mono-num text-slate-400 mb-1">
                  Value
                </label>
                <input
                  type="number"
                  required
                  value={couponVal}
                  onChange={(e) => setCouponVal(e.target.value)}
                  className={`w-full rounded-xl border px-3 py-2 font-mono-num text-xs ${inputSurface}`}
                />
              </div>
              <div>
                <label className="block text-[11px] uppercase font-mono-num text-slate-400 mb-1">
                  Min Order ($)
                </label>
                <input
                  type="number"
                  value={couponMin}
                  onChange={(e) => setCouponMin(e.target.value)}
                  className={`w-full rounded-xl border px-3 py-2 font-mono-num text-xs ${inputSurface}`}
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 py-2.5 text-xs font-semibold text-white cursor-pointer"
            >
              Save Coupon to SQLite & Broadcast
            </button>
          </form>
        </div>
      )}

      {/* 4. Live Inventory Audit Logs & Real-Time Events */}
      {adminSection === 'logs' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className={`rounded-3xl p-5 space-y-3 ${cardSurface}`}>
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-slate-400">
              SQLite Inventory Audit Ledger (`inventory_logs`)
            </h3>
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {inventoryLogs.map((log) => (
                <div
                  key={log.id}
                  className={`flex items-center justify-between rounded-2xl border p-3 text-xs ${
                    darkMode
                      ? 'border-white/[0.08] bg-slate-950/70'
                      : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <div>
                    <div className="font-bold">{log.product_name}</div>
                    <div className="text-[11px] text-slate-400">
                      {log.reason} • by {log.actor}
                    </div>
                  </div>
                  <div className="text-right font-mono-num">
                    <span
                      className={`font-bold ${
                        log.change_amount >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {log.change_amount >= 0 ? `+${log.change_amount}` : log.change_amount}
                    </span>
                    <div className="text-[10px] text-slate-400">
                      {log.previous_stock} → {log.new_stock} units
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={`rounded-3xl p-5 space-y-3 ${cardSurface}`}>
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-slate-400">
              Real-Time Event Stream (`activity_events`)
            </h3>
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {activityEvents.map((ev) => (
                <div
                  key={ev.id}
                  className={`rounded-2xl border p-3 text-xs space-y-1 ${
                    darkMode
                      ? 'border-white/[0.08] bg-slate-950/70'
                      : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-400">{ev.title}</span>
                    <span className="font-mono-num text-[10px] text-slate-400">
                      {formatRelativeTime(ev.created_at)}
                    </span>
                  </div>
                  <p className={darkMode ? 'text-slate-300' : 'text-slate-600'}>{ev.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Launch New Hardware Product Modal */}
      {showNewProductModal && (
        <div
          onClick={() => setShowNewProductModal(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4"
        >
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleCreateProductSubmit}
            className={`w-full max-w-lg rounded-3xl border p-6 space-y-4 shadow-2xl ${
              darkMode
                ? 'border-white/[0.1] bg-slate-900 text-slate-100'
                : 'border-slate-200 bg-white text-slate-900'
            }`}
          >
            <div
              className={`flex items-center justify-between border-b pb-3 ${
                darkMode ? 'border-white/[0.08]' : 'border-slate-200'
              }`}
            >
              <h3 className="font-display text-lg font-bold">
                Launch New Hardware Product (SQLite + WS)
              </h3>
              <button
                type="button"
                onClick={() => setShowNewProductModal(false)}
                className="text-xs text-slate-400 hover:text-indigo-400 cursor-pointer"
              >
                Close ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-[11px] uppercase font-mono-num text-slate-400 mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  required
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  placeholder="e.g. QuantumCore Neural Dock X2"
                  className={`w-full rounded-xl border px-3.5 py-2 text-xs ${inputSurface}`}
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase font-mono-num text-slate-400 mb-1">
                  SKU Code
                </label>
                <input
                  type="text"
                  required
                  value={newProdSku}
                  onChange={(e) => setNewProdSku(e.target.value.toUpperCase())}
                  className={`w-full rounded-xl border px-3.5 py-2 font-mono-num text-xs ${inputSurface}`}
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase font-mono-num text-slate-400 mb-1">
                  Category
                </label>
                <select
                  value={newProdCategory}
                  onChange={(e) => setNewProdCategory(e.target.value)}
                  className={`w-full rounded-xl border px-3.5 py-2 text-xs ${inputSurface}`}
                >
                  {categories.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] uppercase font-mono-num text-slate-400 mb-1">
                  Price (USD $)
                </label>
                <input
                  type="number"
                  required
                  value={newProdPrice}
                  onChange={(e) => setNewProdPrice(e.target.value)}
                  className={`w-full rounded-xl border px-3.5 py-2 font-mono-num text-xs ${inputSurface}`}
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase font-mono-num text-slate-400 mb-1">
                  Initial Stock
                </label>
                <input
                  type="number"
                  required
                  value={newProdStock}
                  onChange={(e) => setNewProdStock(e.target.value)}
                  className={`w-full rounded-xl border px-3.5 py-2 font-mono-num text-xs ${inputSurface}`}
                />
              </div>

              <div className="col-span-2">
                <label className="block text-[11px] uppercase font-mono-num text-slate-400 mb-1">
                  Engineering Tagline
                </label>
                <input
                  type="text"
                  value={newProdTagline}
                  onChange={(e) => setNewProdTagline(e.target.value)}
                  className={`w-full rounded-xl border px-3.5 py-2 text-xs ${inputSurface}`}
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase font-mono-num text-slate-400 mb-1">
                  Highlight Badge
                </label>
                <input
                  type="text"
                  value={newProdBadge}
                  onChange={(e) => setNewProdBadge(e.target.value.toUpperCase())}
                  className={`w-full rounded-xl border px-3.5 py-2 font-mono-num text-xs ${inputSurface}`}
                />
              </div>

              <div className="flex items-center pt-5">
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newProdFlash}
                    onChange={(e) => setNewProdFlash(e.target.checked)}
                    className="accent-indigo-500"
                  />
                  <span>Activate Flash Sale</span>
                </label>
              </div>
            </div>

            <div
              className={`flex justify-end gap-2 pt-3 border-t ${
                darkMode ? 'border-white/[0.08]' : 'border-slate-200'
              }`}
            >
              <button
                type="button"
                onClick={() => setShowNewProductModal(false)}
                className="rounded-xl border border-slate-500/40 px-4 py-2 text-xs text-slate-400 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-indigo-600 hover:bg-indigo-500 px-5 py-2 text-xs font-semibold text-white cursor-pointer"
              >
                Insert into SQLite & Broadcast Live
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
