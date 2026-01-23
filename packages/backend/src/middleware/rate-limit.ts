import rateLimit from 'express-rate-limit';

// Rate limiter for authentication endpoints (strict)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: 'Demasiados intentos de autenticación. Intenta de nuevo más tarde.',
  standardHeaders: true,
  legacyHeaders: false,
});

// General API rate limiter
export const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: 'Demasiadas peticiones. Intenta de nuevo más tarde.',
  standardHeaders: true,
  legacyHeaders: false,
});
