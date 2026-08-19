export default {
  async fetch(request: Request, env: any): Promise<Response> {
    const url = new URL(request.url);

    // Proxy all /api/* requests to the Render backend API
    if (url.pathname.startsWith('/api/')) {
      const backendBase = env.BACKEND_API_URL || 'https://systum-ott.onrender.com';
      const targetUrl = new URL(url.pathname + url.search, backendBase);

      const headers = new Headers(request.headers);
      // Ensure host header matches the target
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
        // Clone response to add CORS if needed
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
            message: 'Backend server is starting up on Render or connecting. Please try again in 15 seconds.',
            error: err?.message,
          }),
          {
            status: 502,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
    }

    // Serve static assets via Cloudflare Pages / Workers Assets
    return env.ASSETS.fetch(request);
  },
};
