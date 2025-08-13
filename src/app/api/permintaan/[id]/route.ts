import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/lib/prismaClient';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET!);

    const permintaan = await prisma.request.findUnique({
      where: { id: parseInt(params.id) }
    });

    if (!permintaan) {
      return NextResponse.json({ error: 'Permintaan tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ data: permintaan });
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

    const { status, catatan_ppid } = await request.json();

    const updatedRequest = await prisma.request.update({
      where: { id: parseInt(params.id) },
      data: { status, catatan_ppid }
    });

    return NextResponse.json({ message: 'Status berhasil diperbarui', data: updatedRequest });
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

    await prisma.request.delete({
      where: { id: parseInt(params.id) }
    });

    return NextResponse.json({ message: 'Permintaan berhasil dihapus' });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}