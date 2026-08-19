import React, { createContext, useContext, useState, useEffect } from 'react';
import type { CartItem, Product, ProductPlan } from '../types';

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
  applyPromoCode: (code: string) => boolean;
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
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [checkoutItem, setCheckoutItem] = useState<{ product: Product; plan: ProductPlan } | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
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
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  let discount = 0;
  if (appliedPromo === 'EXTRA10' || appliedPromo === 'SAVE10') {
    discount = Math.round(subtotal * 0.1);
  } else if (appliedPromo === 'SUPER50' && subtotal >= 500) {
    discount = 50;
  }

  const totalAmount = Math.max(0, subtotal - discount);

  const applyPromoCode = (code: string): boolean => {
    const trimmed = code.trim().toUpperCase();
    if (trimmed === 'EXTRA10' || trimmed === 'SAVE10' || trimmed === 'SUPER50') {
      setAppliedPromo(trimmed);
      setPromoCode('');
      return true;
    }
    return false;
  };

  const removePromoCode = () => {
    setAppliedPromo(null);
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
      message += `*Final Payable Amount:* ₹${totalAmount}\n\n`;
    }

    message += `Please provide UPI payment details / QR code to complete my order. Thank you!`;

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
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
