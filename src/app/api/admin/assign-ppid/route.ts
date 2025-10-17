import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prismaClient';
import jwt from 'jsonwebtoken';
import { rateLimit } from '@/lib/rateLimiter';

interface JWTPayload {
  id: string;
  role: string;
  userId?: number;
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    let decoded: JWTPayload;
    
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Only PPID_UTAMA and ADMIN can assign requests
    if (!['PPID_UTAMA', 'ADMIN'].includes(decoded.role)) {
      return NextResponse.json({ error: 'Only PPID Utama and Admin can assign requests' }, { status: 403 });
    }

    const { requestId, keberatanId, ppidId, type } = await request.json();

    if (!ppidId || (!requestId && !keberatanId)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify PPID exists and has valid role
    const ppid = await prisma.ppid.findUnique({
      where: { id: ppidId }
    });

    if (!ppid || !['PPID_UTAMA', 'PPID_PELAKSANA', 'ATASAN_PPID'].includes(ppid.role)) {
      return NextResponse.json({ error: 'Invalid PPID' }, { status: 400 });
    }

    if (type === 'request' && requestId) {
      // Assign request to PPID Pelaksana
      await prisma.request.update({
        where: { id: requestId },
        data: {
          assigned_ppid_id: ppidId,
          status: 'Diteruskan'
        }
      });
    } else if (type === 'keberatan' && keberatanId) {
      // Assign keberatan to PPID Pelaksana
      await prisma.keberatan.update({
        where: { id: keberatanId },
        data: {
          assigned_ppid_id: ppidId,
          status: 'Diteruskan'
        }
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Successfully assigned to PPID' 
    });
  } catch (error) {
    console.error('Assign PPID error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Relaxed rate limiting for development
    const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const rateLimitResult = rateLimit(`assign-ppid-${clientIP}`, 300, 60000); // 300 requests per minute
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': '300',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimitResult.resetTime.toString()
          }
        }
      );
    }

    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Get all PPID roles with search and pagination
    const where = {
      role: { in: ['PPID_UTAMA', 'PPID_PELAKSANA', 'ATASAN_PPID'] },
      ...(search && {
        OR: [
          { nama: { contains: search, mode: 'insensitive' as const } },
          { email: { contains: search, mode: 'insensitive' as const } },
          { no_pegawai: { contains: search, mode: 'insensitive' as const } }
        ]
      })
    };

    const [ppidList, total] = await Promise.all([
      prisma.ppid.findMany({
        where,
        select: {
          id: true,
          nama: true,
          email: true,
          no_pegawai: true,
          role: true
        },
        skip,
        take: limit,
        orderBy: { nama: 'asc' }
      }),
      prisma.ppid.count({ where })
    ]);

    const response = NextResponse.json({ 
      success: true, 
      data: ppidList,
      pagination: {
        page,
        limit,
        total,
        hasMore: skip + ppidList.length < total
      }
    });
    
    // Add rate limit headers
    response.headers.set('X-RateLimit-Limit', '300');
    response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
    response.headers.set('X-RateLimit-Reset', rateLimitResult.resetTime.toString());
    
    return response;
  } catch (error) {
    console.error('Get PPID list error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}