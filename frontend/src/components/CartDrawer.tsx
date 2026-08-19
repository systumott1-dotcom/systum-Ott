import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowRight, 
  Tag, 
  MessageCircle,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    clearCart,
    subtotal,
    discount,
    totalAmount,
    appliedPromo,
    applyPromoCode,
    removePromoCode,
    generateWhatsAppOrderUrl,
    setIsCheckoutOpen,
  } = useCart();

  useBodyScrollLock(isCartOpen);

  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState('');

  if (!isCartOpen) return null;

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    const success = applyPromoCode(promoInput);
    if (success) {
      setPromoError('');
      setPromoInput('');
    } else {
      setPromoError('Invalid coupon. Try EXTRA10 or SUPER50');
    }
  };

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-slate-200 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
          
          {/* Top Drawer Header */}
          <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-600">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900">Your Cart</h3>
                <span className="text-xs text-slate-500">
                  {cart.length} {cart.length === 1 ? 'item' : 'items'} selected
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-900 border border-slate-200 transition-colors shadow-xs"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
            {cart.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-white border border-slate-200 flex items-center justify-center mx-auto text-slate-400 shadow-xs">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">Your cart is empty</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Explore our bestselling OTT and software subscriptions to get started.
                  </p>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-md transition-colors"
                >
                  Browse Products
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-200">
                  <span>Selected Subscriptions</span>
                  <button
                    onClick={clearCart}
                    className="text-rose-600 hover:text-rose-700 font-bold"
                  >
                    Clear All
                  </button>
                </div>

                {cart.map((item) => (
                  <div
                    key={`${item.productId}-${item.planName}`}
                    className="p-4 rounded-2xl bg-white border border-slate-200 flex items-center justify-between gap-3 group shadow-xs"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                          {item.accountType}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">
                          {item.validity}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 truncate">
                        {item.productTitle}
                      </h4>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-sm font-black text-emerald-600">
                          ₹{item.price * item.quantity}
                        </span>
                        <span className="text-xs text-slate-400 line-through">
                          ₹{item.originalPrice * item.quantity}
                        </span>
                      </div>
                    </div>

                    {/* Quantity Controls & Delete */}
                    <div className="flex flex-col items-end gap-2">
                      <button
                        onClick={() => removeFromCart(item.productId, item.planName)}
                        className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg p-1">
                        <button
                          onClick={() => updateQuantity(item.productId, item.planName, -1)}
                          className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-200"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold text-slate-900 px-1.5">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.planName, 1)}
                          className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-200"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Bottom Summary & Actions */}
          {cart.length > 0 && (
            <div className="p-6 border-t border-slate-200 bg-white space-y-4">
              
              {/* Promo Code Box */}
              <div>
                {appliedPromo ? (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
                    <div className="flex items-center gap-2 text-emerald-700 font-bold">
                      <Tag className="w-4 h-4" />
                      <span>Code '{appliedPromo}' Applied (-₹{discount})</span>
                    </div>
                    <button
                      onClick={removePromoCode}
                      className="text-xs text-slate-500 hover:text-slate-900 underline font-semibold"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyPromo} className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={promoInput}
                        onChange={(e) => {
                          setPromoInput(e.target.value);
                          setPromoError('');
                        }}
                        placeholder="Coupon code (e.g. EXTRA10)"
                        className="w-full pl-3 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-500 uppercase font-mono"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-brand-700 hover:text-brand-800 transition-colors"
                    >
                      Apply
                    </button>
                  </form>
                )}
                {promoError && (
                  <p className="text-[11px] text-rose-600 mt-1 pl-1 font-semibold">{promoError}</p>
                )}
              </div>

              {/* Price Calculation */}
              <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-900">₹{subtotal}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Discount</span>
                    <span>-₹{discount}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-1.5 border-t border-slate-100">
                  <span>Payable Total</span>
                  <span className="text-base text-emerald-600 font-black">
                    ₹{totalAmount}
                  </span>
                </div>
              </div>

              {/* Trust Badge */}
              <div className="flex items-center justify-between text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="flex items-center gap-1 text-emerald-700 font-bold">
                  <Zap className="w-3.5 h-3.5 text-amber-500" /> WhatsApp Instant Delivery
                </span>
                <span className="flex items-center gap-1 text-brand-700 font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" /> Full Warranty
                </span>
              </div>

              {/* Primary Action Buttons */}
              <div className="space-y-2">
                <button
                  onClick={handleProceedToCheckout}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 via-brand-700 to-indigo-700 hover:from-brand-500 hover:to-indigo-600 text-white font-extrabold text-sm shadow-lg shadow-brand-600/25 transition-all flex items-center justify-center gap-2 group"
                >
                  <span>Proceed to UPI Payment</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <a
                  href={generateWhatsAppOrderUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 font-bold text-xs transition-colors flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span>Order via WhatsApp Chat</span>
                </a>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
