import { NextRequest } from 'next/server';

// Centralized IP detection utility
export function getClientIP(request: NextRequest): string {
  // Check various headers for real IP in priority order
  const headers = [
    'cf-connecting-ip',      // Cloudflare
    'x-real-ip',            // Nginx
    'x-client-ip',          // Apache
    'x-forwarded-for',      // Standard proxy header
    'x-forwarded',          // Less common
    'forwarded-for',        // Less common
    'forwarded'             // RFC 7239
  ];

  for (const header of headers) {
    const value = request.headers.get(header);
    if (value) {
      if (header === 'x-forwarded-for') {
        // x-forwarded-for can contain multiple IPs, take the first one
        return value.split(',')[0].trim();
      }
      if (header === 'forwarded') {
        // Parse forwarded header: for=192.0.2.60;proto=http;by=203.0.113.43
        const match = value.match(/for=([^;,\s]+)/);
        if (match) return match[1];
      }
      return value;
    }
  }
  
  // Fallback to localhost
  return '127.0.0.1';
}

// Get user agent with fallback
export function getUserAgent(request: NextRequest): string {
  return request.headers.get('user-agent') || 'Unknown';
}

// Get comprehensive request info for logging
export function getRequestInfo(request: NextRequest) {
  return {
    ip: getClientIP(request),
    userAgent: getUserAgent(request),
    method: request.method,
    url: request.url,
    timestamp: new Date().toISOString()
  };
}