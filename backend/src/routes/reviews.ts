import { Router } from 'express';
import { REVIEWS } from '../data/mockData.js';

export const reviewsRouter = Router();

reviewsRouter.get('/', (_req, res) => {
  res.json({ success: true, count: REVIEWS.length, data: REVIEWS });
});
