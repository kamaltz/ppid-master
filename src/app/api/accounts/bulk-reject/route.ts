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

    await prisma.pemohon.deleteMany({
      where: {
        id: { in: pemohonIds },
        is_approved: false
      }
    });

    return NextResponse.json({
      success: true,
      message: `${pemohonIds.length} accounts rejected successfully`
    });
  } catch (error) {
    console.error('Error bulk rejecting accounts:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}