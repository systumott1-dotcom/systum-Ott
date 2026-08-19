import mongoose, { Schema, Document } from 'mongoose';

export interface IOrderItem {
  productId: string;
  productTitle: string;
  planName: string;
  validity: string;
  price: number;
  quantity: number;
  accountType: string;
}

export interface IOrder extends Document {
  id: string;
  customerName: string;
  customerPhone: string; // WhatsApp number
  customerEmail?: string;
  items: IOrderItem[];
  totalAmount: number;
  appliedCoupon?: string;
  discountAmount?: number;
  paymentMethod: 'UPI' | 'QR' | 'WHATSAPP';
  utrNumber?: string;
  paymentScreenshotUrl?: string; // Cloudinary URL
  status: 'PENDING_VERIFICATION' | 'DELIVERED' | 'CANCELLED';
  deliveryCredentials?: string;
  deliveryNotes?: string;
  purchaseDate?: string;
  expiryDate?: string;
  warrantyType?: string;
  warrantyDays?: number;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema({
  productId: { type: String, required: true },
  productTitle: { type: String, required: true },
  planName: { type: String, required: true },
  validity: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, default: 1 },
  accountType: { type: String, default: 'Private' },
});

const OrderSchema: Schema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    customerName: { type: String, required: true, trim: true },
    customerPhone: { type: String, required: true, trim: true, index: true },
    customerEmail: { type: String, trim: true, index: true },
    items: [OrderItemSchema],
    totalAmount: { type: Number, required: true },
    appliedCoupon: { type: String },
    discountAmount: { type: Number, default: 0 },
    paymentMethod: { type: String, default: 'UPI' },
    utrNumber: { type: String, trim: true },
    paymentScreenshotUrl: { type: String },
    status: {
      type: String,
      enum: ['PENDING_VERIFICATION', 'DELIVERED', 'CANCELLED'],
      default: 'PENDING_VERIFICATION',
      index: true,
    },
    deliveryCredentials: { type: String },
    deliveryNotes: { type: String },
    purchaseDate: { type: String },
    expiryDate: { type: String },
    warrantyType: { type: String, default: 'Full-Term Replacement' },
    warrantyDays: { type: Number, default: 30 },
  },
  { timestamps: true }
);

export const Order = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
