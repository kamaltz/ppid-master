import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    let userInfo = null;
    
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        userInfo = jwt.verify(token, process.env.JWT_SECRET!) as { id?: number; role: string; email: string };
      } catch {
        console.log('Invalid token on logout');
      }
    }
    
    if (userInfo) {
      try {
        global.activityLogs = global.activityLogs || [];
        global.activityLogs.unshift({
          id: Date.now(),
          action: 'LOGOUT',
          level: 'INFO',
          message: `${userInfo.role} ${userInfo.email} logout dari sistem`,
          user_id: userInfo.id?.toString(),
          user_role: userInfo.role,
          user_email: userInfo.email,
          ip_address: request.headers.get('x-forwarded-for') || '127.0.0.1',
          user_agent: request.headers.get('user-agent') || 'Unknown',
          created_at: new Date().toISOString()
        });
        console.log('Logout logged successfully');
      } catch (logError) {
        console.error('Failed to log logout:', logError);
      }
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}