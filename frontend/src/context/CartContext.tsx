import React, { createContext, useContext, useState, useEffect } from 'react';
import type { CartItem, Product, ProductPlan } from '../types';

export interface AppliedCouponInfo {
  code: string;
  type: 'percentage' | 'flat';
  value: number;
  minOrderValue?: number;
  discountAmount?: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, plan: ProductPlan) => void;
  removeFromCart: (productId: string, planName: string) => void;
  updateQuantity: (productId: string, planName: string, delta: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  discount: number;
  totalAmount: number;
  promoCode: string;
  appliedPromo: string | null;
  appliedCoupon: AppliedCouponInfo | null;
  applyPromoCode: (code: string, customSubtotal?: number) => Promise<{ success: boolean; message?: string; discount?: number }>;
  removePromoCode: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  quickViewProduct: Product | null;
  setQuickViewProduct: (product: Product | null) => void;
  checkoutItem: { product: Product; plan: ProductPlan } | null;
  setCheckoutItem: (item: { product: Product; plan: ProductPlan } | null) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  buyNow: (product: Product, plan: ProductPlan) => void;
  generateWhatsAppOrderUrl: (directItem?: { product: Product; plan: ProductPlan }) => string;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'systum_ott_cart_v1';
export const WHATSAPP_PHONE = '919306022703'; // +91 93060 22703
export const WHATSAPP_COMMUNITY_URL = 'https://chat.whatsapp.com/HHIk5Z1oDJ6H1vC14xcfQP';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCouponInfo | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [checkoutItem, setCheckoutItem] = useState<{ product: Product; plan: ProductPlan } | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [cart]);

  const addToCart = (product: Product, plan: ProductPlan) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.productId === product.id && item.planName === plan.name
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += 1;
        return updated;
      }

      const newItem: CartItem = {
        productId: product.id,
        productTitle: product.title,
        category: product.category,
        planName: plan.name,
        validity: plan.validity,
        price: plan.discountedPrice,
        originalPrice: plan.originalPrice,
        quantity: 1,
        accountType: product.accountType,
      };
      return [...prev, newItem];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string, planName: string) => {
    setCart((prev) => prev.filter((item) => !(item.productId === productId && item.planName === planName)));
  };

  const updateQuantity = (productId: string, planName: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.productId === productId && item.planName === planName) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const clearCart = () => {
    setCart([]);
    setAppliedPromo(null);
    setAppliedCoupon(null);
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  let discount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === 'percentage') {
      discount = Math.round((subtotal * appliedCoupon.value) / 100);
    } else {
      discount = Math.min(subtotal, appliedCoupon.value);
    }
  } else if (appliedPromo === 'EXTRA10' || appliedPromo === 'SAVE10') {
    discount = Math.round(subtotal * 0.1);
  } else if (appliedPromo === 'SUPER50' && subtotal >= 499) {
    discount = 50;
  }

  const totalAmount = Math.max(0, subtotal - discount);

  const applyPromoCode = async (
    code: string,
    customSubtotal?: number
  ): Promise<{ success: boolean; message?: string; discount?: number }> => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) {
      return { success: false, message: 'Please enter a coupon code' };
    }

    const effectiveSubtotal = customSubtotal !== undefined 
      ? customSubtotal 
      : (checkoutItem ? checkoutItem.plan.discountedPrice : subtotal);

    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: trimmed, subtotal: effectiveSubtotal }),
      });
      const data = await res.json();

      if (data.success) {
        const couponInfo: AppliedCouponInfo = {
          code: data.code || trimmed,
          type: data.type || (trimmed === 'SUPER50' ? 'flat' : 'percentage'),
          value: Number(data.value) || 10,
          minOrderValue: Number(data.minOrderValue) || 0,
          discountAmount: data.discountAmount,
        };
        setAppliedPromo(trimmed);
        setAppliedCoupon(couponInfo);
        setPromoCode('');
        return { success: true, discount: data.discountAmount, message: data.message };
      } else {
        return { success: false, message: data.message || 'Invalid or expired coupon code' };
      }
    } catch {
      // Fallback offline validation
      if (trimmed === 'EXTRA10' || trimmed === 'SAVE10' || trimmed.startsWith('SAVE')) {
        const value = trimmed === 'SAVE80' ? 80 : 10;
        const calcDiscount = Math.round((effectiveSubtotal * value) / 100);
        const couponInfo: AppliedCouponInfo = {
          code: trimmed,
          type: 'percentage',
          value,
          minOrderValue: 0,
          discountAmount: calcDiscount,
        };
        setAppliedPromo(trimmed);
        setAppliedCoupon(couponInfo);
        setPromoCode('');
        return { success: true, discount: calcDiscount };
      } else if (trimmed === 'SUPER50') {
        if (effectiveSubtotal < 499) {
          return { success: false, message: "Coupon 'SUPER50' requires a minimum order of ₹499" };
        }
        const couponInfo: AppliedCouponInfo = {
          code: trimmed,
          type: 'flat',
          value: 50,
          minOrderValue: 499,
          discountAmount: 50,
        };
        setAppliedPromo(trimmed);
        setAppliedCoupon(couponInfo);
        setPromoCode('');
        return { success: true, discount: 50 };
      }
      return { success: false, message: 'Invalid or expired coupon code' };
    }
  };

  const removePromoCode = () => {
    setAppliedPromo(null);
    setAppliedCoupon(null);
  };

  const buyNow = (product: Product, plan: ProductPlan) => {
    setCheckoutItem({ product, plan });
    setIsCartOpen(false);
    window.history.pushState({}, '', '/checkout');
    window.dispatchEvent(new PopStateEvent('popstate'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const generateWhatsAppOrderUrl = (directItem?: { product: Product; plan: ProductPlan }) => {
    let message = `*🔥 New Order Request - Systum OTT India*\n\n`;

    if (directItem) {
      message += `*Product:* ${directItem.product.title}\n`;
      message += `*Plan:* ${directItem.plan.name} (${directItem.plan.validity})\n`;
      message += `*Price:* ₹${directItem.plan.discountedPrice}\n`;
      message += `*Type:* ${directItem.product.accountType}\n\n`;
      message += `*Total Amount:* ₹${directItem.plan.discountedPrice}\n\n`;
    } else {
      if (cart.length === 0) return `https://wa.me/${WHATSAPP_PHONE}?text=Hello!+I+want+to+inquire+about+subscriptions.`;
      
      message += `*Items in Order:*\n`;
      cart.forEach((item, index) => {
        message += `${index + 1}. ${item.productTitle} - ${item.planName} (Qty: ${item.quantity}) - ₹${item.price * item.quantity}\n`;
      });
      message += `\n*Subtotal:* ₹${subtotal}\n`;
      if (discount > 0) {
        message += `*Discount (${appliedPromo}):* -₹${discount}\n`;
      }
      message += `*Total Payable:* ₹${totalAmount}\n\n`;
    }

    message += `I want to complete payment and get instant delivery on WhatsApp.`;
    return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        discount,
        totalAmount,
        promoCode,
        appliedPromo,
        appliedCoupon,
        applyPromoCode,
        removePromoCode,
        isCartOpen,
        setIsCartOpen,
        quickViewProduct,
        setQuickViewProduct,
        checkoutItem,
        setCheckoutItem,
        isCheckoutOpen,
        setIsCheckoutOpen,
        buyNow,
        generateWhatsAppOrderUrl,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
