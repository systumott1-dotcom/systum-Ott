import { Router } from 'express';
import mongoose from 'mongoose';
import { Order } from '../models/Order.js';
import { uploadImageToCloudinary } from '../services/cloudinary.js';

export const ordersRouter = Router();

// In-memory store for fallback
interface LocalOrder {
  id: string;
  name: string;
  whatsapp: string;
  email?: string;
  items: Array<{
    productId?: string;
    productTitle?: string;
    title?: string;
    plan?: string;
    planName?: string;
    validity?: string;
    price: number;
    quantity: number;
  }>;
  totalAmount: number;
  purchaseDate: string;
  expiryDate: string;
  warrantyType?: string;
  utrNumber?: string;
  paymentScreenshotUrl?: string;
  status: 'PENDING_VERIFICATION' | 'DELIVERED' | 'CANCELLED';
  deliveryCredentials?: string;
  createdAt: string;
}

const inMemoryOrders: LocalOrder[] = [];

// Helper: Calculate exact Expiry Date according to Purchase Date and Validity
export const calculateExpiryDate = (
  purchaseDate: Date,
  validityStr?: string
): { expiryDate: string; expiryTimestamp: number; validityDays: number } => {
  let days = 30; // default 30 days
  const v = (validityStr || '').toLowerCase().trim();

  if (v.includes('lifetime') || v.includes('permanent')) {
    return {
      expiryDate: 'Lifetime Access',
      expiryTimestamp: purchaseDate.getTime() + 100 * 365 * 24 * 60 * 60 * 1000,
      validityDays: 36500,
    };
  }

  const matchDays = v.match(/(\d+)\s*(day|days|d)/);
  const matchMonths = v.match(/(\d+)\s*(month|months|mo|m)/);
  const matchYears = v.match(/(\d+)\s*(year|years|yr|y)/);

  if (matchDays) {
    days = parseInt(matchDays[1], 10);
  } else if (matchMonths) {
    days = parseInt(matchMonths[1], 10) * 30;
  } else if (matchYears) {
    days = parseInt(matchYears[1], 10) * 365;
  } else if (v.includes('1 month') || v.includes('1month') || v === 'monthly') {
    days = 30;
  } else if (v.includes('3 month') || v.includes('3month') || v === 'quarterly') {
    days = 90;
  } else if (v.includes('6 month') || v.includes('6month') || v === 'half-yearly') {
    days = 180;
  } else if (v.includes('1 year') || v.includes('12 month') || v === 'yearly' || v === 'annual') {
    days = 365;
  }

  const expiry = new Date(purchaseDate.getTime() + days * 24 * 60 * 60 * 1000);
  const expiryDate = expiry.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return {
    expiryDate,
    expiryTimestamp: expiry.getTime(),
    validityDays: days,
  };
};

// Helper: Generate a guaranteed unique purely numeric Order ID (e.g. 5-6 digits like 48592)
const generateUniqueNumericOrderId = async (): Promise<string> => {
  const isDbConnected = mongoose.connection.readyState === 1;

  for (let attempt = 0; attempt < 15; attempt++) {
    const candidate = Math.floor(10000 + Math.random() * 90000).toString();

    if (isDbConnected) {
      const exists = await Order.findOne({ id: candidate });
      if (!exists) return candidate;
    } else {
      const exists = inMemoryOrders.some((o) => o.id === candidate);
      if (!exists) return candidate;
    }
  }

  return Math.floor(100000 + Math.random() * 900000).toString();
};

