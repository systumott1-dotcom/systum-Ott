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
    description: 'Netflix, Prime Video, Hotstar, Zee5, SonyLIV & 20+ more',
  },
  {
    id: 'software',
    name: 'Software & Tools',
    icon: 'Laptop',
    description: 'Adobe Creative Cloud, MS Office 365, Canva Pro, CapCut',
  },
  {
    id: 'combo',
    name: 'Mega Combo Deals',
    icon: 'PackagePlus',
    description: 'All-in-one bundled subscriptions with maximum savings',
  },
  {
    id: 'music',
    name: 'Music Streaming',
    icon: 'Music',
    description: 'Spotify Premium, Apple Music, YouTube Premium, JioSaavn',
  },
  {
    id: 'ai-social',
    name: 'AI & Social Media',
    icon: 'Bot',
    description: 'ChatGPT Plus, Perplexity AI, Midjourney, Reels Bundles',
  },
  {
    id: 'education',
    name: 'Education & Learning',
    icon: 'GraduationCap',
    description: 'Coursera Plus, LinkedIn Learning, edX, DataCamp',
  },
  {
    id: 'gaming',
    name: 'Gaming & Passes',
    icon: 'Gamepad2',
    description: 'Xbox Game Pass, Discord Nitro, Steam, Minecraft',
  },
  {
    id: 'vpn',
    name: 'VPN & Privacy',
    icon: 'ShieldCheck',
    description: 'NordVPN, Surfshark, ExpressVPN, AdGuard Premium',
  },
  {
    id: 'dev',
    name: 'Developer & Design',
    icon: 'Code2',
    description: 'GitHub Copilot, Canva Pro, Figma, Envato Elements',
  },
];

// Products are now fetched dynamically from the backend API.
// This empty array serves as a fallback only.
export const PRODUCTS: Product[] = [];
