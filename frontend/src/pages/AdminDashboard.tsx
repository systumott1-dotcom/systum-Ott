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
  Image as ImageIcon,
  Search,
  Copy,
  Check,
  ExternalLink,
  Camera
} from 'lucide-react';
import type { Product, ProductPlan } from '../types';
import { CATEGORIES } from '../data/products';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import { useToast } from '../context/ToastContext';

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
  paymentScreenshotUrl?: string;
  status: 'PENDING_VERIFICATION' | 'DELIVERED' | 'CANCELLED';
  deliveryCredentials?: string;
  deliveryNotes?: string;
  purchaseDate?: string;
  expiryDate?: string;
  warrantyType?: string;
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
  const toast = useToast();
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
    warrantyType: 'Full-Term Replacement',
    hasWarranty: true,
    warrantyDays: 30,
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
  const [orderLookupInput, setOrderLookupInput] = useState('');
  const [searchedOrder, setSearchedOrder] = useState<OrderData | null>(null);
  const [isSearchingOrder, setIsSearchingOrder] = useState(false);
  const [copiedReceiptId, setCopiedReceiptId] = useState<string | null>(null);
  const [viewScreenshotUrl, setViewScreenshotUrl] = useState<string | null>(null);

  // Coupons State
  const [coupons, setCoupons] = useState<CouponData[]>([]);
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponType, setNewCouponType] = useState<'percentage' | 'flat'>('percentage');
  const [newCouponValue, setNewCouponValue] = useState(10);
  const [newCouponMin, setNewCouponMin] = useState(0);

  // Lock background scroll when any modal is open
  useBodyScrollLock(isAddProductModalOpen || Boolean(deliveryModalOrder) || Boolean(viewScreenshotUrl));

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
        warrantyType: productForm.warrantyType,
        warrantyDays: Number(productForm.warrantyDays) || 30,
        hasWarranty: productForm.warrantyType !== 'No Warranty / As-Is',
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
          toast.success(`"${productForm.title}" updated successfully! 🎉`);
        } else {
          toast.error(data.message || 'Failed to update product');
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
          toast.success(`"${productForm.title}" created successfully! 🚀`);
        } else {
          toast.error(data.message || 'Failed to create product');
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
        warrantyType: 'Full-Term Replacement',
        hasWarranty: true,
        warrantyDays: 30,
        plans: [
          { name: '1 Month Access', validity: '30 Days', originalPrice: 649, discountedPrice: 99, isPopular: true },
          { name: '3 Months Access', validity: '90 Days', originalPrice: 1799, discountedPrice: 269 },
        ],
        featuresText: '4K Ultra HD\nPersonal Screen PIN\n100% Replacement Warranty',
      });
    } catch (err: any) {
      console.error('Save product error:', err);
      toast.error(err?.message || 'Failed to save product. Backend server is starting up or unreachable.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = (id: string) => {
    toast.showConfirm({
      title: 'Delete Product?',
      message: 'Are you sure you want to permanently delete this product? It will be removed from the store.',
      confirmText: 'Yes, Delete',
      cancelText: 'Cancel',
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/products/${id}`, {
            method: 'DELETE',
            headers: apiHeaders(),
          });
          const data = await res.json();
          if (data.success) {
            setProducts((prev) => prev.filter((p) => p.id !== id));
            toast.success('Product deleted successfully');
          } else {
            toast.error(data.message || 'Failed to delete product');
          }
        } catch {
          toast.error('Network error while deleting product.');
        }
      },
    });
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
      warrantyType: product.warrantyType || (product.hasWarranty !== false ? 'Full-Term Replacement' : 'No Warranty / As-Is'),
      hasWarranty: product.hasWarranty !== false,
      warrantyDays: product.warrantyDays || 30,
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

      toast.success(`Order #${deliveryModalOrder.id} delivered via WhatsApp! 📲`);
      setDeliveryModalOrder(null);
      setCredentialsInput('');
    } catch {
      toast.error('Failed to dispatch delivery.');
    }
  };

  // Dedicated Order ID Lookup
  const handleLookupOrder = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanId = orderLookupInput.trim().replace(/^#/, '');
    if (!cleanId) {
      toast.warning('Please enter an Order ID to lookup (e.g. 45432)');
      return;
    }

    setIsSearchingOrder(true);
    try {
      // Local match first
      const localMatch = orders.find(
        (o) => o.id === cleanId || o.id === `#${cleanId}` || o.id.toLowerCase().includes(cleanId.toLowerCase())
      );
      if (localMatch) {
        setSearchedOrder(localMatch);
        toast.success(`Found Order #${localMatch.id}! 📦`);
        setIsSearchingOrder(false);
        return;
      }

      // API fetch
      const res = await fetch(`/api/admin/orders/${cleanId}`, {
        headers: apiHeaders(),
      });
      const data = await res.json();
      if (data.success && (data.order || data.data)) {
        const found = data.order || data.data;
        setSearchedOrder(found);
        toast.success(`Found Order #${found.id}! 📦`);
      } else {
        toast.error(`No order found matching ID #${cleanId}`);
        setSearchedOrder(null);
      }
    } catch {
      toast.error('Failed to lookup order');
    } finally {
      setIsSearchingOrder(false);
    }
  };

  const handleUpdateStatusDirect = async (
    orderId: string,
    newStatus: 'PENDING_VERIFICATION' | 'DELIVERED' | 'CANCELLED'
  ) => {
    try {
      await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: apiHeaders(),
        body: JSON.stringify({ status: newStatus }),
      });

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );

      if (searchedOrder && searchedOrder.id === orderId) {
        setSearchedOrder({ ...searchedOrder, status: newStatus });
      }

      toast.success(`Order #${orderId} marked as ${newStatus}!`);
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleCopyOrderReceipt = (order: OrderData) => {
    const itemsList = order.items.map((i) => `${i.productTitle} (${i.planName}) x ${i.quantity}`).join(', ');
    const receipt = `*🎉 ORDER DETAILS #${order.id}*\n\nCustomer: ${order.customerName}\nPhone: +91 ${order.customerPhone}\nItems: ${itemsList}\nAmount: ₹${order.totalAmount}\nStatus: ${order.status}\n${order.utrNumber ? `UTR: ${order.utrNumber}\n` : ''}${order.deliveryCredentials ? `Credentials: ${order.deliveryCredentials}\n` : ''}`;
    navigator.clipboard.writeText(receipt);
    setCopiedReceiptId(order.id);
    toast.success(`Order #${order.id} receipt copied! 📋`);
    setTimeout(() => setCopiedReceiptId(null), 2000);
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
        toast.success(`Coupon "${newCouponCode}" created successfully! 🏷️`);
        setNewCouponCode('');
        setNewCouponValue(10);
        setNewCouponMin(0);
      } else {
        toast.error(data.message || 'Failed to create coupon');
      }
    } catch {
      toast.error('Failed to create coupon.');
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
      if (data.success) {
        toast.success(`Test email sent to ${user?.email || 'admin'}! 📬`);
      } else {
        toast.error(`Email failed: ${data.message || 'Check Resend configuration'}`);
      }
    } catch {
      toast.error('Email service error.');
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
                    warrantyType: 'Full-Term Replacement',
                    hasWarranty: true,
                    warrantyDays: 30,
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

                    {/* Warranty & Replacement Settings */}
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                          <Shield className="w-4 h-4 text-brand-600" />
                          <span>Warranty & Replacement Policy</span>
                        </label>
                        <span className="text-[10px] text-slate-500 font-semibold">Type custom or select preset</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2">
                          <label className="text-[11px] font-bold text-slate-600 block mb-1">
                            Warranty Title / Details (Type Manually)
                          </label>
                          <input
                            type="text"
                            list="warranty-presets"
                            value={productForm.warrantyType}
                            onChange={(e) => setProductForm({ ...productForm, warrantyType: e.target.value })}
                            placeholder="e.g. 100% Full-Term Replacement, 7 Days Warranty, No Warranty..."
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                          />
                          <datalist id="warranty-presets">
                            <option value="100% Full-Term Replacement Warranty" />
                            <option value="Full-Term Replacement Warranty" />
                            <option value="7 Days Replacement Warranty" />
                            <option value="30 Days Replacement Warranty" />
                            <option value="1 Year Replacement Warranty" />
                            <option value="Lifetime Replacement Guarantee" />
                            <option value="No Warranty / As-Is (Non-Replaceable)" />
                          </datalist>

                          {/* Quick selection tags */}
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {[
                              'Full-Term Replacement',
                              '7 Days Warranty',
                              '30 Days Warranty',
                              'No Warranty / As-Is',
                            ].map((preset) => (
                              <button
                                key={preset}
                                type="button"
                                onClick={() => setProductForm({ ...productForm, warrantyType: preset })}
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border transition-colors ${
                                  productForm.warrantyType === preset
                                    ? 'bg-brand-50 text-brand-700 border-brand-300'
                                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                                }`}
                              >
                                {preset}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-slate-600 block mb-1">Warranty Period (Days)</label>
                          <input
                            type="number"
                            value={productForm.warrantyDays}
                            onChange={(e) => setProductForm({ ...productForm, warrantyDays: Number(e.target.value) })}
                            placeholder="e.g. 30, 90, 365"
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white font-mono"
                          />
                          <span className="text-[10px] text-slate-400 mt-1 block">
                            Set 0 for non-warranty products
                          </span>
                        </div>
                      </div>
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
          <div className="space-y-6">
            
            {/* Header & Order Lookup Tool */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
                    <Search className="w-5 h-5 text-brand-600" />
                    <span>Order Lookup & Search Tool</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Paste any numeric Order ID (e.g. 45432) to instantly retrieve customer details, purchased items, and delivery status.
                  </p>
                </div>
              </div>

              <form onSubmit={handleLookupOrder} className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={orderLookupInput}
                    onChange={(e) => setOrderLookupInput(e.target.value)}
                    placeholder="Enter or Paste Order ID (e.g. 45432 or #45432)..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSearchingOrder}
                  className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-extrabold shadow-md flex items-center gap-1.5 shrink-0 disabled:opacity-50"
                >
                  {isSearchingOrder ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  <span>Find Order</span>
                </button>
                {searchedOrder && (
                  <button
                    type="button"
                    onClick={() => { setSearchedOrder(null); setOrderLookupInput(''); }}
                    className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold shrink-0"
                  >
                    Clear
                  </button>
                )}
              </form>
            </div>

            {/* SEARCHED ORDER DETAIL VIEW */}
            {searchedOrder && (
              <div className="bg-gradient-to-br from-brand-50/60 via-white to-indigo-50/40 rounded-2xl border-2 border-brand-300 p-6 shadow-md space-y-4 animate-in zoom-in-98 duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-brand-200 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center font-mono font-black text-sm shadow-xs">
                      #{searchedOrder.id}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-base">
                        Order #{searchedOrder.id} Details
                      </h4>
                      <span className="text-xs text-slate-500">
                        Placed on {new Date(searchedOrder.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Status Badges & Quick Action */}
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-extrabold px-3 py-1 rounded-full border ${
                      searchedOrder.status === 'DELIVERED'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : searchedOrder.status === 'CANCELLED'
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {searchedOrder.status.replace('_', ' ')}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyOrderReceipt(searchedOrder)}
                      className="px-3 py-1 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 flex items-center gap-1 shadow-2xs"
                    >
                      {copiedReceiptId === searchedOrder.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedReceiptId === searchedOrder.id ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                {/* Customer Info Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-4 rounded-xl border border-slate-200 text-xs">
                  <div>
                    <span className="text-slate-400 font-bold block mb-0.5">Customer Name:</span>
                    <strong className="text-slate-900 text-sm">{searchedOrder.customerName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block mb-0.5">WhatsApp Number:</span>
                    <a
                      href={`https://wa.me/91${searchedOrder.customerPhone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-700 font-mono font-bold text-sm hover:underline flex items-center gap-1"
                    >
                      <span>+91 {searchedOrder.customerPhone}</span>
                      <ExternalLink className="w-3 h-3 text-emerald-600" />
                    </a>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block mb-0.5">Email / Gmail:</span>
                    <span className="text-slate-700 font-semibold">{searchedOrder.customerEmail || 'Not provided'}</span>
                  </div>
                </div>

                {/* Items in Order */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 block">
                    Purchased Subscriptions:
                  </span>
                  <div className="divide-y divide-slate-100">
                    {searchedOrder.items.map((item, i) => (
                      <div key={i} className="py-2 flex items-center justify-between text-xs">
                        <div>
                          <strong className="text-slate-900 block text-sm">{item.productTitle}</strong>
                          <span className="text-slate-500 font-medium">{item.planName} · Qty: {item.quantity}</span>
                        </div>
                        <span className="font-black text-slate-900 text-sm">₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between font-extrabold text-sm text-slate-900">
                    <span>Total Paid</span>
                    <span className="text-base text-emerald-600 font-black">₹{searchedOrder.totalAmount}</span>
                  </div>
                </div>

                  {/* Purchase Date, Expiry Date & Warranty Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 bg-slate-50 p-3 rounded-xl border border-slate-100 text-[11px] my-2">
                    <div>
                      <span className="text-slate-400 font-bold block mb-0.5">📅 Purchase Date:</span>
                      <strong className="text-slate-800">{searchedOrder.purchaseDate || new Date(searchedOrder.createdAt).toLocaleDateString()}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold block mb-0.5">⏳ Expiry Date:</span>
                      <strong className="text-emerald-700 font-extrabold">{searchedOrder.expiryDate || '30 Days Validity'}</strong>
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <span className="text-slate-400 font-bold block mb-0.5">🛡️ Warranty:</span>
                      <strong className="text-brand-700">{searchedOrder.warrantyType || 'Full Replacement'}</strong>
                    </div>
                  </div>

                  {/* UTR, Credentials & Screenshot */}
                  {(searchedOrder.utrNumber || searchedOrder.deliveryCredentials || searchedOrder.paymentScreenshotUrl) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      {searchedOrder.utrNumber && (
                        <div className="bg-white p-3 rounded-xl border border-slate-200">
                          <span className="text-slate-400 font-bold block mb-0.5">UPI UTR / Reference:</span>
                          <strong className="font-mono text-slate-900">{searchedOrder.utrNumber}</strong>
                        </div>
                      )}
                      {searchedOrder.paymentScreenshotUrl && (
                        <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                          <div>
                            <span className="text-slate-400 font-bold block mb-0.5">Payment Proof:</span>
                            <span className="text-emerald-700 font-extrabold">Screenshot Uploaded</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setViewScreenshotUrl(searchedOrder.paymentScreenshotUrl!)}
                            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs"
                          >
                            <Camera className="w-3.5 h-3.5 text-emerald-600" />
                            <span>View Proof</span>
                          </button>
                        </div>
                      )}
                      {searchedOrder.deliveryCredentials && (
                        <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-200 font-mono text-emerald-900 col-span-1 sm:col-span-2">
                          <span className="text-emerald-700 font-bold block mb-0.5 font-sans">Delivered Credentials:</span>
                          <pre className="whitespace-pre-wrap">{searchedOrder.deliveryCredentials}</pre>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Quick Actions */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    <button
                      onClick={() => { setDeliveryModalOrder(searchedOrder); setCredentialsInput(searchedOrder.deliveryCredentials || ''); }}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-extrabold shadow-md flex items-center gap-1.5"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>{searchedOrder.deliveryCredentials ? 'Update / Resend via WhatsApp' : 'Deliver via WhatsApp'}</span>
                    </button>

                    <button
                      onClick={() => handleUpdateStatusDirect(searchedOrder.id, 'DELIVERED')}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                    >
                      Mark DELIVERED
                    </button>

                    <button
                      onClick={() => handleUpdateStatusDirect(searchedOrder.id, 'CANCELLED')}
                      className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold"
                    >
                      Mark CANCELLED
                    </button>
                  </div>
                </div>
              )}

              {/* All Orders List Header */}
              <div className="flex items-center justify-between pt-2">
                <h4 className="text-sm font-extrabold text-slate-900">
                  All Orders ({orders.length})
                </h4>
              </div>

              {orders.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
                  <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <h4 className="text-lg font-bold text-slate-600">No orders yet</h4>
                  <p className="text-sm text-slate-400">Orders will appear here when customers make purchases.</p>
                </div>
              ) : (
                orders.map((order) => (
                  <div key={order.id} className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-xs transition-shadow">
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
                        <p className="text-xs text-slate-500 mt-1">{order.customerName} · +91 {order.customerPhone}</p>
                      </div>
                      <span className="text-lg font-black text-slate-900">₹{order.totalAmount}</span>
                    </div>

                    {order.items.map((item, i) => (
                      <div key={i} className="text-xs text-slate-600 bg-slate-50 px-3 py-2 rounded-lg mb-1">
                        {item.productTitle} — {item.planName} — ₹{item.price} × {item.quantity}
                      </div>
                    ))}

                    {/* Purchase Date, Expiry Date & Warranty Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 bg-slate-50 p-3 rounded-xl border border-slate-100 text-[11px] my-2">
                      <div>
                        <span className="text-slate-400 font-bold block mb-0.5">📅 Purchase Date:</span>
                        <strong className="text-slate-800">{order.purchaseDate || new Date(order.createdAt).toLocaleDateString()}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 font-bold block mb-0.5">⏳ Expiry Date:</span>
                        <strong className="text-emerald-700 font-extrabold">{order.expiryDate || '30 Days Validity'}</strong>
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <span className="text-slate-400 font-bold block mb-0.5">🛡️ Warranty:</span>
                        <strong className="text-brand-700">{order.warrantyType || 'Full Replacement'}</strong>
                      </div>
                    </div>

                    {order.utrNumber && (
                      <div className="text-xs text-slate-500 mt-2">
                        UTR: <span className="font-mono font-bold text-slate-700">{order.utrNumber}</span>
                      </div>
                    )}

                    {order.paymentScreenshotUrl && (
                      <div className="mt-2 flex items-center justify-between bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100">
                        <span className="text-xs text-emerald-800 font-bold flex items-center gap-1.5">
                          <Camera className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Payment Screenshot Attached</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setViewScreenshotUrl(order.paymentScreenshotUrl!)}
                          className="px-2.5 py-1 bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold flex items-center gap-1 shadow-2xs"
                        >
                          <span>View Proof</span>
                        </button>
                      </div>
                    )}

                    {order.deliveryCredentials && (
                      <div className="text-xs text-emerald-700 bg-emerald-50 p-2 rounded-lg mt-2 font-mono">
                        Delivered: {order.deliveryCredentials}
                      </div>
                    )}

                  <div className="flex flex-wrap gap-2 mt-3 pt-2 border-t border-slate-100">
                    <button onClick={() => { setDeliveryModalOrder(order); setCredentialsInput(order.deliveryCredentials || ''); }}
                      className="flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold shadow-md">
                      <MessageCircle className="w-3.5 h-3.5" /> {order.deliveryCredentials ? 'Update / Resend WhatsApp' : 'Deliver via WhatsApp'}
                    </button>
                    <button onClick={() => handleCopyOrderReceipt(order)}
                      className="flex items-center gap-1 px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold">
                      <Copy className="w-3.5 h-3.5" /> Copy Receipt
                    </button>
                  </div>
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

      {/* Payment Screenshot Full Viewer Modal */}
      {viewScreenshotUrl && (
        <div 
          className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-200" 
          onClick={() => setViewScreenshotUrl(null)}
        >
          <div 
            className="relative max-w-3xl w-full bg-slate-900 rounded-3xl p-5 overflow-hidden border border-slate-700 shadow-2xl animate-in zoom-in-95 duration-200" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-white">
              <span className="font-extrabold text-sm flex items-center gap-2">
                <Camera className="w-4 h-4 text-emerald-400" />
                Customer UPI Payment Screenshot
              </span>
              <button 
                onClick={() => setViewScreenshotUrl(null)} 
                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="mt-4 flex justify-center max-h-[75vh] overflow-auto rounded-2xl bg-black/40 p-2">
              <img 
                src={viewScreenshotUrl} 
                alt="Customer Payment Screenshot" 
                className="max-w-full h-auto object-contain rounded-xl shadow-lg" 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
