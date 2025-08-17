import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/lib/prismaClient';
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
        pemohon: {
          select: { id: true, nama: true, email: true, nik: true, no_telepon: true }
        },
        kategori: {
          select: { id: true, nama: true }
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

    return NextResponse.json({ success: true, data: permintaan });
  } catch (error) {
    console.error('Get permintaan by ID error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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

    // Only PPID and Admin can update request status
    if (!['PPID_UTAMA', 'PPID_PELAKSANA', 'ADMIN'].includes(decoded.role)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const permintaan = await prisma.permintaan.findUnique({
      where: { id }
    });

    if (!permintaan) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    const { status, catatan } = await request.json();

    const updatedRequest = await prisma.permintaan.update({
      where: { id },
      data: {
        status: status || permintaan.status,
        catatan: catatan || permintaan.catatan,
        updated_at: new Date()
      }
    });

    // Log activity
    try {
      await prisma.activityLog.create({
        data: {
          action: 'UPDATE_REQUEST',
          details: `Updated request ${id}: status changed to ${status}`,
          user_id: userId.toString(),
          user_role: decoded.role,
          ip_address: request.headers.get('x-forwarded-for') || 'unknown'
        }
      });
    } catch (logError) {
      console.warn('Failed to log activity:', logError);
    }

    return NextResponse.json({ success: true, data: updatedRequest });
  } catch (error) {
    console.error('Update permintaan error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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
      where: { id }
    });

    if (!permintaan) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    // Check permissions: pemohon can only delete their own requests, admin can delete any
    if (decoded.role === 'Pemohon' && permintaan.pemohon_id !== userId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    await prisma.permintaan.delete({
      where: { id }
    });

    // Log activity
    try {
      await prisma.activityLog.create({
        data: {
          action: 'DELETE_REQUEST',
          details: `Deleted request ${id}: ${permintaan.judul}`,
          user_id: userId.toString(),
          user_role: decoded.role,
          ip_address: request.headers.get('x-forwarded-for') || 'unknown'
        }
      });
    } catch (logError) {
      console.warn('Failed to log activity:', logError);
    }

    return NextResponse.json({ success: true, message: 'Request deleted successfully' });
  } catch (error) {
    console.error('Delete permintaan error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}