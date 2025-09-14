import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prismaClient';
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

    let user = null;

    if (decoded.role === 'ADMIN') {
      user = await prisma.admin.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          nama: true,
          email: true,
          role: true
        }
      });
    } else if (decoded.role === 'PEMOHON') {
      const pemohonUser = await prisma.pemohon.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          nama: true,
          email: true,
          nik: true,
          no_telepon: true,
          alamat: true,
          pekerjaan: true,
          is_approved: true
        }
      });
      if (pemohonUser) {
        user = { ...pemohonUser, role: 'PEMOHON' };
      }
    } else if (['PPID_UTAMA', 'PPID_PELAKSANA', 'ATASAN_PPID'].includes(decoded.role)) {
      user = await prisma.ppid.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          nama: true,
          email: true,
          role: true,
          no_pegawai: true
        }
      });
    }

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: user
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}