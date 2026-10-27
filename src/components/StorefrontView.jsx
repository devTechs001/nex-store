import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  Flame,
  Star,
  ShoppingBag,
  Eye,
  Heart,
  Layers,
  SlidersHorizontal,
  Check,
  ShieldCheck,
  Truck,
  Cpu,
  LayoutGrid,
  List,
  Tag,
  Send,
  Zap,
  Compass
} from 'lucide-react';
import { formatPrice } from '../utils/currency.js';

export default function StorefrontView({
  products,
  categories,
  selectedCategory,
  setSelectedCategory,
  searchQuery,
  setSearchQuery,
  currency,
  darkMode,
  onSelectProduct,
  onAddToCart,
  wishlistIds,
  onToggleWishlist,
  compareIds,
  onToggleCompare,
  presence,
  coupons,
  onSubscribeNewsletter,
  onNavigateTab
}) {
  const [sortBy, setSortBy] = useState('featured');
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [onlyFlashSale, setOnlyFlashSale] = useState(false);
  const [maxPrice, setMaxPrice] = useState(3500);
  const [viewMode, setViewMode] = useState('grid');
  const [selectedCardColors, setSelectedCardColors] = useState({});
  const [heroIndex, setHeroIndex] = useState(0);
  const [heroAngle, setHeroAngle] = useState('hero');
  const [countdown, setCountdown] = useState({ hrs: 11, mins: 42, secs: 19 });
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [copiedCode, setCopiedCode] = useState(null);

  // Live Flash Sale Countdown Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev.secs > 0) return { ...prev, secs: prev.secs - 1 };
        if (prev.mins > 0) return { ...prev, mins: prev.mins - 1, secs: 59 };
        if (prev.hrs > 0) return { hrs: prev.hrs - 1, mins: 59, secs: 59 };
        return { hrs: 12, mins: 0, secs: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const featuredProducts = useMemo(
    () => products.filter((p) => p.featured).slice(0, 5),
    [products]
  );

  const activeHero =
    featuredProducts[heroIndex % Math.max(1, featuredProducts.length)] || products[0];

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
        if (onlyInStock && p.stock <= 0) return false;
        if (onlyFlashSale && !p.is_flash_sale) return false;
        if (p.price > maxPrice) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchName = p.name.toLowerCase().includes(q);
          const matchTagline = p.tagline?.toLowerCase().includes(q);
          const matchBrand = p.brand?.toLowerCase().includes(q);
          const matchSku = p.sku?.toLowerCase().includes(q);
          const matchTag = (p.tags || []).some((t) => t.toLowerCase().includes(q));
          if (!matchName && !matchTagline && !matchBrand && !matchSku && !matchTag) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'rating') return b.rating - a.rating;
        if (sortBy === 'popular') return b.sold_count - a.sold_count;
        return Number(b.featured) - Number(a.featured) || b.sold_count - a.sold_count;
      });
  }, [products, selectedCategory, onlyInStock, onlyFlashSale, maxPrice, searchQuery, sortBy]);

  const categoryCounts = useMemo(() => {
    const counts = { all: products.length };
    for (const p of products) {
      counts[p.category] = (counts[p.category] || 0) + 1;
    }
    return counts;
  }, [products]);

  const handleCopyCoupon = (code) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const heroDiscountPct =
    activeHero && activeHero.original_price > activeHero.price
      ? Math.round(((activeHero.original_price - activeHero.price) / activeHero.original_price) * 100)
      : 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 space-y-7">
      {/* Hero Flagship Hardware Bento Showcase */}
      {activeHero && (
        <section className="relative overflow-hidden rounded-3xl border border-indigo-500/25 bg-gradient-to-br from-[#070b16] via-[#0b1326] to-[#131836] p-6 sm:p-8 lg:p-10 text-white shadow-2xl shadow-indigo-950/40">
          {/* Ambient Decorative Glows */}
          <div className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-indigo-600/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 right-10 h-80 w-80 rounded-full bg-cyan-500/15 blur-3xl" />

          <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left 7 Cols: Flagship Engineering Pitch & Live Controls */}
            <div className="lg:col-span-7 space-y-5">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/40 px-3 py-1 font-mono-num text-[11px] font-bold tracking-wider text-indigo-300">
                  <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                  FLAGSHIP SPOTLIGHT // {activeHero.sku}
                </span>

                {activeHero.is_flash_sale && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 border border-amber-400/40 px-3 py-1 font-mono-num text-[11px] font-bold text-amber-300">
                    <Flame className="h-3.5 w-3.5 text-amber-400" />
                    FLASH DEAL ENDS {String(countdown.hrs).padStart(2, '0')}:
                    {String(countdown.mins).padStart(2, '0')}:
                    {String(countdown.secs).padStart(2, '0')}
                  </span>
                )}

                {heroDiscountPct > 0 && (
                  <span className="rounded-full bg-emerald-500/20 border border-emerald-400/40 px-2.5 py-1 font-mono-num text-[11px] font-bold text-emerald-300">
                    SAVE {heroDiscountPct}%
                  </span>
                )}
              </div>

              <div className="space-y-2.5">
                <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-[1.06]">
                  {activeHero.name}
                </h1>
                <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
                  {activeHero.description}
                </p>
              </div>

              {/* Spec Telemetry Bento Chips */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Object.entries(activeHero.specs || {})
                  .slice(0, 3)
                  .map(([key, val]) => (
                    <div
                      key={key}
                      className="rounded-2xl bg-white/[0.04] backdrop-blur-md border border-white/[0.09] p-3.5 transition hover:border-indigo-400/40"
                    >
                      <div className="font-mono-num text-[10px] uppercase tracking-wider text-indigo-300">
                        {key}
                      </div>
                      <div className="mt-1 text-xs font-semibold text-white truncate" title={val}>
                        {val}
                      </div>
                    </div>
                  ))}
              </div>

              {/* Price & Primary CTAs */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-white/[0.08]">
                <div>
                  <div className="flex items-baseline gap-3">
                    <span className="font-mono-num text-3xl sm:text-4xl font-bold text-white">
                      {formatPrice(activeHero.price, currency)}
                    </span>
                    {activeHero.original_price > activeHero.price && (
                      <span className="font-mono-num text-sm text-slate-400 line-through">
                        {formatPrice(activeHero.original_price, currency)}
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-emerald-400 font-mono-num">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>
                      {activeHero.stock} units serialized & ready for instant dispatch
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => onAddToCart(activeHero)}
                    className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-cyan-500 px-6 py-3.5 text-sm font-semibold text-white shadow-xl shadow-indigo-600/35 ring-1 ring-white/20 transition cursor-pointer"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    <span>Add to Build</span>
                  </button>

                  <button
                    onClick={() => onSelectProduct(activeHero)}
                    className="inline-flex items-center gap-2 rounded-2xl bg-white/[0.07] hover:bg-white/[0.12] border border-white/[0.14] px-5 py-3.5 text-sm font-semibold text-white transition cursor-pointer"
                  >
                    <Eye className="h-4 w-4 text-cyan-400" />
                    <span>4-Angle CAD & Specs</span>
                  </button>
                </div>
              </div>

              {/* Featured Hardware Carousel Switcher */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="font-mono-num text-[10px] uppercase tracking-wider text-slate-400 mr-1">
                  Flagships:
                </span>
                {featuredProducts.map((fp, idx) => {
                  const isCurrent = idx === heroIndex % featuredProducts.length;
                  return (
                    <button
                      key={fp.id}
                      onClick={() => {
                        setHeroIndex(idx);
                        setHeroAngle('hero');
                      }}
                      className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                        isCurrent
                          ? 'bg-indigo-500/30 text-white border border-indigo-400/60 shadow-sm'
                          : 'bg-white/[0.04] text-slate-400 hover:text-white border border-white/[0.08]'
                      }`}
                    >
                      {fp.name.split(' ').slice(0, 2).join(' ')}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right 5 Cols: Interactive 4-Angle Studio Render Deck */}
            <div className="lg:col-span-5 space-y-3">
              <div
                onClick={() => onSelectProduct(activeHero)}
                className="group relative overflow-hidden rounded-3xl border border-white/[0.12] bg-slate-950/90 shadow-2xl cursor-pointer"
              >
                <img
                  src={`${activeHero.image_url}?view=${encodeURIComponent(heroAngle)}`}
                  alt={activeHero.name}
                  className="w-full h-72 sm:h-80 object-cover transition duration-500 group-hover:scale-[1.03]"
                />
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between rounded-2xl bg-slate-950/85 backdrop-blur-md border border-white/[0.1] px-4 py-2.5 text-xs">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="font-mono-num font-bold text-white">{activeHero.rating}</span>
                    <span className="text-slate-400">({activeHero.review_count} verified)</span>
                  </div>
                  <span className="text-cyan-400 font-semibold group-hover:underline">
                    Full Telemetry Modal →
                  </span>
                </div>
              </div>

              {/* Instant Hero Angle Switcher */}
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'hero', label: 'Studio' },
                  { id: 'detail', label: 'Cutaway' },
                  { id: 'blueprint', label: 'CAD Blueprint' },
                  { id: 'spec', label: 'Telemetry' }
                ].map((ang) => (
                  <button
                    key={ang.id}
                    onClick={() => setHeroAngle(ang.id)}
                    className={`rounded-xl border py-2 px-2 text-center font-mono-num text-[11px] font-semibold transition cursor-pointer ${
                      heroAngle === ang.id
                        ? 'border-cyan-400/60 bg-cyan-500/20 text-cyan-200'
                        : 'border-white/[0.08] bg-white/[0.03] text-slate-400 hover:text-white'
                    }`}
                  >
                    {ang.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Active Promo Coupons & Instant Copy Strip */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {(coupons || [])
          .filter((c) => c.active)
          .slice(0, 4)
          .map((coup) => (
            <div
              key={coup.id}
              onClick={() => handleCopyCoupon(coup.code)}
              className={`group flex items-center justify-between rounded-2xl p-4 transition-all duration-200 cursor-pointer ${
                darkMode ? 'surface-card-dark' : 'surface-card-light'
              }`}
            >
              <div className="min-w-0 pr-2">
                <div className="flex items-center gap-2">
                  <Tag className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                  <span className="font-mono-num text-xs font-bold text-indigo-400">
                    {coup.code}
                  </span>
                  <span className="rounded-md bg-emerald-500/15 border border-emerald-500/30 px-1.5 py-0.5 font-mono-num text-[10px] font-bold text-emerald-400">
                    {coup.discount_type === 'percentage'
                      ? `${coup.discount_value}% OFF`
                      : `$${coup.discount_value} OFF`}
                  </span>
                </div>
                <p
                  className={`mt-1 truncate text-xs ${
                    darkMode ? 'text-slate-400' : 'text-slate-600'
                  }`}
                >
                  {coup.description}
                </p>
              </div>
              <span
                className={`shrink-0 rounded-xl px-2.5 py-1.5 font-mono-num text-[10px] font-bold transition ${
                  copiedCode === coup.code
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white'
                }`}
              >
                {copiedCode === coup.code ? 'COPIED ✓' : 'COPY'}
              </span>
            </div>
          ))}
      </section>

      {/* Category & Multi-Facet Filter Control Deck */}
      <section
        className={`rounded-3xl p-5 space-y-4 ${
          darkMode ? 'surface-card-dark' : 'surface-card-light'
        }`}
      >
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-500/25'
                : darkMode
                ? 'bg-slate-950/80 text-slate-300 hover:text-white border border-white/[0.07]'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80 border border-slate-200'
            }`}
          >
            <span>All Hardware</span>
            <span className="rounded-full bg-white/15 px-1.5 py-0.2 font-mono-num text-[10px]">
              {categoryCounts.all || 0}
            </span>
          </button>

          {categories.map((cat) => {
            const active = selectedCategory === cat.slug;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.slug)}
                className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition cursor-pointer ${
                  active
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-500/25'
                    : darkMode
                    ? 'bg-slate-950/80 text-slate-300 hover:text-white border border-white/[0.07]'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80 border border-slate-200'
                }`}
              >
                <span>{cat.name}</span>
                <span className="rounded-full bg-white/15 px-1.5 py-0.2 font-mono-num text-[10px]">
                  {categoryCounts[cat.slug] || 0}
                </span>
              </button>
            );
          })}
        </div>

        {/* Filter Controls Row */}
        <div
          className={`flex flex-wrap items-center justify-between gap-3 pt-3 border-t ${
            darkMode ? 'border-white/[0.07]' : 'border-slate-200'
          }`}
        >
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>Refine:</span>
            </div>

            {/* In Stock Toggle */}
            <button
              onClick={() => setOnlyInStock(!onlyInStock)}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                onlyInStock
                  ? 'border-emerald-500/50 bg-emerald-500/15 text-emerald-400'
                  : darkMode
                  ? 'border-white/[0.08] bg-slate-950/80 text-slate-300 hover:text-white'
                  : 'border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {onlyInStock && <Check className="h-3.5 w-3.5" />}
              <span>In-Stock Only</span>
            </button>

            {/* Flash Sale Toggle */}
            <button
              onClick={() => setOnlyFlashSale(!onlyFlashSale)}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                onlyFlashSale
                  ? 'border-amber-500/50 bg-amber-500/15 text-amber-400'
                  : darkMode
                  ? 'border-white/[0.08] bg-slate-950/80 text-slate-300 hover:text-white'
                  : 'border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Flame className="h-3.5 w-3.5 text-amber-400" />
              <span>Flash Deals Only</span>
            </button>

            {/* Max Price Slider */}
            <div
              className={`flex items-center gap-2.5 rounded-xl border px-3 py-1.5 ${
                darkMode
                  ? 'border-white/[0.08] bg-slate-950/80'
                  : 'border-slate-300 bg-slate-100'
              }`}
            >
              <span className="text-xs text-slate-400">Max Price:</span>
              <input
                type="range"
                min="150"
                max="3500"
                step="50"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-24 accent-indigo-500 cursor-pointer"
              />
              <span className="font-mono-num text-xs font-bold text-indigo-400">
                {formatPrice(maxPrice, currency)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="font-mono-num text-xs text-slate-400">
              Showing <strong className={darkMode ? 'text-white' : 'text-slate-900'}>{filteredProducts.length}</strong> of {products.length}
            </span>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort products"
              className={`rounded-xl border px-3 py-1.5 text-xs font-semibold cursor-pointer ${
                darkMode
                  ? 'bg-slate-950 border-white/[0.08] text-slate-200'
                  : 'bg-slate-100 border-slate-300 text-slate-800'
              }`}
            >
              <option value="featured">Sort: Featured & Flagship</option>
              <option value="popular">Sort: Best Selling</option>
              <option value="rating">Sort: Highest Rated</option>
              <option value="price-asc">Sort: Price Low → High</option>
              <option value="price-desc">Sort: Price High → Low</option>
            </select>

            <div
              className={`flex items-center rounded-xl border p-0.5 ${
                darkMode ? 'border-white/[0.08] bg-slate-950' : 'border-slate-300 bg-slate-100'
              }`}
            >
              <button
                onClick={() => setViewMode('grid')}
                className={`rounded-lg p-1.5 cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-indigo-400'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`rounded-lg p-1.5 cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-indigo-400'
                }`}
                title="Compact List View"
              >
                <List className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Product Catalog Grid / List */}
      {filteredProducts.length === 0 ? (
        <div
          className={`rounded-3xl p-12 text-center space-y-4 ${
            darkMode ? 'surface-card-dark' : 'surface-card-light'
          }`}
        >
          <p className="font-display text-lg font-bold">
            No hardware models match your current filter criteria
          </p>
          <p className="text-xs text-slate-400">
            Try clearing your search query or increasing the maximum price ceiling.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSearchQuery('');
              setOnlyInStock(false);
              setOnlyFlashSale(false);
              setMaxPrice(3500);
            }}
            className="rounded-xl bg-indigo-600 hover:bg-indigo-500 px-5 py-2.5 text-xs font-semibold text-white cursor-pointer"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <section
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-4'
          }
        >
          {filteredProducts.map((product) => {
            const isWishlisted = wishlistIds.includes(product.id);
            const isCompared = compareIds.includes(product.id);
            const activeColor =
              selectedCardColors[product.id] ||
              product.colors?.[0] || { name: 'Standard', hex: '' };
            const imgSrc = activeColor.hex
              ? `${product.image_url}?color=${encodeURIComponent(activeColor.hex)}`
              : product.image_url;
            const isLowStock =
              product.stock > 0 && product.stock <= product.low_stock_threshold;
            const liveViewers =
              (presence?.viewersByProduct?.[product.id] || 0) + (product.featured ? 4 : 2);
            const discountPct =
              product.original_price > product.price
                ? Math.round(
                    ((product.original_price - product.price) / product.original_price) * 100
                  )
                : 0;
            const topSpecEntries = Object.entries(product.specs || {}).slice(0, 2);
            const stockBarPct = Math.min(100, Math.max(8, Math.round((product.stock / 32) * 100)));

            return (
              <article
                key={product.id}
                className={`group relative flex flex-col justify-between overflow-hidden rounded-3xl transition-all duration-300 hover:-translate-y-1 ${
                  viewMode === 'list' ? 'sm:flex-row sm:items-center gap-6 p-4' : ''
                } ${darkMode ? 'surface-card-dark' : 'surface-card-light'}`}
              >
                {/* Top Visual Studio Render Area */}
                <div className={viewMode === 'list' ? 'sm:w-72 shrink-0' : ''}>
                  <div className="relative overflow-hidden bg-slate-950">
                    <img
                      src={imgSrc}
                      alt={product.name}
                      onClick={() => onSelectProduct(product)}
                      className={`w-full object-cover transition duration-500 group-hover:scale-105 cursor-pointer ${
                        viewMode === 'list' ? 'h-48 rounded-2xl' : 'h-56'
                      }`}
                    />

                    {/* Top Left Badges */}
                    <div className="absolute left-3.5 top-3.5 flex flex-wrap items-center gap-1.5">
                      {product.badge && (
                        <span
                          className={`rounded-lg px-2.5 py-0.5 font-mono-num text-[10px] font-bold uppercase tracking-wider shadow-md ${
                            product.is_flash_sale
                              ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-slate-950'
                              : isLowStock
                              ? 'bg-rose-500 text-white'
                              : 'bg-indigo-600/95 text-white'
                          }`}
                        >
                          {product.badge}
                        </span>
                      )}
                      {discountPct > 0 && (
                        <span className="rounded-lg bg-emerald-500/90 px-2 py-0.5 font-mono-num text-[10px] font-bold text-slate-950">
                          -{discountPct}%
                        </span>
                      )}
                    </div>

                    {/* Top Right Quick Actions (Wishlist + Compare) */}
                    <div className="absolute right-3.5 top-3.5 flex flex-col gap-1.5">
                      <button
                        onClick={() => onToggleWishlist(product.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-950/80 backdrop-blur-md border border-white/15 text-slate-300 hover:text-rose-400 transition cursor-pointer"
                        title={isWishlisted ? 'Remove from Wishlist' : 'Save to Wishlist'}
                      >
                        <Heart
                          className={`h-4 w-4 ${
                            isWishlisted ? 'fill-rose-500 text-rose-500' : ''
                          }`}
                        />
                      </button>

                      <button
                        onClick={() => onToggleCompare(product.id)}
                        className={`flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-md border transition cursor-pointer ${
                          isCompared
                            ? 'bg-cyan-400 text-slate-950 border-cyan-300 shadow-md shadow-cyan-500/30'
                            : 'bg-slate-950/80 border-white/15 text-slate-300 hover:text-cyan-400'
                        }`}
                        title="Compare Hardware"
                      >
                        <Layers className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Bottom Overlay Bar: Live Viewers + SKU */}
                    <div className="absolute bottom-2.5 left-3.5 right-3.5 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 rounded-full bg-slate-950/85 backdrop-blur-md border border-white/10 px-2.5 py-0.5 font-mono-num text-[10px] text-slate-200">
                        <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                        <span>{liveViewers} inspecting</span>
                      </div>
                      <span className="rounded-md bg-slate-950/85 backdrop-blur-md border border-white/10 px-2 py-0.5 font-mono-num text-[10px] text-indigo-300">
                        {product.sku}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Content Body */}
                <div className="flex flex-1 flex-col justify-between p-5 space-y-4">
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="font-mono-num uppercase tracking-wider text-indigo-400 font-bold text-[11px]">
                        {product.brand}
                      </span>
                      <div className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        <span className="font-mono-num font-bold">{product.rating}</span>
                        <span className="text-slate-400">({product.review_count})</span>
                      </div>
                    </div>

                    <h3
                      onClick={() => onSelectProduct(product)}
                      className="font-display text-lg font-bold leading-snug group-hover:text-indigo-400 transition cursor-pointer"
                    >
                      {product.name}
                    </h3>

                    <p
                      className={`text-xs line-clamp-2 leading-relaxed ${
                        darkMode ? 'text-slate-400' : 'text-slate-600'
                      }`}
                    >
                      {product.tagline}
                    </p>

                    {/* Micro Spec Chips */}
                    {topSpecEntries.length > 0 && (
                      <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                        {topSpecEntries.map(([k, v]) => (
                          <div
                            key={k}
                            className={`rounded-xl border px-2.5 py-1.5 text-[11px] truncate ${
                              darkMode
                                ? 'bg-slate-950/60 border-white/[0.06] text-slate-300'
                                : 'bg-slate-100/80 border-slate-200/80 text-slate-700'
                            }`}
                            title={`${k}: ${v}`}
                          >
                            <span className="font-mono-num text-[9px] uppercase text-indigo-400 block">
                              {k}
                            </span>
                            <span className="font-semibold truncate block">{v}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Colorway Swatches + Live Stock Indicator */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          {(product.colors || []).map((c) => (
                            <button
                              key={c.name}
                              onClick={() =>
                                setSelectedCardColors((prev) => ({
                                  ...prev,
                                  [product.id]: c
                                }))
                              }
                              title={`Finish: ${c.name}`}
                              className={`h-4 w-4 rounded-full border border-white/25 transition cursor-pointer ${
                                activeColor.name === c.name
                                  ? 'ring-2 ring-indigo-500 ring-offset-1 ring-offset-slate-950 scale-110'
                                  : 'opacity-75 hover:opacity-100'
                              }`}
                              style={{ backgroundColor: c.hex }}
                            />
                          ))}
                          <span className="ml-1 text-[11px] text-slate-400 truncate max-w-[115px]">
                            {activeColor.name}
                          </span>
                        </div>

                        <span
                          className={`font-mono-num text-[11px] font-bold ${
                            product.stock === 0
                              ? 'text-rose-500'
                              : isLowStock
                              ? 'text-amber-400'
                              : 'text-emerald-400'
                          }`}
                        >
                          {product.stock === 0
                            ? 'Sold Out'
                            : isLowStock
                            ? `Only ${product.stock} left!`
                            : `${product.stock} in stock`}
                        </span>
                      </div>

                      {/* Subtle Stock Meter Bar */}
                      <div
                        className={`h-1 w-full overflow-hidden rounded-full ${
                          darkMode ? 'bg-slate-800' : 'bg-slate-200'
                        }`}
                      >
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            product.stock === 0
                              ? 'bg-rose-500'
                              : isLowStock
                              ? 'bg-amber-400'
                              : 'bg-emerald-400'
                          }`}
                          style={{ width: `${stockBarPct}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Price & Action Footer */}
                  <div
                    className={`flex items-center justify-between gap-3 pt-3 border-t ${
                      darkMode ? 'border-white/[0.07]' : 'border-slate-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="font-mono-num text-xl font-bold">
                          {formatPrice(product.price, currency)}
                        </span>
                        {product.original_price > product.price && (
                          <span className="font-mono-num text-xs text-slate-400 line-through">
                            {formatPrice(product.original_price, currency)}
                          </span>
                        )}
                      </div>
                      <span className="font-mono-num text-[10px] text-slate-400">
                        {product.sold_count} deployed • Express Air
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onSelectProduct(product)}
                        className={`rounded-xl border px-3 py-2 text-xs font-semibold transition cursor-pointer ${
                          darkMode
                            ? 'border-white/[0.08] bg-slate-950/90 text-slate-300 hover:bg-slate-800 hover:text-white'
                            : 'border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        CAD / Specs
                      </button>

                      <button
                        disabled={product.stock === 0}
                        onClick={() => onAddToCart(product, activeColor.name)}
                        className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition cursor-pointer ${
                          product.stock === 0
                            ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            : 'bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white shadow-md shadow-indigo-500/25'
                        }`}
                      >
                        <ShoppingBag className="h-3.5 w-3.5" />
                        <span>{product.stock === 0 ? 'Out' : 'Add'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}

      {/* Platform Architecture & Newsletter Footer Banner */}
      <section
        className={`rounded-3xl p-6 md:p-8 ${
          darkMode ? 'surface-card-dark' : 'surface-card-light'
        }`}
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-7 space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-mono-num font-bold text-cyan-400">
              <Cpu className="h-4 w-4" />
              <span>FULL-STACK SQLITE 3 + WEBSOCKET COMMERCE ENGINE</span>
            </div>
            <h2 className="font-display text-2xl font-bold">
              Real-Time Inventory, Instant Order Tracking & SQLite Studio
            </h2>
            <p className={`text-xs sm:text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Every order, stock change, review, and promotion is persisted in our 10-table SQLite
              database and pushed live to all connected browsers over WebSockets. Explore the{' '}
              <button
                onClick={() => onNavigateTab('database')}
                className="text-indigo-400 underline font-semibold cursor-pointer"
              >
                SQLite DB Studio
              </button>{' '}
              or manage operations in{' '}
              <button
                onClick={() => onNavigateTab('admin')}
                className="text-indigo-400 underline font-semibold cursor-pointer"
              >
                Admin Ops
              </button>
              .
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (newsletterEmail.trim()) {
                onSubscribeNewsletter(newsletterEmail.trim());
                setNewsletterEmail('');
              }
            }}
            className="lg:col-span-5 flex items-center gap-2"
          >
            <input
              type="email"
              required
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              placeholder="Enter email for Flash Deal alerts..."
              className={`flex-1 rounded-xl border px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                darkMode
                  ? 'bg-slate-950 border-white/[0.08] text-slate-100'
                  : 'bg-slate-100 border-slate-300 text-slate-900'
              }`}
            />
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 px-5 py-3 text-xs font-semibold text-white shadow-md shadow-indigo-500/25 transition cursor-pointer"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Subscribe</span>
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
