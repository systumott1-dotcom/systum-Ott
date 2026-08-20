import { Router } from 'express';
import mongoose from 'mongoose';
import { Setting } from '../models/Setting.js';
import { requireAdmin } from '../middleware/auth.js';

export const settingsRouter = Router();

export interface PaymentConfig {
  upiId: string;
  payeeName: string;
  qrMode: 'dynamic' | 'custom';
  customQrUrl?: string;
  updatedAt?: string;
}

export const inMemoryPaymentConfig: PaymentConfig = {
  upiId: process.env.UPI_ID || 'systummott@nyes',
  payeeName: process.env.STORE_NAME || 'Systum OTT India',
  qrMode: 'dynamic',
  customQrUrl: 'https://res.cloudinary.com/juvd58wl/image/upload/v1787206357/systum_ott_assets/systum_ott_official_qr_v2.jpg',
  updatedAt: new Date().toISOString(),
};

// GET /api/settings/payment - Public endpoint for storefront checkout
settingsRouter.get('/payment', async (_req, res) => {
  try {
    const isDbConnected = mongoose.connection.readyState === 1;
    if (isDbConnected) {
      const doc = await Setting.findOne({ key: 'payment_config' });
      if (doc && doc.value) {
        return res.json({ success: true, paymentConfig: doc.value });
      }
    }
    res.json({ success: true, paymentConfig: inMemoryPaymentConfig });
  } catch (error) {
    res.json({ success: true, paymentConfig: inMemoryPaymentConfig });
  }
});

// PUT /api/settings/payment - Admin update endpoint
settingsRouter.put('/payment', requireAdmin, async (req, res) => {
  try {
    const { upiId, payeeName, qrMode, customQrUrl } = req.body;

    if (!upiId || typeof upiId !== 'string') {
      return res.status(400).json({ success: false, message: 'Valid UPI ID is required' });
    }

    const cleanUpi = upiId.trim().toLowerCase();
    const updatedConfig: PaymentConfig = {
      upiId: cleanUpi,
      payeeName: payeeName ? payeeName.trim() : 'Systum OTT India',
      qrMode: qrMode === 'custom' ? 'custom' : 'dynamic',
      customQrUrl: customQrUrl || inMemoryPaymentConfig.customQrUrl,
      updatedAt: new Date().toISOString(),
    };

    const isDbConnected = mongoose.connection.readyState === 1;
    if (isDbConnected) {
      await Setting.findOneAndUpdate(
        { key: 'payment_config' },
        { value: updatedConfig },
        { upsert: true, new: true }
      );
    }

    // Update in-memory copy
    inMemoryPaymentConfig.upiId = updatedConfig.upiId;
    inMemoryPaymentConfig.payeeName = updatedConfig.payeeName;
    inMemoryPaymentConfig.qrMode = updatedConfig.qrMode;
    inMemoryPaymentConfig.customQrUrl = updatedConfig.customQrUrl;
    inMemoryPaymentConfig.updatedAt = updatedConfig.updatedAt;

    res.json({
      success: true,
      message: `UPI ID updated to ${cleanUpi}! QR codes will now generate dynamically for ${cleanUpi}.`,
      paymentConfig: updatedConfig,
    });
  } catch (error) {
    console.error('Update payment settings error:', error);
    res.status(500).json({ success: false, message: 'Failed to update payment settings' });
  }
});
