import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prismaClient';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);
    const authHeader = request.headers.get('authorization');
    
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        jwt.verify(token, process.env.JWT_SECRET!) as { role: string };
      } catch {
        // Token invalid, continue as public user
      }
    }

    const kategori = await prisma.kategoriInformasi.findUnique({
      where: { id }
    });

    if (!kategori) {
      return NextResponse.json({ error: 'Kategori tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: kategori });
  } catch (err) {
    console.error('Get kategori by id error:', err);
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
    let decoded: { role: string };
    
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as { role: string };
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Only Admin and PPID can update categories
    if (!['ADMIN', 'PPID_UTAMA', 'PPID_PELAKSANA'].includes(decoded.role)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { id: paramId } = await params;
    const id = parseInt(paramId);
    const { nama, slug, deskripsi } = await request.json();

    // Check if category exists
    const existing = await prisma.kategoriInformasi.findUnique({
      where: { id }
    });

    if (!existing) {
      return NextResponse.json({ error: 'Kategori tidak ditemukan' }, { status: 404 });
    }

    const kategori = await prisma.kategoriInformasi.update({
      where: { id },
      data: { nama, slug, deskripsi }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Kategori berhasil diperbarui', 
      data: kategori 
    });
  } catch (err) {
    console.error('Update kategori error:', err);
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
    let decoded: { role: string };
    
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as { role: string };
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Only Admin can delete categories
    if (decoded.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { id: paramId } = await params;
    const id = parseInt(paramId);

    // Check if category exists
    const existing = await prisma.kategoriInformasi.findUnique({
      where: { id }
    });

    if (!existing) {
      return NextResponse.json({ error: 'Kategori tidak ditemukan' }, { status: 404 });
    }

    try {
      await prisma.kategoriInformasi.delete({
        where: { id }
      });

      return NextResponse.json({ 
        success: true, 
        message: 'Kategori berhasil dihapus' 
      });
    } catch (deleteError: unknown) {
      if ((deleteError as { code?: string }).code === 'P2003') {
        return NextResponse.json({ 
          error: 'Kategori tidak dapat dihapus karena masih digunakan' 
        }, { status: 400 });
      }
      throw deleteError;
    }
  } catch (err) {
    console.error('Delete kategori error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}