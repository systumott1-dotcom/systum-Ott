import React from 'react';
import { Percent, MessageCircle, ShieldCheck, Zap, ArrowRight, CheckCircle2, Star, Flame, Tv, Laptop, Bot } from 'lucide-react';
import { WHATSAPP_PHONE } from '../context/CartContext';

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
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-bold shadow-xs">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-600"></span>
              </span>
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span>India's Most Trusted Digital Subscription Hub</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
              Get OTT & Software Subscriptions at <br className="hidden sm:inline" />
              <span className="gradient-text">up to 90% OFF</span>
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Netflix 4K, Amazon Prime, Hotstar, Adobe CC, MS Office, ChatGPT & 50+ premium tools. 
              <strong className="text-slate-900 font-bold"> Instant WhatsApp delivery</strong> with <strong className="text-brand-700 font-bold">100% full-term replacement warranty</strong>.
            </p>

            {/* Key Value Points */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 max-w-lg mx-auto lg:mx-0 text-left">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
                <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Instant Delivery (5 Min)</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Replacement Warranty</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs col-span-2 sm:col-span-1">
                <CheckCircle2 className="w-4 h-4 text-cyan-600 shrink-0" />
                <span>UPI & GPay Accepted</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 justify-center lg:justify-start">
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
                <MessageCircle className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition-transform" />
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

          {/* Right Column: Interactive Animated Subscription Grid Showcase */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md">
              
              {/* Main White Showcase Card */}
              <div className="white-card rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200 relative z-10 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-500 inline-block"></span>
                    <span className="w-3 h-3 rounded-full bg-amber-400 inline-block"></span>
                    <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
                    <span className="text-xs font-bold text-slate-700 ml-2">Today's Hot Deals</span>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    Live Stock
                  </span>
                </div>

                {/* Deal Items */}
                <div className="space-y-3">
                  {/* Item 1 */}
                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 hover:border-brand-300 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-red-100 border border-red-200 flex items-center justify-center text-red-600 font-bold shadow-xs">
                        <Tv className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">Netflix 4K Ultra HD</h4>
                        <span className="text-xs text-slate-500">PIN Profile • 4K UHD</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-400 line-through mr-1.5">₹649</span>
                      <span className="text-sm font-extrabold text-emerald-600">₹99</span>
                    </div>
                  </div>

                  {/* Item 2 */}
                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 hover:border-brand-300 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-red-100 border border-red-200 flex items-center justify-center text-red-600 font-bold shadow-xs">
                        <Laptop className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">Adobe Creative Cloud</h4>
                        <span className="text-xs text-slate-500">20+ Apps • Firefly AI</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-400 line-through mr-1.5">₹4,230</span>
                      <span className="text-sm font-extrabold text-emerald-600">₹449</span>
                    </div>
                  </div>

                  {/* Item 3 */}
                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 hover:border-brand-300 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-600 font-bold shadow-xs">
                        <Bot className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">ChatGPT Plus (GPT-4o)</h4>
                        <span className="text-xs text-slate-500">Voice Mode • DALL-E</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-400 line-through mr-1.5">₹1,999</span>
                      <span className="text-sm font-extrabold text-emerald-600">₹249</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Trust Badge */}
                <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> WhatsApp Direct Delivery
                  </span>
                  <span className="text-brand-700 font-bold">100% Genuine</span>
                </div>
              </div>

              {/* Floating Accent Badges */}
              <div className="absolute -top-4 -right-4 white-card p-3 rounded-2xl border border-brand-200 shadow-xl hidden sm:flex items-center gap-2.5 animate-float z-20">
                <Percent className="w-5 h-5 text-amber-500" />
                <div>
                  <div className="text-xs font-bold text-slate-900">Up to 90% OFF</div>
                  <div className="text-[10px] text-slate-500">Save thousands/year</div>
                </div>
              </div>

              <div className="absolute -bottom-4 -left-4 white-card p-3 rounded-2xl border border-emerald-200 shadow-xl hidden sm:flex items-center gap-2.5 animate-float z-20" style={{ animationDelay: '1.5s' }}>
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <div>
                  <div className="text-xs font-bold text-slate-900">Instant Replacement</div>
                  <div className="text-[10px] text-slate-500">24/7 Dedicated Support</div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
