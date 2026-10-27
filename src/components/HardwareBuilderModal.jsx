import React, { useState, useMemo } from 'react';
import {
  Cpu,
  Headphones,
  Keyboard,
  Eye,
  BatteryCharging,
  Sparkles,
  CheckCircle2,
  ShoppingBag,
  X,
  Sliders,
  Zap,
  ShieldCheck
} from 'lucide-react';
import { formatPrice } from '../utils/currency.js';
import { getProductArtUrl } from '../utils/storeEngine.js';

const BUILD_SLOTS = [
  { id: 'compute', label: '1. Compute Core', category: 'compute', icon: Cpu },
  { id: 'audio', label: '2. Studio Audio', category: 'audio', icon: Headphones },
  { id: 'peripherals', label: '3. Precision Input', category: 'peripherals', icon: Keyboard },
  { id: 'wearables', label: '4. Spatial & Optics', category: ['wearables', 'cameras'], icon: Eye },
  { id: 'power', label: '5. GaN & UPS Power', category: 'power', icon: BatteryCharging }
];

const FINISH_OPTIONS = [
  { id: 'obsidian', name: 'Obsidian Titanium', hex: '#312e81' },
  { id: 'cyber', name: 'Cyber Neon Cyan', hex: '#06b6d4' },
  { id: 'lunar', name: 'Lunar Alabaster', hex: '#94a3b8' },
  { id: 'emerald', name: 'Emerald Anodized', hex: '#10b981' }
];