// POST /api/orders - create new customer order
ordersRouter.post('/', async (req, res) => {
  const { 
    name, 
    whatsapp, 
    email, 
    items, 
    totalAmount, 
    utrNumber, 
    paymentScreenshot, 
    paymentScreenshotUrl, 
    deliveryPreference, 
    warrantyType 
  } = req.body;

  if (!name || !whatsapp || !items || !totalAmount) {
    return res.status(400).json({
      success: false,
      message: 'Missing required order fields (name, whatsapp, items, totalAmount)',
    });
  }

  // Payment screenshot is mandatory
  const rawScreenshot = paymentScreenshot || paymentScreenshotUrl;
  if (!rawScreenshot) {
    return res.status(400).json({
      success: false,
      message: 'Payment screenshot is mandatory. Please upload a screenshot of your completed UPI payment.',
    });
  }

  try {
    const orderId = await generateUniqueNumericOrderId();
    const now = new Date();
    const purchaseDate = now.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    // Upload screenshot to Cloudinary if it's base64 data
    let uploadedScreenshotUrl = rawScreenshot;
    if (typeof rawScreenshot === 'string' && rawScreenshot.startsWith('data:image')) {
      try {
        uploadedScreenshotUrl = await uploadImageToCloudinary(rawScreenshot, 'systum_ott_payment_screenshots');
      } catch {
        uploadedScreenshotUrl = rawScreenshot;
      }
    }

    // Calculate expiry from primary item's validity
    const firstItemValidity = items[0]?.validity || items[0]?.plan || '30 Days';
    const { expiryDate, validityDays } = calculateExpiryDate(now, firstItemValidity);

    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      const newOrder = await Order.create({
        id: orderId,
        customerName: name,
        customerPhone: whatsapp,
        customerEmail: email,
        items: items.map((item: any) => ({
          productId: item.productId || `prod-${Date.now()}`,
          productTitle: item.productTitle || item.title,
          planName: item.planName || item.plan,
          validity: item.validity || '30 Days',
          price: item.price,
          quantity: item.quantity || 1,
        })),
        totalAmount,
        utrNumber,
        paymentScreenshotUrl: uploadedScreenshotUrl,
        paymentMethod: 'UPI',
        status: 'PENDING_VERIFICATION',
        purchaseDate,
        expiryDate,
        warrantyType: warrantyType || 'Full-Term Replacement',
        warrantyDays: validityDays,
        deliveryNotes: `Preference: ${deliveryPreference || 'whatsapp'}`,
      });

      return res.status(201).json({
        success: true,
        message: 'Order recorded successfully.',
        order: { id: newOrder.id, ...newOrder.toObject(), purchaseDate, expiryDate, paymentScreenshotUrl: uploadedScreenshotUrl },
      });
    }

    // In-memory fallback
    const newOrder: LocalOrder = {
      id: orderId,
      name,
      whatsapp,
      email,
      items: items.map((item: any) => ({
        productTitle: item.productTitle || item.title,
        planName: item.planName || item.plan,
        validity: item.validity || '30 Days',
        price: item.price,
        quantity: item.quantity || 1,
      })),
      totalAmount,
      purchaseDate,
      expiryDate,
      warrantyType: warrantyType || 'Full-Term Replacement',
      utrNumber,
      paymentScreenshotUrl: uploadedScreenshotUrl,
      status: 'PENDING_VERIFICATION',
      createdAt: now.toISOString(),
    };

    inMemoryOrders.push(newOrder);

    res.status(201).json({
      success: true,
      message: 'Order recorded successfully.',
      order: newOrder,
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ success: false, message: 'Failed to record order' });
  }
});

// GET /api/orders/user/:phoneOrEmail - customer order history lookup
ordersRouter.get('/user/:phoneOrEmail', async (req, res) => {
  try {
    const raw = decodeURIComponent(req.params.phoneOrEmail).trim();
    const cleanPhone = raw.replace(/\D/g, '').slice(-10); // last 10 digits
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      const orders = await Order.find({
        $or: [
          { customerPhone: { $regex: cleanPhone, $options: 'i' } },
          { customerEmail: { $regex: raw, $options: 'i' } },
          { id: raw.replace(/^#/, '') },
        ],
      }).sort({ createdAt: -1 });

      return res.json({ success: true, count: orders.length, orders });
    }

    const matched = inMemoryOrders.filter((o) => {
      const p = o.whatsapp.replace(/\D/g, '').slice(-10);
      return p === cleanPhone || o.email?.toLowerCase() === raw.toLowerCase() || o.id === raw.replace(/^#/, '');
    });

    res.json({ success: true, count: matched.length, orders: matched });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch customer orders' });
  }
});

// GET /api/orders/recent-activity - public recent purchases feed with real-time timestamps
ordersRouter.get('/recent-activity', async (_req, res) => {
  try {
    const isDbConnected = mongoose.connection.readyState === 1;
    let rawOrders: any[] = [];

    if (isDbConnected) {
      rawOrders = await Order.find()
        .sort({ createdAt: -1 })
        .limit(15)
        .select('customerName items createdAt totalAmount')
        .lean();
    } else {
      rawOrders = inMemoryOrders.slice(-15).reverse();
    }

    const realOrders = rawOrders
      .filter((o) => o.items && o.items.length > 0)
      .map((o) => {
        const fullName = o.customerName || o.name || 'Customer';
        const firstName = fullName.split(' ')[0];
        const item = o.items?.[0] || {};
        return {
          id: o.id || o._id?.toString() || Math.random().toString(),
          name: firstName,
          product: item.productTitle || item.title || 'Subscription Access',
          plan: item.planName || item.plan || item.validity || '30 Days',
          timestamp: new Date(o.createdAt || Date.now()).getTime(),
        };
      });

    res.json({
      success: true,
      orders: realOrders,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to load activity' });
  }
});

// GET /api/orders/:id - retrieve order by numeric ID
ordersRouter.get('/:id', async (req, res) => {
  try {
    const isDbConnected = mongoose.connection.readyState === 1;
    if (isDbConnected) {
      const order = await Order.findOne({ id: req.params.id });
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }
      return res.json({ success: true, data: order, order });
    }

    const order = inMemoryOrders.find((o) => o.id === req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.json({ success: true, data: order, order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch order' });
  }
});
