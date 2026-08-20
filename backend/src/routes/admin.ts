import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { requireAdmin } from '../middleware/auth.js';
import type { AuthRequest } from '../middleware/auth.js';
import { Product } from '../models/Product.js';
import { Order } from '../models/Order.js';
import { Coupon } from '../models/Coupon.js';
import { User } from '../models/User.js';
import { inMemoryUsers } from './auth.js';
import { inMemoryCoupons } from './coupons.js';
import { PRODUCTS } from '../data/mockData.js';
import { uploadImageToCloudinary } from '../services/cloudinary.js';
import { sendOrderEmail, sendTestEmail, sendAdminOtpEmail } from '../services/email.js';
import mongoose from 'mongoose';

export const adminRouter = Router();

// Protect all admin routes with requireAdmin middleware
adminRouter.use(requireAdmin);

// In-memory fallback stores
let adminProducts: any[] = [...PRODUCTS];
const adminCoupons = inMemoryCoupons;
interface AdminOrderType {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  items: any[];
  totalAmount: number;
  paymentMethod: string;
  utrNumber?: string;
  status: 'PENDING_VERIFICATION' | 'DELIVERED' | 'CANCELLED';
  deliveryCredentials?: string;
  deliveryNotes?: string;
  createdAt: string;
}

let adminOrders: AdminOrderType[] = [
  {
    id: 'SO-ORD-902114',
    customerName: 'Aman Verma',
    customerPhone: '9876543210',
    customerEmail: 'aman@gmail.com',
    items: [
      {
        productId: 'netflix-4k-uhd',
        productTitle: 'Netflix 4K Ultra HD',
        planName: '1 Month Access',
        validity: '30 Days',
        price: 99,
        quantity: 1,
        accountType: 'Private Screen PIN Profile',
      },
    ],
    totalAmount: 99,
    paymentMethod: 'UPI',
    utrNumber: '423891029381',
    status: 'PENDING_VERIFICATION',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'SO-ORD-902112',
    customerName: 'Pooja Hegde',
    customerPhone: '9123456780',
    customerEmail: 'pooja@outlook.com',
    items: [
      {
        productId: 'adobe-creative-cloud',
        productTitle: 'Adobe Creative Cloud All Apps',
        planName: '1 Month Access',
        validity: '30 Days',
        price: 449,
        quantity: 1,
        accountType: 'Official Redeem Key / Invite',
      },
    ],
    totalAmount: 449,
    paymentMethod: 'UPI',
    utrNumber: '423891992110',
    status: 'DELIVERED',
    deliveryCredentials: 'Email: pooja@outlook.com (Invite activated on personal ID)',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

// GET /api/admin/stats
adminRouter.get('/stats', async (_req, res) => {
  try {
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      const totalOrders = await Order.countDocuments();
      const pendingOrders = await Order.countDocuments({ status: 'PENDING_VERIFICATION' });
      const deliveredOrders = await Order.countDocuments({ status: 'DELIVERED' });
      const productsCount = await Product.countDocuments();

      const revenueAgg = await Order.aggregate([
        { $match: { status: 'DELIVERED' } },
        { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } },
      ]);
      const totalRevenue = revenueAgg[0]?.totalRevenue || 0;

      return res.json({
        success: true,
        stats: {
          totalRevenue,
          totalOrders,
          pendingOrders,
          deliveredOrders,
          productsCount,
        },
      });
    }

    // In-memory fallback
    const totalOrders = adminOrders.length;
    const pendingOrders = adminOrders.filter((o) => o.status === 'PENDING_VERIFICATION').length;
    const deliveredOrders = adminOrders.filter((o) => o.status === 'DELIVERED').length;
    const totalRevenue = adminOrders
      .filter((o) => o.status === 'DELIVERED')
      .reduce((sum, o) => sum + o.totalAmount, 0);

    res.json({
      success: true,
      stats: {
        totalRevenue,
        totalOrders,
        pendingOrders,
        deliveredOrders,
        productsCount: adminProducts.length,
      },
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch admin stats' });
  }
});

// GET /api/admin/products
adminRouter.get('/products', async (_req, res) => {
  try {
    const isDbConnected = mongoose.connection.readyState === 1;
    if (isDbConnected) {
      const products = await Product.find().sort({ displayOrder: 1, createdAt: -1 });
      return res.json({ success: true, products });
    }
    const sorted = [...adminProducts].sort((a, b) => ((a.displayOrder ?? 9999) - (b.displayOrder ?? 9999)));
    res.json({ success: true, products: sorted });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch products' });
  }
});

// PUT /api/admin/products/reorder (Save new product ordering list)
adminRouter.put('/products/reorder', async (req, res) => {
  try {
    const { orderedIds } = req.body;
    if (!Array.isArray(orderedIds)) {
      return res.status(400).json({ success: false, message: 'orderedIds must be an array of product IDs' });
    }

    const isDbConnected = mongoose.connection.readyState === 1;
    if (isDbConnected) {
      const bulkOps = orderedIds.map((id: string, index: number) => ({
        updateOne: {
          filter: { id },
          update: { $set: { displayOrder: index } },
        },
      }));
      await Product.bulkWrite(bulkOps);
      const updatedProducts = await Product.find().sort({ displayOrder: 1, createdAt: -1 });
      return res.json({ success: true, message: 'Products reordered successfully! ✨', products: updatedProducts });
    }

    // In-memory fallback
    const idToIndex = new Map<string, number>(orderedIds.map((id: string, idx: number) => [id, idx]));
    adminProducts.forEach((p) => {
      if (idToIndex.has(p.id)) {
        p.displayOrder = idToIndex.get(p.id)!;
      }
    });
    adminProducts.sort((a, b) => (a.displayOrder ?? 9999) - (b.displayOrder ?? 9999));
    res.json({ success: true, message: 'Products reordered successfully! ✨', products: adminProducts });
  } catch (error) {
    console.error('Reorder error:', error);
    res.status(500).json({ success: false, message: 'Failed to reorder products' });
  }
});

// PUT /api/admin/products/:id/move (Move a product to a specific position number or swap)
adminRouter.put('/products/:id/move', async (req, res) => {
  try {
    const { id } = req.params;
    const { targetPosition, swapWithId, direction } = req.body;
    const isDbConnected = mongoose.connection.readyState === 1;

    let currentList: any[] = [];
    if (isDbConnected) {
      currentList = await Product.find().sort({ displayOrder: 1, createdAt: -1 });
    } else {
      currentList = [...adminProducts].sort((a, b) => (a.displayOrder ?? 9999) - (b.displayOrder ?? 9999));
    }

    const currentIndex = currentList.findIndex((p) => p.id === id);
    if (currentIndex === -1) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    let newIndex = currentIndex;

    if (swapWithId) {
      // Direct swap between two products
      const targetIdx = currentList.findIndex((p) => p.id === swapWithId);
      if (targetIdx !== -1) {
        const temp = currentList[currentIndex];
        currentList[currentIndex] = currentList[targetIdx];
        currentList[targetIdx] = temp;
      }
    } else if (typeof targetPosition === 'number') {
      // 1-indexed target position (e.g. position 1 = index 0)
      newIndex = Math.max(0, Math.min(currentList.length - 1, targetPosition - 1));
      const [movedItem] = currentList.splice(currentIndex, 1);
      currentList.splice(newIndex, 0, movedItem);
    } else if (direction === 'up' && currentIndex > 0) {
      const temp = currentList[currentIndex];
      currentList[currentIndex] = currentList[currentIndex - 1];
      currentList[currentIndex - 1] = temp;
    } else if (direction === 'down' && currentIndex < currentList.length - 1) {
      const temp = currentList[currentIndex];
      currentList[currentIndex] = currentList[currentIndex + 1];
      currentList[currentIndex + 1] = temp;
    }

    // Assign consecutive 0-indexed displayOrder to all items
    const orderedIds = currentList.map((p) => p.id);

    if (isDbConnected) {
      const bulkOps = orderedIds.map((pId: string, index: number) => ({
        updateOne: {
          filter: { id: pId },
          update: { $set: { displayOrder: index } },
        },
      }));
      await Product.bulkWrite(bulkOps);
      const updatedProducts = await Product.find().sort({ displayOrder: 1, createdAt: -1 });
      return res.json({ success: true, message: `Product position updated to #${newIndex + 1}! ✨`, products: updatedProducts });
    }

    // In-memory fallback
    adminProducts = currentList.map((p, idx) => ({ ...p, displayOrder: idx }));
    res.json({ success: true, message: `Product position updated to #${newIndex + 1}! ✨`, products: adminProducts });
  } catch (error) {
    console.error('Move product error:', error);
    res.status(500).json({ success: false, message: 'Failed to move product' });
  }
});

// POST /api/admin/products (Create Product)
adminRouter.post('/products', async (req, res) => {
  try {
    const {
      title,
      category,
      shortDescription,
      fullDescription,
      badge,
      iconColor,
      iconName,
      imageUrl,
      accountType,
      warrantyDays,
      compatibility,
      features,
      tags,
      plans,
      sourceVendor,
    } = req.body;

    const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40) + `-${Date.now().toString().slice(-4)}`;
    const slug = id;

    const parsedTags = Array.isArray(tags) 
      ? tags.map((t: string) => t.trim().toLowerCase()).filter(Boolean)
      : typeof tags === 'string'
      ? tags.split(',').map((t: string) => t.trim().toLowerCase()).filter(Boolean)
      : [];

    const newProductData = {
      id,
      slug,
      title,
      category,
      shortDescription,
      fullDescription: fullDescription || shortDescription,
      badge: badge || '',
      iconColor: iconColor || '#7c3aed',
      iconName: iconName || 'Tv',
      imageUrl: imageUrl || '',
      accountType: accountType || 'Private Screen PIN',
      instantDelivery: true,
      warrantyDays: Number(warrantyDays) || 30,
      compatibility: compatibility || ['Smart TV', 'Android / iOS', 'PC / Mac'],
      features: features || ['Instant delivery', 'Full warranty'],
      tags: parsedTags,
      plans: plans || [{ name: '1 Month Access', validity: '30 Days', originalPrice: 499, discountedPrice: 99, isPopular: true }],
      rating: 5.0,
      reviewsCount: 15,
      inStock: req.body.inStock !== undefined ? Boolean(req.body.inStock) : true,
      sourceVendor: sourceVendor || 'Eneba / Volume Licensed',
    };

    const isDbConnected = mongoose.connection.readyState === 1;
    if (isDbConnected) {
      const created = await Product.create(newProductData);
      return res.status(201).json({ success: true, product: created });
    }

    adminProducts.unshift(newProductData as any);
    res.status(201).json({ success: true, product: newProductData });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ success: false, message: 'Failed to create product' });
  }
});

