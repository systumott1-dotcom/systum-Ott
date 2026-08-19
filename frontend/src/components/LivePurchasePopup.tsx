import React, { useState, useEffect, useMemo } from 'react';
import { Check, X } from 'lucide-react';

interface PurchaseItem {
  id: string;
  name: string;
  product: string;
  plan: string;
  timestamp: number; // Unix timestamp in milliseconds for real-time calculation
}

// Fallback pool with relative minute offsets within the last 2 hours (2m to 110m ago)
const SEED_OFFSETS = [
  { name: 'Sneha', product: 'Spotify Premium', plan: '6M', offsetMins: 112 },
  { name: 'Ishaan', product: 'Spotify Premium', plan: '1Y', offsetMins: 48 },
  { name: 'Aarav', product: 'Netflix 4K UHD', plan: '3M', offsetMins: 6 },
  { name: 'Pooja', product: 'Canva Pro', plan: '1Y', offsetMins: 19 },
  { name: 'Rohan', product: 'YouTube Premium', plan: '1Y', offsetMins: 32 },
  { name: 'Ananya', product: 'Disney+ Hotstar', plan: '1Y', offsetMins: 58 },
  { name: 'Karan', product: 'ChatGPT Plus 4o', plan: '1M', offsetMins: 11 },
  { name: 'Priya', product: 'Prime Video 4K', plan: '6M', offsetMins: 74 },
  { name: 'Vikram', product: 'Adobe Creative Cloud', plan: '1Y', offsetMins: 39 },
  { name: 'Ayush', product: 'SonyLIV + Zee5 Combo', plan: '1Y', offsetMins: 95 },
  { name: 'Neha', product: 'MS Office 365 Pro', plan: 'Lifetime', offsetMins: 23 },
  { name: 'Aditya', product: 'Netflix 4K Screen PIN', plan: '1M', offsetMins: 3 },
];

// Helper to compute exact real-time relative time ago
const formatRealTimeAgo = (timestamp: number): string => {
  const now = Date.now();
  const diffMs = Math.max(0, now - timestamp);
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) {
    return 'Just now';
  }
  if (diffMins === 1) {
    return '1 min ago';
  }
  if (diffMins < 60) {
    return `${diffMins} min ago`;
  }
  
  const hours = Math.floor(diffMins / 60);
  const remMins = diffMins % 60;
  if (hours === 1) {
    return remMins > 0 ? `1 hr ${remMins}m ago` : '1 hr ago';
  }
  return `${hours} hr ago`;
};

export const LivePurchasePopup: React.FC = () => {
  const [realOrders, setRealOrders] = useState<PurchaseItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Initialize seed timestamps based on current clock time
  const seedPurchases = useMemo<PurchaseItem[]>(() => {
    const baseTime = Date.now();
    return SEED_OFFSETS.map((item, idx) => ({
      id: `seed-${idx}`,
      name: item.name,
      product: item.product,
      plan: item.plan,
      timestamp: baseTime - item.offsetMins * 60 * 1000,
    }));
  }, []);

  // Fetch real order activity from backend & local storage
  useEffect(() => {
    const fetchRecentActivity = async () => {
      try {
        const res = await fetch('/api/orders/recent-activity');
        const data = await res.json();
        if (data.success && Array.isArray(data.orders) && data.orders.length > 0) {
          const apiOrders: PurchaseItem[] = data.orders.map((o: any, idx: number) => ({
            id: o.id || `real-${idx}`,
            name: o.name || 'Customer',
            product: o.product || 'Subscription',
            plan: o.plan || 'Plan',
            timestamp: typeof o.timestamp === 'number' ? o.timestamp : new Date(o.createdAt || Date.now()).getTime(),
          }));

          setRealOrders(apiOrders);
        }
      } catch {
        // Fallback gracefully
      }
    };

    fetchRecentActivity();
  }, []);

  // Combined pool prioritizing real orders
  const activePool = useMemo(() => {
    if (realOrders.length > 0) {
      return [...realOrders, ...seedPurchases];
    }
    return seedPurchases;
  }, [realOrders, seedPurchases]);

  // Timed popup sequence: Visible for 5s, delayed 15s before next popup
  useEffect(() => {
    if (isDismissed || activePool.length === 0) return;

    // Initial popup 4 seconds after page load
    const initialTimer = setTimeout(() => {
      setIsVisible(true);
    }, 4000);

    let delayTimer: ReturnType<typeof setTimeout> | null = null;

    // When popup becomes visible, auto-hide after 5 seconds
    // Then wait 15 seconds before triggering the next one
    const intervalTimer = setInterval(() => {
      setIsVisible(false);

      // 15 seconds delay before showing the next popup
      delayTimer = setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % activePool.length);
        setIsVisible(true);
      }, 15000);
    }, 20000); // Total cycle: 5s display + 15s delay = 20s

    return () => {
      clearTimeout(initialTimer);
      if (delayTimer) clearTimeout(delayTimer);
      clearInterval(intervalTimer);
    };
  }, [isDismissed, activePool.length]);

  if (isDismissed || activePool.length === 0) return null;

  const current = activePool[currentIndex % activePool.length];
  const liveTimeAgo = formatRealTimeAgo(current.timestamp);

  return (
    <div
      className={`fixed bottom-20 sm:bottom-6 left-4 sm:left-6 z-30 max-w-[290px] sm:max-w-[320px] transition-all duration-700 ease-out transform ${
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
              {current.plan} · {liveTimeAgo}
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
