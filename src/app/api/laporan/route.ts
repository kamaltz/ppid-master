import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/lib/prismaClient';
import jwt from 'jsonwebtoken';

interface JWTPayload {
  role: string;
  userId: number;
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Check if user is admin
    if (decoded.role !== 'Admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get report data
    const [requests, keberatan, informasi] = await Promise.all([
      prisma.request.findMany({
        select: {
          id: true,
          rincian_informasi: true,
          status: true,
          created_at: true,
          pemohon: {
            select: { nama: true, email: true }
          }
        },
        orderBy: { created_at: 'desc' },
        take: 100
      }).catch(() => []),
      prisma.keberatan.findMany({
        select: {
          id: true,
          alasan_keberatan: true,
          status: true,
          created_at: true,
          pemohon: {
            select: { nama: true, email: true }
          }
        },
        orderBy: { created_at: 'desc' },
        take: 100
      }).catch(() => []),
      prisma.informasiPublik.findMany({
        select: {
          id: true,
          judul: true,
          klasifikasi: true,
          created_at: true
        },
        orderBy: { created_at: 'desc' },
        take: 100
      }).catch(() => [])
    ]);

    const reportData = {
      summary: {
        totalRequests: requests.length,
        totalKeberatan: keberatan.length,
        totalInformasi: informasi.length
      },
      requests,
      keberatan,
      informasi
    };

    return NextResponse.json({
      success: true,
      data: reportData
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json({
      success: false,
      error: 'Gagal mengambil laporan'
    }, { status: 500 });
  }
}