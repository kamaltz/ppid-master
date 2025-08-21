import { NextRequest, NextResponse } from 'next/server';
import { addSecurityHeaders } from './lib/securityHeaders';

// Suspicious User-Agent patterns
const SUSPICIOUS_USER_AGENTS = [
  /bot/i,
  /crawler/i,
  /spider/i,
  /scraper/i,
  /scanner/i,
  /MSIE [1-8]\./,  // Old IE versions
  /^Mozilla\/4\.0 \(compatible; MSIE/,
  /msnbot/i,
  /googlebot/i,
  /yahoo.*slurp/i
];

// Validate User-Agent
function isValidUserAgent(userAgent: string): boolean {
  if (!userAgent || userAgent.length < 10 || userAgent.length > 500) {
    return false;
  }
  
  // Block suspicious patterns for sensitive endpoints
  return !SUSPICIOUS_USER_AGENTS.some(pattern => pattern.test(userAgent));
}

export function middleware(request: NextRequest) {
  const url = request.nextUrl.pathname;
  const userAgent = request.headers.get('user-agent') || '';

  // Skip middleware for static files
  if (url.startsWith('/_next/') || url.startsWith('/favicon') || url.includes('.')) {
    return NextResponse.next();
  }

  // Block suspicious User-Agents on sensitive endpoints
  const sensitiveEndpoints = ['/register', '/login', '/api/auth', '/admin', '/dashboard'];
  const isSensitiveEndpoint = sensitiveEndpoints.some(endpoint => url.startsWith(endpoint));
  
  if (isSensitiveEndpoint && !isValidUserAgent(userAgent)) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  // Block GET requests with sensitive parameters
  if (request.method === 'GET' && url.includes('/register')) {
    const searchParams = request.nextUrl.searchParams;
    const sensitiveParams = ['password', 'confirmPassword', 'email', 'nik'];
    
    if (sensitiveParams.some(param => searchParams.has(param))) {
      return new NextResponse('Method Not Allowed', { status: 405 });
    }
  }

  // Add comprehensive security headers
  const response = NextResponse.next();
  return addSecurityHeaders(response);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};