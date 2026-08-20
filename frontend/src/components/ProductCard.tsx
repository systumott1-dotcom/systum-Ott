import React, { useState } from 'react';
import type { Product, ProductPlan } from '../types';
import { 
  Zap, 
  Heart,
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
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Default to popular plan or first plan
  const defaultPlanIndex = product.plans.findIndex((p) => p.isPopular);
  const [selectedPlanIndex] = useState<number>(
    defaultPlanIndex >= 0 ? defaultPlanIndex : 0
  );

  const selectedPlan: ProductPlan = product.plans[selectedPlanIndex] || product.plans[0];

  const discountPercent = Math.round(
    ((selectedPlan.originalPrice - selectedPlan.discountedPrice) / selectedPlan.originalPrice) * 100
  );

  const IconComponent = ICON_COMPONENTS[product.iconName] || Tv;

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    const slug = product.slug || product.id;
    window.history.pushState({}, '', `/product/${slug}`);
    window.dispatchEvent(new PopStateEvent('popstate'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsWishlisted((prev) => !prev);
  };

  const handleCardClick = () => {
    const slug = product.slug || product.id;
    window.history.pushState({}, '', `/product/${slug}`);
    window.dispatchEvent(new PopStateEvent('popstate'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div
      onClick={handleCardClick}
      className="group white-card rounded-3xl p-3 sm:p-4 border border-slate-200 shadow-xs hover:shadow-xl hover:border-brand-300 flex flex-col justify-between cursor-pointer relative overflow-hidden transition-all duration-300 bg-white"
    >
      {/* Top Image Poster Container */}
      <div className="relative w-full aspect-square sm:aspect-[4/3] rounded-2xl overflow-hidden bg-slate-900 border border-slate-100/80 shadow-xs">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div
            className="w-full h-full flex flex-col items-center justify-center p-4 text-center"
            style={{
              background: `linear-gradient(135deg, ${product.iconColor}20, ${product.iconColor}05)`,
            }}
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-md mb-2 group-hover:scale-110 transition-transform"
              style={{
                backgroundColor: `${product.iconColor}20`,
                borderColor: `${product.iconColor}40`,
                borderWidth: '1px',
              }}
            >
              <IconComponent className="w-7 h-7" style={{ color: product.iconColor }} />
            </div>
            <span className="text-xs font-bold text-slate-700 truncate max-w-full">
              {product.title}
            </span>
          </div>
        )}

        {/* Top-Left Badges Stack (Non-overlapping & Responsive) */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 items-start z-10 max-w-[75%] pointer-events-none">
          {discountPercent > 0 && (
            <span className="bg-[#E50914] text-white text-[8px] sm:text-[10px] font-black uppercase px-1.5 py-0.5 rounded-md shadow-md tracking-wider leading-none">
              {discountPercent}% OFF
            </span>
          )}
          {product.badge && (
            <span className="bg-slate-900/90 backdrop-blur-xs text-white text-[8px] sm:text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md border border-white/20 shadow-md leading-none truncate max-w-full">
              {product.badge}
            </span>
          )}
        </div>

        {/* Bottom-Right Wishlist Floating Heart Button */}
        <button
          type="button"
          onClick={handleToggleWishlist}
          className="absolute bottom-2 right-2 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/95 backdrop-blur-xs shadow-md flex items-center justify-center text-slate-600 hover:text-red-500 hover:scale-110 active:scale-95 transition-all z-10"
        >
          <Heart
            className={`w-3 h-3 sm:w-3.5 sm:h-3.5 transition-colors ${
              isWishlisted ? 'fill-red-500 text-red-500' : ''
            }`}
          />
        </button>
      </div>

      {/* Product Content Details */}
      <div className="pt-2.5 flex-1 flex flex-col justify-between">
        <div>
          {/* Category Tag */}
          <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest text-[#9C7A4A] block truncate">
            {product.category}
          </span>

          {/* Product Title */}
          <h3 className="font-extrabold text-xs sm:text-sm md:text-base text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-2 leading-snug mt-0.5 min-h-[2.4rem]">
            {product.title}
          </h3>

          {/* Tags Pills */}
          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {product.tags.slice(0, 2).map((tag, idx) => (
                <span key={idx} className="text-[9px] font-semibold px-1.5 py-0.2 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Pricing & CTA */}
        <div className="mt-2 pt-2 border-t border-slate-100/80">
          <div className="flex items-baseline gap-1.5 mb-2.5">
            <span className="text-base sm:text-lg md:text-xl font-black text-slate-900">
              ₹{selectedPlan.discountedPrice}
            </span>
            {selectedPlan.originalPrice > selectedPlan.discountedPrice && (
              <span className="text-[11px] sm:text-xs text-slate-400 line-through font-medium">
                ₹{selectedPlan.originalPrice}
              </span>
            )}
          </div>

          {/* Full-Width Buy Now Button */}
          <button
            type="button"
            onClick={handleBuyNow}
            disabled={product.inStock === false}
            className={`w-full py-3 sm:py-3.5 px-4 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-1.5 ${
              product.inStock === false
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                : 'bg-gradient-to-r from-brand-600 via-brand-700 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white shadow-md shadow-brand-600/25 transform group-hover:shadow-lg active:scale-95 cursor-pointer'
            }`}
          >
            <Zap className={`w-4 h-4 ${product.inStock === false ? 'fill-slate-400 text-slate-400' : 'fill-white text-white'}`} />
            <span>{product.inStock === false ? 'Out of Stock' : 'Buy Now'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
