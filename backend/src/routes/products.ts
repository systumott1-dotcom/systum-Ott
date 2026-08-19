import { Router } from 'express';
import { PRODUCTS, CATEGORIES } from '../data/mockData.js';

export const productsRouter = Router();

// GET all categories
productsRouter.get('/categories', (_req, res) => {
  res.json({ success: true, count: CATEGORIES.length, data: CATEGORIES });
});

// GET all products or filter by category / search query
productsRouter.get('/', (req, res) => {
  const { category, search } = req.query;
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
        p.features.some((f) => f.toLowerCase().includes(q))
    );
  }

  res.json({ success: true, count: filtered.length, data: filtered });
});

// GET product by slug or id
productsRouter.get('/:slugOrId', (req, res) => {
  const { slugOrId } = req.params;
  const product = PRODUCTS.find((p) => p.slug === slugOrId || p.id === slugOrId);

  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  res.json({ success: true, data: product });
});
