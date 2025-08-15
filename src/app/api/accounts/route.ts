import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/lib/prismaClient';
import jwt from 'jsonwebtoken';

interface JWTPayload {
  role: string;
  id: string;
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

    if (decoded.role !== 'Admin' && decoded.role !== 'PPID_UTAMA') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Fetch all accounts from different tables
    const [admins, pemohons, ppids] = await Promise.all([
      prisma.admin.findMany({
        select: {
          id: true,
          nama: true,
          email: true,
          created_at: true
        }
      }),
      prisma.pemohon.findMany({
        select: {
          id: true,
          nama: true,
          email: true,
          nik: true,
          created_at: true
        }
      }),
      prisma.ppid.findMany({
        select: {
          id: true,
          nama: true,
          email: true,
          role: true,
          created_at: true
        }
      })
    ]);

    // Combine all accounts with role information
    const accounts = [
      ...admins.map(admin => ({
        id: `admin_${admin.id}`,
        nama: admin.nama,
        email: admin.email,
        role: 'Admin',
        status: 'Aktif',
        tanggal_dibuat: admin.created_at.toISOString().split('T')[0],
        table: 'admin'
      })),
      ...pemohons.map(pemohon => ({
        id: `pemohon_${pemohon.id}`,
        nama: pemohon.nama,
        email: pemohon.email,
        role: 'Pemohon',
        status: 'Aktif',
        tanggal_dibuat: pemohon.created_at.toISOString().split('T')[0],
        nik: pemohon.nik,
        table: 'pemohon'
      })),
      ...ppids.map(ppid => ({
        id: `ppid_${ppid.id}`,
        nama: ppid.nama,
        email: ppid.email,
        role: ppid.role,
        status: 'Aktif',
        tanggal_dibuat: ppid.created_at.toISOString().split('T')[0],
        table: 'ppid'
      }))
    ];

    return NextResponse.json({ success: true, data: accounts });
  } catch (error) {
    console.error('Get accounts error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}