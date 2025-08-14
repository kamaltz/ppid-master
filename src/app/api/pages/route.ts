import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const pages = await prisma.page.findMany({
      orderBy: {
        created_at: 'desc'
      }
    });
    
    return NextResponse.json({
      success: true,
      data: pages
    });
  } catch (error) {
    console.error('Error fetching pages:', error);
    return NextResponse.json({
      success: false,
      error: 'Gagal mengambil data halaman'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, slug, content, status } = await request.json();
    console.log('Creating page:', { title, slug, status });

    if (!title || !slug) {
      return NextResponse.json({
        success: false,
        error: 'Judul dan slug harus diisi'
      }, { status: 400 });
    }

    // Check if slug already exists
    const existingPage = await prisma.page.findUnique({
      where: { slug }
    });

    if (existingPage) {
      return NextResponse.json({
        success: false,
        error: 'Slug sudah digunakan'
      }, { status: 400 });
    }

    const newPage = await prisma.page.create({
      data: {
        title,
        slug,
        content: content || '',
        status: status || 'draft'
      }
    });

    console.log('Insert successful:', newPage);

    return NextResponse.json({
      success: true,
      data: newPage
    });
  } catch (error) {
    console.error('Error creating page:', error);
    return NextResponse.json({
      success: false,
      error: 'Gagal membuat halaman: ' + (error as Error).message
    }, { status: 500 });
  }
}