export default function HardwareBuilderModal({
  isOpen,
  onClose,
  products = [],
  currency,
  onAddRigToCart,
  onPlaySound
}) {
  const [selectedBySlot, setSelectedBySlot] = useState({});
  const [selectedFinish, setSelectedFinish] = useState(FINISH_OPTIONS[0]);
  const [engraving, setEngraving] = useState('NEX-LABS // 001');
  const [calibrationTier, setCalibrationTier] = useState('standard');

  const slotOptions = useMemo(() => {
    const map = {};
    for (const slot of BUILD_SLOTS) {
      map[slot.id] = products.filter((p) =>
        Array.isArray(slot.category)
          ? slot.category.includes(p.category)
          : p.category === slot.category
      );
    }
    return map;
  }, [products]);

  const activeSelection = useMemo(() => {
    const result = {};
    for (const slot of BUILD_SLOTS) {
      const opts = slotOptions[slot.id] || [];
      const chosenId = selectedBySlot[slot.id];
      if (chosenId === 'none') {
        result[slot.id] = null;
      } else {
        result[slot.id] = opts.find((p) => p.id === chosenId) || opts[0] || null;
      }
    }
    return result;
  }, [slotOptions, selectedBySlot]);

  if (!isOpen) return null;

  const chosenProducts = Object.values(activeSelection).filter(Boolean);
  const rawSubtotal = chosenProducts.reduce((s, p) => s + (p.price || 0), 0);
  const calibrationCost = calibrationTier === 'liquid' ? 49 : calibrationTier === 'raid' ? 149 : 0;
  const bundleDiscountRate = chosenProducts.length >= 3 ? 0.12 : 0.05;
  const discountAmount = Math.round(rawSubtotal * bundleDiscountRate);
  const finalRigPrice = Math.max(0, rawSubtotal - discountAmount + calibrationCost);
  const estimatedWatts = chosenProducts.length * 42 + (activeSelection.compute ? 95 : 0);

  const handleDeployRig = () => {
    if (chosenProducts.length === 0) return;
    onPlaySound?.('success');
    onAddRigToCart?.(
      chosenProducts,
      `${selectedFinish.name}${engraving.trim() ? ` • Engraved: ${engraving.trim()}` : ''}`
    );
    onClose();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-3 sm:p-6 overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-6xl rounded-3xl p-5 sm:p-7 space-y-6 shadow-2xl theme-card my-auto max-h-[92vh] overflow-y-auto"
      >
        {/* Modal Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/15 border border-indigo-500/35 px-3 py-0.5 font-mono-num text-[11px] font-bold text-indigo-400">
              <Sliders className="h-3.5 w-3.5" />
              <span>CUSTOM HARDWARE BUILD-TO-ORDER (BTO) STUDIO</span>
            </div>
            <h2 className="font-display text-xl sm:text-2xl font-bold">
              Configure Your Custom NEX Engineering Rig (-12% Bundle Savings)
            </h2>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 theme-subtle cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Columns: 5 Hardware Slots */}
          <div className="lg:col-span-2 space-y-3.5">
            {BUILD_SLOTS.map((slot) => {
              const Icon = slot.icon;
              const options = slotOptions[slot.id] || [];
              const current = activeSelection[slot.id];

              return (
                <div
                  key={slot.id}
                  className="rounded-2xl p-4 theme-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    {current ? (
                      <img
                        src={getProductArtUrl(current, {
                          view: 'hero',
                          color: selectedFinish.hex
                        })}
                        alt={current.name}
                        className="h-14 w-18 rounded-xl object-cover bg-slate-950 border border-white/10 shrink-0"
                      />
                    ) : (
                      <div className="flex h-14 w-18 items-center justify-center rounded-xl bg-slate-900 border border-white/10 text-slate-400 shrink-0">
                        <Icon className="h-5 w-5" />
                      </div>
                    )}

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 font-mono-num text-[10px] font-bold uppercase text-cyan-400">
                        <Icon className="h-3 w-3" />
                        <span>{slot.label}</span>
                      </div>
                      <div className="font-display text-sm font-bold truncate">
                        {current ? current.name : 'Slot Skipped (Optional)'}
                      </div>
                      <div className="font-mono-num text-xs text-indigo-400 font-bold">
                        {current ? formatPrice(current.price, currency) : '$0.00'}
                      </div>
                    </div>
                  </div>

                  <select
                    value={current?.id || 'none'}
                    onChange={(e) => {
                      onPlaySound?.('click');
                      setSelectedBySlot((prev) => ({
                        ...prev,
                        [slot.id]: e.target.value
                      }));
                    }}
                    className="rounded-xl px-3 py-2 text-xs font-semibold theme-input sm:w-64 cursor-pointer"
                  >
                    {options.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.name} ({formatPrice(opt.price, currency)})
                      </option>
                    ))}
                    <option value="none">— Skip this slot —</option>
                  </select>
                </div>
              );
            })}
          </div>

          {/* Right Column: Finish, Laser Engraving, Telemetry & Summary */}
          <div className="rounded-3xl p-5 theme-subtle flex flex-col justify-between space-y-5">
            <div className="space-y-4">
              <h3 className="font-display text-base font-bold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-cyan-400" />
                <span>CNC Finish & Telemetry</span>
              </h3>

              {/* Anodized Finish Picker */}
              <div>
                <label className="block font-mono-num text-[10px] uppercase theme-text-muted mb-1.5">
                  Chassis Anodization Colorway
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {FINISH_OPTIONS.map((fin) => {
                    const active = selectedFinish.id === fin.id;
                    return (
                      <button
                        key={fin.id}
                        type="button"
                        onClick={() => {
                          onPlaySound?.('click');
                          setSelectedFinish(fin);
                        }}
                        className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition cursor-pointer ${
                          active
                            ? 'border-indigo-500 bg-indigo-500/15 text-indigo-400'
                            : 'border-white/[0.08] hover:border-indigo-400/40'
                        }`}
                      >
                        <span
                          className="h-3.5 w-3.5 rounded-full border border-white/30 shrink-0"
                          style={{ backgroundColor: fin.hex }}
                        />
                        <span className="truncate">{fin.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Laser Engraving */}
              <div>
                <label className="block font-mono-num text-[10px] uppercase theme-text-muted mb-1">
                  Free CNC Laser Engraving (Max 24 Chars)
                </label>
                <input
                  type="text"
                  maxLength={24}
                  value={engraving}
                  onChange={(e) => setEngraving(e.target.value.toUpperCase())}
                  placeholder="NEX-LABS // 001"
                  className="w-full rounded-xl px-3.5 py-2 font-mono-num text-xs theme-input"
                />
              </div>

              {/* Factory Calibration Tier */}
              <div>
                <label className="block font-mono-num text-[10px] uppercase theme-text-muted mb-1">
                  Factory Thermal & Storage Tuning
                </label>
                <select
                  value={calibrationTier}
                  onChange={(e) => setCalibrationTier(e.target.value)}
                  className="w-full rounded-xl px-3 py-2 text-xs theme-input cursor-pointer"
                >
                  <option value="standard">Standard Factory QA Calibration (+$0)</option>
                  <option value="liquid">Liquid-Metal Thermal + Audio Curve (+$49)</option>
                  <option value="raid">Pro 8TB NVMe RAID + Zero-Dead-Pixel (+$149)</option>
                </select>
              </div>

              {/* Live Compatibility & Power Telemetry */}
              <div className="rounded-2xl p-3.5 theme-card space-y-2 font-mono-num text-xs">
                <div className="flex items-center justify-between">
                  <span className="theme-text-muted">Compatibility Check:</span>
                  <span className="text-emerald-400 font-bold inline-flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5" /> 100% Verified
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="theme-text-muted">Estimated Peak Load:</span>
                  <span className="text-cyan-400 font-bold">{estimatedWatts}W USB-PD 3.1</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="theme-text-muted">Selected Modules:</span>
                  <span className="font-bold">{chosenProducts.length} / 5 Slots</span>
                </div>
              </div>
            </div>

            {/* Pricing Breakdown & Deploy Button */}
            <div className="space-y-3 pt-3 border-t border-white/[0.08]">
              <div className="space-y-1 text-xs">
                <div className="flex justify-between theme-text-muted">
                  <span>Hardware Subtotal ({chosenProducts.length} items)</span>
                  <span className="font-mono-num">{formatPrice(rawSubtotal, currency)}</span>
                </div>
                <div className="flex justify-between text-emerald-400 font-semibold">
                  <span>BTO Rig Bundle Discount (-{Math.round(bundleDiscountRate * 100)}%)</span>
                  <span className="font-mono-num">-{formatPrice(discountAmount, currency)}</span>
                </div>
                {calibrationCost > 0 && (
                  <div className="flex justify-between theme-text-muted">
                    <span>Factory Calibration Upgrade</span>
                    <span className="font-mono-num">+{formatPrice(calibrationCost, currency)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold pt-1">
                  <span>Custom Rig Total</span>
                  <span className="font-mono-num text-indigo-400">
                    {formatPrice(finalRigPrice, currency)}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleDeployRig}
                disabled={chosenProducts.length === 0}
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 py-3 text-xs font-bold text-white shadow-lg cursor-pointer"
              >
                <ShoppingBag className="h-4 w-4" />
                <span>Add Complete Custom Rig ({chosenProducts.length} SKUs) to Cart</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
