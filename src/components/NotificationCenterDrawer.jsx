import React, { useState, useMemo } from 'react';
import {
  Bell,
  X,
  CheckCheck,
  ShieldAlert,
  Globe,
  Zap,
  Truck,
  Volume2,
  VolumeX,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export default function NotificationCenterDrawer({
  isOpen,
  onClose,
  notifications = [],
  onMarkRead,
  onSendTestPush,
  soundEnabled,
  setSoundEnabled,
  desktopPushStatus,
  onRequestDesktopPush,
  onNavigateTab,
  onPlaySound
}) {
  const [selectedChannel, setSelectedChannel] = useState('all');

  const filtered = useMemo(() => {
    if (selectedChannel === 'all') return notifications;
    return notifications.filter((n) => n.channel === selectedChannel);
  }, [notifications, selectedChannel]);

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const getChannelIcon = (channel) => {
    switch (channel) {
      case 'security':
        return <ShieldAlert className="h-4 w-4 text-rose-400" />;
      case 'deployment':
        return <Globe className="h-4 w-4 text-teal-400" />;
      case 'order':
        return <Truck className="h-4 w-4 text-emerald-400" />;
      default:
        return <Zap className="h-4 w-4 text-cyan-400" />;
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex justify-end bg-slate-950/75 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex h-full w-full max-w-md flex-col border-l shadow-2xl theme-card"
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400">
              <Bell className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-display text-base font-bold">
                Push & Real-Time Notification Center
              </h3>
              <p className="font-mono-num text-[11px] theme-text-muted">
                {unreadCount} unread • {notifications.length} total in SQLite
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 theme-subtle cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Sound & OS Push Quick Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.08] px-5 py-3 theme-subtle">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const next = !soundEnabled;
                setSoundEnabled(next);
                if (next) onPlaySound?.('push', true);
              }}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold cursor-pointer ${
                soundEnabled
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/35'
                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/35'
              }`}
            >
              {soundEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
              <span>{soundEnabled ? 'Sounds ON' : 'Muted'}</span>
            </button>

            <button
              onClick={onRequestDesktopPush}
              className="rounded-xl border border-amber-500/35 bg-amber-500/15 px-3 py-1.5 font-mono-num text-[11px] font-semibold text-amber-400 cursor-pointer"
            >
              OS Push: {desktopPushStatus}
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                onPlaySound?.('push');
                onSendTestPush?.();
              }}
              className="inline-flex items-center gap-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 text-xs font-semibold text-white cursor-pointer"
            >
              <Sparkles className="h-3 w-3" />
              <span>Test Push</span>
            </button>

            {unreadCount > 0 && (
              <button
                onClick={() => onMarkRead?.()}
                className="inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs theme-card cursor-pointer"
                title="Mark all as read"
              >
                <CheckCheck className="h-3.5 w-3.5 text-emerald-400" />
              </button>
            )}
          </div>
        </div>

        {/* Channel Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto px-5 py-2.5 border-b border-white/[0.08]">
          {[
            { id: 'all', label: 'All' },
            { id: 'deployment', label: 'Netlify & Apps' },
            { id: 'security', label: 'Security' },
            { id: 'realtime', label: 'Servers' },
            { id: 'order', label: 'Orders' }
          ].map((ch) => (
            <button
              key={ch.id}
              onClick={() => setSelectedChannel(ch.id)}
              className={`rounded-xl px-3 py-1 text-xs font-semibold transition cursor-pointer shrink-0 ${
                selectedChannel === ch.id
                  ? 'bg-indigo-600 text-white'
                  : 'theme-subtle'
              }`}
            >
              {ch.label}
            </button>
          ))}
        </div>

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {filtered.length === 0 ? (
            <div className="rounded-2xl p-8 text-center theme-subtle space-y-2">
              <Bell className="mx-auto h-8 w-8 text-slate-400" />
              <div className="text-xs font-bold">No notifications in this channel</div>
            </div>
          ) : (
            filtered.map((n) => (
              <div
                key={n.id}
                onClick={() => {
                  onMarkRead?.(n.id);
                  if (n.action_url) {
                    onNavigateTab?.(n.action_url);
                    onClose();
                  }
                }}
                className={`rounded-2xl p-3.5 transition cursor-pointer space-y-1.5 ${
                  !n.is_read
                    ? 'border border-indigo-500/40 bg-indigo-500/10'
                    : 'theme-subtle'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {getChannelIcon(n.channel)}
                    <span className="font-display text-xs font-bold">{n.title}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {!n.is_read && (
                      <span className="h-2 w-2 rounded-full bg-cyan-400" />
                    )}
                    <span className="font-mono-num text-[10px] theme-text-muted">
                      {new Date(n.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>

                <p className="text-xs theme-text-muted leading-relaxed">{n.message}</p>

                <div className="flex items-center justify-between pt-1">
                  <span className="font-mono-num text-[10px] uppercase text-indigo-400">
                    #{n.channel} • {n.priority}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-400">
                    <span>Inspect</span>
                    <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
