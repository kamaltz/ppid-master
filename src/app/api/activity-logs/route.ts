import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prismaClient';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];
    
    if (!token || !process.env.JWT_SECRET) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as { role: string; id: number };

    const allowedRoles = ['ADMIN', 'PPID_UTAMA', 'PPID_PELAKSANA', 'ATASAN_PPID'];
    if (!allowedRoles.includes(decoded.role)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // PPID_PELAKSANA only sees their own logs
    const where = decoded.role === 'PPID_PELAKSANA' 
      ? { 
          user_id: String(decoded.id),
          user_role: 'PPID_PELAKSANA'
        }
      : {};

    const logs = await prisma.activityLog.findMany({
      where,
      orderBy: { created_at: 'desc' },
      take: 100
    });
    
    console.log('Logs query:', { role: decoded.role, id: decoded.id, where, count: logs.length });



    return NextResponse.json({ 
      success: true, 
      data: logs,
      pagination: { page: 1, limit: 100, total: logs.length, totalPages: 1 }
    });
  } catch (error) {
    console.error('Activity logs error:', error);
    return NextResponse.json({ 
      success: true, 
      data: [],
      pagination: { page: 1, limit: 100, total: 0, totalPages: 1 }
    });
  }
}
