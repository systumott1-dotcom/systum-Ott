import { Router } from 'express';
import mongoose from 'mongoose';
import { Review } from '../models/Review.js';
import { Product } from '../models/Product.js';
import { REVIEWS as INITIAL_REVIEWS } from '../data/mockData.js';
import { uploadImageToCloudinary, isAllowedImagePayload } from '../services/cloudinary.js';

export const reviewsRouter = Router();

// In-memory fallback reviews
interface LocalReview {
  id: string;
  productId: string;
  productTitle?: string;
  authorName: string;
  userEmail?: string;
  rating: number;
  comment: string;
  avatar?: string;
  screenshotUrl?: string;
  imageUrl?: string;
  isVerified: boolean;
  createdAt: string;
}

const inMemoryReviews: LocalReview[] = INITIAL_REVIEWS.map((r, idx) => ({
  id: r.id || `rev-${idx + 1}`,
  productId: r.productPurchased ? r.productPurchased.toLowerCase().replace(/\s+/g, '-') : 'general',
  productTitle: r.productPurchased || 'OTT Subscription',
  authorName: r.author,
  rating: r.rating || 5,
  comment: r.comment,
  avatar: r.avatar,
  isVerified: (r as any).isVerified ?? (r as any).verified ?? true,
  createdAt: new Date(Date.now() - (idx + 1) * 86400000).toISOString(),
}));

const BASE_REVIEW_COUNT = 4500;

// GET /api/reviews - Get reviews (optionally filter by productId)
reviewsRouter.get('/', async (req, res) => {
  try {
    const { productId } = req.query;
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      const filter: any = {};
      if (productId && productId !== 'all') {
        filter.productId = productId;
      }

      const dbReviews = await Review.find(filter).sort({ createdAt: -1 });
      const totalSubmittedCount = await Review.countDocuments();
      const totalReviewsCount = BASE_REVIEW_COUNT + totalSubmittedCount;

      return res.json({
        success: true,
        count: dbReviews.length,
        totalReviewsCount,
        data: dbReviews,
        reviews: dbReviews,
      });
    }

    // In-memory fallback
    let filtered = [...inMemoryReviews];
    if (productId && productId !== 'all') {
      filtered = filtered.filter(
        (r) => r.productId === productId || r.productTitle?.toLowerCase().includes(String(productId).toLowerCase())
      );
    }

    const totalReviewsCount = BASE_REVIEW_COUNT + inMemoryReviews.length;

    res.json({
      success: true,
      count: filtered.length,
      totalReviewsCount,
      data: filtered,
      reviews: filtered,
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch reviews' });
  }
});

// POST /api/reviews - Submit a new review with optional screenshot
reviewsRouter.post('/', async (req, res) => {
  const { productId, productTitle, rating, comment, authorName, userEmail, screenshot, screenshotUrl } = req.body;

  if (!productId || !comment || !authorName) {
    return res.status(400).json({
      success: false,
      message: 'Product ID, author name, and review comment are required.',
    });
  }

  const reviewRating = Number(rating) >= 1 && Number(rating) <= 5 ? Number(rating) : 5;
  const reviewId = `rev-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const isDbConnected = mongoose.connection.readyState === 1;

  try {
    // Handle Screenshot upload to Cloudinary if base64 provided
    let uploadedScreenshotUrl = screenshotUrl || '';
    const rawImage = screenshot || screenshotUrl;
    if (rawImage) {
      if (!isAllowedImagePayload(rawImage)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid screenshot format. Only PNG, JPEG, JPG, and WebP images are allowed.',
        });
      }
      if (typeof rawImage === 'string' && rawImage.startsWith('data:image')) {
        try {
          uploadedScreenshotUrl = await uploadImageToCloudinary(rawImage, 'systum_ott_reviews');
        } catch (uploadErr) {
          console.error('Cloudinary review screenshot upload error:', uploadErr);
          uploadedScreenshotUrl = rawImage;
        }
      }
    }

    if (isDbConnected) {
      const newReview = await Review.create({
        id: reviewId,
        productId,
        productTitle: productTitle || 'Verified Subscription',
        authorName: authorName.trim(),
        userEmail: userEmail ? userEmail.trim().toLowerCase() : undefined,
        rating: reviewRating,
        comment: comment.trim(),
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(authorName)}`,
        screenshotUrl: uploadedScreenshotUrl || undefined,
        imageUrl: uploadedScreenshotUrl || undefined,
        isVerified: true,
      });

      const totalSubmittedCount = await Review.countDocuments();
      const totalReviewsCount = BASE_REVIEW_COUNT + totalSubmittedCount;

      return res.status(201).json({
        success: true,
        message: 'Review submitted successfully! Thank you for your feedback.',
        review: newReview,
        totalReviewsCount,
      });
    }

    // In-memory fallback
    const newReview: LocalReview = {
      id: reviewId,
      productId,
      productTitle: productTitle || 'Verified Subscription',
      authorName: authorName.trim(),
      userEmail: userEmail ? userEmail.trim().toLowerCase() : undefined,
      rating: reviewRating,
      comment: comment.trim(),
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(authorName)}`,
      screenshotUrl: uploadedScreenshotUrl || undefined,
      imageUrl: uploadedScreenshotUrl || undefined,
      isVerified: true,
      createdAt: new Date().toISOString(),
    };

    inMemoryReviews.unshift(newReview);
    const totalReviewsCount = BASE_REVIEW_COUNT + inMemoryReviews.length;

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully! Thank you for your feedback.',
      review: newReview,
      totalReviewsCount,
    });
  } catch (error) {
    console.error('Error submitting review:', error);
    res.status(500).json({ success: false, message: 'Failed to submit review' });
  }
});

// DELETE /api/reviews/:id - Delete a review
reviewsRouter.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const isDbConnected = mongoose.connection.readyState === 1;

  try {
    if (isDbConnected) {
      const isObjectId = mongoose.Types.ObjectId.isValid(id);
      const query = isObjectId ? { $or: [{ id }, { _id: id }] } : { id };
      await Review.findOneAndDelete(query);
    }

    // Also remove from in-memory fallback list if present
    const index = inMemoryReviews.findIndex((r) => r.id === id);
    if (index !== -1) {
      inMemoryReviews.splice(index, 1);
    }

    const totalSubmittedCount = isDbConnected ? await Review.countDocuments() : inMemoryReviews.length;
    const totalReviewsCount = BASE_REVIEW_COUNT + totalSubmittedCount;

    return res.json({
      success: true,
      message: 'Review deleted successfully',
      totalReviewsCount,
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ success: false, message: 'Failed to delete review' });
  }
});
