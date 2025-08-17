import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/lib/prismaClient';
import jwt from 'jsonwebtoken';

interface JWTPayload {
  id: string;
  role: string;
  userId?: number;
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    let decoded: JWTPayload;
    
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userId = parseInt(decoded.id);

    // Get chats where user is sender or receiver
    const chats = await prisma.ppidChat.findMany({
      where: {
        OR: [
          { sender_id: userId },
          { receiver_id: userId }
        ]
      },
      include: {
        sender: {
          select: { id: true, nama: true, role: true }
        },
        receiver: {
          select: { id: true, nama: true, role: true }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    return NextResponse.json({ 
      success: true, 
      data: chats 
    });
  } catch (error) {
    console.error('Get PPID chats error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    let decoded: JWTPayload;
    
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Only PPID roles can send inter-PPID messages
    if (!decoded.role.includes('PPID')) {
      return NextResponse.json({ error: 'Only PPID can send messages' }, { status: 403 });
    }

    const { receiverId, subject, message, attachments } = await request.json();
    const senderId = parseInt(decoded.id);

    if (!receiverId || !message) {
      return NextResponse.json({ error: 'Receiver and message are required' }, { status: 400 });
    }

    // Verify receiver exists and is PPID
    const receiver = await prisma.ppid.findUnique({
      where: { id: receiverId }
    });

    if (!receiver || !receiver.role.includes('PPID')) {
      return NextResponse.json({ error: 'Invalid receiver' }, { status: 400 });
    }

    const chat = await prisma.ppidChat.create({
      data: {
        sender_id: senderId,
        receiver_id: receiverId,
        subject: subject || 'Pesan PPID',
        message,
        attachments: attachments ? JSON.stringify(attachments) : null
      },
      include: {
        sender: {
          select: { id: true, nama: true, role: true }
        },
        receiver: {
          select: { id: true, nama: true, role: true }
        }
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Message sent successfully',
      data: chat 
    });
  } catch (error) {
    console.error('Send PPID chat error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}