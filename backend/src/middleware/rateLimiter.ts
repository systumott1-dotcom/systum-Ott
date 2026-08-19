import rateLimit from 'express-rate-limit';

/**
 * Strict Rate Limiter for Authentication (Login / Signup) endpoints
 * Limits requests to 10 attempts per 15 minutes window per IP to prevent brute-force attacks.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 login / signup requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    success: false,
    message: 'Too many login attempts from this IP address. Please try again after 15 minutes to prevent unauthorized access.',
    code: 'RATE_LIMIT_EXCEEDED',
  },
  handler: (_req, res, _next, options) => {
    res.status(429).json(options.message);
  },
});

/**
 * General API Rate Limiter
 * Limits requests to 150 requests per 15 minutes per IP.
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 150,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this client. Please slow down.',
  },
});