// PUT /api/admin/products/:id (Update Product)
adminRouter.put('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      const updated = await Product.findOneAndUpdate({ id }, req.body, { new: true });
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }
      return res.json({ success: true, product: updated });
    }

    const index = adminProducts.findIndex((p) => p.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    adminProducts[index] = { ...adminProducts[index], ...req.body };
    res.json({ success: true, product: adminProducts[index] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update product' });
  }
});

// PATCH /api/admin/products/:id/stock (Toggle In Stock / Out of Stock)
adminRouter.patch('/products/:id/stock', async (req, res) => {
  try {
    const { id } = req.params;
    const { inStock } = req.body;
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      const product = await Product.findOne({ id });
      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }
      product.inStock = typeof inStock === 'boolean' ? inStock : !product.inStock;
      await product.save();
      return res.json({ success: true, inStock: product.inStock, product });
    }

    const index = adminProducts.findIndex((p) => p.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    adminProducts[index].inStock = typeof inStock === 'boolean' ? inStock : !adminProducts[index].inStock;
    res.json({ success: true, inStock: adminProducts[index].inStock, product: adminProducts[index] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update stock status' });
  }
});

// DELETE /api/admin/products/:id
adminRouter.delete('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      await Product.findOneAndDelete({ id });
      return res.json({ success: true, message: 'Product deleted' });
    }

    adminProducts = adminProducts.filter((p) => p.id !== id);
    res.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete product' });
  }
});

