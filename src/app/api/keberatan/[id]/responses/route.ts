import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../../lib/prismaClient';
import jwt from 'jsonwebtoken';

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
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    const { id: paramId } = await params;
    const id = parseInt(paramId);

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

    // Get user name based on role
    let userName = 'Unknown User';
    const userRole = user_role || decoded.role;
    
    if (['ADMIN', 'PPID_UTAMA', 'PPID_PELAKSANA', 'ATASAN_PPID'].includes(userRole)) {
      try {
        let userRecord = null;
        if (userRole === 'ADMIN') {
          userRecord = await prisma.admin.findUnique({ where: { id: parseInt(decoded.id) } });
        } else {
          userRecord = await prisma.ppid.findUnique({ where: { id: parseInt(decoded.id) } });
        }
        if (userRecord && userRecord.nama) {
          userName = userRecord.nama;
        } else {
          userName = decoded.nama || 'Unknown User';
        }
      } catch (error) {
        console.log('Error fetching user name:', error);
        userName = decoded.nama || 'Unknown User';
      }
    } else {
      userName = decoded.nama || 'Unknown User';
    }

    const response = await prisma.keberatanResponse.create({
      data: {
        keberatan_id: id,
        user_id: decoded.id.toString(),
        user_role: userRole,
        user_name: userName,
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