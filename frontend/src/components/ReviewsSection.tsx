import React, { useState, useEffect } from 'react';
import { 
  Star, 
  CheckCircle2, 
  MessageSquareQuote, 
  ChevronDown, 
  ChevronUp, 
  Plus, 
  X, 
  Camera, 
  Upload, 
  Loader2, 
  Check, 
  Sparkles,
  Trash2
} from 'lucide-react';
import { REVIEWS as INITIAL_REVIEWS } from '../data/reviews';
import { compressImage, getImageFromPasteEvent, isAllowedImageFile } from '../utils/imageCompressor';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';

interface ReviewItem {
  id: string;
  author: string;
  userEmail?: string;
  avatar: string;
  rating: number;
  date: string;
  location?: string;
  productPurchased: string;
  comment: string;
  screenshotUrl?: string;
  verified: boolean;
}

const POPULAR_PRODUCTS = [
  'Netflix 4K Ultra HD Premium',
  'Disney+ Hotstar Super 4K',
  'Amazon Prime Video 4K',
  'YouTube Premium (Ad-Free + Music)',
  'ChatGPT Plus / OpenAI Pro',
  'Canva Pro Lifetime / 1-Year',
  'Spotify Premium Family Invite',
  'SonyLIV Premium VIP',
  'Zee5 Premium 4K',
  'Mega OTT Combo Pack',
  'Other Subscription'
];

