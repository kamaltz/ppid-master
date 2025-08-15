import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

interface JWTPayload {
  role: string;
  id: string;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        error: 'Token tidak valid'
      }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    
    if (decoded.role !== 'ppid') {
      return NextResponse.json({
        success: false,
        error: 'Akses ditolak'
      }, { status: 403 });
    }

    const { title, slug, content, status } = await request.json();
    const pageId = params.id;

    if (!title || !slug) {
      return NextResponse.json({
        success: false,
        error: 'Judul dan slug harus diisi'
      }, { status: 400 });
    }

    const existingPage = await prisma.page.findFirst({
      where: {
        slug,
        NOT: {
          id: parseInt(pageId)
        }
      }
    });

    if (existingPage) {
      return NextResponse.json({
        success: false,
        error: 'Slug sudah digunakan'
      }, { status: 400 });
    }

    await prisma.page.update({
      where: {
        id: parseInt(pageId)
      },
      data: {
        title,
        slug,
        content,
        status: status || 'draft'
      }
    });

    return NextResponse.json({
      success: true,
      data: { id: pageId, title, slug, content, status }
    });
  } catch {
    return NextResponse.json({
      success: false,
      error: 'Gagal memperbarui halaman'
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        error: 'Token tidak valid'
      }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    
    if (decoded.role !== 'ppid') {
      return NextResponse.json({
        success: false,
        error: 'Akses ditolak'
      }, { status: 403 });
    }

    const pageId = params.id;

    await prisma.page.delete({
      where: {
        id: parseInt(pageId)
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Halaman berhasil dihapus'
    });
  } catch {
    return NextResponse.json({
      success: false,
      error: 'Gagal menghapus halaman'
    }, { status: 500 });
  }
}