// GET /api/admin/orders
adminRouter.get('/orders', async (_req, res) => {
  try {
    const isDbConnected = mongoose.connection.readyState === 1;
    if (isDbConnected) {
      const orders = await Order.find().sort({ createdAt: -1 });
      return res.json({ success: true, orders });
    }
    res.json({ success: true, orders: adminOrders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch orders' });
  }
});

// GET /api/admin/orders/:id (Lookup single order by ID)
adminRouter.get('/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      const order = await Order.findOne({ id });
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }
      return res.json({ success: true, order });
    }

    const order = adminOrders.find((o) => o.id === id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to lookup order' });
  }
});

// PATCH /api/admin/orders/:id/status
adminRouter.patch('/orders/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, deliveryCredentials, deliveryNotes, sendEmailNotification } = req.body;

    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      const order = await Order.findOneAndUpdate(
        { id },
        { status, deliveryCredentials, deliveryNotes },
        { new: true }
      );
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }

      if (sendEmailNotification && order.customerEmail) {
        await sendOrderEmail({
          toEmail: order.customerEmail,
          customerName: order.customerName,
          orderId: order.id,
          items: order.items.map((i: any) => ({ title: i.productTitle, plan: i.planName, price: i.price, quantity: i.quantity })),
          totalAmount: order.totalAmount,
          credentials: deliveryCredentials,
          status,
        });
      }

      return res.json({ success: true, order });
    }

    const order = adminOrders.find((o) => o.id === id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.status = status;
    if (deliveryCredentials) order.deliveryCredentials = deliveryCredentials;
    if (deliveryNotes) order.deliveryNotes = deliveryNotes;

    if (sendEmailNotification && order.customerEmail) {
      await sendOrderEmail({
        toEmail: order.customerEmail,
        customerName: order.customerName,
        orderId: order.id,
        items: order.items.map((i: any) => ({ title: i.productTitle, plan: i.planName, price: i.price, quantity: i.quantity })),
        totalAmount: order.totalAmount,
        credentials: deliveryCredentials,
        status,
      });
    }

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update order' });
  }
});

