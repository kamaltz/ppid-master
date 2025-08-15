import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '../../../../../lib/lib/prismaClient';

interface JWTPayload {
  role: string;
  userId: number;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const pageId = parseInt(params.id);
    
    const page = await prisma.page.findUnique({
      where: { id: pageId }
    });

    if (!page) {
      return NextResponse.json({
        success: false,
        error: 'Halaman tidak ditemukan'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: page
    });
  } catch (error) {
    console.error('Error fetching page:', error);
    return NextResponse.json({
      success: false,
      error: 'Gagal mengambil data halaman'
    }, { status: 500 });
  }
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
    
    if (decoded.role !== 'Admin') {
      return NextResponse.json({
        success: false,
        error: 'Akses ditolak'
      }, { status: 403 });
    }

    const { title, slug, content, status } = await request.json();
    const pageId = params.id;

    if (!title) {
      return NextResponse.json({
        success: false,
        error: 'Judul harus diisi'
      }, { status: 400 });
    }

    // Get existing page to preserve slug if not provided
    const existingPage = await prisma.page.findUnique({ where: { id: parseInt(pageId) } });
    if (!existingPage) {
      return NextResponse.json({
        success: false,
        error: 'Halaman tidak ditemukan'
      }, { status: 404 });
    }

    const finalSlug = slug || existingPage.slug;

    if (slug && slug !== existingPage.slug) {
      const duplicateSlug = await prisma.page.findFirst({
        where: {
          slug: finalSlug,
          NOT: {
            id: parseInt(pageId)
          }
        }
      });

      if (duplicateSlug) {
        return NextResponse.json({
          success: false,
          error: 'Slug sudah digunakan'
        }, { status: 400 });
      }
    }

    const updatedPage = await prisma.page.update({
      where: {
        id: parseInt(pageId)
      },
      data: {
        title,
        slug: finalSlug,
        content: content !== undefined ? content : existingPage.content,
        status: status || existingPage.status
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedPage
    });
  } catch (error) {
    console.error('Error updating page:', error);
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
    
    if (decoded.role !== 'Admin') {
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
  } catch (error) {
    console.error('Error deleting page:', error);
    return NextResponse.json({
      success: false,
      error: 'Gagal menghapus halaman'
    }, { status: 500 });
  }
}