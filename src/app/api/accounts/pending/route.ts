import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/lib/prismaClient';
import jwt from 'jsonwebtoken';

interface JWTPayload {
  role: string;
  userId: number;
  email: string;
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;

    // Only Admin and PPID Utama can view pending accounts
    if (!['ADMIN', 'PPID_UTAMA'].includes(decoded.role)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const pendingPemohon = await prisma.pemohon.findMany({
      where: {
        is_approved: false
      },
      select: {
        id: true,
        nama: true,
        email: true,
        nik: true,
        no_telepon: true,
        alamat: true,
        pekerjaan: true,
        is_approved: true,
        created_at: true
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      data: pendingPemohon
    });
  } catch (error) {
    console.error('Error fetching pending accounts:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}