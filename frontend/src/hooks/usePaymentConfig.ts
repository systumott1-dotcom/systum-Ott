import { useState, useEffect, useCallback } from 'react';

export interface PaymentConfig {
  upiId: string;
  payeeName: string;
  qrMode: 'dynamic' | 'custom';
  customQrUrl?: string;
  updatedAt?: string;
}

export const DEFAULT_PAYMENT_CONFIG: PaymentConfig = {
  upiId: 'systummott@nyes',
  payeeName: 'Systum OTT India',
  qrMode: 'dynamic',
  customQrUrl: 'https://res.cloudinary.com/juvd58wl/image/upload/v1787206357/systum_ott_assets/systum_ott_official_qr_v2.jpg',
};

export function usePaymentConfig() {
  const [config, setConfig] = useState<PaymentConfig>(DEFAULT_PAYMENT_CONFIG);
  const [loading, setLoading] = useState(true);

  const fetchConfig = useCallback(async () => {
    try {
      const res = await fetch('/api/settings/payment');
      const data = await res.json();
      if (data.success && data.paymentConfig?.upiId) {
        setConfig(data.paymentConfig);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  /**
   * Generates dynamic high-res UPI QR Code url with amount pre-filled
   */
  const getDynamicQrUrl = useCallback(
    (amount: number, overrideUpiId?: string, overridePayee?: string) => {
      const activeUpi = (overrideUpiId || config.upiId || 'systummott@nyes').trim().toLowerCase();
      const activePayee = (overridePayee || config.payeeName || 'Systum OTT India').trim();
      const upiUri = `upi://pay?pa=${activeUpi}&pn=${encodeURIComponent(activePayee)}&am=${amount}&cu=INR&tn=Subscription%20Order`;
      return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=10&data=${encodeURIComponent(upiUri)}`;
    },
    [config.upiId, config.payeeName]
  );

  /**
   * Generates deep-link intent for mobile UPI apps
   */
  const getUpiPayUrl = useCallback(
    (amount: number, overrideUpiId?: string, overridePayee?: string) => {
      const activeUpi = (overrideUpiId || config.upiId || 'systummott@nyes').trim().toLowerCase();
      const activePayee = (overridePayee || config.payeeName || 'Systum OTT India').trim();
      return `upi://pay?pa=${activeUpi}&pn=${encodeURIComponent(activePayee)}&am=${amount}&cu=INR&tn=Subscription%20Order`;
    },
    [config.upiId, config.payeeName]
  );

  return {
    paymentConfig: config,
    loading,
    refreshPaymentConfig: fetchConfig,
    getDynamicQrUrl,
    getUpiPayUrl,
  };
}
