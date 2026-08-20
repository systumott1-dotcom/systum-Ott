import React, { useState, useEffect, useMemo } from 'react';
import { Check, X } from 'lucide-react';

interface PurchaseItem {
  id: string;
  name: string;
  product: string;
  plan: string;
  timestamp: number; // Unix timestamp in milliseconds
}

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

  // Fetch real order activity from backend & local storage
  const fetchRecentActivity = async () => {
    try {
      const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;
      const combined: PurchaseItem[] = [];

      // 1. Fetch from backend API
      try {
        const res = await fetch('/api/orders/recent-activity');
        const data = await res.json();
        if (data.success && Array.isArray(data.orders)) {
          data.orders.forEach((o: any, idx: number) => {
            const ts = typeof o.timestamp === 'number' ? o.timestamp : new Date(o.createdAt || Date.now()).getTime();
            if (ts >= twoHoursAgo) {
              combined.push({
                id: o.id || `api-${idx}`,
                name: o.name || 'Customer',
                product: o.product || 'Subscription',
                plan: o.plan || 'Plan',
                timestamp: ts,
              });
            }
          });
        }
      } catch {
        // API offline or empty
      }

      // 2. Check customer's local storage for real recent orders
      try {
        const localSaved = JSON.parse(localStorage.getItem('systum_ott_user_orders_v1') || '[]');
        if (Array.isArray(localSaved)) {
          localSaved.forEach((lo: any, idx: number) => {
            const ts = new Date(lo.createdAt || lo.purchaseDate || Date.now()).getTime();
            if (ts >= twoHoursAgo && !combined.some((c) => c.id === lo.id)) {
              const item = lo.items?.[0] || {};
              combined.push({
                id: lo.id || `local-${idx}`,
                name: (lo.customerName || lo.name || 'Customer').split(' ')[0],
                product: item.title || item.productTitle || 'Subscription',
                plan: item.plan || item.planName || item.validity || '30 Days',
                timestamp: ts,
              });
            }
          });
        }
      } catch {
        // ignore parse error
      }

      // Sort by newest first
      combined.sort((a, b) => b.timestamp - a.timestamp);
      setRealOrders(combined);
    } catch {
      setRealOrders([]);
    }
  };

  useEffect(() => {
    fetchRecentActivity();

    // Poll for real orders every 30 seconds
    const pollInterval = setInterval(() => {
      fetchRecentActivity();
    }, 30000);

    return () => clearInterval(pollInterval);
  }, []);

  // Filter active pool strictly within 2 hours
  const activePool = useMemo(() => {
    const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;
    return realOrders.filter((o) => o.timestamp >= twoHoursAgo);
  }, [realOrders]);

  // Timed popup sequence: Visible for 5s, delayed 15s before next popup
  useEffect(() => {
    if (isDismissed || activePool.length === 0) {
      setIsVisible(false);
      return;
    }

    // Initial popup 4 seconds after real order detected
    const initialTimer = setTimeout(() => {
      setIsVisible(true);
    }, 4000);

    let delayTimer: ReturnType<typeof setTimeout> | null = null;

    // Cycle when there are real orders: 5s display, then 15s delay
    const intervalTimer = setInterval(() => {
      setIsVisible(false);

      delayTimer = setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % activePool.length);
        setIsVisible(true);
      }, 15000);
    }, 20000); // 5s visible + 15s delay = 20s total cycle

    return () => {
      clearTimeout(initialTimer);
      if (delayTimer) clearTimeout(delayTimer);
      clearInterval(intervalTimer);
    };
  }, [isDismissed, activePool.length]);

  // If no real orders within the last 2 hours, do not show any popup!
  if (isDismissed || activePool.length === 0) return null;

  const current = activePool[currentIndex % activePool.length];
  if (!current) return null;

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
        
        {/* Left Side: Checkmark Icon & Real Purchase Text */}
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
