import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  id: string;
  productId: string;
  productTitle?: string;
  authorName: string;
  userEmail?: string;
  rating: number;
  comment: string;
  avatar?: string;
  isVerified?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema: Schema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    productId: { type: String, required: true, index: true },
    productTitle: { type: String },
    authorName: { type: String, required: true, trim: true },
    userEmail: { type: String, lowercase: true, trim: true },
    rating: { type: Number, required: true, min: 1, max: 5, default: 5 },
    comment: { type: String, required: true, trim: true },
    avatar: { type: String },
    isVerified: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Review = mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema);
