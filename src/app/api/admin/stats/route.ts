import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/lib/prismaClient';
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

    // Get counts from database
    const [
      totalPermintaan,
      totalInformasi,
      totalKeberatan,
      totalPemohon,
      totalAdmin,
      totalPpid
    ] = await Promise.all([
      prisma.request.count().catch(() => 0),
      prisma.informasiPublik.count().catch(() => 0),
      prisma.keberatan.count().catch(() => 0),
      prisma.pemohon.count().catch(() => 0),
      prisma.admin.count().catch(() => 0),
      prisma.ppid.count().catch(() => 0)
    ]);

    const stats = {
      totalPermintaan,
      totalInformasi,
      totalKeberatan,
      totalPemohon,
      totalAdmin,
      totalPpid,
      totalUsers: totalPemohon + totalAdmin + totalPpid
    };

    return NextResponse.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json({
      success: false,
      error: 'Gagal mengambil statistik'
    }, { status: 500 });
  }
}