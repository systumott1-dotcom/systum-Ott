import { useState } from 'react';
import { CartProvider } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useProducts } from './hooks/useProducts';
import type { CategoryId } from './types';
import { AnnouncementBar } from './components/AnnouncementBar';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { CategoryBrowser } from './components/CategoryBrowser';
import { ComboHighlights } from './components/ComboHighlights';
import { ProductGrid } from './components/ProductGrid';
import { HowItWorks } from './components/HowItWorks';
import { TrustFeatures } from './components/TrustFeatures';
import { LegalDisclosureBanner } from './components/LegalDisclosureBanner';
import { ReviewsSection } from './components/ReviewsSection';
import { FAQSection } from './components/FAQSection';
import { Footer } from './components/Footer';
import { ProductQuickViewModal } from './components/ProductQuickViewModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { PolicyModals } from './components/PolicyModals';
import type { PolicyType } from './components/PolicyModals';
import { WhatsAppFloatingButton } from './components/WhatsAppFloatingButton';
import { AuthModal } from './components/AuthModal';
import { AdminDashboard } from './pages/AdminDashboard';

function Storefront() {
  const { isAdmin, setIsAuthModalOpen, setAuthModalTab } = useAuth();
  const { products, loading: productsLoading } = useProducts();
  const [activeCategory, setActiveCategory] = useState<CategoryId>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activePolicy, setActivePolicy] = useState<PolicyType>(null);
  const [currentView, setCurrentView] = useState<'store' | 'admin'>('store');

  const handleExploreShop = () => {
    const shop = document.getElementById('shop-section');
    if (shop) {
      shop.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (currentView === 'admin') {
    if (!isAdmin) {
      setAuthModalTab('admin');
      setIsAuthModalOpen(true);
      setCurrentView('store');
    } else {
      return <AdminDashboard onBackToStore={() => setCurrentView('store')} />;
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-brand-500 selection:text-white">
      <AnnouncementBar />

      <Navbar
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenPolicy={(policy) => setActivePolicy(policy)}
        onOpenAdmin={() => setCurrentView('admin')}
      />

      <main className="flex-grow">
        <Hero onExploreClick={handleExploreShop} />

        <CategoryBrowser
          activeCategory={activeCategory}
          onSelectCategory={setActiveCategory}
        />

        <ComboHighlights products={products} />

        <ProductGrid
          products={products}
          loading={productsLoading}
          activeCategory={activeCategory}
          onSelectCategory={setActiveCategory}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <LegalDisclosureBanner onOpenPolicy={(policy) => setActivePolicy(policy)} />
        <HowItWorks />
        <TrustFeatures />
        <ReviewsSection />
        <FAQSection />
      </main>

      <Footer
        onSelectCategory={setActiveCategory}
        onOpenPolicy={(policy) => setActivePolicy(policy)}
      />

      <ProductQuickViewModal />
      <CartDrawer />
      <CheckoutModal />
      <AuthModal />
      <PolicyModals
        activePolicy={activePolicy}
        onClose={() => setActivePolicy(null)}
      />
      <WhatsAppFloatingButton />
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Storefront />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
