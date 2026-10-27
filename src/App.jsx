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
import { CheckCircle2, Zap } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('store'); // 'store' | 'apps' | 'tracker' | 'admin' | 'database'
  const [darkMode, setDarkMode] = useState(true);
  const [currency, setCurrency] = useState('USD');

  // Store Data State (Bootstrapped from SQLite & kept in sync via WebSockets)
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [apps, setApps] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [orders, setOrders] = useState([]);
  const [inventoryLogs, setInventoryLogs] = useState([]);
  const [activityEvents, setActivityEvents] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [dbStats, setDbStats] = useState({});
  const [presence, setPresence] = useState({
    connectedClients: 1,
    activeShoppers: 21,
    viewersByProduct: {}
  });
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

  // Initial Bootstrap Fetch
  const fetchBootstrap = useCallback(async () => {
    try {
      const res = await fetch('/api/bootstrap');
      const data = await res.json();
      if (res.ok) {
        setCategories(data.categories || []);
        setProducts(data.products || []);
        setApps(data.apps || []);
        setCoupons(data.coupons || []);
        setOrders(data.orders || []);
        setInventoryLogs(data.inventoryLogs || []);
        setActivityEvents(data.activityEvents || []);
        setChatMessages(data.chatMessages || []);
        setAnalytics(data.analytics || {});
        setDbStats(data.dbStats || {});
        if (data.presence) setPresence(data.presence);
      }
    } catch (err) {
      console.error('Bootstrap error:', err);
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
                'All 10 SQLite tables restored to seed state.',
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
          reconnectTimer = setTimeout(connectWs, 2500);
        }
      };
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
          image_url: product.image_url,
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

  // Real-Time Operations Actions
  const handleSimulateRealtime = async () => {
    await fetch('/api/realtime/simulate', { method: 'POST' });
  };

  const handleQuickStockUpdate = async (productId, newStock, stockReason) => {
    await fetch(`/api/products/${productId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stock: newStock, stockReason })
    });
  };

  const handleToggleFlashSale = async (productId, isFlash) => {
    await fetch(`/api/products/${productId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        is_flash_sale: isFlash,
        badge: isFlash ? 'FLASH DEAL' : 'FLAGSHIP'
      })
    });
  };

  const handleCreateProduct = async (productPayload) => {
    await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productPayload)
    });
  };

  const handleDeleteProduct = async (productId) => {
    await fetch(`/api/products/${productId}`, { method: 'DELETE' });
  };

  const handleAdvanceOrderStatus = async (orderId, status) => {
    await fetch(`/api/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
  };

  const handleCreateCoupon = async (couponPayload) => {
    await fetch('/api/coupons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(couponPayload)
    });
  };

  const handleToggleCoupon = async (couponId) => {
    await fetch(`/api/coupons/${couponId}`, { method: 'PATCH' });
  };

  const handleSendChatMessage = async (text) => {
    await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sender: 'customer',
        sender_name: 'Shopper',
        message: text
      })
    });
  };

  const handleSubscribeNewsletter = async (email) => {
    const res = await fetch('/api/subscribers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    if (res.ok) {
      pushToast(
        'Subscribed to Flash Alerts',
        `${email} saved to SQLite subscribers table!`,
        'success'
      );
    }
  };

  const handleResetDatabase = async () => {
    await fetch('/api/db/reset', { method: 'POST' });
  };

  const handleDownloadApp = async (appId) => {
    await fetch(`/api/apps/${appId}/download`, { method: 'POST' });
  };

  const handleCreateApp = async (appPayload) => {
    await fetch('/api/apps', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(appPayload)
    });
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
      className={`min-h-screen transition-colors duration-200 ${
        darkMode
          ? 'bg-engineering-grid-dark text-slate-100'
          : 'bg-engineering-grid-light text-slate-900'
      }`}
    >
      {/* Sticky Top Navbar + Real-Time Ticker */}
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
