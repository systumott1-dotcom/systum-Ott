import React, { useMemo, useState } from 'react';
import type { Product, CategoryId } from '../types';
import { CATEGORIES } from '../data/products';
import { ProductCard } from './ProductCard';
import { Search, Tag, ArrowUpDown, X } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
  activeCategory: CategoryId;
  onSelectCategory: (id: CategoryId) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

type SortOption = 'popular' | 'price-asc' | 'price-desc' | 'discount';

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  activeCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
}) => {
  const [sortBy, setSortBy] = useState<SortOption>('popular');

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        // Category check
        if (activeCategory !== 'all' && product.category !== activeCategory) {
          return false;
        }

        // Search query check
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = product.title.toLowerCase().includes(q);
          const matchDesc = product.shortDescription.toLowerCase().includes(q);
          const matchFeatures = product.features.some((f) => f.toLowerCase().includes(q));
          const matchType = product.accountType.toLowerCase().includes(q);
          return matchTitle || matchDesc || matchFeatures || matchType;
        }

        return true;
      })
      .sort((a, b) => {
        const getMinPrice = (p: Product) =>
          Math.min(...p.plans.map((plan) => plan.discountedPrice));
        const getMaxDiscount = (p: Product) =>
          Math.max(
            ...p.plans.map(
              (plan) =>
                ((plan.originalPrice - plan.discountedPrice) / plan.originalPrice) * 100
            )
          );

        if (sortBy === 'price-asc') {
          return getMinPrice(a) - getMinPrice(b);
        }
        if (sortBy === 'price-desc') {
          return getMinPrice(b) - getMinPrice(a);
        }
        if (sortBy === 'discount') {
          return getMaxDiscount(b) - getMaxDiscount(a);
        }
        // default 'popular': ratings * reviewsCount
        return b.rating * b.reviewsCount - a.rating * a.reviewsCount;
      });
  }, [products, activeCategory, searchQuery, sortBy]);

  const activeCategoryObj = CATEGORIES.find((c) => c.id === activeCategory);

  return (
    <section id="shop-section" className="py-16 scroll-mt-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Title & Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-bold uppercase tracking-wider mb-2">
              <Tag className="w-3.5 h-3.5 text-brand-600" /> Curated Digital Plans
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900">
              {activeCategory === 'all'
                ? 'All Available Subscriptions'
                : activeCategoryObj?.name || 'Subscriptions'}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Showing {filteredProducts.length} verified digital plans with instant WhatsApp delivery
            </p>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 shadow-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-brand-600" />
              <span>Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                aria-label="Sort subscriptions"
                className="bg-transparent text-slate-900 focus:outline-none font-bold cursor-pointer"
              >
                <option value="popular">Most Popular</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="discount">Highest Discount %</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category Pills Filter Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar mb-8">
          {CATEGORIES.map((cat) => {
            const count =
              cat.id === 'all'
                ? products.length
                : products.filter((p) => p.category === cat.id).length;
            const isActive = activeCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 shrink-0 ${
                  isActive
                    ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-md border border-brand-600 scale-105'
                    : 'bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900 shadow-xs'
                }`}
              >
                <span>{cat.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                    isActive ? 'bg-black/20 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Search/Filter Pill notification */}
        {(searchQuery || activeCategory !== 'all') && (
          <div className="flex items-center gap-2 mb-6 text-xs text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200 max-w-fit shadow-xs">
            <span>Filtering by:</span>
            {activeCategory !== 'all' && (
              <span className="bg-brand-50 text-brand-700 px-2 py-0.5 rounded-md font-bold flex items-center gap-1 border border-brand-200">
                Category: {activeCategoryObj?.name}
                <button onClick={() => onSelectCategory('all')}>
                  <X className="w-3 h-3 hover:text-slate-900" />
                </button>
              </span>
            )}
            {searchQuery && (
              <span className="bg-cyan-50 text-cyan-700 px-2 py-0.5 rounded-md font-bold flex items-center gap-1 border border-cyan-200">
                Search: "{searchQuery}"
                <button onClick={() => onSearchChange('')}>
                  <X className="w-3 h-3 hover:text-slate-900" />
                </button>
              </span>
            )}
            <button
              onClick={() => {
                onSelectCategory('all');
                onSearchChange('');
              }}
              className="text-xs text-brand-600 hover:underline font-bold ml-2"
            >
              Reset All
            </button>
          </div>
        )}

        {/* Product Cards Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          /* Empty Search State */
          <div className="text-center py-20 white-card rounded-3xl border border-slate-200 p-8 max-w-md mx-auto space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-brand-50 border border-brand-200 flex items-center justify-center mx-auto text-brand-600">
              <Search className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No subscriptions found</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              We couldn't find any plans matching "{searchQuery}". Try searching for popular apps like Netflix, Adobe, Canva, or Prime.
            </p>
            <button
              onClick={() => {
                onSearchChange('');
                onSelectCategory('all');
              }}
              className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-md transition-colors"
            >
              Reset Search Filters
            </button>
          </div>
        )}

      </div>
    </section>
  );
};
