import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/lib/prismaClient';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const informasi = await prisma.informasiPublik.findUnique({
      where: { id: parseInt(params.id) }
    });

    if (!informasi) {
      return NextResponse.json({ error: 'Informasi tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ data: informasi });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET!);

    const { judul, klasifikasi, ringkasan_isi_informasi, file_url, pejabat_penguasa_informasi } = await request.json();

    const updatedInformasi = await prisma.informasiPublik.update({
      where: { id: parseInt(params.id) },
      data: { judul, klasifikasi, ringkasan_isi_informasi, file_url, pejabat_penguasa_informasi }
    });

    return NextResponse.json({ message: 'Informasi berhasil diperbarui', data: updatedInformasi });
  } catch (error) {
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

    await prisma.informasiPublik.delete({
      where: { id: parseInt(params.id) }
    });

    return NextResponse.json({ message: 'Informasi berhasil dihapus' });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}