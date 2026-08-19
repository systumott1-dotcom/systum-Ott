export type CategoryId = 'all' | 'ott' | 'software' | 'combo' | 'music' | 'ai-social' | 'education';

export interface Category {
  id: CategoryId;
  name: string;
  icon: string;
  description: string;
  count?: number;
}

export interface ProductPlan {
  name: string;
  validity: string;
  originalPrice: number;
  discountedPrice: number;
  devices?: string;
  isPopular?: boolean;
}

export interface Product {
  id: string;
  slug: string;
  title: string;
  category: CategoryId;
  shortDescription: string;
  fullDescription?: string;
  badge?: string; // e.g. "Bestseller", "Hot Deal", "90% OFF", "Private Account"
  iconColor: string;
  iconName: string; // Lucide icon or custom vector identifier
  imageUrl?: string;
  plans: ProductPlan[];
  features: string[];
  instantDelivery: boolean;
  warrantyDays: number;
  accountType: 'Private Account' | 'Shared Profile' | 'Digital License' | 'Family Invite' | string;
  compatibility: string[]; // e.g. ["Smart TV", "Mobile", "Laptop", "Tablet"]
  rating: number;
  reviewsCount: number;
}

export interface CartItem {
  productId: string;
  productTitle: string;
  category: CategoryId;
  planName: string;
  validity: string;
  price: number;
  originalPrice: number;
  quantity: number;
  accountType: string;
}

export interface Review {
  id: string;
  author: string;
  location: string;
  avatar: string;
  rating: number;
  date: string;
  productPurchased: string;
  comment: string;
  verified: boolean;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'general' | 'delivery' | 'payments' | 'troubleshooting';
}
