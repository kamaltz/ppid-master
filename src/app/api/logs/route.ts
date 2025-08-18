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

    const { searchParams } = new URL(request.url);
    const level = searchParams.get('level');
    const action = searchParams.get('action');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Get logs from global storage
    let logs = global.activityLogs || [];

    // Apply filters
    if (level && level !== 'all') {
      logs = logs.filter((log: { level: string }) => log.level === level);
    }
    if (action && action !== 'all') {
      logs = logs.filter((log: { action: string }) => log.action === action);
    }
    if (startDate) {
      logs = logs.filter((log: { created_at: string }) => new Date(log.created_at) >= new Date(startDate));
    }
    if (endDate) {
      logs = logs.filter((log: { created_at: string }) => new Date(log.created_at) <= new Date(endDate + 'T23:59:59'));
    }

    // Sort by created_at descending
    logs.sort((a: { created_at: string }, b: { created_at: string }) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    // Pagination
    const total = logs.length;
    const totalPages = Math.ceil(total / limit);
    const skip = (page - 1) * limit;
    const paginatedLogs = logs.slice(skip, skip + limit);

    return NextResponse.json({
      success: true,
      data: paginatedLogs,
      pagination: {
        page,
        limit,
        total,
        totalPages
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