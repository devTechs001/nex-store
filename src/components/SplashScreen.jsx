import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Database,
  Server,
  ShieldCheck,
  Cpu,
  ArrowRight,
  Lock,
  CheckCircle2
} from 'lucide-react';

const BOOT_STAGES = [
  {
    pct: 25,
    label: 'Mounting 23-Table SQLite 3 WAL Relational Engine...',
    detail: 'products • apps • polyglot_automations • subscription_plans • mobile_addons',
    icon: Database
  },
  {
    pct: 55,
    label: 'Synchronizing 6-Region Global Anycast Edge Cluster...',
    detail: 'Nairobi (8ms) • London • Frankfurt • Ashburn • Tokyo • San Jose',
    icon: Server
  },
  {
    pct: 82,
    label: 'Initializing 4-Angle Procedural CAD & Polyglot AI Studio...',
    detail: 'Python 3.12 • Rust 1.82 • C++23 SIMD • Java 21 • Go • TypeScript',
    icon: Cpu
  },
  {
    pct: 100,
    label: 'Verifying SHA-256 Sandbox & Anti-Piracy Copyright DRM Lock...',
    detail: '© 2026 NEX STORE & DEVTECHS001 LABS — STRICTLY PROPRIETARY',
    icon: ShieldCheck
  }
];

export default function SplashScreen({ onComplete }) {
  const [progress, setProgress] = useState(18);
  const [stageIndex, setStageIndex] = useState(0);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => {
      setProgress(52);
      setStageIndex(1);
    }, 240);
    const t2 = setTimeout(() => {
      setProgress(84);
      setStageIndex(2);
    }, 520);
    const t3 = setTimeout(() => {
      setProgress(100);
      setStageIndex(3);
    }, 800);
    const t4 = setTimeout(() => {
      setExiting(true);
    }, 1150);
    const t5 = setTimeout(() => {
      onComplete?.();
    }, 1380);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, [onComplete]);

  const handleSkip = () => {
    setExiting(true);
    setTimeout(() => {
      onComplete?.();
    }, 150);
  };

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#050811] text-slate-100 px-4 select-none transition-opacity duration-300 ${
        exiting ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{
        backgroundImage:
          'radial-gradient(at 20% 15%, rgba(99, 102, 241, 0.22) 0px, transparent 50%), radial-gradient(at 80% 85%, rgba(6, 182, 212, 0.18) 0px, transparent 50%)'
      }}
    >
      <div className="w-full max-w-lg rounded-3xl border border-indigo-500/35 bg-slate-950/90 backdrop-blur-2xl p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Top Emblem & Version Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div
              className="relative flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-xl ring-2 ring-indigo-400/40"
              style={{
                background: 'linear-gradient(135deg, #6366f1, #06b6d4)'
              }}
            >
              <Sparkles className="h-7 w-7 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                  NEX STORE
                </h1>
                <span className="rounded-lg bg-cyan-500/20 border border-cyan-500/40 px-2 py-0.5 font-mono-num text-[10px] font-bold text-cyan-300">
                  GEN-5 OS v4.0
                </span>
              </div>
              <p className="font-mono-num text-xs text-slate-400 mt-0.5">
                Quantum Hardware Commerce • App Sandbox • Polyglot AI • Mobile SDK
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSkip}
            className="inline-flex items-center gap-1 rounded-xl border border-indigo-500/40 bg-indigo-500/15 hover:bg-indigo-500/30 px-3 py-1.5 font-mono-num text-xs font-bold text-indigo-300 cursor-pointer transition shrink-0"
          >
            <span>Enter</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Animated Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between font-mono-num text-xs">
            <span className="text-cyan-400 font-bold truncate">
              {BOOT_STAGES[stageIndex]?.label}
            </span>
            <span className="text-indigo-300 font-bold">{progress}%</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-900 border border-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* 4-Stage Diagnostic Checklist */}
        <div className="space-y-2 rounded-2xl bg-slate-900/75 border border-slate-800/90 p-3.5 font-mono-num text-xs">
          {BOOT_STAGES.map((stage, idx) => {
            const Icon = stage.icon;
            const done = idx <= stageIndex;
            return (
              <div
                key={stage.label}
                className={`flex items-start gap-2.5 transition-opacity duration-200 ${
                  done ? 'opacity-100' : 'opacity-40'
                }`}
              >
                {done ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <Icon className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
                )}
                <div className="min-w-0">
                  <div className={done ? 'text-slate-100 font-semibold' : 'text-slate-400'}>
                    {stage.label}
                  </div>
                  <div className="text-[10px] text-cyan-400/80 truncate">{stage.detail}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer DRM Protection Notice */}
        <div className="flex items-center justify-between border-t border-slate-800 pt-3 font-mono-num text-[10px] text-amber-300">
          <span className="inline-flex items-center gap-1.5 font-bold">
            <Lock className="h-3.5 w-3.5 text-amber-400" />
            © 2026 NEX STORE &amp; DEVTECHS001 LABS
          </span>
          <span className="text-emerald-400">PROPRIETARY DRM • DO NOT PIRATE</span>
        </div>
      </div>
    </div>
  );
}
