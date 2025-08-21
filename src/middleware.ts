import { NextRequest, NextResponse } from 'next/server';
import { addSecurityHeaders } from './lib/securityHeaders';

// Suspicious User-Agent patterns (only security tools, not legitimate browsers)
const SUSPICIOUS_USER_AGENTS = [
  /sqlmap/i,
  /nikto/i,
  /nmap/i,
  /burp/i,
  /zap/i,
  /acunetix/i,
  /nessus/i,
  /wpscan/i,
  /dirb/i,
  /gobuster/i,
  /hydra/i,
  /MSIE [1-6]\./  // Only very old IE versions
];

// Validate User-Agent
function isValidUserAgent(userAgent: string): boolean {
  if (!userAgent || userAgent.length < 5 || userAgent.length > 1000) {
    return false;
  }
  
  // Block only security tools, allow legitimate browsers
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