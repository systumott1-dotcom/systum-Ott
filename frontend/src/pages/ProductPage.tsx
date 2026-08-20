import React, { useState, useEffect } from 'react';
import type { Product, ProductPlan } from '../types';
import { useCart, WHATSAPP_PHONE } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ProductCard } from '../components/ProductCard';
import { 
  ShieldCheck, 
  Zap, 
  Check, 
  ShoppingBag, 
  ArrowLeft, 
  MessageCircle, 
  Tv, 
  Smartphone, 
  Flame, 
  BadgeCheck,
  ChevronRight,
  Package,
  Heart,
  TrendingUp,
  Lock,
  Headphones,
  CheckCircle2,
  Star,
  Trash2,
  MessageSquare,
  Send,
  Plus,
  Camera,
  Upload,
  X,
  ChevronDown,
  ChevronUp,
  Loader2
} from 'lucide-react';
import { compressImage, getImageFromPasteEvent, isAllowedImageFile } from '../utils/imageCompressor';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';

interface ProductPageProps {
  productIdOrSlug: string;
  products: Product[];
  loading?: boolean;
  onBackToHome: () => void;
  onNavigateProduct: (slugOrId: string) => void;
}

export const ProductPage: React.FC<ProductPageProps> = ({
  productIdOrSlug,
  products,
  loading = false,
  onBackToHome,
  onNavigateProduct,
}) => {
  const { addToCart, buyNow } = useCart();
  const { user, isAdmin, token, setIsAuthModalOpen, setAuthModalTab } = useAuth();
  const toast = useToast();
  const [isAdded, setIsAdded] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Find product by id or slug
  const product = products.find(
    (p) => p.slug === productIdOrSlug || p.id === productIdOrSlug
  );

  // Find popular plan or first plan
  const defaultPlanIndex = product?.plans.findIndex((p) => p.isPopular) ?? 0;
  const [selectedPlanIndex, setSelectedPlanIndex] = useState<number>(
    defaultPlanIndex >= 0 ? defaultPlanIndex : 0
  );

  // Reviews State
  interface ReviewItem {
    id: string;
    productId: string;
    productTitle?: string;
    authorName: string;
    userEmail?: string;
    rating: number;
    comment: string;
    avatar?: string;
    screenshotUrl?: string;
    imageUrl?: string;
    isVerified?: boolean;
    createdAt: string;
  }

  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [authorName, setAuthorName] = useState(user?.name || '');
  const [reviewComment, setReviewComment] = useState('');
  const [screenshotBase64, setScreenshotBase64] = useState<string>('');
  const [screenshotPreview, setScreenshotPreview] = useState<string>('');
  const [compressing, setCompressing] = useState(false);
  const [compressionInfo, setCompressionInfo] = useState<{ orig: number; comp: number } | null>(null);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [visibleCount, setVisibleCount] = useState<number>(6);
  const [lightboxImage, setLightboxImage] = useState<{ url: string; author: string } | null>(null);

  useBodyScrollLock(Boolean(lightboxImage));

  // Sync authorName when logged in user changes
  useEffect(() => {
    if (user?.name) {
      setAuthorName(user.name);
    }
  }, [user]);

  // Reset plan index & fetch reviews when product changes
  useEffect(() => {
    if (product) {
      const popularIdx = product.plans.findIndex((p) => p.isPopular);
      setSelectedPlanIndex(popularIdx >= 0 ? popularIdx : 0);
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Dynamic SEO Title & Meta Description for Product Page
      document.title = `${product.title} | Buy Cheap Subscription India | Systum OTT`;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', `Buy ${product.title} in India with instant WhatsApp delivery and full warranty. ${product.shortDescription}`);
      }

      // Fetch reviews for this product
      setReviewsLoading(true);
      const targetId = product.slug || product.id;
      fetch(`/api/reviews?productId=${encodeURIComponent(targetId)}`)
        .then((r) => r.json())
        .then((d) => {
          if (d.success && Array.isArray(d.reviews)) {
            setReviews(d.reviews);
          }
        })
        .catch(() => {})
        .finally(() => setReviewsLoading(false));
    }
  }, [product]);

  // Image compression processor
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
      toast.success(`Screenshot attached! Compressed to ${res.compressedSizeKb} KB (${Math.round((1 - res.compressedSizeKb / res.originalSizeKb) * 100)}% saved) 📸`);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to process screenshot');
    } finally {
      setCompressing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleProcessImage(file);
  };

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
    if (!product || !displayName || !reviewComment.trim()) {
      toast.warning('Please enter your review comment.');
      return;
    }
    setSubmittingReview(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          productId: product.slug || product.id,
          productTitle: product.title,
          authorName: displayName,
          userEmail: user?.email,
          rating: newRating,
          comment: reviewComment.trim(),
          screenshot: screenshotBase64 || undefined,
        }),
      });
      const data = await res.json();
      if (data.success && data.review) {
        setReviews((prev) => [data.review, ...prev]);
        setReviewComment('');
        setScreenshotBase64('');
        setScreenshotPreview('');
        setCompressionInfo(null);
        setNewRating(5);
        setIsReviewFormOpen(false);
        toast.success('Your review was posted successfully! ⭐');
      } else {
        toast.error(data.message || 'Failed to submit review.');
      }
    } catch {
      toast.error('Network error submitting review.');
    } finally {
      setSubmittingReview(false);
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

  if (loading && !product) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-8">
        <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mb-4" />
        <p className="text-sm font-bold text-slate-600">Loading subscription details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-5">
        <div className="w-16 h-16 rounded-3xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-slate-400">
          <Package className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900">Product Not Found</h2>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          The subscription you are looking for might have been moved or is currently unavailable.
        </p>
        <button
          onClick={onBackToHome}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-md transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Store</span>
        </button>
      </div>
    );
  }

  const selectedPlan: ProductPlan = product.plans[selectedPlanIndex] || product.plans[0] || {
    name: 'Standard Access',
    validity: '30 Days',
    originalPrice: 499,
    discountedPrice: 99,
  };

  const discountPercent = selectedPlan.originalPrice > selectedPlan.discountedPrice
    ? Math.round(((selectedPlan.originalPrice - selectedPlan.discountedPrice) / selectedPlan.originalPrice) * 100)
    : 0;

  const savingsAmount = Math.max(0, selectedPlan.originalPrice - selectedPlan.discountedPrice);

  // Better value alternative plan (if another longer plan exists)
  const nextBetterPlanIndex = product.plans.findIndex((_, idx) => idx > selectedPlanIndex);
  const betterPlan = nextBetterPlanIndex !== -1 ? product.plans[nextBetterPlanIndex] : null;

  const handleAddToCart = () => {
    addToCart(product, selectedPlan);
    setIsAdded(true);
    toast.success(`Added ${product.title} (${selectedPlan.validity}) to your cart!`);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleBuyNow = () => {
    buyNow(product, selectedPlan);
  };

  // Related products from same category
  const relatedProducts = products
    .filter((p) => p.id !== product.id && (p.category === product.category || product.category === 'all'))
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-slate-50/50 pb-32 relative">
      
      {/* Top Breadcrumbs & Back Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-20 z-20 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500 overflow-x-auto whitespace-nowrap py-1">
            <button
              onClick={onBackToHome}
              className="font-semibold hover:text-brand-600 flex items-center gap-1 shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Store</span>
            </button>
            <ChevronRight className="w-3 h-3 text-slate-300 shrink-0" />
            <span className="capitalize font-medium text-slate-600 shrink-0">
              {product.category}
            </span>
            <ChevronRight className="w-3 h-3 text-slate-300 shrink-0" />
            <span className="font-bold text-slate-900 truncate max-w-[200px] sm:max-w-xs">
              {product.title}
            </span>
          </div>

          <button
            onClick={() => setIsWishlisted(!isWishlisted)}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-red-500 p-1.5 rounded-xl hover:bg-slate-50 transition-colors shrink-0"
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
            <span className="hidden sm:inline">{isWishlisted ? 'Saved' : 'Wishlist'}</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Main Product Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* LEFT COLUMN: Product Poster Image + Devices (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Poster Card */}
            <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-sm relative overflow-hidden group">
              <div className="relative w-full aspect-[4/3] sm:aspect-square rounded-2xl overflow-hidden bg-slate-900 border border-slate-100">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div
                    className="w-full h-full flex flex-col items-center justify-center p-6 text-center"
                    style={{
                      background: `linear-gradient(135deg, ${product.iconColor}30, ${product.iconColor}08)`,
                    }}
                  >
                    <div
                      className="w-20 h-20 rounded-3xl flex items-center justify-center shadow-lg mb-3"
                      style={{
                        backgroundColor: `${product.iconColor}20`,
                        borderColor: `${product.iconColor}40`,
                        borderWidth: '1px',
                      }}
                    >
                      <Tv className="w-10 h-10" style={{ color: product.iconColor }} />
                    </div>
                    <span className="text-sm font-extrabold text-slate-800">
                      {product.title}
                    </span>
                  </div>
                )}

                {/* Badges on Image */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start z-10 pointer-events-none">
                  {discountPercent > 0 && (
                    <span className="bg-[#E50914] text-white text-xs font-black uppercase px-2.5 py-1 rounded-lg shadow-md tracking-wider">
                      {discountPercent}% OFF
                    </span>
                  )}
                  {product.badge && (
                    <span className="bg-slate-900/90 backdrop-blur-xs text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded-lg border border-white/20 shadow-md">
                      {product.badge}
                    </span>
                  )}
                </div>
              </div>

              {/* Instant Verification Tag */}
              <div className="mt-4 flex items-center justify-between text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                  <BadgeCheck className="w-4 h-4 text-emerald-600" />
                  <span>100% Genuine & Verified</span>
                </div>
                <span className="text-slate-400">·</span>
                <div className="flex items-center gap-1 font-semibold">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span>Instant Delivery Via WhatsApp</span>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Plan Selector, Pricing, About & 2x2 Trust Cards (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
              
              {/* Category, Discount & In Stock Pills */}
              <div>
                <div className="flex items-center gap-2 mb-2.5 flex-wrap">
                  <span className="inline-block text-[11px] font-extrabold uppercase tracking-wider text-[#9C7A4A] bg-[#FAF5EE] px-3 py-1 rounded-full border border-[#EFE3CF]">
                    🎬 {product.category.toUpperCase()} APPS
                  </span>
                  {discountPercent > 0 && (
                    <span className="text-[11px] font-black text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                      {discountPercent}% OFF
                    </span>
                  )}
                  <span className="text-[11px] font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    IN STOCK
                  </span>
                  {product.badge && (
                    <span className="text-[11px] font-bold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-full border border-brand-200 flex items-center gap-1">
                      <Flame className="w-3 h-3 text-brand-600" />
                      {product.badge}
                    </span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-snug">
                  {product.title}
                </h1>

                {/* Product SEO Tags */}
                {product.tags && product.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {product.tags.map((tag, idx) => (
                      <span key={idx} className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 border border-slate-200">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Price Display */}
                <div className="flex items-baseline gap-2.5 mt-3 flex-wrap">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900">
                    ₹{selectedPlan.discountedPrice}
                  </span>
                  {selectedPlan.originalPrice > selectedPlan.discountedPrice && (
                    <span className="text-sm text-slate-400 line-through">
                      ₹{selectedPlan.originalPrice}
                    </span>
                  )}
                  {savingsAmount > 0 && (
                    <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      🏷️ You save ₹{savingsAmount}!
                    </span>
                  )}
                </div>
              </div>

              {/* SELECT PLAN - Pill Buttons Selector */}
              <div className="space-y-3 pt-2">
                <label className="text-xs font-extrabold uppercase tracking-widest text-slate-500 block">
                  SELECT PLAN
                </label>
                
                <div className="flex flex-wrap gap-2.5">
                  {product.plans.map((plan, idx) => {
                    const isSelected = selectedPlanIndex === idx;
                    const planDiscount = plan.originalPrice > plan.discountedPrice
                      ? Math.round(((plan.originalPrice - plan.discountedPrice) / plan.originalPrice) * 100)
                      : 0;

                    return (
                      <button
                        key={plan.name}
                        type="button"
                        onClick={() => setSelectedPlanIndex(idx)}
                        className={`px-4 py-2.5 rounded-2xl border text-center transition-all ${
                          isSelected
                            ? 'bg-[#FAF5EE] border-[#D4AF37] ring-2 ring-[#D4AF37]/30 shadow-sm scale-105'
                            : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        <span className="font-extrabold text-xs text-slate-900 block uppercase">
                          {plan.validity || plan.name}
                        </span>
                        {planDiscount > 0 && (
                          <span className={`text-[10px] font-bold block ${isSelected ? 'text-emerald-700' : 'text-slate-500'}`}>
                            {planDiscount}% off
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Better Value Available Upsell Card */}
                {betterPlan && (
                  <div className="mt-3 p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-center justify-between gap-3 text-left animate-in fade-in duration-200">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                        <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
                        <span>Better Value Available</span>
                      </div>
                      <p className="text-xs font-extrabold text-slate-900 mt-0.5">
                        Upgrade to {betterPlan.validity || betterPlan.name} — only ₹{betterPlan.discountedPrice}
                      </p>
                      <span className="text-[10px] font-bold text-emerald-700">
                        Save ₹{betterPlan.originalPrice - betterPlan.discountedPrice} more!
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedPlanIndex(nextBetterPlanIndex)}
                      className="px-4 py-2 bg-amber-400 hover:bg-amber-500 text-slate-900 font-extrabold text-xs rounded-xl shadow-xs transition-colors shrink-0"
                    >
                      Switch
                    </button>
                  </div>
                )}
              </div>

              {/* Primary Action Buttons */}
              <div className="pt-2 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={handleBuyNow}
                    className="py-4 px-6 rounded-2xl bg-gradient-to-r from-brand-600 via-brand-700 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-base font-black shadow-xl shadow-brand-600/30 transition-all transform hover:-translate-y-0.5 active:scale-98 flex items-center justify-center gap-2.5 cursor-pointer"
                  >
                    <Zap className="w-5 h-5 fill-white" />
                    <span>Buy Now · ₹{selectedPlan.discountedPrice}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className={`py-3.5 px-5 rounded-2xl border text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-xs active:scale-98 ${
                      isAdded
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span>Added to Cart!</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4 text-brand-600" />
                        <span>Add to Cart</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* ABOUT THIS PLAN SECTION */}
              <div className="pt-6 border-t border-slate-100 space-y-5 text-left">
                <h3 className="text-base font-extrabold text-slate-900">
                  About This Plan
                </h3>

                {/* Features Checklist */}
                <div className="space-y-2.5 text-xs sm:text-sm text-slate-700">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <Lock className="w-4 h-4 text-brand-600 shrink-0" />
                    <span>{product.title} – {product.accountType}</span>
                  </div>

                  {product.features.map((feat, i) => (
                    <div key={i} className="flex items-start gap-2.5 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}

                  <div className="flex items-start gap-2.5 font-medium">
                    <Smartphone className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                    <span>Compatible with all devices – Mobile, Smart TV, Laptop, Tablet</span>
                  </div>

                  <div className="flex items-start gap-2.5 font-medium">
                    <Tv className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                    <span>2 Device Login Access – use on any one device at a time</span>
                  </div>

                  <div className="flex items-start gap-2.5 font-medium">
                    <MessageCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Full 100% WhatsApp support provided for any access-related inquiry</span>
                  </div>
                </div>

              </div>

              {/* 2 ROWS x 2 COLUMNS TRUST CARDS (Under every product/order!) */}
              <div className="pt-4 border-t border-slate-100">
                <div className="grid grid-cols-2 gap-3 sm:gap-4 text-left">
                  
                  {/* Card 1: WhatsApp Delivery */}
                  <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200 shadow-2xs flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                      <Zap className="w-4 h-4 fill-amber-500 text-amber-500" />
                    </div>
                    <div className="min-w-0">
                      <h5 className="font-extrabold text-slate-900 text-xs sm:text-sm leading-tight truncate">
                        Instant Delivery Via WhatsApp
                      </h5>
                      <p className="text-[10px] sm:text-xs text-slate-500 font-medium leading-tight mt-0.5">
                        Within 5 minutes
                      </p>
                    </div>
                  </div>

                  {/* Card 2: Full Warranty */}
                  <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200 shadow-2xs flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="min-w-0">
                      <h5 className="font-extrabold text-slate-900 text-xs sm:text-sm leading-tight truncate">
                        Full Warranty
                      </h5>
                      <p className="text-[10px] sm:text-xs text-slate-500 font-medium leading-tight mt-0.5">
                        Duration covered
                      </p>
                    </div>
                  </div>

                  {/* Card 3: Secure Payment */}
                  <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200 shadow-2xs flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                      <Lock className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div className="min-w-0">
                      <h5 className="font-extrabold text-slate-900 text-xs sm:text-sm leading-tight truncate">
                        Secure Payment
                      </h5>
                      <p className="text-[10px] sm:text-xs text-slate-500 font-medium leading-tight mt-0.5">
                        UPI / QR Code
                      </p>
                    </div>
                  </div>

                  {/* Card 4: WhatsApp Support */}
                  <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200 shadow-2xs flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600 shrink-0">
                      <Headphones className="w-4 h-4 text-brand-600" />
                    </div>
                    <div className="min-w-0">
                      <h5 className="font-extrabold text-slate-900 text-xs sm:text-sm leading-tight truncate">
                        WhatsApp Support
                      </h5>
                      <p className="text-[10px] sm:text-xs text-slate-500 font-medium leading-tight mt-0.5">
                        We're here to help
                      </p>
                    </div>
                  </div>

                </div>
              </div>

              {/* Direct WhatsApp Inquiry Banner */}
              <a
                href={`https://wa.me/${WHATSAPP_PHONE}?text=Hello!+I+have+a+question+about+${encodeURIComponent(product.title)}+subscription.`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-emerald-800 hover:bg-emerald-100/70 transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <MessageCircle className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition-transform" />
                  <div>
                    <span className="text-xs font-extrabold block">Have questions about this plan?</span>
                    <span className="text-[11px] text-emerald-700 font-medium">Chat directly with our team on WhatsApp</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-emerald-600 group-hover:translate-x-0.5 transition-transform" />
              </a>

            </div>

          </div>

        </div>

        {/* CUSTOMER REVIEWS & RATINGS SECTION */}
        <div className="mt-16 pt-12 border-t border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold uppercase tracking-wider mb-2">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>Verified Buyer Reviews ({4500 + reviews.length}+ Total)</span>
              </div>
              <h3 className="text-xl sm:text-3xl font-extrabold text-slate-900">
                Customer Reviews & Ratings
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Real feedback from verified purchasers of {product.title}.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsReviewFormOpen(!isReviewFormOpen)}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-extrabold shadow-md shadow-brand-600/20 transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>{isReviewFormOpen ? 'Close Form' : 'Write a Review'}</span>
            </button>
          </div>

          {/* Write a Review Form */}
          {isReviewFormOpen && (
            <div className="mb-10 p-5 sm:p-7 rounded-3xl bg-white border border-slate-200 shadow-md animate-in fade-in zoom-in-95 duration-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h4 className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-brand-600" />
                  <span>Drop Your Review for {product.title}</span>
                </h4>
              </div>

              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Your Rating *
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 hover:scale-115 transition-transform"
                      >
                        <Star
                          className={`w-7 h-7 transition-colors ${
                            star <= (hoverRating || newRating)
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-300'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-slate-600 ml-2">
                      {newRating} / 5 Stars
                    </span>
                  </div>
                </div>

                {/* User Profile Info */}
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
                        placeholder="e.g. Rahul S."
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Your Review / Feedback *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Share your experience (activation speed, quality, support response)..."
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
                    <label 
                      onPaste={handlePaste}
                      className="border-2 border-dashed border-slate-200 hover:border-brand-500 bg-slate-50 hover:bg-brand-50/40 rounded-2xl p-5 flex flex-col items-center justify-center cursor-pointer transition-all text-center group"
                    >
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
                        Compressed to KB with high clarity retained
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
                              Optimized to {compressionInfo.comp} KB (saved {Math.round((1 - compressionInfo.comp / compressionInfo.orig) * 100)}%)
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
                        className="text-xs text-rose-600 hover:text-rose-700 font-bold hover:underline shrink-0"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={submittingReview || compressing}
                    className="px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-extrabold shadow-md flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    {submittingReview ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Post Review</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsReviewFormOpen(false)}
                    className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Reviews List */}
          {reviewsLoading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-3 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto mb-2" />
              <p className="text-xs text-slate-400">Loading verified customer reviews...</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
                <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
              </div>
              <h4 className="text-base font-extrabold text-slate-800">
                Be the first to review {product.title}!
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Purchased this subscription? Drop your honest rating & experience to help other members.
              </p>
              <button
                type="button"
                onClick={() => setIsReviewFormOpen(true)}
                className="px-4 py-2 bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Write First Review</span>
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reviews.slice(0, visibleCount).map((rev) => (
                  <div
                    key={rev.id}
                    className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between relative group"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <img
                            src={rev.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(rev.authorName)}`}
                            alt={rev.authorName}
                            className="w-10 h-10 rounded-full object-cover border border-slate-200 bg-slate-50 shrink-0"
                          />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-extrabold text-xs text-slate-900">{rev.authorName}</span>
                              <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-0.5">
                                <CheckCircle2 className="w-2.5 h-2.5" /> Verified Buyer
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
                              {new Date(rev.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          </div>
                        </div>

                        {/* Delete Review Button (Author or Admin only) */}
                        {(isAdmin || (user && (user.email === rev.userEmail || user.name === rev.authorName))) && (
                          <button
                            type="button"
                            onClick={() => handleDeleteReview(rev.id)}
                            className="text-slate-300 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                            title="Delete Review"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-1 text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                            }`}
                          />
                        ))}
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed italic">
                        "{rev.comment}"
                      </p>

                      {/* Attached Screenshot Proof Thumbnail */}
                      {(rev.screenshotUrl || rev.imageUrl) && (
                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={() => setLightboxImage({ url: (rev.screenshotUrl || rev.imageUrl)!, author: rev.authorName })}
                            className="group/img relative overflow-hidden rounded-xl border border-slate-200 hover:border-brand-400 transition-all block w-full bg-slate-50 cursor-pointer text-left"
                          >
                            <div className="relative h-28 w-full overflow-hidden bg-slate-900 flex items-center justify-center">
                              <img
                                src={rev.screenshotUrl || rev.imageUrl}
                                alt="Customer Proof"
                                className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300 opacity-90 group-hover/img:opacity-100"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-2">
                                <span className="text-[10px] font-bold text-white flex items-center gap-1">
                                  <Camera className="w-3 h-3 text-emerald-400" />
                                  <span>Click to View Sharp Proof</span>
                                </span>
                              </div>
                            </div>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* See More / Collapse Controls */}
              {reviews.length > 6 && (
                <div className="mt-8 text-center flex flex-col items-center gap-3">
                  <div className="text-xs text-slate-400 font-semibold">
                    Showing {Math.min(visibleCount, reviews.length)} of {reviews.length} product reviews
                  </div>

                  <div className="flex items-center gap-3">
                    {visibleCount < reviews.length ? (
                      <button
                        type="button"
                        onClick={() => setVisibleCount((prev) => Math.min(prev + 6, reviews.length))}
                        className="px-6 py-2.5 rounded-2xl bg-white hover:bg-slate-50 text-brand-600 font-extrabold text-xs border border-slate-200 shadow-sm hover:shadow-md transition-all flex items-center gap-2 cursor-pointer group"
                      >
                        <span>See More Reviews (+6)</span>
                        <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setVisibleCount(6)}
                        className="px-6 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs border border-slate-200 transition-all flex items-center gap-2 cursor-pointer"
                      >
                        <span>Collapse Reviews</span>
                        <ChevronUp className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Lightbox Modal for Full Sharp Resolution Proof */}
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

        {/* RELATED PRODUCTS SECTION */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 pt-12 border-t border-slate-200">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="inline-block text-xs font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-3 py-1 rounded-full border border-brand-200 mb-2">
                  Similar Subscriptions
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  You May Also Like
                </h3>
              </div>
              <button
                onClick={onBackToHome}
                className="text-xs font-bold text-brand-600 hover:text-brand-700 hover:underline flex items-center gap-1"
              >
                <span>View All Store</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6">
              {relatedProducts.map((relProduct) => (
                <div
                  key={relProduct.id}
                  onClick={() => onNavigateProduct(relProduct.slug || relProduct.id)}
                >
                  <ProductCard product={relProduct} />
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* ================= FIXED STICKY BUY BAR (ZERO SCROLLING NEEDED) ================= */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-2xl px-4 py-3 sm:py-3.5 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 sm:gap-6">
          {/* Left: Product & Plan Info */}
          <div className="flex items-center gap-3 min-w-0">
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.title} className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl object-cover border border-slate-200 shrink-0" />
            ) : (
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600 shrink-0 font-bold text-xs">
                {product.title.slice(0, 2)}
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xs sm:text-sm text-slate-900 truncate">
                  {product.title}
                </span>
                <span className="hidden sm:inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200 shrink-0">
                  {selectedPlan.validity || selectedPlan.name}
                </span>
              </div>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="font-black text-sm sm:text-lg text-slate-900">
                  ₹{selectedPlan.discountedPrice}
                </span>
                {selectedPlan.originalPrice > selectedPlan.discountedPrice && (
                  <span className="text-[10px] sm:text-xs text-slate-400 line-through">
                    ₹{selectedPlan.originalPrice}
                  </span>
                )}
                {discountPercent > 0 && (
                  <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                    {discountPercent}% OFF
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: Plan Switcher + Quick Actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Quick Plan Selector (if multiple plans) */}
            {product.plans.length > 1 && (
              <select
                value={selectedPlanIndex}
                onChange={(e) => setSelectedPlanIndex(Number(e.target.value))}
                className="hidden md:block px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
                aria-label="Select Plan"
              >
                {product.plans.map((p, idx) => (
                  <option key={idx} value={idx}>
                    {p.validity || p.name} — ₹{p.discountedPrice}
                  </option>
                ))}
              </select>
            )}

            <button
              type="button"
              onClick={handleAddToCart}
              className={`hidden sm:flex py-2.5 sm:py-3 px-4 rounded-xl border text-xs font-bold transition-all items-center gap-1.5 shadow-xs cursor-pointer ${
                isAdded
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
              }`}
            >
              {isAdded ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Added</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5 text-brand-600" />
                  <span>Add to Cart</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleBuyNow}
              className="py-3 sm:py-3.5 px-6 sm:px-8 rounded-2xl bg-gradient-to-r from-brand-600 via-brand-700 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-sm sm:text-base font-black shadow-xl shadow-brand-600/30 transition-all transform hover:-translate-y-0.5 active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 fill-white shrink-0" />
              <span>Buy Now · ₹{selectedPlan.discountedPrice}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
