import { useState, useEffect, useCallback } from 'react';

export type RouteType = 'home' | 'product' | 'checkout' | 'admin';

export interface RouteInfo {
  path: string;
  route: RouteType;
  productIdOrSlug: string | null;
  categoryId: string | null;
}

const parsePath = (path: string): RouteInfo => {
  // Normalize path (handle hash routing or clean path)
  let cleanPath = path;
  if (cleanPath.startsWith('#')) {
    cleanPath = cleanPath.slice(1);
  }
  if (!cleanPath.startsWith('/')) {
    cleanPath = '/' + cleanPath;
  }

  // Extract query param if any (?category=ott or ?cat=ott)
  let queryCategory: string | null = null;
  if (typeof window !== 'undefined' && window.location.search) {
    const params = new URLSearchParams(window.location.search);
    queryCategory = params.get('category') || params.get('cat');
  }

  if (cleanPath.startsWith('/admin')) {
    return { path: cleanPath, route: 'admin', productIdOrSlug: null, categoryId: null };
  }

  if (cleanPath.startsWith('/checkout')) {
    return { path: cleanPath, route: 'checkout', productIdOrSlug: null, categoryId: null };
  }

  const productMatch = cleanPath.match(/^\/product\/(.+)$/);
  if (productMatch) {
    return {
      path: cleanPath,
      route: 'product',
      productIdOrSlug: decodeURIComponent(productMatch[1]),
      categoryId: null,
    };
  }

  const categoryMatch = cleanPath.match(/^\/category\/(.+)$/);
  if (categoryMatch) {
    return {
      path: cleanPath,
      route: 'home',
      productIdOrSlug: null,
      categoryId: decodeURIComponent(categoryMatch[1]),
    };
  }

  return { path: cleanPath, route: 'home', productIdOrSlug: null, categoryId: queryCategory };
};

export const useRouter = () => {
  const [routeInfo, setRouteInfo] = useState<RouteInfo>(() =>
    parsePath(window.location.pathname || window.location.hash || '/')
  );

  useEffect(() => {
    const handlePopState = () => {
      setRouteInfo(parsePath(window.location.pathname || window.location.hash || '/'));
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = useCallback((to: string, options?: { replace?: boolean }) => {
    const targetPath = to.startsWith('/') ? to : '/' + to;
    if (options?.replace) {
      window.history.replaceState({}, '', targetPath);
    } else {
      window.history.pushState({}, '', targetPath);
    }
    setRouteInfo(parsePath(targetPath));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return {
    ...routeInfo,
    navigate,
  };
};
