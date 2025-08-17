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
    const { message, attachments } = await request.json();
    
    // Check if chat is ended
    const systemMessage = await prisma.requestResponse.findFirst({
      where: {
        request_id: requestId,
        user_role: 'System',
        message: { contains: 'Chat telah diakhiri' }
      }
    });
    
    if (systemMessage) {
      return NextResponse.json({ error: 'Chat has been ended' }, { status: 400 });
    }
    
    const response = await prisma.requestResponse.create({
      data: {
        request_id: requestId,
        user_id: decoded.id?.toString() || '1',
        user_role: decoded.role || 'User',
        user_name: decoded.nama || decoded.name || decoded.email || 'Unknown User',
        message: message || '',
        attachments: attachments && attachments.length > 0 ? JSON.stringify(attachments) : null
      }
    });
    
    return NextResponse.json({ success: true, data: response });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}