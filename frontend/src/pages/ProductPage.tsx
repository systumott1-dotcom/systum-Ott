import React, { useState, useEffect } from 'react';
import type { Product, ProductPlan } from '../types';
import { useCart, WHATSAPP_PHONE } from '../context/CartContext';
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
  Laptop, 
  Tablet, 
  Flame, 
  BadgeCheck,
  ChevronRight,
  Package,
  Heart,
  HelpCircle,
  TrendingUp,
  Lock,
  Headphones,
  CheckCircle2,
  XCircle
} from 'lucide-react';

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

  // Reset plan index when product changes
  useEffect(() => {
    if (product) {
      const popularIdx = product.plans.findIndex((p) => p.isPopular);
      setSelectedPlanIndex(popularIdx >= 0 ? popularIdx : 0);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [product]);

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
    <div className="min-h-screen bg-slate-50/50 pb-20">
      
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
                  <span>Instant WhatsApp Delivery</span>
                </div>
              </div>
            </div>

            {/* Supported Devices */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Supported Devices & Platforms
              </h4>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-700 space-y-1">
                  <Tv className="w-5 h-5 mx-auto text-brand-600" />
                  <span className="text-[10px] font-bold block">Smart TV</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-700 space-y-1">
                  <Smartphone className="w-5 h-5 mx-auto text-brand-600" />
                  <span className="text-[10px] font-bold block">Mobile</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-700 space-y-1">
                  <Laptop className="w-5 h-5 mx-auto text-brand-600" />
                  <span className="text-[10px] font-bold block">Laptop/PC</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-700 space-y-1">
                  <Tablet className="w-5 h-5 mx-auto text-brand-600" />
                  <span className="text-[10px] font-bold block">Tablet</span>
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
                    className="py-3.5 px-5 rounded-2xl bg-gradient-to-r from-brand-600 via-brand-700 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-sm font-extrabold shadow-lg shadow-brand-600/25 transition-all transform hover:-translate-y-0.5 active:scale-98 flex items-center justify-center gap-2"
                  >
                    <Zap className="w-4 h-4 fill-white" />
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

                {/* FAQs - Quick Answers */}
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-brand-600" />
                    <span>FAQs – Quick Answers</span>
                  </h4>

                  <div className="space-y-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <div>
                      <strong className="text-slate-900 block mb-0.5">Q1. Can I use on multiple devices?</strong>
                      <span className="text-emerald-700 font-semibold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Yes, login allowed on multiple devices, usable on one device at a time.
                      </span>
                    </div>

                    <div className="pt-2 border-t border-slate-200">
                      <strong className="text-slate-900 block mb-0.5">Q2. Will I face screen limit or profile access issues?</strong>
                      <span className="text-slate-600 font-semibold flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5 text-rose-500" /> No. This plan is verified and designed to be issue-free with full replacement warranty.
                      </span>
                    </div>
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
                        WhatsApp Delivery
                      </h5>
                      <p className="text-[10px] sm:text-xs text-slate-500 font-medium leading-tight mt-0.5">
                        Secure & direct
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
    </div>
  );
};
