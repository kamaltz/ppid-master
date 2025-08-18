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
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    
    const { searchParams } = new URL(request.url);
    const pemohonId = searchParams.get('pemohon_id');

    const userId = parseInt(decoded.id) || decoded.userId;
    const where: Record<string, unknown> = {};
    
    if (decoded.role === 'PEMOHON') {
      where.pemohon_id = userId;
    } else if (decoded.role === 'PPID_PELAKSANA') {
      // PPID Pelaksana only sees keberatan assigned to them
      where.assigned_ppid_id = userId;
    } else if (decoded.role === 'PPID_UTAMA' || decoded.role === 'ADMIN') {
      // PPID Utama and Admin see all keberatan
      if (pemohonId) {
        where.pemohon_id = parseInt(pemohonId);
      }
    }

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
      orderBy: { created_at: 'desc' }
    });

    return NextResponse.json({ success: true, data: keberatan });
  } catch (error) {
    console.error('Get keberatan error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
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