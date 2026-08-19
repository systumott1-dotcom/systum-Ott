import React from 'react';
import { CATEGORIES } from '../data/products';
import type { CategoryId } from '../types';
import { 
  Store, 
  Tv, 
  Laptop, 
  PackagePlus, 
  Music, 
  Flame, 
  Sparkles, 
  ArrowRight
} from 'lucide-react';

interface CategoryBrowserProps {
  activeCategory: CategoryId;
  onSelectCategory: (id: CategoryId) => void;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Store,
  Tv,
  Laptop,
  PackagePlus,
  Music,
  Flame,
  Sparkles,
};

export const CategoryBrowser: React.FC<CategoryBrowserProps> = ({
  activeCategory,
  onSelectCategory,
}) => {
  return (
    <section className="py-8 sm:py-12 border-y border-slate-200 bg-white">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-10 space-y-2">
          <span className="inline-block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
            Curated Categories
          </span>
          <h2 className="text-xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            Browse by <span className="gradient-text">Category</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            From OTT entertainment to professional tools — explore our 6 verified subscription categories.
          </p>
        </div>

        {/* 3-Cards Per Row Grid (Row 1: OTT, SOFTWARES, COMBO | Row 2: Music, Adult, Other) */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3.5 md:gap-5">
          {CATEGORIES.filter((c) => c.id !== 'all').map((category) => {
            const Icon = ICON_MAP[category.icon] || Store;
            const isActive = activeCategory === category.id;

            return (
              <button
                key={category.id}
                onClick={() => {
                  onSelectCategory(category.id);
                  const shopSection = document.getElementById('shop-section');
                  if (shopSection) {
                    shopSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className={`group text-left p-2.5 sm:p-4 md:p-6 rounded-2xl sm:rounded-3xl border transition-all duration-300 relative overflow-hidden flex flex-col justify-between ${
                  isActive
                    ? 'bg-gradient-to-b from-brand-50/80 to-indigo-50/50 border-brand-500 shadow-md ring-2 ring-brand-500/20'
                    : 'bg-white hover:bg-slate-50 border-slate-200 shadow-2xs hover:shadow-md hover:border-brand-200'
                }`}
              >
                {/* Top Row: Icon + Arrow */}
                <div className="flex items-center justify-between w-full">
                  <div className={`w-8 h-8 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all ${
                    isActive 
                      ? 'bg-brand-600 text-white shadow-xs' 
                      : 'bg-brand-50 border border-brand-100 text-brand-600 group-hover:bg-brand-600 group-hover:text-white'
                  }`}>
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                  </div>
                  <ArrowRight className="hidden sm:block w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-300 group-hover:text-brand-600 group-hover:translate-x-0.5 transition-all" />
                </div>

                {/* Bottom Content */}
                <div className="mt-2.5 sm:mt-4 md:mt-5">
                  <h3 className="font-extrabold text-[11px] sm:text-xs md:text-sm lg:text-base text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-1 leading-tight">
                    {category.name}
                  </h3>
                  <p className="text-[9px] sm:text-[10px] md:text-xs text-slate-500 font-medium mt-0.5 line-clamp-1 sm:line-clamp-2 leading-tight sm:leading-relaxed">
                    {category.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

      </div>
    </section>
  );
};
