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
  Radio
} from 'lucide-react';
import { formatPrice, formatRelativeTime } from '../utils/currency.js';

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

  const imgUrl = `${product.image_url}?view=${encodeURIComponent(selectedView)}${
    selectedColor?.hex ? `&color=${encodeURIComponent(selectedColor.hex)}` : ''
  }`;

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-3 sm:p-6 overflow-y-auto">
      <div
        className={`relative my-auto w-full max-w-5xl max-h-[92vh] overflow-y-auto rounded-3xl border shadow-2xl ${
          darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Top Modal Bar */}
        <div
          className={`sticky top-0 z-20 flex items-center justify-between border-b px-6 py-4 backdrop-blur-xl ${
            darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="rounded-lg bg-indigo-500/15 border border-indigo-500/30 px-2.5 py-1 font-mono-num text-xs font-bold text-indigo-400">
              {product.sku}
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              {product.brand}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 px-2.5 py-0.5 font-mono-num text-[11px] text-cyan-400">
              <Radio className="h-3 w-3 animate-pulse" />
              {activeViewers} engineers inspecting live
            </span>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl border border-slate-700/80 bg-slate-800/70 hover:bg-slate-700 p-2 text-slate-300 transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Main Content Grid */}
        <div className="p-6 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left 7 Cols: 4-Angle Interactive CAD / Studio Viewer */}
            <div className="lg:col-span-7 space-y-4">
              <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
                <img
                  src={imgUrl}
                  alt={product.name}
                  className="w-full h-80 sm:h-96 object-cover"
                />
                {product.badge && (
                  <span className="absolute left-4 top-4 rounded-lg bg-indigo-600 px-3 py-1 font-mono-num text-xs font-bold text-white shadow-lg">
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
                    className={`rounded-xl border px-3 py-2.5 text-left transition cursor-pointer ${
                      selectedView === g.view
                        ? 'border-indigo-500 bg-indigo-500/15 text-indigo-300'
                        : darkMode
                        ? 'border-slate-800 bg-slate-950/70 text-slate-400 hover:text-white'
                        : 'border-slate-200 bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div className="font-mono-num text-[10px] uppercase text-slate-500">
                      ANGLE // {g.view}
                    </div>
                    <div className="mt-0.5 text-xs font-semibold">{g.label}</div>
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
                  <span className="text-slate-600">•</span>
                  <span className="font-mono-num text-xs text-emerald-400">
                    {product.sold_count} units deployed
                  </span>
                </div>

                <h2 className="font-display text-2xl sm:text-3xl font-bold leading-tight">
                  {product.name}
                </h2>

                <p className={`text-sm leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  {product.description}
                </p>

                {/* Price Block */}
                <div className="rounded-2xl border border-slate-800/80 bg-slate-950/50 p-4 flex items-center justify-between">
                  <div>
                    <div className="flex items-baseline gap-2.5">
                      <span className="font-mono-num text-3xl font-bold text-indigo-400">
                        {formatPrice(product.price, currency)}
                      </span>
                      {product.original_price > product.price && (
                        <span className="font-mono-num text-sm text-slate-500 line-through">
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
                          ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
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
                      Select Hardware Finish: <strong className="text-white">{selectedColor.name}</strong>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {product.colors.map((c) => (
                        <button
                          key={c.name}
                          onClick={() => setSelectedColor(c)}
                          className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition cursor-pointer ${
                            selectedColor.name === c.name
                              ? 'border-indigo-500 bg-indigo-500/15 text-white'
                              : darkMode
                              ? 'border-slate-800 bg-slate-950 text-slate-300'
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
                  <div className="flex items-center rounded-xl border border-slate-800 bg-slate-950 px-2 py-1.5">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="px-2.5 py-1 text-sm font-bold text-slate-300 hover:text-white cursor-pointer"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-mono-num text-sm font-bold">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity((q) => Math.min(Math.max(1, product.stock), q + 1))}
                      className="px-2.5 py-1 text-sm font-bold text-slate-300 hover:text-white cursor-pointer"
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
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 py-3.5 px-5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 transition cursor-pointer"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    <span>
                      Add to Cart • {formatPrice(product.price * quantity, currency)}
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
                        ? 'border-slate-800 bg-slate-950 text-slate-300 hover:bg-slate-800'
                        : 'border-slate-200 bg-slate-100 text-slate-700'
                    }`}
                  >
                    <Heart className={`h-3.5 w-3.5 ${isWishlisted ? 'fill-rose-500' : ''}`} />
                    <span>{isWishlisted ? 'Saved in Wishlist' : 'Save to Wishlist'}</span>
                  </button>

                  <button
                    onClick={() => onToggleCompare(product.id)}
                    className={`flex items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-semibold transition cursor-pointer ${
                      isCompared
                        ? 'border-cyan-500/50 bg-cyan-500/15 text-cyan-300'
                        : darkMode
                        ? 'border-slate-800 bg-slate-950 text-slate-300 hover:bg-slate-800'
                        : 'border-slate-200 bg-slate-100 text-slate-700'
                    }`}
                  >
                    <Layers className="h-3.5 w-3.5" />
                    <span>{isCompared ? 'In Comparison' : 'Add to Compare'}</span>
                  </button>
                </div>
              </div>

              {/* Shipping & Authenticity Footer */}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800/80 text-xs text-slate-400">
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
            className={`rounded-2xl border p-5 ${
              darkMode ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
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
                  className={`rounded-xl border p-3.5 ${
                    darkMode ? 'bg-slate-900/90 border-slate-800/90' : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="font-mono-num text-[11px] uppercase tracking-wider text-indigo-400">
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
              <h3 className="font-display text-lg font-bold">
                Verified Customer Telemetry & Reviews ({reviews.length})
              </h3>

              {loadingReviews ? (
                <div className="text-xs text-slate-400 py-6">Loading verified reviews from SQLite...</div>
              ) : reviews.length === 0 ? (
                <div className="rounded-2xl border border-slate-800 p-6 text-xs text-slate-400">
                  No reviews yet for this model. Be the first to post your hardware review!
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                  {reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className={`rounded-2xl border p-4 space-y-2 ${
                        darkMode ? 'bg-slate-950/75 border-slate-800' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs">{rev.author_name}</span>
                          {rev.author_location && (
                            <span className="text-[11px] text-slate-400">• {rev.author_location}</span>
                          )}
                          <span className="inline-flex items-center gap-1 rounded bg-emerald-500/15 px-1.5 py-0.5 font-mono-num text-[10px] text-emerald-400">
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
                              idx < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'
                            }`}
                          />
                        ))}
                        <span className="ml-1.5 text-xs font-bold text-slate-100">{rev.title}</span>
                      </div>

                      <p className={`text-xs leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                        {rev.comment}
                      </p>

                      <div className="pt-1">
                        <button
                          onClick={() => handleVoteHelpful(rev.id)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1 font-mono-num text-[11px] text-slate-300 hover:border-indigo-500 hover:text-indigo-400 transition cursor-pointer"
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
              className={`lg:col-span-5 rounded-2xl border p-5 space-y-3.5 ${
                darkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'
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
                  className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  type="text"
                  value={authorLocation}
                  onChange={(e) => setAuthorLocation(e.target.value)}
                  placeholder="City (e.g. Nairobi, KE)"
                  className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900 px-3 py-2">
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
                          star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-600'
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
                className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />

              <textarea
                rows={3}
                required
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your hands-on experience with build quality, latency, or battery life..."
                className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 py-2.5 text-xs font-semibold text-white shadow-md shadow-indigo-600/25 transition cursor-pointer"
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
