import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prismaClient';
import jwt from 'jsonwebtoken';

interface JWTPayload {
  role: string;
  userId: number;
  email: string;
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;

    if (!['ADMIN', 'PPID_UTAMA'].includes(decoded.role)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { pemohonIds } = await request.json();

    if (!Array.isArray(pemohonIds) || pemohonIds.length === 0) {
      return NextResponse.json({ error: 'Invalid pemohon IDs' }, { status: 400 });
    }

    await prisma.pemohon.updateMany({
      where: {
        id: { in: pemohonIds },
        is_approved: false
      },
      data: {
        is_approved: true
      }
    });

    return NextResponse.json({
      success: true,
      message: `${pemohonIds.length} accounts approved successfully`
    });
  } catch (error) {
    console.error('Error bulk approving accounts:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}