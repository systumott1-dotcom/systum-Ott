import React from 'react';
import { CATEGORIES } from '../data/products';
import type { CategoryId } from '../types';
import { ArrowRight } from 'lucide-react';

interface CategoryBrowserProps {
  activeCategory: CategoryId;
  onSelectCategory: (id: CategoryId) => void;
}

interface CategoryStyleConfig {
  gradientBox: string;
  glowShadow: string;
  cardHover: string;
  activeRing: string;
  arrowHover: string;
  titleHover: string;
  iconSvg: React.ReactNode;
}

const CATEGORY_STYLES: Record<string, CategoryStyleConfig> = {
  ott: {
    gradientBox: 'bg-gradient-to-tr from-red-600 via-rose-500 to-amber-500 text-white',
    glowShadow: 'shadow-lg shadow-rose-500/25',
    cardHover: 'hover:border-rose-300 hover:bg-rose-50/20',
    activeRing: 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/30',
    arrowHover: 'group-hover:text-rose-600',
    titleHover: 'group-hover:text-rose-600',
    iconSvg: (
      <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="5" width="20" height="14" rx="3.5" fill="white" fillOpacity="0.2" stroke="white" strokeWidth="2"/>
        <path d="M10 9L15.5 12L10 15V9Z" fill="white"/>
        <path d="M8 2L12 5L16 2" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="18.5" cy="8.5" r="1" fill="#FEF08A"/>
      </svg>
    ),
  },
  software: {
    gradientBox: 'bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 text-white',
    glowShadow: 'shadow-lg shadow-blue-500/25',
    cardHover: 'hover:border-blue-300 hover:bg-blue-50/20',
    activeRing: 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/30',
    arrowHover: 'group-hover:text-blue-600',
    titleHover: 'group-hover:text-blue-600',
    iconSvg: (
      <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="4" width="18" height="12" rx="2.5" fill="white" fillOpacity="0.2" stroke="white" strokeWidth="2"/>
        <path d="M2 19H22" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M7 9L9.5 11L7 13" stroke="#67E8F9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 13H15" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
  combo: {
    gradientBox: 'bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 text-white',
    glowShadow: 'shadow-lg shadow-orange-500/25',
    cardHover: 'hover:border-orange-300 hover:bg-orange-50/20',
    activeRing: 'border-orange-500 ring-2 ring-orange-500/20 bg-orange-50/30',
    arrowHover: 'group-hover:text-orange-600',
    titleHover: 'group-hover:text-orange-600',
    iconSvg: (
      <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="white" fillOpacity="0.3" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
        <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M2 12L12 17L22 12" stroke="#FEF08A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="12" cy="12" r="1.5" fill="white"/>
      </svg>
    ),
  },
  music: {
    gradientBox: 'bg-gradient-to-tr from-emerald-500 via-green-500 to-teal-500 text-white',
    glowShadow: 'shadow-lg shadow-emerald-500/25',
    cardHover: 'hover:border-emerald-300 hover:bg-emerald-50/20',
    activeRing: 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/30',
    arrowHover: 'group-hover:text-emerald-600',
    titleHover: 'group-hover:text-emerald-600',
    iconSvg: (
      <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 18V5L20 3V16" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="6" cy="18" r="3" fill="white" fillOpacity="0.25" stroke="white" strokeWidth="2"/>
        <circle cx="17" cy="16" r="3" fill="#A7F3D0" stroke="white" strokeWidth="2"/>
        <path d="M9 9L20 7" stroke="#A7F3D0" strokeWidth="2"/>
      </svg>
    ),
  },
  adult: {
    gradientBox: 'bg-gradient-to-tr from-pink-600 via-rose-600 to-purple-600 text-white',
    glowShadow: 'shadow-lg shadow-pink-500/25',
    cardHover: 'hover:border-pink-300 hover:bg-pink-50/20',
    activeRing: 'border-pink-500 ring-2 ring-pink-500/20 bg-pink-50/30',
    arrowHover: 'group-hover:text-pink-600',
    titleHover: 'group-hover:text-pink-600',
    iconSvg: (
      <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8.5 14.5C8.5 17.5 10.5 20 12.5 20C15 20 17 18 17 15C17 11.5 14 9.5 13 6C11.5 8 8.5 11 8.5 14.5Z" fill="white" fillOpacity="0.25" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
        <path d="M12 18C13 18 14 17 14 15.5C14 13.5 12.5 12 12 10.5C11.5 12 10 13.5 10 15.5C10 17 11 18 12 18Z" fill="#FDE047"/>
        <path d="M5 11C4 13 4 15 5 17" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M19 11C20 13 20 15 19 17" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  other: {
    gradientBox: 'bg-gradient-to-tr from-violet-600 via-purple-600 to-indigo-600 text-white',
    glowShadow: 'shadow-lg shadow-purple-500/25',
    cardHover: 'hover:border-purple-300 hover:bg-purple-50/20',
    activeRing: 'border-purple-500 ring-2 ring-purple-500/20 bg-purple-50/30',
    arrowHover: 'group-hover:text-purple-600',
    titleHover: 'group-hover:text-purple-600',
    iconSvg: (
      <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="3" width="7.5" height="7.5" rx="2.5" fill="white" fillOpacity="0.35" stroke="white" strokeWidth="2"/>
        <rect x="13.5" y="3" width="7.5" height="7.5" rx="2.5" fill="#FEF08A" stroke="white" strokeWidth="2"/>
        <rect x="3" y="13.5" width="7.5" height="7.5" rx="2.5" fill="#C4B5FD" stroke="white" strokeWidth="2"/>
        <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2.5" fill="white" fillOpacity="0.35" stroke="white" strokeWidth="2"/>
      </svg>
    ),
  },
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
            const style = CATEGORY_STYLES[category.id] || CATEGORY_STYLES.other;
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
                className={`group text-left p-3 sm:p-5 md:p-6 rounded-2xl sm:rounded-3xl border transition-all duration-300 relative overflow-hidden flex flex-col justify-between ${
                  isActive
                    ? style.activeRing
                    : `bg-white border-slate-200 shadow-2xs hover:shadow-lg ${style.cardHover}`
                }`}
              >
                {/* Top Row: Colorful Icon + Arrow */}
                <div className="flex items-center justify-between w-full">
                  <div className={`w-9 h-9 sm:w-11 sm:h-11 md:w-13 md:h-13 rounded-xl sm:rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${style.gradientBox} ${style.glowShadow}`}>
                    {style.iconSvg}
                  </div>
                  <ArrowRight className={`hidden sm:block w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-300 ${style.arrowHover} group-hover:translate-x-1 transition-all duration-200`} />
                </div>

                {/* Bottom Content */}
                <div className="mt-3 sm:mt-4 md:mt-5">
                  <h3 className={`font-extrabold text-[11px] sm:text-xs md:text-sm lg:text-base text-slate-900 ${style.titleHover} transition-colors line-clamp-1 leading-tight`}>
                    {category.name}
                  </h3>
                  <p className="text-[9px] sm:text-[10px] md:text-xs text-slate-500 font-medium mt-1 line-clamp-1 sm:line-clamp-2 leading-tight sm:leading-relaxed">
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
