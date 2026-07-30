// Simple in-memory rate limiter
class RateLimiter {
  constructor() {
    this.requests = new Map();
    this.windowMs = 15 * 60 * 1000; // 15 minutes
    this.maxRequests = 100;
  }

  isRateLimited(ip) {
    const now = Date.now();
    
    if (!this.requests.has(ip)) {
      this.requests.set(ip, {
        count: 1,
        resetTime: now + this.windowMs
      });
      return false;
    }

    const data = this.requests.get(ip);
    
    if (now > data.resetTime) {
      data.count = 1;
      data.resetTime = now + this.windowMs;
      this.requests.set(ip, data);
      return false;
    }

    data.count++;
    this.requests.set(ip, data);
    
    if (data.count > this.maxRequests) {
      return true;
    }
    
    return false;
  }

  cleanup() {
    const now = Date.now();
    for (const [ip, data] of this.requests.entries()) {
      if (now > data.resetTime) {
        this.requests.delete(ip);
      }
    }
  }
}

// Create singleton instance
const rateLimiter = new RateLimiter();

// Cleanup every 15 minutes
setInterval(() => rateLimiter.cleanup(), 15 * 60 * 1000);

// General limiter
const limiter = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  
  if (rateLimiter.isRateLimited(ip)) {
    return res.status(429).json({
      success: false,
      message: 'Too many requests from this IP. Please try again in 15 minutes.'
    });
  }
  
  next();
};

// Auth limiter - FIXED
const authLimiter = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const windowMs = 60 * 60 * 1000; // 1 hour
  const maxAttempts = 5;
  
  // Use the same rate limiter instance or create a separate one
  // Fixed: Using a static Map outside the function
  if (!authLimiter.attempts) {
    authLimiter.attempts = new Map();
  }
  
  const now = Date.now();
  const attempts = authLimiter.attempts;
  
  if (!attempts.has(ip)) {
    attempts.set(ip, {
      count: 1,
      resetTime: now + windowMs
    });
    return next();
  }
  
  const data = attempts.get(ip);
  
  if (now > data.resetTime) {
    data.count = 1;
    data.resetTime = now + windowMs;
    attempts.set(ip, data);
    return next();
  }
  
  data.count++;
  attempts.set(ip, data);
  
  if (data.count > maxAttempts) {
    return res.status(429).json({
      success: false,
      message: 'Too many authentication attempts. Please try again in 1 hour.'
    });
  }
  
  next();
};

module.exports = { limiter, authLimiter };