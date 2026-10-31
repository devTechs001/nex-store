import React, { useState, useEffect } from 'react';
import {
  X,
  Star,
  ShoppingBag,
  Heart,
  Layers,
  CheckCircle2,
  ThumbsUp,
  Cpu,
  MessageSquarePlus,
  ShieldCheck,
  Truck,
  Radio,
  Sparkles
} from 'lucide-react';
import { formatPrice, formatRelativeTime } from '../utils/currency.js';
import { getProductArtUrl } from '../utils/storeEngine.js';

export default function ProductDetailModal({
  product,
  onClose,
  currency,
  darkMode,
  onAddToCart,
  isWishlisted,
  onToggleWishlist,
  isCompared,
  onToggleCompare,
  onReviewSubmitted,
  onHelpfulReview,
  presence
}) {
  const [selectedView, setSelectedView] = useState('hero');
  const [selectedColor, setSelectedColor] = useState(
    product?.colors?.[0] || { name: 'Standard Finish', hex: '' }
  );
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  // Review Form State
  const [authorName, setAuthorName] = useState('');
  const [authorLocation, setAuthorLocation] = useState('Nairobi, KE');
  const [rating, setRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!product) return;
    setSelectedColor(product.colors?.[0] || { name: 'Standard Finish', hex: '' });
    setSelectedView('hero');
    setQuantity(1);

    setLoadingReviews(true);
    fetch(`/api/products/${product.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.reviews) setReviews(data.reviews);
      })
      .catch(() => {})
      .finally(() => setLoadingReviews(false));
  }, [product?.id]);

  if (!product) return null;

  const galleryViews =
    product.gallery && product.gallery.length > 0
      ? product.gallery
      : [
          { label: 'Studio Hero', view: 'hero' },
          { label: 'Detail Cutaway', view: 'detail' },
          { label: 'CAD Blueprint', view: 'blueprint' },
          { label: 'Telemetry Spec', view: 'spec' }
        ];

  const imgUrl = getProductArtUrl(product, {
    view: selectedView,
    color: selectedColor?.hex || null
  });

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/products/${product.id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author_name: authorName.trim() || 'Verified Engineer',
          author_location: authorLocation.trim() || 'Nairobi, KE',
          rating,
          title: reviewTitle.trim() || 'Exceptional engineering & build',
          comment: comment.trim()
        })
      });
      const data = await res.json();
      if (res.ok && data.review) {
        setReviews((prev) => [data.review, ...prev]);
        setAuthorName('');
        setReviewTitle('');
        setComment('');
        onReviewSubmitted?.(data);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleVoteHelpful = async (reviewId) => {
    const res = await fetch(`/api/reviews/${reviewId}/helpful`, { method: 'POST' });
    const data = await res.json();
    if (res.ok && data.review) {
      setReviews((prev) => prev.map((r) => (r.id === reviewId ? data.review : r)));
      onHelpfulReview?.(data.review);
    }
  };

  const activeViewers = (presence?.viewersByProduct?.[product.id] || 0) + 5;
  const inputSurface = darkMode
    ? 'border-white/[0.08] bg-slate-950/90 text-white placeholder-slate-500'
    : 'border-slate-300 bg-white text-slate-900 placeholder-slate-400';

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center theme-modal-backdrop p-3 sm:p-6 overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative my-auto w-full max-w-5xl max-h-[92vh] overflow-y-auto rounded-3xl border shadow-2xl transition-colors theme-modal-panel theme-card"
      >
        {/* Top Modal Header Bar */}
        <div
          className="sticky top-0 z-20 flex items-center justify-between border-b px-6 py-4 backdrop-blur-xl theme-header"
        >
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="rounded-lg bg-indigo-500/15 border border-indigo-500/30 px-2.5 py-1 font-mono-num text-xs font-bold text-indigo-400">
              {product.sku}
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {product.brand}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 px-2.5 py-0.5 font-mono-num text-[11px] font-semibold text-cyan-400">
              <Radio className="h-3 w-3 animate-pulse" />
              {activeViewers} engineers inspecting live
            </span>
          </div>

          <button
            onClick={onClose}
            className={`rounded-xl border p-2 transition cursor-pointer ${
              darkMode
                ? 'border-white/[0.1] bg-slate-800/80 hover:bg-slate-700 text-slate-300'
                : 'border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Main Content Grid */}
        <div className="p-6 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left 7 Cols: 4-Angle Interactive CAD / Studio Viewer */}
            <div className="lg:col-span-7 space-y-4">
              <div className="relative overflow-hidden rounded-3xl border border-indigo-500/25 bg-slate-950 shadow-xl">
                <img
                  src={imgUrl}
                  alt={product.name}
                  className="w-full h-80 sm:h-96 object-cover"
                />
                {product.badge && (
                  <span className="absolute left-4 top-4 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 px-3 py-1 font-mono-num text-xs font-bold text-white shadow-lg">
                    {product.badge}
                  </span>
                )}
              </div>

              {/* 4-Angle Studio Switcher */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {galleryViews.map((g) => (
                  <button
                    key={g.view}
                    onClick={() => setSelectedView(g.view)}
                    className={`rounded-2xl border px-3.5 py-2.5 text-left transition cursor-pointer ${
                      selectedView === g.view
                        ? 'border-indigo-500 bg-indigo-500/15 text-indigo-400 shadow-sm'
                        : darkMode
                        ? 'border-white/[0.08] bg-slate-950/70 text-slate-400 hover:text-white'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="font-mono-num text-[10px] uppercase text-slate-400">
                      ANGLE // {g.view}
                    </div>
                    <div className="mt-0.5 text-xs font-bold">{g.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Right 5 Cols: Purchase Configurator */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-5">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-amber-400">
                    <Star className="h-4 w-4 fill-amber-400" />
                    <span className="font-mono-num text-sm font-bold">{product.rating}</span>
                  </div>
                  <span className="text-xs text-slate-400">
                    ({reviews.length || product.review_count} verified reviews)
                  </span>
                  <span className="text-slate-500">•</span>
                  <span className="font-mono-num text-xs font-semibold text-emerald-400">
                    {product.sold_count} units deployed
                  </span>
                </div>

                <h2 className="font-display text-2xl sm:text-3xl font-bold leading-tight">
                  {product.name}
                </h2>

                <p
                  className={`text-sm leading-relaxed ${
                    darkMode ? 'text-slate-300' : 'text-slate-600'
                  }`}
                >
                  {product.description}
                </p>

                {/* Price Block */}
                <div
                  className={`rounded-2xl border p-4 flex items-center justify-between ${
                    darkMode
                      ? 'border-white/[0.08] bg-slate-950/60'
                      : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <div>
                    <div className="flex items-baseline gap-2.5">
                      <span className="font-mono-num text-3xl font-bold text-indigo-400">
                        {formatPrice(product.price, currency)}
                      </span>
                      {product.original_price > product.price && (
                        <span className="font-mono-num text-sm text-slate-400 line-through">
                          {formatPrice(product.original_price, currency)}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400">
                      Includes 3-Year Global NEX Hardware Warranty
                    </span>
                  </div>

                  <div className="text-right">
                    <span
                      className={`inline-block rounded-lg px-2.5 py-1 font-mono-num text-xs font-bold ${
                        product.stock > 5
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : product.stock > 0
                          ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          : 'bg-rose-500/15 text-rose-400'
                      }`}
                    >
                      {product.stock > 0 ? `${product.stock} IN STOCK` : 'OUT OF STOCK'}
                    </span>
                  </div>
                </div>

                {/* Finish / Colorway Selector */}
                {product.colors && product.colors.length > 0 && (
                  <div className="space-y-2">
                    <label className="block font-mono-num text-xs uppercase tracking-wider text-slate-400">
                      Select Hardware Finish:{' '}
                      <strong className={darkMode ? 'text-white' : 'text-slate-900'}>
                        {selectedColor.name}
                      </strong>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {product.colors.map((c) => (
                        <button
                          key={c.name}
                          onClick={() => setSelectedColor(c)}
                          className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition cursor-pointer ${
                            selectedColor.name === c.name
                              ? 'border-indigo-500 bg-indigo-500/15 text-indigo-400'
                              : darkMode
                              ? 'border-white/[0.08] bg-slate-950 text-slate-300'
                              : 'border-slate-200 bg-slate-100 text-slate-800'
                          }`}
                        >
                          <span
                            className="h-3.5 w-3.5 rounded-full border border-white/30"
                            style={{ backgroundColor: c.hex }}
                          />
                          <span>{c.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity & Add to Cart Row */}
                <div className="flex items-center gap-3 pt-2">
                  <div
                    className={`flex items-center rounded-xl border px-2 py-1.5 ${
                      darkMode
                        ? 'border-white/[0.08] bg-slate-950'
                        : 'border-slate-300 bg-slate-100'
                    }`}
                  >
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="px-2.5 py-1 text-sm font-bold text-slate-400 hover:text-indigo-400 cursor-pointer"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-mono-num text-sm font-bold">
                      {quantity}
                    </span>
                    <button
                      onClick={() =>
                        setQuantity((q) => Math.min(Math.max(1, product.stock), q + 1))
                      }
                      className="px-2.5 py-1 text-sm font-bold text-slate-400 hover:text-indigo-400 cursor-pointer"
                    >
                      +
                    </button>
                  </div>

                  <button
                    disabled={product.stock === 0}
                    onClick={() => {
                      onAddToCart(product, selectedColor.name, quantity);
                      onClose();
                    }}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 py-3.5 px-5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 transition cursor-pointer"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    <span>
                      Add to Build • {formatPrice(product.price * quantity, currency)}
                    </span>
                  </button>
                </div>

                {/* Secondary Actions */}
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    onClick={() => onToggleWishlist(product.id)}
                    className={`flex items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-semibold transition cursor-pointer ${
                      isWishlisted
                        ? 'border-rose-500/50 bg-rose-500/15 text-rose-400'
                        : darkMode
                        ? 'border-white/[0.08] bg-slate-950 text-slate-300 hover:bg-slate-800'
                        : 'border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <Heart className={`h-3.5 w-3.5 ${isWishlisted ? 'fill-rose-500' : ''}`} />
                    <span>{isWishlisted ? 'Saved in Wishlist' : 'Save to Wishlist'}</span>
                  </button>

                  <button
                    onClick={() => onToggleCompare(product.id)}
                    className={`flex items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-semibold transition cursor-pointer ${
                      isCompared
                        ? 'border-cyan-500/50 bg-cyan-500/15 text-cyan-400'
                        : darkMode
                        ? 'border-white/[0.08] bg-slate-950 text-slate-300 hover:bg-slate-800'
                        : 'border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <Layers className="h-3.5 w-3.5" />
                    <span>{isCompared ? 'In Comparison' : 'Add to Compare'}</span>
                  </button>
                </div>
              </div>

              {/* Shipping & Authenticity Footer */}
              <div
                className={`grid grid-cols-2 gap-3 pt-3 border-t text-xs text-slate-400 ${
                  darkMode ? 'border-white/[0.08]' : 'border-slate-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-indigo-400 shrink-0" />
                  <span>Same-Day Nairobi & Global Air</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Serialized Lab QA Certificate</span>
                </div>
              </div>
            </div>
          </div>

          {/* Technical Specifications Matrix */}
          <div
            className={`rounded-3xl p-5 ${
              darkMode ? 'surface-card-dark' : 'surface-card-light'
            }`}
          >
            <div className="flex items-center gap-2 mb-4">
              <Cpu className="h-4 w-4 text-indigo-400" />
              <h3 className="font-display text-base font-bold">
                Hardware Architecture & Technical Specifications
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.entries(product.specs || {}).map(([key, value]) => (
                <div
                  key={key}
                  className={`rounded-2xl border p-3.5 ${
                    darkMode
                      ? 'bg-slate-950/75 border-white/[0.07]'
                      : 'bg-white border-slate-200/90'
                  }`}
                >
                  <div className="font-mono-num text-[11px] uppercase tracking-wider text-indigo-400 font-bold">
                    {key}
                  </div>
                  <div className="mt-1 text-xs font-semibold leading-snug">{value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Verified Reviews & Live Review Submission */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
            {/* Review List (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-bold">
                  Verified Customer Telemetry & Reviews ({reviews.length})
                </h3>
                <span className="font-mono-num text-xs font-bold text-amber-400">
                  ★ {product.rating} / 5.0 Avg
                </span>
              </div>

              {loadingReviews ? (
                <div className="text-xs text-slate-400 py-6">
                  Loading verified reviews from SQLite...
                </div>
              ) : reviews.length === 0 ? (
                <div
                  className={`rounded-2xl border p-6 text-xs text-slate-400 ${
                    darkMode ? 'border-white/[0.08]' : 'border-slate-200'
                  }`}
                >
                  No reviews yet for this model. Be the first to post your hardware review!
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                  {reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className={`rounded-2xl border p-4 space-y-2 ${
                        darkMode
                          ? 'bg-slate-950/75 border-white/[0.08]'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs">{rev.author_name}</span>
                          {rev.author_location && (
                            <span className="text-[11px] text-slate-400">
                              • {rev.author_location}
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1 rounded bg-emerald-500/15 px-1.5 py-0.5 font-mono-num text-[10px] font-semibold text-emerald-400">
                            <CheckCircle2 className="h-3 w-3" /> Verified
                          </span>
                        </div>
                        <span className="font-mono-num text-[11px] text-slate-400">
                          {formatRelativeTime(rev.created_at)}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-amber-400">
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <Star
                            key={idx}
                            className={`h-3.5 w-3.5 ${
                              idx < rev.rating
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-600'
                            }`}
                          />
                        ))}
                        <span
                          className={`ml-1.5 text-xs font-bold ${
                            darkMode ? 'text-slate-100' : 'text-slate-900'
                          }`}
                        >
                          {rev.title}
                        </span>
                      </div>

                      <p
                        className={`text-xs leading-relaxed ${
                          darkMode ? 'text-slate-300' : 'text-slate-600'
                        }`}
                      >
                        {rev.comment}
                      </p>

                      <div className="pt-1">
                        <button
                          onClick={() => handleVoteHelpful(rev.id)}
                          className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 font-mono-num text-[11px] transition cursor-pointer ${
                            darkMode
                              ? 'border-white/[0.08] bg-slate-900 text-slate-300 hover:border-indigo-500 hover:text-indigo-400'
                              : 'border-slate-200 bg-white text-slate-700 hover:border-indigo-400 hover:text-indigo-600'
                          }`}
                        >
                          <ThumbsUp className="h-3 w-3" />
                          <span>Helpful ({rev.helpful_count || 0})</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Post a Review Form (5 cols) */}
            <form
              onSubmit={handleSubmitReview}
              className={`lg:col-span-5 rounded-3xl p-5 space-y-3.5 ${
                darkMode ? 'surface-card-dark' : 'surface-card-light'
              }`}
            >
              <div className="flex items-center gap-2">
                <MessageSquarePlus className="h-4 w-4 text-indigo-400" />
                <h4 className="font-display text-sm font-bold">
                  Write a Verified Review (Persisted to SQLite)
                </h4>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <input
                  type="text"
                  required
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="Your Name"
                  className={`rounded-xl border px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 ${inputSurface}`}
                />
                <input
                  type="text"
                  value={authorLocation}
                  onChange={(e) => setAuthorLocation(e.target.value)}
                  placeholder="City (e.g. Nairobi, KE)"
                  className={`rounded-xl border px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 ${inputSurface}`}
                />
              </div>

              <div
                className={`flex items-center justify-between rounded-xl border px-3 py-2 ${inputSurface}`}
              >
                <span className="text-xs text-slate-400">Star Rating:</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      className="p-0.5 cursor-pointer"
                    >
                      <Star
                        className={`h-4 w-4 ${
                          star <= rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-500'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <input
                type="text"
                required
                value={reviewTitle}
                onChange={(e) => setReviewTitle(e.target.value)}
                placeholder="Review headline (e.g. Unmatched thermal performance)"
                className={`w-full rounded-xl border px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 ${inputSurface}`}
              />

              <textarea
                rows={3}
                required
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your hands-on experience with build quality, latency, or battery life..."
                className={`w-full rounded-xl border px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 ${inputSurface}`}
              />

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 py-2.5 text-xs font-semibold text-white shadow-md shadow-indigo-600/25 transition cursor-pointer"
              >
                {submitting ? 'Publishing to SQLite & WS...' : 'Publish Verified Review'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
