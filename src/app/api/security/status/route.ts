import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

interface JWTPayload {
  role: string;
  userId: number;
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;

    if (decoded.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get security statistics
    const now = Date.now();
    const rateLimitStats = Array.from(global.rateLimitMap?.entries() || [])
      .filter(([, data]) => now < data.resetTime)
      .map(([ip, data]) => ({
        ip,
        requests: data.count,
        resetTime: new Date(data.resetTime).toISOString()
      }));

    const ddosStats = Array.from(global.ddosProtection?.entries() || [])
      .map(([ip, requests]) => ({
        ip,
        recentRequests: requests.filter(time => now - time < 10000).length,
        totalRequests: requests.length
      }))
      .filter(stat => stat.recentRequests > 0);

    const blacklistStats = {
      totalBlacklisted: global.ipBlacklist?.size || 0,
      blacklistedIPs: Array.from(global.ipBlacklist || [])
    };

    return NextResponse.json({
      success: true,
      data: {
        rateLimiting: {
          activeIPs: rateLimitStats.length,
          details: rateLimitStats
        },
        ddosProtection: {
          suspiciousIPs: ddosStats.length,
          details: ddosStats
        },
        ipBlacklist: blacklistStats,
        securityHeaders: {
          xssProtection: 'Enabled',
          contentTypeOptions: 'nosniff',
          frameOptions: 'SAMEORIGIN'
        }
      }
    });

  } catch (error) {
    console.error('Error fetching security status:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}