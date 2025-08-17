import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../../lib/lib/prismaClient';
import jwt from 'jsonwebtoken';

interface JWTPayload {
  id: string;
  role: string;
  userId?: number;
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    
    if (!['ADMIN', 'PPID_UTAMA', 'PPID_PELAKSANA'].includes(decoded.role)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { id } = await params;
    const ppidId = parseInt(id);
    const adminId = parseInt(decoded.id) || decoded.userId;

    const messages = await prisma.ppidChat.findMany({
      where: {
        OR: [
          { sender_id: adminId, receiver_id: ppidId },
          { sender_id: ppidId, receiver_id: adminId }
        ]
      },
      include: {
        sender: {
          select: { nama: true }
        }
      },
      orderBy: { created_at: 'asc' }
    });

    return NextResponse.json({ success: true, data: messages });
  } catch (error) {
    console.error('Get messages error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}