import { useState, useEffect, useCallback } from 'react';

export type RouteType = 'home' | 'product' | 'admin';

export interface RouteInfo {
  path: string;
  route: RouteType;
  productIdOrSlug: string | null;
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

  if (cleanPath.startsWith('/admin')) {
    return { path: cleanPath, route: 'admin', productIdOrSlug: null };
  }

  const productMatch = cleanPath.match(/^\/product\/(.+)$/);
  if (productMatch) {
    return {
      path: cleanPath,
      route: 'product',
      productIdOrSlug: decodeURIComponent(productMatch[1]),
    };
  }

  return { path: '/', route: 'home', productIdOrSlug: null };
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
