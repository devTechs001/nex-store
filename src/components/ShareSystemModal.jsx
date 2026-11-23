import React, { useState } from 'react';
import { Share2, X, Link2, Check } from 'lucide-react';

/**
 * Share modal for developers: publish an app/system to the public community
 * feed and copy its canonical share link. Posts to /api/apps/:id/share.
 */
export default function ShareSystemModal({ app, session, onClose, onShared, onPlaySound }) {
  const [message, setMessage] = useState('');
  const [kind, setKind] = useState('system');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  if (!app) return null;

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setResult(null);
    try {
      const res = await fetch(`/api/apps/${app.id}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.token}` },
        body: JSON.stringify({ message, kind })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Share failed');
      setResult({ ok: true, url: `${window.location.origin}${json.shareUrl}` });
      onPlaySound?.('success');
      onShared?.(json);
    } catch (e2) {
      onPlaySound?.('error');
      setResult({ ok: false, text: e2.message });
    } finally {
      setBusy(false);
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(result.url);
      setCopied(true);
      onPlaySound?.('toggle');
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 theme-modal-backdrop" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl border p-5 shadow-2xl theme-modal-panel theme-card"
      >
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-display text-lg font-bold flex items-center gap-1.5">
              <Share2 className="h-4 w-4 text-cyan-400" /> Share “{app.name}”
            </h3>
            <p className="mt-0.5 text-[11px] theme-text-muted">
              Publishes to the public community feed with a permanent link.
            </p>
          </div>
          <button type="button" onClick={onClose} className="theme-input h-7 w-7 rounded-lg flex items-center justify-center cursor-pointer" aria-label="Close">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        <form onSubmit={submit} className="mt-4 space-y-3">
          <select value={kind} onChange={(e) => setKind(e.target.value)} className="theme-input h-9 w-full rounded-xl px-2.5 text-xs">
            <option value="system">Share as converted system</option>
            <option value="app">Share as app</option>
          </select>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            placeholder="What should the community know about this build?"
            className="w-full rounded-xl border px-3 py-2.5 text-xs theme-card"
          />
          <button
            type="submit"
            disabled={busy}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 px-4 text-xs font-semibold text-white cursor-pointer disabled:opacity-50"
          >
            <Share2 className="h-3.5 w-3.5" /> {busy ? 'Sharing…' : 'Share to community'}
          </button>
        </form>

        {result?.ok && (
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-2.5">
            <Link2 className="h-3.5 w-3.5 text-emerald-300 shrink-0" />
            <span className="flex-1 break-all text-[10px] font-mono-num text-emerald-200">{result.url}</span>
            <button type="button" onClick={copy} className="h-7 shrink-0 rounded-lg bg-emerald-600 px-2.5 text-[10px] font-semibold text-white cursor-pointer">
              {copied ? <Check className="h-3 w-3" /> : 'Copy'}
            </button>
          </div>
        )}
        {result && !result.ok && <p className="mt-3 text-[11px] text-rose-300">{result.text}</p>}
      </div>
    </div>
  );
}
