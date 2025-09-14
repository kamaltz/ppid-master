import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prismaClient';
import jwt from 'jsonwebtoken';

interface JWTPayload {
  id: string;
  role: string;
  userId?: number;
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;

    const allowedRoles = ['ADMIN', 'Admin', 'PPID_UTAMA'];
    if (!allowedRoles.includes(decoded.role)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { userId, permissions } = await request.json();

    // Update permissions in PPID table
    await prisma.ppid.update({
      where: { id: userId },
      data: {
        permissions: JSON.stringify(permissions)
      }
    });

    // Log activity
    try {
      await prisma.activityLog.create({
        data: {
          action: 'UPDATE_PERMISSIONS',
          details: `Updated permissions for PPID user ${userId}`,
          user_id: decoded.id?.toString(),
          user_role: decoded.role,
          ip_address: request.headers.get('x-forwarded-for') || 'unknown'
        }
      });
    } catch (logError) {
      console.warn('Failed to log activity:', logError);
      // Don't fail the main operation if logging fails
    }

    return NextResponse.json({ success: true, message: 'Permissions updated successfully' });
  } catch (error) {
    console.error('Update permissions error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}