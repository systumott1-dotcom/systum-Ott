import { Router } from 'express';
import { FAQS } from '../data/mockData.js';

export const faqsRouter = Router();

faqsRouter.get('/', (_req, res) => {
  res.json({ success: true, count: FAQS.length, data: FAQS });
});
