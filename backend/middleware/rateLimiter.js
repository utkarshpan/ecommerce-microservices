const rateLimit = require('express-rate-limit');

// General API rate limiter (100 requests per 15 minutes)
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        success: false,
        error: 'Too many requests from this IP, please try again after 15 minutes',
        statusCode: 429
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    skipSuccessfulRequests: false, // Count successful requests too
});

// Strict rate limiter for authentication (5 requests per 15 minutes)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 login/signup attempts per windowMs
    message: {
        success: false,
        error: 'Too many authentication attempts, please try again after 15 minutes',
        statusCode: 429
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // Don't count successful logins
});

// Order rate limiter (20 orders per hour)
const orderLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20, // Limit each user to 20 orders per hour
    message: {
        success: false,
        error: 'Too many orders placed. Please slow down.',
        statusCode: 429
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Product creation rate limiter (10 products per hour)
const productLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10,
    message: {
        success: false,
        error: 'Too many products created. Please try again later.',
        statusCode: 429
    },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = {
    generalLimiter,
    authLimiter,
    orderLimiter,
    productLimiter
};