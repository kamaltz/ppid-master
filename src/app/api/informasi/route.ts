import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/lib/prismaClient';
import jwt from 'jsonwebtoken';

interface WhereClause {
  klasifikasi?: string;
  OR?: Array<{
    judul?: { contains: string; mode: 'insensitive' };
    ringkasan_isi_informasi?: { contains: string; mode: 'insensitive' };
  }>;
}

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
    const { searchParams } = new URL(request.url);
    const klasifikasi = searchParams.get('klasifikasi');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const where: WhereClause = {};
    if (klasifikasi) where.klasifikasi = klasifikasi;
    if (search) {
      where.OR = [
        { judul: { contains: search, mode: 'insensitive' } },
        { ringkasan_isi_informasi: { contains: search, mode: 'insensitive' } }
      ];
    }

    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      prisma.informasiPublik.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip,
        take: limit
      }),
      prisma.informasiPublik.count({ where })
    ]);

    return NextResponse.json({
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

    jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET!);

    const { judul, klasifikasi, ringkasan_isi_informasi, tanggal_posting, pejabat_penguasa_informasi, files, links } = await request.json();
    
    if (!judul || !klasifikasi || !ringkasan_isi_informasi) {
      return NextResponse.json({ error: 'Judul, klasifikasi, dan ringkasan wajib diisi' }, { status: 400 });
    }

    const data = await prisma.informasiPublik.create({
      data: { 
        judul, 
        klasifikasi, 
        ringkasan_isi_informasi, 
        tanggal_posting: tanggal_posting ? new Date(tanggal_posting) : new Date(),
        pejabat_penguasa_informasi,
        file_attachments: files && files.length > 0 ? JSON.stringify(files.map((f: FileData) => ({ name: f.originalName || f.name, url: f.url, size: f.size }))) : null,
        links: links && links.length > 0 ? JSON.stringify(links.filter((l: LinkData) => l.title && l.url)) : null
      }
    });

    return NextResponse.json({ message: 'Informasi berhasil ditambahkan', data });
  } catch (error) {
    console.error('Create informasi error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}