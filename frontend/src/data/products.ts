import type { Category, Product } from '../types';

export const CATEGORIES: Category[] = [
  {
    id: 'all',
    name: 'All Products',
    icon: 'Store',
    description: 'Explore entire catalog of digital subscriptions & tools',
  },
  {
    id: 'ott',
    name: 'OTT Apps',
    icon: 'Tv',
    description: 'Netflix, Prime Video, Hotstar, Zee5, SonyLIV & more',
  },
  {
    id: 'software',
    name: 'SOFTWARES',
    icon: 'Laptop',
    description: 'Adobe Creative Cloud, MS Office 365, Canva Pro, CapCut',
  },
  {
    id: 'combo',
    name: 'COMBO',
    icon: 'PackagePlus',
    description: 'All-in-one bundled subscriptions with max savings',
  },
  {
    id: 'ai',
    name: 'AI Tools',
    icon: 'Sparkles',
    description: 'ChatGPT Plus, Midjourney, Claude Pro, Runway, Perplexity',
  },
  {
    id: 'music',
    name: 'Music',
    icon: 'Music',
    description: 'Spotify Premium, Apple Music, YouTube Premium, JioSaavn',
  },
  {
    id: 'gaming',
    name: 'Gaming',
    icon: 'Gamepad2',
    description: 'Xbox Game Pass, PlayStation Plus, Steam Keys & Discord Nitro',
  },
  {
    id: 'education',
    name: 'Education',
    icon: 'GraduationCap',
    description: 'Coursera Plus, Skillshare, LinkedIn Learning & Udemy',
  },
  {
    id: 'adult',
    name: 'Adult',
    icon: 'Flame',
    description: 'Private 18+ streaming & premium access passes',
  },
  {
    id: 'other',
    name: 'Other',
    icon: 'LayoutGrid',
    description: 'Cloud, VPN, Antivirus & Digital Utilities',
  },
];

// Products are fetched dynamically from the backend API.
export const PRODUCTS: Product[] = [];
