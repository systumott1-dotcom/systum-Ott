import React from 'react';
import { Flame, ShieldCheck, Zap, PhoneCall } from 'lucide-react';
import { WHATSAPP_PHONE } from '../context/CartContext';

export const AnnouncementBar: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-brand-900 via-brand-700 to-indigo-900 text-xs text-white py-2 px-4 border-b border-brand-500/20 relative z-40 overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
        <div className="flex items-center gap-2 justify-center font-medium">
          <span className="bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
            <Flame className="w-3 h-3 text-amber-300" /> Flash Sale
          </span>
          <span>Save up to 90% on Premium Subscriptions • Instant WhatsApp Delivery</span>
        </div>

        <div className="hidden md:flex items-center gap-6 text-slate-200">
          <span className="flex items-center gap-1.5 hover:text-white transition-colors">
            <Zap className="w-3.5 h-3.5 text-amber-400" /> Under 5 Min Delivery
          </span>
          <span className="flex items-center gap-1.5 hover:text-white transition-colors">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> 100% Replacement Warranty
          </span>
          <a
            href={`https://wa.me/${WHATSAPP_PHONE}?text=Hello!+I+need+help+with+a+subscription.`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-emerald-300 hover:text-white font-semibold transition-colors"
          >
            <PhoneCall className="w-3 h-3" /> WhatsApp Support
          </a>
        </div>
      </div>
    </div>
  );
};
