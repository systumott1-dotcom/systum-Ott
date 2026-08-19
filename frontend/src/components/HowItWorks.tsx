import React from 'react';
import { ShoppingCart, QrCode, MessageSquare, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';
import { WHATSAPP_PHONE } from '../context/CartContext';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      step: '01',
      title: 'Choose Your Plan',
      description:
        'Browse through 50+ premium OTT streaming apps, software licenses, AI tools, and combo bundles at up to 90% discount.',
      icon: ShoppingCart,
      color: 'from-blue-600 to-cyan-600',
      badge: 'Step 1',
    },
    {
      step: '02',
      title: 'Pay Securely via UPI',
      description:
        'Complete payment instantly using any UPI App (Google Pay, PhonePe, Paytm, BHIM, or QR code) with zero extra fees.',
      icon: QrCode,
      color: 'from-purple-600 to-indigo-600',
      badge: 'Step 2',
    },
    {
      step: '03',
      title: 'Get Instant WhatsApp Delivery',
      description:
        'Login credentials, family invite link, or official license key will be sent directly to your WhatsApp within 5 minutes.',
      icon: MessageSquare,
      color: 'from-emerald-600 to-teal-600',
      badge: 'Step 3',
    },
    {
      step: '04',
      title: 'Enjoy Full Term Warranty',
      description:
        'Stream peacefully! If any issue arises, our 24/7 WhatsApp helpdesk provides instant replacement or resolution throughout your validity.',
      icon: ShieldCheck,
      color: 'from-amber-500 to-orange-500',
      badge: 'Guaranteed',
    },
  ];

  return (
    <section id="how-it-works" className="py-20 bg-white border-t border-slate-200 scroll-mt-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-bold uppercase tracking-wider">
            <CheckCircle2 className="w-3.5 h-3.5 text-brand-600" /> Simple 3-Step Process
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900">
            How It Works
          </h2>
          <p className="text-sm text-slate-500">
            Getting your premium digital subscription is fast, transparent, and completely hassle-free.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="white-card white-card-hover rounded-3xl p-6 border border-slate-200 relative flex flex-col justify-between group transition-all duration-300 bg-white shadow-xs"
              >
                {/* Step indicator watermark */}
                <div className="text-4xl font-black text-slate-100 absolute top-3 right-4 font-mono group-hover:text-slate-200 transition-colors">
                  {item.step}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${item.color} p-0.5 shadow-md flex items-center justify-center`}
                    >
                      <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
                        <Icon className="w-5 h-5 text-slate-900" />
                      </div>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 px-2.5 py-1 rounded-md text-slate-700 border border-slate-200">
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="font-bold text-lg text-slate-900 mb-2 group-hover:text-brand-600 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {index < 3 && (
                  <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-20 text-slate-300">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* CTA Banner */}
        <div className="mt-12 text-center bg-gradient-to-r from-brand-50 via-indigo-50/50 to-brand-50 p-6 rounded-3xl border border-brand-200 max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="text-left">
            <h4 className="text-base font-bold text-slate-900">Have questions before purchasing?</h4>
            <p className="text-xs text-slate-600">Our team is active on WhatsApp to guide you with instant answers.</p>
          </div>
          <a
            href={`https://wa.me/${WHATSAPP_PHONE}?text=Hello!+I+have+a+question+about+how+subscriptions+work.`}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Chat on WhatsApp</span>
          </a>
        </div>

      </div>
    </section>
  );
};
