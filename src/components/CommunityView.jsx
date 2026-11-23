import React, { useCallback, useEffect, useState } from 'react';
import { Share2, MessageSquareHeart, Star, Send, LogIn, Link2, Check } from 'lucide-react';

function StarPicker({ value, onChange, disabled }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={disabled}
          onClick={() => onChange(n)}
          className={`cursor-pointer disabled:cursor-default ${n <= value ? 'text-amber-400' : 'text-white/20'}`}
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
        >
          <Star className="h-4 w-4 fill-current" />
        </button>
      ))}
    </div>
  );
}

/**
 * Collaborative platform: public community feed of shared systems/apps,
 * per-app reviews (1-5 stars) and threaded comment discussions.
 * Readable by everyone; posting requires a session.
 */
export default function CommunityView({ session, apps = [], onPlaySound, onShareApp }) {
  const [shares, setShares] = useState([]);
  const [selectedAppId, setSelectedAppId] = useState(apps[0]?.id || '');
  const [reviews, setReviews] = useState([]);
  const [reviewSummary, setReviewSummary] = useState({ count: 0, avg: 0 });
  const [comments, setComments] = useState([]);
  const [myRating, setMyRating] = useState(5);
  const [reviewBody, setReviewBody] = useState('');
  const [commentBody, setCommentBody] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [replyBody, setReplyBody] = useState('');
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [highlightSlug, setHighlightSlug] = useState(() => new URLSearchParams(window.location.search).get('share') || '');

  const authed = Boolean(session?.token);

  const loadShares = useCallback(async () => {
    try {
      const res = await fetch('/api/shares');
      const json = await res.json();
      if (res.ok) setShares(json.shares || []);
    } catch {
      // feed stays as-is on network failure
    }
  }, []);

  const loadDiscussion = useCallback(async (appId) => {
    if (!appId) return;
    try {
      const [revRes, cmtRes] = await Promise.all([
        fetch(`/api/apps/${appId}/reviews`),
        fetch(`/api/apps/${appId}/comments`)
      ]);
      const revJson = await revRes.json();
      const cmtJson = await cmtRes.json();
      if (revRes.ok) {
        setReviews(revJson.reviews || []);
        setReviewSummary(revJson.summary || { count: 0, avg: 0 });
      }
      if (cmtRes.ok) setComments(cmtJson.comments || []);
    } catch {
      // keep last known discussion on network failure
    }
  }, []);

  useEffect(() => {
    loadShares();
  }, [loadShares]);

  useEffect(() => {
    if (!selectedAppId && apps.length) setSelectedAppId(apps[0].id);
  }, [apps, selectedAppId]);

  useEffect(() => {
    loadDiscussion(selectedAppId);
  }, [selectedAppId, loadDiscussion]);

  const postReview = async (e) => {
    e.preventDefault();
    if (!authed || busy) return;
    setBusy(true);
    setFeedback(null);
    try {
      const res = await fetch(`/api/apps/${selectedAppId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.token}` },
        body: JSON.stringify({ rating: myRating, body: reviewBody })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Review failed');
      setReviewBody('');
      onPlaySound?.('success');
      setFeedback({ ok: true, text: 'Review published to the community.' });
      loadDiscussion(selectedAppId);
    } catch (e2) {
      onPlaySound?.('error');
      setFeedback({ ok: false, text: e2.message });
    } finally {
      setBusy(false);
    }
  };

  const postComment = async (parentId = null) => {
    const body = parentId ? replyBody : commentBody;
    if (!authed || busy || !body.trim()) return;
    setBusy(true);
    setFeedback(null);
    try {
      const res = await fetch(`/api/apps/${selectedAppId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.token}` },
        body: JSON.stringify({ body, parent_id: parentId })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Comment failed');
      if (parentId) {
        setReplyBody('');
        setReplyTo(null);
      } else {
        setCommentBody('');
      }
      onPlaySound?.('push');
      loadDiscussion(selectedAppId);
    } catch (e2) {
      onPlaySound?.('error');
      setFeedback({ ok: false, text: e2.message });
    } finally {
      setBusy(false);
    }
  };

  const copyShareLink = async (slug) => {
    const url = `${window.location.origin}/?share=${slug}&tab=community`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(slug);
      onPlaySound?.('toggle');
      setTimeout(() => setCopied(''), 1600);
    } catch {
      setCopied('');
    }
  };

  const roots = comments.filter((c) => !c.parent_id);
  const repliesOf = (id) => comments.filter((c) => c.parent_id === id);
  const selectedApp = apps.find((a) => a.id === selectedAppId);

  return (
    <div className="space-y-5" data-view="community">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl border theme-card p-6">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br from-cyan-500/20 to-violet-500/20 blur-2xl" />
        <h2 className="font-display text-2xl sm:text-3xl font-bold flex items-center gap-2">
          <MessageSquareHeart className="h-6 w-6 text-violet-400" /> Community &amp; Collaboration
        </h2>
        <p className="mt-1.5 max-w-2xl text-xs sm:text-sm opacity-80">
          Developers share their converted systems and apps here. Everyone can read reviews and
          threaded discussions — sign in to post your own.
        </p>
        {authed && onShareApp && (
          <p className="mt-2 text-[11px] text-cyan-300">
            Signed in as <b>{session.account?.username}</b> — use “Share” on any app card in the
            App Store, or pick one below.
          </p>
        )}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Shared systems feed */}
        <section className="theme-card rounded-2xl border p-4">
          <h3 className="text-xs font-bold uppercase tracking-wide flex items-center gap-1.5">
            <Share2 className="h-3.5 w-3.5 text-cyan-400" /> Shared systems &amp; apps ({shares.length})
          </h3>

          {authed && apps.length > 0 && (
            <ShareComposer
              apps={apps}
              session={session}
              onShared={() => { onPlaySound?.('success'); loadShares(); }}
              onPlaySound={onPlaySound}
            />
          )}

          <div className="mt-3 space-y-2.5 max-h-[27rem] overflow-y-auto pr-1">
            {shares.length === 0 && (
              <p className="text-[11px] theme-text-muted">
                Nothing shared yet. {authed ? 'Be the first to publish a system.' : 'Sign in as a developer to share.'}
              </p>
            )}
            {shares.map((s) => (
              <article
                key={s.id}
                className={`rounded-xl border p-3 transition ${highlightSlug === s.slug ? 'border-cyan-400/60 bg-cyan-400/5' : 'border-white/10 bg-white/[0.03]'}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-bold">{s.app_name}</p>
                    <p className="text-[10px] theme-text-muted font-mono-num">
                      shared by {s.author} · {s.kind} · {new Date(s.created_at).toLocaleString()}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyShareLink(s.slug)}
                    className="theme-input flex h-7 items-center gap-1 rounded-lg px-2 text-[10px] cursor-pointer shrink-0"
                    title="Copy public link"
                  >
                    {copied === s.slug ? <Check className="h-3 w-3 text-emerald-400" /> : <Link2 className="h-3 w-3" />}
                    {copied === s.slug ? 'Copied' : 'Link'}
                  </button>
                </div>
                {s.message && <p className="mt-1.5 text-[11px] opacity-85">{s.message}</p>}
                {s.language && (
                  <p className="mt-1.5 text-[9px] font-mono-num text-cyan-300/80">
                    {s.language} · {s.category}
                  </p>
                )}
              </article>
            ))}
          </div>
        </section>

        {/* Reviews + threaded comments */}
        <section className="theme-card rounded-2xl border p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-xs font-bold uppercase tracking-wide flex items-center gap-1.5">
              <Star className="h-3.5 w-3.5 text-amber-400" /> Reviews &amp; discussion
            </h3>
            <select
              value={selectedAppId}
              onChange={(e) => setSelectedAppId(e.target.value)}
              className="theme-input h-8 max-w-56 rounded-xl px-2 text-[11px]"
              aria-label="Select app or system"
            >
              {apps.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>

          <div className="mt-2 flex items-center gap-2 text-[11px] font-mono-num">
            <span className="text-amber-300 font-bold text-base">{reviewSummary.avg || '—'}★</span>
            <span className="theme-text-muted">from {reviewSummary.count} review{reviewSummary.count === 1 ? '' : 's'}</span>
            {selectedApp && <span className="theme-text-muted">· {selectedApp.name}</span>}
          </div>

          {authed ? (
            <form onSubmit={postReview} className="mt-3 space-y-2">
              <div className="flex items-center gap-2">
                <StarPicker value={myRating} onChange={setMyRating} disabled={busy} />
                <span className="text-[10px] theme-text-muted font-mono-num">your rating</span>
              </div>
              <textarea
                value={reviewBody}
                onChange={(e) => setReviewBody(e.target.value)}
                placeholder="What works well? What should the developer improve?"
                rows={2}
                className="w-full rounded-xl border px-3 py-2 text-xs theme-card"
              />
              <button
                type="submit"
                disabled={busy}
                className="inline-flex h-8 items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-3 text-[11px] font-semibold text-white cursor-pointer disabled:opacity-50"
              >
                <Send className="h-3 w-3" /> Post review
              </button>
            </form>
          ) : (
            <p className="mt-3 flex items-center gap-1.5 text-[11px] theme-text-muted">
              <LogIn className="h-3.5 w-3.5" /> Sign in to post a review.
            </p>
          )}

          {/* reviews list */}
          <div className="mt-3 space-y-2 max-h-44 overflow-y-auto pr-1">
            {reviews.map((r) => (
              <div key={r.id} className="rounded-xl bg-white/[0.03] border border-white/5 p-2.5">
                <div className="flex items-center gap-2 text-[10px] font-mono-num">
                  <span className="text-amber-300">{'★'.repeat(r.rating)}<span className="text-white/20">{'★'.repeat(5 - r.rating)}</span></span>
                  <b>{r.author}</b>
                  <span className="theme-text-muted">{r.author_role} · {new Date(r.created_at).toLocaleDateString()}</span>
                </div>
                {r.body && <p className="mt-1 text-[11px] opacity-85">{r.body}</p>}
              </div>
            ))}
            {reviews.length === 0 && <p className="text-[11px] theme-text-muted">No reviews yet for this system.</p>}
          </div>

          {/* comment thread */}
          <h4 className="mt-4 text-[11px] font-bold uppercase tracking-wide theme-text-muted">Discussion ({comments.length})</h4>
          {authed ? (
            <div className="mt-2 flex items-center gap-1.5">
              <input
                value={commentBody}
                onChange={(e) => setCommentBody(e.target.value)}
                placeholder="Add to the discussion…"
                className="flex-1 rounded-xl border px-3 py-2 text-xs theme-card"
              />
              <button
                type="button"
                onClick={() => postComment(null)}
                disabled={busy || !commentBody.trim()}
                className="h-8 rounded-xl bg-cyan-600 px-3 text-[11px] font-semibold text-white cursor-pointer disabled:opacity-50"
              >
                <Send className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <p className="mt-2 flex items-center gap-1.5 text-[11px] theme-text-muted">
              <LogIn className="h-3.5 w-3.5" /> Sign in to join the discussion.
            </p>
          )}

          <div className="mt-2.5 space-y-2 max-h-64 overflow-y-auto pr-1">
            {roots.map((c) => (
              <div key={c.id} className="rounded-xl bg-white/[0.03] border border-white/5 p-2.5">
                <div className="flex items-center gap-2 text-[10px] font-mono-num">
                  <b>{c.author}</b>
                  <span className="theme-text-muted">{c.author_role} · {new Date(c.created_at).toLocaleString()}</span>
                </div>
                <p className="mt-1 text-[11px] opacity-90">{c.body}</p>
                <button
                  type="button"
                  onClick={() => { setReplyTo(replyTo === c.id ? null : c.id); onPlaySound?.('toggle'); }}
                  className="mt-1 text-[10px] text-cyan-300 underline cursor-pointer"
                >
                  {replyTo === c.id ? 'cancel reply' : 'reply'}
                </button>
                {replyTo === c.id && authed && (
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <input
                      value={replyBody}
                      onChange={(e) => setReplyBody(e.target.value)}
                      placeholder={`Reply to ${c.author}…`}
                      autoFocus
                      className="flex-1 rounded-lg border px-2.5 py-1.5 text-[11px] theme-card"
                    />
                    <button
                      type="button"
                      onClick={() => postComment(c.id)}
                      disabled={busy || !replyBody.trim()}
                      className="h-7 rounded-lg bg-indigo-600 px-2.5 text-[10px] font-semibold text-white cursor-pointer disabled:opacity-50"
                    >
                      Reply
                    </button>
                  </div>
                )}
                {repliesOf(c.id).map((r) => (
                  <div key={r.id} className="ml-4 mt-1.5 rounded-lg border-l-2 border-indigo-500/40 pl-2.5">
                    <div className="flex items-center gap-2 text-[9px] font-mono-num">
                      <b>{r.author}</b>
                      <span className="theme-text-muted">{r.author_role} · {new Date(r.created_at).toLocaleString()}</span>
                    </div>
                    <p className="mt-0.5 text-[11px] opacity-85">{r.body}</p>
                  </div>
                ))}
              </div>
            ))}
            {comments.length === 0 && <p className="text-[11px] theme-text-muted">No comments yet — start the conversation.</p>}
          </div>

          {feedback && (
            <p className={`mt-2 text-[11px] font-semibold ${feedback.ok ? 'text-emerald-400' : 'text-rose-400'}`}>
              {feedback.text}
            </p>
          )}
        </section>
      </div>
    </div>
  );
}

/** Inline composer for sharing any of the session's apps/systems. */
function ShareComposer({ apps, session, onShared, onPlaySound }) {
  const [appId, setAppId] = useState(apps[0]?.id || '');
  const [message, setMessage] = useState('');
  const [kind, setKind] = useState('system');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    if (!appId || busy) return;
    setBusy(true);
    setResult(null);
    try {
      const res = await fetch(`/api/apps/${appId}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.token}` },
        body: JSON.stringify({ message, kind })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Share failed');
      setMessage('');
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

  return (
    <form onSubmit={submit} className="mt-3 space-y-2 rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-3">
      <p className="text-[10px] font-bold uppercase tracking-wide text-cyan-300">Share a system / app</p>
      <div className="flex flex-wrap items-center gap-1.5">
        <select value={appId} onChange={(e) => setAppId(e.target.value)} className="theme-input h-8 flex-1 min-w-40 rounded-xl px-2 text-[11px]">
          {apps.map((a) => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>
        <select value={kind} onChange={(e) => setKind(e.target.value)} className="theme-input h-8 rounded-xl px-2 text-[11px]">
          <option value="system">system</option>
          <option value="app">app</option>
        </select>
      </div>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Tell the community what you built (optional)"
        rows={2}
        className="w-full rounded-xl border px-3 py-2 text-xs theme-card"
      />
      <button
        type="submit"
        disabled={busy}
        className="inline-flex h-8 items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 px-3 text-[11px] font-semibold text-white cursor-pointer disabled:opacity-50"
      >
        <Share2 className="h-3 w-3" /> {busy ? 'Sharing…' : 'Share to community'}
      </button>
      {result?.ok && (
        <p className="text-[10px] text-emerald-300 font-mono-num break-all">Published: {result.url}</p>
      )}
      {result && !result.ok && <p className="text-[10px] text-rose-300">{result.text}</p>}
    </form>
  );
}
