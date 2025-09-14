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
    
    if (!['ADMIN', 'PPID_UTAMA', 'PPID_PELAKSANA'].includes(decoded.role)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { receiver_id, message } = await request.json();
    const senderId = parseInt(decoded.id) || decoded.userId;

    if (!senderId) {
      return NextResponse.json({ error: 'Invalid sender ID' }, { status: 400 });
    }

    const chatMessage = await prisma.ppidChat.create({
      data: {
        sender_id: senderId,
        receiver_id: parseInt(receiver_id),
        message: String(message)
      }
    });

    return NextResponse.json({ success: true, data: chatMessage });
  } catch (error) {
    console.error('Send message error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}