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
  Camera,
  Users,
  UserX,
  UserCheck,
  Ban,
  QrCode,
  Sparkles,
  RefreshCw,
  Lock,
  KeyRound,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import type { Product, ProductPlan } from '../types';
import { CATEGORIES } from '../data/products';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import { useToast } from '../context/ToastContext';
import { isAllowedImageFile } from '../utils/imageCompressor';

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

interface AdminUserData {
  id: string;
  _id?: string;
  name: string;
  email: string;
  phone?: string;
  role: 'customer' | 'admin';
  isBanned: boolean;
  bannedAt?: string;
  banReason?: string;
  createdAt: string;
}

interface AdminDashboardProps {
  onBackToStore: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBackToStore }) => {
  const { user, logout, token } = useAuth();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<'stats' | 'products' | 'orders' | 'coupons' | 'users' | 'payment' | 'security'>('stats');
  const [saving, setSaving] = useState(false);

  // Admin Security & Credentials State
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [emailOtp, setEmailOtp] = useState('');
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [isSendingEmailOtp, setIsSendingEmailOtp] = useState(false);
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);

  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [confirmAdminPassword, setConfirmAdminPassword] = useState('');
  const [passwordOtp, setPasswordOtp] = useState('');
  const [passwordOtpSent, setPasswordOtpSent] = useState(false);
  const [isSendingPasswordOtp, setIsSendingPasswordOtp] = useState(false);
  const [isVerifyingPassword, setIsVerifyingPassword] = useState(false);

  // Stats State
  const [stats, setStats] = useState<AdminStats>({
    totalRevenue: 0, totalOrders: 0, pendingOrders: 0, deliveredOrders: 0, productsCount: 0,
  });

  // Payment & Dynamic UPI Settings State
  const [paymentConfig, setPaymentConfig] = useState({
    upiId: 'systummott@nyes',
    payeeName: 'Systum OTT India',
    qrMode: 'dynamic' as 'dynamic' | 'custom',
    customQrUrl: 'https://res.cloudinary.com/juvd58wl/image/upload/v1787206357/systum_ott_assets/systum_ott_official_qr_v2.jpg',
  });
  const [savingPaymentSettings, setSavingPaymentSettings] = useState(false);
  const [testAmount, setTestAmount] = useState(99);

  // Users State
  const [usersList, setUsersList] = useState<AdminUserData[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');

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
    tagsText: 'netflix, 4k, ott, screen pin, instant delivery',
    inStock: true,
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

    // Fetch payment settings
    fetch('/api/settings/payment')
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.paymentConfig?.upiId) {
          setPaymentConfig({
            upiId: d.paymentConfig.upiId,
            payeeName: d.paymentConfig.payeeName || 'Systum OTT India',
            qrMode: d.paymentConfig.qrMode || 'dynamic',
            customQrUrl: d.paymentConfig.customQrUrl || '',
          });
        }
      })
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

    // Fetch registered users
    setUsersLoading(true);
    fetch('/api/admin/users', { headers: apiHeaders() })
      .then((r) => r.json())
      .then((d) => { if (d.success && d.users) setUsersList(d.users); })
      .catch(() => {})
      .finally(() => setUsersLoading(false));
  }, [token, apiHeaders]);

  // Save payment settings
  const handleSavePaymentSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentConfig.upiId.trim()) {
      toast.warning('Please enter a valid UPI ID (e.g. yourname@oksbi)');
      return;
    }
    setSavingPaymentSettings(true);
    try {
      const res = await fetch('/api/settings/payment', {
        method: 'PUT',
        headers: apiHeaders(),
        body: JSON.stringify(paymentConfig),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Active UPI ID updated to ${paymentConfig.upiId}! All checkout QR codes are dynamically updated.`);
      } else {
        toast.error(data.message || 'Failed to update payment settings');
      }
    } catch {
      toast.error('Network error saving payment settings');
    } finally {
      setSavingPaymentSettings(false);
    }
  };

  // Handle image file selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!isAllowedImageFile(file)) {
      toast.error('Invalid file format. Only PNG, JPEG, JPG, and WebP images are allowed.');
      e.target.value = '';
      return;
    }
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
      const tags = productForm.tagsText.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean);

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
        inStock: productForm.inStock !== false,
        features,
        tags,
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
        tagsText: 'netflix, 4k, ott, screen pin, instant delivery',
        inStock: true,
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

  const handleToggleStock = async (id: string, currentInStock: boolean) => {
    const newStockState = !currentInStock;
    try {
      const res = await fetch(`/api/admin/products/${id}/stock`, {
        method: 'PATCH',
        headers: apiHeaders(),
        body: JSON.stringify({ inStock: newStockState }),
      });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) =>
          prev.map((p) => (p.id === id ? { ...p, inStock: newStockState } : p))
        );
        toast.success(newStockState ? 'Product marked as In Stock ✅' : 'Product marked as Out of Stock 🔴');
      } else {
        toast.error(data.message || 'Failed to update stock status');
      }
    } catch {
      toast.error('Network error updating stock status');
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

  // Move product to target position number (1-indexed)
  const handleMoveProduct = async (id: string, targetPosition: number) => {
    const currentIndex = products.findIndex((p) => p.id === id);
    if (currentIndex === -1) return;
    const newIndex = Math.max(0, Math.min(products.length - 1, targetPosition - 1));
    if (currentIndex === newIndex) return;

    // Optimistic UI update
    const updated = [...products];
    const [moved] = updated.splice(currentIndex, 1);
    updated.splice(newIndex, 0, moved);
    setProducts(updated);

    try {
      const res = await fetch(`/api/admin/products/${id}/move`, {
        method: 'PUT',
        headers: apiHeaders(),
        body: JSON.stringify({ targetPosition }),
      });
      const data = await res.json();
      if (data.success && data.products) {
        setProducts(data.products);
        toast.success(data.message || `Moved to #${targetPosition}! ✨`);
      }
    } catch {
      toast.error('Failed to update product position.');
    }
  };

  // Shift product up or down by 1 slot
  const handleShiftProduct = async (id: string, direction: 'up' | 'down') => {
    const currentIndex = products.findIndex((p) => p.id === id);
    if (currentIndex === -1) return;
    const targetPosition = direction === 'up' ? currentIndex : currentIndex + 2;
    if (targetPosition < 1 || targetPosition > products.length) return;
    await handleMoveProduct(id, targetPosition);
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
      tagsText: (product.tags || []).join(', '),
      inStock: product.inStock !== false,
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

  // Delete Order Permanently
  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm(`Are you sure you want to permanently DELETE Order #${orderId}? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'DELETE',
        headers: apiHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        setOrders((prev) => prev.filter((o) => o.id !== orderId));
        if (searchedOrder && searchedOrder.id === orderId) setSearchedOrder(null);
        toast.success(`Order #${orderId} deleted permanently.`);
      } else {
        toast.error(data.message || 'Failed to delete order');
      }
    } catch {
      toast.error('Network error deleting order');
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

  // Delete Coupon
  const handleDeleteCoupon = async (code: string) => {
    if (!confirm(`Are you sure you want to DELETE coupon "${code}"?`)) return;
    try {
      const res = await fetch(`/api/admin/coupons/${code}`, {
        method: 'DELETE',
        headers: apiHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        setCoupons((prev) => prev.filter((c) => c.code !== code));
        toast.success(`Coupon "${code}" deleted successfully.`);
      } else {
        toast.error(data.message || 'Failed to delete coupon');
      }
    } catch {
      toast.error('Network error deleting coupon');
    }
  };

  // Toggle Coupon Active Status
  const handleToggleCoupon = async (code: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/coupons/${code}/toggle`, {
        method: 'PATCH',
        headers: apiHeaders(),
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setCoupons((prev) =>
          prev.map((c) => (c.code === code ? { ...c, isActive: !currentStatus } : c))
        );
        toast.success(`Coupon "${code}" is now ${!currentStatus ? 'Active' : 'Inactive'}.`);
      } else {
        toast.error('Failed to update coupon status');
      }
    } catch {
      toast.error('Network error updating coupon');
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

  // Ban or Unban User
  const handleToggleBan = async (targetUser: AdminUserData) => {
    const newBanStatus = !targetUser.isBanned;
    const confirmMsg = newBanStatus
      ? `Are you sure you want to BAN "${targetUser.name}" (${targetUser.email})? They will not be able to log in or make purchases.`
      : `Are you sure you want to UNBAN "${targetUser.name}"?`;
    if (!confirm(confirmMsg)) return;

    try {
      const targetId = targetUser.id || targetUser._id;
      const res = await fetch(`/api/admin/users/${targetId}/ban`, {
        method: 'PATCH',
        headers: apiHeaders(),
        body: JSON.stringify({ isBanned: newBanStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setUsersList((prev) =>
          prev.map((u) =>
            (u.id === targetId || u._id === targetId) ? { ...u, isBanned: newBanStatus } : u
          )
        );
        toast.success(newBanStatus ? `User ${targetUser.name} has been banned! 🚫` : `User ${targetUser.name} unbanned! ✅`);
      } else {
        toast.error(data.message || 'Failed to update ban status');
      }
    } catch {
      toast.error('Network error updating ban status');
    }
  };

  // Permanently Delete User Account
  const handleDeleteUser = async (targetUser: AdminUserData) => {
    const confirmMsg = `⚠️ PERMANENT ACTION: Are you sure you want to DELETE the account of "${targetUser.name}" (${targetUser.email})? All user data will be permanently removed.`;
    if (!confirm(confirmMsg)) return;

    try {
      const targetId = targetUser.id || targetUser._id;
      const res = await fetch(`/api/admin/users/${targetId}`, {
        method: 'DELETE',
        headers: apiHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        setUsersList((prev) => prev.filter((u) => u.id !== targetId && u._id !== targetId));
        toast.success(`Account of ${targetUser.name} deleted permanently.`);
      } else {
        toast.error(data.message || 'Failed to delete user account');
      }
    } catch {
      toast.error('Network error deleting user account');
    }
  };

  // Admin Security Handlers
  const handleSendEmailOtp = async () => {
    if (!newAdminEmail.trim() || !newAdminEmail.includes('@')) {
      toast.error('Please enter a valid new email address.');
      return;
    }
    setIsSendingEmailOtp(true);
    try {
      const res = await fetch('/api/admin/security/request-otp', {
        method: 'POST',
        headers: apiHeaders(),
        body: JSON.stringify({ action: 'email', newEmail: newAdminEmail.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setEmailOtpSent(true);
        toast.success(data.message || `6-digit security code sent to ${user?.email}`);
      } else {
        toast.error(data.message || 'Failed to send verification code.');
      }
    } catch {
      toast.error('Network error sending security code.');
    } finally {
      setIsSendingEmailOtp(false);
    }
  };

  const handleVerifyChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOtp.trim()) {
      toast.error('Please enter the 6-digit verification code.');
      return;
    }
    setIsVerifyingEmail(true);
    try {
      const res = await fetch('/api/admin/security/verify-change-email', {
        method: 'POST',
        headers: apiHeaders(),
        body: JSON.stringify({ newEmail: newAdminEmail.trim(), otp: emailOtp.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        if (data.token) {
          localStorage.setItem('auth_token', data.token);
        }
        toast.success(data.message || 'Admin email updated successfully! 🎉');
        setEmailOtpSent(false);
        setEmailOtp('');
        setNewAdminEmail('');
        setTimeout(() => window.location.reload(), 1200);
      } else {
        toast.error(data.message || 'Invalid or expired verification code.');
      }
    } catch {
      toast.error('Network error verifying code.');
    } finally {
      setIsVerifyingEmail(false);
    }
  };

  const handleSendPasswordOtp = async () => {
    setIsSendingPasswordOtp(true);
    try {
      const res = await fetch('/api/admin/security/request-otp', {
        method: 'POST',
        headers: apiHeaders(),
        body: JSON.stringify({ action: 'password' }),
      });
      const data = await res.json();
      if (data.success) {
        setPasswordOtpSent(true);
        toast.success(data.message || `6-digit security code sent to ${user?.email}`);
      } else {
        toast.error(data.message || 'Failed to send verification code.');
      }
    } catch {
      toast.error('Network error sending security code.');
    } finally {
      setIsSendingPasswordOtp(false);
    }
  };

  const handleVerifyChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordOtp.trim() || !newAdminPassword.trim()) {
      toast.error('Please enter the verification code and new password.');
      return;
    }
    if (newAdminPassword.length < 6) {
      toast.error('Password must be at least 6 characters long.');
      return;
    }
    if (newAdminPassword !== confirmAdminPassword) {
      toast.error('Passwords do not match. Please re-enter.');
      return;
    }

    setIsVerifyingPassword(true);
    try {
      const res = await fetch('/api/admin/security/verify-change-password', {
        method: 'POST',
        headers: apiHeaders(),
        body: JSON.stringify({ newPassword: newAdminPassword.trim(), otp: passwordOtp.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || 'Admin password updated successfully! 🔒');
        setPasswordOtpSent(false);
        setPasswordOtp('');
        setNewAdminPassword('');
        setConfirmAdminPassword('');
      } else {
        toast.error(data.message || 'Invalid or expired verification code.');
      }
    } catch {
      toast.error('Network error updating password.');
    } finally {
      setIsVerifyingPassword(false);
    }
  };

  const tabs = [
    { id: 'stats' as const, label: 'Dashboard', icon: TrendingUp },
    { id: 'products' as const, label: 'Products', icon: Package },
    { id: 'orders' as const, label: 'Orders', icon: ShoppingBag },
    { id: 'coupons' as const, label: 'Coupons', icon: Tag },
    { id: 'payment' as const, label: 'Payment & UPI', icon: QrCode },
    { id: 'users' as const, label: 'Users & Bans', icon: Users },
    { id: 'security' as const, label: 'Security & Password', icon: KeyRound },
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <Package className="w-5 h-5 text-brand-600" />
                  <span>Product Manager & Numbering</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Change product position numbers below. Storefront displays products in this exact order (#1 = Top 1st item).
                </p>
              </div>
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
                    tagsText: 'netflix, 4k, ott, screen pin, instant delivery',
                    inStock: true,
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
                className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer shrink-0"
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
                {products.map((product, idx) => (
                  <div key={product.id} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 hover:shadow-md transition-shadow relative">
                    
                    {/* Position Numbering & Reorder Controls */}
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 bg-slate-50/70 -mx-5 -mt-5 px-4 pt-3.5 rounded-t-2xl">
                      <div className="flex items-center gap-2">
                        <span className={`flex items-center justify-center px-2 py-0.5 rounded-lg text-white text-[11px] font-black shadow-2xs ${
                          idx === 0 
                            ? 'bg-gradient-to-r from-amber-500 to-orange-500' 
                            : idx === 1 
                            ? 'bg-gradient-to-r from-slate-600 to-slate-700'
                            : 'bg-gradient-to-r from-brand-600 to-indigo-600'
                        }`}>
                          #{idx + 1} {idx === 0 ? '★ 1st' : ''}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500">Display Order</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {/* Position Selector Dropdown */}
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-slate-400 font-bold">Pos:</span>
                          <select
                            value={idx + 1}
                            onChange={(e) => handleMoveProduct(product.id, Number(e.target.value))}
                            className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-[11px] font-extrabold text-brand-700 focus:outline-none focus:ring-1 focus:ring-brand-500 cursor-pointer shadow-2xs"
                            title="Change product ranking number (e.g. choose #1 to move to first place)"
                          >
                            {products.map((_, posIdx) => (
                              <option key={posIdx + 1} value={posIdx + 1}>
                                #{posIdx + 1} {posIdx === 0 ? '(Top 1)' : ''}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Move Up Button */}
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleShiftProduct(product.id, 'up')}
                          className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:text-brand-600 hover:bg-brand-50 disabled:opacity-25 disabled:cursor-not-allowed transition-all shadow-2xs cursor-pointer"
                          title="Move Up by 1 position"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>

                        {/* Move Down Button */}
                        <button
                          type="button"
                          disabled={idx === products.length - 1}
                          onClick={() => handleShiftProduct(product.id, 'down')}
                          className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:text-brand-600 hover:bg-brand-50 disabled:opacity-25 disabled:cursor-not-allowed transition-all shadow-2xs cursor-pointer"
                          title="Move Down by 1 position"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {product.imageUrl && (
                      <img src={product.imageUrl} alt={product.title} className="w-full h-32 object-cover rounded-xl" />
                    )}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{product.title}</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">{product.category} · {product.accountType}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleToggleStock(product.id, product.inStock !== false)}
                          className={`text-[10px] font-black px-2.5 py-1 rounded-full border transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs ${
                            product.inStock !== false
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                              : 'bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100'
                          }`}
                          title="Click to toggle Stock Status"
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${product.inStock !== false ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                          {product.inStock !== false ? 'In Stock' : 'Out of Stock'}
                        </button>
                        {product.badge && (
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
                            {product.badge}
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2">{product.shortDescription}</p>
                    {product.tags && product.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {product.tags.slice(0, 4).map((t, idx) => (
                          <span key={idx} className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                            #{t}
                          </span>
                        ))}
                        {product.tags.length > 4 && (
                          <span className="text-[9px] text-slate-400 font-bold">+{product.tags.length - 4}</span>
                        )}
                      </div>
                    )}
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
                          <input type="file" accept="image/png, image/jpeg, image/jpg, image/webp" onChange={handleImageSelect} className="hidden" />
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

                    {/* SEO & Search Tags */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <Tag className="w-3.5 h-3.5 text-brand-600" />
                          <span>SEO Keywords & Search Tags (Comma separated)</span>
                        </label>
                        <span className="text-[10px] text-slate-400 font-semibold">Boosts Google SEO & store search</span>
                      </div>
                      <input
                        type="text"
                        value={productForm.tagsText}
                        onChange={(e) => setProductForm({ ...productForm, tagsText: e.target.value })}
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                        placeholder="e.g. netflix, 4k ultra hd, private screen, cheap ott, 30 days"
                      />
                      {productForm.tagsText.trim() && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {productForm.tagsText.split(',').map((tag, idx) => {
                            const cleanTag = tag.trim();
                            if (!cleanTag) return null;
                            return (
                              <span key={idx} className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-brand-50 text-brand-700 border border-brand-200 flex items-center gap-1">
                                <span>#{cleanTag}</span>
                              </span>
                            );
                          })}
                        </div>
                      )}
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

                    {/* Stock Status Selector */}
                    <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                      <div>
                        <label className="text-xs font-bold text-slate-800 block">Inventory & Stock Availability</label>
                        <span className="text-[10px] text-slate-500">Controls whether customers can buy this subscription on the storefront</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setProductForm({ ...productForm, inStock: !productForm.inStock })}
                        className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border transition-all flex items-center gap-1.5 cursor-pointer ${
                          productForm.inStock
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                            : 'bg-rose-50 text-rose-700 border-rose-300'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${productForm.inStock ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        {productForm.inStock ? 'In Stock (Available)' : 'Out of Stock (Unavailable)'}
                      </button>
                    </div>

                    {/* Plans Editor */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-xs font-bold text-slate-700 block">Pricing & Validity Plans</label>
                          <span className="text-[10px] text-slate-400">Set custom durations like "1 Month 21 Days", "1 Year 2 Months", "3 Days"</span>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setProductForm({
                              ...productForm,
                              plans: [
                                ...productForm.plans,
                                { name: '', validity: '1 Month 21 Days', originalPrice: 649, discountedPrice: 99, isPopular: false },
                              ],
                            })
                          }
                          className="px-2.5 py-1 bg-brand-50 hover:bg-brand-100 border border-brand-200 rounded-lg text-xs text-brand-700 font-extrabold flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Plan</span>
                        </button>
                      </div>

                      <div className="space-y-3">
                        {productForm.plans.map((plan, i) => (
                          <div key={i} className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-black text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-md border border-brand-200">
                                Plan #{i + 1}
                              </span>
                              <div className="flex items-center gap-2.5">
                                <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={Boolean(plan.isPopular)}
                                    onChange={(e) => {
                                      const updated = [...productForm.plans];
                                      updated[i] = { ...updated[i], isPopular: e.target.checked };
                                      setProductForm({ ...productForm, plans: updated });
                                    }}
                                    className="rounded text-brand-600 focus:ring-brand-500"
                                  />
                                  <span>Popular / Best Value</span>
                                </label>
                                {productForm.plans.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updated = productForm.plans.filter((_, idx) => idx !== i);
                                      setProductForm({ ...productForm, plans: updated });
                                    }}
                                    className="text-rose-500 hover:text-rose-700 text-xs font-bold px-2 py-0.5 hover:bg-rose-50 rounded transition-colors"
                                  >
                                    Remove
                                  </button>
                                )}
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                              <div>
                                <label className="text-[10px] font-bold text-slate-500 block mb-1">Plan Title</label>
                                <input
                                  placeholder="e.g. 1 Month 21 Days Access"
                                  value={plan.name}
                                  onChange={(e) => {
                                    const updated = [...productForm.plans];
                                    updated[i] = { ...updated[i], name: e.target.value };
                                    setProductForm({ ...productForm, plans: updated });
                                  }}
                                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-1 focus:ring-brand-500"
                                />
                              </div>

                              <div>
                                <label className="text-[10px] font-bold text-slate-500 block mb-1">
                                  Custom Validity (e.g. 1 Month 21 Days, 1 Year 2 Months, 3 Days) *
                                </label>
                                <input
                                  required
                                  placeholder="e.g. 1 Month 21 Days"
                                  value={plan.validity}
                                  onChange={(e) => {
                                    const updated = [...productForm.plans];
                                    updated[i] = { ...updated[i], validity: e.target.value };
                                    setProductForm({ ...productForm, plans: updated });
                                  }}
                                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-black text-brand-700 focus:ring-1 focus:ring-brand-500"
                                />
                              </div>
                            </div>

                            {/* Quick Validity Presets */}
                            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                              <span className="text-[10px] font-bold text-slate-400">Quick Presets:</span>
                              {[
                                '3 Days',
                                '7 Days',
                                '15 Days',
                                '1 Month 21 Days',
                                '1 Month',
                                '3 Months',
                                '6 Months',
                                '1 Year 2 Months',
                                '1 Year',
                                'Lifetime'
                              ].map((preset) => (
                                <button
                                  key={preset}
                                  type="button"
                                  onClick={() => {
                                    const updated = [...productForm.plans];
                                    updated[i] = {
                                      ...updated[i],
                                      validity: preset,
                                      name: updated[i].name || `${preset} Access`,
                                    };
                                    setProductForm({ ...productForm, plans: updated });
                                  }}
                                  className="px-2 py-0.5 bg-white hover:bg-brand-50 border border-slate-200 hover:border-brand-300 rounded text-[10px] font-bold text-slate-600 hover:text-brand-700 transition-colors shadow-2xs cursor-pointer"
                                >
                                  {preset}
                                </button>
                              ))}
                            </div>

                            <div className="grid grid-cols-2 gap-2.5 pt-1">
                              <div>
                                <label className="text-[10px] font-bold text-slate-500 block mb-1">Original Price / MRP (₹)</label>
                                <input
                                  type="number"
                                  placeholder="649"
                                  value={plan.originalPrice || ''}
                                  onChange={(e) => {
                                    const updated = [...productForm.plans];
                                    updated[i] = { ...updated[i], originalPrice: Number(e.target.value) };
                                    setProductForm({ ...productForm, plans: updated });
                                  }}
                                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] font-bold text-slate-500 block mb-1">Discounted Selling Price (₹) *</label>
                                <input
                                  type="number"
                                  required
                                  placeholder="99"
                                  value={plan.discountedPrice || ''}
                                  onChange={(e) => {
                                    const updated = [...productForm.plans];
                                    updated[i] = { ...updated[i], discountedPrice: Number(e.target.value) };
                                    setProductForm({ ...productForm, plans: updated });
                                  }}
                                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-black text-brand-700"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
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

                    <div className="flex flex-wrap gap-2 mt-3 pt-2 border-t border-slate-100 items-center">
                      <button
                        onClick={() => { setDeliveryModalOrder(order); setCredentialsInput(order.deliveryCredentials || ''); }}
                        className="flex items-center gap-1.5 px-3.5 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold shadow-md transition-all"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>{order.deliveryCredentials ? 'Update / Resend WhatsApp' : 'Deliver via WhatsApp'}</span>
                      </button>

                      {order.status !== 'DELIVERED' && (
                        <button
                          onClick={() => handleUpdateStatusDirect(order.id, 'DELIVERED')}
                          className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition-all"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Mark Delivered</span>
                        </button>
                      )}

                      {order.status !== 'CANCELLED' && (
                        <button
                          onClick={() => handleUpdateStatusDirect(order.id, 'CANCELLED')}
                          className="flex items-center gap-1.5 px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold transition-all"
                        >
                          <Ban className="w-3.5 h-3.5" />
                          <span>Suspend / Cancel</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleDeleteOrder(order.id)}
                        className="flex items-center gap-1 px-3 py-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold transition-all"
                        title="Permanently delete this order"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>

                      <button
                        onClick={() => handleCopyOrderReceipt(order)}
                        className="flex items-center gap-1 px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all sm:ml-auto"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Receipt</span>
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
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-black font-mono text-brand-700">{coupon.code}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          coupon.isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                          {coupon.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        {coupon.type === 'percentage' ? `${coupon.value}% off` : `₹${coupon.value} off`}
                        {coupon.minOrderValue > 0 && ` · Min ₹${coupon.minOrderValue}`}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleCoupon(coupon.code, coupon.isActive)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                          coupon.isActive
                            ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200'
                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                        }`}
                      >
                        {coupon.isActive ? 'Disable' : 'Enable'}
                      </button>

                      <button
                        onClick={() => handleDeleteCoupon(coupon.code)}
                        className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-all"
                        title="Delete coupon"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PAYMENT & DYNAMIC UPI SETTINGS TAB */}
        {activeTab === 'payment' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <QrCode className="w-6 h-6 text-brand-600" />
                  <span>Payment & Dynamic UPI QR Settings</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Change your active receiving UPI ID anytime. QR codes and checkout payment links update immediately store-wide.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Settings Form */}
              <form onSubmit={handleSavePaymentSettings} className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-6">
                
                {/* Mode Selector */}
                <div>
                  <label className="text-xs font-extrabold text-slate-900 uppercase tracking-wider block mb-2">
                    QR Code Generation Mode
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentConfig({ ...paymentConfig, qrMode: 'dynamic' })}
                      className={`p-4 rounded-2xl border text-left transition-all ${
                        paymentConfig.qrMode === 'dynamic'
                          ? 'border-brand-600 bg-brand-50/70 ring-2 ring-brand-500/20'
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-brand-600" /> Dynamic NPCI QR
                        </span>
                        {paymentConfig.qrMode === 'dynamic' && (
                          <span className="text-[10px] font-black uppercase text-brand-700 bg-brand-100 px-2 py-0.5 rounded-full">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        Auto-generates real-time QR code with customer's exact order price pre-loaded for error-free 1-scan payments.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentConfig({ ...paymentConfig, qrMode: 'custom' })}
                      className={`p-4 rounded-2xl border text-left transition-all ${
                        paymentConfig.qrMode === 'custom'
                          ? 'border-brand-600 bg-brand-50/70 ring-2 ring-brand-500/20'
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
                          <ImageIcon className="w-4 h-4 text-brand-600" /> Custom Static Card
                        </span>
                        {paymentConfig.qrMode === 'custom' && (
                          <span className="text-[10px] font-black uppercase text-brand-700 bg-brand-100 px-2 py-0.5 rounded-full">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        Displays your uploaded custom QR card image from Cloudinary on checkout.
                      </p>
                    </button>
                  </div>
                </div>

                {/* Receiving UPI ID Input */}
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1.5 flex items-center justify-between">
                    <span>Receiving UPI ID *</span>
                    <span className="text-[11px] text-brand-600 font-bold">Live Synced</span>
                  </label>
                  <div className="relative">
                    <input
                      required
                      type="text"
                      value={paymentConfig.upiId}
                      onChange={(e) => setPaymentConfig({ ...paymentConfig, upiId: e.target.value.toLowerCase().replace(/\s+/g, '') })}
                      placeholder="e.g. systummott@nyes or yourname@oksbi"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-mono font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Enter your active VPA address. Supports Paytm, PhonePe, Google Pay, BHIM, Navi, Cred, and Bank handles.
                  </p>
                </div>

                {/* Payee / Store Display Name */}
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1.5">
                    Payee / Merchant Business Name
                  </label>
                  <input
                    type="text"
                    value={paymentConfig.payeeName}
                    onChange={(e) => setPaymentConfig({ ...paymentConfig, payeeName: e.target.value })}
                    placeholder="Systum OTT India"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-900 focus:outline-none focus:bg-white focus:border-brand-500"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Displayed inside customer UPI apps when scanning (e.g. "Paying to Systum OTT India").
                  </p>
                </div>

                {/* Custom QR Image URL (if custom mode) */}
                {paymentConfig.qrMode === 'custom' && (
                  <div>
                    <label className="text-xs font-bold text-slate-800 block mb-1.5">
                      Custom QR Code Image URL (Cloudinary)
                    </label>
                    <input
                      type="url"
                      value={paymentConfig.customQrUrl}
                      onChange={(e) => setPaymentConfig({ ...paymentConfig, customQrUrl: e.target.value })}
                      placeholder="https://res.cloudinary.com/.../qr.jpg"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono text-slate-900 focus:outline-none focus:bg-white focus:border-brand-500"
                    />
                  </div>
                )}

                {/* Save CTA */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">
                    Changes take effect across all checkouts immediately.
                  </span>
                  <button
                    type="submit"
                    disabled={savingPaymentSettings}
                    className="px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-2xl text-xs font-extrabold shadow-lg shadow-brand-600/25 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    {savingPaymentSettings ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 stroke-[2.5]" />
                        <span>Save Payment Settings</span>
                      </>
                    )}
                  </button>
                </div>

              </form>

              {/* Right Column: Live Instant QR Preview */}
              <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <RefreshCw className="w-4 h-4 text-emerald-600" />
                    <span>Real-Time Live QR Preview</span>
                  </span>
                  <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Live Output
                  </span>
                </div>

                <div className="text-center space-y-4">
                  <div className="p-3.5 bg-white rounded-3xl border-2 border-slate-200 shadow-md inline-block max-w-[240px] sm:max-w-[260px]">
                    <img
                      src={
                        paymentConfig.qrMode === 'custom' && paymentConfig.customQrUrl
                          ? paymentConfig.customQrUrl
                          : `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=10&data=${encodeURIComponent(
                              `upi://pay?pa=${paymentConfig.upiId.trim().toLowerCase()}&pn=${encodeURIComponent(
                                paymentConfig.payeeName.trim() || 'Systum OTT India'
                              )}&am=${testAmount}&cu=INR&tn=Subscription%20Order`
                            )}`
                      }
                      alt="Live Generated UPI QR Code"
                      className="w-full h-auto object-contain mx-auto rounded-2xl"
                    />
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-left space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400 font-bold">Target UPI:</span>
                      <span className="font-mono font-extrabold text-brand-700">{paymentConfig.upiId || 'Not set'}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400 font-bold">Payee:</span>
                      <span className="font-bold text-slate-800">{paymentConfig.payeeName || 'Systum OTT India'}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400 font-bold">Mode:</span>
                      <span className="font-bold text-emerald-600">
                        {paymentConfig.qrMode === 'dynamic' ? '⚡ Dynamic NPCI Amount QR' : '🖼️ Static Card'}
                      </span>
                    </div>
                  </div>

                  {/* Test Scan Amount Slider */}
                  <div className="space-y-1.5 text-left pt-2 border-t border-slate-100">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span>Test Dynamic QR Price:</span>
                      <span className="text-brand-600 font-black">₹{testAmount}</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="1999"
                      step="1"
                      value={testAmount}
                      onChange={(e) => setTestAmount(Number(e.target.value))}
                      className="w-full accent-brand-600 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                      <span>₹1 (Test)</span>
                      <span>₹99 (1 Mo)</span>
                      <span>₹269 (3 Mo)</span>
                      <span>₹1999 (Max)</span>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        )}

        {/* USERS & BANS TAB */}
        {activeTab === 'users' && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">User Management & Moderation</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  View registered users, restrict malicious accounts, ban users or permanently delete accounts.
                </p>
              </div>

              {/* User Search Input */}
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  placeholder="Search by name, email, phone..."
                  className="w-full pl-9 pr-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:border-brand-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Users Summary Cards */}
            <div className="grid grid-cols-3 gap-3.5 mb-6">
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
                <div className="flex items-center gap-2 text-brand-600 mb-1">
                  <Users className="w-4 h-4" />
                  <span className="text-xs font-bold text-slate-500">Total Registered</span>
                </div>
                <div className="text-xl sm:text-2xl font-black text-slate-900">{usersList.length}</div>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-emerald-200 shadow-2xs bg-emerald-50/20">
                <div className="flex items-center gap-2 text-emerald-600 mb-1">
                  <UserCheck className="w-4 h-4" />
                  <span className="text-xs font-bold text-slate-500">Active Accounts</span>
                </div>
                <div className="text-xl sm:text-2xl font-black text-emerald-700">
                  {usersList.filter((u) => !u.isBanned).length}
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-rose-200 shadow-2xs bg-rose-50/20">
                <div className="flex items-center gap-2 text-rose-600 mb-1">
                  <UserX className="w-4 h-4" />
                  <span className="text-xs font-bold text-slate-500">Banned Accounts</span>
                </div>
                <div className="text-xl sm:text-2xl font-black text-rose-700">
                  {usersList.filter((u) => u.isBanned).length}
                </div>
              </div>
            </div>

            {/* Users Table / List */}
            {usersLoading ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
                <Loader2 className="w-8 h-8 animate-spin text-brand-600 mx-auto mb-3" />
                <p className="text-sm text-slate-500 font-medium">Loading user directory...</p>
              </div>
            ) : usersList.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
                <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h4 className="text-lg font-bold text-slate-600 mb-1">No users found</h4>
                <p className="text-sm text-slate-400">Registered customers and admins will appear here.</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
                <div className="divide-y divide-slate-100">
                  {usersList
                    .filter((u) => {
                      if (!userSearchQuery.trim()) return true;
                      const q = userSearchQuery.toLowerCase();
                      return (
                        u.name.toLowerCase().includes(q) ||
                        u.email.toLowerCase().includes(q) ||
                        (u.phone && u.phone.includes(q))
                      );
                    })
                    .map((usr) => {
                      const isCurrentUser = usr.email === user?.email;
                      return (
                        <div
                          key={usr.id || usr._id}
                          className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                            usr.isBanned ? 'bg-rose-50/30' : 'hover:bg-slate-50/60'
                          }`}
                        >
                          {/* User Info */}
                          <div className="flex items-center gap-3.5 min-w-0">
                            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-extrabold text-sm shrink-0 ${
                              usr.isBanned
                                ? 'bg-rose-100 text-rose-700 border border-rose-200'
                                : usr.role === 'admin'
                                ? 'bg-brand-100 text-brand-700 border border-brand-200'
                                : 'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}>
                              {usr.name.charAt(0).toUpperCase()}
                            </div>

                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-extrabold text-slate-900 text-sm truncate">{usr.name}</h4>
                                
                                {/* Role Badge */}
                                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                                  usr.role === 'admin'
                                    ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                    : 'bg-blue-50 text-blue-700 border border-blue-200'
                                }`}>
                                  {usr.role.toUpperCase()}
                                </span>

                                {/* Ban Status Badge */}
                                {usr.isBanned ? (
                                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-300 flex items-center gap-1">
                                    <Ban className="w-3 h-3" /> BANNED
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                                    <UserCheck className="w-3 h-3" /> ACTIVE
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-3 text-xs text-slate-500 font-medium mt-1 flex-wrap">
                                <span>{usr.email}</span>
                                {usr.phone && (
                                  <>
                                    <span>·</span>
                                    <span>+91 {usr.phone}</span>
                                  </>
                                )}
                                <span>·</span>
                                <span className="text-slate-400">
                                  Joined {new Date(usr.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          {!isCurrentUser && (
                            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                              {/* Toggle Ban */}
                              <button
                                onClick={() => handleToggleBan(usr)}
                                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                                  usr.isBanned
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                    : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                                }`}
                              >
                                {usr.isBanned ? (
                                  <>
                                    <UserCheck className="w-3.5 h-3.5" />
                                    <span>Unban User</span>
                                  </>
                                ) : (
                                  <>
                                    <Ban className="w-3.5 h-3.5" />
                                    <span>Ban User</span>
                                  </>
                                )}
                              </button>

                              {/* Delete Account */}
                              <button
                                onClick={() => handleDeleteUser(usr)}
                                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 flex items-center gap-1.5 transition-all"
                                title="Permanently delete user account"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Delete</span>
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ADMIN SECURITY & CREDENTIALS TAB */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-brand-600" />
                <span>Admin Security & Credentials Manager</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Manage your administrative login email and master account password. All changes strictly require email OTP verification.
              </p>
            </div>

            {/* Current Account Details Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-700 font-black text-lg shrink-0">
                  {user?.name?.charAt(0) || 'A'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-extrabold text-sm text-slate-900">{user?.name || 'Systum Admin'}</h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                      Master Admin
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-mono font-bold text-slate-700">{user?.email || 'systumott1@gmail.com'}</span>
                  </p>
                </div>
              </div>

              <div className="text-xs text-emerald-700 font-bold bg-emerald-50 px-3.5 py-2 rounded-2xl border border-emerald-200 flex items-center gap-1.5 self-start sm:self-center">
                <Shield className="w-4 h-4 text-emerald-600" />
                <span>OTP Protected & 256-Bit Encrypted</span>
              </div>
            </div>

            {/* 2-Column Grid: Change Email & Change Password */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              
              {/* Box 1: Change Admin Email */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-5">
                <div className="flex items-center gap-2 text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-3">
                  <Mail className="w-4 h-4 text-brand-600" />
                  <span>Change Admin Email Address</span>
                </div>

                <form onSubmit={handleVerifyChangeEmail} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">New Admin Email *</label>
                    <input
                      required
                      type="email"
                      value={newAdminEmail}
                      onChange={(e) => setNewAdminEmail(e.target.value)}
                      placeholder="e.g. newadmin@gmail.com"
                      disabled={emailOtpSent}
                      className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono focus:outline-none focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 disabled:opacity-60"
                    />
                  </div>

                  {!emailOtpSent ? (
                    <button
                      type="button"
                      onClick={handleSendEmailOtp}
                      disabled={isSendingEmailOtp || !newAdminEmail.trim()}
                      className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isSendingEmailOtp ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Sending 6-Digit OTP to Current Email...</span>
                        </>
                      ) : (
                        <>
                          <Mail className="w-4 h-4 text-brand-300" />
                          <span>Send 6-Digit OTP to Current Email</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="space-y-3 p-4 bg-purple-50/70 border border-purple-200/80 rounded-2xl animate-in fade-in duration-200">
                      <div className="flex items-center justify-between text-xs text-purple-900 font-bold">
                        <span>OTP dispatched to {user?.email}</span>
                        <button
                          type="button"
                          onClick={() => setEmailOtpSent(false)}
                          className="text-[11px] text-brand-600 hover:underline"
                        >
                          Change Email
                        </button>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">Enter 6-Digit OTP Code *</label>
                        <input
                          required
                          type="text"
                          maxLength={6}
                          value={emailOtp}
                          onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          placeholder="123456"
                          className="w-full px-3.5 py-2.5 bg-white border border-purple-300 rounded-xl text-center text-lg font-black font-mono tracking-widest text-purple-950 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isVerifyingEmail || emailOtp.length !== 6}
                        className="w-full py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {isVerifyingEmail ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Updating Admin Email...</span>
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4 stroke-[2.5]" />
                            <span>Verify OTP & Update Email</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </form>
              </div>

              {/* Box 2: Change Admin Password */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-5">
                <div className="flex items-center gap-2 text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-3">
                  <Lock className="w-4 h-4 text-brand-600" />
                  <span>Change Admin Master Password</span>
                </div>

                <form onSubmit={handleVerifyChangePassword} className="space-y-4">
                  {!passwordOtpSent ? (
                    <div className="space-y-3">
                      <p className="text-xs text-slate-500">
                        Click below to receive a 6-digit security authorization code on your admin email (<strong className="text-slate-800 font-mono">{user?.email || 'systumott1@gmail.com'}</strong>).
                      </p>

                      <button
                        type="button"
                        onClick={handleSendPasswordOtp}
                        disabled={isSendingPasswordOtp}
                        className="w-full py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {isSendingPasswordOtp ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Sending 6-Digit OTP Code...</span>
                          </>
                        ) : (
                          <>
                            <KeyRound className="w-4 h-4 text-brand-300" />
                            <span>Send Password Reset OTP to Email</span>
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3.5 p-4 bg-purple-50/70 border border-purple-200/80 rounded-2xl animate-in fade-in duration-200">
                      <div className="flex items-center justify-between text-xs text-purple-900 font-bold">
                        <span>OTP dispatched to {user?.email}</span>
                        <button
                          type="button"
                          onClick={() => setPasswordOtpSent(false)}
                          className="text-[11px] text-brand-600 hover:underline"
                        >
                          Resend
                        </button>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">Enter 6-Digit OTP Code *</label>
                        <input
                          required
                          type="text"
                          maxLength={6}
                          value={passwordOtp}
                          onChange={(e) => setPasswordOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          placeholder="123456"
                          className="w-full px-3.5 py-2.5 bg-white border border-purple-300 rounded-xl text-center text-lg font-black font-mono tracking-widest text-purple-950 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">New Password (min 6 chars) *</label>
                        <input
                          required
                          type="password"
                          value={newAdminPassword}
                          onChange={(e) => setNewAdminPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-brand-500"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">Confirm New Password *</label>
                        <input
                          required
                          type="password"
                          value={confirmAdminPassword}
                          onChange={(e) => setConfirmAdminPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-brand-500"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isVerifyingPassword || passwordOtp.length !== 6 || !newAdminPassword || newAdminPassword.length < 6}
                        className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {isVerifyingPassword ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Updating Admin Password...</span>
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4 stroke-[2.5]" />
                            <span>Verify OTP & Change Password</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </form>
              </div>

            </div>
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
