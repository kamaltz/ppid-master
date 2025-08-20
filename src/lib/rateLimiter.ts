interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

export function rateLimit(
  identifier: string,
  maxRequests: number = 1000, // Increased from 100
  windowMs: number = 60000 // 1 minute
): { success: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(identifier);

  if (!entry || now > entry.resetTime) {
    // Create new entry or reset expired entry
    const newEntry: RateLimitEntry = {
      count: 1,
      resetTime: now + windowMs
    };
    rateLimitMap.set(identifier, newEntry);
    
    return {
      success: true,
      remaining: maxRequests - 1,
      resetTime: newEntry.resetTime
    };
  }

  if (entry.count >= maxRequests) {
    return {
      success: false,
      remaining: 0,
      resetTime: entry.resetTime
    };
  }

  entry.count++;
  rateLimitMap.set(identifier, entry);

  return {
    success: true,
    remaining: maxRequests - entry.count,
    resetTime: entry.resetTime
  };
}

// Clean up expired entries periodically
let cleanupInterval: NodeJS.Timeout | null = null;

if (process.env.NODE_ENV !== 'test') {
  cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitMap.entries()) {
      if (now > entry.resetTime) {
        rateLimitMap.delete(key);
      }
    }
  }, 300000); // Clean up every 5 minutes
  
  cleanupInterval.unref(); // Allow process to exit
}

// Export cleanup function for tests
export function cleanupRateLimit() {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
  }
  rateLimitMap.clear();
}