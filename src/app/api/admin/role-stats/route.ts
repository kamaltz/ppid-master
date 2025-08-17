import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/lib/prismaClient';
import jwt from 'jsonwebtoken';

const ROLE_PERMISSIONS = {
  ADMIN: ['full_access', 'user_management', 'system_settings'],
  PPID_UTAMA: ['informasi', 'permohonan', 'keberatan', 'kategori'],
  PPID_PELAKSANA: ['permohonan', 'chat'],
  ATASAN_PPID: ['permohonan', 'keberatan'],
  Pemohon: ['submit_request', 'view_status']
} as const;

const JWT_SECRET = process.env.JWT_SECRET;

export async function GET(request: NextRequest) {
  try {
    if (!request) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
    
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Token not provided' }, { status: 401 });
    }
    
    if (!JWT_SECRET) {
      console.error('JWT_SECRET environment variable is not set');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }
    
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as { role: string; id: string };
    } catch (error) {
      console.error('JWT verification failed:', error);
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    if (decoded.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get counts from each table
    let adminCount, pemohonCount, ppidUsers;
    try {
      [adminCount, pemohonCount, ppidUsers] = await Promise.all([
        prisma.admin.count(),
        prisma.pemohon.count(),
        prisma.ppid.findMany({
          select: {
            role: true,
            permissions: true
          }
        })
      ]);
    } catch (dbError) {
      console.error('Database query failed:', dbError);
      return NextResponse.json({ error: 'Failed to fetch role statistics' }, { status: 500 });
    }

    // Count PPID roles
    const ppidRoleCounts = ppidUsers.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Build role statistics
    const roleStats = [
      {
        role: 'ADMIN',
        count: adminCount,
        permissions: ROLE_PERMISSIONS.ADMIN
      },
      {
        role: 'PPID_UTAMA',
        count: ppidRoleCounts['PPID_UTAMA'] || 0,
        permissions: ROLE_PERMISSIONS.PPID_UTAMA
      },
      {
        role: 'PPID_PELAKSANA',
        count: ppidRoleCounts['PPID_PELAKSANA'] || 0,
        permissions: ROLE_PERMISSIONS.PPID_PELAKSANA
      },
      {
        role: 'ATASAN_PPID',
        count: ppidRoleCounts['ATASAN_PPID'] || 0,
        permissions: ROLE_PERMISSIONS.ATASAN_PPID
      },
      {
        role: 'Pemohon',
        count: pemohonCount,
        permissions: ROLE_PERMISSIONS.Pemohon
      }
    ];

    return NextResponse.json({ success: true, data: roleStats });
  } catch (error) {
    console.error('Get role stats error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}