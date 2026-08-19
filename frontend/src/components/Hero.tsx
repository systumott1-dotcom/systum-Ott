import React from 'react';
import { 
  ShieldCheck, 
  BadgeCheck, 
  Headphones, 
  RotateCcw, 
  ArrowRight, 
  Star, 
  Flame
} from 'lucide-react';
import { WHATSAPP_PHONE } from '../context/CartContext';
import { WhatsAppIcon } from './WhatsAppIcon';

interface HeroProps {
  onExploreClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onExploreClick }) => {
  return (
    <section className="relative pt-8 pb-16 md:pt-16 md:pb-24 overflow-hidden bg-gradient-to-b from-white via-slate-50 to-slate-50">
      {/* Ambient background glows */}
      <div className="hero-glow-light" />
      <div className="absolute top-1/4 right-5 w-72 h-72 bg-brand-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-indigo-200/30 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Headline & Value Proposition */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Top Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 border border-brand-200/90 text-brand-800 text-[11px] sm:text-xs font-black shadow-2xs tracking-wide uppercase">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-600"></span>
              </span>
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span>Systum OTT · Authorized Seller & Sourcing</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
              Premium Digital Subscriptions at <br className="hidden sm:inline" />
              <span className="gradient-text">Unbeatable Prices</span>
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Netflix 4K, Amazon Prime, Hotstar, Adobe CC, MS Office, ChatGPT & 50+ premium tools. 
              <strong className="text-slate-900 font-bold"> Instant WhatsApp delivery</strong> with <strong className="text-brand-700 font-bold">100% full-term replacement warranty</strong>.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-2 justify-center lg:justify-start">
              <button
                onClick={onExploreClick}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-brand-600 via-brand-700 to-indigo-700 hover:from-brand-500 hover:to-indigo-600 text-white font-extrabold text-base shadow-xl shadow-brand-600/25 transition-all duration-300 transform hover:-translate-y-0.5 flex items-center justify-center gap-2 group"
              >
                <span>Browse All Plans</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <a
                href={`https://wa.me/${WHATSAPP_PHONE}?text=Hello!+I+want+to+buy+a+subscription+from+Systum+OTT.`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold text-base transition-all duration-300 flex items-center justify-center gap-2.5 shadow-sm group"
              >
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <WhatsAppIcon className="w-5 h-5 text-[#25D366] fill-[#25D366] group-hover:scale-110 transition-transform" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>

            {/* Social Proof Bar */}
            <div className="flex items-center gap-4 pt-4 justify-center lg:justify-start">
              <div className="flex -space-x-2 overflow-hidden">
                <img
                  className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                  alt="Customer"
                />
                <img
                  className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
                  alt="Customer"
                />
                <img
                  className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80"
                  alt="Customer"
                />
                <div className="h-8 w-8 rounded-full bg-brand-600 ring-2 ring-white flex items-center justify-center text-[10px] font-bold text-white">
                  +50k
                </div>
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1 text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="text-xs font-bold text-slate-800 ml-1">4.9/5</span>
                </div>
                <p className="text-xs text-slate-500 font-medium">Trusted by 50,000+ Indian Streamers & Creators</p>
              </div>
            </div>

          </div>

          {/* Right Column: 2 Rows x 2 Columns Trust Cards Grid */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto w-full max-w-lg">
              
              {/* 2x2 Grid with Brand Theme Colors */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                
                {/* 1. Secure Payments */}
                <div className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 border border-slate-200 shadow-xs hover:shadow-md hover:border-brand-200 transition-all duration-300 flex items-center gap-3 sm:gap-3.5 group">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 group-hover:scale-105 transition-transform">
                    <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm md:text-base leading-tight tracking-tight">Secure Payments</h4>
                    <p className="text-[10px] sm:text-xs text-slate-500 font-medium mt-0.5 sm:mt-1 leading-tight">UPI · GPay · PhonePe</p>
                  </div>
                </div>

                {/* 2. Verified Accounts */}
                <div className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 border border-slate-200 shadow-xs hover:shadow-md hover:border-brand-200 transition-all duration-300 flex items-center gap-3 sm:gap-3.5 group">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600 shrink-0 group-hover:scale-105 transition-transform">
                    <BadgeCheck className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm md:text-base leading-tight tracking-tight">Verified Accounts</h4>
                    <p className="text-[10px] sm:text-xs text-slate-500 font-medium mt-0.5 sm:mt-1 leading-tight">100% genuine & authentic</p>
                  </div>
                </div>

                {/* 3. WhatsApp Support */}
                <div className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 border border-slate-200 shadow-xs hover:shadow-md hover:border-brand-200 transition-all duration-300 flex items-center gap-3 sm:gap-3.5 group">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 group-hover:scale-105 transition-transform">
                    <Headphones className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm md:text-base leading-tight tracking-tight">WhatsApp Support</h4>
                    <p className="text-[10px] sm:text-xs text-slate-500 font-medium mt-0.5 sm:mt-1 leading-tight">We're here to help</p>
                  </div>
                </div>

                {/* 4. Replacement Warranty */}
                <div className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 border border-slate-200 shadow-xs hover:shadow-md hover:border-brand-200 transition-all duration-300 flex items-center gap-3 sm:gap-3.5 group">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0 group-hover:scale-105 transition-transform">
                    <RotateCcw className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm md:text-base leading-tight tracking-tight">Replacement Warranty</h4>
                    <p className="text-[10px] sm:text-xs text-slate-500 font-medium mt-0.5 sm:mt-1 leading-tight">Full duration guarantee</p>
                  </div>
                </div>

              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

