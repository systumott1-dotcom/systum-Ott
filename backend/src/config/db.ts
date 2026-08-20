import mongoose from 'mongoose';
import { Product } from '../models/Product.js';
import { Coupon } from '../models/Coupon.js';
import { User } from '../models/User.js';
import { PRODUCTS } from '../data/mockData.js';
import bcrypt from 'bcryptjs';

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri || uri.includes('<username>') || uri.includes('systumpassword')) {
    console.log('ℹ️ MongoDB URI not configured or using placeholder. Running in mock in-memory database mode.');
    return;
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host}`);

    // Auto-seed initial catalog if products collection is empty
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      console.log('🌱 Seeding initial products catalog into MongoDB Atlas...');
      await Product.insertMany(PRODUCTS);
      console.log(`✅ Seeded ${PRODUCTS.length} subscriptions into MongoDB!`);
    }

    // Auto-seed default admin user (systumott1@gmail.com)
    const targetAdminEmail = 'systumott1@gmail.com';
    let adminUser = await User.findOne({ email: targetAdminEmail });

    if (!adminUser) {
      // Check if legacy admin existed to migrate it
      const legacyAdmin = await User.findOne({ email: 'admin@systumott.in' });
      if (legacyAdmin) {
        legacyAdmin.email = targetAdminEmail;
        legacyAdmin.role = 'admin';
        await legacyAdmin.save();
        console.log(`✅ Migrated admin email to: ${targetAdminEmail}`);
      } else {
        console.log('🌱 Seeding initial admin into MongoDB Atlas...');
        const hashedPassword = await bcrypt.hash('admin1234', 10);
        await User.create({
          name: 'Systum Admin',
          email: targetAdminEmail,
          passwordHash: hashedPassword,
          role: 'admin',
          phone: '9306022703',
        });
        console.log(`✅ Admin user created: ${targetAdminEmail} / admin1234`);
      }
    } else if (adminUser.role !== 'admin') {
      adminUser.role = 'admin';
      await adminUser.save();
    }

    // Auto-seed coupons if empty
    const couponCount = await Coupon.countDocuments();
    if (couponCount === 0) {
      await Coupon.create([
        { code: 'EXTRA10', type: 'percentage', value: 10, minOrderValue: 0, isActive: true },
        { code: 'SUPER50', type: 'flat', value: 50, minOrderValue: 500, isActive: true },
        { code: 'SYSTUM20', type: 'percentage', value: 20, minOrderValue: 200, isActive: true },
      ]);
    }
  } catch (error) {
    console.error('❌ MongoDB Atlas Connection Error:', error);
    console.log('⚠️ Falling back to in-memory mode so the API remains online.');
  }
};