export const ReviewsSection: React.FC = () => {
  const toast = useToast();
  const { user, isAdmin, token, setIsAuthModalOpen, setAuthModalTab } = useAuth();
  const [reviews, setReviews] = useState<ReviewItem[]>(INITIAL_REVIEWS);
  const [totalCount, setTotalCount] = useState<number>(4500 + INITIAL_REVIEWS.length);
  const [visibleCount, setVisibleCount] = useState<number>(6);

  // Review Form Modal State
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [authorName, setAuthorName] = useState(user?.name || '');
  const [selectedProduct, setSelectedProduct] = useState(POPULAR_PRODUCTS[0]);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [screenshotBase64, setScreenshotBase64] = useState<string>('');
  const [screenshotPreview, setScreenshotPreview] = useState<string>('');
  const [compressing, setCompressing] = useState(false);
  const [compressionInfo, setCompressionInfo] = useState<{ orig: number; comp: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Lightbox modal state for viewing screenshots in full sharp resolution
  const [lightboxImage, setLightboxImage] = useState<{ url: string; author: string } | null>(null);

  // Lock body scroll when modals are open
  useBodyScrollLock(isWriteModalOpen || Boolean(lightboxImage));

  // Sync authorName when logged-in user changes
  useEffect(() => {
    if (user?.name) {
      setAuthorName(user.name);
    }
  }, [user]);

  const fetchReviews = () => {
    fetch('/api/reviews')
      .then((r) => r.json())
      .then((d) => {
        if (d.success && Array.isArray(d.reviews) && d.reviews.length > 0) {
          const mapped: ReviewItem[] = d.reviews.map((r: any, idx: number) => ({
            id: r.id || `api-rev-${idx}`,
            author: r.authorName || r.author || 'Verified Buyer',
            userEmail: r.userEmail,
            avatar: r.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(r.authorName || r.author || 'Buyer')}`,
            rating: r.rating || 5,
            date: r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent',
            location: r.location || 'India',
            productPurchased: r.productTitle || r.productPurchased || 'OTT Plan',
            comment: r.comment || '',
            screenshotUrl: r.screenshotUrl || r.imageUrl,
            verified: r.isVerified ?? true,
          }));

          setReviews(mapped);
        }
        if (typeof d.totalReviewsCount === 'number') {
          setTotalCount(d.totalReviewsCount);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  // Process and compress image file
  const handleProcessImage = async (file: File) => {
    if (!isAllowedImageFile(file)) {
      toast.error('Invalid file format. Only PNG, JPEG, JPG, and WebP images are allowed.');
      return;
    }
    setCompressing(true);
    try {
      const res = await compressImage(file, 1400, 1400, 0.82);
      setScreenshotBase64(res.base64);
      setScreenshotPreview(res.base64);
      setCompressionInfo({ orig: res.originalSizeKb, comp: res.compressedSizeKb });
      toast.success(`Screenshot attached! Compressed to ${res.compressedSizeKb} KB (${Math.round((1 - res.compressedSizeKb / res.originalSizeKb) * 100)}% smaller) 📸`);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to process screenshot');
    } finally {
      setCompressing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessImage(file);
    }
  };

  // Clipboard Paste Support (e.g. Ctrl+V)
  const handlePaste = (e: React.ClipboardEvent) => {
    const file = getImageFromPasteEvent(e);
    if (file) {
      e.preventDefault();
      handleProcessImage(file);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    const displayName = (user?.name || authorName).trim();
    if (!displayName || !comment.trim()) {
      toast.warning('Please enter your review message.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          productId: selectedProduct.toLowerCase().replace(/\s+/g, '-'),
          productTitle: selectedProduct,
          authorName: displayName,
          userEmail: user?.email,
          rating,
          comment: comment.trim(),
          screenshot: screenshotBase64 || undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success('Thank you! Your verified review has been published 🎉');
        setIsWriteModalOpen(false);
        setComment('');
        setScreenshotBase64('');
        setScreenshotPreview('');
        setCompressionInfo(null);
        fetchReviews();
      } else {
        toast.error(data.message || 'Failed to submit review');
      }
    } catch {
      toast.error('Network error submitting review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    try {
      const res = await fetch(`/api/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const data = await res.json();
      if (data.success) {
        setReviews((prev) => prev.filter((r) => r.id !== reviewId));
        toast.success('Review deleted successfully! 🗑️');
      } else {
        toast.error(data.message || 'Failed to delete review.');
      }
    } catch {
      toast.error('Error deleting review.');
    }
  };

  const handleLoadMore = () => {
    setVisibleCount((prev) => Math.min(prev + 6, reviews.length));
  };

  const handleShowLess = () => {
    setVisibleCount(6);
    const reviewsEl = document.getElementById('reviews');
    if (reviewsEl) {
      reviewsEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="reviews" className="py-20 bg-white border-t border-slate-200 scroll-mt-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header with Stats & Write Button */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold uppercase tracking-wider">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {totalCount.toLocaleString()}+ Verified Customer Reviews · 4.9/5 Rating
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Customer Experiences & <span className="gradient-text">Proof</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Real unfiltered reviews with screenshot proof from verified subscribers across India.
            </p>
          </div>

          <button
            onClick={() => setIsWriteModalOpen(true)}
            className="px-5 py-3 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-extrabold text-xs shadow-lg shadow-brand-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Write a Review</span>
          </button>
        </div>

        {/* Reviews Grid (Limited to 6 initial, expandable) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.slice(0, visibleCount).map((review) => (
            <div
              key={review.id}
              className="white-card white-card-hover rounded-3xl p-6 border border-slate-200 transition-all duration-300 flex flex-col justify-between relative group bg-white shadow-xs"
            >
              <div className="absolute top-4 right-4 text-slate-200 group-hover:text-brand-200 transition-colors pointer-events-none">
                <MessageSquareQuote className="w-8 h-8" />
              </div>

              <div className="space-y-3">
                {/* Header with Stars and Delete Button */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                    <span className="text-xs font-bold text-slate-700 ml-1.5">{review.rating}.0</span>
                  </div>

                  {/* Delete button (Author or Admin only) */}
                  {(isAdmin || (user && (user.email === review.userEmail || user.name === review.author))) && (
                    <button
                      type="button"
                      onClick={() => handleDeleteReview(review.id)}
                      className="text-slate-300 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                      title="Delete Review"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Purchased product pill */}
                <div className="inline-block bg-brand-50 border border-brand-200 text-brand-700 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                  Purchased: {review.productPurchased}
                </div>

                {/* Comment */}
                <p className="text-xs text-slate-600 leading-relaxed italic">
                  "{review.comment}"
                </p>

                {/* Attached Screenshot Proof Thumbnail */}
                {review.screenshotUrl && (
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setLightboxImage({ url: review.screenshotUrl!, author: review.author })}
                      className="group/img relative overflow-hidden rounded-xl border border-slate-200 hover:border-brand-400 transition-all block w-full bg-slate-50 cursor-pointer text-left"
                    >
                      <div className="relative h-28 w-full overflow-hidden bg-slate-900 flex items-center justify-center">
                        <img
                          src={review.screenshotUrl}
                          alt="Customer Proof"
                          className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300 opacity-90 group-hover/img:opacity-100"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-2">
                          <span className="text-[10px] font-bold text-white flex items-center gap-1">
                            <Camera className="w-3 h-3 text-emerald-400" />
                            <span>Click to View Full Sharp Proof</span>
                          </span>
                        </div>
                      </div>
                    </button>
                  </div>
                )}
              </div>

              {/* Author & Verified Tag */}
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={review.avatar}
                    alt={review.author}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-brand-200 bg-slate-50 shrink-0"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <span>{review.author}</span>
                      {review.verified && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      )}
                    </h4>
                    <span className="text-[10px] text-slate-500">{review.location || 'Verified Buyer'}</span>
                  </div>
                </div>

                <span className="text-[10px] text-slate-400 font-medium">
                  {review.date}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Clean See More / Collapse Controls */}
        {reviews.length > 6 && (
          <div className="mt-12 text-center flex flex-col items-center gap-3">
            <div className="text-xs text-slate-400 font-semibold">
              Showing {Math.min(visibleCount, reviews.length)} of {reviews.length} customer reviews
            </div>

            <div className="flex items-center gap-3">
              {visibleCount < reviews.length ? (
                <button
                  type="button"
                  onClick={handleLoadMore}
                  className="px-6 py-3 rounded-2xl bg-white hover:bg-slate-50 text-brand-600 font-extrabold text-xs border border-slate-200 shadow-sm hover:shadow-md transition-all flex items-center gap-2 cursor-pointer group"
                >
                  <span>See More Reviews (+6)</span>
                  <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleShowLess}
                  className="px-6 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs border border-slate-200 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>Collapse Reviews</span>
                  <ChevronUp className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

      </div>

      {/* ================= WRITE REVIEW MODAL ================= */}
      {isWriteModalOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setIsWriteModalOpen(false)}
        >
          <div 
            className="relative max-w-xl w-full bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            onPaste={handlePaste}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
                  <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                  <span>Share Your Experience</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Help fellow customers by sharing your honest feedback & screenshot proof.
                </p>
              </div>
              <button 
                onClick={() => setIsWriteModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-4 mt-5">
              {/* User Profile Card or Log In Banner */}
              {user ? (
                <div className="flex items-center justify-between p-3.5 bg-gradient-to-r from-brand-50 to-indigo-50/60 rounded-2xl border border-brand-200">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.name)}`}
                      alt={user.name}
                      className="w-10 h-10 rounded-full ring-2 ring-brand-400 bg-white shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-xs text-slate-900 truncate">{user.name}</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-0.5">
                          <CheckCircle2 className="w-2.5 h-2.5" /> Verified Profile
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-medium block truncate">{user.email}</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-brand-700 font-extrabold bg-white px-2.5 py-1 rounded-xl border border-brand-200 shrink-0">
                    Posting as You
                  </span>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                    <span className="text-xs text-slate-600">
                      Have an account? Log in to post with your verified account badge.
                    </span>
                    <button
                      type="button"
                      onClick={() => { setAuthModalTab('login'); setIsAuthModalOpen(true); }}
                      className="text-xs font-bold text-brand-600 hover:text-brand-700 hover:underline shrink-0"
                    >
                      Log In Now
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      placeholder="e.g. Aman Verma"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Star Rating Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Overall Rating *
                </label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 hover:scale-115 transition-transform cursor-pointer"
                    >
                      <Star
                        className={`w-7 h-7 transition-colors ${
                          star <= (hoverRating || rating)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-extrabold text-brand-600 ml-2">
                    {rating} / 5 Stars
                  </span>
                </div>
              </div>

              {/* Subscription Purchased Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Subscription Purchased *
                </label>
                <select
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
                >
                  {POPULAR_PRODUCTS.map((prod) => (
                    <option key={prod} value={prod}>{prod}</option>
                  ))}
                </select>
              </div>

              {/* Review Text */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Your Review Message *
                </label>
                <textarea
                  required
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share details on activation speed, streaming quality, customer support, etc..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
                />
              </div>

              {/* Screenshot Proof Attachment & Paste Zone */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-brand-600" />
                    <span>Attach Screenshot Proof (Optional)</span>
                  </span>
                  <span className="text-[10px] text-brand-600 font-bold bg-brand-50 px-2 py-0.5 rounded-full border border-brand-200">
                    Ctrl+V to Paste
                  </span>
                </label>

                {!screenshotPreview ? (
                  <label className="border-2 border-dashed border-slate-200 hover:border-brand-500 bg-slate-50 hover:bg-brand-50/40 rounded-2xl p-5 flex flex-col items-center justify-center cursor-pointer transition-all text-center group">
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/jpg, image/webp"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <div className="w-10 h-10 rounded-full bg-white shadow-xs border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-brand-600 group-hover:scale-110 transition-all mb-2">
                      <Upload className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-slate-700 block">
                      Click to Browse or <span className="text-brand-600">Paste (Ctrl+V) Screenshot</span>
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5">
                      Auto-compressed to KB while keeping razor-sharp clarity
                    </span>
                  </label>
                ) : (
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={screenshotPreview}
                        alt="Proof Preview"
                        className="w-14 h-14 object-cover rounded-xl border border-slate-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Sharp Screenshot Attached</span>
                        </div>
                        {compressionInfo && (
                          <div className="text-[10px] text-emerald-700 font-medium mt-0.5">
                            Optimized to {compressionInfo.comp} KB (from {compressionInfo.orig} KB)
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setScreenshotBase64('');
                        setScreenshotPreview('');
                        setCompressionInfo(null);
                      }}
                      className="text-xs text-rose-600 hover:text-rose-700 font-bold hover:underline shrink-0 cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsWriteModalOpen(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || compressing}
                  className="flex-1 py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-extrabold shadow-md shadow-brand-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Publishing...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Post Review</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= LIGHTBOX MODAL FOR FULL SHARP PROOF ================= */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setLightboxImage(null)}
        >
          <div 
            className="relative max-w-3xl w-full bg-slate-900 rounded-3xl p-5 overflow-hidden border border-slate-700 shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-white">
              <span className="font-extrabold text-sm flex items-center gap-2">
                <Camera className="w-4 h-4 text-emerald-400" />
                <span>Customer Verification Proof · {lightboxImage.author}</span>
              </span>
              <button 
                onClick={() => setLightboxImage(null)}
                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mt-4 flex justify-center max-h-[75vh] overflow-auto rounded-2xl bg-black/50 p-2">
              <img
                src={lightboxImage.url}
                alt="Sharp Customer Proof"
                className="max-w-full h-auto object-contain rounded-xl shadow-lg"
              />
            </div>
          </div>
        </div>
      )}

    </section>
  );
};
