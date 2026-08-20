import React, { useState, useEffect } from 'react';
import { useCart, WHATSAPP_PHONE } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { WhatsAppIcon } from '../components/WhatsAppIcon';
import confetti from 'canvas-confetti';
import { 
  ArrowLeft, 
  ShieldCheck, 
  Copy, 
  Check, 
  Zap, 
  CheckCircle2, 
  ShoppingBag, 
  User, 
  Users, 
  ExternalLink, 
  PhoneCall, 
  Camera, 
  Upload, 
  Tag, 
  Gift, 
  X, 
  ChevronRight, 
  ArrowRight, 
  Loader2, 
  AlertCircle 
} from 'lucide-react';

interface CheckoutPageProps {
  onBackToStore: () => void;
}

interface ActiveCoupon {
  code: string;
  type: 'percentage' | 'flat';
  value: number;
  minOrderValue?: number;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ onBackToStore }) => {
  const toast = useToast();
  const {
    cart,
    checkoutItem,
    subtotal,
    discount,
    appliedPromo,
    appliedCoupon,
    applyPromoCode,
    removePromoCode,
    clearCart,
  } = useCart();

  // Multi-step state: 'checkout' (Step 1: Info & Cart) -> 'payment' (Step 2: UPI & Screenshot) -> 'success'
  const [currentStep, setCurrentStep] = useState<'checkout' | 'payment' | 'success'>('checkout');

  // Customer Form State
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [paymentScreenshot, setPaymentScreenshot] = useState<string>('');
  const [screenshotPreview, setScreenshotPreview] = useState<string>('');
  const [screenshotError, setScreenshotError] = useState<string>('');
  const [couponInput, setCouponInput] = useState('');
  const [copiedUPI, setCopiedUPI] = useState(false);
  const [copiedReceipt, setCopiedReceipt] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Active coupons for floating offer tray
  const [activeCoupons, setActiveCoupons] = useState<ActiveCoupon[]>([]);
  const [isOfferTrayOpen, setIsOfferTrayOpen] = useState(false);

  // Fetch active coupons on mount
  useEffect(() => {
    fetch('/api/coupons')
      .then((r) => r.json())
      .then((d) => {
        if (d.success && Array.isArray(d.coupons)) {
          setActiveCoupons(d.coupons);
        }
      })
      .catch(() => {
        setActiveCoupons([
          { code: 'SAVE10', type: 'percentage', value: 10, minOrderValue: 0 },
          { code: 'EXTRA10', type: 'percentage', value: 10, minOrderValue: 0 },
          { code: 'SUPER50', type: 'flat', value: 50, minOrderValue: 499 },
        ]);
      });
  }, []);

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
  const rawSubtotal = isDirectBuy ? checkoutItem.plan.discountedPrice : subtotal;

  let calculatedDiscount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === 'percentage') {
      calculatedDiscount = Math.round((rawSubtotal * appliedCoupon.value) / 100);
    } else {
      calculatedDiscount = Math.min(rawSubtotal, appliedCoupon.value);
    }
  } else {
    calculatedDiscount = discount;
  }

  const finalAmount = Math.max(0, rawSubtotal - calculatedDiscount);
  const upiId = 'systummott@nyes';
  const officialQrImageUrl = 'https://res.cloudinary.com/juvd58wl/image/upload/v1787203998/systum_ott_assets/systum_ott_official_qr.jpg';
  const localFallbackQrUrl = '/images/systum_ott_official_qr.jpg';
  const upiPayUrl = `upi://pay?pa=${upiId}&pn=Systum%20OTT%20India&am=${finalAmount}&cu=INR&tn=Order%20Subscription`;

  const items = isDirectBuy
    ? [
        {
          title: checkoutItem.product.title,
          category: checkoutItem.product.category,
          plan: checkoutItem.plan.name,
          validity: checkoutItem.plan.validity,
          price: checkoutItem.plan.discountedPrice,
          originalPrice: checkoutItem.plan.originalPrice,
          quantity: 1,
          accountType: checkoutItem.product.accountType,
          imageUrl: checkoutItem.product.imageUrl,
          features: checkoutItem.product.features,
          warrantyType: checkoutItem.product.warrantyType || 'Full-Term Replacement Warranty',
          warrantyDays: checkoutItem.product.warrantyDays,
        },
      ]
    : cart.map((item) => ({
        title: item.productTitle,
        category: item.category,
        plan: item.planName,
        validity: item.validity,
        price: item.price,
        originalPrice: item.originalPrice,
        quantity: item.quantity,
        accountType: item.accountType,
        imageUrl: undefined,
        features: ['Instant WhatsApp Dispatch', 'PIN Security', 'Replacement Warranty'],
        warrantyType: 'Full-Term Replacement Warranty',
        warrantyDays: 30,
      }));

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      setScreenshotError('Screenshot size must be under 8MB');
      toast.error('File too large. Please upload an image under 8MB.');
      return;
    }

    setScreenshotError('');
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setPaymentScreenshot(base64);
      setScreenshotPreview(base64);
      toast.success('Payment screenshot uploaded! 📸');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveScreenshot = () => {
    setPaymentScreenshot('');
    setScreenshotPreview('');
  };

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

  const handleApplyCoupon = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!couponInput.trim()) return;
    const res = await applyPromoCode(couponInput, rawSubtotal);
    if (res.success) {
      toast.success(res.message || `Coupon ${couponInput.toUpperCase()} applied! Saved ₹${res.discount || calculatedDiscount} 🎉`);
      setCouponInput('');
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    } else {
      toast.error(res.message || 'Invalid or expired coupon code.');
    }
  };

  const handleApplyQuickCoupon = async (code: string) => {
    const res = await applyPromoCode(code, rawSubtotal);
    if (res.success) {
      toast.success(res.message || `Coupon ${code} applied successfully! Saved ₹${res.discount || calculatedDiscount} 🎉`);
      setIsOfferTrayOpen(false);
      confetti({ particleCount: 70, spread: 70, origin: { y: 0.7 } });
    } else {
      toast.error(res.message || `Could not apply coupon ${code}. Check minimum order requirement.`);
    }
  };

  // Step 1 Validation -> Move to Payment
  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.warning('Please enter your full name.');
      return;
    }
    if (!whatsapp.trim() || whatsapp.trim().length < 10) {
      toast.warning('Please enter a valid 10-digit WhatsApp phone number.');
      return;
    }
    setCurrentStep('payment');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Step 2 Submission -> Process Order & Verification
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!paymentScreenshot) {
      setScreenshotError('Payment screenshot is mandatory. Please upload a screenshot of your UPI payment.');
      toast.error('Please upload your payment screenshot before confirming your order.');
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
          paymentScreenshot,
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

      setCurrentStep('success');
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
      setCurrentStep('success');
    } finally {
      setIsSubmitting(false);
    }
  };

  // SUCCESS STEP VIEW
  if (currentStep === 'success' && orderSuccess) {
    const productListStr = orderSuccess.items
      .map((i) => `${i.title} (${i.plan}) x ${i.quantity}`)
      .join(', ');

    const formattedReceiptText = `*🎉 ORDER DETAILS #${orderSuccess.id}*
Name: ${orderSuccess.name}
📨 Email / Number: ${orderSuccess.email ? `${orderSuccess.email} / ` : ''}+91 ${orderSuccess.whatsapp}
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
              <CheckCircle2 className="w-3.5 h-3.5" /> Order Placed Successfully
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
            className="w-full py-4 px-5 rounded-2xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
          >
            <WhatsAppIcon className="w-5 h-5 fill-white" />
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
                {copiedPhone ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
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

  // If no items in cart
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
    <div className="min-h-screen bg-slate-50/60 pb-20 relative">
      
      {/* Top Header & Breadcrumb Progress */}
      <div className="bg-white border-b border-slate-200 sticky top-20 z-20 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <button
            onClick={currentStep === 'payment' ? () => setCurrentStep('checkout') : onBackToStore}
            className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-brand-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{currentStep === 'payment' ? 'Back to Customer Details' : 'Back to Store'}</span>
          </button>

          {/* Clean 2-Step Progress Indicator */}
          <div className="flex items-center gap-2 text-xs font-bold">
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition-all ${
              currentStep === 'checkout'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            }`}>
              <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px]">1</span>
              <span>Order Details</span>
            </div>

            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />

            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition-all ${
              currentStep === 'payment'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-400'
            }`}>
              <span className="w-4 h-4 rounded-full bg-black/10 flex items-center justify-center text-[10px]">2</span>
              <span>UPI Payment & Proof</span>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-2 text-xs text-slate-500 font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Instant WhatsApp Delivery Guaranteed</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* ================= STEP 1: CHECKOUT & CUSTOMER DETAILS ================= */}
        {currentStep === 'checkout' && (
          <div>
            <div className="mb-8">
              <span className="inline-flex items-center gap-1 text-xs font-extrabold uppercase tracking-wider text-brand-700 bg-brand-50 px-3 py-1 rounded-full border border-brand-200 mb-2">
                <Zap className="w-3.5 h-3.5 text-brand-600" /> Step 1 of 2: Details & Review
              </span>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Review Order & <span className="gradient-text">Customer Details</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Enter your WhatsApp number to receive your instant digital subscription credentials.
              </p>
            </div>

            <form onSubmit={handleProceedToPayment} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Customer Form (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Customer Details Box */}
                <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-5">
                  <div className="flex items-center gap-2 text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-3">
                    <User className="w-4 h-4 text-brand-600" />
                    <span>WhatsApp Delivery & Contact Info</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1.5">
                        Full Name *
                      </label>
                      <input
                        required
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Rahul Sharma"
                        className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center justify-between">
                        <span>WhatsApp Number *</span>
                        <span className="text-[10px] text-emerald-600 font-extrabold">Instant Delivery</span>
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-xs font-bold text-slate-500">
                          +91
                        </span>
                        <input
                          required
                          type="tel"
                          value={whatsapp}
                          onChange={(e) => setWhatsapp(e.target.value.replace(/\D/g, '').slice(0, 10))}
                          placeholder="98765 43210"
                          className="w-full pl-12 pr-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
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
                      placeholder="e.g. rahul@gmail.com"
                      className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                    />
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      We'll dispatch your backup credentials & receipt here as well.
                    </span>
                  </div>
                </div>

                {/* Trust & Guarantee Highlights */}
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                      <Zap className="w-5 h-5" />
                    </div>
                    <div>
                      <strong className="text-xs font-extrabold text-slate-900 block">Instant Activation</strong>
                      <span className="text-[10px] text-slate-500">Delivered within 5–15 mins</span>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600 shrink-0">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <strong className="text-xs font-extrabold text-slate-900 block">Full Replacement</strong>
                      <span className="text-[10px] text-slate-500">100% Term Warranty</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Right Column: Order Summary & Coupon (5 cols) */}
              <div className="lg:col-span-5 space-y-6">
                
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
                  <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
                    <span>Order Summary</span>
                    <span className="text-xs font-bold text-slate-500">{items.length} {items.length === 1 ? 'Subscription' : 'Subscriptions'}</span>
                  </h3>

                  {/* Items List */}
                  <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                    {items.map((item, idx) => (
                      <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <h4 className="font-extrabold text-xs text-slate-900 truncate">{item.title}</h4>
                          <span className="text-[11px] text-slate-500 font-medium">{item.plan} ({item.validity})</span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-black text-xs text-slate-900">₹{item.price * item.quantity}</span>
                          {item.originalPrice > item.price && (
                            <span className="text-[10px] text-slate-400 line-through block">₹{item.originalPrice * item.quantity}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Coupon Application Box */}
                  <div className="pt-2">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={couponInput}
                          onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                          placeholder="Coupon Code (e.g. SAVE10)"
                          className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold uppercase focus:outline-none focus:bg-white focus:border-brand-500"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleApplyCoupon()}
                        className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-extrabold shadow-sm transition-all"
                      >
                        Apply
                      </button>
                    </div>

                    {appliedPromo && (
                      <div className="flex items-center justify-between mt-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-bold">
                        <span className="flex items-center gap-1.5">
                          <Tag className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Code '{appliedPromo}' applied (-₹{calculatedDiscount})</span>
                        </span>
                        <button type="button" onClick={removePromoCode} className="text-rose-500 hover:text-rose-700 text-xs">
                          Remove
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Price Calculations */}
                  <div className="space-y-2 pt-3 border-t border-slate-100 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Subtotal</span>
                      <span className="font-bold">₹{rawSubtotal}</span>
                    </div>
                    {calculatedDiscount > 0 && (
                      <div className="flex justify-between text-emerald-600 font-bold">
                        <span>Coupon Discount</span>
                        <span>-₹{calculatedDiscount}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-200">
                      <span>Payable Amount</span>
                      <span className="text-brand-700 text-xl font-black">₹{finalAmount}</span>
                    </div>
                  </div>

                  {/* Proceed to Payment CTA */}
                  <button
                    type="submit"
                    className="w-full py-4 px-6 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-extrabold text-sm shadow-lg shadow-brand-600/25 transition-all flex items-center justify-center gap-2 group cursor-pointer"
                  >
                    <span>Proceed to UPI Payment (₹{finalAmount})</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>

              </div>

            </form>
          </div>
        )}

        {/* ================= STEP 2: DEDICATED UPI PAYMENT & PROOF PAGE ================= */}
        {currentStep === 'payment' && (
          <div>
            <div className="mb-8">
              <span className="inline-flex items-center gap-1 text-xs font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 mb-2">
                <Zap className="w-3.5 h-3.5 text-emerald-600" /> Step 2 of 2: UPI Payment & Proof
              </span>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Scan UPI QR & <span className="gradient-text">Upload Payment Proof</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Scan QR or pay to UPI ID <strong className="font-mono text-slate-800">{upiId}</strong>, then upload screenshot proof.
              </p>
            </div>

            {/* Customer Summary Bar */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600 font-extrabold text-sm">
                  {name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-extrabold text-slate-900">
                    {name} <span className="text-slate-400 font-normal">·</span> +91 {whatsapp}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Paying <strong className="text-brand-700 font-extrabold">₹{finalAmount}</strong> for {items.length} subscription plan(s)
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setCurrentStep('checkout')}
                className="text-xs font-bold text-brand-600 hover:text-brand-700 hover:underline self-start sm:self-center"
              >
                Edit Contact Details
              </button>
            </div>

            <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: QR Code & UPI Apps (6 cols) */}
              <div className="lg:col-span-6 space-y-6">
                
                <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-amber-500" />
                      <span>Scan QR Code to Pay</span>
                    </span>
                    <span className="text-xs font-black text-brand-700 bg-brand-50 px-2.5 py-1 rounded-lg border border-brand-200">
                      ₹{finalAmount} Payable
                    </span>
                  </div>

                  {/* QR Code Container */}
                  <div className="text-center space-y-3">
                    <div className="p-2 sm:p-3 bg-slate-950 rounded-2xl border-2 border-slate-900 shadow-xl inline-block relative group max-w-[280px] sm:max-w-[320px]">
                      <img
                        src={officialQrImageUrl}
                        onError={(e) => {
                          e.currentTarget.src = localFallbackQrUrl;
                        }}
                        alt="Systum OTT Official UPI QR Code"
                        className="w-full h-auto object-contain mx-auto rounded-xl shadow-md"
                      />
                    </div>
                    <span className="text-xs text-slate-500 font-bold block">
                      Scan via GPay, PhonePe, Paytm, BHIM or any UPI app
                    </span>
                  </div>

                  {/* UPI ID & Copy Box */}
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2">
                    <span className="text-[11px] font-bold text-slate-500 block">Direct UPI ID:</span>
                    <div className="flex items-center justify-between bg-white px-3.5 py-2.5 rounded-xl border border-slate-200">
                      <span className="text-xs sm:text-sm font-mono font-black text-slate-900">{upiId}</span>
                      <button
                        type="button"
                        onClick={handleCopyUPI}
                        className="px-3 py-1 rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 text-xs font-extrabold flex items-center gap-1 transition-colors"
                      >
                        {copiedUPI ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedUPI ? 'Copied!' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Mobile Quick Pay Links */}
                  <div className="space-y-2 pt-2">
                    <span className="text-xs font-bold text-slate-700 block">Quick Open in UPI App:</span>
                    <div className="grid grid-cols-2 gap-2">
                      <a
                        href={upiPayUrl}
                        className="py-2.5 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-brand-600" /> Google Pay / PhonePe
                      </a>
                      <a
                        href={upiPayUrl}
                        className="py-2.5 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-blue-600" /> Paytm / BHIM
                      </a>
                    </div>
                  </div>
                </div>

              </div>

              {/* Right Column: Screenshot Proof & Final Confirm (6 cols) */}
              <div className="lg:col-span-6 space-y-6">
                
                <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-5">
                  <div className="flex items-center gap-2 text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-3">
                    <Camera className="w-4 h-4 text-emerald-600" />
                    <span>Upload Payment Proof (Mandatory)</span>
                  </div>

                  {/* Payment Screenshot Dropzone */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                      <span>Payment Screenshot / Receipt *</span>
                      <span className="text-[10px] text-rose-500 font-bold">Required for instant verification</span>
                    </label>

                    {!screenshotPreview ? (
                      <label className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                        screenshotError 
                          ? 'border-rose-400 bg-rose-50/40 text-rose-700' 
                          : 'border-slate-300 hover:border-brand-500 bg-slate-50 hover:bg-brand-50/20 text-slate-600'
                      }`}>
                        <div className="w-12 h-12 rounded-2xl bg-white shadow-xs border border-slate-200 flex items-center justify-center text-brand-600">
                          <Upload className="w-6 h-6" />
                        </div>
                        <div className="text-center">
                          <span className="text-xs font-extrabold text-slate-800 block">
                            Click to upload screenshot proof
                          </span>
                          <span className="text-[10px] text-slate-400">
                            PNG, JPG, JPEG up to 8MB
                          </span>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleScreenshotChange}
                          className="hidden"
                        />
                      </label>
                    ) : (
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                        <div className="relative rounded-xl overflow-hidden border border-slate-200 max-h-56 bg-slate-900 flex items-center justify-center">
                          <img
                            src={screenshotPreview}
                            alt="Payment Proof"
                            className="max-h-56 w-auto object-contain"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Screenshot Attached
                          </span>
                          <button
                            type="button"
                            onClick={handleRemoveScreenshot}
                            className="text-xs text-rose-600 hover:text-rose-700 font-bold hover:underline"
                          >
                            Remove / Replace
                          </button>
                        </div>
                      </div>
                    )}

                    {screenshotError && (
                      <p className="text-xs text-rose-600 font-bold flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>{screenshotError}</span>
                      </p>
                    )}
                  </div>

                  {/* Place Order CTA */}
                  <div className="pt-3 border-t border-slate-100 space-y-3">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm sm:text-base shadow-xl shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Verifying & Recording Order...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-5 h-5 stroke-[2.5]" />
                          <span>Confirm Payment & Place Order (₹{finalAmount})</span>
                        </>
                      )}
                    </button>

                    <p className="text-[11px] text-center text-slate-400 font-medium">
                      🔒 256-Bit Encrypted & Protected by 100% Term Replacement Warranty
                    </p>
                  </div>

                </div>

              </div>

            </form>
          </div>
        )}

      </div>

      {/* ================= FLOATING ACTIVE OFFERS BUTTON (LEFT SIDE TO AVOID WHATSAPP OVERLAP) ================= */}
      {activeCoupons.length > 0 && currentStep !== 'success' && (
        <div className="fixed bottom-6 left-4 sm:left-8 z-30">
          <button
            type="button"
            onClick={() => setIsOfferTrayOpen(true)}
            className="group px-4 py-3 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 text-white rounded-2xl shadow-xl shadow-orange-500/30 flex items-center gap-2.5 text-xs font-extrabold transition-all hover:scale-105 active:scale-95 animate-bounce cursor-pointer"
          >
            <Gift className="w-4 h-4 text-amber-200" />
            <span className="hidden sm:inline">Active Offers & Coupons</span>
            <span className="sm:hidden">Offers</span>
            <span className="bg-black/25 px-2 py-0.5 rounded-full text-[10px] font-black">
              {activeCoupons.length}
            </span>
          </button>
        </div>
      )}

      {/* ================= ACTIVE OFFERS SLIDE-OVER MODAL ================= */}
      {isOfferTrayOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setIsOfferTrayOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 border border-slate-200 shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600">
                  <Gift className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Available Special Offers</h3>
                  <p className="text-[11px] text-slate-500 font-medium">1-Click apply directly to your cart</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOfferTrayOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Coupons List */}
            <div className="space-y-3">
              {activeCoupons.map((coupon) => (
                <div
                  key={coupon.code}
                  className="p-4 rounded-2xl bg-gradient-to-r from-amber-50/50 to-orange-50/50 border border-orange-200 flex items-center justify-between gap-3 group hover:border-orange-300 transition-all"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-sm text-brand-700 bg-white px-2 py-0.5 rounded-lg border border-orange-200">
                        {coupon.code}
                      </span>
                      <span className="text-[11px] font-black text-orange-600">
                        {coupon.type === 'percentage' ? `${coupon.value}% OFF` : `₹${coupon.value} FLAT OFF`}
                      </span>
                    </div>
                    {coupon.minOrderValue && coupon.minOrderValue > 0 ? (
                      <p className="text-[10px] text-slate-500 font-semibold mt-1">
                        Valid on orders above ₹{coupon.minOrderValue}
                      </p>
                    ) : (
                      <p className="text-[10px] text-slate-500 font-semibold mt-1">
                        Valid on all subscription plans
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleApplyQuickCoupon(coupon.code)}
                    className="px-3.5 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-extrabold shadow-xs transition-all shrink-0"
                  >
                    Apply
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setIsOfferTrayOpen(false)}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
            >
              Close Offers
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
