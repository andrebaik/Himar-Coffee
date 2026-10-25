import rateLimit from 'express-rate-limit';

const createRateLimiter = (options) => {
  return rateLimit({
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        error: {
          code: 'RATE_LIMITED',
          message: options.message,
        },
      });
    },
    ...options,
  });
};

export const globalLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 100,
  message: 'Terlalu banyak permintaan, silakan coba lagi beberapa saat lagi',
});

export const authLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 5,
  message: 'Terlalu banyak percobaan masuk, silakan coba lagi setelah 1 menit',
});

export const chatLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 20,
  message: 'Terlalu banyak pesan, silakan tunggu sebentar sebelum mengirim pesan lagi',
});
