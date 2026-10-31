import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  CreditCard,
  CheckCircle2,
  Sparkles,
  Download,
  Code2,
  Edit3,
  Plus,
  RefreshCw,
  ShieldCheck,
  Lock,
  Layers,
  Terminal,
  Trash2,
  Check,
  Copy
} from 'lucide-react';
import {
  SEED_SUBSCRIPTION_PLANS,
  SEED_USER_SUBSCRIPTIONS,
  SEED_MOBILE_ADDONS,
  formatSubscriptionPlan
} from '../../server/mobileAndSubscriptions.js';

export default function MobileAndSubscriptionsView({
  subscriptionPlans = [],
  userSubscriptions = [],
  mobileAddons = [],
  pwaDeferredPrompt = null,
  onTriggerPwaInstall,
  onPlaySound
}) {
  const [localPlans, setLocalPlans] = useState([]);
  const [localSubs, setLocalSubs] = useState([]);
  const [localAddons, setLocalAddons] = useState([]);
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [adminEditMode, setAdminEditMode] = useState(false);

  // Admin / Developer Plan Editor State
  const [editingPlanId, setEditingPlanId] = useState(null);
  const [editPlanForm, setEditPlanForm] = useState({
    name: '',
    tagline: '',
    price_monthly: 29,
    price_yearly: 290,
    badge: 'CUSTOM',
    featuresText: ''
  });
  const [showNewPlanModal, setShowNewPlanModal] = useState(false);
  const [newPlanForm, setNewPlanForm] = useState({
    name: 'Pro AI & Flutter Studio Tier',
    code: 'PRO_FLUTTER_AI',
    tagline: 'Custom developer subscription with Flutter SDK, Polyglot AI & App Publishing.',
    price_monthly: 45,
    price_yearly: 450,
    badge: 'DEV CUSTOM',
    featuresText:
      'Unlimited Developer App & System Publishing\nFlutter MethodChannel & React Native JSI SDK\nPolyglot AI Automation Studio (Python, Rust, C++, Java)\nDedicated SHA-256 Anti-Piracy DRM Signer'
  });

  // Subscriber Enrollment Form
  const [subscriberName, setSubscriberName] = useState('Alex Mercer (@alex_fullstack)');
  const [subscriberEmail, setSubscriberEmail] = useState('alex@nex-systems.dev');
  const [enrollingPlanId, setEnrollingPlanId] = useState(null);

  // Mobile Add-On Future Room State
  const [selectedAddon, setSelectedAddon] = useState(null);
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [sdkConfigPreview, setSdkConfigPreview] = useState(null);
  const [newAddonName, setNewAddonName] = useState('');
  const [newAddonFramework, setNewAddonFramework] = useState('Flutter 3.24 (Dart / Impeller)');
  const [newAddonDesc, setNewAddonDesc] = useState('');

  // PWA Status State
  const [pwaStatus, setPwaStatus] = useState(null);
  const [pwaInstalledMsg, setPwaInstalledMsg] = useState('');

  const plans =
    localPlans.length > 0
      ? localPlans
      : subscriptionPlans.length > 0
      ? subscriptionPlans
      : SEED_SUBSCRIPTION_PLANS.map(formatSubscriptionPlan);

  const subscriptions =
    localSubs.length > 0
      ? localSubs
      : userSubscriptions.length > 0
      ? userSubscriptions
      : SEED_USER_SUBSCRIPTIONS;

  const addons =
    localAddons.length > 0
      ? localAddons
      : mobileAddons.length > 0
      ? mobileAddons
      : SEED_MOBILE_ADDONS;

  useEffect(() => {
    if (!selectedAddon && addons.length > 0) {
      setSelectedAddon(addons[0]);
    }
  }, [addons, selectedAddon]);

  useEffect(() => {
    fetch('/api/pwa/status')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d) setPwaStatus(d);
      })
      .catch(() => {});
  }, []);

  const handleStartEditPlan = (plan) => {
    onPlaySound?.('click');
    setEditingPlanId(plan.id);
    setEditPlanForm({
      name: plan.name,
      tagline: plan.tagline,
      price_monthly: plan.price_monthly,
      price_yearly: plan.price_yearly,
      badge: plan.badge || 'STANDARD',
      featuresText: (plan.features || []).join('\n')
    });
  };

  const handleSaveEditedPlan = async (planId) => {
    onPlaySound?.('success');
    const features = editPlanForm.featuresText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    try {
      const res = await fetch(`/api/subscriptions/plans/${planId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editPlanForm.name,
          tagline: editPlanForm.tagline,
          price_monthly: Number(editPlanForm.price_monthly),
          price_yearly: Number(editPlanForm.price_yearly),
          badge: editPlanForm.badge,
          features,
          updated_by: 'Admin / Developer Studio'
        })
      });
      const data = await res.json();
      if (Array.isArray(data?.subscriptionPlans)) {
        setLocalPlans(data.subscriptionPlans);
      }
    } catch {
      setLocalPlans(
        plans.map((p) =>
          p.id === planId
            ? {
                ...p,
                name: editPlanForm.name,
                tagline: editPlanForm.tagline,
                price_monthly: Number(editPlanForm.price_monthly),
                price_yearly: Number(editPlanForm.price_yearly),
                badge: editPlanForm.badge,
                features
              }
            : p
        )
      );
    }
    setEditingPlanId(null);
  };

  const handleCreateCustomPlan = async (e) => {
    e.preventDefault();
    if (!newPlanForm.name.trim()) return;
    onPlaySound?.('success');
    const features = newPlanForm.featuresText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    try {
      const res = await fetch('/api/subscriptions/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newPlanForm.name,
          code: newPlanForm.code || `CUSTOM_${Date.now().toString(36).toUpperCase()}`,
          tagline: newPlanForm.tagline,
          price_monthly: Number(newPlanForm.price_monthly),
          price_yearly: Number(newPlanForm.price_yearly),
          badge: newPlanForm.badge,
          features,
          updated_by: 'Admin / Developer'
        })
      });
      const data = await res.json();
      if (Array.isArray(data?.subscriptionPlans)) {
        setLocalPlans(data.subscriptionPlans);
      }
    } catch {}
    setShowNewPlanModal(false);
  };

  const handleDeletePlan = async (planId) => {
    onPlaySound?.('click');
    try {
      const res = await fetch(`/api/subscriptions/plans/${planId}`, { method: 'DELETE' });
      const data = await res.json();
      if (Array.isArray(data?.subscriptionPlans)) {
        setLocalPlans(data.subscriptionPlans);
      }
    } catch {}
  };

  const handleSubscribeToPlan = async (plan) => {
    setEnrollingPlanId(plan.id);
    onPlaySound?.('ping');
    try {
      const res = await fetch('/api/subscriptions/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan_id: plan.id,
          subscriber_name: subscriberName,
          subscriber_email: subscriberEmail,
          billing_cycle: billingCycle
        })
      });
      const data = await res.json();
      if (Array.isArray(data?.userSubscriptions)) {
        setLocalSubs(data.userSubscriptions);
      }
      onPlaySound?.('success');
    } catch {}
    setEnrollingPlanId(null);
  };

  const handleToggleAddonEnabled = async (addon) => {
    onPlaySound?.('click');
    const nextEnabled = addon.enabled ? 0 : 1;
    try {
      const res = await fetch(`/api/mobile/addons/${addon.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: nextEnabled })
      });
      const data = await res.json();
      if (Array.isArray(data?.mobileAddons)) {
        setLocalAddons(data.mobileAddons);
        if (selectedAddon?.id === addon.id) {
          setSelectedAddon(data.addon);
        }
      }
    } catch {}
  };

  const handleCreateMobileAddon = async (e) => {
    e.preventDefault();
    if (!newAddonName.trim()) return;
    onPlaySound?.('success');
    try {
      const res = await fetch('/api/mobile/addons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newAddonName.trim(),
          framework: newAddonFramework,
          status: 'FUTURE ADD-ON',
          category: 'Mobile Native / Flutter Extension',
          description:
            newAddonDesc.trim() ||
            'Custom Native / Flutter mobile integration module registered for future expansion.',
          sdk_snippet: `// © 2026 NEX STORE PROPRIETARY DRM — ${newAddonName.toUpperCase()}\n// Connected to /api/mobile/sdk-config & /ws real-time gateway`
        })
      });
      const data = await res.json();
      if (Array.isArray(data?.mobileAddons)) {
        setLocalAddons(data.mobileAddons);
        setSelectedAddon(data.addon || data.mobileAddons[0]);
      }
      setNewAddonName('');
      setNewAddonDesc('');
    } catch {}
  };

  const handleTestMobileSdkEndpoint = async (framework = 'flutter') => {
    onPlaySound?.('ping');
    try {
      const res = await fetch(`/api/mobile/sdk-config?framework=${encodeURIComponent(framework)}`);
      const data = await res.json();
      setSdkConfigPreview(data);
    } catch {}
  };

  const handleInstallPwaClick = async () => {
    onPlaySound?.('success');
    if (onTriggerPwaInstall) {
      const outcome = await onTriggerPwaInstall();
      if (outcome) {
        setPwaInstalledMsg(`PWA Install Prompt Result: ${outcome}`);
        return;
      }
    }
    setPwaInstalledMsg(
      'PWA Manifest (/manifest.json) & Service Worker (/sw.js • nex-store-v11) verified active! Use your browser "Install App" / "Add to Home Screen" icon to pin NEX Store as a standalone app.'
    );
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 space-y-6">
      {/* Top Hero Banner */}
      <div className="rounded-3xl p-6 md:p-7 theme-card border border-indigo-500/30 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-2 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-500/15 border border-teal-500/35 px-3 py-0.5 font-mono-num text-xs font-bold text-teal-300">
              <Smartphone className="h-3.5 w-3.5" />
              <span>PWA • FLUTTER &amp; REACT NATIVE ADD-ON ROOM • SUBSCRIPTIONS</span>
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-500/35 px-2.5 py-0.5 font-mono-num text-[11px] font-bold text-amber-300">
              <Lock className="h-3 w-3" />
              Admin &amp; Developer Modifiable
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold">
            Subscriptions, Progressive Web App (PWA) &amp; Mobile SDK Add-On Hub
          </h1>
          <p className="text-xs sm:text-sm theme-text-muted">
            Manage customizable developer &amp; enterprise subscription tiers (`PATCH /api/subscriptions/plans/:id`), install NEX Store as a standalone offline-ready PWA, and configure Native / Flutter mobile add-on modules.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleInstallPwaClick}
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 px-4 py-2.5 text-xs font-bold text-slate-950 shadow-md cursor-pointer transition"
          >
            <Download className="h-4 w-4" />
            <span>{pwaDeferredPrompt ? 'Install Standalone PWA Now' : 'Verify & Install PWA'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onPlaySound?.('click');
              setAdminEditMode((prev) => !prev);
            }}
            className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold border transition cursor-pointer ${
              adminEditMode
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                : 'theme-subtle text-amber-300 hover:border-amber-400/50'
            }`}
          >
            <Edit3 className="h-4 w-4" />
            <span>{adminEditMode ? 'Exit Admin/Dev Plan Editor' : 'Admin / Dev: Modify Plans'}</span>
          </button>
        </div>
      </div>

      {pwaInstalledMsg && (
        <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-xs text-emerald-300 font-mono-num flex items-center justify-between gap-2">
          <span>✅ {pwaInstalledMsg}</span>
          <button
            type="button"
            onClick={() => setPwaInstalledMsg('')}
            className="text-[10px] underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* SECTION 1: SUBSCRIPTION PLANS (MODIFIABLE BY ADMIN / DEVELOPER) */}
      <div className="rounded-3xl p-5 sm:p-6 theme-card space-y-5 border border-indigo-500/25">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-indigo-400" />
              <h2 className="font-display text-base sm:text-lg font-bold">
                Developer, Mobile SDK &amp; Enterprise Subscription Tiers ({plans.length} Plans in SQLite)
              </h2>
            </div>
            <p className="text-xs theme-text-muted mt-0.5">
              Every plan is stored in SQLite `subscription_plans` and can be modified in real time by Admins or Developers.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Monthly / Yearly Billing Toggle */}
            <div className="inline-flex rounded-xl p-1 theme-subtle">
              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                className={`rounded-lg px-3 py-1 text-xs font-bold transition cursor-pointer ${
                  billingCycle === 'monthly' ? 'bg-indigo-600 text-white' : 'theme-text-muted'
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle('yearly')}
                className={`rounded-lg px-3 py-1 text-xs font-bold transition cursor-pointer ${
                  billingCycle === 'yearly' ? 'bg-cyan-600 text-white' : 'theme-text-muted'
                }`}
              >
                Yearly (Save 17%)
              </button>
            </div>

            {adminEditMode && (
              <button
                type="button"
                onClick={() => setShowNewPlanModal(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 px-3.5 py-2 text-xs font-bold text-slate-950 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Create Custom Plan</span>
              </button>
            )}
          </div>
        </div>

        {/* Subscriber Identity Strip for 1-Click Enrollment */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 rounded-2xl p-3 theme-subtle">
          <div>
            <label className="block font-mono-num text-[10px] uppercase theme-text-muted mb-1">
              Subscriber / Developer Name
            </label>
            <input
              type="text"
              value={subscriberName}
              onChange={(e) => setSubscriberName(e.target.value)}
              className="w-full rounded-xl px-3 py-1.5 text-xs theme-input"
            />
          </div>
          <div>
            <label className="block font-mono-num text-[10px] uppercase theme-text-muted mb-1">
              Developer Email (For API Key Provisioning)
            </label>
            <input
              type="email"
              value={subscriberEmail}
              onChange={(e) => setSubscriberEmail(e.target.value)}
              className="w-full rounded-xl px-3 py-1.5 text-xs theme-input"
            />
          </div>
          <div className="flex items-end">
            <div className="w-full rounded-xl bg-indigo-500/10 border border-indigo-500/30 px-3 py-1.5 font-mono-num text-[11px] text-indigo-300">
              Active Enrollments: <strong>{subscriptions.length}</strong> in SQLite `user_subscriptions`
            </div>
          </div>
        </div>

        {/* Subscription Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {plans.map((plan) => {
            const isEditing = editingPlanId === plan.id;
            const displayPrice =
              billingCycle === 'yearly' ? plan.price_yearly : plan.price_monthly;

            return (
              <div
                key={plan.id}
                className={`flex flex-col justify-between rounded-3xl p-5 space-y-4 transition ${
                  plan.is_popular
                    ? 'border-2 border-cyan-400/70 bg-cyan-500/5 shadow-lg'
                    : 'theme-subtle border border-white/[0.08]'
                }`}
              >
                {isEditing ? (
                  <div className="space-y-2.5">
                    <div className="font-mono-num text-[10px] font-bold uppercase text-amber-400">
                      Editing Plan ({plan.code})
                    </div>
                    <input
                      type="text"
                      value={editPlanForm.name}
                      onChange={(e) => setEditPlanForm({ ...editPlanForm, name: e.target.value })}
                      placeholder="Plan Name"
                      className="w-full rounded-xl px-2.5 py-1.5 text-xs theme-input"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block font-mono-num text-[9px] theme-text-muted">
                          Monthly ($)
                        </label>
                        <input
                          type="number"
                          value={editPlanForm.price_monthly}
                          onChange={(e) =>
                            setEditPlanForm({ ...editPlanForm, price_monthly: e.target.value })
                          }
                          className="w-full rounded-xl px-2.5 py-1 text-xs theme-input"
                        />
                      </div>
                      <div>
                        <label className="block font-mono-num text-[9px] theme-text-muted">
                          Yearly ($)
                        </label>
                        <input
                          type="number"
                          value={editPlanForm.price_yearly}
                          onChange={(e) =>
                            setEditPlanForm({ ...editPlanForm, price_yearly: e.target.value })
                          }
                          className="w-full rounded-xl px-2.5 py-1 text-xs theme-input"
                        />
                      </div>
                    </div>
                    <input
                      type="text"
                      value={editPlanForm.badge}
                      onChange={(e) => setEditPlanForm({ ...editPlanForm, badge: e.target.value })}
                      placeholder="Badge"
                      className="w-full rounded-xl px-2.5 py-1 text-xs theme-input"
                    />
                    <textarea
                      rows={2}
                      value={editPlanForm.tagline}
                      onChange={(e) =>
                        setEditPlanForm({ ...editPlanForm, tagline: e.target.value })
                      }
                      className="w-full rounded-xl px-2.5 py-1 text-xs theme-input"
                    />
                    <div>
                      <label className="block font-mono-num text-[9px] theme-text-muted">
                        Features (1 per line)
                      </label>
                      <textarea
                        rows={4}
                        value={editPlanForm.featuresText}
                        onChange={(e) =>
                          setEditPlanForm({ ...editPlanForm, featuresText: e.target.value })
                        }
                        className="w-full rounded-xl px-2.5 py-1 text-[11px] font-mono-num theme-input"
                      />
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleSaveEditedPlan(plan.id)}
                        className="flex-1 rounded-xl bg-emerald-500 hover:bg-emerald-400 py-1.5 text-xs font-bold text-slate-950 cursor-pointer"
                      >
                        Save to SQLite
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingPlanId(null)}
                        className="rounded-xl px-3 py-1.5 text-xs theme-card cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="rounded-lg bg-indigo-500/15 border border-indigo-500/35 px-2.5 py-0.5 font-mono-num text-[10px] font-bold text-indigo-300">
                          {plan.badge || 'TIER'}
                        </span>
                        {adminEditMode && (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleStartEditPlan(plan)}
                              className="rounded-lg bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 text-[10px] font-bold text-amber-300 cursor-pointer"
                            >
                              Edit
                            </button>
                            {!plan.id.startsWith('plan-community') && (
                              <button
                                type="button"
                                onClick={() => handleDeletePlan(plan.id)}
                                className="rounded-lg bg-rose-500/20 border border-rose-500/40 p-1 text-rose-300 cursor-pointer"
                                title="Delete Plan"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      <div>
                        <h3 className="font-display text-base font-bold">{plan.name}</h3>
                        <p className="text-xs theme-text-muted mt-1 line-clamp-2">{plan.tagline}</p>
                      </div>

                      <div className="flex items-baseline gap-1 pt-1">
                        <span className="font-mono-num text-2xl sm:text-3xl font-extrabold text-cyan-400">
                          ${displayPrice}
                        </span>
                        <span className="font-mono-num text-xs theme-text-muted">
                          /{billingCycle === 'yearly' ? 'year' : 'month'}
                        </span>
                      </div>

                      <ul className="space-y-1.5 pt-2 border-t border-white/[0.08] text-xs">
                        {(plan.features || []).map((feat, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                            <span className="text-[11px] leading-snug">{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-3 border-t border-white/[0.08] space-y-2">
                      <div className="flex items-center justify-between font-mono-num text-[10px] theme-text-muted">
                        <span>Modified by: {plan.updated_by || 'Admin'}</span>
                        <span>SLA: {plan.limits?.slaUptime || '99.9%'}</span>
                      </div>
                      <button
                        type="button"
                        disabled={enrollingPlanId === plan.id}
                        onClick={() => handleSubscribeToPlan(plan)}
                        className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 py-2 text-xs font-bold text-white shadow cursor-pointer transition"
                      >
                        {enrollingPlanId === plan.id
                          ? 'Provisioning Key...'
                          : `Subscribe (${plan.name.split(' ')[0]})`}
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Active Developer & Enterprise Subscriptions Table */}
        <div className="pt-2">
          <div className="font-mono-num text-[10px] font-bold uppercase tracking-wider text-teal-400 mb-2">
            Recent Active Subscriptions &amp; Provisioned Developer Keys (`user_subscriptions`)
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            {subscriptions.slice(0, 6).map((sub) => (
              <div
                key={sub.id}
                className="rounded-2xl p-3 theme-subtle border border-emerald-500/25 flex items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <div className="text-xs font-bold truncate">{sub.subscriber_name}</div>
                  <div className="font-mono-num text-[10px] text-cyan-400 truncate">
                    {sub.plan_name} • ${sub.amount_paid}/{sub.billing_cycle}
                  </div>
                  <div className="font-mono-num text-[10px] text-emerald-400 truncate">
                    Key: {sub.api_key_preview}
                  </div>
                </div>
                <span className="rounded-md bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 font-mono-num text-[9px] font-bold text-emerald-300 shrink-0">
                  {sub.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 2: ROOM FOR MOBILE INTEGRATION (FLUTTER, REACT NATIVE, KOTLIN, SWIFTUI ADD-ON FUTURE HUB) */}
      <div className="rounded-3xl p-5 sm:p-6 theme-card space-y-5 border border-teal-500/30">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-teal-400" />
              <h2 className="font-display text-base sm:text-lg font-bold">
                Mobile Integration Room — Native iOS/Android, React Native &amp; Flutter Add-On Hub
              </h2>
            </div>
            <p className="text-xs theme-text-muted mt-0.5">
              Dedicated architecture room for connecting Flutter (`MethodChannel`), React Native (`JSI TurboModule`), SwiftUI, and Kotlin mobile clients to NEX Store as modular add-ons.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleTestMobileSdkEndpoint('flutter')}
              className="rounded-xl bg-teal-500/15 hover:bg-teal-500/25 border border-teal-500/35 px-3 py-1.5 font-mono-num text-xs font-bold text-teal-300 cursor-pointer"
            >
              Test /api/mobile/sdk-config (Flutter)
            </button>
            <button
              type="button"
              onClick={() => handleTestMobileSdkEndpoint('react-native')}
              className="rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/35 px-3 py-1.5 font-mono-num text-xs font-bold text-indigo-300 cursor-pointer"
            >
              Test React Native Bridge
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left: Modular Mobile Add-Ons List */}
          <div className="lg:col-span-5 space-y-2.5">
            <div className="font-mono-num text-[10px] font-bold uppercase text-teal-400">
              Registered Mobile &amp; Flutter Add-On Modules ({addons.length} in SQLite `mobile_addons`)
            </div>
            {addons.map((addon) => {
              const isSelected = selectedAddon?.id === addon.id;
              return (
                <div
                  key={addon.id}
                  onClick={() => setSelectedAddon(addon)}
                  className={`rounded-2xl p-3.5 transition cursor-pointer ${
                    isSelected
                      ? 'border border-teal-400 bg-teal-500/15'
                      : 'theme-subtle hover:border-indigo-400/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-xs font-bold truncate">{addon.name}</div>
                      <div className="font-mono-num text-[10px] text-cyan-400 truncate">
                        {addon.framework} • v{addon.version}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleAddonEnabled(addon);
                      }}
                      className={`rounded-lg px-2 py-0.5 font-mono-num text-[9px] font-bold border shrink-0 cursor-pointer ${
                        addon.enabled
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {addon.enabled ? addon.status : 'DISABLED'}
                    </button>
                  </div>
                  <p className="text-[11px] theme-text-muted mt-1.5 line-clamp-2">
                    {addon.description}
                  </p>
                </div>
              );
            })}

            {/* Register New Future Mobile Add-On Form */}
            <form
              onSubmit={handleCreateMobileAddon}
              className="rounded-2xl p-3.5 theme-subtle border border-dashed border-teal-500/35 space-y-2"
            >
              <div className="font-mono-num text-[10px] font-bold uppercase text-teal-300">
                + Register New Native / Flutter Add-On Module
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  value={newAddonName}
                  onChange={(e) => setNewAddonName(e.target.value)}
                  placeholder="Add-on name (e.g. Flutter Offline POS)"
                  className="rounded-xl px-2.5 py-1.5 text-xs theme-input"
                />
                <select
                  value={newAddonFramework}
                  onChange={(e) => setNewAddonFramework(e.target.value)}
                  className="rounded-xl px-2.5 py-1.5 text-xs theme-input"
                >
                  <option value="Flutter 3.24 (Dart / Impeller)">Flutter 3.24 (Dart / Impeller)</option>
                  <option value="React Native 0.76 (JSI / Expo)">React Native 0.76 (JSI / Expo)</option>
                  <option value="SwiftUI (iOS 18 Native)">SwiftUI (iOS 18 Native)</option>
                  <option value="Kotlin Multiplatform (Android 15)">Kotlin Multiplatform (Android 15)</option>
                </select>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newAddonDesc}
                  onChange={(e) => setNewAddonDesc(e.target.value)}
                  placeholder="Describe future mobile integration capability..."
                  className="flex-1 rounded-xl px-2.5 py-1.5 text-xs theme-input"
                />
                <button
                  type="submit"
                  className="rounded-xl bg-teal-500 hover:bg-teal-400 px-3.5 py-1.5 text-xs font-bold text-slate-950 cursor-pointer shrink-0"
                >
                  Add Module
                </button>
              </div>
            </form>
          </div>

          {/* Right: Selected Mobile Add-On SDK Code & Live Endpoint Inspector */}
          <div className="lg:col-span-7 space-y-3">
            {selectedAddon && (
              <div className="rounded-2xl p-4 bg-slate-950 border border-teal-500/35 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                  <div>
                    <div className="text-sm font-bold text-teal-300">{selectedAddon.name}</div>
                    <div className="font-mono-num text-[11px] text-slate-400">
                      Framework: <strong className="text-cyan-300">{selectedAddon.framework}</strong> • Endpoint:{' '}
                      <code className="text-emerald-400">{selectedAddon.endpoint_path}</code>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(selectedAddon.sdk_snippet || '');
                      setCopiedSnippet(true);
                      setTimeout(() => setCopiedSnippet(false), 1800);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-teal-500/20 border border-teal-500/40 px-3 py-1.5 font-mono-num text-xs font-bold text-teal-300 cursor-pointer"
                  >
                    {copiedSnippet ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedSnippet ? 'Copied SDK' : 'Copy Mobile SDK'}</span>
                  </button>
                </div>

                <pre className="overflow-x-auto rounded-xl bg-slate-900/90 p-3.5 font-mono-num text-xs text-cyan-300 border border-slate-800 whitespace-pre-wrap">
                  {selectedAddon.sdk_snippet}
                </pre>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono-num text-[11px]">
                  <div className="rounded-xl bg-slate-900 p-2.5 border border-slate-800">
                    <div className="text-slate-400 text-[10px]">DEEP LINK URI</div>
                    <div className="text-teal-300 font-bold truncate">nexstore://addon/{selectedAddon.slug}</div>
                  </div>
                  <div className="rounded-xl bg-slate-900 p-2.5 border border-slate-800">
                    <div className="text-slate-400 text-[10px]">DEV PUBLISH API</div>
                    <div className="text-indigo-300 font-bold truncate">POST /api/developer/publish</div>
                  </div>
                  <div className="rounded-xl bg-slate-900 p-2.5 border border-slate-800">
                    <div className="text-slate-400 text-[10px]">DRM PROTECTION</div>
                    <div className="text-amber-300 font-bold truncate">SHA-256 Lock Active</div>
                  </div>
                </div>
              </div>
            )}

            {sdkConfigPreview && (
              <div className="rounded-2xl p-3.5 bg-slate-950 border border-indigo-500/40 space-y-2">
                <div className="flex items-center justify-between font-mono-num text-[11px] text-indigo-300">
                  <span>LIVE RESPONSE: GET /api/mobile/sdk-config?framework={sdkConfigPreview.framework}</span>
                  <button
                    type="button"
                    onClick={() => setSdkConfigPreview(null)}
                    className="text-xs text-slate-400 hover:text-white cursor-pointer"
                  >
                    Close
                  </button>
                </div>
                <pre className="max-h-40 overflow-y-auto font-mono-num text-[11px] text-emerald-300">
                  {JSON.stringify(sdkConfigPreview, null, 2)}
                </pre>
              </div>
            )}

            {/* PWA & Offline Capability Readiness Card */}
            <div className="rounded-2xl p-4 theme-subtle border border-cyan-500/30 space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <span className="font-display text-xs sm:text-sm font-bold">
                    Progressive Web App (PWA) &amp; Service Worker Engine (`{pwaStatus?.cacheVersion || 'nex-store-v11'}`)
                  </span>
                </div>
                <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 font-mono-num text-[10px] font-bold text-emerald-300">
                  MANIFEST + SW ACTIVE
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {(
                  pwaStatus?.offlineCapabilities || [
                    'Full 12-SKU Hardware Catalog & 4-Angle Procedural SVG CAD Cache',
                    'Installed App Sandbox Runtime (/api/sandbox/:id)',
                    'Offline Cart, Wishlist & BTO Rig Configuration Persistence',
                    'Smooth Mobile Slide-Over Sidebar Drawer & Bottom Dock'
                  ]
                ).map((item, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-xl px-3 py-1.5 theme-card">
                    <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                    <span className="text-[11px] truncate">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create New Custom Subscription Plan Modal */}
      {showNewPlanModal && (
        <div
          onClick={() => setShowNewPlanModal(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4"
        >
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleCreateCustomPlan}
            className="w-full max-w-lg rounded-3xl p-6 space-y-4 theme-card shadow-2xl border border-indigo-500/40"
          >
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <h3 className="font-display text-base font-bold">
                Create New Subscription Tier (Admin / Developer)
              </h3>
              <button
                type="button"
                onClick={() => setShowNewPlanModal(false)}
                className="text-xs theme-text-muted cursor-pointer"
              >
                Close
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-mono-num text-[10px] uppercase theme-text-muted mb-1">
                  Plan Name
                </label>
                <input
                  type="text"
                  required
                  value={newPlanForm.name}
                  onChange={(e) => setNewPlanForm({ ...newPlanForm, name: e.target.value })}
                  className="w-full rounded-xl px-3 py-2 text-xs theme-input"
                />
              </div>
              <div>
                <label className="block font-mono-num text-[10px] uppercase theme-text-muted mb-1">
                  Badge
                </label>
                <input
                  type="text"
                  value={newPlanForm.badge}
                  onChange={(e) => setNewPlanForm({ ...newPlanForm, badge: e.target.value })}
                  className="w-full rounded-xl px-3 py-2 text-xs theme-input"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-mono-num text-[10px] uppercase theme-text-muted mb-1">
                  Monthly Price (USD)
                </label>
                <input
                  type="number"
                  value={newPlanForm.price_monthly}
                  onChange={(e) => setNewPlanForm({ ...newPlanForm, price_monthly: e.target.value })}
                  className="w-full rounded-xl px-3 py-2 text-xs theme-input"
                />
              </div>
              <div>
                <label className="block font-mono-num text-[10px] uppercase theme-text-muted mb-1">
                  Yearly Price (USD)
                </label>
                <input
                  type="number"
                  value={newPlanForm.price_yearly}
                  onChange={(e) => setNewPlanForm({ ...newPlanForm, price_yearly: e.target.value })}
                  className="w-full rounded-xl px-3 py-2 text-xs theme-input"
                />
              </div>
            </div>
            <div>
              <label className="block font-mono-num text-[10px] uppercase theme-text-muted mb-1">
                Tagline
              </label>
              <input
                type="text"
                value={newPlanForm.tagline}
                onChange={(e) => setNewPlanForm({ ...newPlanForm, tagline: e.target.value })}
                className="w-full rounded-xl px-3 py-2 text-xs theme-input"
              />
            </div>
            <div>
              <label className="block font-mono-num text-[10px] uppercase theme-text-muted mb-1">
                Included Features (1 per line)
              </label>
              <textarea
                rows={4}
                value={newPlanForm.featuresText}
                onChange={(e) => setNewPlanForm({ ...newPlanForm, featuresText: e.target.value })}
                className="w-full rounded-xl px-3 py-2 text-xs font-mono-num theme-input"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="submit"
                className="rounded-xl bg-emerald-500 hover:bg-emerald-400 px-5 py-2 text-xs font-bold text-slate-950 cursor-pointer"
              >
                Save Plan to SQLite
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
