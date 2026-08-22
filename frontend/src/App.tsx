import { useState, useEffect } from 'react';
import { ToastProvider } from './context/ToastContext';
import { CartProvider } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useProducts } from './hooks/useProducts';
import { useRouter } from './hooks/useRouter';
import type { CategoryId } from './types';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { CategoryBrowser } from './components/CategoryBrowser';
import { ProductGrid } from './components/ProductGrid';
import { HowItWorks } from './components/HowItWorks';
import { TrustFeatures } from './components/TrustFeatures';
import { LegalDisclosureBanner } from './components/LegalDisclosureBanner';
import { ReviewsSection } from './components/ReviewsSection';
import { FAQSection } from './components/FAQSection';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { PolicyModals } from './components/PolicyModals';
import type { PolicyType } from './components/PolicyModals';
import { WhatsAppFloatingButton } from './components/WhatsAppFloatingButton';
import { AuthModal } from './components/AuthModal';
import { ProfileModal } from './components/ProfileModal';
import { AdminDashboard } from './pages/AdminDashboard';
import { ProductPage } from './pages/ProductPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderHistoryModal } from './components/OrderHistoryModal';
import { LivePurchasePopup } from './components/LivePurchasePopup';

function Storefront() {
  const { isAdmin, setIsAuthModalOpen, setAuthModalTab } = useAuth();
  const { products, loading: productsLoading } = useProducts();
  const router = useRouter();

  const [activeCategory, setActiveCategory] = useState<CategoryId>(() => {
    const validCat = router.categoryId as CategoryId;
    return (validCat && ['all', 'ott', 'software', 'combo', 'music', 'adult', 'other'].includes(validCat))
      ? validCat
      : 'all';
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [activePolicy, setActivePolicy] = useState<PolicyType>(null);
  const [isOrderHistoryOpen, setIsOrderHistoryOpen] = useState(false);

  // Sync category from URL (e.g. /category/ott or ?category=software) and smooth scroll to shop
  useEffect(() => {
    if (router.categoryId) {
      const catId = router.categoryId as CategoryId;
      setActiveCategory(catId);
      // Wait slightly for DOM to settle, then scroll to shop section
      const timer = setTimeout(() => {
        const shop = document.getElementById('shop-section');
        if (shop) shop.scrollIntoView({ behavior: 'smooth' });
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [router.categoryId]);

  const handleCategoryChange = (cat: CategoryId) => {
    setActiveCategory(cat);
    if (cat === 'all') {
      if (router.route !== 'home') {
        router.navigate('/');
      } else {
        window.history.pushState({}, '', '/');
      }
    } else {
      if (router.route !== 'home') {
        router.navigate(`/category/${cat}`);
      } else {
        window.history.pushState({}, '', `/category/${cat}`);
      }
    }
  };

  // Immediate pre-warm ping on initial site visit so Render backend is fully awake
  useEffect(() => {
    // Ping health endpoint silently the moment the user opens the website
    fetch('/api/health').catch(() => {});

    // Periodic gentle keep-alive ping every 4.5 minutes while user has the store open
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetch('/api/health').catch(() => {});
      }
    }, 270000);

    return () => clearInterval(interval);
  }, []);

  const handleExploreShop = () => {
    if (router.route !== 'home') {
      router.navigate('/');
      setTimeout(() => {
        const shop = document.getElementById('shop-section');
        if (shop) shop.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const shop = document.getElementById('shop-section');
      if (shop) shop.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (router.route === 'admin') {
    if (!isAdmin) {
      setAuthModalTab('admin');
      setIsAuthModalOpen(true);
      router.navigate('/');
    } else {
      return <AdminDashboard onBackToStore={() => router.navigate('/')} />;
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-brand-500 selection:text-white">
      <Navbar
        products={products}
        activeCategory={activeCategory}
        onSelectCategory={handleCategoryChange}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenPolicy={(policy) => setActivePolicy(policy)}
        onOpenAdmin={() => {
          if (!isAdmin) {
            setAuthModalTab('admin');
            setIsAuthModalOpen(true);
          } else {
            router.navigate('/admin');
          }
        }}
        onOpenOrderHistory={() => setIsOrderHistoryOpen(true)}
      />

      <main className="flex-grow">
        {router.route === 'checkout' ? (
          <CheckoutPage onBackToStore={() => router.navigate('/')} />
        ) : router.route === 'product' && router.productIdOrSlug ? (
          <ProductPage
            productIdOrSlug={router.productIdOrSlug}
            products={products}
            loading={productsLoading}
            onBackToHome={() => router.navigate('/')}
            onNavigateProduct={(slugOrId) => router.navigate(`/product/${slugOrId}`)}
          />
        ) : (
          <>
            <Hero onExploreClick={handleExploreShop} />

            <CategoryBrowser
              activeCategory={activeCategory}
              onSelectCategory={handleCategoryChange}
            />

            <ProductGrid
              products={products}
              loading={productsLoading}
              activeCategory={activeCategory}
              onSelectCategory={handleCategoryChange}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />

            <LegalDisclosureBanner onOpenPolicy={(policy) => setActivePolicy(policy)} />
            <HowItWorks />
            <TrustFeatures />
            <ReviewsSection />
            <FAQSection />
          </>
        )}
      </main>

      <Footer
        onSelectCategory={handleCategoryChange}
        onOpenPolicy={(policy) => setActivePolicy(policy)}
      />

      <CartDrawer />
      <AuthModal />
      <ProfileModal />
      <PolicyModals
        activePolicy={activePolicy}
        onClose={() => setActivePolicy(null)}
      />
      <OrderHistoryModal
        isOpen={isOrderHistoryOpen}
        onClose={() => setIsOrderHistoryOpen(false)}
      />
      <WhatsAppFloatingButton isElevated={router.route === 'product' || router.route === 'checkout'} />
      <LivePurchasePopup isElevated={router.route === 'product' || router.route === 'checkout'} />
    </div>
  );
}

export function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <Storefront />
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
