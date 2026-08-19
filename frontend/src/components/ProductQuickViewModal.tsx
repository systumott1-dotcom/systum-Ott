import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { 
  X, 
  Check, 
  ShieldCheck, 
  Zap, 
  ShoppingBag, 
  Tv, 
  Smartphone, 
  Star, 
  Lock
} from 'lucide-react';
import type { ProductPlan } from '../types';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';

export const ProductQuickViewModal: React.FC = () => {
  const { quickViewProduct, setQuickViewProduct, addToCart, buyNow } = useCart();
  useBodyScrollLock(Boolean(quickViewProduct));
  const [selectedPlanIndex, setSelectedPlanIndex] = useState(0);

  if (!quickViewProduct) return null;

  const product = quickViewProduct;
  const selectedPlan: ProductPlan = product.plans[selectedPlanIndex] || product.plans[0];
  const discountPercent = Math.round(
    ((selectedPlan.originalPrice - selectedPlan.discountedPrice) / selectedPlan.originalPrice) * 100
  );

  const handleAddToCart = () => {
    addToCart(product, selectedPlan);
    setQuickViewProduct(null);
  };

  const handleBuyNow = () => {
    buyNow(product, selectedPlan);
    setQuickViewProduct(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="white-card bg-white border border-slate-200 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => setQuickViewProduct(null)}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Header */}
        <div className="flex items-start gap-4 mb-6">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-xs"
            style={{
              backgroundColor: `${product.iconColor}15`,
              borderColor: `${product.iconColor}30`,
              borderWidth: '1px',
            }}
          >
            <Tv className="w-7 h-7" style={{ color: product.iconColor }} />
          </div>

          <div className="pr-8">
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-brand-50 text-brand-700 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border border-brand-200">
                {product.accountType}
              </span>
              {product.badge && (
                <span className="bg-emerald-50 text-emerald-700 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border border-emerald-200">
                  {product.badge}
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              {product.title}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center text-amber-500 text-xs font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-400 mr-1" />
                <span>{product.rating}</span>
              </div>
              <span className="text-slate-400 text-xs">•</span>
              <span className="text-slate-500 text-xs">{product.reviewsCount}+ verified users</span>
            </div>
          </div>
        </div>

        {/* Short & Full Description */}
        <div className="space-y-4 mb-6 text-sm text-slate-600 leading-relaxed border-y border-slate-100 py-4">
          <p>{product.shortDescription}</p>

          {/* Key Features */}
          <div className="space-y-2 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Key Features & Benefits:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {product.features.map((feat, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-slate-700 font-medium">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Compatibility Badges */}
          {product.compatibility.length > 0 && (
            <div className="pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Supported Devices:
              </h4>
              <div className="flex flex-wrap gap-2">
                {product.compatibility.map((dev, i) => (
                  <span
                    key={i}
                    className="bg-slate-50 border border-slate-200 px-3 py-1 rounded-xl text-xs font-semibold text-slate-700 flex items-center gap-1.5"
                  >
                    <Smartphone className="w-3.5 h-3.5 text-brand-600" />
                    {dev}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Plan Selection */}
        <div className="mb-6 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Select Your Plan:
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {product.plans.map((plan, idx) => (
              <button
                key={plan.name}
                onClick={() => setSelectedPlanIndex(idx)}
                className={`p-3.5 rounded-2xl border text-left transition-all relative ${
                  selectedPlanIndex === idx
                    ? 'bg-brand-50 border-brand-500 text-slate-900 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900'
                }`}
              >
                {plan.isPopular && (
                  <span className="absolute -top-2 right-3 bg-brand-600 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase">
                    Popular
                  </span>
                )}
                <div className="text-xs font-bold text-slate-900 mb-1">{plan.name}</div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-base font-black text-slate-900">
                    ₹{plan.discountedPrice}
                  </span>
                  <span className="text-xs text-slate-400 line-through">
                    ₹{plan.originalPrice}
                  </span>
                </div>
                <div className="text-[10px] text-emerald-700 font-bold mt-1">
                  Validity: {plan.validity}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Trust Badges */}
        <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200 mb-6 text-center text-xs">
          <div className="flex flex-col items-center gap-1 text-slate-700">
            <Zap className="w-4 h-4 text-amber-500" />
            <span className="font-bold text-[11px]">Instant Delivery</span>
          </div>
          <div className="flex flex-col items-center gap-1 text-slate-700">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="font-bold text-[11px]">{product.warrantyDays} Days Warranty</span>
          </div>
          <div className="flex flex-col items-center gap-1 text-slate-700">
            <Lock className="w-4 h-4 text-cyan-600" />
            <span className="font-bold text-[11px]">100% Genuine</span>
          </div>
        </div>

        {/* Price & Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <div>
            <span className="text-[11px] text-slate-400 font-bold uppercase">Total Price</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">
                ₹{selectedPlan.discountedPrice}
              </span>
              <span className="text-sm text-slate-400 line-through">
                ₹{selectedPlan.originalPrice}
              </span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Save {discountPercent}%
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleAddToCart}
              className="flex-1 sm:flex-none py-3 px-5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-xs"
            >
              <ShoppingBag className="w-4 h-4 text-brand-600" />
              <span>Add to Cart</span>
            </button>

            <button
              onClick={handleBuyNow}
              className="flex-1 sm:flex-none py-3 px-6 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-extrabold shadow-lg shadow-brand-600/25 transition-all transform hover:-translate-y-0.5"
            >
              Buy Now / Pay via UPI
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
