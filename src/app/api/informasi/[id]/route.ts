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
    const id = parseInt(params.id);

    const informasi = await prisma.informasi.findUnique({
      where: { id },
      include: {
        kategori: {
          select: { id: true, nama: true }
        }
      }
    });

    if (!informasi) {
      return NextResponse.json({ error: 'Information not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: informasi });
  } catch (error) {
    console.error('Get informasi by ID error:', error);
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

    // Only PPID and Admin can update information
    if (!['ADMIN', 'PPID_UTAMA', 'PPID_PELAKSANA'].includes(decoded.role)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const id = parseInt(params.id);

    const existingInformasi = await prisma.informasi.findUnique({
      where: { id }
    });

    if (!existingInformasi) {
      return NextResponse.json({ error: 'Information not found' }, { status: 404 });
    }

    const { judul, klasifikasi, ringkasan_isi_informasi, status } = await request.json();

    const updatedInformasi = await prisma.informasi.update({
      where: { id },
      data: {
        judul: judul || existingInformasi.judul,
        klasifikasi: klasifikasi || existingInformasi.klasifikasi,
        ringkasan_isi_informasi: ringkasan_isi_informasi || existingInformasi.ringkasan_isi_informasi,
        status: status || existingInformasi.status,
        updated_at: new Date()
      }
    });

    return NextResponse.json({ success: true, data: updatedInformasi });
  } catch (error) {
    console.error('Update informasi error:', error);
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

    const existingInformasi = await prisma.informasi.findUnique({
      where: { id }
    });

    if (!existingInformasi) {
      return NextResponse.json({ error: 'Information not found' }, { status: 404 });
    }

    // Check permissions: PPID can only delete their own information, admin can delete any
    if (decoded.role !== 'ADMIN' && existingInformasi.created_by !== userId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    await prisma.informasi.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: 'Information deleted successfully' });
  } catch (error) {
    console.error('Delete informasi error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}