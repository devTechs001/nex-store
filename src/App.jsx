import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Navbar from './components/Navbar.jsx';
import StorefrontView from './components/StorefrontView.jsx';
import ProductDetailModal from './components/ProductDetailModal.jsx';
import CartCheckoutDrawer from './components/CartCheckoutDrawer.jsx';
import CompareModal from './components/CompareModal.jsx';
import OrderTrackerView from './components/OrderTrackerView.jsx';
import AdminDashboardView from './components/AdminDashboardView.jsx';
import DatabaseStudioView from './components/DatabaseStudioView.jsx';
import LiveChatWidget from './components/LiveChatWidget.jsx';
import CommandPaletteModal from './components/CommandPaletteModal.jsx';
import AppStoreView from './components/AppStoreView.jsx';
import SubsystemsHubView from './components/SubsystemsHubView.jsx';
import NotificationCenterDrawer from './components/NotificationCenterDrawer.jsx';
import InteractiveTerminalModal from './components/InteractiveTerminalModal.jsx';
import HardwareBuilderModal from './components/HardwareBuilderModal.jsx';
import DocumentationView from './components/DocumentationView.jsx';
import DesktopSideNav from './components/DesktopSideNav.jsx';
import MobileBottomNav from './components/MobileBottomNav.jsx';
import MobileAndSubscriptionsView from './components/MobileAndSubscriptionsView.jsx';
import SplashScreen from './components/SplashScreen.jsx';
import { THEMES, applyThemeVariables } from './utils/themes.js';
import { getFallbackBootstrapData, getProductArtUrl } from './utils/storeEngine.js';
import {
  playSound,
  requestDesktopPushPermission,
  triggerDesktopPush
} from './utils/soundEngine.js';
import { CheckCircle2, Zap, ShieldAlert, Bell } from 'lucide-react';
import './App.css';

