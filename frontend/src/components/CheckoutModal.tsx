import React, { useState } from 'react';
import { useCart, WHATSAPP_PHONE } from '../context/CartContext';
import { 
  X, 
  Check, 
  QrCode, 
  Copy, 
  MessageCircle, 
  ShieldCheck, 
  Zap, 
  CheckCircle2, 
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';

export const CheckoutModal: React.FC = () => {
  const {
    cart,
    checkoutItem,
    isCheckoutOpen,
    setIsCheckoutOpen,
    setCheckoutItem,
    totalAmount,
    clearCart,
  } = useCart();

  useBodyScrollLock(isCheckoutOpen);

  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [utrNumber, setUtrNumber] = useState('');
  const [copiedUPI, setCopiedUPI] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isCheckoutOpen) return null;

  const isDirectBuy = !!checkoutItem;
  const finalPrice = isDirectBuy ? checkoutItem.plan.discountedPrice : totalAmount;
  const upiId = 'systumott.pay@okhdfcbank';

  const handleCopyUPI = () => {
    navigator.clipboard.writeText(upiId);
    setCopiedUPI(true);
    setTimeout(() => setCopiedUPI(false), 2000);
  };

  const handleCompleteOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !whatsapp) {
      alert('Please enter your Name and WhatsApp number for delivery.');
      return;
    }

    setIsSuccess(true);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });

    // Prepare WhatsApp message
    let orderMsg = `*🎉 ORDER SUBMITTED - Systum OTT India*\n\n`;
    orderMsg += `*Customer:* ${name}\n`;
    orderMsg += `*WhatsApp:* ${whatsapp}\n`;
    if (email) orderMsg += `*Email:* ${email}\n`;
    orderMsg += `\n*Order Details:*\n`;

    if (isDirectBuy) {
      orderMsg += `• ${checkoutItem.product.title} - ${checkoutItem.plan.name} (${checkoutItem.plan.validity})\n`;
      orderMsg += `• Plan Type: ${checkoutItem.product.accountType}\n`;
    } else {
      cart.forEach((item, i) => {
        orderMsg += `${i + 1}. ${item.productTitle} (${item.planName}) x ${item.quantity} - ₹${item.price * item.quantity}\n`;
      });
    }

    orderMsg += `\n*Total Paid:* ₹${finalPrice}\n`;
    if (utrNumber) {
      orderMsg += `*UPI UTR / Ref No:* ${utrNumber}\n`;
    }
    orderMsg += `\nPlease verify my payment and send my credentials / license. Thanks!`;

    const waUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(orderMsg)}`;

    setTimeout(() => {
      window.open(waUrl, '_blank');
      if (!isDirectBuy) clearCart();
    }, 1200);
  };

  const handleClose = () => {
    setIsCheckoutOpen(false);
    setCheckoutItem(null);
    setIsSuccess(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="white-card bg-white border border-slate-200 rounded-3xl w-full max-w-xl max-h-[92vh] overflow-y-auto shadow-2xl relative p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          /* Success Screen */
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-600 animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900">Payment Submitted!</h3>
            <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              Redirecting you to WhatsApp to send your payment screenshot and receive your instant login credentials.
            </p>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 max-w-sm mx-auto">
              <span>Expected delivery: </span>
              <strong className="text-emerald-700 font-bold">Within 5 minutes</strong>
            </div>
            <button
              onClick={handleClose}
              className="mt-4 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-colors"
            >
              Done & Return to Store
            </button>
          </div>
        ) : (
          /* Checkout Form */
          <form onSubmit={handleCompleteOrder} className="space-y-6">
            
            {/* Header */}
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-bold uppercase mb-2">
                <Zap className="w-3.5 h-3.5 text-amber-500" /> Instant UPI Checkout
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                Complete Your Subscription Order
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Enter your WhatsApp number where your login details will be delivered.
              </p>
            </div>

            {/* Order Summary Box */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="font-bold text-slate-500 uppercase tracking-wider text-[11px]">
                Order Items:
              </div>
              {isDirectBuy ? (
                <div className="flex justify-between items-center text-slate-700">
                  <span>
                    {checkoutItem.product.title} ({checkoutItem.plan.name})
                  </span>
                  <span className="font-bold text-slate-900">
                    ₹{checkoutItem.plan.discountedPrice}
                  </span>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={`${item.productId}-${item.planName}`}
                    className="flex justify-between items-center text-slate-700"
                  >
                    <span>
                      {item.productTitle} ({item.planName}) x {item.quantity}
                    </span>
                    <span className="font-bold text-slate-900">
                      ₹{item.price * item.quantity}
                    </span>
                  </div>
                ))
              )}

              <div className="border-t border-slate-200 pt-2 flex justify-between items-center text-sm font-extrabold text-slate-900">
                <span>Total Amount Payable</span>
                <span className="text-emerald-600 text-lg font-black">
                  ₹{finalPrice}
                </span>
              </div>
            </div>

            {/* Customer Inputs */}
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Your Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    WhatsApp Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. rahul@gmail.com"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-brand-500"
                />
              </div>
            </div>

            {/* UPI QR & Payment Box */}
            <div className="p-4 rounded-2xl bg-gradient-to-b from-brand-50 to-slate-50 border border-brand-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-brand-600" />
                  <span className="text-xs font-bold text-slate-900">Scan QR or Copy UPI ID</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  Zero Transaction Fee
                </span>
              </div>

              {/* UPI ID copy box */}
              <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">UPI ID</div>
                  <div className="text-xs font-mono font-bold text-brand-700">{upiId}</div>
                </div>
                <button
                  type="button"
                  onClick={handleCopyUPI}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-brand-50 hover:bg-brand-100 border border-brand-200 text-brand-700 text-xs font-bold transition-all"
                >
                  {copiedUPI ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy UPI</span>
                    </>
                  )}
                </button>
              </div>

              {/* UTR reference input */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  UPI Ref / UTR / Transaction No. (After payment)
                </label>
                <input
                  type="text"
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value)}
                  placeholder="e.g. 423891029381 (or share screenshot on WhatsApp)"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-500 font-mono"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm shadow-xl shadow-emerald-600/25 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 group"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Confirm & Send to WhatsApp (₹{finalPrice})</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>100% Guaranteed Delivery with Replacement Warranty</span>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
