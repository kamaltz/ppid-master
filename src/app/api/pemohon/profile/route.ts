import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prismaClient';
import jwt from 'jsonwebtoken';

interface JWTPayload {
  role: string;
  userId: number;
  email: string;
}

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;

    if (decoded.role !== 'PEMOHON') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { nama, email, no_telepon, alamat, nik, pekerjaan } = await request.json();

    const updatedPemohon = await prisma.pemohon.update({
      where: { id: decoded.userId },
      data: {
        nama,
        email,
        no_telepon,
        alamat,
        nik,
        pekerjaan
      },
      select: {
        id: true,
        nama: true,
        email: true,
        no_telepon: true,
        alamat: true,
        nik: true,
        pekerjaan: true
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Profile berhasil diperbarui',
      user: updatedPemohon
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}