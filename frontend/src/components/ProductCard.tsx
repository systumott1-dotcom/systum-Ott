import React, { useState } from 'react';
import type { Product, ProductPlan } from '../types';
import { useCart } from '../context/CartContext';
import { 
  Zap, 
  Star, 
  ShoppingBag, 
  Eye, 
  Check, 
  Tv, 
  Film, 
  PlayCircle, 
  MonitorPlay, 
  Clapperboard, 
  Laptop, 
  Palette, 
  FileSpreadsheet, 
  Video, 
  ShieldCheck,
  PackagePlus, 
  Flame, 
  Layers, 
  Music, 
  Play, 
  Headphones, 
  Bot, 
  Search, 
  GraduationCap, 
  BookOpen 
} from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

const ICON_COMPONENTS: Record<string, React.ElementType> = {
  Tv,
  Film,
  PlayCircle,
  Tv2: Tv,
  MonitorPlay,
  Clapperboard,
  Sparkles: Clapperboard,
  Laptop,
  Palette,
  FileSpreadsheet,
  Video,
  ShieldCheck,
  PackagePlus,
  Flame,
  Layers,
  Music,
  Play,
  Headphones,
  Bot,
  Search,
  GraduationCap,
  BookOpen,
};

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, buyNow, setQuickViewProduct } = useCart();
  
  // Default to popular plan or first plan
  const defaultPlanIndex = product.plans.findIndex((p) => p.isPopular);
  const [selectedPlanIndex, setSelectedPlanIndex] = useState<number>(
    defaultPlanIndex >= 0 ? defaultPlanIndex : 0
  );
  const [isAdded, setIsAdded] = useState(false);

  const selectedPlan: ProductPlan = product.plans[selectedPlanIndex] || product.plans[0];

  const discountPercent = Math.round(
    ((selectedPlan.originalPrice - selectedPlan.discountedPrice) / selectedPlan.originalPrice) * 100
  );

  const IconComponent = ICON_COMPONENTS[product.iconName] || Tv;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, selectedPlan);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    buyNow(product, selectedPlan);
  };

  return (
    <div
      onClick={() => setQuickViewProduct(product)}
      className="group white-card white-card-hover rounded-3xl p-5 border border-slate-200/90 flex flex-col justify-between cursor-pointer relative overflow-hidden transition-all duration-300 bg-white"
    >
      {/* Top Badges */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          {product.badge && (
            <span className="bg-gradient-to-r from-brand-600 to-indigo-600 text-white text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full shadow-xs">
              {product.badge}
            </span>
          )}
          <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-md border border-slate-200">
            {product.accountType}
          </span>
        </div>

        {discountPercent > 0 && (
          <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-[10px] px-2 py-0.5 rounded-full">
            Save {discountPercent}%
          </span>
        )}
      </div>

      {/* Product Icon & Title */}
      <div>
        <div className="flex items-start gap-3.5 mb-3">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-xs transition-transform group-hover:scale-105"
            style={{
              backgroundColor: `${product.iconColor}15`,
              borderColor: `${product.iconColor}30`,
              borderWidth: '1px',
            }}
          >
            <IconComponent className="w-6 h-6" style={{ color: product.iconColor }} />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-extrabold text-base text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-1">
              {product.title}
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="flex items-center text-amber-500 text-xs font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-400 mr-1" />
                <span>{product.rating}</span>
              </div>
              <span className="text-slate-400 text-xs">•</span>
              <span className="text-slate-500 text-xs">{product.reviewsCount}+ verified</span>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
          {product.shortDescription}
        </p>

        {/* Plan Selector Buttons (if multiple plans exist) */}
        {product.plans.length > 1 && (
          <div className="space-y-1.5 mb-4">
            <div className="text-[11px] font-bold text-slate-500">Select Validity:</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {product.plans.map((plan, idx) => (
                <button
                  key={plan.name}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPlanIndex(idx);
                  }}
                  className={`px-2 py-1.5 rounded-xl text-[11px] font-bold border transition-all text-center ${
                    selectedPlanIndex === idx
                      ? 'bg-brand-50 border-brand-500 text-brand-700 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <span className="block truncate">{plan.validity}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Feature Pills */}
        <div className="space-y-1 mb-4 pt-1">
          {product.features.slice(0, 2).map((feat, i) => (
            <div key={i} className="flex items-center gap-1.5 text-[11px] text-slate-600 font-medium">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="truncate">{feat}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Price & Action Buttons */}
      <div className="pt-3 border-t border-slate-100 space-y-3">
        {/* Price Row */}
        <div className="flex items-baseline justify-between">
          <div>
            <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
              Special Price ({selectedPlan.validity})
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-black text-slate-900">
                ₹{selectedPlan.discountedPrice}
              </span>
              <span className="text-xs text-slate-400 line-through">
                ₹{selectedPlan.originalPrice}
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
              <Zap className="w-3.5 h-3.5 text-amber-500" /> Instant
            </span>
          </div>
        </div>

        {/* Buttons Grid */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleAddToCart}
            className={`w-full py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs ${
              isAdded
                ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800 hover:text-slate-900'
            }`}
          >
            {isAdded ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Added!</span>
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
            className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-extrabold shadow-md shadow-brand-600/20 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-1"
          >
            <span>Buy Now</span>
          </button>
        </div>

        {/* Quick View Link */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setQuickViewProduct(product);
          }}
          className="w-full text-center text-[11px] font-semibold text-slate-500 hover:text-brand-600 flex items-center justify-center gap-1 py-0.5 transition-colors"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>View Plan Details & Compatibility</span>
        </button>
      </div>
    </div>
  );
};
