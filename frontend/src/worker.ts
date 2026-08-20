export default {
  async fetch(request: Request, env: any, ctx: any): Promise<Response> {
    const url = new URL(request.url);
    const backendBase = env.BACKEND_API_URL || 'https://systum-ott.onrender.com';

    // 1. Proxy all /api/* requests directly to Render backend
    if (url.pathname.startsWith('/api/')) {
      const targetUrl = new URL(url.pathname + url.search, backendBase);

      const headers = new Headers(request.headers);
      headers.set('host', targetUrl.host);

      const init: RequestInit = {
        method: request.method,
        headers,
        redirect: 'follow',
      };

      if (request.method !== 'GET' && request.method !== 'HEAD') {
        init.body = request.body;
        // @ts-ignore - duplex is supported in Cloudflare Workers / Node fetch
        init.duplex = 'half';
      }

      try {
        const response = await fetch(targetUrl.toString(), init);
        const responseHeaders = new Headers(response.headers);
        responseHeaders.set('Access-Control-Allow-Origin', '*');
        responseHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
        responseHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: responseHeaders,
        });
      } catch (err: any) {
        return new Response(
          JSON.stringify({
            success: false,
            message: 'Backend server is starting up on Render or connecting. Please try again in 10 seconds.',
            error: err?.message,
          }),
          {
            status: 502,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
    }

    // 2. Pre-warm Render backend on initial page visit (fire-and-forget in background)
    if (url.pathname === '/' || !url.pathname.includes('.')) {
      const prewarmPromise = fetch(`${backendBase}/api/health`).catch(() => {});
      if (ctx && typeof ctx.waitUntil === 'function') {
        ctx.waitUntil(prewarmPromise);
      }
    }

    // 3. Serve static assets with high-efficiency caching
    const assetResponse = await env.ASSETS.fetch(request);
    
    // Add aggressive caching for immutable static assets (JS, CSS, fonts, SVG)
    if (url.pathname.startsWith('/assets/') || url.pathname.match(/\.(js|css|woff2?|svg|png|jpg|webp)$/i)) {
      const cachedHeaders = new Headers(assetResponse.headers);
      cachedHeaders.set('Cache-Control', 'public, max-age=31536000, immutable');
      return new Response(assetResponse.body, {
        status: assetResponse.status,
        statusText: assetResponse.statusText,
        headers: cachedHeaders,
      });
    }

    return assetResponse;
  },
};
