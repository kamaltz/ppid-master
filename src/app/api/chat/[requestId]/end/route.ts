import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../../lib/lib/prismaClient';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest, { params }: { params: Promise<{ requestId: string }> }) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    // Only admin roles can end chat
    if (!['Admin', 'PPID_UTAMA', 'PPID_PELAKSANA'].includes(decoded.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    const { requestId } = await params;
    const id = parseInt(requestId);
    
    // Update or create chat session as ended
    await prisma.chatSession.upsert({
      where: { request_id: id },
      update: {
        is_active: false,
        ended_by: decoded.nama,
        ended_at: new Date()
      },
      create: {
        request_id: id,
        is_active: false,
        ended_by: decoded.nama,
        ended_at: new Date()
      }
    });
    
    // Add system message about chat ending
    await prisma.requestResponse.create({
      data: {
        request_id: id,
        user_id: 'system',
        user_role: 'System',
        user_name: 'Sistem',
        message: `Chat telah diakhiri oleh ${decoded.nama}. Terima kasih atas komunikasi Anda. Jika ada pertanyaan lebih lanjut, silakan ajukan permohonan baru.`,
        message_type: 'system'
      }
    });
    
    return NextResponse.json({ success: true, message: 'Chat ended successfully' });
  } catch (error) {
    console.error('End chat error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}