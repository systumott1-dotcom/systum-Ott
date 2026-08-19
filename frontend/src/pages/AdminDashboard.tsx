import React, { useState, useEffect, useCallback } from 'react';
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
  Loader2,
  Image as ImageIcon
} from 'lucide-react';
import type { Product, ProductPlan } from '../types';
import { CATEGORIES } from '../data/products';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';

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
  const [saving, setSaving] = useState(false);

  // Stats State
  const [stats, setStats] = useState<AdminStats>({
    totalRevenue: 0, totalOrders: 0, pendingOrders: 0, deliveredOrders: 0, productsCount: 0,
  });

  // Products State
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
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
    ] as ProductPlan[],
    featuresText: '4K Ultra HD\nPersonal Screen PIN\n100% Replacement Warranty',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploadingImage, setUploadingImage] = useState(false);

  // Orders State
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [deliveryModalOrder, setDeliveryModalOrder] = useState<OrderData | null>(null);
  const [credentialsInput, setCredentialsInput] = useState('');
  const [sendEmailCheck, setSendEmailCheck] = useState(true);

  // Coupons State
  const [coupons, setCoupons] = useState<CouponData[]>([]);
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponType, setNewCouponType] = useState<'percentage' | 'flat'>('percentage');
  const [newCouponValue, setNewCouponValue] = useState(10);
  const [newCouponMin, setNewCouponMin] = useState(0);

  // Lock background scroll when any modal is open
  useBodyScrollLock(isAddProductModalOpen || Boolean(deliveryModalOrder));

  // API helper
  const apiHeaders = useCallback(() => ({
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }), [token]);

  // Fetch all data on mount
  useEffect(() => {
    if (!token) return;

    // Fetch stats
    fetch('/api/admin/stats', { headers: apiHeaders() })
      .then((r) => r.json())
      .then((d) => { if (d.success && d.stats) setStats(d.stats); })
      .catch(() => {});

    // Fetch orders
    fetch('/api/admin/orders', { headers: apiHeaders() })
      .then((r) => r.json())
      .then((d) => { if (d.success && d.orders) setOrders(d.orders); })
      .catch(() => {});

    // Fetch products
    setProductsLoading(true);
    fetch('/api/admin/products', { headers: apiHeaders() })
      .then((r) => r.json())
      .then((d) => { if (d.success && d.products) setProducts(d.products); })
      .catch(() => {})
      .finally(() => setProductsLoading(false));

    // Fetch coupons
    fetch('/api/admin/coupons', { headers: apiHeaders() })
      .then((r) => r.json())
      .then((d) => { if (d.success && d.coupons) setCoupons(d.coupons); })
      .catch(() => {});
  }, [token, apiHeaders]);

  // Handle image file selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  // Upload image to Cloudinary via backend
  const uploadImage = async (): Promise<string> => {
    if (!imageFile) return productForm.imageUrl;
    setUploadingImage(true);
    try {
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(imageFile);
      });
      const res = await fetch('/api/admin/upload-image', {
        method: 'POST',
        headers: apiHeaders(),
        body: JSON.stringify({ imageBase64: base64 }),
      });
      const data = await res.json();
      if (data.success && data.imageUrl) return data.imageUrl;
      return productForm.imageUrl;
    } catch {
      return productForm.imageUrl;
    } finally {
      setUploadingImage(false);
    }
  };

  // Handle Add / Edit Product
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Upload image first if a new file was selected
      const finalImageUrl = await uploadImage();
      const features = productForm.featuresText.split('\n').filter((f) => f.trim().length > 0);

      const productPayload = {
        title: productForm.title,
        category: productForm.category,
        shortDescription: productForm.shortDescription,
        accountType: productForm.accountType,
        badge: productForm.badge,
        iconColor: productForm.iconColor,
        iconName: productForm.iconName,
        imageUrl: finalImageUrl,
        sourceVendor: productForm.sourceVendor,
        features,
        plans: productForm.plans,
      };

      if (editingProduct) {
        // UPDATE
        const res = await fetch(`/api/admin/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: apiHeaders(),
          body: JSON.stringify(productPayload),
        });
        const data = await res.json();
        if (data.success && data.product) {
          setProducts((prev) => prev.map((p) => (p.id === editingProduct.id ? data.product : p)));
        }
      } else {
        // CREATE
        const res = await fetch('/api/admin/products', {
          method: 'POST',
          headers: apiHeaders(),
          body: JSON.stringify(productPayload),
        });
        const data = await res.json();
        if (data.success && data.product) {
          setProducts((prev) => [data.product, ...prev]);
        }
      }

      // Reset form
      setIsAddProductModalOpen(false);
      setEditingProduct(null);
      setImageFile(null);
      setImagePreview('');
      setProductForm({
        title: '', category: 'ott', shortDescription: '', accountType: 'Private Screen PIN',
        badge: 'Popular', iconColor: '#7c3aed', iconName: 'Tv', imageUrl: '',
        sourceVendor: 'Eneba / Direct Wholesale',
        plans: [
          { name: '1 Month Access', validity: '30 Days', originalPrice: 649, discountedPrice: 99, isPopular: true },
          { name: '3 Months Access', validity: '90 Days', originalPrice: 1799, discountedPrice: 269 },
        ],
        featuresText: '4K Ultra HD\nPersonal Screen PIN\n100% Replacement Warranty',
      });
    } catch (err) {
      console.error('Save product error:', err);
      alert('Failed to save product. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
        headers: apiHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
      }
    } catch {
      alert('Failed to delete product.');
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      title: product.title,
      category: product.category,
      shortDescription: product.shortDescription,
      accountType: product.accountType,
      badge: product.badge || '',
      iconColor: product.iconColor,
      iconName: product.iconName,
      imageUrl: product.imageUrl || '',
      sourceVendor: 'Eneba / Direct Wholesale',
      plans: [...product.plans],
      featuresText: product.features.join('\n'),
    });
    setImagePreview(product.imageUrl || '');
    setImageFile(null);
    setIsAddProductModalOpen(true);
  };

  // Order Delivery Dispatch via WhatsApp & Resend Email
  const handleDispatchDelivery = async () => {
    if (!deliveryModalOrder) return;
    try {
      await fetch(`/api/admin/orders/${deliveryModalOrder.id}/status`, {
        method: 'PATCH',
        headers: apiHeaders(),
        body: JSON.stringify({
          status: 'DELIVERED',
          deliveryCredentials: credentialsInput,
          sendEmailNotification: sendEmailCheck,
        }),
      });

      setOrders((prev) =>
        prev.map((o) =>
          o.id === deliveryModalOrder.id
            ? { ...o, status: 'DELIVERED' as const, deliveryCredentials: credentialsInput }
            : o
        )
      );

      // Open WhatsApp
      let waMsg = `*🎉 YOUR SYSTUM OTT SUBSCRIPTION IS READY!*\n\n`;
      waMsg += `Hi ${deliveryModalOrder.customerName},\n`;
      waMsg += `Here are your access details for Order #${deliveryModalOrder.id}:\n\n`;
      waMsg += `*🔑 Access Credentials:*\n${credentialsInput}\n\n`;
      waMsg += `*🛡️ Warranty:* 100% Full-Term Replacement.\n`;
      waMsg += `If you face any issues, simply reply to this WhatsApp chat!\n\n`;
      waMsg += `— Team Systum OTT India`;
      const encodedMsg = encodeURIComponent(waMsg);
      const phone = deliveryModalOrder.customerPhone.replace(/\D/g, '');
      const waUrl = `https://wa.me/91${phone}?text=${encodedMsg}`;
      window.open(waUrl, '_blank');

      setDeliveryModalOrder(null);
      setCredentialsInput('');
    } catch {
      alert('Failed to dispatch delivery.');
    }
  };

  // Add Coupon
  const handleAddCoupon = async () => {
    if (!newCouponCode.trim()) return;
    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: apiHeaders(),
        body: JSON.stringify({
          code: newCouponCode,
          type: newCouponType,
          value: newCouponValue,
          minOrderValue: newCouponMin,
        }),
      });
      const data = await res.json();
      if (data.success && data.coupon) {
        setCoupons((prev) => [...prev, data.coupon]);
        setNewCouponCode('');
        setNewCouponValue(10);
        setNewCouponMin(0);
      }
    } catch {
      alert('Failed to create coupon.');
    }
  };

  // Send Test Email
  const handleTestEmail = async () => {
    try {
      const res = await fetch('/api/admin/test-email', {
        method: 'POST',
        headers: apiHeaders(),
        body: JSON.stringify({ email: user?.email }),
      });
      const data = await res.json();
      alert(data.success ? `Test email sent to ${user?.email}!` : `Email failed: ${data.message}`);
    } catch {
      alert('Email service error.');
    }
  };

  const tabs = [
    { id: 'stats' as const, label: 'Dashboard', icon: TrendingUp },
    { id: 'products' as const, label: 'Products', icon: Package },
    { id: 'orders' as const, label: 'Orders', icon: ShoppingBag },
    { id: 'coupons' as const, label: 'Coupons', icon: Tag },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Admin Bar */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={onBackToStore} className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-brand-600 font-semibold">
            <ArrowLeft className="w-4 h-4" /> Back to Store
          </button>
          <div className="h-5 w-px bg-slate-200" />
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-brand-600" />
            <span className="text-sm font-extrabold text-slate-900">Systum OTT Admin</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleTestEmail} className="text-xs bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg font-bold border border-emerald-200 hover:bg-emerald-100 flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5" /> Test Email
          </button>
          <span className="text-xs text-slate-500">Hi, {user?.name || 'Admin'}</span>
          <button onClick={logout} className="text-xs text-red-600 hover:text-red-700 font-bold flex items-center gap-1">
            <LogOut className="w-3.5 h-3.5" /> Logout
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* STATS TAB */}
        {activeTab === 'stats' && (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { label: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
              { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingBag, color: 'text-blue-600 bg-blue-50 border-blue-200' },
              { label: 'Pending', value: stats.pendingOrders, icon: Clock, color: 'text-amber-600 bg-amber-50 border-amber-200' },
              { label: 'Delivered', value: stats.deliveredOrders, icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
              { label: 'Products', value: stats.productsCount, icon: Package, color: 'text-brand-600 bg-brand-50 border-brand-200' },
            ].map((stat) => (
              <div key={stat.label} className={`rounded-2xl p-5 border ${stat.color} space-y-2`}>
                <stat.icon className="w-5 h-5" />
                <div className="text-2xl font-black">{stat.value}</div>
                <div className="text-[11px] font-semibold opacity-70">{stat.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* PRODUCTS TAB */}
        {activeTab === 'products' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-extrabold text-slate-900">Product Manager</h3>
              <button
                onClick={() => {
                  setEditingProduct(null);
                  setProductForm({
                    title: '', category: 'ott', shortDescription: '', accountType: 'Private Screen PIN',
                    badge: 'Popular', iconColor: '#7c3aed', iconName: 'Tv', imageUrl: '',
                    sourceVendor: 'Eneba / Direct Wholesale',
                    plans: [
                      { name: '1 Month Access', validity: '30 Days', originalPrice: 649, discountedPrice: 99, isPopular: true },
                      { name: '3 Months Access', validity: '90 Days', originalPrice: 1799, discountedPrice: 269 },
                    ],
                    featuresText: '4K Ultra HD\nPersonal Screen PIN\n100% Replacement Warranty',
                  });
                  setImageFile(null);
                  setImagePreview('');
                  setIsAddProductModalOpen(true);
                }}
                className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold shadow-md"
              >
                <Plus className="w-4 h-4" /> Add Product
              </button>
            </div>

            {productsLoading ? (
              <div className="text-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-brand-600 mx-auto mb-3" />
                <p className="text-sm text-slate-500">Loading products...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
                <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h4 className="text-lg font-bold text-slate-600 mb-1">No products yet</h4>
                <p className="text-sm text-slate-400">Click "Add Product" to create your first subscription listing.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((product) => (
                  <div key={product.id} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 hover:shadow-md transition-shadow">
                    {product.imageUrl && (
                      <img src={product.imageUrl} alt={product.title} className="w-full h-32 object-cover rounded-xl" />
                    )}
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{product.title}</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">{product.category} · {product.accountType}</p>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
                        {product.badge || 'Active'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2">{product.shortDescription}</p>
                    <div className="text-xs text-slate-700 font-semibold">
                      Plans: {product.plans.map((p) => `₹${p.discountedPrice}`).join(' / ')}
                    </div>
                    <div className="flex gap-2 pt-2 border-t border-slate-100">
                      <button onClick={() => handleEditProduct(product)} className="flex-1 flex items-center justify-center gap-1 py-2 text-xs font-bold bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-700">
                        <Edit3 className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button onClick={() => handleDeleteProduct(product.id)} className="flex-1 flex items-center justify-center gap-1 py-2 text-xs font-bold bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl text-red-600">
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add/Edit Product Modal */}
            {isAddProductModalOpen && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-extrabold text-slate-900">
                      {editingProduct ? 'Edit Product' : 'Add New Product'}
                    </h3>
                    <button onClick={() => { setIsAddProductModalOpen(false); setEditingProduct(null); }} className="text-slate-400 hover:text-slate-600">
                      <XCircle className="w-6 h-6" />
                    </button>
                  </div>

                  <form onSubmit={handleSaveProduct} className="space-y-4">
                    {/* Image Upload */}
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Product Image</label>
                      <div className="flex items-center gap-4">
                        {(imagePreview || productForm.imageUrl) && (
                          <img src={imagePreview || productForm.imageUrl} alt="Preview" className="w-24 h-24 object-cover rounded-xl border border-slate-200" />
                        )}
                        <label className="flex items-center gap-2 px-4 py-3 bg-slate-50 hover:bg-slate-100 border border-dashed border-slate-300 rounded-xl cursor-pointer text-xs font-bold text-slate-600">
                          <ImageIcon className="w-4 h-4" />
                          {imageFile ? imageFile.name : 'Choose Image'}
                          <input type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
                        </label>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">Title *</label>
                        <input required value={productForm.title} onChange={(e) => setProductForm({...productForm, title: e.target.value})} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500" placeholder="e.g. Netflix 4K Premium" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">Category</label>
                        <select value={productForm.category} onChange={(e) => setProductForm({...productForm, category: e.target.value})} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm">
                          {CATEGORIES.filter(c => c.id !== 'all').map((cat) => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Short Description *</label>
                      <textarea required value={productForm.shortDescription} onChange={(e) => setProductForm({...productForm, shortDescription: e.target.value})} rows={2} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm" placeholder="Brief product description..." />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">Account Type</label>
                        <input value={productForm.accountType} onChange={(e) => setProductForm({...productForm, accountType: e.target.value})} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">Badge</label>
                        <input value={productForm.badge} onChange={(e) => setProductForm({...productForm, badge: e.target.value})} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm" placeholder="e.g. Bestseller, Hot Deal" />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Features (one per line)</label>
                      <textarea value={productForm.featuresText} onChange={(e) => setProductForm({...productForm, featuresText: e.target.value})} rows={3} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm font-mono" placeholder="4K Ultra HD\nPersonal Screen PIN\n100% Warranty" />
                    </div>

                    {/* Plans Editor */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-bold text-slate-700">Pricing Plans</label>
                        <button type="button" onClick={() => setProductForm({...productForm, plans: [...productForm.plans, { name: '', validity: '30 Days', originalPrice: 0, discountedPrice: 0 }]})}
                          className="text-[11px] text-brand-600 font-bold hover:underline">+ Add Plan</button>
                      </div>
                      {productForm.plans.map((plan, i) => (
                        <div key={i} className="grid grid-cols-5 gap-2 mb-2 items-end">
                          <input placeholder="Plan Name" value={plan.name} onChange={(e) => {
                            const updated = [...productForm.plans]; updated[i] = {...updated[i], name: e.target.value}; setProductForm({...productForm, plans: updated});
                          }} className="px-2 py-2 border border-slate-200 rounded-lg text-xs" />
                          <input placeholder="Validity" value={plan.validity} onChange={(e) => {
                            const updated = [...productForm.plans]; updated[i] = {...updated[i], validity: e.target.value}; setProductForm({...productForm, plans: updated});
                          }} className="px-2 py-2 border border-slate-200 rounded-lg text-xs" />
                          <input type="number" placeholder="MRP" value={plan.originalPrice || ''} onChange={(e) => {
                            const updated = [...productForm.plans]; updated[i] = {...updated[i], originalPrice: Number(e.target.value)}; setProductForm({...productForm, plans: updated});
                          }} className="px-2 py-2 border border-slate-200 rounded-lg text-xs" />
                          <input type="number" placeholder="Price" value={plan.discountedPrice || ''} onChange={(e) => {
                            const updated = [...productForm.plans]; updated[i] = {...updated[i], discountedPrice: Number(e.target.value)}; setProductForm({...productForm, plans: updated});
                          }} className="px-2 py-2 border border-slate-200 rounded-lg text-xs" />
                          <button type="button" onClick={() => {
                            const updated = productForm.plans.filter((_, idx) => idx !== i); setProductForm({...productForm, plans: updated});
                          }} className="py-2 text-red-500 hover:text-red-700 text-xs font-bold">Remove</button>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-slate-200">
                      <button type="button" onClick={() => { setIsAddProductModalOpen(false); setEditingProduct(null); }}
                        className="flex-1 py-3 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50">Cancel</button>
                      <button type="submit" disabled={saving || uploadingImage}
                        className="flex-1 py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-extrabold shadow-md flex items-center justify-center gap-2 disabled:opacity-50">
                        {(saving || uploadingImage) && <Loader2 className="w-4 h-4 animate-spin" />}
                        {uploadingImage ? 'Uploading Image...' : saving ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ORDERS TAB */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <h3 className="text-lg font-extrabold text-slate-900 mb-4">Orders & UPI Verification</h3>
            {orders.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
                <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h4 className="text-lg font-bold text-slate-600">No orders yet</h4>
                <p className="text-sm text-slate-400">Orders will appear here when customers make purchases.</p>
              </div>
            ) : (
              orders.map((order) => (
                <div key={order.id} className="bg-white rounded-2xl border border-slate-200 p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-slate-900">#{order.id}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          order.status === 'DELIVERED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : order.status === 'CANCELLED' ? 'bg-red-50 text-red-700 border border-red-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>{order.status.replace('_', ' ')}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{order.customerName} · {order.customerPhone}</p>
                    </div>
                    <span className="text-lg font-black text-slate-900">₹{order.totalAmount}</span>
                  </div>

                  {order.items.map((item, i) => (
                    <div key={i} className="text-xs text-slate-600 bg-slate-50 px-3 py-2 rounded-lg mb-1">
                      {item.productTitle} — {item.planName} — ₹{item.price} × {item.quantity}
                    </div>
                  ))}

                  {order.utrNumber && (
                    <div className="text-xs text-slate-500 mt-2">
                      UTR: <span className="font-mono font-bold text-slate-700">{order.utrNumber}</span>
                    </div>
                  )}

                  {order.deliveryCredentials && (
                    <div className="text-xs text-emerald-700 bg-emerald-50 p-2 rounded-lg mt-2 font-mono">
                      Delivered: {order.deliveryCredentials}
                    </div>
                  )}

                  {order.status === 'PENDING_VERIFICATION' && (
                    <div className="flex gap-2 mt-3">
                      <button onClick={() => { setDeliveryModalOrder(order); setCredentialsInput(''); }}
                        className="flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold shadow-md">
                        <MessageCircle className="w-3.5 h-3.5" /> Deliver via WhatsApp
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}

            {/* Delivery Modal */}
            {deliveryModalOrder && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4">
                  <h3 className="text-lg font-extrabold text-slate-900">Deliver Order #{deliveryModalOrder.id}</h3>
                  <p className="text-xs text-slate-500">Customer: {deliveryModalOrder.customerName} ({deliveryModalOrder.customerPhone})</p>
                  <textarea
                    value={credentialsInput}
                    onChange={(e) => setCredentialsInput(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm font-mono"
                    placeholder="Enter login credentials...\nEmail: user@email.com\nPassword: ****"
                  />
                  <label className="flex items-center gap-2 text-xs text-slate-600">
                    <input type="checkbox" checked={sendEmailCheck} onChange={(e) => setSendEmailCheck(e.target.checked)} />
                    Also send delivery confirmation email
                  </label>
                  <div className="flex gap-3">
                    <button type="button" onClick={() => setDeliveryModalOrder(null)} className="flex-1 py-3 border border-slate-200 rounded-xl text-xs font-bold text-slate-600">Cancel</button>
                    <button onClick={handleDispatchDelivery} disabled={!credentialsInput.trim()} className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-extrabold shadow-md disabled:opacity-50 flex items-center justify-center gap-2">
                      <MessageCircle className="w-4 h-4" /> Send via WhatsApp
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* COUPONS TAB */}
        {activeTab === 'coupons' && (
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 mb-6">Coupon Engine</h3>

            {/* Add Coupon Form */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-6">
              <h4 className="text-sm font-bold text-slate-700 mb-3">Create New Coupon</h4>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 items-end">
                <input value={newCouponCode} onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())} placeholder="Code (e.g. SAVE20)" className="px-3 py-2.5 border border-slate-200 rounded-xl text-xs font-mono" />
                <select value={newCouponType} onChange={(e) => setNewCouponType(e.target.value as any)} className="px-3 py-2.5 border border-slate-200 rounded-xl text-xs">
                  <option value="percentage">Percentage (%)</option>
                  <option value="flat">Flat (₹)</option>
                </select>
                <input type="number" value={newCouponValue} onChange={(e) => setNewCouponValue(Number(e.target.value))} placeholder="Value" className="px-3 py-2.5 border border-slate-200 rounded-xl text-xs" />
                <input type="number" value={newCouponMin} onChange={(e) => setNewCouponMin(Number(e.target.value))} placeholder="Min Order ₹" className="px-3 py-2.5 border border-slate-200 rounded-xl text-xs" />
                <button onClick={handleAddCoupon} className="px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold">Add Coupon</button>
              </div>
            </div>

            {/* Coupons List */}
            {coupons.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
                <Tag className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">No coupons yet. Create one above.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {coupons.map((coupon) => (
                  <div key={coupon.code} className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center justify-between">
                    <div>
                      <span className="text-lg font-black font-mono text-brand-700">{coupon.code}</span>
                      <p className="text-xs text-slate-500 mt-1">
                        {coupon.type === 'percentage' ? `${coupon.value}% off` : `₹${coupon.value} off`}
                        {coupon.minOrderValue > 0 && ` · Min ₹${coupon.minOrderValue}`}
                      </p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                      coupon.isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      {coupon.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
