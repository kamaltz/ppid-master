import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/lib/prismaClient';
import jwt from 'jsonwebtoken';

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
    } catch (error) {
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

    // Verify PPID exists and is PPID_PELAKSANA
    const ppid = await prisma.ppid.findUnique({
      where: { id: ppidId }
    });

    if (!ppid || ppid.role !== 'PPID_PELAKSANA') {
      return NextResponse.json({ error: 'Invalid PPID Pelaksana' }, { status: 400 });
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
      message: 'Successfully assigned to PPID Pelaksana' 
    });
  } catch (error) {
    console.error('Assign PPID error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Get PPID Pelaksana with search and pagination
    const where = {
      role: 'PPID_PELAKSANA',
      ...(search && {
        OR: [
          { nama: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } }
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
          no_pegawai: true
        },
        skip,
        take: limit,
        orderBy: { nama: 'asc' }
      }),
      prisma.ppid.count({ where })
    ]);

    return NextResponse.json({ 
      success: true, 
      data: ppidList,
      pagination: {
        page,
        limit,
        total,
        hasMore: skip + ppidList.length < total
      }
    });
  } catch (error) {
    console.error('Get PPID list error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}