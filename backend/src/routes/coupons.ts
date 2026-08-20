import { Router } from 'express';
import mongoose from 'mongoose';
import { Coupon } from '../models/Coupon.js';

export const couponsRouter = Router();

const DEFAULT_COUPONS = [
  { code: 'SAVE10', type: 'percentage', value: 10, minOrderValue: 0, isActive: true },
  { code: 'EXTRA10', type: 'percentage', value: 10, minOrderValue: 0, isActive: true },
  { code: 'SUPER50', type: 'flat', value: 50, minOrderValue: 499, isActive: true },
];

// GET /api/coupons - Public active coupons for checkout floating offer banner
couponsRouter.get('/', async (_req, res) => {
  try {
    const isDbConnected = mongoose.connection.readyState === 1;
    if (isDbConnected) {
      const activeCoupons = await Coupon.find({ isActive: true }).select('code type value minOrderValue');
      return res.json({ success: true, coupons: activeCoupons });
    }
    res.json({ success: true, coupons: DEFAULT_COUPONS.filter((c) => c.isActive) });
  } catch (error) {
    res.json({ success: true, coupons: DEFAULT_COUPONS });
  }
});

// POST /api/coupons/validate
couponsRouter.post('/validate', async (req, res) => {
  const { code, subtotal = 0 } = req.body;

  if (!code) {
    return res.status(400).json({ success: false, message: 'Please provide a coupon code' });
  }

  const upper = code.trim().toUpperCase();
  const isDbConnected = mongoose.connection.readyState === 1;

  try {
    let matchedCoupon: any = null;

    if (isDbConnected) {
      matchedCoupon = await Coupon.findOne({ code: upper, isActive: true });
    } else {
      matchedCoupon = DEFAULT_COUPONS.find((c) => c.code === upper && c.isActive);
    }

    if (!matchedCoupon) {
      return res.status(404).json({ success: false, message: 'Invalid or expired coupon code' });
    }

    const minOrder = matchedCoupon.minOrderValue || 0;
    if (minOrder > 0 && subtotal < minOrder) {
      return res.status(400).json({
        success: false,
        message: `Coupon '${upper}' requires a minimum order of ₹${minOrder}`,
      });
    }

    let calculatedDiscount = 0;
    if (matchedCoupon.type === 'percentage') {
      calculatedDiscount = Math.round((subtotal * matchedCoupon.value) / 100);
    } else {
      calculatedDiscount = matchedCoupon.value;
    }

    res.json({
      success: true,
      code: upper,
      discountAmount: calculatedDiscount,
      message: `Coupon '${upper}' applied successfully!`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to validate coupon' });
  }
});
