import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/lib/prismaClient';
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

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json({ 
        success: false, 
        error: 'ID tidak valid' 
      }, { status: 400 });
    }
    
    const informasi = await prisma.informasiPublik.findUnique({
      where: { id }
    });
    
    if (!informasi) {
      return NextResponse.json({ 
        success: false, 
        error: 'Informasi tidak ditemukan' 
      }, { status: 404 });
    }
    
    // Parse links and file_attachments if they exist
    const processedInformasi = {
      ...informasi,
      links: informasi.links ? JSON.parse(informasi.links) : [],
      file_attachments: informasi.file_attachments ? JSON.parse(informasi.file_attachments) : []
    };
    
    return NextResponse.json({ success: true, data: processedInformasi });
  } catch (error: unknown) {
    console.error('GET /api/informasi/[id] error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch informasi' 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET!);

    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'ID tidak valid' }, { status: 400 });
    }

    const { judul, klasifikasi, ringkasan_isi_informasi, tanggal_posting, pejabat_penguasa_informasi, files, links } = await request.json();
    
    if (!judul || !klasifikasi || !ringkasan_isi_informasi) {
      return NextResponse.json({ error: 'Judul, klasifikasi, dan ringkasan wajib diisi' }, { status: 400 });
    }

    const data = await prisma.informasiPublik.update({
      where: { id },
      data: { 
        judul, 
        klasifikasi, 
        ringkasan_isi_informasi, 
        tanggal_posting: tanggal_posting ? new Date(tanggal_posting) : undefined,
        pejabat_penguasa_informasi,
        file_attachments: files && files.length > 0 ? JSON.stringify(files.map((f: FileData) => ({ name: f.originalName || f.name, url: f.url, size: f.size }))) : null,
        links: links && links.length > 0 ? JSON.stringify(links.filter((l: LinkData) => l.title && l.url)) : null
      }
    });

    return NextResponse.json({ message: 'Informasi berhasil diperbarui', data });
  } catch (error) {
    console.error('Update informasi error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET!);

    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'ID tidak valid' }, { status: 400 });
    }

    await prisma.informasiPublik.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Informasi berhasil dihapus' });
  } catch (error) {
    console.error('Delete informasi error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}