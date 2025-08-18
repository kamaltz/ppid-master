import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);

    const responses = await prisma.keberatanResponse.findMany({
      where: { keberatan_id: id },
      orderBy: { created_at: 'asc' }
    });

    return NextResponse.json({ 
      success: true, 
      data: responses || []
    });
  } catch (error) {
    console.error('Get keberatan responses error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);
    const userId = '1';

    const keberatan = await prisma.keberatan.findUnique({
      where: { id }
    });

    if (!keberatan) {
      return NextResponse.json({ error: 'Keberatan not found' }, { status: 404 });
    }

    const { message, attachments, user_role, message_type } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message content is required' }, { status: 400 });
    }

    const roleNames = {
      'Pemohon': 'Pemohon',
      'Admin': 'Admin',
      'PPID_UTAMA': 'PPID Utama',
      'PPID_PELAKSANA': 'PPID Pelaksana',
      'ATASAN_PPID': 'Atasan PPID',
      'System': 'System'
    };

    const response = await prisma.keberatanResponse.create({
      data: {
        keberatan_id: id,
        user_id: userId,
        user_role: user_role || 'PPID_UTAMA',
        user_name: roleNames[user_role as keyof typeof roleNames] || 'PPID Officer',
        message,
        attachments: attachments ? JSON.stringify(attachments) : null,
        message_type: message_type || 'text'
      }
    });

    await prisma.keberatan.update({
      where: { id },
      data: {
        status: 'Ditanggapi',
        updated_at: new Date()
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Response added successfully',
      data: response 
    }, { status: 201 });
  } catch (error) {
    console.error('Add keberatan response error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}