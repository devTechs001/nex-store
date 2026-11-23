import React, { useEffect, useState } from 'react';
import QuantumParticles from './QuantumParticles.jsx';

const BOOT_LINES = [
  'Initializing quantum commerce engine…',
  'Entangling SQLite + WebSocket mesh…',
  'Calibrating polyglot build fabric…',
  'Sealing Quantum-Shield security layer…',
  'Synchronizing live inventory streams…'
];

/**
 * Quantum splash screen: logo reveal, boot telemetry, particle field.
 * Auto-completes after ~2.2s; click/keypress skips instantly.
 */
export default function SplashScreen({ onComplete }) {
  const [progress, setProgress] = useState(8);
  const [lineIdx, setLineIdx] = useState(0);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const t0 = Date.now();
    const total = 2100;
    const tick = setInterval(() => {
      const pct = Math.min(100, ((Date.now() - t0) / total) * 100);
      setProgress(pct);
      setLineIdx(Math.min(BOOT_LINES.length - 1, Math.floor((pct / 100) * BOOT_LINES.length)));
      if (pct >= 100) {
        clearInterval(tick);
        setLeaving(true);
        setTimeout(onComplete, 420);
      }
    }, 60);
    return () => clearInterval(tick);
  }, [onComplete]);

  const skip = () => {
    setLeaving(true);
    setTimeout(onComplete, 260);
  };

  return (
    <div
      onClick={skip}
      onKeyDown={(e) => e.key === 'Enter' && skip()}
      role="button"
      tabIndex={0}
      className={`fixed inset-0 z-[120] flex flex-col items-center justify-center overflow-hidden theme-bg transition-opacity duration-500 ${leaving ? 'opacity-0' : 'opacity-100'}`}
    >
      <QuantumParticles density={64} />
      <div className="relative flex flex-col items-center px-6 text-center">
        <div className="quantum-pulse-glow">
          <img
            src="/quantum-logo.png"
            alt="NEX Store Quantum"
            className="h-32 w-32 sm:h-40 sm:w-40 rounded-3xl object-cover shadow-2xl quantum-fade-up"
          />
        </div>
        <h1 className="mt-6 font-display text-3xl sm:text-5xl font-black tracking-tight quantum-fade-up">
          <span className="text-white">NEX</span>
          <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent"> STORE</span>
        </h1>
        <p className="mt-2 text-[11px] sm:text-xs font-mono-num uppercase tracking-[0.35em] text-cyan-300/80 quantum-fade-up">
          Quantum Commerce Fabric
        </p>

        <div className="mt-8 w-64 sm:w-80">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-violet-500 transition-all duration-150"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-3 h-4 text-[10px] font-mono-num text-cyan-200/70">{BOOT_LINES[lineIdx]}</p>
        </div>

        <p className="mt-10 text-[9px] font-mono-num uppercase tracking-widest text-white/30">
          tap anywhere to skip
        </p>
      </div>
    </div>
  );
}
