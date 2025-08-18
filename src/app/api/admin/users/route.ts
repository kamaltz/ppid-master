import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/lib/prismaClient';
import jwt from 'jsonwebtoken';

interface JWTPayload {
  id: string;
  role: string;
  userId?: number;
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;

    const allowedRoles = ['ADMIN', 'Admin', 'PPID_UTAMA', 'PPID_PELAKSANA', 'ATASAN_PPID'];
    if (!allowedRoles.includes(decoded.role)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Only fetch PPID users with specific roles for permissions management
    const ppidUsers = await prisma.ppid.findMany({
      where: {
        role: {
          in: ['PPID_UTAMA', 'PPID_PELAKSANA', 'ATASAN_PPID']
        }
      },
      select: {
        id: true,
        email: true,
        nama: true,
        role: true,
        permissions: true
      }
    });

    console.log('Found PPID users:', ppidUsers.length);
    console.log('PPID users data:', ppidUsers);

    const users = ppidUsers.map(user => ({
      ...user,
      role: user.role
    }));

    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Server error' }, { status: 500 });
  }
}