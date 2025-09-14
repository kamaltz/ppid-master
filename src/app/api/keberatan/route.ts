import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/lib/prismaClient';
import jwt from 'jsonwebtoken';
import { checkDailyKeberatanLimit, checkKeberatanForRequest } from '@/lib/dailyLimits';

interface JWTPayload {
  id: string;
  role: string;
  userId?: number;
}

export async function GET(request: NextRequest) {
  try {
    // Check if JWT_SECRET is available
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not configured');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    let decoded: JWTPayload;
    
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    } catch (jwtError) {
      console.error('JWT verification failed:', jwtError);
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Parse URL parameters first
    const { searchParams } = new URL(request.url);
    const pemohonId = searchParams.get('pemohon_id');
    const status = searchParams.get('status');
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50);
    const page = Math.max(parseInt(searchParams.get('page') || '1'), 1);

    const userId = parseInt(decoded.id) || decoded.userId;
    
    if (!userId || isNaN(userId)) {
      console.error('Invalid user ID from token:', decoded);
      return NextResponse.json({ error: 'Invalid user session' }, { status: 401 });
    }
    
    const where: Record<string, unknown> = {};
    
    if (decoded.role === 'PEMOHON') {
      where.pemohon_id = userId;
    } else if (decoded.role === 'PPID_PELAKSANA') {
      // PPID Pelaksana sees keberatan assigned to them OR unassigned forwarded keberatan
      if (status === 'Diteruskan') {
        // For notifications: show all forwarded keberatan (assigned to them or unassigned)
        where.OR = [
          { assigned_ppid_id: userId },
          { assigned_ppid_id: null, status: 'Diteruskan' }
        ];
      } else {
        // For regular view: only assigned keberatan
        where.assigned_ppid_id = userId;
      }
    }
    
    // Apply status filter if provided
    if (status && !where.OR) {
      where.status = status;
    }
    
    if (decoded.role === 'PPID_UTAMA' || decoded.role === 'ADMIN') {
      // PPID Utama and Admin see all keberatan
      if (pemohonId) {
        const parsedPemohonId = parseInt(pemohonId);
        if (!isNaN(parsedPemohonId)) {
          where.pemohon_id = parsedPemohonId;
        }
      }
    }

    // Check database connection
    try {
      await prisma.$connect();
    } catch (dbError) {
      console.error('Database connection failed:', dbError);
      return NextResponse.json({ error: 'Database connection failed' }, { status: 503 });
    }

    const skip = (page - 1) * limit;
    const keberatan = await prisma.keberatan.findMany({
      where,
      include: {
        permintaan: {
          select: {
            id: true,
            rincian_informasi: true
          }
        },
        pemohon: {
          select: {
            nama: true,
            email: true
          }
        },
        assigned_ppid: {
          select: {
            id: true,
            nama: true,
            role: true
          }
        }
      },
      orderBy: { created_at: 'desc' },
      skip,
      take: limit
    });

    return NextResponse.json({ 
      success: true, 
      data: keberatan,
      pagination: { page, limit, total: keberatan.length }
    });
  } catch (error) {
    console.error('Get keberatan error:', error);
    return NextResponse.json({ 
      error: 'Server error', 
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('Keberatan POST API called - auth temporarily disabled');

    const { permintaan_id, judul, alasan_keberatan } = await request.json();

    if (!alasan_keberatan) {
      return NextResponse.json({ error: 'Alasan keberatan wajib diisi' }, { status: 400 });
    }

    // Use default user ID for testing
    const userId = 1;
    
    // Check daily keberatan limit
    const limitCheck = await checkDailyKeberatanLimit(userId);
    if (!limitCheck.canSubmit) {
      return NextResponse.json({ 
        error: `Batas harian tercapai. Anda sudah mengajukan ${limitCheck.count} keberatan hari ini. Maksimal ${limitCheck.limit} keberatan per hari.` 
      }, { status: 429 });
    }
    
    // Use existing request ID
    const requestId = permintaan_id;
    if (!requestId) {
      return NextResponse.json({ error: 'Permintaan ID diperlukan' }, { status: 400 });
    } else {
      // Find the request (skip ownership check for testing)
      const permintaan = await prisma.request.findFirst({
        where: {
          id: parseInt(requestId)
        }
      });

      if (!permintaan) {
        return NextResponse.json({ error: 'Permohonan tidak ditemukan' }, { status: 404 });
      }
      
      // Check if keberatan already exists for this request
      const keberatanCheck = await checkKeberatanForRequest(userId, parseInt(requestId));
      if (!keberatanCheck.canSubmit) {
        return NextResponse.json({ error: 'Anda sudah mengajukan keberatan untuk permohonan ini' }, { status: 400 });
      }
    }

    const keberatan = await prisma.keberatan.create({
      data: {
        permintaan_id: parseInt(requestId),
        pemohon_id: userId,
        judul: judul || null,
        alasan_keberatan,
        status: 'Diajukan'
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Keberatan berhasil dibuat', 
      data: keberatan 
    }, { status: 201 });
  } catch (error) {
    console.error('Create keberatan error:', error);
    return NextResponse.json({ 
      error: 'Server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}