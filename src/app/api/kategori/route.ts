import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/lib/prismaClient';
import jwt from 'jsonwebtoken';

export async function GET(request?: NextRequest) {
  try {
    const authHeader = request?.headers?.get('authorization');
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

    const categories = await prisma.kategoriInformasi.findMany({
      orderBy: { nama: 'asc' }
    });

    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    console.error('Get kategori error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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

    // Only Admin and PPID can create categories
    if (!['ADMIN', 'PPID_UTAMA', 'PPID_PELAKSANA'].includes(decoded.role)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { nama, slug, deskripsi } = await request.json();
    
    if (!nama) {
      return NextResponse.json({ error: 'Nama kategori wajib diisi' }, { status: 400 });
    }

    if (!slug) {
      return NextResponse.json({ error: 'Slug kategori wajib diisi' }, { status: 400 });
    }

    // Check for duplicate
    const existing = await prisma.kategoriInformasi.findFirst({
      where: { 
        OR: [
          { nama },
          { slug }
        ]
      }
    });

    if (existing) {
      return NextResponse.json({ error: 'Nama atau slug kategori sudah digunakan' }, { status: 400 });
    }

    const kategori = await prisma.kategoriInformasi.create({
      data: { nama, slug, deskripsi }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Kategori berhasil dibuat', 
      data: kategori 
    }, { status: 201 });
  } catch (error) {
    console.error('Create kategori error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}