import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../../lib/lib/prismaClient';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const requestId = parseInt(id);
    
    const responses = await prisma.requestResponse.findMany({
      where: { request_id: requestId },
      orderBy: { created_at: 'asc' }
    });
    
    return NextResponse.json({ success: true, data: responses });
  } catch (error) {
    console.error('Get responses error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      console.log('Decoded token:', decoded);
    } catch (jwtError) {
      console.error('JWT Error:', jwtError);
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    const { id } = await params;
    const requestId = parseInt(id);
    const body = await request.json();
    const { message, attachments, message_type } = body;
    
    // Allow empty messages for system messages
    if ((!message || message.trim() === '') && message_type !== 'system') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }
    
    // Only check chat status for pemohon, allow admin to send anytime
    if (decoded.role === 'Pemohon') {
      const endMessage = await prisma.requestResponse.findFirst({
        where: {
          request_id: requestId,
          message_type: 'system',
          message: { contains: 'Chat telah diakhiri' }
        },
        orderBy: { created_at: 'desc' }
      });
      
      const resumeMessage = await prisma.requestResponse.findFirst({
        where: {
          request_id: requestId,
          message_type: 'system',
          message: { contains: 'Chat telah dilanjutkan' }
        },
        orderBy: { created_at: 'desc' }
      });
      
      // Chat is ended if end message exists and is more recent than resume message
      if (endMessage && (!resumeMessage || new Date(endMessage.created_at) > new Date(resumeMessage.created_at))) {
        return NextResponse.json({ error: 'Chat has been ended' }, { status: 400 });
      }
    }
    
    const response = await prisma.requestResponse.create({
      data: {
        request_id: requestId,
        user_id: decoded.id?.toString() || '1',
        user_role: decoded.role || 'User',
        user_name: decoded.nama || decoded.name || decoded.email || 'Unknown User',
        message: message || '',
        attachments: attachments && attachments.length > 0 ? JSON.stringify(attachments) : null,
        message_type: message_type || 'text'
      }
    });
    
    return NextResponse.json({ success: true, data: response });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}