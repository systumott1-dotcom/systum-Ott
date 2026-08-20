import React from 'react';
import { MessageCircle, Mail, Clock, ShieldCheck, Heart, Flame, ExternalLink } from 'lucide-react';
import { WHATSAPP_PHONE } from '../context/CartContext';
import type { CategoryId } from '../types';
import type { PolicyType } from './PolicyModals';

interface FooterProps {
  onSelectCategory: (id: CategoryId) => void;
  onOpenPolicy: (type: PolicyType) => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectCategory, onOpenPolicy }) => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 relative overflow-hidden border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Pre-footer High-Impact CTA Banner */}
        <div className="mb-16 p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-brand-700 via-indigo-700 to-purple-800 text-center sm:text-left flex flex-col lg:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden">
          <div className="space-y-2 max-w-xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-bold uppercase tracking-wider">
              <Flame className="w-3.5 h-3.5 text-amber-300" /> Save Money Every Month
            </span>
            <h3 className="text-2xl sm:text-4xl font-extrabold text-white">
              Still Paying Full Price? Stop Now.
            </h3>
            <p className="text-xs sm:text-sm text-slate-100 font-medium">
              Join 4,500+ smart customers saving up to 90% on OTT, software licenses, and AI tools every month.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
            <button
              onClick={() => {
                const shop = document.getElementById('shop-section');
                if (shop) shop.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white text-slate-900 hover:bg-slate-100 font-extrabold text-xs shadow-lg transition-transform hover:-translate-y-0.5"
            >
              Shop Now — Save Today
            </button>
            <a
              href={`https://wa.me/${WHATSAPP_PHONE}?text=Hello!+I+want+to+buy+a+subscription.`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp Us</span>
            </a>
          </div>
        </div>

        {/* Main Footer Links Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center p-0.5">
                <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center font-black text-brand-400 font-mono text-base">
                  SO
                </div>
              </div>
              <div>
                <span className="font-extrabold text-xl text-white">
                  Systum <span className="gradient-text">OTT</span> India
                </span>
                <span className="block text-[11px] text-slate-400">Digital Subscription Store</span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              India's most reliable and affordable digital subscription marketplace. Get OTT apps, software licenses, and AI tools with Instant Delivery Via WhatsApp and full-term replacement warranty.
            </p>

            <div className="pt-2 flex items-center gap-3 text-xs text-emerald-400 font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>100% Secure UPI • Fast 5-Min Activation</span>
            </div>
          </div>

          {/* Column 1: Products */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Products
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button
                  onClick={() => onSelectCategory('ott')}
                  className="hover:text-brand-300 transition-colors"
                >
                  OTT Apps
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('software')}
                  className="hover:text-brand-300 transition-colors"
                >
                  SOFTWARES
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('combo')}
                  className="hover:text-brand-300 transition-colors"
                >
                  COMBO
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('music')}
                  className="hover:text-brand-300 transition-colors"
                >
                  Music
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('adult')}
                  className="hover:text-brand-300 transition-colors"
                >
                  Adult
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('other')}
                  className="hover:text-brand-300 transition-colors"
                >
                  Other Tools & Utilities
                </button>
              </li>
            </ul>
          </div>

          {/* Column 2: Support & Policies */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Support & Legal
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <a href="#faq" className="hover:text-brand-300 transition-colors">
                  FAQ & Helpdesk
                </a>
              </li>
              <li>
                <button
                  onClick={() => onOpenPolicy('refund')}
                  className="hover:text-brand-300 transition-colors text-left"
                >
                  Refund & Replacement Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenPolicy('terms')}
                  className="hover:text-brand-300 transition-colors text-left"
                >
                  Terms of Service
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenPolicy('dmca')}
                  className="hover:text-brand-300 transition-colors text-left"
                >
                  DMCA & Copyright Policy
                </button>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-brand-300 transition-colors">
                  How It Works
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact & Hours */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Contact & Hours
            </h4>
            <div className="space-y-2.5 text-xs text-slate-400">
              <a
                href={`https://wa.me/${WHATSAPP_PHONE}?text=Hello!+I+need+support.`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-emerald-400 hover:underline font-semibold"
              >
                <MessageCircle className="w-4 h-4" />
                <span>+91 93060 22703 (WhatsApp Desk)</span>
              </a>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-500" />
                <span>support@systumott.in</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Mon–Sun: 9:00 AM – 11:00 PM IST</span>
              </div>
            </div>

            <div className="pt-2">
              <a
                href="https://chat.whatsapp.com/sample-group"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-[11px] font-bold text-slate-200 hover:text-white hover:border-brand-500/40 transition-colors"
              >
                <span>Join VIP WhatsApp Deals Group</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

        </div>

        {/* Copyright & Disclaimer Notice */}
        <div className="pt-8 space-y-4 text-center text-xs text-slate-500">
          <p className="max-w-3xl mx-auto leading-relaxed text-[11px]">
            <strong>Disclaimer:</strong> Systum OTT India is an independent third-party subscription organizer and license aggregator. All trademarks, service marks, logos, and product names displayed are the property of their respective owners. Their mention is solely for descriptive purposes and does not imply endorsement or official partnership.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-[11px]">
            <span>© {new Date().getFullYear()} Systum OTT India. All rights reserved.</span>
            <span className="flex items-center gap-1">
              Built with <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> for Indian Streamers & Creators
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
};
