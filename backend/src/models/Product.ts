import mongoose, { Schema, Document } from 'mongoose';

export interface IProductPlan {
  name: string;
  validity: string;
  originalPrice: number;
  discountedPrice: number;
  isPopular?: boolean;
}

export interface IProduct extends Document {
  id: string;
  slug: string;
  title: string;
  category: string;
  shortDescription: string;
  fullDescription?: string;
  badge?: string;
  iconColor: string;
  iconName: string;
  imageUrl?: string;
  accountType: string;
  instantDelivery: boolean;
  warrantyDays: number;
  compatibility: string[];
  features: string[];
  plans: IProductPlan[];
  rating: number;
  reviewsCount: number;
  inStock: boolean;
  sourceVendor?: string; // e.g. "Eneba Partner", "Direct Licensee", "Aggregator"
  createdAt: Date;
  updatedAt: Date;
}

const ProductPlanSchema = new Schema({
  name: { type: String, required: true },
  validity: { type: String, required: true },
  originalPrice: { type: Number, required: true },
  discountedPrice: { type: Number, required: true },
  isPopular: { type: Boolean, default: false },
});

const ProductSchema: Schema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    slug: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true, trim: true },
    category: { type: String, required: true, index: true },
    shortDescription: { type: String, required: true },
    fullDescription: { type: String },
    badge: { type: String },
    iconColor: { type: String, default: '#7c3aed' },
    iconName: { type: String, default: 'Tv' },
    imageUrl: { type: String },
    accountType: { type: String, default: 'Private Profile' },
    instantDelivery: { type: Boolean, default: true },
    warrantyDays: { type: Number, default: 30 },
    compatibility: [{ type: String }],
    features: [{ type: String }],
    plans: [ProductPlanSchema],
    rating: { type: Number, default: 5.0 },
    reviewsCount: { type: Number, default: 120 },
    inStock: { type: Boolean, default: true },
    sourceVendor: { type: String, default: 'Licensed Aggregator (Eneba / Volume)' },
  },
  { timestamps: true }
);

export const Product = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);