// DELETE /api/admin/orders/:id - Permanently delete an order
adminRouter.delete('/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      const deleted = await Order.findOneAndDelete({ $or: [{ id }, { _id: id }] });
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }
      return res.json({ success: true, message: `Order #${id} deleted permanently` });
    }

    const index = adminOrders.findIndex((o) => o.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    adminOrders.splice(index, 1);
    res.json({ success: true, message: `Order #${id} deleted permanently` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete order' });
  }
});

// POST /api/admin/upload-image
adminRouter.post('/upload-image', async (req, res) => {
  try {
    const { imageBase64, folder } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ success: false, message: 'Image base64 is required' });
    }

    const imageUrl = await uploadImageToCloudinary(imageBase64, folder || 'systum_ott_products');
    res.json({ success: true, imageUrl });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Image upload failed' });
  }
});

// GET /api/admin/coupons
adminRouter.get('/coupons', async (_req, res) => {
  try {
    const isDbConnected = mongoose.connection.readyState === 1;
    if (isDbConnected) {
      const coupons = await Coupon.find();
      return res.json({ success: true, coupons });
    }
    res.json({ success: true, coupons: adminCoupons });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch coupons' });
  }
});

// POST /api/admin/coupons
adminRouter.post('/coupons', async (req, res) => {
  try {
    const { code, type, value, minOrderValue } = req.body;
    const isDbConnected = mongoose.connection.readyState === 1;

    const newCoupon = {
      code: code.toUpperCase().trim(),
      type,
      value: Number(value),
      minOrderValue: Number(minOrderValue) || 0,
      isActive: true,
      usageCount: 0,
    };

    if (isDbConnected) {
      const created = await Coupon.create(newCoupon);
      return res.status(201).json({ success: true, coupon: created });
    }

    adminCoupons.push(newCoupon as any);
    res.status(201).json({ success: true, coupon: newCoupon });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create coupon' });
  }
});

