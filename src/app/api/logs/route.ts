import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/lib/prismaClient';

export async function POST(request: NextRequest) {
  try {
    const { action, details, userId, userRole } = await request.json();

    await prisma.activityLog.create({
      data: {
        action,
        details,
        user_id: userId,
        user_role: userRole,
        ip_address: request.headers.get('x-forwarded-for') || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown'
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Log error:', error);
    return NextResponse.json({ error: 'Failed to log activity' }, { status: 500 });
  }
}