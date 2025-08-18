import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/lib/prismaClient';
import jwt from 'jsonwebtoken';

interface FileData {
  originalName?: string;
  name: string;
  url: string;
  size: number;
}

interface LinkData {
  title: string;
  url: string;
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    let isAdminOrPPID = false;
    let userId = null;
    
    // Check if user is authenticated and is admin/PPID
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id?: number; userId?: number; role: string };
        userId = parseInt(decoded.id?.toString() || '') || decoded.userId;
        isAdminOrPPID = ['ADMIN', 'PPID_UTAMA'].includes(decoded.role);
      } catch {
        // Token invalid, continue as public user
      }
    }

    const { searchParams } = new URL(request.url);
    const klasifikasi = searchParams.get('klasifikasi');
    const search = searchParams.get('search');
    const tahun = searchParams.get('tahun');
    const tanggalMulai = searchParams.get('tanggalMulai');
    const tanggalSelesai = searchParams.get('tanggalSelesai');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const where: Record<string, unknown> = {};
    
    // Role-based filtering
    if (!authHeader) {
      // Public users only see published content
      where.status = 'published';
    } else if (isAdminOrPPID) {
      // Admin and PPID_UTAMA see all content
      if (status) where.status = status;
    } else if (userId) {
      // Other roles only see their own content
      where.created_by = userId;
      if (status) where.status = status;
    }
    
    if (klasifikasi) where.klasifikasi = klasifikasi;
    if (search) {
      where.OR = [
        { judul: { contains: search, mode: 'insensitive' } },
        { ringkasan_isi_informasi: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    // Year filter
    if (tahun) {
      const startOfYear = new Date(`${tahun}-01-01`);
      const endOfYear = new Date(`${tahun}-12-31T23:59:59`);
      where.tanggal_posting = {
        gte: startOfYear,
        lte: endOfYear
      };
    }
    
    // Date range filter (overrides year filter if both provided)
    if (tanggalMulai || tanggalSelesai) {
      const dateFilter: { gte?: Date; lte?: Date } = {};
      if (tanggalMulai) {
        dateFilter.gte = new Date(tanggalMulai);
      }
      if (tanggalSelesai) {
        dateFilter.lte = new Date(`${tanggalSelesai}T23:59:59`);
      }
      where.tanggal_posting = dateFilter;
    }

    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      prisma.informasiPublik.findMany({
        where,
        orderBy: { tanggal_posting: 'desc' },
        skip,
        take: limit
      }),
      prisma.informasiPublik.count({ where })
    ]);

    return NextResponse.json({
      success: true,
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('Get informasi error:', error);
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
    let decoded: { id?: number; userId?: number; role: string };
    
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id?: number; userId?: number; role: string };
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Only PPID and Admin can create information
    if (!['ADMIN', 'PPID_UTAMA', 'PPID_PELAKSANA'].includes(decoded.role)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const body = await request.json();
    const { judul, klasifikasi, ringkasan_isi_informasi, tanggal_posting, pejabat_penguasa_informasi, files, links, status, thumbnail, jadwal_publish, images } = body;
    
    console.log('Received data:', { judul, klasifikasi, status, files: files?.length || 0, images: images?.length || 0 });
    console.log('Files data:', files);
    
    if (!judul || !klasifikasi) {
      return NextResponse.json({ error: 'Judul dan klasifikasi wajib diisi' }, { status: 400 });
    }

    const userId = decoded.id ? parseInt(decoded.id.toString()) : decoded.userId;

    const data = await prisma.informasiPublik.create({
      data: { 
        judul, 
        klasifikasi, 
        ringkasan_isi_informasi: ringkasan_isi_informasi || '',
        tanggal_posting: tanggal_posting ? new Date(tanggal_posting) : new Date(),
        pejabat_penguasa_informasi: pejabat_penguasa_informasi || null,
        status: status || 'draft',
        thumbnail: thumbnail || null,
        jadwal_publish: jadwal_publish ? new Date(jadwal_publish) : null,
        file_attachments: files && files.length > 0 ? JSON.stringify(files.map((f: FileData) => ({ name: f.originalName || f.name, url: f.url, size: f.size }))) : null,
        links: links && links.length > 0 ? JSON.stringify(links.filter((l: LinkData) => l.title && l.url)) : null,
        images: images && Array.isArray(images) && images.length > 0 ? JSON.stringify(images) : null,
        created_by: userId || null
      }
    });

    return NextResponse.json({ message: 'Informasi berhasil ditambahkan', data }, { status: 201 });
  } catch (err) {
    console.error('Create informasi error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}