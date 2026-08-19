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
        <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-700 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
            Explore Categories
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Browse by Category
          </h2>
          <p className="text-sm text-slate-500">
            From streaming to productivity tools — everything digital at India's lowest verified prices.
          </p>
        </div>

        {/* Category Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
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
                className={`group text-left p-4 rounded-2xl border transition-all duration-300 relative overflow-hidden flex flex-col justify-between ${
                  isActive
                    ? 'bg-gradient-to-b from-brand-50 to-indigo-50/50 border-brand-500 shadow-md scale-[1.02]'
                    : 'bg-slate-50 hover:bg-white border-slate-200 hover:border-brand-300 hover:shadow-md hover:-translate-y-1'
                }`}
              >
                {/* Active Indicator Glow */}
                {isActive && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-600 to-indigo-600" />
                )}

                <div>
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 transition-colors ${
                      isActive
                        ? 'bg-brand-600 text-white shadow-md'
                        : 'bg-white border border-slate-200 text-brand-600 group-hover:bg-brand-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 group-hover:text-brand-600 transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {category.description}
                  </p>
                </div>

                <div className="mt-3 pt-2 flex items-center gap-1 text-[10px] font-bold text-brand-600 group-hover:text-brand-700">
                  <span>Explore</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>
            );
          })}
        </div>

      </div>
    </section>
  );
};
