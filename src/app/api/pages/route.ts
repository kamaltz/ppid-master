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
    console.log('POST /api/pages called');
    // Check authentication
    const authHeader = request.headers.get('authorization');
    console.log('Auth header present:', !!authHeader);
    if (!authHeader?.startsWith('Bearer ')) {
      console.log('No Bearer token found');
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    console.log('Token extracted:', !!token);
    let decoded: { role: string };
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as { role: string };
      console.log('Token decoded, role:', decoded.role);
    } catch (error) {
      console.log('JWT verify failed:', error);
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Check if user is admin or PPID
    if (!['ADMIN', 'PPID_UTAMA', 'PPID_PELAKSANA'].includes(decoded.role)) {
      console.log('Role not authorized:', decoded.role);
      return NextResponse.json({ error: 'Admin or PPID access required' }, { status: 403 });
    }
    console.log('Authorization passed');

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