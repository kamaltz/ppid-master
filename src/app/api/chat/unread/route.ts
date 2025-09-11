import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/lib/prismaClient';
import jwt from 'jsonwebtoken';

interface JWTPayload {
  role: string;
  userId: number;
  email: string;
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;

    // Mock unread chat count - replace with actual logic
    const unreadCount = Math.floor(Math.random() * 5); // Random 0-4 for demo

    return NextResponse.json({
      success: true,
      count: unreadCount
    });
  } catch (error) {
    console.error('Error fetching unread chats:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}