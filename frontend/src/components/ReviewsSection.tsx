import React from 'react';
import { Star, CheckCircle2, MessageSquareQuote } from 'lucide-react';
import { REVIEWS } from '../data/reviews';

export const ReviewsSection: React.FC = () => {
  return (
    <section id="reviews" className="py-20 bg-white border-t border-slate-200 scroll-mt-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold uppercase tracking-wider">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> 1,000+ Verified Reviews · 4.9/5 Rating
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900">
            What Our Customers Say
          </h2>
          <p className="text-sm text-slate-500">
            Real feedback from verified buyers across India who saved thousands on their digital subscriptions.
          </p>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {REVIEWS.map((review) => (
            <div
              key={review.id}
              className="white-card white-card-hover rounded-3xl p-6 border border-slate-200 transition-all duration-300 flex flex-col justify-between relative group bg-white shadow-xs"
            >
              <div className="absolute top-4 right-4 text-slate-200 group-hover:text-brand-200 transition-colors">
                <MessageSquareQuote className="w-8 h-8" />
              </div>

              <div>
                {/* Stars */}
                <div className="flex items-center gap-1 mb-3 text-amber-400">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="text-xs font-bold text-slate-700 ml-1.5">5.0</span>
                </div>

                {/* Purchased product pill */}
                <div className="inline-block bg-brand-50 border border-brand-200 text-brand-700 text-[11px] font-bold px-2.5 py-0.5 rounded-full mb-3">
                  Purchased: {review.productPurchased}
                </div>

                {/* Comment */}
                <p className="text-xs text-slate-600 leading-relaxed italic">
                  "{review.comment}"
                </p>
              </div>

              {/* Author & Verified Tag */}
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={review.avatar}
                    alt={review.author}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-brand-200"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <span>{review.author}</span>
                      {review.verified && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      )}
                    </h4>
                    <span className="text-[10px] text-slate-500">{review.location}</span>
                  </div>
                </div>

                <span className="text-[10px] text-slate-400 font-medium">
                  {review.date}
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
