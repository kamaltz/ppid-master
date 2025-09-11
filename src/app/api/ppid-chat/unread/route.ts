import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/lib/prismaClient';
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
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    
    const userId = parseInt(decoded.id);
    let unreadCount = 0;
    
    if (['ADMIN', 'PPID_UTAMA', 'PPID_PELAKSANA', 'ATASAN_PPID'].includes(decoded.role)) {
      // Count PPID chats where user is receiver and there are newer messages from sender
      const chats = await prisma.ppidChat.findMany({
        where: {
          OR: [
            { sender_id: userId },
            { receiver_id: userId }
          ]
        },
        orderBy: { created_at: 'desc' }
      });
      
      // Group by conversation partner and check if last message is from other person
      const conversations = new Map();
      
      chats.forEach(chat => {
        const partnerId = chat.sender_id === userId ? chat.receiver_id : chat.sender_id;
        if (!conversations.has(partnerId)) {
          conversations.set(partnerId, chat);
        }
      });
      
      // Count conversations where last message is from partner (not from current user)
      unreadCount = Array.from(conversations.values()).filter(chat => 
        chat.sender_id !== userId
      ).length;
    }

    return NextResponse.json({
      success: true,
      count: unreadCount
    });
  } catch (error) {
    console.error('Error fetching unread PPID chats:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}