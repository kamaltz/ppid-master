import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../../lib/lib/prismaClient';
import jwt from 'jsonwebtoken';

interface JWTPayload {
  id: string;
  role: string;
  userId?: number;
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
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

    const id = parseInt(params.id);
    const userId = parseInt(decoded.id) || decoded.userId;

    const permintaan = await prisma.permintaan.findUnique({
      where: { id },
      include: {
        tanggapan: {
          orderBy: { created_at: 'desc' }
        }
      }
    });

    if (!permintaan) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    // Check access permissions
    if (decoded.role === 'Pemohon' && permintaan.pemohon_id !== userId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    return NextResponse.json({ 
      success: true, 
      data: permintaan.tanggapan || []
    });
  } catch (error) {
    console.error('Get responses error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
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

    // Only PPID and Admin can add responses
    if (!['PPID_UTAMA', 'PPID_PELAKSANA', 'ADMIN'].includes(decoded.role)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const id = parseInt(params.id);
    const userId = parseInt(decoded.id) || decoded.userId;

    const permintaan = await prisma.permintaan.findUnique({
      where: { id }
    });

    if (!permintaan) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    const { isi_tanggapan, file_path } = await request.json();

    if (!isi_tanggapan) {
      return NextResponse.json({ error: 'Response content is required' }, { status: 400 });
    }

    // Create response using tanggapan table
    const response = await prisma.tanggapan.create({
      data: {
        permintaan_id: id,
        ppid_id: userId,
        isi_tanggapan,
        file_path: file_path || null
      }
    });

    // Update request status if needed
    await prisma.permintaan.update({
      where: { id },
      data: {
        status: 'Ditanggapi',
        updated_at: new Date()
      }
    });

    // Log activity
    try {
      await prisma.activityLog.create({
        data: {
          action: 'ADD_RESPONSE',
          details: `Added response to request ${id}`,
          user_id: userId.toString(),
          user_role: decoded.role,
          ip_address: request.headers.get('x-forwarded-for') || 'unknown'
        }
      });
    } catch (logError) {
      console.warn('Failed to log activity:', logError);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Response added successfully',
      data: response 
    }, { status: 201 });
  } catch (error) {
    console.error('Add response error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}