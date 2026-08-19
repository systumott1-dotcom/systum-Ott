import { Router } from 'express';

export const couponsRouter = Router();

const VALID_COUPONS: Record<string, { discountPercent?: number; flatDiscount?: number; minOrder?: number }> = {
  EXTRA10: { discountPercent: 10 },
  SAVE10: { discountPercent: 10 },
  SUPER50: { flatDiscount: 50, minOrder: 500 },
};

couponsRouter.post('/validate', (req, res) => {
  const { code, subtotal = 0 } = req.body;

  if (!code) {
    return res.status(400).json({ success: false, message: 'Please provide a coupon code' });
  }

  const upper = code.trim().toUpperCase();
  const coupon = VALID_COUPONS[upper];

  if (!coupon) {
    return res.status(404).json({ success: false, message: 'Invalid coupon code' });
  }

  if (coupon.minOrder && subtotal < coupon.minOrder) {
    return res.status(400).json({
      success: false,
      message: `Coupon '${upper}' requires a minimum order of ₹${coupon.minOrder}`,
    });
  }

  let calculatedDiscount = 0;
  if (coupon.discountPercent) {
    calculatedDiscount = Math.round((subtotal * coupon.discountPercent) / 100);
  } else if (coupon.flatDiscount) {
    calculatedDiscount = coupon.flatDiscount;
  }

  res.json({
    success: true,
    code: upper,
    discountAmount: calculatedDiscount,
    message: `Coupon '${upper}' applied successfully!`,
  });
});
