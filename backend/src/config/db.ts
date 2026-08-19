import mongoose from 'mongoose';

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri || uri.includes('<username>') || uri.includes('systumpassword')) {
    console.log('ℹ️  MongoDB URI not configured or using placeholder. Running in mock in-memory database mode.');
    return;
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    console.log('⚠️  Falling back to in-memory mode so the API remains online.');
  }
};