// DELETE /api/admin/coupons/:code - Delete a coupon
adminRouter.delete('/coupons/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const upperCode = code.toUpperCase().trim();
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      const deleted = await Coupon.findOneAndDelete({ code: upperCode });
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Coupon not found' });
      }
      return res.json({ success: true, message: `Coupon "${upperCode}" deleted successfully` });
    }

    const index = adminCoupons.findIndex((c) => c.code === upperCode);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }
    adminCoupons.splice(index, 1);
    res.json({ success: true, message: `Coupon "${upperCode}" deleted successfully` });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete coupon' });
  }
});

// PATCH /api/admin/coupons/:code/toggle - Toggle active status
adminRouter.patch('/coupons/:code/toggle', async (req, res) => {
  try {
    const { code } = req.params;
    const { isActive } = req.body;
    const upperCode = code.toUpperCase().trim();
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      const updated = await Coupon.findOneAndUpdate(
        { code: upperCode },
        { isActive: Boolean(isActive) },
        { new: true }
      );
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Coupon not found' });
      }
      return res.json({ success: true, coupon: updated });
    }

    const coupon = adminCoupons.find((c) => c.code === upperCode);
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }
    coupon.isActive = Boolean(isActive);
    res.json({ success: true, coupon });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update coupon' });
  }
});

// POST /api/admin/test-email
adminRouter.post('/test-email', async (req, res) => {
  const { email } = req.body;
  const targetEmail = email || process.env.ADMIN_NOTIFICATION_EMAIL || 'systumott1@gmail.com';
  const result = await sendTestEmail(targetEmail);
  if (result.success) {
    res.json({ success: true, message: `Test email sent to ${targetEmail}`, data: result.data });
  } else {
    res.status(500).json({ success: false, message: result.error });
  }
});

// GET /api/admin/users - List all registered users
adminRouter.get('/users', async (_req, res) => {
  try {
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      const users = await User.find().sort({ createdAt: -1 }).select('-passwordHash').lean();
      return res.json({ success: true, count: users.length, users });
    }

    // In-memory fallback
    const sanitized = inMemoryUsers.map((u) => ({
      _id: u.id,
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      role: u.role,
      isBanned: u.isBanned ?? false,
      bannedAt: u.bannedAt,
      banReason: u.banReason,
      createdAt: u.createdAt,
    }));

    res.json({ success: true, count: sanitized.length, users: sanitized });
  } catch (error) {
    console.error('Fetch users error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
});

// PATCH /api/admin/users/:id/ban - Ban or unban a user
adminRouter.patch('/users/:id/ban', async (req, res) => {
  try {
    const { id } = req.params;
    const { isBanned, reason } = req.body;
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      const user = await User.findOne({ $or: [{ _id: id }, { id }] });
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      user.isBanned = Boolean(isBanned);
      user.bannedAt = isBanned ? new Date() : undefined;
      user.banReason = isBanned ? (reason || 'Violation of terms & policies') : undefined;
      await user.save();

      return res.json({
        success: true,
        message: isBanned ? `User ${user.name} has been banned successfully.` : `User ${user.name} unbanned.`,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isBanned: user.isBanned,
          banReason: user.banReason,
        },
      });
    }

    // In-memory fallback
    const user = inMemoryUsers.find((u) => u.id === id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.isBanned = Boolean(isBanned);
    user.bannedAt = isBanned ? new Date() : undefined;
    user.banReason = isBanned ? (reason || 'Violation of terms & policies') : undefined;

    res.json({
      success: true,
      message: isBanned ? `User ${user.name} has been banned successfully.` : `User ${user.name} unbanned.`,
      user,
    });
  } catch (error) {
    console.error('Ban user error:', error);
    res.status(500).json({ success: false, message: 'Failed to update user ban status' });
  }
});

