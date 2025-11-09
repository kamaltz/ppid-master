import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prismaClient';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Log creation request:', body);
    
    const {
      action,
      level = 'INFO',
      message,
      user_id,
      user_role,
      user_email,
      ip_address,
      user_agent,
      resource_id,
      resource_type,
      details
    } = body;

    if (!action || !user_id) {
      console.error('Missing required fields:', { action, user_id });
      return NextResponse.json({ success: false, error: 'Missing action or user_id' }, { status: 400 });
    }

    const clientIP = ip_address || 
      request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      '127.0.0.1';

    const logData = {
      action,
      level: level || 'INFO',
      details: message || '',
      user_id: String(user_id),
      user_role: user_role || 'UNKNOWN',
      ip_address: clientIP,
      user_agent: user_agent || request.headers.get('user-agent') || 'Unknown',
      resource: resource_type || null
    };

    console.log('Creating log with data:', logData);

    const log = await prisma.activityLog.create({
      data: logData
    });

    console.log('✅ Activity log created:', { id: log.id, user_id: log.user_id, action });
    return NextResponse.json({ success: true, id: log.id });
  } catch (error) {
    console.error('❌ Activity log creation error:', error);
    console.error('Error details:', error instanceof Error ? error.message : error);
    return NextResponse.json({ success: false, error: 'Failed to create log' }, { status: 500 });
  }
}