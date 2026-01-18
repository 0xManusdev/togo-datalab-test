import rateLimit from 'express-rate-limit';
import { config } from '@/config/environment';

export const authRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: {
        status: 'error',
        message: 'Trop de tentatives de connexion. Veuillez réessayer dans 15 minutes.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

export const apiRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: config.rateLimitMaxRequests,
    message: {
        status: 'error',
        message: 'Trop de requêtes. Veuillez réessayer plus tard.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});
