import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/lib/prismaClient';
import jwt from 'jsonwebtoken';

interface JWTPayload {
  id: string;
  role: string;
  userId?: number;
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);

    const informasi = await prisma.informasiPublik.findUnique({
      where: { id }
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

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    let decoded: JWTPayload;
    
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Only PPID and Admin can update information
    if (!['ADMIN', 'PPID_UTAMA', 'PPID_PELAKSANA'].includes(decoded.role)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { id: paramId } = await params;
    const id = parseInt(paramId);

    const existingInformasi = await prisma.informasiPublik.findUnique({
      where: { id }
    });

    if (!existingInformasi) {
      return NextResponse.json({ error: 'Information not found' }, { status: 404 });
    }

    const { judul, klasifikasi, ringkasan_isi_informasi, status } = await request.json();

    const updatedInformasi = await prisma.informasiPublik.update({
      where: { id },
      data: {
        judul: judul || existingInformasi.judul,
        klasifikasi: klasifikasi || existingInformasi.klasifikasi,
        ringkasan_isi_informasi: ringkasan_isi_informasi || existingInformasi.ringkasan_isi_informasi,
        status: status || existingInformasi.status
      }
    });

    return NextResponse.json({ success: true, data: updatedInformasi });
  } catch (err) {
    console.error('Update informasi error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    try {
      jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { id: paramId } = await params;
    const id = parseInt(paramId);

    const existingInformasi = await prisma.informasiPublik.findUnique({
      where: { id }
    });

    if (!existingInformasi) {
      return NextResponse.json({ error: 'Information not found' }, { status: 404 });
    }

    await prisma.informasiPublik.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: 'Information deleted successfully' });
  } catch (err) {
    console.error('Delete informasi error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}