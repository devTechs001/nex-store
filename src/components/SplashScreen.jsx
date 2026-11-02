import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Database,
  Server,
  ShieldCheck,
  Cpu,
  ArrowRight,
  Lock,
  CheckCircle2,
  Pause,
  Play,
  RotateCcw,
  Image as ImageIcon,
  Globe
} from 'lucide-react';
import { getProductArtUrl } from '../utils/storeEngine.js';

const BACKGROUND_PRESETS = [
  {
    id: 'quantum-horizon',
    label: 'Quantum Horizon Grid',
    url: '/splash-bg.svg'
  },
  {
    id: 'cad-blueprint',
    label: 'Aether Pro CAD Blueprint',
    url: getProductArtUrl('prod-aether-pro', { view: 'blueprint' })
  },
  {
    id: 'titanium-core',
    label: 'Chronos Titanium Schematic',
    url: getProductArtUrl('prod-chronos-key', { view: 'detail' })
  }
];

const BOOT_STAGES = [
  {
    pct: 20,
    label: 'Mounting 28-Table SQLite 3 WAL Relational Engine...',
    detail: 'products • apps • user_accounts • hosting_deployments • payment_transactions',
    icon: Database,
    badge: 'SQLITE-WAL'
  },
  {
    pct: 44,
    label: 'Connecting MongoDB Atlas BSON Document Cluster (ReplicaSet M30)...',
    detail: 'mongodb+srv://cluster0.nexstore.mongodb.net/nex_store • 12 BSON Collections Synced',
    icon: Globe,
    badge: 'MONGODB-ATLAS'
  },
  {
    pct: 68,
    label: 'Synchronizing 6-Region Global Anycast Edge & Render/Netlify CDN...',
    detail: 'Nairobi (8ms) • Frankfurt • London • Ashburn • Tokyo • San Jose',
    icon: Server,
    badge: 'EDGE-CDN'
  },
  {
    pct: 88,
    label: 'Initializing 4-Angle Procedural CAD & Polyglot AI Studio...',
    detail: 'Python 3.12 • Rust 1.82 • C++23 SIMD • Java 21 • Go • TypeScript',
    icon: Cpu,
    badge: 'POLYGLOT-AI'
  },
  {
    pct: 100,
    label: 'Verifying Browser Icon, SHA-256 Sandbox & Anti-Piracy DRM Lock...',
    detail: '© 2026 NEX STORE & DEVTECHS001 LABS — STRICTLY PROPRIETARY',
    icon: ShieldCheck,
    badge: 'DRM-LOCKED'
  }
];

