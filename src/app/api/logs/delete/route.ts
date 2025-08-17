import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    if (decoded.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { ids } = await request.json();
    
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'Invalid IDs' }, { status: 400 });
    }

    global.activityLogs = global.activityLogs || [];
    global.activityLogs = global.activityLogs.filter(log => !ids.includes(log.id));

    global.activityLogs.unshift({
      id: Date.now(),
      action: 'DELETE_LOGS',
      level: 'WARN',
      message: `Admin menghapus ${ids.length} log aktivitas`,
      user_id: decoded.id?.toString(),
      user_role: decoded.role,
      user_email: decoded.email,
      ip_address: request.headers.get('x-forwarded-for') || '127.0.0.1',
      user_agent: request.headers.get('user-agent') || 'Unknown',
      details: { deletedCount: ids.length },
      created_at: new Date().toISOString()
    });

    return NextResponse.json({ 
      success: true, 
      message: `${ids.length} log berhasil dihapus` 
    });

  } catch (error) {
    console.error('Delete logs error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Gagal menghapus log' 
    }, { status: 500 });
  }
}