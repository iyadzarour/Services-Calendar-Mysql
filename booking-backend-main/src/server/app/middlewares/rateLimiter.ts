import rateLimit from 'express-rate-limit';

export const rateLimiterUsingThirdParty = rateLimit({
    windowMs: 1000, // 1 second in milliseconds
    max: 5,
    message: 'You have exceeded the 5 requests in 1 second limit!',
    // standardHeaders: true,
    headers: false,
});
