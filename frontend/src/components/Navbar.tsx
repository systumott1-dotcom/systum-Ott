import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Menu, 
  X, 
  MessageCircle, 
  Shield, 
  ChevronDown, 
  Store, 
  Tv, 
  Laptop, 
  PackagePlus, 
  Music, 
  Bot, 
  GraduationCap, 
  User, 
  Sliders,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { useCart, WHATSAPP_PHONE } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import type { CategoryId, Product } from '../types';

interface NavbarProps {
  products?: Product[];
  activeCategory: CategoryId;
  onSelectCategory: (id: CategoryId) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenPolicy: (type: 'terms' | 'refund' | 'privacy' | 'dmca' | 'reseller' | 'how-it-works') => void;
  onOpenAdmin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  products = [],
  activeCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  onOpenPolicy,
  onOpenAdmin,
}) => {
  const { totalItems, setIsCartOpen } = useCart();
  const { user, isAdmin, setIsAuthModalOpen, setAuthModalTab, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoriesDropdownOpen, setCategoriesDropdownOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const desktopSearchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);

  // Close search suggestions on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        desktopSearchRef.current &&
        !desktopSearchRef.current.contains(e.target as Node) &&
        mobileSearchRef.current &&
        !mobileSearchRef.current.contains(e.target as Node)
      ) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
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
      .slice(0, 5);
  }, [products, searchQuery]);

  const handleSelectProduct = (product: Product) => {
    const slug = product.slug || product.id;
    window.history.pushState({}, '', `/product/${slug}`);
    window.dispatchEvent(new PopStateEvent('popstate'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsSearchOpen(false);
    onSearchChange('');
  };

  const handleViewAllResults = () => {
    setIsSearchOpen(false);
    const shopSection = document.getElementById('shop-section');
    if (shopSection) {
      shopSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navCategories = [
    { id: 'all' as CategoryId, label: 'All Store', icon: Store },
    { id: 'ott' as CategoryId, label: 'OTT Apps', icon: Tv },
    { id: 'software' as CategoryId, label: 'Software', icon: Laptop },
    { id: 'combo' as CategoryId, label: 'Combos', icon: PackagePlus },
    { id: 'music' as CategoryId, label: 'Music', icon: Music },
    { id: 'ai-social' as CategoryId, label: 'AI & Social', icon: Bot },
    { id: 'education' as CategoryId, label: 'Education', icon: GraduationCap },
  ];

  const handleCategoryClick = (catId: CategoryId) => {
    onSelectCategory(catId);
    setCategoriesDropdownOpen(false);
    setMobileMenuOpen(false);
    const shopSection = document.getElementById('shop-section');
    if (shopSection) {
      shopSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Reusable Suggestions Dropdown
  const renderSearchDropdown = () => {
    if (!searchQuery.trim() || !isSearchOpen) return null;

    return (
      <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl border border-slate-200 shadow-2xl p-2.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150 max-h-96 overflow-y-auto">
        <div className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-100 flex items-center justify-between">
          <span className="flex items-center gap-1"><Sparkles className="w-3 h-3 text-amber-500" /> Suggestions</span>
          <span>{searchMatches.length} Matches</span>
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
                  {/* Thumbnail / Icon */}
                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.title} className="w-full h-full object-cover" />
                    ) : (
                      <Tv className="w-5 h-5 text-brand-600" />
                    )}
                  </div>

                  {/* Title & Category */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 group-hover:text-brand-600 transition-colors truncate">
                        {product.title}
                      </h4>
                      {discount > 0 && (
                        <span className="text-[9px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.2 rounded shrink-0">
                          {discount}% OFF
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] sm:text-[11px] text-slate-500 truncate mt-0.5">
                      {product.category.toUpperCase()} · {product.accountType}
                    </p>
                  </div>

                  {/* Price */}
                  {plan && (
                    <div className="text-right shrink-0">
                      <span className="text-xs sm:text-sm font-black text-slate-900">
                        ₹{plan.discountedPrice}
                      </span>
                      {plan.originalPrice > plan.discountedPrice && (
                        <span className="block text-[10px] text-slate-400 line-through">
                          ₹{plan.originalPrice}
                        </span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}

            {/* Bottom View All Link */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleViewAllResults}
                className="w-full py-2 text-center text-xs font-bold text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100/70 rounded-xl transition-colors flex items-center justify-center gap-1.5"
              >
                <span>View all results in Store</span>
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
              className="mt-2 text-xs font-bold text-brand-600 hover:underline"
            >
              Browse all subscriptions
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <header className="sticky top-0 z-30 glass-nav-white transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Brand Logo */}
          <a
            href="#"
            className="flex items-center gap-3 group shrink-0"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-purple-500 p-0.5 shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform duration-300">
              <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
                <span className="font-extrabold text-xl bg-gradient-to-br from-brand-600 to-indigo-600 bg-clip-text text-transparent font-mono">
                  SO
                </span>
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight text-slate-900 group-hover:text-brand-600 transition-colors">
                  Systum <span className="text-brand-600">OTT</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-brand-50 text-brand-700 px-1.5 py-0.5 rounded border border-brand-200">
                  India
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">
                Authorized Reseller & Aggregator
              </span>
            </div>
          </a>

          {/* Desktop Search Bar */}
          <div className="hidden lg:flex flex-1 max-w-md mx-4" ref={desktopSearchRef}>
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setIsSearchOpen(true)}
                onChange={(e) => {
                  onSearchChange(e.target.value);
                  setIsSearchOpen(true);
                }}
                placeholder="Search Netflix, Adobe, Prime, Canva, Hotstar..."
                className="w-full pl-10 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all shadow-xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    onSearchChange('');
                    setIsSearchOpen(false);
                  }}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-400 hover:text-slate-700 font-semibold"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Suggestions Popover */}
              {renderSearchDropdown()}
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <button
              onClick={() => handleCategoryClick('all')}
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                activeCategory === 'all'
                  ? 'text-brand-700 bg-brand-50 border border-brand-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Shop All
            </button>

            {/* Categories Dropdown */}
            <div className="relative">
              <button
                onClick={() => setCategoriesDropdownOpen(!categoriesDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                <span>Categories</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${categoriesDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {categoriesDropdownOpen && (
                <div
                  className="absolute left-0 mt-2 w-56 rounded-2xl bg-white border border-slate-200 shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
                  onMouseLeave={() => setCategoriesDropdownOpen(false)}
                >
                  {navCategories.map((cat) => {
                    const Icon = cat.icon;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => handleCategoryClick(cat.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left ${
                          activeCategory === cat.id
                            ? 'bg-brand-50 text-brand-700 font-bold border border-brand-200'
                            : 'text-slate-700 hover:bg-slate-50 hover:text-brand-600'
                        }`}
                      >
                        <Icon className="w-4 h-4 text-brand-600" />
                        <span>{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <a
              href="#how-it-works"
              className="px-3 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              How It Works
            </a>
            
            <a
              href="#reviews"
              className="px-3 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              Reviews
            </a>

            <a
              href="#faq"
              className="px-3 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              FAQ
            </a>
          </nav>

          {/* Action Buttons: Account / Admin, WhatsApp & Cart */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Admin Portal Shortcut if Admin */}
            {isAdmin ? (
              <button
                onClick={onOpenAdmin}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-600 text-white hover:bg-purple-700 text-xs font-bold transition-all shadow-xs"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Admin Panel</span>
              </button>
            ) : user ? (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                <span className="font-bold text-slate-800">{user.name.split(' ')[0]}</span>
                <button
                  onClick={logout}
                  className="text-rose-600 hover:underline font-bold text-[11px]"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setAuthModalTab('login');
                  setIsAuthModalOpen(true);
                }}
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 text-xs font-bold transition-all"
              >
                <User className="w-3.5 h-3.5 text-brand-600" />
                <span>Login</span>
              </button>
            )}

            {/* WhatsApp Quick Link */}
            <a
              href={`https://wa.me/${WHATSAPP_PHONE}?text=Hello!+I+want+to+inquire+about+a+subscription.`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 text-xs font-bold transition-all shadow-xs group"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <MessageCircle className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
              <span>WhatsApp Chat</span>
            </a>

            {/* Cart Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 transition-all group"
              aria-label="Open Cart"
            >
              <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform text-brand-600" />
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-brand-600 to-indigo-600 text-white text-[11px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-bounce">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar (under header) */}
        <div className="lg:hidden pb-3 pt-1" ref={mobileSearchRef}>
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onFocus={() => setIsSearchOpen(true)}
              onChange={(e) => {
                onSearchChange(e.target.value);
                setIsSearchOpen(true);
              }}
              placeholder="Search OTT, Software, AI Tools..."
              className="w-full pl-10 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  onSearchChange('');
                  setIsSearchOpen(false);
                }}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-400 hover:text-slate-700 font-semibold"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Suggestions Popover */}
            {renderSearchDropdown()}
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 p-4 space-y-3 animate-in slide-in-from-top-4 duration-200 shadow-xl">
          
          {/* User Status / Admin in Drawer */}
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            {isAdmin ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAdmin();
                }}
                className="w-full py-2 bg-brand-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Sliders className="w-4 h-4" />
                <span>Open Admin Portal</span>
              </button>
            ) : user ? (
              <div className="flex items-center justify-between w-full text-xs">
                <span>Signed in as <strong>{user.name}</strong></span>
                <button onClick={logout} className="text-rose-600 font-bold">Logout</button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setAuthModalTab('login');
                  setIsAuthModalOpen(true);
                }}
                className="w-full py-2 bg-brand-50 text-brand-700 border border-brand-200 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5"
              >
                <User className="w-4 h-4" />
                <span>Sign In / Create Account</span>
              </button>
            )}
          </div>

          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-2">
            Categories
          </div>
          <div className="grid grid-cols-2 gap-2">
            {navCategories.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat.id)}
                  className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-semibold transition-all ${
                    activeCategory === cat.id
                      ? 'bg-brand-50 text-brand-700 border border-brand-200'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4 text-brand-600 shrink-0" />
                  <span className="truncate">{cat.label}</span>
                </button>
              );
            })}
          </div>

          <div className="border-t border-slate-200 pt-3 space-y-1 text-sm font-semibold">
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50"
            >
              How It Works
            </a>
            <a
              href="#reviews"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50"
            >
              Customer Reviews
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50"
            >
              FAQ & Help
            </a>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenPolicy('reseller');
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50 flex items-center justify-between"
            >
              <span>Reseller & Sourcing Policy</span>
              <Shield className="w-4 h-4 text-brand-600" />
            </button>
          </div>

          <div className="pt-2">
            <a
              href={`https://wa.me/${WHATSAPP_PHONE}?text=Hello!+I+want+to+inquire+about+a+subscription.`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-sm shadow-md shadow-emerald-600/20"
            >
              <MessageCircle className="w-4 h-4" />
              Chat on WhatsApp Support
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
