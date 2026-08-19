import { Router } from 'express';
import mongoose from 'mongoose';
import { Order } from '../models/Order.js';

export const ordersRouter = Router();

// In-memory store for fallback
interface LocalOrder {
  id: string;
  name: string;
  whatsapp: string;
  email?: string;
  items: Array<{
    title: string;
    plan: string;
    validity?: string;
    price: number;
    quantity: number;
  }>;
  totalAmount: number;
  utrNumber?: string;
  status: 'PENDING_VERIFICATION' | 'DELIVERED' | 'CANCELLED';
  createdAt: string;
}

const inMemoryOrders: LocalOrder[] = [];

// Helper: Generate a guaranteed unique purely numeric Order ID (e.g. 5-6 digits like 48592)
const generateUniqueNumericOrderId = async (): Promise<string> => {
  const isDbConnected = mongoose.connection.readyState === 1;

  for (let attempt = 0; attempt < 15; attempt++) {
    // Generate a 5-digit number from 10000 to 99999
    const candidate = Math.floor(10000 + Math.random() * 90000).toString();

    if (isDbConnected) {
      const exists = await Order.findOne({ id: candidate });
      if (!exists) return candidate;
    } else {
      const exists = inMemoryOrders.some((o) => o.id === candidate);
      if (!exists) return candidate;
    }
  }

  // Fallback 6-digit number if collision occurs
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// POST /api/orders - create new customer order
ordersRouter.post('/', async (req, res) => {
  const { name, whatsapp, email, items, totalAmount, utrNumber, deliveryPreference } = req.body;

  if (!name || !whatsapp || !items || !totalAmount) {
    return res.status(400).json({
      success: false,
      message: 'Missing required order fields (name, whatsapp, items, totalAmount)',
    });
  }

  try {
    const orderId = await generateUniqueNumericOrderId();
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      const newOrder = await Order.create({
        id: orderId,
        customerName: name,
        customerPhone: whatsapp,
        customerEmail: email,
        items: items.map((item: any) => ({
          productId: item.productId || `prod-${Date.now()}`,
          productTitle: item.title,
          planName: item.plan,
          validity: item.validity || '30 Days',
          price: item.price,
          quantity: item.quantity || 1,
        })),
        totalAmount,
        utrNumber,
        paymentMethod: 'UPI',
        status: 'PENDING_VERIFICATION',
        deliveryNotes: `Preference: ${deliveryPreference || 'whatsapp'}`,
      });

      return res.status(201).json({
        success: true,
        message: 'Order recorded successfully.',
        order: { id: newOrder.id, ...newOrder.toObject() },
      });
    }

    // In-memory fallback
    const newOrder: LocalOrder = {
      id: orderId,
      name,
      whatsapp,
      email,
      items,
      totalAmount,
      utrNumber,
      status: 'PENDING_VERIFICATION',
      createdAt: new Date().toISOString(),
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

// GET /api/orders/:id - retrieve order by numeric ID
ordersRouter.get('/:id', async (req, res) => {
  try {
    const isDbConnected = mongoose.connection.readyState === 1;
    if (isDbConnected) {
      const order = await Order.findOne({ id: req.params.id });
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }
      return res.json({ success: true, data: order });
    }

    const order = inMemoryOrders.find((o) => o.id === req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch order' });
  }
});
