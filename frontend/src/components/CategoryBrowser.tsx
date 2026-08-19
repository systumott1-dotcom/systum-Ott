import React from 'react';
import { CATEGORIES } from '../data/products';
import type { CategoryId } from '../types';
import { Store, Tv, Laptop, PackagePlus, Music, Bot, GraduationCap, ArrowRight, Clapperboard } from 'lucide-react';

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
  Bot,
  GraduationCap,
  Clapperboard,
};

export const CategoryBrowser: React.FC<CategoryBrowserProps> = ({
  activeCategory,
  onSelectCategory,
}) => {
  return (
    <section className="py-12 border-y border-slate-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2.5">
          <span className="inline-block text-[11px] font-extrabold uppercase tracking-widest text-[#9C7A4A] bg-[#FAF5EE] px-4 py-1 rounded-full border border-[#EFE3CF]">
            CATEGORIES
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Browse by <span className="text-[#8B2626]">Category</span>
          </h2>
          <p className="text-sm text-slate-500 font-medium">
            From streaming to software — everything digital at India's best prices.
          </p>
        </div>

        {/* Category Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5">
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
                className={`group text-left p-5 sm:p-6 rounded-3xl border transition-all duration-300 relative overflow-hidden flex flex-col justify-between ${
                  isActive
                    ? 'bg-white border-[#8B2626] shadow-xl ring-2 ring-[#8B2626]/20 scale-[1.02]'
                    : 'bg-white hover:bg-slate-50/60 border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.03)] hover:shadow-lg hover:border-slate-200'
                }`}
              >
                {/* Top Row: Icon + Arrow */}
                <div className="flex items-center justify-between w-full">
                  <div className="w-12 h-12 rounded-2xl bg-[#F6EFE9] border border-[#EFE5DC] flex items-center justify-center text-[#7A1E1E] transition-transform group-hover:scale-105">
                    <Icon className="w-6 h-6" />
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-all" />
                </div>

                {/* Bottom Content */}
                <div className="mt-5">
                  <h3 className="font-extrabold text-sm sm:text-base text-slate-900 group-hover:text-[#8B2626] transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-1 line-clamp-2 leading-relaxed">
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
