import React, { useState, useEffect } from 'react';
import { Check, X } from 'lucide-react';

interface PurchaseItem {
  id: string;
  name: string;
  product: string;
  plan: string;
  timeAgo: string;
  city?: string;
}

const RECENT_PURCHASES: PurchaseItem[] = [
  { id: '1', name: 'Sneha', product: 'Spotify Premium', plan: '6M', timeAgo: '2 hr ago', city: 'Mumbai' },
  { id: '2', name: 'Ishaan', product: 'Spotify Premium', plan: '1Y', timeAgo: '52 min ago', city: 'Delhi NCR' },
  { id: '3', name: 'Aarav', product: 'Netflix 4K UHD', plan: '3M', timeAgo: '7 min ago', city: 'Bangalore' },
  { id: '4', name: 'Pooja', product: 'Canva Pro Edu', plan: '1Y', timeAgo: '18 min ago', city: 'Pune' },
  { id: '5', name: 'Rohan', product: 'YouTube Premium', plan: '1Y', timeAgo: '34 min ago', city: 'Hyderabad' },
  { id: '6', name: 'Ananya', product: 'Disney+ Hotstar', plan: '1Y', timeAgo: '1 hr ago', city: 'Kolkata' },
  { id: '7', name: 'Karan', product: 'ChatGPT Plus 4o', plan: '1M', timeAgo: '12 min ago', city: 'Jaipur' },
  { id: '8', name: 'Priya', product: 'Prime Video 4K', plan: '6M', timeAgo: '1 hr 15 min ago', city: 'Ahmedabad' },
  { id: '9', name: 'Vikram', product: 'Adobe Creative Cloud', plan: '1Y', timeAgo: '42 min ago', city: 'Chandigarh' },
  { id: '10', name: 'Ayush', product: 'SonyLIV + Zee5 Combo', plan: '1Y', timeAgo: '1 hr 45 min ago', city: 'Lucknow' },
  { id: '11', name: 'Neha', product: 'MS Office 365 Pro', plan: 'Lifetime', timeAgo: '26 min ago', city: 'Indore' },
  { id: '12', name: 'Aditya', product: 'Netflix 4K Screen PIN', plan: '1M', timeAgo: '4 min ago', city: 'Chennai' },
];

export const LivePurchasePopup: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (isDismissed) return;

    // Initial popup after 2 seconds
    const initialTimer = setTimeout(() => {
      setIsVisible(true);
    }, 2000);

    // Show popup every 5.5 seconds (Visible for 4s, hidden for 1.5s)
    const interval = setInterval(() => {
      setIsVisible(false);

      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % RECENT_PURCHASES.length);
        setIsVisible(true);
      }, 1500);
    }, 6000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [isDismissed]);

  if (isDismissed) return null;

  const current = RECENT_PURCHASES[currentIndex];

  return (
    <div
      className={`fixed bottom-20 sm:bottom-6 left-4 sm:left-6 z-30 max-w-[290px] sm:max-w-[320px] transition-all duration-500 ease-out transform ${
        isVisible
          ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
          : 'opacity-0 translate-y-4 scale-95 pointer-events-none'
      }`}
      aria-live="polite"
    >
      <div className="bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-2xl p-3 sm:p-3.5 flex items-center justify-between gap-3 group relative hover:shadow-3xl transition-shadow">
        
        {/* Left Side: Checkmark Icon & Text */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center shrink-0">
            <Check className="w-5 h-5 text-emerald-600 stroke-[2.5]" />
          </div>

          <div className="min-w-0">
            <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 truncate leading-tight">
              {current.name}
            </h4>
            <p className="text-[11px] sm:text-xs text-slate-600 font-medium truncate mt-0.5 leading-tight">
              Bought {current.product}
            </p>
            <span className="text-[10px] text-slate-400 font-semibold block mt-0.5 leading-tight">
              {current.plan} · {current.timeAgo}
            </span>
          </div>
        </div>

        {/* Dismiss Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsDismissed(true);
          }}
          className="text-slate-300 hover:text-slate-500 p-1 rounded-lg transition-colors opacity-0 group-hover:opacity-100 shrink-0"
          title="Dismiss notifications"
        >
          <X className="w-3.5 h-3.5" />
        </button>

      </div>
    </div>
  );
};
