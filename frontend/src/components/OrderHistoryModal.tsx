import React, { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import { WHATSAPP_PHONE } from '../context/CartContext';
import type { OrderHistoryItem } from '../types';
import { 
  X, 
  ShoppingBag, 
  Search, 
  MessageCircle, 
  Copy, 
  Check, 
  Key, 
  Loader2
} from 'lucide-react';

interface OrderHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LOCAL_STORAGE_ORDERS_KEY = 'systum_ott_user_orders_v1';

export const OrderHistoryModal: React.FC<OrderHistoryModalProps> = ({ isOpen, onClose }) => {
  const toast = useToast();
  useBodyScrollLock(isOpen);

  const [searchInput, setSearchInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [orders, setOrders] = useState<OrderHistoryItem[]>([]);
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

  // Load locally saved orders on open
  useEffect(() => {
    if (isOpen) {
      try {
        const saved = localStorage.getItem(LOCAL_STORAGE_ORDERS_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setOrders(parsed);
          }
        }
      } catch {
        setOrders([]);
      }
    }
  }, [isOpen]);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = searchInput.trim();
    if (!query) {
      toast.warning('Please enter your WhatsApp Number, Email, or Order ID');
      return;
    }

    setIsSearching(true);
    try {
      const res = await fetch(`/api/orders/user/${encodeURIComponent(query)}`);
      const data = await res.json();

      if (data.success && Array.isArray(data.orders) && data.orders.length > 0) {
        setOrders(data.orders);
        toast.success(`Found ${data.orders.length} order(s)! 📦`);
      } else {
        // Check single order by ID
        const cleanId = query.replace(/^#/, '');
        const singleRes = await fetch(`/api/orders/${cleanId}`);
        const singleData = await singleRes.json();

        if (singleData.success && (singleData.order || singleData.data)) {
          const found = singleData.order || singleData.data;
          setOrders([found]);
          toast.success(`Found Order #${found.id}! 📦`);
        } else {
          toast.info(`No orders found for "${query}". Check your WhatsApp number.`);
        }
      }
    } catch {
      toast.error('Failed to search orders. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleCopyCredentials = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKeyId(id);
    toast.success('Login credentials copied to clipboard! 🔑');
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="white-card bg-white border border-slate-200 rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl relative p-6 sm:p-8 space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-600 border border-brand-200 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
                My Orders & Active Subscriptions
              </h3>
              <p className="text-xs text-slate-500">
                Track your orders, view expiry dates & access credentials
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search by WhatsApp or Order ID */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by WhatsApp Number, Email, or Order ID..."
              className="w-full pl-3.5 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
          <button
            type="submit"
            disabled={isSearching}
            className="px-4 sm:px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-extrabold shadow-md flex items-center gap-1.5 shrink-0 disabled:opacity-50"
          >
            {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span>Find Orders</span>
          </button>
        </form>

        {/* Orders List */}
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto" />
              <h4 className="text-sm font-bold text-slate-700">No Orders Displayed</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Enter your 10-digit WhatsApp phone number above to pull up all your subscription orders.
              </p>
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4 hover:border-brand-200 transition-all"
              >
                {/* Top Row: Order ID & Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono font-black text-sm text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                      #{order.id}
                    </span>
                    <span
                      className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                        order.status === 'DELIVERED'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : order.status === 'CANCELLED'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {order.status.replace('_', ' ')}
                    </span>
                  </div>

                  <span className="text-base font-black text-slate-900">
                    ₹{order.totalAmount}
                  </span>
                </div>

                {/* Items List */}
                <div className="space-y-1.5">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex justify-between items-center text-xs">
                      <div>
                        <strong className="text-slate-900 block font-bold">
                          {item.productTitle}
                        </strong>
                        <span className="text-slate-500">
                          {item.planName} {item.validity ? `(${item.validity})` : ''} · Qty: {item.quantity}
                        </span>
                      </div>
                      <span className="font-extrabold text-slate-800">
                        ₹{item.price * item.quantity}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Purchase Date, Expiry Date & Warranty Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 bg-slate-50 p-3 rounded-xl border border-slate-100 text-[11px]">
                  <div>
                    <span className="text-slate-400 font-bold block mb-0.5">📅 Purchase Date:</span>
                    <strong className="text-slate-800">{order.purchaseDate || new Date(order.createdAt).toLocaleDateString()}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block mb-0.5">⏳ Expiry Date:</span>
                    <strong className="text-emerald-700 font-extrabold">{order.expiryDate || '30 Days Validity'}</strong>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <span className="text-slate-400 font-bold block mb-0.5">🛡️ Warranty:</span>
                    <strong className="text-brand-700">{order.warrantyType || 'Full Replacement'}</strong>
                  </div>
                </div>

                {/* Delivered Credentials Box */}
                {order.deliveryCredentials && (
                  <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-emerald-900 flex items-center gap-1.5">
                        <Key className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Your Access Credentials:</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyCredentials(order.id, order.deliveryCredentials!)}
                        className="px-2 py-1 bg-white hover:bg-emerald-100 border border-emerald-200 rounded-lg text-[10px] font-bold text-emerald-800 flex items-center gap-1 transition-colors"
                      >
                        {copiedKeyId === order.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedKeyId === order.id ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <pre className="font-mono text-emerald-950 whitespace-pre-wrap font-semibold text-xs bg-white/70 p-2 rounded-lg border border-emerald-100">
                      {order.deliveryCredentials}
                    </pre>
                  </div>
                )}

                {/* WhatsApp Help Action */}
                <div className="flex justify-end pt-1">
                  <a
                    href={`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(
                      `Hi! Need support regarding my Order #${order.id} (${order.customerName}).`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>WhatsApp Support for this Order</span>
                  </a>
                </div>

              </div>
            ))
          )}
        </div>

        {/* Footer Close */}
        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
