import React from 'react';
import { ShieldCheck, Zap, Lock, Headset, Globe, CheckCircle } from 'lucide-react';

export const TrustFeatures: React.FC = () => {
  const features = [
    {
      icon: ShieldCheck,
      title: 'Full Term Replacement Warranty',
      description: 'Every subscription comes with an unconditional replacement promise for its entire duration.',
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
    },
    {
      icon: Zap,
      title: 'Under 5-Minute Delivery',
      description: 'Instant delivery right to your WhatsApp inbox right after UPI confirmation.',
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
    },
    {
      icon: Lock,
      title: '100% Safe & Private Logins',
      description: 'Personal screen PIN locks, private accounts, and official family invites without privacy risks.',
      color: 'text-cyan-600',
      bg: 'bg-cyan-50',
      border: 'border-cyan-200',
    },
    {
      icon: Globe,
      title: 'Zero VPN / Proxy Required',
      description: 'All services run directly on Indian IPs, Smart TVs, Android boxes, Firestick, and phones.',
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
    },
    {
      icon: Headset,
      title: '24/7 WhatsApp Support',
      description: 'Real humans on chat 7 days a week (9 AM – 11 PM) to help you with renewals and queries.',
      color: 'text-brand-600',
      bg: 'bg-brand-50',
      border: 'border-brand-200',
    },
    {
      icon: CheckCircle,
      title: 'Zero Hidden Charges',
      description: 'The price you see is the final price. No recurring hidden deductions or renewal traps.',
      color: 'text-rose-600',
      bg: 'bg-rose-50',
      border: 'border-rose-200',
    },
  ];

  return (
    <section className="py-16 bg-slate-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-700 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
            Why Systum OTT
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900">
            Why 1,000+ Verified Customers Trust Us
          </h2>
          <p className="text-sm text-slate-500">
            Enjoy premium entertainment and pro creative tools at retail fractions with bulletproof safety.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={i}
                className="p-6 rounded-3xl bg-white border border-slate-200 hover:border-brand-300 hover:shadow-md transition-all duration-300 flex items-start gap-4 group"
              >
                <div
                  className={`w-12 h-12 rounded-2xl ${item.bg} border ${item.border} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-xs`}
                >
                  <Icon className={`w-6 h-6 ${item.color}`} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
