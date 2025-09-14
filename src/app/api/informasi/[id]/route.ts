import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prismaClient';
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

    const { judul, klasifikasi, ringkasan_isi_informasi, status, tanggal_posting, pejabat_penguasa_informasi, thumbnail, jadwal_publish, files, links, images } = await request.json();

    const updateData: any = {};
    if (judul !== undefined) updateData.judul = judul;
    if (klasifikasi !== undefined) updateData.klasifikasi = klasifikasi;
    if (ringkasan_isi_informasi !== undefined) updateData.ringkasan_isi_informasi = ringkasan_isi_informasi;
    if (status !== undefined) updateData.status = status;
    if (tanggal_posting !== undefined) updateData.tanggal_posting = new Date(tanggal_posting);
    if (pejabat_penguasa_informasi !== undefined) updateData.pejabat_penguasa_informasi = pejabat_penguasa_informasi;
    if (thumbnail !== undefined) updateData.thumbnail = thumbnail;
    if (jadwal_publish !== undefined) updateData.jadwal_publish = jadwal_publish ? new Date(jadwal_publish) : null;
    if (files !== undefined) updateData.file_attachments = files && files.length > 0 ? JSON.stringify(files) : null;
    if (links !== undefined) updateData.links = links && links.length > 0 ? JSON.stringify(links) : null;
    if (images !== undefined) updateData.images = images && images.length > 0 ? JSON.stringify(images) : null;

    const updatedInformasi = await prisma.informasiPublik.update({
      where: { id },
      data: updateData
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