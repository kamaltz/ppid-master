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

    // Only Admin and PPID Utama can approve accounts
    if (!['ADMIN', 'PPID_UTAMA'].includes(decoded.role)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { pemohonId } = await request.json();

    if (!pemohonId) {
      return NextResponse.json({ error: 'Pemohon ID required' }, { status: 400 });
    }

    const updatedPemohon = await prisma.pemohon.update({
      where: { id: parseInt(pemohonId) },
      data: {
        is_approved: true,
        approved_by: decoded.email,
        approved_at: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Akun pemohon berhasil disetujui',
      pemohon: {
        id: updatedPemohon.id,
        nama: updatedPemohon.nama,
        email: updatedPemohon.email,
        is_approved: updatedPemohon.is_approved
      }
    });
  } catch (error) {
    console.error('Error approving pemohon:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}