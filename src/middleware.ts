import { NextRequest, NextResponse } from 'next/server';

// Global rate limiting storage
declare global {
  var rateLimitMap: Map<string, { count: number; resetTime: number }> | undefined;
  var ddosProtection: Map<string, number[]> | undefined;
}

global.rateLimitMap = global.rateLimitMap || new Map();
global.ddosProtection = global.ddosProtection || new Map();

// Rate limiting configuration
const RATE_LIMIT = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 200, // max requests per window
  ddosThreshold: 100, // requests per 10 seconds for DDoS detection
  ddosWindow: 10 * 1000 // 10 seconds
};

function getClientIP(request: NextRequest): string {
  const xForwardedFor = request.headers.get('x-forwarded-for');
  const xRealIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  
  if (cfConnectingIP) return cfConnectingIP;
  if (xRealIP) return xRealIP;
  if (xForwardedFor) return xForwardedFor.split(',')[0].trim();
  
  return '127.0.0.1';
}

export function middleware(request: NextRequest) {
  const ip = getClientIP(request);
  const now = Date.now();
  const url = request.nextUrl.pathname;

  // Skip middleware for static files and logs API
  if (url.startsWith('/_next/') || url.startsWith('/favicon') || url.includes('.') || url.startsWith('/api/logs')) {
    return NextResponse.next();
  }

  // DDoS Protection
  const ddosRequests = global.ddosProtection?.get(ip) || [];
  const recentRequests = ddosRequests.filter(time => now - time < RATE_LIMIT.ddosWindow);
  
  if (recentRequests.length >= RATE_LIMIT.ddosThreshold) {
    // Log DDoS attempt
    console.warn(`DDoS detected from IP: ${ip}, ${recentRequests.length} requests in 10s`);
    
    return new NextResponse('Too Many Requests - DDoS Protection', {
      status: 429,
      headers: {
        'Retry-After': '60',
        'X-RateLimit-Limit': RATE_LIMIT.ddosThreshold.toString(),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': new Date(now + 60000).toISOString()
      }
    });
  }

  // Update DDoS tracking
  recentRequests.push(now);
  global.ddosProtection?.set(ip, recentRequests);

  // Rate Limiting
  const rateLimitData = global.rateLimitMap?.get(ip);
  
  if (rateLimitData && now < rateLimitData.resetTime) {
    if (rateLimitData.count >= RATE_LIMIT.maxRequests) {
      return new NextResponse('Rate Limit Exceeded', {
        status: 429,
        headers: {
          'Retry-After': Math.ceil((rateLimitData.resetTime - now) / 1000).toString(),
          'X-RateLimit-Limit': RATE_LIMIT.maxRequests.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(rateLimitData.resetTime).toISOString()
        }
      });
    }
    rateLimitData.count++;
  } else {
    global.rateLimitMap?.set(ip, {
      count: 1,
      resetTime: now + RATE_LIMIT.windowMs
    });
  }

  // XSS Protection for API routes
  if (url.startsWith('/api/') && request.method === 'POST') {
    const response = NextResponse.next();
    
    // Add security headers
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    return response;
  }

  // Add security headers to all responses
  const response = NextResponse.next();
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};