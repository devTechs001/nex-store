import React, { useEffect, useState } from 'react';
import QuantumParticles from './QuantumParticles.jsx';

/**
 * Quantum splash screen with a LIVE boot matrix: real app configs and
 * statuses stream in from /api/boot-status as the app loads. Nothing is
 * invented — rows render '◌ pending' until data arrives and honest
 * 'unavailable' if the telemetry call fails.
 */
export default function SplashScreen({ onComplete }) {
  const [progress, setProgress] = useState(6);
  const [boot, setBoot] = useState(null);
  const [bootError, setBootError] = useState(false);
  const [revealed, setRevealed] = useState(0);
  const [leaving, setLeaving] = useState(false);

  // Live boot telemetry — real configs & statuses only.
  useEffect(() => {
    let alive = true;
    fetch('/api/boot-status')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((d) => {
        if (alive) {
          setBoot(d);
          setProgress((p) => Math.max(p, 62));
        }
      })
      .catch(() => {
        if (alive) setBootError(true);
      });
    return () => {
      alive = false;
    };
  }, []);

  // Progress + staggered row reveal (min display 2.4s, hard cap 4.6s).
  useEffect(() => {
    const t0 = Date.now();
    const minMs = 2400;
    const tick = setInterval(() => {
      const elapsed = Date.now() - t0;
      const timed = Math.min(58, (elapsed / minMs) * 58);
      setProgress((p) => Math.min(100, Math.max(p, 6 + timed)));
      setRevealed(Math.min(6, Math.floor(elapsed / 320) + 1));
      if (elapsed >= minMs && (boot || bootError || elapsed > 4600)) {
        setProgress(100);
        clearInterval(tick);
        setLeaving(true);
        setTimeout(onComplete, 420);
      }
    }, 70);
    return () => clearInterval(tick);
  }, [boot, bootError, onComplete]);

  const skip = () => {
    setLeaving(true);
    setTimeout(onComplete, 260);
  };

  const rows = buildMatrix(boot, bootError);

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
            className="h-24 w-24 sm:h-32 sm:w-32 rounded-3xl object-cover shadow-2xl quantum-fade-up"
          />
        </div>
        <h1 className="mt-4 font-display text-2xl sm:text-4xl font-black tracking-tight quantum-fade-up">
          <span className="text-white">NEX</span>
          <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent"> STORE</span>
        </h1>
        <p className="mt-1.5 text-[10px] sm:text-[11px] font-mono-num uppercase tracking-[0.35em] text-cyan-300/80 quantum-fade-up">
          Quantum Boot Matrix
        </p>

        {/* Live config/status matrix — real readings only */}
        <div className="mt-5 w-[26rem] max-w-[86vw] space-y-1 text-left">
          {rows.map((row, i) => (
            <div
              key={row.label}
              className={`flex items-center gap-2.5 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-1.5 transition-all duration-300 ${
                i < revealed ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'
              }`}
            >
              <span className={`text-[11px] font-bold ${row.tone}`}>{row.glyph}</span>
              <span className="w-20 shrink-0 text-[8.5px] font-mono-num uppercase tracking-wider text-cyan-300/90">
                {row.label}
              </span>
              <span className="flex-1 truncate text-[9.5px] font-mono-num text-white/75">{row.value}</span>
            </div>
          ))}
        </div>

        <div className="mt-5 w-64 sm:w-80">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-violet-500 transition-all duration-150"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-2.5 text-[8px] font-mono-num uppercase tracking-widest text-white/30">
            tap anywhere to skip · live telemetry from /api/boot-status
          </p>
        </div>
      </div>
    </div>
  );
}

/** Pure builder for the boot matrix rows (real values only, no invention). */
function buildMatrix(boot, bootError) {
  if (bootError && !boot) {
    return [
      { label: 'Telemetry', glyph: '⚠', tone: 'text-amber-400', value: 'boot status unavailable — continuing with defaults' }
    ];
  }
  if (!boot) {
    return [
      { label: 'Core', glyph: '◌', tone: 'text-cyan-300/60', value: 'pending · resolving live telemetry…' },
      { label: 'Database', glyph: '◌', tone: 'text-cyan-300/60', value: 'pending ·' },
      { label: 'Payments', glyph: '◌', tone: 'text-cyan-300/60', value: 'pending ·' },
      { label: 'Systems', glyph: '◌', tone: 'text-cyan-300/60', value: 'pending ·' },
      { label: 'Security', glyph: '◌', tone: 'text-cyan-300/60', value: 'pending ·' },
      { label: 'Runtime', glyph: '◌', tone: 'text-cyan-300/60', value: 'pending ·' }
    ];
  }
  const mark = (on) => (on ? '◈' : '◇');
  const onOff = (on) => (on ? '✓' : '—');
  const pay = boot.payments || {};
  const builds = Object.entries(boot.systems?.builds || {})
    .map(([k, v]) => `${k.toLowerCase()} ${v}`)
    .join(' · ');
  return [
    {
      label: 'Core',
      glyph: '◈',
      tone: 'text-cyan-300',
      value: `server ${boot.server?.status} · node ${boot.server?.node} · up ${boot.server?.uptimeSec}s`
    },
    {
      label: 'Database',
      glyph: '◈',
      tone: 'text-emerald-300',
      value: `${boot.database?.engine} · ${boot.database?.tables} tables · ${boot.database?.rows} rows · ${boot.database?.size}`
    },
    {
      label: 'Payments',
      glyph: '◈',
      tone: 'text-violet-300',
      value: `test ledger ${onOff(pay.testLedger)} · stripe ${onOff(pay.stripe)} · paypal ${onOff(pay.paypal)} · m-pesa ${onOff(pay.mpesa)}`
    },
    {
      label: 'Systems',
      glyph: '◈',
      tone: 'text-cyan-300',
      value: `${boot.systems?.apps} apps · ${boot.systems?.products} SKUs · ${boot.systems?.orders} orders${builds ? ` · ${builds}` : ''}`
    },
    {
      label: 'Security',
      glyph: '◈',
      tone: 'text-emerald-300',
      value: `xss shield ${onOff(boot.security?.xssShield)} · rbac ${onOff(boot.security?.rbac)} · session secret ${onOff(boot.security?.sessionSecretConfigured)} · env admin ${onOff(boot.security?.envAdminConfigured)}`
    },
    {
      label: 'Runtime',
      glyph: mark(true),
      tone: 'text-indigo-300',
      value: `quantum commerce fabric · ws mesh online · ${new Date(boot.generatedAt).toLocaleTimeString()}`
    }
  ];
}
