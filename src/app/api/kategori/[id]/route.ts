import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/lib/prismaClient';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    const authHeader = request.headers.get('authorization');
    let isAdmin = false;
    
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
        isAdmin = ['ADMIN', 'PPID_UTAMA'].includes(decoded.role);
      } catch (error) {
        // Token invalid, continue as public user
      }
    }

    const kategori = await prisma.kategori.findUnique({
      where: { id },
      ...(isAdmin && {
        include: {
          _count: {
            select: {
              informasi: true,
              permintaan: true
            }
          }
        }
      })
    });

    if (!kategori) {
      return NextResponse.json({ error: 'Kategori tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: kategori });
  } catch (error) {
    console.error('Get kategori by id error:', error);
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
    let decoded: any;
    
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Only Admin and PPID can update categories
    if (!['ADMIN', 'PPID_UTAMA', 'PPID_PELAKSANA'].includes(decoded.role)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const id = parseInt(params.id);
    const { nama, deskripsi } = await request.json();

    // Check if category exists
    const existing = await prisma.kategori.findUnique({
      where: { id }
    });

    if (!existing) {
      return NextResponse.json({ error: 'Kategori tidak ditemukan' }, { status: 404 });
    }

    const kategori = await prisma.kategori.update({
      where: { id },
      data: { nama, deskripsi }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Kategori berhasil diperbarui', 
      data: kategori 
    });
  } catch (error) {
    console.error('Update kategori error:', error);
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
    let decoded: any;
    
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Only Admin can delete categories
    if (decoded.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const id = parseInt(params.id);

    // Check if category exists
    const existing = await prisma.kategori.findUnique({
      where: { id }
    });

    if (!existing) {
      return NextResponse.json({ error: 'Kategori tidak ditemukan' }, { status: 404 });
    }

    try {
      await prisma.kategori.delete({
        where: { id }
      });

      return NextResponse.json({ 
        success: true, 
        message: 'Kategori berhasil dihapus' 
      });
    } catch (error: any) {
      if (error.code === 'P2003') {
        return NextResponse.json({ 
          error: 'Kategori tidak dapat dihapus karena masih digunakan' 
        }, { status: 400 });
      }
      throw error;
    }
  } catch (error) {
    console.error('Delete kategori error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}