import React from 'react';
import { PackagePlus, Flame, CheckCircle2, ArrowRight } from 'lucide-react';
import type { Product } from '../types';
import { useCart } from '../context/CartContext';

interface ComboHighlightsProps {
  products: Product[];
}

export const ComboHighlights: React.FC<ComboHighlightsProps> = ({ products }) => {
  const { buyNow, addToCart } = useCart();
  const comboProducts = products.filter((p) => p.category === 'combo');

  if (comboProducts.length === 0) return null;

  return (
    <section className="py-16 bg-gradient-to-b from-slate-50 via-indigo-50/20 to-slate-50 border-y border-slate-200 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-100/40 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-50 border border-pink-200 text-pink-700 text-xs font-bold uppercase tracking-wider">
            <PackagePlus className="w-3.5 h-3.5" /> All-In-One Value Packs
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900">
            Mega Combo Bundles — <span className="gradient-text">Max Savings</span>
          </h2>
          <p className="text-sm text-slate-600">
            Combine multiple top-tier streaming and productivity platforms into a single subscription. Save up to ₹10,000 every year.
          </p>
        </div>

        {/* Combo Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {comboProducts.map((combo, index) => {
            const defaultPlan = combo.plans[0];
            const isFeatured = index === 0;

            return (
              <div
                key={combo.id}
                className={`white-card rounded-3xl p-6 sm:p-7 border relative flex flex-col justify-between transition-all duration-300 ${
                  isFeatured
                    ? 'border-brand-400 bg-gradient-to-b from-white to-brand-50/40 shadow-xl lg:-translate-y-2'
                    : 'border-slate-200 hover:border-brand-300 bg-white hover:shadow-lg'
                }`}
              >
                {/* Featured Ribbon */}
                {isFeatured && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-brand-600 via-pink-600 to-indigo-600 text-white font-extrabold text-[11px] uppercase tracking-wider px-4 py-1 rounded-full shadow-md flex items-center gap-1.5">
                    <Flame className="w-3 h-3 text-amber-300" /> Most Popular Bundle
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="text-[11px] font-bold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-lg border border-brand-200">
                      {combo.accountType}
                    </span>
                    <span className="text-[11px] font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      Save {Math.round(((defaultPlan.originalPrice - defaultPlan.discountedPrice) / defaultPlan.originalPrice) * 100)}%
                    </span>
                  </div>

                  <h3 className="text-xl font-extrabold text-slate-900 mb-2">
                    {combo.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-6">
                    {combo.shortDescription}
                  </p>

                  {/* Included features */}
                  <div className="space-y-2.5 border-t border-slate-100 pt-4 mb-6">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      What's Included:
                    </div>
                    {combo.features.map((feat, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pricing & CTA */}
                <div className="border-t border-slate-100 pt-4 space-y-4">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase">
                        Starting from
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-slate-900">
                          ₹{defaultPlan.discountedPrice}
                        </span>
                        <span className="text-xs text-slate-400 line-through">
                          ₹{defaultPlan.originalPrice}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-md border border-brand-200">
                      {defaultPlan.validity}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => addToCart(combo, defaultPlan)}
                      className="py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold transition-all shadow-xs"
                    >
                      Add to Cart
                    </button>
                    <button
                      onClick={() => buyNow(combo, defaultPlan)}
                      className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-extrabold shadow-md shadow-brand-600/25 transition-all flex items-center justify-center gap-1 group"
                    >
                      <span>Buy Now</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
