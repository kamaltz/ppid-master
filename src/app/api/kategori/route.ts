import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prismaClient';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    // Test database connection
    await prisma.$connect();
    const authHeader = request?.headers?.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        jwt.verify(token, process.env.JWT_SECRET!) as { role: string };
      } catch {
        // Token invalid, continue as public user
      }
    }

    const categories = await prisma.kategoriInformasi.findMany({
      orderBy: { nama: 'asc' }
    });

    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    console.error('Get kategori error:', error);
    
    // Return fallback data if database is not available
    return NextResponse.json({
      success: true,
      data: [
        { id: 1, nama: 'Informasi Berkala', slug: 'informasi-berkala', deskripsi: 'Informasi yang wajib disediakan dan diumumkan secara berkala' },
        { id: 2, nama: 'Informasi Serta Merta', slug: 'informasi-serta-merta', deskripsi: 'Informasi yang wajib diumumkan serta merta' },
        { id: 3, nama: 'Informasi Setiap Saat', slug: 'informasi-setiap-saat', deskripsi: 'Informasi yang wajib tersedia setiap saat' }
      ],
      fallback: true
    });
  }
}

export async function POST(request: NextRequest) {
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
  } catch (err) {
    console.error('Create kategori error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}