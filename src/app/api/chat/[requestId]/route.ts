import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/lib/prismaClient';
import jwt from 'jsonwebtoken';

interface JWTPayload {
  id: string;
  role: string;
  nama: string;
  userId?: number;
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ requestId: string }> }) {
  try {
    const { requestId } = await params;
    const id = parseInt(requestId);
    
    console.log('Fetching chat for request ID:', id);
    
    let session;
    try {
      session = await prisma.chatSession.findUnique({
        where: { request_id: id }
      });
    } catch (sessionError) {
      console.log('Session fetch error, using default:', sessionError);
      session = null;
    }
    
    const messages = await prisma.requestResponse.findMany({
      where: { request_id: id },
      orderBy: { created_at: 'asc' }
    });
    
    return NextResponse.json({ 
      success: true, 
      data: { 
        session: session || { is_active: true },
        messages 
      } 
    });
  } catch (error) {
    console.error('Get chat error:', error);
    return NextResponse.json({ error: 'Server error', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ requestId: string }> }) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    
    const { requestId } = await params;
    const id = parseInt(requestId);
    const { message, attachments, messageType = 'text' } = await request.json();
    
    console.log('Sending message for request ID:', id, 'User:', decoded.nama, 'Role:', decoded.role);
    
    if (!message?.trim() && (!attachments || attachments.length === 0)) {
      return NextResponse.json({ error: 'Message or attachment required' }, { status: 400 });
    }

    // Get user name based on role
    let userName = decoded.nama || 'Unknown User';
    if (['ADMIN', 'PPID_UTAMA', 'PPID_PELAKSANA', 'ATASAN_PPID'].includes(decoded.role)) {
      try {
        let userRecord = null;
        if (decoded.role === 'ADMIN') {
          userRecord = await prisma.admin.findUnique({ where: { id: parseInt(decoded.id) } });
        } else {
          userRecord = await prisma.ppid.findUnique({ where: { id: parseInt(decoded.id) } });
        }
        if (userRecord) {
          userName = userRecord.nama;
        }
      } catch (error) {
        console.log('Error fetching user name:', error);
      }
    }
    
    // Create the message
    const response = await prisma.requestResponse.create({
      data: {
        request_id: id,
        user_id: decoded.id.toString(),
        user_role: decoded.role,
        user_name: userName,
        message: message?.trim() || '',
        message_type: messageType || 'text',
        attachments: attachments && attachments.length > 0 ? JSON.stringify(attachments) : null
      }
    });
    
    console.log('Message created successfully:', response.id);
    return NextResponse.json({ success: true, data: response });
  } catch (error) {
    console.error('Send message error:', error);
    return NextResponse.json({ error: 'Server error', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}