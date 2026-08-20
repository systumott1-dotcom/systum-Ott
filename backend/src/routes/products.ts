import { Router } from 'express';
import mongoose from 'mongoose';
import { Product } from '../models/Product.js';
import { PRODUCTS, CATEGORIES } from '../data/mockData.js';

export const productsRouter = Router();

// GET all categories
productsRouter.get('/categories', (_req, res) => {
  res.json({ success: true, count: CATEGORIES.length, data: CATEGORIES });
});

// GET all products or filter by category / search query
productsRouter.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      const filter: any = {};
      if (category && category !== 'all') filter.category = category;
      if (search && typeof search === 'string') {
        const q = search.toLowerCase();
        filter.$or = [
          { title: { $regex: q, $options: 'i' } },
          { shortDescription: { $regex: q, $options: 'i' } },
          { tags: { $regex: q, $options: 'i' } },
          { features: { $regex: q, $options: 'i' } },
        ];
      }
      const products = await Product.find(filter).sort({ displayOrder: 1, createdAt: -1 });
      return res.json({ success: true, count: products.length, products });
    }

    // In-memory fallback
    let filtered = [...PRODUCTS];
    if (category && category !== 'all') {
      filtered = filtered.filter((p) => p.category === category);
    }
    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.shortDescription.toLowerCase().includes(q) ||
          ((p as any).tags && (p as any).tags.some((t: string) => t.toLowerCase().includes(q))) ||
          p.features.some((f: string) => f.toLowerCase().includes(q))
      );
    }
    filtered.sort((a, b) => ((a as any).displayOrder ?? 9999) - ((b as any).displayOrder ?? 9999));
    res.json({ success: true, count: filtered.length, products: filtered });
  } catch (error) {
    console.error('Products fetch error:', error);
    res.json({ success: true, count: PRODUCTS.length, products: PRODUCTS });
  }
});

// GET product by slug or id
productsRouter.get('/:slugOrId', async (req, res) => {
  try {
    const { slugOrId } = req.params;
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      const product = await Product.findOne({ $or: [{ slug: slugOrId }, { id: slugOrId }] });
      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }
      return res.json({ success: true, product });
    }

    const product = PRODUCTS.find((p) => p.slug === slugOrId || p.id === slugOrId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch product' });
  }
});
