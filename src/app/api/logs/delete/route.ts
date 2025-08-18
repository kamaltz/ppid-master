import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

interface JWTPayload {
  role: string;
  userId: number;
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;

    // Only ADMIN can delete logs
    if (decoded.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { ids } = await request.json();
    
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'Invalid log IDs' }, { status: 400 });
    }

    // Remove logs with specified IDs
    if (global.activityLogs) {
      global.activityLogs = global.activityLogs.filter((log: { id: number }) => !ids.includes(log.id));
    }

    return NextResponse.json({ 
      success: true, 
      message: `${ids.length} log(s) deleted successfully`,
      remaining: global.activityLogs?.length || 0
    });

  } catch (error) {
    console.error('Error deleting logs:', error);
    return NextResponse.json({
      success: false,
      error: 'Gagal menghapus log'
    }, { status: 500 });
  }
}