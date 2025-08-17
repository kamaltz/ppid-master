import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/lib/prismaClient';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    
    if (!process.env.JWT_SECRET) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }
    
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET) as { role: string; id: string };
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    if (decoded.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;

    // Create sample logs if none exist
    const logCount = await prisma.activityLog.count();
    
    if (logCount === 0) {
      // Create sample activity logs
      await prisma.activityLog.createMany({
        data: [
          {
            action: 'LOGIN',
            details: 'Admin login: admin@example.com',
            user_id: '1',
            user_role: 'ADMIN',
            ip_address: '127.0.0.1'
          },
          {
            action: 'CREATE_REQUEST', 
            details: 'Created request: Sample Request',
            user_id: '2',
            user_role: 'Pemohon',
            ip_address: '127.0.0.1'
          },
          {
            action: 'UPDATE_STATUS',
            details: 'Updated request status to Diproses', 
            user_id: '1',
            user_role: 'PPID_UTAMA',
            ip_address: '127.0.0.1'
          }
        ]
      });
    }

    const [logs, total] = await Promise.all([
      prisma.activityLog.findMany({
        orderBy: { created_at: 'desc' },
        skip,
        take: limit
      }),
      prisma.activityLog.count()
    ]);

    const sanitizedLogs = logs.map(log => ({
      ...log,
      details: log.details?.replace(/[<>"'&]/g, (match) => {
        const escapeMap: { [key: string]: string } = {
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#x27;',
          '&': '&amp;'
        };
        return escapeMap[match];
      })
    }));

    return NextResponse.json({ 
      success: true, 
      data: sanitizedLogs,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('Get activity logs error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}