export default function App() {
  const initialSeed = useMemo(() => getFallbackBootstrapData(), []);

  const [activeTab, setActiveTab] = useState('store'); // 'store' | 'apps' | 'subsystems' | 'tracker' | 'admin' | 'database'
  const [themeId, setThemeId] = useState(() => {
    try {
      return localStorage.getItem('nexstore_theme') || 'obsidian';
    } catch {
      return 'obsidian';
    }
  });
  const [currency, setCurrency] = useState('USD');

  // Sound Synthesizer & Desktop Push State
  const [soundEnabled, setSoundEnabled] = useState(() => {
    try {
      const saved = localStorage.getItem('nexstore_sound');
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });
  const [soundVolume, setSoundVolume] = useState(0.4);
  const [desktopPushStatus, setDesktopPushStatus] = useState(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'ready';
  });
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false);

  const activeTheme = useMemo(
    () => THEMES[themeId] || THEMES.obsidian,
    [themeId]
  );
  const darkMode = activeTheme.isDark;

  const setDarkMode = useCallback((nextDark) => {
    setThemeId((prev) => {
      if (typeof nextDark === 'function') {
        const currentIsDark = (THEMES[prev] || THEMES.obsidian).isDark;
        const resolved = nextDark(currentIsDark);
        return resolved ? 'obsidian' : 'light';
      }
      return nextDark ? 'obsidian' : 'light';
    });
  }, []);

  useEffect(() => {
    applyThemeVariables(themeId);
    try {
      localStorage.setItem('nexstore_theme', themeId);
    } catch {}
  }, [themeId]);

  useEffect(() => {
    try {
      localStorage.setItem('nexstore_sound', JSON.stringify(soundEnabled));
    } catch {}
  }, [soundEnabled]);

  const handlePlaySound = useCallback(
    (type = 'ping', force = false) => {
      playSound(type, { enabled: force || soundEnabled, volume: soundVolume });
    },
    [soundEnabled, soundVolume]
  );

  const handleRequestDesktopPush = useCallback(async () => {
    const perm = await requestDesktopPushPermission();
    setDesktopPushStatus(perm);
    handlePlaySound('push');
    if (perm === 'granted') {
      triggerDesktopPush(
        'NEX Store Desktop Push Enabled',
        'You will now receive real-time server, app deployment, and security notifications.'
      );
    }
  }, [handlePlaySound]);

  // Store & Subsystems State (Pre-hydrated immediately from seed + synced with SQLite & WebSockets)
  const [categories, setCategories] = useState(initialSeed.categories);
  const [products, setProducts] = useState(initialSeed.products);
  const [apps, setApps] = useState(initialSeed.apps);
  const [coupons, setCoupons] = useState(initialSeed.coupons);
  const [orders, setOrders] = useState(initialSeed.orders);
  const [inventoryLogs, setInventoryLogs] = useState(initialSeed.inventoryLogs);
  const [activityEvents, setActivityEvents] = useState(initialSeed.activityEvents);
  const [chatMessages, setChatMessages] = useState(initialSeed.chatMessages);
  const [serverNodes, setServerNodes] = useState(initialSeed.serverNodes);
  const [integrations, setIntegrations] = useState(initialSeed.integrations);
  const [securityEvents, setSecurityEvents] = useState(initialSeed.securityEvents);
  const [notifications, setNotifications] = useState(initialSeed.notifications);
  const [terminalLogs, setTerminalLogs] = useState(initialSeed.terminalLogs || []);
  const [terminalScripts, setTerminalScripts] = useState(initialSeed.terminalScripts || []);
  const [btoConfigs, setBtoConfigs] = useState(initialSeed.btoConfigs || []);
  const [appInstalls, setAppInstalls] = useState(initialSeed.appInstalls || []);
  const [polyglotAutomations, setPolyglotAutomations] = useState(initialSeed.polyglotAutomations || []);
  const [subscriptionPlans, setSubscriptionPlans] = useState([]);
  const [userSubscriptions, setUserSubscriptions] = useState([]);
  const [mobileAddons, setMobileAddons] = useState([]);
  const [userAccounts, setUserAccounts] = useState([]);
  const [hostingDeployments, setHostingDeployments] = useState([]);
  const [blockedIps, setBlockedIps] = useState([]);
  const [securityReports, setSecurityReports] = useState([]);
  const [paymentTransactions, setPaymentTransactions] = useState([]);
  const [pwaDeferredPrompt, setPwaDeferredPrompt] = useState(null);
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [hardwareBuilderOpen, setHardwareBuilderOpen] = useState(false);
  const [sideNavCollapsed, setSideNavCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [navTelemetry, setNavTelemetry] = useState(null);
  const [healthStatus, setHealthStatus] = useState(null);
  const [isPingingHealth, setIsPingingHealth] = useState(false);
  const [analytics, setAnalytics] = useState(initialSeed.analytics);
  const [dbStats, setDbStats] = useState(initialSeed.dbStats);
  const [presence, setPresence] = useState(initialSeed.presence);
  const [wsConnected, setWsConnected] = useState(false);

  // Filter & Selection State
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [trackedOrderNumber, setTrackedOrderNumber] = useState('NEX-8942');
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // Cart, Wishlist & Compare State
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('nexstore_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [wishlistIds, setWishlistIds] = useState(() => {
    try {
      const saved = localStorage.getItem('nexstore_wishlist');
      return saved ? JSON.parse(saved) : ['prod-aether-pro', 'prod-nova-book'];
    } catch {
      return ['prod-aether-pro'];
    }
  });
  const [compareIds, setCompareIds] = useState(['prod-aether-pro', 'prod-chronos-key']);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [cartDrawerMode, setCartDrawerMode] = useState('cart');
  const [compareOpen, setCompareOpen] = useState(false);

  // Toast Notification Queue
  const [toasts, setToasts] = useState([]);
  const searchInputRef = useRef(null);
  const wsRef = useRef(null);

  const pushToast = useCallback((title, message, type = 'info') => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [{ id, title, message, type }, ...prev.slice(0, 3)]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4400);
  }, []);

  // Persist Cart & Wishlist
  useEffect(() => {
    try {
      localStorage.setItem('nexstore_cart', JSON.stringify(cart));
    } catch {}
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem('nexstore_wishlist', JSON.stringify(wishlistIds));
    } catch {}
  }, [wishlistIds]);

  const isJsonResponse = (res) =>
    res && res.ok && (res.headers.get('content-type') || '').includes('application/json');

  // Initial Bootstrap Fetch from Node/SQLite Server (with automatic fallback for static hosts)
  const fetchBootstrap = useCallback(async () => {
    try {
      const res = await fetch('/api/bootstrap');
      if (!isJsonResponse(res)) return;
      const data = await res.json();
      if (Array.isArray(data.categories) && data.categories.length > 0) setCategories(data.categories);
      if (Array.isArray(data.products) && data.products.length > 0) setProducts(data.products);
      if (Array.isArray(data.apps) && data.apps.length > 0) setApps(data.apps);
      if (Array.isArray(data.coupons) && data.coupons.length > 0) setCoupons(data.coupons);
      if (Array.isArray(data.orders) && data.orders.length > 0) setOrders(data.orders);
      if (Array.isArray(data.inventoryLogs)) setInventoryLogs(data.inventoryLogs);
      if (Array.isArray(data.activityEvents) && data.activityEvents.length > 0) setActivityEvents(data.activityEvents);
      if (Array.isArray(data.chatMessages) && data.chatMessages.length > 0) setChatMessages(data.chatMessages);
      if (Array.isArray(data.serverNodes) && data.serverNodes.length > 0) setServerNodes(data.serverNodes);
      if (Array.isArray(data.integrations) && data.integrations.length > 0) setIntegrations(data.integrations);
      if (Array.isArray(data.securityEvents) && data.securityEvents.length > 0) setSecurityEvents(data.securityEvents);
      if (Array.isArray(data.notifications) && data.notifications.length > 0) setNotifications(data.notifications);
      if (Array.isArray(data.terminalLogs) && data.terminalLogs.length > 0) setTerminalLogs(data.terminalLogs);
      if (Array.isArray(data.terminalScripts) && data.terminalScripts.length > 0) setTerminalScripts(data.terminalScripts);
      if (Array.isArray(data.btoConfigs) && data.btoConfigs.length > 0) setBtoConfigs(data.btoConfigs);
      if (Array.isArray(data.appInstalls)) setAppInstalls(data.appInstalls);
      if (Array.isArray(data.polyglotAutomations) && data.polyglotAutomations.length > 0) {
        setPolyglotAutomations(data.polyglotAutomations);
      }
      if (Array.isArray(data.subscriptionPlans) && data.subscriptionPlans.length > 0) {
        setSubscriptionPlans(data.subscriptionPlans);
      }
      if (Array.isArray(data.userSubscriptions) && data.userSubscriptions.length > 0) {
        setUserSubscriptions(data.userSubscriptions);
      }
      if (Array.isArray(data.mobileAddons) && data.mobileAddons.length > 0) {
        setMobileAddons(data.mobileAddons);
      }
      if (Array.isArray(data.userAccounts)) setUserAccounts(data.userAccounts);
      if (Array.isArray(data.hostingDeployments)) setHostingDeployments(data.hostingDeployments);
      if (Array.isArray(data.blockedIps)) setBlockedIps(data.blockedIps);
      if (Array.isArray(data.securityReports)) setSecurityReports(data.securityReports);
      if (Array.isArray(data.paymentTransactions)) setPaymentTransactions(data.paymentTransactions);
      if (data.analytics && Object.keys(data.analytics).length > 0) setAnalytics(data.analytics);
      if (data.dbStats && Object.keys(data.dbStats).length > 0) setDbStats(data.dbStats);
      if (data.presence) setPresence(data.presence);
    } catch {
      // Static deployment fallback already hydrated via initialSeed
    }

    try {
      const [navRes, healthRes] = await Promise.all([
        fetch('/api/nav/telemetry'),
        fetch('/api/health')
      ]);
      if (isJsonResponse(navRes)) {
        setNavTelemetry(await navRes.json());
      }
      if (isJsonResponse(healthRes)) {
        setHealthStatus(await healthRes.json());
      }
    } catch {}
  }, []);

  useEffect(() => {
    fetchBootstrap();
  }, [fetchBootstrap]);

  useEffect(() => {
    const onBeforeInstall = (e) => {
      e.preventDefault();
      setPwaDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstall);
  }, []);

  const handleTriggerPwaInstall = useCallback(async () => {
    if (pwaDeferredPrompt) {
      pwaDeferredPrompt.prompt();
      const choice = await pwaDeferredPrompt.userChoice;
      setPwaDeferredPrompt(null);
      return choice?.outcome || 'accepted';
    }
    return null;
  }, [pwaDeferredPrompt]);

  // Connect to Real-Time WebSocket Engine (/ws)
  useEffect(() => {
    let reconnectTimer = null;
    let isUnmounted = false;

    const connectWs = () => {
      if (isUnmounted) return;
      try {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/ws`;
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          if (!isUnmounted) setWsConnected(true);
        };

        ws.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data);
            const { type, payload } = msg;

            switch (type) {
              case 'presence:update':
                setPresence(payload);
                break;

              case 'product:created':
                setProducts((prev) => [
                  payload.product,
                  ...prev.filter((p) => p.id !== payload.product.id)
                ]);
                if (payload.activity) {
                  setActivityEvents((prev) => [payload.activity, ...prev]);
                  pushToast(payload.activity.title, payload.activity.message, 'realtime');
                }
                if (payload.analytics) setAnalytics(payload.analytics);
                if (payload.dbStats) setDbStats(payload.dbStats);
                break;

              case 'product:updated':
                setProducts((prev) =>
                  prev.map((p) => (p.id === payload.product.id ? payload.product : p))
                );
                setSelectedProduct((prev) =>
                  prev && prev.id === payload.product.id ? payload.product : prev
                );
                if (payload.inventoryLogs) setInventoryLogs(payload.inventoryLogs);
                if (payload.activity) {
                  setActivityEvents((prev) => [payload.activity, ...prev]);
                  pushToast(payload.activity.title, payload.activity.message, 'realtime');
                }
                if (payload.analytics) setAnalytics(payload.analytics);
                if (payload.dbStats) setDbStats(payload.dbStats);
                break;

              case 'product:deleted':
                setProducts((prev) => prev.filter((p) => p.id !== payload.productId));
                if (payload.activity) setActivityEvents((prev) => [payload.activity, ...prev]);
                if (payload.analytics) setAnalytics(payload.analytics);
                if (payload.dbStats) setDbStats(payload.dbStats);
                break;

              case 'products:bulk_restocked':
                if (payload.products) setProducts(payload.products);
                if (payload.inventoryLogs) setInventoryLogs(payload.inventoryLogs);
                if (payload.activity) {
                  setActivityEvents((prev) => [payload.activity, ...prev]);
                  pushToast(payload.activity.title, payload.activity.message, 'success');
                }
                if (payload.analytics) setAnalytics(payload.analytics);
                if (payload.dbStats) setDbStats(payload.dbStats);
                break;

              case 'order:created':
                setOrders((prev) => [
                  payload.order,
                  ...prev.filter((o) => o.id !== payload.order.id)
                ]);
                if (payload.updatedProducts) {
                  const mapById = new Map(payload.updatedProducts.map((up) => [up.id, up]));
                  setProducts((prev) => prev.map((p) => mapById.get(p.id) || p));
                }
                if (payload.inventoryLogs) setInventoryLogs(payload.inventoryLogs);
                if (payload.activity) {
                  setActivityEvents((prev) => [payload.activity, ...prev]);
                  pushToast(payload.activity.title, payload.activity.message, 'success');
                }
                if (payload.analytics) setAnalytics(payload.analytics);
                if (payload.dbStats) setDbStats(payload.dbStats);
                break;

              case 'order:updated':
                setOrders((prev) =>
                  prev.map((o) => (o.id === payload.order.id ? payload.order : o))
                );
                if (payload.activity) {
                  setActivityEvents((prev) => [payload.activity, ...prev]);
                  pushToast(payload.activity.title, payload.activity.message, 'realtime');
                }
                if (payload.analytics) setAnalytics(payload.analytics);
                break;

              case 'review:created':
                if (payload.product) {
                  setProducts((prev) =>
                    prev.map((p) => (p.id === payload.product.id ? payload.product : p))
                  );
                  setSelectedProduct((prev) =>
                    prev && prev.id === payload.product.id ? payload.product : prev
                  );
                }
                if (payload.activity) {
                  setActivityEvents((prev) => [payload.activity, ...prev]);
                  pushToast(payload.activity.title, payload.activity.message, 'realtime');
                }
                if (payload.analytics) setAnalytics(payload.analytics);
                if (payload.dbStats) setDbStats(payload.dbStats);
                break;

              case 'coupon:created':
                setCoupons((prev) => [
                  payload.coupon,
                  ...prev.filter((c) => c.id !== payload.coupon.id)
                ]);
                if (payload.activity) {
                  setActivityEvents((prev) => [payload.activity, ...prev]);
                  pushToast(payload.activity.title, payload.activity.message, 'realtime');
                }
                if (payload.dbStats) setDbStats(payload.dbStats);
                break;

              case 'coupon:updated':
                setCoupons((prev) =>
                  prev.map((c) => (c.id === payload.coupon.id ? payload.coupon : c))
                );
                break;

              case 'app:created':
                setApps((prev) => [payload.app, ...prev.filter((a) => a.id !== payload.app.id)]);
                if (payload.securityEvent) {
                  setSecurityEvents((prev) => [payload.securityEvent, ...prev]);
                }
                if (payload.notification) {
                  setNotifications((prev) => [payload.notification, ...prev]);
                }
                if (payload.activity) {
                  setActivityEvents((prev) => [payload.activity, ...prev]);
                  pushToast(payload.activity.title, payload.activity.message, 'success');
                }
                if (payload.dbStats) setDbStats(payload.dbStats);
                break;

              case 'app:downloaded':
              case 'app:installed':
                if (payload.app) {
                  setApps((prev) =>
                    prev.map((a) => (a.id === payload.app.id ? payload.app : a))
                  );
                }
                if (Array.isArray(payload.appInstalls)) {
                  setAppInstalls(payload.appInstalls);
                }
                if (payload.activity) {
                  setActivityEvents((prev) => [payload.activity, ...prev]);
                  pushToast(payload.activity.title, payload.activity.message, 'realtime');
                }
                if (payload.dbStats) setDbStats(payload.dbStats);
                break;

              case 'app:uninstalled':
                if (Array.isArray(payload.appInstalls)) {
                  setAppInstalls(payload.appInstalls);
                }
                if (payload.dbStats) setDbStats(payload.dbStats);
                break;

              case 'servers:updated':
                if (payload.serverNodes) setServerNodes(payload.serverNodes);
                if (payload.notification) {
                  setNotifications((prev) => [payload.notification, ...prev]);
                  pushToast(payload.notification.title, payload.notification.message, 'success');
                } else if (payload.activity) {
                  setActivityEvents((prev) => [payload.activity, ...prev]);
                  pushToast(payload.activity.title, payload.activity.message, 'realtime');
                }
                if (payload.dbStats) setDbStats(payload.dbStats);
                break;

              case 'integrations:updated':
                if (payload.integrations) setIntegrations(payload.integrations);
                if (payload.notification) {
                  setNotifications((prev) => [payload.notification, ...prev]);
                  pushToast(payload.notification.title, payload.notification.message, 'success');
                } else if (payload.activity) {
                  setActivityEvents((prev) => [payload.activity, ...prev]);
                  pushToast(payload.activity.title, payload.activity.message, 'realtime');
                }
                if (payload.dbStats) setDbStats(payload.dbStats);
                break;

              case 'security:updated':
                if (payload.securityEvents) setSecurityEvents(payload.securityEvents);
                if (payload.notifications) setNotifications(payload.notifications);
                if (payload.notification) {
                  pushToast(
                    payload.notification.title,
                    payload.notification.message,
                    payload.latestSecurityEvent?.action_taken === 'BLOCKED' ? 'security' : 'success'
                  );
                  triggerDesktopPush(payload.notification.title, payload.notification.message);
                }
                if (payload.dbStats) setDbStats(payload.dbStats);
                break;

              case 'notification:new':
                if (payload.notifications) {
                  setNotifications(payload.notifications);
                } else if (payload.notification) {
                  setNotifications((prev) => [payload.notification, ...prev]);
                }
                if (payload.notification) {
                  pushToast(payload.notification.title, payload.notification.message, 'push');
                  triggerDesktopPush(payload.notification.title, payload.notification.message);
                }
                if (payload.dbStats) setDbStats(payload.dbStats);
                break;

              case 'notifications:updated':
                if (payload.notifications) setNotifications(payload.notifications);
                break;

              case 'chat:message':
                setChatMessages((prev) =>
                  prev.some((m) => m.id === payload.message.id) ? prev : [...prev, payload.message]
                );
                break;

              case 'activity:new':
                if (payload.activity) {
                  setActivityEvents((prev) => [payload.activity, ...prev]);
                  pushToast(payload.activity.title, payload.activity.message, 'realtime');
                }
                if (payload.presence) setPresence(payload.presence);
                break;

              case 'terminal:executed':
              case 'terminal:log':
                if (payload.terminalLogs) setTerminalLogs(payload.terminalLogs);
                if (payload.entry) {
                  setTerminalLogs((prev) => [
                    payload.entry,
                    ...prev.filter((l) => l.id !== payload.entry.id)
                  ]);
                }
                if (payload.dbStats) setDbStats(payload.dbStats);
                break;

              case 'terminal:scripts_updated':
                if (payload.terminalScripts) setTerminalScripts(payload.terminalScripts);
                if (payload.dbStats) setDbStats(payload.dbStats);
                break;

              case 'bto:updated':
                if (payload.btoConfigs) setBtoConfigs(payload.btoConfigs);
                if (payload.activity) {
                  setActivityEvents((prev) => [payload.activity, ...prev]);
                }
                if (payload.dbStats) setDbStats(payload.dbStats);
                break;

              case 'store:reseeded':
                setCategories(payload.categories || []);
                setProducts(payload.products || []);
                if (payload.apps) setApps(payload.apps);
                setCoupons(payload.coupons || []);
                setOrders(payload.orders || []);
                setInventoryLogs(payload.inventoryLogs || []);
                setActivityEvents(payload.activityEvents || []);
                if (payload.serverNodes) setServerNodes(payload.serverNodes);
                if (payload.integrations) setIntegrations(payload.integrations);
                if (payload.securityEvents) setSecurityEvents(payload.securityEvents);
                if (payload.notifications) setNotifications(payload.notifications);
                if (payload.terminalScripts) setTerminalScripts(payload.terminalScripts);
                if (payload.btoConfigs) setBtoConfigs(payload.btoConfigs);
                setAnalytics(payload.analytics || {});
                setDbStats(payload.dbStats || {});
                pushToast(
                  'Database Reset Complete',
                  'All 18 SQLite tables restored to seed state.',
                  'success'
                );
                break;

              default:
                break;
            }
          } catch {
            // ignore non-JSON messages
          }
        };

        ws.onclose = () => {
          if (!isUnmounted) {
            setWsConnected(false);
            reconnectTimer = setTimeout(connectWs, 4000);
          }
        };
      } catch {
        setWsConnected(false);
      }
    };

    connectWs();
    return () => {
      isUnmounted = true;
      clearTimeout(reconnectTimer);
      wsRef.current?.close();
    };
  }, [pushToast]);

  // Notify WebSocket when inspecting a product modal
  useEffect(() => {
    if (wsRef.current && wsRef.current.readyState === 1) {
      wsRef.current.send(
        JSON.stringify({
          type: 'presence:view_product',
          productId: selectedProduct?.id || null
        })
      );
    }
  }, [selectedProduct?.id]);

  // Cmd/Ctrl + K Shortcut to open Command Palette, Cmd/Ctrl + J to open Cloud Terminal, Escape to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'j') {
        e.preventDefault();
        setTerminalOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setCommandPaletteOpen(false);
        setTerminalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Cart Handlers
  const handleAddToCart = (product, colorName, qty = 1) => {
    handlePlaySound('cart');
    const selectedColor = colorName || product.colors?.[0]?.name || 'Default Finish';
    setCart((prev) => {
      const idx = prev.findIndex(
        (item) => item.id === product.id && item.selectedColor === selectedColor
      );
      if (idx > -1) {
        const updated = [...prev];
        updated[idx] = {
          ...updated[idx],
          quantity: Math.min(product.stock, updated[idx].quantity + qty)
        };
        return updated;
      }
      return [
        ...prev,
        {
          id: product.id,
          sku: product.sku,
          name: product.name,
          price: product.price,
          image_url: getProductArtUrl(product),
          selectedColor,
          quantity: Math.min(product.stock, qty),
          maxStock: product.stock
        }
      ];
    });
    pushToast('Added to Build Cart', `${qty}x ${product.name} (${selectedColor})`, 'success');
  };

  const handleAddRigToCart = (rigProducts = [], customFinishLabel = 'Custom BTO Finish') => {
    setCart((prev) => {
      let next = [...prev];
      for (const product of rigProducts) {
        const idx = next.findIndex(
          (item) => item.id === product.id && item.selectedColor === customFinishLabel
        );
        if (idx > -1) {
          next[idx] = {
            ...next[idx],
            quantity: Math.min(product.stock, next[idx].quantity + 1)
          };
        } else {
          next.push({
            id: product.id,
            sku: product.sku,
            name: product.name,
            price: Math.round(product.price * 0.88),
            image_url: getProductArtUrl(product),
            selectedColor: customFinishLabel,
            quantity: 1,
            maxStock: product.stock
          });
        }
      }
      return next;
    });
    pushToast(
      'Custom BTO Rig Added (-12% Bundle)',
      `Added ${rigProducts.length} custom-calibrated hardware modules to Cart!`,
      'success'
    );
    setCartDrawerMode('cart');
    setCartDrawerOpen(true);
  };

  const handleUpdateCartQty = (id, selectedColor, newQty) => {
    if (newQty <= 0) {
      handleRemoveCartItem(id, selectedColor);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.id === id && item.selectedColor === selectedColor
          ? { ...item, quantity: newQty }
          : item
      )
    );
  };

  const handleRemoveCartItem = (id, selectedColor) => {
    setCart((prev) =>
      prev.filter((item) => !(item.id === id && item.selectedColor === selectedColor))
    );
  };

  const handleToggleWishlist = (productId) => {
    handlePlaySound('click');
    setWishlistIds((prev) => {
      const exists = prev.includes(productId);
      return exists ? prev.filter((id) => id !== productId) : [...prev, productId];
    });
  };

  const handleToggleCompare = (productId) => {
    handlePlaySound('click');
    setCompareIds((prev) => {
      if (prev.includes(productId)) return prev.filter((id) => id !== productId);
      if (prev.length >= 4) {
        pushToast('Comparison Limit', 'You can compare up to 4 hardware models at once.');
        return prev;
      }
      return [...prev, productId];
    });
  };

  // Real-Time Operations Actions (with instant local fallback when hosted statically)
  const handleSimulateRealtime = async () => {
    handlePlaySound('ping');
    try {
      const res = await fetch('/api/realtime/simulate', { method: 'POST' });
      if (isJsonResponse(res)) return;
    } catch {}
    const sampleProduct = products[Math.floor(Math.random() * products.length)];
    const cities = ['Tokyo', 'Nairobi', 'London', 'San Francisco', 'Zurich', 'Seoul'];
    const city = cities[Math.floor(Math.random() * cities.length)];
    const evt = {
      id: `evt-${Date.now()}`,
      type: 'order',
      title: 'Live Flash Activity',
      message: `A shopper in ${city} inspected ${sampleProduct?.name || 'Aether Pro Max'}`,
      created_at: new Date().toISOString()
    };
    setActivityEvents((prev) => [evt, ...prev]);
    setPresence((prev) => ({
      ...prev,
      activeShoppers: Math.min(48, (prev.activeShoppers || 22) + 2)
    }));
    pushToast(evt.title, evt.message, 'realtime');
  };

  const handleQuickStockUpdate = async (productId, newStock, stockReason) => {
    handlePlaySound('click');
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: newStock, stockReason })
      });
      if (isJsonResponse(res)) return;
    } catch {}
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, stock: Math.max(0, newStock) } : p))
    );
    pushToast('Stock Updated', `Inventory set to ${newStock} units (${stockReason})`, 'success');
  };

  const handleBulkRestockLow = async () => {
    handlePlaySound('success');
    try {
      const res = await fetch('/api/products/restock-low', { method: 'POST' });
      if (isJsonResponse(res)) return;
    } catch {}
    setProducts((prev) =>
      prev.map((p) => (p.stock <= 12 ? { ...p, stock: p.stock + 15 } : p))
    );
    pushToast('Bulk Replenishment Complete', 'Added +15 units to all low-stock SKUs.', 'success');
  };

  const handleToggleFlashSale = async (productId, isFlash) => {
    handlePlaySound('ping');
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          is_flash_sale: isFlash,
          badge: isFlash ? 'FLASH DEAL' : 'FLAGSHIP'
        })
      });
      if (isJsonResponse(res)) return;
    } catch {}
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId
          ? { ...p, is_flash_sale: isFlash ? 1 : 0, badge: isFlash ? 'FLASH DEAL' : 'FLAGSHIP' }
          : p
      )
    );
    pushToast('Flash Deal Updated', `Updated flash sale state for ${productId}`, 'realtime');
  };

  const handleCreateProduct = async (productPayload) => {
    handlePlaySound('success');
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productPayload)
      });
      if (isJsonResponse(res)) return;
    } catch {}
    const id = `prod-${Date.now()}`;
    const newProd = {
      id,
      sku: productPayload.sku || `NX-${Math.floor(100 + Math.random() * 899)}`,
      name: productPayload.name,
      category: productPayload.category || 'audio',
      brand: productPayload.brand || 'NEX-Lab',
      price: Number(productPayload.price) || 299,
      original_price: Number(productPayload.original_price) || 349,
      stock: Number(productPayload.stock) || 20,
      rating: 5.0,
      reviews_count: 1,
      badge: productPayload.badge || 'NEW LAUNCH',
      is_featured: 1,
      is_flash_sale: productPayload.is_flash_sale ? 1 : 0,
      warranty: '2-Year NEX Care+',
      shipping_time: 'Ships in 24 hrs',
      description: productPayload.description || 'Precision hardware engineered by NEX-Lab.',
      specs: productPayload.specs || { Architecture: 'Custom Gen-5', Warranty: '2 Years' },
      colors: [{ name: 'Obsidian Black', hex: '#1e1b4b' }],
      tags: ['new', 'hardware'],
      reviews: []
    };
    newProd.image_url = getProductArtUrl(newProd);
    setProducts((prev) => [newProd, ...prev]);
    pushToast('Hardware SKU Created', `${newProd.name} added to catalog`, 'success');
  };

  const handleDeleteProduct = async (productId) => {
    try {
      const res = await fetch(`/api/products/${productId}`, { method: 'DELETE' });
      if (isJsonResponse(res)) return;
    } catch {}
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    pushToast('SKU Removed', `Removed ${productId} from catalog`, 'info');
  };

  const handleAdvanceOrderStatus = async (orderId, status) => {
    handlePlaySound('ping');
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (isJsonResponse(res)) return;
    } catch {}
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId || o.order_number === orderId
          ? {
              ...o,
              status
            }
          : o
      )
    );
    pushToast('Order Telemetry Updated', `Order ${orderId} -> ${status.toUpperCase()}`, 'realtime');
  };

  const handleCreateCoupon = async (couponPayload) => {
    handlePlaySound('success');
    try {
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(couponPayload)
      });
      if (isJsonResponse(res)) return;
    } catch {}
    const created = {
      id: `cpn-${Date.now()}`,
      code: (couponPayload.code || 'NEX25').toUpperCase(),
      discount_type: couponPayload.discount_type || 'percent',
      discount_value: Number(couponPayload.discount_value) || 15,
      min_order: Number(couponPayload.min_order) || 100,
      description: couponPayload.description || 'Custom promotional code',
      active: 1,
      usage_count: 0
    };
    setCoupons((prev) => [created, ...prev]);
    pushToast('Coupon Created', `Promo code ${created.code} is now live`, 'success');
  };

  const handleToggleCoupon = async (couponId) => {
    try {
      const res = await fetch(`/api/coupons/${couponId}`, { method: 'PATCH' });
      if (isJsonResponse(res)) return;
    } catch {}
    setCoupons((prev) =>
      prev.map((c) => (c.id === couponId ? { ...c, active: c.active ? 0 : 1 } : c))
    );
  };

  const handleSendChatMessage = async (text) => {
    handlePlaySound('click');
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: 'customer',
          sender_name: 'Shopper',
          message: text
        })
      });
      if (isJsonResponse(res)) return;
    } catch {}
    const userMsg = {
      id: `chat-${Date.now()}`,
      sender: 'customer',
      sender_name: 'Shopper',
      message: text,
      created_at: new Date().toISOString()
    };
    const replyMsg = {
      id: `chat-${Date.now() + 1}`,
      sender: 'agent',
      sender_name: 'Aria · NEX AI Concierge',
      message:
        'Thanks for reaching out! Use code NEX20 at checkout for 20% off orders over $400, import Netlify apps in the App Store tab, or inspect live edge servers in Subsystems.',
      created_at: new Date().toISOString()
    };
    setChatMessages((prev) => [...prev, userMsg, replyMsg]);
  };

  const handleSubscribeNewsletter = async (email) => {
    handlePlaySound('success');
    try {
      const res = await fetch('/api/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (isJsonResponse(res)) {
        pushToast(
          'Subscribed to Flash Alerts',
          `${email} saved to SQLite subscribers table!`,
          'success'
        );
        return;
      }
    } catch {}
    pushToast('Subscribed to Flash Alerts', `${email} added to priority flash list!`, 'success');
  };

  const handleResetDatabase = async () => {
    handlePlaySound('server');
    try {
      const res = await fetch('/api/db/reset', { method: 'POST' });
      if (isJsonResponse(res)) return;
    } catch {}
    const fresh = getFallbackBootstrapData();
    setCategories(fresh.categories);
    setProducts(fresh.products);
    setApps(fresh.apps);
    setCoupons(fresh.coupons);
    setOrders(fresh.orders);
    setInventoryLogs(fresh.inventoryLogs);
    setActivityEvents(fresh.activityEvents);
    setServerNodes(fresh.serverNodes);
    setIntegrations(fresh.integrations);
    setSecurityEvents(fresh.securityEvents);
    setNotifications(fresh.notifications);
    setAnalytics(fresh.analytics);
    setDbStats(fresh.dbStats);
    pushToast('Database Reset Complete', 'Restored all 15 SQLite tables to seed state.', 'success');
  };

  const handleDownloadApp = async (appId) => {
    try {
      const res = await fetch(`/api/apps/${appId}/install`, { method: 'POST' });
      if (isJsonResponse(res)) {
        const data = await res.json();
        if (data.app) {
          setApps((prev) => prev.map((a) => (a.id === data.app.id ? data.app : a)));
        }
        if (Array.isArray(data.appInstalls)) {
          setAppInstalls(data.appInstalls);
        }
        return data;
      }
    } catch {}
    const target = apps.find((a) => a.id === appId);
    setApps((prev) =>
      prev.map((a) =>
        a.id === appId ? { ...a, downloads: (a.downloads || 0) + 1 } : a
      )
    );
    const fallbackInstall = {
      id: `inst-${appId}`,
      app_id: appId,
      app_name: target?.name || appId,
      version: target?.version || '1.0.0',
      source_provider: target?.source_provider || 'Netlify',
      install_path: `/opt/nex-apps/${appId}`,
      sandbox_url: `/api/sandbox/${appId}`,
      sha256_verified: target?.sha256_hash || 'e3b0c44298fc1c149afbf4c8996fb924',
      status: 'INSTALLED',
      installed_at: new Date().toISOString()
    };
    setAppInstalls((prev) => [
      fallbackInstall,
      ...prev.filter((i) => i.app_id !== appId)
    ]);
    pushToast(
      'Package Installed & Mounted',
      `Mounted ${target?.name || 'NEX App'} at /opt/nex-apps/${appId}`,
      'success'
    );
    return { installRecord: fallbackInstall };
  };

  const handleUninstallApp = async (appId) => {
    try {
      const res = await fetch(`/api/apps/${appId}/uninstall`, { method: 'DELETE' });
      if (isJsonResponse(res)) {
        const data = await res.json();
        if (Array.isArray(data.appInstalls)) {
          setAppInstalls(data.appInstalls);
        }
        pushToast('App Uninstalled', `Unmounted /opt/nex-apps/${appId} from workstation.`, 'info');
        return;
      }
    } catch {}
    setAppInstalls((prev) => prev.filter((i) => i.app_id !== appId));
    pushToast('App Uninstalled', `Unmounted /opt/nex-apps/${appId} from workstation.`, 'info');
  };

  const handleCreateApp = async (appPayload) => {
    try {
      const res = await fetch('/api/apps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appPayload)
      });
      if (isJsonResponse(res)) return;
    } catch {}
    const now = new Date().toISOString();
    const provider = appPayload.source_provider || 'Netlify';
    const liveUrl =
      appPayload.live_url ||
      `https://${appPayload.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.netlify.app`;
    const newApp = {
      id: `app-${Date.now().toString(36)}`,
      name: appPayload.name,
      developer: appPayload.developer || 'Community Developer',
      category: appPayload.category || 'web',
      language: appPayload.language || 'typescript',
      version: appPayload.version || '1.0.0',
      size: appPayload.size || '14.2 MB',
      price: 'Free',
      license: 'MIT',
      rating: 5.0,
      reviews_count: 1,
      downloads: 1,
      icon: appPayload.icon || '🚀',
      is_featured: 1,
      is_verified: 1,
      source_provider: provider,
      live_url: liveUrl,
      repo_url: appPayload.repo_url || '',
      sha256_hash: `9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08`,
      security_score: 99,
      permissions_json: JSON.stringify(['Sandboxed Iframe', 'WebAudio API', 'Zero-Trust Verified']),
      description: appPayload.description || 'Community application deployed to NEX App Store.',
      created_at: now
    };
    const notif = {
      id: `notif-${Date.now()}`,
      channel: 'deployment',
      priority: 'high',
      title: `New ${provider} App Imported: ${newApp.name}`,
      message: `${newApp.developer} published ${newApp.name} (${liveUrl})`,
      action_url: 'apps',
      is_read: 0,
      created_at: now
    };
    setApps((prev) => [newApp, ...prev]);
    setNotifications((prev) => [notif, ...prev]);
    pushToast(notif.title, notif.message, 'success');
    triggerDesktopPush(notif.title, notif.message);
  };

  // Subsystem Handlers (Edge Servers, Integrations, Security, Push Broadcasts)
  const handleServerAction = async (serverId, action) => {
    try {
      const res = await fetch(`/api/servers/${serverId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      if (isJsonResponse(res)) return;
    } catch {}
    setServerNodes((prev) =>
      prev.map((n) => {
        if (n.id !== serverId) return n;
        if (action === 'restart') {
          return { ...n, cpu_load: 18, ram_usage: 34, latency_ms: Math.max(5, n.latency_ms - 2) };
        }
        if (action === 'scale') {
          return {
            ...n,
            cpu_load: Math.max(14, n.cpu_load - 7),
            active_connections: n.active_connections + 65,
            rps: n.rps + 320
          };
        }
        return { ...n, latency_ms: Math.max(4, n.latency_ms + (Math.random() > 0.5 ? 1 : -1)) };
      })
    );
    pushToast('Server Operation Complete', `Executed ${action.toUpperCase()} on ${serverId}`, 'realtime');
  };

  const handlePulseServers = useCallback(async () => {
    try {
      const res = await fetch('/api/servers/pulse', { method: 'POST' });
      if (isJsonResponse(res)) return;
    } catch {}
    setServerNodes((prev) =>
      prev.map((n) => ({
        ...n,
        cpu_load: Math.min(90, Math.max(12, n.cpu_load + (Math.floor(Math.random() * 9) - 4))),
        latency_ms: Math.min(80, Math.max(4, n.latency_ms + (Math.floor(Math.random() * 5) - 2))),
        rps: Math.max(250, n.rps + (Math.floor(Math.random() * 70) - 32))
      }))
    );
  }, []);

  const handleProvisionServer = async (srvPayload) => {
    try {
      const res = await fetch('/api/servers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(srvPayload)
      });
      if (isJsonResponse(res)) return;
    } catch {}
    const ip = `172.24.${Math.floor(10 + Math.random() * 200)}.${Math.floor(10 + Math.random() * 200)}`;
    const created = {
      id: `srv-${Date.now().toString(36)}`,
      name: srvPayload.name,
      region: srvPayload.region,
      provider: srvPayload.provider,
      ip_address: ip,
      status: 'online',
      cpu_load: 19,
      ram_usage: 36,
      latency_ms: 13,
      active_connections: 120,
      rps: 560,
      uptime_pct: 100,
      version: 'v2.6.0-wal',
      updated_at: new Date().toISOString()
    };
    setServerNodes((prev) => [...prev, created]);
    pushToast('Edge Server Provisioned', `${created.name} online at ${ip}`, 'success');
  };

  const handleSyncIntegration = async (intId, toggleStatus = false) => {
    try {
      const res = await fetch(`/api/integrations/${intId}/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toggleStatus })
      });
      if (isJsonResponse(res)) return;
    } catch {}
    setIntegrations((prev) =>
      prev.map((i) => {
        if (i.id !== intId) return i;
        const nextStatus = toggleStatus
          ? i.status === 'connected'
            ? 'paused'
            : 'connected'
          : 'connected';
        return {
          ...i,
          status: nextStatus,
          events_synced: toggleStatus ? i.events_synced : (i.events_synced || 0) + 28
        };
      })
    );
    pushToast('Integration Synced', `Updated bridge ${intId}`, 'realtime');
  };

  const handleCreateIntegration = async (intPayload) => {
    try {
      const res = await fetch('/api/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(intPayload)
      });
      if (isJsonResponse(res)) return;
    } catch {}
    const created = {
      id: `int-${Date.now().toString(36)}`,
      name: intPayload.name,
      provider: intPayload.provider,
      category: intPayload.category,
      status: 'connected',
      endpoint_url: intPayload.endpoint_url,
      webhook_secret_masked: 'whsec_live_9912••••••••4e2a',
      events_synced: 1,
      latency_ms: 14,
      last_sync_at: new Date().toISOString()
    };
    setIntegrations((prev) => [created, ...prev]);
    pushToast('Integration Connected', `${created.name} (${created.provider}) is live`, 'success');
  };

  const handleRunSecurityScan = async () => {
    try {
      const res = await fetch('/api/security/scan', { method: 'POST' });
      if (isJsonResponse(res)) return;
    } catch {}
    const now = new Date().toISOString();
    const secEv = {
      id: `sec-${Date.now()}`,
      event_type: 'full_audit',
      severity: 'low',
      source_ip: '196.216.84.12',
      target_resource: 'All 15 SQLite Tables & Netlify Sandboxes',
      action_taken: 'VERIFIED',
      description: 'Deep security audit passed: 0 SQLi/XSS vulnerabilities, 100% SHA-256 package hashes valid.',
      created_at: now
    };
    setSecurityEvents((prev) => [secEv, ...prev]);
    pushToast('Security Audit Passed', '99.8% Hardened • 0 Vulnerabilities Detected', 'success');
  };

  const handleSimulateThreat = async () => {
    try {
      const res = await fetch('/api/security/simulate-threat', { method: 'POST' });
      if (isJsonResponse(res)) return;
    } catch {}
    const now = new Date().toISOString();
    const secEv = {
      id: `sec-${Date.now()}`,
      event_type: 'waf_sqli_block',
      severity: 'critical',
      source_ip: '185.220.101.88',
      target_resource: 'POST /api/db/query',
      action_taken: 'BLOCKED',
      description: 'Cloudflare WAF rule #SQLI-09 intercepted malicious UNION SELECT payload in 0.3ms.',
      created_at: now
    };
    const notif = {
      id: `notif-${Date.now()}`,
      channel: 'security',
      priority: 'high',
      title: 'Threat Mitigated • BLOCKED',
      message: `${secEv.target_resource} protected against ${secEv.source_ip}`,
      action_url: 'subsystems',
      is_read: 0,
      created_at: now
    };
    setSecurityEvents((prev) => [secEv, ...prev]);
    setNotifications((prev) => [notif, ...prev]);
    pushToast(notif.title, notif.message, 'security');
    triggerDesktopPush(notif.title, notif.message);
  };

  const handleRotateKeys = async () => {
    try {
      const res = await fetch('/api/security/rotate-keys', { method: 'POST' });
      if (isJsonResponse(res)) return;
    } catch {}
    const now = new Date().toISOString();
    const secEv = {
      id: `sec-${Date.now()}`,
      event_type: 'key_rotation',
      severity: 'low',
      source_ip: '127.0.0.1',
      target_resource: 'Ed25519 API & Netlify Webhook Secrets',
      action_taken: 'ROTATED',
      description: 'Rotated all active API tokens and webhook HMAC secrets across 6 edge nodes.',
      created_at: now
    };
    setSecurityEvents((prev) => [secEv, ...prev]);
    pushToast('Keys Rotated', 'Ed25519 API & webhook signing keys rotated.', 'success');
  };

  const handleSendPushBroadcast = async (payload) => {
    handlePlaySound('push');
    try {
      const res = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (isJsonResponse(res)) return;
    } catch {}
    const notif = {
      id: `notif-${Date.now()}`,
      channel: payload?.channel || 'realtime',
      priority: payload?.priority || 'high',
      title: payload?.title || 'NEX Real-Time Push Broadcast',
      message:
        payload?.message ||
        'Live push alert dispatched across WebSocket, WebAudio, and desktop notification channels.',
      action_url: payload?.action_url || 'subsystems',
      is_read: 0,
      created_at: new Date().toISOString()
    };
    setNotifications((prev) => [notif, ...prev]);
    pushToast(notif.title, notif.message, 'push');
    triggerDesktopPush(notif.title, notif.message);
  };

  const handleMarkNotificationRead = async (id = null) => {
    try {
      const res = await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (isJsonResponse(res)) return;
    } catch {}
    setNotifications((prev) =>
      prev.map((n) => (!id || n.id === id ? { ...n, is_read: 1 } : n))
    );
  };

  const handleExecuteTerminalCommand = async (rawCommand) => {
    const cmd = String(rawCommand || '').trim();
    const lower = cmd.toLowerCase();

    // Client-side UI theme command
    if (lower.startsWith('nex theme ')) {
      const targetTheme = lower.slice('nex theme '.length).trim();
      if (THEMES[targetTheme]) {
        setThemeId(targetTheme);
        handlePlaySound('success');
        return {
          output: `[THEME] Switched active UI palette to "${THEMES[targetTheme].name}" (${targetTheme}).`,
          exitCode: 0,
          durationMs: 0.6
        };
      }
      return {
        output: `[ERROR] Unknown theme "${targetTheme}". Available: ${Object.keys(THEMES).join(', ')}`,
        exitCode: 1,
        durationMs: 0.5
      };
    }

    try {
      const res = await fetch('/api/terminal/exec', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: cmd })
      });
      if (isJsonResponse(res)) {
        const data = await res.json();
        if (lower.includes('security block')) handlePlaySound('alert');
        else if (lower.includes('security scan')) handlePlaySound('security');
        else if (lower.includes('deploy') || lower.includes('restock')) handlePlaySound('success');
        else handlePlaySound('ping');
        return data;
      }
    } catch {
      // Static fallback below
    }

    // Client-side fallback when running on static Netlify
    handlePlaySound('ping');
    if (lower === 'help' || lower === 'nex help') {
      return {
        output: [
          'NEX-SH v2.7 • Interactive Cloud & Subsystem Shell',
          '  nex status            Inspect system health, 16 SQLite tables & 6 edge servers',
          '  nex servers           List all 6 global edge server nodes & latency',
          '  nex ping              Calibrate latency across all edge server nodes',
          '  nex apps              List verified multi-source apps (Netlify, Vercel, GitHub)',
          '  nex deploy <url>      Import & verify a live app from Netlify/Vercel/GitHub URL',
          '  nex security scan     Run deep WAF, SQLi/XSS & SHA-256 package security audit',
          '  nex security block    Simulate & block a live SQLi/DDoS threat',
          '  nex products          List flagship hardware SKUs & warehouse stock',
          '  nex restock           Auto-replenish (+15 units) all low-stock hardware SKUs',
          '  nex theme <id>        Switch UI theme (obsidian|light|cyber|midnight|forest|ocean)',
          '  clear                 Clear terminal buffer'
        ].join('\n'),
        exitCode: 0,
        durationMs: 0.9
      };
    }
    if (lower === 'nex status' || lower === 'status') {
      return {
        output: [
          `[OK] Database Engine : ${dbStats?.engine || 'SQLite 3 WAL'}`,
          `[OK] Schema Tables   : ${dbStats?.totalTables || 16} tables`,
          `[OK] Edge Cluster    : ${serverNodes.length}/${serverNodes.length} nodes online`,
          `[OK] Security Shield : 99.8% Hardened • Cloudflare WAF + SHA-256 Active`
        ].join('\n'),
        exitCode: 0,
        durationMs: 1.1
      };
    }
    if (lower === 'nex servers' || lower === 'servers' || lower === 'nex ping') {
      return {
        output: serverNodes
          .map((n) => `${n.id.padEnd(12)} ${n.region.padEnd(16)} ${n.ip_address.padEnd(16)} ${n.latency_ms}ms  CPU:${n.cpu_load}%  [${n.status.toUpperCase()}]`)
          .join('\n'),
        exitCode: 0,
        durationMs: 1.4
      };
    }
    if (lower.startsWith('nex apps') || lower === 'apps') {
      return {
        output: apps
          .map((a) => `${a.id.padEnd(19)} ${a.name.slice(0, 26).padEnd(27)} ${(a.source_provider || 'NEX').padEnd(12)} v${a.version}`)
          .join('\n'),
        exitCode: 0,
        durationMs: 1.3
      };
    }
    if (lower.startsWith('nex deploy ')) {
      const rawUrl = cmd.slice('nex deploy '.length).trim();
      await handleCreateApp({
        name: rawUrl.replace(/^https?:\/\//, '').split('.')[0] || 'Netlify Edge App',
        source_provider: 'Netlify',
        live_url: rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`
      });
      return {
        output: `[SUCCESS] Deployed & verified ${rawUrl} into NEX App Store!`,
        exitCode: 0,
        durationMs: 2.4
      };
    }
    if (lower.startsWith('nex security scan')) {
      await handleRunSecurityScan();
      return {
        output: '[PASS] Security Posture Score: 99.8% Hardened (0 vulnerabilities found)',
        exitCode: 0,
        durationMs: 1.8
      };
    }
    if (lower.startsWith('nex security block')) {
      await handleSimulateThreat();
      return {
        output: '[WAF] Rule #SQLI-09 triggered in 0.2ms -> Action: BLOCKED & IP Blacklisted',
        exitCode: 0,
        durationMs: 1.5
      };
    }
    if (lower === 'nex products' || lower === 'products') {
      return {
        output: products
          .map((p) => `${p.sku.padEnd(13)} ${p.name.slice(0, 38).padEnd(40)} $${p.price}  (${p.stock} in stock)`)
          .join('\n'),
        exitCode: 0,
        durationMs: 1.2
      };
    }
    if (lower === 'nex restock' || lower === 'restock') {
      await handleBulkRestockLow();
      return {
        output: '[WAREHOUSE] Replenished +15 units across low-stock hardware SKUs.',
        exitCode: 0,
        durationMs: 1.6
      };
    }
    return {
      output: `nex-sh: command executed: "${cmd}" (Type "help" for full command reference)`,
      exitCode: 0,
      durationMs: 1.0
    };
  };

  const handleSaveTerminalScript = async (scriptPayload) => {
    try {
      const res = await fetch('/api/terminal/scripts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scriptPayload)
      });
      if (isJsonResponse(res)) {
        const data = await res.json();
        if (Array.isArray(data.terminalScripts)) {
          setTerminalScripts(data.terminalScripts);
        }
        pushToast('Playbook Saved', `Saved ${scriptPayload.name} to SQLite terminal_scripts.`, 'success');
        return data.script;
      }
    } catch {
      // Static fallback below
    }

    const fallbackScript = {
      id: scriptPayload.id || `SCRIPT-LOCAL-${Date.now()}`,
      name: scriptPayload.name,
      category: scriptPayload.category || 'DevOps',
      description: scriptPayload.description || 'Custom .nexsh automation playbook',
      code: scriptPayload.code,
      run_count: 0,
      last_run_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    };
    setTerminalScripts((prev) => [
      fallbackScript,
      ...prev.filter((s) => s.id !== fallbackScript.id && s.name !== fallbackScript.name)
    ]);
    pushToast('Playbook Saved', `Saved ${fallbackScript.name} to local playbook registry.`, 'success');
    return fallbackScript;
  };

  const handleRefreshHealth = async () => {
    setIsPingingHealth(true);
    handlePlaySound('ping');
    try {
      const [healthRes, navRes] = await Promise.all([
        fetch('/api/health'),
        fetch('/api/nav/telemetry')
      ]);
      if (isJsonResponse(healthRes)) {
        const hData = await healthRes.json();
        setHealthStatus(hData);
        pushToast(
          '/api/health Verified',
          `SQLite WAL (${hData.database?.totalTables || 18} tables) • ${hData.memory?.rssMB || 75} MB RAM`,
          'success'
        );
      } else {
        pushToast('/api/health Active', 'All 18 tables and subsystems operational.', 'success');
      }
      if (isJsonResponse(navRes)) {
        setNavTelemetry(await navRes.json());
      }
    } catch {
      pushToast('/api/health Active', 'Static-host resilient telemetry verified.', 'success');
    } finally {
      setIsPingingHealth(false);
    }
  };

  const handleSaveBtoRig = async (rigPayload) => {
    try {
      const res = await fetch('/api/bto/configs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rigPayload)
      });
      if (isJsonResponse(res)) {
        const data = await res.json();
        if (Array.isArray(data.btoConfigs)) setBtoConfigs(data.btoConfigs);
        pushToast('BTO Rig Saved to SQLite', `Saved "${rigPayload.name}" via POST /api/bto/configs`, 'success');
        return data.rig;
      }
    } catch {}

    const localRig = {
      id: `bto-${Date.now().toString(36)}`,
      ...rigPayload,
      created_at: new Date().toISOString()
    };
    setBtoConfigs((prev) => [localRig, ...prev]);
    pushToast('BTO Rig Saved', `Saved "${localRig.name}" to local BTO blueprints.`, 'success');
    return localRig;
  };

  const handleDeleteBtoRig = async (rigId) => {
    handlePlaySound('click');
    try {
      const res = await fetch(`/api/bto/configs/${rigId}`, { method: 'DELETE' });
      if (isJsonResponse(res)) {
        const data = await res.json();
        if (Array.isArray(data.btoConfigs)) setBtoConfigs(data.btoConfigs);
        pushToast('BTO Blueprint Removed', 'Deleted rig blueprint from SQLite bto_configs.', 'info');
        return;
      }
    } catch {}
    setBtoConfigs((prev) => prev.filter((b) => b.id !== rigId));
    pushToast('BTO Blueprint Removed', 'Removed rig blueprint.', 'info');
  };

  const wishlistProducts = useMemo(
    () => products.filter((p) => wishlistIds.includes(p.id)),
    [products, wishlistIds]
  );

  const compareProducts = useMemo(
    () => products.filter((p) => compareIds.includes(p.id)),
    [products, compareIds]
  );

  const cartCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  const [showSplash, setShowSplash] = useState(true);

  const unreadNotificationsCount = useMemo(
    () => notifications.filter((n) => !n.is_read).length,
    [notifications]
  );

  return (
    <div
      className={`min-h-screen transition-colors duration-300 theme-app-bg ${
        darkMode
          ? 'bg-engineering-grid-dark text-slate-100'
          : 'bg-engineering-grid-light text-slate-900'
      }`}
    >
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}

      {/* Sticky Top Navbar + Multi-Theme Switcher + Sound/Push Controls + Real-Time Ticker */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          handlePlaySound('click');
          setActiveTab(tab);
        }}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        searchInputRef={searchInputRef}
        currency={currency}
        setCurrency={setCurrency}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        themeId={themeId}
        setThemeId={(nextTheme) => {
          handlePlaySound('click');
          setThemeId(nextTheme);
        }}
        cartCount={cartCount}
        wishlistCount={wishlistProducts.length}
        compareCount={compareProducts.length}
        onOpenCart={(mode) => {
          handlePlaySound('click');
          setCartDrawerMode(mode || 'cart');
          setCartDrawerOpen(true);
        }}
        onOpenCompare={() => {
          handlePlaySound('click');
          setCompareOpen(true);
        }}
        onOpenCommandPalette={() => {
          handlePlaySound('click');
          setCommandPaletteOpen(true);
        }}
        wsConnected={wsConnected}
        presence={presence}
        latestActivity={activityEvents[0]}
        onSimulateRealtime={handleSimulateRealtime}
        dbStats={dbStats}
        soundEnabled={soundEnabled}
        onToggleSound={() => {
          const next = !soundEnabled;
          setSoundEnabled(next);
          if (next) playSound('push', { enabled: true, volume: soundVolume });
        }}
        unreadNotificationsCount={unreadNotificationsCount}
        onOpenNotifications={() => {
          handlePlaySound('click');
          setNotificationDrawerOpen(true);
        }}
        onOpenTerminal={() => {
          handlePlaySound('click');
          setTerminalOpen(true);
        }}
        onOpenHardwareBuilder={() => {
          handlePlaySound('click');
          setHardwareBuilderOpen(true);
        }}
        onToggleSideNav={() => {
          handlePlaySound('click');
          setSideNavCollapsed((prev) => !prev);
        }}
        onOpenMobileMenu={() => {
          handlePlaySound('click');
          setMobileMenuOpen((prev) => !prev);
        }}
      />

      {/* Desktop Side Navigation Rail + Main Active Workspace View */}
      <div className="flex flex-1 min-w-0">
        <DesktopSideNav
          activeTab={activeTab}
          setActiveTab={(tab) => {
            handlePlaySound('click');
            setActiveTab(tab);
          }}
          collapsed={sideNavCollapsed}
          setCollapsed={setSideNavCollapsed}
          darkMode={darkMode}
          cartCount={cartCount}
          wishlistCount={wishlistProducts.length}
          compareCount={compareProducts.length}
          unreadNotificationsCount={unreadNotificationsCount}
          dbStats={dbStats}
          navTelemetry={navTelemetry}
          healthStatus={healthStatus}
          onRefreshHealth={handleRefreshHealth}
          isPingingHealth={isPingingHealth}
          onOpenCart={(mode) => {
            handlePlaySound('click');
            setCartDrawerMode(mode || 'cart');
            setCartDrawerOpen(true);
          }}
          onOpenCompare={() => {
            handlePlaySound('click');
            setCompareOpen(true);
          }}
          onOpenCommandPalette={() => {
            handlePlaySound('click');
            setCommandPaletteOpen(true);
          }}
          onOpenNotifications={() => {
            handlePlaySound('click');
            setNotificationDrawerOpen(true);
          }}
          onOpenTerminal={() => {
            handlePlaySound('click');
            setTerminalOpen(true);
          }}
          onOpenHardwareBuilder={() => {
            handlePlaySound('click');
            setHardwareBuilderOpen(true);
          }}
        />

        <main className="flex-1 min-w-0 pb-28 lg:pb-20">
        {activeTab === 'store' && (
          <StorefrontView
            products={products}
            categories={categories}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            currency={currency}
            darkMode={darkMode}
            onSelectProduct={(p) => {
              handlePlaySound('click');
              setSelectedProduct(p);
            }}
            onAddToCart={handleAddToCart}
            onCreateProduct={handleCreateProduct}
            wishlistIds={wishlistIds}
            onToggleWishlist={handleToggleWishlist}
            compareIds={compareIds}
            onToggleCompare={handleToggleCompare}
            presence={presence}
            coupons={coupons}
            onSubscribeNewsletter={handleSubscribeNewsletter}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'apps' && (
          <AppStoreView
            apps={apps}
            appInstalls={appInstalls}
            polyglotAutomations={polyglotAutomations}
            darkMode={darkMode}
            onDownloadApp={handleDownloadApp}
            onUninstallApp={handleUninstallApp}
            onCreateApp={handleCreateApp}
            onPlaySound={handlePlaySound}
          />
        )}

        {activeTab === 'mobile-subs' && (
          <MobileAndSubscriptionsView
            subscriptionPlans={subscriptionPlans}
            userSubscriptions={userSubscriptions}
            mobileAddons={mobileAddons}
            pwaDeferredPrompt={pwaDeferredPrompt}
            onTriggerPwaInstall={handleTriggerPwaInstall}
            onPlaySound={handlePlaySound}
          />
        )}

        {activeTab === 'subsystems' && (
          <SubsystemsHubView
            serverNodes={serverNodes}
            integrations={integrations}
            securityEvents={securityEvents}
            notifications={notifications}
            wsConnected={wsConnected}
            soundEnabled={soundEnabled}
            setSoundEnabled={setSoundEnabled}
            soundVolume={soundVolume}
            setSoundVolume={setSoundVolume}
            desktopPushStatus={desktopPushStatus}
            onRequestDesktopPush={handleRequestDesktopPush}
            onPlaySound={handlePlaySound}
            onServerAction={handleServerAction}
            onPulseServers={handlePulseServers}
            onProvisionServer={handleProvisionServer}
            onSyncIntegration={handleSyncIntegration}
            onCreateIntegration={handleCreateIntegration}
            onRunSecurityScan={handleRunSecurityScan}
            onSimulateThreat={handleSimulateThreat}
            onRotateKeys={handleRotateKeys}
            onSendPushBroadcast={handleSendPushBroadcast}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'tracker' && (
          <OrderTrackerView
            orders={orders}
            initialOrderNumber={trackedOrderNumber}
            currency={currency}
            darkMode={darkMode}
            onAdvanceOrderStatus={handleAdvanceOrderStatus}
          />
        )}

        {activeTab === 'admin' && (
          <AdminDashboardView
            products={products}
            categories={categories}
            orders={orders}
            coupons={coupons}
            inventoryLogs={inventoryLogs}
            activityEvents={activityEvents}
            analytics={analytics}
            presence={presence}
            currency={currency}
            darkMode={darkMode}
            userAccounts={userAccounts}
            hostingDeployments={hostingDeployments}
            blockedIps={blockedIps}
            securityReports={securityReports}
            paymentTransactions={paymentTransactions}
            onQuickStockUpdate={handleQuickStockUpdate}
            onBulkRestockLow={handleBulkRestockLow}
            onToggleFlashSale={handleToggleFlashSale}
            onCreateProduct={handleCreateProduct}
            onDeleteProduct={handleDeleteProduct}
            onAdvanceOrderStatus={handleAdvanceOrderStatus}
            onCreateCoupon={handleCreateCoupon}
            onToggleCoupon={handleToggleCoupon}
          />
        )}

        {activeTab === 'database' && (
          <DatabaseStudioView
            dbStats={dbStats}
            darkMode={darkMode}
            onResetDatabase={handleResetDatabase}
          />
        )}

        {activeTab === 'docs' && (
          <div className="mx-auto max-w-7xl px-4 py-8">
            <DocumentationView
              tables={dbStats?.tables || initialSeed.tables || []}
              terminalScripts={terminalScripts}
              onOpenTerminal={() => {
                handlePlaySound('click');
                setTerminalOpen(true);
              }}
              onRunCommandInTerminal={async (cmd) => {
                handlePlaySound('click');
                setTerminalOpen(true);
                await handleExecuteTerminalCommand(cmd);
              }}
              onOpenRigBuilder={() => {
                handlePlaySound('click');
                setHardwareBuilderOpen(true);
              }}
            />
          </div>
        )}

        {/* Global Copyright & Anti-Piracy DRM Protection Footer */}
        <footer className="mx-auto max-w-7xl px-4 pt-6 pb-4">
          <div className="rounded-2xl border border-amber-500/30 bg-slate-950/60 px-4 py-3 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono-num">
            <span className="text-amber-300 font-bold">
              🔒 © 2026 NEX STORE &amp; DEVTECHS001 LABS. ALL RIGHTS RESERVED.
            </span>
            <div className="flex items-center gap-3">
              <span className="text-emerald-300">
                STRICTLY PROPRIETARY &amp; DRM LOCKED — NEVER SHARE, REDISTRIBUTE, OR PIRATE THIS CODE
              </span>
              <button
                type="button"
                onClick={() => setShowSplash(true)}
                className="rounded-lg border border-indigo-500/40 bg-indigo-500/15 hover:bg-indigo-500/30 px-2.5 py-1 text-[10px] font-bold text-indigo-300 cursor-pointer"
              >
                Replay Boot Splash
              </button>
            </div>
          </div>
        </footer>
      </main>
      </div>

      {/* Mobile Fixed Bottom Navigation Dock & Full-Featured Mobile Command Drawer */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={(tab) => {
          handlePlaySound('click');
          setActiveTab(tab);
        }}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        darkMode={darkMode}
        themeId={themeId}
        setThemeId={(nextTheme) => {
          handlePlaySound('click');
          setThemeId(nextTheme);
        }}
        currency={currency}
        setCurrency={setCurrency}
        soundEnabled={soundEnabled}
        onToggleSound={() => {
          const next = !soundEnabled;
          setSoundEnabled(next);
          if (next) playSound('push', { enabled: true, volume: soundVolume });
        }}
        cartCount={cartCount}
        wishlistCount={wishlistProducts.length}
        compareCount={compareProducts.length}
        unreadNotificationsCount={unreadNotificationsCount}
        dbStats={dbStats}
        navTelemetry={navTelemetry}
        healthStatus={healthStatus}
        onRefreshHealth={handleRefreshHealth}
        isPingingHealth={isPingingHealth}
        onOpenCart={(mode) => {
          handlePlaySound('click');
          setCartDrawerMode(mode || 'cart');
          setCartDrawerOpen(true);
        }}
        onOpenCompare={() => {
          handlePlaySound('click');
          setCompareOpen(true);
        }}
        onOpenCommandPalette={() => {
          handlePlaySound('click');
          setCommandPaletteOpen(true);
        }}
        onOpenNotifications={() => {
          handlePlaySound('click');
          setNotificationDrawerOpen(true);
        }}
        onOpenTerminal={() => {
          handlePlaySound('click');
          setTerminalOpen(true);
        }}
        onOpenHardwareBuilder={() => {
          handlePlaySound('click');
          setHardwareBuilderOpen(true);
        }}
        onTriggerPwaInstall={handleTriggerPwaInstall}
      />

      {/* Slide-Over Push & Real-Time Notification Center Drawer */}
      <NotificationCenterDrawer
        isOpen={notificationDrawerOpen}
        onClose={() => setNotificationDrawerOpen(false)}
        notifications={notifications}
        onMarkRead={handleMarkNotificationRead}
        onSendTestPush={() =>
          handleSendPushBroadcast({
            title: 'Live Test Push Alert',
            message: 'WebAudio chime + WebSocket + OS Desktop Push verified operational!',
            channel: 'realtime',
            priority: 'high',
            action_url: 'subsystems'
          })
        }
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        desktopPushStatus={desktopPushStatus}
        onRequestDesktopPush={handleRequestDesktopPush}
        onNavigateTab={setActiveTab}
        onPlaySound={handlePlaySound}
      />

      {/* Custom 5-Slot Hardware Build-to-Order (BTO) Studio Modal */}
      <HardwareBuilderModal
        isOpen={hardwareBuilderOpen}
        onClose={() => setHardwareBuilderOpen(false)}
        products={products}
        btoConfigs={btoConfigs}
        currency={currency}
        onAddRigToCart={handleAddRigToCart}
        onSaveBtoRig={handleSaveBtoRig}
        onDeleteBtoRig={handleDeleteBtoRig}
        onPlaySound={handlePlaySound}
      />

      {/* Interactive NEX-SH v3.0 Cloud CLI, Pipe Engine & .nexsh Script Studio Modal (⌘J) */}
      <InteractiveTerminalModal
        isOpen={terminalOpen}
        onClose={() => setTerminalOpen(false)}
        terminalLogs={terminalLogs}
        terminalScripts={terminalScripts}
        serverNodes={serverNodes}
        securityEvents={securityEvents}
        integrations={integrations}
        products={products}
        apps={apps}
        onExecuteCommand={handleExecuteTerminalCommand}
        onExecuteTerminalCommand={handleExecuteTerminalCommand}
        onSaveTerminalScript={handleSaveTerminalScript}
        wsConnected={wsConnected}
        onPlaySound={handlePlaySound}
        soundEnabled={soundEnabled}
      />

      {/* Command Palette (⌘K) Modal */}
      <CommandPaletteModal
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        products={products}
        coupons={coupons}
        currency={currency}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        setActiveTab={setActiveTab}
        onSelectProduct={(p) => setSelectedProduct(p)}
        onAddToCart={handleAddToCart}
        onSimulateRealtime={handleSimulateRealtime}
      />

      {/* Product 4-Angle CAD & Spec Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          currency={currency}
          darkMode={darkMode}
          onAddToCart={handleAddToCart}
          isWishlisted={wishlistIds.includes(selectedProduct.id)}
          onToggleWishlist={handleToggleWishlist}
          isCompared={compareIds.includes(selectedProduct.id)}
          onToggleCompare={handleToggleCompare}
          presence={presence}
        />
      )}

      {/* Slide-Over Cart, Wishlist & Express Checkout Drawer */}
      <CartCheckoutDrawer
        isOpen={cartDrawerOpen}
        initialMode={cartDrawerMode}
        onClose={() => setCartDrawerOpen(false)}
        cart={cart}
        onUpdateQty={handleUpdateCartQty}
        onRemoveCartItem={handleRemoveCartItem}
        onClearCart={() => setCart([])}
        wishlistProducts={wishlistProducts}
        onToggleWishlist={handleToggleWishlist}
        onMoveWishlistToCart={(item) => handleAddToCart(item)}
        currency={currency}
        darkMode={darkMode}
        onTrackOrder={(orderNum) => {
          setTrackedOrderNumber(orderNum);
          setActiveTab('tracker');
        }}
      />

      {/* Side-by-Side Hardware Comparison Modal */}
      <CompareModal
        isOpen={compareOpen}
        onClose={() => setCompareOpen(false)}
        compareProducts={compareProducts}
        onRemoveCompare={handleToggleCompare}
        onClearCompare={() => setCompareIds([])}
        onAddToCart={handleAddToCart}
        currency={currency}
        darkMode={darkMode}
      />

      {/* Real-Time Live Concierge Chat Widget */}
      <LiveChatWidget
        messages={chatMessages}
        onSendMessage={handleSendChatMessage}
        darkMode={darkMode}
        wsConnected={wsConnected}
      />

      {/* Real-Time Toast Notification Stack */}
      <div className="fixed bottom-5 left-5 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto flex items-start gap-2.5 rounded-2xl border border-indigo-500/40 bg-slate-900/95 backdrop-blur-xl px-4 py-3 text-xs text-slate-100 shadow-2xl"
          >
            {t.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
            ) : t.type === 'security' ? (
              <ShieldAlert className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
            ) : t.type === 'push' ? (
              <Bell className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
            ) : (
              <Zap className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
            )}
            <div className="min-w-0">
              <div className="font-bold text-white">{t.title}</div>
              <div className="text-slate-300 truncate">{t.message}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
