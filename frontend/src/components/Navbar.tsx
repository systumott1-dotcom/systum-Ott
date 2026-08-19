import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Menu, 
  X, 
  Shield, 
  Store, 
  Tv, 
  Laptop, 
  PackagePlus, 
  Music, 
  Flame, 
  Sparkles, 
  User, 
  Sliders,
  ArrowRight
} from 'lucide-react';
import { useCart, WHATSAPP_PHONE } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { WhatsAppIcon } from './WhatsAppIcon';
import type { CategoryId, Product } from '../types';

interface NavbarProps {
  products?: Product[];
  activeCategory: CategoryId;
  onSelectCategory: (id: CategoryId) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenPolicy: (type: 'terms' | 'refund' | 'privacy' | 'dmca' | 'reseller' | 'how-it-works') => void;
  onOpenAdmin: () => void;
  onOpenOrderHistory?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  products = [],
  activeCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  onOpenPolicy,
  onOpenAdmin,
  onOpenOrderHistory,
}) => {
  const { totalItems, setIsCartOpen } = useCart();
  const { user, isAdmin, setIsAuthModalOpen, setAuthModalTab, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus search input when expanded
  useEffect(() => {
    if (isSearchExpanded) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isSearchExpanded]);

  // Collapse search on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setIsSearchExpanded(false);
      }
    };
    if (isSearchExpanded) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isSearchExpanded]);

  // Collapse search on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSearchExpanded(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filter matching products for auto-suggest
  const searchMatches = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return products
      .filter((p) => {
        const matchTitle = p.title.toLowerCase().includes(q);
        const matchDesc = p.shortDescription.toLowerCase().includes(q);
        const matchCat = p.category.toLowerCase().includes(q);
        const matchFeat = p.features?.some((f) => f.toLowerCase().includes(q));
        const matchType = p.accountType?.toLowerCase().includes(q);
        return matchTitle || matchDesc || matchCat || matchFeat || matchType;
      })
      .slice(0, 6);
  }, [products, searchQuery]);

  const handleSelectProduct = (product: Product) => {
    const slug = product.slug || product.id;
    window.history.pushState({}, '', `/product/${slug}`);
    window.dispatchEvent(new PopStateEvent('popstate'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsSearchExpanded(false);
    onSearchChange('');
  };

  const handleViewAllResults = () => {
    setIsSearchExpanded(false);
    const shopSection = document.getElementById('shop-section');
    if (shopSection) {
      shopSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navCategories = [
    { id: 'all' as CategoryId, label: 'All Products', icon: Store },
    { id: 'ott' as CategoryId, label: 'OTT Apps', icon: Tv },
    { id: 'software' as CategoryId, label: 'SOFTWARES', icon: Laptop },
    { id: 'combo' as CategoryId, label: 'COMBO', icon: PackagePlus },
    { id: 'music' as CategoryId, label: 'Music', icon: Music },
    { id: 'adult' as CategoryId, label: 'Adult', icon: Flame },
    { id: 'other' as CategoryId, label: 'Other', icon: Sparkles },
  ];

  const handleCategoryClick = (catId: CategoryId) => {
    onSelectCategory(catId);
    setMobileMenuOpen(false);
    setIsSearchExpanded(false);
    const shopSection = document.getElementById('shop-section');
    if (shopSection) {
      shopSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18 gap-2">
            
            {/* Minimal Brand Logo */}
            <a
              href="#"
              className="flex items-center gap-2.5 group shrink-0"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-purple-600 p-0.5 shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform duration-300">
                <div className="w-full h-full bg-white rounded-[9px] flex items-center justify-center">
                  <span className="font-extrabold text-base sm:text-lg bg-gradient-to-br from-brand-600 to-indigo-600 bg-clip-text text-transparent font-mono">
                    SO
                  </span>
                </div>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-black text-lg sm:text-xl tracking-tight text-slate-900 group-hover:text-brand-600 transition-colors">
                  Systum <span className="text-brand-600">OTT</span>
                </span>
                <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200/80">
                  Seller
                </span>
              </div>
            </a>

            {/* Desktop Minimal Navigation Links */}
            <nav className={`hidden md:flex items-center gap-1.5 lg:gap-3 transition-opacity duration-200 ${isSearchExpanded ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
              <button
                onClick={() => handleCategoryClick('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  activeCategory === 'all'
                    ? 'text-brand-700 bg-brand-50 border border-brand-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Browse Store
              </button>

              <button
                onClick={onOpenOrderHistory}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:text-brand-600 hover:bg-slate-50 transition-colors"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-brand-600" />
                <span>My Orders</span>
              </button>

              <a
                href={`https://wa.me/${WHATSAPP_PHONE}?text=Hello!+I+want+to+inquire+about+subscriptions.`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-700 hover:bg-emerald-50 transition-colors"
              >
                <WhatsAppIcon className="w-3.5 h-3.5 fill-[#25D366]" />
                <span>WhatsApp</span>
              </a>

              {isAdmin && (
                <button
                  onClick={onOpenAdmin}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 text-xs font-bold transition-colors"
                >
                  <Sliders className="w-3 h-3" />
                  <span>Admin</span>
                </button>
              )}
            </nav>

            {/* Right Action Icons & Right-to-Left Expanding Search Bar */}
            <div className="flex items-center gap-2 sm:gap-2.5 relative">
              
              {/* Expandable Search Input (Expands from Right to Left) */}
              <div ref={searchContainerRef} className="relative flex items-center">
                {isSearchExpanded ? (
                  <div className="flex items-center relative animate-in fade-in slide-in-from-right-8 duration-300">
                    <div className="relative flex items-center">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-brand-600">
                        <Search className="w-4 h-4" />
                      </div>
                      <input
                        ref={searchInputRef}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Search Netflix, Adobe, ChatGPT, Prime..."
                        className="w-48 sm:w-72 md:w-80 lg:w-96 pl-9 pr-8 py-2 bg-slate-50 border border-brand-500 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-brand-500/20 shadow-lg transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (searchQuery) {
                            onSearchChange('');
                          } else {
                            setIsSearchExpanded(false);
                          }
                        }}
                        className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-700 p-1"
                        aria-label="Close search"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Floating Suggestions Dropdown */}
                    {searchQuery.trim() && (
                      <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 md:w-96 bg-white rounded-2xl border border-slate-200 shadow-2xl p-2.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150 max-h-96 overflow-y-auto">
                        <div className="px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-100 flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-amber-500" /> Suggestions
                          </span>
                          <span>{searchMatches.length} Found</span>
                        </div>

                        {searchMatches.length > 0 ? (
                          <div className="divide-y divide-slate-100 mt-1">
                            {searchMatches.map((product) => {
                              const plan = product.plans[0];
                              const discount = plan
                                ? Math.round(((plan.originalPrice - plan.discountedPrice) / plan.originalPrice) * 100)
                                : 0;

                              return (
                                <button
                                  key={product.id}
                                  type="button"
                                  onClick={() => handleSelectProduct(product)}
                                  className="w-full p-2.5 rounded-xl hover:bg-slate-50 flex items-center gap-3 transition-colors text-left group"
                                >
                                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-900 border border-slate-200 shrink-0 flex items-center justify-center">
                                    {product.imageUrl ? (
                                      <img src={product.imageUrl} alt={product.title} className="w-full h-full object-cover" />
                                    ) : (
                                      <Tv className="w-5 h-5 text-brand-400" />
                                    )}
                                  </div>

                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5">
                                      <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 group-hover:text-brand-600 transition-colors truncate">
                                        {product.title}
                                      </h4>
                                      {discount > 0 && (
                                        <span className="text-[9px] font-black bg-rose-50 text-rose-700 border border-rose-200 px-1 py-0.2 rounded shrink-0">
                                          {discount}% OFF
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[10px] sm:text-[11px] text-slate-500 truncate mt-0.5">
                                      {product.category.toUpperCase()} · {product.accountType}
                                    </p>
                                  </div>

                                  {plan && (
                                    <div className="text-right shrink-0">
                                      <span className="text-xs sm:text-sm font-black text-slate-900">
                                        ₹{plan.discountedPrice}
                                      </span>
                                      {plan.originalPrice > plan.discountedPrice && (
                                        <span className="block text-[9px] text-slate-400 line-through">
                                          ₹{plan.originalPrice}
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </button>
                              );
                            })}

                            <div className="pt-2">
                              <button
                                type="button"
                                onClick={handleViewAllResults}
                                className="w-full py-2 text-center text-xs font-extrabold text-brand-600 hover:text-white hover:bg-brand-600 bg-brand-50 rounded-xl transition-colors flex items-center justify-center gap-1.5"
                              >
                                <span>View all matching results in Store</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="p-4 text-center">
                            <p className="text-xs text-slate-500">No subscriptions matching <strong>"{searchQuery}"</strong></p>
                            <button
                              type="button"
                              onClick={handleViewAllResults}
                              className="mt-1.5 text-xs font-bold text-brand-600 hover:underline"
                            >
                              Browse all subscriptions
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsSearchExpanded(true)}
                    className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 transition-all active:scale-95 shadow-2xs group"
                    aria-label="Search Subscriptions"
                    title="Search subscriptions"
                  >
                    <Search className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-slate-600 group-hover:text-brand-600 transition-colors" />
                  </button>
                )}
              </div>

              {/* 2. Cart Icon Button */}
              <button
                type="button"
                onClick={() => setIsCartOpen(true)}
                className="relative p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 transition-all active:scale-95 shadow-2xs group shrink-0"
                aria-label="View Cart"
                title="View cart"
              >
                <ShoppingBag className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-slate-600 group-hover:text-brand-600 transition-colors" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-brand-600 to-indigo-600 text-white text-[10px] font-extrabold w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-md animate-bounce">
                    {totalItems}
                  </span>
                )}
              </button>

              {/* 3. Minimal Hamburger Menu Button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 transition-all active:scale-95 shadow-2xs shrink-0"
                aria-label="Open Menu"
                title="Open menu"
              >
                <Menu className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-slate-700" />
              </button>

            </div>

          </div>
        </div>
      </header>

      {/* Slide-Over Drawer Navigation Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm h-full shadow-2xl flex flex-col justify-between p-6 animate-in slide-in-from-right duration-300 overflow-y-auto">
            
            {/* Drawer Header */}
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <span className="font-black text-lg text-slate-900">Menu</span>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                    Systum OTT
                  </span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* My Orders Direct Card */}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onOpenOrderHistory) onOpenOrderHistory();
                }}
                className="w-full p-4 rounded-2xl bg-gradient-to-r from-brand-50 to-indigo-50 border border-brand-200/80 text-left flex items-center justify-between group shadow-2xs hover:shadow-xs transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center shadow-sm">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900 group-hover:text-brand-600 transition-colors">
                      My Orders
                    </h4>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Track subscriptions & credentials
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-brand-600 group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Categories Grid in Menu */}
              <div className="space-y-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block px-1">
                  Product Categories
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {navCategories.map((cat) => {
                    const Icon = cat.icon;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => handleCategoryClick(cat.id)}
                        className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-semibold transition-all ${
                          activeCategory === cat.id
                            ? 'bg-brand-50 text-brand-700 border border-brand-200 font-bold'
                            : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-100'
                        }`}
                      >
                        <Icon className="w-4 h-4 text-brand-600 shrink-0" />
                        <span className="truncate">{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Policy & Info Links */}
              <div className="border-t border-slate-100 pt-4 space-y-1 text-sm font-semibold">
                <a
                  href="#how-it-works"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50"
                >
                  How It Works
                </a>
                <a
                  href="#reviews"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50"
                >
                  Customer Reviews
                </a>
                <a
                  href="#faq"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50"
                >
                  FAQ & Help
                </a>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenPolicy('reseller');
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-50 flex items-center justify-between"
                >
                  <span>Seller Policy & Warranty</span>
                  <Shield className="w-4 h-4 text-brand-600" />
                </button>
              </div>

            </div>

            {/* Drawer Footer: Admin / Auth + WhatsApp Help */}
            <div className="pt-6 border-t border-slate-100 space-y-3">
              {isAdmin ? (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAdmin();
                  }}
                  className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md"
                >
                  <Sliders className="w-4 h-4" />
                  <span>Open Admin Dashboard</span>
                </button>
              ) : user ? (
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl text-xs">
                  <span>Signed in as <strong>{user.name}</strong></span>
                  <button onClick={logout} className="text-rose-600 font-bold hover:underline">Logout</button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setAuthModalTab('login');
                    setIsAuthModalOpen(true);
                  }}
                  className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold text-xs rounded-xl flex items-center justify-center gap-2"
                >
                  <User className="w-4 h-4 text-brand-600" />
                  <span>Admin / Seller Login</span>
                </button>
              )}

              <a
                href={`https://wa.me/${WHATSAPP_PHONE}?text=Hello!+I+want+to+inquire+about+subscriptions.`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-extrabold text-xs shadow-md shadow-emerald-600/20"
              >
                <WhatsAppIcon className="w-4 h-4 fill-white" />
                <span>Chat on WhatsApp Support</span>
              </a>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
