import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../../lib/prismaClient';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { role: string; nama: string; };
    
    if (!['ADMIN', 'PPID_UTAMA', 'PPID_PELAKSANA', 'ATASAN_PPID'].includes(decoded.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    const { id } = await params;
    const requestId = parseInt(id);
    
    await prisma.chatSession.upsert({
      where: { request_id: requestId },
      update: {
        is_active: false,
        ended_by: decoded.nama,
        ended_at: new Date()
      },
      create: {
        request_id: requestId,
        is_active: false,
        ended_by: decoded.nama,
        ended_at: new Date()
      }
    });
    
    await prisma.requestResponse.create({
      data: {
        request_id: requestId,
        user_id: 'system',
        user_role: 'System',
        user_name: 'Sistem',
        message: `Chat telah diakhiri oleh ${decoded.nama}`,
        message_type: 'system'
      }
    });
    
    return NextResponse.json({ success: true, message: 'Chat ended successfully' });
  } catch (error) {
    console.error('End chat error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}