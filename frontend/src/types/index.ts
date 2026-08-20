export type CategoryId = 'all' | 'ott' | 'software' | 'combo' | 'music' | 'adult' | 'other';

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
  validityDays?: number;
  warrantyDays?: number;
  warrantyType?: string; // e.g. "Full-Term Replacement", "No Warranty / As-Is"
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
  tags?: string[];
  plans: ProductPlan[];
  features: string[];
  instantDelivery: boolean;
  warrantyDays: number;
  hasWarranty?: boolean;
  warrantyType?: 'Full-Term Replacement' | '7 Days Replacement' | 'No Warranty / As-Is' | string;
  accountType: 'Private Account' | 'Shared Profile' | 'Digital License' | 'Family Invite' | string;
  compatibility: string[]; // e.g. ["Smart TV", "Mobile", "Laptop", "Tablet"]
  rating: number;
  reviewsCount: number;
  inStock?: boolean;
  displayOrder?: number;
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

export interface OrderHistoryItem {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  items: Array<{
    productId?: string;
    productTitle: string;
    planName: string;
    validity?: string;
    price: number;
    quantity: number;
  }>;
  totalAmount: number;
  purchaseDate: string;
  expiryDate: string;
  warrantyType?: string;
  utrNumber?: string;
  status: 'PENDING_VERIFICATION' | 'DELIVERED' | 'CANCELLED';
  deliveryCredentials?: string;
  createdAt: string;
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
