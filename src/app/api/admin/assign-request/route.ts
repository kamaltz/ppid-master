import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/lib/prismaClient';
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

    // Only PPID Utama can assign requests
    if (decoded.role !== 'PPID_UTAMA') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { requestId, assignedTo } = await request.json();

    if (!requestId || !assignedTo) {
      return NextResponse.json({ error: 'Request ID and assigned user required' }, { status: 400 });
    }

    // Update request with assigned user and change status to Diproses
    await prisma.request.update({
      where: { id: requestId },
      data: {
        assigned_ppid_id: assignedTo,
        status: 'Diproses'
      }
    });

    return NextResponse.json({ success: true, message: 'Request assigned successfully' });
  } catch (error) {
    console.error('Assign request error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}