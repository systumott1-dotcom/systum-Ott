import { Router } from 'express';

export const ordersRouter = Router();

// In-memory store for orders
interface Order {
  id: string;
  name: string;
  whatsapp: string;
  email?: string;
  items: Array<{
    title: string;
    plan: string;
    validity: string;
    price: number;
    quantity: number;
  }>;
  totalAmount: number;
  utrNumber?: string;
  status: 'PENDING_VERIFICATION' | 'DELIVERED' | 'CANCELLED';
  createdAt: string;
}

const orders: Order[] = [];

// POST create order
ordersRouter.post('/', (req, res) => {
  const { name, whatsapp, email, items, totalAmount, utrNumber } = req.body;

  if (!name || !whatsapp || !items || !totalAmount) {
    return res.status(400).json({
      success: false,
      message: 'Missing required order fields (name, whatsapp, items, totalAmount)',
    });
  }

  const newOrder: Order = {
    id: `SO-ORD-${Date.now().toString().slice(-6)}`,
    name,
    whatsapp,
    email,
    items,
    totalAmount,
    utrNumber,
    status: 'PENDING_VERIFICATION',
    createdAt: new Date().toISOString(),
  };

  orders.push(newOrder);

  res.status(201).json({
    success: true,
    message: 'Order recorded successfully. Awaiting WhatsApp verification.',
    data: newOrder,
  });
});

// GET order by ID
ordersRouter.get('/:id', (req, res) => {
  const order = orders.find((o) => o.id === req.params.id);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }
  res.json({ success: true, data: order });
});
