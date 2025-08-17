import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

interface JWTPayload {
  role: string;
  userId: number;
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;

    // Allow access for ADMIN and PPID roles
    if (!['ADMIN', 'PPID_UTAMA'].includes(decoded.role)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get logs directly from global storage
    const logs = global.activityLogs || [];

    return NextResponse.json({
      success: true,
      data: logs,
      pagination: {
        page: 1,
        limit: 50,
        total: logs.length,
        pages: 1
      }
    });

  } catch (error) {
    console.error('Error fetching logs:', error);
    return NextResponse.json({
      success: false,
      error: 'Gagal mengambil log sistem'
    }, { status: 500 });
  }
}