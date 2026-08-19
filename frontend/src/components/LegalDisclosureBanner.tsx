import React from 'react';
import { ShieldCheck, Info, CheckCircle2 } from 'lucide-react';

interface LegalDisclosureBannerProps {
  onOpenPolicy: (type: 'terms' | 'refund' | 'privacy' | 'dmca' | 'reseller') => void;
}

export const LegalDisclosureBanner: React.FC<LegalDisclosureBannerProps> = ({ onOpenPolicy }) => {
  return (
    <section className="py-8 bg-white border-y border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-xs">
          
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex items-center gap-2 text-xs font-extrabold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-md border border-brand-200 w-fit">
              <ShieldCheck className="w-4 h-4 text-brand-600" />
              <span>Authorized Seller & Multi-Channel Aggregator Disclosure</span>
            </div>
            
            <h3 className="text-base font-bold text-slate-900">
              Transparent, Legitimate & Guaranteed Digital Subscriptions
            </h3>
            
            <p className="text-xs text-slate-600 leading-relaxed">
              <strong>Systum OTT India</strong> operates as both an <em>independent direct seller</em> and a <em>wholesale license aggregator</em>. We source authorized volume activation keys, family subscription allocations, and promotional batches directly from global wholesale marketplaces (such as Eneba, authorized enterprise partners, and certified distributor networks) to bring you wholesale pricing with an unconditional <strong>100% full-term replacement warranty</strong>.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto shrink-0">
            <button
              onClick={() => onOpenPolicy('reseller')}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
            >
              <Info className="w-4 h-4 text-brand-600" />
              <span>Read Seller Policy</span>
            </button>
            <button
              onClick={() => onOpenPolicy('refund')}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Warranty Details</span>
            </button>
          </div>

        </div>
      </div>
    </section>
  );
};
