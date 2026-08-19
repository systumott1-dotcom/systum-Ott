import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  TrendingUp, 
  Package, 
  ShoppingBag, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  Trash2, 
  Edit3, 
  MessageCircle, 
  Tag, 
  Shield, 
  ArrowLeft, 
  LogOut, 
  DollarSign,
  Mail,
  UploadCloud
} from 'lucide-react';
import type { Product, ProductPlan } from '../types';
import { PRODUCTS as INITIAL_PRODUCTS } from '../data/products';

interface AdminStats {
  totalRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  deliveredOrders: number;
  productsCount: number;
}

interface OrderData {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  items: Array<{ productId: string; productTitle: string; planName: string; price: number; quantity: number }>;
  totalAmount: number;
  utrNumber?: string;
  status: 'PENDING_VERIFICATION' | 'DELIVERED' | 'CANCELLED';
  deliveryCredentials?: string;
  deliveryNotes?: string;
  createdAt: string;
}

interface CouponData {
  code: string;
  type: 'percentage' | 'flat';
  value: number;
  minOrderValue: number;
  isActive: boolean;
}

interface AdminDashboardProps {
  onBackToStore: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBackToStore }) => {
  const { user, logout, token } = useAuth();
  const [activeTab, setActiveTab] = useState<'stats' | 'products' | 'orders' | 'coupons'>('stats');

  // Stats State
  const [stats, setStats] = useState<AdminStats>({
    totalRevenue: 12450,
    totalOrders: 28,
    pendingOrders: 3,
    deliveredOrders: 25,
    productsCount: INITIAL_PRODUCTS.length,
  });

  // Products State
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State for Add/Edit Product
  const [productForm, setProductForm] = useState({
    title: '',
    category: 'ott',
    shortDescription: '',
    accountType: 'Private Screen PIN',
    badge: 'Popular',
    iconColor: '#7c3aed',
    iconName: 'Tv',
    imageUrl: '',
    sourceVendor: 'Eneba / Direct Wholesale',
    plans: [
      { name: '1 Month Access', validity: '30 Days', originalPrice: 649, discountedPrice: 99, isPopular: true },
      { name: '3 Months Access', validity: '90 Days', originalPrice: 1799, discountedPrice: 269 },
    ],
    featuresText: '4K Ultra HD\nPersonal Screen PIN\n100% Replacement Warranty',
  });

  // Orders State
  const [orders, setOrders] = useState<OrderData[]>([
    {
      id: 'SO-ORD-902114',
      customerName: 'Aman Verma',
      customerPhone: '9876543210',
      customerEmail: 'aman@gmail.com',
      items: [
        {
          productId: 'netflix-4k-uhd',
          productTitle: 'Netflix 4K Ultra HD',
          planName: '1 Month Access',
          price: 99,
          quantity: 1,
        },
      ],
      totalAmount: 99,
      utrNumber: '423891029381',
      status: 'PENDING_VERIFICATION',
      createdAt: new Date(Date.now() - 1800000).toISOString(),
    },
    {
      id: 'SO-ORD-902112',
      customerName: 'Pooja Hegde',
      customerPhone: '9123456780',
      customerEmail: 'pooja@outlook.com',
      items: [
        {
          productId: 'adobe-creative-cloud',
          productTitle: 'Adobe Creative Cloud All Apps',
          planName: '1 Month Access',
          price: 449,
          quantity: 1,
        },
      ],
      totalAmount: 449,
      utrNumber: '423891992110',
      status: 'DELIVERED',
      deliveryCredentials: 'Email: pooja@outlook.com (Invite activated on personal ID)',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ]);

  // Selected Order for Delivery Credentials Dispatch
  const [deliveryModalOrder, setDeliveryModalOrder] = useState<OrderData | null>(null);
  const [credentialsInput, setCredentialsInput] = useState('');
  const [sendEmailCheck, setSendEmailCheck] = useState(true);

  // Coupons State
  const [coupons, setCoupons] = useState<CouponData[]>([
    { code: 'EXTRA10', type: 'percentage', value: 10, minOrderValue: 0, isActive: true },
    { code: 'SUPER50', type: 'flat', value: 50, minOrderValue: 500, isActive: true },
    { code: 'SYSTUM20', type: 'percentage', value: 20, minOrderValue: 200, isActive: true },
  ]);
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponType, setNewCouponType] = useState<'percentage' | 'flat'>('percentage');
  const [newCouponValue, setNewCouponValue] = useState(10);
  const [newCouponMin, setNewCouponMin] = useState(0);

  // Fetch live stats and data from backend if available
  useEffect(() => {
    if (!token) return;

    fetch('/api/admin/stats', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.stats) setStats(d.stats);
      })
      .catch(() => {});

    fetch('/api/admin/orders', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.orders) setOrders(d.orders);
      })
      .catch(() => {});
  }, [token]);

  // Handle Add / Edit Product
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const features = productForm.featuresText.split('\n').filter((f) => f.trim().length > 0);

    if (editingProduct) {
      // Update existing
      const updated: Product = {
        ...editingProduct,
        title: productForm.title,
        category: productForm.category as any,
        shortDescription: productForm.shortDescription,
        accountType: productForm.accountType,
        badge: productForm.badge,
        iconColor: productForm.iconColor,
        iconName: productForm.iconName,
        imageUrl: productForm.imageUrl,
        features,
        plans: productForm.plans as ProductPlan[],
      };
      setProducts((prev) => prev.map((p) => (p.id === editingProduct.id ? updated : p)));
    } else {
      // Create new
      const newId = productForm.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30) + `-${Date.now().toString().slice(-4)}`;
      const newProd: Product = {
        id: newId,
        slug: newId,
        title: productForm.title,
        category: productForm.category as any,
        shortDescription: productForm.shortDescription,
        accountType: productForm.accountType,
        badge: productForm.badge,
        iconColor: productForm.iconColor,
        iconName: productForm.iconName,
        imageUrl: productForm.imageUrl,
        instantDelivery: true,
        warrantyDays: 30,
        compatibility: ['Smart TV', 'Android / iOS', 'PC / Mac'],
        features,
        plans: productForm.plans as ProductPlan[],
        rating: 5.0,
        reviewsCount: 1,
      };
      setProducts((prev) => [newProd, ...prev]);
    }

    setIsAddProductModalOpen(false);
    setEditingProduct(null);
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
    }
  };

  // Order Delivery Dispatch via WhatsApp & Resend Email
  const handleDispatchDelivery = () => {
    if (!deliveryModalOrder) return;

    const updatedOrders = orders.map((o) =>
      o.id === deliveryModalOrder.id
        ? { ...o, status: 'DELIVERED' as const, deliveryCredentials: credentialsInput }
        : o
    );
    setOrders(updatedOrders);

    // Prepare WhatsApp credentials text
    let waMsg = `*🎉 YOUR SYSTUM OTT SUBSCRIPTION IS READY!*\n\n`;
    waMsg += `Hi ${deliveryModalOrder.customerName},\n`;
    waMsg += `Here are your access details for Order #${deliveryModalOrder.id}:\n\n`;
    waMsg += `*🔑 Access Credentials:*\n${credentialsInput}\n\n`;
    waMsg += `*🛡️ Warranty:* 100% Full-Term Replacement.\n`;
    waMsg += `If you face any issues, simply reply to this WhatsApp chat!\n\n`;
    waMsg += `Thank you for choosing *Systum OTT India*!`;

    const waUrl = `https://wa.me/${deliveryModalOrder.customerPhone}?text=${encodeURIComponent(waMsg)}`;
    window.open(waUrl, '_blank');

    setDeliveryModalOrder(null);
    setCredentialsInput('');
  };

  // Add Coupon
  const handleAddCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode.trim()) return;
    const newC: CouponData = {
      code: newCouponCode.toUpperCase().trim(),
      type: newCouponType,
      value: Number(newCouponValue),
      minOrderValue: Number(newCouponMin),
      isActive: true,
    };
    setCoupons((prev) => [newC, ...prev]);
    setNewCouponCode('');
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans">
      
      {/* Top Admin Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            <div className="flex items-center gap-4">
              <button
                onClick={onBackToStore}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Storefront</span>
              </button>

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white font-extrabold text-xs">
                  SO
                </div>
                <div>
                  <h1 className="text-sm font-extrabold text-slate-900 leading-tight">
                    Systum OTT <span className="text-brand-600">Admin Portal</span>
                  </h1>
                  <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Live Sourcing & Delivery Manager
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <Shield className="w-3.5 h-3.5 text-brand-600" />
                <span className="font-bold text-slate-800">{user?.email || 'admin@systumott.in'}</span>
              </div>

              <button
                onClick={() => {
                  logout();
                  onBackToStore();
                }}
                className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold flex items-center gap-1.5 border border-rose-200 transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-grow">
        
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-4 mb-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'stats'
                ? 'bg-brand-600 text-white shadow-md'
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Dashboard Stats</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 relative ${
              activeTab === 'orders'
                ? 'bg-brand-600 text-white shadow-md'
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Orders & UPI Verification</span>
            {orders.filter((o) => o.status === 'PENDING_VERIFICATION').length > 0 && (
              <span className="bg-amber-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-black animate-pulse">
                {orders.filter((o) => o.status === 'PENDING_VERIFICATION').length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'products'
                ? 'bg-brand-600 text-white shadow-md'
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Product & Plan Manager</span>
            <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 rounded-full font-bold">
              {products.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('coupons')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'coupons'
                ? 'bg-brand-600 text-white shadow-md'
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <Tag className="w-4 h-4" />
            <span>Coupon Engine</span>
          </button>
        </div>

        {/* TAB 1: OVERVIEW STATS */}
        {activeTab === 'stats' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="white-card bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase mb-2">
                  <span>Total Revenue</span>
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-3xl font-black text-slate-900">
                  ₹{stats.totalRevenue.toLocaleString()}
                </div>
                <div className="text-xs text-emerald-600 font-semibold mt-1">
                  +18% from last week
                </div>
              </div>

              <div className="white-card bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase mb-2">
                  <span>Total Orders</span>
                  <ShoppingBag className="w-4 h-4 text-brand-600" />
                </div>
                <div className="text-3xl font-black text-slate-900">
                  {orders.length}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Instant UPI & WhatsApp activations
                </div>
              </div>

              <div className="white-card bg-white p-6 rounded-3xl border border-amber-200 bg-amber-50/20 shadow-xs">
                <div className="flex items-center justify-between text-amber-700 text-xs font-bold uppercase mb-2">
                  <span>Pending Delivery</span>
                  <Clock className="w-4 h-4 text-amber-600" />
                </div>
                <div className="text-3xl font-black text-amber-900">
                  {orders.filter((o) => o.status === 'PENDING_VERIFICATION').length}
                </div>
                <div className="text-xs text-amber-700 font-semibold mt-1">
                  Requires credential dispatch
                </div>
              </div>

              <div className="white-card bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase mb-2">
                  <span>Active Catalog</span>
                  <Package className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="text-3xl font-black text-slate-900">
                  {products.length}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  OTT, Software & Combo Packs
                </div>
              </div>
            </div>

            {/* Quick Reseller & Sourcing Info */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-3">
              <h3 className="font-extrabold text-base text-slate-900">
                Multi-Channel Sourcing & Fulfillment Status
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                You are operating in dual mode: <strong>Direct Retail Reseller</strong> & <strong>Wholesale Aggregator</strong>. 
                Licenses sourced from Eneba, corporate distributor allocations, and shared group slots are automatically tracked here.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs">
                  <div className="text-slate-400 font-bold text-[10px] uppercase">Primary Wholesaler</div>
                  <div className="font-bold text-slate-900 mt-0.5">Eneba & Regional Distributors</div>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs">
                  <div className="text-slate-400 font-bold text-[10px] uppercase">Default Support Desk</div>
                  <div className="font-bold text-emerald-700 mt-0.5">+91 93060 22703</div>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs">
                  <div className="text-slate-400 font-bold text-[10px] uppercase">Delivery Speed Target</div>
                  <div className="font-bold text-brand-700 mt-0.5">&lt; 5 Minutes per Order</div>
                </div>
              </div>

              {/* Resend Email Status */}
              <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 text-xs text-slate-700">
                  <Mail className="w-4 h-4 text-brand-600" />
                  <span>Resend Email Forwarding: <strong>onboarding@resend.dev</strong> &rarr; <strong>systumott1@gmail.com</strong></span>
                </div>
                <button
                  onClick={async () => {
                    alert('Sending test email to systumott1@gmail.com via Resend...');
                    try {
                      const r = await fetch('/api/admin/test-email', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                        body: JSON.stringify({ email: 'systumott1@gmail.com' }),
                      });
                      const d = await r.json();
                      if (d.success) {
                        alert('✅ Test email successfully dispatched to systumott1@gmail.com!');
                      } else {
                        alert(`❌ Resend Error: ${d.message}`);
                      }
                    } catch (e: any) {
                      alert('Check network connection or backend server.');
                    }
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 text-xs font-bold transition-all shrink-0 flex items-center gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Send Test Email</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ORDERS & UPI VERIFICATION */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">Customer Orders & Verification</h2>
                <p className="text-xs text-slate-500">Verify customer UPI UTRs and dispatch credentials on WhatsApp</p>
              </div>
            </div>

            <div className="white-card bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="p-4">Order ID & Date</th>
                      <th className="p-4">Customer</th>
                      <th className="p-4">Items</th>
                      <th className="p-4">Amount & UTR</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-4 font-mono font-bold text-slate-900">
                          <div>{order.id}</div>
                          <div className="text-[10px] text-slate-400 font-normal">
                            {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="font-bold text-slate-900">{order.customerName}</div>
                          <div className="text-emerald-700 font-semibold flex items-center gap-1">
                            <MessageCircle className="w-3 h-3" />
                            <span>{order.customerPhone}</span>
                          </div>
                          {order.customerEmail && (
                            <div className="text-slate-400 text-[10px]">{order.customerEmail}</div>
                          )}
                        </td>
                        <td className="p-4">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="font-medium text-slate-800">
                              • {item.productTitle} <span className="text-slate-500">({item.planName})</span> x{item.quantity}
                            </div>
                          ))}
                        </td>
                        <td className="p-4">
                          <div className="text-base font-black text-slate-900">₹{order.totalAmount}</div>
                          <div className="text-[11px] font-mono text-slate-500">
                            UTR: <strong className="text-slate-900">{order.utrNumber || 'Awaiting'}</strong>
                          </div>
                        </td>
                        <td className="p-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                              order.status === 'DELIVERED'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : order.status === 'PENDING_VERIFICATION'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            {order.status === 'DELIVERED' ? (
                              <CheckCircle2 className="w-3 h-3" />
                            ) : (
                              <Clock className="w-3 h-3" />
                            )}
                            {order.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => {
                              setDeliveryModalOrder(order);
                              setCredentialsInput(
                                order.deliveryCredentials ||
                                  `Email / ID: ${order.customerEmail || 'customer@ott.com'}\nPassword / PIN: SystumPass#2026\nProfile: Screen 1\nValidity: 30 Days`
                              );
                            }}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition-all inline-flex items-center gap-1.5"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>{order.status === 'DELIVERED' ? 'Resend' : 'Deliver'}</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PRODUCT & PLAN MANAGER */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">Product & Pricing Catalog</h2>
                <p className="text-xs text-slate-500">Create subscriptions, modify plan prices, and manage stock</p>
              </div>

              <button
                onClick={() => {
                  setEditingProduct(null);
                  setProductForm({
                    title: '',
                    category: 'ott',
                    shortDescription: '',
                    accountType: 'Private Screen PIN',
                    badge: 'Hot Deal',
                    iconColor: '#7c3aed',
                    iconName: 'Tv',
                    imageUrl: '',
                    sourceVendor: 'Eneba Wholesale',
                    plans: [
                      { name: '1 Month Access', validity: '30 Days', originalPrice: 649, discountedPrice: 99, isPopular: true },
                    ],
                    featuresText: '4K Ultra HD\n100% Replacement Warranty',
                  });
                  setIsAddProductModalOpen(true);
                }}
                className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold flex items-center gap-2 shadow-md transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Subscription</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {products.map((prod) => (
                <div key={prod.id} className="white-card bg-white p-5 rounded-3xl border border-slate-200 flex flex-col justify-between shadow-xs">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="bg-brand-50 text-brand-700 text-[10px] font-bold px-2 py-0.5 rounded border border-brand-200">
                        {prod.category.toUpperCase()}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{prod.accountType}</span>
                    </div>

                    <h3 className="font-extrabold text-base text-slate-900">{prod.title}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1 mb-4">{prod.shortDescription}</p>

                    <div className="space-y-1.5 border-t border-slate-100 pt-3 mb-4">
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Available Plans:</div>
                      {prod.plans.map((pl, i) => (
                        <div key={i} className="flex justify-between items-center text-xs">
                          <span className="text-slate-700 font-medium">{pl.name}</span>
                          <div>
                            <span className="text-slate-400 line-through text-[11px] mr-1">₹{pl.originalPrice}</span>
                            <span className="font-bold text-emerald-600">₹{pl.discountedPrice}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setEditingProduct(prod);
                        setProductForm({
                          title: prod.title,
                          category: prod.category,
                          shortDescription: prod.shortDescription,
                          accountType: prod.accountType,
                          badge: prod.badge || '',
                          iconColor: prod.iconColor,
                          iconName: prod.iconName,
                          imageUrl: prod.imageUrl || '',
                          sourceVendor: 'Eneba / Direct Licensee',
                          plans: prod.plans,
                          featuresText: prod.features.join('\n'),
                        });
                        setIsAddProductModalOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-brand-600" />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() => handleDeleteProduct(prod.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: COUPON ENGINE */}
        {activeTab === 'coupons' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">Discount Coupons & Offers</h2>
                <p className="text-xs text-slate-500">Create promotional promo codes for customers</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Add Coupon Box */}
              <form onSubmit={handleAddCoupon} className="white-card bg-white p-6 rounded-3xl border border-slate-200 space-y-4 shadow-xs">
                <h3 className="font-extrabold text-sm text-slate-900">Create Promo Code</h3>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Coupon Code</label>
                  <input
                    type="text"
                    required
                    value={newCouponCode}
                    onChange={(e) => setNewCouponCode(e.target.value)}
                    placeholder="e.g. SYSTUM50"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs uppercase font-mono font-bold focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Type</label>
                    <select
                      value={newCouponType}
                      onChange={(e) => setNewCouponType(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="flat">Flat Amount (₹)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Discount Value</label>
                    <input
                      type="number"
                      required
                      value={newCouponValue}
                      onChange={(e) => setNewCouponValue(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Min Order Value (₹)</label>
                  <input
                    type="number"
                    value={newCouponMin}
                    onChange={(e) => setNewCouponMin(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-md transition-all"
                >
                  Create Coupon
                </button>
              </form>

              {/* Coupon List */}
              <div className="lg:col-span-2 space-y-3">
                {coupons.map((c) => (
                  <div key={c.code} className="white-card bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between gap-4 shadow-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-extrabold text-sm text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded border border-brand-200">
                          {c.code}
                        </span>
                        <span className="text-xs font-bold text-emerald-600">
                          {c.type === 'percentage' ? `${c.value}% OFF` : `₹${c.value} FLAT OFF`}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">
                        Min Order: ₹{c.minOrderValue} • Status: Active
                      </div>
                    </div>

                    <button
                      onClick={() => setCoupons((prev) => prev.filter((item) => item.code !== c.code))}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete coupon"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* DISPATCH DELIVERY MODAL */}
      {deliveryModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="white-card bg-white border border-slate-200 rounded-3xl w-full max-w-lg shadow-2xl p-6 relative">
            <button
              onClick={() => setDeliveryModalOrder(null)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500"
            >
              <XCircle className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-extrabold text-slate-900 mb-1">
              Dispatch Credentials for {deliveryModalOrder.id}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Customer: <strong>{deliveryModalOrder.customerName}</strong> ({deliveryModalOrder.customerPhone})
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Access Credentials / Activation Keys
                </label>
                <textarea
                  rows={4}
                  value={credentialsInput}
                  onChange={(e) => setCredentialsInput(e.target.value)}
                  placeholder="Email, Password, PIN, Profile slot, or License key..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:bg-white focus:border-brand-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="emailSendCheck"
                  checked={sendEmailCheck}
                  onChange={(e) => setSendEmailCheck(e.target.checked)}
                  className="rounded text-brand-600"
                />
                <label htmlFor="emailSendCheck" className="text-xs text-slate-700 font-semibold cursor-pointer">
                  Also trigger Resend email confirmation (if email provided)
                </label>
              </div>

              <button
                onClick={handleDispatchDelivery}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Mark Delivered & Open WhatsApp Delivery Link</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT PRODUCT MODAL */}
      {isAddProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="white-card bg-white border border-slate-200 rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 relative">
            <button
              onClick={() => {
                setIsAddProductModalOpen(false);
                setEditingProduct(null);
              }}
              className="absolute top-5 right-5 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500"
            >
              <XCircle className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-extrabold text-slate-900 mb-1">
              {editingProduct ? 'Edit Subscription Product' : 'Add New Subscription'}
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Fill in product details, pricing plans, and Cloudinary image URL
            </p>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  value={productForm.title}
                  onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                  placeholder="e.g. Disney+ Hotstar Super 4K"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none"
                  >
                    <option value="ott">OTT Apps</option>
                    <option value="software">Software & Tools</option>
                    <option value="combo">Mega Combo Deals</option>
                    <option value="music">Music Streaming</option>
                    <option value="ai-social">AI & Social</option>
                    <option value="education">Education</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Account Type</label>
                  <input
                    type="text"
                    value={productForm.accountType}
                    onChange={(e) => setProductForm({ ...productForm, accountType: e.target.value })}
                    placeholder="e.g. Private Screen PIN"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Short Description</label>
                <textarea
                  rows={2}
                  required
                  value={productForm.shortDescription}
                  onChange={(e) => setProductForm({ ...productForm, shortDescription: e.target.value })}
                  placeholder="Brief description for product cards..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Product Image (Cloudinary Upload or Paste URL)
                </label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={productForm.imageUrl}
                      onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
                      placeholder="https://res.cloudinary.com/... or upload below"
                      className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-brand-500"
                    />
                    <label className="px-3.5 py-2 bg-brand-50 hover:bg-brand-100 border border-brand-200 text-brand-700 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1.5 transition-colors shrink-0">
                      <UploadCloud className="w-4 h-4" />
                      <span>Upload File</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;

                          const reader = new FileReader();
                          reader.onloadend = async () => {
                            const base64 = reader.result as string;
                            try {
                              const res = await fetch('/api/admin/upload-image', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                                body: JSON.stringify({ imageBase64: base64, folder: 'systum_ott_products' }),
                              });
                              const d = await res.json();
                              if (d.success && d.imageUrl) {
                                setProductForm((prev) => ({ ...prev, imageUrl: d.imageUrl }));
                                alert('✅ Image uploaded to Cloudinary successfully!');
                              } else {
                                alert('❌ Upload failed: ' + (d.message || 'Error'));
                              }
                            } catch (err) {
                              alert('Upload failed. Check backend connection.');
                            }
                          };
                          reader.readAsDataURL(file);
                        }}
                      />
                    </label>
                  </div>

                  {productForm.imageUrl && (
                    <div className="flex items-center gap-3 p-2 bg-slate-50 border border-slate-200 rounded-xl">
                      <img
                        src={productForm.imageUrl}
                        alt="Preview"
                        className="w-10 h-10 object-cover rounded-lg border border-slate-200"
                      />
                      <span className="text-[11px] text-emerald-600 font-bold truncate">
                        Cloudinary Image Attached
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Features (One per line)</label>
                <textarea
                  rows={3}
                  value={productForm.featuresText}
                  onChange={(e) => setProductForm({ ...productForm, featuresText: e.target.value })}
                  placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-brand-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-extrabold text-xs shadow-lg shadow-brand-600/25"
              >
                {editingProduct ? 'Save Changes' : 'Publish Subscription'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