export default function SplashScreen({ onComplete }) {
  const [progress, setProgress] = useState(14);
  const [stageIndex, setStageIndex] = useState(0);
  const [exiting, setExiting] = useState(false);
  const [paused, setPaused] = useState(false);
  const [bgPreset, setBgPreset] = useState(BACKGROUND_PRESETS[0]);
  const [packetsLoaded, setPacketsLoaded] = useState(1420);
  const [bsonDocsSynced, setBsonDocsSynced] = useState(48);

  // Dynamically update Browser Tab Title & Browser Favicon during boot sequence
  useEffect(() => {
    const prevTitle = document.title;
    if (progress < 100) {
      document.title = `[${progress}%] Booting NEX STORE // MongoDB + SQLite OS`;
    } else {
      document.title = 'NEX STORE // Next-Gen Hardware Commerce, MongoDB + SQLite & Polyglot AI';
    }
    const fav = document.getElementById('nex-dynamic-favicon');
    if (fav && fav.getAttribute('href') !== '/favicon.svg') {
      fav.setAttribute('href', '/favicon.svg');
    }
    return () => {
      document.title = prevTitle;
    };
  }, [progress]);

  // Live telemetry ticker animation
  useEffect(() => {
    const interval = setInterval(() => {
      setPacketsLoaded((p) => p + Math.floor(110 + Math.random() * 190));
      setBsonDocsSynced((d) => Math.min(284, d + Math.floor(12 + Math.random() * 24)));
    }, 180);
    return () => clearInterval(interval);
  }, []);

  // Multi-stage animated loading timeline
  useEffect(() => {
    if (paused) return undefined;

    const t1 = setTimeout(() => {
      setProgress(38);
      setStageIndex(1);
    }, 320);
    const t2 = setTimeout(() => {
      setProgress(66);
      setStageIndex(2);
    }, 680);
    const t3 = setTimeout(() => {
      setProgress(88);
      setStageIndex(3);
    }, 1050);
    const t4 = setTimeout(() => {
      setProgress(100);
      setStageIndex(4);
    }, 1420);
    const t5 = setTimeout(() => {
      setExiting(true);
    }, 1850);
    const t6 = setTimeout(() => {
      onComplete?.();
    }, 2120);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      clearTimeout(t6);
    };
  }, [onComplete, paused]);

  const handleSkip = () => {
    setExiting(true);
    setTimeout(() => {
      onComplete?.();
    }, 160);
  };

  const handleReplay = () => {
    setPaused(false);
    setExiting(false);
    setProgress(14);
    setStageIndex(0);
    setPacketsLoaded(1024);
    setBsonDocsSynced(24);
  };

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#030611] text-slate-100 px-4 select-none overflow-hidden transition-opacity duration-300 ${
        exiting ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Animated Full-Bleed Background Artwork Image Layer */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-65 animate-splash-bg pointer-events-none"
        style={{
          backgroundImage: `url('${bgPreset.url}')`
        }}
      />

      {/* Deep Vignette + Radial Quantum Illumination Overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 50% 45%, rgba(15, 23, 42, 0.35) 0%, rgba(3, 6, 17, 0.88) 78%), radial-gradient(at 20% 15%, rgba(99, 102, 241, 0.28) 0px, transparent 50%), radial-gradient(at 80% 85%, rgba(6, 182, 212, 0.24) 0px, transparent 50%)'
        }}
      />

      {/* Sweeping Laser Scanline Animation */}
      <div
        className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400/80 to-transparent shadow-[0_0_20px_rgba(34,211,238,0.9)] animate-scanline pointer-events-none"
      />

      <div className="relative z-10 w-full max-w-2xl rounded-3xl border border-indigo-500/40 bg-slate-950/85 backdrop-blur-2xl p-5 sm:p-7 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.9)] space-y-5">
        {/* Top Brand, Animated Browser Icon & Controls Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            {/* Dual Orbital Animated Browser Icon Core */}
            <div className="relative flex h-16 w-16 items-center justify-center shrink-0">
              <div className="absolute inset-0 rounded-full border-2 border-dashed border-indigo-400/60 animate-orbit-cw" />
              <div className="absolute inset-1.5 rounded-full border border-cyan-400/50 animate-orbit-ccw" />
              <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900/90 border border-cyan-400/50 shadow-lg shadow-indigo-500/40 overflow-hidden">
                <img
                  src="/favicon.svg"
                  alt="NEX Browser Icon"
                  className="h-10 w-10 object-contain"
                />
              </div>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-display text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                  NEX STORE
                </span>
                <span className="rounded-md bg-indigo-500/20 border border-indigo-500/40 px-2 py-0.5 font-mono-num text-[10px] font-bold text-indigo-300">
                  GEN-5 QUANTUM OS
                </span>
                <span className="rounded-md bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 font-mono-num text-[10px] font-bold text-emerald-300">
                  SQLITE + MONGODB
                </span>
              </div>
              <p className="font-mono-num text-xs text-cyan-400 mt-0.5">
                Dual-Engine SQLite WAL + MongoDB Atlas • 4-Angle CAD • App Sandbox
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setPaused((p) => !p)}
              title={paused ? 'Resume Boot Sequence' : 'Pause Splash Screen to Inspect'}
              className="inline-flex items-center gap-1 rounded-xl border border-slate-700/80 bg-slate-900/80 hover:border-cyan-400/50 px-2.5 py-1.5 font-mono-num text-[11px] font-semibold text-slate-200 transition cursor-pointer"
            >
              {paused ? <Play className="h-3.5 w-3.5 text-emerald-400" /> : <Pause className="h-3.5 w-3.5 text-amber-400" />}
              {paused ? 'Resume' : 'Hold'}
            </button>
            <button
              type="button"
              onClick={handleReplay}
              title="Replay Boot Animation"
              className="inline-flex items-center gap-1 rounded-xl border border-slate-700/80 bg-slate-900/80 hover:border-indigo-400/50 px-2.5 py-1.5 font-mono-num text-[11px] font-semibold text-slate-200 transition cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5 text-indigo-400" />
            </button>
            <button
              type="button"
              onClick={handleSkip}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 px-3.5 py-1.5 font-mono-num text-xs font-bold text-white shadow-md shadow-indigo-500/25 transition cursor-pointer"
            >
              Enter Store <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Background Artwork Switcher Strip */}
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-800/90 bg-slate-900/75 px-3.5 py-2 text-[11px]">
          <div className="flex items-center gap-2 font-mono-num text-slate-300">
            <ImageIcon className="h-3.5 w-3.5 text-cyan-400" />
            <span>Splash Background Artwork:</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {BACKGROUND_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  setBgPreset(preset);
                  setPaused(true);
                }}
                className={`rounded-lg px-2.5 py-1 font-mono-num text-[10px] font-bold transition cursor-pointer ${
                  bgPreset.id === preset.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800/90 text-slate-300 hover:text-white'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Live Telemetry Counters Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="rounded-2xl border border-slate-800/90 bg-slate-900/70 px-3 py-2">
            <div className="font-mono-num text-[10px] uppercase text-slate-400">SQLite WAL Tables</div>
            <div className="font-mono-num text-sm font-extrabold text-indigo-400">28 / 28 Mounted</div>
          </div>
          <div className="rounded-2xl border border-slate-800/90 bg-slate-900/70 px-3 py-2">
            <div className="font-mono-num text-[10px] uppercase text-slate-400">MongoDB Atlas Docs</div>
            <div className="font-mono-num text-sm font-extrabold text-emerald-400">{bsonDocsSynced} BSON Synced</div>
          </div>
          <div className="rounded-2xl border border-slate-800/90 bg-slate-900/70 px-3 py-2">
            <div className="font-mono-num text-[10px] uppercase text-slate-400">Telemetry Stream</div>
            <div className="font-mono-num text-sm font-extrabold text-cyan-400">{packetsLoaded.toLocaleString()} pkts/s</div>
          </div>
          <div className="rounded-2xl border border-slate-800/90 bg-slate-900/70 px-3 py-2">
            <div className="font-mono-num text-[10px] uppercase text-slate-400">Browser Favicon</div>
            <div className="font-mono-num text-sm font-extrabold text-amber-400 flex items-center gap-1.5">
              <img src="/favicon.svg" alt="" className="h-3.5 w-3.5" /> /favicon.svg
            </div>
          </div>
        </div>

        {/* Animated Shimmer Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between font-mono-num text-xs">
            <span className="text-cyan-300 font-semibold flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              {BOOT_STAGES[stageIndex]?.label}
            </span>
            <span className="font-bold text-emerald-400">{progress}%</span>
          </div>
          <div className="h-3 w-full rounded-full bg-slate-900 overflow-hidden border border-slate-800 p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 animate-shimmer-bar transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="font-mono-num text-[11px] text-slate-400">
            {BOOT_STAGES[stageIndex]?.detail}
          </div>
        </div>

        {/* 5-Stage Boot Checklist */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          {BOOT_STAGES.map((stage, idx) => {
            const Icon = stage.icon;
            const done = idx <= stageIndex;
            return (
              <div
                key={stage.label}
                className={`flex items-center gap-2.5 rounded-2xl border px-3 py-2 text-xs transition ${
                  done
                    ? 'border-emerald-500/35 bg-emerald-500/10 text-emerald-200'
                    : 'border-slate-800 bg-slate-900/40 text-slate-500'
                }`}
              >
                {done ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                ) : (
                  <Icon className="h-4 w-4 text-slate-500 shrink-0" />
                )}
                <div className="truncate flex-1">
                  <span className="font-medium">{stage.label.replace('...', '')}</span>
                </div>
                <span className="rounded bg-slate-950/70 px-1.5 py-0.5 font-mono-num text-[9px] font-bold text-cyan-300 shrink-0">
                  {stage.badge}
                </span>
              </div>
            );
          })}
        </div>

        {/* Strict Copyright & Anti-Piracy Notice */}
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-3.5 py-2.5 flex items-center gap-2.5 text-[11px] text-amber-200">
          <Lock className="h-4 w-4 text-amber-400 shrink-0" />
          <div className="font-mono-num leading-relaxed">
            <strong>COPYRIGHT &amp; ANTI-PIRACY DRM NOTICE:</strong> Strictly proprietary software by{' '}
            <strong>devTechs001 / NEX Store Labs</strong>. Never share, redistribute, or pirate this code.
          </div>
        </div>
      </div>
    </div>
  );
}
