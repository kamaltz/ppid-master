import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/lib/prismaClient';
import jwt from 'jsonwebtoken';

interface JWTPayload {
  role: string;
  id: string;
  email: string;
}

const getDefaultPermissions = (role: string) => {
  switch (role) {
    case 'ADMIN':
      return {
        informasi: true,
        kategori: true,
        chat: true,
        permohonan: true,
        keberatan: true,
        kelola_akun: true,
        manajemen_role: true,
        kelola_akses: true,
        log_aktivitas: true,
        pengaturan: true,
        media: true,
        profile: true
      };
    case 'PPID_UTAMA':
      return {
        informasi: true,
        kategori: true,
        chat: true,
        permohonan: true,
        keberatan: true,
        kelola_akun: false,
        manajemen_role: false,
        kelola_akses: false,
        log_aktivitas: false,
        pengaturan: true,
        media: true,
        profile: true
      };
    case 'PPID_PELAKSANA':
      return {
        informasi: true,
        kategori: true,
        chat: true,
        permohonan: true,
        keberatan: true,
        kelola_akun: false,
        manajemen_role: false,
        kelola_akses: false,
        log_aktivitas: false,
        pengaturan: false,
        media: false,
        profile: true
      };
    case 'ATASAN_PPID':
      return {
        informasi: true,
        kategori: false,
        chat: false,
        permohonan: true,
        keberatan: true,
        kelola_akun: false,
        manajemen_role: false,
        kelola_akses: false,
        log_aktivitas: false,
        pengaturan: false,
        media: false,
        profile: true
      };
    default:
      return {
        informasi: false,
        kategori: false,
        chat: false,
        permohonan: false,
        keberatan: false,
        kelola_akun: false,
        manajemen_role: false,
        kelola_akses: false,
        log_aktivitas: false,
        pengaturan: false,
        media: false,
        profile: false
      };
  }
};

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;

    let userPermissions = null;
    
    if (decoded.role === 'ADMIN') {
      const admin = await prisma.admin.findUnique({
        where: { id: parseInt(decoded.id) },
        select: { permissions: true }
      });
      userPermissions = admin?.permissions;
    } else if (['PPID_UTAMA', 'PPID_PELAKSANA', 'ATASAN_PPID'].includes(decoded.role)) {
      const ppid = await prisma.ppid.findUnique({
        where: { id: parseInt(decoded.id) },
        select: { permissions: true }
      });
      userPermissions = ppid?.permissions;
    }

    let permissions;
    try {
      permissions = userPermissions ? JSON.parse(userPermissions) : getDefaultPermissions(decoded.role);
    } catch {
      permissions = getDefaultPermissions(decoded.role);
    }

    return NextResponse.json({
      success: true,
      permissions
    });

  } catch (error) {
    console.error('Get user permissions error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}