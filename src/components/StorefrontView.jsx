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
  Cpu,
  LayoutGrid,
  List,
  Tag,
  Send
} from 'lucide-react';
import { formatPrice } from '../utils/currency.js';
import { getProductArtUrl } from '../utils/storeEngine.js';

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
      ? Math.round(
          ((activeHero.original_price - activeHero.price) / activeHero.original_price) * 100
        )
      : 0;

  const heroImgSrc = activeHero
    ? getProductArtUrl(activeHero, {
        view: heroAngle,
        color: activeHero.colors?.[0]?.hex || null
      })
    : '';

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 space-y-7">
      {/* Hero Flagship Hardware Bento Showcase */}
      {activeHero && (
        <section className="theme-hero relative overflow-hidden rounded-3xl p-6 sm:p-8 lg:p-10">
          <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left 7 Cols: Flagship Engineering Pitch & Live Controls */}
            <div className="lg:col-span-7 space-y-5">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/15 border border-indigo-500/35 px-3 py-1 font-mono-num text-[11px] font-bold tracking-wider text-indigo-400">
                  <Sparkles className="h-3.5 w-3.5" />
                  FLAGSHIP SPOTLIGHT // {activeHero.sku}
                </span>

                {activeHero.is_flash_sale && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 border border-amber-500/35 px-3 py-1 font-mono-num text-[11px] font-bold text-amber-400">
                    <Flame className="h-3.5 w-3.5" />
                    FLASH DEAL ENDS {String(countdown.hrs).padStart(2, '0')}:
                    {String(countdown.mins).padStart(2, '0')}:
                    {String(countdown.secs).padStart(2, '0')}
                  </span>
                )}

                {heroDiscountPct > 0 && (
                  <span className="rounded-full bg-emerald-500/15 border border-emerald-500/35 px-2.5 py-1 font-mono-num text-[11px] font-bold text-emerald-400">
                    SAVE {heroDiscountPct}%
                  </span>
                )}
              </div>

              <div className="space-y-2.5">
                <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.06]">
                  {activeHero.name}
                </h1>
                <p className="text-sm sm:text-base opacity-80 max-w-2xl leading-relaxed">
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
                      className="theme-subtle rounded-2xl p-3.5 transition hover:border-indigo-500/50"
                    >
                      <div className="font-mono-num text-[10px] uppercase tracking-wider font-bold text-indigo-400">
                        {key}
                      </div>
                      <div className="mt-1 text-xs font-semibold truncate" title={val}>
                        {val}
                      </div>
                    </div>
                  ))}
              </div>

              {/* Price & Primary CTAs */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-500/20">
                <div>
                  <div className="flex items-baseline gap-3">
                    <span className="font-mono-num text-3xl sm:text-4xl font-bold">
                      {formatPrice(activeHero.price, currency)}
                    </span>
                    {activeHero.original_price > activeHero.price && (
                      <span className="font-mono-num text-sm opacity-60 line-through">
                        {formatPrice(activeHero.original_price, currency)}
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-emerald-400 font-mono-num font-semibold">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>
                      {activeHero.stock} units serialized & ready for instant dispatch
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => onAddToCart(activeHero)}
                    style={{
                      background: `linear-gradient(135deg, var(--accent), var(--accent-secondary))`
                    }}
                    className="inline-flex items-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-semibold text-white shadow-xl transition cursor-pointer"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    <span>Add to Build</span>
                  </button>

                  <button
                    onClick={() => onSelectProduct(activeHero)}
                    className="theme-subtle inline-flex items-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-semibold hover:border-indigo-500 transition cursor-pointer"
                  >
                    <Eye className="h-4 w-4 text-cyan-400" />
                    <span>4-Angle CAD & Specs</span>
                  </button>
                </div>
              </div>

              {/* Featured Hardware Carousel Switcher */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="font-mono-num text-[10px] uppercase tracking-wider opacity-60 mr-1">
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
                          ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/50 shadow-xs'
                          : 'theme-subtle opacity-75 hover:opacity-100'
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
                className="group relative overflow-hidden rounded-3xl border border-indigo-500/25 bg-slate-950 shadow-2xl cursor-pointer"
              >
                <img
                  src={heroImgSrc}
                  alt={activeHero.name}
                  className="w-full h-72 sm:h-80 object-cover transition duration-500 group-hover:scale-[1.03]"
                />
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between rounded-2xl bg-slate-950/85 backdrop-blur-md border border-white/10 px-4 py-2.5 text-xs text-white">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="font-mono-num font-bold">{activeHero.rating}</span>
                    <span className="text-slate-300">({activeHero.review_count} verified)</span>
                  </div>
                  <span className="text-cyan-300 font-semibold group-hover:underline">
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
                        ? 'border-indigo-500 bg-indigo-500/20 text-indigo-400'
                        : 'theme-subtle opacity-75 hover:opacity-100'
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
              className="theme-card group flex items-center justify-between rounded-2xl p-4 cursor-pointer"
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
                <p className="mt-1 truncate text-xs opacity-75">{coup.description}</p>
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
      <section className="theme-card rounded-3xl p-5 space-y-4">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedCategory('all')}
            style={
              selectedCategory === 'all'
                ? {
                    background: `linear-gradient(135deg, var(--accent), var(--accent-secondary))`,
                    color: '#ffffff'
                  }
                : undefined
            }
            className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition cursor-pointer ${
              selectedCategory === 'all' ? 'shadow-md' : 'theme-subtle opacity-85 hover:opacity-100'
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
                style={
                  active
                    ? {
                        background: `linear-gradient(135deg, var(--accent), var(--accent-secondary))`,
                        color: '#ffffff'
                      }
                    : undefined
                }
                className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition cursor-pointer ${
                  active ? 'shadow-md' : 'theme-subtle opacity-85 hover:opacity-100'
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
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-500/20">
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
                  : 'theme-subtle opacity-85 hover:opacity-100'
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
                  : 'theme-subtle opacity-85 hover:opacity-100'
              }`}
            >
              <Flame className="h-3.5 w-3.5 text-amber-400" />
              <span>Flash Deals Only</span>
            </button>

            {/* Max Price Slider */}
            <div className="theme-subtle flex items-center gap-2.5 rounded-xl px-3 py-1.5">
              <span className="text-xs opacity-75">Max Price:</span>
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
            <span className="font-mono-num text-xs opacity-75">
              Showing <strong>{filteredProducts.length}</strong> of {products.length}
            </span>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort products"
              className="theme-input rounded-xl px-3 py-1.5 text-xs font-semibold cursor-pointer"
            >
              <option value="featured">Sort: Featured & Flagship</option>
              <option value="popular">Sort: Best Selling</option>
              <option value="rating">Sort: Highest Rated</option>
              <option value="price-asc">Sort: Price Low → High</option>
              <option value="price-desc">Sort: Price High → Low</option>
            </select>

            <div className="theme-subtle flex items-center rounded-xl p-0.5">
              <button
                onClick={() => setViewMode('grid')}
                className={`rounded-lg p-1.5 cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-indigo-600 text-white'
                    : 'opacity-70 hover:text-indigo-400'
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
                    : 'opacity-70 hover:text-indigo-400'
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
        <div className="theme-card rounded-3xl p-12 text-center space-y-4">
          <p className="font-display text-lg font-bold">
            No hardware models match your current filter criteria
          </p>
          <p className="text-xs opacity-75">
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
            const imgSrc = getProductArtUrl(product, {
              view: 'hero',
              color: activeColor.hex || null
            });
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
                className={`theme-card group relative flex flex-col justify-between overflow-hidden rounded-3xl transition-all duration-300 hover:-translate-y-1 ${
                  viewMode === 'list' ? 'sm:flex-row sm:items-center gap-6 p-4' : ''
                }`}
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
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-950/80 backdrop-blur-md border border-white/15 text-slate-200 hover:text-rose-400 transition cursor-pointer"
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
                            ? 'bg-cyan-400 text-slate-950 border-cyan-300 shadow-md'
                            : 'bg-slate-950/80 border-white/15 text-slate-200 hover:text-cyan-400'
                        }`}
                        title="Compare Hardware"
                      >
                        <Layers className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Bottom Overlay Bar: Live Viewers + SKU */}
                    <div className="absolute bottom-2.5 left-3.5 right-3.5 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 rounded-full bg-slate-950/85 backdrop-blur-md border border-white/10 px-2.5 py-0.5 font-mono-num text-[10px] text-white">
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
                        <span className="opacity-65">({product.review_count})</span>
                      </div>
                    </div>

                    <h3
                      onClick={() => onSelectProduct(product)}
                      className="font-display text-lg font-bold leading-snug group-hover:text-indigo-400 transition cursor-pointer"
                    >
                      {product.name}
                    </h3>

                    <p className="text-xs opacity-75 line-clamp-2 leading-relaxed">
                      {product.tagline}
                    </p>

                    {/* Micro Spec Chips */}
                    {topSpecEntries.length > 0 && (
                      <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                        {topSpecEntries.map(([k, v]) => (
                          <div
                            key={k}
                            className="theme-subtle rounded-xl px-2.5 py-1.5 text-[11px] truncate"
                            title={`${k}: ${v}`}
                          >
                            <span className="font-mono-num text-[9px] uppercase font-bold text-indigo-400 block">
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
                              className={`h-4 w-4 rounded-full border border-slate-400/40 transition cursor-pointer ${
                                activeColor.name === c.name
                                  ? 'ring-2 ring-indigo-500 scale-110'
                                  : 'opacity-75 hover:opacity-100'
                              }`}
                              style={{ backgroundColor: c.hex }}
                            />
                          ))}
                          <span className="ml-1 text-[11px] opacity-75 truncate max-w-[115px]">
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
                      <div className="h-1 w-full overflow-hidden rounded-full bg-slate-500/20">
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
                  <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-500/20">
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="font-mono-num text-xl font-bold">
                          {formatPrice(product.price, currency)}
                        </span>
                        {product.original_price > product.price && (
                          <span className="font-mono-num text-xs opacity-60 line-through">
                            {formatPrice(product.original_price, currency)}
                          </span>
                        )}
                      </div>
                      <span className="font-mono-num text-[10px] opacity-65">
                        {product.sold_count} deployed • Express Air
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onSelectProduct(product)}
                        className="theme-subtle rounded-xl px-3 py-2 text-xs font-semibold hover:border-indigo-500 transition cursor-pointer"
                      >
                        CAD / Specs
                      </button>

                      <button
                        disabled={product.stock === 0}
                        onClick={() => onAddToCart(product, activeColor.name)}
                        style={
                          product.stock > 0
                            ? {
                                background: `linear-gradient(135deg, var(--accent), var(--accent-secondary))`
                              }
                            : undefined
                        }
                        className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition cursor-pointer ${
                          product.stock === 0
                            ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            : 'text-white shadow-md'
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
      <section className="theme-card rounded-3xl p-6 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-7 space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-mono-num font-bold text-cyan-400">
              <Cpu className="h-4 w-4" />
              <span>FULL-STACK SQLITE 3 + WEBSOCKET COMMERCE ENGINE</span>
            </div>
            <h2 className="font-display text-2xl font-bold">
              Real-Time Inventory, Instant Order Tracking & SQLite Studio
            </h2>
            <p className="text-xs sm:text-sm opacity-80">
              Every order, stock change, review, and promotion is persisted in our 11-table SQLite
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
              className="theme-input flex-1 rounded-xl px-4 py-3 text-xs"
            />
            <button
              type="submit"
              style={{
                background: `linear-gradient(135deg, var(--accent), var(--accent-secondary))`
              }}
              className="inline-flex items-center gap-1.5 rounded-xl px-5 py-3 text-xs font-semibold text-white shadow-md transition cursor-pointer"
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
