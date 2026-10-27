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
import { THEMES, applyThemeVariables } from './utils/themes.js';
import { getFallbackBootstrapData, getProductArtUrl } from './utils/storeEngine.js';
import { CheckCircle2, Zap } from 'lucide-react';

export default function App() {
  const initialSeed = useMemo(() => getFallbackBootstrapData(), []);

  const [activeTab, setActiveTab] = useState('store'); // 'store' | 'apps' | 'tracker' | 'admin' | 'database'
  const [themeId, setThemeId] = useState(() => {
    try {
      return localStorage.getItem('nexstore_theme') || 'obsidian';
    } catch {
      return 'obsidian';
    }
  });
  const [currency, setCurrency] = useState('USD');

  const activeTheme = useMemo(
    () => THEMES.find((t) => t.id === themeId) || THEMES[0],
    [themeId]
  );
  const darkMode = activeTheme.isDark;

  const setDarkMode = useCallback((nextDark) => {
    setThemeId((prev) => {
      if ( typeof nextDark === 'function') {
        const currentIsDark = (THEMES.find((t) => t.id === prev) || THEMES[0]).isDark;
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

  // Store Data State (Pre-hydrated immediately from seed + synced with SQLite & WebSockets)
  const [categories, setCategories] = useState(initialSeed.categories);
  const [products, setProducts] = useState(initialSeed.products);
  const [apps, setApps] = useState(initialSeed.apps);
  const [coupons, setCoupons] = useState(initialSeed.coupons);
  const [orders, setOrders] = useState(initialSeed.orders);
  const [inventoryLogs, setInventoryLogs] = useState(initialSeed.inventoryLogs);
  const [activityEvents, setActivityEvents] = useState(initialSeed.activityEvents);
  const [chatMessages, setChatMessages] = useState(initialSeed.chatMessages);
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
    }, 4200);
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
      if (Array.isArray(data.categories) && data.categories.length > 0) {
        setCategories(data.categories);
      }
      if (Array.isArray(data.products) && data.products.length > 0) {
        setProducts(data.products);
      }
      if (Array.isArray(data.apps) && data.apps.length > 0) {
        setApps(data.apps);
      }
      if (Array.isArray(data.coupons) && data.coupons.length > 0) {
        setCoupons(data.coupons);
      }
      if (Array.isArray(data.orders) && data.orders.length > 0) {
        setOrders(data.orders);
      }
      if (Array.isArray(data.inventoryLogs)) {
        setInventoryLogs(data.inventoryLogs);
      }
      if (Array.isArray(data.activityEvents) && data.activityEvents.length > 0) {
        setActivityEvents(data.activityEvents);
      }
      if (Array.isArray(data.chatMessages) && data.chatMessages.length > 0) {
        setChatMessages(data.chatMessages);
      }
      if (data.analytics && Object.keys(data.analytics).length > 0) {
        setAnalytics(data.analytics);
      }
      if (data.dbStats && Object.keys(data.dbStats).length > 0) {
        setDbStats(data.dbStats);
      }
      if (data.presence) setPresence(data.presence);
    } catch {
      // Static deployment fallback already hydrated via initialSeed
    }
  }, []);

  useEffect(() => {
    fetchBootstrap();
  }, [fetchBootstrap]);

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
                if (payload.activity) {
                  setActivityEvents((prev) => [payload.activity, ...prev]);
                  pushToast(payload.activity.title, payload.activity.message, 'success');
                }
                if (payload.dbStats) setDbStats(payload.dbStats);
                break;

              case 'app:downloaded':
                setApps((prev) =>
                  prev.map((a) => (a.id === payload.app.id ? payload.app : a))
                );
                if (payload.activity) {
                  setActivityEvents((prev) => [payload.activity, ...prev]);
                  pushToast(payload.activity.title, payload.activity.message, 'realtime');
                }
                if (payload.dbStats) setDbStats(payload.dbStats);
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

              case 'store:reseeded':
                setCategories(payload.categories || []);
                setProducts(payload.products || []);
                setCoupons(payload.coupons || []);
                setOrders(payload.orders || []);
                setInventoryLogs(payload.inventoryLogs || []);
                setActivityEvents(payload.activityEvents || []);
                setAnalytics(payload.analytics || {});
                setDbStats(payload.dbStats || {});
                pushToast(
                  'Database Reset Complete',
                  'All 11 SQLite tables restored to seed state.',
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

  // Cmd/Ctrl + K Shortcut to open Command Palette, Escape to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Cart Handlers
  const handleAddToCart = (product, colorName, qty = 1) => {
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
    setWishlistIds((prev) => {
      const exists = prev.includes(productId);
      return exists ? prev.filter((id) => id !== productId) : [...prev, productId];
    });
  };

  const handleToggleCompare = (productId) => {
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
              status,
              timeline: [
                ...(o.timeline || []),
                {
                  status,
                  label: `Status updated to ${status.toUpperCase()}`,
                  timestamp: new Date().toISOString(),
                  completed: true
                }
              ]
            }
          : o
      )
    );
    pushToast('Order Telemetry Updated', `Order ${orderId} -> ${status.toUpperCase()}`, 'realtime');
  };

  const handleCreateCoupon = async (couponPayload) => {
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
        'Thanks for reaching out! Use code NEX20 at checkout for 20% off orders over $250, or inspect any hardware model in 4-angle CAD view.',
      created_at: new Date().toISOString()
    };
    setChatMessages((prev) => [...prev, userMsg, replyMsg]);
  };

  const handleSubscribeNewsletter = async (email) => {
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
    setAnalytics(fresh.analytics);
    setDbStats(fresh.dbStats);
    pushToast('Database Reset Complete', 'Restored all 11 tables to seed state.', 'success');
  };

  const handleDownloadApp = async (appId) => {
    try {
      const res = await fetch(`/api/apps/${appId}/download`, { method: 'POST' });
      if (isJsonResponse(res)) return;
    } catch {}
    setApps((prev) =>
      prev.map((a) =>
        a.id === appId ? { ...a, downloads: (a.downloads || 0) + 1 } : a
      )
    );
    const target = apps.find((a) => a.id === appId);
    pushToast(
      'Installer Package Ready',
      `Started downloading ${target?.name || 'NEX App'} (${target?.version || 'v2.0'})`,
      'success'
    );
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
    const newApp = {
      id: `app-${Date.now()}`,
      name: appPayload.name,
      developer: appPayload.developer || 'NEX Community Lab',
      category: appPayload.category || 'Utilities & DevTools',
      version: appPayload.version || '1.0.0',
      size_mb: Number(appPayload.size_mb) || 28.5,
      price: Number(appPayload.price) || 0,
      rating: 5.0,
      downloads: 1,
      platforms: appPayload.platforms || ['macOS', 'Windows', 'Linux'],
      badge: appPayload.badge || 'COMMUNITY',
      accent_color: appPayload.accent_color || '#6366f1',
      icon_name: 'Cpu',
      description: appPayload.description || 'Custom companion app published to NEX App Hub.',
      features: appPayload.features || ['Zero-latency telemetry', 'Cross-platform sync'],
      release_notes: appPayload.release_notes || 'Initial public release.',
      updated_at: new Date().toISOString()
    };
    setApps((prev) => [newApp, ...prev]);
    pushToast('App Published', `${newApp.name} is now live in the App Store`, 'success');
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

  return (
    <div
      className={`min-h-screen transition-colors duration-300 theme-app-bg ${
        darkMode
          ? 'bg-engineering-grid-dark text-slate-100'
          : 'bg-engineering-grid-light text-slate-900'
      }`}
    >
      {/* Sticky Top Navbar + Multi-Theme Switcher + Real-Time Ticker */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        searchInputRef={searchInputRef}
        currency={currency}
        setCurrency={setCurrency}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        themeId={themeId}
        setThemeId={setThemeId}
        cartCount={cartCount}
        wishlistCount={wishlistProducts.length}
        compareCount={compareProducts.length}
        onOpenCart={(mode) => {
          setCartDrawerMode(mode || 'cart');
          setCartDrawerOpen(true);
        }}
        onOpenCompare={() => setCompareOpen(true)}
        onOpenCommandPalette={() => setCommandPaletteOpen(true)}
        wsConnected={wsConnected}
        presence={presence}
        latestActivity={activityEvents[0]}
        onSimulateRealtime={handleSimulateRealtime}
        dbStats={dbStats}
      />

      {/* Main Active Workspace View */}
      <main className="pb-20">
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
            onSelectProduct={(p) => setSelectedProduct(p)}
            onAddToCart={handleAddToCart}
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
            darkMode={darkMode}
            onDownloadApp={handleDownloadApp}
            onCreateApp={handleCreateApp}
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
      </main>

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