// DELETE /api/admin/users/:id - Permanently delete a user account
adminRouter.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      const deleted = await User.findOneAndDelete({ $or: [{ _id: id }, { id }] });
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      return res.json({
        success: true,
        message: `Account of ${deleted.name} (${deleted.email}) deleted permanently.`,
      });
    }

    // In-memory fallback
    const index = inMemoryUsers.findIndex((u) => u.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const removed = inMemoryUsers.splice(index, 1)[0];
    res.json({
      success: true,
      message: `Account of ${removed.name} (${removed.email}) deleted permanently.`,
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete user account' });
  }
});

// In-memory OTP storage for Admin Security Changes (15 minutes validity)
const adminSecurityOtpStore = new Map<string, { otp: string; action: 'email' | 'password'; newEmail?: string; expiresAt: number }>();

// POST /api/admin/security/request-otp - Send 6-digit OTP to Admin Email
adminRouter.post('/security/request-otp', async (req: AuthRequest, res) => {
  try {
    const { action, newEmail } = req.body; // 'email' | 'password'
    if (!req.user?.email) {
      return res.status(401).json({ success: false, message: 'Admin authentication required' });
    }

    if (action !== 'email' && action !== 'password') {
      return res.status(400).json({ success: false, message: 'Invalid action type. Must be email or password.' });
    }

    if (action === 'email' && (!newEmail || !newEmail.includes('@'))) {
      return res.status(400).json({ success: false, message: 'Please provide a valid new email address.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 15 * 60 * 1000;
    const adminEmail = req.user.email.toLowerCase().trim();

    adminSecurityOtpStore.set(adminEmail, {
      otp,
      action,
      newEmail: newEmail ? newEmail.toLowerCase().trim() : undefined,
      expiresAt,
    });

    await sendAdminOtpEmail(adminEmail, otp, action);

    res.json({
      success: true,
      message: `A 6-digit security code has been sent to ${adminEmail}. Please check your inbox.`,
    });
  } catch (err: any) {
    console.error('Request security OTP error:', err);
    res.status(500).json({ success: false, message: 'Failed to dispatch security code.' });
  }
});

// POST /api/admin/security/verify-change-email - Verify OTP & update admin email
adminRouter.post('/security/verify-change-email', async (req: AuthRequest, res) => {
  try {
    const { newEmail, otp } = req.body;
    if (!req.user?.email) {
      return res.status(401).json({ success: false, message: 'Admin authentication required' });
    }
    if (!newEmail || !otp) {
      return res.status(400).json({ success: false, message: 'New email and 6-digit OTP code are required.' });
    }

    const currentAdminEmail = req.user.email.toLowerCase().trim();
    const targetNewEmail = newEmail.toLowerCase().trim();
    const stored = adminSecurityOtpStore.get(currentAdminEmail);

    if (!stored || stored.action !== 'email') {
      return res.status(400).json({ success: false, message: 'No active email change request found. Please request a new OTP code.' });
    }

    if (Date.now() > stored.expiresAt) {
      adminSecurityOtpStore.delete(currentAdminEmail);
      return res.status(400).json({ success: false, message: 'The security verification code has expired. Please request a new code.' });
    }

    if (stored.otp !== otp.trim()) {
      return res.status(400).json({ success: false, message: 'Invalid 6-digit verification code. Please check your email.' });
    }

    const isDbConnected = mongoose.connection.readyState === 1;
    if (isDbConnected) {
      const existing = await User.findOne({ email: targetNewEmail });
      if (existing && existing._id.toString() !== req.user.id) {
        return res.status(400).json({ success: false, message: 'An account with this new email already exists.' });
      }

      const updatedUser = await User.findOneAndUpdate(
        { $or: [{ _id: req.user.id }, { email: currentAdminEmail }] },
        { email: targetNewEmail },
        { new: true }
      );

      if (!updatedUser) {
        return res.status(404).json({ success: false, message: 'Admin record not found.' });
      }

      adminSecurityOtpStore.delete(currentAdminEmail);

      const secret = process.env.JWT_SECRET || 'systum_ott_default_secret_2026';
      const newToken = jwt.sign(
        { id: updatedUser._id.toString(), email: updatedUser.email, role: updatedUser.role, name: updatedUser.name },
        secret,
        { expiresIn: '7d' }
      );

      return res.json({
        success: true,
        message: `Admin email successfully updated to ${targetNewEmail}!`,
        token: newToken,
        user: { id: updatedUser._id, name: updatedUser.name, email: updatedUser.email, role: updatedUser.role },
      });
    }

    // In-memory fallback
    const user = inMemoryUsers.find((u) => u.email === currentAdminEmail || u.id === req.user?.id);
    if (user) {
      user.email = targetNewEmail;
    }
    adminSecurityOtpStore.delete(currentAdminEmail);

    const secret = process.env.JWT_SECRET || 'systum_ott_default_secret_2026';
    const newToken = jwt.sign(
      { id: req.user.id, email: targetNewEmail, role: 'admin', name: req.user.name },
      secret,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: `Admin email successfully updated to ${targetNewEmail}!`,
      token: newToken,
      user: { id: req.user.id, name: req.user.name, email: targetNewEmail, role: 'admin' },
    });
  } catch (err: any) {
    console.error('Verify change email error:', err);
    res.status(500).json({ success: false, message: 'Failed to update admin email.' });
  }
});

// POST /api/admin/security/verify-change-password - Verify OTP & update admin password
adminRouter.post('/security/verify-change-password', async (req: AuthRequest, res) => {
  try {
    const { newPassword, otp } = req.body;
    if (!req.user?.email) {
      return res.status(401).json({ success: false, message: 'Admin authentication required' });
    }
    if (!newPassword || newPassword.length < 6 || !otp) {
      return res.status(400).json({ success: false, message: 'New password (min 6 chars) and 6-digit OTP code are required.' });
    }

    const currentAdminEmail = req.user.email.toLowerCase().trim();
    const stored = adminSecurityOtpStore.get(currentAdminEmail);

    if (!stored || stored.action !== 'password') {
      return res.status(400).json({ success: false, message: 'No active password change request found. Please request a new OTP code.' });
    }

    if (Date.now() > stored.expiresAt) {
      adminSecurityOtpStore.delete(currentAdminEmail);
      return res.status(400).json({ success: false, message: 'The security verification code has expired. Please request a new code.' });
    }

    if (stored.otp !== otp.trim()) {
      return res.status(400).json({ success: false, message: 'Invalid 6-digit verification code. Please check your email.' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      await User.findOneAndUpdate(
        { $or: [{ _id: req.user.id }, { email: currentAdminEmail }] },
        { passwordHash }
      );
    } else {
      const user = inMemoryUsers.find((u) => u.email === currentAdminEmail || u.id === req.user?.id);
      if (user) {
        user.passwordHash = passwordHash;
      }
    }

    adminSecurityOtpStore.delete(currentAdminEmail);

    res.json({
      success: true,
      message: 'Admin password updated successfully! Please keep your new password safe.',
    });
  } catch (err: any) {
    console.error('Verify change password error:', err);
    res.status(500).json({ success: false, message: 'Failed to update admin password.' });
  }
});
