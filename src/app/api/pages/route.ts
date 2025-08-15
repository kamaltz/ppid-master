import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/lib/prismaClient';
import jwt from 'jsonwebtoken';

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
    // Check authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as { role: string; userId: number };
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Check if user is admin
    if (decoded.role !== 'Admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

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
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating page:', error);
    return NextResponse.json({
      success: false,
      error: 'Gagal membuat halaman: ' + (error as Error).message
    }, { status: 500 });
  }
}