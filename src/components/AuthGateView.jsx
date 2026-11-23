import React, { useState, useEffect } from 'react';
import { Lock, ShieldCheck, UserPlus, LogIn, Atom } from 'lucide-react';

/**
 * Quantum-Shield authentication gate for private portals
 * (Admin Console, Developer Portal, User Portal, Database Studio, Subsystems Hub).
 * Nothing on these pages renders until a valid session is established.
 */
export default function AuthGateView({ tab = 'portal', session = null, onAuthenticated, onNavigateTab, onPlaySound }) {
  const [mode, setMode] = useState('login');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState('developer');
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [authCfg, setAuthCfg] = useState(null);

  // Real env-admin credential config from bootstrap (hint only — never secrets)
  useEffect(() => {
    let alive = true;
    fetch('/api/auth/config')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (alive) setAuthCfg(d);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const tabLabel = {
    admin: 'Root Admin Console',
    overview: 'Operations Overview',
    'developer-portal': 'Developer Portal',
    'user-portal': 'User Portal',
    database: 'Database Studio',
    subsystems: 'Subsystems Command Center'
  }[tab] || 'Private Portal';

  const signedInWrongRole = Boolean(session?.account);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setFeedback(null);
    try {
      const res = await fetch(mode === 'login' ? '/api/auth/login' : '/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          mode === 'login'
            ? { identifier: identifier.trim(), password }
            : {
                username: username.trim(),
                email: email.trim(),
                password,
                display_name: displayName.trim() || username.trim(),
                role
              }
        )
      });
      const data = await res.json();
      if (!res.ok) {
        setFeedback({ type: 'error', message: data.error || 'Authentication failed' });
        return;
      }
      onPlaySound?.('success');
      onAuthenticated?.(data.account, data.token);
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Network error' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="relative overflow-hidden rounded-3xl border border-violet-500/25 theme-card">
        {/* Quantum field backdrop */}
        <div
          className="absolute inset-0 opacity-60 pointer-events-none"
          style={{
            background:
              'radial-gradient(600px 260px at 18% -10%, rgba(168,85,247,0.28), transparent 60%), radial-gradient(520px 260px at 85% 12%, rgba(34,211,238,0.22), transparent 55%), radial-gradient(420px 320px at 50% 120%, rgba(126,34,206,0.25), transparent 60%)'
          }}
        />
        <div className="relative p-8 sm:p-10 grid lg:grid-cols-2 gap-10">
          {/* Left: Quantum-Shield pitch */}
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/40 bg-violet-500/10 px-3.5 py-1.5 text-[11px] font-mono-num font-bold uppercase tracking-widest text-violet-300">
              <Atom className="h-3.5 w-3.5 animate-spin [animation-duration:9s]" />
              Quantum-Shield Access Control
            </div>
            <h1 className="font-display text-3xl font-extrabold leading-tight">
              {tabLabel} is <span className="text-violet-400">private</span>
            </h1>
            <p className="text-sm theme-text-muted max-w-md">
              This portal contains privileged developer profiles, customer data and system controls.
              It is shielded behind authenticated sessions — no anonymous access.
            </p>
            <ul className="space-y-2.5 text-xs theme-text-muted">
              {[
                'scrypt memory-hard password KDF (N=2^15) with per-user salts',
                'qnt_tok sessions — HMAC-SHA3-256 signed, 12h expiry, constant-time verify',
                'Strict CORS allow-list + Zero-Trust IP firewall',
                'Customer PII masked on every shared surface'
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <ShieldCheck className="h-4 w-4 text-cyan-400 mt-0.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            {signedInWrongRole && (
              <div className="rounded-2xl border border-amber-400/40 bg-amber-500/10 p-3.5 text-xs text-amber-200">
                Signed in as @{session.account.username} ({session.account.role}) — this role has no access to the
                {tabLabel}.{' '}
                {onNavigateTab && (
                  <button
                    className="underline font-semibold cursor-pointer"
                    onClick={() =>
                      onNavigateTab(
                        session.account.role === 'admin'
                          ? 'overview'
                          : session.account.role === 'developer'
                          ? 'developer-portal'
                          : 'user-portal'
                      )
                    }
                  >
                    Go to my portal →
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Right: Sign-in / Register */}
          <div className="rounded-2xl border border-white/10 bg-black/25 p-6 space-y-4">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  onPlaySound?.('click');
                  setMode('login');
                }}
                className={`flex-1 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold cursor-pointer transition ${
                  mode === 'login' ? 'bg-violet-600 text-white' : 'theme-subtle'
                }`}
              >
                <LogIn className="h-3.5 w-3.5" /> Sign in
              </button>
              <button
                type="button"
                onClick={() => {
                  onPlaySound?.('click');
                  setMode('register');
                }}
                className={`flex-1 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold cursor-pointer transition ${
                  mode === 'register' ? 'bg-violet-600 text-white' : 'theme-subtle'
                }`}
              >
                <UserPlus className="h-3.5 w-3.5" /> Create account
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              {mode === 'login' ? (
                <div>
                  <label className="block text-[11px] uppercase font-mono-num theme-text-muted mb-1">
                    Username or email
                  </label>
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g. nex_root_admin"
                    className="w-full rounded-xl border px-3.5 py-2.5 text-xs theme-card"
                  />
                  {authCfg?.envAdminConfigured && (
                    <p className="mt-1.5 text-[10px] font-mono-num theme-text-muted">
                      Root Admin from env:{' '}
                      <button
                        type="button"
                        onClick={() => setIdentifier(authCfg.adminUsernameHint)}
                        className="text-indigo-400 underline font-semibold cursor-pointer"
                      >
                        {authCfg.adminUsernameHint}
                      </button>
                      {authCfg.credentialsBootstrapped && (
                        <span className="ml-1 text-emerald-400">
                          • credentials bootstrapped into .env at first boot
                        </span>
                      )}
                    </p>
                  )}
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-[11px] uppercase font-mono-num theme-text-muted mb-1">
                      Username
                    </label>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="quantum_dev"
                      className="w-full rounded-xl border px-3.5 py-2.5 text-xs theme-card"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase font-mono-num theme-text-muted mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@studio.dev"
                      className="w-full rounded-xl border px-3.5 py-2.5 text-xs theme-card"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase font-mono-num theme-text-muted mb-1">
                      Display name
                    </label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Quantum Dev"
                      className="w-full rounded-xl border px-3.5 py-2.5 text-xs theme-card"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase font-mono-num theme-text-muted mb-1">
                      Account type
                    </label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full rounded-xl border px-3.5 py-2.5 text-xs theme-card"
                    >
                      <option value="developer">Developer (publish & manage apps)</option>
                      <option value="user">Shopper / User</option>
                    </select>
                  </div>
                </>
              )}
              <div>
                <label className="block text-[11px] uppercase font-mono-num theme-text-muted mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-xl border px-3.5 py-2.5 text-xs theme-card"
                />
              </div>

              {feedback && (
                <div
                  className={`rounded-xl border p-3 text-xs ${
                    feedback.type === 'error'
                      ? 'border-rose-400/40 bg-rose-500/10 text-rose-200'
                      : 'border-emerald-400/40 bg-emerald-500/10 text-emerald-200'
                  }`}
                >
                  {feedback.message}
                </div>
              )}

              <button
                type="submit"
                disabled={busy}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 px-5 py-3 text-xs font-extrabold text-white cursor-pointer transition disabled:opacity-60"
              >
                <Lock className="h-4 w-4" />
                {busy
                  ? 'Negotiating quantum channel…'
                  : mode === 'login'
                  ? 'Authenticate (Quantum-Shield)'
                  : 'Create secured account'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
