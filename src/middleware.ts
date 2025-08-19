import { NextRequest, NextResponse } from 'next/server';

// Circuit breaker for API calls
declare global {
  var apiCallTracker: Map<string, { count: number; resetTime: number }> | undefined;
}

global.apiCallTracker = global.apiCallTracker || new Map();

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
  const url = request.nextUrl.pathname;
  const ip = getClientIP(request);
  const now = Date.now();

  // Skip middleware for static files and logs API
  if (url.startsWith('/_next/') || url.startsWith('/favicon') || url.includes('.') || url.startsWith('/api/logs') || url.startsWith('/api/health')) {
    return NextResponse.next();
  }

  // Circuit breaker for API routes
  if (url.startsWith('/api/')) {
    const key = `${ip}:${url}`;
    const tracker = global.apiCallTracker?.get(key);
    
    if (tracker && now < tracker.resetTime) {
      if (tracker.count >= 10) { // Max 10 calls per minute per endpoint
        return NextResponse.json({ error: 'Too many requests to this endpoint' }, { status: 429 });
      }
      tracker.count++;
    } else {
      global.apiCallTracker?.set(key, {
        count: 1,
        resetTime: now + 60000 // 1 minute
      });
    }
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