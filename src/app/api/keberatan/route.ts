import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/lib/prismaClient';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    const { searchParams } = new URL(request.url);
    const pemohonId = searchParams.get('pemohon_id');

    const where: any = {};
    if (decoded.role === 'Pemohon') {
      where.pemohon_id = decoded.userId;
    } else if (decoded.role === 'PPID_PELAKSANA') {
      // PPID Pelaksana only sees keberatan that are being processed (status = 'Diproses')
      where.status = 'Diproses';
    } else if (pemohonId) {
      where.pemohon_id = parseInt(pemohonId);
    }

    const keberatan = await prisma.keberatan.findMany({
      where,
      include: {
        permintaan: {
          select: {
            id: true,
            rincian_informasi: true
          }
        },
        pemohon: {
          select: {
            nama: true,
            email: true
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    return NextResponse.json({ success: true, data: keberatan });
  } catch (error) {
    console.error('Get keberatan error:', error);
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
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    if (decoded.role !== 'Pemohon') {
      return NextResponse.json({ error: 'Only pemohon can create keberatan' }, { status: 403 });
    }

    const { permintaan_id, judul, alasan_keberatan } = await request.json();

    if (!permintaan_id || !alasan_keberatan) {
      return NextResponse.json({ error: 'Permintaan ID dan alasan keberatan wajib diisi' }, { status: 400 });
    }

    // Verify the request belongs to the user
    const permintaan = await prisma.request.findFirst({
      where: {
        id: parseInt(permintaan_id),
        pemohon_id: decoded.userId
      }
    });

    if (!permintaan) {
      return NextResponse.json({ error: 'Permohonan tidak ditemukan' }, { status: 404 });
    }

    const keberatan = await prisma.keberatan.create({
      data: {
        permintaan_id: parseInt(permintaan_id),
        pemohon_id: decoded.userId,
        judul: judul || null,
        alasan_keberatan,
        status: 'Diajukan'
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Keberatan berhasil diajukan', 
      data: keberatan 
    });
  } catch (error) {
    console.error('Create keberatan error:', error);
    return NextResponse.json({ 
      error: 'Server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}