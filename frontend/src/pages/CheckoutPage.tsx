import React, { useState } from 'react';
import { useCart, WHATSAPP_PHONE } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import confetti from 'canvas-confetti';
import { 
  ArrowLeft, 
  ShieldCheck, 
  Copy, 
  Check, 
  MessageCircle, 
  Zap, 
  CheckCircle2, 
  ShoppingBag, 
  Sparkles,
  User,
  Users,
  ExternalLink,
  PhoneCall,
  Lock,
  Headphones
} from 'lucide-react';

interface CheckoutPageProps {
  onBackToStore: () => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ onBackToStore }) => {
  const toast = useToast();
  const {
    cart,
    checkoutItem,
    totalAmount,
    subtotal,
    discount,
    appliedPromo,
    applyPromoCode,
    removePromoCode,
    clearCart,
  } = useCart();

  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [utrNumber, setUtrNumber] = useState('');
  const [couponInput, setCouponInput] = useState('');
  const [copiedUPI, setCopiedUPI] = useState(false);
  const [copiedReceipt, setCopiedReceipt] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<{
    id: string;
    name: string;
    whatsapp: string;
    email?: string;
    totalPaid: number;
    purchaseDate: string;
    expiryDate: string;
    items: Array<{ title: string; plan: string; price: number; quantity: number }>;
  } | null>(null);

  const isDirectBuy = !!checkoutItem;
  const items = isDirectBuy
    ? [
        {
          title: checkoutItem.product.title,
          plan: `${checkoutItem.plan.name} (${checkoutItem.plan.validity})`,
          price: checkoutItem.plan.discountedPrice,
          originalPrice: checkoutItem.plan.originalPrice,
          quantity: 1,
          accountType: checkoutItem.product.accountType,
          imageUrl: checkoutItem.product.imageUrl,
        },
      ]
    : cart.map((item) => ({
        title: item.productTitle,
        plan: `${item.planName} (${item.validity})`,
        price: item.price,
        originalPrice: item.originalPrice,
        quantity: item.quantity,
        accountType: item.accountType,
        imageUrl: undefined,
      }));

  const finalAmount = isDirectBuy ? checkoutItem.plan.discountedPrice : totalAmount;
  const upiId = 'systumott.pay@okhdfcbank';
  const upiPayUrl = `upi://pay?pa=${upiId}&pn=Systum%20OTT%20India&am=${finalAmount}&cu=INR&tn=Order%20Subscription`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(upiPayUrl)}`;

  const handleCopyUPI = () => {
    navigator.clipboard.writeText(upiId);
    setCopiedUPI(true);
    toast.success('UPI ID copied to clipboard! 📋');
    setTimeout(() => setCopiedUPI(false), 2000);
  };

  const handleCopyPhoneNumber = () => {
    navigator.clipboard.writeText('+91 93060 22703');
    setCopiedPhone(true);
    toast.success('Phone number +91 93060 22703 copied! 📞');
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const ok = applyPromoCode(couponInput);
    if (ok) {
      toast.success(`Coupon ${couponInput.toUpperCase()} applied successfully! 🎉`);
      setCouponInput('');
    } else {
      toast.error('Invalid coupon code. Try SAVE10 or EXTRA10.');
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !whatsapp.trim()) {
      toast.warning('Please enter your Name and WhatsApp phone number.');
      return;
    }

    setIsSubmitting(true);
    let assignedOrderId = Math.floor(10000 + Math.random() * 90000).toString();

    const now = new Date();
    const purchaseDate = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    
    // Calculate exact expiry date according to selected validity
    const firstPlanStr = items[0]?.plan || '30 Days';
    let days = 30;
    const v = firstPlanStr.toLowerCase();
    if (v.includes('lifetime') || v.includes('permanent')) {
      days = 36500;
    } else {
      const matchDays = v.match(/(\d+)\s*(day|days|d)/);
      const matchMonths = v.match(/(\d+)\s*(month|months|mo|m)/);
      const matchYears = v.match(/(\d+)\s*(year|years|yr|y)/);
      if (matchDays) days = parseInt(matchDays[1], 10);
      else if (matchMonths) days = parseInt(matchMonths[1], 10) * 30;
      else if (matchYears) days = parseInt(matchYears[1], 10) * 365;
      else if (v.includes('3 month')) days = 90;
      else if (v.includes('6 month')) days = 180;
      else if (v.includes('1 year') || v.includes('12 month')) days = 365;
    }
    const expiry = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    const expiryDate = v.includes('lifetime') ? 'Lifetime Access' : expiry.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

    try {
      // POST order to backend
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          whatsapp: whatsapp.trim(),
          email: email.trim() || undefined,
          deliveryPreference: 'whatsapp',
          items: items.map((i) => ({
            title: i.title,
            plan: i.plan,
            price: i.price,
            quantity: i.quantity,
          })),
          totalAmount: finalAmount,
          utrNumber: utrNumber.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (data.success && data.order?.id) {
        assignedOrderId = data.order.id;
      }

      // Persist order locally for customer Orders History
      try {
        const existingOrders = JSON.parse(localStorage.getItem('systum_ott_user_orders_v1') || '[]');
        const newHistoryItem = {
          id: assignedOrderId,
          customerName: name.trim(),
          customerPhone: whatsapp.trim(),
          customerEmail: email.trim() || undefined,
          items: items.map((i) => ({
            productTitle: i.title,
            planName: i.plan,
            price: i.price,
            quantity: i.quantity,
          })),
          totalAmount: finalAmount,
          purchaseDate,
          expiryDate,
          warrantyType: 'Full-Term Replacement',
          status: 'PENDING_VERIFICATION',
          createdAt: now.toISOString(),
        };
        localStorage.setItem('systum_ott_user_orders_v1', JSON.stringify([newHistoryItem, ...existingOrders]));
      } catch {}

      // Trigger Confetti
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });

      setOrderSuccess({
        id: assignedOrderId,
        name: name.trim(),
        whatsapp: whatsapp.trim(),
        email: email.trim() || undefined,
        totalPaid: finalAmount,
        purchaseDate,
        expiryDate,
        items,
      });

      if (!isDirectBuy) {
        clearCart();
      }

      toast.success(`Order #${assignedOrderId} recorded! WhatsApp delivery is being prepared.`);
    } catch {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      setOrderSuccess({
        id: assignedOrderId,
        name: name.trim(),
        whatsapp: whatsapp.trim(),
        email: email.trim() || undefined,
        totalPaid: finalAmount,
        purchaseDate,
        expiryDate,
        items,
      });
      if (!isDirectBuy) clearCart();
    } finally {
      setIsSubmitting(false);
    }
  };

  // POST-PAYMENT SUCCESS SCREEN
  if (orderSuccess) {
    const productListStr = orderSuccess.items.map((i) => `${i.title} - ${i.plan}`).join(', ');
    const formattedReceiptText = `*🎉 Thank You for Your Order!*

📦 Order Details
Order ID: #${orderSuccess.id}
📨 Email / Number - ${orderSuccess.email ? `${orderSuccess.email} / ` : ''}+91 ${orderSuccess.whatsapp}
Product: ${productListStr}
💰 Amount: ₹${orderSuccess.totalPaid}
📅 Purchase Date: ${orderSuccess.purchaseDate}
⏳ Expiry Date: ${orderSuccess.expiryDate}
📲 Device Name: Smart TV / Mobile / PC

*Let us know if u want any other OTT or SOFTWARE in lowest price 😊*

Don’t forget to join our community for latest updates, offers, and support 👉
https://chat.whatsapp.com/HbyJSeVgJT9EdGpuJAZLle`;

    const handleCopyFullReceipt = () => {
      navigator.clipboard.writeText(formattedReceiptText);
      setCopiedReceipt(true);
      toast.success('Order receipt copied to clipboard! 📋');
      setTimeout(() => setCopiedReceipt(false), 2000);
    };

    return (
      <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto bg-white rounded-3xl p-6 sm:p-9 border border-slate-200 shadow-xl space-y-6 animate-in zoom-in-95 duration-200">
          
          {/* Header Badge */}
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-3xl bg-emerald-50 border-2 border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> Order Placed Successfully
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Thank You, {orderSuccess.name}!
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Order ID: <strong className="font-mono text-brand-700 font-black">#{orderSuccess.id}</strong>
            </p>
          </div>

          {/* Formatted Order Details Receipt Box */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 text-left space-y-3 relative group">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <span>📦</span> Order Details
              </span>
              <button
                type="button"
                onClick={handleCopyFullReceipt}
                className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-[11px] font-bold text-slate-700 flex items-center gap-1 transition-colors shadow-2xs"
              >
                {copiedReceipt ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedReceipt ? 'Copied Receipt' : 'Copy Receipt'}</span>
              </button>
            </div>

            <div className="space-y-2 text-xs font-mono text-slate-800">
              <div><strong className="text-slate-500 font-sans">Order ID:</strong> #{orderSuccess.id}</div>
              <div><strong className="text-slate-500 font-sans">📨 Email / Number:</strong> {orderSuccess.email ? `${orderSuccess.email} / ` : ''}+91 {orderSuccess.whatsapp}</div>
              <div><strong className="text-slate-500 font-sans">Product:</strong> {productListStr}</div>
              <div><strong className="text-slate-500 font-sans">💰 Amount:</strong> ₹{orderSuccess.totalPaid}</div>
              <div><strong className="text-slate-500 font-sans">📅 Purchase Date:</strong> {orderSuccess.purchaseDate}</div>
              <div><strong className="text-slate-500 font-sans">⏳ Expiry Date:</strong> {orderSuccess.expiryDate}</div>
              <div><strong className="text-slate-500 font-sans">📲 Device Name:</strong> Smart TV / Mobile / PC</div>
            </div>

            <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500 italic">
              Let us know if u want any other OTT or SOFTWARE in lowest price 😊
            </div>
          </div>

          {/* WhatsApp Direct Action Button */}
          <a
            href={`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(formattedReceiptText)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-4 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-5 h-5" />
            <span>Send Order on WhatsApp to Expedite Delivery ⚡</span>
          </a>

          {/* Join WhatsApp Community Card */}
          <a
            href="https://chat.whatsapp.com/HbyJSeVgJT9EdGpuJAZLle"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-brand-50 to-indigo-50 border border-brand-200 text-slate-800 hover:shadow-md transition-all group text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <strong className="text-xs sm:text-sm font-extrabold text-slate-900 block">
                  Join Our Official Community
                </strong>
                <span className="text-[11px] text-slate-500 font-medium">
                  Latest OTT releases, member discounts & instant support
                </span>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-brand-600 group-hover:translate-x-0.5 transition-transform shrink-0" />
          </a>

          {/* Support Helpline & Manual Copy Option */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">
                Taking longer than usual? Reach out directly:
              </span>
              <button
                type="button"
                onClick={handleCopyPhoneNumber}
                className="text-[11px] font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-200 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1"
              >
                {copiedPhone ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiedPhone ? 'Number Copied' : 'Copy Number'}</span>
              </button>
            </div>
            
            <div className="flex items-center gap-3 pt-1">
              <a
                href={`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(`Hi! Checking on my order #${orderSuccess.id}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-mono font-extrabold text-emerald-700 hover:underline flex items-center gap-1.5"
              >
                <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
                <span>+91 93060 22703</span>
              </a>
              <span className="text-[11px] text-slate-400">· Click to chat or copy and message manually</span>
            </div>
          </div>

          {/* Return to Store */}
          <button
            onClick={onBackToStore}
            className="w-full py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Continue Shopping in Store</span>
          </button>

        </div>
      </div>
    );
  }

  // If no items
  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900">Your Cart is Empty</h2>
        <p className="text-xs text-slate-500 max-w-sm">
          You have no subscriptions ready for checkout. Browse our catalog to select your favorite plans!
        </p>
        <button
          onClick={onBackToStore}
          className="px-6 py-3 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Browse Subscriptions</span>
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/60 pb-20">
      
      {/* Top Header */}
      <div className="bg-white border-b border-slate-200 sticky top-20 z-20 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <button
            onClick={onBackToStore}
            className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-brand-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Store</span>
          </button>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Instant WhatsApp Delivery Guaranteed</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        <div className="mb-8">
          <span className="inline-flex items-center gap-1 text-xs font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 mb-2">
            <MessageCircle className="w-3.5 h-3.5 text-emerald-600" /> WhatsApp Instant Delivery
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Checkout & <span className="gradient-text">Payment</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Pay via UPI and receive your login credentials directly on WhatsApp.
          </p>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: Form + UPI Payment (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            <form onSubmit={handleSubmitOrder} className="space-y-6">
              
              {/* Customer Info Card */}
              <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-3">
                  <User className="w-4 h-4 text-brand-600" />
                  <span>Customer & WhatsApp Delivery Details</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">
                      Your Full Name *
                    </label>
                    <input
                      required
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center justify-between">
                      <span>WhatsApp Number *</span>
                      <span className="text-[10px] text-emerald-600 font-extrabold">Delivery will be sent here</span>
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-xs font-bold text-slate-400">
                        +91
                      </span>
                      <input
                        required
                        type="tel"
                        value={whatsapp}
                        onChange={(e) => setWhatsapp(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        placeholder="98765 43210"
                        className="w-full pl-12 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. rahul@example.com"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Optional receipt copy sent to email
                  </span>
                </div>
              </div>

              {/* UPI Payment Card */}
              <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-sm space-y-5">
                <div className="flex items-center gap-2 text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-3">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span>Scan QR Code or Pay via UPI</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
                  
                  {/* QR Code */}
                  <div className="sm:col-span-5 text-center space-y-2">
                    <div className="p-3 bg-white rounded-2xl border-2 border-slate-200 shadow-inner inline-block">
                      <img
                        src={qrCodeUrl}
                        alt="UPI QR Code"
                        className="w-44 h-44 object-contain mx-auto rounded-lg"
                      />
                    </div>
                    <span className="text-[11px] text-slate-500 font-bold block">
                      GPay · PhonePe · Paytm · BHIM
                    </span>
                  </div>

                  {/* UPI Details & Copy */}
                  <div className="sm:col-span-7 space-y-4">
                    <div>
                      <span className="text-xs font-bold text-slate-500 block mb-1">
                        Amount to Pay:
                      </span>
                      <span className="text-3xl font-black text-slate-900">
                        ₹{finalAmount}
                      </span>
                    </div>

                    <div>
                      <span className="text-xs font-bold text-slate-500 block mb-1">
                        Official Merchant UPI ID:
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs font-bold text-slate-800 truncate">
                          {upiId}
                        </div>
                        <button
                          type="button"
                          onClick={handleCopyUPI}
                          className="px-3.5 py-2.5 bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0"
                        >
                          {copiedUPI ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedUPI ? 'Copied!' : 'Copy'}</span>
                        </button>
                      </div>
                    </div>

                    {/* UTR Input */}
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        UPI Reference / UTR Number (Optional)
                      </label>
                      <input
                        type="text"
                        value={utrNumber}
                        onChange={(e) => setUtrNumber(e.target.value.replace(/\s+/g, ''))}
                        placeholder="e.g. 423871928374"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:bg-white focus:border-brand-500"
                      />
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        Found in your UPI app receipt after payment
                      </span>
                    </div>
                  </div>

                </div>

                {/* Final Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-emerald-600/20 transition-all transform hover:-translate-y-0.5 active:scale-98 flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>{isSubmitting ? 'Recording Order...' : `Confirm Payment & Get Delivered to Your WhatsApp · ₹${finalAmount}`}</span>
                </button>

              </div>

            </form>

          </div>

          {/* RIGHT COLUMN: Order Summary & Coupon Engine (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Order Summary Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-5">
              <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3">
                Order Summary ({items.length} {items.length === 1 ? 'Item' : 'Items'})
              </h3>

              {/* Items List */}
              <div className="divide-y divide-slate-100 space-y-3">
                {items.map((item, idx) => (
                  <div key={idx} className="pt-3 first:pt-0 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                      ) : (
                        <ShoppingBag className="w-5 h-5 text-brand-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 truncate">
                        {item.title}
                      </h4>
                      <span className="text-[11px] text-slate-500 block truncate">
                        {item.plan}
                      </span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs sm:text-sm font-black text-slate-900 block">
                        ₹{item.price * item.quantity}
                      </span>
                      {item.originalPrice > item.price && (
                        <span className="text-[10px] text-slate-400 line-through">
                          ₹{item.originalPrice * item.quantity}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Coupon Engine */}
              {!isDirectBuy && (
                <div className="pt-3 border-t border-slate-100">
                  {appliedPromo ? (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-emerald-800 block">Coupon {appliedPromo} Applied!</span>
                        <span className="text-[11px] text-emerald-600">-₹{discount} Discount</span>
                      </div>
                      <button
                        onClick={removePromoCode}
                        className="text-red-500 hover:text-red-700 font-bold"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyCoupon} className="flex gap-2">
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        placeholder="Discount Code (e.g. SAVE10)"
                        className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono uppercase"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold"
                      >
                        Apply
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* Price Breakdown */}
              <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span>₹{isDirectBuy ? checkoutItem.plan.discountedPrice : subtotal}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Coupon Discount</span>
                    <span>-₹{discount}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>WhatsApp Delivery Fee</span>
                  <span className="text-emerald-600 font-bold">FREE</span>
                </div>
                <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline font-black text-base text-slate-900">
                  <span>Total Payable</span>
                  <span className="text-2xl font-black text-slate-900">₹{finalAmount}</span>
                </div>
              </div>

            </div>

            {/* 2x2 Trust Cards under Order */}
            <div className="grid grid-cols-2 gap-3 text-left">
              {/* WhatsApp Delivery */}
              <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200 shadow-2xs flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                  <Zap className="w-4 h-4 fill-amber-500 text-amber-500" />
                </div>
                <div className="min-w-0">
                  <h5 className="font-extrabold text-slate-900 text-xs leading-tight truncate">
                    WhatsApp Delivery
                  </h5>
                  <p className="text-[10px] text-slate-500 font-medium leading-tight mt-0.5">
                    Secure & direct
                  </p>
                </div>
              </div>

              {/* Full Warranty */}
              <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200 shadow-2xs flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="min-w-0">
                  <h5 className="font-extrabold text-slate-900 text-xs leading-tight truncate">
                    Full Warranty
                  </h5>
                  <p className="text-[10px] text-slate-500 font-medium leading-tight mt-0.5">
                    Duration covered
                  </p>
                </div>
              </div>

              {/* Secure Payment */}
              <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200 shadow-2xs flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                  <Lock className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="min-w-0">
                  <h5 className="font-extrabold text-slate-900 text-xs leading-tight truncate">
                    Secure Payment
                  </h5>
                  <p className="text-[10px] text-slate-500 font-medium leading-tight mt-0.5">
                    UPI / QR Code
                  </p>
                </div>
              </div>

              {/* WhatsApp Support */}
              <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200 shadow-2xs flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600 shrink-0">
                  <Headphones className="w-4 h-4 text-brand-600" />
                </div>
                <div className="min-w-0">
                  <h5 className="font-extrabold text-slate-900 text-xs leading-tight truncate">
                    WhatsApp Support
                  </h5>
                  <p className="text-[10px] text-slate-500 font-medium leading-tight mt-0.5">
                    We're here to help
                  </p>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
